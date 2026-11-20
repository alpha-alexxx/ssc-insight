import assert from "node:assert/strict";
import { test } from "node:test";
import type { AiConfig } from "../src/lib/ai/config-core";
import { createAiProvider } from "../src/lib/ai/provider";
import {
  chatMessages,
  extractionMessages,
  sanitizeReport,
} from "../src/lib/ai/prompts";
import { buildAiContext } from "../src/lib/ai/context";
import { T2 } from "./fixtures/exam";

const PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
const JPEG =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD//dA=";

function config(overrides: Partial<AiConfig> = {}): AiConfig {
  return {
    provider: "custom",
    protocol: "openai-chat",
    authMode: "bearer",
    baseUrl: "https://provider.example/v1",
    generationPath: "chat/completions",
    modelsPath: "models",
    apiKey: "secret",
    model: "vision-model",
    jsonMode: true,
    allowHttp: false,
    allowPrivate: false,
    dailyRequestLimit: 30,
    dailyTokenLimit: 300_000,
    maxOutputTokens: 200,
    timeoutMs: 5_000,
    firstTokenTimeoutMs: 5_000,
    thinking: "default",
    visionEnabled: true,
    ...overrides,
  };
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });
}

test("chat messages attach images to the newest user turn as content parts", () => {
  const context = buildAiContext([], null, T2);
  const messages = chatMessages(
    context,
    [
      { role: "user", content: "earlier question" },
      { role: "assistant", content: "earlier answer" },
      { role: "user", content: "what is in this screenshot?" },
    ],
    null,
    T2,
    "SSC CGL",
    [PNG, JPEG],
  );
  const last = messages.at(-1)!;
  assert.equal(last.role, "user");
  assert.ok(Array.isArray(last.content));
  const parts = last.content as Array<Record<string, string>>;
  assert.deepEqual(
    parts.map((part) => part.type),
    ["text", "image_url", "image_url"],
  );
  assert.equal(parts[0]!.text, "what is in this screenshot?");
  assert.equal(parts[1]!.imageUrl, PNG);
  assert.equal(parts[2]!.imageUrl, JPEG);
  // Earlier turns stay plain text: history images are never re-sent.
  assert.equal(typeof messages[1]!.content, "string");
});

test("each protocol maps image parts to its own wire shape", async () => {
  const bodies: Record<string, unknown>[] = [];
  const anyAnswer = {
    choices: [{ message: { content: "ok" } }],
    type: "message",
    role: "assistant",
    content: [{ type: "text", text: "ok" }],
    output: [{ type: "message", content: [{ type: "output_text", text: "ok" }] }],
  };
  const fetcher: typeof fetch = async (_url, init) => {
    bodies.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
    return json(anyAnswer);
  };

  await createAiProvider(config({ protocol: "openai-chat" }), fetcher).complete({
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "read this" },
          { type: "image_url", imageUrl: PNG },
        ],
      },
    ],
    maxOutputTokens: 20,
    signal: new AbortController().signal,
  });
  const chat = bodies[0]!.messages as Array<{
    content: Array<Record<string, unknown>>;
  }>;
  assert.deepEqual(chat[0]!.content[0], { type: "text", text: "read this" });
  assert.deepEqual(chat[0]!.content[1], {
    type: "image_url",
    image_url: { url: PNG },
  });

  await createAiProvider(
    config({ protocol: "openai-responses" }),
    fetcher,
  ).complete({
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "read this" },
          { type: "image_url", imageUrl: PNG },
        ],
      },
    ],
    maxOutputTokens: 20,
    signal: new AbortController().signal,
  });
  const responses = bodies[1]!.input as Array<{
    content: Array<Record<string, unknown>>;
  }>;
  assert.deepEqual(responses[0]!.content[0], {
    type: "input_text",
    text: "read this",
  });
  assert.deepEqual(responses[0]!.content[1], {
    type: "input_image",
    image_url: PNG,
  });

  await createAiProvider(
    config({ protocol: "anthropic-messages" }),
    fetcher,
  ).complete({
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "read this" },
          { type: "image_url", imageUrl: PNG },
        ],
      },
    ],
    maxOutputTokens: 20,
    signal: new AbortController().signal,
  });
  const anthropic = bodies[2]!.messages as Array<{
    content: Array<Record<string, unknown>>;
  }>;
  assert.deepEqual(anthropic[0]!.content[0], { type: "text", text: "read this" });
  assert.deepEqual(anthropic[0]!.content[1], {
    type: "image",
    source: {
      type: "base64",
      media_type: "image/png",
      data: PNG.replace("data:image/png;base64,", ""),
    },
  });

  // Legacy completions is text-only: the prompt flattens and images drop.
  await createAiProvider(
    config({ protocol: "openai-completions" }),
    fetcher,
  ).complete({
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "read this" },
          { type: "image_url", imageUrl: PNG },
        ],
      },
    ],
    maxOutputTokens: 20,
    signal: new AbortController().signal,
  });
  assert.match(String(bodies[3]!.prompt), /\[USER\]\nread this/);
  assert.doesNotMatch(String(bodies[3]!.prompt), /iVBORw0/);
});

test("extraction prompts carry the report text verbatim plus attached images", () => {
  const report = sanitizeReport("Quant 30 25 3 2");
  const messages = extractionMessages(report, T2, "SSC CGL", [PNG]);
  const user = messages[1]!;
  assert.ok(Array.isArray(user.content));
  const parts = user.content as Array<Record<string, string>>;
  assert.equal(parts[0]!.type, "text");
  assert.equal(parts[0]!.text.includes("<report_"), true);
  assert.equal(parts[0]!.text.includes("Quant 30 25 3 2"), true);
  assert.equal(parts[1]!.type, "image_url");
  assert.equal(parts[1]!.imageUrl, PNG);
});

test("without images the chat and extraction prompts stay text-only", () => {
  const context = buildAiContext([], null, T2);
  const messages = chatMessages(context, [
    { role: "user", content: "plain question" },
  ]);
  assert.equal(typeof messages.at(-1)!.content, "string");
  const report = sanitizeReport("Quant 30 25 3 2");
  const extraction = extractionMessages(report, T2);
  assert.equal(typeof extraction[1]!.content, "string");
});
