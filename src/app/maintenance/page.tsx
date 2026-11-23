import type { Metadata } from "next";
import { Alert } from "@/components/alert";
import { Badge } from "@/components/badge";
import { Spinner } from "@/components/spinner";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Brief maintenance · SSC Insight",
  robots: { index: false, follow: false },
};

/**
 * Maintenance interstitial. Shown by the proxy (307 redirect) whenever
 * MAINTENANCE_MODE is on for any page outside the maintenance bypass list.
 * Token-styled so it renders under any palette (light or dark) with zero
 * layout thrash, and free of data reads so it paints even while the
 * database is offline.
 *
 * The Hairline feedback trio (alert + badge + spinner) are client islands;
 * the page itself stays a server component.
 */
export default async function MaintenancePage({
  searchParams,
}: {
  searchParams: Promise<{ retryAfter?: string }>;
}) {
  const { retryAfter } = await searchParams;
  const seconds = Math.max(0, Number(retryAfter ?? "") || 3600);
  const minutes = Math.round(seconds / 60);
  const backIn =
    seconds >= 90
      ? `about ${minutes} minutes`
      : "less than a minute";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-16 text-foreground">
      <div className="w-full max-w-lg rounded-2xl bg-card p-8 text-card-foreground shadow-[inset_0_0_0_1px_var(--border)] sm:p-10">
        <div className="flex items-center gap-4">
          <Spinner size="md" label="Maintenance in progress" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Scheduled maintenance
            </p>
            <h1 className="text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-2xl">
              We&apos;re polishing the scoreboard
            </h1>
          </div>
        </div>

        <div className="mt-5">
          <Alert tone="info" title="SSC Insight is briefly offline while we run upkeep on the service.">
            Your mocks, subject results and settings are untouched and safe —
            nothing is being written or changed during this window.
          </Alert>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          This page will return automatically. The work is expected to finish
          in {backIn}; you can head back and retry whenever you like.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </Link>
          <Badge tone="warning" dot="pulse">
            {`Usually back within ${backIn}`}
          </Badge>
        </div>
      </div>
    </main>
  );
}
