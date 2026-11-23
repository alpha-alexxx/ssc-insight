"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { startGoogleSignIn } from "@/lib/auth/sign-in";

/**
 * Google sign-in / sign-out actions shared by the auth pages and any
 * account surface. Pure logic — no markup (the sidebar's identity menu
 * lives in workspace-sidebar.tsx).
 */
export function useAuthActions() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function signIn() {
    setBusy(true);
    setError("");
    try {
      await startGoogleSignIn();
    } catch {
      setError("Google sign-in is unavailable. Please retry shortly.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    setError("");
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error("Sign-out failed");
      window.dispatchEvent(new Event("ssc:session-ended"));
    } catch (error) {
      setError(
        error instanceof Error && error.message
          ? `Could not sign out: ${error.message}`
          : "Could not sign out. Please retry.",
      );
    } finally {
      setBusy(false);
    }
  }

  return { busy, error, setError, signIn, signOut };
}
