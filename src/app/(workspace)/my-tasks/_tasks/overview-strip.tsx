"use client";
import { PlainIcon, type IconName } from "@/components/icon";
import { ProgressRule } from "@/components/shared/plan/plan-shared";
import type { TaskViewTab } from "./use-tasks-view-state";

/**
 * The page's overview: one divided metric strip in the dashboard idiom
 * (label, serif figure, quiet hint, 2px rule). Each cell is a button that
 * opens the matching view — the strip is the summary and the navigation.
 *
 * Hairline rebuild: the cells are token-composed cards
 * (rounded-2xl bg-card + inset hairline border); the 2px rule is the shared
 * `ProgressRule`.
 */
export function OverviewStrip({
  counts,
  onOpen,
}: {
  counts: {
    overdue: number;
    today: number;
    upcoming: number;
    completed: number;
    all: number;
  };
  onOpen: (tab: TaskViewTab) => void;
}) {
  const done = counts.completed;
  const total = counts.all;
  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      role="group"
      aria-label="Task overview"
    >
      <MetricCell
        icon="warning"
        label="Overdue"
        value={String(counts.overdue)}
        hint="Past due — act or reschedule"
        pct={null}
        tone={counts.overdue > 0 ? "danger" : undefined}
        onClick={() => onOpen("myday")}
      />
      <MetricCell
        icon="target"
        label="Due today"
        value={String(counts.today)}
        hint="Scheduled for today"
        pct={null}
        onClick={() => onOpen("myday")}
      />
      <MetricCell
        icon="calendar"
        label="Upcoming"
        value={String(counts.upcoming)}
        hint="Scheduled after today"
        pct={null}
        onClick={() => onOpen("upcoming")}
      />
      <MetricCell
        icon="success"
        label="Done"
        value={String(done)}
        hint={total ? `${Math.round((done / total) * 100)}% of all tasks` : "Nothing completed yet"}
        pct={total ? done / total : null}
        onClick={() => onOpen("completed")}
      />
    </div>
  );
}

/** One cell of the strip: a label, one serif figure, one quiet hint line, and
 * a 2px progress rule. A cell is a button when it opens a view — static
 * cells suppress the chevron and the hover fill. */
function MetricCell({
  label,
  icon,
  value,
  hint,
  pct,
  tone,
  onClick,
}: {
  label: string;
  icon: IconName;
  value: string;
  hint: string;
  /** 0–1 progress for the rule; null renders a decorative empty rule. */
  pct: number | null;
  /** Semantic tone for the figure itself (danger when work is overdue). */
  tone?: "danger";
  onClick?: () => void;
}) {
  const inner = (
    <>
      <span className="flex items-center gap-1.5">
        <PlainIcon name={icon} size={13} className="shrink-0 text-primary" />
        <span className="truncate text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </span>
        {onClick && (
          <PlainIcon
            name="chevronRight"
            size={13}
            className="ml-auto shrink-0 text-muted-foreground"
          />
        )}
      </span>
      <span className="mt-1 block font-serif text-xl tabular-nums leading-none text-foreground">
        <span className={tone === "danger" ? "text-destructive" : undefined}>
          {value}
        </span>
      </span>
      <span className="mt-1 block truncate text-[12px] text-muted-foreground">
        {hint}
      </span>
      <span className="mt-2 block" aria-hidden={pct == null ? true : undefined}>
        {pct != null ? (
          <ProgressRule
            done={Math.round(pct * 100)}
            total={100}
            label={label}
            className="w-full"
          />
        ) : (
          <span className="block h-0.5 w-full overflow-hidden rounded-full bg-border">
            <span style={{ width: 0 }} />
          </span>
        )}
      </span>
    </>
  );
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="rounded-2xl bg-card p-3 text-left shadow-[inset_0_0_0_1px_var(--border)] transition-colors hover:bg-accent"
        aria-label={`${label}: ${value}. ${hint}`}
      >
        {inner}
      </button>
    );
  }
  return (
    <div className="cursor-default rounded-2xl bg-card p-3 shadow-[inset_0_0_0_1px_var(--border)]">
      {inner}
    </div>
  );
}
