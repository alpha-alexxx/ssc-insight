import type { AiConfig } from "./config-core";
import type { AiQuotaLimits } from "./quota";

export const USER_KEY_SAFETY_LIMITS: AiQuotaLimits = {
  requests: 400,
  tokens: 2_000_000,
};

/** Personal keys default to the reply ceiling the settings form allows, never
 * the deployment's env tuning: thinking models spend output tokens on hidden
 * reasoning before the answer, so a small cap guarantees truncated replies
 * (the 2026-11 truncation bug — an unset AI_MAX_OUTPUT_TOKENS leaked the env
 * config's generic 1,200 default onto user credentials). Only the user's own
 * explicit setting narrows it. */
export const USER_MAX_OUTPUT_TOKENS = 32_000;
export const USER_TIMEOUT_MS = 120_000;
export const USER_FIRST_TOKEN_TIMEOUT_MS = 120_000;

export function userReplyCaps(
  storedMaxOutputTokens: number | null,
  envTimeoutMs: number | undefined,
  envFirstTokenTimeoutMs: number | undefined,
): { maxOutputTokens: number; timeoutMs: number; firstTokenTimeoutMs: number } {
  return {
    maxOutputTokens: storedMaxOutputTokens ?? USER_MAX_OUTPUT_TOKENS,
    timeoutMs: envTimeoutMs ?? USER_TIMEOUT_MS,
    firstTokenTimeoutMs: envFirstTokenTimeoutMs ?? USER_FIRST_TOKEN_TIMEOUT_MS,
  };
}

export type AiConfigSource = "user" | "env";
export type StoredCredentialState = "absent" | "ready" | "invalid";

/** Pure precedence policy, kept separate from database/crypto for tests. */
export function resolveSourcePolicy(
  stored: StoredCredentialState,
  hasEnvironmentConfig: boolean,
): AiConfigSource | "invalid" | null {
  if (stored === "ready") return "user";
  if (stored === "invalid") return "invalid";
  return hasEnvironmentConfig ? "env" : null;
}

export function quotaLimitsForSource(
  config: AiConfig,
  source: AiConfigSource,
): AiQuotaLimits {
  return source === "user"
    ? USER_KEY_SAFETY_LIMITS
    : {
        requests: config.dailyRequestLimit,
        tokens: config.dailyTokenLimit,
      };
}
