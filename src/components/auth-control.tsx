"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { startGoogleSignIn } from "@/lib/auth/sign-in";
import { PlainIcon } from "./icon";
import { SidebarMenuButton, useSidebar } from "./ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { VIEW_HREF } from "@/lib/routes";

/** Props for {@link SidebarUserMenu}. */
export interface SidebarUserMenuProps {
  name: string;
  email: string;
  imageUrl: string;
}

/** The identity + actions menu shared by both expanded-footer triggers. */
function UserMenuItems({
  name,
  email,
  busy,
  onGoTo,
  onSignOut,
}: {
  name: string;
  email: string;
  busy: boolean;
  onGoTo: (next: "settings" | "trash") => void;
  onSignOut: () => void;
}) {
  return (
    <>
      <DropdownMenuLabel className="normal-case tracking-normal">
        <span className="block truncate text-xs font-medium text-ink">
          {name || "My workspace"}
        </span>
        <span className="block truncate text-[0.625rem] font-normal text-muted">
          {email || "Private account"}
        </span>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onSelect={() => onGoTo("settings")}>
        <PlainIcon name="settings" size={15} />
        Settings
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={() => onGoTo("trash")}>
        <PlainIcon name="trash" size={15} />
        Trash
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem danger disabled={busy} onSelect={onSignOut}>
        <PlainIcon name="logout" size={15} />
        {busy ? "Signing out…" : "Sign out"}
      </DropdownMenuItem>
    </>
  );
}

/**
 * Sidebar account block — the sidebar-07 NavUser pattern on house tokens.
 *
 * **Expanded** the footer row carries the identity once, as three controls:
 *
 * - the avatar (Google photo, else the name's initial) is a
 *   `SidebarMenuButton` with the standard collapsed tooltip; clicking it
 *   opens the account dropdown;
 * - the identity column (name over email) is a second trigger for the same
 *   menu, so the whole block reads as one account control;
 * - the logout button signs out in place (`useAuthActions().signOut()`,
 *   dispatching `ssc:session-ended` after the client confirms).
 *
 * **Collapsed** the row folds to the avatar alone (the identity column and
 * logout keep `sr-only` names via the COLLAPSED_TEXT_SPAN helper); the
 * dropdown then carries the settings and trash destinations that the
 * expanded footer shows as rows.
 *
 * Sign-out failures render as an alert above the block and stay retryable;
 * the workspace is never blocked by a user-initiated sign-out attempt.
 */
export function SidebarUserMenu({
  name,
  email,
  imageUrl,
}: SidebarUserMenuProps) {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const { busy, error, signOut } = useAuthActions();

  // No gate on `enabled`: this block renders only inside the authenticated
  // workspace (the layout has already called requireUser()), so a session
  // exists and sign-out always works. `enabled` describes Google OAuth
  // availability — a sign-in affordance, never a reason to hide the identity
  // of a user who is demonstrably signed in.
  const source = (name || email || "?").trim();
  const initial = source.charAt(0).toUpperCase() || "?";

  const goTo = (next: "settings" | "trash") => {
    setOpenMobile(false);
    router.push(VIEW_HREF[next]);
  };

  return (
    <div className="relative flex min-w-0 items-center gap-1 group-data-[collapsible=icon]:min-h-[var(--sidebar-row-h-lg)] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
      {/* Avatar trigger. The default sidebar tooltip serves the rail; the
          menu opens on click, so it does not ride the tooltip. */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            type="button"
            tooltip="Account menu"
            aria-label={`Account menu — ${source}`}
            title={source}
            className="size-[var(--sidebar-row-h-lg)] shrink-0 rounded-full p-0 hover:bg-transparent hover:text-ink data-[state=open]:bg-transparent data-[state=open]:text-ink"
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt=""
                aria-hidden="true"
                className="size-8 rounded-full object-cover ring-1 ring-rule-soft"
              />
            ) : (
              <span
                aria-hidden="true"
                className="sidebar-avatar grid size-8 shrink-0 place-items-center rounded-full bg-ink text-[0.625rem] font-semibold tracking-wide text-paper"
              >
                {initial}
              </span>
            )}
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="min-w-[13rem]">
          <UserMenuItems
            name={name}
            email={email}
            busy={busy}
            onGoTo={goTo}
            onSignOut={() => void signOut()}
          />
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Identity column + logout: siblings, never nested buttons. The
          identity is a second menu trigger so the expanded block feels like
          one control; the logout button stays independent so an accidental
          identity click cannot sign the user out. */}
      <div className="flex min-w-0 flex-1 items-center gap-0.5 group-data-[collapsible=icon]:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Account menu"
              className="flex h-auto min-w-0 flex-1 flex-col items-stretch gap-0.5 rounded-control px-2 py-1.5 text-left transition-colors hover:bg-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-soft"
            >
              <span className="truncate text-xs font-medium text-ink">
                {name || "My workspace"}
              </span>
              <span className="truncate text-[0.625rem] font-normal text-muted">
                {email || "Private account"}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="min-w-[13rem]">
            <UserMenuItems
              name={name}
              email={email}
              busy={busy}
              onGoTo={goTo}
              onSignOut={() => void signOut()}
            />
          </DropdownMenuContent>
        </DropdownMenu>
        <button
          type="button"
          onClick={() => void signOut()}
          aria-label="Sign out"
          title="Sign out"
          disabled={busy}
          className="tap-target inline-flex size-9 shrink-0 items-center justify-center rounded-control text-muted transition-colors hover:bg-danger-soft hover:text-danger disabled:pointer-events-none disabled:opacity-50"
        >
          <PlainIcon name="logout" size={15} />
          <span className="sr-only">Sign out</span>
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="absolute bottom-full left-0 z-30 mb-2 flex w-64 max-w-[80vw] items-start gap-2 rounded-control border border-danger/40 bg-danger-soft p-3 text-xs text-danger shadow-pop"
        >
          <PlainIcon
            name="warning"
            size={13}
            tone="mono"
            className="mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <span className="leading-snug">{error}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Shared sign-in/sign-out actions (moved unchanged from the old header
 * + SidebarUserMenu). Sign-out dispatches `ssc:session-ended` only after the auth
 * client confirms the session is gone, matching the other dispatch sites
 * (a 401 answer, the settings export, the AI stream) — the guard and the
 * query cache react to a real session end, never to an attempt. The Neon
 * auth client rejects on any non-OK sign-out response, so a failure lands
 * here as a thrown error and must stay visible.
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

