"use client";

import { useState } from "react";
import { startGoogleSignIn } from "@/lib/auth/sign-in";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/button";
import { toast } from "@/components/toast-stack";
import { GoogleGlyph } from "./google-glyph";

/** Props for {@link GoogleSignInButton}. */
export interface GoogleSignInButtonProps {
  /** False when `GOOGLE_AUTH_ENABLED` is off; renders a disabled notice. */
  enabled: boolean;
  /** Full label. `compactLabel` replaces it below `sm`. */
  label: string;
  compactLabel?: string;
  ariaLabel?: string;
  /** Visual weight: `default` reads as the Hairline secondary button (the
   *  brand mark next to neutral surface), `outline` as the outline one. */
  variant?: "default" | "outline";
  size?: "sm" | "default";
  className?: string;
}

/**
 * Google sign-in affordance for the auth pages.
 *
 * The brand mark is the inline `GoogleGlyph` (a brand drawing, not an icon
 * from the house vocabulary), carried in the Hairline Button's leading slot
 * so the pill, focus ring and busy spinner all come from the shared control.
 *
 * The pages are server-gated to anonymous visitors, so this deliberately
 * does not call `useSession()` — that would only add a pending flash.
 * Failures surface as a toast, because a failed OAuth round trip returns
 * with `?error=oauth` and the button may be off-screen.
 */
export function GoogleSignInButton({
  enabled,
  label,
  compactLabel,
  ariaLabel,
  variant = "default",
  size = "default",
  className,
}: GoogleSignInButtonProps) {
  const [busy, setBusy] = useState(false);

  const hairlineVariant: ButtonVariant =
    variant === "outline" ? "outline" : "secondary";
  const hairlineSize: ButtonSize = size === "sm" ? "sm" : "lg";

  if (!enabled) {
    return (
      <Button
        variant="outline"
        size={hairlineSize}
        disabled
        className={className}
      >
        Sign-in unavailable
      </Button>
    );
  }

  async function signIn() {
    setBusy(true);
    try {
      await startGoogleSignIn();
    } catch {
      toast.error("Sign-in didn't complete", {
        description: "Google sign-in is unavailable. Please retry shortly.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      variant={hairlineVariant}
      size={hairlineSize}
      type="button"
      disabled={busy}
      loading={busy}
      aria-busy={busy || undefined}
      aria-label={ariaLabel ?? label}
      onClick={signIn}
      icon={<GoogleGlyph />}
      statusLabels={{ pending: "Connecting…" }}
      className={className}
    >
      {compactLabel ? (
        <>
          <span className="hidden sm:inline">{label}</span>
          <span className="sm:hidden">{compactLabel}</span>
        </>
      ) : (
        label
      )}
    </Button>
  );
}
