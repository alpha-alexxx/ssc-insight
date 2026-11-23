import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The specimen frame: a browser window around a product mockup.
 *
 * Window controls are 6px squares, not circles — round shapes are reserved
 * for status dots and the answer ring. The mockup inside is `aria-hidden`;
 * the caption beside the frame is the real content, so a screen reader hears
 * one honest sentence instead of four hundred decorative labels. Because of
 * that, no fact may live only inside a mockup.
 *
 * The frame sets the miniature's base type size; every em inside the mockups
 * scales from here.
 */
export function BrowserFrame({
  url,
  children,
  className,
}: {
  url: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[22px] bg-card shadow-[inset_0_0_0_1px_var(--border)]",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-border bg-muted/60 px-3 py-2">
        <span className="flex gap-1" aria-hidden="true">
          <span className="size-1.5 rounded-[1px] bg-muted-foreground/40" />
          <span className="size-1.5 rounded-[1px] bg-muted-foreground/40" />
          <span className="size-1.5 rounded-[1px] bg-muted-foreground/40" />
        </span>
        <span className="truncate font-mono text-[0.75em] text-muted-foreground">
          {url}
        </span>
      </div>
      <div aria-hidden="true" className="text-[12px] sm:text-[13px]">
        {children}
      </div>
    </div>
  );
}

/** Caption + the "illustrative sample data" badge that every mockup carries. */
export function MockupCaption({
  children,
  badge = "Illustrative sample data",
}: {
  children: ReactNode;
  badge?: string;
}) {
  return (
    <figcaption className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] leading-relaxed text-muted-foreground">
      <span>{children}</span>
      <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground shadow-[inset_0_0_0_1px_var(--border)]">
        {badge}
      </span>
    </figcaption>
  );
}
