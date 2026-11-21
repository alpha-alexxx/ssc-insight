import "server-only";
import { readAiConfig, type AiConfig, type AiThinking } from "./config-core";
import { getAiCredential } from "./credentials";
import {
  resolveSourcePolicy,
  userReplyCaps,
  type AiConfigSource,
} from "./resolve-core";
import {
  generationPathFor,
  modelsPathFor,
  normaliseProviderPath,
  type AiAuthMode,
  type AiProtocol,
} from "./protocols";
import { assertSafeBaseUrl } from "./ssrf";

/**
 * Resolves the effective AI configuration for one request.
 *
 * Precedence: the signed-in user's stored credential wins; the server env is
 * the fallback so a deployment can still offer AI to everyone without setup.
 * A stored row that cannot be used (undecryptable key, unsafe URL) is a
 * visible personal-configuration failure — it never silently sends the user's
 * data through the deployment's provider instead.
 *
 * `source` matters for quota: the app-wide AI_DAILY_* caps protect a shared
 * server key, so they must not throttle a user who is spending their own key.
 */
export type ResolvedAiConfig = {
  config: AiConfig;
  source: AiConfigSource;
};

export async function resolveAiConfig(
  userId: string,
): Promise<ResolvedAiConfig | null> {
  const envConfig = readAiConfig(process.env);

  let stored:
    | {
        provider: string;
        protocol: AiProtocol;
        authMode: AiAuthMode;
        baseUrl: string;
        generationPath: string | null;
        modelsPath: string | null;
        apiKey: string;
        model: string;
        jsonMode: boolean;
        allowHttp: boolean;
        allowPrivate: boolean;
        thinking: AiThinking;
        maxOutputTokens: number | null;
        historyTurns: number | null;
        visionEnabled: boolean;
      }
    | null
    | "invalid" = null;
  try {
    const row = await getAiCredential(userId);
    if (row === "invalid") {
      stored = "invalid";
    } else if (row) {
      stored = {
        provider: row.provider,
        protocol: row.protocol,
        authMode: row.authMode,
        baseUrl: row.baseUrl,
        generationPath: row.generationPath,
        modelsPath: row.modelsPath,
        apiKey: row.apiKey,
        model: row.model,
        jsonMode: row.jsonMode,
        allowHttp: row.allowHttp,
        allowPrivate: row.allowPrivate,
        thinking: row.thinking,
        maxOutputTokens: row.maxOutputTokens,
        historyTurns: row.historyTurns,
        visionEnabled: row.visionEnabled,
      };
    }
  } catch {
    // A failure in credential storage must never break the tracker; treat the
    // stored row as absent so env-only behaviour survives a storage outage.
    stored = null;
  }

  // Undecryptable keys are a personal-configuration failure, never a reason
  // to switch providers: the resolver refuses to run rather than silently
  // sending the user's data through the deployment's provider.
  if (stored === "invalid") return null;

  const policy = resolveSourcePolicy(stored ? "ready" : "absent", Boolean(envConfig));

  if (stored && policy === "user") {
    // Re-validate at use time: the stored URL was checked on save, but DNS can
    // change afterwards, and this is the last gate before an outbound fetch.
    const baseUrl = await assertSafeBaseUrl(stored.baseUrl, {
      allowHttp: stored.allowHttp,
      allowPrivate: stored.allowPrivate,
    }).catch(() => null);
    if (!baseUrl) return null;

    let generationPath: string;
    let modelsPath: string | null;
    try {
      generationPath = normaliseProviderPath(
        stored.generationPath || generationPathFor(stored.protocol),
      );
      modelsPath = stored.modelsPath
        ? normaliseProviderPath(stored.modelsPath)
        : modelsPathFor(stored.protocol);
    } catch {
      return null;
    }

    return {
      source: "user",
      config: {
        provider: stored.provider,
        protocol: stored.protocol,
        authMode: stored.authMode,
        baseUrl,
        generationPath,
        modelsPath,
        apiKey: stored.apiKey,
        model: stored.model,
        jsonMode: stored.jsonMode,
        allowHttp: stored.allowHttp,
        allowPrivate: stored.allowPrivate,
        // Reply caps come from the pure policy in resolve-core: the user's
        // own setting wins, otherwise the 32,000 ceiling. The deployment's
        // AI_MAX_OUTPUT_TOKENS is deliberately NOT consulted here — its
        // generic default once leaked onto personal keys and truncated every
        // thinking-model reply. Env still tunes the wall-clock windows.
        ...userReplyCaps(
          stored.maxOutputTokens,
          envConfig?.timeoutMs,
          envConfig?.firstTokenTimeoutMs,
        ),
        thinking: stored.thinking,
        visionEnabled: stored.visionEnabled,
        dailyRequestLimit: 400,
        dailyTokenLimit: 2_000_000,
      },
    };
  }

  if (!envConfig) return null;
  return { config: envConfig, source: "env" };
}

export { USER_KEY_SAFETY_LIMITS } from "./resolve-core";
