import { defineRoute } from "@/lib/route-handler";
import { listRecentAiUsage } from "@/lib/ai/usage";

export const runtime = "nodejs";

/**
 * Recent AI activity for the signed-in account: the usage ledger's newest
 * rows — feature, model, status, tokens, error code, timestamps. Never any
 * prompt or response content; the ledger was designed so those rows cannot
 * carry it.
 */
export const GET = defineRoute({ kind: "read" }, async ({ user }) => {
  const entries = await listRecentAiUsage(user.id, 30);
  return { data: { entries } };
});
