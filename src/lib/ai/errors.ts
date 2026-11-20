export type AiErrorCode =
  | "AI_NOT_CONFIGURED"
  | "AI_PERSONAL_CONFIG_INVALID"
  | "AI_QUOTA_EXCEEDED"
  | "AI_RATE_LIMITED"
  | "AI_INPUT_TOO_LARGE"
  | "AI_TIMEOUT"
  | "AI_PROVIDER_ERROR"
  | "AI_PROVIDER_AUTH"
  | "AI_PROVIDER_RATE_LIMIT"
  | "AI_ENDPOINT_ERROR"
  | "AI_MODEL_ERROR"
  | "AI_REFUSED"
  | "AI_OUTPUT_INCOMPLETE"
  | "AI_INVALID_OUTPUT"
  | "AI_ABORTED"
  | "AI_BUSY";

export type AiBillability = "none" | "unknown";

/**
 * Safe AI errors. Messages are written for the user and never include
 * provider responses, request headers, the base URL, or credentials.
 */
export class AiError extends Error {
  constructor(
    public readonly code: AiErrorCode,
    message: string,
    public readonly status: number,
    public readonly retryAfterSeconds?: number,
    public readonly billability: AiBillability = "unknown",
  ) {
    super(message);
    this.name = "AiError";
  }
}

export function aiNotConfigured() {
  return new AiError(
    "AI_NOT_CONFIGURED",
    "AI is not configured. Add a provider, model, and credential in Settings.",
    503,
    undefined,
    "none",
  );
}

export function aiPersonalConfigInvalid() {
  return new AiError(
    "AI_PERSONAL_CONFIG_INVALID",
    "Your saved AI provider cannot be used. Review or remove it in Settings → AI provider.",
    503,
    undefined,
    "none",
  );
}

export function aiQuotaExceeded(retryAfterSeconds: number) {
  return new AiError(
    "AI_QUOTA_EXCEEDED",
    "You have reached today's AI limit. It resets at midnight IST.",
    429,
    retryAfterSeconds,
    "none",
  );
}

/**
 * The request-path rate limiter refused the call (not the provider: that is
 * AI_PROVIDER_RATE_LIMIT). Distinct from AI_QUOTA_EXCEEDED, which is the daily
 * generation budget; this one is a short burst limit.
 */
export function aiRateLimited(retryAfterSeconds: number) {
  return new AiError(
    "AI_RATE_LIMITED",
    "That was a lot of AI requests at once. Wait a moment and try again.",
    429,
    retryAfterSeconds,
    "none",
  );
}

export function aiTimeout() {
  return new AiError(
    "AI_TIMEOUT",
    "The AI provider took too long to respond. Try again.",
    504,
  );
}

export function aiProviderError() {
  return new AiError(
    "AI_PROVIDER_ERROR",
    "The AI provider could not complete this request. Try again shortly.",
    502,
  );
}

export function aiProviderAuth() {
  return new AiError(
    "AI_PROVIDER_AUTH",
    "The AI provider rejected this credential. Check the API key and its permissions.",
    502,
    undefined,
    "none",
  );
}

export function aiProviderRateLimit(retryAfterSeconds?: number) {
  return new AiError(
    "AI_PROVIDER_RATE_LIMIT",
    "The AI provider is rate limited. Wait a moment, then try again.",
    429,
    retryAfterSeconds,
    "none",
  );
}

export function aiEndpointError() {
  return new AiError(
    "AI_ENDPOINT_ERROR",
    "The selected API format was not found at this endpoint. Check the base URL, API format, and generation path.",
    502,
    undefined,
    "none",
  );
}

export function aiModelError() {
  return new AiError(
    "AI_MODEL_ERROR",
    "The provider rejected this model. Check the exact model ID and its availability for your account.",
    502,
    undefined,
    "none",
  );
}

export function aiRefused() {
  return new AiError(
    "AI_REFUSED",
    "The selected model declined this request. Try a different wording or model.",
    422,
    undefined,
    "none",
  );
}

export function aiOutputIncomplete() {
  return new AiError(
    "AI_OUTPUT_INCOMPLETE",
    "The AI response ended before it was complete. Increase the output limit or try again.",
    502,
  );
}

export function aiInvalidOutput() {
  return new AiError(
    "AI_INVALID_OUTPUT",
    "The AI returned a response the app could not read. Check the API format, or use manual entry.",
    502,
  );
}

export function aiAborted() {
  return new AiError(
    "AI_ABORTED",
    "The AI request was cancelled.",
    499,
    undefined,
    "none",
  );
}

export function aiBusy() {
  return new AiError(
    "AI_BUSY",
    "The AI usage check is busy right now. Try again in a moment.",
    503,
    undefined,
    "none",
  );
}
