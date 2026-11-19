import type { ChatMessage } from "./client-types";

/**
 * Client-side conversation history for the AI coach.
 *
 * The chat itself stays ephemeral while it streams; the finished turns are
 * what persist here. Storage is deliberately local (localStorage) and
 * app-owned: conversations carry only what the user typed and the model
 * answered — the server never receives or stores them, and they are not
 * part of backups. Everything here degrades silently: a private-mode
 * exception, a corrupt payload, or a full quota leaves the in-memory chat
 * working exactly as before.
 */

export type StoredConversation = {
  id: string;
  /** Derived from the first user message; not user-editable. */
  title: string;
  /** ISO timestamps, client clock. */
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
};

export const CONVERSATIONS_STORAGE_KEY = "ssc.ai.conversations.v1";

/** A conversation keeps its last N turns-worth of messages (oldest dropped).
 * The prompt window only ever reads the trailing exchanges, so this bounds
 * storage without changing what the model can see. */
export const MAX_CONVERSATION_MESSAGES = 100;
/** Oldest conversations fall off the list first. */
export const MAX_CONVERSATIONS = 30;
export const TITLE_MAX_CHARS = 60;

function isRole(value: unknown): value is ChatMessage["role"] {
  return value === "user" || value === "assistant";
}

function parseMessage(value: unknown): ChatMessage | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (!isRole(record.role) || typeof record.content !== "string") return null;
  const message: ChatMessage = {
    id: typeof record.id === "string" && record.id ? record.id : "",
    role: record.role,
    content: record.content,
  };
  if (record.truncated === true) message.truncated = true;
  if (typeof record.at === "string" && record.at) message.at = record.at;
  return message;
}

function parseConversation(value: unknown): StoredConversation | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const messages = Array.isArray(record.messages)
    ? record.messages
        .map(parseMessage)
        .filter((message): message is ChatMessage => message !== null)
    : [];
  const id = typeof record.id === "string" ? record.id : "";
  if (!id || !messages.length) return null;
  const now = new Date().toISOString();
  return {
    id,
    title:
      typeof record.title === "string" && record.title.trim()
        ? record.title
        : titleFromMessages(messages),
    createdAt:
      typeof record.createdAt === "string" ? record.createdAt : now,
    updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : now,
    messages,
  };
}

/** The conversation's name is its first user question. Empty assistant-only
 * or empty lists have nothing to name, so they fall back to a neutral label. */
export function titleFromMessages(messages: ChatMessage[]): string {
  const first = messages.find(
    (message) => message.role === "user" && message.content.trim(),
  );
  const text = (first?.content ?? "New conversation")
    .replace(/\s+/g, " ")
    .trim();
  const title = text.length > TITLE_MAX_CHARS
    ? `${text.slice(0, TITLE_MAX_CHARS - 1).trimEnd()}…`
    : text;
  return title || "New conversation";
}

/** Defensively coerce parsed JSON into the stored shape; anything malformed
 * is dropped, never thrown. */
export function parseStoredConversations(raw: unknown): StoredConversation[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(parseConversation)
    .filter((entry): entry is StoredConversation => entry !== null);
}

/** A stored list must start with a user turn so a restored conversation can
 * be sent to the API verbatim (the chat route requires it). */
function trimStoredMessages(messages: ChatMessage[]): ChatMessage[] {
  const capped = messages.slice(-MAX_CONVERSATION_MESSAGES);
  const start = capped.findIndex((message) => message.role === "user");
  return start < 0 ? [] : capped.slice(start);
}

/** Enforce the caps and the newest-first ordering. Pure. */
export function pruneConversations(
  conversations: StoredConversation[],
): StoredConversation[] {
  const sorted = [...conversations].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
  return sorted.slice(0, MAX_CONVERSATIONS).map((conversation) => ({
    ...conversation,
    messages: trimStoredMessages(conversation.messages),
  }));
}

/** Insert or replace one conversation from a full message transcript and
 * return the pruned, newest-first list. Pure. */
export function upsertConversation(
  conversations: StoredConversation[],
  id: string | null,
  messages: ChatMessage[],
  now = new Date(),
): { list: StoredConversation[]; activeId: string | null } {
  const rest = conversations.filter(
    (conversation) => conversation.id !== id,
  );
  if (!messages.length) {
    // Nothing to store (a cleared or never-started conversation).
    return { list: pruneConversations(rest), activeId: null };
  }
  const existing = id
    ? conversations.find((conversation) => conversation.id === id)
    : undefined;
  const timestamp = now.toISOString();
  const conversation: StoredConversation = {
    id: existing?.id ?? newConversationId(now),
    title: titleFromMessages(messages),
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
    messages,
  };
  return {
    list: pruneConversations([conversation, ...rest]),
    activeId: conversation.id,
  };
}

export function newConversationId(now = new Date()): string {
  const random =
    globalThis.crypto?.randomUUID?.() ??
    Math.random().toString(36).slice(2);
  return `c-${now.getTime().toString(36)}-${random.slice(0, 8)}`;
}

/** Reads may hit an unavailable storage (private mode) or a corrupt payload;
 * both degrade to an empty history. */
export function loadConversations(
  storage: Pick<Storage, "getItem"> | null = safeStorage(),
): StoredConversation[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(CONVERSATIONS_STORAGE_KEY);
    if (!raw) return [];
    return pruneConversations(parseStoredConversations(JSON.parse(raw)));
  } catch {
    return [];
  }
}

/** Returns the list that was actually written. When the quota is exceeded the
 * oldest conversations are dropped and the write retried, so a long history
 * degrades from the far end instead of failing the current turn. */
export function saveConversations(
  conversations: StoredConversation[],
  storage: Storage | null = safeStorage(),
): StoredConversation[] {
  if (!storage) return conversations;
  let list = conversations;
  for (;;) {
    try {
      storage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(list));
      return list;
    } catch {
      if (list.length <= 1) {
        // Even a single conversation will not fit (or storage is denied):
        // give up quietly rather than break the chat.
        try {
          storage.removeItem(CONVERSATIONS_STORAGE_KEY);
        } catch {
          // Storage is unavailable; nothing to clean up.
        }
        return list;
      }
      list = list.slice(0, Math.max(1, Math.floor(list.length / 2)));
    }
  }
}

function safeStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}
