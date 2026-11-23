"use client";
import { PlainIcon } from "@/components/icon";
import { Button } from "@/components/button";
import { DatePicker } from "@/components/date-picker";
import { Tooltip } from "@/components/tooltip";
import { AGENDA_WINDOW, type CalendarMode } from "./visuals";

const UNIT: Record<CalendarMode, string> = {
  month: "month",
  week: "week",
  day: "day",
  agenda: `${AGENDA_WINDOW / 7} weeks`,
};

/** Agenda steps its window at a time, like the week surface steps a week. */
export function stepSize(mode: CalendarMode): number {
  if (mode === "agenda") return AGENDA_WINDOW;
  return mode === "week" ? 7 : 1;
}

/**
 * Period stepping: two arrows, a return-to-today chip, and a date jump.
 *
 * The arrows are **never disabled**. The calendar now shows personal tasks and
 * logged results, so every date in the addressable range is legitimate — the
 * old plan-edge lock made personal work outside 26 Oct – 14 Dec unreachable.
 *
 * Hairline rebuild: the date jump is the Hairline DatePicker — typed or
 * picked, plain YYYY-MM-DD values. It sits inline beside the arrows and must
 * stay outside any drawer (overlays share z-50, while the picker's month panel
 * portals above them on its own layer), which is why it lives in the toolbar.
 */
export function PeriodNav({
  mode,
  selected,
  today,
  onStep,
  onToday,
  onSelect,
}: {
  mode: CalendarMode;
  selected: string;
  today: string;
  onStep: (direction: 1 | -1) => void;
  onToday: () => void;
  onSelect: (iso: string) => void;
}) {
  const unit = UNIT[mode];
  return (
    <>
      <div className="flex items-center gap-1">
        <Tooltip content={`Previous ${unit}`}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Previous ${unit}`}
            onClick={() => onStep(-1)}
          >
            <PlainIcon name="arrowLeft" size={14} />
          </Button>
        </Tooltip>
        <Tooltip content={`Next ${unit}`}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Next ${unit}`}
            onClick={() => onStep(1)}
          >
            <PlainIcon name="arrowRight" size={14} />
          </Button>
        </Tooltip>
      </div>

      <span className="flex flex-wrap items-center gap-2">
        {selected !== today && (
          <Button type="button" variant="secondary" size="sm" onClick={onToday}>
            Today
          </Button>
        )}
        <span className="w-44 shrink-0 sm:w-56">
          <DatePicker
            label={<span className="sr-only">Jump to a date</span>}
            hint="Any date works, including outside the study plan."
            value={selected}
            onValueChange={(value) => {
              if (value) onSelect(value);
            }}
          />
        </span>
      </span>
    </>
  );
}
