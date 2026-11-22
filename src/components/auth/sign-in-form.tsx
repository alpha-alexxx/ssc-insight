"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import { Loader2 } from "lucide-react";
import {
  authFailureCopy,
  EmailAuthError,
  sendSignInOtp,
  signInEmail,
  signInWithOtp,
  verifyTotpSignIn,
} from "@/lib/auth/email-client";
import {
  otpRequestSchema,
  signInEmailSchema,
  totpVerifySchema,
  type OtpRequestValues,
  type SignInEmailValues,
} from "@/lib/auth/email-schemas";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { OtpInput } from "@/components/auth/otp-input";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { EASE, DUR } from "@/lib/motion";

type SignInMode =
  | { step: "credentials" }
  | { step: "otp"; stage: "request" | "verify"; email: string }
  | { step: "totp"; email: string };

/** A one-shot rise used by every step swap — the house 4px/enter fade. */
function StepPanel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: DUR.enter, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/**
 * The sign-in page's working part, rebuilt on the login-04 grammar: Google,
 * email + password (with the see-password affordance), the emailed
 * one-time-code login (boxed input), and the TOTP second step (boxed input).
 * Success replaces history with `/dashboard?welcome=1` — the workspace
 * toasts once off that param and strips it, so the sign-in page never
 * lingers in history.
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

  const stepKey =
    mode.step === "credentials"
      ? "credentials"
      : mode.step === "totp"
        ? "totp"
        : `otp-${mode.stage}`;

  return (
    <div className="flex flex-col gap-6">
      <AnimatePresence mode="wait" initial={false}>
        <StepPanel key={stepKey}>
          {mode.step === "credentials" ? (
            <div className="flex flex-col gap-6">
              <header className="flex flex-col gap-2">
                <h1 className="font-serif text-[1.75rem] font-medium leading-tight tracking-[-0.02em] text-ink">
                  Welcome back
                </h1>
                <p className="text-sm leading-relaxed text-muted">
                  Sign in to your private mock tracker.
                </p>
              </header>

              <FieldGroup className="gap-5">
                <Field>
                  <GoogleSignInButton
                    enabled={googleEnabled}
                    label="Sign in with Google"
                    className="w-full justify-center"
                  />
                </Field>

                {emailEnabled ? (
                  <>
                    <FieldSeparator>or with email</FieldSeparator>
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

                <FieldDescription className="text-center">
                  New here?{" "}
                  <Link
                    href="/sign-up"
                    className="font-medium text-accent underline underline-offset-4 hover:text-accent-hover"
                  >
                    Create an account
                  </Link>
                </FieldDescription>
              </FieldGroup>
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
        </StepPanel>
      </AnimatePresence>
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
      <Field data-invalid={!!form.formState.errors.email || undefined}>
        <FieldLabel htmlFor="signin-email">Email</FieldLabel>
        <Input
          id="signin-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={!!form.formState.errors.email || undefined}
          {...form.register("email")}
        />
        {form.formState.errors.email ? (
          <FieldError>{form.formState.errors.email.message}</FieldError>
        ) : null}
      </Field>
      <Field data-invalid={!!form.formState.errors.password || undefined}>
        <div className="flex items-center justify-between gap-2">
          <FieldLabel htmlFor="signin-password">Password</FieldLabel>
          <button
            type="button"
            className="text-xs font-medium text-muted underline underline-offset-4 transition-colors hover:text-ink"
            onClick={() => onOtp(form.getValues("email"))}
          >
            Email a code instead
          </button>
        </div>
        <PasswordInput
          id="signin-password"
          autoComplete="current-password"
          aria-invalid={!!form.formState.errors.password || undefined}
          {...form.register("password")}
        />
        {form.formState.errors.password ? (
          <FieldError>{form.formState.errors.password.message}</FieldError>
        ) : null}
      </Field>
      <FieldError>{formError}</FieldError>
      <Button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="w-full justify-center"
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
  const [code, setCode] = useState("");
  const [codeInvalid, setCodeInvalid] = useState(false);
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
      <div className="flex flex-col gap-6">
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
          <Field data-invalid={!!requestForm.formState.errors.email || undefined}>
            <FieldLabel htmlFor="otp-email">Email</FieldLabel>
            <Input
              id="otp-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              autoFocus
              aria-invalid={!!requestForm.formState.errors.email || undefined}
              {...requestForm.register("email")}
            />
            {requestForm.formState.errors.email ? (
              <FieldError>{requestForm.formState.errors.email.message}</FieldError>
            ) : null}
          </Field>
          <FieldError>{error}</FieldError>
          <FieldError>{formError}</FieldError>
          <Button
            type="submit"
            disabled={requestForm.formState.isSubmitting}
            className="w-full justify-center"
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
    <div className="flex flex-col gap-6">
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
            setCodeInvalid(true);
            setError(
              e instanceof EmailAuthError
                ? authFailureCopy(e.reason, e.retryAfterSeconds)
                : "Could not verify the code.",
            );
          }
        })}
      >
        <Field data-invalid={codeInvalid || undefined}>
          <FieldLabel htmlFor="otp-code">Code</FieldLabel>
          <OtpInput
            value={code}
            onChange={(next) => {
              setCodeInvalid(false);
              setCode(next);
              codeForm.setValue("code", next, { shouldValidate: next.length === 6 });
            }}
            label="Sign-in code"
            invalid={codeInvalid}
            autoFocus
          />
          {codeForm.formState.errors.code ? (
            <FieldError>{codeForm.formState.errors.code.message}</FieldError>
          ) : null}
        </Field>
        <FieldError>{error}</FieldError>
        <FieldError>{formError}</FieldError>
        <Button
          type="submit"
          disabled={codeForm.formState.isSubmitting}
          className="w-full justify-center"
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
  const [code, setCode] = useState("");
  const [codeInvalid, setCodeInvalid] = useState(false);
  const form = useForm<{ code: string }>({
    resolver: zodResolver(totpVerifySchema),
    defaultValues: { code: "" },
  });

  return (
    <div className="flex flex-col gap-6">
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
            setCodeInvalid(true);
            setError(
              e instanceof EmailAuthError
                ? authFailureCopy(e.reason, e.retryAfterSeconds)
                : "Could not verify the code.",
            );
            setFormError("");
          }
        })}
      >
        <Field data-invalid={codeInvalid || undefined}>
          <FieldLabel htmlFor="totp-code">Authenticator code</FieldLabel>
          <OtpInput
            value={code}
            onChange={(next) => {
              setCodeInvalid(false);
              setCode(next);
              form.setValue("code", next, { shouldValidate: next.length === 6 });
            }}
            label="Authenticator code"
            invalid={codeInvalid}
            autoFocus
          />
          {form.formState.errors.code ? (
            <FieldError>{form.formState.errors.code.message}</FieldError>
          ) : null}
        </Field>
        <FieldError>{error}</FieldError>
        <FieldError>{formError}</FieldError>
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full justify-center"
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
