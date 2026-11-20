import {
  RouteSkeleton,
  SkeletonHeader,
  SkeletonMetricStrip,
  SkeletonPanel,
} from "@/components/shared/route-skeleton";

/** Loading skeleton for my-tasks — mirrors the route's real geometry. */
export default function MytasksLoading() {
  return (
    <RouteSkeleton>
      <SkeletonHeader />
      <SkeletonMetricStrip />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <SkeletonPanel rows={6} />
        <SkeletonPanel rows={4} />
      </div>
    </RouteSkeleton>
  );
}
