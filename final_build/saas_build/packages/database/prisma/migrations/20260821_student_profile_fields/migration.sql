-- ─── Student profile card fields ──────────────────────────────────────────
-- Adds fields needed for the full student profile card view:
-- nationality / religion / place of birth (personal info tab)
-- height / weight (physical info, students table)

ALTER TABLE "user_profiles"
  ADD COLUMN IF NOT EXISTS "nationality"   TEXT,
  ADD COLUMN IF NOT EXISTS "religion"      TEXT,
  ADD COLUMN IF NOT EXISTS "placeOfBirth"  TEXT;

ALTER TABLE "students"
  ADD COLUMN IF NOT EXISTS "heightCm" DECIMAL(5,1),
  ADD COLUMN IF NOT EXISTS "weightKg" DECIMAL(5,1);
