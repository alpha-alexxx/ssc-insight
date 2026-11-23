"use client";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_PALETTE,
  DEFAULT_STYLE,
  PALETTE_STORAGE_KEY,
  STYLE_STORAGE_KEY,
  normalizePalette,
  normalizeStyle,
  type PaletteId,
  type StyleId,
} from "@/lib/theme-style";

export {
  PALETTE_STORAGE_KEY,
  STYLE_STORAGE_KEY,
  PALETTES,
  STYLES,
  THEME_PREFS_SCRIPT,
  microMotion,
  viewTransition,
} from "@/lib/theme-style";
export type { PaletteId, StyleId } from "@/lib/theme-style";

/**
 * Client state and persistence for palette × style preferences, orthogonal to
 * next-themes' light/dark setting.
 *
 * The pure contract and before-paint migration live in `lib/theme-style`.
 * This provider normalizes those prepaint data attributes into React state and
 * keeps state, <html>, and localStorage aligned after user changes.
 */

function persist(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Preference is non-essential; private modes may refuse writes.
  }
}

type ThemePrefs = {
  palette: PaletteId;
  style: StyleId;
  setPalette: (palette: PaletteId) => void;
  setStyle: (style: StyleId) => void;
};

const ThemePrefsContext = createContext<ThemePrefs | null>(null);

// Lazy initializers read and normalize the <html> attributes set before paint.
// The provider renders no markup of its own, so there is no hydration surface.
function initialPalette(): PaletteId {
  if (typeof document === "undefined") return DEFAULT_PALETTE;
  return normalizePalette(document.documentElement.dataset.palette);
}

function initialStyle(): StyleId {
  if (typeof document === "undefined") return DEFAULT_STYLE;
  return normalizeStyle(document.documentElement.dataset.style);
}

export function ThemeStyleProvider({ children }: { children: ReactNode }) {
  const [palette, setPaletteState] = useState<PaletteId>(initialPalette);
  const [style, setStyleState] = useState<StyleId>(initialStyle);

  const setPalette = useCallback((next: PaletteId) => {
    setPaletteState(next);
    document.documentElement.dataset.palette = next;
    persist(PALETTE_STORAGE_KEY, next);
  }, []);
  const setStyle = useCallback((next: StyleId) => {
    setStyleState(next);
    document.documentElement.dataset.style = next;
    persist(STYLE_STORAGE_KEY, next);
  }, []);

  const value = useMemo(
    () => ({ palette, style, setPalette, setStyle }),
    [palette, style, setPalette, setStyle],
  );
  return (
    <ThemePrefsContext.Provider value={value}>
      {children}
    </ThemePrefsContext.Provider>
  );
}

export function useThemePrefs(): ThemePrefs {
  const ctx = useContext(ThemePrefsContext);
  if (!ctx)
    throw new Error("useThemePrefs must be used inside ThemeStyleProvider");
  return ctx;
}
