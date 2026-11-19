import type { AiConfig } from "./config-core";
import type { AiQuotaLimits } from "./quota";

export const USER_KEY_SAFETY_LIMITS: AiQuotaLimits = {
  requests: 400,
  tokens: 2_000_000,
};

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
