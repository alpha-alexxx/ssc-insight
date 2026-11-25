"use client";

import * as React from "react";
import {
  LIQUID_BEHIND,
  LIQUID_FRONT,
  LIQUID_PINCH,
  LIQUID_REACH,
  LIQUID_WIDTH,
} from "./liquid-tabs";
import {
  createSpring,
  rubberBand,
  useInteractionReducedMotion,
  type Spring,
} from "./ui-interaction-motion";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────
 * LIQUID NAV: vertical spring-physics highlight rail
 *
 *   pick     the highlight glides to the selected row; on a
 *            jump the leading edge advances first and the
 *            trailing edge follows a moment later, drawing
 *            out slightly and pinching at the waist before
 *            settling cleanly into the row's exact geometry
 *   far      maximum draw distance is rubber-banded so
 *            crossing multiple groups stays composed
 *   settled  zero idle work when stationary: no filters,
 *            no layout thrashing, no RAF loops
 * ───────────────────────────────────────────────────────── */

export interface LiquidNavProps {
  /** `value` of the row that owns the highlight — matched against `data-liquid-nav`. */
  active?: string;
  children: React.ReactNode;
  /** Padding / width of the list container. Coordinates are measured relative to this root. */
  className?: string;
  /** Classes for the inner stacking layer holding the navigation groups. */
  contentClassName?: string;
  /** Fill colour of the liquid drop. Defaults to `var(--primary)`. */
  color?: string;
}

type Mark = {
  x: number;
  w: number;
  y: number;
  h: number;
  r: number;
};

const clamp = (n: number, low: number, high: number) =>
  Math.min(high, Math.max(low, n));
const n1 = (n: number) => Math.round(n * 100) / 100;

/**
 * Computes the SVG path for the vertical liquid highlight.
 *
 * Pure function of its coordinates so mid-flight interruptions smoothly
 * redirect from the current spring state without resetting.
 *
 * @param top          Current Y coordinate of the top edge.
 * @param bottom       Current Y coordinate of the bottom edge.
 * @param rest         Resting height of the target row.
 * @param left         Left X coordinate of the row.
 * @param right        Right X coordinate of the row.
 * @param cornerRadius Optional explicit border radius (defaults to `rest / 2`).
 */
export function liquidVerticalPath(
  top: number,
  bottom: number,
  rest: number,
  left: number,
  right: number,
  cornerRadius: number = rest / 2,
): string {
  const cx = (left + right) / 2;
  const halfW = Math.max(0, (right - left) / 2);
  const spanY = Math.max(0, bottom - top);
  const mid = (top + bottom) / 2;

  const r = Math.max(0, Math.min(cornerRadius, rest / 2, halfW, spanY / 2));

  // Full pinch at the cap's worth of travel, easing in and out so a short hop barely pinches.
  const drawn = clamp((spanY - rest) / Math.max(1, halfW), 0, 1);
  const waist = Math.max(0, halfW - halfW * LIQUID_PINCH * drawn * (2 - drawn));

  // Vertical tangents at both ends ensure C1 continuity where the cubic curves meet the corner arcs.
  const side = (x0: number, y0: number, x1: number, y1: number) => {
    const half = n1((y0 + y1) / 2);
    return `C${n1(x0)} ${half} ${n1(x1)} ${half} ${n1(x1)} ${n1(y1)}`;
  };

  return (
    `M${n1(left)} ${n1(top + r)}` +
    `A${n1(r)} ${n1(r)} 0 0 1 ${n1(left + r)} ${n1(top)}` +
    `H${n1(right - r)}` +
    `A${n1(r)} ${n1(r)} 0 0 1 ${n1(right)} ${n1(top + r)}` +
    side(right, top + r, cx + waist, mid) +
    side(cx + waist, mid, right, bottom - r) +
    `A${n1(r)} ${n1(r)} 0 0 1 ${n1(right - r)} ${n1(bottom)}` +
    `H${n1(left + r)}` +
    `A${n1(r)} ${n1(r)} 0 0 1 ${n1(left)} ${n1(bottom - r)}` +
    side(left, bottom - r, cx - waist, mid) +
    side(cx - waist, mid, left, top + r) +
    `Z`
  );
}

export function LiquidNav({
  active,
  children,
  className,
  contentClassName,
  color = "var(--primary)",
}: LiquidNavProps) {
  const reduced = useInteractionReducedMotion();
  const [measured, setMeasured] = React.useState(false);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const pathRef = React.useRef<SVGPathElement>(null);
  const springs = React.useRef<{
    top: Spring;
    bottom: Spring;
    size: Spring;
  } | null>(null);
  const motion = React.useRef({ heading: 1, hidden: true });
  const marks = React.useRef(new Map<string, Mark>());

  const activeRef = React.useRef(active);
  React.useLayoutEffect(() => {
    activeRef.current = active;
  }, [active]);

  const paint = React.useCallback(() => {
    const s = springs.current;
    const path = pathRef.current;
    if (!s || !path) return;

    const mark = activeRef.current
      ? marks.current.get(activeRef.current)
      : undefined;

    if (!mark) {
      if (!motion.current.hidden) {
        motion.current.hidden = true;
        path.setAttribute("d", "");
      }
      return;
    }

    const size = s.size.get();
    let top = s.top.get();
    let bottom = s.bottom.get();

    // Bound maximum stretch relative to the row's height with a smooth rubber-band ceiling.
    const most = size + size * LIQUID_REACH;
    const over = bottom - top - most;
    if (over > 0) {
      const kept = rubberBand(over, size * 0.3);
      if (motion.current.heading > 0) top = bottom - most - kept;
      else bottom = top + most + kept;
    }

    path.setAttribute(
      "d",
      liquidVerticalPath(top, bottom, size, mark.x, mark.x + mark.w, mark.r),
    );
  }, []);

  const measure = React.useCallback(() => {
    const root = rootRef.current;
    if (!root) return false;
    const base = root.getBoundingClientRect();
    marks.current.clear();

    root.querySelectorAll<HTMLElement>("[data-liquid-nav]").forEach((el) => {
      const key = el.dataset.liquidNav;
      if (!key) return;
      const box = el.getBoundingClientRect();
      if (!box.width || !box.height) return;

      const parsedRadius = parseFloat(
        window.getComputedStyle(el).borderTopLeftRadius,
      );
      const r =
        Number.isFinite(parsedRadius) && parsedRadius > 0
          ? parsedRadius
          : box.height / 2;

      marks.current.set(key, {
        x: box.left - base.left,
        w: box.width,
        y: box.top - base.top,
        h: box.height,
        r,
      });
    });

    return true;
  }, []);

  const aim = React.useCallback(
    (next: string | undefined, instant: boolean) => {
      const s = springs.current;
      const path = pathRef.current;
      if (!s || !path) return;

      const mark = next ? marks.current.get(next) : undefined;
      if (!mark) {
        motion.current.hidden = true;
        s.top.stop();
        s.bottom.stop();
        s.size.stop();
        path.setAttribute("d", "");
        return;
      }

      if (instant || motion.current.hidden) {
        motion.current.hidden = false;
        s.top.jump(mark.y);
        s.bottom.jump(mark.y + mark.h);
        s.size.jump(mark.h);
        paint();
        return;
      }

      const currentMid = (s.top.get() + s.bottom.get()) / 2;
      const targetMid = mark.y + mark.h / 2;
      motion.current.heading = targetMid >= currentMid ? 1 : -1;

      (motion.current.heading > 0 ? s.bottom : s.top).configure(LIQUID_FRONT);
      (motion.current.heading > 0 ? s.top : s.bottom).configure(LIQUID_BEHIND);

      s.top.set(mark.y);
      s.bottom.set(mark.y + mark.h);
      s.size.set(mark.h);
      paint();
    },
    [paint],
  );

  // Initial measurement, spring creation, and layout resize observation.
  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !measure()) return;

    const start = activeRef.current
      ? marks.current.get(activeRef.current)
      : undefined;

    const s = {
      top: createSpring(start?.y ?? 0, LIQUID_FRONT, paint),
      bottom: createSpring(start ? start.y + start.h : 0, LIQUID_BEHIND, paint),
      size: createSpring(start?.h ?? 0, LIQUID_WIDTH, paint),
    };

    springs.current = s;
    if (start) motion.current.hidden = false;
    paint();
    setMeasured(true);

    let first = true;
    const observer = new ResizeObserver(() => {
      if (first) {
        first = false;
        return;
      }
      measure();
      aim(activeRef.current, true);
    });

    observer.observe(root);

    void document.fonts?.ready.then(() => {
      if (springs.current !== s) return;
      measure();
      aim(activeRef.current, true);
    });

    return () => {
      observer.disconnect();
      s.top.stop();
      s.bottom.stop();
      s.size.stop();
      springs.current = null;
    };
  }, [measure, aim, paint]);

  // Re-measure and animate whenever the active view changes.
  const shownRef = React.useRef<string | undefined>(undefined);
  React.useLayoutEffect(() => {
    if (shownRef.current === active) return;
    shownRef.current = active;
    if (!springs.current) return;
    measure();
    aim(active, reduced);
  }, [active, measure, aim, reduced]);

  return (
    <div ref={rootRef} className={cn("relative isolate", className)}>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 size-full overflow-visible [contain:layout]"
        style={{ opacity: measured ? 1 : 0 }}
      >
        <path ref={pathRef} fill={color} />
      </svg>
      <div className={cn("relative z-10", contentClassName)}>{children}</div>
    </div>
  );
}

export default LiquidNav;
