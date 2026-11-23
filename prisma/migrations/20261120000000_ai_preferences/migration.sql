-- Per-user AI model behavior. Additive only: every new column carries a
-- default or is nullable, so old rows keep the exact pre-preference behavior
-- (provider-default thinking, env-or-default output cap, no image input).
-- An app rollback after this migration keeps working because the old columns
-- are untouched and the new ones are ignored by old code.

BEGIN;

ALTER TABLE "ssc_insight"."AiCredential"
  ADD COLUMN "thinking" VARCHAR(20) NOT NULL DEFAULT 'default',
  ADD COLUMN "maxOutputTokens" INTEGER,
  ADD COLUMN "historyTurns" INTEGER,
  ADD COLUMN "visionEnabled" BOOLEAN NOT NULL DEFAULT false;

COMMIT;
