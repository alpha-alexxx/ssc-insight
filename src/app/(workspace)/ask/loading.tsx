import {
  RouteSkeleton,
  SkeletonHeader,
  SkeletonPanel,
} from "@/components/shared/route-skeleton";

/** Loading skeleton for /ask — the real geometry: a 17rem history rail
 * beside the measured transcript column with the composer below. The rail
 * mirrors the resolved page by staying hidden below lg, where history opens
 * as a drawer instead. */
export default function AskLoading() {
  return (
    <RouteSkeleton>
      <SkeletonHeader action={false} />
      <div className="grid min-h-0 gap-5 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <SkeletonPanel rows={6} className="hidden lg:block" />
        <div className="mx-auto flex w-full max-w-[44rem] flex-col gap-4">
          <SkeletonPanel rows={5} />
          <SkeletonPanel rows={2} />
        </div>
      </div>
    </RouteSkeleton>
  );
}
