"use client";

import * as React from "react";
import { Lock } from "lucide-react";
import { createSpring, type Spring } from "./ui-interaction-motion";

/* ─────────────────────────────────────────────────────────
 * TIMELINE: tasks over days, joined by what they wait for
 *
 *   drag      drag a task along the days and it follows your
 *             pointer; the tasks waiting on it are pushed along on
 *             springs, each a beat behind the one before, so the
 *             dependency lines stretch like rubber bands and the
 *             knock-on effect travels down the plan
 *   locked    a task pinned to its date doesn't move: its line pulls
 *             taut and turns red, so you see the clash as you make it
 *   resize    drag a task's right edge to change how long it takes;
 *             the same knock-on follows
 *   release   everything snaps to whole days and settles; the
 *             critical path (the chain that sets the end date) is
 *             lit in your colour
 *
 * Keyboard: ← → move a focused task a day, Shift with them changes
 * its length. Dates in and out are plain YYYY-MM-DD strings.
 * ───────────────────────────────────────────────────────── */

export interface TimelineTask {
  id: string;
  title: string;
  /** First day, YYYY-MM-DD. */
  start: string;
  /** How many days it takes. */
  days: number;
  /** Ids of the tasks it waits for. */
  after?: string[];
  /** Pinned to its date: never pushed. */
  locked?: boolean;
  /** Tasks in a group share a colour. */
  group?: string;
}

export interface TimelineProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  tasks: TimelineTask[];
  /** Called with the whole plan after a move settles. */
  onTasksChange?: (tasks: TimelineTask[]) => void;
  title?: string;
  /** The first day shown, YYYY-MM-DD. Defaults to two days before the earliest task. */
  from?: string;
  /** How many days to show. Defaults to the plan plus a week. */
  span?: number;
  /** Draws a Today line, YYYY-MM-DD. */
  today?: string;
  /** For day and month names. */
  locale?: string;
}

const DAY = 34;
const ROW = 40;
const BAR = 26;
const AXIS = 40;
const MS = 86_400_000;
const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-1 focus-visible:ring-offset-background";

const reducedQuery = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (onChange: () => void) => {
  const query = window.matchMedia(reducedQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const useReducedMotion = () =>
  React.useSyncExternalStore(subscribeReduced, () => window.matchMedia(reducedQuery).matches, () => false);

const mix = (color: string, amount: number, into = "transparent") => `color-mix(in oklab, ${color} ${amount}%, ${into})`;
const dayOf = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return Math.round(Date.UTC(y, (m || 1) - 1, d || 1) / MS);
};
const isoOf = (day: number) => new Date(day * MS).toISOString().slice(0, 10);

/** Where every task would sit, pushed (never pulled) by what it waits for. */
function settle(tasks: TimelineTask[], base: Map<string, number>, fixed: Map<string, number>) {
  const out = new Map<string, number>();
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const visiting = new Set<string>();
  const place = (id: string): number => {
    if (out.has(id)) return out.get(id)!;
    const t = byId.get(id);
    if (!t) return 0;
    if (fixed.has(id)) {
      out.set(id, fixed.get(id)!);
      return out.get(id)!;
    }
    let at = base.get(id) ?? 0;
    if (!t.locked && !visiting.has(id)) {
      visiting.add(id);
      for (const p of t.after ?? []) {
        const pt = byId.get(p);
        if (pt) at = Math.max(at, place(p) + pt.days);
      }
      visiting.delete(id);
    }
    out.set(id, at);
    return at;
  };
  tasks.forEach((t) => place(t.id));
  return out;
}

/** How far down the chain of waiting each task is, so the far ends trail further behind. */
function depths(tasks: TimelineTask[], root: string) {
  const out = new Map<string, number>([[root, 0]]);
  let frontier = [root];
  for (let d = 1; frontier.length && d < 12; d++) {
    const next: string[] = [];
    for (const t of tasks) if (!out.has(t.id) && (t.after ?? []).some((a) => frontier.includes(a))) {
      out.set(t.id, d);
      next.push(t.id);
    }
    frontier = next;
  }
  return out;
}

export function Timeline({ tasks: tasksProp, onTasksChange, title = "Plan", from, span, today, locale = "en-US", className = "", ...props }: TimelineProps) {
  const reduced = useReducedMotion();
  const [tasks, setTasks] = React.useState(tasksProp);
  const [seenProp, setSeenProp] = React.useState(tasksProp);
  if (seenProp !== tasksProp) {
    setSeenProp(tasksProp);
    setTasks(tasksProp);
  }
  const [dragging, setDragging] = React.useState<string | null>(null);
  const [said, setSaid] = React.useState("");

  const first = React.useMemo(() => Math.min(...tasks.map((t) => dayOf(t.start))), [tasks]);
  const lastEnd = Math.max(...tasks.map((t) => dayOf(t.start) + t.days));
  const origin = from ? dayOf(from) : first - 2;
  const days = span ?? Math.max(21, lastEnd - origin + 7);
  const width = days * DAY;
  const groups = React.useMemo(() => [...new Set(tasks.map((t) => t.group ?? ""))], [tasks]);
  const colorOf = (t: TimelineTask) => `var(--chart-${(groups.indexOf(t.group ?? "") % 5) + 1}, var(--primary))`;

  // The committed plan in day numbers relative to the first column.
  const starts = React.useMemo(() => new Map(tasks.map((t) => [t.id, dayOf(t.start) - origin])), [tasks, origin]);

  // The critical path: the chain that ends on the last day.
  const critical = React.useMemo(() => {
    const end = Math.max(...tasks.map((t) => starts.get(t.id)! + t.days));
    const lit = new Set(tasks.filter((t) => starts.get(t.id)! + t.days === end).map((t) => t.id));
    let grew = true;
    while (grew) {
      grew = false;
      for (const t of tasks)
        if (lit.has(t.id))
          for (const p of t.after ?? []) {
            const pt = tasks.find((x) => x.id === p);
            if (pt && !lit.has(p) && starts.get(p)! + pt.days === starts.get(t.id)) {
              lit.add(p);
              grew = true;
            }
          }
    }
    return lit;
  }, [tasks, starts]);

  const barRefs = React.useRef(new Map<string, HTMLElement>());
  const lineRefs = React.useRef(new Map<string, SVGPathElement>());
  const springs = React.useRef(new Map<string, Spring>());
  const lengths = React.useRef(new Map<string, number>());
  const live = React.useRef({ tasks, starts, critical, frame: 0 });
  const drag = React.useRef<{ id: string; mode: "move" | "resize"; x0: number; at0: number; len0: number; base: Map<string, number>; moved: boolean } | null>(null);

  React.useLayoutEffect(() => {
    live.current.tasks = tasks;
    live.current.starts = starts;
    live.current.critical = critical;
  });

  // One frame: bars where their springs are, and every line drawn between them.
  const paint = React.useCallback(() => {
    const L = live.current;
    L.frame = 0;
    const byId = new Map(L.tasks.map((t) => [t.id, t]));
    const index = new Map(L.tasks.map((t, i) => [t.id, i]));
    const x = (id: string) => (springs.current.get(id)?.get() ?? L.starts.get(id) ?? 0) * DAY;
    const len = (id: string) => (lengths.current.get(id) ?? byId.get(id)?.days ?? 1) * DAY;
    L.tasks.forEach((t) => {
      const bar = barRefs.current.get(t.id);
      if (!bar) return;
      bar.style.transform = `translate3d(${x(t.id) + 2}px,0,0)`;
      bar.style.width = `${Math.max(DAY - 4, len(t.id) - 4)}px`;
    });
    L.tasks.forEach((t) =>
      (t.after ?? []).forEach((p) => {
        const path = lineRefs.current.get(`${p}>${t.id}`);
        if (!path || !byId.has(p)) return;
        const x1 = x(p) + len(p) - 2;
        const y1 = (index.get(p) ?? 0) * ROW + ROW / 2;
        const x2 = x(t.id) + 2;
        const y2 = (index.get(t.id) ?? 0) * ROW + ROW / 2;
        // Behind its task the line is stretched: it pulls straight. Only a pinned task that can't follow is a clash.
        const taut = x2 < x1 + 2;
        const clash = taut && !!t.locked;
        const reach = taut ? 0 : Math.max(14, Math.min(40, Math.abs(x2 - x1) * 0.5 + 10));
        path.setAttribute("d", taut ? `M ${x1} ${y1} L ${x2} ${y2}` : `M ${x1} ${y1} C ${x1 + reach} ${y1} ${x2 - reach} ${y2} ${x2} ${y2}`);
        path.dataset.state = clash ? "clash" : L.critical.has(p) && L.critical.has(t.id) && Math.abs(x2 - x1 - 4) < 1 ? "critical" : "rest";
      }),
    );
  }, []);
  const request = React.useCallback(() => {
    const L = live.current;
    if (!L.frame) L.frame = requestAnimationFrame(paint);
  }, [paint]);

  // A spring per task; created once per id and aimed at the committed plan.
  React.useLayoutEffect(() => {
    const map = springs.current;
    tasks.forEach((t) => {
      if (!map.has(t.id)) map.set(t.id, createSpring(starts.get(t.id) ?? 0, { stiffness: 260, damping: 26 }, request, 0.002));
    });
    [...map.keys()].forEach((id) => {
      if (!tasks.some((t) => t.id === id)) {
        map.get(id)?.stop();
        map.delete(id);
      }
    });
    tasks.forEach((t) => {
      const s = map.get(t.id)!;
      if (drag.current) return;
      if (reduced) s.jump(starts.get(t.id) ?? 0);
      else s.set(starts.get(t.id) ?? 0);
      lengths.current.set(t.id, t.days);
    });
    paint();
  }, [tasks, starts, reduced, request, paint]);

  React.useEffect(() => {
    const map = springs.current;
    const L = live.current;
    return () => {
      map.forEach((s) => s.stop());
      if (L.frame) cancelAnimationFrame(L.frame);
      L.frame = 0;
    };
  }, []);

  /** Aim every spring at where the plan would sit with this one task here. */
  const aim = (id: string, at: number, len: number, final: boolean) => {
    const L = live.current;
    const plan = L.tasks.map((t) => (t.id === id ? { ...t, days: len } : t));
    const placed = settle(plan, drag.current?.base ?? L.starts, new Map([[id, at]]));
    const depth = depths(plan, id);
    lengths.current.set(id, len);
    plan.forEach((t) => {
      const s = springs.current.get(t.id);
      if (!s) return;
      const target = final ? Math.round(placed.get(t.id)!) : placed.get(t.id)!;
      if (t.id === id) {
        if (final && !reduced) s.set(target);
        else s.jump(target);
        return;
      }
      // Further down the chain, softer: the push arrives a beat later at each step.
      const d = depth.get(t.id) ?? 0;
      const k = 260 / (1 + d * 0.9);
      s.configure({ stiffness: k, damping: 2 * Math.sqrt(k) * 0.72 });
      if (reduced) s.jump(target);
      else s.set(target);
    });
    request();
    return { plan, placed };
  };

  const commit = (id: string, at: number, len: number) => {
    const { plan, placed } = aim(id, Math.round(at), Math.max(1, Math.round(len)), true);
    const next = plan.map((t) => ({ ...t, start: isoOf(origin + Math.round(placed.get(t.id)!)), days: t.id === id ? Math.max(1, Math.round(len)) : t.days }));
    const moved = next.filter((t, i) => t.start !== live.current.tasks[i].start || t.days !== live.current.tasks[i].days);
    setTasks(next);
    onTasksChange?.(next);
    const t = next.find((x) => x.id === id);
    if (t) setSaid(`${t.title}: ${fmtDay(dayOf(t.start))}, ${t.days} ${t.days === 1 ? "day" : "days"}.${moved.length > 1 ? ` ${moved.length - 1} more moved.` : ""}`);
    window.setTimeout(() => springs.current.forEach((s) => s.configure({ stiffness: 260, damping: 26 })), 900);
  };

  const fmtDay = (day: number) => new Date(day * MS).toLocaleDateString(locale, { month: "short", day: "numeric", timeZone: "UTC" });

  const down = (t: TimelineTask, mode: "move" | "resize") => (e: React.PointerEvent) => {
    if (e.button !== 0 || (t.locked && mode === "move")) return;
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { id: t.id, mode, x0: e.clientX, at0: starts.get(t.id) ?? 0, len0: t.days, base: new Map(starts), moved: false };
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x0;
    if (!d.moved && Math.abs(dx) < 4) return;
    if (!d.moved) {
      d.moved = true;
      d.x0 = e.clientX;
      setDragging(d.id);
      return;
    }
    if (d.mode === "move") aim(d.id, Math.max(0, d.at0 + dx / DAY), d.len0, false);
    else aim(d.id, d.at0, Math.max(1, d.len0 + dx / DAY), false);
  };
  const up = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    setDragging(null);
    if (!d || !d.moved) return;
    const dx = e.clientX - d.x0;
    if (d.mode === "move") commit(d.id, Math.max(0, d.at0 + dx / DAY), d.len0);
    else commit(d.id, d.at0, Math.max(1, d.len0 + dx / DAY));
  };

  const key = (t: TimelineTask) => (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const step = e.key === "ArrowRight" ? 1 : -1;
    const at = starts.get(t.id) ?? 0;
    if (e.shiftKey) commit(t.id, at, Math.max(1, t.days + step));
    else if (!t.locked) {
      drag.current = null;
      live.current.starts = starts;
      commit(t.id, Math.max(0, at + step), t.days);
    }
  };

  const columns = Array.from({ length: days }, (_, i) => origin + i);
  const todayAt = today ? dayOf(today) - origin : null;
  const end = Math.max(...tasks.map((t) => (starts.get(t.id) ?? 0) + t.days));

  return (
    // One minmax(0, 1fr) column: the days scroll inside, and never set the card's minimum width.
    <div className={`grid w-full grid-cols-[minmax(0,1fr)] rounded-[22px] bg-background shadow-[0_0_0_1px_var(--border)] ${className}`} {...props}>
      <div aria-hidden="true" data-natural-width className="grid h-0" style={{ gridTemplateColumns: "minmax(0, 720px)" }} />
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 pb-3 pt-4">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-medium tracking-[-0.01em] text-foreground">{title}</p>
          <p className="mt-0.5 text-[12px] text-muted-foreground tabular-nums">
            {fmtDay(origin + Math.min(...tasks.map((t) => starts.get(t.id) ?? 0)))} – {fmtDay(origin + end - 1)} · {end - Math.min(...tasks.map((t) => starts.get(t.id) ?? 0))} days
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-muted-foreground">
          {groups.filter(Boolean).map((g, i) => (
            <span key={g} className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-[2px]" style={{ background: `var(--chart-${(i % 5) + 1}, var(--primary))` }} />
              {g}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5">
            <span className="h-[2px] w-3 rounded-full bg-primary" />
            Critical path
          </span>
        </div>
      </div>

      <div className="overflow-x-auto overscroll-x-contain border-t border-border [scrollbar-width:thin]">
        <div className="relative" style={{ width, height: AXIS + tasks.length * ROW + 10 }} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
          {/* The days: a column each, weekends shaded, month names where a month starts. */}
          {columns.map((day, i) => {
            const date = new Date(day * MS);
            const weekend = date.getUTCDay() === 0 || date.getUTCDay() === 6;
            const monthStart = date.getUTCDate() === 1 || i === 0;
            return (
              <div key={day} aria-hidden="true" className="absolute top-0 h-full" style={{ left: i * DAY, width: DAY, background: weekend ? mix("var(--foreground)", 3) : undefined }}>
                {monthStart && (
                  <span className="absolute left-1.5 top-1.5 whitespace-nowrap text-[10.5px] font-medium text-foreground">
                    {date.toLocaleDateString(locale, { month: "short", timeZone: "UTC" })}
                  </span>
                )}
                <span className="absolute inset-x-0 top-[18px] text-center text-[10.5px] tabular-nums text-muted-foreground">
                  {date.getUTCDate()}
                </span>
                <span className="absolute bottom-0 left-0 w-px" style={{ top: AXIS, background: date.getUTCDay() === 1 ? mix("var(--foreground)", 8) : "transparent" }} />
              </div>
            );
          })}
          <div aria-hidden="true" className="absolute inset-x-0 border-b border-border" style={{ top: AXIS - 1 }} />
          {todayAt !== null && todayAt >= 0 && todayAt < days && (
            <div aria-hidden="true" className="absolute bottom-0 w-px bg-primary" style={{ left: todayAt * DAY + DAY / 2, top: AXIS - 6 }}>
              <span className="absolute -left-[3px] -top-[3px] size-[7px] rounded-full bg-primary" />
            </div>
          )}

          <div className="absolute inset-x-0" style={{ top: AXIS }}>
            <svg aria-hidden="true" className="pointer-events-none absolute left-0 top-0 overflow-visible" width={width} height={tasks.length * ROW}>
              <defs>
                <marker id="timeline-tip" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M0 0 L6 3 L0 6 z" fill="context-stroke" />
                </marker>
              </defs>
              {tasks.flatMap((t) =>
                (t.after ?? []).map((p) => (
                  <path
                    key={`${p}>${t.id}`}
                    ref={(el) => {
                      if (el) lineRefs.current.set(`${p}>${t.id}`, el);
                      else lineRefs.current.delete(`${p}>${t.id}`);
                    }}
                    fill="none"
                    strokeWidth={1.4}
                    strokeLinecap="round"
                    markerEnd="url(#timeline-tip)"
                    className="stroke-[color-mix(in_oklab,var(--foreground)_28%,transparent)] transition-[stroke] duration-300 data-[state=clash]:stroke-red-500 data-[state=critical]:stroke-primary dark:data-[state=clash]:stroke-red-400"
                  />
                )),
              )}
            </svg>

            <ul aria-label={title}>
              {tasks.map((t, i) => {
                const color = colorOf(t);
                const lit = critical.has(t.id);
                const short = t.days <= 2;
                return (
                  <li key={t.id} className="absolute left-0" style={{ top: i * ROW + (ROW - BAR) / 2, height: BAR }}>
                    <div
                      ref={(el) => {
                        if (el) barRefs.current.set(t.id, el);
                        else barRefs.current.delete(t.id);
                      }}
                      role="button"
                      tabIndex={0}
                      aria-roledescription="task bar"
                      aria-label={`${t.title}, ${fmtDay(origin + (starts.get(t.id) ?? 0))}, ${t.days} ${t.days === 1 ? "day" : "days"}${t.locked ? ", locked" : ""}${lit ? ", on the critical path" : ""}`}
                      aria-keyshortcuts="ArrowLeft ArrowRight Shift+ArrowLeft Shift+ArrowRight"
                      onPointerDown={down(t, "move")}
                      onKeyDown={key(t)}
                      className={`group absolute left-0 top-0 flex h-full touch-none select-none items-center rounded-[8px] ${t.locked ? "cursor-default" : dragging === t.id ? "cursor-grabbing" : "cursor-grab"} ${FOCUS}`}
                      style={{
                        background: `linear-gradient(90deg, ${mix(color, 26, "var(--background)")}, ${mix(color, 14, "var(--background)")})`,
                        boxShadow: `inset 0 0 0 1px ${lit ? color : mix(color, 40, "transparent")}`,
                        willChange: "transform",
                      }}
                    >
                      <span className="absolute inset-y-[5px] left-[5px] w-[3px] rounded-full" style={{ background: color }} />
                      <span
                        className={`pointer-events-none flex items-center gap-1 whitespace-nowrap pl-3.5 pr-2 text-[12px] font-medium text-foreground ${short ? "absolute left-full ml-1.5 pl-0" : "min-w-0 truncate"}`}
                      >
                        {t.locked && <Lock aria-hidden="true" className="size-3 shrink-0 text-muted-foreground" />}
                        <span className="truncate">{t.title}</span>
                      </span>
                      {!t.locked && (
                        <span
                          aria-hidden="true"
                          onPointerDown={down(t, "resize")}
                          className="absolute inset-y-0 -right-1 w-3 cursor-ew-resize touch-none"
                        >
                          <span className="absolute inset-y-[7px] right-[5px] w-[2px] rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100" style={{ background: color }} />
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
      <p className="px-4 py-2.5 text-[11.5px] text-muted-foreground">
        Drag a task to move it, its edge to change its length. Tasks that wait on it follow.
      </p>
      <p className="sr-only" aria-live="polite">
        {said}
      </p>
    </div>
  );
}
