import { Skeleton } from "@/components/skeleton";

/** Mirrors the split auth-card geometry: the form column on the left, the
 *  tone-inverted plate block on md+ — never a bare spinner. */
export default function AuthPageLoading() {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-5 py-5 sm:px-8">
          <Skeleton shape="line" width={112} height={20} />
          <Skeleton shape="circle" width={28} height={28} />
        </header>
        <main className="flex flex-1 items-center justify-center px-5 pb-16 sm:px-8">
          <div className="w-full max-w-sm space-y-4">
            <Skeleton shape="block" width={176} height={32} />
            <Skeleton shape="line" width={240} />
            <Skeleton shape="block" width="100%" height={44} />
            <Skeleton shape="line" width={112} />
            <div className="space-y-3 pt-2">
              <Skeleton shape="block" width="100%" height={40} />
              <Skeleton shape="block" width="100%" height={40} />
              <Skeleton shape="block" width="100%" height={44} />
            </div>
          </div>
        </main>
      </div>
      <div
        aria-hidden="true"
        className="hidden items-center justify-center bg-primary p-10 md:flex xl:p-14"
      >
        <div className="aspect-[4/5] w-full max-w-[26rem] animate-pulse rounded-2xl bg-primary-foreground/10" />
      </div>
    </div>
  );
}
