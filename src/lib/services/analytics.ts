import "server-only";
import { analyze, type TargetReference } from "@/lib/analytics";
import {
  dashboardScopeSchema,
  type AnalyticsAttempt,
  type DashboardScope,
  type Filters,
} from "@/lib/domain";
import { listAttempts } from "@/lib/repository";
import {
  activeResolved,
  loadExamContext,
  targetForTier,
} from "@/lib/exam-settings";
import { ALL_TIERS_ID, resolvePattern } from "@/lib/exams";

/**
 * The analytics projection, shared by `GET /api/analytics` and the two
 * analytical route pages.
 *
 * Every rule here is an invariant from `CLAUDE.md` that must hold identically
 * on both paths:
 * - Parent `type`/`subject` filters are NOT applied before projection, so a
 *   full mock can still contribute its subjects and derived sections when
 *   another scope asks for that grain.
 * - The target reference is resolved for the SAME tier the data was scoped to.
 *   A target set on a 100-mark paper is never drawn against a 390-mark axis.
 * - The combined all-tiers view spans different maxima, so its reference is
 *   explicitly marked incomparable instead of drawn as one misleading line.
 */
export async function loadAnalytics(
  userId: string,
  scope: DashboardScope,
  filters: Filters,
  ctx: Awaited<ReturnType<typeof loadExamContext>> | null,
) {
  // No scope resolved (database unreachable): project over every saved
  // attempt with no target line instead of throwing. The page still renders
  // and the client query surfaces the real failure.
  if (!ctx) {
    const attempts = await listAttempts(userId, filters);
    return analyze(attempts as AnalyticsAttempt[], scope, undefined);
  }
  const attempts = await listAttempts(userId, {
    ...filters,
    examId: ctx.activeExamId,
    type: "all",
    subject: "all",
    // The combined "all" view leaves the tier open; a concrete active tier
    // scopes the projection (attemptWhere skips the literal "all").
    tier: filters.tier ?? ctx.activeTierId,
  });

  // An explicit tier filter wins when choosing the target's paper; otherwise
  // the active tier anchors it.
  const explicitTier =
    filters.tier && filters.tier !== ALL_TIERS_ID ? filters.tier : null;
  const anchor = explicitTier
    ? (resolvePattern(ctx.activeExamId, explicitTier, ctx.customExams)?.tier ??
      null)
    : (activeResolved(ctx)?.tier ?? null);
  const effective = explicitTier
    ? targetForTier(ctx, ctx.activeExamId, explicitTier)
    : activeResolved(ctx)
      ? targetForTier(ctx, ctx.activeExamId, activeResolved(ctx)!.tier.id)
      : null;

  const target: TargetReference | undefined =
    anchor && effective
      ? {
          marks: effective.marks,
          maxScore: effective.maxScore,
          percentage:
            effective.marks == null
              ? null
              : (effective.marks / effective.maxScore) * 100,
          tierLabel: anchor.label,
          comparable: explicitTier != null || ctx.activeTierId !== ALL_TIERS_ID,
        }
      : undefined;

  return analyze(attempts as AnalyticsAttempt[], scope, target);
}

/** Parse a `view` query value with the same leniency as the API. */
export function parseScope(value: string | null | undefined): DashboardScope {
  return dashboardScopeSchema.catch("all").parse(value ?? "all");
}
