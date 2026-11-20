"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useUiStore } from "@/stores/ui-store";
import { useAllAttempts } from "@/components/shared/use-analytics-data";
import { attemptDetailQueryOptions } from "@/lib/queries/attempts";
import { Skeleton } from "@/components/ui/skeleton";
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
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-4 h-64 w-full" />
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
  const knownAttempts = useAllAttempts();
  // The one-shot AI draft is read ONCE, during the first render, and cleared
  // from the store in a state initializer — not in an effect. An effect would
  // render the empty form first and then swap the draft in (a visible flash),
  // and it would re-fire on every store change. `useState` with a lazy
  // initializer is the only way to read a value once without a render pass.
  const [prefill, setPrefill] = useState<LogMockPayload | null>(() => {
    const draft = useUiStore.getState().mockPrefill;
    if (draft) useUiStore.getState().consumeMockPrefill();
    // The store's structural type is assignable to LogMockPayload; the cast is
    // the one boundary where the store's looser declaration meets the form.
    return (draft as LogMockPayload | null) ?? null;
  });

  const editId = params.get("id") ?? "";
  const detail = useQuery({ ...attemptDetailQueryOptions(editId), enabled: !!editId });

  return (
    <div className="mx-auto w-full max-w-[1560px] px-3 py-4 sm:px-5 md:py-5">
      <AddMockView
        key={editId || "new"}
        attempt={detail.data}
        knownAttempts={knownAttempts}
        prefill={prefill}
        onConsumePrefill={() => setPrefill(null)}
        onClose={() => router.push("/dashboard")}
        onSaved={() => {
          const returnTo = params.get("returnTo");
          router.push(returnTo && returnTo.startsWith("/") ? returnTo : "/dashboard");
        }}
      />
    </div>
  );
}
