import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";
import { istTodayIso } from "@/lib/plan/view-model";

export const dynamic = "force-dynamic";

/**
 * `/plan` — the bare plan address redirects to today's IST date.
 *
 * A redirect rather than a rendered view: `/plan/<date>` is the real address,
 * so this keeps one canonical URL per day. It used to be a client-side
 * `history.replaceState` inside the workspace shell; the shell is gone, so the
 * redirect lives here where it costs no client JavaScript and works with a
 * hard navigation as well as a client one.
 *
 * `requireUser()` runs first: an anonymous visitor must be sent to sign in, not
 * handed a date.
 */
export default async function PlanPage() {
  await requireUser();
  redirect(`/plan/${istTodayIso()}`);
}
