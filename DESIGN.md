# Design System — ssc-insight rebuild

This document defines the design system for the shadcn/ui + Animate-UI + Hairline
+ Hugeicons rebuild. It is the source of truth for the six brand colors, the two
styles, the shadcn semantic token bridge, typography, and the radius/density/
motion scales. All values are read from `src/app/globals.css` (3007 lines,
Tailwind v4) — no values are invented.

> **Status:** skeleton. The "Six brand colors" and "Two styles" sections are
> complete and authoritative. The "shadcn semantic token bridge" and "chart
> aliases" sections record the current state plus the proposed fixes pending
> the decisions in `UI_AUDIT.md` §10. The component decision table is filled in
> as each layer migrates.

---

## 1. Six brand colors = six palettes

The six brand colors are six **palette identities**, switched via
`data-palette` on `<html>` (`orange` is the default in `:root`). Each palette
redeclares 10 neutrals+accent for light (`[data-palette="X"]`) and dark
(`.dark[data-palette="X"]`). Status colors and chart hues are shared across all
palettes (see §3, §4).

| Palette | Label | `--accent` (light) | `--accent` (dark) | `--canvas` (light / dark) | `--paper` (light / dark) | `--ink` (light / dark) |
|---|---|---|---|---|---|---|
| `orange` (default) | Terracotta | `#b65335` | `#d97048` | `#f4f1e8` / `#1a1815` | `#faf8f2` / `#221f1b` | `#25231f` / `#ede6d6` |
| `blue` | Blue | `#2563eb` | `#82a7f5` | `#eef0f3` / `#16181d` | `#f9fafb` / `#1e2127` | `#20252b` / `#e5e8ee` |
| `lime` | Lime | `#4d7c0f` | `#94c33d` | `#f0f2e6` / `#16180f` | `#f9faf2` / `#1e2113` | `#23271d` / `#e7ead9` |
| `violet` | Violet | `#6d28d8` | `#a684f5` | `#f1eff5` / `#17141f` | `#faf9fd` / `#201c2b` | `#262233` / `#e9e5f2` |
| `rose` | Rose | `#be123c` | `#fb7185` | `#f5eff1` / `#1b1416` | `#fcf8f9` / `#241b1e` | `#2b2226` / `#f0e5e8` |
| `graphite` | Graphite | `#1a1a1e` | `#e6e6e9` | `#ececee` / `#0b0b0d` | `#f7f7f8` / `#141416` | `#1a1a1e` / `#e6e6e9` |

Full per-palette token tables (all 10 neutrals+accent, light + dark) live in
`globals.css` lines 19–397 and are reproduced in the audit (Task 1-c). Graphite
is the only palette with `--accent-sheen` and `--canvas-sheen` (linear-gradients
in oklab color-mix); all other palettes set both to `none`.

**Shared status tokens (not overridden per palette; light in `:root`, dark in `.dark`):**

| Token | Light | Dark |
|---|---|---|
| `--positive` / `--positive-soft` | `#535d37` / `#e6e9db` | `#93a25c` / `#1d2316` |
| `--warning` / `--warning-soft` | `#73551c` / `#eee4cc` | `#c79a3a` / `#221b0c` |
| `--danger` / `--danger-hover` / `--danger-soft` | `#962f28` / `#75231e` / `#f1dfd8` | `#d8655a` / `#c64f43` / `#2a1714` |

---

## 2. Two styles: mira (default) and sera (override)

> **Naming note (pending decision 1 in `UI_AUDIT.md` §10):** the task refers to
> "Vega" and "Lyra" styles. The shadcn registry exposes only `new-york` +
> `default` (no `vega`/`lyra`). The repo's `globals.css` defines two styles
> `mira` and `sera`, switched via `data-style` on `<html>`. `"vega"` survives
> only as a legacy `localStorage` value migrated to `mira` by the prepaint
> script. **Working mapping until confirmed:** mira ≈ "Vega" (refined default),
> sera ≈ "Lyra" (brutal override).

`mira` is the default — there is no `[data-style="mira"]` selector (enforced by
`tests/theme-style.test.ts`); mira = `:root` geometry as-is. `sera`
(`[data-style="sera"]`) overrides geometry, borders, shadows, motion timing, and
focus ring; it does **not** override density (enforced by test).

### 2.1 Radius scale

| Token | mira | sera |
|---|---|---|
| `--radius-control` | `0.5rem` | `0` |
| `--radius-card` | `0.625rem` | `0` |
| `--radius-panel` | `0.75rem` | `0` |
| `--radius-floating` | `0.75rem` | `0` |
| `--radius-segment` | `0.5rem` | `0` |
| `--radius-pill` | `999rem` | `0` |

### 2.2 Borders, shadows, motion, focus

| Token | mira | sera |
|---|---|---|
| `--panel-border-width` / `--panel-border-color` | `1px` / `var(--rule-soft)` | `2px` / `var(--ink)` |
| `--stat-rule-width` | `1px` | `2px` |
| `--elev-pop` | `0 0.0625rem 0.125rem rgba(37,35,31,.05), 0 0.5rem 1.25rem -0.875rem rgba(37,35,31,.22)` | `0.25rem 0.25rem 0 0 var(--ink)` |
| `--landing-lift` | soft layered (color-mix) | `0.375rem 0.375rem 0 0 var(--ink)` |
| `--dur-quick` / `--dur-enter` / `--dur-view` | `140` / `180` / `200ms` | `100` / `140` / `160ms` |
| `--ease-out-soft` | `cubic-bezier(.22,1,.36,1)` | `cubic-bezier(.2,.9,.25,1)` |
| `--focus-ring` | `var(--accent)` | `var(--ink)` |
| `--sidebar-rule-w` / `--sidebar-rule-color` | `1px` / `var(--rule)` | `2px` / `var(--ink)` |

### 2.3 sera component-specific overrides

- `.page-title` → weight 600, letter-spacing -0.02em
- `.panel-title` → weight 650, letter-spacing -0.015em
- `.stat-value` → weight 600
- `.segment-group`, `.dialog-content` → `border-color: var(--ink)`
- `.segment[aria-pressed/selected=true]` (+ hover) → `box-shadow: inset 0 0 0 1px var(--ink)`
- `.duotone-tile:hover` → `box-shadow: -3px 3px 0 0 var(--ink)`
- `.callout-accent` → `border-color: var(--accent)`
- `[data-sidebar="menu-button"][data-active=true]` → inset ink ring
- `.sidebar-cta`, `.ask-cta` → `box-shadow: 3px 3px 0 0 var(--ink)`
- sidebar header/footer → `border-color: var(--rule)`; `.sidebar-avatar` → `border-radius: 0`

### 2.4 Switching mechanism (the "method in globals.css")

Before paint, a blocking inline `<script>` (`THEME_PREFS_SCRIPT` in
`src/lib/theme-style.ts`, injected in `src/app/layout.tsx`) reads
`localStorage["ssc.palette"]` + `localStorage["ssc.style"]` and sets
`document.documentElement.dataset.palette` + `dataset.style` (defaults `orange`
+ `mira`; legacy `vega` → `mira`; wrapped in try/catch). `next-themes`
(`attribute="class"`, `storageKey="ssc.theme"`, `system` default,
`disableTransitionOnChange`) owns `.dark`. `@custom-variant dark (&:is(.dark *))`
makes Tailwind `dark:` follow `.dark`. `ThemeStyleProvider` mirrors the DOM
attributes into React state (lazy init from the already-correct DOM, no
hydration surface). `AppearancePanel` exposes palette × style pickers (two
`ToggleGroup variant="card"` with `PaletteChip` swatches + `StyleGlyph`
wireframes) behind a `mounted` gate; `ThemeToggle` handles light/dark.

---

## 3. shadcn semantic token bridge (`globals.css` lines 165–193, `:root` only)

Defined only in `:root` — `.dark` does not redeclare these aliases; they resolve
through `var()` chains to the palette tokens that `.dark` overrides.

| shadcn alias | `:root` mapping | Resolves in `.dark` (orange) to |
|---|---|---|
| `--background` | `var(--paper)` | `#221f1b` |
| `--foreground` | `var(--ink)` | `#ede6d6` |
| `--card` / `--card-foreground` | `var(--paper)` / `var(--ink)` | `#221f1b` / `#ede6d6` |
| `--popover` / `--popover-foreground` | `var(--paper)` / `var(--ink)` | `#221f1b` / `#ede6d6` |
| `--primary` / `--primary-foreground` | `var(--accent)` / `var(--paper)` | `#d97048` / `#221f1b` |
| `--secondary` / `--secondary-foreground` | `var(--soft)` / `var(--ink)` | `#2a2722` / `#ede6d6` |
| `--muted-foreground` | `var(--muted)` | `#9a9489` |
| `--accent` / `--accent-foreground` | `var(--accent)` / `var(--paper)` | `#d97048` / `#221f1b` |
| `--destructive` / `--destructive-foreground` | `var(--danger)` / `var(--paper)` | `#d8655a` / `#221f1b` |
| `--border` | `var(--rule-soft)` | `#38342f` |
| `--input` | `var(--rule)` | `#5a5550` |
| `--ring` | `var(--accent)` | `#d97048` |
| `--sidebar` / `--sidebar-foreground` | `var(--paper)` / `var(--ink)` | `#221f1b` / `#ede6d6` |
| `--sidebar-primary` / `--sidebar-primary-foreground` | `var(--accent)` / `var(--paper)` | `#d97048` / `#221f1b` |
| `--sidebar-accent` / `--sidebar-accent-foreground` | `var(--soft)` / `var(--ink)` | `#2a2722` / `#ede6d6` |
| `--sidebar-border` | `var(--rule-soft)` | `#38342f` |
| `--sidebar-ring` | `var(--accent)` | `#d97048` |

> **Note:** `--muted` and `--accent` are not separately aliased — the paper
> system's `--muted` and `--accent` tokens ARE the shadcn semantics (same name).

### 3.1 ⚠️ `--accent` collision (pending decision 3)

shadcn primitives use `bg-accent` for **hover/selection surfaces** (expecting a
neutral). Here `--accent` IS the primary brand color (terracotta). The current
bridge compensates with `--secondary: var(--soft)`, but registry components that
reach for `bg-accent` on hover get terracotta. **Strategy (pending approval):**
on every registry install, audit `bg-accent`/`hover:bg-accent` usage; override
through tokens (point those utility usages at `--soft`) or wrap the component.
Do not fork the registry component blindly.

---

## 4. Chart tokens

### 4.1 Existing (named subject hues — fixed per-subject identity, shared by every palette)

| Token | Light | Dark | Meaning |
|---|---|---|---|
| `--chart-score` | `#b65335` | `#d97048` | score series (terracotta) |
| `--chart-average` | `#656d4a` | `#93a25c` | average / "correct" (olive) |
| `--chart-time` | `#567276` | `#7fa3a7` | timing (teal) |
| `--chart-quant` | `#b65335` | `#d97048` | Quant subject |
| `--chart-reasoning` | `#2a78d6` | `#5a9be8` | Reasoning / Section II |
| `--chart-english` | `#1baf7a` | `#4dd49f` | English |
| `--chart-ga` | `#eda100` | `#ffc340` | GA |
| `--chart-computer` | `#767168` | `#aaa094` | Computer |
| `--outcome-unattempted` | `#c9bda7` | `#3f3a32` | surface semantic |

Aliases (light only): `--chart-section-1: var(--chart-quant)`,
`--chart-section-2: var(--chart-reasoning)`, `--chart-target: var(--muted)`,
`--chart-correct: var(--chart-average)`, `--chart-incorrect: var(--chart-quant)`,
`--chart-skipped: var(--rule-soft)`. Subject/section mapping enforced in
`src/lib/chart-theme.ts`.

### 4.2 ⚠️ Proposed `--chart-1 … --chart-5` aliases (pending decision 3)

The shadcn chart convention uses `--chart-1`…`--chart-5`. Registry chart
components expect `bg-chart-1` etc., which do not resolve today (the `@theme
inline` block exposes only 3 chart color utilities). **Proposed mapping** (to
the existing subject hues so switching palettes never re-colors data):

| Alias | Maps to | Why |
|---|---|---|
| `--chart-1` | `var(--chart-quant)` | primary series |
| `--chart-2` | `var(--chart-reasoning)` | secondary |
| `--chart-3` | `var(--chart-english)` | tertiary |
| `--chart-4` | `var(--chart-ga)` | quaternary |
| `--chart-5` | `var(--chart-computer)` | quinary |

Plus expose all five + `--chart-score/average/time` as `--color-chart-*`
utilities in the `@theme inline` block.

---

## 5. Typography

- `--font-body: "DM Sans Variable", "Segoe UI", sans-serif` (loaded via
  `@fontsource-variable/dm-sans` in `src/app/layout.tsx`)
- `--font-heading: "Source Serif 4 Variable", Georgia, serif` (loaded via
  `@fontsource-variable/source-serif-4`)
- `--font-sans: var(--font-body)`, `--font-serif: var(--font-heading)` (in
  `@theme inline`)
- Body = DM Sans; headings + numerics (`.page-title`, `.panel-title`,
  `.stat-value`, `.metric-value`, `.workspace-title`, `.wordmark`,
  `.landing-wordmark`, `.plate-title`, etc.) = Source Serif 4.

Type scale (`:root`): `--type-page-title: clamp(1.75rem,2.4vw,2.25rem)`,
`--type-workspace-title: clamp(1.5rem,2.2vw,1.875rem)`, `--type-section-title:
1.25rem`, `--type-panel-title: 1rem`, `--type-panel-title-dense: 0.9375rem`,
`--type-metric: clamp(1.5rem,2.2vw,1.875rem)`, `--type-stat: 2.25rem`,
`--type-section-label: 0.75rem`, `--type-body: 0.875rem`, `--type-secondary:
0.8125rem`, `--type-label: 0.75rem`, `--type-segment: 0.8125rem`.

---

## 6. Density & motion tokens (`:root`)

- Control: `--control-pad-y: 0.5rem`, `--control-pad-x: 0.75rem`,
  `--control-height: 2.25rem`, `--control-height-sm: 2rem`
- Table: `--table-cell-pad-y: 0.625rem`, `--table-cell-pad-x: 0.75rem`
- `--label-gap: 0.375rem`, `--nav-pad-y/x: 0.5/0.75rem`,
  `--segment-pad-y/x: 0.375/0.625rem`, `--stat-cell-pad-y/x: 1/1.25rem`,
  `--metric-cell-pad-y/x: 0.75/0.875rem`, `--band-cell-pad-y/x: 0.875/1rem`
- `--day-nav-size: 2rem`, `--app-header-h: 3.25rem`, `--tap-min: 2.75rem`
- Sidebar: `--sidebar-rule-w: 1px`, `--sidebar-rule-color: var(--rule)`,
  `--sidebar-row-h: 2rem`, `--sidebar-row-h-lg: 2.5rem`,
  `--sidebar-header-pad-y: 0.5rem`
- Motion: `--ease-out-soft`, `--dur-quick: 140ms`, `--dur-enter: 180ms`,
  `--dur-view: 200ms` (sera tightens these — §2.2)
- Focus: `--focus-ring: var(--accent)`, `--focus-keyline: var(--paper)`
- Panel: `--panel-border-width: 1px`, `--panel-border-color: var(--rule-soft)`,
  `--stat-rule-width: 1px`
- Phone breakpoint (last in file, supersedes all): control heights → 2.75rem tap
  floor; iOS zoom guard sets input/select/textarea font-size 1rem under 640px.

`@theme inline` exposes: fonts; `--color-*` for paper/accent/status/3-chart +
all shadcn semantics + sidebar; `--radius-*` (self-referencing, flip with
`data-style`); `--shadow-pop`, `--ease-out-soft`.

---

## 7. Component decision table

Filled in per layer as migration proceeds. Format: `component | source
(shadcn / animate-ui / hairline / shadcn-composed / custom) | file path`.

| Component | Source | Path | Notes |
|---|---|---|---|
| _(to be filled during layer 2 — foundations)_ | | | |

---

## 8. Motion policy

- Subtle only: 150–250ms default (house tokens `--dur-quick/enter/view` already
  in this range; sera tightens further).
- Respect `prefers-reduced-motion`: `MotionConfig reducedMotion="user"` wraps the
  workspace (`workspace-chrome.tsx`); CSS `prefers-reduced-motion: reduce` block
  forces `animation/opacity/translate/transition: none/1/none/none !important`.
- Do not animate layout-critical content in a way that delays interaction.
- Animate-UI components are Motion-based and inherit the `MotionConfig`.
