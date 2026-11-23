"use client";

import * as React from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { lacquer, type LacquerTone } from "./lacquer";
import { NumberRoll } from "./number-roll";
import { TextMorph } from "./text-morph";
import { EASE_OUT, EASE_THROW, useInteractionReducedMotion } from "./ui-interaction-motion";

/* ─────────────────────────────────────────────────────────
 * PILLAR CHART: a period of activity as glass pillars
 *
 *   pillars  each day (or week, or month) is a frosted glass
 *            capsule; the one you point at turns solid white and
 *            a small marker glides above it; the line under the
 *            total says what it is
 *   range    the switch slides to the new range; the pillars on
 *            show sink away and the new ones rise in a wave from
 *            the side you moved toward, the curve over them draws
 *            itself again, and the total and the change roll
 *
 * An object with its own dark lacquer finish: the same on a light
 * page or a dark one.
 *
 * Reduced motion: no rise, sink or roll; everything changes in place.
 * ───────────────────────────────────────────────────────── */

export interface PillarBar {
  label: string;
  value: number;
  /** The line under the total for this pillar; by default its label and value. */
  detail?: string;
}

export interface PillarRange {
  id: string;
  /** On the switch: W, M, Y. */
  label: string;
  /** Read out for the switch, "Week". */
  name?: string;
  total: number;
  /** Percent against the previous period: 12.4 for +12.4%. */
  change?: number;
  bars: PillarBar[];
  /** Which pillar is picked when the range opens; the tallest by default. */
  focus?: number;
}

export interface PillarChartProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "defaultValue" | "onChange"> {
  ranges: PillarRange[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  title?: string;
  icon?: React.ReactNode;
  /** After every figure: " hrs", " km". */
  unit?: string;
  format?: Intl.NumberFormatOptions;
  locales?: string | string[];
  /** The lacquer: a named tone or any CSS colour. */
  tone?: LacquerTone | (string & {});
  /** The marker and the change pill. */
  accent?: string;
}

const AREA = 108;
const subscribeNothing = () => () => {};
/** False while hydrating: text formatted with the visitor's locale waits for it, so the server's HTML matches. */
const useHydrated = () => React.useSyncExternalStore(subscribeNothing, () => true, () => false);
const FORMAT: Intl.NumberFormatOptions = { maximumFractionDigits: 1 };

type Column = { x: number; top: number };

function Pillars({
  range,
  selected,
  onSelect,
  enter,
  leaving,
  reduced,
  accent,
}: {
  range: PillarRange;
  selected: number;
  onSelect: (i: number) => void;
  enter: number;
  leaving: boolean;
  reduced: boolean;
  accent: string;
}) {
  const row = React.useRef<HTMLDivElement>(null);
  const pillars = React.useRef<(HTMLSpanElement | null)[]>([]);
  const curve = React.useRef<SVGPathElement>(null);
  const marker = React.useRef<HTMLSpanElement>(null);
  const [cols, setCols] = React.useState<Column[]>([]);
  const [size, setSize] = React.useState({ w: 0, h: 0 });
  const max = Math.max(...range.bars.map((b) => b.value), 1);
  const heights = range.bars.map((b) => Math.max(0.18, b.value / max) * 0.96);

  // Where each pillar's middle and top sit, for the marker and the curve: measured, and again when the card resizes.
  React.useLayoutEffect(() => {
    const el = row.current;
    if (!el) return;
    const measure = () => {
      const next = Array.from(el.children)
        .filter((c): c is HTMLElement => c instanceof HTMLElement && c.dataset.col !== undefined)
        .map((c, i) => ({ x: c.offsetLeft + c.offsetWidth / 2, top: c.offsetTop + c.offsetHeight - 22 - AREA * heights[i] }));
      setCols((p) => (p.length === next.length && p.every((c, i) => c.x === next[i].x && c.top === next[i].top) ? p : next));
      setSize((p) => (p.w === el.offsetWidth && p.h === el.offsetHeight ? p : { w: el.offsetWidth, h: el.offsetHeight }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  // The new pillars rise from the floor in a wave from the side you moved toward, and the curve draws itself.
  React.useLayoutEffect(() => {
    if (reduced || !enter) return;
    const n = pillars.current.length;
    pillars.current.forEach((el, i) => {
      const order = enter > 0 ? i : n - 1 - i;
      el?.animate([{ transform: "translateY(100%)" }, { transform: `translateY(${(1 - heights[i]) * 100}%)` }], {
        duration: 720,
        delay: 60 + order * 42,
        easing: EASE_OUT,
        fill: "backwards",
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  React.useEffect(() => {
    if (reduced || !cols.length) return;
    curve.current?.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 900, delay: 120, easing: EASE_OUT, fill: "backwards" });
    // On a new range the marker settles in once its pillar has risen, rather than waiting in the air.
    if (enter) marker.current?.animate([{ opacity: 0, translate: "0 6px" }, { opacity: 1, translate: "0 0" }], { duration: 320, delay: 560, easing: EASE_OUT, fill: "backwards" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cols.length > 0]);

  const path = React.useMemo(() => {
    if (cols.length < 2) return "";
    const pts = cols.map((c) => ({ x: c.x, y: c.top - 16 }));
    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const mx = ((a.x + b.x) / 2).toFixed(1);
      d += ` C ${mx} ${a.y.toFixed(1)}, ${mx} ${b.y.toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
    }
    return d;
  }, [cols]);

  const mark = cols[selected];

  return (
    <div
      className="absolute inset-0"
      style={{
        opacity: leaving ? 0 : 1,
        transform: leaving ? "translateY(10px)" : "none",
        filter: leaving ? "blur(4px)" : "none",
        transition: reduced ? "none" : `opacity 260ms ease-out, transform 320ms ${EASE_OUT}, filter 260ms ease-out`,
        pointerEvents: leaving ? "none" : undefined,
      }}
      aria-hidden={leaving || undefined}
    >
      {size.w > 0 && path && (
        <svg aria-hidden className="pointer-events-none absolute inset-0 overflow-visible" width={size.w} height={size.h} viewBox={`0 0 ${size.w} ${size.h}`}>
          <path ref={curve} d={path} pathLength={1} strokeDasharray="1 1" fill="none" stroke="rgb(255 255 255 / 0.42)" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      )}
      {mark && (
        <span
          ref={marker}
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 size-1.5 rounded-full"
          style={{
            background: accent,
            transform: `translate(${mark.x - 3}px, ${mark.top - 12}px)`,
            transition: reduced ? "none" : `transform 380ms ${EASE_THROW}`,
          }}
        />
      )}
      <div ref={row} role="radiogroup" aria-label="Pick a bar" className="relative flex h-full items-end justify-between gap-2.5">
        {range.bars.map((bar, i) => {
          const on = i === selected;
          return (
            <button
              key={bar.label}
              data-col=""
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={on ? 0 : -1}
              aria-label={bar.detail ?? bar.label}
              onClick={() => onSelect(i)}
              onPointerMove={(e) => e.pointerType === "mouse" && !on && onSelect(i)}
              onKeyDown={(e) => {
                const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
                const to = step ? Math.max(0, Math.min(range.bars.length - 1, i + step)) : e.key === "Home" ? 0 : e.key === "End" ? range.bars.length - 1 : -1;
                if (to < 0) return;
                e.preventDefault();
                onSelect(to);
                (e.currentTarget.parentElement?.children[to] as HTMLElement | undefined)?.focus();
              }}
              className="group flex h-full min-w-0 flex-1 cursor-pointer flex-col items-center justify-end gap-2 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <span className="relative block w-full max-w-[26px] overflow-clip rounded-full" style={{ height: AREA }}>
                <span
                  ref={(el) => {
                    pillars.current[i] = el;
                  }}
                  className="absolute inset-0 rounded-full"
                  style={{ transform: `translateY(${(1 - heights[i]) * 100}%)`, transition: reduced ? "none" : `transform 640ms ${EASE_OUT}`, willChange: "transform" }}
                >
                  <span
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "linear-gradient(180deg, rgb(255 255 255 / 0.3) 0%, rgb(255 255 255 / 0.12) 62%, rgb(255 255 255 / 0.04) 100%)",
                      boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.22)",
                    }}
                  />
                  <span
                    className="absolute inset-0 rounded-full transition-opacity duration-200"
                    style={{ opacity: on ? 1 : 0, background: "linear-gradient(180deg, #fff 0%, rgb(255 255 255 / 0.94) 78%, rgb(255 255 255 / 0.82) 100%)" }}
                  />
                </span>
              </span>
              <span className={`text-[10.5px] font-medium transition-colors duration-150 ${on ? "text-white" : "text-white/50 group-hover:text-white/80"}`}>{bar.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function PillarChart({
  ranges,
  value,
  defaultValue,
  onValueChange,
  title = "Activity",
  icon,
  unit = "",
  format = FORMAT,
  locales,
  tone = "cobalt",
  accent = "#dcfc4e",
  className = "",
  style,
  ...props
}: PillarChartProps) {
  const reduced = useInteractionReducedMotion();
  const [own, setOwn] = React.useState(defaultValue ?? ranges[0]?.id);
  const current = ranges.find((r) => r.id === (value ?? own)) ?? ranges[0];
  const tallest = (r: PillarRange) => r.focus ?? r.bars.reduce((best, b, i, all) => (b.value > all[best].value ? i : best), 0);
  const [picked, setPicked] = React.useState<{ range: string; index: number }>({ range: current.id, index: tallest(current) });
  const selected = picked.range === current.id ? Math.min(picked.index, current.bars.length - 1) : tallest(current);
  const bar = current.bars[selected];
  const hydrated = useHydrated();
  const lang = hydrated ? locales : (locales ?? "en-US");
  const nf = React.useMemo(() => new Intl.NumberFormat(lang, format), [lang, format]);

  // The range on show and the one sinking away; a change is spotted while rendering, so both draw in the same frame.
  const [shown, setShown] = React.useState({ id: current.id, enter: 0, key: 0 });
  const [leaving, setLeaving] = React.useState<{ id: string; key: number } | null>(null);
  if (shown.id !== current.id) {
    const from = ranges.findIndex((r) => r.id === shown.id);
    const to = ranges.findIndex((r) => r.id === current.id);
    setLeaving({ id: shown.id, key: shown.key });
    setShown({ id: current.id, enter: to >= from ? 1 : -1, key: shown.key + 1 });
  }
  React.useEffect(() => {
    if (!leaving) return;
    const t = window.setTimeout(() => setLeaving(null), 340);
    return () => window.clearTimeout(t);
  }, [leaving]);

  const choose = (id: string) => {
    if (id === current.id) return;
    if (value === undefined) setOwn(id);
    onValueChange?.(id);
  };

  // The switch's pill slides to the choice; placed without a transition the first time.
  const switchRef = React.useRef<HTMLDivElement>(null);
  const [pill, setPill] = React.useState<{ x: number; w: number; ready: boolean } | null>(null);
  React.useLayoutEffect(() => {
    const el = switchRef.current?.querySelector<HTMLElement>(`[data-range="${CSS.escape(current.id)}"]`);
    if (!el) return;
    setPill((p) => (p && p.x === el.offsetLeft && p.w === el.offsetWidth ? p : { x: el.offsetLeft, w: el.offsetWidth, ready: !!p }));
  }, [current.id]);

  const up = (current.change ?? 0) >= 0;
  const leavingRange = leaving ? ranges.find((r) => r.id === leaving.id) : undefined;

  return (
    <div
      className={`relative flex w-full flex-col overflow-clip rounded-[22px] p-5 select-none ${className}`}
      style={{ ...lacquer(tone), ...style }}
      {...props}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-white/85">
          {icon}
          <span>{title}</span>
        </div>
        {ranges.length > 1 && (
          <div
            ref={switchRef}
            role="radiogroup"
            aria-label="Range"
            className="relative inline-flex items-center gap-0.5 rounded-full p-0.5"
            style={{ background: "rgb(0 0 0 / 0.25)", boxShadow: "inset 0 0 0 1px rgb(255 255 255 / 0.14)" }}
          >
            {pill && (
              <span
                aria-hidden
                className="absolute left-0 top-0.5 h-6 rounded-full bg-white"
                style={{ width: pill.w, transform: `translateX(${pill.x}px)`, transition: pill.ready && !reduced ? `transform 420ms ${EASE_THROW}, width 300ms ${EASE_OUT}` : "none" }}
              />
            )}
            {ranges.map((r) => {
              const on = r.id === current.id;
              return (
                <button
                  key={r.id}
                  data-range={r.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  aria-label={r.name ?? r.label}
                  tabIndex={on ? 0 : -1}
                  onClick={() => choose(r.id)}
                  onKeyDown={(e) => {
                    const i = ranges.indexOf(r);
                    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
                    if (!step) return;
                    e.preventDefault();
                    const next = ranges[(i + step + ranges.length) % ranges.length];
                    choose(next.id);
                    (switchRef.current?.querySelector(`[data-range="${CSS.escape(next.id)}"]`) as HTMLElement | null)?.focus();
                  }}
                  className={`relative z-10 grid h-6 min-w-6 cursor-pointer place-items-center rounded-full px-1.5 text-[11px] font-semibold outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-white/70 ${
                    on ? "text-[#0b0b10]" : "text-white/65 hover:text-white"
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="flex items-center gap-2.5">
          <span className="text-[34px] font-normal leading-none tracking-[-0.03em] tabular-nums text-white">
            <NumberRoll value={current.total} format={format} locales={lang} suffix={unit} />
          </span>
          {current.change !== undefined && (
            <span
              className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-tight tabular-nums"
              style={up ? { background: accent, color: "#11140a" } : { background: "rgb(255 255 255 / 0.14)", color: "#fff" }}
            >
              {up ? <ArrowUpRight className="size-3" strokeWidth={2.6} aria-hidden /> : <ArrowDownRight className="size-3" strokeWidth={2.6} aria-hidden />}
              <NumberRoll value={Math.abs(current.change)} format={{ maximumFractionDigits: 1 }} locales={lang} suffix="%" />
            </span>
          )}
        </div>
        <p className="mt-1.5 h-[18px] text-[12px] tabular-nums text-white/65">
          <TextMorph>{bar ? (bar.detail ?? `${bar.label} · ${nf.format(bar.value)}${unit}`) : ""}</TextMorph>
        </p>
      </div>

      <div className="relative mt-4 h-[148px]">
        {leavingRange && (
          <Pillars key={`out-${leaving!.key}`} range={leavingRange} selected={-1} onSelect={() => {}} enter={0} leaving reduced={reduced} accent={accent} />
        )}
        <Pillars
          key={`in-${shown.key}`}
          range={current}
          selected={selected}
          onSelect={(i) => setPicked({ range: current.id, index: i })}
          enter={shown.enter}
          leaving={false}
          reduced={reduced}
          accent={accent}
        />
      </div>

      <table className="sr-only">
        <caption>
          {title}, {current.name ?? current.label}: {nf.format(current.total)}
          {unit}
        </caption>
        <tbody>
          {current.bars.map((b) => (
            <tr key={b.label}>
              <th scope="row">{b.label}</th>
              <td>
                {nf.format(b.value)}
                {unit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
