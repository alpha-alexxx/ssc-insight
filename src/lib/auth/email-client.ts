"use client";

/**
 * The email/OTP/2FA wire client.
 *
 * The Neon Auth SDK bundles `emailOTPClient` but NOT `twoFactorClient`, and
 * `createAuthClient()` accepts no arguments — so the password, TOTP and
 * session flows here speak the better-auth HTTP contract directly, over the
 * same-origin `/api/auth/*` proxy. No app server participates: every call is
 * forwarded to the hosted Neon Auth service, which owns enablement, email
 * delivery and the two-factor plugin. When a method is not enabled there,
 * the wire answers 404/`NOT_FOUND` and {@link mapAuthWireError} turns that
 * into the honest "not enabled" failure rather than a generic error.
 *
 * This file deliberately does NOT write through the app's `{data}`/`{error}`
 * envelope — better-auth has its own response shapes, and the auth proxy
 * stamps its own headers.
 */

/** Why an email-auth call failed — the panel maps this to honest copy. */
export type AuthFailureReason =
  /** The email already has an account; the reader should sign in instead. */
  | "email-exists"
  /** Wrong email or password (also: wrong current password on change). */
  | "invalid-credentials"
  /** A wrong or expired OTP / TOTP code. */
  | "invalid-code"
  /** Rate limited; `retryAfterSeconds` may carry the wait. */
  | "rate-limited"
  /** The hosted auth provider has not enabled this method. */
  | "not-enabled"
  /** Network, proxy, or 5xx — try again shortly. */
  | "unavailable";

export class EmailAuthError extends Error {
  reason: AuthFailureReason;
  retryAfterSeconds: number | null;

  constructor(
    reason: AuthFailureReason,
    message: string,
    retryAfterSeconds: number | null = null,
  ) {
    super(message);
    this.name = "EmailAuthError";
    this.reason = reason;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/**
 * Pure wire → reason mapping. Better-auth errors are `{ code, message }`
 * with a 4xx/5xx status; error codes are only consulted on error statuses,
 * unknown codes fall back to the status, and anything else is "unavailable".
 * 404 on these paths is the router missing the endpoint — the hosted
 * provider has not enabled the method.
 */
export function mapAuthWireError(
  status: number,
  code?: string | null,
): AuthFailureReason {
  if (status < 400) return "unavailable";
  if (status === 429) return "rate-limited";
  if (status === 404) return "not-enabled";
  switch (code) {
    case "USER_ALREADY_EXISTS":
      return "email-exists";
    case "INVALID_EMAIL_OR_PASSWORD":
    case "INVALID_PASSWORD":
    case "INVALID_EMAIL":
      return "invalid-credentials";
    case "INVALID_OTP":
    case "INVALID_CODE":
    case "OTP_EXPIRED":
      return "invalid-code";
    default:
      break;
  }
  if (status >= 500) return "unavailable";
  if (status === 401 || status === 403) return "invalid-credentials";
  // Any other 4xx with an unrecognized code: not confidently a credential
  // problem, so it degrades to the retry copy instead of a wrong claim.
  return "unavailable";
}

/** The reader-facing copy for a failure, kept in one place for both surfaces. */
export function authFailureCopy(
  reason: AuthFailureReason,
  retryAfterSeconds: number | null = null,
): string {
  switch (reason) {
    case "email-exists":
      return "An account with this email already exists — switch to Sign in.";
    case "invalid-credentials":
      return "That email and password don't match an account.";
    case "invalid-code":
      return "That code isn't right. Check your email or authenticator and retry.";
    case "rate-limited":
      return retryAfterSeconds != null && retryAfterSeconds > 0
        ? `Too many attempts — try again in ${retryAfterSeconds}s.`
        : "Too many attempts — wait a moment and retry.";
    case "not-enabled":
      return "Email sign-in isn't enabled for this project's auth provider. Enable Email in the Neon console first.";
    case "unavailable":
      return "The sign-in service couldn't complete that right now. Please retry shortly.";
  }
}

/* ------------------------------------------------------------------ internals */

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function retryAfterOf(response: Response): number | null {
  const header = response.headers.get("Retry-After");
  if (header == null) return null;
  const seconds = Number(header);
  return Number.isFinite(seconds) ? Math.max(0, Math.round(seconds)) : null;
}

/**
 * POST a better-auth endpoint. Returns the parsed body on 2xx; throws
 * {@link EmailAuthError} otherwise. Codes are read from the body, and a
 * bodyless 401/403 still maps to "invalid-credentials" via status.
 */
async function authPost(path: string, body: Record<string, unknown>): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`/api/auth${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new EmailAuthError("unavailable", "The sign-in service is unreachable.");
  }
  const data = await readJson(response);
  if (response.ok) return data;
  const code =
    typeof data === "object" && data != null && "code" in data
      ? String((data as { code: unknown }).code)
      : null;
  throw new EmailAuthError(
    mapAuthWireError(response.status, code),
    typeof data === "object" && data != null && "message" in data
      ? String((data as { message: unknown }).message)
      : "The request failed.",
    retryAfterOf(response),
  );
}

async function authGet(path: string): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`/api/auth${path}`, { cache: "no-store" });
  } catch {
    throw new EmailAuthError("unavailable", "The sign-in service is unreachable.");
  }
  const data = await readJson(response);
  if (response.ok) return data;
  const code =
    typeof data === "object" && data != null && "code" in data
      ? String((data as { code: unknown }).code)
      : null;
  throw new EmailAuthError(
    mapAuthWireError(response.status, code),
    "The request failed.",
    retryAfterOf(response),
  );
}

/** True when the body is better-auth's two-factor interception response. */
export function isTwoFactorRedirect(data: unknown): boolean {
  return (
    typeof data === "object" &&
    data != null &&
    (data as { twoFactorRedirect?: unknown }).twoFactorRedirect === true
  );
}

/* --------------------------------------------------- credentials and OTP */

/** Register with email + password; the session cookie is set on success. */
export async function signUpEmail(input: {
  name: string;
  email: string;
  password: string;
}): Promise<void> {
  await authPost("/sign-up/email", {
    name: input.name,
    email: input.email,
    password: input.password,
  });
}

/**
 * The password sign-in outcome. When the account has two-factor on, the
 * service answers `twoFactorRedirect: true` instead of creating a session —
 * the caller then collects a TOTP code and completes with
 * {@link verifyTotpSignIn}.
 */
export type SignInEmailOutcome =
  | { status: "signed-in" }
  | { status: "two-factor-required" };

/** Sign in with email + password; the session cookie is set when resolved. */
export async function signInEmail(input: {
  email: string;
  password: string;
}): Promise<SignInEmailOutcome> {
  const data = await authPost("/sign-in/email", input);
  return isTwoFactorRedirect(data)
    ? { status: "two-factor-required" }
    : { status: "signed-in" };
}

/**
 * Email a one-time sign-in code. Uses the SDK's bundled emailOTP client so
 * the call rides the same contract as the rest of better-auth.
 */
export async function sendSignInOtp(email: string): Promise<void> {
  const { authClient } = await import("./client");
  const result = await authClient.emailOtp.sendVerificationOtp({
    email,
    type: "sign-in",
  });
  if (result.error) {
    throw new EmailAuthError(
      mapAuthWireError(result.error.status ?? 500, result.error.code),
      result.error.message ?? "Could not send the code.",
      null,
    );
  }
}

/** Complete a passwordless sign-in with the emailed 6-digit code. */
export async function signInWithOtp(input: {
  email: string;
  code: string;
}): Promise<void> {
  const { authClient } = await import("./client");
  const result = await authClient.signIn.emailOtp({
    email: input.email,
    otp: input.code,
  });
  if (result.error) {
    throw new EmailAuthError(
      mapAuthWireError(result.error.status ?? 500, result.error.code),
      result.error.message ?? "Could not verify the code.",
      null,
    );
  }
}

/* --------------------------------------------------- password reset by OTP */

/**
 * Email a 6-digit password-reset code. Requires no session, so it serves
 * both the signed-out "Forgot password?" flow and the Settings dialog. The
 * endpoint answers success even for an unknown email (no account
 * enumeration) — callers should phrase the confirmation accordingly.
 */
export async function requestPasswordResetOtp(email: string): Promise<void> {
  await authPost("/email-otp/request-password-reset", { email });
}

/**
 * Confirm a password reset with the emailed code. Beyond changing an
 * existing password, the endpoint CREATES a credential account when the
 * user has none — this is how a Google-only account sets a first password.
 * It also marks the email verified. Whether the provider revokes the
 * account's sessions afterwards is its own managed config (`revokeSessions
 * OnPasswordReset`); callers must tolerate both outcomes.
 */
export async function resetPasswordWithOtp(input: {
  email: string;
  code: string;
  password: string;
}): Promise<void> {
  await authPost("/email-otp/reset-password", {
    email: input.email,
    otp: input.code,
    password: input.password,
  });
}

/** Complete a two-factor-intercepted password sign-in with a TOTP code. */
export async function verifyTotpSignIn(code: string): Promise<void> {
  await authPost("/two-factor/verify-totp", { code });
}

/* ------------------------------------------------------- account security */

/** The two-factor enrollment material, under whatever names the service answers. */
export type TwoFactorEnrollment = {
  uri: string | null;
  secret: string | null;
  backupCodes: string[];
};

function readEnrollment(data: unknown): TwoFactorEnrollment {
  const record = (data ?? {}) as Record<string, unknown>;
  const list = (value: unknown): string[] =>
    Array.isArray(value)
      ? value.map((item) => String(item))
      : typeof value === "string"
        ? value
            .split(/[\s,]+/)
            .map((item) => item.trim())
            .filter(Boolean)
        : [];
  return {
    uri:
      typeof record.totpURI === "string"
        ? record.totpURI
        : typeof record.tOTPURI === "string"
          ? record.tOTPURI
          : null,
    secret:
      typeof record.secret === "string"
        ? record.secret
        : typeof record.tOTPKey === "string"
          ? record.tOTPKey
          : null,
    backupCodes: list(record.backupCodes),
  };
}

/** Start TOTP enrollment: returns the otpauth URI, secret and backup codes. */
export async function twoFactorEnable(password: string): Promise<TwoFactorEnrollment> {
  return readEnrollment(await authPost("/two-factor/enable", { password }));
}

/** Confirm enrollment by verifying one code from the authenticator. */
export async function twoFactorVerifyTotp(code: string): Promise<void> {
  await authPost("/two-factor/verify-totp", { code });
}

/** Turn two-factor off. Requires the account password. */
export async function twoFactorDisable(password: string): Promise<void> {
  await authPost("/two-factor/disable", { password });
}

/** Generate a fresh set of backup codes (the old set stops working). */
export async function twoFactorRegenerateBackupCodes(
  password: string,
): Promise<TwoFactorEnrollment> {
  return readEnrollment(
    await authPost("/two-factor/generate-backup-codes", {
      password,
      saveRecoveryCode: true,
    }),
  );
}

/** Change the account password; optionally revoke other sessions. */
export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
  revokeOtherSessions?: boolean;
}): Promise<void> {
  await authPost("/change-password", input);
}

/* -------------------------------------------------------------- sessions */

export type AuthSessionRow = {
  id: string;
  userAgent: string | null;
  createdAt: string | null;
  expiresAt: string | null;
};

/** The account's active sessions, oldest first; `[]` when the call fails soft. */
export async function listSessions(): Promise<AuthSessionRow[]> {
  const data = await authGet("/list-sessions");
  const rows = Array.isArray(data) ? data : ((data as { sessions?: unknown[] })?.sessions ?? []);
  return rows
    .filter((row): row is Record<string, unknown> => typeof row === "object" && row != null)
    .map((row) => ({
      id: String(row.id ?? ""),
      userAgent: typeof row.userAgent === "string" ? row.userAgent : null,
      createdAt: typeof row.createdAt === "string" ? row.createdAt : null,
      expiresAt: typeof row.expiresAt === "string" ? row.expiresAt : null,
    }))
    .filter((row) => row.id)
    .sort(
      (a, b) =>
        (Date.parse(a.createdAt ?? "") || 0) - (Date.parse(b.createdAt ?? "") || 0),
    );
}

/** Revoke every session except the current one. */
export async function revokeOtherSessions(): Promise<void> {
  await authPost("/revoke-other-sessions", {});
}
