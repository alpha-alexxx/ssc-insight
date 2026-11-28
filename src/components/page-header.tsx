import { cn } from "@/lib/utils";

/**
 * Compact workspace page header. One title, one line of context, primary
 * actions — deliberately smaller than the landing-page display typography.
 */
export function PageHeader({
  title,
  description,
  meta,
  actions,
  icon,
  density = "default",
  className,
}: {
  title: string;
  description?: React.ReactNode;
  /** Optional contextual line (date, plan day, result count). */
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  /** Optional tile rendered before the title block. */
  icon?: React.ReactNode;
  /** Compact is opt-in for task surfaces such as the full-height /ask route. */
  density?: "default" | "compact";
  className?: string;
}) {
  const compact = density === "compact";
  return (
    <header
      className={cn(
        "flex flex-wrap justify-between border-b border-border",
        compact
          ? "flex-nowrap items-center gap-2 pb-2"
          : "mb-5 items-start gap-4 pb-4",
        className,
      )}
    >
      <div className={cn("flex min-w-0 items-start", compact ? "gap-2" : "gap-3")}>
        {icon && <div className="shrink-0 pt-0.5">{icon}</div>}
        <div className="min-w-0">
          <h1
            className={cn(
              "font-semibold tracking-tight text-foreground",
              compact ? "truncate text-[1.1875rem] leading-7" : "text-xl",
            )}
          >
            {title}
          </h1>
          {description && (
            <p
              className={cn(
                "max-w-3xl leading-relaxed text-muted-foreground",
                compact ? "hidden text-xs sm:mt-0.5 sm:block" : "mt-1.5 text-xs sm:text-[13px]",
              )}
            >
              {description}
            </p>
          )}
          {meta && (
            <p
              className={cn(
                "flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground",
                compact ? "mt-0.5 leading-4" : "mt-1.5",
              )}
            >
              {meta}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div
          className={cn(
            "flex items-center sm:justify-end",
            compact ? "shrink-0 gap-1" : "flex-wrap gap-2",
          )}
        >
          {actions}
        </div>
      )}
    </header>
  );
}
