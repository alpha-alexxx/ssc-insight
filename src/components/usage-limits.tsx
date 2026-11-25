"use client";

import * as React from "react";
import { NumberRoll } from "./number-roll";

/* ─────────────────────────────────────────────────────────
 * CONTEXT PANEL: what is inside the context window, and what
 * is left to spend today
 *
 *   header    one heading — "Context window" — with the ring's
 *             figure in tokens and as a share; the panel that
 *             hosts it adds no second title
 *   window    a segmented bar: one colour per part, a 2px gap,
 *             easing in from the left the first time it is seen;
 *             pointing at a part steps the others back
 *   parts     every part listed with its tokens and share, always
 *             visible — a popover is short, so folding them behind
 *             a chevron only hid the answer
 *   limits    today's plan limits, divided off below: requests and
 *             tokens used against what the key allows, with when
 *             they reset
 *
 * No scroll container: the panel is sized to its content, and the
 * host is responsible for fitting it in the window.
 * ───────────────────────────────────────────────────────── */

export interface ContextPart {
  id: string;
  label: string;
  tokens: number;
}

export interface PlanLimit {
  id: string;
  label: string;
  used: number;
  limit: number;
  /** When it resets (ms or Date). */
  resetsAt?: number | Date;
}

export interface UsageLimitsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The context window, split into what fills it. */
  context?: { limit: number; parts: ContextPart[] };
  /** The plan's name, e.g. "Max". */
  plan?: string;
  limits: PlanLimit[];
  /** Makes the plan heading a link, e.g. to billing. */
  onPlanClick?: () => void;
  locales?: string | string[];
}

const EASE = "cubic-bezier(0.16,1,0.3,1)";
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";
const COLORS = [
  "var(--chart-1, var(--primary))",
  "var(--chart-4, #8b6fe8)",
  "var(--chart-3, #1baf7a)",
  "var(--chart-2, #e8743b)",
  "var(--chart-5, #e0a21b)",
];
const compact = (n: number, locales?: string | string[]) =>
  new Intl.NumberFormat(locales, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
const percent = (part: number, whole: number) =>
  whole > 0 ? Math.min(1, part / whole) : 0;

const reducedQuery = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (onChange: () => void) => {
  const query = window.matchMedia(reducedQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const useReducedMotion = () =>
  React.useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(reducedQuery).matches,
    () => false,
  );

const tone = (share: number) =>
  share >= 1 ? "bg-red-500" : share >= 0.8 ? "bg-amber-500" : "";

/** "Resets in 2 h 46 min" under a day away, the minutes rolling down; "Resets Tue 3:00 pm" further out. */
function Resets({
  at,
  now,
  locales,
}: {
  at: number;
  now: number | null;
  locales?: string | string[];
}) {
  if (now === null) return <span className="invisible">Resets</span>;
  const left = Math.max(0, at - now);
  if (left > 86_400_000) {
    const d = new Date(at);
    return (
      <span>
        Resets{" "}
        {d.toLocaleString(locales ?? "en-GB", {
          weekday: "short",
          hour: "numeric",
          minute: "2-digit",
        })}
      </span>
    );
  }
  const hours = Math.floor(left / 3_600_000);
  const minutes = Math.ceil((left % 3_600_000) / 60_000);
  return (
    <span className="flex items-baseline gap-[0.25em] whitespace-nowrap">
      Resets in
      {hours > 0 && (
        <>
          <NumberRoll value={hours} direction="down" duration={700} />h
        </>
      )}
      <NumberRoll value={minutes} direction="down" duration={700} />
      min
    </span>
  );
}

export function UsageLimits({
  context,
  plan,
  limits,
  onPlanClick,
  locales,
  className = "",
  ...props
}: UsageLimitsProps) {
  const reduced = useReducedMotion();
  const id = React.useId();
  const [visible, setVisible] = React.useState(false);
  const [focus, setFocus] = React.useState<string | null>(null);
  const [now, setNow] = React.useState<number | null>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);

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

  // A clock that ticks on each whole minute, only once mounted (so a server
  // render never reads as "reset").
  React.useEffect(() => {
    let timer = 0;
    const tick = () => {
      setNow(Date.now());
      timer = window.setTimeout(tick, 60_000 - (Date.now() % 60_000) + 50);
    };
    tick();
    return () => window.clearTimeout(timer);
  }, []);

  const used = context ? context.parts.reduce((s, p) => s + p.tokens, 0) : 0;
  const contextShare = context?.limit ? used / context.limit : 0;
  const full = contextShare >= 1;

  return (
    <div
      ref={rootRef}
      className={cnBase(className)}
      {...props}
    >
      {context && (
        <section aria-labelledby={`${id}-context`}>
          {/* One heading, one figure. The share is stated, not implied. */}
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[13px] font-medium text-foreground">
              Context window
            </h2>
            <span className="flex items-baseline gap-1.5 whitespace-nowrap font-mono text-[12px] tabular-nums">
              <span className="text-muted-foreground">
                {compact(used, locales)} / {compact(context.limit, locales)}
              </span>
              <span
                className={
                  full
                    ? "font-medium text-red-600 dark:text-red-400"
                    : contextShare >= 0.8
                      ? "font-medium text-amber-600"
                      : "font-medium text-foreground"
                }
              >
                <NumberRoll
                  value={visible ? contextShare : 0}
                  format={{ style: "percent" }}
                  duration={900}
                />
              </span>
            </span>
          </div>

          {/* The window as one segmented bar. */}
          <div
            aria-hidden="true"
            className="mt-2 flex h-1.5 gap-[2px] overflow-hidden rounded-full bg-muted"
            onPointerLeave={() => setFocus(null)}
          >
            {context.parts.map((p, i) => (
              <span
                key={p.id}
                onPointerEnter={() => setFocus(p.id)}
                className="h-full first:rounded-l-full"
                style={{
                  width: `${visible ? percent(p.tokens, context.limit) * 100 : 0}%`,
                  background: COLORS[i % COLORS.length],
                  opacity: focus && focus !== p.id ? 0.3 : 1,
                  transition: reduced
                    ? "none"
                    : `width 900ms ${EASE} ${i * 70}ms, opacity 240ms ${EASE}`,
                }}
              />
            ))}
          </div>

          {/* Always visible: a short panel has no room to hide the answer. */}
          <ul className="mt-2.5" onPointerLeave={() => setFocus(null)}>
            {context.parts.map((p, i) => (
              <li
                key={p.id}
                onPointerEnter={() => setFocus(p.id)}
                className="flex items-center gap-2 py-[3px] text-[12px] transition-opacity duration-200"
                style={{ opacity: focus && focus !== p.id ? 0.45 : 1 }}
              >
                <span
                  aria-hidden="true"
                  className="size-[7px] shrink-0 rounded-full"
                  style={{ background: COLORS[i % COLORS.length] }}
                />
                <span className="min-w-0 flex-1 truncate text-muted-foreground">
                  {p.label}
                </span>
                <span className="tabular-nums text-foreground">
                  {compact(p.tokens, locales)}
                </span>
                <span className="w-9 text-right tabular-nums text-muted-foreground">
                  {Math.round(percent(p.tokens, context.limit) * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section
        aria-labelledby={`${id}-plan`}
        className={context ? "mt-3 border-t border-border pt-3" : ""}
      >
        {/* A quiet label, not a competing title. */}
        <h3
          id={`${id}-plan`}
          className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
        >
          {onPlanClick ? (
            <button
              type="button"
              onClick={onPlanClick}
              className={`cursor-pointer -mx-1.5 flex w-[calc(100%+12px)] items-center justify-between rounded-lg px-1.5 py-0.5 text-left hover:text-foreground ${FOCUS}`}
            >
              <span>Plan limits{plan ? ` · ${plan}` : ""}</span>
              <span aria-hidden="true" className="text-[13px]">
                ›
              </span>
            </button>
          ) : (
            <span>Plan limits{plan ? ` · ${plan}` : ""}</span>
          )}
        </h3>
        <ul className="mt-1.5">
          {limits.map((l, i) => {
            const share = l.limit ? l.used / l.limit : 0;
            const reached = share >= 1;
            return (
              <li key={l.id} className="pt-2 first:pt-1">
                <div className="flex items-baseline justify-between gap-3 text-[12px]">
                  <span className="min-w-0 truncate text-foreground">
                    {l.label}
                  </span>
                  <span className="flex shrink-0 items-baseline gap-2.5 text-[11px] text-muted-foreground">
                    {l.resetsAt !== undefined && (
                      <Resets at={+new Date(l.resetsAt)} now={now} locales={locales} />
                    )}
                    <span className="flex items-baseline">
                      {reached && (
                        <span className="whitespace-nowrap pr-1.5 font-medium text-red-600 dark:text-red-400">
                          Limit reached
                        </span>
                      )}
                      <span
                        className={`min-w-[2.6em] text-right font-medium tabular-nums ${
                          reached
                            ? "text-red-600 dark:text-red-400"
                            : share >= 0.8
                              ? "text-amber-600"
                              : "text-foreground"
                        }`}
                      >
                        <NumberRoll
                          value={visible ? Math.min(share, 1) : 0}
                          format={{ style: "percent" }}
                          duration={900}
                        />
                      </span>
                    </span>
                  </span>
                </div>
                <div
                  aria-hidden="true"
                  className="mt-1 h-1 overflow-hidden rounded-full bg-muted"
                >
                  <div
                    className={`h-full rounded-full transition-colors duration-300 ${tone(share)}`}
                    style={{
                      width: `${visible ? Math.max(share > 0 ? 1.5 : 0, Math.min(share, 1) * 100) : 0}%`,
                      background: tone(share)
                        ? undefined
                        : "var(--chart-1, var(--primary))",
                      transition: reduced
                        ? "none"
                        : `width 900ms ${EASE} ${i * 90}ms, background-color 300ms ${EASE}`,
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

/**
 * The panel fills the surface that hosts it: the popover/sheet supplies the
 * padding, width and background, so this only lays out its own rows.
 */
function cnBase(className: string) {
  return className ? `w-full ${className}` : "w-full";
}


