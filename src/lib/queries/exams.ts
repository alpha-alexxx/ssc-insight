import { queryOptions } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { ExamDef } from "@/lib/exams";
import type { PatternShape, SubjectId } from "@/lib/domain";
import type { TargetSettings } from "@/lib/target-settings";
import { ALL_TIERS_ID } from "@/lib/exams";

/**
 * Exams domain: the built-in catalog, the user's custom exams (per-tier
 * patterns), the tier-level workspace scope, and every tier's resolved
 * target. ONE query owns all of it — the old split between a settings query
 * and an exams query meant two caches holding the same scope, and a write to
 * one left the other stale for up to ten minutes.
 */

export type CustomTierDto = {
  id: string;
  label: string;
  subjects: { subjectId: SubjectId; questions: number; qualifying: boolean }[];
  marking: { correct: number; incorrect: number };
  maxScore: number;
};

export type CustomExamDto = {
  id: string;
  name: string;
  tiers: CustomTierDto[];
};

/** In-app-only preferences. There is no push, email or background delivery. */
export type PreferencesDto = {
  overdueEmphasis: boolean;
  mockDueToday: boolean;
  targetGap: boolean;
  quietHours: { enabled: boolean; start: string; end: string };
};

/** One tier's resolved target, computed on the server against that tier's
 * own maximum. `source` says where the number came from. */
export type EffectiveTargetDto = {
  marks: number | null;
  maxScore: number;
  signature: string;
  source: "override" | "tier-default" | "none";
  inheritedFromTierKey: string | null;
  outOfRange: boolean;
};

export type ExamsResponse = {
  builtIn: ExamDef[];
  customExams: CustomExamDto[];
  activeExamId: string;
  activeTierId: string;
  enabledTiers: string[];
  targets: TargetSettings;
  preferences: PreferencesDto;
  /** "examId:tierId" → resolved target. */
  resolvedTargets: Record<string, EffectiveTargetDto>;
  /** examId → percentile goal. */
  percentiles: Record<string, number | null>;
  /** structure signature → every tier key sharing it. */
  targetPeers: Record<string, string[]>;
};

/** The scope-only write (PUT /api/settings). Targets are NOT accepted here. */
export type ScopeInput = {
  activeExamId: string;
  activeTierId: string;
  enabledTiers: string[];
  preferences?: PreferencesDto;
};

export type TargetEditInput =
  | { kind: "inherit"; tierKey: string }
  | { kind: "override"; tierKey: string; marks: number | null }
  | { kind: "default"; signature: string; marks: number | null }
  | { kind: "percentile"; examId: string; percentile: number | null };

export type CustomTierInput = {
  id?: string;
  label: string;
  subjects: { subjectId: SubjectId; questions: number; qualifying: boolean }[];
  marking: { correct: number; incorrect: number };
};

export type CustomExamInput = {
  id?: string;
  name: string;
  tiers: CustomTierInput[];
};

export const examsKeys = {
  all: ["exams"] as const,
  current: () => [...examsKeys.all, "current"] as const,
};

export const examsQueryOptions = queryOptions({
  queryKey: examsKeys.current(),
  staleTime: 10 * 60_000,
  queryFn: ({ signal }) => api<ExamsResponse>("/api/exams", { signal }),
});

export async function createCustomExamRequest(input: CustomExamInput) {
  return api<{ id: string }>("/api/exams", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateCustomExamRequest(input: CustomExamInput & { id: string }) {
  return api<{ id: string }>("/api/exams", {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deleteCustomExamRequest(id: string) {
  return api<{ id: string }>("/api/exams", {
    method: "DELETE",
    body: JSON.stringify({ id }),
  });
}

/** Persist the workspace scope (active exam+tier, enablement, preferences).
 * The response is the FULL fresh workspace, so the single cache is patched
 * from it and nothing can drift. */
export async function putScopeRequest(scope: ScopeInput) {
  return api<ExamsResponse>("/api/settings", {
    method: "PUT",
    body: JSON.stringify(scope),
  });
}

/** Apply target edits atomically; the server validates each against the
 * live catalog, so the client never needs to know a maximum. */
export async function patchTargetsRequest(edits: TargetEditInput[]) {
  return api<ExamsResponse>("/api/settings", {
    method: "PATCH",
    body: JSON.stringify({ edits }),
  });
}

/** Resolve any exam+tier the user can reach to its concrete pattern. */
export function resolvePatternFrom(
  response: ExamsResponse,
  examId: string,
  tierId: string,
): PatternShape | null {
  const builtIn = response.builtIn.find((exam) => exam.id === examId);
  if (builtIn) {
    const tier = builtIn.tiers.find((t) => t.id === tierId);
    if (!tier) return null;
    return {
      examId: builtIn.id,
      tierId: tier.id,
      subjects: tier.subjects,
      marking: tier.marking,
      sections: tier.sections,
      tierLabel: tier.label,
      durationMinutes: tier.durationMinutes ?? null,
    };
  }
  const custom = response.customExams.find((exam) => exam.id === examId);
  const tier = custom?.tiers.find((t) => t.id === tierId);
  if (!custom || !tier) return null;
  return {
    examId: custom.id,
    tierId: tier.id,
    subjects: tier.subjects,
    marking: tier.marking,
    sections: [],
    tierLabel: tier.label,
  };
}

/** The active tier's pattern; the combined "all" view anchors on the
 * exam's default (else primary) tier. */
export function activeExamPattern(response: ExamsResponse): PatternShape | null {
  const builtIn = response.builtIn.find(
    (exam) => exam.id === response.activeExamId,
  );
  const tierId =
    response.activeTierId === ALL_TIERS_ID
      ? (builtIn?.defaultTierId ??
        builtIn?.primaryTierId ??
        response.customExams.find(
          (exam) => exam.id === response.activeExamId,
        )?.tiers[0]?.id ??
        response.activeTierId)
      : response.activeTierId;
  return resolvePatternFrom(response, response.activeExamId, tierId);
}

/** "SSC CGL · Tier 2 — Paper I" / "My Exam · Mains" for any attempt. */
export function examTierLabel(
  response: ExamsResponse,
  examId: string,
  tierId: string,
): string {
  const examName =
    response.builtIn.find((exam) => exam.id === examId)?.name ??
    response.customExams.find((exam) => exam.id === examId)?.name;
  if (tierId === ALL_TIERS_ID)
    return examName ? `${examName} · All tiers` : "All tiers";
  const builtIn = response.builtIn.find((exam) => exam.id === examId);
  const tierLabel =
    builtIn?.tiers.find((t) => t.id === tierId)?.label ??
    (builtIn
      ? null
      : response.customExams
          .find((exam) => exam.id === examId)
          ?.tiers.find((t) => t.id === tierId)?.label) ??
    (tierId === "main" ? "Main" : tierId);
  return examName ? `${examName} · ${tierLabel}` : tierLabel;
}

/** One selectable switcher entry: an exam with at least one enabled tier.
 * Tier choice is a Settings concern (Exams & tiers panel); the switcher only
 * moves the workspace between the exams the user has selected there. */
export type SwitcherEntry = {
  examId: string;
  /** The concrete tier this entry activates (see switcherEntries). */
  tierId: string;
  /** Stable activation key ("examId:tierId"). */
  key: string;
  /** The exam's name — tier detail stays in Settings. */
  label: string;
  isCustom: boolean;
};

export function switcherEntries(response: ExamsResponse): SwitcherEntry[] {
  const enabledByExam = new Map<string, string[]>();
  for (const key of response.enabledTiers) {
    const sep = key.indexOf(":");
    if (sep <= 0) continue;
    const examId = key.slice(0, sep);
    const tierId = key.slice(sep + 1);
    enabledByExam.set(examId, [...(enabledByExam.get(examId) ?? []), tierId]);
  }
  const entries: SwitcherEntry[] = [];
  const pushExam = (examId: string, examName: string, isCustom: boolean) => {
    const tierIds = enabledByExam.get(examId);
    if (!tierIds || tierIds.length === 0) return;
    // Re-selecting the active exam keeps its current tier (including the
    // combined view); arriving at a different exam lands on its first
    // enabled tier — the fine-grained pick lives in Settings.
    const tierId =
      response.activeExamId === examId &&
      (response.activeTierId === ALL_TIERS_ID ||
        tierIds.includes(response.activeTierId))
        ? response.activeTierId
        : tierIds[0]!;
    entries.push({
      examId,
      tierId,
      key: `${examId}:${tierId}`,
      label: examName,
      isCustom,
    });
  };
  for (const exam of response.builtIn)
    pushExam(exam.id, exam.name, false);
  for (const exam of response.customExams)
    pushExam(exam.id, exam.name, true);
  return entries;
}
