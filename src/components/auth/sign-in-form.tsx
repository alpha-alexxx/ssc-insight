"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
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
  type OtpRequestValues,
  type SignInEmailValues,
} from "@/lib/auth/email-schemas";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { PasswordInput } from "@/components/password-input";
import { AuthFieldError } from "@/components/auth/auth-field-error";
import { OtpRail, type OtpStatus } from "@/components/auth/otp-rail";
import { SuccessPanel } from "@/components/auth/success-panel";
import { Afterglow, type AfterglowHandle } from "@/components/afterglow";
import { useAfterglowColors } from "@/components/auth/afterglow-light";
import { withAuthTimeout } from "@/components/auth/with-auth-timeout";
import { EASE, DUR } from "@/lib/motion";

/**
 * How long the success panel holds before the dashboard loads.
 *
 * It exists because the sign-in moment deserves to be seen: Afterglow's front
 * takes ~1.1s to cross the card, and redirecting on the same frame would throw
 * the light away. Reduced motion skips the wait entirely (Afterglow becomes an
 * instant swap), so no reader is ever delayed by an animation they turned off.
 */
const SUCCESS_HOLD_MS = 1100;

type SignInStep =
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

/** The task heading — one h1 per step, since only one step is ever mounted. */
function StepHeading({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-2">
      <h1 className="font-serif text-[1.75rem] font-medium leading-tight tracking-[-0.02em] text-foreground">
        {title}
      </h1>
      <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>
    </header>
  );
}

/**
 * The sign-in card's working part.
 *
 * Google, email + password, the emailed one-time code and the TOTP second step
 * all live on the adapted `auth-tilt-spotlight` surface; the two code steps use
 * the adapted `auth-flow-otp-verify` rail, which checks itself the moment the
 * sixth digit lands. Success plays Hairline's Afterglow over the card and then
 * replaces history with `/dashboard?welcome=1` — the workspace toasts once off
 * that param and strips it, so the sign-in page never lingers in history.
 *
 * Failure copy is the wire layer's (`authFailureCopy`); this form never invents
 * a reason or a countdown. A rate limit seeds the resend clock with the
 * server's own `Retry-After`.
 */
export function SignInForm({
  googleEnabled,
  emailEnabled,
}: {
  googleEnabled: boolean;
  emailEnabled: boolean;
}) {
  const router = useRouter();
  const reduced = useReducedMotion();
  // The Afterglow handle is state, not a ref: the submit handlers are
  // closures React compiles, and reading a ref inside one is exactly what
  // the refs rule forbids. A callback ref keeps the handle in render state.
  const [glow, setGlow] = useState<AfterglowHandle | null>(null);
  const colors = useAfterglowColors();
  const [step, setStep] = useState<SignInStep>({ step: "credentials" });
  const [done, setDone] = useState<{ email: string } | null>(null);
  const [code, setCode] = useState("");
  const [codeStatus, setCodeStatus] = useState<OtpStatus>("idle");
  const [codeError, setCodeError] = useState("");
  const [codeHint, setCodeHint] = useState<React.ReactNode>(undefined);

  // One redirect, scheduled off the success state — never inline after `await`.
  useEffect(() => {
    if (!done) return;
    const timer = window.setTimeout(
      () => router.replace("/dashboard?welcome=1"),
      reduced ? 0 : SUCCESS_HOLD_MS,
    );
    return () => window.clearTimeout(timer);
  }, [done, reduced, router]);

  function succeed(email: string) {
    const update = () => setDone({ email });
    const handle = glow;
    if (!handle) {
      update();
      return;
    }
    void Promise.resolve(handle.play(update)).catch(update);
  }

  function leaveCodeStep() {
    setCode("");
    setCodeStatus("idle");
    setCodeError("");
    setCodeHint(undefined);
  }

  const stepKey =
    done
      ? "done"
      : step.step === "credentials"
        ? "credentials"
        : step.step === "totp"
          ? "totp"
          : `otp-${step.stage}`;

  return (
    <Afterglow
      ref={setGlow}
      colors={colors}
      className="flex w-full flex-1 flex-col"
    >
      <div className="flex w-full flex-1 flex-col justify-center gap-6 rounded-[16px] p-5 sm:p-9">
        {done ? (
          <SuccessPanel
            title="You're in"
            description={
              <>
                Signed in as {done.email}. Opening your dashboard…
              </>
            }
            footnote="Keep this tab open — a slow connection at sign-in is not a failure."
          />
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <StepPanel key={stepKey}>
              {step.step === "credentials" ? (
                <div className="flex flex-col gap-6">
                  <StepHeading title="Welcome back">
                    Sign in to your private mock tracker.
                  </StepHeading>

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
                          onDone={succeed}
                          onTwoFactor={(email) => {
                            leaveCodeStep();
                            setStep({ step: "totp", email });
                          }}
                          onOtp={(email) => {
                            leaveCodeStep();
                            setStep({ step: "otp", stage: "request", email });
                          }}
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

              {step.step === "otp" ? (
                <OtpStep
                  mode={step}
                  code={code}
                  setCode={setCode}
                  status={codeStatus}
                  error={codeError}
                  hint={codeHint}
                  onStatus={setCodeStatus}
                  onError={(message) => setCodeError(message)}
                  onHint={setCodeHint}
                  onDone={succeed}
                  onRequested={(email) =>
                    setStep({ step: "otp", stage: "verify", email })
                  }
                  onRestart={() => {
                    leaveCodeStep();
                    setStep({
                      step: "otp",
                      stage: "request",
                      email: step.email,
                    });
                  }}
                  onBackToCredentials={() => {
                    leaveCodeStep();
                    setStep({ step: "credentials" });
                  }}
                />
              ) : null}

              {step.step === "totp" ? (
                <TotpStep
                  email={step.email}
                  code={code}
                  setCode={setCode}
                  status={codeStatus}
                  error={codeError}
                  onStatus={setCodeStatus}
                  onError={(message) => setCodeError(message)}
                  onDone={succeed}
                  onBackToCredentials={() => {
                    leaveCodeStep();
                    setStep({ step: "credentials" });
                  }}
                />
              ) : null}
            </StepPanel>
          </AnimatePresence>
        )}
      </div>
    </Afterglow>
  );
}

/* ------------------------------------------------------- credentials form */

function SignInCredentialsForm({
  onDone,
  onTwoFactor,
  onOtp,
}: {
  onDone: (email: string) => void;
  onTwoFactor: (email: string) => void;
  onOtp: (email: string) => void;
}) {
  const [formError, setFormError] = useState("");
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
          const outcome = await withAuthTimeout(signInEmail(values));
          if (outcome.status === "two-factor-required") onTwoFactor(values.email);
          else onDone(values.email);
        } catch (error) {
          setFormError(
            error instanceof EmailAuthError
              ? authFailureCopy(error.reason, error.retryAfterSeconds)
              : "Sign-in failed. Please retry.",
          );
        }
      })}
    >
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
        <label
          htmlFor="signin-password"
          className="text-[13px] font-medium text-foreground"
        >
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
      <Link
        href={forgotHref(form.getValues("email"))}
        className="text-left text-xs font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
      >
        Forgot password?
      </Link>
    </form>
  );
}

/** Hand the typed email to the reset page so the reader doesn't retype it. */
function forgotHref(email: string) {
  const params = new URLSearchParams();
  if (email) params.set("email", email);
  return `/forgot-password${params.size ? `?${params}` : ""}`;
}

/* ------------------------------------------------------------- OTP login */

function OtpStep({
  mode,
  code,
  setCode,
  status,
  error,
  hint,
  onStatus,
  onError,
  onHint,
  onDone,
  onRequested,
  onRestart,
  onBackToCredentials,
}: {
  mode: Extract<SignInStep, { step: "otp" }>;
  code: string;
  setCode: (code: string) => void;
  status: OtpStatus;
  error: string;
  hint: React.ReactNode;
  onStatus: (status: OtpStatus) => void;
  onError: (message: string) => void;
  onHint: (hint: React.ReactNode) => void;
  onDone: (email: string) => void;
  onRequested: (email: string) => void;
  onRestart: () => void;
  onBackToCredentials: () => void;
}) {
  const requestForm = useForm<OtpRequestValues>({
    resolver: zodResolver(otpRequestSchema),
    defaultValues: { email: mode.email },
  });
  if (mode.stage === "request") {
    return (
      <div className="flex flex-col gap-6">
        <StepHeading title="Sign in with a code">
          We email a 6-digit code — no password needed.
        </StepHeading>
        <form
          className="flex flex-col gap-4"
          onSubmit={requestForm.handleSubmit(async (values) => {
            onError("");
            onStatus("idle");
            try {
              await withAuthTimeout(sendSignInOtp(values.email));
              onRequested(values.email);
            } catch (caught) {
              onError(
                caught instanceof EmailAuthError
                  ? authFailureCopy(caught.reason, caught.retryAfterSeconds)
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
          <button
            type="button"
            onClick={onBackToCredentials}
            className="text-left text-xs font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
          >
            Back to sign in
          </button>
        </form>
      </div>
    );
  }

  async function verify(next: string) {
    if (status === "verifying" || next.length !== 6) return;
    onStatus("verifying");
    onError("");
    try {
      await withAuthTimeout(signInWithOtp({ email: mode.email, code: next }));
      onStatus("success");
      onDone(mode.email);
    } catch (caught) {
      onStatus("error");
      onError(
        caught instanceof EmailAuthError
          ? authFailureCopy(caught.reason, caught.retryAfterSeconds)
          : "Could not verify the code.",
      );
    }
  }

  async function resend() {
    await withAuthTimeout(sendSignInOtp(mode.email));
    onHint("A new code is on its way.");
    onError("");
  }

  return (
    <div className="flex flex-col gap-6">
      <StepHeading title="Check your email">
        A 6-digit code is on its way to{" "}
        <span className="break-words font-medium text-foreground">
          {mode.email}
        </span>
        .
      </StepHeading>

      <OtpRail
        channel="email"
        value={code}
        onValueChange={(next) => {
          setCode(next);
          if (status === "error") onStatus("idle");
        }}
        onComplete={verify}
        status={status}
        error={error}
        hint={hint}
        resend={{ seconds: 30, onResend: resend }}
        onBack={onRestart}
        backLabel="Use a different email"
        autoFocus
      />

      <Button
        type="button"
        size="lg"
        disabled={code.length !== 6 || status === "verifying"}
        loading={status === "verifying"}
        statusLabels={{ pending: "Verifying…" }}
        onClick={() => void verify(code)}
        className="w-full justify-center"
      >
        Verify and sign in
      </Button>
      {/* Kept as an explicit control for keyboard users; the rail also
          checks itself the moment the sixth digit lands. */}
      <span className="sr-only" aria-live="polite">
        {status === "verifying" ? "Verifying the code" : ""}
      </span>
      <button
        type="button"
        onClick={onBackToCredentials}
        className="text-left text-xs font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
      >
        Back to sign in
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------- TOTP step */

function TotpStep({
  email,
  code,
  setCode,
  status,
  error,
  onStatus,
  onError,
  onDone,
  onBackToCredentials,
}: {
  email: string;
  code: string;
  setCode: (code: string) => void;
  status: OtpStatus;
  error: string;
  onStatus: (status: OtpStatus) => void;
  onError: (message: string) => void;
  onDone: (email: string) => void;
  onBackToCredentials: () => void;
}) {
  async function verify(next: string) {
    if (status === "verifying" || next.length !== 6) return;
    onStatus("verifying");
    onError("");
    try {
      await withAuthTimeout(verifyTotpSignIn(next));
      onStatus("success");
      onDone(email);
    } catch (caught) {
      onStatus("error");
      onError(
        caught instanceof EmailAuthError
          ? authFailureCopy(caught.reason, caught.retryAfterSeconds)
          : "Could not verify the code.",
      );
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <StepHeading title="Two-factor check">
        Enter the 6-digit code from your authenticator app
        {email ? (
          <>
            {" "}
            for{" "}
            <span className="break-words font-medium text-foreground">
              {email}
            </span>
          </>
        ) : null}
        .
      </StepHeading>

      <OtpRail
        channel="authenticator"
        value={code}
        onValueChange={(next) => {
          setCode(next);
          if (status === "error") onStatus("idle");
        }}
        onComplete={verify}
        status={status}
        error={error}
        resend={null}
        onBack={onBackToCredentials}
        backLabel="Use password instead"
        autoFocus
      />

      <Button
        type="button"
        size="lg"
        disabled={code.length !== 6 || status === "verifying"}
        loading={status === "verifying"}
        statusLabels={{ pending: "Verifying…" }}
        onClick={() => void verify(code)}
        className="w-full justify-center"
      >
        Verify and sign in
      </Button>
      <button
        type="button"
        onClick={onBackToCredentials}
        className="text-left text-xs font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
      >
        Back to sign in
      </button>
    </div>
  );
}
