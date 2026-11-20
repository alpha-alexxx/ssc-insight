"use client";

import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ArrowDown, ChevronDown, Pencil } from "lucide-react";
import type { ChatMessage } from "@/lib/ai/client-types";
import type { ChatPhase } from "@/components/use-ai-workspace";
import type { AiSheetTaskApi } from "./task-suggestion-card";
import { parseTaskSuggestions } from "@/lib/ai/task-suggestion";
import { Markdown } from "./markdown";
import { CopyButton } from "./copy-button";
import { ThinkingIndicator } from "./thinking-indicator";
import { TaskSuggestionCard } from "./task-suggestion-card";
import { cn } from "@/lib/utils";

export type ChatTranscriptProps = {
  messages: ChatMessage[];
  streaming: boolean;
  phase: ChatPhase | null;
  /** True when this surface is the live owner of the stream (sheet or page).
   * Controls the caret and the indicator; history always renders finished
   * turns exactly as stored. */
  onRetry?: () => void;
  onEditResend?: (messageId: string, text: string) => void;
  onRegenerate?: () => void;
  /** Personal-task creator for coach-suggested task cards (read-only AI;
   * the card's Add click performs the real write). */
  taskApi?: AiSheetTaskApi;
  /** Shell feedback (toast) after a suggested task is added. */
  onTaskAdded?: () => void;
  /** Rendered when there are no messages yet (quick questions, setup). */
  emptyState?: React.ReactNode;
  error?: string;
  className?: string;
};

type TurnActionsProps = {
  message: ChatMessage;
  isLast: boolean;
  streaming: boolean;
  onEditResend?: (messageId: string, text: string) => void;
  onRegenerate?: () => void;
};

/** Per-turn actions, revealed on hover/focus (always visible on touch). */
const TurnActions = memo(function TurnActions({
  message,
  isLast,
  streaming,
  onEditResend,
  onRegenerate,
}: TurnActionsProps) {
  return (
    <div className="turn-actions flex items-center gap-1">
      {message.role === "user" ? (
        onEditResend && !streaming ? (
          <EditButton message={message} onEditResend={onEditResend} />
        ) : null
      ) : (
        <>
          <CopyButton value={message.content} label="Copy" />
          {isLast && onRegenerate && !streaming ? (
            <button
              type="button"
              className="tap-target inline-flex items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-ink"
              onClick={onRegenerate}
            >
              Regenerate
            </button>
          ) : null}
        </>
      )}
    </div>
  );
});

function EditButton({
  message,
  onEditResend,
}: {
  message: ChatMessage;
  onEditResend: (messageId: string, text: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);
  if (!editing)
    return (
      <button
        type="button"
        className="tap-target inline-flex items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-ink"
        onClick={() => {
          setDraft(message.content);
          setEditing(true);
        }}
      >
        <Pencil size={13} /> Edit
      </button>
    );
  return (
    <form
      className="flex w-full items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        const value = draft.trim();
        setEditing(false);
        if (value && value !== message.content)
          onEditResend(message.id, value);
      }}
    >
      <textarea
        autoFocus
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setEditing(false);
        }}
        rows={2}
        className="min-w-0 flex-1 resize-y rounded-control border border-rule bg-paper px-3 py-2 text-sm leading-relaxed focus:border-accent focus:outline-none"
        aria-label="Edit your question"
      />
      <button
        type="submit"
        className="min-h-9 rounded-control bg-ink px-3 text-xs font-medium text-paper"
      >
        Resend
      </button>
      <button
        type="button"
        className="min-h-9 rounded-control border border-rule px-3 text-xs font-medium text-muted hover:text-ink"
        onClick={() => setEditing(false)}
      >
        Cancel
      </button>
    </form>
  );
}

/** The collapsible "Thought for Ns" disclosure above an assistant answer. */
function ReasoningDisclosure({
  reasoning,
  seconds,
}: {
  reasoning: string;
  seconds?: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-rule-soft pb-2">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="tap-target flex items-center gap-1 text-xs font-medium text-muted transition-colors hover:text-ink"
      >
        <ChevronDown
          size={13}
          className={cn(
            "transition-transform duration-[var(--dur-quick)]",
            open && "rotate-180",
          )}
        />
        Thought{seconds ? ` for ${seconds}s` : ""}
      </button>
      {open && (
        <div className="mt-2 whitespace-pre-wrap border-l-2 border-rule-soft pl-3 text-xs leading-relaxed text-muted">
          {reasoning}
        </div>
      )}
    </div>
  );
}

/**
 * One assistant answer: the prose as markdown, plus any ```task-suggestion
 * blocks the coach appended, rendered as confirm-before-write cards. The
 * fenced block stays in the stored content (Copy copies what was said), so
 * it is stripped for display only, here — the one place both chat surfaces
 * render answers.
 */
function AssistantBody({
  message,
  live,
  taskApi,
  onTaskAdded,
}: {
  message: ChatMessage;
  live: boolean;
  taskApi?: AiSheetTaskApi;
  onTaskAdded?: () => void;
}) {
  const { text, suggestions } = parseTaskSuggestions(message.content);
  return (
    <>
      {text.trim() || !suggestions.length ? (
        <Markdown content={text} streaming={live} />
      ) : null}
      {suggestions.map((suggestion, index) => (
        <TaskSuggestionCard
          key={`${message.id}-${index}`}
          suggestion={suggestion}
          taskApi={taskApi}
          onTaskAdded={onTaskAdded}
        />
      ))}
    </>
  );
}

/**
 * The chat transcript shared by the side sheet and the /ask page: one
 * `role="log"` scroller of turns — the user's question as a restrained soft
 * surface, the answer as full-width markdown — with per-turn actions, the
 * phase indicator before the first token, and a jump-to-latest pill when the
 * reader has scrolled away while a stream runs.
 */
export function ChatTranscript({
  messages,
  streaming,
  phase,
  onRetry,
  onEditResend,
  onRegenerate,
  taskApi,
  onTaskAdded,
  emptyState,
  error,
  className,
}: ChatTranscriptProps) {
  const logRef = useRef<HTMLDivElement>(null);
  const follow = useRef(true);
  const [showLatest, setShowLatest] = useState(false);

  const handleScroll = useCallback(() => {
    const log = logRef.current;
    if (!log) return;
    const gap = log.scrollHeight - log.scrollTop - log.clientHeight;
    const nearBottom = gap < 80;
    follow.current = nearBottom;
    setShowLatest(!nearBottom && gap > 240);
  }, []);

  useEffect(() => {
    const log = logRef.current;
    if (!log) return;
    if (follow.current) log.scrollTop = log.scrollHeight;
  }, [messages, streaming]);

  const lastId = messages.at(-1)?.id;
  const lastAssistantId = [...messages]
    .reverse()
    .find((message) => message.role === "assistant")?.id;

  return (
    <div className={cn("relative min-h-0 flex-1", className)}>
      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        aria-busy={streaming}
        className="h-full overflow-y-auto overscroll-contain"
        onScroll={handleScroll}
      >
        {messages.length === 0 && emptyState ? (
          <div className="px-1 py-2">{emptyState}</div>
        ) : (
          <div className="space-y-6 px-1 py-4">
            {messages.map((message) => {
              const isLast = message.id === lastId;
              const live =
                isLast &&
                streaming &&
                (message.role === "assistant" || Boolean(message.content));
              return (
                <article
                  key={message.id}
                  className={cn(
                    "chat-turn group min-w-0",
                    message.role === "user" ? "chat-turn-user" : "chat-turn-ai",
                  )}
                >
                  {message.role === "user" ? (
                    <div className="flex flex-col items-end gap-1">
                      <div className="max-w-[85%] rounded-control border border-rule-soft bg-soft px-3.5 py-2.5 text-[length:var(--type-body)] leading-relaxed whitespace-pre-wrap text-ink">
                        {message.content}
                      </div>
                      <TurnActions
                        message={message}
                        isLast={isLast}
                        streaming={streaming}
                        onEditResend={onEditResend}
                        onRegenerate={onRegenerate}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {message.reasoning ? (
                        <ReasoningDisclosure
                          reasoning={message.reasoning}
                          seconds={message.reasoningSeconds}
                        />
                      ) : null}
                      {message.content ? (
                        <AssistantBody
                          message={message}
                          live={live || (isLast && streaming)}
                          taskApi={taskApi}
                          onTaskAdded={onTaskAdded}
                        />
                      ) : isLast && streaming ? (
                        <ThinkingIndicator
                          key={phase ?? "thinking"}
                          phase={phase === "connecting" ? "connecting" : "thinking"}
                        />
                      ) : (
                        !streaming && (
                          <p className="text-sm text-muted">No response.</p>
                        )
                      )}
                      {message.truncated && (
                        <p className="text-xs text-muted">
                          The reply ran out of room and may be cut off. Regenerate
                          for a fresh, shorter answer.
                        </p>
                      )}
                      {message.content && !streaming ? (
                        <TurnActions
                          message={message}
                          isLast={isLast}
                          streaming={streaming}
                          onEditResend={onEditResend}
                          onRegenerate={
                            isLast || message.id === lastAssistantId
                              ? onRegenerate
                              : undefined
                          }
                        />
                      ) : null}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
      {showLatest && (
        <button
          type="button"
          className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-pill border border-rule bg-paper px-3 py-1.5 text-xs font-medium text-ink"
          onClick={() => {
            follow.current = true;
            setShowLatest(false);
            logRef.current?.scrollTo({
              top: logRef.current.scrollHeight,
              behavior: "smooth",
            });
          }}
        >
          <ArrowDown size={13} /> Jump to latest
        </button>
      )}
      {error && (
        <div className="absolute inset-x-1 bottom-3 rounded-control border border-danger bg-paper p-3">
          <p role="alert" className="text-xs leading-relaxed text-danger">
            {error}
          </p>
          {onRetry && (
            <button
              type="button"
              className="mt-2 min-h-8 rounded-control border border-rule px-2.5 text-xs font-medium text-ink hover:border-ink"
              onClick={onRetry}
            >
              Try again
            </button>
          )}
        </div>
      )}
    </div>
  );
}
