import {
  RouteSkeleton,
  SkeletonHeader,
  SkeletonMetricStrip,
  SkeletonPanel,
} from "@/components/shared/route-skeleton";

/** Loading skeleton for dashboard — mirrors the route's real geometry. */
export default function DashboardLoading() {
  return (
    <RouteSkeleton>
      <SkeletonHeader />
      <SkeletonMetricStrip />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <SkeletonPanel rows={4} />
          <SkeletonPanel className="h-72" />
        </div>
        <div className="space-y-5">
          <SkeletonPanel rows={3} />
          <SkeletonPanel className="h-56" />
        </div>
      </div>
    </RouteSkeleton>
  );
}
