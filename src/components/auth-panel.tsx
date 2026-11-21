"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  authFailureCopy,
  EmailAuthError,
  sendSignInOtp,
  signInEmail,
  signInWithOtp,
  signUpEmail,
  verifyTotpSignIn,
} from "@/lib/auth/email-client";
import {
  otpRequestSchema,
  registerEmailSchema,
  signInEmailSchema,
  totpVerifySchema,
  type OtpRequestValues,
  type RegisterEmailValues,
  type SignInEmailValues,
} from "@/lib/auth/email-schemas";
import { GoogleSignInButton } from "./google-sign-in-button";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";

/**
 * The landing's email sign-in/register dialog.
 *
 * `/` stays the only sign-in surface; this dialog lives there, beside the
 * Google buttons. One small state machine: credentials (tabbed Sign in /
 * Create account) → emailed-OTP (request → verify) → TOTP second step when
 * the password sign-in is intercepted. Every failure degrades to honest
 * copy — including "the hosted auth provider hasn't enabled this method".
 * Success hands off with a full navigation, because the session cookie must
 * be visible to the next server render.
 */

type PanelStep =
  | { step: "credentials" }
  | { step: "otp"; stage: "request" | "verify"; email: string }
  | { step: "totp"; email: string };

export function AuthPanelDialog({
  open,
  onOpenChange,
  googleEnabled,
  emailEnabled,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  googleEnabled: boolean;
  emailEnabled: boolean;
}) {
  const [view, setView] = useState<PanelStep>({ step: "credentials" });
  const [tab, setTab] = useState<"signin" | "register">("signin");
  const [formError, setFormError] = useState("");

  // Reset to the entry state whenever the dialog reopens, so a shared
  // device never shows the previous reader's half-typed email.
  const [wasOpen, setWasOpen] = useState(false);
  if (open && !wasOpen) {
    setWasOpen(true);
    setView({ step: "credentials" });
    setTab("signin");
    setFormError("");
  } else if (!open && wasOpen) {
    setWasOpen(false);
  }

  function switchTab(next: "signin" | "register") {
    setTab(next);
    setFormError("");
  }

  function finish() {
    onOpenChange(false);
    window.location.assign("/dashboard");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setFormError("");
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-md">
        {view.step === "credentials" ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl tracking-[-0.01em]">
                {tab === "signin" ? "Welcome back" : "Create your workspace"}
              </DialogTitle>
              <DialogDescription>
                {tab === "signin"
                  ? "Sign in to your private mock tracker."
                  : "One account, one workspace — free, nothing shared."}
              </DialogDescription>
            </DialogHeader>

            <div
              className="segment-group"
              role="tablist"
              aria-label="Sign in or create an account"
            >
              <button
                type="button"
                role="tab"
                aria-selected={tab === "signin"}
                className="segment flex-1 justify-center"
                onClick={() => switchTab("signin")}
              >
                Sign in
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "register"}
                className="segment flex-1 justify-center"
                onClick={() => switchTab("register")}
              >
                Create account
              </button>
            </div>

            <GoogleSignInButton
              enabled={googleEnabled}
              label={tab === "signin" ? "Sign in with Google" : "Continue with Google"}
              className="w-full justify-center"
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

                {tab === "signin" ? (
                  <SignInCredentialsForm
                    onDone={finish}
                    onTwoFactor={(email) => {
                      setFormError("");
                      setView({ step: "totp", email });
                    }}
                    formError={formError}
                    setFormError={setFormError}
                    footerSlot={
                      <button
                        type="button"
                        className="text-xs font-medium text-muted underline underline-offset-4 transition-colors hover:text-ink"
                        onClick={() => {
                          setFormError("");
                          setView({ step: "otp", stage: "request", email: "" });
                        }}
                      >
                        Email me a one-time code instead
                      </button>
                    }
                  />
                ) : (
                  <RegisterForm
                    onDone={finish}
                    formError={formError}
                    setFormError={setFormError}
                  />
                )}
              </>
            ) : null}
          </>
        ) : null}

        {view.step === "otp" ? (
          <OtpFlow
            view={view}
            setView={setView}
            setFormError={setFormError}
            onDone={finish}
          />
        ) : null}

        {view.step === "totp" ? (
          <TotpStep email={view.email} onDone={finish} setFormError={setFormError} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------- credentials forms */

function FormError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-xs leading-relaxed text-danger">
      {message}
    </p>
  );
}

function fieldClass() {
  return "w-full rounded-control border border-rule bg-paper px-3 py-2.5 text-[length:var(--type-body)] text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15";
}

function SignInCredentialsForm({
  onDone,
  onTwoFactor,
  formError,
  setFormError,
  footerSlot,
}: {
  onDone: () => void;
  onTwoFactor: (email: string) => void;
  formError: string;
  setFormError: (value: string) => void;
  footerSlot?: React.ReactNode;
}) {
  const form = useForm<SignInEmailValues>({
    resolver: zodResolver(signInEmailSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  return (
    <form
      className="flex flex-col gap-3"
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
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="auth-signin-email">Email</Label>
        <Input
          id="auth-signin-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(form.formState.errors.email)}
          {...form.register("email")}
        />
        {form.formState.errors.email ? (
          <p className="text-xs text-danger">{form.formState.errors.email.message}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="auth-signin-password">Password</Label>
        <Input
          id="auth-signin-password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          aria-invalid={Boolean(form.formState.errors.password)}
          {...form.register("password")}
        />
        {form.formState.errors.password ? (
          <p className="text-xs text-danger">{form.formState.errors.password.message}</p>
        ) : null}
      </div>
      <FormError message={formError} />
      <Button type="submit" disabled={form.formState.isSubmitting} className="w-full justify-center">
        {form.formState.isSubmitting ? (
          <>
            <Loader2 size={14} className="animate-spin" aria-hidden /> Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </Button>
      {footerSlot}
    </form>
  );
}

function RegisterForm({
  onDone,
  formError,
  setFormError,
}: {
  onDone: () => void;
  formError: string;
  setFormError: (value: string) => void;
}) {
  const form = useForm<RegisterEmailValues>({
    resolver: zodResolver(registerEmailSchema),
    defaultValues: { name: "", email: "", password: "" },
    mode: "onSubmit",
  });

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={form.handleSubmit(async (values) => {
        setFormError("");
        try {
          await signUpEmail(values);
          onDone();
        } catch (e) {
          setFormError(
            e instanceof EmailAuthError
              ? authFailureCopy(e.reason, e.retryAfterSeconds)
              : "Could not create the account. Please retry.",
          );
        }
      })}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="auth-register-name">Name</Label>
        <Input
          id="auth-register-name"
          autoComplete="name"
          placeholder="How should we greet you?"
          {...form.register("name")}
        />
        {form.formState.errors.name ? (
          <p className="text-xs text-danger">{form.formState.errors.name.message}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="auth-register-email">Email</Label>
        <Input
          id="auth-register-email"
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
        <Label htmlFor="auth-register-password">Password</Label>
        <Input
          id="auth-register-password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          {...form.register("password")}
        />
        {form.formState.errors.password ? (
          <p className="text-xs text-danger">{form.formState.errors.password.message}</p>
        ) : null}
      </div>
      <FormError message={formError} />
      <Button type="submit" disabled={form.formState.isSubmitting} className="w-full justify-center">
        {form.formState.isSubmitting ? (
          <>
            <Loader2 size={14} className="animate-spin" aria-hidden /> Creating account…
          </>
        ) : (
          "Create account"
        )}
      </Button>
      <p className="text-[0.6875rem] leading-relaxed text-muted">
        A new email account starts empty. Your existing Google workspace stays a
        separate account — move data between them with a backup file.
      </p>
    </form>
  );
}

/* ------------------------------------------------------------------ OTP flow */

function OtpFlow({
  view,
  setView,
  setFormError,
  onDone,
}: {
  view: Extract<PanelStep, { step: "otp" }>;
  setView: (view: PanelStep) => void;
  setFormError: (value: string) => void;
  onDone: () => void;
}) {
  const [error, setError] = useState("");
  const requestForm = useForm<OtpRequestValues>({
    resolver: zodResolver(otpRequestSchema),
    defaultValues: { email: view.email },
  });
  const codeForm = useForm<{ code: string }>({
    resolver: zodResolver(totpVerifySchema),
    defaultValues: { code: "" },
  });

  if (view.stage === "request") {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="font-serif text-xl tracking-[-0.01em]">
            Sign in with a code
          </DialogTitle>
          <DialogDescription>
            We email a 6-digit code — no password needed.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-3"
          onSubmit={requestForm.handleSubmit(async (values) => {
            setError("");
            try {
              await sendSignInOtp(values.email);
              setFormError("");
              setView({ step: "otp", stage: "verify", email: values.email });
            } catch (e) {
              setError(
                e instanceof EmailAuthError
                  ? authFailureCopy(e.reason, e.retryAfterSeconds)
                  : "Could not send the code. Please retry.",
              );
            }
          })}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="auth-otp-email">Email</Label>
            <Input
              id="auth-otp-email"
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
          <button
            type="button"
            className="text-xs font-medium text-muted underline underline-offset-4 transition-colors hover:text-ink"
            onClick={() => setView({ step: "credentials" })}
          >
            Back to sign-in options
          </button>
        </form>
      </>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-serif text-xl tracking-[-0.01em]">
          Check your email
        </DialogTitle>
        <DialogDescription>
          A 6-digit code is on its way to {view.email}.
        </DialogDescription>
      </DialogHeader>
      <form
        className="flex flex-col gap-3"
        onSubmit={codeForm.handleSubmit(async (values) => {
          setError("");
          try {
            await signInWithOtp({ email: view.email, code: values.code });
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
          <Label htmlFor="auth-otp-code">Code</Label>
          <Input
            id="auth-otp-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            className="tabular-nums text-center text-lg tracking-[0.4em]"
            maxLength={6}
            autoFocus
            {...codeForm.register("code")}
          />
          {codeForm.formState.errors.code ? (
            <p className="text-xs text-danger">{codeForm.formState.errors.code.message}</p>
          ) : null}
        </div>
        <FormError message={error} />
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
          className="text-xs font-medium text-muted underline underline-offset-4 transition-colors hover:text-ink"
          onClick={() => setView({ step: "otp", stage: "request", email: view.email })}
        >
          Use a different email
        </button>
      </form>
    </>
  );
}

/* ----------------------------------------------------------------- TOTP step */

function TotpStep({
  email,
  onDone,
  setFormError,
}: {
  email: string;
  onDone: () => void;
  setFormError: (value: string) => void;
}) {
  const [error, setError] = useState("");
  const form = useForm<{ code: string }>({
    resolver: zodResolver(totpVerifySchema),
    defaultValues: { code: "" },
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-serif text-xl tracking-[-0.01em]">
          Two-factor check
        </DialogTitle>
        <DialogDescription>
          Enter the 6-digit code from your authenticator app{email ? ` for ${email}` : ""}.
        </DialogDescription>
      </DialogHeader>
      <form
        className="flex flex-col gap-3"
        onSubmit={form.handleSubmit(async (values) => {
          setError("");
          try {
            await verifyTotpSignIn(values.code);
            onDone();
          } catch (e) {
            const message =
              e instanceof EmailAuthError
                ? authFailureCopy(e.reason, e.retryAfterSeconds)
                : "Could not verify the code.";
            setError(message);
            setFormError("");
          }
        })}
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="auth-totp-code">Authenticator code</Label>
          <Input
            id="auth-totp-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            className={cn("tabular-nums text-center text-lg tracking-[0.4em]")}
            maxLength={6}
            autoFocus
            {...form.register("code")}
          />
          {form.formState.errors.code ? (
            <p className="text-xs text-danger">{form.formState.errors.code.message}</p>
          ) : null}
        </div>
        <FormError message={error} />
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
    </>
  );
}
