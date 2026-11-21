import { z } from "zod";
import { apiError, readBody } from "@/lib/api";
import { aiNotConfigured, AiError, aiProviderError } from "@/lib/ai/errors";
import { encodeNdjson } from "@/lib/ai/ndjson";
import { chatMessages } from "@/lib/ai/prompts";
import { AI_VIEWS } from "@/lib/ai/client-types";
import {
  CONTEXT_TOKEN_ESTIMATE,
  chargedForAiFailure,
  reservationTokens,
} from "@/lib/ai/quota";
import { createAiProvider } from "@/lib/ai/provider";
import { resolveAiConfig } from "@/lib/ai/resolve";
import { aiLimits, loadAiBundle } from "@/lib/ai/server";
import {
  releaseSafely,
  reserveAiUsage,
  settleSafely,
} from "@/lib/ai/usage";
import { requireUser } from "@/lib/auth/require-user";
import { consumeRateLimit, requestIdentity } from "@/lib/rate-limit";
import { aiRateLimited } from "@/lib/ai/errors";

export const runtime = "nodejs";
// Deep questions on thinking models can run for minutes; the platform clamps
// this to the deployment plan's ceiling, and the heartbeat below keeps
// intermediaries from cutting an idle stream before then.
export const maxDuration = 300;

const MAX_HISTORY_CHARS = 48_000;
const HEARTBEAT_MS = 15_000;
// Images ride inline as data URLs: two downscaled screenshots stay well
// under this and under Vercel's ~4.5 MB request ceiling.
const MAX_IMAGE_CHARS = 3_500_000;
const IMAGE_DATA_URL = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/;

const bodySchema = z
  .object({
    messages: z
      .array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string().trim().min(1).max(4_000),
        }),
      )
      .min(1)
      .max(16),
    images: z
      .array(z.string().regex(IMAGE_DATA_URL, "Send a PNG, JPEG, or WebP image."))
      .max(2)
      .optional(),
    context: z
      .object({
        // Derived from the shared list: a hand-maintained copy silently
        // 400s the moment a new workspace view is added.
        view: z.enum(AI_VIEWS),
        date: z.iso.date().optional(),
      })
      .optional(),
  })
  .refine((body) => body.messages.at(-1)?.role === "user", {
    message: "The last message must be from you.",
  });

export async function POST(request: Request) {
  try {
    const { id: userId } = await requireUser();
    // These streaming routes bypass defineRoute, so they carry their own limit.
    // AI is the most expensive request the app serves — it runs against the
    // dedicated 20/minute AI limiter, both layers; the AiUsage ledger still
    // governs the actual generation budget.
    const limit = await consumeRateLimit("ai", requestIdentity(userId, request));
    if (limit.outcome === "denied") throw aiRateLimited(limit.retryAfter);
    const resolved = await resolveAiConfig(userId);
    if (!resolved) throw aiNotConfigured();
    const config = resolved.config;
    const body = bodySchema.parse(await readBody(request, 4 * 1024 * 1024));
    const images = body.images ?? [];
    if (images.length) {
      if (!config.visionEnabled)
        throw new AiError(
          "AI_VISION_DISABLED",
          "Image input is off. Turn it on in Settings → AI provider.",
          400,
          undefined,
          "none",
        );
      const imageChars = images.reduce((total, url) => total + url.length, 0);
      if (imageChars > MAX_IMAGE_CHARS)
        throw new AiError(
          "AI_INPUT_TOO_LARGE",
          "Those images are too large. Attach one or two screenshots.",
          413,
        );
    }
    const historyChars = body.messages.reduce(
      (total, message) => total + message.content.length,
      0,
    );
    if (historyChars > MAX_HISTORY_CHARS)
      throw new AiError(
        "AI_INPUT_TOO_LARGE",
        "This conversation is too long. Clear the chat and start a new question.",
        413,
      );

    const reservation = await reserveAiUsage(userId, {
      feature: "chat",
      model: config.model,
      provider: config.provider,
      protocol: config.protocol,
      limits: aiLimits(config),
      reservedTokens: reservationTokens({
        promptText: body.messages
          .map((message) => message.content)
          .join("\n"),
        contextTokens: CONTEXT_TOKEN_ESTIMATE + 2_000,
        maxOutputTokens: config.maxOutputTokens,
        providerCalls: 1,
      }),
    });

    let bundle;
    try {
      bundle = await loadAiBundle(userId);
    } catch (error) {
      await releaseSafely(reservation.id, userId, "CONTEXT_UNAVAILABLE");
      throw error;
    }

    const provider = createAiProvider(config);
    const messages = chatMessages(
      bundle.context,
      body.messages,
      body.context,
      bundle.shape,
      bundle.examName,
      images.length ? images : undefined,
    );
    const abort = new AbortController();
    const signal = AbortSignal.any([request.signal, abort.signal]);
    let settled = false;

    const settle = async (
      status: "success" | "error" | "aborted",
      result?: {
        usage: {
          inputTokens: number;
          outputTokens: number;
          totalTokens: number;
        };
        providerCalls: number;
      },
      errorCode?: string,
      failure?: unknown,
    ) => {
      if (settled) return;
      settled = true;
      await settleSafely({
        id: reservation.id,
        userId,
        status,
        inputTokens: result?.usage.inputTokens ?? 0,
        outputTokens: result?.usage.outputTokens ?? 0,
        // A started stream may have been billed even when it failed/aborted;
        // definitive pre-generation failures settle at zero.
        tokensCharged:
          status === "success" && result
            ? result.usage.totalTokens
            : failure !== undefined
              ? chargedForAiFailure(failure, reservation.reservedTokens)
              : reservation.reservedTokens,
        providerCalls: result?.providerCalls ?? 1,
        errorCode: errorCode ?? null,
        contextVersion: bundle.context.contextVersion,
      });
    };

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const send = (event: Parameters<typeof encodeNdjson>[0]) => {
          controller.enqueue(encodeNdjson(event));
        };
        // Written on a timer even when the provider is silent: proxies stop
        // buffering an idle stream, and the client's "Thinking · Ns" clock
        // runs on real evidence of a live connection rather than hope.
        const heartbeat = setInterval(() => {
          try {
            send({ type: "ping" });
          } catch {
            // The client is already gone; the settle path handles cleanup.
          }
        }, HEARTBEAT_MS);
        try {
          send({ type: "start", contextVersion: bundle.context.contextVersion });
          const result = await provider.stream({
            messages,
            maxOutputTokens: config.maxOutputTokens,
            signal,
            onDelta: (text) => send({ type: "delta", text }),
            onReasoning: (text) => send({ type: "reasoning", text }),
          });
          await settle("success", result);
          send({
            type: "done",
            usage: {
              ...result.usage,
              providerCalls: result.providerCalls,
            },
            truncated: result.truncated,
          });
        } catch (error) {
          const code =
            error instanceof AiError ? error.code : "AI_PROVIDER_ERROR";
          await settle(
            code === "AI_ABORTED" ? "aborted" : "error",
            undefined,
            code,
            error,
          );
          if (!(error instanceof AiError))
            console.error("AI chat failed", {
              name: error instanceof Error ? error.name : "UnknownError",
            });
          try {
            send({
              type: "error",
              code,
              message:
                error instanceof AiError
                  ? error.message
                  : aiProviderError().message,
            });
          } catch {
            // The client is already gone.
          }
        } finally {
          clearInterval(heartbeat);
          abort.abort();
          try {
            controller.close();
          } catch {
            // Already closed by cancellation.
          }
        }
      },
      async cancel() {
        abort.abort();
        await settle("aborted", undefined, "AI_ABORTED");
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "private, no-store",
        "X-Accel-Buffering": "no",
        Vary: "Origin",
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
