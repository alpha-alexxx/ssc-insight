"use client";

import { memo, useMemo, useState } from "react";
import { ChatHistory, type ChatSummary } from "@/components/chat-history";
import { toast } from "@/components/toast-stack";
import type { ChatHistoryApi } from "@/components/use-ai-workspace";

/**
 * The conversation history rail shared by the sheet's history panel and the
 * /ask page, on Hairline `chat-history`: search, day-grouped rows, inline
 * rename, and delete with an undo window. The list mutations come from the
 * workspace hook (device-local storage) — selecting restores the transcript,
 * renaming rewrites the title, deleting drops it after the undo window.
 */
export const ConversationList = memo(function ConversationList({
  history,
  streaming,
  onNewChat,
  className,
}: {
  history: ChatHistoryApi;
  streaming: boolean;
  onNewChat?: () => void;
  className?: string;
}) {
  // A delete refused while a stream owns the conversation remounts the list
  // so the row returns; the kit's row has already folded by then.
  const [refusals, setRefusals] = useState(0);

  const chats = useMemo<ChatSummary[]>(
    () =>
      history.conversations.map((conversation) => ({
        id: conversation.id,
        title: conversation.title,
        updatedAt: Date.parse(conversation.updatedAt) || Date.now(),
      })),
    [history.conversations],
  );

  const remove = (id: string) => {
    // Deleting the conversation that owns an in-flight answer would orphan
    // the stream's final append; ask the reader to stop it first.
    if (streaming && id === history.activeId) {
      toast.warning("Conversation locked", {
        description:
          "Stop the running reply before deleting this conversation.",
      });
      setRefusals((count) => count + 1);
      return;
    }
    history.remove(id);
  };

  return (
    <ChatHistory
      key={refusals}
      chats={chats}
      activeId={history.activeId ?? undefined}
      onSelect={history.select}
      onNew={() => {
        if (streaming) return;
        history.newChat();
        onNewChat?.();
      }}
      onRename={history.rename}
      onDelete={remove}
      className={className}
    />
  );
});
