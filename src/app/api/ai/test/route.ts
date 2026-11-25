import { defineRoute } from "@/lib/route-handler";
import { readBody, RequestError } from "@/lib/api";
import { resolveAiConfig } from "@/lib/ai/resolve";
import { createAiProvider } from "@/lib/ai/provider";
import { AiError } from "@/lib/ai/errors";
import { SsrfError } from "@/lib/ai/ssrf-core";
import { aiCredentialSchema } from "@/lib/ai/connection-input";
import { resolveDraftConnection } from "@/lib/ai/draft-connection";
import type { AiConfigSource } from "@/lib/ai/resolve-core";
import type { AiConfig } from "@/lib/ai/config-core";

export const runtime = "nodejs";
export const maxDuration = 60;

// Thinking models spend output tokens on hidden reasoning before answering,
// so the probe needs headroom to finish. A 16-token budget made a perfectly
// healthy connection fail: the model burned all 16 tokens reasoning and the
// app saw an empty reply. 512 keeps the call cheap while letting small
// reasoning chains complete.
const TEST_MAX_OUTPUT_TOKENS = 512;
const PROBE_TIMEOUT_MS = 20_000;
const STREAM_PROBE_TIMEOUT_MS = 25_000;

const PROBE_MESSAGES = [
  {
    role: "system" as const,
    content:
      "Reply with exactly: OK. Do not add any other text or punctuation.",
  },
  { role: "user" as const, content: "Connection test." },
];

/**
 * "Test connection" for the AI picker.
 *
 * Two short probes, no tracker context, nothing saved: a non-streaming
 * completion proves the endpoint, key, and model; a tiny stream proves the
 * streaming path the chat actually uses (some gateways accept completions
 * but mishandle SSE). The response reports each phase so the settings UI can
 * render a checklist, and never echoes the key or the base URL back.
 *
 * Rate-limited as a write: it causes billable outbound requests.
 */
export const POST = defineRoute(
  { kind: "write" },
  async ({ request, user }) => {
    let resolved:
      | { source: "draft" | AiConfigSource; config: AiConfig }
      | null = null;
    try {
      if (request.body) {
        const parsed = aiCredentialSchema.safeParse(await readBody(request));
        if (!parsed.success)
          throw new RequestError(
            parsed.error.issues[0]?.message ?? "Check the provider details.",
            400,
          );
        const connection = await resolveDraftConnection(user.id, parsed.data);
        resolved = {
          source: "draft",
          config: {
            provider: parsed.data.provider,
            protocol: parsed.data.protocol,
            authMode: parsed.data.authMode,
            baseUrl: connection.baseUrl,
            generationPath: parsed.data.generationPath,
            modelsPath: parsed.data.modelsPath,
            apiKey: connection.apiKey,
            model: parsed.data.model,
            jsonMode: parsed.data.jsonMode ?? true,
            allowHttp: parsed.data.allowHttp,
            allowPrivate: parsed.data.allowPrivate,
            // The probe honours the caller's chosen thinking level so the
            // test reflects real behavior, but keeps the 512-token probe cap
            // so the test stays cheap whatever the user's own ceiling is.
            thinking: parsed.data.thinking,
            visionEnabled: parsed.data.visionEnabled,
            timeoutMs: PROBE_TIMEOUT_MS,
            firstTokenTimeoutMs: PROBE_TIMEOUT_MS,
            dailyRequestLimit: 30,
            dailyTokenLimit: 300_000,
          },
        };
      } else {
        // Retain the existing saved-config test contract for other callers.
        const saved = await resolveAiConfig(user.id);
        if (saved) resolved = { source: saved.source, config: saved.config };
      }
    } catch (error) {
      if (error instanceof SsrfError) {
        throw new RequestError(error.message, 400);
      }
      throw error;
    }
    if (!resolved) {
      throw new RequestError(
        "AI is not configured yet. Add a provider and API key first.",
        503,
      );
    }

    try {
      const provider = createAiProvider(resolved.config);
      const completeController = new AbortController();
      const completeTimer = setTimeout(
        () => completeController.abort(),
        PROBE_TIMEOUT_MS,
      );
      let latencyMs: number;
      let replyChars: number;
      try {
        const startedAt = Date.now();
        const result = await provider.complete({
          messages: PROBE_MESSAGES,
          maxOutputTokens: TEST_MAX_OUTPUT_TOKENS,
          signal: completeController.signal,
        });
        latencyMs = Date.now() - startedAt;
        // Confirms a real completion happened without exposing content.
        replyChars = result.text.trim().length;
      } finally {
        clearTimeout(completeTimer);
      }

      // The streaming probe: what matters for chat is that deltas actually
      // arrive. Failure here does not fail the whole test — the checklist
      // shows exactly which phase broke.
      const streamController = new AbortController();
      const streamTimer = setTimeout(
        () => streamController.abort(),
        STREAM_PROBE_TIMEOUT_MS,
      );
      let streaming = false;
      let thinkingObserved = false;
      let streamLatencyMs: number | null = null;
      let streamError: string | null = null;
      try {
        const streamStartedAt = Date.now();
        await provider.stream({
          messages: PROBE_MESSAGES,
          maxOutputTokens: TEST_MAX_OUTPUT_TOKENS,
          signal: streamController.signal,
          onDelta: () => {
            if (!streaming) streamLatencyMs = Date.now() - streamStartedAt;
            streaming = true;
          },
          onReasoning: () => {
            thinkingObserved = true;
          },
        });
      } catch (error) {
        if (error instanceof AiError) {
          streamError = error.code;
          if (error.code === "AI_TIMEOUT" && streamLatencyMs == null) {
            streamError =
              "AI_FIRST_TOKEN_TIMEOUT: the model produced nothing before the probe deadline";
          }
        } else {
          streamError = "AI_PROVIDER_ERROR";
        }
      } finally {
        clearTimeout(streamTimer);
      }

      return {
        data: {
          ok: true,
          model: resolved.config.model,
          protocol: resolved.config.protocol,
          source: resolved.source,
          replyChars,
          latencyMs,
          streaming,
          streamLatencyMs,
          thinkingObserved,
          ...(streamError ? { streamError } : {}),
        },
      };
    } catch (error) {
      if (error instanceof AiError) {
        // AiError messages are already sanitized (no provider body, no headers).
        throw new RequestError(error.message, error.status);
      }
      if (error instanceof SsrfError) {
        throw new RequestError(error.message, 400);
      }
      throw new RequestError(
        "The provider could not be reached. Check the base URL, key, and model.",
        502,
      );
    }
  },
);
