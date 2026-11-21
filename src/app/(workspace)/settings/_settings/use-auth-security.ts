"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth/client";
import {
  authFailureCopy,
  changePassword,
  EmailAuthError,
  listSessions,
  revokeOtherSessions,
  twoFactorDisable,
  twoFactorEnable,
  twoFactorRegenerateBackupCodes,
  twoFactorVerifyTotp,
  type AuthSessionRow,
  type TwoFactorEnrollment,
} from "@/lib/auth/email-client";
import { useToast } from "@/components/toast";

/**
 * The Sign-in & security panel's data and actions.
 *
 * Identity comes from the SDK's session hook; sessions and every two-factor /
 * password action ride the wire client. The whole surface degrades honestly:
 * `twoFactorEnabled` is feature-detected off the session (absent when the
 * hosted provider has no two-factor plugin), and wire failures surface as
 * inline errors via the returned action results, never thrown UI-side.
 */

export type SecurityUser = {
  name: string | null;
  email: string | null;
  emailVerified: boolean | null;
  image: string | null;
  twoFactorEnabled: boolean | null;
};

function readSecurityUser(data: unknown): SecurityUser | null {
  const user = (data as { user?: Record<string, unknown> } | null)?.user;
  if (!user || typeof user !== "object") return null;
  return {
    name: typeof user.name === "string" ? user.name : null,
    email: typeof user.email === "string" ? user.email : null,
    emailVerified: typeof user.emailVerified === "boolean" ? user.emailVerified : null,
    image: typeof user.image === "string" ? user.image : null,
    // Feature detection: the field only exists when the hosted provider runs
    // the two-factor plugin. Null means "cannot know", which the panel copy
    // renders as unavailable rather than a fake Off.
    twoFactorEnabled:
      typeof user.twoFactorEnabled === "boolean" ? user.twoFactorEnabled : null,
  };
}

export function useAuthSecurity() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const sessionQuery = authClient.useSession();
  const user = readSecurityUser(sessionQuery.data);
  const sessionId =
    (sessionQuery.data as { session?: { id?: string } } | null)?.session?.id ?? null;

  // Sessions live in the query cache like every other server read: the
  // panel renders the loading/error states off the query, and "Retry" is a
  // plain refetch. `retry: false` — a missing list is a degradation, not a
  // reason to hammer the auth proxy.
  const sessionsQuery = useQuery({
    queryKey: ["auth", "sessions"],
    queryFn: () => listSessions(),
    staleTime: 30_000,
    retry: false,
  });
  const sessions = sessionsQuery.isSuccess ? sessionsQuery.data : null;
  const sessionsBusy = sessionsQuery.isFetching;
  const refreshSessions = useCallback(() => sessionsQuery.refetch(), [sessionsQuery]);

  const run = useCallback(
    async (
      action: () => Promise<void>,
      successMessage: string,
      successDetail?: string,
    ): Promise<{ ok: boolean; failure?: string }> => {
      try {
        await action();
        toast.success(successMessage, successDetail);
        // Session-affecting actions may change what the account exposes.
        await queryClient.invalidateQueries({ queryKey: ["auth"] });
        await refreshSessions();
        return { ok: true };
      } catch (e) {
        return {
          ok: false,
          failure:
            e instanceof EmailAuthError
              ? authFailureCopy(e.reason, e.retryAfterSeconds)
              : "The sign-in service is unreachable right now.",
        };
      }
    },
    [queryClient, refreshSessions, toast],
  );

  const actions = {
    changePassword: (input: {
      currentPassword: string;
      newPassword: string;
      revokeOtherSessions: boolean;
    }) =>
      run(
        () =>
          changePassword({
            currentPassword: input.currentPassword,
            newPassword: input.newPassword,
            revokeOtherSessions: input.revokeOtherSessions,
          }),
        "Password updated",
      ),
    enrollTwoFactor: (password: string): Promise<TwoFactorEnrollment> =>
      twoFactorEnable(password),
    verifyEnrollment: (code: string) =>
      run(() => twoFactorVerifyTotp(code), "Two-factor is on", "Keep the backup codes safe."),
    disableTwoFactor: (password: string) =>
      run(() => twoFactorDisable(password), "Two-factor is off"),
    regenerateBackupCodes: (password: string) => twoFactorRegenerateBackupCodes(password),
    revokeOthers: () => run(() => revokeOtherSessions(), "Other sessions signed out"),
  };

  return { user, sessionId, sessions, sessionsBusy, refreshSessions, actions };
}
