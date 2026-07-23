-- Creates monthly partitions for audit_logs / attendances / payments,
-- covering 12 months back through 3 months forward from today, plus a
-- DEFAULT partition to catch anything outside that range (required —
-- without a DEFAULT partition, an insert for a date with no matching
-- partition raises an error instead of silently succeeding or being
-- routed anywhere, which is what you want, but you need somewhere for
-- truly out-of-range/bad data to land instead of failing hard writes).
--
-- Run this once after migration.sql (which creates the empty partitioned
-- parent tables) and before 03_backfill_and_swap.sql (which copies data —
-- that copy will fail for any row falling outside partitions that exist
-- at copy time).

DO $$
DECLARE
  tbl        text;
  col        text;
  start_date date := date_trunc('month', now() - interval '12 months');
  end_date   date := date_trunc('month', now() + interval '4 months'); -- exclusive upper bound
  part_start date;
  part_name  text;
BEGIN
  FOR tbl, col IN
    SELECT * FROM (VALUES
      ('audit_logs',   'createdAt'),
      ('attendances',  'date'),
      ('payments',     'paidAt')
    ) AS t(tbl, col)
  LOOP
    part_start := start_date;
    WHILE part_start < end_date LOOP
      part_name := tbl || '_' || to_char(part_start, 'YYYY_MM');
      EXECUTE format(
        'CREATE TABLE IF NOT EXISTS %I PARTITION OF %I FOR VALUES FROM (%L) TO (%L)',
        part_name, tbl, part_start, part_start + interval '1 month'
      );
      part_start := part_start + interval '1 month';
    END LOOP;

    -- Catch-all for anything outside the pre-created range.
    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS %I PARTITION OF %I DEFAULT',
      tbl || '_default', tbl
    );
  END LOOP;
END $$;
