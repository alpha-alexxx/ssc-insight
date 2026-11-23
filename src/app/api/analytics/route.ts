import { filtersFrom } from "@/lib/repository";
import { loadExamContext } from "@/lib/exam-settings";
import { defineRoute } from "@/lib/route-handler";
import { loadAnalytics, parseScope } from "@/lib/services/analytics";

export const runtime = "nodejs";

/**
 * The read lives in src/lib/services/analytics.ts so this handler and the
 * /dashboard and /performance Server Component pages share one implementation:
 * the scope projection and the target's paper can never disagree.
 */
export const GET = defineRoute({ kind: "read" }, async ({ request, user }) => {
  const url = new URL(request.url);
  const scope = parseScope(url.searchParams.get("view"));
  const filters = filtersFrom(request.url);
  const ctx = await loadExamContext(user.id);
  return {
    data: await loadAnalytics(user.id, scope, filters, ctx),
    cache: { maxAgeSec: 0, swrSec: 5 },
  };
});
