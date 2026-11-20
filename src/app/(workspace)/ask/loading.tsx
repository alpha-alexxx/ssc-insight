import {
  RouteSkeleton,
  SkeletonHeader,
  SkeletonPanel,
} from "@/components/shared/route-skeleton";

/** Loading skeleton for /ask — rail beside the transcript, composer below. */
export default function AskLoading() {
  return (
    <RouteSkeleton>
      <SkeletonHeader action={false} />
      <div className="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <SkeletonPanel rows={6} />
        <div className="flex flex-col gap-4">
          <SkeletonPanel rows={5} />
          <SkeletonPanel rows={2} />
        </div>
      </div>
    </RouteSkeleton>
  );
}
