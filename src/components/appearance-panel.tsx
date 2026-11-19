"use client";
import { useEffect, useState } from "react";
import { Panel } from "./dashboard-panels";
import { ThemeToggle } from "./theme-toggle";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import {
  PALETTES,
  STYLES,
  useThemePrefs,
  type PaletteId,
  type StyleId,
} from "./theme-style-provider";

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
        className="flex h-9 w-full overflow-hidden rounded-[4px] border border-rule-soft"
        style={{ background: palette.canvas }}
      >
        <span className="flex w-1/2" style={{ background: palette.paper }}>
          <span
            className="m-1.5 h-2.5 flex-1 self-end rounded-[2px]"
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
  if (style === "sera")
    return (
      <span
        aria-hidden="true"
        className="block h-14 w-full rounded-[2px] border-2 border-ink p-1.5"
        style={{ boxShadow: "3px 3px 0 0 var(--ink)" }}
      >
        <span className="mb-1 block h-1.5 w-3/4 bg-ink" />
        <span className="mb-1 block h-4 w-full border border-ink bg-accent-soft" />
        <span className="block h-2 w-1/2 border border-ink" />
      </span>
    );
  if (style === "mira")
    return (
      <span
        aria-hidden="true"
        className="block h-14 w-full rounded-md border border-rule-soft p-1.5"
      >
        <span className="mb-1 block h-1 w-3/5 rounded-sm bg-ink" />
        <span className="mb-1 block h-2.5 w-full rounded-sm bg-soft" />
        <span className="flex gap-1">
          <span className="h-2.5 flex-1 rounded-sm bg-soft" />
          <span className="h-2.5 flex-1 rounded-sm bg-soft" />
          <span className="h-2.5 flex-1 rounded-sm bg-soft" />
        </span>
      </span>
    );
  return (
    <span
      aria-hidden="true"
      className="block h-14 w-full rounded-[2px] border border-rule-soft p-1.5"
    >
      <span className="mb-1.5 block h-1 w-2/3 bg-ink" />
      <span className="mb-1.5 block h-5 w-full border border-rule-soft bg-canvas" />
      <span className="flex gap-1.5">
        <span className="h-2 flex-1 bg-soft" />
        <span className="h-2 flex-1 bg-soft" />
      </span>
    </span>
  );
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
      <div className="p-6 pt-2">
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
            className="grid gap-2 sm:grid-cols-3"
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
                <span className="text-[11px] leading-snug muted">
                  {s.description}
                </span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </fieldset>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-rule-soft pt-4">
          <div>
            <p className="text-sm font-medium">Dark mode</p>
            <p className="text-[11px] muted">
              Follows your system by default; palettes adapt to both modes.
            </p>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </Panel>
  );
}
