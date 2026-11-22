import { Suspense } from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AuthErrorAnnouncer } from "@/components/auth/auth-error-announcer";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotForm } from "@/components/auth/forgot-form";
import { requireUser } from "@/lib/auth/require-user";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reset password — SSC Insight",
  description: "Reset your SSC Insight password with an emailed code.",
};

/**
 * The forgot-password page: request a code, set a new password. Signed-in
 * visitors bounce to the dashboard — password management for a signed-in
 * account lives in Settings → Sign-in & security instead.
 */
export default async function ForgotPasswordPage() {
  let signedIn = false;
  try {
    await requireUser();
    signedIn = true;
  } catch {
    // 401 → anonymous; anything else → auth unavailable. Both see the page.
  }
  if (signedIn) redirect("/dashboard");

  return (
    <AuthShell task="forgot">
      <AuthErrorAnnouncer />
      {/* ForgotForm reads ?email= from the sign-in hand-off; Suspense is the
          useSearchParams boundary. */}
      <Suspense fallback={null}>
        <ForgotForm />
      </Suspense>
    </AuthShell>
  );
}
