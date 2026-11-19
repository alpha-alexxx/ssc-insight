export const AI_PROTOCOLS = [
  "openai-responses",
  "openai-chat",
  "openai-completions",
  "anthropic-messages",
] as const;

export type AiProtocol = (typeof AI_PROTOCOLS)[number];

export const AI_AUTH_MODES = ["bearer", "anthropic-key", "none"] as const;
export type AiAuthMode = (typeof AI_AUTH_MODES)[number];

const GENERATION_PATHS: Record<AiProtocol, string> = {
  "openai-responses": "responses",
  "openai-chat": "chat/completions",
  "openai-completions": "completions",
  "anthropic-messages": "messages",
};

export function isAiProtocol(value: string): value is AiProtocol {
  return (AI_PROTOCOLS as readonly string[]).includes(value);
}

export function isAiAuthMode(value: string): value is AiAuthMode {
  return (AI_AUTH_MODES as readonly string[]).includes(value);
}

export function generationPathFor(protocol: AiProtocol): string {
  return GENERATION_PATHS[protocol];
}

export function modelsPathFor(_protocol: AiProtocol): string {
  return "models";
}

export function authModeFor(
  protocol: AiProtocol,
  provider?: string,
): AiAuthMode {
  if (provider === "ollama") return "none";
  return protocol === "anthropic-messages" ? "anthropic-key" : "bearer";
}

/**
 * Validate a provider-relative path without resolving it. Keeping this policy
 * separate lets both client-safe schemas and the server transport share the
 * exact same rule.
 */
export function normaliseProviderPath(
  value: string,
  options: { allowEmpty?: boolean } = {},
): string {
  const raw = value.trim();
  if (!raw && options.allowEmpty) return "";
  if (!raw) throw new Error("Enter a relative provider path.");
  if (
    /^[a-z][a-z\d+.-]*:/i.test(raw) ||
    raw.startsWith("//") ||
    raw.includes("?") ||
    raw.includes("#") ||
    raw.includes("\\") ||
    /(^|\/)\.\.?($|\/)/.test(raw) ||
    /[\u0000-\u001f\u007f]/.test(raw)
  ) {
    throw new Error(
      "Provider paths must be relative and cannot contain a host, query, fragment, or parent segment.",
    );
  }
  return raw.replace(/^\/+|\/+$/g, "");
}

export function joinProviderUrl(baseUrl: string, relativePath: string): string {
  const path = normaliseProviderPath(relativePath);
  const base = baseUrl.trim().replace(/\/+$/, "");
  let parsed: URL;
  try {
    parsed = new URL(base);
  } catch {
    throw new Error("Enter a valid provider base URL.");
  }
  if (parsed.search || parsed.hash)
    throw new Error("The provider base URL cannot include a query or fragment.");
  return `${base}/${path}`;
}

/**
 * Users often paste a complete known endpoint into a field labelled base URL.
 * Split only the selected protocol's exact suffix; never guess another
 * protocol or move the target to a different host.
 */
export function canonicalizeAiEndpoint(
  value: string,
  protocol: AiProtocol,
): { baseUrl: string; generationPath: string } {
  const generationPath = generationPathFor(protocol);
  const trimmed = value.trim().replace(/\/+$/, "");
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { baseUrl: trimmed, generationPath };
  }
  const suffix = `/${generationPath}`;
  if (!url.pathname.endsWith(suffix)) {
    return { baseUrl: trimmed, generationPath };
  }
  url.pathname = url.pathname.slice(0, -suffix.length) || "/";
  const baseUrl = url.toString().replace(/\/+$/, "");
  return { baseUrl, generationPath };
}
