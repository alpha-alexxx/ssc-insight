import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PlainIcon, type IconName } from "@/components/icon";

/**
 * Settings panel card — the Card pattern from MIGRATION.md composed from
 * tokens (Hairline ships no generic Card): rounded-2xl card surface with an
 * inset hairline border, a header row with a static icon tile, title and
 * description, and an optional trailing action slot.
 *
 * Same geometry as the already-migrated appearance-panel so the eight
 * settings groups read as one family.
 */
export function PanelCard({
  icon,
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
  headingId,
}: {
  icon?: IconName;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  headingId?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl bg-card text-card-foreground shadow-[inset_0_0_0_1px_var(--border)]",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4 sm:p-6">
        <div className="flex min-w-0 items-center gap-3">
          {icon && (
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
              <PlainIcon name={icon} size={18} tone="primary" />
            </span>
          )}
          <div className="min-w-0">
            <h2
              id={headingId}
              className="text-base font-semibold text-foreground"
            >
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
        {action && (
          <div className="flex shrink-0 items-center gap-2">{action}</div>
        )}
      </div>
      <div className={cn("p-4 pt-3 sm:p-6 sm:pt-3", bodyClassName)}>
        {children}
      </div>
    </section>
  );
}
