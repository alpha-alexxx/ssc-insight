"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Measures an element's content-box width so hand-rolled SVG charts can draw
 * in real pixel coordinates (crisp strokes, no viewBox letterboxing). Charts
 * render nothing until the first measurement arrives.
 */
export function useSize<T extends HTMLElement>(): [
  React.RefObject<T | null>,
  number,
] {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(Math.round(el.getBoundingClientRect().width));
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      setWidth(Math.round(w));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, width];
}

/** A gentle Catmull-Rom-ish smoothing for polyline paths (tension 0.2). */
export function smoothPath(pts: [number, number][]): string {
  if (pts.length === 0) return "";
  if (pts.length === 1)
    return `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  const t = 0.2;
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) * t;
    const c1y = p1[1] + (p2[1] - p0[1]) * t;
    const c2x = p2[0] - (p3[0] - p1[0]) * t;
    const c2y = p2[1] - (p3[1] - p1[1]) * t;
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

/** A padded, 10s-rounded y domain that always contains the target line. */
export function niceDomain(
  values: number[],
  target: number | null,
): [number, number] {
  const withTarget = target !== null ? [...values, target] : values;
  let min = withTarget.length ? Math.min(...withTarget) : 0;
  let max = withTarget.length ? Math.max(...withTarget) : 100;
  min = Math.max(0, Math.floor((min - 4) / 10) * 10);
  max = Math.min(100, Math.ceil((max + 4) / 10) * 10);
  if (max - min < 20) max = Math.min(100, min + 20);
  return [min, max];
}
