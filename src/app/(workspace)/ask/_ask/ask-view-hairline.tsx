"use client";

import * as React from "react";
import { History, Plus, Sparkles } from "lucide-react";
import {
  PromptComposer,
  type ComposerStatus,
} from "@/components/prompt-composer";
import { ApprovalCard } from "@/components/approval-card";
import { ThinkingIndicator } from "@/components/thinking-indicator";
import { ChatScroll } from "@/components/chat-scroll";
import { ChatNotice } from "@/components/chat-notice";
import { ChatHistory } from "@/components/chat-history";
import { UsageMeter } from "@/components/usage-meter";
import {
  UsageLimits,
  type ContextPart,
  type PlanLimit,
} from "@/components/usage-limits";
import { Button } from "@/components/button";
import { Dialog } from "@/components/dialog";
import { Icon } from "@/components/icon";
import { Popover } from "@/components/popover";
import { Sheet } from "@/components/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAiWorkspace } from "@/components/use-ai-workspace";
import { usePlanData } from "@/components/use-plan-data";
import { TodoAiComposer } from "@/components/shared/tasks/ai-composer";
import {
  LogMockFlow,
  type LogMockPayload,
} from "@/components/shared/ai/log-mock-flow";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import { NO_SCROLLBAR } from "@/lib/ui-scroll";
import { istTodayIso } from "@/lib/plan/view-model";
import { AskMessage } from "./AskMessage";
import { AskEmptyState } from "./ask-empty-state";

/* ─────────────────────────────────────────────────────────
 * Scroll ownership on /ask
 *
 * One scroller per state, never nested:
 *   empty    the host's ScrollArea (AskEmptyState is presentational)
 *   messages ChatScroll, which owns auto-follow and the jump pill
 *
 * The transcript used to be a ScrollArea whose child was ChatScroll's own
 * `overflow-y-auto` box, sized `h-full` inside a `min-h-full` parent. That
 * percentage resolved against an auto height, so ChatScroll's scroller never
 * constrained and the outer viewport took the wheel — leaving `distance()`,
 * the ResizeObserver and the jump pill measuring a box that did not scroll.
 * ───────────────────────────────────────────────────────── */

const INVISIBLE_VIEWPORT =
  "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

/** For containers whose own children each draw a bar (the history rail). */
const INVISIBLE_SCROLL = cn(
  INVISIBLE_VIEWPORT,
  "[&_*]:[scrollbar-width:none] [&_*]:[-ms-overflow-style:none] [&_*::-webkit-scrollbar]:hidden",
  "[&_[data-radix-scroll-area-scrollbar]]:hidden [&_[data-slot=scroll-area-scrollbar]]:hidden",
);

const HIDE_CHAT_FEEDBACK_BUTTONS = cn(
  "[&_button[aria-label*='like'i]]:hidden [&_button[aria-label*='dislike'i]]:hidden",
  "[&_button[title*='like'i]]:hidden [&_button[title*='dislike'i]]:hidden",
  "[&_button[aria-label*='helpful'i]]:hidden [&_button[aria-label*='thumb'i]]:hidden",
  "[&_button[data-action='like']]:hidden [&_button[data-action='dislike']]:hidden",
  "[&_button[data-feedback]]:hidden",
);

const MODES = [
  { id: "chat", label: "Chat" },
  { id: "todos", label: "Todos" },
  { id: "mock", label: "Mock" },
] as const;

type ComposerMode = (typeof MODES)[number]["id"];

const CONTEXT_WINDOW = 128_000;
/** A rough, fixed allowance for the tracker snapshot the server prepends. */
const TRACKER_SNAPSHOT_TOKENS = 6_000;
/** ~4 characters per token: an estimate, labelled as one in the panel. */
const estimateTokens = (chars: number) => Math.ceil(chars / 4);

/** Online/offline, so a dropped connection says so instead of failing a send. */
function useOnline() {
  return React.useSyncExternalStore(
    (onChange) => {
      window.addEventListener("online", onChange);
      window.addEventListener("offline", onChange);
      return () => {
        window.removeEventListener("online", onChange);
        window.removeEventListener("offline", onChange);
      };
    },
    () => navigator.onLine,
    () => true,
  );
}

export function AskViewHairline({ firstName }: { firstName?: string }) {
  const ai = useAiWorkspace();
  usePlanData();
  const online = useOnline();

  const [mode, setMode] = React.useState<ComposerMode>("chat");
  const [historyOpen, setHistoryOpen] = React.useState(true);
  const [historySheet, setHistorySheet] = React.useState(false);
  const [contextOpen, setContextOpen] = React.useState(false);
  const [toolSheet, setToolSheet] = React.useState<ComposerMode | null>(null);
  const [pendingDraft, setPendingDraft] = React.useState<
    | { kind: "todos"; count: number }
    | { kind: "mock"; draft: LogMockPayload }
    | null
  >(null);
  const [approvalStatus, setApprovalStatus] = React.useState<
    "pending" | "approved" | "denied" | null
  >(null);
  const [notes, setNotes] = React.useState<
    Array<{ id: number; text: string; at: string }>
  >([]);

  const noteId = React.useRef(0);
  const [isDesktop, setIsDesktop] = React.useState(false);

  // Below lg the context panel is a bottom sheet (matching history), from lg up
  // it is an anchored popover. One breakpoint, read once, no layout guessing.
  React.useEffect(() => {
    const query = window.matchMedia("(min-width: 64rem)");
    const sync = () => setIsDesktop(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const screen = React.useMemo(
    () => ({ view: "ask" as const, date: istTodayIso() }),
    [],
  );

  // Dismissal belongs to the Popover/Sheet primitives: Escape returns focus to
  // the trigger, and an outside press closes. No document listeners here.

  const messages = ai.chat.messages;
  const lastMessage = messages[messages.length - 1];
  const lastUser = messages.findLast((message) => message.role === "user");

  const enabled = Boolean(ai.aiStatus?.enabled);
  const streaming = ai.chat.streaming;
  const usage = ai.aiStatus?.usage;
  const personalKey = ai.aiStatus?.source === "user";
  const model =
    ai.aiStatus?.credential?.model ?? ai.aiStatus?.model ?? undefined;

  // Show the ThinkingIndicator at the top of the chat when a turn starts
  const isThinkingAtStart =
    ai.chat.phase === "connecting" ||
    (streaming &&
      (!lastMessage ||
        lastMessage.role === "user" ||
        lastMessage.content.trim().length === 0));

  // Timestamp when the in-flight turn was sent
  // Derived in render: Date.parse of a stored ISO stamp is deterministic.
  // Keeping a manual useMemo here trips the compiler's dependency inference
  // because it declares lastMessage?.at while the compiler infers lastMessage.
  const lastMessageAt = lastMessage?.at;
  const waitingSince = !streaming
    ? undefined
    : lastMessageAt
      ? Date.parse(lastMessageAt)
      : undefined;

  const status: ComposerStatus = streaming
    ? "streaming"
    : ai.chat.phase === "connecting"
      ? "submitted"
      : "ready";

  const limitHit =
    !!usage &&
    ((Number.isFinite(usage.limits.requests) &&
      usage.limits.requests > 0 &&
      usage.requests >= usage.limits.requests) ||
      (Number.isFinite(usage.limits.tokens) &&
        usage.limits.tokens > 0 &&
        usage.tokens >= usage.limits.tokens));
  const resetAt = usage?.resetAt ? Date.parse(usage.resetAt) : undefined;

  const planLimits: PlanLimit[] = React.useMemo(() => {
    const rows: PlanLimit[] = [];
    const resets = usage?.resetAt ? new Date(usage.resetAt) : undefined;
    if (usage) {
      rows.push({
        id: "requests",
        label: personalKey ? "Requests today (unlimited)" : "Requests today",
        used: usage.requests,
        limit: Number.isFinite(usage.limits.requests)
          ? usage.limits.requests
          : Math.max(usage.requests, 1),
        resetsAt: resets,
      });
      rows.push({
        id: "tokens",
        label: personalKey ? "Tokens today (unlimited)" : "Tokens today",
        used: usage.tokens,
        limit: Number.isFinite(usage.limits.tokens)
          ? usage.limits.tokens
          : Math.max(usage.tokens, 1),
        resetsAt: resets,
      });
    }
    return rows;
  }, [usage, personalKey]);

  // Honest token estimate from the active thread
  const historyTurns = ai.aiStatus?.credential?.historyTurns ?? 8;
  const conversationChars = React.useMemo(
    () =>
      messages
        .slice(-historyTurns * 2)
        .reduce((sum, message) => sum + message.content.length, 0),
    [messages, historyTurns],
  );

  const contextParts: ContextPart[] = React.useMemo(
    () => [
      {
        id: "tracker",
        label: "Tracker snapshot (est.)",
        tokens: TRACKER_SNAPSHOT_TOKENS,
      },
      {
        id: "conversation",
        label: "Conversation (est.)",
        tokens: estimateTokens(conversationChars),
      },
    ],
    [conversationChars],
  );

  const usedContextTokens = React.useMemo(
    () => contextParts.reduce((sum, part) => sum + part.tokens, 0),
    [contextParts],
  );

  const note = React.useCallback((text: string) => {
    noteId.current += 1;
    setNotes((rows) => [
      ...rows,
      {
        id: noteId.current,
        text,
        at: new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      },
    ]);
  }, []);

  const chats = React.useMemo(
    () =>
      ai.chat.history.conversations.map((conversation) => ({
        id: conversation.id,
        title: conversation.title,
        updatedAt: new Date(conversation.updatedAt),
      })),
    [ai.chat.history.conversations],
  );

  const send = React.useCallback(
    (text: string) => ai.chat.send(text, screen, false),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ai.chat.send, screen],
  );

  const historyPanel = (
    <ScrollArea
      className={cn("min-h-0 flex-1", INVISIBLE_SCROLL)}
      viewportClassName={cn("h-full", INVISIBLE_VIEWPORT)}
    >
      <ChatHistory
        chats={chats}
        activeId={ai.chat.history.activeId ?? undefined}
        onSelect={(id) => {
          ai.chat.history.select(id);
          setHistorySheet(false);
        }}
        onNew={() => {
          ai.chat.history.newChat();
          setHistorySheet(false);
        }}
        onRename={ai.chat.history.rename}
        onDelete={ai.chat.history.remove}
        className={cn("min-h-0 flex-1 px-2", INVISIBLE_SCROLL)}
      />
    </ScrollArea>
  );

  const usagePanel = (
    <UsageLimits
      context={{ limit: CONTEXT_WINDOW, parts: contextParts }}
      plan={personalKey ? "Your own key" : "Shared deployment key"}
      limits={planLimits}
      locales="en-IN"
    />
  );

  /**
   * The ring, as an element so the Popover can clone it (it attaches
   * aria-haspopup/aria-expanded/aria-controls and the click). It ships its own
   * aria-label and title too, so the below-lg Sheet — which renders this button
   * without cloning — is equally reachable.
   */
  const ringTrigger = (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={contextOpen}
      aria-label="Open context window and plan limits"
      title="Context window & plan limits"
      className="ml-1 inline-flex cursor-pointer items-center gap-1.5 rounded-full px-1 py-0.5 text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      {/* Always the context window: one visual, one meaning. Today's plan
          limits live in the panel, not behind the same ring. */}
      <UsageMeter
        variant="ring"
        used={usedContextTokens}
        limit={CONTEXT_WINDOW}
        unit="tokens"
        label="Context window"
      />
      <span className="hidden text-[11px] tabular-nums sm:inline">
        {Math.round((usedContextTokens / CONTEXT_WINDOW) * 100)}%
      </span>
    </button>
  );

  const modeChips = (
    <div className="flex min-w-0 flex-wrap items-center gap-1">
      {/* Only the tabs sit inside the tablist; the ring is a sibling, so the
          tablist contains nothing but tabs. */}
      <div
        role="tablist"
        aria-label="Assistant mode"
        className="flex min-w-0 items-center gap-1"
      >
        {MODES.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={mode === item.id}
            onClick={() => {
              setMode(item.id);
              if (item.id !== "chat") setToolSheet(item.id);
            }}
            className={cn(
              "cursor-pointer rounded-full px-2.5 py-1 text-[12.5px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/40",
              mode === item.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* The ring lives here, in the toolbar. From lg up the Hairline Popover
          wraps it in place and portals its panel to the body, so the panel can
          never be clipped by the shell's overflow-hidden and can flip/shift to
          stay in view; below lg the same button opens the bottom sheet. Both
          surfaces host the one panel body. */}
      {isDesktop ? (
        <Popover
          trigger={ringTrigger}
          open={contextOpen}
          onOpenChange={setContextOpen}
          side="top"
          align="start"
          width={320}
          label="Context window and plan limits"
        >
          {usagePanel}
        </Popover>
      ) : (
        React.cloneElement(ringTrigger, {
          onClick: () => setContextOpen(true),
        })
      )}
    </div>
  );

  const closeTool = () => {
    setToolSheet(null);
    setMode("chat");
  };

  return (
    <div className="flex h-[calc(100dvh-var(--app-header-h,52px)-2rem)] min-h-0 min-w-0 flex-col gap-3 overflow-hidden md:h-[calc(100dvh-var(--app-header-h,52px)-2.5rem)]">
      {/* ── header ───────────────────────────────────────── */}
      <header className="flex shrink-0 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--primary)_22%,transparent)]"
          >
            <Sparkles className="size-[18px]" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate font-serif text-[1.1875rem] font-medium leading-tight tracking-[-0.01em] text-foreground">
              Ask AI
            </h1>
            <p className="mt-0.5 hidden truncate text-[12px] leading-none text-muted-foreground sm:block">
              {firstName ? `${firstName}'s study coach` : "Your study coach"} ·
              answers from your tracker
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => ai.chat.history.newChat()}
            title="Start a new conversation"
            icon={<Plus className="size-3.5" />}
          >
            <span className="hidden md:inline">New chat</span>
            <span className="sr-only md:hidden">New chat</span>
          </Button>

          {/* Desktop-only rail toggle. Visibility lives on a WRAPPER, not on the
              Button: `Button` appends `className` raw and always ships
              `inline-flex`, which sits later in the stylesheet than `.hidden`,
              so a `hidden` passed to the Button would never win. */}
          <span className="hidden lg:inline-flex">
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-pressed={historyOpen}
              aria-expanded={historyOpen}
              onClick={() => setHistoryOpen((open) => !open)}
              icon={<History className="size-3.5" />}
            >
              {historyOpen ? "Hide history" : "Show history"}
            </Button>
          </span>

          {/* Mobile-only history entry point: the rail is not rendered below lg,
              so this single icon button opens the list in a bottom sheet. Same
              reason as above - the breakpoint class rides the wrapper. */}
          <span className="inline-flex lg:hidden">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Conversation history"
              onClick={() => setHistorySheet(true)}
            >
              <History className="size-4" />
            </Button>
          </span>
        </div>
      </header>

      {/* ── workspace ────────────────────────────────────── */}
      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden rounded-2xl bg-card text-card-foreground shadow-[inset_0_0_0_1px_var(--border)]">
        {historyOpen ? (
          <aside
            aria-label="Conversation history"
            className="hidden min-h-0 w-[16.5rem] shrink-0 flex-col overflow-hidden border-r border-border lg:flex"
          >
            <div className="flex shrink-0 items-center justify-between px-4 pb-1.5 pt-3.5">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                History
              </h2>
              <span className="text-[11px] tabular-nums text-muted-foreground">
                {chats.length}
              </span>
            </div>
            {historyPanel}
          </aside>
        ) : null}

        <section
          aria-label="Conversation"
          className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
        >
          {/* ── thinking indicator at the top of chat on start ── */}
          {isThinkingAtStart ? (
            <div
              role="status"
              aria-live="polite"
              className="z-10 shrink-0 border-b border-border/60 bg-card/95 px-4 py-2.5 backdrop-blur-sm sm:px-6"
            >
              <div className="mx-auto w-full max-w-[46rem]">
                <ThinkingIndicator
                  variant="orbit"
                  label="Reading the workspace"
                  startedAt={waitingSince}
                />
              </div>
            </div>
          ) : null}

          {/* ── the conversation stream ──
              Empty: the host's ScrollArea is the only scroller.
              Populated: ChatScroll owns its own box (`h-full` against a real
              flex height) so auto-follow, the ResizeObserver and the jump
              pill measure the element that actually scrolls. */}
          {messages.length === 0 ? (
            <ScrollArea
              className={cn("min-h-0 min-w-0 flex-1", INVISIBLE_SCROLL)}
              viewportClassName="h-full w-full"
            >
              <div className="mx-auto w-full max-w-[46rem] px-4 sm:px-6">
                <AskEmptyState
                  firstName={firstName}
                  disabled={!enabled || streaming || limitHit}
                  onPick={(prompt) => void send(prompt)}
                />
              </div>
            </ScrollArea>
          ) : (
            <ChatScroll
              streaming={streaming}
              followKey={lastUser?.id}
              className="h-full min-h-0 min-w-0 flex-1"
              contentClassName={cn(
                "mx-auto flex w-full max-w-[46rem] min-w-0 flex-col gap-7 px-4 py-6 sm:px-6",
                HIDE_CHAT_FEEDBACK_BUTTONS,
              )}
            >
              {messages.map((message) => (
                <AskMessage
                  key={message.id}
                  message={{
                    id: message.id,
                    role: message.role,
                    content: message.content,
                    at: message.at,
                    model: message.role === "assistant" ? model : undefined,
                    reasoning: message.reasoning,
                    reasoningSeconds: message.reasoningSeconds,
                    stopped: message.stopped,
                    truncated: message.truncated,
                  }}
                  ai={ai}
                  onRetry={() => ai.chat.retryLast()}
                  screenContext={screen}
                  phase={
                    isThinkingAtStart && ai.chat.phase === "connecting"
                      ? "idle"
                      : ai.chat.phase
                  }
                  waitingSince={waitingSince}
                />
              ))}

              {pendingDraft ? (
                <div className="min-w-0 sm:pl-11">
                  <ApprovalCard
                    title={
                      pendingDraft.kind === "todos"
                        ? `Apply ${pendingDraft.count} todo ${
                            pendingDraft.count === 1 ? "change" : "changes"
                          }?`
                        : "Continue to the mock form with this draft?"
                    }
                    description={
                      pendingDraft.kind === "todos"
                        ? "The coach drafted these changes from your planner. Nothing is written until you approve."
                        : "The parsed scorecard goes to the Add Mock form, which stays the only place that saves."
                    }
                    details={
                      pendingDraft.kind === "todos"
                        ? [
                            { label: "Scope", value: "Personal tasks" },
                            {
                              label: "Changes",
                              value: String(pendingDraft.count),
                            },
                          ]
                        : [
                            { label: "Scope", value: "Mock attempt" },
                            {
                              label: "Next step",
                              value: "Review and save in /add",
                            },
                          ]
                    }
                    status={approvalStatus ?? "pending"}
                    onApprove={() => {
                      if (pendingDraft.kind === "mock") {
                        useUiStore
                          .getState()
                          .requestMockPrefill(pendingDraft.draft);
                        note("Draft sent to the mock form");
                      } else {
                        note(`${pendingDraft.count} todo changes applied`);
                      }
                      setApprovalStatus("approved");
                      setPendingDraft(null);
                    }}
                    onDeny={() => {
                      setApprovalStatus("denied");
                      setPendingDraft(null);
                      note("Draft dismissed");
                    }}
                    approveLabel={
                      pendingDraft.kind === "mock" ? "Open the form" : "Apply"
                    }
                    denyLabel="Dismiss"
                  />
                </div>
              ) : null}

              {notes.length > 0 ? (
                <div
                  className="flex flex-col items-center gap-1.5 py-1"
                  aria-live="polite"
                >
                  {notes.map((row) => (
                    <p
                      key={row.id}
                      className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
                    >
                      <Icon name="check" size={11} tone="success" />
                      {row.text}
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{row.at}</span>
                    </p>
                  ))}
                </div>
              ) : null}
            </ChatScroll>
          )}

          {/* ── composer dock ── */}
          <div className="relative shrink-0 px-3 pb-3 pt-1 sm:px-6 sm:pb-4">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 -top-6 h-6 bg-gradient-to-t from-card to-transparent"
            />
            <div className="relative mx-auto w-full max-w-[46rem] space-y-2.5">
              {!online ? (
                <ChatNotice
                  kind="offline"
                  onRetry={() => ai.chat.retryLast()}
                />
              ) : limitHit ? (
                <ChatNotice
                  kind="rate-limit"
                  resetAt={resetAt}
                  description={
                    personalKey
                      ? "You have reached today's safety ceiling for your key."
                      : "The shared key's daily allowance is used up. Add your own key in Settings for more."
                  }
                />
              ) : ai.chat.error && !streaming ? (
                <ChatNotice
                  kind="error"
                  title="That answer didn't come through"
                  description="Your question is still in the thread. Try again, or rephrase it."
                  details={ai.chat.error}
                  onRetry={() => ai.chat.retryLast()}
                />
              ) : null}

              {!enabled && ai.aiStatus ? (
                <div
                  role="status"
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-warning/10 px-3.5 py-2.5 text-[12.5px] text-foreground shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--warning)_30%,transparent)]"
                >
                  <span className="flex items-center gap-2">
                    <Icon name="shield" size={14} tone="warning" />
                    No AI provider is connected yet.
                  </span>
                  <a
                    href="/settings"
                    className="font-medium text-primary underline decoration-primary/30 underline-offset-[3px] hover:decoration-primary"
                  >
                    Add a provider and key
                  </a>
                </div>
              ) : null}

              <PromptComposer
                status={status}
                onSubmit={(text) => void send(text)}
                onStop={ai.chat.stop}
                placeholder="Ask about your mocks, targets, or plan…"
                disabled={!enabled || limitHit}
                disabledReason={
                  !enabled
                    ? "Add a provider and key in Settings → AI provider."
                    : limitHit
                      ? "Today's limit is reached. It resets soon."
                      : undefined
                }
                toolbar={modeChips}
                maxLength={4000}
                className="w-full"
              />
              {/* Scope, stated once at the composer rather than inside the
                  context panel, which now has one job. */}
              <p className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-center text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Icon name="shield" size={11} tone="primary" />
                  Read-only
                </span>
                <span aria-hidden="true">·</span>
                <span>Latest 20 full mocks</span>
                <span aria-hidden="true">·</span>
                <span>Notes never sent</span>
                <span aria-hidden="true">·</span>
                <span>Answers can be wrong</span>
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ── context panel, below lg: the ring opens a bottom sheet, matching how
          history behaves. From lg up the Popover in the toolbar hosts the same
          body in place. ── */}
      {!isDesktop ? (
        <Sheet
          open={contextOpen}
          onOpenChange={setContextOpen}
          side="bottom"
          title="Context window"
        >
          <div className="pb-2">{usagePanel}</div>
        </Sheet>
      ) : null}

      {/* ── mobile history ──
          Below lg the rail is not rendered, so the header's single icon button
          opens the list here instead. */}
      <Sheet
        open={historySheet}
        onOpenChange={setHistorySheet}
        side="bottom"
        title="Conversation history"
      >
        <div className="flex h-[70dvh] min-h-0 flex-col overflow-hidden">
          {historyPanel}
        </div>
      </Sheet>

      {/* ── mode tools: centered dialogs ──
          The chat keeps its place underneath, and the body is the dialog's one
          scroll region. `NO_SCROLLBAR` hides the painted bar without disabling
          scrolling, so wheel and touch still reach the long review list. */}
      <Dialog
        open={toolSheet === "todos"}
        onOpenChange={(open) => {
          if (!open) closeTool();
        }}
        title="Plan todos with AI"
        size="lg"
        className="max-h-[min(85dvh,760px)]"
        bodyClassName={cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-2",
          NO_SCROLLBAR,
        )}
      >
        <TodoAiComposer
          variant="page"
          compact={false}
          configured={enabled}
          onAiConfigured={() => void ai.refreshAiStatus()}
          onApplied={(count) => {
            setPendingDraft({ kind: "todos", count });
            setApprovalStatus("pending");
            closeTool();
          }}
        />
      </Dialog>

      <Dialog
        open={toolSheet === "mock"}
        onOpenChange={(open) => {
          if (!open) closeTool();
        }}
        title="Log a mock with AI"
        size="lg"
        className="max-h-[min(85dvh,760px)]"
        bodyClassName={cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-2",
          NO_SCROLLBAR,
        )}
      >
        <LogMockFlow
          variant="page"
          configured={enabled}
          visionEnabled={ai.aiStatus?.credential?.visionEnabled === true}
          onAiConfigured={() => void ai.refreshAiStatus()}
          onLogMock={(draft) => {
            setPendingDraft({ kind: "mock", draft });
            setApprovalStatus("pending");
            closeTool();
          }}
        />
      </Dialog>
    </div>
  );
}