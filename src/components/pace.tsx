"use client";

import * as React from "react";
import { NumberRoll } from "./number-roll";

/* ─────────────────────────────────────────────────────────
 * PACE: a goal for the month, and whether you'll make it
 *
 *   arrive    in three beats: the days so far rise one after
 *             another, each a column of hairlines as tall as the
 *             running total; then the rest of the month draws in
 *             ahead of today in finer lines, where this pace takes
 *             you; last, from the day the pace crosses the goal, the
 *             lines above the goal line light green, and the verdict
 *             comes in
 *   point     the day under the pointer lights and its neighbours
 *             fall away; a readout says what that day added and the
 *             total so far, or for a day ahead, where you'll be by
 *             then at this rate
 *   goal      a new target glides the goal line to its place and
 *             the verdict changes in place: on pace, reached, or
 *             short by how much
 *
 * Columns are masked stacks of 2px hairlines (finer 1px lines for
 * what's projected), faint where empty, so the month is one ruled
 * field the total climbs through. Arrow keys read each day.
 * ───────────────────────────────────────────────────────── */

export interface PaceDay {
  key: string;
  /** In the readout, e.g. "Tue 18 Nov". */
  label: string;
  /** Under the column, e.g. "18". */
  tick?: string;
  /** What the day added. Leave it out for days still to come. */
  value?: number;
}

export interface PaceProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Every day of the period, in order; days so far carry a value. */
  days: PaceDay[];
  target: number;
  title?: string;
  /** e.g. "November". Names the period in the verdict. */
  period?: string;
  format?: Intl.NumberFormatOptions;
  locales?: string | string[];
  /** Any CSS colour. Defaults to your first chart colour. */
  color?: string;
}

const EASE = "cubic-bezier(0.16,1,0.3,1)";
const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";
/** The mark: 2px hairlines every 4px, counted up from the baseline. */
const RULE = "repeating-linear-gradient(to top, #000 0 2px, transparent 2px 4px)";
/** What's projected: the same rhythm in 1px lines. */
const FINE = "repeating-linear-gradient(to top, #000 0 1px, transparent 1px 4px)";
const HEADROOM = 34;

const reducedQuery = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (onChange: () => void) => {
  const query = window.matchMedia(reducedQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const useReducedMotion = () =>
  React.useSyncExternalStore(subscribeReduced, () => window.matchMedia(reducedQuery).matches, () => false);

// Formatting waits for hydration: the server and the hydrating render share one fixed locale, then the visitor's takes over.
const subscribeNothing = () => () => {};
const useHydrated = () => React.useSyncExternalStore(subscribeNothing, () => true, () => false);

function niceMax(value: number) {
  if (value <= 0) return 1;
  const step = 10 ** Math.floor(Math.log10(value));
  for (const m of [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * step >= value) return m * step;
  return 10 * step;
}

export function Pace({
  days,
  target,
  title = "Revenue this month",
  period = "the month",
  format,
  locales,
  color = "var(--chart-1, var(--primary))",
  className = "",
  ...props
}: PaceProps) {
  const reduced = useReducedMotion();
  const hydrated = useHydrated();
  const locale = locales ?? (hydrated ? undefined : "en-US");
  const n = days.length;

  // Days so far are the leading run with a value; the rest is ahead.
  let elapsed = 0;
  while (elapsed < n && typeof days[elapsed].value === "number") elapsed++;
  const totals: number[] = [];
  let run = 0;
  for (let i = 0; i < elapsed; i++) totals.push((run += Math.max(0, days[i].value ?? 0)));
  const sofar = run;
  const rate = elapsed ? sofar / elapsed : 0;
  for (let i = elapsed; i < n; i++) totals.push(sofar + rate * (i - elapsed + 1));
  const forecast = n ? totals[n - 1] : 0;
  const max = niceMax(Math.max(target, forecast, 1) * 1.04);
  const hit = totals.findIndex((t) => t >= target);
  const reached = hit >= 0 && hit < elapsed;
  const onPace = hit >= 0;

  const [visible, setVisible] = React.useState(false);
  const [active, setActive] = React.useState<number | null>(null);
  const [keyboard, setKeyboard] = React.useState(false);
  const [plotH, setPlotH] = React.useState(160);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const plotRef = React.useRef<HTMLDivElement>(null);
  const colsRef = React.useRef<HTMLDivElement>(null);
  const barH = Math.max(0, plotH - HEADROOM);

  React.useLayoutEffect(() => {
    const el = plotRef.current;
    if (!el) return;
    const measure = () => setPlotH((h) => (el.offsetHeight && el.offsetHeight !== h ? el.offsetHeight : h));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const pointAt = (clientX: number) => {
    const r = colsRef.current?.getBoundingClientRect();
    if (!r || !n) return null;
    return Math.min(n - 1, Math.max(0, Math.floor(((clientX - r.left) / r.width) * n)));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!n) return;
    const from = active ?? Math.max(0, elapsed - 1);
    const moves: Record<string, number> = { ArrowLeft: from - 1, ArrowRight: from + 1, Home: 0, End: n - 1 };
    if (e.key === "Escape") return setActive(null);
    if (!(e.key in moves)) return;
    e.preventDefault();
    setKeyboard(true);
    setActive(Math.min(n - 1, Math.max(0, active === null ? from : moves[e.key])));
  };

  const fmt = (v: number) => new Intl.NumberFormat(locale, format).format(v);
  const short = (v: number) => new Intl.NumberFormat(locale, { ...format, notation: "compact", maximumFractionDigits: 1 }).format(v);
  const slot = n ? 100 / n : 100;
  const every = n > 16 ? 5 : 1;
  const goalY = HEADROOM + (1 - target / max) * barH;

  // Three beats on arrival: days so far, then the projection, then the goal day.
  const step = Math.min(28, 640 / Math.max(1, n));
  const pastEnd = elapsed * step + 520;
  const aheadEnd = pastEnd + (n - elapsed) * step + 420;

  const verdict = reached
    ? `Goal reached on ${days[hit].label}`
    : onPace
      ? `On pace to reach it on ${days[hit].label}`
      : `Short by ${short(target - forecast)} at this pace`;

  const readout =
    active === null
      ? null
      : active < elapsed
        ? { label: days[active].label, value: `${fmt(days[active].value ?? 0)} · ${short(totals[active])} so far` }
        : { label: `By ${days[active].label}`, value: `${short(totals[active])} at this pace` };

  return (
    <div ref={rootRef} className={`w-full rounded-[22px] bg-background shadow-[0_0_0_1px_var(--border)] ${className}`} {...props}>
      {/* Its natural width where the parent sizes to its content (a centred flex column), without forcing it on narrow screens. */}
      <div aria-hidden="true" data-natural-width className="grid h-0" style={{ gridTemplateColumns: "minmax(0, 600px)" }} />
      <div className="@container w-full">
        <div className="p-4 @md:p-5 [--plot:170px] @md:[--plot:200px]">
          <p className="text-[12px] text-muted-foreground @md:text-[13px]">{title}</p>
          <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2">
            <p className="text-[22px] font-medium leading-tight tracking-[-0.03em] text-foreground tabular-nums @md:text-[26px]">
              <NumberRoll value={visible ? sofar : 0} format={format} locales={locale} duration={1000} />
            </p>
            <p className="text-[13px] text-muted-foreground tabular-nums @md:text-[14px]">of {fmt(target)}</p>
          </div>
          <p
            className={`mt-1 inline-flex items-center gap-1.5 text-[11.5px] font-medium @md:text-[12.5px] ${
              onPace ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
            }`}
            style={{ opacity: visible ? 1 : 0, transition: reduced ? "none" : `opacity 420ms ${EASE} ${aheadEnd}ms` }}
          >
            <span aria-hidden="true" className={`size-1.5 rounded-full ${onPace ? "bg-emerald-500" : "bg-amber-500"}`} />
            {verdict}
          </p>

          <div
            ref={plotRef}
            role="group"
            tabIndex={0}
            aria-label={`${title}: ${fmt(sofar)} of ${fmt(target)}. ${verdict}. Use the arrow keys to read each day.`}
            onKeyDown={onKeyDown}
            onBlur={() => keyboard && (setActive(null), setKeyboard(false))}
            onPointerMove={(e) => {
              if (e.pointerType === "touch" && e.buttons === 0) return;
              setKeyboard(false);
              setActive(pointAt(e.clientX));
            }}
            onPointerDown={(e) => setActive(pointAt(e.clientX))}
            onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
            className={`relative mt-4 touch-pan-y select-none rounded-lg @md:mt-5 ${FOCUS}`}
            style={{ height: `calc(var(--plot) + ${HEADROOM}px)` }}
          >
            <div ref={colsRef} className="absolute inset-0">
              {days.map((d, i) => {
                const past = i < elapsed;
                const h = (totals[i] / max) * barH;
                // Every day the total is over the goal lights its lines above the goal line.
                const overGoal = Math.max(0, h - (target / max) * barH);
                const delay = past ? i * step : pastEnd + (i - elapsed) * step;
                const dim = active === null ? 1 : Math.max(0.35, 1 - Math.abs(i - active) * 0.16);
                return (
                  <div
                    key={d.key}
                    aria-hidden="true"
                    className="absolute bottom-0"
                    style={{ left: `${i * slot}%`, width: `${slot}%`, height: barH, opacity: dim, transition: reduced ? "none" : `opacity 240ms ${EASE}` }}
                  >
                    <div
                      className="absolute inset-y-0 left-1/2 w-[min(14px,62%)] -translate-x-1/2"
                      style={{ maskImage: past ? RULE : FINE, WebkitMaskImage: past ? RULE : FINE }}
                    >
                      <div className="absolute inset-0 bg-foreground/[0.07]" />
                      <div
                        className="absolute inset-x-0 bottom-0 overflow-clip"
                        style={{
                          height: visible ? h : 0,
                          background: color,
                          opacity: past ? 1 : 0.7,
                          transition: reduced ? "none" : `height 620ms ${EASE} ${delay}ms`,
                        }}
                      >
                        {overGoal > 0 && (
                          <div
                            className="absolute inset-x-0 top-0 bg-emerald-500 dark:bg-emerald-400"
                            style={{ height: overGoal, opacity: visible ? 1 : 0, transition: reduced ? "none" : `opacity 360ms ${EASE} ${aheadEnd - 260 + Math.max(0, i - hit) * 40}ms` }}
                          />
                        )}
                      </div>
                    </div>
                    {d.tick && (n - 1 - i) % every === 0 && (
                      <span
                        className={`absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10.5px] leading-4 ${i === elapsed - 1 ? "font-medium text-foreground" : "text-muted-foreground"}`}
                      >
                        {d.tick}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Today: a hairline between the days so far and the days ahead. */}
            {elapsed > 0 && elapsed < n && (
              <div aria-hidden="true" className="pointer-events-none absolute bottom-0 w-px bg-foreground/25" style={{ left: `${elapsed * slot}%`, top: HEADROOM - 6 }}>
                <span className="absolute -top-4 left-1 whitespace-nowrap text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Today</span>
              </div>
            )}

            {/* The goal: a line across the month, its figure sitting on the line at the start, where the early days are short. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0"
              style={{ transform: `translateY(${goalY}px)`, transition: reduced ? "none" : `transform 620ms ${EASE}` }}
            >
              <div className="h-px bg-foreground/45" />
              <span className="absolute bottom-1.5 left-0 rounded-full bg-background px-2 py-px text-[10.5px] font-medium tabular-nums text-foreground shadow-[0_0_0_1px_var(--border)]">
                Goal {short(target)}
              </span>
            </div>

            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 border-t border-border" />

            {/* The readout: what the day added and where the total stood, or where this pace takes you by then. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-0 flex h-[24px] -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-background px-2.5 text-[11.5px] shadow-[0_0_0_1px_var(--border)]"
              style={{
                left: active !== null ? `clamp(110px, ${(active + 0.5) * slot}%, calc(100% - 110px))` : "50%",
                opacity: readout ? 1 : 0,
                transition: reduced ? "none" : `left 300ms ${EASE}, opacity 200ms ${EASE}`,
              }}
            >
              <span className="text-muted-foreground">{readout?.label ?? " "}</span>
              <span className="font-medium tabular-nums text-foreground">{readout?.value ?? " "}</span>
            </div>
          </div>
          <div aria-hidden="true" className="h-5" />

          <p aria-live="polite" className="sr-only">
            {keyboard && readout ? `${readout.label}: ${readout.value}` : ""}
          </p>
          <div className="sr-only">
            <table>
              <caption>
                {title}: {fmt(sofar)} of {fmt(target)}. {verdict}. At this pace, {fmt(forecast)} by the end of {period}.
              </caption>
              <tbody>
                {days.map((d, i) => (
                  <tr key={d.key}>
                    <th scope="row">{d.label}</th>
                    <td>{i < elapsed ? fmt(d.value ?? 0) : "ahead"}</td>
                    <td>{i < elapsed ? `${fmt(totals[i])} so far` : `${fmt(totals[i])} at this pace`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
