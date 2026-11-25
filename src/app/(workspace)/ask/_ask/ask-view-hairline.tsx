"use client";

import * as React from "react";
import { History, Info, Sparkles } from "lucide-react";
import { PromptComposer, type ComposerStatus } from "@/components/prompt-composer";
import { ApprovalCard } from "@/components/approval-card";
import { ThinkingIndicator } from "@/components/thinking-indicator";
import { ChatHistory } from "@/components/chat-history";
import { UsageMeter } from "@/components/usage-meter";
import { UsageLimits, type ContextPart, type PlanLimit } from "@/components/usage-limits";
import { Button } from "@/components/button";
import { Icon } from "@/components/icon";
import { Sheet } from "@/components/sheet";
import { Tooltip } from "@/components/tooltip";
import { useAiWorkspace, aiUsageLabel } from "@/components/use-ai-workspace";
import { usePlanData } from "@/components/use-plan-data";
import { TodoAiComposer } from "@/components/shared/tasks/ai-composer";
import { LogMockFlow, type LogMockPayload } from "@/components/shared/ai/log-mock-flow";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import { istTodayIso } from "@/lib/plan/view-model";
import { AskMessage } from "./AskMessage";

/* ─────────────────────────────────────────────────────────
 * /ask — the single AI surface, rebuilt on the Hairline parts.
 *
 * Layout, widest first:
 *   xl   history rail · conversation (46rem) · usage limits rail
 *   lg   history rail · conversation, usage behind the header popover
 *   <lg  conversation only; history and usage are bottom sheets
 *
 * The composer carries the Chat / Todos / Mock mode chips. A mode tool
 * opens in a sheet so the conversation underneath keeps its place.
 * ───────────────────────────────────────────────────────── */

const MODES = [
  { id: "chat", label: "Chat" },
  { id: "todos", label: "Todos" },
  { id: "mock", label: "Mock" },
] as const;

type ComposerMode = (typeof MODES)[number]["id"];

const CONTEXT_WINDOW = 128_000;

const SCREEN_CONTEXT = { view: "ask" as const, date: istTodayIso() };

export function AskViewHairline({ firstName }: { firstName?: string }) {
  const ai = useAiWorkspace();
  usePlanData();
  const [mode, setMode] = React.useState<ComposerMode>("chat");
  const [historyOpen, setHistoryOpen] = React.useState(true);
  const [historySheet, setHistorySheet] = React.useState(false);
  const [usageSheet, setUsageSheet] = React.useState(false);
  const [toolSheet, setToolSheet] = React.useState<ComposerMode | null>(null);
  const [pendingDraft, setPendingDraft] = React.useState<
    | { kind: "todos"; count: number }
    | { kind: "mock"; draft: LogMockPayload }
    | null
  >(null);
  const [approvalStatus, setApprovalStatus] = React.useState<"pending" | "approved" | "denied" | null>(null);
  const [notes, setNotes] = React.useState<Array<{ id: number; text: string; at: string }>>([]);
  const noteId = React.useRef(0);
  // When the in-flight turn was sent, so the pre-first-token indicator can time
  // its wait. The turn's own `at` stamp already records that instant.
  const connectingAt = React.useMemo(() => {
    if (ai.chat.phase !== "connecting") return null;
    const last = ai.chat.messages[ai.chat.messages.length - 1];
    const stamp = last?.at ? Date.parse(last.at) : Number.NaN;
    return Number.isFinite(stamp) ? stamp : null;
  }, [ai.chat.phase, ai.chat.messages]);

  const enabled = Boolean(ai.aiStatus?.enabled);
  const streaming = ai.chat.streaming;
  const usage = ai.aiStatus?.usage;
  const personalKey = ai.aiStatus?.source === "user";
  const usageLabel = aiUsageLabel(ai.aiStatus ?? null);

  const status: ComposerStatus = streaming ? "streaming" : ai.chat.phase === "connecting" ? "submitted" : "ready";

  const planLimits: PlanLimit[] = React.useMemo(() => {
    const rows: PlanLimit[] = [];
    const resetsAt = usage?.resetAt ? new Date(usage.resetAt) : undefined;
    if (usage) {
      rows.push({
        id: "requests",
        label: personalKey ? "Requests today (unlimited)" : "Requests today",
        used: usage.requests,
        limit: Number.isFinite(usage.limits.requests) ? usage.limits.requests : Math.max(usage.requests, 1),
        resetsAt,
      });
      rows.push({
        id: "tokens",
        label: personalKey ? "Tokens today (unlimited)" : "Tokens today",
        used: usage.tokens,
        limit: Number.isFinite(usage.limits.tokens) ? usage.limits.tokens : Math.max(usage.tokens, 1),
        resetsAt,
      });
    }
    return rows;
  }, [usage, personalKey]);

  const contextParts: ContextPart[] = React.useMemo(
    () => [
      { id: "tracker", label: "Tracker context", tokens: 18_000 },
      { id: "conversation", label: "Conversation", tokens: 42_000 },
    ],
    [],
  );

  const note = React.useCallback((text: string) => {
    noteId.current += 1;
    setNotes((rows) => [
      ...rows,
      {
        id: noteId.current,
        text,
        at: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }),
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

  const historyPanel = (
    <ChatHistory
      chats={chats}
      activeId={ai.chat.history.activeId ?? undefined}
      onSelect={ai.chat.history.select}
      onNew={ai.chat.history.newChat}
      onRename={ai.chat.history.rename}
      onDelete={ai.chat.history.remove}
      className="min-h-0 flex-1 px-1"
    />
  );

  const usagePanel = (
    <UsageLimits
      context={{ limit: CONTEXT_WINDOW, parts: contextParts }}
      plan={personalKey ? "Your own key" : "Shared deployment key"}
      limits={planLimits}
      locales="en-IN"
    />
  );

  const modeChips = (
    <div role="tablist" aria-label="Assistant mode" className="flex items-center gap-1">
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
            "cursor-pointer rounded-full px-2.5 py-1 text-[12.5px] font-medium transition-colors",
            mode === item.id
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          {item.label}
        </button>
      ))}
      {usage && Number.isFinite(usage.limits.requests) && usage.limits.requests > 0 ? (
        <UsageMeter
          variant="ring"
          used={usage.requests}
          limit={usage.limits.requests}
          unit="requests"
          label="Requests today"
          resetAt={usage.resetAt ? new Date(usage.resetAt) : undefined}
          className="ml-1.5"
        />
      ) : usageLabel ? (
        <span className="ml-1 hidden text-[11px] tabular-nums text-muted-foreground sm:inline">{usageLabel}</span>
      ) : null}
    </div>
  );

  return (
    <div className="flex h-[calc(100dvh-var(--app-header-h,52px)-2rem)] min-h-0 flex-col md:h-[calc(100dvh-var(--app-header-h,52px)-2.5rem)]">
      <header className="mb-3 flex items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="size-4" />
          </span>
          <h1 className="shrink-0 font-serif text-[1.125rem] font-medium leading-tight tracking-[-0.01em] text-foreground">
            Ask AI
          </h1>
          {firstName ? (
            <span className="hidden truncate text-[13px] text-muted-foreground sm:inline">· {firstName}</span>
          ) : null}
          <Tooltip
            content={
              <span className="block max-w-64 whitespace-normal text-left">
                Answers read your aggregates and latest 20 full mocks — never notes or identity.
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
            icon={<Icon name="plus" size={14} />}
          >
            <span className="hidden md:inline">New chat</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-pressed={historyOpen}
            aria-expanded={historyOpen}
            className="hidden lg:inline-flex"
            onClick={() => setHistoryOpen((open) => !open)}
            icon={<History className="size-3.5" />}
          >
            {historyOpen ? "Hide history" : "Show history"}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Conversation history"
            className="lg:hidden"
            onClick={() => setHistorySheet(true)}
          >
            <History className="size-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Usage limits"
            aria-expanded={usageSheet}
            className="xl:hidden"
            onClick={() => setUsageSheet(true)}
          >
            <Info className="size-4" />
          </Button>
        </div>
      </header>

      <div
        className={cn(
          "min-h-0 flex-1",
          historyOpen
            ? "grid gap-5 lg:grid-cols-[17.5rem_minmax(0,1fr)] xl:grid-cols-[17.5rem_minmax(0,1fr)_19rem]"
            : "flex flex-col xl:grid xl:grid-cols-[minmax(0,1fr)_19rem] xl:gap-5",
        )}
      >
        {historyOpen ? (
          <aside aria-label="Conversation history" className="hidden min-h-0 flex-col border-r border-border pr-4 lg:flex">
            {historyPanel}
          </aside>
        ) : null}

        <section aria-label="Conversation" className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="mx-auto flex min-h-0 w-full max-w-[46rem] flex-1 flex-col">
            <div className="flex-1 overflow-y-auto overscroll-contain px-3 pb-4 sm:px-5">
              <div className="mx-auto flex max-w-[46rem] flex-col gap-6">
                {ai.chat.messages.length === 0 ? (
                  <div className="py-10">
                    <h2 className="font-serif text-[1.375rem] font-medium leading-tight text-foreground">
                      {firstName ? `What are we working on, ${firstName}?` : "What are we working on?"}
                    </h2>
                    <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
                      Ask about your mocks, a weak subject, or what to do next. Answers read your aggregates and the
                      latest 20 full mocks.
                    </p>
                  </div>
                ) : null}

                {ai.chat.messages.map((message) => (
                  <AskMessage
                    key={message.id}
                    message={{
                      id: message.id,
                      role: message.role,
                      content: message.content,
                      at: message.at,
                      model: ai.aiStatus?.credential?.model ?? undefined,
                      reasoning: message.reasoning,
                      stopped: message.stopped,
                    }}
                    ai={ai}
                    onRetry={() => ai.chat.retryLast()}
                    screenContext={SCREEN_CONTEXT}
                  />
                ))}

                {pendingDraft ? (
                  <ApprovalCard
                    title={
                      pendingDraft.kind === "todos"
                        ? `Apply ${pendingDraft.count} todo ${pendingDraft.count === 1 ? "change" : "changes"}?`
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
                            { label: "Changes", value: String(pendingDraft.count) },
                          ]
                        : [
                            { label: "Scope", value: "Mock attempt" },
                            { label: "Next step", value: "Review and save in /add" },
                          ]
                    }
                    status={approvalStatus ?? "pending"}
                    onApprove={() => {
                      if (pendingDraft.kind === "mock") {
                        useUiStore.getState().requestMockPrefill(pendingDraft.draft);
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
                    approveLabel={pendingDraft.kind === "mock" ? "Open the form" : "Apply"}
                    denyLabel="Dismiss"
                  />
                ) : null}

                {ai.chat.phase === "connecting" ? (
                  <ThinkingIndicator
                    variant="orbit"
                    label="Reading the workspace"
                    startedAt={connectingAt ?? undefined}
                  />
                ) : null}

                {notes.length > 0 ? (
                  <div className="flex flex-col items-center gap-1.5 py-2">
                    {notes.map((row) => (
                      <p key={row.id} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Icon name="check" size={11} tone="success" />
                        {row.text}
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{row.at}</span>
                      </p>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="shrink-0 border-t border-border pt-3">
              <PromptComposer
                status={status}
                onSubmit={(text) => ai.chat.send(text, SCREEN_CONTEXT, false)}
                onStop={ai.chat.stop}
                placeholder="Ask about your mocks, targets, or plan…"
                disabled={!enabled}
                disabledReason={enabled ? undefined : "Add a provider and key in Settings → AI provider."}
                toolbar={modeChips}
                maxLength={4000}
                className="w-full"
              />
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                Answers come from your tracker snapshot and can be wrong.
              </p>
            </div>
          </div>
        </section>

        <aside aria-label="Usage limits" className="hidden min-h-0 flex-col overflow-y-auto border-l border-border pl-4 xl:flex">
          {usagePanel}
        </aside>
      </div>

      <Sheet open={historySheet} onOpenChange={setHistorySheet} side="bottom" title="Conversation history">
        <div className="flex h-[70dvh] min-h-0 flex-col">{historyPanel}</div>
      </Sheet>

      <Sheet open={usageSheet} onOpenChange={setUsageSheet} side="bottom" title="Usage limits">
        <div className="pb-4">{usagePanel}</div>
      </Sheet>

      <Sheet
        open={toolSheet === "todos"}
        onOpenChange={(open) => {
          if (!open) {
            setToolSheet(null);
            setMode("chat");
          }
        }}
        side="bottom"
        title="Plan todos with AI"
      >
        <div className="flex max-h-[80dvh] min-h-0 flex-col overflow-y-auto overscroll-contain pb-4">
          <TodoAiComposer
            variant="page"
            compact={false}
            configured={enabled}
            onAiConfigured={() => void ai.refreshAiStatus()}
            onApplied={(count) => {
              setPendingDraft({ kind: "todos", count });
              setApprovalStatus("pending");
              setToolSheet(null);
              setMode("chat");
            }}
          />
        </div>
      </Sheet>

      <Sheet
        open={toolSheet === "mock"}
        onOpenChange={(open) => {
          if (!open) {
            setToolSheet(null);
            setMode("chat");
          }
        }}
        side="bottom"
        title="Log a mock with AI"
      >
        <div className="flex max-h-[80dvh] min-h-0 flex-col overflow-y-auto overscroll-contain pb-4">
          <LogMockFlow
            variant="page"
            configured={enabled}
            visionEnabled={ai.aiStatus?.credential?.visionEnabled === true}
            onAiConfigured={() => void ai.refreshAiStatus()}
            onLogMock={(draft) => {
              setPendingDraft({ kind: "mock", draft });
              setApprovalStatus("pending");
              setToolSheet(null);
              setMode("chat");
            }}
          />
        </div>
      </Sheet>
    </div>
  );
}
