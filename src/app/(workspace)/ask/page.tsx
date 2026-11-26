import type { Viewport } from "next";
import { requireUser } from "@/lib/auth/require-user";
import { AskRoute } from "./_ask/ask-route";

export const dynamic = "force-dynamic";

/**
 * The Android keyboard resizes the layout viewport instead of only the visual
 * one, which used to slide this whole fixed-height page upward under the
 * composer. "resizes-content" keeps the composer pinned to the visible bottom:
 * dvh shrinks, the page itself never scrolls. iOS Safari already behaves this
 * way through dvh alone.
 */
export const viewport: Viewport = {
  interactiveWidget: "resizes-content",
};

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
