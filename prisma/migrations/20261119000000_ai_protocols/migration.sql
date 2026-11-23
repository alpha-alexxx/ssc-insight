BEGIN;

-- Multi-protocol AI support. Additive only: no existing column is dropped and
-- every new column carries a default or is nullable, so old rows keep the
-- exact pre-protocol behavior (OpenAI-compatible Chat Completions, Bearer).
-- An app rollback after this migration keeps working because the old columns
-- are untouched and the new ones are ignored by old code.

ALTER TYPE "ssc_insight"."AiFeature" ADD VALUE IF NOT EXISTS 'test';

ALTER TABLE "ssc_insight"."AiCredential"
  ADD COLUMN "protocol" VARCHAR(40) NOT NULL DEFAULT 'openai-chat',
  ADD COLUMN "authMode" VARCHAR(20) NOT NULL DEFAULT 'bearer',
  ADD COLUMN "generationPath" VARCHAR(200),
  ADD COLUMN "modelsPath" VARCHAR(200);

ALTER TABLE "ssc_insight"."AiUsage"
  ADD COLUMN "provider" VARCHAR(40),
  ADD COLUMN "protocol" VARCHAR(40);

COMMIT;
