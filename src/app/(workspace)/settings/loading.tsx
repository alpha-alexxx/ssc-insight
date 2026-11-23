import {
  RouteSkeleton,
  SkeletonHeader,
  SkeletonPanel,
} from "@/components/shared/route-skeleton";

/** Loading skeleton for settings — mirrors the route's real geometry. */
export default function SettingsLoading() {
  return (
    <RouteSkeleton>
      <SkeletonHeader action={false} />
      <div className="grid gap-5 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <SkeletonPanel rows={7} />
        <SkeletonPanel rows={6} />
      </div>
    </RouteSkeleton>
  );
}
