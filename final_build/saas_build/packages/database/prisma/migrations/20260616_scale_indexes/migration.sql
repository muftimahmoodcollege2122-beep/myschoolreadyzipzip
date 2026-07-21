-- ─── Composite indexes for 100k-school scale ──────────────────────────────────
-- These dramatically reduce query time for multi-tenant filtered queries

-- Students: tenant + school + active status (most common filter)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_student_tenant_school_active
  ON "Student" ("tenantId", "schoolId", "isActive");

-- Students: tenant + created_at for pagination
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_student_tenant_created
  ON "Student" ("tenantId", "createdAt" DESC);

-- Attendance: tenant + date (dashboard attendance query)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_attendance_tenant_date
  ON "Attendance" ("tenantId", "date");

-- Attendance: tenant + student + date (student view)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_attendance_tenant_student_date
  ON "Attendance" ("tenantId", "studentId", "date");

-- FeeInvoice: tenant + status (outstanding fees query)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fee_invoice_tenant_status
  ON "FeeInvoice" ("tenantId", "status");

-- FeeInvoice: tenant + student (student fee history)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fee_invoice_tenant_student
  ON "FeeInvoice" ("tenantId", "studentId");

-- Notification: tenant + created_at (recent notifications)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notification_tenant_created
  ON "Notification" ("tenantId", "createdAt" DESC);

-- Exam: tenant + start_date (upcoming exams)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exam_tenant_start_date
  ON "Exam" ("tenantId", "startDate");

-- Teacher: tenant + school + active
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_teacher_tenant_school_active
  ON "Teacher" ("tenantId", "schoolId", "isActive");

-- OutboxEvent: status + created_at (outbox relay performance)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_outbox_status_created
  ON "OutboxEvent" ("status", "createdAt") WHERE "status" = 'PENDING';

-- AuditLog: tenant + created_at (audit log queries, partitioned by time)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_log_tenant_created
  ON "AuditLog" ("tenantId", "createdAt" DESC);

-- Tenant: slug hash index (fastest possible lookup)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_slug_hash
  ON "Tenant" USING HASH ("slug");

-- Tenant: custom_domain (for domain-based routing)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_custom_domain
  ON "Tenant" ("customDomain") WHERE "customDomain" IS NOT NULL;

-- ─── Table partitioning for high-volume tables ────────────────────────────────
-- Attendance grows fastest — partition by month
-- (Run after initial data migration)
-- Note: These are commented out — enable once you're ready to migrate the table
-- ALTER TABLE "Attendance" PARTITION BY RANGE ("date");

-- ─── PostgreSQL tuning (run as superuser) ────────────────────────────────────
-- ALTER SYSTEM SET shared_buffers = '256MB';
-- ALTER SYSTEM SET effective_cache_size = '768MB';
-- ALTER SYSTEM SET work_mem = '16MB';
-- ALTER SYSTEM SET maintenance_work_mem = '128MB';
-- ALTER SYSTEM SET max_connections = 100;
-- SELECT pg_reload_conf();
