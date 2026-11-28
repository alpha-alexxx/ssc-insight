import assert from "node:assert/strict";
import { test } from "node:test";
import { chatMatchesQuery, type ChatSummary } from "../src/components/chat-history";

function chat(overrides: Partial<ChatSummary> = {}): ChatSummary {
  return {
    id: "chat-1",
    title: "Untitled",
    updatedAt: 0,
    ...overrides,
  };
}

test("matches titles case-insensitively", () => {
  assert.equal(chatMatchesQuery(chat({ title: "Revision Strategy" }), "strategy"), true);
  assert.equal(chatMatchesQuery(chat({ title: "Revision Strategy" }), "REVISION"), true);
  assert.equal(chatMatchesQuery(chat({ title: "Revision Strategy" }), "algebra"), false);
});

test("matches every supplied message body, including without a title", () => {
  const summary = chat({
    title: undefined,
    generating: true,
    messages: [
      { content: "Plan my week" },
      { content: "Focus on Reading Comprehension tomorrow" },
    ],
  });
  assert.equal(chatMatchesQuery(summary, "reading comprehension"), true);
  assert.equal(chatMatchesQuery(summary, "FOCUS"), true);
  assert.equal(chatMatchesQuery(summary, "geometry"), false);
});

test("trims queries and treats whitespace-only queries as matching all chats", () => {
  const summary = chat({ title: "Mock analysis", messages: [] });
  assert.equal(chatMatchesQuery(summary, "  mock  "), true);
  assert.equal(chatMatchesQuery(summary, " \t\n "), true);
  assert.equal(chatMatchesQuery(chat(), ""), true);
});

test("keeps summaries without message data backward compatible", () => {
  assert.equal(chatMatchesQuery(chat({ title: "Percentages" }), "percent"), true);
  assert.equal(chatMatchesQuery(chat({ title: "Percentages" }), "reasoning"), false);
  assert.equal(chatMatchesQuery(chat({ messages: [] }), "anything"), false);
});
