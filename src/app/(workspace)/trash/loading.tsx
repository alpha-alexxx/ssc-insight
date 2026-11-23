import {
  RouteSkeleton,
  SkeletonHeader,
  SkeletonFilterRow,
  SkeletonList,
} from "@/components/shared/route-skeleton";

/** Loading skeleton for trash — mirrors the route's real geometry. */
export default function TrashLoading() {
  return (
    <RouteSkeleton>
      <SkeletonHeader action={false} />
      <SkeletonFilterRow />
      <SkeletonList rows={6} />
    </RouteSkeleton>
  );
}
