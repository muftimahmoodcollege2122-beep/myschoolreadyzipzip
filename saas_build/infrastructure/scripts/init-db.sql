-- ============================================================
-- School Management SaaS — Database Initialization
-- PostgreSQL 16 + TimescaleDB + Row-Level Security
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- Trigram search
CREATE EXTENSION IF NOT EXISTS "btree_gin";   -- Composite GIN indexes
CREATE EXTENSION IF NOT EXISTS "timescaledb" CASCADE;  -- Time-series

-- ─── Application Role (least-privilege) ───────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'school_app') THEN
    CREATE ROLE school_app LOGIN PASSWORD 'change_in_secrets_manager';
  END IF;
END
$$;

GRANT CONNECT ON DATABASE school_saas TO school_app;
GRANT USAGE ON SCHEMA public TO school_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO school_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO school_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO school_app;

-- ─── Row-Level Security ───────────────────────────────────
-- RLS enforces tenant isolation at DB level — belt-and-suspenders on top of app layer

-- Enable RLS on all tenant-scoped tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT table_name FROM information_schema.columns
    WHERE column_name = 'tenant_id' AND table_schema = 'public'
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', tbl);

    -- Drop existing policy if re-running
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I', tbl);

    -- Policy: only rows matching current session tenant_id are visible
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I
       USING (tenant_id = current_setting(''app.current_tenant_id'', true)::uuid)
       WITH CHECK (tenant_id = current_setting(''app.current_tenant_id'', true)::uuid)',
      tbl
    );
  END LOOP;
END
$$;

-- Super-admin bypass policy (applied only for super_admin role)
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT table_name FROM information_schema.columns
    WHERE column_name = 'tenant_id' AND table_schema = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS super_admin_bypass ON %I', tbl);
    EXECUTE format(
      'CREATE POLICY super_admin_bypass ON %I
       USING (current_setting(''app.is_super_admin'', true) = ''true'')',
      tbl
    );
  END LOOP;
END
$$;

-- ─── TimescaleDB Hypertables ─────────────────────────────
-- Convert audit_logs to hypertable for time-series performance

SELECT create_hypertable(
  'audit_logs',
  'created_at',
  chunk_time_interval => INTERVAL '1 month',
  if_not_exists => TRUE
);

-- Compress chunks older than 3 months
SELECT add_compression_policy('audit_logs', INTERVAL '3 months', if_not_exists => TRUE);

-- Retain data for 7 years (compliance requirement)
SELECT add_retention_policy('audit_logs', INTERVAL '7 years', if_not_exists => TRUE);

-- ─── Partitioning ─────────────────────────────────────────
-- Partition attendances by month for performance at scale

-- Note: In production, create partitions for upcoming months via cron
-- The schema uses plain table; switch to partitioned after initial migration

-- ─── Indexes ─────────────────────────────────────────────

-- Full-text search on students (trigram)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_name_trgm
  ON user_profiles USING GIN (
    (first_name || ' ' || last_name) gin_trgm_ops
  );

-- Fast attendance queries by date range
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_attendances_date_section
  ON attendances (tenant_id, section_id, date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_attendances_student_date
  ON attendances (tenant_id, student_id, date DESC);

-- Fast grade queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_grades_student_term
  ON grades (tenant_id, student_id, academic_year, term);

-- Fast fee queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fee_invoices_overdue
  ON fee_invoices (tenant_id, status, due_date)
  WHERE status IN ('PENDING', 'PARTIAL');

-- Outbox polling index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_outbox_pending
  ON outbox_events (status, scheduled_at)
  WHERE status = 'PENDING';

-- Notification delivery index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_unread
  ON notifications (tenant_id, user_id, status, created_at DESC)
  WHERE status IN ('PENDING', 'SENT');

-- Tenant lookup (hot path)
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_tenants_slug
  ON tenants (slug);

-- Session lookup (auth hot path)
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_token_hash
  ON user_sessions (token_hash)
  WHERE revoked_at IS NULL;

-- ─── Functions ───────────────────────────────────────────

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT table_name FROM information_schema.columns
    WHERE column_name = 'updated_at' AND table_schema = 'public'
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS set_timestamp ON %I;
       CREATE TRIGGER set_timestamp
       BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp()',
      tbl, tbl
    );
  END LOOP;
END
$$;

-- ─── Seed Super Admin Tenant ──────────────────────────────
INSERT INTO tenants (
  id, name, slug, tier, status, schema_name, data_region
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Platform Admin',
  'platform-admin',
  'ENTERPRISE',
  'ACTIVE',
  'public',
  'us-east-1'
) ON CONFLICT (slug) DO NOTHING;

-- ─── Kafka Topics DDL (reference) ────────────────────────
-- These are created by Terraform/Kafka admin, listed here for documentation:
--
-- student.enrolled         | partitions: 12 | retention: 7d
-- student.deactivated      | partitions: 6  | retention: 7d
-- attendance.marked        | partitions: 24 | retention: 3d  (high volume)
-- grades.updated           | partitions: 12 | retention: 7d
-- fees.payment.recorded    | partitions: 12 | retention: 30d
-- fees.invoices.generated  | partitions: 6  | retention: 7d
-- notifications.fanout     | partitions: 24 | retention: 1d  (high volume)
-- billing.subscription.*   | partitions: 3  | retention: 30d
-- gdpr.erasure.*           | partitions: 3  | retention: 90d
-- audit.events             | partitions: 12 | retention: never (archive to S3)
