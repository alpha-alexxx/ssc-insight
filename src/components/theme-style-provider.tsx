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
  DEFAULT_THEME,
  PALETTE_STORAGE_KEY,
  normalizeTheme,
  THEMES,
  type ThemeId,
} from "@/lib/theme-style";

export { PALETTE_STORAGE_KEY, THEMES, THEME_PREFS_SCRIPT } from "@/lib/theme-style";
export type { ThemeId } from "@/lib/theme-style";

/**
 * Client state and persistence for the palette preference (`data-theme` on
 * <html>), orthogonal to next-themes' light/dark setting.
 *
 * The pure contract and before-paint migration live in `lib/theme-style`.
 * This provider normalizes the prepaint attribute into React state and keeps
 * state, <html>, and localStorage aligned after user changes.
 */

function persist(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Preference is non-essential; private modes may refuse writes.
  }
}

type ThemePrefs = {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
};

const ThemePrefsContext = createContext<ThemePrefs | null>(null);

// Lazy initializers read and normalize the <html> attribute set before paint.
// The provider renders no markup of its own, so there is no hydration surface.
function initialTheme(): ThemeId {
  if (typeof document === "undefined") return DEFAULT_THEME;
  return normalizeTheme(document.documentElement.dataset.theme);
}

export function ThemeStyleProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(initialTheme);

  const setTheme = useCallback((next: ThemeId) => {
    setThemeState(next);
    document.documentElement.dataset.theme = next;
    persist(PALETTE_STORAGE_KEY, next);
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemePrefsContext.Provider value={value}>{children}</ThemePrefsContext.Provider>;
}

export function useThemePrefs(): ThemePrefs {
  const ctx = useContext(ThemePrefsContext);
  if (!ctx) throw new Error("useThemePrefs must be used inside <ThemeStyleProvider>");
  return ctx;
}
