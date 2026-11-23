"use client";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
} from "@/components/ui/popover";
import { PlainIcon } from "./icon";
import { Button } from "./ui/button";
import type { Filters } from "@/lib/domain";

/**
 * Date-range filter (Phase 11). Replaces the bare <details> dropdown:
 * Radix Popover gives outside-click dismissal, Escape handling, focus
 * return to the trigger, and an animated entrance — with the same
 * From/Through fields and a Clear action.
 */
export function DateRangeFilter({
  from,
  to,
  onChange,
}: {
  from: string;
  to: string;
  onChange: (patch: Partial<Pick<Filters, "from" | "to">>) => void;
}) {
  const active = !!(from || to);
  return (
    <Popover>
      <PopoverTrigger
        className={`inline-flex min-h-[var(--control-height)] items-center gap-1.5 whitespace-nowrap rounded-control py-[var(--control-pad-y)] pl-3 pr-2.5 text-xs transition-colors sm:pr-3 ${
          active
            ? "border border-ink bg-soft text-ink"
            : "border border-rule bg-paper text-muted hover:bg-soft"
        }`}
        aria-label="Filter by date range"
      >
        <PlainIcon name="calendar" size={14} className="icon-muted" />
        {active ? "Custom dates" : "All time"}
        <PlainIcon name="chevronRight" size={12} className="rotate-90" />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="z-30 p-4 space-y-3"
      >
        <p className="section-label">Date range</p>
        <label>
          From
          <input
            type="date"
            value={from}
            onChange={(e) => onChange({ from: e.target.value })}
          />
        </label>
        <label>
          Through
          <input
            type="date"
            value={to}
            onChange={(e) => onChange({ to: e.target.value })}
          />
        </label>
        <div className="flex justify-end gap-2 pt-1">
          <PopoverClose asChild>
            <Button variant="ghost" size="sm" onClick={() => onChange({ from: "", to: "" })}>
              Clear dates
            </Button>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
}
