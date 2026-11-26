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
import { PillSelect } from "@/components/pill-select";
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

/**
 * Prevents collapsed or unused thinking/reasoning blocks inside AskMessage
 * from reserving vertical gap, margin, or empty grid rows. (The article's own
 * rhythm is margin-driven since the avatar row went away, so no gap rule here.)
 */
const NORMALIZE_THINKING_SPACE = cn(
  "[&_details:empty]:hidden",
  "[&_details:not([open])]:mb-0 [&_details:not([open])]:pb-0",
  "[&_[data-state='closed']]:mb-0 [&_[data-state='closed']]:pb-0",
  "[&_[data-reasoning]:empty]:hidden [&_[data-thinking]:empty]:hidden",
);

const MODES = [
  { id: "chat", label: "Chat", description: "Talk with the coach" },
  { id: "todos", label: "Todos", description: "Plan tasks with AI" },
  { id: "mock", label: "Mock", description: "Log a mock with AI" },
] as const;

type ComposerMode = (typeof MODES)[number]["id"];

const CONTEXT_WINDOW = 128_000;
/** A rough, fixed allowance for the tracker snapshot the server prepends. */
const TRACKER_SNAPSHOT_TOKENS = 6_000;
/** ~4 characters per token: an estimate, labelled as one in the panel. */
const estimateTokens = (chars: number) => Math.ceil(chars / 4);

/** Formats provider/model strings into a concise badge label. */
function formatModelName(raw: string): string {
  const cleaned = raw.trim();
  const parts = cleaned.split("/");
  return parts[parts.length - 1] || cleaned;
}

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
  const [contextSheet, setContextSheet] = React.useState(false);
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

  const screen = React.useMemo(
    () => ({ view: "ask" as const, date: istTodayIso() }),
    [],
  );

  const messages = ai.chat.messages;
  const lastMessage = messages[messages.length - 1];
  const lastUser = messages.findLast((message) => message.role === "user");

  const enabled = Boolean(ai.aiStatus?.enabled);
  const streaming = ai.chat.streaming;
  const usage = ai.aiStatus?.usage;
  const personalKey = ai.aiStatus?.source === "user";
  const model =
    ai.aiStatus?.credential?.model ?? ai.aiStatus?.model ?? undefined;

  // Show the ThinkingIndicator at the top only when a turn is starting and no
  // assistant text or reasoning has begun streaming into the thread yet.
  const isThinkingAtStart =
    ai.chat.phase === "connecting" ||
    (streaming &&
      (!lastMessage ||
        lastMessage.role === "user" ||
        (lastMessage.content.trim().length === 0 &&
          !lastMessage.reasoning?.trim())));

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
   * Context ring trigger: UsageMeter (variant="ring") already renders the
   * percentage label internally, so no duplicate <span> is rendered next to it.
   * Desktop opens the Hairline Popover; below lg the same ring opens the
   * bottom Sheet, so the panel never has to squeeze into a popover on a phone.
   */
  const ringTrigger = (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={contextOpen}
      aria-label="Open context window and plan limits"
      title="Context window & plan limits"
      className="hidden cursor-pointer items-center rounded-full px-1.5 py-0.5 text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 lg:inline-flex"
    >
      <UsageMeter
        variant="ring"
        used={usedContextTokens}
        limit={CONTEXT_WINDOW}
        unit="tokens"
        label="Context window"
      />
    </button>
  );

  const ringSheetTrigger = (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={contextSheet}
      aria-label="Open context window and plan limits"
      title="Context window & plan limits"
      onClick={() => setContextSheet(true)}
      className="inline-flex cursor-pointer items-center rounded-full px-1.5 py-0.5 text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 lg:hidden"
    >
      <UsageMeter
        variant="ring"
        used={usedContextTokens}
        limit={CONTEXT_WINDOW}
        unit="tokens"
        label="Context window"
      />
    </button>
  );

  const modeChips = (
    <div className="flex min-w-0 items-center gap-1.5">
      <div
        role="tablist"
        aria-label="Assistant mode"
        className="hidden min-w-0 items-center gap-1 lg:flex"
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

      {/* Below lg the three modes live in one select pill, so the composer's
          action row stays single-line and relaxed on a phone. Picking a tool
          opens its dialog; the pill always reads the resting Chat mode. */}
      <span className="inline-flex min-w-0 lg:hidden">
        <PillSelect
          options={MODES.map((item) => ({
            value: item.id,
            label: item.label,
            description: item.description,
          }))}
          value="chat"
          onValueChange={(next) => {
            if (next !== "chat") {
              const tool = next as ComposerMode;
              setMode(tool);
              setToolSheet(tool);
            }
          }}
          label="Assistant mode"
          placeholder="Chat"
          width={230}
          size="md"
        />
      </span>

      {/* Context Popover (lg+) and the ring that opens the Sheet below lg */}
      <Popover
        trigger={ringTrigger}
        open={contextOpen}
        onOpenChange={setContextOpen}
        side="top"
        align="start"
        width={300}
        label="Context window and plan limits"
      >
        {usagePanel}
      </Popover>
      {ringSheetTrigger}

      {/* Active Model Badge Chip inside input toolbar */}
      {model ? (
        <span
          title={`Active model: ${model}`}
          className="hidden max-w-[10.5rem] shrink-0 items-center gap-1.5 truncate rounded-full bg-muted/70 px-2.5 py-0.5 text-[11.5px] font-medium text-muted-foreground shadow-[inset_0_0_0_1px_var(--border)] sm:inline-flex sm:max-w-[14rem]"
        >
          <Sparkles
            className="size-3 shrink-0 text-primary/80"
            aria-hidden="true"
          />
          <span className="truncate">{formatModelName(model)}</span>
        </span>
      ) : null}
    </div>
  );

  const closeTool = () => {
    setToolSheet(null);
    setMode("chat");
  };

  return (
    // Real chrome above the page: the sticky 3.5rem header plus the wrappers'
    // TOP padding (py-4, md:py-5) — SidebarInset's main and .workspace-content.
    // The BOTTOM padding is given back with -mb-8/-mb-10 below, so the composer
    // dock sits at the screen edge; the height adds that bottom 2/2.5rem back
    // to the column (5.5 = 3.5+2, 6 = 3.5+2.5). Anything short of the real
    // chrome leaves the root taller than the viewport, and the page — not the
    // conversation — scrolls under the keyboard on a phone.
    <div className="-mb-8 flex h-[calc(100dvh-5.5rem)] min-h-0 min-w-0 flex-col gap-2 overflow-hidden md:-mb-10 md:h-[calc(100dvh-6rem)]">
      {/* ── header ───────────────────────────────────────── */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border/50 pb-2.5">
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
          <span className="inline-flex md:hidden">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => ai.chat.history.newChat()}
              title="Start a new conversation"
              aria-label="New chat"
              className="size-9"
              icon={<Plus className="size-4" />}
            />
          </span>

          <span className="hidden md:inline-flex">
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
          </span>

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

          <span className="inline-flex lg:hidden">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Conversation history"
              onClick={() => setHistorySheet(true)}
              className="size-9"
            >
              <History className="size-4" />
            </Button>
          </span>
        </div>
      </header>

      {/* ── assimilated workspace (no outer box border or card background) ── */}
      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        {historyOpen ? (
          <aside
            aria-label="Conversation history"
            className="hidden min-h-0 w-[16rem] shrink-0 flex-col overflow-hidden border-r border-border/50 pr-1 lg:flex"
          >
            <div className="flex shrink-0 items-center justify-between px-3 pb-1.5 pt-2.5">
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
              className="z-10 shrink-0 border-b border-border/40 bg-background/90 px-4 py-2 backdrop-blur-sm sm:px-6"
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

          {/* ── the conversation stream ── */}
          {messages.length === 0 ? (
            <ScrollArea
              className={cn("min-h-0 min-w-0 flex-1", INVISIBLE_SCROLL)}
              viewportClassName="h-full w-full"
            >
              <div className="mx-auto w-full max-w-[46rem] px-3 sm:px-6">
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
                "mx-auto flex w-full max-w-[46rem] min-w-0 flex-col gap-3 overscroll-contain px-3 py-3 sm:gap-6 sm:px-6 sm:py-4",
                HIDE_CHAT_FEEDBACK_BUTTONS,
                NORMALIZE_THINKING_SPACE,
              )}
            >
              {messages.map((message, index) => {
                const isLast = index === messages.length - 1;
                const isActiveTurn =
                  isLast && message.role === "assistant" && streaming;
                const trimmedReasoning = message.reasoning?.trim();
                const hasReasoning = Boolean(
                  trimmedReasoning && trimmedReasoning.length > 0,
                );

                return (
                  <AskMessage
                    key={message.id}
                    message={{
                      id: message.id,
                      role: message.role,
                      content: message.content,
                      at: message.at,
                      model: message.role === "assistant" ? model : undefined,
                      // Only pass reasoning props when non-empty so AskMessage
                      // never mounts an empty thinking collapse with stray whitespace.
                      reasoning: hasReasoning ? trimmedReasoning : undefined,
                      reasoningSeconds:
                        hasReasoning &&
                        typeof message.reasoningSeconds === "number" &&
                        message.reasoningSeconds > 0
                          ? message.reasoningSeconds
                          : undefined,
                      stopped: message.stopped,
                      truncated: message.truncated,
                    }}
                    ai={ai}
                    onRetry={() => ai.chat.retryLast()}
                    screenContext={screen}
                    phase={
                      !isActiveTurn ||
                      (isThinkingAtStart && ai.chat.phase === "connecting")
                        ? "idle"
                        : ai.chat.phase
                    }
                    waitingSince={isActiveTurn ? waitingSince : undefined}
                  />
                );
              })}

              {pendingDraft ? (
                <div className="min-w-0">
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
          <div className="relative shrink-0 px-2.5 pb-2 pt-0.5 sm:px-6 sm:pb-3 sm:pt-1">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 -top-6 h-6 bg-gradient-to-t from-background to-transparent"
            />
            <div className="relative mx-auto w-full max-w-[46rem] space-y-2">
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
              <p className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-center text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Icon name="shield" size={11} tone="primary" />
                  Read-only
                </span>
                <span aria-hidden="true" className="sm:inline">
                  ·
                </span>
                <span className="hidden sm:inline">Latest 20 full mocks</span>
                <span aria-hidden="true" className="hidden sm:inline">
                  ·
                </span>
                <span className="hidden sm:inline">Notes never sent</span>
                <span aria-hidden="true" className="hidden sm:inline">
                  ·
                </span>
                <span>Answers can be wrong</span>
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ── mobile history ── */}
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

      {/* ── mobile context window & plan limits ── */}
      <Sheet
        open={contextSheet}
        onOpenChange={setContextSheet}
        side="bottom"
        title="Context window & plan limits"
      >
        <div className="flex min-h-0 flex-col overflow-hidden pb-2">
          {usagePanel}
        </div>
      </Sheet>

      {/* ── mode tools: centered dialogs ── */}
      <Dialog
        open={toolSheet === "todos"}
        onOpenChange={(open) => {
          if (!open) closeTool();
        }}
        title="Plan todos with AI"
        size="lg"
        className="max-h-[min(85dvh,760px)]"
        bodyClassName={cn(
          "min-h-0 overflow-y-auto overscroll-contain px-4 py-2 pb-[max(12px,env(safe-area-inset-bottom))] sm:px-6",
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
          "min-h-0 overflow-y-auto overscroll-contain px-4 py-2 pb-[max(12px,env(safe-area-inset-bottom))] sm:px-6",
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
