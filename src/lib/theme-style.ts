export const PALETTE_STORAGE_KEY = "ssc.palette";
export const STYLE_STORAGE_KEY = "ssc.style";
export const DEFAULT_PALETTE = "orange" as const;
export const DEFAULT_STYLE = "mira" as const;

export const PALETTES = [
  {
    id: "orange",
    label: "Terracotta",
    description: "The original warm editorial paper.",
    canvas: "#f4f1e8",
    paper: "#faf8f2",
    accent: "#b65335",
  },
  {
    id: "blue",
    label: "Blue",
    description: "Cool, precise, data-first.",
    canvas: "#eef0f3",
    paper: "#f9fafb",
    accent: "#2563eb",
  },
  {
    id: "lime",
    label: "Lime",
    description: "Fresh, analytical, grounded.",
    canvas: "#f0f2e6",
    paper: "#f9faf2",
    accent: "#4d7c0f",
  },
  {
    id: "violet",
    label: "Violet",
    description: "Sophisticated and modern.",
    canvas: "#f1eff5",
    paper: "#faf9fd",
    accent: "#6d28d8",
  },
  {
    id: "rose",
    label: "Rose",
    description: "Elegant, warm, editorial.",
    canvas: "#f5eff1",
    paper: "#fcf8f9",
    accent: "#be123c",
  },
  {
    id: "graphite",
    label: "Graphite",
    description: "Monochrome silver and black, with a quiet metallic sheen.",
    canvas: "#ececee",
    paper: "#f7f7f8",
    accent: "#1a1a1e",
  },
] as const;

export const STYLES = [
  {
    id: "mira",
    label: "Mira · Refined",
    description:
      "Refined: compact rhythm, softened geometry, quiet depth.",
  },
  {
    id: "sera",
    label: "Sera · Brutal",
    description:
      "Brutal: ink-weight rules, hard offset shadows, decisive.",
  },
] as const;

export type PaletteId = (typeof PALETTES)[number]["id"];
export type StyleId = (typeof STYLES)[number]["id"];

const PALETTE_IDS = new Set<PaletteId>(PALETTES.map(({ id }) => id));
const STYLE_IDS = new Set<StyleId>(STYLES.map(({ id }) => id));

export function normalizePalette(value: unknown): PaletteId {
  return typeof value === "string" && PALETTE_IDS.has(value as PaletteId)
    ? (value as PaletteId)
    : DEFAULT_PALETTE;
}

export function normalizeStyle(value: unknown): StyleId {
  return typeof value === "string" && STYLE_IDS.has(value as StyleId)
    ? (value as StyleId)
    : DEFAULT_STYLE;
}

const PALETTE_IDS_FOR_SCRIPT = JSON.stringify(PALETTES.map(({ id }) => id));
const STYLE_IDS_FOR_SCRIPT = JSON.stringify(STYLES.map(({ id }) => id));

/** Runs before paint to set both <html> preference attributes. */
export const THEME_PREFS_SCRIPT: string = `(function(){var d=document.documentElement;var p="${DEFAULT_PALETTE}";var s="${DEFAULT_STYLE}";try{var ps=${PALETTE_IDS_FOR_SCRIPT};var pv=localStorage.getItem("${PALETTE_STORAGE_KEY}");if(ps.indexOf(pv)!==-1)p=pv;var ss=${STYLE_IDS_FOR_SCRIPT};var sv=localStorage.getItem("${STYLE_STORAGE_KEY}");if(ss.indexOf(sv)!==-1){s=sv}else{localStorage.setItem("${STYLE_STORAGE_KEY}","${DEFAULT_STYLE}")}}catch(e){}d.dataset.palette=p;d.dataset.style=s})();`;

type MotionSpec = {
  duration: number;
  ease: "circOut" | "easeOut";
};

const VIEW_TRANSITIONS = {
  mira: { duration: 0.2, ease: "easeOut" },
  sera: { duration: 0.16, ease: "circOut" },
} satisfies Record<StyleId, MotionSpec>;

const MICRO_MOTIONS = {
  mira: { duration: 0.18, ease: "easeOut" },
  sera: { duration: 0.14, ease: "circOut" },
} satisfies Record<StyleId, MotionSpec>;

export function viewTransition(style: StyleId): MotionSpec {
  return VIEW_TRANSITIONS[style];
}

export function microMotion(style: StyleId): MotionSpec {
  return MICRO_MOTIONS[style];
}
