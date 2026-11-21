import { z } from "zod";

/**
 * Write-path validation for the email auth flows (landing panel and the
 * Sign-in & security panel). Each schema mirrors what the better-auth wire
 * contract accepts, so a submit that passes here also passes there — the
 * same discipline `settings-schema.ts` applies to the app's own routes.
 *
 * These are client-safe; the hosted auth service re-validates everything.
 */

export const authEmailSchema = z
  .string()
  .min(3, "Enter an email address.")
  .max(255)
  .email("Enter a valid email address.");

/** better-auth's default minimum; the service may enforce more. */
export const authPasswordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(128, "Passwords stop at 128 characters.");

export const authNameSchema = z
  .string()
  .min(1, "Enter a name.")
  .max(64, "Names stop at 64 characters.");

/** The 6-digit emailed one-time code. */
export const authOtpSchema = z
  .string()
  .regex(/^\d{6}$/, "Enter the 6-digit code.");

/** The 6-digit TOTP code from an authenticator app. */
export const authTotpSchema = z
  .string()
  .regex(/^\d{6}$/, "Enter the 6-digit code from your authenticator.");

export const signInEmailSchema = z.object({
  email: authEmailSchema,
  password: authPasswordSchema,
});

export const registerEmailSchema = z.object({
  name: authNameSchema,
  email: authEmailSchema,
  password: authPasswordSchema,
});

export const otpRequestSchema = z.object({
  email: authEmailSchema,
});

export const otpVerifySchema = z.object({
  email: authEmailSchema,
  code: authOtpSchema,
});

export const totpVerifySchema = z.object({
  code: authTotpSchema,
});

export const changePasswordSchema = z
  .object({
    /** Absent when the account has no password yet (Google-only accounts). */
    currentPassword: z
      .string()
      .max(128)
      .optional()
      .or(z.literal("")),
    newPassword: authPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "The two passwords don't match.",
    path: ["confirmPassword"],
  })
  .refine(
    (values) => !values.currentPassword || values.currentPassword !== values.newPassword,
    {
      message: "The new password must be different from the current one.",
      path: ["newPassword"],
    },
  );

export type OtpRequestValues = z.infer<typeof otpRequestSchema>;
export type SignInEmailValues = z.infer<typeof signInEmailSchema>;
export type RegisterEmailValues = z.infer<typeof registerEmailSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
