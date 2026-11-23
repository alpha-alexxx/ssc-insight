"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EASE } from "@/lib/motion";
import { ChatScroll } from "@/components/chat-scroll";
import {
  StreamingText,
  AnswerActions,
  type AnswerStatus,
} from "@/components/streaming-answer";
import { ThinkingIndicator } from "@/components/thinking-indicator";
import { ThinkingTrace, type ThinkingStep } from "@/components/thinking-trace";
import { MessageEdit } from "@/components/message-edit";
import { ChatNotice } from "@/components/chat-notice";
import { Icon } from "@/components/icon";
import type { ChatMessage } from "@/lib/ai/client-types";
import type { ChatPhase } from "@/components/use-ai-workspace";
import type { AiSheetTaskApi } from "./task-suggestion-card";
import { parseTaskSuggestions } from "@/lib/ai/task-suggestion";
import { Markdown } from "./markdown";
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
  /** The resolved model name, shown on each assistant turn's header row. */
  model?: string;
  /** Tool-outcome notes ("5 todos created") rendered as quiet centered
   * lines at the tail of the log. Per-visit state owned by the host. */
  systemLines?: React.ReactNode;
  /** Sheet mode: cards go full width and type sizing tightens so the same
   * grammar reads well in a ~520px column. */
  compact?: boolean;
  className?: string;
};

/** The grounding sentence shown when a turn carried no reasoning text. */
const GROUNDING_PLEDGE =
  "Reviewed aggregate analytics, the subject profile, the target ledger and the latest 20 logged mocks before answering. Read-only — nothing was written.";

function reasoningSteps(reasoning: string | undefined): ThinkingStep[] {
  if (!reasoning) return [{ label: GROUNDING_PLEDGE }];
  return reasoning
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => ({ label: line }));
}

/**
 * The collapsible thinking record, on Hairline's thinking kit:
 * `ThinkingIndicator` for the honest wait before any evidence arrives
 * ("Connecting…"), then `ThinkingTrace` (variant="reasoning") for the live
 * reasoning record — auto-open while running, folded to "Thought for Ns"
 * once the answer starts — and for stored turns, reopened on demand.
 */
function AssistantThinking({
  reasoning,
  seconds,
  live,
  phase,
  hasContent,
}: {
  reasoning?: string;
  seconds?: number;
  live: boolean;
  phase: ChatPhase | null;
  hasContent: boolean;
}) {
  const livePreAnswer = live && !hasContent;
  const connecting = livePreAnswer && phase === "connecting" && !reasoning;
  // The live timer starts at this turn's first render (≈ send time), the
  // same local-clock honesty as before; stored turns carry their measured
  // seconds instead.
  const [liveStartedAt] = useState(() => Date.now());

  if (connecting) {
    return (
      <div className="mb-3">
        <ThinkingIndicator variant="dots" label="Connecting…" />
      </div>
    );
  }

  const running = livePreAnswer && (Boolean(reasoning) || phase === "thinking");

  return (
    <ThinkingTrace
      variant="reasoning"
      steps={reasoningSteps(reasoning)}
      status={running ? "running" : "done"}
      startedAt={running ? liveStartedAt : undefined}
      duration={running ? undefined : seconds ? seconds * 1000 : undefined}
      className="mb-3"
    />
  );
}

/**
 * One assistant answer: the prose as markdown through Hairline `StreamingText`
 * (react-markdown as the custom children renderer, per the audit approval),
 * plus any ```task-suggestion blocks the coach appended, rendered as
 * confirm-before-write cards. The fenced block stays in the stored content
 * (Copy copies what was said), so it is stripped for display only, here —
 * the one place both chat surfaces render answers.
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
  const status: AnswerStatus = live ? "streaming" : "done";
  return (
    <>
      {text.trim() || !suggestions.length ? (
        <StreamingText status={status}>
          <Markdown content={text} streaming={live} />
        </StreamingText>
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

/** One user turn: the reader's question is the only bubble (right-aligned,
 * via `MessageEdit`'s bubble + Copy/Edit-on-hover grammar); attached
 * screenshots render above it. */
function UserTurn({
  message,
  streaming,
  onEditResend,
}: {
  message: ChatMessage;
  streaming: boolean;
  onEditResend?: (messageId: string, text: string) => void;
}) {
  return (
    <div className="ml-auto flex min-w-0 flex-col items-end gap-1">
      {message.images?.length ? (
        <div className="flex max-w-[85%] flex-wrap justify-end gap-2">
          {message.images.map((image, index) => (
            // eslint-disable-next-line @next/next/no-img-element -- user-attached data URL, not a remote asset
            <img
              key={index}
              src={image}
              alt={`Attached screenshot ${index + 1}`}
              className="max-h-32 rounded-lg border border-border object-contain"
            />
          ))}
        </div>
      ) : null}
      {message.imageOnly ? (
        // Screenshots with no typed text: the images speak for themselves; a
        // quiet caption replaces a fake sentence.
        <p className="text-[11px] text-muted-foreground">Screenshot</p>
      ) : (
        <MessageEdit
          text={message.content}
          onSubmit={(text) => onEditResend?.(message.id, text)}
          disabled={streaming || !onEditResend}
        />
      )}
    </div>
  );
}

/**
 * The chat transcript shared by the side sheet and the /ask page, on the
 * Hairline chat kit: one `role="log"` scroller (`chat-scroll`) of turns in
 * the legacy chat grammar — NO avatars; the reader's question is the only
 * bubble, the coach's answer is plain typeset prose — with `message-edit`
 * for edit & resend, `AnswerActions` for copy/regenerate, the thinking kit
 * for pre-answer reasoning, `chat-notice` for failures, and the
 * jump-to-latest pill when the reader scrolls away while a stream runs.
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
  model,
  systemLines,
  compact = false,
  className,
}: ChatTranscriptProps) {
  const reduced = useReducedMotion();

  const lastId = messages.at(-1)?.id;
  const lastAssistantId = [...messages]
    .reverse()
    .find((message) => message.role === "assistant")?.id;

  return (
    <ChatScroll
      // The log semantics ride the scroll container, as before.
      role="log"
      aria-live="polite"
      aria-busy={streaming || undefined}
      streaming={streaming}
      followKey={lastId}
      className={cn("flex-1", className)}
    >
      {messages.length === 0 && emptyState ? (
        <div className="px-1 py-2">{emptyState}</div>
      ) : (
        <div className="space-y-8 px-1 py-4">
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
                className="min-w-0"
                {...turnEnter}
              >
                {message.role === "user" ? (
                  <UserTurn
                    message={message}
                    streaming={streaming}
                    onEditResend={onEditResend}
                  />
                ) : (
                  <div className="min-w-0 flex-1">
                    {/* The AI turn header: who answered and on which model,
                        above the thinking record and prose. */}
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="grid size-6 place-items-center rounded-full bg-primary text-primary-foreground"
                      >
                        <Icon name="sparkles" size={12} />
                      </span>
                      <span className="font-serif text-sm font-medium text-foreground">
                        Coach
                      </span>
                      {model ? (
                        <span className="text-xs text-muted-foreground">
                          {model}
                        </span>
                      ) : null}
                    </div>
                    {message.reasoning ||
                    message.reasoningSeconds ||
                    (isLast && streaming) ? (
                      <AssistantThinking
                        reasoning={message.reasoning}
                        seconds={message.reasoningSeconds}
                        live={isLast && streaming}
                        phase={phase}
                        hasContent={Boolean(message.content)}
                      />
                    ) : null}
                    {message.content ? (
                      <>
                        <div
                          className={cn(compact ? "w-full" : "max-w-[46rem]")}
                        >
                          <AssistantBody
                            message={message}
                            live={live || (isLast && streaming)}
                            taskApi={taskApi}
                            onTaskAdded={onTaskAdded}
                          />
                        </div>
                        {message.truncated && (
                          <p className="mt-1.5 text-xs text-muted-foreground">
                            The reply ran out of room and may be cut off.
                            Regenerate for a fresh, shorter answer.
                          </p>
                        )}
                        {message.stopped && (
                          <p className="mt-1.5 text-xs text-muted-foreground">
                            Generation stopped — this reply may be incomplete.
                          </p>
                        )}
                        {!streaming ? (
                          <div className="pr-1">
                            <AnswerActions
                              copyText={message.content}
                              onRegenerate={
                                isLast || message.id === lastAssistantId
                                  ? onRegenerate
                                  : undefined
                              }
                            />
                          </div>
                        ) : null}
                      </>
                    ) : message.stopped && !streaming ? (
                      <p className="text-xs text-muted-foreground">
                        Generation stopped before the answer arrived.
                      </p>
                    ) : (
                      !streaming && (
                        <p className="text-sm text-muted-foreground">
                          No response.
                        </p>
                      )
                    )}
                  </div>
                )}
              </motion.article>
            );
          })}
          {systemLines ? <div className="pb-1">{systemLines}</div> : null}
        </div>
      )}
      {error ? (
        // In flow at the end of the log — the failed turn's neighborhood —
        // instead of a floating card that collides with the jump pill.
        <ChatNotice
          kind="error"
          title={error}
          onRetry={onRetry}
          className="mx-1 mb-3 mt-1"
        />
      ) : null}
    </ChatScroll>
  );
}
