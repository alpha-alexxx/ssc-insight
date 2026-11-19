import { z } from "zod";

export const coachInsightSchema = z.object({
  headline: z.string().trim().min(1).max(160),
  summary: z.string().trim().min(1).max(1_200),
  strengths: z.array(z.string().trim().min(1).max(300)).min(1).max(3),
  focusAreas: z.array(z.string().trim().min(1).max(300)).min(1).max(3),
  nextActions: z.array(z.string().trim().min(1).max(300)).min(1).max(5),
  caveats: z.array(z.string().trim().max(300)).max(3).default([]),
});

export type CoachInsight = z.infer<typeof coachInsightSchema>;

const COACH_STRING_LIMITS = {
  headline: 160,
  summary: 1_200,
} as const;

/** Clamp one model-provided item to a plain, trimmed string of at most
 * `max` characters; anything that is not a non-empty string becomes null so
 * the caller can drop it (a nested object is not a sentence). */
function coerceItem(input: unknown, max: number): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  return trimmed.length > max ? trimmed.slice(0, max).trimEnd() : trimmed;
}

/** Clamp an array field to `maxItems` cleaned items. */
function coerceItems(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];
  const items: string[] = [];
  for (const entry of value) {
    const item = coerceItem(entry, 300);
    if (item) items.push(item);
    if (items.length === max) break;
  }
  return items;
}

/**
 * Pull model output back inside the coach contract instead of rejecting it.
 *
 * The prompt demands exact counts and lengths; a thinking model routinely
 * returns four focus areas or a 170-character headline. Validation-only
 * handling turns those near-misses into a failed insight (or a full second
 * provider call through the repair path). Coercion clamps lengths, drops
 * empty items, and caps counts — never fabricates. Minimum counts and the
 * key set are still enforced by `coachInsightSchema` afterwards, so a
 * genuinely broken answer still fails and still triggers the repair call.
 */
export function coerceCoachInsight(raw: unknown): unknown {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return raw;
  const record = raw as Record<string, unknown>;
  const headline = coerceItem(record.headline, COACH_STRING_LIMITS.headline);
  const summary = coerceItem(record.summary, COACH_STRING_LIMITS.summary);
  return {
    headline: headline ?? "",
    summary: summary ?? "",
    strengths: coerceItems(record.strengths, 3),
    focusAreas: coerceItems(record.focusAreas, 3),
    nextActions: coerceItems(record.nextActions, 5),
    caveats: coerceItems(record.caveats, 3),
  };
}

/** Remove markdown fences and surrounding prose, then take one balanced object. */
export function extractJsonText(raw: string): string | null {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const source = (fenced?.[1] ?? raw).trim();
  const start = source.indexOf("{");
  if (start < 0) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < source.length; index++) {
    const char = source[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') {
      inString = true;
      continue;
    }
    if (char === "{") depth++;
    else if (char === "}") {
      depth--;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  return null;
}

/** Parse model JSON and validate it. Throws on any mismatch. */
export function parseModelJson<T>(raw: string, schema: z.ZodType<T>): T {
  const json = extractJsonText(raw);
  if (!json) throw new Error("No JSON object in model output");
  return schema.parse(JSON.parse(json));
}

/**
 * Convert an existing Zod contract into the JSON Schema used by native
 * structured output (OpenAI text.format, Anthropic output_config). The
 * provider-facing field is optional per call site, and prompt/Zod validation
 * remains the enforcement path whenever a provider declines the format.
 */
export function structuredFormatFor(
  schema: z.ZodType,
  name: string,
): { name: string; jsonSchema: Record<string, unknown> } {
  const jsonSchema = z.toJSONSchema(schema, {
    target: "draft-7",
  }) as Record<string, unknown>;
  return { name, jsonSchema };
}
