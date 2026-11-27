"use client";

import { EmailAuthError } from "@/lib/auth/email-client";

/**
 * A bound on every auth call, so a frozen network cannot freeze the card.
 *
 * The wire layer deliberately has no timeout of its own: the hosted provider
 * is the thing that may never answer, and the app's own proxy forwards the
 * request. Without a bound, the code rail sits on "Checking the code…" with no
 * end, which reads as a broken app rather than an unreachable service. Fifteen
 * seconds is long enough for a slow mobile connection and short enough that a
 * blackholed request never owns the surface.
 *
 * A timeout is a failure of reachability, not of the code, so it maps to the
 * wire layer's own honest "unavailable" reason and copy.
 */
export const AUTH_CALL_TIMEOUT_MS = 15_000;

export async function withAuthTimeout<T>(
  task: Promise<T>,
  ms: number = AUTH_CALL_TIMEOUT_MS,
): Promise<T> {
  let timer: number | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = window.setTimeout(() => {
      reject(
        new EmailAuthError(
          "unavailable",
          "The sign-in service did not answer in time.",
        ),
      );
    }, ms);
  });
  try {
    return await Promise.race([task, timeout]);
  } finally {
    if (timer !== undefined) window.clearTimeout(timer);
  }
}
