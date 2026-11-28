import type { ExtractionDraft } from "./extraction";
import type { CoachInsight } from "./schemas";
import type { AiAuthMode, AiProtocol } from "./protocols";

/** Where the active configuration came from. */
export type AiConfigSource = "user" | "env";

export type AiUsageSummary = {
  day: string;
  requests: number;
  tokens: number;
  limits: { requests: number; tokens: number };
  resetAt: string;
  retryAfterSeconds: number;
};

export type AiSourceState = "ready" | "personal-invalid" | "env-ready";

export type AiStatus = {
  /** False only when neither the user nor the deployment can resolve AI. */
  enabled: boolean;
  state: AiSourceState | "unconfigured";
  source: AiConfigSource | null;
  provider: string | null;
  protocol: AiProtocol | null;
  authMode: AiAuthMode | null;
  model: string | null;
  usage: AiUsageSummary | null;
  /** False when the server has no AI_CREDENTIAL_SECRET, so keys cannot be saved. */
  storageAvailable?: boolean;
  credential?: AiCredentialSummary | null;
};

/**
 * Client-safe view of a stored credential. Deliberately has NO apiKey field:
 * the key is write-only and the server returns only a 4-character hint.
 */
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
  /** Provider default, off, or a reasoning-effort hint for the provider. */
  thinking: string;
  /** Conversation turns sent per question; null inherits the default (8). */
  historyTurns: number | null;
  /** Gates image input in chat and report extraction. */
  visionEnabled: boolean;
  updatedAt: string | null;
};

export type AiSettingsResponse = {
  storageAvailable: boolean;
  credential: AiCredentialSummary | null;
};

export type AiModelsResponse = {
  models: { id: string; name: string }[];
};

/** Result of POST /api/ai/test — per-phase diagnostics for the checklist UI. */
export type AiTestResponse = {
  ok: boolean;
  model: string;
  protocol: string;
  source: string;
  replyChars: number;
  latencyMs: number;
  /** The streaming probe produced at least one delta. */
  streaming: boolean;
  /** Time to the first stream delta, when one arrived. */
  streamLatencyMs: number | null;
  /** Any hidden reasoning arrived during the stream probe. */
  thinkingObserved: boolean;
  /** Sanitized failure code when the streaming probe failed. */
  streamError?: string;
};

export type CoachMeta = {
  contextVersion: string;
  dataAsOf: string | null;
  coverage: {
    totalAttempts: number;
    fullMocks: number;
    subjectMocks: number;
    sectionalMocks: number;
    recentFullMocksIncluded: number;
    recentFullMockLimit: number;
  };
};

export type AiResponseUsage = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimated: boolean;
  providerCalls: number;
};

export type CoachResponse = {
  insight: CoachInsight;
  meta: CoachMeta;
  usage: AiResponseUsage;
};

export type ExtractResponse = {
  draft: ExtractionDraft;
  usage: AiResponseUsage;
};

/** One earlier answer to the same user turn, oldest first on ChatMessage. */
export type ChatAnswerVersion = Pick<
  ChatMessage,
  "content" | "reasoning" | "reasoningSeconds" | "stopped" | "truncated" | "at"
>;

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** Hidden reasoning the model streamed before the answer, shown collapsed.
   * Never sent back to the server with follow-up questions. */
  reasoning?: string;
  /** Client-measured seconds the model spent reasoning before its first
   * answer token. Older stored messages may omit it. */
  reasoningSeconds?: number;
  /** Downscaled data-URL screenshots attached to a user turn (vision).
   * Never re-sent with follow-up history. */
  images?: string[];
  /** The turn carried screenshots with no typed text (the API still needs a
   * label on the wire); the transcript renders the images alone. */
  imageOnly?: boolean;
  /** The stream was stopped before the answer finished; a partial answer
   * may remain. Client-side state, not a server stop reason. */
  stopped?: boolean;
  /** The stream ended on a truncation stop reason; the answer may be cut off. */
  truncated?: boolean;
  /** Client-clock ISO timestamp of the turn; used by the conversation
   * history and the streaming "thinking" indicator. Older stored messages
   * may omit it. */
  at?: string;
  /** Previous answers to the same user turn, oldest first. The visible answer
   * is always the message itself and is never duplicated in this list. */
  versions?: ChatAnswerVersion[];
};

export const AI_VIEWS = [
  "dashboard",
  "calendar",
  "tasks",
  "plan",
  "history",
  "compare",
  "performance",
  "add",
  "ask",
  "settings",
] as const;
export type AiView = (typeof AI_VIEWS)[number];

/** Orientation only: never includes attempt content, notes, IDs, or identity. */
export type AiScreenContext = {
  view: AiView;
  date?: string;
};

/**
 * Longest todo-assistance instruction, matching the paste-extraction ceiling so
 * "plan my whole week" can be written in one go. Enforced by the API schema and
 * mirrored by the composer's counter; the route's body limit sits above the
 * worst-case UTF-8 expansion of this many characters.
 */
export const MAX_TODO_PROMPT_CHARS = 20_000;
