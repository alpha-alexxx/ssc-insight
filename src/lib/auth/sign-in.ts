"use client";
import { authClient } from "./client";

/**
 * Where a failed Google round trip lands. The auth pages (/sign-in,
 * /sign-up, /forgot-password) are the sign-in surface, so errors return to
 * the page the reader was on — /sign-in owns the error query and raises the
 * toast; the proxy and `/auth/complete` redirect there too.
 *
 * Deliberately bare: better-auth APPENDS its own `error=<provider-code>` to
 * this URL, so pre-setting `?error=oauth` would produce a duplicate key that
 * Next hands to the page as an array. The sign-in page treats any unknown
 * code as a failed OAuth round trip instead.
 */
export const OAUTH_ERROR_PATH = "/sign-in";

/**
 * Start the Google OAuth redirect. Shared by the landing masthead/CTAs and
 * the workspace header control so both use one callback contract.
 *
 * The callback URLs MUST be absolute. better-auth validates relative paths
 * (allowRelativePaths), so sign-in starts fine, but the managed Neon Auth
 * service resolves the stored callback against ITS OWN origin when the
 * browser returns from Google — a relative "/auth/complete" 302s to
 * https://<neon-auth-host>/auth/complete?...verifier, where the service's
 * router answers 404 {"message":"Route GET:/auth/complete not found"} and
 * the app route never runs. An absolute URL lands the browser on this
 * origin, where the page proxy exchanges the verifier for session cookies.
 * Each origin used here must also be a Neon Auth trusted domain (see the
 * README OAuth setup checklist), or the sign-in POST fails 403
 * INVALID_CALLBACK_URL.
 *
 * Throws on failure; callers decide how to surface it (toast on the
 * landing, an inline popover in the workspace header).
 */
export async function startGoogleSignIn() {
  const origin = window.location.origin;
  const result = await authClient.signIn.social({
    provider: "google",
    callbackURL: `${origin}/auth/complete`,
    errorCallbackURL: `${origin}${OAUTH_ERROR_PATH}`,
  });
  if (result.error) throw new Error("Sign-in could not start. Please retry.");
}
