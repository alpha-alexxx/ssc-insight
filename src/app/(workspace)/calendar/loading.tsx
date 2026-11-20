import {
  RouteSkeleton,
  SkeletonHeader,
  SkeletonMetricStrip,
  SkeletonPanel,
} from "@/components/shared/route-skeleton";

/** Loading skeleton for calendar — mirrors the route's real geometry. */
export default function CalendarLoading() {
  return (
    <RouteSkeleton>
      <SkeletonHeader />
      <SkeletonMetricStrip />
      <SkeletonPanel className="h-[520px]" />
    </RouteSkeleton>
  );
}
