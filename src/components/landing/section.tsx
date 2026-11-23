import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The landing page's editorial grammar, composed from Hairline tokens.
 *
 * Every section after the hero opens the same way: a small-caps eyebrow, a
 * serif headline, one hairline, and an optional lede. The variety on this page
 * comes from the composition beneath the head — a layered hero, a tabbed
 * specimen, a fan diagram, a plan grid, a comparison ledger — never from
 * restyling the head.
 *
 * These are server components on purpose: nothing here needs interactivity,
 * so nothing here ships JavaScript.
 */

/** Small-caps eyebrow label, shared by every section head. */
export const EYEBROW =
  "text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground";

export function Section({
  id,
  number,
  children,
  className,
  bordered = true,
}: {
  id?: string;
  /** The printed section number, e.g. "03". Renders the margin spine. */
  number?: string;
  children: ReactNode;
  className?: string;
  /** A hairline closing the section, matching the head's rule. */
  bordered?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(bordered && "border-b border-border", className)}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        {number ? (
          <div className="grid gap-4 pt-2 sm:grid-cols-[2.75rem_minmax(0,1fr)] sm:gap-8">
            <p
              aria-hidden="true"
              className="hidden pt-1 text-[11px] font-semibold tabular-nums tracking-[0.14em] text-primary sm:block"
            >
              {number}
            </p>
            <div className="min-w-0">{children}</div>
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

export function SectionHead({
  eyebrow,
  title,
  lede,
  align = "left",
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <header
      className={cn(
        "border-b border-border pb-8",
        align === "center" && "text-center",
        className,
      )}
    >
      <p className={EYEBROW}>{eyebrow}</p>
      <h2 className="mt-3 max-w-3xl text-balance font-serif text-[clamp(1.75rem,3.4vw,2.75rem)] font-[450] leading-[1.1] tracking-[-0.02em] text-foreground">
        {title}
      </h2>
      {lede ? (
        <p
          className={cn(
            "mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground",
            align === "center" && "mx-auto",
          )}
        >
          {lede}
        </p>
      ) : null}
    </header>
  );
}

/**
 * A soft full-bleed band — the successor of the old inverted "plate". The
 * token set has no inversion layer, so the plate is a muted band and the
 * content inside keeps the standard semantic tokens.
 */
export function Plate({
  id,
  label,
  children,
  className,
}: {
  id?: string;
  /** The plate's dateline, e.g. "Plate I · The workspace". */
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      id={id}
      className={cn("relative border-y border-border bg-muted", className)}
    >
      <div className="relative mx-auto max-w-6xl px-5 pt-16 sm:px-8 sm:pt-20">
        {label ? (
          <p className={cn(EYEBROW, "mb-6 flex items-center gap-3")}>
            <span aria-hidden="true" className="h-px w-8 shrink-0 bg-primary" />
            {label}
          </p>
        ) : null}
        {children}
      </div>
    </div>
  );
}
