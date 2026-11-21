"use client";
import { useEffect, useState } from "react";
import {
  ChevronRight,
  ClipboardPaste,
  History,
  Info,
  ListTodo,
  MessageSquare,
  Sparkles,
  SquarePen,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
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
import { ExtractionReview } from "@/components/shared/add/extraction-review";
import { useExamScope } from "./exam-context";
import { parseReport } from "@/lib/report-parser";
import {
  MAX_EXTRACT_CHARS,
  extractionToAttempt,
  validateExtractionDraft,
  type ExtractionDraft,
  type ExtractedSubjectDraft,
} from "@/lib/ai/extraction";
import { SUBJECTS } from "@/lib/domain";
import { mockTypeLabel } from "@/lib/format";
import type { AttemptInput, PatternShape } from "@/lib/domain";
import type { AiCredentialSummary, ChatMessage } from "@/lib/ai/client-types";
import type { AiSheetTaskApi } from "@/components/shared/ai/task-suggestion-card";
import { ChatTranscript } from "@/components/shared/ai/chat-transcript";
import { ChatComposer } from "@/components/shared/ai/chat-composer";
import { ChatEmptyState } from "@/components/shared/ai/chat-empty-state";
import { prepareImages } from "@/components/shared/ai/image";
import { ConversationList } from "@/components/shared/ai/conversation-list";
import type { ChatHistoryApi, ChatPhase } from "./use-ai-workspace";

/** A reviewed mock draft handed to the real form. */
export type LogMockPayload = {
  values: Partial<AttemptInput>;
  date: string;
};

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
            <LogMockTab
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
}: {
  messages: ChatMessage[];
  streaming: boolean;
  phase: ChatPhase | null;
  error: string;
  configured: boolean;
  visionEnabled: boolean;
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
  // The composer's clear affordance keeps the one-shot trash action next to
  // the field it clears; edit-last lives on the user turn itself.
  const composerMeta = (
    <>
      <button
        type="button"
        aria-label="Clear conversation"
        title="Clear conversation"
        className="tap-target inline-flex size-8 items-center justify-center rounded-control text-muted transition-colors hover:bg-soft hover:text-ink disabled:pointer-events-none disabled:opacity-40"
        disabled={streaming || !messages.length}
        onClick={onClear}
      >
        <Trash2 size={14} />
      </button>
      <span className="text-[11px] text-muted">
        Answers read your aggregates and latest 20 full mocks — never notes.
      </span>
    </>
  );

  if (historyOpen && history) {
    return (
      <div className="flex min-h-0 flex-1 flex-col px-4 py-4 sm:px-5">
        <ConversationList
          history={history}
          streaming={streaming}
          onNewChat={onHistoryClose}
          className="flex-1"
        />
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
        onRetry={onRetry}
        onEditResend={onEditResend}
        onRegenerate={onRegenerate}
        taskApi={taskApi}
        onTaskAdded={onTaskAdded}
        error={error}
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
            meta={composerMeta}
          />
        </div>
      )}
    </>
  );
}

/* ---------------- subject roster ---------------- */

/**
 * The parsed draft as a roster: one ruled row per subject with its question
 * count and right/wrong split, so the reader verifies the numbers against the
 * scorecard at a glance. Rows that cannot be resolved say so in place; the
 * full field editor stays one tap away behind "Edit details".
 */
function SubjectRoster({
  draft,
  shape,
  onChange,
  onOpenDetails,
  onBack,
  onContinue,
  error,
}: {
  draft: ExtractionDraft;
  shape: PatternShape;
  onChange: (next: ExtractionDraft) => void;
  onOpenDetails: () => void;
  onBack: () => void;
  onContinue: () => void;
  error: string;
}) {
  const blockers = draft.issues.filter((issue) => issue.severity === "blocker");
  const warnings = draft.issues.filter((issue) => issue.severity === "warning");
  const ready = blockers.length === 0 && draft.subjects.length > 0;

  const setSubject = (
    index: number,
    patch: Partial<ExtractedSubjectDraft>,
  ) => {
    // Re-run the same validation contract the full editor uses, so fixing a
    // value in the roster clears its blocker instead of leaving stale issues.
    onChange(
      validateExtractionDraft(shape, {
        ...draft,
        subjects: draft.subjects.map((subject, at) =>
          at === index ? { ...subject, ...patch } : subject,
        ),
      }),
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-rule-soft px-4 pb-3 pt-4 sm:px-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h3 className="min-w-0 break-words font-serif text-[1.25rem] font-medium leading-tight text-ink sm:text-[1.375rem]">
            {draft.name?.trim() || "Parsed result"}
          </h3>
          <span
            className={cn(
              "section-label",
              ready ? "text-positive" : "text-warning",
            )}
          >
            {ready
              ? "Ready"
              : `${blockers.length} unresolved`}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-muted">
          {[
            draft.platform?.trim(),
            draft.date,
            draft.type ? mockTypeLabel(draft.type) : null,
          ]
            .filter(Boolean)
            .join(" · ") || "Check the values below against your scorecard."}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 sm:px-5">
        <ul className="divide-y divide-rule-soft border-b border-rule-soft">
          {draft.subjects.map((subject, index) => {
            const incomplete =
              subject.questions == null ||
              subject.correct == null ||
              subject.incorrect == null;
            return (
              <li key={`${subject.subjectId}-${index}`} className="py-2.5">
                <div className="flex items-baseline gap-3">
                  <span className="min-w-0 flex-1 truncate font-serif text-[15px] text-ink">
                    {SUBJECTS[subject.subjectId].name}
                  </span>
                  {incomplete ? (
                    <span className="shrink-0 text-[11px] font-medium text-warning">
                      Needs a value
                    </span>
                  ) : (
                    <span className="flex shrink-0 items-baseline gap-2.5 text-[11px] tabular text-muted">
                      <span>{subject.questions}Q</span>
                      <span className="font-medium text-positive">
                        {subject.correct} ✓
                      </span>
                      <span className="font-medium text-danger">
                        {subject.incorrect} ✗
                      </span>
                    </span>
                  )}
                </div>
                {incomplete && (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {(
                      [
                        ["questions", "Questions"],
                        ["correct", "Correct"],
                        ["incorrect", "Wrong"],
                      ] as const
                    ).map(([field, label]) => (
                      <label key={field} className="section-label">
                        {label}
                        <input
                          type="number"
                          min={0}
                          inputMode="numeric"
                          value={subject[field] ?? ""}
                          onChange={(event) =>
                            setSubject(index, {
                              [field]:
                                event.target.value === ""
                                  ? null
                                  : Number(event.target.value),
                            })
                          }
                          className="mt-1 h-10 w-full px-2 text-sm"
                        />
                      </label>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {warnings.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {warnings.map((issue) => (
              <li
                key={`${issue.code}-${issue.path ?? ""}`}
                className="border-l-2 border-l-warning pl-2.5 text-[11px] leading-relaxed text-muted"
              >
                {issue.message}
              </li>
            ))}
          </ul>
        )}
        {blockers.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {blockers.map((issue) => (
              <li
                key={`${issue.code}-${issue.path ?? ""}`}
                role="alert"
                className="border-l-2 border-l-danger pl-2.5 text-[11px] leading-relaxed text-danger"
              >
                {issue.message}
              </li>
            ))}
          </ul>
        )}
        {error && (
          <p role="alert" className="mt-3 text-xs text-danger">
            {error}
          </p>
        )}
      </div>

      <div className="shrink-0 border-t border-rule-soft bg-paper px-4 py-3 sm:px-5">
        <div className="action-row">
          <Button type="button" variant="ghost" size="sm" onClick={onBack}>
            Back
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenDetails}
          >
            Edit details
          </Button>
          <Button
            type="button"
            size="sm"
            className="ml-auto"
            onClick={onContinue}
            disabled={!ready}
          >
            Continue to the form
            <ChevronRight size={13} />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Log a mock tab ---------------- */

/** Paste → parse (AI or standard) → review → hand the reviewed draft to the
 * real form. This tab never saves; /add remains the sole save path. */
function LogMockTab({
  configured,
  visionEnabled,
  onAiConfigured,
  onLogMock,
}: {
  configured: boolean;
  visionEnabled: boolean;
  onAiConfigured?: (credential: AiCredentialSummary | null) => void;
  onLogMock: (draft: LogMockPayload) => void;
}) {
  const { activeShape } = useExamScope();
  // The tab opens only inside the workspace; the exam scope resolves in the
  // same tick the shell renders. Keep the JSX type-safe while it loads.
  const shape = activeShape ?? {
    examId: "cgl",
    tierId: "tier2",
    subjects: [
      { subjectId: "quant", questions: 30, qualifying: false },
      { subjectId: "reasoning", questions: 30, qualifying: false },
      { subjectId: "english", questions: 45, qualifying: false },
      { subjectId: "ga", questions: 25, qualifying: false },
      { subjectId: "computer", questions: 20, qualifying: true },
    ],
    marking: { correct: 3, incorrect: 1 },
    sections: [],
  };
  const [paste, setPaste] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [preparingImages, setPreparingImages] = useState(false);
  const [draft, setDraft] = useState<ExtractionDraft | null>(null);
  /* false = paste step, "roster" = the parsed summary, "details" = the full
     field editor. The roster is the default review surface. */
  const [reviewing, setReviewing] = useState<false | "roster" | "details">(
    false,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [statusChecked, setStatusChecked] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);

  // Re-check AI availability when the tab opens (cheap status call).
  useEffect(() => {
    let cancelled = false;
    void api<{ enabled: boolean }>("/api/ai/status")
      .then((status) => {
        if (!cancelled) setAiEnabled(Boolean(status.enabled));
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setStatusChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const importWithAi = async () => {
    setBusy(true);
    setError("");
    setDraft(null);
    try {
      const result = await api<{ draft?: ExtractionDraft }>("/api/ai/extract", {
        method: "POST",
        body: JSON.stringify({
          text: paste,
          ...(images.length ? { images } : {}),
        }),
      });
      if (!result.draft) throw new Error("Could not arrange this report.");
      setDraft(result.draft);
      setReviewing("roster");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not arrange this report.",
      );
    } finally {
      setBusy(false);
    }
  };

  const importStandard = () => {
    setError("");
    try {
      const parsed = parseReport(shape, paste);
      // Hand the deterministic result straight to the real form: /add
      // applies it through applyExtracted exactly like a manual paste import.
      onLogMock({
        values: parsed.values,
        date: "",
      });
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not read this report.",
      );
    }
  };

  const useReviewed = () => {
    if (!draft) return;
    try {
      const reviewed = extractionToAttempt(shape, draft, "");
      onLogMock(reviewed);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Resolve the highlighted fields before continuing.",
      );
    }
  };

  // The details branch must come first: "roster" is also truthy, so a broad
  // `reviewing &&` branch above it would make "Edit details" unreachable.
  if (reviewing === "details" && draft) {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
        <ExtractionReview
          draft={draft}
          shape={shape}
          onChange={setDraft}
          onUse={useReviewed}
          onBack={() => setReviewing("roster")}
          onDiscard={() => {
            setDraft(null);
            setReviewing(false);
            setError("");
          }}
        />
      </div>
    );
  }

  if (reviewing && draft) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <SubjectRoster
            draft={draft}
            shape={shape}
            onChange={setDraft}
            onOpenDetails={() => setReviewing("details")}
            onBack={() => {
              setReviewing(false);
              setError("");
            }}
            onContinue={useReviewed}
            error={error}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
      <h3 className="font-serif text-[1.375rem] font-medium leading-tight text-ink">
        Log a mock test
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Paste the scorecard. You review the parsed subjects here, then continue
        to the mock form — the only place that saves.
      </p>
      <label htmlFor="ai-log-mock-paste" className="section-label mt-4 block">
        Scorecard text
      </label>
      <textarea
        id="ai-log-mock-paste"
        rows={10}
        maxLength={MAX_EXTRACT_CHARS}
        value={paste}
        onChange={(event) => setPaste(event.target.value)}
        placeholder="Paste the full scorecard section…"
        className="mt-1.5 min-h-48 max-h-80 resize-y text-sm leading-relaxed"
      />
      <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted">
        <span>
          {paste.length.toLocaleString("en-IN")} /{" "}
          {MAX_EXTRACT_CHARS.toLocaleString("en-IN")} characters
        </span>
        <button
          type="button"
          className="-my-2 inline-flex min-h-11 items-center px-1 hover:text-accent"
          onClick={() => setPaste("")}
          disabled={!paste}
        >
          Clear paste
        </button>
      </div>

      {visionEnabled && (
        <div className="mt-3">
          <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-accent hover:text-accent-hover">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              className="sr-only"
              aria-label="Attach scorecard screenshots"
              onChange={(event) => {
                const files = event.target.files;
                if (files?.length) {
                  setPreparingImages(true);
                  void prepareImages(files, images.length)
                    .then((next) => {
                      if (next.length)
                        setImages((current) => [...current, ...next].slice(0, 2));
                    })
                    .finally(() => setPreparingImages(false));
                }
                event.target.value = "";
              }}
            />
            {preparingImages ? "Preparing…" : "Attach scorecard screenshot"}
          </label>
          {images.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {images.map((image, index) => (
                <span key={index} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element -- user-attached data URL, not a remote asset */}
                  <img
                    src={image}
                    alt={`Scorecard screenshot ${index + 1}`}
                    className="h-16 w-16 rounded-control border border-rule-soft object-cover"
                  />
                  <button
                    type="button"
                    aria-label={`Remove screenshot ${index + 1}`}
                    className="tap-target absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-control border border-rule bg-paper text-muted hover:text-ink"
                    onClick={() =>
                      setImages((current) =>
                        current.filter((_, at) => at !== index),
                      )
                    }
                  >
                    <X size={11} aria-hidden />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mt-2 border border-warning bg-warning-soft px-3 py-2 text-xs text-warning"
        >
          {error}
        </p>
      )}

      <div className="action-row mt-4">
        {aiEnabled ? (
          <Button
            type="button"
            onClick={() => void importWithAi()}
            disabled={!paste.trim() || busy}
          >
            <Sparkles size={13} /> {busy ? "Reading…" : "Parse with AI"}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={importStandard}
            disabled={!paste.trim()}
          >
            <ClipboardPaste size={13} /> Parse report
          </Button>
        )}
      </div>
      <p className="mt-4 flex items-start gap-2 border-t border-rule-soft pt-3 text-xs leading-relaxed text-muted">
        <Info size={15} className="mt-0.5 shrink-0" />
        <span>
          {aiEnabled
            ? "AI parsing returns an editable draft with cross-checks; you review every field before continuing."
            : "Standard parsing works without AI. AI-assisted parsing appears once a provider is set up in Settings → AI provider."}
        </span>
      </p>

      {!statusChecked && (
        <p
          className="mt-3 flex items-center gap-2.5 text-xs text-muted"
          role="status"
          aria-busy="true"
        >
          <span className="thinking-dots" aria-hidden>
            <i />
            <i />
            <i />
          </span>
          Checking AI availability…
        </p>
      )}

      {/* Keep provider setup reachable from this tab when AI is off. */}
      {!aiEnabled && !configured && (
        <div className="mt-4 rounded-control border border-rule bg-canvas p-4">
          <AiSettingsForm
            variant="panel"
            showHeading={false}
            onChanged={onAiConfigured}
          />
        </div>
      )}
    </div>
  );
}
