import { requireUser } from "@/lib/auth/require-user";

/**
 * Route placeholder: /plan.
 *
 * This file exists to define the address and to authenticate it. The
 * (workspace) layout still renders the daily plan on the client until this route is
 * migrated to its own Server Component; that migration replaces this file with
 * one that prefetches its own data and renders its colocated components.
 *
 * `requireUser()` is required on every page regardless: server components and
 * route handlers are the real security boundary, and the proxy's page guard is
 * only convenience.
 */
export const dynamic = "force-dynamic";

export default async function PlanPage() {
  await requireUser();
  return null;
}
