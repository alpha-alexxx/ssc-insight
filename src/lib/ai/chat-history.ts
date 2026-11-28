import type { ChatAnswerVersion, ChatMessage } from "./client-types";

export const MAX_CHAT_ANSWER_VERSIONS = 6;

/** Snapshot the current answer before replaying its user turn. The caller
 * swaps the message to the selected answer first, if one was selected. */
export function preserveAnswerVersion(
  messages: ChatMessage[],
  assistantId: string,
): ChatMessage[] {
  return messages.map((message) => {
    if (
      message.id !== assistantId ||
      message.role !== "assistant" ||
      !message.content.trim()
    )
      return message;
    const version: ChatAnswerVersion = {
      content: message.content,
      ...(message.reasoning ? { reasoning: message.reasoning } : {}),
      ...(message.reasoningSeconds != null
        ? { reasoningSeconds: message.reasoningSeconds }
        : {}),
      ...(message.stopped ? { stopped: true } : {}),
      ...(message.truncated ? { truncated: true } : {}),
      ...(message.at ? { at: message.at } : {}),
    };
    return {
      ...message,
      versions: [...(message.versions ?? []), version].slice(
        -MAX_CHAT_ANSWER_VERSIONS,
      ),
    };
  });
}

export type ChatRequestIdentity = {
  generation: number;
  conversationId: string | null;
};

/** A token ties every async continuation to the generation and conversation
 * that started it. A request monotonically advances this state even when it
 * opens a brand-new, still-id-less conversation. */
export function beginChatRequest(
  currentGeneration: number,
  conversationId: string | null,
): ChatRequestIdentity {
  return { generation: currentGeneration + 1, conversationId };
}

/** Aborting the transport alone is insufficient: already-buffered completion
 * handlers and finally blocks must not write into a newly selected thread. */
export function invalidateChatRequest(
  identity: ChatRequestIdentity | null,
): ChatRequestIdentity | null {
  return identity
    ? { ...identity, generation: identity.generation + 1 }
    : null;
}

export function isCurrentChatRequest(
  active: ChatRequestIdentity | null,
  request: ChatRequestIdentity,
): boolean {
  return (
    active?.generation === request.generation &&
    active.conversationId === request.conversationId
  );
}

/** A retry replaces the latest user/assistant exchange, including partial output. */
export function chatBaseForSend(
  messages: ChatMessage[],
  retry: boolean,
): ChatMessage[] {
  if (!retry) return messages;
  const index = messages.findLastIndex((message) => message.role === "user");
  return index < 0 ? messages : messages.slice(0, index);
}
