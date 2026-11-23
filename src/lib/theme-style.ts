export const PALETTE_STORAGE_KEY = "ssc.palette.v2";
const LEGACY_STORAGE_KEY = "ssc.palette";
export const DEFAULT_THEME = "graphite" as const;

export const THEMES = [
  {
    id: "terracotta",
    label: "Terracotta",
    description: "Warm editorial brick, the study-desk classic.",
    swatch: "oklch(0.52 0.16 40)",
  },
  {
    id: "blue",
    label: "Blue",
    description: "Cool, precise, data-first.",
    swatch: "oklch(0.51 0.16 255)",
  },
  {
    id: "lime",
    label: "Lime",
    description: "Fresh, analytical, grounded.",
    swatch: "oklch(0.50 0.15 125)",
  },
  {
    id: "violet",
    label: "Violet",
    description: "Sophisticated and modern.",
    swatch: "oklch(0.52 0.16 295)",
  },
  {
    id: "rose",
    label: "Rose",
    description: "Elegant, warm, editorial.",
    swatch: "oklch(0.52 0.16 10)",
  },
  {
    id: "graphite",
    label: "Graphite",
    description: "Quiet monochrome silver and ink.",
    swatch: "oklch(0.42 0.012 260)",
  },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

const THEME_IDS = new Set<ThemeId>(THEMES.map(({ id }) => id));

export function normalizeTheme(value: unknown): ThemeId {
  return typeof value === "string" && THEME_IDS.has(value as ThemeId)
    ? (value as ThemeId)
    : DEFAULT_THEME;
}

/** Old palette ids from the previous design system, mapped forward. */
const LEGACY_IDS: Record<string, ThemeId> = { orange: "terracotta" };

const THEME_IDS_FOR_SCRIPT = JSON.stringify(THEMES.map(({ id }) => id));

/**
 * Runs before paint to set the palette attribute on <html>.
 * Reads v2 storage, falling back to the legacy key (orange -> terracotta).
 */
export const THEME_PREFS_SCRIPT: string = `(function(){var d=document.documentElement;var p="${DEFAULT_THEME}";try{var ps=${THEME_IDS_FOR_SCRIPT};var pv=localStorage.getItem("${PALETTE_STORAGE_KEY}");if(pv===null){pv=localStorage.getItem("${LEGACY_STORAGE_KEY}");if(pv==="orange"){pv="terracotta"}}if(ps.indexOf(pv)!==-1)p=pv}catch(e){}d.dataset.theme=p})();
`;
