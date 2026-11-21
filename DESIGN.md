---
name: SSC Insight
description: A warm editorial workspace for SSC mock results.
colors:
  canvas: "#f4f1e8"
  paper: "#faf8f2"
  ink: "#25231f"
  muted: "#6b665e"
  rule: "#82796b"
  rule-soft: "#d5cec1"
  soft: "#eae5da"
  accent: "#b65335"
  accent-hover: "#934029"
  accent-soft: "#efe0d5"
  positive: "#535d37"
  positive-soft: "#e6e9db"
  warning: "#73551c"
  warning-soft: "#eee4cc"
  danger: "#962f28"
  danger-hover: "#75231e"
  danger-soft: "#f1dfd8"
  chart-average: "#656d4a"
  chart-time: "#567276"
  chart-quant: "#b65335"
  chart-reasoning: "#2a78d6"
  chart-english: "#1baf7a"
  chart-ga: "#eda100"
  chart-computer: "#767168"
  chart-section-1: "#b65335"
  chart-section-2: "#2a78d6"
  chart-target: "#6b665e"
typography:
  headline:
    fontFamily: '"Source Serif 4 Variable", Georgia, serif'
    fontSize: "clamp(32px, 3.2vw, 44px)"
    fontWeight: 450
    lineHeight: 1.12
    letterSpacing: "-0.035em"
  title:
    fontFamily: '"Source Serif 4 Variable", Georgia, serif'
    fontSize: "22px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  body:
    fontFamily: '"DM Sans Variable", "Segoe UI", sans-serif'
    fontSize: "14px"
    fontWeight: 400
  label:
    fontFamily: '"DM Sans Variable", "Segoe UI", sans-serif'
    fontSize: "12px"
    fontWeight: 500
  metric:
    fontFamily: '"Source Serif 4 Variable", Georgia, serif'
    fontSize: "42px"
    fontWeight: 450
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  wordmark:
    fontFamily: '"Source Serif 4 Variable", Georgia, serif'
    fontSize: "31px"
    fontWeight: 550
    lineHeight: 1
    letterSpacing: "-0.035em"
rounded:
  square: "0px"
spacing:
  sm: "8px"
  md: "16px"
  panel: "20px"
  lg: "24px"
  page: "36px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.paper}"
    rounded: "{rounded.square}"
    height: "40px"
    padding: "0 16px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "10px 12px"
  panel:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.square}"
  nav-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.square}"
    padding: "12px 14px"
---

# Design System: SSC Insight

## Overview

The approved visual direction is warm editorial paper: cream canvas, paper surfaces, serif headings, quiet sans-serif controls, and terracotta actions. Thin rules organize the working dashboard with the clarity of a printed progress ledger. Anthropic was a visual reference, not a brand identity to reproduce.

**Key Characteristics:**
- Warm flat surfaces with square corners and thin rules.
- Expressive serif headings paired with compact sans-serif controls.
- A divided metric strip and coordinated earthy charts.

## Multi-theme system (palettes × styles)

Every visual decision flows from two data attributes on `<html>`, set before
paint by the ThemeStyleProvider script and persisted in localStorage
(`ssc.palette`, `ssc.style`) — defaults reproduce this document exactly, so
an absent or invalid stored value is always safe:

- **`data-palette`** — color identity: `orange` (the original terracotta,
  default), `blue`, `lime`, `violet`, `rose`, `graphite`. Each palette re-declares
  the same semantic tokens (canvas/paper/ink/muted/rule/soft + accent trio)
  with its own tinted paper family. Chart series colors are deliberately NOT
  part of a palette: every palette renders the same fixed per-subject hues
  (see Colors), so no `[data-palette]` block declares chart hues.
  `graphite` is the monochrome silver-and-black palette ("black diamond"): a
  neutral paper family with a near-black accent (dark mode inverts to true
  graphite charcoal with silver ink), and the one palette that carries
  gradients — it overrides the `--accent-sheen`/`--canvas-sheen` tokens with
  ink/paper-derived `color-mix` gradients (a metallic streak on solid accent
  fills and a faint canvas wash). Those tokens default to `none`, so every
  other palette ships flat.
- **`data-style`** — visual style: `vega` (the original editorial ledger —
  square, hairline rules, no shadows; default), `sera` (brutal: square,
  2px ink panel rules, hard offset `--elev-pop`, weight-600 display type,
  decisive 170ms motion), `mira` (compact: 6px radii, 2rem controls, 0.5rem
  table rows, one "sm" type step below vega, tighter paddings, 140ms motion;
  its density tokens are rem-based so the whole scale tracks the root font).
  Styles change geometry,
  density, elevation, and motion — never layout, content, or behavior.
  Density lives in CSS custom properties (`--control-height`, `--table-cell-*`,
  `--control-pad-*`, consumed by the base layer and component classes), so
  Tailwind utilities still win where a view deliberately opts out.

Rules across all 18 combinations: accent-on-paper button text ≥ 4.5:1 (all
palettes verified, light and dark — graphite: 16.2:1 light, 14.8:1 dark);
muted text ≥ 4.5:1 on canvas; chart series colors are identical across
palettes; focus
outlines and semantic status colors unchanged; chart animation stays
disabled; the outcome-card exception keeps `--radius-card` so sera squares
it and mira tightens it. `src/components/theme-style-provider.tsx` owns the
preference model; `src/components/appearance-panel.tsx` (Settings) is the
selection UI — shadcn ToggleGroups in the card variant, chosen
independently and applying instantly. Do not hardcode palette hexes in
components; add new semantic tokens to `globals.css` instead. The sheen
tokens (`--accent-sheen`, `--canvas-sheen`) default to `none` and are
consumed by the primary Button variant and the body background; only
graphite overrides them.

## Colors

Terracotta identifies primary actions; the score series keeps the same fixed terracotta identity in every palette. Charcoal ink carries text and selected navigation. Paper and cream create subtle surface separation without textures. Muted ink remains legible for units, labels, and descriptions.

Chart series colors are fixed per subject and identical in every palette and every style — switching themes never re-colors the data, so a reader's learned color→subject mapping always holds. The accent lives in buttons, links, and selected UI, never in a chart series. Subject charts use terracotta for Quant, blue for Reasoning, aqua for English, ochre for General Awareness, and warm gray for the separately scored Computer context. Section I reuses terracotta and Section II reuses blue. Correct answers use olive, incorrect answers terracotta, and skipped answers the soft rule color. Timing uses teal and the target reference uses muted ink in a dashed rule. `src/lib/chart-theme.ts` maps entity identities to the CSS chart variables; preserve those semantic mappings. The hues are a fixed categorical order validated for adjacent-pair CVD and normal-vision separation against the paper surface; dark mode uses lightness-tuned variants of the same hues, declared once in `.dark`. Do not color nominal series by value or cycle extra hues for additional results.

**The Meaning Rule.** Keep legends, units, and text labels alongside color; color alone must not carry a result's meaning. Every chart also exposes a square-bordered hover/focus tooltip and a "View data" table twin.

## Charts

- Score trends use the Shadcn/Recharts 3 `ChartContainer` composition with one percentage axis, 2px lines, light washes, visible dots, horizontal hairline gridlines, and a vertical hover rule. Multi-series subject and section charts show every populated series at once with a legend, sparse values stay absent rather than becoming zero, and the same colors follow each entity across filters.
- Where you stand is one radar on every dashboard tab, always built from the global cross-type subject profile on a 0–100 scale. Missing subjects are named below rather than drawn as zero; fewer than three populated subjects falls back to labelled bars.
- Make every attempt count uses 100% stacked radial rings (Correct, Incorrect, Unattempted) with square surface gaps between segments. Full Mocks keeps one ring card and All Mocks keeps one panel with rings by mock type. Subject Wise and Sectional Wise use one bordered card per subject/section instead of grouping rings: each card has its own ring, three-column colour key with counts and shares, marks/score line, and percentile provenance note.
- The ring center always shows score percentage (marks / maximum). Genuine saved percentiles appear separately with their provenance. A full or sectional mock’s percentile is never reused for its subject slices or derived sections. Accuracy remains available in the note and data table.
- My target shows the existing out-of-390 goal as a percentage reference, a dashed target line, a dated average snapshot trend, the latest gap, and explicit up/down/flat text with an arrow.
- Subject deep dive uses two aligned single-axis small multiples (accuracy percentage and minutes), never a dual-axis chart. It is omitted on Subject Wise.
- Charts keep animation disabled, respect reduced motion, size containers to include axis labels, and use the paper/ink/rule tokens rather than floating cards.

## Typography

Source Serif 4 Variable supplies page headings, panel titles, metrics, and the typographic wordmark. DM Sans Variable supplies body text, tables, forms, and navigation. Both fonts are self-hosted through Fontsource imports in the root layout. Use the declared fallbacks while fonts load.

Supporting text is generally 10–13px; section labels use 10px uppercase lettering, weight 600, and 0.12em tracking. Use tabular figures for comparison values and timings. Keep units in muted ink rather than reducing their contrast.

Type sizes are tokens (`--type-page-title`, `--type-workspace-title`, `--type-section-title`, `--type-panel-title`, `--type-panel-title-dense`, `--type-metric`, `--type-stat`) plus the body and segment text tokens (`--type-body`, `--type-segment`) read by the `.page-title`, `.workspace-title`, `.section-title`, `.panel-title`, `.panel-title-dense`, `.metric-value`, `.stat-value`, `body` and `.segment`. A style or breakpoint resizes type by overriding a token, never by re-declaring the class. Below 640px (and on coarse pointers below 1280px) the phone block steps them: workspace title 28px, section title 20px, panel title 16px, metric values 24px. Panel titles are never larger on a phone than on desktop — the old 21px mobile override was an inversion and is gone. Nothing renders below 10px; the one exception is a single initial glyph inside a fixed-size host tile.

## Layout

The workspace follows shadcn sidebar-07 composition: header branding, navigation, and the footer account link use `SidebarMenu` / `SidebarMenuButton`, with the account row opening the existing account settings. At `md` and above it is a 15rem paper sidebar that collapses to a 3.5rem icon rail through shadcn's own state, with tooltips for icon-only items. Collapsed labels remain available to assistive technology but leave the flex layout, so the wordmark never wraps into a tall hidden block. Header and footer stay fixed in size while navigation scrolls on short screens. The workspace layout restores the saved sidebar cookie before rendering. Below `md`, the same navigation is a left Sheet opened from the header trigger; links close the Sheet and retain charcoal fill plus `aria-current="page"`. A sticky header carries the trigger, current view, AI trigger, theme control, settings, and account action. Its height is the `--app-header-h` token (52px). Six labelled controls plus a breadcrumb do not fit in a 375px bar, so below `sm` the header keeps **five**: the trigger, the page title (truncating, with a 3.25rem floor so it never collapses to one glyph), search, theme and the account avatar. Ask AI moves to the sidebar and the ⌘K palette, the exam switcher collapses to its icon, and every action takes the 44px touch floor; from `sm` all controls return with their labels and search becomes the full pill with the shortcut hint.

Main content is centered within a 1560px maximum width with 12–20px horizontal padding at small widths and 20px at desktop. The dashboard is composed as a compact overview strip followed by a primary/secondary two-column workspace at `xl`; both columns stack below that breakpoint. The planner uses calendar-plus-selected-day at `xl` and a single-column date/schedule flow on mobile.

The summary is one divided metric strip, not individual floating cards: soft rules, 12–18px cell padding, 24–34px serif values. Each cell is a single link target with a 2px square progress rule and a chevron that appears on hover or focus. The performance section keeps a quiet metadata row (labels, values, hairline dividers) and charts below the operational overview rather than repeating the headline metrics.

The strip folds to 2×2 based on **its own width, not the viewport**: `.workspace-content` and any `.strip-frame` are query containers, and below 680px of content the strip (and `.score-band`) reflow to two columns with the border pairs re-declared. This is what keeps a 768px tablet — where the 15rem sidebar leaves only ~488px — from squeezing four cells into ~120px each. From 680px up the strip is four-across, so 1024 and every desktop width keep their shipped geometry. The My Tasks swipe row (`.metric-strip-scroll`) opts out and stays a horizontal snap row on phones.

**Touch density.** Controls are 40px (compact 32px) at vega density — mira
runs one step tighter (32px, compact 26px) — and 44px on phones and coarse pointers for every style, including mira — 44px is an accessibility floor, not a style choice, so the phone token block sits last in `globals.css` and supersedes the `[data-style]` density. Icon-only controls that must stay visually small use `.tap-target`, whose pseudo-element grows the hit area without moving layout. Primary page actions use `.action-row`: full-width and stacked on phones, intrinsic and inline from `sm`.

**Form fields.** Every text, select and textarea control is 16px on phones and coarse pointers, unlayered and app-wide, including portaled sheets and dialogs — anything under 16px makes iOS zoom the viewport on focus.

**The Frame Rule.** Rules, tracks, bars, and progress fills are square; only status dots and the answer-distribution ring are round. A percentage rule is never a pill, and a metric strip is never a row of separate rounded cards.

**The Readable Table Rule.** Keep wide tables inside their horizontal scroll container. Preserve comparable columns and nowrap values instead of squeezing them into unreadable cells.

## Elevation & Depth

Depth comes from cream-to-paper changes, thin rules, and spacing. Panels, menus, notifications, and dialogs avoid heavy shadows. The result dialog uses a translucent ink overlay, a ruled paper surface, a maximum width of 896px, and a scrollable maximum height of 85vh. Do not add paper textures or simulated physical shadows.

## Shapes

Panels, controls, selected navigation, badges, avatars, status markers, and dialogs use square corners. Charts retain the geometry needed to show their data, including the circular question breakdown. Thin one-pixel rules define boundaries and divisions.

## Components

Google sign-in starts from the public landing page, which is the only sign-in surface. Its masthead is a sticky 64px bar on canvas with a single hairline soft rule and a backdrop blur: the serif wordmark sits left (23px below 768px, 24px above), in-page section anchors sit centre from `md`, and a theme control, an outlined compact "Sign in with Google" button and (below `md`) a navigation Sheet sit right. A 2px accent reading-progress rule rides the bar's bottom edge. The accent fill is reserved for the hero and final call-to-action, so each section carries one bold action.

**The landing is a printed preparation ledger** (`src/components/landing/`). It alternates paper with two full-bleed **ink plates**: Plate I carries the product showcase, Plate II carries the optional AI coach and the privacy ledger. It runs 01 hero → 02 ledger facts → Plate I → 03 analytical scopes → 04 the 50-day plan → 05 compare → Plate II → 06 FAQ → 07 final CTA, with a numbered margin spine on `lg+`.

- **Plates never remap semantic tokens.** `--plate-bg/fg/muted/rule/rule-soft/surface/card` are the only variables a plate changes, and they compose from `--ink`/`--paper`/`--soft` so all five palettes resolve without per-palette rules. That is what lets a paper product mockup sit on a plate and still look exactly like the workspace: `--plate-bg` is `--ink` in light mode and the raised `--soft` in dark, with `--plate-card` = `--paper` so nested cards read recessed. Plates take 1px `--plate-rule` hairlines top and bottom; interactive content inside a plate uses `.focus-paper` because the accent ring sinks into charcoal.
- **Product mockups are code, not screenshots.** `mockups/` contains hook-free server components drawn entirely from design tokens (`WorkspaceFrame`, `BrowserFrame`, `MockMetricStrip`, `MockRing`, `MockTrend`, `MockRadar`, `MockTable`, and the dashboard/history/compare/planner/day-workspace screens). They reuse the real rules — the divided metric strip, the score band, square progress rules, the answer ring with score percentage centred — at mockup scale through container queries, so `sera` gives them 2px ink borders and `mira` tightens them exactly as the workspace does. All charts are inline SVG; **the landing never imports Recharts**. Each sits in a `BrowserFrame` whose inner tree is `aria-hidden`, with the real description in a sibling `<figcaption>` and an "Illustrative sample data" badge, so no fact may live only inside a mockup.
- **Copy and numbers are derived, not typed.** Hero, showroom and scope figures come from `fixtures.ts`, which runs the app's own `totals()`/`analyze()` over eight sample attempts; plan counts come from `plan-data.ts` reading the real study-plan JSON on the server (262 rows, never the export's declared 273). `tests/landing-fixtures.test.ts` and `tests/plan-facts.test.ts` fail the build if a mockup could show a number the product cannot produce.
- **Motion is CSS-first.** Scroll reveals (`.rise`) and the scope diagram's fan (`.scope-fan`) are scroll-driven animations layered over an always-visible base, so no observer can blank a section, no JavaScript is needed, and Firefox simply shows the static page. Hover, float (9s/11s/13s, never in unison) and the hero entrance are CSS keyframes; Motion is used only for the showcase's panel fade and the hero's pointer parallax (≤8px, fine pointers only, through motion values). `prefers-reduced-motion` disables all of it. The landing uses `--landing-lift` rather than a hard-coded shadow so elevation follows the active style.
- **The FAQ is a Radix accordion** from the `radix-ui` umbrella, styled by `.faq-*` with height keyframes on `--radix-accordion-content-height` (no `tw-animate-css`). Showcase tabs are Radix `Tabs` styled as a printed index (`.specimen-tab`), not as the app's `.segment` control.

The signed-in header shows the account and a compact outline sign-out control. Session errors hide and unmount the private workspace until verification succeeds; account changes remount it. Preserve square geometry and paper/ink tokens throughout.

Primary buttons use terracotta with paper text and a darker hover. Outline buttons use a rule border; ghost buttons gain a soft fill; destructive buttons use danger red. Standard and icon controls are 40px high; compact buttons are 32px, and both become 44px on phones and coarse pointers (see Touch density above). Disabled controls reduce opacity and block pointer interaction. Keyboard focus remains explicit with an accent outline and offset.

Fields use paper fill, rule borders, square corners, and 10px by 12px padding. Labels sit 7px above controls. Read-only fields use the soft fill. Checkboxes use ink. Selected mock filters and Manual/Paste toggles expose `aria-pressed`.

Panel headers use 24px horizontal padding, 20px top padding, and 12px bottom padding; compact dashboard panels use 16px by 14px. Tables use 11px muted headings on cream, a stronger header rule, and soft row rules. Cells have 15px by 18px padding, reducing to 13px by 12px below 768px. Row hover uses the soft fill. Accuracy badges use positive ink on the pale positive surface with square corners.

The AI panel is a right-side shadcn Sheet: roughly 520px on desktop, full width on mobile, a subtle ink overlay that leaves the workspace visible, and a serif `Study coach` head with an orientation-only context chip and the line "Chats are saved on this device." The dedicated `/ask` page renders the same conversation full-height — a history-and-activity rail beside the shared transcript. Its three tabs are the app's own `.segment-group` / `.segment` grammar (Ask / Todos / Log), not a bespoke tab bar; `aria-selected` drives the same active-thumb styling as `aria-pressed` elsewhere. The panel has no icon medallions, no `rounded-card` islands and no `rounded-pill` controls — the Frame Rule applies here as everywhere. The composer is a square ruled field with the focus ring on its own border, in normal flex flow (no fixed height) so the mobile keyboard cannot cover it. The Sheet uses the project's data-state CSS animations rather than adding an animation dependency.

**One shell, three documents.** The tabs are genuinely different jobs, so each has its own form:

- **Ask — chat in the paper-and-ink grammar.** The transcript is a conversation, but it keeps the system's discipline: the user's question sits in a restrained soft surface (soft fill, rule border, control radius) while the answer runs full-width as a markdown document — no bubbles, no medallions. Answers render GitHub-flavored markdown through the shared reader (`components/shared/ai/markdown.tsx`): serif headings, ruled tables with tabular figures, paper code blocks with their own copy affordance, ordered and unordered lists, safe external links; raw HTML stays escaped, so model output can never inject markup. Hidden reasoning arrives collapsed as a `Thought for Ns` disclosure above the answer, and while the model works the panel shows an honest phase indicator — `Connecting…`, then `Thinking · Ns` with the seconds clock, driven by real stream evidence (keepalives and reasoning deltas), never a fake progress bar. Per-turn actions (Copy, Edit, Regenerate) reveal on hover/focus and stay permanently visible on touch and reduced motion. A blinking accent caret rides the end of the last rendered block while text streams. The conversation history opens as a rail (search, inline rename, delete), and the same transcript and composer components render both this sheet and the dedicated `/ask` page — one state, two surfaces. Screenshots attach from file, paste, or drop when the user's vision toggle is on, downscaled client-side to 1568px JPEG before anything is sent.
- **Todos — change ledger.** Proposals are ruled rows with a one-character marker in a fixed left column: `+` add (positive), `~` change (accent), `−` trash (danger). Each row states the change and its date in one line, the title beneath, and the prior value struck through when it moved. Fields open in place behind `Edit` rather than showing six inputs per row, the selection checkbox is the safety mechanism, and a sticky in-panel footer reads `N of M selected` beside `Apply`.
- **Log — subject roster.** After parsing, one ruled row per subject: serif subject name, then `30Q · 18 ✓ · 6 ✗` in tabular figures with positive/danger marks. Rows with a missing required value say "Needs a value" and open inline fields. A small-caps `READY` / `N UNRESOLVED` head and a blocked `Continue to the form` enforce exactly the `validateExtractionDraft` contract; `Edit details` still opens the full field editor for rank, percentile and per-subject time.

Tooltips are square paper boxes with rule borders and 12px text. Empty charts reserve at least 220px with centered explanatory text; single-point trends use a compact explicit summary instead of an empty plot. Chart animations are disabled. MotionConfig respects the user's reduced-motion preference, and global CSS minimizes animation and transition durations for that preference. Notifications use only a small vertical entrance.

Dashboard state changes use token-driven fades, never page-style transitions: a content swap (a new plan day, a new analytics scope) fades in over 4px with the style's `microMotion()` duration (110–180ms), progress rules transition width at `--dur-enter`, and hover/press states use `--dur-quick`. A swap has no exit animation and no height animation, because collapsing a tall panel would jump the scroll position. Under `prefers-reduced-motion` every one of these becomes an instant change, and hover affordances stay permanently visible rather than appearing on motion.

**Settings motion exception (the one sanctioned settings-scoped motion layer).** Settings runs a deliberate page-style motion set — a page-enter rise, an `AnimatePresence mode="wait"` section swap (±8px, 200ms), staggered panel rows (60ms stagger), spring hover/tap on the save-bar and section CTAs (`motion/react`, `motion.create(Button)`), a spring bounce on reminder switches, and the sticky save bar's spring slide — driven by `settings/_lib/motion-presets.tsx`. Every preset checks `useReducedMotion()` and collapses to an instant change, and the shell's `MotionConfig reducedMotion="user"` backstops it. This layer is scoped to `/settings` only: the dashboard keeps token-driven swaps with no exit animation.

Theme switching is the one sanctioned global crossfade. The theme toggle is a circular ink disc carrying the glyph of the mode you will switch to (moon in light, sun in dark): disc `--ink`, glyph `--paper`, both token-inverted in dark mode so one rule set serves every palette and style with no `dark:` variants, and the glyph morphs with a rotate/scale/fade at `--disc-morph-dur`. Each click opens a one-shot `theme-animating` window on `<html>` (~480ms) during which token-driven colors — and only colors — ease at `--dur-view`; next-themes' `disableTransitionOnChange` is deliberately not set because it would inject a global `transition: none` kill-switch. Outside the window nothing transitions, so unrelated state changes stay instant, and reduced motion never opens the window at all.

## Status dots and personal-task conventions

Personal tasks (My Tasks, daily workspace, unified dashboard plan) use a 10px `StatusDot` instead of text badges. The four states map to theme-protected semantic tokens only — never palette hues: `todo` is a hollow ink-outline dot (`border-rule` on paper), `in_progress` is `--accent`, `completed` is `--positive`, and `overdue` is `--danger` with a soft `ring-danger-soft` halo. Because `[data-palette=…]` blocks never override `--positive/--warning/--danger/--accent/--muted` (they are defined only in `:root`/`.dark`), dots render identically across all 15 palette × style combinations. The dot is a button when status can cycle; it exposes "Status: {label}. Activate to change." and its hover grows only under `motion-reduce:` guards.

Personal month calendars live in My Tasks and Today's Plan; their date markers expose pending/completed counts to assistive technology, and the selected date drives only the personal-task list. The Study Calendar shows the same dated tasks as one layer of its unified ledger, using the form differences in "Study Calendar" above (outline plus status dot, no tint) rather than a second calendar.

## Command palette (⌘K)

The palette is the workspace's index, so it uses the ledger's own grammar: a ruled 52px input row with the `esc` key at its right edge, then **one group per result kind** whose head band carries the kind in small caps on the left and its **count in tabular figures on the right** — the reader knows how much they are scanning before they scan it. Every row shares one grammar (16px muted icon · title with the matched fragment washed in `--accent-soft` · right-aligned 11px meta), and selection is the quiet `--soft` wash for pointer and keyboard alike rather than an accent fill. A `↑↓ move · ↵ open · esc close` legend closes the panel on pointer-capable widths and is omitted on phones. Empty and error states speak in the interface's voice and name the query; nothing says "results loaded".

## Do's and Don'ts

- Do keep labels, legends, and units visible beside metrics.
- Do preserve the divided stat strip and horizontal table scrolling.
- Do use semantic paper, ink, accent, and chart variables.
- Do keep one bold action per screen; secondary AI actions stay outline.
- Do let a divider strip respond to its container's width, and keep every control at 44px and every field at 16px on phones.
- Don't add rounded dashboard cards or colorful icon tiles.
- Don't add a second mobile-only control system; phone density is a token override, not a parallel set of components.
- Don't repeat the headline metrics in a second stat strip further down a view.
- Don't introduce paper textures or heavy shadows.
- Don't animate charts or ignore reduced-motion preferences.

## Reference-led outcome cards

Make every attempt count follows the supplied `docs/images/card.png` reference: softly rounded paper cards, prominent serif subject headings, a subject icon, and an olive/terracotta/beige answer-distribution ring with score percentage at its center. A ruled answer ledger shows counts, shares, and proportion bars. A pale marks/score strip and a three-column accuracy, reported-percentile availability, and score-definition footer complete each card. The ring represents question shares; its center represents marks divided by maximum, not accuracy or percentile. These reference-specific rounded corners and icon treatments are scoped to the outcome cards; the surrounding dashboard keeps its existing geometry.

Outcome cards use semantic articles and definition lists with visible values, so color is supplementary. The grid uses three cards per row at desktop widths (1280px and above), two on tablets (768–1279px), and one on mobile. Card internals use container queries so type, answer labels, and footers adapt to each card’s width rather than just the viewport. Desktop cards are compact horizontal compositions: a small header, 84px ring, three-row answer ledger, and one metadata row; very narrow widths stack them. Missing accuracy uses a dash and missing percentile is explicit; inherited full-mock percentiles never describe a derived subject or section.

Dated saved attempts use the companion `AttemptRecordCard` in the same module. It is a compact horizontal row with a 62px score ring, a visible “Attempted” state, the actual attempt date, title, platform/type, score/max, accuracy, and a result action. Aggregate answer-stack cards never invent a single attempt date.

## Study Calendar

The calendar is a workspace view, not a dashboard, so it opens with the shared `PageHeader` (serif `workspace-title`, one hairline below, actions wrapping under the title on phones) rather than a display-size heading and a view-management card. Its summary is the same divided metric strip as the dashboard — four cells: next mock, plan completion, this week's load, and mocks done — with the same 2px square rule. Two of the four are static because they have no surface to open; that is the one sanctioned exception to "each cell is a link target". On phones the strip sits **below** the calendar (the four cells cost ~180px of a 640px viewport); from `md` it returns above.

**Three layers, three kinds of ink.** The calendar unifies scheduled plan work, the student's own dated tasks, and every logged result. Layer identity is carried by **form**, not by a fourth set of colours, so the category palette stays reserved for plan work:

- **Scheduled** — printed: a soft tint with a **2px left rule** in the category hue (accent mock, positive sectional, warning topic, rule other).
- **Personal** — a margin note: **no tint**, a 1px outline and the ink status dot.
- **Logged** — a stamp: a neutral row with a **serif score numeral** at the right edge.

The three layer toggles are **inline** `aria-pressed` segments, never a popover or menu: every overlay in the app portals at `z-50`, and the control must stay reachable while a drawer is open. The last visible layer cannot be turned off. Revision is a kind inside the Scheduled layer, not a fourth toggle.

**No fabricated time.** The plan carries no clock times, so no surface is an hour grid; each is an ordered, ruled list. The order inside a day is scheduled work (the plan's own sequence), then revision, then personal work (unfinished before completed, then priority, then creation), then logged results — "what is scheduled, what you owe, what you did."

One toolbar owns navigation: the serif period title is the page's **single live region**, with the arrows, Today chip and date-jump popover beside it, and the mode segments plus layer toggles on the second row. Arrows are never disabled — any date is addressable, including outside the plan. The Today chip appears only while it can act, and icon-only arrows carry tooltips. The date jump is a popover because the native date input is awkward inline on phones. View state mirrors into the URL (`?view=&date=&layers=`) with `history.replaceState`; the **view is written only when the user picked one**, so the automatic phone default never bakes itself into a shared link. `/plan/<date>` remains the deep link for a day's workspace.

**The day ledger** is the calendar's characteristic surface, and one component serves three hosts (the Day view, the desktop rail, and the phone drawer). A printed timetable has a margin: the date sits in a narrow gutter — serif numeral over a small-caps weekday — with a hairline rule, and the day's work runs beside it as ruled rows under one dateline and one quiet load line ("4 of 6 scheduled · 2 personal · 1 logged"). Sections are Scheduled, Revision, Personal and Logged, each a real `h3` with a written count; empty sections are omitted. Empty days are a direction, not a dead end: an in-plan rest day offers "Log a mock" and "Add a task", and a date outside the plan still renders its personal and logged sections.

**Month and week.** Cells come from `monthGridDays`, so the grid is always whole Monday-led weeks. A cell switches on **container width**, not viewport width: above 560px of container it shows the serif date numeral, the plan `done/total` hint and up to three ruled rows (category label, not the full assignment name); below it, one square tick per occupied layer plus a count. Round dots do not appear — the Frame Rule reserves round for status dots and the answer ring. States: in-plan, out-of-plan (muted `bg-canvas` with a dashed hairline), outside the displayed month (dimmed), today (accent rule) and selected (accent fill). The roving-tabindex model is unchanged: one tab stop, arrows, Home/End, PageUp/PageDown. Week columns use the short category label and scroll inside a cap rather than compressing text; below `md` the week is a row list.

**Agenda** iterates dates, not plan days, over a 14-day window from the selection — personal work and logged results outside the plan window appear here, which a plan-day filter could never show. Date heads are serif small caps with the plan day beside them; quiet stretches collapse to one line ("· · · 3 quiet days · · ·"); "Show 14 more days" grows the window in place; earlier days fold behind an `aria-expanded` disclosure. An empty window offers "Jump to next activity" at the next entry-bearing date, plus Today and Log a mock.

**Phones** open on the agenda; month, week and day are one tap away, and an explicit choice always wins. Month and week taps open the day ledger in a **bottom drawer** (vaul), which shares its motion and handle with the personal-task editor opened from a personal row. Below `xl` the selected day follows the grid inline; at `xl` it is a sticky rail. Every drawer closes before a dialog, attempt card or a second drawer opens, because overlays share one top layer. Day completion is always the 2px square rule, never a ring.

## Personal work and dashboard hierarchy

The dashboard sequence is Overview → Today's Plan → Study Calendar, followed by supporting panels and performance. Today's Plan presents structured assignments and personal tasks under explicit labels. The shared personal calendar and list use a primary work column with a 300px calendar rail on desktop; mobile places the compact calendar before the rows. Thin rules and typography organize content without enclosing every item in a card. Task summaries use real account-wide counts. Pending/completed calendar markers have accessible count labels; task completion, priority, and overdue state also have text or checkbox semantics.

The Today's Plan head is editorial, not a card: a 10px small-caps dateline (`Day 4 of 50 · Mock day`, the mock day type in accent) sits above the serif `.panel-title` section heading, and one hairline closes the head before the panes. It carries the plan position once — the Study Plan panel names its phase (`Phase 1 · Build`) instead of repeating the day and day type, and no section tile is shown because the panel below already leads with its own tile. Day stepping is a single bordered control group (two 32px arrow cells and the serif date divided by hairlines) aligned to the head's baseline; the `Today` chip renders inside the group only when the selected day is today, and stepping away swaps it for an accent date plus a `Back to today` text action beside the heading. Below `sm` the group's date cell flexes so the group fills the head's row rather than orphaning at half width; the Study/Personal segmented switch sits under it inside the head, full width until `lg` (where both panes fit side by side and the switch is hidden). The head's dateline is the section's only live region.

Task editing becomes a bottom-aligned dialog on mobile and a centered editor on desktop; secondary filters use a Sheet. These surfaces use semantic paper, ink, rule, and radius tokens. The AI composer uses safe-area spacing and the visual viewport when available, stays in flex flow, and exposes a focus-within ring. Assistant answers use plain readable blocks; user messages use a restrained soft surface. Streaming follows only readers already near the bottom, with an explicit jump-to-latest control otherwise. Retry replaces the failed exchange, and typed drafts remain editable during streaming.

## Trash

Trash is a ledger, not a recycle bin graphic. `/trash` keeps the same editorial grammar as the rest of the workspace and adds no new visual system:

- A quiet retention line sits above the filters inside a hairline box: one 14px muted glyph and a single sentence naming the 15-day window. It is information, not a warning banner — no colour, no icon medallion.
- The type filter is the shared `.segment-group` / `.segment` grammar with `aria-pressed`, and each segment carries its own count in tabular figures so the user can see where the deleted work actually is before clicking. Counts describe every kind at all times, even while one kind is selected.
- Rows are hairline-separated, not cards: checkbox, title, one meta line (kind chip, context, deletion date, days remaining), and a single bordered `⋯` menu using the same `rounded-control` treatment as other row actions. Days remaining turn `--warning` inside the final three days; nothing else about the row is tinted, because a deleted row is not an error.
- Bulk actions appear in a ruled bar above the list only when something is selected, mirroring the task workspace's select-mode toolbar rather than inventing a floating action bar.
- The record detail is a right-side Sheet: a ruled `dl` of server-formatted label/value pairs plus, for a mock, a real subject table. The server formats every value, so the sheet can never show a number the product would not produce elsewhere.
- Both irreversible actions (permanent delete, Empty Trash) go through an `AlertDialog` that names the count, and the group case adds the number of live tasks that will become ungrouped. Empty Trash always quotes the all-kinds total, never the currently filtered one.
- The empty state is a serif line and one sentence — no illustration, no decorative tile.
- Trash is reached from the sidebar footer beside the account block, reusing the grouped-link treatment (icon, collapsed-rail tooltip, active tint) rather than adding a navigation group for a single destination.

## Ask AI chat grammar (legacy chat)

The chat transcript (both the side sheet and `/ask`) uses a mixed bubble grammar — the one sanctioned shadow in the product besides `.elev-pop`:

- **No avatars anywhere** — the legacy chat grammar (Claude/ChatGPT/z.ai), deliberately chosen over the earlier bubble-plus-avatar treatment.
- The reader's question is the **only bubble**: a right-aligned soft surface (`bg-soft`, fully rounded) capped at 85% width, wrapping with `overflow-wrap: anywhere`; attached screenshots sit above it.
- The coach's answer is **plain typeset prose flush with the column edge** — no card, no border, no shadow, no clock stamp. Per-turn actions (Copy / Regenerate / Edit) reveal on hover beneath the block, matching the platforms this grammar follows.
- The pre-answer reasoning lives in a **bordered, tinted thinking block** (`rounded-xl`, `--rule-soft` border, `--canvas/70` background) that states the three phases honestly:
  - *connecting*: open, static "Connecting…", the spring dots in the body;
  - *reasoning streaming*: auto-open with a **shimmering "Thinking… · Ns"** label (a muted→accent→muted gradient sweep; reduced motion renders it static muted) and the reasoning streaming into an accent-ruled body, auto-scrolled to its tail;
  - *content started*: collapsed to **"Thought for Ns"** (Show/Hide + chevron).
  Auto-open fires on the transition into live thinking and auto-collapse on the way out — a manual toggle during the stream is respected. No block renders at all for models that stream no reasoning.
- Each assistant answer opens with the **AI turn header row** from the reference: a small accent sparkles circle, serif "Coach", and the resolved model name in muted text.
- The pre-first-token **thinking line** is flat: three spring dots and the rotating status narration ("Reading aggregate analytics…") — no card, no chips; seconds tick.
- The conversation rail groups by **Today / Yesterday / Earlier this week / Earlier**, carries "12m ago · 4 messages" meta, and marks the active row with one shared-layout accent bar that physically slides between rows (`layoutId="conv-active"`).
- The rail's **usage footer** renders today's request count against the active limit as a hairline meter (accent → danger past budget) plus the read-only pledge. The same footer closes the sheet's history panel.
- Deleting the conversation that owns an in-flight answer is refused with a toast; stopping a stream announces "Reply stopped — your question is still in the thread".
- Empty state: a read-only pledge card (what it reads / never writes) over a 2×2 one-tap suggestion grid, staggered in and collapsed under reduced motion.

## Performance evidence panels

`/performance` renders its evidence as hand-rolled SVG (no chart library): a smoothed **area trend** with crosshair + tooltip (single-scope grains) or **one line per subject series** (subject scope, time-scaled, fixed subject colors), a five-axis **radar** over the scoped stacks (missing series drawn as honest blanks, named in a footnote — never zeros), the **outcome donut** with pooled counts and a threshold-derived coach note, the **ten-band score distribution** with the modal band accented, and a **subject deep-dive** accordion (one card per series, sparkline collapsed, hoverable line expanded). All draw-ins (`pathLength`, bar growth, polygon scale) are `motion/react` entrances gated by `useReducedMotion` — charts themselves never animate on data change. Percentages own the axis; raw marks stay in tooltips.

## Landing ambience

The landing adds a **typed terminal** in the hero (CSS `steps()` typing; every figure derived from the plan/scoring fixtures — never hand-typed), **falling petals** from a fixed literal table (no `Math.random()` at render; frozen under reduced motion), **ink-wash art** (`public/landing/ink-*.png`, `mix-blend-multiply` on paper, inverted+screened in dark and inside plates via `tone="ink"`), **CountUp** ledger facts (the static final value is the base state; the count is enhancement only), the **24s product film** (four 6s scenes from the real mockups with Pause/Restart transport; reduced motion renders the overview statically and hides the transport), a numbered **scroll-spy rail** on the right edge, and a floating **Ask AI pill** that starts the Google round trip (the landing is anonymous-only). Mockup captions remain the real content; no fact lives only inside a mockup or a film scene.

## Sign-in & security

The email auth surfaces extend the paper grammar rather than introducing a new one:

- The landing's **auth dialog** (opened from "Continue with email") is a max-w-md paper card: a `.segment` tab pair (Sign in / Create account), the Google button, a hairline "or with email" divider, and the same field grammar as every form (hairline bordered inputs, accent focus ring, inline `role="alert"` errors — never toasts for field errors). The emailed-code and TOTP steps replace the form in place; the 6-digit inputs render `tabular-nums`, centered, letter-spaced.
- **Settings → Sign-in & security** keeps the panel grammar (one `Panel` per concern: identity, password, two-factor, sessions) with instant actions and dialogs — deliberately NOT a staged draft, so no save-bar registration. Destructive turns (disable 2FA, sign out other sessions) go through `AlertDialog` with the destructive variant; enrollment is a four-step ladder inside one Dialog (password → QR + secret key → verify a code → backup codes shown once, copy-all + explicit "I saved the codes").
- The TOTP QR renders as a locally generated data-URL image on white, beside the raw `otpauth` secret key for manual entry — the secret is never rendered smaller than readable, and no third-party QR service is contacted.
- Capability is told, never faked: when the hosted auth provider lacks a method (two-factor, email delivery), the card says "isn't available on this project's auth provider" instead of showing an Off state the app cannot verify.

- The password dialog offers **two confirmation methods** as a `.segment` pair — Current password, Emailed code. The code path shows the account address locked ("Code goes to"), then a code + new + confirm form; it doubles as the first-password path for Google-only accounts, which the panel copy states plainly. The landing sign-in dialog carries the same reset as a quiet **Forgot password?** link beside the one-time-code link, returning to Sign in with a positive inline note ("Password updated — sign in with your new password"). Enumeration safety is copy, not behavior: the logged-out request never confirms whether an account exists.

## Auth pages (split ledger)

`/sign-in`, `/sign-up` and `/forgot-password` are the sign-in surface, composed as a split ledger: the left half (lg+) is a full-height ink **plate** carrying the real dashboard mockup miniature in a `BrowserFrame`, the four ledger facts and the read-only pledge — the page's one signature element; the right half is the task: wordmark + theme toggle, a left-aligned max-w-sm form column (serif task title, Google button, hairline "or with email" divider, fields, full-width primary action). Phones hide the plate and lead with the form. The 6-digit inputs stay centered, `tabular-nums`, letter-spaced. Landing CTAs are links to these pages, never embedded forms. Success navigates with `?welcome=1`, toasted once by the workspace and stripped; failures arrive as `?error=` codes announced once by the page's announcer and stripped the same way.
