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
  signUpEmail,
} from "@/lib/auth/email-client";
import {
  registerEmailSchema,
  type RegisterEmailValues,
} from "@/lib/auth/email-schemas";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { PasswordInput } from "@/components/password-input";
import { AuthFieldError } from "@/components/auth/auth-field-error";
import { SuccessPanel } from "@/components/auth/success-panel";
import { Afterglow, type AfterglowHandle } from "@/components/afterglow";
import { useAfterglowColors } from "@/components/auth/afterglow-light";
import { withAuthTimeout } from "@/components/auth/with-auth-timeout";
import { EASE, DUR } from "@/lib/motion";

/** The same beat sign-in uses: let the light cross the card, then redirect. */
const SUCCESS_HOLD_MS = 1100;

/** Password guidance: the schema's rule, restated beside the field. */
const PASSWORD_HINT = "At least 8 characters.";

/** A one-shot rise for the page's entrance — the house 4px/enter fade. */
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
 * The register card's working part, on the adapted tilt/spotlight surface.
 *
 * Google (the brand mark carried in the shared Button), or name + email +
 * password with the see-password affordance that comes with the Hairline
 * password input and the schema's honest rule beside it. A new email account
 * starts empty, and the copy says so plainly: a reader with an existing Google
 * workspace must not expect the two to merge.
 *
 * Success plays Afterglow over the card and then replaces history with
 * `/dashboard?welcome=1`. The password is cleared before the light runs, so
 * the ghost copy of the old content never carries what was typed.
 */
export function SignUpForm({
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
  const [done, setDone] = useState<{ email: string } | null>(null);
  const form = useForm<RegisterEmailValues>({
    resolver: zodResolver(registerEmailSchema),
    defaultValues: { name: "", email: "", password: "" },
    mode: "onTouched",
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!done) return;
    const timer = window.setTimeout(
      () => router.replace("/dashboard?welcome=1"),
      reduced ? 0 : SUCCESS_HOLD_MS,
    );
    return () => window.clearTimeout(timer);
  }, [done, reduced, router]);

  function succeed(email: string) {
    const update = () => {
      form.reset();
      setDone({ email });
    };
    const handle = glow;
    if (!handle) {
      update();
      return;
    }
    void Promise.resolve(handle.play(update)).catch(update);
  }

  return (
    <Afterglow
      ref={setGlow}
      colors={colors}
      className="flex w-full flex-1 flex-col"
    >
      <div className="flex w-full flex-1 flex-col justify-center gap-6 rounded-[16px] p-5 sm:p-9">
        <AnimatePresence mode="wait" initial={false}>
          <StepPanel key={done ? "done" : "form"}>
            {done ? (
              <SuccessPanel
                title="Workspace created"
                description={
                  <>
                    {done.email} is ready. Opening your dashboard…
                  </>
                }
                footnote="It starts empty by design — the first mock is yours to log."
              />
            ) : (
              <div className="flex flex-col gap-6">
                <header className="flex flex-col gap-2">
                  <h1 className="font-serif text-[1.75rem] font-medium leading-tight tracking-[-0.02em] text-foreground">
                    Create your workspace
                  </h1>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    One account, one workspace — free, nothing shared.
                  </p>
                </header>

                <div className="flex flex-col gap-5">
                  <GoogleSignInButton
                    enabled={googleEnabled}
                    label="Continue with Google"
                    className="w-full justify-center"
                  />

                  {emailEnabled ? (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="h-px flex-1 bg-border" />
                        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          or with email
                        </span>
                        <span className="h-px flex-1 bg-border" />
                      </div>
                      <form
                        className="flex flex-col gap-4"
                        onSubmit={form.handleSubmit(async (values) => {
                          setFormError("");
                          try {
                            await withAuthTimeout(signUpEmail(values));
                            succeed(values.email);
                          } catch (error) {
                            setFormError(
                              error instanceof EmailAuthError
                                ? authFailureCopy(
                                    error.reason,
                                    error.retryAfterSeconds,
                                  )
                                : "Could not create the account. Please retry.",
                            );
                          }
                        })}
                      >
                        <Input
                          id="signup-name"
                          autoComplete="name"
                          placeholder="How should we greet you?"
                          label="Name"
                          error={form.formState.errors.name?.message}
                          {...form.register("name")}
                        />
                        <Input
                          id="signup-email"
                          type="email"
                          autoComplete="email"
                          placeholder="you@example.com"
                          label="Email"
                          hint="Used only to sign you in — never shared, never sold."
                          error={form.formState.errors.email?.message}
                          {...form.register("email")}
                        />
                        <PasswordInput
                          id="signup-password"
                          autoComplete="new-password"
                          label="Password"
                          hint={PASSWORD_HINT}
                          error={form.formState.errors.password?.message}
                          {...form.register("password")}
                        />
                        <AuthFieldError>{formError}</AuthFieldError>
                        <Button
                          type="submit"
                          size="lg"
                          disabled={form.formState.isSubmitting}
                          loading={form.formState.isSubmitting}
                          statusLabels={{ pending: "Creating account…" }}
                          className="w-full justify-center"
                        >
                          Create account
                        </Button>
                        <p className="text-center text-[13px] leading-relaxed text-muted-foreground">
                          A new email account starts empty. Your existing Google
                          workspace stays a separate account — move data between
                          them with a backup file.
                        </p>
                      </form>
                    </>
                  ) : null}

                  <p className="text-center text-[13px] leading-relaxed text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                      href="/sign-in"
                      className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            )}
          </StepPanel>
        </AnimatePresence>
      </div>
    </Afterglow>
  );
}
