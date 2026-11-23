"use client";

import { memo, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Check, Pencil, Plus, Search, Trash2, X } from "@/components/ui/icons";
import { EASE } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast";
import { searchConversations } from "@/lib/ai/conversations";
import type { StoredConversation } from "@/lib/ai/conversations";
import type { ChatHistoryApi } from "@/components/use-ai-workspace";
import { cn } from "@/lib/utils";

/** Relative age for a stored conversation, computed from its updatedAt. */
export function relativeLabel(iso: string): string {
  const time = Date.parse(iso);
  if (!Number.isFinite(time)) return "";
  const minutes = Math.floor((Date.now() - time) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

/** Deterministic day math (IST-independent local clock, Monday-start weeks). */
function startOfDay(time: number): number {
  const date = new Date(time);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function startOfWeek(time: number): number {
  const date = new Date(startOfDay(time));
  const weekday = (date.getDay() + 6) % 7; // Monday = 0
  date.setDate(date.getDate() - weekday);
  return date.getTime();
}

type ConversationGroup = {
  key: string;
  label: string;
  conversations: StoredConversation[];
};

/**
 * Bucket the rail into honest time groups — newest activity first inside a
 * group, groups in chronological order. A conversation lands by its last
 * activity (last message, else updatedAt).
 */
export function groupConversations(
  conversations: StoredConversation[],
): ConversationGroup[] {
  const now = Date.now();
  const today = startOfDay(now);
  const weekStart = startOfWeek(now);
  const lastActivity = (conversation: StoredConversation) =>
    conversation.messages.at(-1)?.at ?? conversation.updatedAt;

  const sorted = [...conversations].sort(
    (a, b) => Date.parse(lastActivity(b)) - Date.parse(lastActivity(a)),
  );
  const groups: ConversationGroup[] = [
    { key: "today", label: "Today", conversations: [] },
    { key: "yesterday", label: "Yesterday", conversations: [] },
    { key: "week", label: "Earlier this week", conversations: [] },
    { key: "earlier", label: "Earlier", conversations: [] },
  ];
  for (const conversation of sorted) {
    const time = Date.parse(lastActivity(conversation));
    if (!Number.isFinite(time) || time < weekStart)
      groups[3].conversations.push(conversation);
    else if (time >= today) groups[0].conversations.push(conversation);
    else if (time >= today - 86_400_000)
      groups[1].conversations.push(conversation);
    else groups[2].conversations.push(conversation);
  }
  return groups.filter((group) => group.conversations.length > 0);
}

/**
 * The conversation history rail shared by the sheet's history panel and the
 * /ask page: new chat first, search over titles and bodies, time-grouped
 * rows with a sliding active marker, inline rename, two-step delete.
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
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const conversations = searchConversations(history.conversations, query);
  const groups = useMemo(() => groupConversations(conversations), [conversations]);

  const askDelete = (id: string) => {
    // Deleting the conversation that owns an in-flight answer would orphan
    // the stream's final append; ask the reader to stop it first.
    if (streaming && id === history.activeId) {
      toast.warning("Conversation locked", "Stop the running reply before deleting this conversation.");
      return;
    }
    setConfirmDeleteId(id);
  };

  return (
    <div className={cn("flex min-h-0 flex-col gap-3", className)}>
      <button
        type="button"
        className="tap-target inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-control border border-accent/30 bg-accent-soft px-3 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-paper"
        onClick={() => {
          history.newChat();
          onNewChat?.();
        }}
        disabled={streaming}
      >
        <Plus size={15} aria-hidden /> New conversation
      </button>
      <div className="flex items-center gap-2 rounded-control border border-rule-soft bg-canvas px-2.5 transition-colors focus-within:border-accent focus-within:shadow-[inset_0_0_0_1px_var(--accent)]">
        <Search size={14} className="shrink-0 text-muted" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search conversations"
          aria-label="Search conversations"
          autoComplete="off"
          className="min-h-10 w-full min-w-0 border-0 bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
        />
      </div>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-3 py-8 text-center">
          <span
            aria-hidden
            className="grid size-9 place-items-center rounded-control border border-rule-soft bg-canvas text-muted"
          >
            <Search size={15} />
          </span>
          <p className="text-sm leading-relaxed text-muted">
            {query.trim()
              ? "No conversations match your search."
              : "Your conversations will appear here once you ask something."}
          </p>
        </div>
      ) : (
        <ul className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain">
          {groups.map((group) => (
            <li key={group.key}>
              <p className="section-label mb-1 px-1.5">{group.label}</p>
              <ul className="space-y-0.5">
                {group.conversations.map((conversation) => (
                  <ConversationRow
                    key={conversation.id}
                    conversation={conversation}
                    active={conversation.id === history.activeId}
                    renaming={renamingId === conversation.id}
                    renameDraft={renamingId === conversation.id ? renameDraft : ""}
                    confirmingDelete={confirmDeleteId === conversation.id}
                    onRenameStart={() => {
                      setRenamingId(conversation.id);
                      setRenameDraft(conversation.title);
                    }}
                    onRenameDraft={setRenameDraft}
                    onRenameCommit={() => {
                      history.rename(conversation.id, renameDraft);
                      setRenamingId(null);
                      setRenameDraft("");
                    }}
                    onRenameCancel={() => {
                      setRenamingId(null);
                      setRenameDraft("");
                    }}
                    onDeleteAsk={() => askDelete(conversation.id)}
                    onDeleteCancel={() => setConfirmDeleteId(null)}
                    onDeleteConfirm={() => {
                      history.remove(conversation.id);
                      setConfirmDeleteId(null);
                    }}
                    onSelect={() => history.select(conversation.id)}
                  />
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

const ConversationRow = memo(function ConversationRow({
  conversation,
  active,
  renaming,
  renameDraft,
  confirmingDelete,
  onRenameStart,
  onRenameDraft,
  onRenameCommit,
  onRenameCancel,
  onDeleteAsk,
  onDeleteCancel,
  onDeleteConfirm,
  onSelect,
}: {
  conversation: StoredConversation;
  active: boolean;
  renaming: boolean;
  renameDraft: string;
  confirmingDelete: boolean;
  onRenameStart: () => void;
  onRenameDraft: (value: string) => void;
  onRenameCommit: () => void;
  onRenameCancel: () => void;
  onDeleteAsk: () => void;
  onDeleteCancel: () => void;
  onDeleteConfirm: () => void;
  onSelect: () => void;
}) {
  const messages = conversation.messages.filter(
    (message) => message.role === "user",
  ).length;
  const replies = conversation.messages.filter(
    (message) => message.role === "assistant" && message.content,
  ).length;

  if (renaming)
    return (
      <li className="flex items-center gap-1 py-1">
        <input
          autoFocus
          value={renameDraft}
          onChange={(event) => onRenameDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onRenameCommit();
            if (event.key === "Escape") onRenameCancel();
          }}
          maxLength={60}
          aria-label="Conversation name"
          className="min-h-9 w-full min-w-0 rounded-control border border-accent bg-paper px-2.5 text-sm text-ink shadow-[inset_0_0_0_1px_var(--accent)]"
        />
        <button
          type="button"
          className="tap-target p-2 text-positive"
          aria-label="Save name"
          onClick={onRenameCommit}
        >
          <Check size={14} />
        </button>
        <button
          type="button"
          className="tap-target p-2 text-muted hover:text-ink"
          aria-label="Cancel rename"
          onClick={onRenameCancel}
        >
          <X size={14} />
        </button>
      </li>
    );

  if (confirmingDelete)
    return (
      <li className="rounded-control border border-danger bg-paper px-3 py-2">
        <p className="text-xs leading-relaxed text-ink">
          Delete “{conversation.title}” from this device?
        </p>
        <div className="mt-2 flex gap-2">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onDeleteConfirm}
          >
            Delete
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDeleteCancel}
          >
            Keep
          </Button>
        </div>
      </li>
    );

  // The row is one hover surface; the title button and the action buttons
  // are siblings, so no clickable element nests inside another. The active
  // marker is one shared-layout element, so it physically slides between rows.
  return (
    <li
      className={cn(
        "group relative flex items-start gap-1 rounded-control transition-colors",
        active ? "bg-accent-soft" : "hover:bg-canvas",
      )}
    >
      {active ? (
        <motion.span
          layoutId="conv-active"
          transition={{ type: "spring", stiffness: 480, damping: 38 }}
          className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-accent"
          aria-hidden
        />
      ) : null}
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? "true" : undefined}
        className="min-w-0 flex-1 rounded-control px-2.5 py-2 text-left"
      >
        <p className="truncate text-sm font-medium text-ink">
          {conversation.title}
        </p>
        <p className="tabular-nums mt-0.5 text-[0.6875rem] text-muted">
          {relativeLabel(conversation.updatedAt)}
          {messages + replies > 0
            ? ` · ${messages + replies} message${messages + replies === 1 ? "" : "s"}`
            : ""}
        </p>
      </button>
      <div className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:opacity-100">
        <button
          type="button"
          className="tap-target p-1.5 text-muted hover:text-ink"
          aria-label={`Rename “${conversation.title}”`}
          onClick={onRenameStart}
        >
          <Pencil size={13} />
        </button>
        <button
          type="button"
          className="tap-target p-1.5 text-muted hover:text-danger"
          aria-label={`Delete “${conversation.title}”`}
          onClick={onDeleteAsk}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </li>
  );
});
