"use client";
import { useEffect, useState } from "react";
import { istTimeLabel } from "@/lib/format";

/**
 * Live IST time, inline in the dashboard header's metadata line.
 *
 * The date already sits beside it, so this shows time only — one fact per
 * surface. It renders as plain tabular text rather than a bordered tile: a
 * clock is context, not status, and the paper rules keep tinted or boxed hosts
 * for things that mean something.
 *
 * The next tick is scheduled to the next minute boundary rather than a fixed
 * interval, so the clock never displays a minute that has already passed and
 * does not drift. Renders a neutral placeholder until mounted so server and
 * client markup cannot disagree on the time.
 */
export function DashboardClock() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    let timer = 0;
    const tick = () => {
      // IST is a whole-minute offset, so the minute turns over with UTC.
      const toNextMinute = 60_000 - (Date.now() % 60_000);
      setTime(istTimeLabel());
      timer = window.setTimeout(tick, toNextMinute + 250);
    };
    tick();
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <span
      className="tabular"
      aria-label={`Current time in India Standard Time${time ? `: ${time}` : ""}`}
    >
      {time ? `${time} IST` : "— IST"}
    </span>
  );
}
