"use client";
import { useRouter } from "next/navigation";
import { ScopeFilters } from "@/components/scope-filters";
import { useFiltersState } from "@/components/shared/use-filters-state";
import { useAnalyticsData } from "@/components/shared/use-analytics-data";
import { PerformanceView } from "./performance-view";

/**
 * Client shell for `/performance`: it owns the filter/scope state and reads the
 * analytics payload, giving the presentational `PerformanceView` the same props
 * the old workspace shell used to compute.
 *
 * Both queries are seeded by the page's server prefetch, so the first render
 * already has data and `useQuery` resolves from the hydrated cache.
 */
export function PerformanceRoute() {
  const router = useRouter();
  const filtersState = useFiltersState();
  // /performance owns the selectable scope; the dashboard always asks "all".
  const { analytics, loading, allAttempts } = useAnalyticsData({
    scope: filtersState.scope,
    filters: filtersState.filters,
  });

  return (
    <div className="mx-auto w-full max-w-[1560px]">
      <PerformanceView
        analytics={analytics}
        loading={loading}
        controls={
          <ScopeFilters
            mode="scope"
            scope={filtersState.scope}
            setScope={filtersState.setScope}
            filters={filtersState.filters}
            setFilters={filtersState.updateFilters}
            changeFilter={filtersState.changeFilter}
            platforms={platformsOf(allAttempts)}
            onReset={filtersState.clearFilters}
          />
        }
        onAdd={() => router.push("/add")}
      />
    </div>
  );
}

/** The platforms this account has actually used, for the filter row. */
function platformsOf(attempts: { platform: string }[]): string[] {
  return [...new Set(attempts.map((a) => a.platform))].sort();
}
