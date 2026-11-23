"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@/components/toast";

const ERROR_COPY: Record<string, { title: string; detail: string }> = {
  oauth: {
    title: "Sign-in didn't complete",
    detail: "Google sign-in didn't finish. Please try again.",
  },
  unavailable: {
    title: "Sign-in unavailable",
    detail: "Sign-in is temporarily unavailable. Please retry shortly.",
  },
  session: {
    title: "Session ended",
    detail: "Your session ended. Sign in again to continue.",
  },
};

/**
 * The auth pages' error announcer — the same contract as the landing's:
 * the proxy, `/auth/complete` and the session guard redirect here with a
 * code, and this is the one place that turns a code into words. Unknown
 * codes read as a failed OAuth round trip; the value itself never renders
 * ("the query arrives from a URL anyone can type"). Announces once, then
 * strips `?error` via history.replaceState.
 */
export function AuthErrorAnnouncer({ errorCode }: { errorCode?: string }) {
  const toast = useToast();
  const announced = useRef(false);

  useEffect(() => {
    if (announced.current || !errorCode) return;
    announced.current = true;
    const copy = ERROR_COPY[errorCode] ?? ERROR_COPY.oauth!;
    toast.error(copy.title, copy.detail);
    const url = new URL(window.location.href);
    url.searchParams.delete("error");
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  }, [errorCode, toast]);

  return null;
}
