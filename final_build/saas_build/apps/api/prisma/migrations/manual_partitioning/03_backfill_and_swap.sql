-- Copies data from the *_old tables into the new partitioned tables, then
-- drops the old tables. Run after 02_create_partitions.sql.
--
-- Sized for "still small" tables (see warning in migration.sql). Each
-- INSERT..SELECT here runs as one statement/transaction — for a table
-- already in the millions of rows, split each of these into date-range
-- batches (e.g. WHERE "createdAt" >= X AND "createdAt" < X + interval
-- '1 day', looped with a short pg_sleep between batches) instead of
-- running the whole table at once.

BEGIN;

INSERT INTO "audit_logs" (id, "tenantId", "userId", action, entity, "entityId", before, after, "ipAddress", "userAgent", "correlationId", "createdAt")
SELECT id, "tenantId", "userId", action, entity, "entityId", before, after, "ipAddress", "userAgent", "correlationId", "createdAt"
FROM "audit_logs_old";

INSERT INTO "attendances" (id, "studentId", "sectionId", "tenantId", date, status, "markedById", "markedAt", remarks, "isBiometric")
SELECT id, "studentId", "sectionId", "tenantId", date, status, "markedById", "markedAt", remarks, "isBiometric"
FROM "attendances_old";

INSERT INTO "payments" (id, "invoiceId", "tenantId", amount, method, "stripePaymentId", "transactionRef", "paidAt", "processedBy", "receiptUrl", metadata)
SELECT id, "invoiceId", "tenantId", amount, method, "stripePaymentId", "transactionRef", "paidAt", "processedBy", "receiptUrl", metadata
FROM "payments_old";

-- Verify row counts match before dropping — abort (rollback) if not.
DO $$
DECLARE
  old_count bigint; new_count bigint;
BEGIN
  SELECT count(*) INTO old_count FROM "audit_logs_old";
  SELECT count(*) INTO new_count FROM "audit_logs";
  IF old_count != new_count THEN
    RAISE EXCEPTION 'audit_logs row count mismatch: old=% new=%', old_count, new_count;
  END IF;

  SELECT count(*) INTO old_count FROM "attendances_old";
  SELECT count(*) INTO new_count FROM "attendances";
  IF old_count != new_count THEN
    RAISE EXCEPTION 'attendances row count mismatch: old=% new=%', old_count, new_count;
  END IF;

  SELECT count(*) INTO old_count FROM "payments_old";
  SELECT count(*) INTO new_count FROM "payments";
  IF old_count != new_count THEN
    RAISE EXCEPTION 'payments row count mismatch: old=% new=%', old_count, new_count;
  END IF;
END $$;

DROP TABLE "audit_logs_old";
DROP TABLE "attendances_old";
DROP TABLE "payments_old";

COMMIT;
