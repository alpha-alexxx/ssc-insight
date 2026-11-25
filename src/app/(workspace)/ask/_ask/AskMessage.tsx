"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import {
  StreamingText,
  AnswerActions,
  FollowUps,
  AnswerSource,
} from "@/components/streaming-answer";
import type { AiScreenContext } from "@/lib/ai/client-types";
import { ThinkingTrace } from "@/components/thinking-trace";
import { MessageEdit } from "@/components/message-edit";

interface AIChat {
  streaming: boolean;
  messages: Array<{ id: string }>;
  editResend: (id: string, text: string) => void;
  regenerateLast: () => void;
  retryLast: () => void;
  send: (text: string, screen?: AiScreenContext | null, retry?: boolean, images?: string[]) => Promise<void>;
}

export interface AskMessageProps {
  message: {
    id: string;
    role: "user" | "assistant";
    content: string | Array<string | { type: "citation"; label: string; href?: string }>;
    at?: string;
    model?: string;
    reasoning?: string;
    reasoningStartedAt?: number;
    stopped?: boolean;
    error?: string;
    sources?: AnswerSource[];
    followUps?: string[];
  };
  ai: { chat: AIChat };
  onRetry: () => void;
  screenContext: AiScreenContext;
}

function UserTurn({ text, onSubmit, disabled }: { text: string; onSubmit: (t: string) => void; disabled: boolean }) {
  return (
    <MessageEdit
      text={text}
      onSubmit={onSubmit}
      disabled={disabled}
      disabledReason="Wait for the answer to finish"
      className="w-full max-w-[46rem]"
    >
      {text}
    </MessageEdit>
  );
}

function AssistantTurn({ message, ai, onRetry }: { message: AskMessageProps["message"]; ai: AskMessageProps["ai"]; onRetry: () => void }) {
  const lastId = ai.chat.messages[ai.chat.messages.length - 1]?.id;
  const isLast = message.id === lastId;
  const status = isLast && ai.chat.streaming ? "streaming" : message.stopped ? "stopped" : message.error ? "error" : "done";
  const segments = typeof message.content === "string" ? [message.content] : message.content;
  const plain = typeof message.content === "string" ? message.content : segments.map((s) => (typeof s === "string" ? s : "")).join("");
  const steps = message.reasoning
    ? message.reasoning.split(/(?<=[.!?])\s+/).filter(Boolean).map((label) => ({ label }))
    : [];

  return (
    <div className="w-full max-w-[46rem]">
      <div className="flex items-start gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-baseline gap-2">
            <span className="font-medium text-foreground">Coach</span>
            {message.model ? <span className="text-[11px] text-muted-foreground">{message.model}</span> : null}
          </div>
          <StreamingText content={segments} status={status} onRetry={onRetry} />
          {message.reasoning ? (
            <ThinkingTrace
              variant="reasoning"
              status={isLast && ai.chat.streaming ? "running" : "done"}
              startedAt={message.reasoningStartedAt}
              steps={steps}
              className="mt-2"
            />
          ) : null}
          <div className="mt-4">
            <AnswerActions
              copyText={plain}
              onRegenerate={() => ai.chat.regenerateLast()}
              sources={message.sources}
              disabled={ai.chat.streaming}
            />
            {message.followUps && message.followUps.length > 0 ? (
              <FollowUps
                items={message.followUps}
                onSelect={(item) => ai.chat.send(item, { view: "ask", date: new Date().toISOString().slice(0, 10) }, false)}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AskMessage({ message, ai, onRetry }: AskMessageProps) {
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
  return <AssistantTurn message={message} ai={ai} onRetry={onRetry} />;
}
