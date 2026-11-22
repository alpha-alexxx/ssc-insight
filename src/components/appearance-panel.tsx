"use client";
import { useEffect, useState } from "react";
import {
  PALETTES,
  STYLES,
  type PaletteId,
  type StyleId,
} from "@/lib/theme-style";
import { Panel } from "./dashboard-panels";
import { ThemeToggle } from "./theme-toggle";
import { useThemePrefs } from "./theme-style-provider";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

/**
 * Appearance — the palette × style selection experience (Settings).
 * Choices apply instantly (the tokens re-skin the whole app, which IS the
 * live preview) and persist via the ThemeStyleProvider. Both pickers are
 * shadcn ToggleGroups (single selection) in the card variant: Radix owns
 * the roving focus, `aria-pressed` and `data-state`, and the group's
 * `value` owns the selection. Selected states render only after mount:
 * the before-paint script owns the <html> attributes, so reading them
 * during SSR would cause a hydration mismatch.
 */

/** Swatch preview: canvas field, paper half with an accent bar, accent half. */
function PaletteChip({ palette }: { palette: (typeof PALETTES)[number] }) {
  return (
    <>
      <span
        aria-hidden="true"
        className="flex h-9 w-full overflow-hidden rounded-control border border-rule-soft"
        style={{ background: palette.canvas }}
      >
        <span className="flex w-1/2" style={{ background: palette.paper }}>
          <span
            className="m-1.5 h-2.5 flex-1 self-end rounded-[calc(var(--radius-control)/2)]"
            style={{ background: palette.accent }}
          />
        </span>
        <span
          className="w-1/2"
          style={{ background: palette.accent, opacity: 0.85 }}
        />
      </span>
      <span className="text-xs font-medium text-ink">{palette.label}</span>
    </>
  );
}

/** Mini wireframes that demonstrate each style's actual geometry. */
function StyleGlyph({ style }: { style: StyleId }) {
  switch (style) {
    case "mira":
      return (
        <span
          aria-hidden="true"
          className="block h-14 w-full rounded-[0.75rem] border border-rule-soft p-1.5"
        >
          <span className="mb-1 block h-1 w-3/5 rounded-[0.5rem] bg-ink" />
          <span className="mb-1 block h-2.5 w-full rounded-[0.5rem] bg-soft" />
          <span className="flex gap-1">
            <span className="h-2.5 flex-1 rounded-[0.5rem] bg-soft" />
            <span className="h-2.5 flex-1 rounded-[0.5rem] bg-soft" />
            <span className="h-2.5 flex-1 rounded-[0.5rem] bg-soft" />
          </span>
        </span>
      );
    case "sera":
      return (
        <span
          aria-hidden="true"
          className="block h-14 w-full rounded-none border-2 border-ink p-1.5"
          style={{ boxShadow: "0.25rem 0.25rem 0 0 var(--ink)" }}
        >
          <span className="mb-1 block h-1.5 w-3/4 bg-ink" />
          <span className="mb-1 block h-4 w-full border border-ink bg-accent-soft" />
          <span className="block h-2 w-1/2 border border-ink" />
        </span>
      );
  }

  const exhaustive: never = style;
  return exhaustive;
}

export function AppearancePanel() {
  const { palette, style, setPalette, setStyle } = useThemePrefs();
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
    <Panel
      icon="sparkles"
      title="Appearance"
      description="Pick a color palette and a visual style independently — the change applies everywhere instantly."
    >
      <div className="p-4 pt-2 sm:p-6 sm:pt-2">
        <fieldset className="border-0 p-0">
          <legend className="section-label mb-2.5">Color palette</legend>
          <ToggleGroup
            type="single"
            variant="card"
            aria-label="Color palette"
            className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6"
            value={mounted ? palette : ""}
            onValueChange={(value) => value && setPalette(value as PaletteId)}
          >
            {PALETTES.map((p) => (
              <ToggleGroupItem
                key={p.id}
                variant="card"
                value={p.id}
                aria-label={`${p.label} palette`}
                className="gap-2 p-2"
              >
                <PaletteChip palette={p} />
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </fieldset>
        <fieldset className="mt-5 border-0 p-0">
          <legend className="section-label mb-2.5">Visual style</legend>
          <ToggleGroup
            type="single"
            variant="card"
            aria-label="Visual style"
            className="grid grid-cols-1 gap-2 sm:grid-cols-2"
            value={mounted ? style : ""}
            onValueChange={(value) => value && setStyle(value as StyleId)}
          >
            {STYLES.map((s) => (
              <ToggleGroupItem
                key={s.id}
                variant="card"
                value={s.id}
                className="gap-2 p-3"
              >
                <StyleGlyph style={s.id} />
                <span className="text-sm font-medium text-ink">{s.label}</span>
                <span className="text-[length:var(--type-secondary)] text-pretty leading-relaxed muted">
                  {s.description}
                </span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </fieldset>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-rule-soft pt-4">
          <div>
            <p className="text-sm font-medium">Dark mode</p>
            <p className="text-[length:var(--type-secondary)] text-pretty leading-relaxed muted">
              Follows your system by default; palettes adapt to both modes.
            </p>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </Panel>
  );
}
