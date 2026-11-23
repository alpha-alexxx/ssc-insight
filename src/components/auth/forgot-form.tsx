"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import { Loader2 } from "@/components/ui/icons";
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
import { OtpInput } from "@/components/auth/otp-input";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
 * The forgot-password page's working part, on the login-04 grammar: request
 * a code, then set a new password against it (boxed code input, see-password
 * fields). Enumeration-safe — the service answers success even for an
 * unknown email, so the copy never confirms whether an account exists. On
 * success the reader goes to /sign-in; the reset endpoint creates a
 * credential account when none exists, so this is also how a Google-only
 * account sets a first password from the outside.
 */
export function ForgotForm() {
  const searchParams = useSearchParams();
  // The sign-in page hands over a typed email so the reader doesn't retype.
  const [stage, setStage] = useState<Stage>("request");
  const [sentEmail, setSentEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState("");
  const [codeInvalid, setCodeInvalid] = useState(false);
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
              setCodeInvalid(false);
              setCode(next);
              resetForm.setValue("code", next, {
                shouldValidate: next.length === 6,
              });
            }}
            codeInvalid={codeInvalid}
            markCodeInvalid={() => setCodeInvalid(true)}
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
        <h1 className="font-serif text-[1.75rem] font-medium leading-tight tracking-[-0.02em] text-ink">
          Reset your password
        </h1>
        <p className="text-sm leading-relaxed text-muted">
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
        <FieldGroup className="gap-4">
          <Field data-invalid={!!form.formState.errors.email || undefined}>
            <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              autoFocus
              aria-invalid={!!form.formState.errors.email || undefined}
              {...form.register("email")}
            />
            {form.formState.errors.email ? (
              <FieldError>{form.formState.errors.email.message}</FieldError>
            ) : null}
          </Field>
          <FieldError>{error}</FieldError>
          <Button type="submit" disabled={busy} className="w-full justify-center">
            {busy ? (
              <>
                <Loader2 size={14} className="animate-spin" aria-hidden /> Sending…
              </>
            ) : (
              "Email me a reset code"
            )}
          </Button>
          <FieldDescription>
            Remembered it?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-accent underline underline-offset-4 hover:text-accent-hover"
            >
              Sign in
            </Link>
          </FieldDescription>
        </FieldGroup>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------- verify stage */

function VerifyStage({
  sentEmail,
  code,
  setCode,
  codeInvalid,
  markCodeInvalid,
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
  codeInvalid: boolean;
  markCodeInvalid: () => void;
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
            markCodeInvalid();
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
        <FieldGroup className="gap-4">
          <Field data-invalid={codeInvalid || undefined}>
            <FieldLabel htmlFor="forgot-code">Code</FieldLabel>
            <OtpInput
              value={code}
              onChange={setCode}
              label="Reset code"
              invalid={codeInvalid}
              autoFocus
            />
            {form.formState.errors.code ? (
              <FieldError>{form.formState.errors.code.message}</FieldError>
            ) : null}
          </Field>
          <Field data-invalid={!!form.formState.errors.newPassword || undefined}>
            <FieldLabel htmlFor="forgot-new">New password</FieldLabel>
            <PasswordInput
              id="forgot-new"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              aria-invalid={!!form.formState.errors.newPassword || undefined}
              {...form.register("newPassword")}
            />
            {form.formState.errors.newPassword ? (
              <FieldError>{form.formState.errors.newPassword.message}</FieldError>
            ) : null}
          </Field>
          <Field data-invalid={!!form.formState.errors.confirmPassword || undefined}>
            <FieldLabel htmlFor="forgot-confirm">Confirm new password</FieldLabel>
            <PasswordInput
              id="forgot-confirm"
              autoComplete="new-password"
              aria-invalid={!!form.formState.errors.confirmPassword || undefined}
              {...form.register("confirmPassword")}
            />
            {form.formState.errors.confirmPassword ? (
              <FieldError>
                {form.formState.errors.confirmPassword.message}
              </FieldError>
            ) : null}
          </Field>
          <FieldError>{error}</FieldError>
          <Button type="submit" disabled={busy} className="w-full justify-center">
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
            onClick={onBack}
          >
            Use a different email
          </button>
        </FieldGroup>
      </form>
    </div>
  );
}

/* --------------------------------------------------------------- done stage */

function DoneStage({ sentEmail }: { sentEmail: string }) {
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
      <Button asChild className="w-full justify-center">
        <Link href="/sign-in">Go to sign in</Link>
      </Button>
    </div>
  );
}
