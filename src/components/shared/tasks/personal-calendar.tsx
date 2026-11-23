"use client";

import { Button } from "@/components/button";
import { PlainIcon } from "@/components/icon";
import { useTodoCalendar } from "@/components/use-todos-data";
import { addIsoDays, istTodayIso } from "@/lib/plan/view-model";
import { monthDate, longDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function personalMonthRange(date: string) {
  const first = date.slice(0, 7) + "-01";
  const weekday = new Date(first + "T12:00:00Z").getUTCDay();
  const from = addIsoDays(first, -(weekday + 6) % 7);
  return { from, to: addIsoDays(from, 41) };
}

/**
 * The personal-task month calendar. Hairline rebuild: cells are token-
 * composed (the selected day inverts with bg-foreground, today carries the
 * primary), the month stepper uses Hairline buttons and static icons.
 */
export function PersonalCalendar({
  selected,
  onSelect,
  onAdd,
}: {
  selected: string;
  onSelect: (date: string) => void;
  onAdd: () => void;
}) {
  const [month, setMonth] = useState(selected.slice(0, 7) + "-01");
  const { from, to } = personalMonthRange(month);
  const { data, error, loading, refresh } = useTodoCalendar<{
    days: Record<string, { pending: number; completed: number }>;
  }>({ from, to });
  const today = istTodayIso();
  const shift = (direction: number) => {
    const value = new Date(month + "T12:00:00Z");
    value.setUTCMonth(value.getUTCMonth() + direction);
    setMonth(value.toISOString().slice(0, 10));
  };
  return (
    <section
      className="min-w-0"
      aria-label="Personal task calendar"
      aria-busy={loading}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-serif text-lg text-foreground">{monthDate(month)}</h3>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Previous personal-task month"
            onClick={() => shift(-1)}
          >
            <PlainIcon name="arrowLeft" size={16} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setMonth(today.slice(0, 7) + "-01");
              onSelect(today);
            }}
          >
            Today
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Next personal-task month"
            onClick={() => shift(1)}
          >
            <PlainIcon name="arrowRight" size={16} />
          </Button>
        </div>
      </div>
      <div
        className="grid grid-cols-7 text-center text-[11px] text-muted-foreground"
        aria-hidden="true"
      >
        {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
          <span key={i} className="py-1">
            {day}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: 42 }, (_, index) => {
          const date = addIsoDays(from, index);
          const count = data?.days[date];
          return (
            <button
              key={date}
              type="button"
              aria-pressed={selected === date}
              aria-current={date === today ? "date" : undefined}
              aria-label={`${longDate(date)}${date === today ? ", today" : ""}, ${count?.pending ?? 0} pending, ${count?.completed ?? 0} completed`}
              onClick={() => {
                onSelect(date);
                setMonth(date.slice(0, 7) + "-01");
              }}
              className={cn(
                "flex min-h-10 min-w-0 flex-col items-center justify-center gap-1 rounded-lg text-xs hover:bg-accent",
                date.slice(0, 7) !== month.slice(0, 7) && "text-muted-foreground",
                selected === date && "bg-foreground text-background hover:bg-foreground",
                date === today && selected !== date && "font-semibold text-primary",
              )}
            >
              <span>{Number(date.slice(-2))}</span>
              <span className="flex h-1 gap-1" aria-hidden="true">
                {!!count?.pending && (
                  <span
                    className={cn(
                      "size-1 rounded-full",
                      selected === date ? "bg-background" : "bg-primary",
                    )}
                  />
                )}
                {!!count?.completed && (
                  <span
                    className={cn(
                      "size-1 rounded-full",
                      selected === date ? "bg-background" : "bg-success",
                    )}
                  />
                )}
              </span>
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {error}{" "}
          <button type="button" className="underline" onClick={refresh}>
            Retry
          </button>
        </p>
      )}
      <p className="mt-3 text-xs text-muted-foreground">
        Pending · Completed · Personal tasks only
      </p>
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
        <span className="text-xs">{longDate(selected)}</span>
        <Button type="button" size="sm" variant="outline" onClick={onAdd}>
          Add task
        </Button>
      </div>
    </section>
  );
}
