import {
  RouteSkeleton,
  SkeletonHeader,
  SkeletonPanel,
} from "@/components/shared/route-skeleton";

/** Loading skeleton for plan/[date] — mirrors the route's real geometry. */
export default function PlanDayLoading() {
  return (
    <RouteSkeleton>
      <SkeletonHeader />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-5">
          <SkeletonPanel rows={5} />
          <SkeletonPanel rows={4} />
        </div>
        <SkeletonPanel rows={6} />
      </div>
    </RouteSkeleton>
  );
}
