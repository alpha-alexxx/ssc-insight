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
  signUpEmail,
} from "@/lib/auth/email-client";
import {
  registerEmailSchema,
  type RegisterEmailValues,
} from "@/lib/auth/email-schemas";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * The register page's working part: Google, or name + email + password.
 * A new email account starts empty — the copy says so plainly, because a
 * reader with an existing Google workspace must not expect it to merge.
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
  });

  function done() {
    router.replace("/dashboard?welcome=1");
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-serif text-[1.75rem] font-medium leading-tight tracking-[-0.02em] text-ink">
          Create your workspace
        </h1>
        <p className="text-sm leading-relaxed text-muted">
          One account, one workspace — free, nothing shared.
        </p>
      </header>

      <GoogleSignInButton
        enabled={googleEnabled}
        label="Continue with Google"
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
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="signup-name">Name</Label>
              <Input
                id="signup-name"
                autoComplete="name"
                placeholder="How should we greet you?"
                {...form.register("name")}
              />
              {form.formState.errors.name ? (
                <p className="text-xs text-danger">{form.formState.errors.name.message}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
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
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                {...form.register("password")}
              />
              {form.formState.errors.password ? (
                <p className="text-xs text-danger">
                  {form.formState.errors.password.message}
                </p>
              ) : null}
            </div>
            {formError ? (
              <p role="alert" className="text-xs leading-relaxed text-danger">
                {formError}
              </p>
            ) : null}
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="h-11 w-full justify-center"
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" aria-hidden /> Creating account…
                </>
              ) : (
                "Create account"
              )}
            </Button>
            <p className="text-[0.6875rem] leading-relaxed text-muted">
              A new email account starts empty. Your existing Google workspace
              stays a separate account — move data between them with a backup
              file.
            </p>
          </form>
        </>
      ) : null}

      <p className="text-sm text-muted">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-accent underline underline-offset-4 hover:text-accent-hover"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
