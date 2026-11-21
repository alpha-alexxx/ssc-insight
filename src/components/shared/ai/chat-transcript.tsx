"use client";

import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowDown, ChevronDown, Pencil, Shield } from "lucide-react";
import { EASE } from "@/lib/motion";
import type { ChatMessage } from "@/lib/ai/client-types";
import type { ChatPhase } from "@/components/use-ai-workspace";
import { Button } from "@/components/ui/button";
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
  /** Sheet mode: cards go full width and type sizing tightens so the same
   * grammar reads well in a ~520px column. */
  compact?: boolean;
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
          {message.content ? (
            <CopyButton value={message.content} label="Copy" />
          ) : null}
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
      <Button type="submit" size="sm">
        Resend
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setEditing(false)}
      >
        Cancel
      </Button>
    </form>
  );
}

/**
 * The collapsible "Read the workspace" line at the top of an assistant
 * answer — flat, like the rest of the legacy grammar: shield, label, the
 * measured reasoning time, chevron. Expanding shows the model's own hidden
 * reasoning when it streamed any, else the standard read sentence.
 */
function ReasoningTrace({
  reasoning,
  seconds,
}: {
  reasoning?: string;
  seconds?: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center gap-1.5 py-0.5 text-left"
      >
        <Shield size={11} aria-hidden className="shrink-0 text-accent" />
        <span className="section-label shrink-0">Read the workspace</span>
        <span className="tabular-nums shrink-0 text-[0.625rem] text-muted">
          {seconds ? `· ${seconds}s` : ""}
        </span>
        <ChevronDown
          size={12}
          aria-hidden
          className={cn(
            "shrink-0 text-muted transition-transform duration-[var(--dur-quick)]",
            open && "rotate-180",
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: EASE }}
            className="overflow-hidden pl-6 text-[0.6875rem] leading-relaxed text-muted"
          >
            {reasoning ? (
              <span className="block whitespace-pre-wrap border-l-2 border-rule-soft py-1.5 pl-2.5">
                {reasoning}
              </span>
            ) : (
              <span className="block py-1.5">
                Reviewed aggregate analytics, the subject profile, the target
                ledger and the latest 20 logged mocks before answering.
                Read-only — nothing was written.
                {seconds ? ` Drawn in ${seconds}s.` : ""}
              </span>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
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
 * `role="log"` scroller of turns in the legacy chat grammar (Claude,
 * ChatGPT, z.ai) — NO avatars anywhere; the reader's question is the only
 * bubble (right-aligned, soft), the coach's answer is plain typeset prose
 * flush with the column edge — with per-turn actions, a flat thinking line
 * before the first token, and a jump-to-latest pill when the reader has
 * scrolled away while a stream runs.
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
  compact = false,
  className,
}: ChatTranscriptProps) {
  const reduced = useReducedMotion();
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
          <div className="space-y-5 px-1 py-4">
            {messages.map((message) => {
              const isLast = message.id === lastId;
              const live =
                isLast &&
                streaming &&
                (message.role === "assistant" || Boolean(message.content));
              const turnEnter = reduced
                ? {}
                : {
                    initial: { opacity: 0, y: 8 },
                    animate: { opacity: 1, y: 0 },
                    transition: { duration: 0.24, ease: EASE },
                  };
              return (
                <motion.article
                  key={message.id}
                  className={cn(
                    "chat-turn group min-w-0",
                    message.role === "user" ? "chat-turn-user" : "chat-turn-ai",
                  )}
                  {...turnEnter}
                >
                  {message.role === "user" ? (
                    <div className="flex min-w-0 max-w-[85%] flex-col items-end gap-1">
                        {message.images?.length ? (
                          <div className="flex flex-wrap justify-end gap-2">
                            {message.images.map((image, index) => (
                              // eslint-disable-next-line @next/next/no-img-element -- user-attached data URL, not a remote asset
                              <img
                                key={index}
                                src={image}
                                alt={`Attached screenshot ${index + 1}`}
                                className="max-h-32 rounded-control border border-rule-soft object-contain"
                              />
                            ))}
                          </div>
                        ) : null}
                        {message.imageOnly ? (
                          // Screenshots with no typed text: the images speak for
                          // themselves; a quiet caption replaces a fake sentence.
                          <p className="text-[11px] text-muted">Screenshot</p>
                        ) : (
                          <div className="whitespace-pre-line rounded-2xl bg-soft px-4 py-2.5 text-[length:var(--type-body)] leading-relaxed text-ink [overflow-wrap:anywhere]">
                            {message.content}
                          </div>
                        )}
                        <TurnActions
                          message={message}
                          isLast={isLast}
                          streaming={streaming}
                          onEditResend={onEditResend}
                          onRegenerate={onRegenerate}
                        />
                      </div>
                  ) : (
                    <div className="min-w-0 flex-1">
                      {message.content || message.reasoning ? (
                        <div className={cn(compact ? "w-full" : "max-w-[46rem]")}>
                          {message.reasoning || message.reasoningSeconds ? (
                            <ReasoningTrace
                              reasoning={message.reasoning}
                              seconds={message.reasoningSeconds}
                            />
                          ) : null}
                          <AssistantBody
                            message={message}
                            live={live || (isLast && streaming)}
                            taskApi={taskApi}
                            onTaskAdded={onTaskAdded}
                          />
                        </div>
                      ) : isLast && streaming ? (
                        <ThinkingIndicator
                          key={phase ?? "thinking"}
                          phase={phase === "connecting" ? "connecting" : "thinking"}
                        />
                      ) : message.stopped && !streaming ? (
                        <p className="text-xs text-muted">
                          Generation stopped before the answer arrived.
                        </p>
                      ) : (
                        !streaming && (
                          <p className="text-sm text-muted">No response.</p>
                        )
                      )}
                      {message.truncated && (
                        <p className="mt-1.5 text-xs text-muted">
                          The reply ran out of room and may be cut off. Regenerate
                          for a fresh, shorter answer.
                        </p>
                      )}
                      {message.stopped && !streaming && message.content ? (
                        <p className="mt-1.5 text-xs text-muted">
                          Generation stopped — this reply may be incomplete.
                        </p>
                      ) : null}
                      {(message.content || message.stopped) && !streaming ? (
                        <div className="pr-1">
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
                        </div>
                      ) : null}
                    </div>
                  )}
                </motion.article>
              );
            })}
          </div>
        )}
        {error ? (
          // In flow at the end of the log — the failed turn's neighborhood —
          // instead of a floating card that collides with the jump pill.
          <div className="mx-1 mb-3 mt-1 rounded-control border border-danger bg-paper p-3">
            <p role="alert" className="text-xs leading-relaxed text-danger">
              {error}
            </p>
            {onRetry ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={onRetry}
              >
                Try again
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
      {showLatest && (
        <button
          type="button"
          className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-pill border border-rule bg-ink px-3.5 py-1.5 text-xs font-medium text-paper shadow-pop"
          onClick={() => {
            follow.current = true;
            setShowLatest(false);
            logRef.current?.scrollTo({
              top: logRef.current.scrollHeight,
              behavior: "smooth",
            });
          }}
        >
          <ArrowDown size={13} aria-hidden /> New replies
        </button>
      )}
    </div>
  );
}
