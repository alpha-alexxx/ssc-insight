import { z } from "zod";
import { apiError, ok, readBody } from "@/lib/api";import { aiNotConfigured, AiError, aiProviderError } from "@/lib/ai/errors";
import {
  CONTEXT_TOKEN_ESTIMATE,
  chargedForAiFailure,
  reservationTokens,
} from "@/lib/ai/quota";
import { coachMessages } from "@/lib/ai/prompts";
import { createAiProvider } from "@/lib/ai/provider";
import { resolveAiConfig } from "@/lib/ai/resolve";
import {
  coachInsightSchema,
  coerceCoachInsight,
  parseModelJson,
  structuredFormatFor,
} from "@/lib/ai/schemas";
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
export const maxDuration = 60;

const COACH_FORMAT = structuredFormatFor(coachInsightSchema, "coach_insight");

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
    // The body is intentionally unused: context and ownership are server-side.
    await readBody(request, 8 * 1024);

    const limits = aiLimits(config);
    const reservation = await reserveAiUsage(userId, {
      feature: "coach",
      model: config.model,
      provider: config.provider,
      protocol: config.protocol,
      limits,
      reservedTokens: reservationTokens({
        promptText: "performance coach insight",
        contextTokens: CONTEXT_TOKEN_ESTIMATE + 1_500,
        maxOutputTokens: config.maxOutputTokens,
        providerCalls: 2,
      }),
    });

    let bundle;
    try {
      bundle = await loadAiBundle(userId);
    } catch (error) {
      await releaseSafely(reservation.id, userId, "CONTEXT_UNAVAILABLE");
      throw error;
    }

    let result;
    try {
      result = await createAiProvider(config).completeJson({
        messages: coachMessages(bundle.context, bundle.shape, bundle.examName),
        maxOutputTokens: config.maxOutputTokens,
        signal: request.signal,
        format: COACH_FORMAT,
        parse: (raw) =>
          // Pull near-miss output (an extra focus area, a long headline)
          // back inside the contract first; only genuinely broken answers
          // throw and trigger the provider's repair call.
          coachInsightSchema.parse(coerceCoachInsight(parseModelJson(raw, z.unknown()))),
      });
    } catch (error) {
      const code = error instanceof AiError ? error.code : "AI_PROVIDER_ERROR";
      await settleSafely({
        id: reservation.id,
        userId,
        status: code === "AI_ABORTED" ? "aborted" : "error",
        inputTokens: 0,
        outputTokens: 0,
        tokensCharged: chargedForAiFailure(
          error,
          reservation.reservedTokens,
        ),
        providerCalls: 2,
        errorCode: code,
        contextVersion: bundle.context.contextVersion,
      });
      if (error instanceof AiError) throw error;
      console.error("AI coach failed", {
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
      contextVersion: bundle.context.contextVersion,
    });

    return ok({
      insight: result.value,
      meta: {
        contextVersion: bundle.context.contextVersion,
        dataAsOf: bundle.context.dataAsOf,
        coverage: bundle.context.coverage,
      },
      usage: {
        ...result.usage,
        providerCalls: result.providerCalls,
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
