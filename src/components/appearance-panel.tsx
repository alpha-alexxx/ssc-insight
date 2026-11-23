"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Icon, PlainIcon } from "@/components/icon";
import { SparklesIcon } from "@/components/animate-ui/icons/hugeicons/sparkles";
import { ThemeToggle } from "@/components/theme-toggle";
import { THEMES, type ThemeId } from "@/lib/theme-style";
import { useThemePrefs } from "@/components/theme-style-provider";
import { cn } from "@/lib/utils";

/**
 * Appearance — the palette selection experience (Settings).
 * Hairline rebuild: one axis (the six color palettes; the style axis is gone
 * — Hairline's own geometry is the only look) plus next-themes dark mode.
 * Choices apply instantly (the tokens re-skin the whole app, which IS the
 * live preview) and persist via the ThemeStyleProvider. Selected state
 * renders only after mount: the before-paint script owns the <html>
 * attribute, so reading it during SSR would cause a hydration mismatch.
 */

/** Swatch preview: background field, card half with an accent bar, accent half. */
function PaletteChip({ swatch }: { swatch: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-9 w-full overflow-hidden rounded-full border border-border"
      style={{ background: "var(--background)" }}
    >
      <span className="flex w-1/2" style={{ background: "var(--card)" }}>
        <span className="m-1.5 h-2.5 flex-1 self-end rounded-full" style={{ background: swatch }} />
      </span>
      <span className="w-1/2" style={{ background: swatch, opacity: 0.85 }} />
    </span>
  );
}

export function AppearancePanel() {
  const { theme, setTheme } = useThemePrefs();
  // Selected states depend on <html> attributes set before paint; wait for
  // mount so the server-rendered markup (all unselected) matches hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Mounted gate: one-shot hydration-safety flag (React's documented
    // pattern for reading client-only state in render output).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <section
      aria-labelledby="appearance-heading"
      className="rounded-2xl bg-card text-card-foreground shadow-[inset_0_0_0_1px_var(--border)]"
    >
      <div className="flex items-center gap-3 border-b border-border p-4 sm:p-6">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
          <SparklesIcon size={18} color="var(--primary)" animateOnView animateOnViewOnce />
        </span>
        <div>
          <h2 id="appearance-heading" className="text-base font-semibold text-foreground">
            Appearance
          </h2>
          <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
            Pick a color palette — the change applies everywhere instantly.
          </p>
        </div>
      </div>

      <div className="p-4 pt-3 sm:p-6 sm:pt-3">
        <fieldset className="border-0 p-0">
          <legend className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Color palette
          </legend>
          <div
            role="radiogroup"
            aria-label="Color palette"
            className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6"
          >
            {THEMES.map((t) => {
              const selected = mounted && theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={`${t.label} palette`}
                  title={t.description}
                  onClick={() => setTheme(t.id as ThemeId)}
                  className={cn(
                    "flex flex-col gap-2 rounded-2xl p-2 text-left transition-colors",
                    selected
                      ? "bg-accent text-accent-foreground shadow-[inset_0_0_0_1px_var(--primary)]"
                      : "bg-secondary text-secondary-foreground hover:bg-accent",
                  )}
                >
                  <PaletteChip swatch={t.swatch} />
                  <span className="flex items-center gap-1 text-[12px] font-medium">
                    {selected && <PlainIcon name="check" size={12} tone="primary" />}
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
          <div>
            <p className="text-[13px] font-medium text-foreground">Dark mode</p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
              Follows your system by default; palettes adapt to both modes.
            </p>
          </div>
          <ThemeToggleNextBridge />
        </div>
      </div>
    </section>
  );
}

/** Hairline ThemeToggle driven by next-themes (the app's source of truth). */
function ThemeToggleNextBridge() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <ThemeToggle
      value={resolvedTheme === "dark" ? "dark" : "light"}
      onValueChange={(next) => setTheme(next)}
      className="shrink-0"
    />
  );
}
