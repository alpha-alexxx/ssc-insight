import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AuthErrorAnnouncer } from "@/components/auth/auth-error-announcer";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { requireUser } from "@/lib/auth/require-user";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create account — SSC Insight",
  description: "Create your private SSC CGL Tier 2 mock tracker account.",
};

/**
 * The register page. Signed-in visitors bounce to the dashboard — an
 * account that exists cannot create another one here.
 */
export default async function SignUpPage() {
  let signedIn = false;
  try {
    await requireUser();
    signedIn = true;
  } catch {
    // 401 → anonymous; anything else → auth unavailable. Both see the page.
  }
  if (signedIn) redirect("/dashboard");

  return (
    <AuthShell task="sign-up">
      <AuthErrorAnnouncer />
      <SignUpForm
        googleEnabled={process.env.GOOGLE_AUTH_ENABLED === "true"}
        emailEnabled={process.env.EMAIL_AUTH_ENABLED === "true"}
      />
    </AuthShell>
  );
}
