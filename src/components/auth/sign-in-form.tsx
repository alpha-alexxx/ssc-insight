"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
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
import { Button } from "@/components/button";
import { CodeInput } from "@/components/code-input";
import { Input } from "@/components/input";
import { PasswordInput } from "@/components/password-input";
import { AuthFieldError } from "@/components/auth/auth-field-error";
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

/** The divider between the provider and the email path, composed from tokens. */
function OrWithEmailSeparator() {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        or with email
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

/**
 * The sign-in page's working part, rebuilt on the Hairline controls: Google
 * (the brand mark carried in the shared Button), email + password (the
 * see-password affordance comes with the Hairline password input), the
 * emailed one-time-code login and the TOTP second step (the boxed
 * code input). Success replaces history with `/dashboard?welcome=1` — the
 * workspace toasts once off that param and strips it, so the sign-in page
 * never lingers in history.
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
                <h1 className="font-serif text-[1.75rem] font-medium leading-tight tracking-[-0.02em] text-foreground">
                  Welcome back
                </h1>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Sign in to your private mock tracker.
                </p>
              </header>

              <div className="flex flex-col gap-5">
                <GoogleSignInButton
                  enabled={googleEnabled}
                  label="Sign in with Google"
                  className="w-full justify-center"
                />

                {emailEnabled ? (
                  <>
                    <OrWithEmailSeparator />
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

                <p className="text-center text-[13px] leading-relaxed text-muted-foreground">
                  New here?{" "}
                  <Link
                    href="/sign-up"
                    className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                  >
                    Create an account
                  </Link>
                </p>
              </div>
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
        <p role="status" className="text-xs leading-relaxed text-success">
          {notice}
        </p>
      ) : null}
      <Input
        id="signin-email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        label="Email"
        error={form.formState.errors.email?.message}
        {...form.register("email")}
      />
      {/* The password label row carries the emailed-code affordance on its
          right end (the Input has no aside slot, so the row is composed). */}
      <div className="flex items-baseline justify-between gap-3 px-3 pb-1.5">
        <label htmlFor="signin-password" className="text-[13px] font-medium text-foreground">
          Password
        </label>
        <button
          type="button"
          className="cursor-pointer text-[12px] font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
          onClick={() => onOtp(form.getValues("email"))}
        >
          Email a code instead
        </button>
      </div>
      <PasswordInput
        id="signin-password"
        autoComplete="current-password"
        error={form.formState.errors.password?.message}
        {...form.register("password")}
      />
      <AuthFieldError>{formError}</AuthFieldError>
      <Button
        type="submit"
        size="lg"
        disabled={form.formState.isSubmitting}
        loading={form.formState.isSubmitting}
        statusLabels={{ pending: "Signing in…" }}
        className="w-full justify-center"
      >
        Sign in
      </Button>
      <button
        type="button"
        className="text-left text-xs font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
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
          <h1 className="font-serif text-[1.75rem] font-medium leading-tight tracking-[-0.02em] text-foreground">
            Sign in with a code
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
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
          <Input
            id="otp-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            label="Email"
            autoFocus
            error={requestForm.formState.errors.email?.message}
            {...requestForm.register("email")}
          />
          <AuthFieldError>{error}</AuthFieldError>
          <AuthFieldError>{formError}</AuthFieldError>
          <Button
            type="submit"
            size="lg"
            disabled={requestForm.formState.isSubmitting}
            loading={requestForm.formState.isSubmitting}
            statusLabels={{ pending: "Sending…" }}
            className="w-full justify-center"
          >
            Email me the code
          </Button>
          <Link
            href="/sign-in"
            className="text-xs font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
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
        <h1 className="font-serif text-[1.75rem] font-medium leading-tight tracking-[-0.02em] text-foreground">
          Check your email
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
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
        <CodeInput
          value={code}
          onValueChange={(next) => {
            setCode(next);
            codeForm.setValue("code", next, { shouldValidate: next.length === 6 });
          }}
          label="Sign-in code"
          autoFocus
        />
        <AuthFieldError>{codeForm.formState.errors.code?.message}</AuthFieldError>
        <AuthFieldError>{error}</AuthFieldError>
        <AuthFieldError>{formError}</AuthFieldError>
        <Button
          type="submit"
          size="lg"
          disabled={codeForm.formState.isSubmitting}
          loading={codeForm.formState.isSubmitting}
          statusLabels={{ pending: "Verifying…" }}
          className="w-full justify-center"
        >
          Verify and sign in
        </Button>
        <button
          type="button"
          className="text-left text-xs font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
          onClick={() => setMode({ step: "otp", stage: "request", email: mode.email })}
        >
          Use a different email
        </button>
        <Link
          href="/sign-in"
          className="text-xs font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
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
  const form = useForm<{ code: string }>({
    resolver: zodResolver(totpVerifySchema),
    defaultValues: { code: "" },
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-serif text-[1.75rem] font-medium leading-tight tracking-[-0.02em] text-foreground">
          Two-factor check
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
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
        <CodeInput
          value={code}
          onValueChange={(next) => {
            setCode(next);
            form.setValue("code", next, { shouldValidate: next.length === 6 });
          }}
          label="Authenticator code"
          autoFocus
        />
        <AuthFieldError>{form.formState.errors.code?.message}</AuthFieldError>
        <AuthFieldError>{error}</AuthFieldError>
        <AuthFieldError>{formError}</AuthFieldError>
        <Button
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting}
          loading={form.formState.isSubmitting}
          statusLabels={{ pending: "Verifying…" }}
          className="w-full justify-center"
        >
          Verify and sign in
        </Button>
      </form>
    </div>
  );
}
