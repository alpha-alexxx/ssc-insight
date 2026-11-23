"use client";
import { useEffect, useState } from "react";
import {
  ClipboardPaste,
  History,
  ListTodo,
  MessageSquare,
  SquarePen,
  Trash2,
} from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { useOverlayViewport, useOverlayFocus } from "./use-overlay-viewport";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { TodoAiComposer } from "@/components/shared/tasks/ai-composer";
import { AiSettingsForm } from "./ai-settings-form";
import type { AiCredentialSummary, ChatMessage } from "@/lib/ai/client-types";
import type { AiSheetTaskApi } from "@/components/shared/ai/task-suggestion-card";
import { ChatTranscript } from "@/components/shared/ai/chat-transcript";
import { ChatComposer } from "@/components/shared/ai/chat-composer";
import { ChatEmptyState } from "@/components/shared/ai/chat-empty-state";
import { ConversationList } from "@/components/shared/ai/conversation-list";
import { UsageFooter } from "@/components/shared/ai/usage-footer";
import type { ChatHistoryApi, ChatPhase } from "./use-ai-workspace";
import { useAiWorkspace } from "./use-ai-workspace";
import { LogMockFlow, type LogMockPayload } from "@/components/shared/ai/log-mock-flow";

export type { LogMockPayload };

/**
 * The AI panel: a tabbed right Sheet — Ask, Todos, Log. Ask renders the
 * shared chat transcript and composer (the same components the /ask page
 * uses, over the same live state); Todos and Log keep their own flows.
 * Desktop keeps the workspace visible; mobile is a full-width Sheet with a
 * dvh flex layout so the composer stays above the keyboard. Conversation
 * state lives in the shell hook: finished turns persist to the device, the
 * in-flight stream aborts on close, and the transcript survives reopening.
 */
export function AiChatSheet({
  open,
  onOpenChange,
  messages,
  streaming,
  phase,
  error,
  contextLabel,
  configured = true,
  /** Image attach enabled for this user (server still gates the send). */
  visionEnabled = false,
  /** "Today 12/400" request budget for the header meta row. */
  usageLabel,
  /** Tab to land on when the sheet opens; callers can deep-link a flow. */
  initialTab = "chat",
  onSend,
  onStop,
  onClear,
  onRetry,
  onRegenerate,
  onEditResend,
  history,
  onAiConfigured,
  taskApi,
  onLogMock,
  onTaskAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messages: ChatMessage[];
  streaming: boolean;
  /** What the model is doing right now, from stream evidence. */
  phase?: ChatPhase | null;
  error: string;
  contextLabel?: string;
  /** False when no AI provider is configured; shows the setup form instead. */
  configured?: boolean;
  /** Image attach enabled for this user (server still gates the send). */
  visionEnabled?: boolean;
  /** "Today 12/400" request budget for the header meta row. */
  usageLabel?: string;
  initialTab?: "chat" | "log" | "todos";
  onSend: (text: string, images?: string[]) => void;
  onStop: () => void;
  onClear: () => void;
  onRetry?: () => void;
  /** Regenerate the latest answer on demand. */
  onRegenerate?: () => void;
  /** Replace an earlier question and re-run the conversation from it. */
  onEditResend?: (messageId: string, text: string) => void;
  /** Saved conversations (device-local) and the list mutations. */
  history?: ChatHistoryApi;
  /** Notifies the shell so AI status can be refetched after setup. */
  onAiConfigured?: (credential: AiCredentialSummary | null) => void;
  /** Personal-task creator for suggest-and-confirm cards. */
  taskApi?: AiSheetTaskApi;
  /** Hands a reviewed mock draft to the real form (the sole save path). */
  onLogMock?: (draft: LogMockPayload) => void;
  /** Shell feedback (toast) after a suggested task is added. */
  onTaskAdded?: () => void;
}) {
  const [tab, setTab] = useState<"chat" | "log" | "todos">("chat");
  // Reset to chat whenever the sheet reopens; the tab is not persistent state.
  const [lastOpen, setLastOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  // Visited tabs stay mounted (hidden, not unmounted): switching away from
  // Todos must not wipe a generated draft, nor Log its pasted report.
  const [mountedTabs, setMountedTabs] = useState({
    chat: true,
    todos: false,
    log: false,
  });
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      setTab(initialTab);
      setMountedTabs((current) => ({ ...current, [initialTab]: true }));
    } else {
      setHistoryOpen(false);
    }
  }
  /** Tab switch that also closes the history overlay. */
  const switchTab = (next: "chat" | "log" | "todos") => {
    onStop();
    setHistoryOpen(false);
    setMountedTabs((current) => ({ ...current, [next]: true }));
    setTab(next);
  };
  const viewport = useOverlayViewport(open);
  const overlayFocus = useOverlayFocus();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        {...overlayFocus}
        side="right"
        className="ai-workspace-sheet w-full gap-0 sm:max-w-[520px] flex flex-col"
        style={
          viewport
            ? { height: viewport.height, top: viewport.top, bottom: "auto" }
            : undefined
        }
        overlayClassName="bg-ink/20"
        aria-describedby="ai-sheet-description"
      >
        <SheetHeader className="shrink-0 gap-1.5 border-b border-rule-soft px-4 pb-3 pt-4 pr-14 sm:px-5">
          <SheetTitle className="font-serif text-xl font-medium leading-tight text-ink">
            Study coach
          </SheetTitle>
          <SheetDescription
            id="ai-sheet-description"
            className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[11px] text-muted"
          >
            {contextLabel && (
              <span className="section-label rounded-control border border-rule-soft px-1.5 py-0.5">
                {contextLabel}
              </span>
            )}
            {usageLabel && <span className="tabular">{usageLabel}</span>}
            <span>Chats are saved on this device.</span>
          </SheetDescription>
        </SheetHeader>
        <div
          className="flex shrink-0 items-center gap-2 border-b border-rule-soft px-3 py-2.5 sm:px-4"
        >
          <div
            className="min-w-0 flex-1"
            role="tablist"
            aria-label="AI mode"
          >
            {/* The app's one segmented-control grammar, not a bespoke tab bar. */}
            <div className="segment-group is-block w-full">
              {(
                [
                  { id: "chat", label: "Ask", icon: MessageSquare },
                  { id: "todos", label: "Todos", icon: ListTodo },
                  { id: "log", label: "Log", icon: ClipboardPaste },
                ] as const
              ).map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  id={`ai-tab-${item.id}`}
                  aria-controls={`ai-panel-${item.id}`}
                  aria-selected={tab === item.id}
                  tabIndex={tab === item.id ? 0 : -1}
                  onClick={() => switchTab(item.id)}
                  onKeyDown={(event) => {
                    const ids = ["chat", "todos", "log"] as const;
                    const next =
                      event.key === "ArrowRight"
                        ? (index + 1) % 3
                        : event.key === "ArrowLeft"
                          ? (index + 2) % 3
                          : event.key === "Home"
                            ? 0
                            : event.key === "End"
                              ? 2
                              : null;
                    if (next !== null) {
                      event.preventDefault();
                      switchTab(ids[next]);
                      document.getElementById(`ai-tab-${ids[next]}`)?.focus();
                    }
                  }}
                  className="segment min-w-0 flex-1 justify-center"
                >
                  <item.icon size={15} className="shrink-0" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          {/* Conversation controls ride the tab row on the chat tab only:
              a clean slate and the saved-history list. */}
          {tab === "chat" && history && (
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                aria-label="New chat"
                title="New chat"
                className="tap-target inline-flex size-10 items-center justify-center rounded-control text-muted transition-colors hover:bg-soft hover:text-ink"
                onClick={() => {
                  onStop();
                  setHistoryOpen(false);
                  history.newChat();
                }}
              >
                <SquarePen size={16} />
              </button>
              <button
                type="button"
                aria-label="Conversation history"
                title="Conversation history"
                aria-expanded={historyOpen}
                aria-pressed={historyOpen}
                className={cn(
                  "tap-target inline-flex size-10 items-center justify-center rounded-control transition-colors",
                  historyOpen
                    ? "bg-soft text-ink"
                    : "text-muted hover:bg-soft hover:text-ink",
                )}
                onClick={() => {
                  onStop();
                  setHistoryOpen((value) => !value);
                }}
              >
                <History size={16} />
              </button>
            </div>
          )}
        </div>
        {/* Visited panels stay mounted and are hidden rather than unmounted,
            so a Todos draft or a pasted report survives switching tabs. */}
        {mountedTabs.chat && (
          <div
            role="tabpanel"
            id="ai-panel-chat"
            aria-labelledby="ai-tab-chat"
            hidden={tab !== "chat"}
            className={cn(
              "flex min-h-0 flex-1 flex-col",
              tab !== "chat" && "hidden",
            )}
          >
            <AskChatTab
              messages={messages}
              streaming={streaming}
              phase={phase ?? null}
              error={error}
              configured={configured}
              visionEnabled={visionEnabled}
              history={history}
              historyOpen={historyOpen}
              onHistoryClose={() => setHistoryOpen(false)}
              onSend={onSend}
              onStop={onStop}
              onClear={onClear}
              onRetry={onRetry}
              onRegenerate={onRegenerate}
              onEditResend={onEditResend}
              onAiConfigured={onAiConfigured}
              taskApi={taskApi}
              onTaskAdded={onTaskAdded}
              usageLabel={usageLabel}
            />
          </div>
        )}
        {mountedTabs.todos && (
          <div
            role="tabpanel"
            id="ai-panel-todos"
            aria-labelledby="ai-tab-todos"
            hidden={tab !== "todos"}
            className={cn(
              "min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5",
              tab !== "todos" && "hidden",
            )}
          >
            <TodoAiComposer
              compact
              configured={configured}
              onAiConfigured={onAiConfigured}
            />
          </div>
        )}
        {mountedTabs.log && (
          <div
            role="tabpanel"
            id="ai-panel-log"
            aria-labelledby="ai-tab-log"
            hidden={tab !== "log"}
            className={cn(
              "flex min-h-0 flex-1 flex-col",
              tab !== "log" && "hidden",
            )}
          >
            <LogMockFlow
              configured={configured}
              visionEnabled={visionEnabled}
              onAiConfigured={onAiConfigured}
              onLogMock={(payload) => {
                onLogMock?.(payload);
                onOpenChange(false);
              }}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

/* ---------------- Ask tab ---------------- */

/** The sheet's quota footer: reads status from the workspace provider so the
 * AskChatTab props stay unchanged. */
function SheetUsageFooter({ className }: { className?: string }) {
  const ai = useAiWorkspace();
  return <UsageFooter status={ai.aiStatus ?? null} className={className} />;
}

function AskChatTab({
  messages,
  streaming,
  phase,
  error,
  configured,
  visionEnabled,
  history,
  historyOpen,
  onHistoryClose,
  onSend,
  onStop,
  onClear,
  onRetry,
  onRegenerate,
  onEditResend,
  onAiConfigured,
  taskApi,
  onTaskAdded,
  usageLabel,
}: {
  messages: ChatMessage[];
  streaming: boolean;
  phase: ChatPhase | null;
  error: string;
  configured: boolean;
  visionEnabled: boolean;
  usageLabel?: string;
  history?: ChatHistoryApi;
  historyOpen: boolean;
  onHistoryClose: () => void;
  onSend: (text: string) => void;
  onStop: () => void;
  onClear: () => void;
  onRetry?: () => void;
  onRegenerate?: () => void;
  onEditResend?: (messageId: string, text: string) => void;
  onAiConfigured?: (credential: AiCredentialSummary | null) => void;
  taskApi?: AiSheetTaskApi;
  onTaskAdded?: () => void;
}) {
  const [input, setInput] = useState("");
  const { aiStatus } = useAiWorkspace();

  if (historyOpen && history) {
    return (
      <div className="flex min-h-0 flex-1 flex-col px-4 py-4 sm:px-5">
        <ConversationList
          history={history}
          streaming={streaming}
          onNewChat={onHistoryClose}
          className="flex-1"
        />
        <SheetUsageFooter className="-mx-4 mt-3 sm:-mx-5" />
        <button
          type="button"
          className="mt-2 min-h-9 text-xs font-medium text-muted underline underline-offset-4 hover:text-ink"
          onClick={onHistoryClose}
        >
          Back to the conversation
        </button>
      </div>
    );
  }

  return (
    <>
      <ChatTranscript
        messages={messages}
        streaming={streaming}
        phase={phase}
        model={aiStatus?.credential?.model ?? undefined}
        onRetry={onRetry}
        onEditResend={onEditResend}
        onRegenerate={onRegenerate}
        taskApi={taskApi}
        onTaskAdded={onTaskAdded}
        error={error}
        compact
        className="px-4 sm:px-5"
        emptyState={
          configured ? (
            <ChatEmptyState onSend={(text) => onSend(text)} />
          ) : (
            <div className="rounded-control border border-rule bg-canvas p-4">
              <p className="text-xs leading-relaxed text-muted">
                Add a provider and API key to start asking questions. Your key
                is encrypted before storage and never returned to this page.
              </p>
              <div className="mt-3">
                <AiSettingsForm
                  variant="panel"
                  showHeading={false}
                  onChanged={onAiConfigured}
                />
              </div>
            </div>
          )
        }
      />
      {configured && (
        <div className="shrink-0 bg-paper px-4 pb-3 sm:px-5 sm:pb-4">
          <ChatComposer
            value={input}
            onChange={setInput}
            onSubmit={(text) => {
              onSend(text);
              setInput("");
            }}
            onStop={onStop}
            streaming={streaming}
            disabled={false}
            visionEnabled={visionEnabled}
            placeholder="Ask about a mock, a weak subject, or what to do next…"
            usage={usageLabel}
            onClear={onClear}
          />
        </div>
      )}
    </>
  );
}
