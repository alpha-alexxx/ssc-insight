import type * as React from "react";

export type LacquerTone = "cobalt" | "ember" | "rose" | "emerald" | "midnight" | "violet";

export const LACQUER: Record<LacquerTone, string> = {
  cobalt: "#3462eb",
  ember: "#ce3e1a",
  rose: "#d0306c",
  emerald: "#0f9f74",
  midnight: "#3a4fd6",
  violet: "#7e22f5",
};

/** Any named tone or CSS colour, as the colour the lacquer is mixed from. */
export const toneColor = (tone: LacquerTone | (string & {})) => (tone in LACQUER ? LACQUER[tone as LacquerTone] : tone);

const BASE = "#060609";

type Rgb = [number, number, number];
const hex = (h: string): Rgb | null => {
  const m = /^#([0-9a-f]{6})$/i.exec(h.trim());
  return m ? [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16)] : null;
};
const rgba = ([r, g, b]: Rgb, a = 1) => `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`;
const blend = (a: Rgb, b: Rgb, t: number): Rgb => [a[0] * t + b[0] * (1 - t), a[1] * t + b[1] * (1 - t), a[2] * t + b[2] * (1 - t)];

/**
 * A tone mixed with another colour: `share` of the tone (0 to 1). Plain rgba() for hex colours (named tones included);
 * anything else (oklch(), a theme variable) falls back to color-mix(), which needs a browser that paints it.
 */
export function mixTone(tone: LacquerTone | (string & {}), share: number, other: "transparent" | (string & {}) = "transparent") {
  const t = hex(toneColor(tone));
  const o = other === "transparent" ? null : hex(other);
  if (t && other === "transparent") return rgba(t, share);
  if (t && o) return rgba(blend(t, o, share));
  return `color-mix(in oklab, ${toneColor(tone)} ${Math.round(share * 100)}%, ${other})`;
}

/** The lacquer as inline styles: background, the lit top edge and a hairline border. Text on it is white. */
export function lacquer(tone: LacquerTone | (string & {})): React.CSSProperties {
  const m = (share: number, over: "transparent" | (string & {}) = "transparent") => mixTone(tone, share, over);
  return {
    background: [
      `radial-gradient(88% 78% at 10% 8%, ${m(0.74)} 0%, ${m(0.32)} 46%, transparent 76%)`,
      `radial-gradient(82% 76% at 92% 96%, ${m(0.6)} 0%, ${m(0.26)} 52%, transparent 80%)`,
      `linear-gradient(150deg, ${m(0.34, BASE)} 0%, ${m(0.09, BASE)} 52%, ${m(0.28, BASE)} 100%)`,
    ].join(", "),
    // Set after the shorthand, so a gradient a browser can't paint still leaves the card dark.
    backgroundColor: BASE,
    boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.26), inset 0 -1px 0 rgb(0 0 0 / 0.35)",
    border: "1px solid rgb(255 255 255 / 0.14)",
    color: "#fff",
    colorScheme: "dark",
  };
}
