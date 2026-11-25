import "server-only";
import { database } from "../db";
import {
  CredentialCryptoError,
  credentialKey,
  decryptCredential,
  encryptCredential,
  keyHint,
} from "./crypto";
import type { AiAuthMode, AiProtocol } from "./protocols";
import { isAiThinking } from "./config-core";
import { assertSafeBaseUrlShape } from "./ssrf-core";

/**
 * Per-user AI credentials.
 *
 * Security properties this module enforces:
 *  - The plaintext API key is encrypted (AES-256-GCM) before it reaches the
 *    database and is NEVER returned to a client, logged, or put in a backup.
 *  - `getAiCredential` is the only decrypting read and is server-internal.
 *  - `describeAiCredential` is the client-facing read and exposes only a
 *    provider label, protocol/model/base URL, and a 4-character key hint.
 *  - Base URLs are shape-validated on write; the DNS-resolving SSRF check runs
 *    again immediately before each provider call.
 */

export type AiCredentialInput = {
  provider: string;
  protocol: AiProtocol;
  authMode: AiAuthMode;
  baseUrl: string;
  generationPath: string | null;
  modelsPath: string | null;
  model: string;
  apiKey?: string | null;
  jsonMode?: boolean;
  allowHttp?: boolean;
  allowPrivate?: boolean;
  thinking?: string;
  historyTurns?: number | null;
  visionEnabled?: boolean;
};

/** Client-safe description. Contains no secret material. */
export type AiCredentialSummary = {
  configured: boolean;
  provider: string;
  protocol: AiProtocol;
  authMode: AiAuthMode;
  baseUrl: string;
  generationPath: string | null;
  modelsPath: string | null;
  model: string;
  keyHint: string | null;
  jsonMode: boolean;
  allowHttp: boolean;
  allowPrivate: boolean;
  thinking: string;
  historyTurns: number | null;
  visionEnabled: boolean;
  updatedAt: string | null;
};

const HINT_PLACEHOLDER = "…";

function encryptionKey() {
  return credentialKey(process.env.AI_CREDENTIAL_SECRET);
}

export function credentialStorageAvailable(): boolean {
  try {
    encryptionKey();
    return true;
  } catch {
    return false;
  }
}

export async function describeAiCredential(
  userId: string,
): Promise<AiCredentialSummary | null> {
  const row = await database().aiCredential.findUnique({
    where: { userId },
    select: {
      provider: true,
      protocol: true,
      authMode: true,
      baseUrl: true,
      generationPath: true,
      modelsPath: true,
      model: true,
      keyHint: true,
      jsonMode: true,
      allowHttp: true,
      allowPrivate: true,
      thinking: true,
      historyTurns: true,
      visionEnabled: true,
      updatedAt: true,
    },
  });
  if (!row) return null;
  return {
    configured: true,
    provider: row.provider,
    protocol: row.protocol as AiProtocol,
    authMode: row.authMode as AiAuthMode,
    baseUrl: row.baseUrl,
    generationPath: row.generationPath,
    modelsPath: row.modelsPath,
    model: row.model,
    keyHint: row.keyHint || null,
    jsonMode: row.jsonMode,
    allowHttp: row.allowHttp,
    allowPrivate: row.allowPrivate,
    thinking: isAiThinking(row.thinking) ? row.thinking : "default",
    historyTurns: row.historyTurns,
    visionEnabled: row.visionEnabled,
    updatedAt: row.updatedAt.toISOString(),
  };
}

/**
 * Decrypting read for server use only. Returns "invalid" when the stored
 * ciphertext cannot be opened (wrong/rotated secret) so callers can surface a
 * personal-configuration failure instead of silently switching providers.
 */
export async function getAiCredential(userId: string) {
  const row = await database().aiCredential.findUnique({
    where: { userId },
    select: {
      provider: true,
      protocol: true,
      authMode: true,
      baseUrl: true,
      generationPath: true,
      modelsPath: true,
      apiKeyEnc: true,
      model: true,
      jsonMode: true,
      allowHttp: true,
      allowPrivate: true,
      thinking: true,
      historyTurns: true,
      visionEnabled: true,
    },
  });
  if (!row) return null;
  let apiKey: string;
  try {
    apiKey = decryptCredential(row.apiKeyEnc, encryptionKey());
  } catch (error) {
    if (error instanceof CredentialCryptoError) return "invalid" as const;
    throw error;
  }
  return {
    provider: row.provider,
    protocol: row.protocol as AiProtocol,
    authMode: row.authMode as AiAuthMode,
    baseUrl: row.baseUrl,
    generationPath: row.generationPath,
    modelsPath: row.modelsPath,
    apiKey,
    model: row.model,
    jsonMode: row.jsonMode,
    allowHttp: row.allowHttp,
    allowPrivate: row.allowPrivate,
    thinking: isAiThinking(row.thinking) ? row.thinking : "default",
    historyTurns: row.historyTurns,
    visionEnabled: row.visionEnabled,
  };
}

/**
 * Create or replace a user's credential.
 *
 * `apiKey` omitted/empty keeps the stored key (so the UI can change model or
 * base URL without re-entering the secret). Passing an explicit empty string is
 * treated the same way; use `deleteAiCredential` to remove it. No-auth
 * providers may set the key explicitly to null on first save.
 */
export async function saveAiCredential(
  userId: string,
  input: AiCredentialInput,
): Promise<AiCredentialSummary> {
  const baseUrl = assertSafeBaseUrlShape(input.baseUrl, {
    allowHttp: input.allowHttp ?? false,
    allowPrivate: input.allowPrivate ?? false,
  });

  const existing = await database().aiCredential.findUnique({
    where: { userId },
    select: { apiKeyEnc: true, keyHint: true },
  });

  const providedKey = input.apiKey?.trim() ?? "";
  let apiKeyEnc: string;
  let keyHintValue: string;

  if (providedKey) {
    apiKeyEnc = encryptCredential(providedKey, encryptionKey());
    keyHintValue = keyHint(providedKey);
  } else if (existing) {
    // Keep the existing secret untouched.
    apiKeyEnc = existing.apiKeyEnc;
    keyHintValue = existing.keyHint;
  } else if (input.authMode === "none") {
    // Store an encrypted non-secret sentinel so an app rollback still reads a
    // valid envelope; new code with authMode "none" ignores its content.
    apiKeyEnc = encryptCredential("local-no-auth", encryptionKey());
    keyHintValue = HINT_PLACEHOLDER;
  } else {
    throw new CredentialCryptoError("An API key is required the first time.");
  }

  const row = await database().aiCredential.upsert({
    where: { userId },
    create: {
      userId,
      provider: input.provider,
      protocol: input.protocol,
      authMode: input.authMode,
      baseUrl,
      generationPath: input.generationPath,
      modelsPath: input.modelsPath,
      model: input.model,
      apiKeyEnc,
      keyHint: keyHintValue,
      jsonMode: input.jsonMode ?? true,
      allowHttp: input.allowHttp ?? false,
      allowPrivate: input.allowPrivate ?? false,
      thinking: input.thinking ?? "default",
      historyTurns: input.historyTurns ?? null,
      visionEnabled: input.visionEnabled ?? false,
    },
    update: {
      provider: input.provider,
      protocol: input.protocol,
      authMode: input.authMode,
      baseUrl,
      generationPath: input.generationPath,
      modelsPath: input.modelsPath,
      model: input.model,
      apiKeyEnc,
      keyHint: keyHintValue,
      jsonMode: input.jsonMode ?? true,
      allowHttp: input.allowHttp ?? false,
      allowPrivate: input.allowPrivate ?? false,
      thinking: input.thinking ?? "default",
      historyTurns: input.historyTurns ?? null,
      visionEnabled: input.visionEnabled ?? false,
    },
    select: {
      provider: true,
      protocol: true,
      authMode: true,
      baseUrl: true,
      generationPath: true,
      modelsPath: true,
      model: true,
      keyHint: true,
      jsonMode: true,
      allowHttp: true,
      allowPrivate: true,
      thinking: true,
      historyTurns: true,
      visionEnabled: true,
      updatedAt: true,
    },
  });

  return {
    configured: true,
    provider: row.provider,
    protocol: row.protocol as AiProtocol,
    authMode: row.authMode as AiAuthMode,
    baseUrl: row.baseUrl,
    generationPath: row.generationPath,
    modelsPath: row.modelsPath,
    model: row.model,
    keyHint: row.keyHint || null,
    jsonMode: row.jsonMode,
    allowHttp: row.allowHttp,
    allowPrivate: row.allowPrivate,
    thinking: isAiThinking(row.thinking) ? row.thinking : "default",
    historyTurns: row.historyTurns,
    visionEnabled: row.visionEnabled,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function deleteAiCredential(userId: string): Promise<void> {
  await database().aiCredential.deleteMany({ where: { userId } });
}

export { HINT_PLACEHOLDER };
