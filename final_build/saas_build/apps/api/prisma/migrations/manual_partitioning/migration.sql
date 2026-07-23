-- Native Postgres RANGE partitioning for the three tables that will
-- actually reach "billions of rows": audit_logs, attendances, payments.
-- Indexes and 118 composite (tenantId, ...) indexes already exist and help
-- query planning, but a single unpartitioned table still means every
-- VACUUM, every index rebuild, and every full scan touches the whole
-- dataset. Partitioning by month means old partitions are cheap to
-- archive/drop and the planner prunes to the relevant partition(s) only.
--
-- Neon is vanilla Postgres — no TimescaleDB extension available (the
-- schema.prisma comment on audit_logs referencing "TimescaleDB hypertable
-- conversion" isn't achievable on Neon), so this uses native declarative
-- partitioning instead, which Neon fully supports.
--
-- !! RUN THIS ON A NEON BRANCH FIRST, and only run it now while these
-- tables are still small. This migration does a full table copy
-- (INSERT ... SELECT) — fine for thousands/low-millions of rows, but if
-- you're reading this after the table has already grown to tens of
-- millions+ rows, do NOT run this directly: it will hold locks and likely
-- time out. Instead use a batched backfill (pg_partman, or a manual loop
-- inserting date-range batches with pg_sleep between them) against a
-- freshly-created empty partitioned table + trigger-based dual-write, then
-- cut over. That's a separate, more careful migration — ask for it
-- specifically when you're at that stage.
--
-- Prisma has no native syntax for PARTITION BY, so the Prisma schema
-- doesn't change: Prisma talks to the partitioned table exactly like a
-- normal table (INSERT/SELECT/UPDATE/DELETE all "just work" against the
-- parent). Only add/adjust future migrations by hand for new partitions
-- if the maintenance job (see PartitionMaintenanceJob) is ever disabled.

BEGIN;

-- ============================================================
-- 1. audit_logs — partition by RANGE(created_at), monthly
-- ============================================================
ALTER TABLE "audit_logs" RENAME TO "audit_logs_old";

CREATE TABLE "audit_logs" (
  id             uuid DEFAULT gen_random_uuid(),
  "tenantId"     uuid NOT NULL,
  "userId"       uuid,
  action         "AuditAction" NOT NULL,
  entity         text NOT NULL,
  "entityId"     uuid NOT NULL,
  before         jsonb,
  after          jsonb,
  "ipAddress"    text,
  "userAgent"    text,
  "correlationId" text,
  "createdAt"    timestamp(3) NOT NULL DEFAULT now(),
  PRIMARY KEY (id, "createdAt")
) PARTITION BY RANGE ("createdAt");

CREATE INDEX ON "audit_logs" ("tenantId", entity, "entityId");
CREATE INDEX ON "audit_logs" ("tenantId", "userId", "createdAt");
CREATE INDEX ON "audit_logs" ("createdAt");

ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "tenants"("id");

ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "audit_logs"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

-- ============================================================
-- 2. attendances — partition by RANGE(date), monthly
--    Note: the (studentId, sectionId, date) unique constraint already
--    includes the partition key, so it carries over cleanly — Postgres
--    requires the partition key be part of every unique constraint.
-- ============================================================
ALTER TABLE "attendances" RENAME TO "attendances_old";

CREATE TABLE "attendances" (
  id            uuid DEFAULT gen_random_uuid(),
  "studentId"   uuid NOT NULL,
  "sectionId"   uuid NOT NULL,
  "tenantId"    uuid NOT NULL,
  date          date NOT NULL,
  status        "AttendanceStatus" NOT NULL,
  "markedById"  uuid NOT NULL,
  "markedAt"    timestamp(3) NOT NULL DEFAULT now(),
  remarks       text,
  "isBiometric" boolean NOT NULL DEFAULT false,
  PRIMARY KEY (id, date),
  UNIQUE ("studentId", "sectionId", date)
) PARTITION BY RANGE (date);

CREATE INDEX ON "attendances" ("tenantId", "sectionId", date);
CREATE INDEX ON "attendances" ("tenantId", "studentId", date);

ALTER TABLE "attendances" ADD CONSTRAINT "attendances_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "students"("id");
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_sectionId_fkey"
  FOREIGN KEY ("sectionId") REFERENCES "sections"("id");

ALTER TABLE "attendances" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "attendances" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "attendances"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

-- ============================================================
-- 3. payments — partition by RANGE(paidAt), monthly
--    TRADEOFF: stripePaymentId was a standalone UNIQUE column. Postgres
--    requires the partition key in every unique constraint on a
--    partitioned table, so this becomes UNIQUE(stripePaymentId, paidAt) —
--    technically allows the same Stripe payment ID to appear twice if
--    paidAt somehow differs (it won't, in practice, since paidAt is set
--    once from the Stripe webhook payload). If you want a hard guarantee
--    instead of this practical one, keep a separate small
--    non-partitioned "payment_dedup(stripe_payment_id uuid PRIMARY KEY)"
--    table and check-then-insert into it inside the same transaction as
--    the payment insert.
-- ============================================================
ALTER TABLE "payments" RENAME TO "payments_old";

CREATE TABLE "payments" (
  id                uuid DEFAULT gen_random_uuid(),
  "invoiceId"       uuid NOT NULL,
  "tenantId"        uuid NOT NULL,
  amount            numeric(12,2) NOT NULL,
  method            "PaymentMethod" NOT NULL,
  "stripePaymentId" text,
  "transactionRef"  text,
  "paidAt"          timestamp(3) NOT NULL DEFAULT now(),
  "processedBy"     uuid,
  "receiptUrl"      text,
  metadata          jsonb NOT NULL DEFAULT '{}',
  PRIMARY KEY (id, "paidAt"),
  UNIQUE ("stripePaymentId", "paidAt")
) PARTITION BY RANGE ("paidAt");

CREATE INDEX ON "payments" ("tenantId", "invoiceId");

ALTER TABLE "payments" ADD CONSTRAINT "payments_invoiceId_fkey"
  FOREIGN KEY ("invoiceId") REFERENCES "fee_invoices"("id");

ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payments" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "payments"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

COMMIT;

-- ============================================================
-- Partitions + data copy done outside the DDL transaction below —
-- CREATE TABLE PARTITION OF and INSERT..SELECT can each be large/slow,
-- keeping them out of the single BEGIN/COMMIT above avoids one giant
-- lock-held-forever transaction. Run 02_create_partitions.sql then
-- 03_backfill_and_swap.sql (in this same folder) next, in order.
