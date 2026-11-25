import { requireUser } from "@/lib/auth/require-user";
import { AskRoute } from "./_ask/ask-route";

export const dynamic = "force-dynamic";

/**
 * `/ask` — the full-page conversation with the study coach.
 *
 * The transcript is client state owned by the workspace AI provider, so this
 * page needs no server read of its own: usage arrives with the status query
 * the provider already holds, and the read ledger that used to prefetch here
 * has been removed in favour of the usage panel in the header.
 */
export default async function AskPage() {
  const { name } = await requireUser();
  return <AskRoute firstName={name ? name.split(/\s+/)[0] : undefined} />;
}
