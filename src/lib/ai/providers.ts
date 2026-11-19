import {
  AI_PROTOCOLS,
  authModeFor,
  generationPathFor,
  modelsPathFor,
  type AiAuthMode,
  type AiProtocol,
} from "./protocols";

export type ProviderId =
  | "openai"
  | "anthropic"
  | "openrouter"
  | "groq"
  | "together"
  | "deepseek"
  | "ollama"
  | "custom";

export type ProviderPreset = {
  id: ProviderId;
  label: string;
  /** Fixed base URL, or null when the user must supply one. */
  baseUrl: string | null;
  /** Default wire protocol for a new connection. */
  protocol: AiProtocol;
  /** Protocols the UI offers without entering the generic Custom preset. */
  protocols: readonly AiProtocol[];
  authMode: AiAuthMode;
  generationPath: string;
  modelsPath: string | null;
  /** Representative models offered as suggestions (free text is allowed). */
  models: string[];
  /** True when the endpoint is typically a local server. */
  local?: boolean;
  note?: string;
};

function preset(input: Omit<ProviderPreset, "authMode" | "generationPath" | "modelsPath"> & {
  authMode?: AiAuthMode;
  generationPath?: string;
  modelsPath?: string | null;
}): ProviderPreset {
  return {
    ...input,
    authMode: input.authMode ?? authModeFor(input.protocol, input.id),
    generationPath:
      input.generationPath ?? generationPathFor(input.protocol),
    modelsPath: input.modelsPath ?? modelsPathFor(input.protocol),
  };
}

export const PROVIDER_PRESETS: readonly ProviderPreset[] = [
  preset({
    id: "openai",
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    protocol: "openai-responses",
    protocols: [
      "openai-responses",
      "openai-chat",
      "openai-completions",
    ],
    models: ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini"],
    note: "Responses is recommended for new OpenAI connections.",
  }),
  preset({
    id: "anthropic",
    label: "Anthropic",
    baseUrl: "https://api.anthropic.com/v1",
    protocol: "anthropic-messages",
    protocols: ["anthropic-messages"],
    models: [
      "claude-sonnet-4-5-20250929",
      "claude-haiku-4-5-20251001",
    ],
  }),
  preset({
    id: "openrouter",
    label: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    protocol: "openai-chat",
    protocols: ["openai-chat"],
    models: [
      "openai/gpt-4o-mini",
      "anthropic/claude-3.5-sonnet",
      "google/gemini-flash-1.5",
    ],
    note: "One key for many models.",
  }),
  preset({
    id: "groq",
    label: "Groq",
    baseUrl: "https://api.groq.com/openai/v1",
    protocol: "openai-chat",
    protocols: ["openai-chat"],
    models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"],
    note: "Very fast inference.",
  }),
  preset({
    id: "together",
    label: "Together AI",
    baseUrl: "https://api.together.xyz/v1",
    protocol: "openai-chat",
    protocols: ["openai-chat"],
    models: ["meta-llama/Llama-3.3-70B-Instruct-Turbo"],
  }),
  preset({
    id: "deepseek",
    label: "DeepSeek",
    baseUrl: "https://api.deepseek.com/v1",
    protocol: "openai-chat",
    protocols: ["openai-chat"],
    models: ["deepseek-chat", "deepseek-reasoner"],
  }),
  preset({
    id: "ollama",
    label: "Ollama (local)",
    baseUrl: "http://localhost:11434/v1",
    protocol: "openai-chat",
    protocols: ["openai-chat"],
    authMode: "none",
    models: ["llama3.2", "qwen2.5"],
    local: true,
    note: "Runs on your own machine. Only reachable from a local install.",
  }),
  preset({
    id: "custom",
    label: "Custom endpoint",
    baseUrl: null,
    protocol: "openai-chat",
    protocols: AI_PROTOCOLS,
    models: [],
    note: "Choose the API format used by your provider.",
  }),
] as const;

export const PROVIDER_IDS = new Set<string>(
  PROVIDER_PRESETS.map((item) => item.id),
);

export function providerPreset(id: string): ProviderPreset | null {
  return PROVIDER_PRESETS.find((item) => item.id === id) ?? null;
}

export function providerLabel(id: string): string {
  return providerPreset(id)?.label ?? "Custom endpoint";
}
