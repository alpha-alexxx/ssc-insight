"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import {
  authFailureCopy,
  EmailAuthError,
  requestPasswordResetOtp,
  resetPasswordWithOtp,
} from "@/lib/auth/email-client";
import {
  otpRequestSchema,
  type OtpRequestValues,
} from "@/lib/auth/email-schemas";
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

type Stage = "request" | "code" | "password" | "done";

/** Six digits, and the schema's matching rule on the confirmation. */
const MIN_PASSWORD = 8;

/** A one-shot rise used by every stage swap — the house 4px/enter fade. */
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
 * The reset card's working part, one thing at a time:
 * request → code → new password → done.
 *
 * The code step is the adapted `auth-flow-otp-verify` rail in *capture* mode:
 * completing it moves the reader on, but nothing claims the code was verified,
 * because this provider only checks it when the new password arrives in the
 * same request. A rejected code returns to that step with the wire's own copy.
 *
 * The reset endpoint creates a credential account when none exists and marks
 * the email verified, so this is also how a Google-only account sets a first
 * password from the outside. Enumeration-safe throughout: the service answers
 * success even for an unknown email, so the copy never confirms an account
 * exists.
 *
 * Success is the one flow that does not redirect — the panel stays with the
 * sign-in link, and Afterglow lights the swap.
 */
export function ForgotForm() {
  const searchParams = useSearchParams();
  // The Afterglow handle is state, not a ref: the submit handlers are
  // closures React compiles, and reading a ref inside one is exactly what
  // the refs rule forbids. A callback ref keeps the handle in render state.
  const [glow, setGlow] = useState<AfterglowHandle | null>(null);
  const colors = useAfterglowColors();
  const [stage, setStage] = useState<Stage>("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeStatus, setCodeStatus] = useState<OtpStatus>("idle");
  const [codeError, setCodeError] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const requestForm = useForm<OtpRequestValues>({
    resolver: zodResolver(otpRequestSchema),
    defaultValues: { email: searchParams.get("email") ?? "" },
  });
  const passwordForm = useForm<{ newPassword: string; confirmPassword: string }>({
    defaultValues: { newPassword: "", confirmPassword: "" },
    mode: "onTouched",
  });

  function celebrate() {
    const update = () => setStage("done");
    const handle = glow;
    if (!handle) {
      update();
      return;
    }
    void Promise.resolve(handle.play(update)).catch(update);
  }

  /** Back to the address step, from either the code or the password screen. */
  const onBack = () => {
    setError("");
    setCodeError("");
    setCode("");
    setCodeStatus("idle");
    passwordForm.reset();
    setStage("request");
  };

  async function resendCode() {
    await withAuthTimeout(requestPasswordResetOtp(email));
  }

  return (
    <Afterglow
      ref={setGlow}
      colors={colors}
      className="flex w-full flex-1 flex-col"
    >
      <div className="flex w-full flex-1 flex-col justify-center gap-6 rounded-[16px] p-5 sm:p-9">
        <AnimatePresence mode="wait" initial={false}>
          <StepPanel key={stage}>
            {stage === "request" ? (
              <div className="flex flex-col gap-6">
                <header className="flex flex-col gap-2">
                  <h1 className="font-serif text-[1.75rem] font-medium leading-tight tracking-[-0.02em] text-foreground">
                    Reset your password
                  </h1>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    We email a 6-digit code to confirm it&apos;s you. If the
                    email has an account, the code is on its way.
                  </p>
                </header>
                <form
                  className="flex flex-col gap-4"
                  onSubmit={requestForm.handleSubmit(async (values) => {
                    setError("");
                    setBusy(true);
                    try {
                      await withAuthTimeout(requestPasswordResetOtp(values.email));
                      setEmail(values.email);
                      setCode("");
                      setCodeStatus("idle");
                      setCodeError("");
                      setStage("code");
                    } catch (caught) {
                      setError(
                        caught instanceof EmailAuthError
                          ? authFailureCopy(caught.reason, caught.retryAfterSeconds)
                          : "Could not send the code.",
                      );
                    } finally {
                      setBusy(false);
                    }
                  })}
                >
                  <Input
                    id="forgot-email"
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
                    disabled={busy}
                    loading={busy}
                    statusLabels={{ pending: "Sending…" }}
                    className="w-full justify-center"
                  >
                    Email me a reset code
                  </Button>
                  <p className="text-[13px] leading-relaxed text-muted-foreground">
                    Remembered it?{" "}
                    <Link
                      href="/sign-in"
                      className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                    >
                      Sign in
                    </Link>
                  </p>
                </form>
              </div>
            ) : null}

            {stage === "code" ? (
              <div className="flex flex-col gap-6">
                <header className="flex flex-col gap-2">
                  <h1 className="font-serif text-[1.75rem] font-medium leading-tight tracking-[-0.02em] text-foreground">
                    Check your email
                  </h1>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    A reset code went to{" "}
                    <span className="break-words font-medium text-foreground">
                      {email}
                    </span>
                    . It sets a new password; on a Google-only account it sets
                    the first one.
                  </p>
                </header>

                <OtpRail
                  channel="email"
                  value={code}
                  onValueChange={(next) => {
                    setCode(next);
                    if (codeStatus === "error") {
                      setCodeStatus("idle");
                      setCodeError("");
                    }
                  }}
                  onComplete={() => {
                    // Capture only: the code is checked with the new password.
                    setCodeError("");
                    setCodeStatus("idle");
                    setStage("password");
                  }}
                  status={codeStatus}
                  error={codeError}
                  hint="The code is checked together with your new password on the next screen."
                  resend={{ seconds: 30, onResend: resendCode }}
                  onBack={onBack}
                  backLabel="Use a different email"
                  autoFocus
                />
                <AuthFieldError>{error}</AuthFieldError>
              </div>
            ) : null}

            {stage === "password" ? (
              <div className="flex flex-col gap-6">
                <header className="flex flex-col gap-2">
                  <h1 className="font-serif text-[1.75rem] font-medium leading-tight tracking-[-0.02em] text-foreground">
                    Set a new password
                  </h1>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Choose the password you&apos;ll sign in with. Everything
                    under your account stays exactly where it was.
                  </p>
                </header>

                <form
                  className="flex flex-col gap-4"
                  onSubmit={passwordForm.handleSubmit(async (values) => {
                    if (values.newPassword.length < MIN_PASSWORD) {
                      passwordForm.setError("newPassword", {
                        message: `Use at least ${MIN_PASSWORD} characters.`,
                      });
                      return;
                    }
                    if (values.newPassword !== values.confirmPassword) {
                      passwordForm.setError("confirmPassword", {
                        message: "The two passwords don't match.",
                      });
                      return;
                    }
                    setError("");
                    setBusy(true);
                    try {
                      await withAuthTimeout(
                        resetPasswordWithOtp({
                          email,
                          code,
                          password: values.newPassword,
                        }),
                      );
                      passwordForm.reset();
                      celebrate();
                    } catch (caught) {
                      const message =
                        caught instanceof EmailAuthError
                          ? authFailureCopy(
                              caught.reason,
                              caught.retryAfterSeconds,
                            )
                          : "Could not reset the password.";
                      if (
                        caught instanceof EmailAuthError &&
                        (caught.reason === "invalid-code" ||
                          caught.reason === "rate-limited")
                      ) {
                        // The code is the thing to fix: send them back to it
                        // with the rail already showing the wire's reason.
                        setCode("");
                        setCodeStatus(
                          caught.reason === "invalid-code" ? "error" : "idle",
                        );
                        setCodeError(message);
                        setStage("code");
                        return;
                      }
                      setError(message);
                    } finally {
                      setBusy(false);
                    }
                  })}
                >
                  <PasswordInput
                    id="forgot-new"
                    autoComplete="new-password"
                    label="New password"
                    autoFocus
                    hint="At least 8 characters."
                    error={passwordForm.formState.errors.newPassword?.message}
                    {...passwordForm.register("newPassword")}
                  />
                  <PasswordInput
                    id="forgot-confirm"
                    autoComplete="new-password"
                    label="Confirm new password"
                    error={passwordForm.formState.errors.confirmPassword?.message}
                    {...passwordForm.register("confirmPassword")}
                  />
                  <p className="text-[12.5px] leading-relaxed text-muted-foreground">
                    Using the code sent to{" "}
                    <span className="break-words font-medium text-foreground">
                      {email}
                    </span>
                    .{" "}
                    <button
                      type="button"
                      onClick={onBack}
                      className="cursor-pointer font-medium underline underline-offset-4 transition-colors hover:text-foreground"
                    >
                      Change code
                    </button>
                  </p>
                  <AuthFieldError>{error}</AuthFieldError>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={busy}
                    loading={busy}
                    statusLabels={{ pending: "Saving…" }}
                    className="w-full justify-center"
                  >
                    Set new password
                  </Button>
                </form>
              </div>
            ) : null}

            {stage === "done" ? (
              <SuccessPanel
                title="Password set"
                description={
                  <>
                    Your new password is active for{" "}
                    <span className="break-words">{email}</span>. Sign in with it
                    — and if this account had two-factor on, your authenticator
                    still works.
                  </>
                }
                action={
                  <Link href="/sign-in" className="w-full justify-center">
                    <span className="flex h-10 w-full items-center justify-center rounded-full bg-primary px-4 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                      Go to sign in
                    </span>
                  </Link>
                }
              />
            ) : null}
          </StepPanel>
        </AnimatePresence>
      </div>
    </Afterglow>
  );
}
