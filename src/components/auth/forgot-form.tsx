"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  authFailureCopy,
  EmailAuthError,
  requestPasswordResetOtp,
  resetPasswordWithOtp,
} from "@/lib/auth/email-client";
import {
  otpRequestSchema,
  otpResetSchema,
  type OtpRequestValues,
  type OtpResetValues,
} from "@/lib/auth/email-schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Stage = "request" | "verify" | "done";

/**
 * The forgot-password page's working part: request a code, then set a new
 * password against it. Enumeration-safe — the service answers success even
 * for an unknown email, so the copy never confirms whether an account
 * exists. On success the reader goes to /sign-in; the reset endpoint
 * creates a credential account when none exists, so this is also how a
 * Google-only account sets a first password from the outside.
 */
export function ForgotForm() {
  const searchParams = useSearchParams();
  // The sign-in page hands over a typed email so the reader doesn't retype.
  const [stage, setStage] = useState<Stage>("request");
  const [sentEmail, setSentEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const requestForm = useForm<OtpRequestValues>({
    resolver: zodResolver(otpRequestSchema),
    defaultValues: { email: searchParams.get("email") ?? "" },
  });
  const resetForm = useForm<OtpResetValues>({
    resolver: zodResolver(otpResetSchema),
    defaultValues: { email: sentEmail, code: "", newPassword: "", confirmPassword: "" },
  });

  if (stage === "request") {
    return (
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="font-serif text-[1.75rem] font-medium leading-tight tracking-[-0.02em] text-ink">
            Reset your password
          </h1>
          <p className="text-sm leading-relaxed text-muted">
            We email a 6-digit code to confirm it&apos;s you. If the email has
            an account, the code is on its way.
          </p>
        </header>
        <form
          className="flex flex-col gap-4"
          onSubmit={requestForm.handleSubmit(async (values) => {
            setError("");
            setBusy(true);
            try {
              await requestPasswordResetOtp(values.email);
              setSentEmail(values.email);
              resetForm.setValue("email", values.email);
              setStage("verify");
            } catch (e) {
              setError(
                e instanceof EmailAuthError
                  ? authFailureCopy(e.reason, e.retryAfterSeconds)
                  : "Could not send the code.",
              );
            } finally {
              setBusy(false);
            }
          })}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="forgot-email">Email</Label>
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              autoFocus
              {...requestForm.register("email")}
            />
            {requestForm.formState.errors.email ? (
              <p className="text-xs text-danger">
                {requestForm.formState.errors.email.message}
              </p>
            ) : null}
          </div>
          {error ? (
            <p role="alert" className="text-xs leading-relaxed text-danger">
              {error}
            </p>
          ) : null}
          <Button
            type="submit"
            disabled={busy}
            className="h-11 w-full justify-center"
          >
            {busy ? (
              <>
                <Loader2 size={14} className="animate-spin" aria-hidden /> Sending…
              </>
            ) : (
              "Email me a reset code"
            )}
          </Button>
          <p className="text-sm text-muted">
            Remembered it?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-accent underline underline-offset-4 hover:text-accent-hover"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    );
  }

  if (stage === "verify") {
    return (
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="font-serif text-[1.75rem] font-medium leading-tight tracking-[-0.02em] text-ink">
            Check your email
          </h1>
          <p className="text-sm leading-relaxed text-muted">
            A reset code was sent to {sentEmail}. It sets a new password; on a
            Google-only account it sets the first one.
          </p>
        </header>
        <form
          className="flex flex-col gap-4"
          onSubmit={resetForm.handleSubmit(async (values) => {
            setError("");
            setBusy(true);
            try {
              await resetPasswordWithOtp({
                email: values.email,
                code: values.code,
                password: values.newPassword,
              });
              setStage("done");
            } catch (e) {
              setError(
                e instanceof EmailAuthError
                  ? authFailureCopy(e.reason, e.retryAfterSeconds)
                  : "Could not reset the password.",
              );
            } finally {
              setBusy(false);
            }
          })}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="forgot-code">Code</Label>
            <Input
              id="forgot-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              className="tabular-nums text-center text-lg tracking-[0.4em]"
              autoFocus
              {...resetForm.register("code")}
            />
            {resetForm.formState.errors.code ? (
              <p className="text-xs text-danger">{resetForm.formState.errors.code.message}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="forgot-new">New password</Label>
            <Input
              id="forgot-new"
              type="password"
              autoComplete="new-password"
              {...resetForm.register("newPassword")}
            />
            {resetForm.formState.errors.newPassword ? (
              <p className="text-xs text-danger">
                {resetForm.formState.errors.newPassword.message}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="forgot-confirm">Confirm new password</Label>
            <Input
              id="forgot-confirm"
              type="password"
              autoComplete="new-password"
              {...resetForm.register("confirmPassword")}
            />
            {resetForm.formState.errors.confirmPassword ? (
              <p className="text-xs text-danger">
                {resetForm.formState.errors.confirmPassword.message}
              </p>
            ) : null}
          </div>
          {error ? (
            <p role="alert" className="text-xs leading-relaxed text-danger">
              {error}
            </p>
          ) : null}
          <Button
            type="submit"
            disabled={busy}
            className="h-11 w-full justify-center"
          >
            {busy ? (
              <>
                <Loader2 size={14} className="animate-spin" aria-hidden /> Saving…
              </>
            ) : (
              "Set new password"
            )}
          </Button>
          <button
            type="button"
            className="text-left text-xs font-medium text-muted underline underline-offset-4 transition-colors hover:text-ink"
            onClick={() => {
              setError("");
              setStage("request");
            }}
          >
            Use a different email
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-serif text-[1.75rem] font-medium leading-tight tracking-[-0.02em] text-ink">
          Password set
        </h1>
        <p className="text-sm leading-relaxed text-muted">
          Your new password is active{sentEmail ? ` for ${sentEmail}` : ""}.
          Sign in with it — and if this account had two-factor on, your
          authenticator still works.
        </p>
      </header>
      <Link
        href="/sign-in"
        className="inline-flex h-11 w-full items-center justify-center rounded-control bg-accent text-[0.9375rem] font-medium text-paper transition-colors hover:bg-accent-hover"
      >
        Go to sign in
      </Link>
    </div>
  );
}
