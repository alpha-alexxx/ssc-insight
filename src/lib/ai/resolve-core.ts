import type { AiConfig } from "./config-core";
import type { AiQuotaLimits } from "./quota";

/** Personal keys are unlimited: no daily request cap and no token cap. The
 * ledger still records what happened (audit), but it can never block a user
 * who is spending their own provider quota. */
export const USER_KEY_SAFETY_LIMITS: AiQuotaLimits = {
  requests: Infinity,
  tokens: Infinity,
};

export const USER_TIMEOUT_MS = 120_000;
export const USER_FIRST_TOKEN_TIMEOUT_MS = 120_000;

export function userReplyCaps(
  envTimeoutMs: number | undefined,
  envFirstTokenTimeoutMs: number | undefined,
): { timeoutMs: number; firstTokenTimeoutMs: number } {
  return {
    timeoutMs: envTimeoutMs ?? USER_TIMEOUT_MS,
    firstTokenTimeoutMs: envFirstTokenTimeoutMs ?? USER_FIRST_TOKEN_TIMEOUT_MS,
  };
}

export type AiConfigSource = "user" | "env";

/**
 * Pre-call output allowance reserved against the IST-day token ledger.
 * A personal key is unlimited, so nothing is reserved and the ledger can never
 * block it; a metered (env) key reserves a conservative completion estimate so
 * AI_DAILY_TOKEN_LIMIT still bounds what the shared key can spend — without
 * that, removing the reply cap would leave the daily token ceiling unenforced.
 */
export const ENV_OUTPUT_RESERVE_TOKENS = 8_000;

export function outputReserveForSource(source: AiConfigSource): number {
  return source === "user" ? 0 : ENV_OUTPUT_RESERVE_TOKENS;
}
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
