"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { Loader2 } from "@/components/ui/icons";
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

/** A one-shot rise for the page's entrance — the house 4px/enter fade. */
function StepPanel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DUR.enter, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Password guidance: the schema's rule, restated beside the field. */
const PASSWORD_HINT = "At least 8 characters.";

/**
 * The register page's working part, rebuilt on the signup-04 grammar:
 * Google, or name + email + password with a see-password affordance and
 * live guidance. A new email account starts empty — the copy says so
 * plainly, because a reader with an existing Google workspace must not
 * expect it to merge.
 */
export function SignUpForm({
  googleEnabled,
  emailEnabled,
}: {
  googleEnabled: boolean;
  emailEnabled: boolean;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState("");
  const form = useForm<RegisterEmailValues>({
    resolver: zodResolver(registerEmailSchema),
    defaultValues: { name: "", email: "", password: "" },
    mode: "onTouched",
  });

  function done() {
    router.replace("/dashboard?welcome=1");
  }

  const hint = PASSWORD_HINT;

  return (
    <StepPanel>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="font-serif text-[1.75rem] font-medium leading-tight tracking-[-0.02em] text-ink">
            Create your workspace
          </h1>
          <p className="text-sm leading-relaxed text-muted">
            One account, one workspace — free, nothing shared.
          </p>
        </header>

        <FieldGroup className="gap-5">
          <Field>
            <GoogleSignInButton
              enabled={googleEnabled}
              label="Continue with Google"
              className="w-full justify-center"
            />
          </Field>

          {emailEnabled ? (
            <>
              <FieldSeparator>or with email</FieldSeparator>
              <form
                className="flex flex-col gap-4"
                onSubmit={form.handleSubmit(async (values) => {
                  setFormError("");
                  try {
                    await signUpEmail(values);
                    done();
                  } catch (e) {
                    setFormError(
                      e instanceof EmailAuthError
                        ? authFailureCopy(e.reason, e.retryAfterSeconds)
                        : "Could not create the account. Please retry.",
                    );
                  }
                })}
              >
                <Field data-invalid={!!form.formState.errors.name || undefined}>
                  <FieldLabel htmlFor="signup-name">Name</FieldLabel>
                  <Input
                    id="signup-name"
                    autoComplete="name"
                    placeholder="How should we greet you?"
                    aria-invalid={!!form.formState.errors.name || undefined}
                    {...form.register("name")}
                  />
                  {form.formState.errors.name ? (
                    <FieldError>{form.formState.errors.name.message}</FieldError>
                  ) : null}
                </Field>
                <Field data-invalid={!!form.formState.errors.email || undefined}>
                  <FieldLabel htmlFor="signup-email">Email</FieldLabel>
                  <Input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    aria-invalid={!!form.formState.errors.email || undefined}
                    {...form.register("email")}
                  />
                  <FieldDescription>
                    Used only to sign you in — never shared, never sold.
                  </FieldDescription>
                  {form.formState.errors.email ? (
                    <FieldError>{form.formState.errors.email.message}</FieldError>
                  ) : null}
                </Field>
                <Field data-invalid={!!form.formState.errors.password || undefined}>
                  <FieldLabel htmlFor="signup-password">Password</FieldLabel>
                  <PasswordInput
                    id="signup-password"
                    autoComplete="new-password"
                    aria-invalid={!!form.formState.errors.password || undefined}
                    {...form.register("password")}
                  />
                  <FieldDescription>{hint}</FieldDescription>
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
                      <Loader2 size={14} className="animate-spin" aria-hidden /> Creating account…
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>
                <FieldDescription className="text-center">
                  A new email account starts empty. Your existing Google
                  workspace stays a separate account — move data between them
                  with a backup file.
                </FieldDescription>
              </form>
            </>
          ) : null}

          <FieldDescription className="text-center">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-accent underline underline-offset-4 hover:text-accent-hover"
            >
              Sign in
            </Link>
          </FieldDescription>
        </FieldGroup>
      </div>
    </StepPanel>
  );
}
