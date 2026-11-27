"use client";
import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MotionConfig } from "motion/react";
import { AppFrame } from "./app-shell";
import { WorkspaceCommandPalette, CommandPaletteTrigger } from "./workspace-command-palette";
import { useAiWorkspace } from "./use-ai-workspace";
import { useKeyboardShortcuts } from "./use-keyboard-shortcuts";
import { MockDetailDialog } from "./mock-detail-dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  attemptDetailQueryOptions,
  attemptKeys,
  deleteAttemptRequest,
} from "@/lib/queries/attempts";
import { analyticsKeys } from "@/lib/queries/analytics";
import { toast } from "./toast-stack";
import { VIEW_HREF, viewForPathname, type AppView } from "@/lib/routes";
import { useUiStore } from "@/stores/ui-store";
import { ScopeGate } from "./shared/empty-scope-notice";

/**
 * The workspace chrome: sidebar, sticky header, command palette, keyboard
 * shortcuts, and the AI sheet.
 *
 * This is what remains of `workspace-shell.tsx` after every view moved to its
 * own route. It exists because these four things must outlive a route change:
 * the sidebar must not remount, the palette's open state must survive, and the
 * AI drawer must keep its transcript and any in-flight stream. A page cannot
 * own them — navigating away would throw the reply away.
 *
 * Everything else the shell used to do (fetching, filtering, view switching) is
 * now the page's job, which is the entire point of the shift.
 */
export function WorkspaceChrome({
  userEmail = "",
  userName = "",
  userImage = "",
  defaultSidebarCollapsed = false,
  defaultSidebarWidth = 240,
  children,
}: {
  userEmail?: string;
  userName?: string;
  userImage?: string;
  defaultSidebarCollapsed?: boolean;
  defaultSidebarWidth?: number;
  children?: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const view = viewForPathname(pathname);

  // The one-shot sign-in greeting: the auth pages and /auth/complete land
  // on /dashboard?welcome=1. Toast once, then strip the param so a reload
  // (or a shared link) never greets again — the same contract the auth
  // pages' ?error announcer uses.
  useEffect(() => {
    if (!pathname.startsWith("/dashboard")) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("welcome") !== "1") return;
    params.delete("welcome");
    const rest = params.toString();
    window.history.replaceState(
      null,
      "",
      `/dashboard${rest ? `?${rest}` : ""}`,
    );
    toast.success("Signed in", { description: "Your workspace is ready." });
  }, [pathname]);

  const searchOpen = useUiStore((s) => s.searchOpen);
  const setSearchOpen = useUiStore((s) => s.setSearchOpen);

  // Mounted here, not in a page: the transcript and any streaming reply must
  // survive navigation.
  const ai = useAiWorkspace();
  const queryClient = useQueryClient();

  // One detail dialog for the whole workspace. Every surface's "View result"
  // only names an id; the record itself is read from the query cache, so the
  // store never holds server data.
  const openAttemptId = useUiStore((s) => s.openAttemptId);
  const closeAttempt = useUiStore((s) => s.closeAttempt);
  const detail = useQuery({
    ...attemptDetailQueryOptions(openAttemptId ?? ""),
    enabled: !!openAttemptId,
  });

  const removeAttempt = async () => {
    const attempt = detail.data;
    if (!attempt) return;
    try {
      await deleteAttemptRequest(attempt.id);
      closeAttempt();
      queryClient.removeQueries({ queryKey: attemptKeys.detail(attempt.id) });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: attemptKeys.all }),
        queryClient.invalidateQueries({ queryKey: analyticsKeys.all }),
      ]);
      toast.success("Moved to Trash", {
        description: "Recoverable for 15 days",
      });
    } catch (error) {
      toast.error("Couldn't delete", {
        description:
          error instanceof Error ? error.message : "Could not delete",
      });
    }
  };

  const go = useMemo(
    () => (next: AppView) => router.push(VIEW_HREF[next]),
    [router],
  );
  const addMock = useMemo(() => () => router.push("/add"), [router]);
  const openSearch = useMemo(() => () => setSearchOpen(true), [setSearchOpen]);

  // One palette, mounted once: it draws the header's search pill AND the panel
  // that grows out of it. Splitting them would leave the pill unmeasurable and
  // the growth would start from an empty box. `trigger` hands the pill to the
  // header's own tree while the palette keeps its ref and click.
  const commandPalette = (
    <WorkspaceCommandPalette
      open={searchOpen}
      onOpenChange={setSearchOpen}
      aiEnabled={!!ai.aiStatus?.enabled}
      onAddMock={addMock}
      onOpenAi={() => router.push("/ask")}
      trigger={<CommandPaletteTrigger />}
    />
  );

  useKeyboardShortcuts(
    useMemo(
      () => ({
        onAddMock: addMock,
        onNavigate: go,
        onOpenSearch: openSearch,
        onShowHelp: () =>
          toast.info("Shortcuts", {
            description:
              "⌘K=search · n=new · g d/h/c/s=navigate · /=focus search · ?=help",
          }),
      }),
      [addMock, go, openSearch],
    ),
  );

  return (
    <MotionConfig reducedMotion="user">
      {/* min-h-dvh, matching app-shell's own floor: the shell floors at the
          dynamic viewport, not the large one. */}
      <div className="min-h-dvh">
        <AppFrame
          defaultSidebarCollapsed={defaultSidebarCollapsed}
          defaultSidebarWidth={defaultSidebarWidth}
          view={view}
          userName={userName}
          userEmail={userEmail}
          userImage={userImage}
          onOpenSearch={openSearch}
          searchSlot={commandPalette}
        >
          {/* px-* lives here once, so a route cannot forget it (one did). */}
          <div className="workspace-content mx-auto w-full max-w-[1560px] px-3 py-4 sm:px-5 md:py-5">
            <ScopeGate pathname={pathname}>{children}</ScopeGate>
          </div>
        </AppFrame>
        <MockDetailDialog
          attempt={detail.data ?? null}
          onClose={closeAttempt}
          onEdit={(attempt) => {
            closeAttempt();
            router.push(`/add?id=${attempt.id}`);
          }}
          onCompare={(attempt) => {
            closeAttempt();
            router.push(`/compare?ids=${attempt.id}`);
          }}
          onDelete={() => void removeAttempt()}
          busy={false}
        />
      </div>
    </MotionConfig>
  );
}
