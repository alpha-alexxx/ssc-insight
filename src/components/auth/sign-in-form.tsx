"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  authFailureCopy,
  EmailAuthError,
  requestPasswordResetOtp,
  resetPasswordWithOtp,
  sendSignInOtp,
  signInEmail,
  signInWithOtp,
  verifyTotpSignIn,
} from "@/lib/auth/email-client";
import {
  otpRequestSchema,
  otpResetSchema,
  signInEmailSchema,
  totpVerifySchema,
  type OtpRequestValues,
  type OtpResetValues,
  type SignInEmailValues,
} from "@/lib/auth/email-schemas";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type SignInMode =
  | { step: "credentials" }
  | { step: "otp"; stage: "request" | "verify"; email: string }
  | { step: "totp"; email: string };

function FormError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-xs leading-relaxed text-danger">
      {message}
    </p>
  );
}

function CodeInput(props: React.ComponentProps<typeof Input>) {
  return (
    <Input
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={6}
      placeholder="000000"
      className="tabular-nums text-center text-lg tracking-[0.4em]"
      {...props}
    />
  );
}

/**
 * The sign-in page's working part: Google, email + password, the emailed
 * one-time-code login, and the TOTP second step when an account has
 * two-factor on. Success replaces history with
 * `/dashboard?welcome=1` — the workspace toasts once off that param and
 * strips it, so the sign-in page never lingers in history.
 */
export function SignInForm({
  googleEnabled,
  emailEnabled,
}: {
  googleEnabled: boolean;
  emailEnabled: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<SignInMode>({ step: "credentials" });
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  function done() {
    router.replace("/dashboard?welcome=1");
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-serif text-[1.75rem] font-medium leading-tight tracking-[-0.02em] text-ink">
          Welcome back
        </h1>
        <p className="text-sm leading-relaxed text-muted">
          Sign in to your private mock tracker.
        </p>
      </header>

      {mode.step === "credentials" ? (
        <div className="flex flex-col gap-5">
          <GoogleSignInButton
            enabled={googleEnabled}
            label="Sign in with Google"
            className="h-11 w-full justify-center"
          />
          {emailEnabled ? (
            <>
              <div className="flex items-center gap-3" aria-hidden="true">
                <span className="h-px flex-1 bg-rule-soft" />
                <span className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-muted">
                  or with email
                </span>
                <span className="h-px flex-1 bg-rule-soft" />
              </div>
              <SignInCredentialsForm
                onDone={done}
                onTwoFactor={(email) => {
                  setFormError("");
                  setNotice("");
                  setMode({ step: "totp", email });
                }}
                onOtp={(email) => {
                  setFormError("");
                  setNotice("");
                  setMode({ step: "otp", stage: "request", email });
                }}
                notice={notice}
                formError={formError}
                setFormError={setFormError}
              />
            </>
          ) : null}
          <p className="text-sm text-muted">
            New here?{" "}
            <Link
              href="/sign-up"
              className="font-medium text-accent underline underline-offset-4 hover:text-accent-hover"
            >
              Create an account
            </Link>
          </p>
        </div>
      ) : null}

      {mode.step === "otp" ? (
        <OtpLogin
          mode={mode}
          setMode={setMode}
          formError={formError}
          setFormError={setFormError}
          onDone={done}
        />
      ) : null}

      {mode.step === "totp" ? (
        <TotpStep
          email={mode.email}
          formError={formError}
          setFormError={setFormError}
          onDone={done}
        />
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------- credentials form */

function SignInCredentialsForm({
  onDone,
  onTwoFactor,
  onOtp,
  notice,
  formError,
  setFormError,
}: {
  onDone: () => void;
  onTwoFactor: (email: string) => void;
  onOtp: (email: string) => void;
  notice: string;
  formError: string;
  setFormError: (value: string) => void;
}) {
  const form = useForm<SignInEmailValues>({
    resolver: zodResolver(signInEmailSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit(async (values) => {
        setFormError("");
        try {
          const outcome = await signInEmail(values);
          if (outcome.status === "two-factor-required") onTwoFactor(values.email);
          else onDone();
        } catch (e) {
          setFormError(
            e instanceof EmailAuthError
              ? authFailureCopy(e.reason, e.retryAfterSeconds)
              : "Sign-in failed. Please retry.",
          );
        }
      })}
    >
      {notice ? (
        <p role="status" className="text-xs leading-relaxed text-positive">
          {notice}
        </p>
      ) : null}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="signin-email">Email</Label>
        <Input
          id="signin-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...form.register("email")}
        />
        {form.formState.errors.email ? (
          <p className="text-xs text-danger">{form.formState.errors.email.message}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <Label htmlFor="signin-password">Password</Label>
          <button
            type="button"
            className="text-xs font-medium text-muted underline underline-offset-4 transition-colors hover:text-ink"
            onClick={() => onOtp(form.getValues("email"))}
          >
            Email a code instead
          </button>
        </div>
        <Input
          id="signin-password"
          type="password"
          autoComplete="current-password"
          {...form.register("password")}
        />
        {form.formState.errors.password ? (
          <p className="text-xs text-danger">{form.formState.errors.password.message}</p>
        ) : null}
      </div>
      <FormError message={formError} />
      <Button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="h-11 w-full justify-center"
      >
        {form.formState.isSubmitting ? (
          <>
            <Loader2 size={14} className="animate-spin" aria-hidden /> Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </Button>
      <button
        type="button"
        className="text-left text-xs font-medium text-muted underline underline-offset-4 transition-colors hover:text-ink"
        onClick={() => onForgot(form.getValues("email"))}
      >
        Forgot password?
      </button>
    </form>
  );
}

function onForgot(email: string) {
  // Hand the typed email to the forgot-password page so the reader doesn't
  // retype it; the page reads ?email= once on mount.
  const params = new URLSearchParams();
  if (email) params.set("email", email);
  window.location.assign(`/forgot-password${params.size ? `?${params}` : ""}`);
}

/* ------------------------------------------------------------- OTP login */

function OtpLogin({
  mode,
  setMode,
  formError,
  setFormError,
  onDone,
}: {
  mode: Extract<SignInMode, { step: "otp" }>;
  setMode: (mode: SignInMode) => void;
  formError: string;
  setFormError: (value: string) => void;
  onDone: () => void;
}) {
  const [error, setError] = useState("");
  const requestForm = useForm<OtpRequestValues>({
    resolver: zodResolver(otpRequestSchema),
    defaultValues: { email: mode.email },
  });
  const codeForm = useForm<{ code: string }>({
    resolver: zodResolver(totpVerifySchema),
    defaultValues: { code: "" },
  });

  if (mode.stage === "request") {
    return (
      <div className="flex flex-col gap-5">
        <header className="flex flex-col gap-2">
          <h1 className="font-serif text-[1.75rem] font-medium leading-tight tracking-[-0.02em] text-ink">
            Sign in with a code
          </h1>
          <p className="text-sm leading-relaxed text-muted">
            We email a 6-digit code — no password needed.
          </p>
        </header>
        <form
          className="flex flex-col gap-4"
          onSubmit={requestForm.handleSubmit(async (values) => {
            setError("");
            try {
              await sendSignInOtp(values.email);
              setFormError("");
              setMode({ step: "otp", stage: "verify", email: values.email });
            } catch (e) {
              setError(
                e instanceof EmailAuthError
                  ? authFailureCopy(e.reason, e.retryAfterSeconds)
                  : "Could not send the code.",
              );
            }
          })}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="otp-email">Email</Label>
            <Input
              id="otp-email"
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
          <FormError message={error} />
          <FormError message={formError} />
          <Button
            type="submit"
            disabled={requestForm.formState.isSubmitting}
            className="h-11 w-full justify-center"
          >
            {requestForm.formState.isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" aria-hidden /> Sending…
              </>
            ) : (
              "Email me the code"
            )}
          </Button>
          <Link
            href="/sign-in"
            className="text-xs font-medium text-muted underline underline-offset-4 transition-colors hover:text-ink"
          >
            Back to sign in
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <h1 className="font-serif text-[1.75rem] font-medium leading-tight tracking-[-0.02em] text-ink">
          Check your email
        </h1>
        <p className="text-sm leading-relaxed text-muted">
          A 6-digit code is on its way to {mode.email}.
        </p>
      </header>
      <form
        className="flex flex-col gap-4"
        onSubmit={codeForm.handleSubmit(async (values) => {
          setError("");
          try {
            await signInWithOtp({ email: mode.email, code: values.code });
            onDone();
          } catch (e) {
            setError(
              e instanceof EmailAuthError
                ? authFailureCopy(e.reason, e.retryAfterSeconds)
                : "Could not verify the code.",
            );
          }
        })}
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="otp-code">Code</Label>
          <CodeInput autoFocus {...codeForm.register("code")} />
          {codeForm.formState.errors.code ? (
            <p className="text-xs text-danger">{codeForm.formState.errors.code.message}</p>
          ) : null}
        </div>
        <FormError message={error} />
        <FormError message={formError} />
        <Button
          type="submit"
          disabled={codeForm.formState.isSubmitting}
          className="h-11 w-full justify-center"
        >
          {codeForm.formState.isSubmitting ? (
            <>
              <Loader2 size={14} className="animate-spin" aria-hidden /> Verifying…
            </>
          ) : (
            "Verify and sign in"
          )}
        </Button>
        <button
          type="button"
          className="text-left text-xs font-medium text-muted underline underline-offset-4 transition-colors hover:text-ink"
          onClick={() => setMode({ step: "otp", stage: "request", email: mode.email })}
        >
          Use a different email
        </button>
        <Link
          href="/sign-in"
          className="text-xs font-medium text-muted underline underline-offset-4 transition-colors hover:text-ink"
        >
          Back to sign in
        </Link>
      </form>
    </div>
  );
}

/* ---------------------------------------------------------------- TOTP step */

function TotpStep({
  email,
  formError,
  setFormError,
  onDone,
}: {
  email: string;
  formError: string;
  setFormError: (value: string) => void;
  onDone: () => void;
}) {
  const [error, setError] = useState("");
  const form = useForm<{ code: string }>({
    resolver: zodResolver(totpVerifySchema),
    defaultValues: { code: "" },
  });

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <h1 className="font-serif text-[1.75rem] font-medium leading-tight tracking-[-0.02em] text-ink">
          Two-factor check
        </h1>
        <p className="text-sm leading-relaxed text-muted">
          Enter the 6-digit code from your authenticator app
          {email ? ` for ${email}` : ""}.
        </p>
      </header>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(async (values) => {
          setError("");
          try {
            await verifyTotpSignIn(values.code);
            onDone();
          } catch (e) {
            setError(
              e instanceof EmailAuthError
                ? authFailureCopy(e.reason, e.retryAfterSeconds)
                : "Could not verify the code.",
            );
            setFormError("");
          }
        })}
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="totp-code">Authenticator code</Label>
          <CodeInput autoFocus {...form.register("code")} />
          {form.formState.errors.code ? (
            <p className="text-xs text-danger">{form.formState.errors.code.message}</p>
          ) : null}
        </div>
        <FormError message={error} />
        <FormError message={formError} />
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="h-11 w-full justify-center"
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 size={14} className="animate-spin" aria-hidden /> Verifying…
            </>
          ) : (
            "Verify and sign in"
          )}
        </Button>
      </form>
    </div>
  );
}
