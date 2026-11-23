"use client";

import * as React from "react";
import { NumberRoll } from "./number-roll";
import { TextMorph } from "./text-morph";

/* ─────────────────────────────────────────────────────────
 * DOT METER: several goals at once, each a small field of dots
 *
 *   arrive    each goal's dots pour in from above like grains and
 *             settle bottom row first, one goal after another
 *   grow      a bigger value pours only the new grains, from the
 *             top of the field down onto the ones already there
 *   shrink    the top grains lift out, last in first out
 *   over      past the goal a second, deeper lap of grains falls
 *             onto the first, from the bottom again
 *   point     point at (or focus) a goal and the others dim; its
 *             name becomes its share of the goal
 *
 * Every grain moves by transform only (one Web Animation each);
 * nothing re-renders while they fall.
 * ───────────────────────────────────────────────────────── */

export interface DotMeterItem {
  key: string;
  label: string;
  value: number;
  goal: number;
  /** Shown after the figures, e.g. "g" or "GB". */
  unit?: string;
  /** Any CSS colour. Defaults to your chart colours in turn. */
  color?: string;
  /** A small icon before the name. */
  icon?: React.ReactNode;
}

export interface DotMeterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  items: DotMeterItem[];
  title?: string;
  /** A headline figure beside the title, e.g. today's calories. */
  total?: number;
  totalUnit?: string;
  /** Dots across and down in each field; together they stand for one goal. */
  columns?: number;
  rows?: number;
  format?: Intl.NumberFormatOptions;
  locales?: string | string[];
}

const EASE = "cubic-bezier(0.16,1,0.3,1)";
const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-4 focus-visible:ring-offset-background";
const GAP = 3;

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

const mix = (color: string, amount: number, into = "transparent") => `color-mix(in oklab, ${color} ${amount}%, ${into})`;

export function DotMeter({
  items,
  title = "Today",
  total,
  totalUnit,
  columns = 8,
  rows = 5,
  format,
  locales,
  className = "",
  ...props
}: DotMeterProps) {
  const reduced = useReducedMotion();
  const hydrated = useHydrated();
  const locale = locales ?? (hydrated ? undefined : "en-US");
  const [visible, setVisible] = React.useState(false);
  const [active, setActive] = React.useState<string | null>(null);
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

  const fmt = (v: number) => new Intl.NumberFormat(locale, format).format(v);

  return (
    <div ref={rootRef} className={`w-full rounded-[22px] bg-background shadow-[0_0_0_1px_var(--border)] ${className}`} {...props}>
      {/* Its natural width where the parent sizes to its content (a centred flex column), without forcing it on narrow screens. */}
      <div aria-hidden="true" data-natural-width className="grid h-0" style={{ gridTemplateColumns: "minmax(0, 440px)" }} />
      <div className="@container w-full">
        <div className="p-4 @md:p-5">
          <div className="flex items-baseline justify-between gap-3">
            <p className="truncate text-[12.5px] text-muted-foreground @md:text-[13px]">{title}</p>
            {total !== undefined && (
              <p className="shrink-0 text-[15px] font-medium tracking-[-0.02em] text-foreground tabular-nums @md:text-[17px]">
                <NumberRoll value={visible ? total : 0} format={format} locales={locale} duration={1100} />
                {totalUnit && <span className="ml-1 text-[12px] font-normal tracking-normal text-muted-foreground @md:text-[13px]">{totalUnit}</span>}
              </p>
            )}
          </div>

          <div
            className="mt-4 grid gap-x-4 @md:mt-5 @md:gap-x-6"
            style={{ gridTemplateColumns: `repeat(${Math.max(1, items.length)}, minmax(0, 1fr))` }}
            onPointerLeave={(e) => {
              if (e.pointerType !== "touch") setActive(null);
            }}
          >
            {items.map((item, i) => (
              <Field
                key={item.key}
                item={item}
                color={item.color ?? `var(--chart-${(i % 5) + 1}, var(--primary))`}
                index={i}
                columns={columns}
                rows={rows}
                visible={visible}
                reduced={reduced}
                dim={active !== null && active !== item.key}
                pointed={active === item.key}
                onPoint={setActive}
                fmt={fmt}
                format={format}
                locale={locale}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface FieldProps {
  item: DotMeterItem;
  color: string;
  index: number;
  columns: number;
  rows: number;
  visible: boolean;
  reduced: boolean;
  dim: boolean;
  pointed: boolean;
  onPoint: (key: string | null) => void;
  fmt: (v: number) => string;
  format?: Intl.NumberFormatOptions;
  locale?: string | string[];
}

const Field = React.memo(function Field({ item, color, index, columns, rows, visible, reduced, dim, pointed, onPoint, fmt, format, locale }: FieldProps) {
  const n = columns * rows;
  const ratio = item.goal > 0 ? Math.max(0, item.value) / item.goal : 0;
  const grains = Math.round(ratio * n);
  // Before it's seen the field is empty, so the first pour is the arrival.
  const first = visible ? Math.min(grains, n) : 0;
  const second = visible ? Math.min(Math.max(grains - n, 0), n) : 0;

  const gridRef = React.useRef<HTMLDivElement>(null);
  const laps = React.useRef<(HTMLSpanElement | null)[][]>([[], []]);
  const shown = React.useRef([0, 0]);
  const arrived = React.useRef(false);

  // Pour new grains in and lift old ones out, by fill order (bottom row first, left to right).
  React.useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const targets = [first, second];
    const cell = grid.firstElementChild as HTMLElement | null;
    const pitch = (cell?.offsetHeight ?? 10) + GAP;
    const opening = !arrived.current && first > 0;
    if (opening) arrived.current = true;
    // When both laps pour at once, the second waits for the first to land.
    let landed = 0;
    targets.forEach((target, lap) => {
      const from = shown.current[lap];
      if (target === from) return;
      shown.current[lap] = target;
      const els = laps.current[lap];
      if (target > from) {
        const count = target - from;
        const step = Math.min(opening ? 16 : 26, 640 / count);
        const wait = (opening ? index * 110 : 0) + (lap === 1 ? landed : 0);
        if (lap === 0) landed = count * step + 420;
        for (let i = from; i < target; i++) {
          const el = els[i];
          if (!el) continue;
          el.getAnimations().forEach((a) => a.cancel());
          el.style.opacity = "1";
          if (reduced) continue;
          const rowFromTop = rows - 1 - Math.floor(i / columns);
          const drop = (rowFromTop + 1.6) * pitch;
          const fall = 240 + 70 * Math.sqrt(rowFromTop + 1.6);
          el.animate(
            [
              { transform: `translate3d(0,${-drop}px,0)`, opacity: 0, offset: 0, easing: "cubic-bezier(0.5,0,0.95,0.6)" },
              { opacity: 1, offset: 0.3 },
              { transform: "translate3d(0,0,0)", offset: 0.76, easing: "cubic-bezier(0.2,0.7,0.4,1)" },
              { transform: `translate3d(0,${-Math.min(2, pitch * 0.18)}px,0)`, offset: 0.88, easing: "cubic-bezier(0.6,0,0.8,0.4)" },
              { transform: "translate3d(0,0,0)", opacity: 1, offset: 1 },
            ],
            { duration: fall / 0.76, delay: wait + (i - from) * step, easing: "linear", fill: "backwards" },
          );
        }
      } else {
        const count = from - target;
        const step = Math.min(18, 360 / count);
        for (let i = from - 1; i >= target; i--) {
          const el = els[i];
          if (!el) continue;
          el.getAnimations().forEach((a) => a.cancel());
          el.style.opacity = "0";
          if (reduced) continue;
          el.animate(
            [
              { transform: "translate3d(0,0,0) scale(1)", opacity: 1 },
              { transform: `translate3d(0,${-pitch * 0.9}px,0) scale(0.5)`, opacity: 0 },
            ],
            { duration: 280, delay: (from - 1 - i) * step, easing: EASE, fill: "backwards" },
          );
        }
      }
    });
  }, [first, second, columns, rows, index, reduced]);

  const unit = item.unit ? ` ${item.unit}` : "";
  const share = Math.round(ratio * 100);
  // Short enough for the narrowest field: the share alone, in the goal's colour.
  const caption = pointed ? `${share}%` : item.label;
  // The second lap is ink with a trace of the colour: darker in light, lighter in dark, never a muddy shade of it.
  const deep = mix(color, 30, "var(--foreground)");

  // The DOM lists the field top-down; fill order counts from the bottom-left.
  const cells = [];
  for (let p = 0; p < n; p++) {
    const fromTop = Math.floor(p / columns);
    const i = (rows - 1 - fromTop) * columns + (p % columns);
    cells.push(
      <span key={p} className="relative aspect-square rounded-full" style={{ background: mix(color, 17) }}>
        <span
          ref={(el) => {
            laps.current[0][i] = el;
          }}
          className="absolute inset-0 rounded-full opacity-0"
          style={{ background: color, willChange: "transform" }}
        />
        <span
          ref={(el) => {
            laps.current[1][i] = el;
          }}
          className="absolute inset-0 rounded-full opacity-0"
          style={{ background: deep, willChange: "transform" }}
        />
      </span>,
    );
  }

  return (
    <div
      role="meter"
      tabIndex={0}
      aria-label={item.label}
      aria-valuemin={0}
      aria-valuemax={item.goal}
      aria-valuenow={item.value}
      aria-valuetext={`${fmt(item.value)}${unit} of ${fmt(item.goal)}${unit}`}
      onPointerMove={(e) => {
        if (e.pointerType === "mouse") onPoint(item.key);
      }}
      onPointerDown={() => onPoint(pointed ? null : item.key)}
      onFocus={() => onPoint(item.key)}
      onBlur={() => onPoint(null)}
      className={`min-w-0 cursor-default rounded-[6px] outline-none transition-opacity duration-200 ${FOCUS}`}
      style={{ opacity: dim ? 0.38 : 1, transitionTimingFunction: EASE }}
    >
      <div ref={gridRef} aria-hidden="true" className="grid max-w-[132px]" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: GAP }}>
        {cells}
      </div>
      <p className="mt-2.5 text-[15px] font-medium leading-tight tracking-[-0.02em] text-foreground tabular-nums @md:text-[17px]">
        <NumberRoll value={visible ? item.value : 0} format={format} locales={locale} duration={1000} />
        {item.unit && <span className="ml-0.5 text-[12px] font-normal tracking-normal text-muted-foreground @md:text-[13px]">{item.unit}</span>}
      </p>
      <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[11.5px] text-muted-foreground @md:text-[12.5px]">
        {item.icon ? (
          <span className="flex size-3.5 shrink-0 items-center justify-center [&>svg]:size-3.5" style={{ color }}>
            {item.icon}
          </span>
        ) : (
          <span className="size-2 shrink-0 rounded-[2px]" style={{ background: color }} />
        )}
        <span className="min-w-0 truncate whitespace-nowrap">
          <TextMorph>{caption}</TextMorph>
        </span>
      </p>
    </div>
  );
});
