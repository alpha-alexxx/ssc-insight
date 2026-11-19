import assert from "node:assert/strict";
import { test } from "node:test";
import type { AiConfig } from "../src/lib/ai/config-core";
import { AiError } from "../src/lib/ai/errors";
import { createAiProvider } from "../src/lib/ai/provider";
import {
  canonicalizeAiEndpoint,
  generationPathFor,
  joinProviderUrl,
  type AiProtocol,
} from "../src/lib/ai/protocols";
import { providerPreset } from "../src/lib/ai/providers";

const FORMAT = {
  name: "connection_test",
  jsonSchema: {
    type: "object",
    properties: { ok: { type: "boolean" } },
    required: ["ok"],
    additionalProperties: false,
  },
};

function config(
  protocol: AiProtocol,
  overrides: Partial<AiConfig> = {},
): AiConfig {
  return {
    provider: "custom",
    protocol,
    authMode: protocol === "anthropic-messages" ? "anthropic-key" : "bearer",
    baseUrl: "https://provider.example/v1",
    generationPath: generationPathFor(protocol),
    modelsPath: "models",
    apiKey: "draft-secret",
    model: "model-1",
    jsonMode: true,
    allowHttp: false,
    allowPrivate: false,
    dailyRequestLimit: 30,
    dailyTokenLimit: 300_000,
    maxOutputTokens: 200,
    timeoutMs: 5_000,
    ...overrides,
  };
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function sse(chunks: string[]) {
  const encoder = new TextEncoder();
  return new Response(
    new ReadableStream({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
        controller.close();
      },
    }),
    { headers: { "content-type": "text/event-stream" } },
  );
}

/** Fake fetch whose SSE body produces chunks `gapMs` apart and honours the
 * request abort signal by erroring the stream, as a real fetch body would. */
function slowSseFetch(chunks: string[], gapMs: number): typeof fetch {
  const encoder = new TextEncoder();
  return async (_url, init) =>
    new Response(
      new ReadableStream({
        async start(controller) {
          const signal = init?.signal;
          const abort = () => {
            try {
              controller.error(new DOMException("Aborted", "AbortError"));
            } catch {
              /* already errored or closed */
            }
          };
          signal?.addEventListener("abort", abort, { once: true });
          for (const chunk of chunks) {
            await new Promise((resolve) => setTimeout(resolve, gapMs));
            if (signal?.aborted) return;
            try {
              controller.enqueue(encoder.encode(chunk));
            } catch {
              return; // The reader was cancelled (e.g. a stall timeout).
            }
          }
          signal?.removeEventListener("abort", abort);
          controller.close();
        },
      }),
      { headers: { "content-type": "text/event-stream" } },
    );
}

test("provider presets distinguish provider identity from wire protocol", () => {
  assert.equal(providerPreset("openai")?.protocol, "openai-responses");
  assert.equal(providerPreset("anthropic")?.protocol, "anthropic-messages");
  assert.equal(providerPreset("ollama")?.authMode, "none");
  assert.equal(providerPreset("deepseek")?.protocol, "openai-chat");
});

test("custom endpoint canonicalization accepts a known full endpoint without duplicating its suffix", () => {
  assert.deepEqual(
    canonicalizeAiEndpoint(
      "https://gateway.example/team/v1/responses/",
      "openai-responses",
    ),
    {
      baseUrl: "https://gateway.example/team/v1",
      generationPath: "responses",
    },
  );
  assert.equal(
    joinProviderUrl("https://gateway.example/team/v1/", "/responses"),
    "https://gateway.example/team/v1/responses",
  );
  assert.throws(
    () => joinProviderUrl("https://gateway.example/v1", "https://evil.example/x"),
    /relative/i,
  );
});

test("OpenAI Responses maps request, structured output, response text and usage", async () => {
  const fetcher: typeof fetch = async (url, init) => {
    assert.equal(url, "https://provider.example/v1/responses");
    const headers = new Headers(init?.headers);
    assert.equal(headers.get("Authorization"), "Bearer draft-secret");
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    assert.equal(body.model, "model-1");
    assert.equal(body.max_output_tokens, 200);
    assert.equal(body.store, undefined, "custom gateways do not receive OpenAI retention flags");
    assert.deepEqual(body.input, [
      { role: "system", content: "Return JSON." },
      { role: "user", content: "Connection test." },
    ]);
    assert.deepEqual(body.text, {
      format: {
        type: "json_schema",
        name: FORMAT.name,
        strict: true,
        schema: FORMAT.jsonSchema,
      },
    });
    return json({
      status: "completed",
      output: [
        { type: "reasoning", summary: [] },
        {
          type: "message",
          role: "assistant",
          content: [{ type: "output_text", text: '{"ok":true}' }],
        },
      ],
      usage: { input_tokens: 9, output_tokens: 4, total_tokens: 13 },
    });
  };
  const result = await createAiProvider(
    config("openai-responses"),
    fetcher,
  ).completeJson({
    messages: [
      { role: "system", content: "Return JSON." },
      { role: "user", content: "Connection test." },
    ],
    maxOutputTokens: 200,
    signal: new AbortController().signal,
    format: FORMAT,
    parse: (raw) => JSON.parse(raw) as { ok: boolean },
  });
  assert.deepEqual(result.value, { ok: true });
  assert.deepEqual(result.usage, {
    inputTokens: 9,
    outputTokens: 4,
    totalTokens: 13,
    estimated: false,
  });
});

test("official OpenAI Responses disables provider-side storage", async () => {
  const fetcher: typeof fetch = async (_url, init) => {
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    assert.equal(body.store, false);
    return json({
      status: "completed",
      output: [
        {
          type: "message",
          role: "assistant",
          content: [{ type: "output_text", text: "OK" }],
        },
      ],
    });
  };
  await createAiProvider(
    config("openai-responses", { provider: "openai" }),
    fetcher,
  ).complete({
    messages: [{ role: "user", content: "test" }],
    maxOutputTokens: 10,
    signal: new AbortController().signal,
  });
});

test("OpenAI Responses streams typed SSE deltas and final usage", async () => {
  const fetcher: typeof fetch = async () =>
    sse([
      'event: response.output_text.delta\ndata: {"type":"response.output_text.delta","delta":"Hel',
      'lo"}\n\nevent: response.output_text.delta\ndata: {"type":"response.output_text.delta","delta":"!"}\n\n',
      'event: response.completed\ndata: {"type":"response.completed","response":{"usage":{"input_tokens":7,"output_tokens":2,"total_tokens":9}}}\n\n',
    ]);
  const deltas: string[] = [];
  const result = await createAiProvider(
    config("openai-responses"),
    fetcher,
  ).stream({
    messages: [{ role: "user", content: "hello" }],
    maxOutputTokens: 20,
    signal: new AbortController().signal,
    onDelta: (text) => deltas.push(text),
  });
  assert.equal(deltas.join(""), "Hello!");
  assert.equal(result.text, "Hello!");
  assert.equal(result.usage.totalTokens, 9);
  assert.equal(result.usage.estimated, false);
});

test("Anthropic Messages maps system content, headers, structured output and blocks", async () => {
  const fetcher: typeof fetch = async (url, init) => {
    assert.equal(url, "https://provider.example/v1/messages");
    const headers = new Headers(init?.headers);
    assert.equal(headers.get("x-api-key"), "draft-secret");
    assert.ok(headers.get("anthropic-version"));
    assert.equal(headers.get("Authorization"), null);
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    assert.equal(body.system, "System rule.");
    assert.deepEqual(body.messages, [
      { role: "user", content: "Return JSON." },
    ]);
    assert.deepEqual(body.output_config, {
      format: { type: "json_schema", schema: FORMAT.jsonSchema },
    });
    return json({
      type: "message",
      role: "assistant",
      content: [
        { type: "thinking", thinking: "hidden" },
        { type: "text", text: '{"ok":true}' },
      ],
      usage: { input_tokens: 11, output_tokens: 5 },
    });
  };
  const result = await createAiProvider(
    config("anthropic-messages"),
    fetcher,
  ).completeJson({
    messages: [
      { role: "system", content: "System rule." },
      { role: "user", content: "Return JSON." },
    ],
    maxOutputTokens: 200,
    signal: new AbortController().signal,
    format: FORMAT,
    parse: (raw) => JSON.parse(raw) as { ok: boolean },
  });
  assert.deepEqual(result.value, { ok: true });
  assert.equal(result.usage.totalTokens, 16);
});

test("Anthropic Messages streams text deltas while merging split usage", async () => {
  const fetcher: typeof fetch = async () =>
    sse([
      'event: message_start\ndata: {"type":"message_start","message":{"usage":{"input_tokens":12,"output_tokens":1}}}\n\n',
      'event: content_block_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Hi"}}\n\n',
      'event: message_delta\ndata: {"type":"message_delta","usage":{"output_tokens":3}}\n\nevent: message_stop\ndata: {"type":"message_stop"}\n\n',
    ]);
  const result = await createAiProvider(
    config("anthropic-messages"),
    fetcher,
  ).stream({
    messages: [{ role: "user", content: "hello" }],
    maxOutputTokens: 20,
    signal: new AbortController().signal,
    onDelta: () => undefined,
  });
  assert.equal(result.text, "Hi");
  assert.deepEqual(result.usage, {
    inputTokens: 12,
    outputTokens: 3,
    totalTokens: 15,
    estimated: false,
  });
});

test("legacy Completions flattens role-tagged messages and parses text", async () => {
  const fetcher: typeof fetch = async (url, init) => {
    assert.equal(url, "https://provider.example/v1/completions");
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    assert.match(String(body.prompt), /\[SYSTEM\]\nRule/);
    assert.match(String(body.prompt), /\[USER\]\nQuestion/);
    assert.match(String(body.prompt), /\[ASSISTANT\]\n$/);
    assert.equal(body.max_tokens, 30);
    assert.equal("messages" in body, false);
    return json({
      choices: [{ text: "Legacy answer" }],
      usage: { prompt_tokens: 6, completion_tokens: 2, total_tokens: 8 },
    });
  };
  const result = await createAiProvider(
    config("openai-completions"),
    fetcher,
  ).complete({
    messages: [
      { role: "system", content: "Rule" },
      { role: "user", content: "Question" },
    ],
    maxOutputTokens: 30,
    signal: new AbortController().signal,
  });
  assert.equal(result.text, "Legacy answer");
  assert.equal(result.usage.totalTokens, 8);
});

test("protocol endpoint failures are typed and never trigger cross-protocol probing", async () => {
  let calls = 0;
  const fetcher: typeof fetch = async () => {
    calls += 1;
    return new Response("secret upstream detail", { status: 404 });
  };
  await assert.rejects(
    () =>
      createAiProvider(config("openai-responses"), fetcher).complete({
        messages: [{ role: "user", content: "hello" }],
        maxOutputTokens: 10,
        signal: new AbortController().signal,
      }),
    (error: unknown) =>
      error instanceof AiError &&
      error.code === "AI_ENDPOINT_ERROR" &&
      !error.message.includes("secret"),
  );
  assert.equal(calls, 1);
});

test("chat completions reasoning-only truncation reports incomplete output, not unreadable format", async () => {
  // The exact shape a thinking model returns when the output budget is spent
  // on hidden reasoning: HTTP 200, valid JSON, empty content, finish_reason
  // "length". This must not read as "check the API format".
  const fetcher: typeof fetch = async () =>
    json({
      id: "chatcmpl-1",
      object: "chat.completion",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: "",
            reasoning_content: "The user is asking me to reply with OK...",
          },
          finish_reason: "length",
        },
      ],
      usage: { prompt_tokens: 31, total_tokens: 47, completion_tokens: 16 },
    });
  await assert.rejects(
    () =>
      createAiProvider(config("openai-chat"), fetcher).complete({
        messages: [{ role: "user", content: "Connection test." }],
        maxOutputTokens: 16,
        signal: new AbortController().signal,
      }),
    (error: unknown) =>
      error instanceof AiError && error.code === "AI_OUTPUT_INCOMPLETE",
  );
});

test("chat completions content filter with empty content is a refusal", async () => {
  const fetcher: typeof fetch = async () =>
    json({
      choices: [
        {
          index: 0,
          message: { role: "assistant", content: "" },
          finish_reason: "content_filter",
        },
      ],
    });
  await assert.rejects(
    () =>
      createAiProvider(config("openai-chat"), fetcher).complete({
        messages: [{ role: "user", content: "hello" }],
        maxOutputTokens: 10,
        signal: new AbortController().signal,
      }),
    (error: unknown) =>
      error instanceof AiError && error.code === "AI_REFUSED",
  );
});

test("chat completions empty content with a clean stop is still unreadable output", async () => {
  const fetcher: typeof fetch = async () =>
    json({
      choices: [
        {
          index: 0,
          message: { role: "assistant", content: "" },
          finish_reason: "stop",
        },
      ],
    });
  await assert.rejects(
    () =>
      createAiProvider(config("openai-chat"), fetcher).complete({
        messages: [{ role: "user", content: "hello" }],
        maxOutputTokens: 10,
        signal: new AbortController().signal,
      }),
    (error: unknown) =>
      error instanceof AiError && error.code === "AI_INVALID_OUTPUT",
  );
});

test("chat completions streaming ignores reasoning deltas and reports length truncation", async () => {
  const fetcher: typeof fetch = async () =>
    sse([
      'data: {"choices":[{"index":0,"delta":{"role":"assistant","reasoning_content":"Thinking..."}}]}\n\n',
      'data: {"choices":[{"index":0,"delta":{},"finish_reason":"length"}]}\n\n',
      "data: [DONE]\n\n",
    ]);
  const deltas: string[] = [];
  await assert.rejects(
    () =>
      createAiProvider(config("openai-chat"), fetcher).stream({
        messages: [{ role: "user", content: "hello" }],
        maxOutputTokens: 16,
        signal: new AbortController().signal,
        onDelta: (text) => deltas.push(text),
      }),
    (error: unknown) =>
      error instanceof AiError && error.code === "AI_OUTPUT_INCOMPLETE",
  );
  assert.deepEqual(deltas, []);
});

test("anthropic messages truncation inside thinking reports incomplete output", async () => {
  const fetcher: typeof fetch = async () =>
    json({
      type: "message",
      role: "assistant",
      stop_reason: "max_tokens",
      content: [{ type: "thinking", thinking: "A long reasoning chain..." }],
      usage: { input_tokens: 10, output_tokens: 20 },
    });
  await assert.rejects(
    () =>
      createAiProvider(config("anthropic-messages"), fetcher).complete({
        messages: [{ role: "user", content: "hello" }],
        maxOutputTokens: 20,
        signal: new AbortController().signal,
      }),
    (error: unknown) =>
      error instanceof AiError && error.code === "AI_OUTPUT_INCOMPLETE",
  );
});

test("stream timeout re-arms per chunk so a slow but flowing stream completes", async () => {
  // Total duration (~600ms) far exceeds one timeout window (250ms); only the
  // re-armed inactivity deadline keeps this alive. Gaps stay under the window.
  const fetcher: typeof fetch = slowSseFetch(
    [
      'data: {"choices":[{"index":0,"delta":{"content":"a"}}]}\n\n',
      'data: {"choices":[{"index":0,"delta":{"content":"b"}}]}\n\n',
      'data: {"choices":[{"index":0,"delta":{"content":"c"}}]}\n\n',
      'data: {"choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}\n\n',
      "data: [DONE]\n\n",
    ],
    120,
  );
  const deltas: string[] = [];
  const result = await createAiProvider(
    config("openai-chat", { timeoutMs: 250 }),
    fetcher,
  ).stream({
    messages: [{ role: "user", content: "hello" }],
    maxOutputTokens: 20,
    signal: new AbortController().signal,
    onDelta: (text) => deltas.push(text),
  });
  assert.equal(result.text, "abc");
  assert.deepEqual(deltas, ["a", "b", "c"]);
  assert.equal(result.truncated, false);
});

test("stream stall beyond the timeout aborts with AI_TIMEOUT", async () => {
  const fetcher: typeof fetch = slowSseFetch(
    [
      'data: {"choices":[{"index":0,"delta":{"content":"a"}}]}\n\n',
      'data: {"choices":[{"index":0,"delta":{"content":"b"}}]}\n\n',
    ],
    300,
  );
  await assert.rejects(
    () =>
      createAiProvider(config("openai-chat", { timeoutMs: 120 }), fetcher).stream(
        {
          messages: [{ role: "user", content: "hello" }],
          maxOutputTokens: 20,
          signal: new AbortController().signal,
          onDelta: () => undefined,
        },
      ),
    (error: unknown) =>
      error instanceof AiError && error.code === "AI_TIMEOUT",
  );
});

test("chat stream partial answer cut by a truncation stop reason reports truncated", async () => {
  const fetcher: typeof fetch = async () =>
    sse([
      'data: {"choices":[{"index":0,"delta":{"content":"Partial ans"}}]}\n\n',
      'data: {"choices":[{"index":0,"delta":{},"finish_reason":"length"}]}\n\n',
      "data: [DONE]\n\n",
    ]);
  const result = await createAiProvider(config("openai-chat"), fetcher).stream({
    messages: [{ role: "user", content: "hello" }],
    maxOutputTokens: 20,
    signal: new AbortController().signal,
    onDelta: () => undefined,
  });
  assert.equal(result.text, "Partial ans");
  assert.equal(result.truncated, true);
});
