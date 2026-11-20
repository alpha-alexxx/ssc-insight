import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { readAiConfig } from "../src/lib/ai/config-core";
import {
  aiConnectionSchema,
  aiCredentialSchema,
} from "../src/lib/ai/connection-input";
import { sameCredentialTarget } from "../src/lib/ai/connection-target";
import { aiEndpointError, aiTimeout } from "../src/lib/ai/errors";
import { chargedForAiFailure } from "../src/lib/ai/quota";
import {
  quotaLimitsForSource,
  resolveSourcePolicy,
} from "../src/lib/ai/resolve-core";

const root = join(import.meta.dirname, "..");

test("legacy environment settings default to Chat Completions while explicit protocols select their own defaults", () => {
  const legacy = readAiConfig({ AI_API_KEY: "key", AI_MODEL: "model" });
  assert.equal(legacy?.provider, "env");
  assert.equal(legacy?.protocol, "openai-chat");
  assert.equal(legacy?.authMode, "bearer");
  assert.equal(legacy?.generationPath, "chat/completions");

  const anthropic = readAiConfig({
    AI_PROTOCOL: "anthropic-messages",
    AI_API_KEY: "key",
    AI_MODEL: "claude-test",
    AI_BASE_URL: "https://api.anthropic.com/v1",
  });
  assert.equal(anthropic?.authMode, "anthropic-key");
  assert.equal(anthropic?.generationPath, "messages");

  const noAuth = readAiConfig({
    AI_PROTOCOL: "openai-chat",
    AI_AUTH_MODE: "none",
    AI_MODEL: "local-model",
    AI_BASE_URL: "http://localhost:11434/v1",
  });
  assert.equal(noAuth?.apiKey, "");
  assert.equal(noAuth?.authMode, "none");
});

test("connection schemas normalize legacy payloads and allow explicit no-auth local providers", () => {
  const legacy = aiCredentialSchema.parse({
    provider: "openai",
    baseUrl: "https://api.openai.com/v1",
    apiKey: "key",
    model: "gpt-test",
  });
  assert.equal(legacy.protocol, "openai-chat");
  assert.equal(legacy.authMode, "bearer");
  assert.equal(legacy.generationPath, "chat/completions");
  assert.equal(legacy.modelsPath, "models");

  const local = aiCredentialSchema.parse({
    provider: "ollama",
    protocol: "openai-chat",
    authMode: "none",
    baseUrl: "http://localhost:11434/v1/chat/completions",
    model: "qwen2.5",
    allowHttp: true,
    allowPrivate: true,
  });
  assert.equal(local.baseUrl, "http://localhost:11434/v1");
  assert.equal(local.generationPath, "chat/completions");
  assert.equal(local.apiKey, undefined);

  assert.equal(
    aiConnectionSchema.safeParse({
      provider: "custom",
      protocol: "openai-responses",
      authMode: "bearer",
      baseUrl: "https://gateway.example/v1",
      generationPath: "https://evil.example/responses",
    }).success,
    false,
  );
});

test("per-user model preferences parse with inherit-on-null semantics and bounds", () => {
  // Omitted preferences normalize to inherit-everything defaults.
  const defaults = aiCredentialSchema.parse({
    provider: "openai",
    baseUrl: "https://api.openai.com/v1",
    apiKey: "key",
    model: "gpt-test",
  });
  assert.equal(defaults.thinking, "default");
  assert.equal(defaults.maxOutputTokens, null);
  assert.equal(defaults.historyTurns, null);
  assert.equal(defaults.visionEnabled, false);

  const explicit = aiCredentialSchema.parse({
    provider: "openai",
    baseUrl: "https://api.openai.com/v1",
    apiKey: "key",
    model: "gpt-test",
    thinking: "high",
    maxOutputTokens: 12_000,
    historyTurns: 16,
    visionEnabled: true,
  });
  assert.equal(explicit.thinking, "high");
  assert.equal(explicit.maxOutputTokens, 12_000);
  assert.equal(explicit.historyTurns, 16);
  assert.equal(explicit.visionEnabled, true);

  // Bounds: the provider-facing output cap and the client history length
  // both clamp here, at the write path.
  assert.equal(
    aiCredentialSchema.safeParse({
      provider: "openai",
      baseUrl: "https://api.openai.com/v1",
      apiKey: "key",
      model: "m",
      maxOutputTokens: 200,
    }).success,
    false,
  );
  assert.equal(
    aiCredentialSchema.safeParse({
      provider: "openai",
      baseUrl: "https://api.openai.com/v1",
      apiKey: "key",
      model: "m",
      historyTurns: 20,
    }).success,
    false,
  );
  assert.equal(
    aiCredentialSchema.safeParse({
      provider: "openai",
      baseUrl: "https://api.openai.com/v1",
      apiKey: "key",
      model: "m",
      thinking: "maximum",
    }).success,
    false,
  );
});

test("saved key reuse fingerprint includes protocol, auth mode and endpoint paths", () => {
  const stored = {
    provider: "custom",
    protocol: "openai-chat" as const,
    authMode: "bearer" as const,
    baseUrl: "https://gateway.example/v1",
    generationPath: "chat/completions",
    modelsPath: "models",
  };
  assert.equal(sameCredentialTarget(stored, { ...stored }), true);
  assert.equal(
    sameCredentialTarget(stored, {
      ...stored,
      protocol: "openai-responses",
      generationPath: "responses",
    }),
    false,
  );
  assert.equal(
    sameCredentialTarget(stored, { ...stored, authMode: "none" }),
    false,
  );
  assert.equal(
    sameCredentialTarget(stored, {
      ...stored,
      generationPath: "other/chat/completions",
    }),
    false,
  );
});

test("invalid personal credentials never silently fall back to the environment provider", () => {
  assert.equal(resolveSourcePolicy("absent", true), "env");
  assert.equal(resolveSourcePolicy("absent", false), null);
  assert.equal(resolveSourcePolicy("ready", true), "user");
  assert.equal(resolveSourcePolicy("invalid", true), "invalid");
});

test("personal keys use independent safety limits and definitive pre-generation failures charge zero", () => {
  const env = readAiConfig({
    AI_API_KEY: "key",
    AI_MODEL: "model",
    AI_DAILY_REQUEST_LIMIT: "2",
    AI_DAILY_TOKEN_LIMIT: "1000",
  });
  assert.ok(env);
  assert.deepEqual(quotaLimitsForSource(env, "env"), {
    requests: 2,
    tokens: 1000,
  });
  assert.deepEqual(quotaLimitsForSource(env, "user"), {
    requests: 400,
    tokens: 2_000_000,
  });
  assert.equal(chargedForAiFailure(aiEndpointError(), 500), 0);
  assert.equal(chargedForAiFailure(aiTimeout(), 500), 500);
});

test("Prisma schema and additive migration carry protocol metadata without exposing credentials to backups", () => {
  const schema = readFileSync(join(root, "prisma/schema.prisma"), "utf8");
  assert.match(schema, /enum AiFeature \{[\s\S]*\btest\b/);
  const credential = schema.slice(
    schema.indexOf("model AiCredential"),
    schema.indexOf("model PlanTaskProgress"),
  );
  assert.match(credential, /protocol\s+String/);
  assert.match(credential, /authMode\s+String/);
  assert.match(credential, /generationPath\s+String\?/);
  assert.match(credential, /modelsPath\s+String\?/);

  const migration = readFileSync(
    join(
      root,
      "prisma/migrations/20261119000000_ai_protocols/migration.sql",
    ),
    "utf8",
  );
  assert.match(migration, /ADD VALUE IF NOT EXISTS 'test'/);
  assert.match(migration, /ADD COLUMN\s+"protocol"/);
  assert.match(migration, /DEFAULT 'openai-chat'/);
  assert.doesNotMatch(migration, /DROP\s+(TABLE|COLUMN)/i);

  // Per-user model preferences: additive columns on the same row.
  assert.match(credential, /thinking\s+String\s+@default\("default"\)/);
  assert.match(credential, /maxOutputTokens\s+Int\?/);
  assert.match(credential, /historyTurns\s+Int\?/);
  assert.match(credential, /visionEnabled\s+Boolean\s+@default\(false\)/);
  const preferences = readFileSync(
    join(root, "prisma/migrations/20261120000000_ai_preferences/migration.sql"),
    "utf8",
  );
  assert.match(preferences, /ADD COLUMN\s+"thinking"/);
  assert.match(preferences, /ADD COLUMN\s+"visionEnabled"/);
  assert.doesNotMatch(preferences, /DROP\s+(TABLE|COLUMN)/i);
});
