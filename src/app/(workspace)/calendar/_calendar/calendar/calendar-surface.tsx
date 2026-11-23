"use client";
import type { ComponentProps, ReactNode } from "react";

/**
 * Panel chrome shared by the month, week and agenda surfaces: one context line
 * and an optional action slot.
 *
 * Deliberately **no title**: the toolbar's period title is the page's single
 * live region, and repeating it inside the panel made every screen say the
 * period twice. The head here answers "what shape is this", not "where am I".
 * `flush` removes the body's horizontal padding for surfaces whose rows carry
 * their own gutters.
 *
 * Hairline rebuild: the panel is the token-composed card
 * (rounded-2xl bg-card + inset hairline border).
 */
export function CalendarSurface({
  meta,
  children,
  actions,
  touchHandlers,
  flush,
}: {
  meta?: ReactNode;
  children: ReactNode;
  /** A single secondary action, aligned with the context line. */
  actions?: ReactNode;
  /** Touch handlers for swipe period navigation on the surface body. */
  touchHandlers?: Pick<ComponentProps<"div">, "onTouchStart" | "onTouchEnd">;
  /** Drop the body's horizontal padding so row padding can own the gutters. */
  flush?: boolean;
}) {
  return (
    <section className="rounded-2xl bg-card text-card-foreground shadow-[inset_0_0_0_1px_var(--border)]">
      {(meta || actions) && (
        <div className="flex-row flex items-center justify-between gap-3 border-b border-border px-4 pb-2.5 pt-3 sm:px-6">
          <div className="min-w-0">
            {meta && <p className="text-[13px] text-muted-foreground">{meta}</p>}
          </div>
          {actions}
        </div>
      )}
      <div
        className={flush ? "pb-4 pt-3" : "px-4 pb-4 pt-3 sm:px-6"}
        {...touchHandlers}
      >
        {children}
      </div>
    </section>
  );
}
