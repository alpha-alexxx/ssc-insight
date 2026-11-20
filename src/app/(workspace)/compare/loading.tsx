import {
  RouteSkeleton,
  SkeletonHeader,
  SkeletonPanel,
  SkeletonFilterRow,
} from "@/components/shared/route-skeleton";

/** Loading skeleton for compare — mirrors the route's real geometry. */
export default function CompareLoading() {
  return (
    <RouteSkeleton>
      <SkeletonHeader />
      <SkeletonFilterRow />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <SkeletonPanel key={i} rows={5} />
        ))}
      </div>
    </RouteSkeleton>
  );
}
