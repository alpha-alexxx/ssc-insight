"use client";

import * as React from "react";

/**
 * The light Afterglow runs is handed to a WebGL shader and to the glint's
 * gradient strings, so it needs concrete colours — it cannot read
 * `var(--primary)` (an invalid `fillStyle` silently falls back to black).
 *
 * These three read the active palette at play time and normalise each token
 * to `rgb()`, so the light belongs to whichever of the six palettes and the
 * two modes is on screen instead of being a fixed warm/rose/blue that only
 * looks right on the default theme.
 *
 * Order matters: warm light ahead of the front, the fringe behind it, and
 * the clear light in its wake.
 */

export type AfterglowColors = [string, string, string];

/** Palette tokens the light is drawn from — front, fringe, wake. */
const TOKENS = ["--primary", "--warning", "--chart-2"] as const;

/** Used before mount, under reduced motion, or where the palette is unreadable. */
export const FALLBACK_AFTERGLOW_COLORS: AfterglowColors = [
  "#b4532a",
  "#c99a3f",
  "#5b7bb5",
];

/** Any CSS colour → `rgb(r, g, b)` through a 1px canvas, or null when unreadable. */
function toRgbString(color: string): string | null {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = "#000";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  if (a === 0) return null;
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Read the three light colours off the document's live tokens.
 *
 * A probe element is the only reliable way to resolve a token to a real
 * colour (the browser does the OKLCH → sRGB work for us); it is removed
 * before returning so nothing is left in the tree.
 */
export function resolveAfterglowColors(
  fallback: AfterglowColors = FALLBACK_AFTERGLOW_COLORS,
): AfterglowColors {
  if (typeof window === "undefined" || !document.body) return fallback;
  const probe = document.createElement("span");
  probe.setAttribute("aria-hidden", "true");
  Object.assign(probe.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "0",
    height: "0",
    opacity: "0",
    pointerEvents: "none",
  });
  document.body.appendChild(probe);
  try {
    return TOKENS.map((token, index) => {
      probe.style.color = `var(${token})`;
      const computed = getComputedStyle(probe).color;
      return toRgbString(computed) ?? fallback[index]!;
    }) as AfterglowColors;
  } finally {
    probe.remove();
  }
}

/**
 * The light colours for the current palette, re-read whenever the theme or
 * palette changes. Undefined until mount, so the server render and the first
 * client render agree; the light is only ever played after mount.
 */
export function useAfterglowColors(): AfterglowColors | undefined {
  const [colors, setColors] = React.useState<AfterglowColors | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const read = () => setColors(resolveAfterglowColors());
    read();
    // next-themes writes `class` on <html>; the palette provider writes
    // `data-theme`. Either one changes the three tokens.
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  return colors;
}
