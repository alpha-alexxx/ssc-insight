import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  authFailureCopy,
  isTwoFactorRedirect,
  mapAuthWireError,
} from "../src/lib/auth/email-client";
import {
  authOtpSchema,
  authPasswordSchema,
  authTotpSchema,
  changePasswordSchema,
  registerEmailSchema,
} from "../src/lib/auth/email-schemas";

/**
 * The email-auth contracts that hold without a network: the wire-error →
 * reason mapping (including the "not enabled" degradation the whole feature
 * is built on), the two-factor interception shape, and the write-path
 * schemas. The wire client itself is exercised only against the hosted
 * service — that is what the live QA pass is for.
 */
void authFailureCopy;

describe("mapAuthWireError", () => {
  it("maps known better-auth error codes", () => {
    assert.equal(mapAuthWireError(400, "USER_ALREADY_EXISTS"), "email-exists");
    assert.equal(mapAuthWireError(401, "INVALID_EMAIL_OR_PASSWORD"), "invalid-credentials");
    assert.equal(mapAuthWireError(400, "INVALID_PASSWORD"), "invalid-credentials");
    assert.equal(mapAuthWireError(400, "INVALID_OTP"), "invalid-code");
    assert.equal(mapAuthWireError(400, "OTP_EXPIRED"), "invalid-code");
  });

  it("maps the four statuses that carry no code", () => {
    assert.equal(mapAuthWireError(429, null), "rate-limited");
    assert.equal(mapAuthWireError(404, null), "not-enabled");
    assert.equal(mapAuthWireError(401, null), "invalid-credentials");
    assert.equal(mapAuthWireError(503, null), "unavailable");
  });

  it("treats unknown codes as status, then unavailable", () => {
    assert.equal(mapAuthWireError(422, "SOMETHING_NEW"), "unavailable");
    assert.equal(mapAuthWireError(200, "USER_ALREADY_EXISTS"), "unavailable");
  });
});

describe("authFailureCopy", () => {
  it("reads the not-enabled degradation honestly", () => {
    const copy = authFailureCopy("not-enabled");
    assert.match(copy, /isn't enabled/);
    assert.match(copy, /Neon console/);
  });

  it("mentions the wait when Retry-After is present", () => {
    assert.match(authFailureCopy("rate-limited", 30), /30s/);
    assert.doesNotMatch(authFailureCopy("rate-limited", null), /\d+s/);
  });
});

describe("isTwoFactorRedirect", () => {
  it("detects the two-factor interception response", () => {
    assert.equal(isTwoFactorRedirect({ twoFactorRedirect: true }), true);
    assert.equal(isTwoFactorRedirect({ twoFactorRedirect: false }), false);
    assert.equal(isTwoFactorRedirect({ user: {}, token: "x" }), false);
    assert.equal(isTwoFactorRedirect(null), false);
  });
});

describe("email auth schemas", () => {
  it("requires a real email and an 8+ character password", () => {
    assert.equal(
      registerEmailSchema.safeParse({ name: "A", email: "nope", password: "longenough1" })
        .success,
      false,
    );
    assert.equal(
      registerEmailSchema.safeParse({ name: "A", email: "a@b.in", password: "short" }).success,
      false,
    );
    assert.equal(
      registerEmailSchema.safeParse({ name: "Ankit", email: "a@b.in", password: "longenough1" })
        .success,
      true,
    );
  });

  it("pins OTP and TOTP codes to six digits", () => {
    assert.equal(authOtpSchema.safeParse("123456").success, true);
    assert.equal(authOtpSchema.safeParse("12345").success, false);
    assert.equal(authOtpSchema.safeParse("1234567").success, false);
    assert.equal(authOtpSchema.safeParse("12a456").success, false);
    assert.equal(authTotpSchema.safeParse("000000").success, true);
  });

  it("rejects a password confirmation mismatch", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "longenough1",
      newPassword: "newenough12",
      confirmPassword: "different1",
    });
    assert.equal(result.success, false);
  });

  it("allows an empty current password for Google-only accounts but demands a new one", () => {
    assert.equal(
      changePasswordSchema.safeParse({
        currentPassword: "",
        newPassword: "newenough12",
        confirmPassword: "newenough12",
      }).success,
      true,
    );
    assert.equal(
      changePasswordSchema.safeParse({
        currentPassword: "",
        newPassword: "short",
        confirmPassword: "short",
      }).success,
      false,
    );
  });

  it("refuses a new password identical to the current one", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "longenough1",
      newPassword: "longenough1",
      confirmPassword: "longenough1",
    });
    assert.equal(result.success, false);
  });

  it("keeps the minimum password length aligned with the wire contract", () => {
    assert.equal(authPasswordSchema.safeParse("1234567").success, false);
    assert.equal(authPasswordSchema.safeParse("12345678").success, true);
  });
});
