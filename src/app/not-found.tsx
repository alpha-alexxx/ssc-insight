import type { Metadata } from "next";
import { NotFoundClient } from "./_errors/not-found-client";

export const metadata: Metadata = {
  title: "Page not found · SSC Insight",
  robots: { index: false, follow: false },
};

/**
 * 404 for unknown page routes (unknown /api/* paths answer with the JSON
 * envelope via the catch-all route handler instead). Hairline's NotFound
 * block: a real search over /api/search plus the app's own popular pages,
 * so a lost reader can land somewhere useful instead of a dead end.
 */
export default function NotFound() {
  return <NotFoundClient />;
}
