"use client";

import { useState } from "react";
import { AuthPanelDialog } from "@/components/auth-panel";
import { cn } from "@/lib/utils";

/**
 * The landing's "continue with email" affordance + dialog, as one island.
 *
 * Each sign-in surface (hero, masthead, final CTA) renders its own instance
 * so the dialog opens exactly where the reader clicked — the component is
 * stateless until opened and the dialog only mounts while open. `enabled`
 * mirrors `EMAIL_AUTH_ENABLED`; when off, nothing renders and the Google
 * buttons remain the whole story.
 */
export function EmailAuthButton({
  enabled,
  googleEnabled,
  label = "Continue with email",
  className,
}: {
  enabled: boolean;
  googleEnabled: boolean;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  if (!enabled) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "text-xs font-medium text-muted underline underline-offset-4 transition-colors hover:text-ink",
          className,
        )}
      >
        {label}
      </button>
      {open ? (
        <AuthPanelDialog
          open={open}
          onOpenChange={setOpen}
          googleEnabled={googleEnabled}
          emailEnabled={enabled}
        />
      ) : null}
    </>
  );
}
