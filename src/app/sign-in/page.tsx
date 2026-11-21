import { Suspense } from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AuthErrorAnnouncer } from "@/components/auth/auth-error-announcer";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/auth/sign-in-form";
import { requireUser } from "@/lib/auth/require-user";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in — SSC Insight",
  description: "Sign in to your private SSC CGL Tier 2 mock tracker.",
};

/**
 * The sign-in page. Signed-in visitors have nothing to do here — the server
 * bounces them to the dashboard before anything renders. Anonymous visitors
 * and auth outages both see the page (the outage reads as failed sign-ins,
 * which the forms say honestly).
 */
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const { error: rawError } = await searchParams;
  const error = Array.isArray(rawError) ? rawError[0] : rawError;
  let signedIn = false;
  try {
    await requireUser();
    signedIn = true;
  } catch {
    // 401 → anonymous; anything else → auth unavailable. Both see the page.
  }
  if (signedIn) redirect("/dashboard");

  return (
    <AuthShell>
      <AuthErrorAnnouncer errorCode={error} />
      <SignInForm
        googleEnabled={process.env.GOOGLE_AUTH_ENABLED === "true"}
        emailEnabled={process.env.EMAIL_AUTH_ENABLED === "true"}
      />
    </AuthShell>
  );
}
