import assert from "node:assert/strict";
import { test } from "node:test";
import type { ChatMessage } from "../src/lib/ai/client-types";
import {
  beginChatRequest,
  invalidateChatRequest,
  isCurrentChatRequest,
  MAX_CHAT_ANSWER_VERSIONS,
  preserveAnswerVersion,
} from "../src/lib/ai/chat-history";
import {
  parseStoredConversations,
  upsertConversation,
} from "../src/lib/ai/conversations";

const answer = (content: string, versions?: ChatMessage["versions"]) => ({
  id: "assistant",
  role: "assistant" as const,
  content,
  reasoning: "private reasoning",
  reasoningSeconds: 7,
  stopped: true,
  truncated: true,
  at: "2026-11-28T03:00:00.000Z",
  ...(versions ? { versions } : {}),
});

test("regeneration preserves the complete current answer and skips blanks", () => {
  const original = [answer("complete answer")];
  const [preserved] = preserveAnswerVersion(original, "assistant");
  assert.equal(preserved?.content, "complete answer");
  assert.deepEqual(preserved?.versions, [
    {
      content: "complete answer",
      reasoning: "private reasoning",
      reasoningSeconds: 7,
      stopped: true,
      truncated: true,
      at: "2026-11-28T03:00:00.000Z",
    },
  ]);
  assert.ok(!("versions" in (preserved?.versions?.[0] ?? {})));
  assert.ok(!("id" in (preserved?.versions?.[0] ?? {})));
  assert.deepEqual(preserveAnswerVersion([answer("   ")], "assistant"), [
    answer("   "),
  ]);
  assert.deepEqual(preserveAnswerVersion(original, "unknown"), original);

  const blank = [answer("", [{ content: "previous complete answer" }])];
  const [blankPreserved] = preserveAnswerVersion(blank, "assistant");
  assert.equal(blankPreserved?.versions?.length, 1);
  assert.equal(blankPreserved?.versions?.[0]?.content, "previous complete answer");
});

test("versions stay oldest-to-newest and retain only the latest six", () => {
  let messages: ChatMessage[] = [
    answer(
      "latest",
      Array.from({ length: MAX_CHAT_ANSWER_VERSIONS }, (_, index) => ({
        content: `old-${index}`,
      })),
    ),
  ];
  messages = preserveAnswerVersion(messages, "assistant");
  assert.equal(messages[0]?.versions?.length, 6);
  assert.deepEqual(
    messages[0]?.versions?.map((version) => version.content),
    ["old-1", "old-2", "old-3", "old-4", "old-5", "latest"],
  );
});

test("stored versions survive a round trip, capped and non-recursive", () => {
  const current = answer(
    "current",
    Array.from({ length: 8 }, (_, index) => ({
      content: `saved-${index}`,
      stopped: index % 2 === 0,
      truncated: index % 2 === 1,
      at: `time-${index}`,
    })),
  );
  const stored = upsertConversation(
    [],
    null,
    [{ id: "u", role: "user", content: "question" }, current],
    new Date("2026-11-28T03:00:00.000Z"),
  );
  const parsed = parseStoredConversations(
    JSON.parse(JSON.stringify(stored.list)),
  );
  const restored = parsed[0]?.messages[1];
  assert.equal(restored?.content, "current");
  assert.equal(restored?.stopped, true);
  assert.deepEqual(
    restored?.versions?.map((version) => version.content),
    ["saved-2", "saved-3", "saved-4", "saved-5", "saved-6", "saved-7"],
  );
  assert.equal(restored?.versions?.[0]?.stopped, true);
  assert.equal(restored?.versions?.[1]?.truncated, true);
  assert.equal(restored?.versions?.[0]?.at, "time-2");
});

test("legacy and malformed stored version fields remain additive and safe", () => {
  const parsed = parseStoredConversations([
    {
      id: "legacy",
      messages: [
        { id: "u", role: "user", content: "old question" },
        { id: "a", role: "assistant", content: "old answer" },
      ],
    },
    {
      id: "future-shaped",
      messages: [
        {
          id: "a",
          role: "assistant",
          content: "new answer",
          stopped: true,
          versions: [
            null,
            { reasoning: "missing content" },
            {
              id: "must-not-survive",
              role: "user",
              content: "valid snapshot",
              reasoning: "why",
              reasoningSeconds: 3,
              stopped: true,
              nestedUnknown: true,
              versions: [{ content: "do not recurse" }],
            },
          ],
        },
      ],
    },
  ]);
  const legacy = parsed.find((conversation) => conversation.id === "legacy");
  const future = parsed.find(
    (conversation) => conversation.id === "future-shaped",
  );
  assert.equal(legacy?.messages[1]?.versions, undefined);
  assert.equal(future?.messages[0]?.stopped, true);
  assert.deepEqual(future?.messages[0]?.versions, [
    {
      content: "valid snapshot",
      reasoning: "why",
      reasoningSeconds: 3,
      stopped: true,
    },
  ]);
});

test("request identity rejects stale generations and changed conversations", () => {
  const first = beginChatRequest(0, null);
  assert.deepEqual(first, { generation: 1, conversationId: null });
  assert.equal(isCurrentChatRequest(first, first), true);

  const second = beginChatRequest(first.generation, null);
  assert.equal(second.generation, 2);
  assert.equal(isCurrentChatRequest(second, first), false);
  assert.equal(isCurrentChatRequest(second, second), true);

  const selected = { ...second, conversationId: "other" };
  assert.equal(isCurrentChatRequest(selected, second), false);
  const invalidated = invalidateChatRequest(second);
  assert.equal(invalidated?.generation, 3);
  assert.equal(isCurrentChatRequest(invalidated!, second), false);
  assert.equal(isCurrentChatRequest(null, second), false);
  assert.equal(invalidateChatRequest(null), null);
});
