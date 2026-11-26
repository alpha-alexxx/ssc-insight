"use client";

import {
  StreamingText,
  AnswerActions,
  type AnswerSource,
} from "@/components/streaming-answer";
import type { AiScreenContext } from "@/lib/ai/client-types";
import { ThinkingTrace } from "@/components/thinking-trace";
import { ThinkingIndicator } from "@/components/thinking-indicator";
import { MessageEdit } from "@/components/message-edit";
import { cn } from "@/lib/utils";
import { AskMarkdown, markdownColumnClass } from "./ask-markdown";

/**
 * One turn of the conversation.
 *
 *  · The person's turn is a right-aligned bubble (Hairline MessageEdit), so
 *    copy and edit-and-resend sit under it where the thumb already is.
 *  · The coach's turn is a full-width column behind a quiet identity line —
 *    a small "Coach" label and the time, no avatar, no model chip — with
 *    reasoning (collapsed) above the answer, the answer as markdown, then
 *    copy/regenerate revealed on hover (always visible on touch) once done.
 *  · Between "sent" and "first word" the coach's turn is the thinking
 *    indicator in the same slot, so the layout never jumps when text arrives.
 */

interface AIChat {
  streaming: boolean;
  messages: Array<{ id: string }>;
  editResend: (id: string, text: string) => void;
  regenerateLast: () => void;
  retryLast: () => void;
  send: (
    text: string,
    screen?: AiScreenContext | null,
    retry?: boolean,
    images?: string[],
  ) => Promise<void>;
}

export interface AskMessageProps {
  message: {
    id: string;
    role: "user" | "assistant";
    content:
      | string
      | Array<string | { type: "citation"; label: string; href?: string }>;
    at?: string;
    model?: string;
    reasoning?: string;
    reasoningSeconds?: number;
    reasoningStartedAt?: number;
    stopped?: boolean;
    truncated?: boolean;
    error?: string;
    sources?: AnswerSource[];
    followUps?: string[];
  };
  ai: { chat: AIChat };
  onRetry: () => void;
  screenContext: AiScreenContext;
  /** The in-flight phase, used only on the turn that is still being answered. */
  phase?: "connecting" | "thinking" | "writing" | "idle" | null;
  /** When the in-flight turn was sent (ms), so the wait can be timed. */
  waitingSince?: number;
}

const clock = (iso?: string) => {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
};

function UserTurn({
  text,
  onSubmit,
  disabled,
}: {
  text: string;
  onSubmit: (t: string) => void;
  disabled: boolean;
}) {
  return (
    <MessageEdit
      text={text}
      onSubmit={onSubmit}
      disabled={disabled}
      disabledReason="Wait for the answer to finish"
      className="ml-auto max-w-[94%] sm:max-w-[82%]"
    >
      {text}
    </MessageEdit>
  );
}

function AssistantTurn({
  message,
  ai,
  onRetry,
  phase,
  waitingSince,
}: Pick<
  AskMessageProps,
  "message" | "ai" | "onRetry" | "phase" | "waitingSince"
>) {
  const lastId = ai.chat.messages[ai.chat.messages.length - 1]?.id;
  const isLast = message.id === lastId;
  const live = isLast && ai.chat.streaming;
  const status = live
    ? "streaming"
    : message.stopped
      ? "stopped"
      : message.error
        ? "error"
        : "done";
  const plain =
    typeof message.content === "string"
      ? message.content
      : message.content
          .map((segment) =>
            typeof segment === "string" ? segment : segment.label,
          )
          .join("");
  const steps = message.reasoning
    ? message.reasoning
        .split(/(?<=[.!?])\s+/)
        .filter(Boolean)
        .map((label) => ({ label }))
    : [];
  const hasAnswer = plain.trim().length > 0;
  const time = clock(message.at);

  // Nothing came back and nothing is coming (the turn failed or was stopped
  // before a word): the thread-level notice speaks for it, not an empty turn.
  if (!hasAnswer && !live && !message.reasoning) return null;

  return (
    <article
      aria-label="Coach reply"
      className="group/turn flex w-full flex-col"
    >
      <header className="mb-2 flex items-center gap-x-2 gap-y-0.5">
        <span className="text-[12.5px] font-medium leading-none text-muted-foreground/90">
          Coach
        </span>
        {time ? (
          <>
            <span aria-hidden="true" className="text-[11px] text-muted-foreground/50">
              ·
            </span>
            <span className="text-[11px] tabular-nums leading-none text-muted-foreground/80">
              {time}
            </span>
          </>
        ) : null}
      </header>

      {message.reasoning ? (
        <ThinkingTrace
          variant="reasoning"
          status={live && !hasAnswer ? "running" : "done"}
          startedAt={message.reasoningStartedAt}
          duration={
            message.reasoningSeconds
              ? message.reasoningSeconds * 1000
              : undefined
          }
          steps={steps}
          className="mb-2.5 text-[12.5px] [&_svg]:size-3.5"
        />
      ) : null}

      {live && !hasAnswer && !message.reasoning ? (
        <ThinkingIndicator
          variant="orbit"
          label={
            phase === "thinking"
              ? "Thinking it through"
              : "Reading your workspace"
          }
          startedAt={waitingSince}
        />
      ) : hasAnswer ? (
        <StreamingText
          status={status}
          onRetry={onRetry}
          data-streaming={live}
          className={cn(
            "text-[13.5px] leading-[1.65] text-foreground sm:text-[14px]",
            markdownColumnClass,
          )}
        >
          <AskMarkdown content={plain} />
        </StreamingText>
      ) : null}

      {message.truncated && !live ? (
        <p className="mt-2 text-[11.5px] text-muted-foreground">
          The answer was cut at the length limit.{" "}
          <button
            type="button"
            onClick={() => ai.chat.regenerateLast()}
            className="cursor-pointer font-medium text-foreground underline decoration-border underline-offset-2 hover:decoration-foreground"
          >
            Try again
          </button>
        </p>
      ) : null}

      {hasAnswer && !live ? (
        <div
          className={cn(
            "mt-2 flex transition-opacity duration-200",
            "opacity-0 focus-within:opacity-100 group-hover/turn:opacity-100",
            "[@media(hover:none)]:opacity-100 motion-reduce:transition-none",
          )}
        >
          <AnswerActions
            copyText={plain}
            onRegenerate={isLast ? () => ai.chat.regenerateLast() : undefined}
            sources={message.sources}
            disabled={ai.chat.streaming}
            className="-ml-1.5"
          />
        </div>
      ) : null}
    </article>
  );
}

export function AskMessage({
  message,
  ai,
  onRetry,
  phase,
  waitingSince,
}: AskMessageProps) {
  if (message.role === "user") {
    const text = typeof message.content === "string" ? message.content : "";
    return (
      <UserTurn
        text={text}
        disabled={ai.chat.streaming}
        onSubmit={(next) => ai.chat.editResend(message.id, next)}
      />
    );
  }
  return (
    <AssistantTurn
      message={message}
      ai={ai}
      onRetry={onRetry}
      phase={phase}
      waitingSince={waitingSince}
    />
  );
}
