"use client";

import { memo, useState } from "react";
import { Check, Pencil, Plus, Search, Trash2, X } from "lucide-react";
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

/**
 * The conversation history rail shared by the sheet's history panel and the
 * /ask page: search over titles and bodies, inline rename, delete, new chat.
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
  const [query, setQuery] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const conversations = searchConversations(history.conversations, query);

  return (
    <div className={cn("flex min-h-0 flex-col gap-3", className)}>
      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-control border border-rule-soft bg-canvas px-2.5 transition-colors focus-within:border-accent focus-within:shadow-[inset_0_0_0_1px_var(--accent)]">
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
        <button
          type="button"
          className="tap-target inline-flex shrink-0 items-center gap-1.5 rounded-control border border-rule px-2.5 text-xs font-medium text-ink transition-colors hover:border-ink"
          onClick={() => {
            history.newChat();
            onNewChat?.();
          }}
          disabled={streaming}
        >
          <Plus size={14} aria-hidden /> New
        </button>
      </div>

      {conversations.length === 0 ? (
        <p className="px-1 py-6 text-center text-sm text-muted">
          {query.trim()
            ? "No conversations match your search."
            : "Your conversations will appear here once you ask something."}
        </p>
      ) : (
        <ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain">
          {conversations.map((conversation) => (
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
              onDeleteAsk={() => setConfirmDeleteId(conversation.id)}
              onDeleteCancel={() => setConfirmDeleteId(null)}
              onDeleteConfirm={() => {
                history.remove(conversation.id);
                setConfirmDeleteId(null);
              }}
              onSelect={() => history.select(conversation.id)}
            />
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
  const questions = conversation.messages.filter(
    (message) => message.role === "user",
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
          maxLength={80}
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
          <button
            type="button"
            className="min-h-8 rounded-control bg-danger px-2.5 text-xs font-medium text-paper"
            onClick={onDeleteConfirm}
          >
            Delete
          </button>
          <button
            type="button"
            className="min-h-8 rounded-control border border-rule px-2.5 text-xs font-medium text-muted hover:text-ink"
            onClick={onDeleteCancel}
          >
            Keep
          </button>
        </div>
      </li>
    );

  return (
    <li>
      <div
        className={cn(
          "group flex cursor-pointer items-start gap-2 rounded-control px-2.5 py-2 transition-colors hover:bg-canvas",
          active && "bg-accent-soft hover:bg-accent-soft",
        )}
        onClick={onSelect}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect();
          }
        }}
        role="button"
        tabIndex={0}
        aria-current={active ? "true" : undefined}
      >
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "truncate text-sm font-medium",
              active ? "text-ink" : "text-ink/90",
            )}
          >
            {conversation.title}
          </p>
          <p className="mt-0.5 text-xs text-muted">
            {relativeLabel(conversation.updatedAt)}
            {" · "}
            {questions} question{questions === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:opacity-100">
          <button
            type="button"
            className="tap-target p-1.5 text-muted hover:text-ink"
            aria-label={`Rename “${conversation.title}”`}
            onClick={(event) => {
              event.stopPropagation();
              onRenameStart();
            }}
          >
            <Pencil size={13} />
          </button>
          <button
            type="button"
            className="tap-target p-1.5 text-muted hover:text-danger"
            aria-label={`Delete “${conversation.title}”`}
            onClick={(event) => {
              event.stopPropagation();
              onDeleteAsk();
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </li>
  );
});
