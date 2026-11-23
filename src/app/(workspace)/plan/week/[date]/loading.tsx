import {
  RouteSkeleton,
  SkeletonHeader,
  SkeletonPanel,
} from "@/components/shared/route-skeleton";

/** Loading skeleton for plan/week/[date] — mirrors the route's real geometry. */
export default function PlanWeekLoading() {
  return (
    <RouteSkeleton>
      <SkeletonHeader />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
        {Array.from({ length: 7 }, (_, i) => (
          <SkeletonPanel key={i} rows={4} />
        ))}
      </div>
    </RouteSkeleton>
  );
}
