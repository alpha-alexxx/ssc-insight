import {
  RouteSkeleton,
  SkeletonHeader,
  SkeletonPanel,
} from "@/components/shared/route-skeleton";

/** Loading skeleton for add — mirrors the route's real geometry: the steps
 * card on the left and the live-summary rail on the right (desktop). */
export default function AddLoading() {
  return (
    <RouteSkeleton>
      <SkeletonHeader action={false} />
      <div className="mx-auto flex max-w-6xl items-start gap-8">
        <div className="min-w-0 flex-1 space-y-5">
          <SkeletonPanel rows={3} />
          <SkeletonPanel rows={5} />
        </div>
        <div className="hidden w-80 shrink-0 lg:block">
          <SkeletonPanel rows={6} />
        </div>
      </div>
    </RouteSkeleton>
  );
}
