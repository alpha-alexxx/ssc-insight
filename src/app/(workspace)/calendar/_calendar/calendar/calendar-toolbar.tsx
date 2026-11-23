"use client";
import { PlainIcon } from "@/components/icon";
import { SegmentedControl } from "@/components/segmented-control";
import type { CalendarLayer, EntryCounts } from "@/lib/plan/calendar-entries";
import type { CalendarMode } from "./visuals";
import { CALENDAR_MODES } from "./visuals";
import { LayerToggles } from "./layer-toggles";
import { PeriodNav } from "./period-nav";

/**
 * One control cluster per question: the period title says **what am I looking
 * at**, the arrows and date jump say **how do I move**, the mode segments say
 * **which shape**, and the layer toggles say **what is included**.
 *
 * The period title is the page's single live region. In a narrow toolbar the
 * cluster stacks into three rows (title, movement, mode + layers); at the
 * `@lg/cal-toolbar` threshold it folds to two.
 *
 * Hairline rebuild: the mode control is the Hairline SegmentedControl
 * (radiogroup semantics — one of a few), the layers keep their aria-pressed
 * pill toggles.
 */
export function CalendarToolbar({
  title,
  mode,
  selected,
  today,
  layers,
  totals,
  onStep,
  onToday,
  onSelectDate,
  onMode,
  onToggleLayer,
}: {
  title: string;
  mode: CalendarMode;
  selected: string;
  today: string;
  layers: readonly CalendarLayer[];
  totals: EntryCounts;
  onStep: (direction: 1 | -1) => void;
  onToday: () => void;
  onSelectDate: (iso: string) => void;
  onMode: (mode: CalendarMode) => void;
  onToggleLayer: (layer: CalendarLayer, next: boolean) => void;
}) {
  return (
    <div className="mt-4 @container/cal-toolbar border-b border-border pb-3">
      <div className="flex flex-col gap-2 @lg/cal-toolbar:flex-row @lg/cal-toolbar:items-center @lg/cal-toolbar:justify-between">
        <h2
          className="font-serif text-[1.125rem] font-medium leading-tight tracking-[-0.02em] text-foreground @lg/cal-toolbar:text-[1.25rem]"
          aria-live="polite"
        >
          {title}
        </h2>
        <div
          role="group"
          aria-label="Change period"
          className="flex flex-wrap items-center justify-between gap-2 @lg/cal-toolbar:justify-end"
        >
          <PeriodNav
            mode={mode}
            selected={selected}
            today={today}
            onStep={onStep}
            onToday={onToday}
            onSelect={onSelectDate}
          />
        </div>
      </div>

      {/* Mode and layers share one row at the wide toolbar threshold, but the
          pair wraps as a unit: when the toolbar is constrained by the open
          sidebar, a half-wrapped group reads as two broken controls. */}
      <div className="mt-2 flex flex-col gap-2 @lg/cal-toolbar:flex-row @lg/cal-toolbar:flex-wrap @lg/cal-toolbar:items-center @lg/cal-toolbar:justify-between">
        <SegmentedControl
          label="Calendar view"
          value={mode}
          onValueChange={(next) => onMode(next as CalendarMode)}
          block
          className="w-full @lg/cal-toolbar:w-auto @lg/cal-toolbar:flex-none"
          options={CALENDAR_MODES.map((entry) => ({
            value: entry.id,
            label: (
              <>
                <span className="max-[359px]:hidden">{entry.label}</span>
                <span className="hidden max-[359px]:inline">{entry.short}</span>
              </>
            ),
            icon: (
              <span className="max-[359px]:hidden">
                <PlainIcon name={entry.icon} size={14} />
              </span>
            ),
          }))}
        />
        <LayerToggles layers={layers} totals={totals} onToggle={onToggleLayer} />
      </div>
    </div>
  );
}
