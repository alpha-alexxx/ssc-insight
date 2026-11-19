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

/**
 * "Test connection" for the AI picker.
 *
 * This is intentionally small: one short completion, no tracker context,
 * nothing saved. It proves the endpoint, key, and model work without spending
 * real tokens on a full coach read, and it never echoes the key or the base
 * URL back.
 *
 * Rate-limited as a write: it causes a billable outbound request.
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
            maxOutputTokens: TEST_MAX_OUTPUT_TOKENS,
            timeoutMs: 20_000,
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

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20_000);
    try {
      const provider = createAiProvider(resolved.config);
      const result = await provider.complete({
        messages: [
          {
            role: "system",
            content:
              "Reply with exactly: OK. Do not add any other text or punctuation.",
          },
          { role: "user", content: "Connection test." },
        ],
        maxOutputTokens: TEST_MAX_OUTPUT_TOKENS,
        signal: controller.signal,
      });
      return {
        data: {
          ok: true,
          model: resolved.config.model,
          protocol: resolved.config.protocol,
          source: resolved.source,
          // Confirms a real completion happened without exposing content.
          replyChars: result.text.trim().length,
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
    } finally {
      clearTimeout(timer);
    }
  },
);
