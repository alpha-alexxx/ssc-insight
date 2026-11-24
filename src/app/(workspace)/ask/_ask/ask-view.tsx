"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon, type IconName } from "@/components/icon";
import { Button } from "@/components/button";
import { Sheet } from "@/components/sheet";
import { Tooltip } from "@/components/tooltip";
import { toast } from "@/components/toast-stack";
import { aiUsageLabel, useAiWorkspace } from "@/components/use-ai-workspace";
import { usePlanData } from "@/components/use-plan-data";
import { AiSettingsForm } from "@/components/ai-settings-form";
import { TodoAiComposer } from "@/components/shared/tasks/ai-composer";
import { LogMockFlow } from "@/components/shared/ai/log-mock-flow";
import { useUiStore } from "@/stores/ui-store";
import { ChatTranscript } from "@/components/shared/ai/chat-transcript";
import { ChatComposer } from "@/components/shared/ai/chat-composer";
import { ChatEmptyState } from "@/components/shared/ai/chat-empty-state";
import { ConversationList } from "@/components/shared/ai/conversation-list";
import { UsageFooter } from "@/components/shared/ai/usage-footer";
import { AiActivity } from "./ai-activity";
import { istTodayIso } from "@/lib/plan/view-model";
import { cn } from "@/lib/utils";

/** The composer's modes, surfaced as chips: Chat, Todos (AI task drafts),
 * Mock (AI report parsing that hands off to /add). */
const MODES = [
  { id: "chat", label: "Chat", icon: "chat" },
  { id: "todos", label: "Todos", icon: "list" },
  { id: "mock", label: "Mock", icon: "paste" },
] as const;

type ComposerMode = (typeof MODES)[number]["id"];

/**
 * The full-page chat in a measured three-column grid: conversations and the
 * usage footer in the left rail, the shared transcript and composer in the
 * middle, and the read ledger in its own right rail from xl up (lg parks a
 * compact copy under the list). One conversation with the sheet — asking
 * here, then opening the side panel, keeps the same turns. Below lg the rail
 * becomes a bottom sheet (the calendar's phone pattern), so history is
 * reachable at every width.
 */
export function AskView({ firstName }: { firstName?: string }) {
  const ai = useAiWorkspace();
  const planApi = usePlanData();
  const router = useRouter();
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<ComposerMode>("chat");
  const [railOpen, setRailOpen] = useState(true);
  const [railDrawerOpen, setRailDrawerOpen] = useState(false);
  // Tool takeovers: a parsed/ledger view owning the middle column.
  const [todosTakeover, setTodosTakeover] = useState(false);
  const [mockTakeover, setMockTakeover] = useState(false);
  const enabled = Boolean(ai.aiStatus?.enabled);

  // Tool outcomes surface as quiet system lines at the transcript tail.
  // Per-visit state: they are conversation-adjacent, not conversation.
  type ToolNote = {
    id: number;
    icon: "check" | "arrow";
    text: string;
    time: string;
  };
  const [toolNotes, setToolNotes] = useState<ToolNote[]>([]);
  const noteId = useRef(0);
  function addToolNote(icon: "check" | "arrow", text: string) {
    noteId.current += 1;
    const time = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    setToolNotes((notes) => [
      ...notes,
      { id: noteId.current, icon, text, time },
    ]);
  }
  const systemLineNodes = toolNotes.length ? (
    <div className="flex flex-col items-center gap-1.5 py-2">
      {toolNotes.map((note) => (
        <p
          key={note.id}
          className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
        >
          {note.icon === "check" ? (
            <Icon name="check" size={11} tone="success" />
          ) : (
            <Icon name="arrowRight" size={11} tone="primary" />
          )}
          {note.text}
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{note.time}</span>
        </p>
      ))}
    </div>
  ) : undefined;

  // Same context contract as the sheet: orientation only, never content.
  const screenContext = useMemo(
    () => ({ view: "ask" as const, date: istTodayIso() }),
    [],
  );

  const usage = aiUsageLabel(ai.aiStatus ?? null);

  // The header names WHERE you are: the active conversation's title, or the
  // fresh-conversation state until the first message lands.
  const conversationTitle = useMemo(() => {
    if (ai.chat.messages.length === 0) return "New conversation";
    const active = ai.chat.history.conversations.find(
      (conversation) => conversation.id === ai.chat.history.activeId,
    );
    return active?.title ?? "Conversation";
  }, [ai.chat.messages.length, ai.chat.history]);

  const conversationList = (
    <ConversationList history={ai.chat.history} streaming={ai.chat.streaming} />
  );

  const modeChips = (
    <div
      role="tablist"
      aria-label="Assistant mode"
      className="mb-2 flex items-center gap-1.5"
    >
      {MODES.map((item) => {
        const pending =
          (item.id === "todos" && todosTakeover) ||
          (item.id === "mock" && mockTakeover);
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={mode === item.id}
            onClick={() => setMode(item.id)}
            className={cn(
              "relative inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
              mode === item.id
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <Icon name={item.icon as IconName} size={12} />
            {item.label}
            {pending && mode !== item.id ? (
              <span
                aria-hidden="true"
                className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-primary"
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );

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
      <header className="mb-3 flex items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"
          >
            <Icon name="sparkles" size={15} />
          </span>
          <h1 className="shrink-0 font-serif text-[1.125rem] font-medium leading-tight tracking-[-0.01em] text-foreground">
            Ask AI
          </h1>
          <span aria-hidden="true" className="h-4 w-px shrink-0 bg-border" />
          {/* The title opens history: the inline rail on desktop, the
              bottom sheet below lg — two buttons, no viewport guessing. */}
          <button
            type="button"
            onClick={() => setRailOpen(true)}
            className="hidden min-w-0 truncate rounded-lg px-1.5 py-0.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:block"
            title={`${conversationTitle} — open history`}
          >
            {conversationTitle}
          </button>
          <button
            type="button"
            onClick={() => setRailDrawerOpen(true)}
            className="min-w-0 truncate rounded-lg px-1.5 py-0.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
            title={`${conversationTitle} — open history`}
          >
            {conversationTitle}
          </button>
          <Tooltip
            content={
              <span className="block max-w-64 whitespace-normal text-left">
                Answers read your aggregates and latest 20 full mocks — never
                notes or identity.
              </span>
            }
          >
            <span
              tabIndex={0}
              className="hidden shrink-0 items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:inline-flex"
            >
              <Icon name="shield" size={10} tone="primary" />
              Read-only
            </span>
          </Tooltip>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => ai.chat.history.newChat()}
            title="Start a new conversation"
            icon={<Icon name="edit" size={14} />}
          >
            <span className="hidden md:inline">New chat</span>
          </Button>
          {/* Desktop toggles the inline rail; below lg the same content
              opens as a bottom sheet, so no width ships a dead toggle. */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-expanded={railOpen}
            className="hidden lg:inline-flex"
            onClick={() => setRailOpen((open) => !open)}
            icon={<Icon name="history" size={14} />}
          >
            {railOpen ? "Hide history" : "Show history"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Conversation history"
            className="lg:hidden"
            onClick={() => setRailDrawerOpen(true)}
          >
            <Icon name="history" size={15} />
          </Button>
        </div>
      </header>
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
            className="hidden min-h-0 flex-col border-r border-border pr-4 lg:flex"
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
          <div className="mx-auto flex min-h-0 w-full max-w-[46rem] flex-1 flex-col">
            {/* In Chat mode the transcript leads; the Todos/Mock tools own
                the whole column (their takeover views included), so the
                transcript only renders when it is the active surface. */}
            {mode === "chat" && !todosTakeover && !mockTakeover ? (
              <ChatTranscript
                messages={ai.chat.messages}
                streaming={ai.chat.streaming}
                phase={ai.chat.phase}
                model={ai.aiStatus?.credential?.model ?? undefined}
                systemLines={systemLineNodes}
                onRetry={() => ai.chat.retryLast()}
                onEditResend={(id, text) => ai.chat.editResend(id, text)}
                onRegenerate={() => ai.chat.regenerateLast()}
                taskApi={{ createPersonalTask: planApi.createPersonalTask }}
                onTaskAdded={() => toast.success("Task added to My Tasks")}
                error={ai.chat.error}
                emptyState={
                  enabled ? (
                    <ChatEmptyState
                      firstName={firstName}
                      onSend={(text) =>
                        ai.chat.send(text, screenContext, false)
                      }
                    />
                  ) : (
                    <div className="mx-auto max-w-xl rounded-2xl bg-card p-5 text-card-foreground shadow-[inset_0_0_0_1px_var(--border)]">
                      <h3 className="text-base font-semibold text-foreground">
                        Set up your AI provider
                      </h3>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
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
            ) : null}
            {enabled && (
              <div
                className={cn(
                  "pt-3",
                  todosTakeover || mockTakeover
                    ? "flex min-h-0 flex-1 flex-col"
                    : "shrink-0",
                )}
              >
                {/* Mode chips — visible in every non-takeover state; they
                    hide while a ledger/roster owns the column (its back
                    arrow is the way out). A pending draft in a background
                    mode marks its chip with a primary dot. */}
                {!todosTakeover && !mockTakeover ? modeChips : null}

                {mode === "chat" ? (
                  <>
                    <ChatComposer
                      value={input}
                      onChange={setInput}
                      onSubmit={(text, images) => {
                        ai.chat.send(text, screenContext, false, images);
                        setInput("");
                      }}
                      onStop={ai.chat.stop}
                      streaming={ai.chat.streaming}
                      visionEnabled={
                        ai.aiStatus?.credential?.visionEnabled === true
                      }
                      placeholder="Ask about your mocks, targets, or plan…"
                      usage={usage}
                      modes={MODES}
                      mode={mode}
                      onModeChange={setMode}
                      onClear={ai.chat.clear}
                    />
                    <p className="mt-2 text-center text-[11px] text-muted-foreground">
                      Answers are generated from your tracker snapshot and can
                      be wrong.
                    </p>
                  </>
                ) : null}

                {/* Todos tool — owns the column in Todos mode; its draft
                    ledger takes over via the takeover flag. Always mounted so
                    a draft survives switching chips. */}
                <div
                  className={cn(
                    "flex min-h-0 flex-1 flex-col",
                    mode !== "todos" && "hidden",
                  )}
                >
                  {enabled ? (
                    <TodoAiComposer
                      variant="page"
                      configured={enabled}
                      onAiConfigured={() => void ai.refreshAiStatus()}
                      onTakeoverChange={setTodosTakeover}
                      onApplied={(count) =>
                        addToolNote(
                          "check",
                          count +
                            (count === 1 ? " todo created" : " todos created"),
                        )
                      }
                    />
                  ) : (
                    <div className="rounded-2xl bg-card p-4 text-card-foreground shadow-[inset_0_0_0_1px_var(--border)]">
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        Todo planning runs on AI. Set up a provider below to
                        draft revision todos here.
                      </p>
                      <div className="mt-3">
                        <AiSettingsForm
                          variant="panel"
                          showHeading={false}
                          onChanged={() => void ai.refreshAiStatus()}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Mock tool — same ownership grammar; a parsed draft's
                    roster takes over, and the hand-off resets the flow. */}
                <div
                  className={cn(
                    "flex min-h-0 flex-1 flex-col",
                    mode !== "mock" && "hidden",
                  )}
                >
                  {enabled ? (
                    <LogMockFlow
                      variant="page"
                      configured={enabled}
                      visionEnabled={
                        ai.aiStatus?.credential?.visionEnabled === true
                      }
                      onAiConfigured={() => void ai.refreshAiStatus()}
                      onTakeoverChange={setMockTakeover}
                      onHandoff={() =>
                        addToolNote("arrow", "Mock draft sent to the form")
                      }
                      onLogMock={(draft) => {
                        // The form stays the sole save path: the reviewed
                        // draft crosses to /add through the UI store, never
                        // the URL.
                        useUiStore.getState().requestMockPrefill(draft);
                        router.push("/add");
                      }}
                    />
                  ) : (
                    <div className="rounded-2xl bg-card p-4 text-card-foreground shadow-[inset_0_0_0_1px_var(--border)]">
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        Mock parsing works without AI for standard scorecards.
                        Set up a provider below to parse with AI and attach
                        screenshots.
                      </p>
                      <div className="mt-3">
                        <AiSettingsForm
                          variant="panel"
                          showHeading={false}
                          onChanged={() => void ai.refreshAiStatus()}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
        <aside
          aria-label="AI read ledger"
          className="hidden min-h-0 flex-col border-l border-border pl-4 xl:flex"
        >
          <AiActivity
            refreshKey={ai.chat.messages.length}
            className="flex-1 pt-1"
          />
        </aside>
      </div>

      {/* Below lg the rail opens as a bottom sheet (the calendar's phone
          pattern): the same history list and read ledger, drag-to-dismiss. */}
      <Sheet
        open={railDrawerOpen}
        onOpenChange={setRailDrawerOpen}
        side="bottom"
        title="Conversation history and AI activity"
      >
        <div className="flex h-[70dvh] min-h-0 flex-col gap-5 overflow-y-auto overscroll-contain">
          {conversationList}
          <AiActivity
            refreshKey={ai.chat.messages.length}
            className="min-h-0 flex-1"
          />
        </div>
      </Sheet>
    </div>
  );
}
