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
  otpResetSchema,
  type OtpRequestValues,
  type OtpResetValues,
} from "@/lib/auth/email-schemas";
import { Button } from "@/components/button";
import { CodeInput } from "@/components/code-input";
import { Input } from "@/components/input";
import { PasswordInput } from "@/components/password-input";
import { AuthFieldError } from "@/components/auth/auth-field-error";
import { EASE, DUR } from "@/lib/motion";

type Stage = "request" | "verify" | "done";

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
 * The forgot-password page's working part, rebuilt on the Hairline controls:
 * request a code, then set a new password against it (the boxed code input,
 * see-password fields). Enumeration-safe — the service answers success even
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
  const [code, setCode] = useState("");
  const requestForm = useForm<OtpRequestValues>({
    resolver: zodResolver(otpRequestSchema),
    defaultValues: { email: searchParams.get("email") ?? "" },
  });
  const resetForm = useForm<OtpResetValues>({
    resolver: zodResolver(otpResetSchema),
    defaultValues: { email: sentEmail, code: "", newPassword: "", confirmPassword: "" },
  });

  const stepKey = stage;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <StepPanel key={stepKey}>
        {stage === "request" ? (
          <RequestStage
            form={requestForm}
            busy={busy}
            error={error}
            clearError={() => setError("")}
            onSent={(email) => {
              setSentEmail(email);
              resetForm.setValue("email", email);
              setStage("verify");
            }}
            onFail={(message) => setError(message)}
            setBusy={setBusy}
          />
        ) : null}

        {stage === "verify" ? (
          <VerifyStage
            sentEmail={sentEmail}
            code={code}
            setCode={(next) => {
              setCode(next);
              resetForm.setValue("code", next, {
                shouldValidate: next.length === 6,
              });
            }}
            form={resetForm}
            busy={busy}
            error={error}
            clearError={() => setError("")}
            onDone={() => setStage("done")}
            onFail={(message) => setError(message)}
            onBack={() => {
              setError("");
              setStage("request");
            }}
            setBusy={setBusy}
          />
        ) : null}

        {stage === "done" ? <DoneStage sentEmail={sentEmail} /> : null}
      </StepPanel>
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------ request stage */

function RequestStage({
  form,
  busy,
  error,
  clearError,
  onSent,
  onFail,
  setBusy,
}: {
  form: ReturnType<typeof useForm<OtpRequestValues>>;
  busy: boolean;
  error: string;
  clearError: () => void;
  onSent: (email: string) => void;
  onFail: (message: string) => void;
  setBusy: (busy: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-serif text-[1.75rem] font-medium leading-tight tracking-[-0.02em] text-foreground">
          Reset your password
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          We email a 6-digit code to confirm it&apos;s you. If the email has an
          account, the code is on its way.
        </p>
      </header>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(async (values) => {
          clearError();
          setBusy(true);
          try {
            await requestPasswordResetOtp(values.email);
            onSent(values.email);
          } catch (e) {
            onFail(
              e instanceof EmailAuthError
                ? authFailureCopy(e.reason, e.retryAfterSeconds)
                : "Could not send the code.",
            );
          } finally {
            setBusy(false);
          }
        })}
      >
        <div className="flex flex-col gap-4">
          <Input
            id="forgot-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            label="Email"
            autoFocus
            error={form.formState.errors.email?.message}
            {...form.register("email")}
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
        </div>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------- verify stage */

function VerifyStage({
  sentEmail,
  code,
  setCode,
  form,
  busy,
  error,
  clearError,
  onDone,
  onFail,
  onBack,
  setBusy,
}: {
  sentEmail: string;
  code: string;
  setCode: (code: string) => void;
  form: ReturnType<typeof useForm<OtpResetValues>>;
  busy: boolean;
  error: string;
  clearError: () => void;
  onDone: () => void;
  onFail: (message: string) => void;
  onBack: () => void;
  setBusy: (busy: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-serif text-[1.75rem] font-medium leading-tight tracking-[-0.02em] text-foreground">
          Check your email
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          A reset code was sent to {sentEmail}. It sets a new password; on a
          Google-only account it sets the first one.
        </p>
      </header>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(async (values) => {
          clearError();
          setBusy(true);
          try {
            await resetPasswordWithOtp({
              email: values.email,
              code: values.code,
              password: values.newPassword,
            });
            onDone();
          } catch (e) {
            onFail(
              e instanceof EmailAuthError
                ? authFailureCopy(e.reason, e.retryAfterSeconds)
                : "Could not reset the password.",
            );
          } finally {
            setBusy(false);
          }
        })}
      >
        <div className="flex flex-col gap-4">
          <CodeInput
            value={code}
            onValueChange={setCode}
            label="Reset code"
            autoFocus
          />
          <AuthFieldError>{form.formState.errors.code?.message}</AuthFieldError>
          <PasswordInput
            id="forgot-new"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            label="New password"
            error={form.formState.errors.newPassword?.message}
            {...form.register("newPassword")}
          />
          <PasswordInput
            id="forgot-confirm"
            autoComplete="new-password"
            label="Confirm new password"
            error={form.formState.errors.confirmPassword?.message}
            {...form.register("confirmPassword")}
          />
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
          <button
            type="button"
            className="text-left text-xs font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
            onClick={onBack}
          >
            Use a different email
          </button>
        </div>
      </form>
    </div>
  );
}

/* --------------------------------------------------------------- done stage */

function DoneStage({ sentEmail }: { sentEmail: string }) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-serif text-[1.75rem] font-medium leading-tight tracking-[-0.02em] text-foreground">
          Password set
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Your new password is active{sentEmail ? ` for ${sentEmail}` : ""}.
          Sign in with it — and if this account had two-factor on, your
          authenticator still works.
        </p>
      </header>
      {/* The old asChild Button→Link, composed: the anchor carries the CTA
          width, the pill itself is the span — Button has no asChild slot. */}
      <Link href="/sign-in" className="w-full justify-center">
        <span className="flex h-10 w-full items-center justify-center rounded-full bg-primary px-4 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90">
          Go to sign in
        </span>
      </Link>
    </div>
  );
}
