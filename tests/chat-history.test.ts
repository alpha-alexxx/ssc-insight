import { chatBaseForSend } from "../src/lib/ai/chat-history";
import {
  loadConversations,
  newConversationId,
  parseStoredConversations,
  pruneConversations,
  renameConversation,
  saveConversations,
  searchConversations,
  titleFromMessages,
  upsertConversation,
} from "../src/lib/ai/conversations";
import type { ChatMessage } from "../src/lib/ai/client-types";
import assert from "node:assert/strict";
import { test } from "node:test";
import { trimChatHistory } from "../src/components/use-ai-workspace";

const user = (content: string) => ({
  id: content,
  role: "user" as const,
  content,
});
const assistant = (content: string) => ({
  id: `a-${content}`,
  role: "assistant" as const,
  content,
});

test("chat history keeps the trailing window and drops empties", () => {
  const messages = [
    user("one"),
    assistant(""),
    user("two"),
    assistant("reply"),
    user("three"),
  ];
  assert.deepEqual(trimChatHistory(messages, 8), [
    { role: "user", content: "one" },
    { role: "user", content: "two" },
    { role: "assistant", content: "reply" },
    { role: "user", content: "three" },
  ]);
});

test("chat history never starts with an assistant turn", () => {
  const messages = [
    user("one"),
    assistant("reply"),
    user("two"),
    assistant("r2"),
  ];
  assert.deepEqual(trimChatHistory(messages, 2), [
    { role: "user", content: "two" },
    { role: "assistant", content: "r2" },
  ]);
});

test("chat history window trims to the last N messages", () => {
  const messages = [
    user("1"),
    assistant("a"),
    user("2"),
    assistant("b"),
    user("3"),
  ];
  assert.deepEqual(trimChatHistory(messages, 3), [
    { role: "user", content: "2" },
    { role: "assistant", content: "b" },
    { role: "user", content: "3" },
  ]);
  // A window that would start with an assistant turn is shifted once more.
  assert.deepEqual(trimChatHistory(messages, 2), [
    { role: "user", content: "3" },
  ]);
});

test("retry replaces only the failed exchange, preserving earlier conversation", () => {
  const messages: ChatMessage[] = [
    { id: "1", role: "user", content: "First question" },
    { id: "2", role: "assistant", content: "First answer" },
    { id: "3", role: "user", content: "Retry this" },
    { id: "4", role: "assistant", content: "Partial response" },
  ];
  assert.deepEqual(chatBaseForSend(messages, true), messages.slice(0, 2));
  assert.equal(chatBaseForSend(messages, false), messages);
  assert.equal(messages.length, 4);
  assert.deepEqual(chatBaseForSend([], true), []);
  assert.deepEqual(chatBaseForSend(messages.slice(0, 1), true), []);
});

/* ---------------- conversation history (device-local) ---------------- */

test("conversation titles come from the first user question and are capped", () => {
  assert.equal(
    titleFromMessages([
      assistant("hello"),
      user("Why did my accuracy drop?"),
    ]),
    "Why did my accuracy drop?",
  );
  assert.equal(
    titleFromMessages([]),
    "New conversation",
  );
  const long = titleFromMessages([user("x".repeat(100))]);
  assert.ok(long.length <= 60);
  assert.ok(long.endsWith("…"));
});

test("upsert creates the first conversation and reuses the existing id", () => {
  const first = upsertConversation([], null, [user("q1"), assistant("a1")]);
  assert.equal(first.list.length, 1);
  assert.ok(first.activeId);
  assert.equal(first.list[0]!.title, "q1");

  const second = upsertConversation(
    first.list,
    first.activeId,
    [user("q1"), assistant("a1"), user("q2"), assistant("a2")],
  );
  assert.equal(second.list.length, 1);
  assert.equal(second.activeId, first.activeId);
  assert.equal(second.list[0]!.messages.length, 4);
});

test("upsert with an empty transcript removes the conversation", () => {
  const first = upsertConversation([], null, [user("q1")]);
  const cleared = upsertConversation(first.list, first.activeId, []);
  assert.equal(cleared.list.length, 0);
  assert.equal(cleared.activeId, null);
});

test("the cap keeps the newest conversations and the trailing messages", () => {
  const conversations = Array.from({ length: 60 }, (_, index) => ({
    id: `c${index}`,
    title: `t${index}`,
    createdAt: `2026-01-01T00:00:${String(index % 60).padStart(2, "0")}Z`,
    updatedAt: `2026-01-0${(index % 9) + 1}T00:00:00Z`,
    messages: [
      user(`q${index}`),
      ...Array.from({ length: 250 }, (_, m) =>
        m % 2 === 0 ? user(`q${index}-${m}`) : assistant(`a${index}-${m}`),
      ),
    ],
  }));
  const pruned = pruneConversations(conversations);
  assert.equal(pruned.length, 50);
  // Newest first: the highest updatedAt (2026-01-09) leads.
  assert.ok(pruned[0]!.updatedAt.startsWith("2026-01-09"));
  // Per-conversation cap: trailing window, starting at a user turn.
  const messages = pruned[0]!.messages;
  assert.equal(messages.length, 200);
  assert.equal(messages[0]!.role, "user");
});

test("parsing drops malformed entries and coerces what it can", () => {
  const parsed = parseStoredConversations([
    null,
    { id: "broken" },
    {
      id: "ok",
      title: "",
      createdAt: "nope",
      updatedAt: "2026-01-01T00:00:00Z",
      messages: [
        { role: "user", content: "hi", at: "2026-01-01T00:00:00Z" },
        { role: "nope", content: "dropped" },
        "junk",
        { role: "assistant", content: "answer", truncated: true },
      ],
    },
    "not an object",
  ]);
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0]!.title, "hi");
  assert.equal(parsed[0]!.messages.length, 2);
  assert.equal(parsed[0]!.messages[1]!.truncated, true);
  assert.equal(parsed[0]!.messages[0]!.at, "2026-01-01T00:00:00Z");
  assert.deepEqual(parseStoredConversations("junk"), []);
});

test("reasoning survives persistence and older rows stay valid", () => {
  const parsed = parseStoredConversations([
    {
      id: "c1",
      messages: [
        user("why?"),
        {
          role: "assistant",
          content: "because",
          reasoning: "let me check the mocks",
          reasoningSeconds: 14,
        },
      ],
    },
    {
      id: "c2",
      messages: [user("legacy"), assistant("old row without reasoning")],
    },
  ]);
  assert.equal(parsed[0]!.messages[1]!.reasoning, "let me check the mocks");
  assert.equal(parsed[0]!.messages[1]!.reasoningSeconds, 14);
  assert.equal(parsed[1]!.messages[1]!.reasoning, undefined);
  assert.equal(parsed[1]!.messages[1]!.reasoningSeconds, undefined);
  // Malformed reasoning fields are dropped, not stored.
  const bad = parseStoredConversations([
    {
      id: "c3",
      messages: [{ role: "assistant", content: "x", reasoning: 42 }],
    },
  ]);
  assert.equal(bad[0]!.messages[0]!.reasoning, undefined);
});

test("rename changes the title, keeps it capped, and later turns preserve it", () => {
  const { list } = upsertConversation([], null, [
    user("what is my weakest subject?"),
    assistant("quant"),
  ]);
  const renamed = renameConversation(list, list[0]!.id, "  Quant   deep-dive  ");
  assert.equal(renamed[0]!.title, "Quant deep-dive");

  const capped = renameConversation(list, list[0]!.id, "x".repeat(100));
  assert.equal(capped[0]!.title.length, 60);
  assert.ok(capped[0]!.title.endsWith("…"));

  // A blank rename is a no-op; an unknown id changes nothing.
  assert.deepEqual(renameConversation(list, list[0]!.id, "   "), list);
  assert.deepEqual(renameConversation(list, "nope", "New"), list);

  // The next turn keeps the user's name instead of re-deriving it.
  const afterTurn = upsertConversation(renamed, renamed[0]!.id, [
    ...renamed[0]!.messages,
    user("and my strongest?"),
    assistant("english"),
  ]);
  assert.equal(afterTurn.list[0]!.title, "Quant deep-dive");
});

test("search matches titles and message bodies case-insensitively", () => {
  const { list } = upsertConversation([], null, [
    user("plan my revision week"),
    assistant("Focus on algebra"),
  ]);
  const other = upsertConversation(list, null, [
    user("accuracy trends"),
    assistant("English is improving"),
  ]);
  assert.equal(searchConversations(other.list, "").length, 2);
  assert.equal(searchConversations(other.list, "REVISION").length, 1);
  assert.equal(searchConversations(other.list, "revision").length, 1);
  assert.equal(searchConversations(other.list, "algebra").length, 1);
  assert.equal(searchConversations(other.list, "improving").length, 1);
  assert.equal(searchConversations(other.list, "nothing-matches").length, 0);
});

test("storage failures degrade to an empty history, not a crash", () => {
  const throwing = {
    getItem: () => {
      throw new Error("denied");
    },
    setItem: () => {
      throw new Error("denied");
    },
    removeItem: () => {
      throw new Error("denied");
    },
  };
  assert.deepEqual(loadConversations(throwing as unknown as Storage), []);
  const conversations = [
    {
      id: "c1",
      title: "t",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
      messages: [user("q")],
    },
  ];
  // A denied write returns the list untouched; the chat keeps working.
  assert.deepEqual(
    saveConversations(conversations, throwing as unknown as Storage),
    conversations,
  );
  assert.deepEqual(loadConversations(null), []);
});

test("a full quota evicts the oldest conversations instead of failing", () => {
  let writes = 0;
  let stored = "";
  const tinyStorage = {
    getItem: () => stored,
    setItem: (_key: string, value: string) => {
      writes += 1;
      if (value.length > 120) throw new Error("quota");
      stored = value;
    },
    removeItem: () => {
      stored = "";
    },
  };
  const conversations = [
    { id: "big", title: "t", createdAt: "2026-01-02T00:00:00Z", updatedAt: "2026-01-02T00:00:00Z", messages: [user("q")] },
    { id: "small", title: "t", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z", messages: [user("q")] },
  ];
  const saved = saveConversations(conversations, tinyStorage as never);
  assert.ok(writes > 1);
  assert.equal(saved.length, 1);
  assert.equal(saved[0]!.id, "big");
});

test("conversation ids are unique", () => {
  const a = newConversationId();
  const b = newConversationId();
  assert.notEqual(a, b);
  assert.ok(a.startsWith("c-"));
});
