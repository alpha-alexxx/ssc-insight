import { z } from "zod";
import { apiError, ok, readBody } from "@/lib/api";
import { aiNotConfigured, AiError, aiProviderError } from "@/lib/ai/errors";
import { parseExtraction } from "@/lib/ai/extraction";
import {
  MAX_EXTRACT_CHARS,
  extractionMessages,
  sanitizeReport,
} from "@/lib/ai/prompts";
import { reservationTokens, chargedForAiFailure } from "@/lib/ai/quota";
import { createAiProvider, messageText } from "@/lib/ai/provider";
import { resolveAiConfig } from "@/lib/ai/resolve";
import { aiLimits } from "@/lib/ai/server";
import { loadExamContext, requirePattern } from "@/lib/exam-settings";
import {
  reserveAiUsage,
  settleSafely,
} from "@/lib/ai/usage";
import { requireUser } from "@/lib/auth/require-user";
import { consumeRateLimit, requestIdentity } from "@/lib/rate-limit";
import { aiRateLimited } from "@/lib/ai/errors";

export const runtime = "nodejs";
export const maxDuration = 60;

// Scorecard screenshots ride inline as data URLs, same contract as chat.
const MAX_IMAGE_CHARS = 3_500_000;
const IMAGE_DATA_URL = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/;

const bodySchema = z.object({
  text: z.string().min(1),
  images: z
    .array(z.string().regex(IMAGE_DATA_URL, "Send a PNG, JPEG, or WebP image."))
    .max(2)
    .optional(),
  // The exam/tier the add form is scoped to; defaults to the active exam.
  examId: z.string().min(1).max(40).optional(),
  tierId: z.string().min(1).max(40).optional(),
});

export async function POST(request: Request) {
  try {
    const { id: userId } = await requireUser();
    // These streaming routes bypass defineRoute, so they carry their own limit.
    // AI is the most expensive request the app serves (cost 25 in the shared
    // window); the AiUsage ledger still governs the actual generation budget.
    const limit = await consumeRateLimit("ai", requestIdentity(userId, request));
    if (limit.outcome === "denied") throw aiRateLimited(limit.retryAfter);
    const resolved = await resolveAiConfig(userId);
    if (!resolved) throw aiNotConfigured();
    const config = resolved.config;
    // Text may be short when a screenshot carries the scorecard, so the
    // transport limit must admit the images too (Vercel caps near 4.5 MB).
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
    if (body.text.length > MAX_EXTRACT_CHARS)
      throw new AiError(
        "AI_INPUT_TOO_LARGE",
        `AI extraction accepts up to ${MAX_EXTRACT_CHARS.toLocaleString("en-IN")} characters. Use the manual parser for a longer report.`,
        413,
      );

    const report = sanitizeReport(body.text);
    const examCtx = await loadExamContext(userId);
    const claim = body as { examId?: string; tierId?: string };
    const { shape, resolved: pattern } = requirePattern(
      examCtx,
      claim.examId,
      claim.tierId,
    );
    const messages = extractionMessages(
      report,
      shape,
      pattern.examName,
      images.length ? images : undefined,
    );
    const reservation = await reserveAiUsage(userId, {
      feature: "extract",
      model: config.model,
      provider: config.provider,
      protocol: config.protocol,
      limits: aiLimits(config),
      reservedTokens: reservationTokens({
        promptText: messages.map((message) => messageText(message)).join("\n"),
        maxOutputTokens: config.maxOutputTokens,
        providerCalls: 2,
      }),
    });

    let result;
    try {
      result = await createAiProvider(config).completeJson({
        messages,
        maxOutputTokens: config.maxOutputTokens,
        signal: request.signal,
        parse: (raw: string) => parseExtraction(shape, raw),
      });
    } catch (error) {
      const code = error instanceof AiError ? error.code : "AI_PROVIDER_ERROR";
      await settleSafely({
        id: reservation.id,
        userId,
        status: code === "AI_ABORTED" ? "aborted" : "error",
        inputTokens: 0,
        outputTokens: 0,
        tokensCharged: chargedForAiFailure(error, reservation.reservedTokens),
        providerCalls: 2,
        errorCode: code,
      });
      if (error instanceof AiError) throw error;
      console.error("AI extraction failed", {
        name: error instanceof Error ? error.name : "UnknownError",
      });
      throw aiProviderError();
    }

    await settleSafely({
      id: reservation.id,
      userId,
      status: "success",
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
      tokensCharged: result.usage.totalTokens,
      providerCalls: result.providerCalls,
    });

    return ok({
      draft: result.value,
      usage: {
        ...result.usage,
        providerCalls: result.providerCalls,
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
