import { defineRoute } from "@/lib/route-handler";
import { loadTrashPage } from "@/lib/services/trash";

export const runtime = "nodejs";

/**
 * The read lives in src/lib/services/trash.ts so this handler and the /trash
 * Server Component page share one implementation — parsing, ownership scoping
 * and the expiry cutoff can never disagree between the two paths.
 */
export const GET = defineRoute({ kind: "read" }, async ({ request, user }) => ({
  data: await loadTrashPage(
    user.id,
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  ),
}));
