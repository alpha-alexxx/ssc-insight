import {
  RouteSkeleton,
  SkeletonHeader,
  SkeletonPanel,
} from "@/components/shared/route-skeleton";

/** Loading skeleton for add — mirrors the route's real geometry. */
export default function AddLoading() {
  return (
    <RouteSkeleton>
      <SkeletonHeader action={false} />
      <div className="mx-auto max-w-4xl space-y-5">
        <SkeletonPanel rows={3} />
        <SkeletonPanel rows={5} />
        <SkeletonPanel rows={4} />
      </div>
    </RouteSkeleton>
  );
}
