"use client";
import { PlainIcon } from "@/components/icon";
import { cn } from "@/lib/utils";
import {
  CALENDAR_LAYERS,
  type CalendarLayer,
  type EntryCounts,
} from "@/lib/plan/calendar-entries";
import { LAYER_META } from "./visuals";

/**
 * The three layer toggles.
 *
 * Deliberately **inline**, not a popover or dropdown: every overlay in this app
 * portals at z-50, so a popover opened beside a drawer would fight the drawer's
 * focus trap. The toggles sit in the toolbar and are always reachable.
 *
 * The last visible layer cannot be turned off — an empty calendar reads as a
 * broken calendar, and there is no "show all" recovery gesture that a
 * first-time user would find.
 *
 * Hairline rebuild: the toggles are token-composed pill buttons that keep the
 * aria-pressed semantics (a multi-select, not a radiogroup).
 */
export function LayerToggles({
  layers,
  totals,
  onToggle,
}: {
  layers: readonly CalendarLayer[];
  /** Counts across the visible window, so each toggle says what it hides. */
  totals: EntryCounts;
  onToggle: (layer: CalendarLayer, next: boolean) => void;
}) {
  const on = new Set(layers);

  const countFor = (layer: CalendarLayer): number =>
    layer === "plan"
      ? totals.plan.total
      : layer === "tasks"
        ? totals.tasks.total
        : totals.mocks;

  return (
    <div
      role="group"
      aria-label="Calendar layers"
      className="grid w-full grid-cols-3 gap-1 @lg/cal-toolbar:inline-flex @lg/cal-toolbar:w-auto @lg/cal-toolbar:flex-none [&>button]:min-w-0 [&>button]:flex-1 @lg/cal-toolbar:[&>button]:flex-none"
    >
      {CALENDAR_LAYERS.map((layer) => {
        const active = on.has(layer);
        const last = active && layers.length === 1;
        const count = countFor(layer);
        return (
          <button
            key={layer}
            type="button"
            aria-pressed={active}
            disabled={last}
            title={last ? "Keep at least one layer visible" : undefined}
            onClick={() => onToggle(layer, !active)}
            className={cn(
              "inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[12px] font-medium transition-colors duration-200",
              active
                ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--primary)_35%,transparent)]"
                : "text-muted-foreground shadow-[inset_0_0_0_1px_var(--border)] hover:bg-accent hover:text-foreground",
              last && "cursor-not-allowed opacity-70",
            )}
          >
            <PlainIcon
              name={LAYER_META[layer].icon}
              size={13}
              className={cn("shrink-0", !active && "text-muted-foreground")}
            />
            <span className="truncate">{LAYER_META[layer].label}</span>
            {count > 0 && (
              <span className="tabular-nums text-[11px] text-muted-foreground">
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
