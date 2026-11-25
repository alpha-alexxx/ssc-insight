"use client";

import { Sparkles } from "lucide-react";
import {
  StreamingText,
  AnswerActions,
  FollowUps,
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
 *  · The coach's turn is a left-aligned column under a small identity row —
 *    avatar, name, model, time — with reasoning (collapsed) above the answer,
 *    the answer as markdown, then actions and follow-ups once it is done.
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

function Avatar({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--primary)_22%,transparent)]",
        className,
      )}
    >
      <Sparkles className="size-4" />
    </span>
  );
}

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
      className="group/turn flex w-full items-start gap-3"
    >
      <Avatar className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <header className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="text-[13px] font-semibold text-foreground">
            Coach
          </span>
          {message.model ? (
            <span className="max-w-[12rem] truncate rounded-full bg-muted px-1.5 py-px font-mono text-[10.5px] text-muted-foreground">
              {message.model}
            </span>
          ) : null}
          {time ? (
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {time}
            </span>
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
            className="mb-3"
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
            className={cn("text-[14px] leading-[1.7]", markdownColumnClass)}
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
          <div className="mt-3">
            <AnswerActions
              copyText={plain}
              onRegenerate={isLast ? () => ai.chat.regenerateLast() : undefined}
              sources={message.sources}
              disabled={ai.chat.streaming}
              className="-ml-1.5"
            />
            {message.followUps && message.followUps.length > 0 ? (
              <FollowUps
                className="mt-2"
                items={message.followUps}
                onSelect={(item) =>
                  ai.chat.send(
                    item,
                    {
                      view: "ask",
                      date: new Date().toISOString().slice(0, 10),
                    },
                    false,
                  )
                }
              />
            ) : null}
          </div>
        ) : null}
      </div>
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
