"use client";

import type { ReactNode } from "react";
import { EmptyState, type EmptyStateScene } from "@/components/empty-state";

/**
 * Per-view empty states. Words do the work: each one names the situation and
 * offers the next action instead of decorating an empty box.
 *
 * Hairline rebuild: built on the Hairline EmptyState (the scene draws itself
 * in the theme's own colours); callers pass the same title/detail/actions as
 * before, plus an optional scene when the situation is a search miss.
 */
export function TasksEmptyState({
  title,
  detail,
  children,
  scene = "inbox",
}: {
  title: string;
  detail: string;
  children?: ReactNode;
  /** "search" for filter/search misses; "inbox" (default) for nothing yet. */
  scene?: EmptyStateScene;
}) {
  return (
    <EmptyState scene={scene} title={title} description={detail}>
      {children}
    </EmptyState>
  );
}
