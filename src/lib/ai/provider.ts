import type { AiConfig } from "./config-core";
import {
  AiError,
  aiAborted,
  aiEndpointError,
  aiInvalidOutput,
  aiModelError,
  aiOutputIncomplete,
  aiProviderAuth,
  aiProviderError,
  aiProviderRateLimit,
  aiRefused,
  aiTimeout,
} from "./errors";
import {
  authModeFor,
  generationPathFor,
  joinProviderUrl,
  modelsPathFor,
} from "./protocols";
import { estimateTokens } from "./tokens";

export type AiMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AiUsage = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimated: boolean;
};

export type AiStructuredFormat = {
  name: string;
  jsonSchema: Record<string, unknown>;
};

type RequestArgs = {
  messages: AiMessage[];
  maxOutputTokens: number;
  signal: AbortSignal;
};

type JsonRequestArgs<T> = RequestArgs & {
  parse: (raw: string) => T;
  format?: AiStructuredFormat;
};

export type AiProvider = {
  complete(args: RequestArgs): Promise<{
    text: string;
    usage: AiUsage;
    providerCalls: number;
  }>;
  completeJson<T>(
    args: JsonRequestArgs<T>,
  ): Promise<{ value: T; usage: AiUsage; providerCalls: number }>;
  stream(
    args: RequestArgs & { onDelta: (text: string) => void },
  ): Promise<{ text: string; usage: AiUsage; providerCalls: number }>;
};

const MAX_STREAM_CHARS = 60_000;
const MAX_RESPONSE_CHARS = 512_000;
const MAX_ERROR_BODY_CHARS = 8_192;
const ANTHROPIC_VERSION = "2026-10-21";
const REPAIR_INSTRUCTION =
  "Your previous reply was not valid JSON for the requested schema. Return only one JSON object, with no markdown fences or commentary.";

class StructuredOutputUnsupported extends Error {}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : null;
}

type UsagePatch = {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
};

function usagePatch(payload: unknown): UsagePatch | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  const input =
    numberValue(record.prompt_tokens) ?? numberValue(record.input_tokens);
  const output =
    numberValue(record.completion_tokens) ?? numberValue(record.output_tokens);
  const total = numberValue(record.total_tokens);
  if (input == null && output == null && total == null) return null;
  return {
    ...(input != null ? { inputTokens: input } : {}),
    ...(output != null ? { outputTokens: output } : {}),
    ...(total != null ? { totalTokens: total } : {}),
  };
}

function usageFrom(payload: unknown, fallback: AiUsage): AiUsage {
  if (!payload || typeof payload !== "object") return fallback;
  const patch = usagePatch((payload as { usage?: unknown }).usage);
  if (!patch) return fallback;
  const inputTokens = patch.inputTokens ?? 0;
  const outputTokens = patch.outputTokens ?? 0;
  return {
    inputTokens,
    outputTokens,
    totalTokens: patch.totalTokens ?? inputTokens + outputTokens,
    estimated: false,
  };
}

function estimatedUsage(messages: AiMessage[], output: string): AiUsage {
  const inputTokens = estimateTokens(
    messages.map((message) => message.content).join("\n"),
  );
  const outputTokens = estimateTokens(output);
  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    estimated: true,
  };
}

function sumUsage(a: AiUsage, b: AiUsage): AiUsage {
  return {
    inputTokens: a.inputTokens + b.inputTokens,
    outputTokens: a.outputTokens + b.outputTokens,
    totalTokens: a.totalTokens + b.totalTokens,
    estimated: a.estimated || b.estimated,
  };
}

function contentText(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .map((part) => {
      if (typeof part === "string") return part;
      if (!part || typeof part !== "object") return "";
      const record = part as Record<string, unknown>;
      if (record.type === "refusal" && typeof record.refusal === "string")
        throw aiRefused();
      return typeof record.text === "string" ? record.text : "";
    })
    .join("");
}

async function readLimitedText(response: Response, limit: number) {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
      if (text.length >= limit) {
        text = text.slice(0, limit);
        await reader.cancel();
        break;
      }
    }
    text += decoder.decode();
    return text;
  } finally {
    reader.releaseLock();
  }
}

function providerHeaders(
  config: AiConfig,
  stream: boolean,
): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: stream ? "text/event-stream" : "application/json",
  };
  if (config.authMode === "bearer") {
    headers.Authorization = `Bearer ${config.apiKey}`;
  } else if (config.authMode === "anthropic-key") {
    headers["x-api-key"] = config.apiKey;
    headers["anthropic-version"] = ANTHROPIC_VERSION;
  }
  return headers;
}

function rolePrompt(messages: AiMessage[]) {
  return `${messages
    .map((message) => `[${message.role.toUpperCase()}]\n${message.content}`)
    .join("\n\n")}\n\n[ASSISTANT]\n`;
}

function responseFormat(format?: AiStructuredFormat) {
  return format
    ? {
        type: "json_schema",
        json_schema: {
          name: format.name,
          strict: true,
          schema: format.jsonSchema,
        },
      }
    : { type: "json_object" };
}

function responsesTextFormat(format?: AiStructuredFormat) {
  return format
    ? {
        format: {
          type: "json_schema",
          name: format.name,
          strict: true,
          schema: format.jsonSchema,
        },
      }
    : { format: { type: "json_object" } };
}

function requestBody(
  config: AiConfig,
  args: RequestArgs,
  options: {
    stream: boolean;
    json: boolean;
    format?: AiStructuredFormat;
  },
): Record<string, unknown> {
  const structured = options.json && config.jsonMode;
  switch (config.protocol) {
    case "openai-responses":
      return {
        model: config.model,
        input: args.messages,
        max_output_tokens: args.maxOutputTokens,
        ...(config.provider === "openai" ? { store: false } : {}),
        ...(options.stream ? { stream: true } : {}),
        ...(structured ? { text: responsesTextFormat(options.format) } : {}),
      };
    case "openai-completions":
      return {
        model: config.model,
        prompt: rolePrompt(args.messages),
        max_tokens: args.maxOutputTokens,
        ...(options.stream ? { stream: true } : {}),
      };
    case "anthropic-messages": {
      const systems = args.messages
        .filter((message) => message.role === "system")
        .map((message) => message.content)
        .join("\n\n");
      const messages = args.messages
        .filter((message) => message.role !== "system")
        .map((message) => ({ role: message.role, content: message.content }));
      return {
        model: config.model,
        ...(systems ? { system: systems } : {}),
        messages,
        max_tokens: args.maxOutputTokens,
        ...(options.stream ? { stream: true } : {}),
        ...(structured && options.format
          ? {
              output_config: {
                format: {
                  type: "json_schema",
                  schema: options.format.jsonSchema,
                },
              },
            }
          : {}),
      };
    }
    case "openai-chat":
      return {
        model: config.model,
        messages: args.messages,
        ...(config.provider === "openai"
          ? { max_completion_tokens: args.maxOutputTokens, store: false }
          : { max_tokens: args.maxOutputTokens }),
        ...(options.stream
          ? {
              stream: true,
              ...(config.provider === "openai"
                ? { stream_options: { include_usage: true } }
                : {}),
            }
          : {}),
        ...(structured ? { response_format: responseFormat(options.format) } : {}),
      };
  }
}

function hasStructuredRequest(body: Record<string, unknown>) {
  return (
    "response_format" in body || "text" in body || "output_config" in body
  );
}

function retryAfterSeconds(response: Response) {
  const raw = response.headers.get("retry-after");
  if (!raw) return undefined;
  const seconds = Number(raw);
  return Number.isFinite(seconds) && seconds > 0
    ? Math.min(86_400, Math.ceil(seconds))
    : undefined;
}

function errorForStatus(status: number, errorText: string, response: Response) {
  if (status === 401 || status === 403) return aiProviderAuth();
  if (status === 404 || status === 405) return aiEndpointError();
  if (status === 429)
    return aiProviderRateLimit(retryAfterSeconds(response));
  if (
    (status === 400 || status === 422) &&
    /(^|[^a-z])model([^a-z]|$)/i.test(errorText)
  )
    return aiModelError();
  return aiProviderError();
}

function completionText(config: AiConfig, payload: unknown): string {
  if (!payload || typeof payload !== "object") throw aiProviderError();
  const record = payload as Record<string, unknown>;
  if (config.protocol === "openai-responses") {
    if (record.status === "incomplete") throw aiOutputIncomplete();
    const output = Array.isArray(record.output) ? record.output : [];
    let text = "";
    for (const item of output) {
      if (!item || typeof item !== "object") continue;
      const outputItem = item as Record<string, unknown>;
      if (outputItem.type !== "message") continue;
      text += contentText(outputItem.content);
    }
    return text;
  }
  if (config.protocol === "anthropic-messages") {
    return contentText(record.content);
  }
  const choices = record.choices;
  if (!Array.isArray(choices) || !choices.length) throw aiProviderError();
  const first = choices[0] as {
    message?: { content?: unknown };
    text?: unknown;
  };
  return contentText(first.message?.content ?? first.text);
}

type StreamFrame = { event: string | null; data: string };

class ProviderStreamDecoder {
  private buffer = "";
  private decoder = new TextDecoder();

  constructor(private readonly jsonLines: boolean) {}

  push(chunk: Uint8Array): StreamFrame[] {
    this.buffer += this.decoder.decode(chunk, { stream: true });
    return this.drain(false);
  }

  flush(): StreamFrame[] {
    this.buffer += this.decoder.decode();
    return this.drain(true);
  }

  private drain(final: boolean): StreamFrame[] {
    if (this.jsonLines) {
      const frames: StreamFrame[] = [];
      let newline = this.buffer.indexOf("\n");
      while (newline >= 0) {
        const line = this.buffer.slice(0, newline).replace(/\r$/, "").trim();
        this.buffer = this.buffer.slice(newline + 1);
        if (line) frames.push({ event: null, data: line });
        newline = this.buffer.indexOf("\n");
      }
      if (final && this.buffer.trim())
        frames.push({ event: null, data: this.buffer.trim() });
      if (final) this.buffer = "";
      return frames;
    }

    const frames: StreamFrame[] = [];
    let boundary = this.buffer.search(/\r?\n\r?\n/);
    while (boundary >= 0) {
      const raw = this.buffer.slice(0, boundary);
      const match = this.buffer.slice(boundary).match(/^\r?\n\r?\n/);
      this.buffer = this.buffer.slice(boundary + (match?.[0].length ?? 2));
      const frame = parseSseFrame(raw);
      if (frame) frames.push(frame);
      boundary = this.buffer.search(/\r?\n\r?\n/);
    }
    if (final && this.buffer.trim()) {
      const frame = parseSseFrame(this.buffer);
      if (frame) frames.push(frame);
      this.buffer = "";
    }
    return frames;
  }
}

function parseSseFrame(raw: string): StreamFrame | null {
  let event: string | null = null;
  const data: string[] = [];
  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    if (!line || line.startsWith(":")) continue;
    if (line.startsWith("event:")) {
      event = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      data.push(line.slice(5).trimStart());
    } else if (!line.includes(":")) {
      data.push(line);
    }
  }
  if (!data.length) return null;
  return { event, data: data.join("\n") };
}

type StreamResult = {
  delta?: string;
  usage?: UsagePatch | null;
  done?: boolean;
};

function parseStreamPayload(
  config: AiConfig,
  payload: unknown,
): StreamResult {
  if (!payload || typeof payload !== "object") return {};
  const record = payload as Record<string, unknown>;
  if (record.type === "error" || "error" in record) throw aiProviderError();

  if (config.protocol === "openai-responses") {
    const type = typeof record.type === "string" ? record.type : "";
    if (type === "response.output_text.delta") {
      return { delta: typeof record.delta === "string" ? record.delta : "" };
    }
    if (type === "response.completed") {
      const response = record.response as Record<string, unknown> | undefined;
      return {
        done: true,
        usage: usagePatch(response?.usage),
      };
    }
    if (type === "response.incomplete") throw aiOutputIncomplete();
    if (type === "response.failed") throw aiProviderError();
    return {};
  }

  if (config.protocol === "anthropic-messages") {
    const type = typeof record.type === "string" ? record.type : "";
    if (type === "content_block_delta") {
      const delta = record.delta as Record<string, unknown> | undefined;
      return {
        delta:
          delta?.type === "text_delta" && typeof delta.text === "string"
            ? delta.text
            : "",
      };
    }
    if (type === "message_start") {
      const message = record.message as Record<string, unknown> | undefined;
      return { usage: usagePatch(message?.usage) };
    }
    if (type === "message_delta") {
      return { usage: usagePatch(record.usage) };
    }
    if (type === "message_stop") return { done: true };
    return {};
  }

  const choices = record.choices;
  const first = Array.isArray(choices)
    ? (choices[0] as
        | {
            delta?: { content?: unknown };
            message?: { content?: unknown };
            text?: unknown;
          }
        | undefined)
    : undefined;
  return {
    delta: contentText(
      first?.delta?.content ?? first?.message?.content ?? first?.text,
    ),
    usage: usagePatch(record.usage),
  };
}

export function createAiProvider(
  config: AiConfig,
  fetchImpl: typeof fetch = fetch,
): AiProvider {
  // Runtime compatibility matters during an expand migration: an older caller
  // or persisted row may not have the new protocol fields yet. Its behavior is
  // exactly the old OpenAI-compatible Chat Completions contract.
  const legacy = config as Partial<AiConfig>;
  const protocol = legacy.protocol ?? "openai-chat";
  config = {
    ...config,
    provider: legacy.provider ?? "custom",
    protocol,
    authMode: legacy.authMode ?? authModeFor(protocol, legacy.provider),
    generationPath:
      legacy.generationPath ?? generationPathFor(protocol),
    modelsPath:
      legacy.modelsPath === undefined ? modelsPathFor(protocol) : legacy.modelsPath,
    allowHttp: legacy.allowHttp ?? false,
    allowPrivate: legacy.allowPrivate ?? false,
  };

  type Opened = {
    response: Response;
    cleanup: () => void;
    didTimeout: () => boolean;
  };

  async function open(
    body: Record<string, unknown>,
    signal: AbortSignal,
  ): Promise<Opened> {
    if (signal.aborted) throw aiAborted();
    const controller = new AbortController();
    let timedOut = false;
    const forwardAbort = () => controller.abort();
    signal.addEventListener("abort", forwardAbort, { once: true });
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, config.timeoutMs);
    const cleanup = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", forwardAbort);
    };

    let response: Response;
    try {
      response = await fetchImpl(
        joinProviderUrl(config.baseUrl, config.generationPath),
        {
          method: "POST",
          headers: providerHeaders(config, Boolean(body.stream)),
          body: JSON.stringify(body),
          redirect: "error",
          signal: controller.signal,
        },
      );
    } catch {
      cleanup();
      if (timedOut) throw aiTimeout();
      if (signal.aborted) throw aiAborted();
      throw aiProviderError();
    }

    if (!response.ok) {
      const errorBody = await readLimitedText(
        response,
        MAX_ERROR_BODY_CHARS,
      ).catch(() => "");
      cleanup();
      const errorText = errorBody.toLowerCase();
      if (
        (response.status === 400 || response.status === 422) &&
        hasStructuredRequest(body) &&
        /(response[_ .-]?format|text\.format|output[_ .-]?config|json[_ .-]?schema|structured).*(unsupported|unknown|invalid|not supported)|(unsupported|unknown).*(response[_ .-]?format|output[_ .-]?config|json[_ .-]?schema)/i.test(
          errorText,
        )
      ) {
        throw new StructuredOutputUnsupported();
      }
      throw errorForStatus(response.status, errorText, response);
    }

    return {
      response,
      cleanup,
      didTimeout: () => timedOut,
    };
  }

  async function complete(
    args: RequestArgs,
    json = false,
    format?: AiStructuredFormat,
  ): Promise<{ text: string; usage: AiUsage; providerCalls: number }> {
    let opened: Opened;
    try {
      opened = await open(
        requestBody(config, args, { stream: false, json, format }),
        args.signal,
      );
    } catch (error) {
      if (!(error instanceof StructuredOutputUnsupported)) throw error;
      opened = await open(
        requestBody(config, args, { stream: false, json: false }),
        args.signal,
      );
    }

    try {
      const raw = await readLimitedText(opened.response, MAX_RESPONSE_CHARS);
      let payload: unknown;
      try {
        payload = JSON.parse(raw);
      } catch {
        throw aiProviderError();
      }
      const text = completionText(config, payload);
      if (!text.trim()) throw aiInvalidOutput();
      return {
        text,
        usage: usageFrom(payload, estimatedUsage(args.messages, text)),
        providerCalls: 1,
      };
    } catch (error) {
      if (error instanceof AiError) throw error;
      if (opened.didTimeout()) throw aiTimeout();
      if (args.signal.aborted) throw aiAborted();
      throw aiProviderError();
    } finally {
      opened.cleanup();
    }
  }

  async function stream(
    args: RequestArgs & { onDelta: (text: string) => void },
  ): Promise<{ text: string; usage: AiUsage; providerCalls: number }> {
    const opened = await open(
      requestBody(config, args, { stream: true, json: false }),
      args.signal,
    );
    const contentType = opened.response.headers.get("content-type") ?? "";
    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
    let text = "";
    let providerTokens: UsagePatch | undefined;
    let done = false;

    const mergeUsage = (patch?: UsagePatch | null) => {
      if (!patch) return;
      providerTokens = { ...(providerTokens ?? {}), ...patch };
    };
    const handleFrame = (frame: StreamFrame) => {
      const data = frame.data.trim();
      if (!data) return;
      if (data === "[DONE]") {
        done = true;
        return;
      }
      let payload: unknown;
      try {
        payload = JSON.parse(data);
      } catch {
        return;
      }
      const result = parseStreamPayload(config, payload);
      if (result.delta) {
        text += result.delta;
        args.onDelta(result.delta);
        if (text.length >= MAX_STREAM_CHARS) done = true;
      }
      mergeUsage(result.usage);
      if (result.done) done = true;
    };

    try {
      if (contentType.includes("application/json")) {
        const raw = await readLimitedText(opened.response, MAX_RESPONSE_CHARS);
        const payload = JSON.parse(raw) as unknown;
        const full = completionText(config, payload);
        if (!full.trim()) throw aiInvalidOutput();
        text = full;
        args.onDelta(full);
        return {
          text,
          usage: usageFrom(payload, estimatedUsage(args.messages, full)),
          providerCalls: 1,
        };
      }

      if (!opened.response.body) throw aiProviderError();
      const bodyReader = opened.response.body.getReader();
      reader = bodyReader;
      const decoder = new ProviderStreamDecoder(
        contentType.includes("ndjson") || contentType.includes("jsonl"),
      );
      while (!done) {
        const { done: finished, value } = await bodyReader.read();
        if (finished) break;
        for (const frame of decoder.push(value)) {
          handleFrame(frame);
          if (done) break;
        }
      }
      if (!done) {
        for (const frame of decoder.flush()) handleFrame(frame);
      }
      if (!text.trim()) throw aiInvalidOutput();
      const tokens = providerTokens;
      const inputTokens = tokens?.inputTokens ?? 0;
      const outputTokens = tokens?.outputTokens ?? 0;
      return {
        text,
        usage: tokens
          ? {
              inputTokens,
              outputTokens,
              totalTokens: tokens.totalTokens ?? inputTokens + outputTokens,
              estimated: false,
            }
          : estimatedUsage(args.messages, text),
        providerCalls: 1,
      };
    } catch (error) {
      if (error instanceof AiError) throw error;
      if (opened.didTimeout()) throw aiTimeout();
      if (args.signal.aborted) throw aiAborted();
      throw aiProviderError();
    } finally {
      opened.cleanup();
      if (reader) {
        await reader.cancel().catch(() => undefined);
        reader.releaseLock();
      }
    }
  }

  async function completeJson<T>(
    args: JsonRequestArgs<T>,
  ): Promise<{ value: T; usage: AiUsage; providerCalls: number }> {
    const first = await complete(args, true, args.format);
    try {
      return {
        value: args.parse(first.text),
        usage: first.usage,
        providerCalls: first.providerCalls,
      };
    } catch {
      if (args.signal.aborted) throw aiAborted();
    }

    const repaired = await complete(
      {
        ...args,
        messages: [
          ...args.messages,
          { role: "assistant", content: first.text.slice(0, 12_000) },
          { role: "user", content: REPAIR_INSTRUCTION },
        ],
      },
      true,
      args.format,
    );
    let value: T;
    try {
      value = args.parse(repaired.text);
    } catch {
      throw aiInvalidOutput();
    }
    return {
      value,
      usage: sumUsage(first.usage, repaired.usage),
      providerCalls: first.providerCalls + repaired.providerCalls,
    };
  }

  return { complete, completeJson, stream };
}
