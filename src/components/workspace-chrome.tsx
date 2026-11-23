"use client";
import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MotionConfig } from "motion/react";
import { AppFrame } from "./app-shell";
import { WorkspaceCommandPalette } from "./workspace-command-palette";
import { AiChatSheet } from "./ai-chat-sheet";
import { aiUsageLabel, useAiWorkspace } from "./use-ai-workspace";
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
import { AI_VIEWS, type AiScreenContext, type AiView } from "@/lib/ai/client-types";
import { istTodayIso } from "@/lib/plan/view-model";
import { shortDate } from "@/lib/format";
import { VIEW_META } from "./app-shell";
import { ScopeGate } from "./shared/empty-scope-notice";
import { usePlanData } from "./use-plan-data";

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
  defaultSidebarOpen = true,
  children,
}: {
  userEmail?: string;
  userName?: string;
  userImage?: string;
  defaultSidebarOpen?: boolean;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs on the dashboard arrival only; toast is stable
  }, [pathname]);

  const searchOpen = useUiStore((s) => s.searchOpen);
  const setSearchOpen = useUiStore((s) => s.setSearchOpen);
  const openAiChat = useUiStore((s) => s.openAiChat);
  const aiChatTab = useUiStore((s) => s.aiChatTab);

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
      toast.success("Moved to Trash", { description: "Recoverable for 15 days" });
    } catch (error) {
      toast.error("Couldn't delete", {
        description: error instanceof Error ? error.message : "Could not delete",
      });
    }
  };

  // The AI panel's orientation: a view name and (when relevant) a date. It
  // carries no titles, notes, IDs, email, or attempt records.
  const aiScreenContext = useMemo<AiScreenContext | null>(() => {
    if (!(AI_VIEWS as readonly string[]).includes(view)) return null;
    const aiView = view as AiView;
    return view === "dashboard" || view === "calendar" || view === "plan"
      ? { view: aiView, date: istTodayIso() }
      : { view: aiView };
  }, [view]);

  // The AI sheet can create personal tasks from a suggestion, so it needs the
  // plan workspace's creator. Mounted here because the sheet lives here.
  const planApi = usePlanData();

  const go = useMemo(
    () => (next: AppView) => router.push(VIEW_HREF[next]),
    [router],
  );
  const addMock = useMemo(() => () => router.push("/add"), [router]);
  const openSearch = useMemo(() => () => setSearchOpen(true), [setSearchOpen]);

  useKeyboardShortcuts(
    useMemo(
      () => ({
        onAddMock: addMock,
        onNavigate: go,
        onOpenSearch: openSearch,
        onShowHelp: () =>
          toast.info("Shortcuts", {
            description: "⌘K=search · n=new · g d/h/c/s=navigate · /=focus search · ?=help",
          }),
      }),
      [addMock, go, openSearch],
    ),
  );

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <AppFrame
          defaultSidebarOpen={defaultSidebarOpen}
          view={view}
          userName={userName}
          userEmail={userEmail}
          userImage={userImage}
          aiEnabled={!!ai.aiStatus?.enabled}
          onRouteIntent={() => undefined}
          onAddMock={addMock}
          onOpenAi={() => openAiChat("chat")}
          onOpenSearch={openSearch}
          onOpenSettings={() => go("settings")}
          onOpenTrash={() => go("trash")}
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
        <WorkspaceCommandPalette
          open={searchOpen}
          onOpenChange={setSearchOpen}
          aiEnabled={!!ai.aiStatus?.enabled}
          onAddMock={addMock}
          onOpenAi={() => openAiChat("chat")}
        />
        <AiChatSheet
          open={ai.chat.open}
          onOpenChange={ai.chat.setOpen}
          initialTab={aiChatTab}
          messages={ai.chat.messages}
          streaming={ai.chat.streaming}
          phase={ai.chat.phase}
          error={ai.chat.error}
          // Names the screen the coach is looking at, so an answer is never
          // ambiguous about which view it was asked from.
          contextLabel={
            aiScreenContext?.date != null
              ? `${VIEW_META[view].label} · ${shortDate(`${aiScreenContext.date}T12:00:00+05:30`)}`
              : undefined
          }
          configured={!!ai.aiStatus?.enabled}
          visionEnabled={ai.aiStatus?.credential?.visionEnabled === true}
          usageLabel={aiUsageLabel(ai.aiStatus ?? null)}
          onSend={(text, images) =>
            void ai.chat.send(text, aiScreenContext, false, images)
          }
          onRetry={() => ai.chat.retryLast()}
          onRegenerate={() => ai.chat.regenerateLast()}
          onEditResend={(messageId, text) => ai.chat.editResend(messageId, text)}
          history={ai.chat.history}
          onStop={ai.chat.stop}
          onClear={ai.chat.clear}
          onAiConfigured={() => void ai.refreshAiStatus()}
          taskApi={{ createPersonalTask: planApi.createPersonalTask }}
          onTaskAdded={() => toast.success("Task added to My Tasks")}
          onLogMock={(draft) => {
            // The form stays the sole save path. The reviewed draft crosses to
            // /add through the UI store, never the URL — it is user content and
            // a query parameter would land in history and logs.
            useUiStore.getState().requestMockPrefill(draft);
            router.push("/add");
          }}
        />
      </div>
    </MotionConfig>
  );
}
