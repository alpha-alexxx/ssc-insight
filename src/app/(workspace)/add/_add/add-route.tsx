"use client";
import { Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/toast-stack";
import { Skeleton } from "@/components/skeleton";
import { safeWorkspaceReturnTo } from "@/lib/filters-url";
import { attemptKeys } from "@/lib/queries/attempts";
import { planKeys } from "@/lib/queries/plan";
import { analyticsKeys } from "@/lib/queries/analytics";
import { useQuery } from "@tanstack/react-query";
import { useUiStore } from "@/stores/ui-store";
import { useAllAttempts } from "@/components/shared/use-analytics-data";
import { attemptDetailQueryOptions } from "@/lib/queries/attempts";
import { AddMockView } from "./add-mock-view";
import type { LogMockPayload } from "@/components/ai-chat-sheet";

/**
 * Client shell for `/add`.
 *
 * The form stays the sole save path. Two ways in:
 * - `/add?id=<attemptId>` edits a saved attempt (the detail dialog's Edit).
 * - The AI panel's reviewed draft arrives through the UI store, applied once and
 *   then consumed, so navigating away and back does not resurrect a stale draft.
 */
export function AddRoute() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl">
          <Skeleton shape="block" width="12rem" height={32} />
          <Skeleton className="mt-4" shape="block" width="100%" height={256} />
        </div>
      }
    >
      <AddRouteInner />
    </Suspense>
  );
}

function AddRouteInner() {
  const router = useRouter();
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const knownAttempts = useAllAttempts();
  // The AI draft is SUBSCRIBED to, not read once in an initializer:
  //  - the sheet's Log tab is reachable while already on /add, and pushing the
  //    current path does not remount this component, so an initializer would
  //    never see the second draft and it would leak into a later visit;
  //  - the store is cleared only in `onPrefillApplied`, i.e. after MockForm has
  //    actually merged it. Clearing earlier lost the draft irrecoverably if the
  //    form never got that far (a Suspense re-mount, a load error).
  const prefillDraft = useUiStore((s) => s.mockPrefill);
  const consumePrefill = useUiStore((s) => s.consumeMockPrefill);
  const clearPrefill = useCallback(() => {
    consumePrefill();
  }, [consumePrefill]);

  const editId = params.get("id") ?? "";
  const detail = useQuery({ ...attemptDetailQueryOptions(editId), enabled: !!editId });

  return (
    <div className="mx-auto w-full max-w-[1560px]">
      <AddMockView
        key={editId || "new"}
        attempt={detail.data}
        knownAttempts={knownAttempts}
        prefill={(prefillDraft as LogMockPayload | null) ?? null}
        onConsumePrefill={clearPrefill}
        onClose={() => router.push("/dashboard")}
        onSaved={async () => {
          // Every affected family, so the dashboard, history, charts and the
          // calendar all stop showing the pre-save state.
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: attemptKeys.all }),
            queryClient.invalidateQueries({ queryKey: analyticsKeys.all }),
            queryClient.invalidateQueries({ queryKey: planKeys.all }),
          ]);
          toast.success("Mock saved", {
            description: "Your progress is up to date.",
          });
          // `safeWorkspaceReturnTo` (not a bare startsWith("/")) — a value like
          // "//evil.example" is a protocol-relative navigation, not a path.
          const returnTo = safeWorkspaceReturnTo(params.get("returnTo"));
          router.push(returnTo ?? "/dashboard");
        }}
      />
    </div>
  );
}
