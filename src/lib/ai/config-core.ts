import {
  authModeFor,
  generationPathFor,
  isAiAuthMode,
  isAiProtocol,
  modelsPathFor,
  normaliseProviderPath,
  type AiAuthMode,
  type AiProtocol,
} from "./protocols";

export const DEFAULT_AI_BASE_URL = "https://api.openai.com/v1";

/**
 * How hard to ask the provider to reason. "default" sends nothing and lets
 * the model behave as its deployment configures it; "off" also sends nothing
 * (unknown relays have no portable way to disable a thinking model) — the
 * stream layer captures whatever reasoning the model produces anyway.
 */
export type AiThinking = "default" | "off" | "low" | "medium" | "high";

const AI_THINKING_LEVELS: readonly AiThinking[] = [
  "default",
  "off",
  "low",
  "medium",
  "high",
];

/** Shared with the zod schemas that validate a stored credential row. */
export const AI_THINKING_VALUES = AI_THINKING_LEVELS;

export function isAiThinking(value: string): value is AiThinking {
  return (AI_THINKING_LEVELS as readonly string[]).includes(value);
}

export type AiConfig = {
  provider: string;
  protocol: AiProtocol;
  authMode: AiAuthMode;
  baseUrl: string;
  generationPath: string;
  modelsPath: string | null;
  apiKey: string;
  model: string;
  jsonMode: boolean;
  allowHttp: boolean;
  allowPrivate: boolean;
  dailyRequestLimit: number;
  dailyTokenLimit: number;
  maxOutputTokens: number;
  /** Inactivity window between stream chunks once bytes are flowing. */
  timeoutMs: number;
  /**
   * Grace before the FIRST stream byte. Thinking models can stay silent far
   * past the stall window while reasoning; killing them at `timeoutMs` made
   * every deep question a 504. Applies to streams only — `complete()` keeps
   * its total wall-clock contract.
   */
  firstTokenTimeoutMs: number;
  thinking: AiThinking;
};

type Env = Record<string, string | undefined>;

function integerEnv(
  env: Env,
  name: string,
  fallback: number,
  min: number,
  max: number,
) {
  const raw = env[name]?.trim();
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(value)));
}

function normaliseBaseUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (!["http:", "https:"].includes(url.protocol)) return null;
  if (url.username || url.password || url.search || url.hash) return null;
  const local =
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.hostname === "[::1]" ||
    url.hostname === "::1";
  // Credentials must not cross plaintext connections. Local providers are the
  // one exception for development.
  if (url.protocol !== "https:" && !local) return null;
  return url.toString().replace(/\/+$/, "");
}

/**
 * Pure environment parsing so tests do not need Next's `server-only` shim.
 * Returns null when the integration is not usable; the rest of the app keeps
 * working in that state.
 */
export function readAiConfig(env: Env): AiConfig | null {
  const rawProtocol = env.AI_PROTOCOL?.trim() || "openai-chat";
  if (!isAiProtocol(rawProtocol)) return null;
  const protocol: AiProtocol = rawProtocol;
  const rawAuthMode = env.AI_AUTH_MODE?.trim();
  if (rawAuthMode && !isAiAuthMode(rawAuthMode)) return null;
  const provider = env.AI_PROVIDER?.trim() || "env";
  const authMode: AiAuthMode =
    rawAuthMode && isAiAuthMode(rawAuthMode)
      ? rawAuthMode
      : authModeFor(protocol, provider);
  const apiKey = env.AI_API_KEY?.trim() ?? "";
  const model = env.AI_MODEL?.trim() ?? "";
  if ((authMode !== "none" && !apiKey) || !model || model.length > 120)
    return null;
  const baseUrl = normaliseBaseUrl(
    env.AI_BASE_URL?.trim() || DEFAULT_AI_BASE_URL,
  );
  if (!baseUrl) return null;
  let generationPath: string;
  let modelsPath: string | null;
  try {
    generationPath = normaliseProviderPath(
      env.AI_GENERATION_PATH?.trim() || generationPathFor(protocol),
    );
    const rawModelsPath = env.AI_MODELS_PATH;
    modelsPath =
      rawModelsPath != null && !rawModelsPath.trim()
        ? null
        : normaliseProviderPath(
            rawModelsPath?.trim() || modelsPathFor(protocol),
          );
  } catch {
    return null;
  }
  const local =
    new URL(baseUrl).hostname === "localhost" ||
    new URL(baseUrl).hostname === "127.0.0.1" ||
    new URL(baseUrl).hostname === "[::1]" ||
    new URL(baseUrl).hostname === "::1";
  return {
    provider,
    protocol,
    authMode,
    baseUrl,
    generationPath,
    modelsPath,
    apiKey,
    model,
    jsonMode: env.AI_JSON_MODE?.trim().toLowerCase() !== "false",
    allowHttp: local && new URL(baseUrl).protocol === "http:",
    allowPrivate: local,
    dailyRequestLimit: integerEnv(env, "AI_DAILY_REQUEST_LIMIT", 30, 1, 10_000),
    dailyTokenLimit: integerEnv(
      env,
      "AI_DAILY_TOKEN_LIMIT",
      300_000,
      1_000,
      100_000_000,
    ),
    maxOutputTokens: integerEnv(env, "AI_MAX_OUTPUT_TOKENS", 1_200, 64, 16_000),
    // The ceiling leaves room for thinking models, whose hidden reasoning
    // consumes wall-clock time before the answer arrives. Keep the configured
    // value within the deployment platform's function limit (60s on Vercel)
    // or raise maxDuration on the AI routes to match.
    timeoutMs: integerEnv(env, "AI_TIMEOUT_MS", 45_000, 5_000, 180_000),
    // Deliberately more generous than the stall window: the whole point is a
    // model that produces nothing visible for a long first stretch.
    firstTokenTimeoutMs: integerEnv(
      env,
      "AI_FIRST_TOKEN_TIMEOUT_MS",
      120_000,
      5_000,
      300_000,
    ),
    // Unknown values degrade to the provider default rather than rejecting
    // the whole config: this is a preference, not a security boundary.
    thinking: isAiThinking(env.AI_THINKING?.trim().toLowerCase() ?? "")
      ? (env.AI_THINKING!.trim().toLowerCase() as AiThinking)
      : "default",
  };
}
