"use client";

import {
  StreamingText,
  AnswerActions,
  type AnswerSource,
} from "@/components/streaming-answer";
import type {
  AiScreenContext,
  ChatAnswerVersion,
} from "@/lib/ai/client-types";
import {
  parseTaskSuggestions,
  type TaskSuggestion,
} from "@/lib/ai/task-suggestion";
import { ResponseVersions } from "@/components/response-versions";
import { Button } from "@/components/button";
import { ThinkingTrace } from "@/components/thinking-trace";
import { ThinkingIndicator } from "@/components/thinking-indicator";
import { MessageEdit } from "@/components/message-edit";
import { cn } from "@/lib/utils";
import { shortDate } from "@/lib/format";
import { AskMarkdown, markdownColumnClass } from "./ask-markdown";

interface AIChat {
  streaming: boolean;
  messages: Array<{ id: string }>;
  editResend: (id: string, text: string) => void;
  regenerateLast: () => void;
  retryLast: () => void;
  versionIndexes: Record<string, number>;
  selectVersion: (messageId: string, index: number) => void;
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
    versions?: ChatAnswerVersion[];
    error?: string;
    sources?: AnswerSource[];
    followUps?: string[];
  };
  ai: { chat: AIChat };
  onRetry: () => void;
  onReviewTask: (suggestion: TaskSuggestion) => void;
  screenContext: AiScreenContext;
  phase?: "connecting" | "thinking" | "writing" | "idle" | null;
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
  onReviewTask,
  phase,
  waitingSince,
}: Pick<
  AskMessageProps,
  "message" | "ai" | "onRetry" | "onReviewTask" | "phase" | "waitingSince"
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
  const parsed = parseTaskSuggestions(plain);
  const versionCount = (message.versions?.length ?? 0) + 1;
  const versionIndex = ai.chat.versionIndexes[message.id] ?? versionCount - 1;

  const answerBody = (
    <>
      <StreamingText
        status={status}
        density="compact"
        onRetry={onRetry}
        data-streaming={live}
        className={cn("text-foreground", markdownColumnClass)}
      >
        <AskMarkdown content={parsed.text} />
      </StreamingText>
      {parsed.suggestions.map((suggestion, index) => (
        <section
          key={`${suggestion.title}-${index}`}
          aria-label={`Suggested task: ${suggestion.title}`}
          className="mt-3 rounded-xl bg-primary/[0.055] p-3.5 shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--primary)_18%,transparent)]"
        >
          <h3 className="font-serif text-[17px] font-medium leading-snug text-foreground">
            {suggestion.title}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {[
              suggestion.dueDate ? `Due ${shortDate(suggestion.dueDate)}` : null,
              suggestion.priority !== "normal"
                ? `${suggestion.priority} priority`
                : null,
            ]
              .filter(Boolean)
              .join(" · ") || "Review the date and details before adding it."}
          </p>
          {suggestion.urlRemovedReason ? (
            <p className="mt-2 text-xs text-warning">
              {suggestion.urlRemovedReason}
            </p>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-3"
            disabled={live}
            onClick={() => onReviewTask(suggestion)}
          >
            Review task
          </Button>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Nothing is added until you review and apply it.
          </p>
        </section>
      ))}
    </>
  );

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
            <span
              aria-hidden="true"
              className="text-[11px] text-muted-foreground/50"
            >
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
        versionCount > 1 ? (
          <ResponseVersions
            count={versionCount}
            index={versionIndex}
            onIndexChange={(index) =>
              ai.chat.selectVersion(message.id, index)
            }
          >
            {answerBody}
          </ResponseVersions>
        ) : (
          answerBody
        )
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
            "mt-1 flex transition-opacity duration-200",
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
  onReviewTask,
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
      onReviewTask={onReviewTask}
      phase={phase}
      waitingSince={waitingSince}
    />
  );
}
