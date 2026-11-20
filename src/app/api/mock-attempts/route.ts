import { attemptSchemaFor } from "@/lib/domain";
import { readBody, RequestError } from "@/lib/api";
import { createAttempt } from "@/lib/repository";
import { loadExamContext, requirePattern } from "@/lib/exam-settings";
import {
  attemptFiltersFrom,
  loadAttemptList,
  loadAttemptPage,
  parseAttemptListQuery,
} from "@/lib/services/attempts";
import { defineRoute } from "@/lib/route-handler";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

/**
 * The reads live in src/lib/services/attempts.ts so this handler and the
 * /history, /compare, /calendar, /dashboard and /plan pages share one
 * implementation — scope, ownership and the trash filter cannot diverge.
 */
export const GET = defineRoute({ kind: "read" }, async ({ request, user }) => {
  const list = parseAttemptListQuery(
    Object.fromEntries(new URL(request.url).searchParams.entries()),
  );
  const ctx = await loadExamContext(user.id);
  const filters = attemptFiltersFrom(list, ctx);

  if (list.page != null) {
    const data = await loadAttemptPage(user.id, filters, {
      page: list.page,
      pageSize: list.pageSize ?? 10,
      sort: list.sort ?? "date",
      dir: list.dir ?? "desc",
      withStats: list.stats === "1",
    });
    return { data, cache: { maxAgeSec: 0, swrSec: 2 } };
  }

  const { items, truncated } = await loadAttemptList(user.id, filters);
  const headers: Record<string, string> = {};
  if (truncated) {
    headers["X-List-Truncated"] = "true";
    headers["X-List-Max"] = "50";
  }
  return { data: items, cache: { maxAgeSec: 0, swrSec: 2 }, headers };
});

export const POST = defineRoute(
  {
    kind: "write",
    onError: (error, userId, startedAt) => {
      audit("mock.create", userId, {
        outcome:
          error instanceof RequestError && error.status === 429
            ? "denied"
            : "error",
        ms: Date.now() - startedAt,
      });
    },
  },
  async ({ request, user, startedAt }) => {
    const body = await readBody(request);
    // Resolve the claimed exam/tier to its concrete pattern first, then
    // validate the body against that pattern (counts, marking, sections).
    const claim = body as { examId?: unknown; tierId?: unknown };
    const ctx = await loadExamContext(user.id);
    const { resolved, shape } = requirePattern(
      ctx,
      typeof claim.examId === "string" ? claim.examId : undefined,
      typeof claim.tierId === "string" ? claim.tierId : undefined,
    );
    const input = attemptSchemaFor(shape).parse(body);
    const attempt = await createAttempt(user.id, input, shape);
    audit("mock.create", user.id, {
      sid: attempt.id,
      ms: Date.now() - startedAt,
      meta: {
        type: attempt.type,
        platform: attempt.platform,
        exam: resolved.examId,
        tier: resolved.tier.id,
      },
    });
    return { data: attempt, status: 201 };
  },
);
