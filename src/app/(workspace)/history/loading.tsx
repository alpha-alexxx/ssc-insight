import {
  RouteSkeleton,
  SkeletonHeader,
  SkeletonFilterRow,
  SkeletonList,
} from "@/components/shared/route-skeleton";

/** Loading skeleton for history — mirrors the route's real geometry. */
export default function HistoryLoading() {
  return (
    <RouteSkeleton>
      <SkeletonHeader />
      <SkeletonFilterRow />
      <SkeletonList rows={10} />
    </RouteSkeleton>
  );
}
