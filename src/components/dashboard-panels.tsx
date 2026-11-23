"use client";
import type { ReactNode } from "react";
import { Icon, PlainIcon, type IconName } from "./icon";
import { cn } from "@/lib/utils";

export function EmptyChart({
  children = "Your progress will appear after your first mock.",
}: {
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <span
        className="mb-3 grid size-11 place-items-center rounded-2xl bg-muted text-muted-foreground"
        aria-hidden="true"
      >
        <Icon name="activity" size={20} tone="muted" />
      </span>
      <p className="max-w-sm text-[13px] leading-relaxed text-muted-foreground">
        {children}
      </p>
    </div>
  );
}

/**
 * A workspace panel: one rounded card with a heading row (optional icon tile,
 * eyebrow, title, description) and an optional action. The dashboard, the
 * history list and several other workspace routes share it so their headers
 * cannot drift apart.
 */
export function Panel({
  title,
  description,
  action,
  icon,
  children,
  className = "",
  dense = false,
  eyebrow,
  descriptionClassName,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  /** Optional icon tile shown before the title. */
  icon?: IconName;
  children: ReactNode;
  className?: string;
  /** Compact dashboard header/body spacing. */
  dense?: boolean;
  /** Small-caps label above the title (the mockup's "THIS WEEK"). */
  eyebrow?: string;
  /** Extra classes for the description line (e.g. hiding it at one width). */
  descriptionClassName?: string;
}) {
  return (
    <section
      className={cn(
        "min-w-0 rounded-2xl bg-card text-card-foreground shadow-[inset_0_0_0_1px_var(--border)]",
        className,
      )}
    >
      <div
        className={cn(
          "flex flex-wrap items-start justify-between gap-3",
          dense ? "px-4 pb-2.5 pt-3.5" : "px-4 pb-3 pt-4 sm:px-6 sm:pb-3 sm:pt-5",
        )}
      >
        <div className="flex min-w-0 items-start gap-3">
          {icon && (
            <span
              className={cn(
                "grid shrink-0 place-items-center rounded-xl bg-primary/10 text-primary",
                dense ? "size-8" : "size-9",
              )}
              aria-hidden="true"
            >
              <PlainIcon name={icon} size={dense ? 16 : 18} tone="primary" />
            </span>
          )}
          <div className="min-w-0">
            {eyebrow && (
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                {eyebrow}
              </p>
            )}
            <h2
              className={cn(
                "font-semibold tracking-[-0.01em] text-foreground",
                dense
                  ? "text-[15px] leading-snug"
                  : cn("text-base leading-snug", eyebrow && "mt-0.5"),
              )}
            >
              {title}
            </h2>
            {description && (
              <p
                className={cn(
                  "text-[13px] leading-relaxed text-muted-foreground",
                  dense ? "mt-1 text-[12px]" : "mt-1",
                  descriptionClassName,
                )}
              >
                {description}
              </p>
            )}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </section>
  );
}
