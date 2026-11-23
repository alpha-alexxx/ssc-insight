"use client";
import { Popover } from "@/components/popover";
import { DatePicker } from "@/components/date-picker";
import { Button } from "@/components/button";
import { PlainIcon } from "./icon";
import { cn } from "@/lib/utils";
import type { Filters } from "@/lib/domain";

/**
 * Date-range filter. A popover carrying two Hairline date pickers (typed or
 * picked, plain "YYYY-MM-DD" values) — same From/Through fields and a Clear
 * action as before, with outside-click dismissal, Escape handling and focus
 * return to the trigger owned by the popover.
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
    <Popover
      align="end"
      width={312}
      label="Filter by date range"
      trigger={
        <Button
          variant={active ? "secondary" : "outline"}
          size="sm"
          className={cn(
            "w-full sm:w-auto",
            active ? "" : "text-muted-foreground hover:text-foreground",
          )}
          aria-label="Filter by date range"
          icon={<PlainIcon name="calendar" size={14} />}
          trailingIcon={<PlainIcon name="chevronDown" size={12} tone="muted" />}
        >
          {active ? "Custom dates" : "All time"}
        </Button>
      }
    >
      {({ close }) => (
        <div>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Date range
          </p>
          <div className="flex flex-col gap-3">
            <DatePicker
              label="From"
              placeholder="From"
              value={from || null}
              max={to || undefined}
              onValueChange={(value) => onChange({ from: value ?? "" })}
            />
            <DatePicker
              label="Through"
              placeholder="Through"
              value={to || null}
              min={from || undefined}
              onValueChange={(value) => onChange({ to: value ?? "" })}
            />
          </div>
          <div className="mt-3 flex justify-end border-t border-border pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange({ from: "", to: "" });
                close();
              }}
            >
              Clear dates
            </Button>
          </div>
        </div>
      )}
    </Popover>
  );
}
