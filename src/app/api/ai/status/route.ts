import { apiError, ok } from "@/lib/api";
import { aiConfigOrNull } from "@/lib/ai/config";
import { aiRateLimited } from "@/lib/ai/errors";
import {
  credentialStorageAvailable,
  describeAiCredential,
  getAiCredential,
} from "@/lib/ai/credentials";
import { providerLabel } from "@/lib/ai/providers";
import { USER_KEY_SAFETY_LIMITS } from "@/lib/ai/resolve-core";
import { aiLimits } from "@/lib/ai/server";
import { getAiUsageToday } from "@/lib/ai/usage";
import { requireUser } from "@/lib/auth/require-user";
import { consumeRateLimit, requestIdentity } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Status reports what can actually be used, never merely what is stored:
 *   unconfigured      — neither the user nor the deployment can resolve AI
 *   personal-invalid  — a saved credential exists but cannot be used
 *                       (undecryptable key, unsafe URL): the user must fix or
 *                       remove it; the environment provider is NOT substituted
 *   env-ready         — the deployment's shared configuration is active
 *   ready             — the user's own credential is active
 */
export async function GET(request: Request) {
  try {
    const { id: userId } = await requireUser();
    // Status bypasses defineRoute, so it carries its own read-class limit.
    // A read never consults Upstash, so this costs nothing extra.
    const limit = await consumeRateLimit("read", requestIdentity(userId, request));
    if (limit.outcome === "denied") throw aiRateLimited(limit.retryAfter);
    const credential = await describeAiCredential(userId).catch(() => null);
    const envConfig = aiConfigOrNull();
    const storageAvailable = credentialStorageAvailable();

    const source = credential ? "user" : envConfig ? "env" : null;
    if (!source) {
      return ok({
        enabled: false,
        state: "unconfigured",
        source: null,
        provider: null,
        protocol: null,
        authMode: null,
        model: null,
        usage: null,
        storageAvailable,
        credential: null,
      });
    }

    if (source === "user" && credential) {
      // describeAiCredential never decrypts, but resolveAiConfig refuses an
      // undecryptable key. Check the decrypting read as well so status cannot
      // claim "ready" for a credential every AI call would reject.
      const stored = await getAiCredential(userId);
      if (stored === "invalid") {
        return ok({
          enabled: false,
          state: "personal-invalid",
          source: null,
          provider: null,
          protocol: null,
          authMode: null,
          model: null,
          usage: null,
          storageAvailable,
          credential,
        });
      }
      return ok({
        enabled: true,
        state: "ready",
        source,
        provider: credential.provider,
        providerLabel: providerLabel(credential.provider),
        protocol: credential.protocol,
        authMode: credential.authMode,
        model: credential.model,
        // A personal key uses its own generous safety ceiling, never the
        // deployment's shared-key caps. Usage stays visible.
        // Token limit is unlimited for personal keys.
        usage: await getAiUsageToday(
          userId,
          USER_KEY_SAFETY_LIMITS,
        ),
        storageAvailable,
        credential,
      });
    }

    if (!envConfig) {
      // A credential row exists but the deployment has no configuration and
      // the credential itself could not be described — treat as invalid.
      return ok({
        enabled: false,
        state: "personal-invalid",
        source: null,
        provider: null,
        protocol: null,
        authMode: null,
        model: null,
        usage: null,
        storageAvailable,
        credential,
      });
    }

    return ok({
      enabled: true,
      state: "env-ready",
      source,
      provider: "env",
      providerLabel: "Server configuration",
      protocol: envConfig.protocol,
      authMode: envConfig.authMode,
      model: envConfig.model,
      usage: await getAiUsageToday(userId, aiLimits(envConfig)),
      storageAvailable,
      credential,
    });
  } catch (error) {
    return apiError(error);
  }
}
