import {
  RouteSkeleton,
  SkeletonHeader,
  SkeletonPanel,
  SkeletonFilterRow,
} from "@/components/shared/route-skeleton";

/** Loading skeleton for performance — mirrors the route's real geometry. */
export default function PerformanceLoading() {
  return (
    <RouteSkeleton>
      <SkeletonHeader />
      <SkeletonFilterRow />
      <div className="grid gap-5 lg:grid-cols-2">
        <SkeletonPanel className="h-72" />
        <SkeletonPanel className="h-72" />
      </div>
      <SkeletonPanel className="mt-5" rows={4} />
    </RouteSkeleton>
  );
}
