import { z } from "zod";

/**
 * Client-side zod schemas for the settings panels' react-hook-form drafts.
 * Each mirrors what the server route accepts (PUT/PATCH /api/settings,
 * PUT /api/ai/settings) so a submit that passes here also passes there.
 * Never validate stored data on read — write-path validation only.
 */

/** Exams & tiers: the staged scope draft (PUT /api/settings, scope only). */
export const examsScopeSchema = z.object({
  enabledTiers: z
    .array(z.string().min(1))
    .min(1, "Enable at least one tier so mocks and targets have a scope."),
});
export type ExamsScopeValues = z.infer<typeof examsScopeSchema>;

/** Reminders: the preferences draft (PUT /api/settings `preferences`). */
const timeOfDay = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use a 24h HH:MM time.");

export const remindersSchema = z.object({
  overdueEmphasis: z.boolean(),
  mockDueToday: z.boolean(),
  targetGap: z.boolean(),
  quietHours: z.object({
    enabled: z.boolean(),
    start: timeOfDay,
    end: timeOfDay,
  }),
});
export type ReminderValues = z.infer<typeof remindersSchema>;

/**
 * Targets: one string field per editable row, namespaced by kind —
 * `tier:<examId:tierId>`, `default:<signature>`, `pct:<examId>`. The server
 * owns each row's ceiling, delivered with the resolved target; the factory
 * binds those maxima so a value can never validate above its own paper.
 * An empty string means "no target" (same as the previous hand-rolled check).
 */
export function targetsSchema(maxima: Record<string, number>) {
  return z
    .record(z.string(), z.string())
    .superRefine((values, ctx) => {
      for (const [key, raw] of Object.entries(values)) {
        if (raw.trim() === "") continue;
        const numeric = Number(raw);
        if (!Number.isFinite(numeric) || numeric < 0) {
          ctx.addIssue({ code: "custom", path: [key], message: "Enter a number." });
          continue;
        }
        const max = key.startsWith("pct:")
          ? 100
          : (maxima[key] ?? Number.POSITIVE_INFINITY);
        if (numeric > max) {
          ctx.addIssue({
            code: "custom",
            path: [key],
            message: `Enter 0–${max}.`,
          });
        }
      }
    });
}
export type TargetsValues = Record<string, string>;

/** AI provider: mirrors PUT /api/ai/settings. The key stays write-only.
 * The unions mirror lib/ai/protocols (AI_PROTOCOLS / AI_AUTH_MODES) without
 * importing the server-only module into a client file. Numeric per-user
 * preferences are form strings where a blank value means "inherit". */
export const aiSchema = z.object({
  provider: z.string().min(1),
  protocol: z.enum([
    "openai-responses",
    "openai-chat",
    "openai-completions",
    "anthropic-messages",
  ]),
  authMode: z.enum(["bearer", "anthropic-key", "none"]),
  baseUrl: z
    .string()
    .trim()
    .min(1, "A base URL is required.")
    .refine(
      (value) => {
        try {
          const parsed = new URL(value);
          return parsed.protocol === "http:" || parsed.protocol === "https:";
        } catch {
          return false;
        }
      },
      "Enter a valid http(s) URL.",
    ),
  generationPath: z.string(),
  model: z.string().trim().min(1, "Choose or enter a model ID."),
  apiKey: z.string(),
  jsonMode: z.boolean(),
  allowPrivate: z.boolean(),
  thinking: z.enum(["default", "off", "low", "medium", "high"]),
  maxOutputTokens: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        (Number.isInteger(Number(value)) &&
          Number(value) >= 256 &&
          Number(value) <= 32_000),
      "Enter 256–32000, or leave blank for the default.",
    ),
  historyTurns: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        (Number.isInteger(Number(value)) && Number(value) >= 2 && Number(value) <= 16),
      "Enter 2–16, or leave blank for the default.",
    ),
  visionEnabled: z.boolean(),
});
export type AiValues = z.infer<typeof aiSchema>;
