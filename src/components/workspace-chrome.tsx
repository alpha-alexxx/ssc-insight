"use client";
import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MotionConfig } from "motion/react";
import { AppFrame } from "./app-shell";
import { CommandPalette } from "./command-palette";
import { AiChatSheet } from "./ai-chat-sheet";
import { useAiWorkspace } from "./use-ai-workspace";
import { useKeyboardShortcuts } from "./use-keyboard-shortcuts";
import { ToastProvider, useToast } from "./toast";
import { VIEW_HREF, viewForPathname, type AppView } from "@/lib/routes";
import { useUiStore } from "@/stores/ui-store";
import { AI_VIEWS, type AiScreenContext, type AiView } from "@/lib/ai/client-types";
import { istTodayIso } from "@/lib/plan/view-model";
import { shortDate } from "@/lib/format";
import { VIEW_META } from "./app-shell";
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
  authEnabled = false,
  userEmail = "",
  userName = "",
  userImage = "",
  defaultSidebarOpen = true,
  children,
}: {
  authEnabled?: boolean;
  userEmail?: string;
  userName?: string;
  userImage?: string;
  defaultSidebarOpen?: boolean;
  children?: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const view = viewForPathname(pathname);

  const searchOpen = useUiStore((s) => s.searchOpen);
  const setSearchOpen = useUiStore((s) => s.setSearchOpen);
  const openAiChat = useUiStore((s) => s.openAiChat);
  const aiChatTab = useUiStore((s) => s.aiChatTab);

  // Mounted here, not in a page: the transcript and any streaming reply must
  // survive navigation.
  const ai = useAiWorkspace();

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
          toast.info(
            "Shortcuts",
            "⌘K=search · n=new · g d/h/c/s=navigate · /=focus search · ?=help",
          ),
      }),
      [addMock, go, openSearch, toast],
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
          authEnabled={authEnabled}
          aiEnabled={!!ai.aiStatus?.enabled}
          onRouteIntent={() => undefined}
          onAddMock={addMock}
          onOpenAi={() => openAiChat("chat")}
          onOpenSearch={openSearch}
        >
          <div className="workspace-content mx-auto w-full max-w-[1560px]">
            {children}
          </div>
        </AppFrame>
        <CommandPalette
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
          error={ai.chat.error}
          // Names the screen the coach is looking at, so an answer is never
          // ambiguous about which view it was asked from.
          contextLabel={
            aiScreenContext?.date != null
              ? `${VIEW_META[view].label} · ${shortDate(`${aiScreenContext.date}T12:00:00+05:30`)}`
              : undefined
          }
          configured={!!ai.aiStatus?.enabled}
          onSend={(text) => void ai.chat.send(text, aiScreenContext)}
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

// Re-exported so the layout imports one module for the chrome.
export { ToastProvider };
