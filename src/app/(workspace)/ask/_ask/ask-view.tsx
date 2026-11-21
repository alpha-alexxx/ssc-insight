"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  History,
  ListChecks,
  MessageSquare,
  ScanLine,
  Shield,
  Sparkles,
  SquarePen,
  Trash2,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { aiUsageLabel, useAiWorkspace } from "@/components/use-ai-workspace";
import { usePlanData } from "@/components/use-plan-data";
import { useToast } from "@/components/toast";
import { AiSettingsForm } from "@/components/ai-settings-form";
import { TodoAiComposer } from "@/components/shared/tasks/ai-composer";
import { LogMockFlow } from "@/components/shared/ai/log-mock-flow";
import { useUiStore } from "@/stores/ui-store";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHandle,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ChatTranscript } from "@/components/shared/ai/chat-transcript";
import { ChatComposer } from "@/components/shared/ai/chat-composer";
import { ChatEmptyState } from "@/components/shared/ai/chat-empty-state";
import { ConversationList } from "@/components/shared/ai/conversation-list";
import { UsageFooter } from "@/components/shared/ai/usage-footer";
import { AiActivity } from "./ai-activity";
import { istTodayIso } from "@/lib/plan/view-model";
import { cn } from "@/lib/utils";

const FOLLOW_UPS = [
  "Show my weakest subject",
  "How is my trend?",
  "Plan my revision",
];

/** The composer's modes, surfaced as chips: Chat, Todos (AI task drafts),
 * Mock (AI report parsing that hands off to /add). */
const MODES = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "todos", label: "Todos", icon: ListChecks },
  { id: "mock", label: "Mock", icon: ScanLine },
] as const;

type ComposerMode = (typeof MODES)[number]["id"];

/**
 * The full-page chat in a measured three-column grid: conversations and the
 * usage footer in the left rail, the shared transcript and composer in the
 * middle, and the read ledger in its own right rail from xl up (lg parks a
 * compact copy under the list). One conversation with the sheet — asking
 * here, then opening the side panel, keeps the same turns. Below lg the rail
 * becomes a bottom drawer (the calendar's phone pattern), so history is
 * reachable at every width.
 */
export function AskView() {
  const ai = useAiWorkspace();
  const planApi = usePlanData();
  const toast = useToast();
  const router = useRouter();
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<ComposerMode>("chat");
  const [railOpen, setRailOpen] = useState(true);
  const [railDrawerOpen, setRailDrawerOpen] = useState(false);
  const enabled = Boolean(ai.aiStatus?.enabled);

  // Same context contract as the sheet: orientation only, never content.
  const screenContext = useMemo(
    () => ({ view: "ask" as const, date: istTodayIso() }),
    [],
  );

  const usage = aiUsageLabel(ai.aiStatus ?? null);

  const composerMeta = (
    <>
      <button
        type="button"
        aria-label="Clear conversation"
        title="Clear conversation"
        className="tap-target inline-flex size-8 items-center justify-center rounded-control text-muted transition-colors hover:bg-soft hover:text-ink disabled:pointer-events-none disabled:opacity-40"
        disabled={ai.chat.streaming || !ai.chat.messages.length}
        onClick={ai.chat.clear}
      >
        <Trash2 size={14} aria-hidden />
      </button>
      {ai.aiStatus?.credential ? (
        <span className="max-w-[24ch] truncate rounded-pill border border-rule-soft px-2 py-0.5 text-[11px] text-muted">
          {ai.aiStatus.credential.model} · read-only
        </span>
      ) : null}
      {usage ? (
        <span className="tabular-nums text-[11px] text-muted">{usage}</span>
      ) : null}
    </>
  );

  const conversationList = (
    <ConversationList
      history={ai.chat.history}
      streaming={ai.chat.streaming}
    />
  );

  // The header names WHERE you are: the active conversation's title, or the
  // fresh-conversation state until the first message lands.
  const conversationTitle = useMemo(() => {
    if (ai.chat.messages.length === 0) return "New conversation";
    const active = ai.chat.history.conversations.find(
      (conversation) => conversation.id === ai.chat.history.activeId,
    );
    return active?.title ?? "Conversation";
  }, [ai.chat.messages.length, ai.chat.history]);

  return (
    // The exact height the workspace frame leaves this page: the sticky app
    // header plus the one workspace-content padding (py-4, md:py-5). The
    // compact header takes one row; only the transcript scrolls.
    <div className="flex h-[calc(100dvh-var(--app-header-h,52px)-2rem)] min-h-0 flex-col md:h-[calc(100dvh-var(--app-header-h,52px)-2.5rem)]">
      {/* A chat header, not a page header: one row that says WHERE you are —
          the current conversation's title — and offers the two chat actions
          (new chat, history) without leaving the keyboard. The grounding
          sentence rides a styled tooltip on the Read-only chip; the full
          pledge lives in the empty state and the usage footer. */}
      <TooltipProvider delayDuration={250}>
        <header className="mb-3 flex items-center justify-between gap-3 border-b border-rule-soft pb-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              aria-hidden="true"
              className="grid size-8 shrink-0 place-items-center rounded-control bg-accent-soft text-accent"
            >
              <Sparkles size={15} />
            </span>
            <h1 className="shrink-0 font-serif text-[1.125rem] font-medium leading-tight tracking-[-0.01em] text-ink">
              Ask AI
            </h1>
            <span aria-hidden="true" className="h-4 w-px shrink-0 bg-rule-soft" />
            {/* The title opens history: the inline rail on desktop, the
                drawer below lg — two buttons, no viewport guessing. */}
            <button
              type="button"
              onClick={() => setRailOpen(true)}
              className="hidden min-w-0 truncate rounded-control px-1.5 py-0.5 text-sm text-muted transition-colors hover:bg-soft hover:text-ink lg:block"
              title={`${conversationTitle} — open history`}
            >
              {conversationTitle}
            </button>
            <button
              type="button"
              onClick={() => setRailDrawerOpen(true)}
              className="min-w-0 truncate rounded-control px-1.5 py-0.5 text-sm text-muted transition-colors hover:bg-soft hover:text-ink lg:hidden"
              title={`${conversationTitle} — open history`}
            >
              {conversationTitle}
            </button>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  tabIndex={0}
                  className="hidden shrink-0 items-center gap-1 rounded-pill border border-rule-soft px-2 py-0.5 text-[0.625rem] font-medium text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:inline-flex"
                >
                  <Shield size={10} aria-hidden className="text-accent" />
                  Read-only
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-64">
                Answers read your aggregates and latest 20 full mocks — never
                notes or identity.
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => ai.chat.history.newChat()}
              className="tap-target inline-flex items-center gap-1.5 rounded-control border border-rule px-2.5 py-1.5 text-xs font-medium text-ink transition-colors hover:border-ink"
              title="Start a new conversation"
            >
              <SquarePen size={14} aria-hidden />
              <span className="hidden md:inline">New chat</span>
            </button>
            {/* Desktop toggles the inline rail; below lg the same content
                opens as a bottom drawer, so no width ships a dead toggle. */}
            <button
              type="button"
              aria-expanded={railOpen}
              className="tap-target hidden items-center gap-1.5 rounded-control border border-rule px-2.5 py-1.5 text-xs font-medium text-ink transition-colors hover:border-ink lg:inline-flex"
              onClick={() => setRailOpen((open) => !open)}
            >
              <History size={14} aria-hidden />
              {railOpen ? "Hide history" : "Show history"}
            </button>
            <button
              type="button"
              aria-label="Conversation history"
              className="tap-target inline-flex size-9 items-center justify-center rounded-control border border-rule text-ink transition-colors hover:border-ink lg:hidden"
              onClick={() => setRailDrawerOpen(true)}
            >
              <History size={15} aria-hidden />
            </button>
          </div>
        </header>
      </TooltipProvider>
      <div
        className={cn(
          "min-h-0 flex-1",
          railOpen
            ? "grid gap-5 lg:grid-cols-[17.5rem_minmax(0,1fr)] xl:grid-cols-[17.5rem_minmax(0,1fr)_15.5rem]"
            : "flex flex-col xl:grid xl:grid-cols-[minmax(0,1fr)_15.5rem] xl:gap-5",
        )}
      >
        {railOpen && (
          <aside
            aria-label="Conversation history and AI activity"
            className="hidden min-h-0 flex-col border-r border-rule-soft pr-4 lg:flex"
          >
            <ConversationList
              history={ai.chat.history}
              streaming={ai.chat.streaming}
              className="min-h-0 flex-1"
            />
            {/* lg keeps a compact ledger under the list; xl gives it a full
                rail of its own on the right. */}
            <AiActivity
              refreshKey={ai.chat.messages.length}
              className="mt-4 h-52 shrink-0 xl:hidden"
            />
            <UsageFooter status={ai.aiStatus ?? null} className="mt-3" />
          </aside>
        )}
        <section className="flex min-h-0 min-w-0 flex-1 flex-col">
          {/* The measured column keeps answers and the composer at a readable
              line length on wide screens instead of running edge to edge. */}
          <div className="mx-auto flex min-h-0 w-full max-w-[44rem] flex-1 flex-col">
            <ChatTranscript
              messages={ai.chat.messages}
              streaming={ai.chat.streaming}
              phase={ai.chat.phase}
              model={ai.aiStatus?.credential?.model ?? undefined}
              onRetry={() => ai.chat.retryLast()}
              onEditResend={(id, text) => ai.chat.editResend(id, text)}
              onRegenerate={() => ai.chat.regenerateLast()}
              taskApi={{ createPersonalTask: planApi.createPersonalTask }}
              onTaskAdded={() => toast.success("Task added to My Tasks")}
              error={ai.chat.error}
              emptyState={
                enabled ? (
                  <ChatEmptyState
                    onSend={(text) => ai.chat.send(text, screenContext, false)}
                  />
                ) : (
                  <div className="mx-auto max-w-xl rounded-control border border-rule bg-canvas p-5">
                    <h3 className="font-serif text-lg font-medium text-ink">
                      Set up your AI provider
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted">
                      Ask AI runs on your own provider key. It is encrypted
                      before storage and never returned to this page.
                    </p>
                    <div className="mt-4">
                      <AiSettingsForm
                        variant="panel"
                        showHeading={false}
                        onChanged={() => void ai.refreshAiStatus()}
                      />
                    </div>
                  </div>
                )
              }
            />
            {enabled && (
              <div className="shrink-0 pt-3">
                {/* Mode chips — the DeepSeek/Claude toolbar grammar. The
                    active mode owns the composer body below; switching keeps
                    the transcript (and any running stream) untouched. */}
                <div
                  role="tablist"
                  aria-label="Assistant mode"
                  className="mb-2 flex items-center gap-1.5"
                >
                  {MODES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      aria-selected={mode === item.id}
                      onClick={() => setMode(item.id)}
                      className={cn(
                        "tap-target inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 text-xs font-medium transition-colors",
                        mode === item.id
                          ? "border-accent/30 bg-accent-soft text-accent"
                          : "border-transparent text-muted hover:bg-soft hover:text-ink",
                      )}
                    >
                      <item.icon size={12} aria-hidden />
                      {item.label}
                    </button>
                  ))}
                </div>

                {mode === "chat" ? (
                  <ChatComposer
                    value={input}
                    onChange={setInput}
                    onSubmit={(text, images) => {
                      ai.chat.send(text, screenContext, false, images);
                      setInput("");
                    }}
                    onStop={ai.chat.stop}
                    streaming={ai.chat.streaming}
                    visionEnabled={ai.aiStatus?.credential?.visionEnabled === true}
                    placeholder="Ask about your mocks, targets, or plan…"
                    meta={composerMeta}
                    followUps={ai.chat.messages.length > 0 ? FOLLOW_UPS : undefined}
                    onFollowUp={(text) => {
                      ai.chat.send(text, screenContext, false);
                      setInput("");
                    }}
                  />
                ) : (
                  <div className="max-h-[46dvh] overflow-y-auto overscroll-contain rounded-2xl border border-rule-soft bg-paper shadow-input">
                    {mode === "todos" ? (
                      <TodoAiComposer
                        compact
                        configured={enabled}
                        onAiConfigured={() => void ai.refreshAiStatus()}
                      />
                    ) : (
                      <LogMockFlow
                        configured={enabled}
                        visionEnabled={ai.aiStatus?.credential?.visionEnabled === true}
                        onAiConfigured={() => void ai.refreshAiStatus()}
                        onLogMock={(draft) => {
                          // The form stays the sole save path: the reviewed
                          // draft crosses to /add through the UI store, never
                          // the URL.
                          useUiStore.getState().requestMockPrefill(draft);
                          router.push("/add");
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
        <aside
          aria-label="AI read ledger"
          className="hidden min-h-0 flex-col border-l border-rule-soft pl-4 xl:flex"
        >
          <AiActivity
            refreshKey={ai.chat.messages.length}
            className="flex-1 pt-1"
          />
        </aside>
      </div>

      <Drawer open={railDrawerOpen} onOpenChange={setRailDrawerOpen}>
        <DrawerContent className="h-[72dvh]">
          <DrawerHandle />
          <DrawerTitle className="sr-only">
            Conversation history and AI activity
          </DrawerTitle>
          <DrawerBody className="flex flex-col gap-5">
            {conversationList}
            <AiActivity
              refreshKey={ai.chat.messages.length}
              className="min-h-0 flex-1"
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
