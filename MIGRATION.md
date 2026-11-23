# Hairline Migration Guide (for batch agents)

 SSC Insight is being rebuilt UI-first on Hairline UI. This document is the
 binding contract for every migration batch. Read it fully before editing.

## What changed already (do not re-do)

- **Tokens**: `src/app/globals.css` defines the full standard shadcn
  variable set in OKLCH for six palettes (`data-theme` on `<html>`:
  terracotta/blue/lime/violet/rose/graphite; **graphite is the default with
  no attribute**) × light/dark (`.dark` class, owned by next-themes).
  DO NOT edit globals.css. Use Tailwind semantic classes only:
  `bg-background bg-card bg-popover bg-primary text-primary-foreground
  bg-secondary text-secondary-foreground bg-muted text-muted-foreground
  bg-accent text-accent-foreground text-destructive bg-border? (no — borders
  via shadow, see below) text-foreground text-chart-1..5 bg-sidebar-*`.
  Success/warning exist too: `text-success text-success-foreground
  text-warning text-warning-foreground`.
- **Chrome** is migrated: `app-shell.tsx`, `workspace-sidebar.tsx`,
  `workspace-chrome.tsx`, `workspace-command-palette.tsx`,
  `exam-switcher.tsx`, `appearance-panel.tsx`, `page-header.tsx`,
  `theme-toggle` (Hairline's, driven by next-themes). READ these for the
  established patterns before writing your own.
- **Icons**: `src/components/icon.tsx` exports `Icon`, `PlainIcon`,
  `IconName` vocabulary and tone system. Static Hugeicons everywhere
  (density rule). Animated icons exist at
  `@/components/animate-ui/icons/hugeicons/<slug>` — import DIRECTLY, only
  for genuinely interactive surfaces (CTAs, toggles), never in dense lists.
  Never import `lucide-react` in app code (Hairline internals use it; that
  stays).
- **Toast**: `import { toast } from "@/components/toast-stack"` —
  `toast("Title")`, `toast.success/error/warning/info("Title", { description })`,
  `toast.promise(p, { loading, success, error })`, `toast.dismiss(id?)`.
- **Installed Hairline components** live flat in `src/components/<name>.tsx`
  (button, input, textarea, select, multi-select, combobox, checkbox,
  radio-group, switch, slider, segmented-control, badge, avatar, spinner,
  progress, skeleton, kbd, tabs, liquid-tabs, accordion, collapsible,
  breadcrumb, pagination, toggle-group, alert, empty-state, toast-stack,
  dialog, sheet, tooltip, popover, hover-card, dropdown-menu, context-menu,
  command-palette, data-table, filter-bar, timeline, task-card,
  onboarding-checklist, settings-form, auth-card, code-input,
  create-password, verify-code, not-found, prompt-composer,
  streaming-answer, thinking-indicator, thinking-trace, tool-call, citation,
  chat-history, usage-meter, chat-notice, attachment-chip, model-picker,
  chat-scroll, message-edit, plan, approval-card, action-receipt,
  clarifying-question, web-research, code-block, response-versions,
  sparkline, trend-chart, area-chart, combo-chart, donut-chart, stage-bars,
  activity-rings, activity-heatmap, compare-bars, threshold-line,
  pillar-chart, dot-meter, pace, stats-band, announcement-pill,
  testimonials, faq-accordion, logo-marquee, feature-tabs, morphing-nav,
  fluted-footer, …).

## Ground rules (binding)

1. **Hairline components ONLY** for UI. No shadcn `@/components/ui/*`
   imports in new code — those files will be deleted. Gaps (Card,
   Separator, Label, typography) are composed from tokens:
   - Card: `<section className="rounded-2xl bg-card text-card-foreground shadow-[inset_0_0_0_1px_var(--border)]">`
   - Panel heading: `text-base font-semibold text-foreground` + description
     `text-[13px] text-muted-foreground`.
   - Separator: `<div className="h-px bg-border" />`.
2. **Read the real API before using a component**: the installed source in
   `src/components/<name>.tsx` is the truth. Reference docs:
   `/tmp/hairline-llms-full.txt` (per-component sections; search
   `## <Name> (`).  When a component's internals hardcode Tailwind palette
   classes (`text-red-600`, `text-emerald-500/10`…) REMAP them to the
   semantic tokens (`text-destructive`, `bg-destructive/10`,
   `text-success`, `bg-success/10`) — careful, surgical, no other changes.
   Record each remap in your final report.
3. **No hardcoded colors** in any file you write: no hex, no rgb(), no
   `text-red-*`/`bg-emerald-*`/`amber`/Tailwind palette utilities. Use the
   token classes above. Chart series: `text-chart-1..5` /
   `stroke-chart-2` etc. (`--chart-1` quant terracotta, `--chart-2`
   reasoning blue, `--chart-3` english green, `--chart-4` ga gold,
   `--chart-5` computer graphite — these are global subject identity,
   never re-themed per palette).
4. **Never touch**: business logic, data hooks (`use-*.ts(x)`), `lib/`,
   `app/api/*`, `stores/`, prisma, `scripts/`, `tests/` (except where a
   test asserts old UI markup in YOUR files — update those assertions to
   the new markup, minimally). Keep all behavior, props, handlers, a11y
   semantics, keyboard flows and text copy EXACTLY as today unless the
   component swap requires otherwise (then note it).
5. **Responsive + sticky footer**: mobile-first (`sm: md: lg:`), 44px touch
   targets on phones, `min-h-screen flex flex-col` page roots with
   `mt-auto` footers on landing/auth.
6. **Density rule for icons**: static in dense lists/tables/inline text;
   animated (direct import) on interactive CTAs only; `loop` only for
   progress. Sizes from one scale: 14/16/20/24.
7. **TypeScript strict**: `npx tsc --noEmit` must stay clean for your files
   (pre-existing errors outside src/ are known). Run `npx eslint <your
   files>` and fix what you introduced.
8. **Do not run the dev server, npm install, git, or the shadcn CLI.**
   Edit files only. If a Hairline component you need is NOT installed,
   stop and report it in your final message instead of inventing an API.
9. Legacy tone names (`ink`, `accent`, `paper`, `mono`) and
   `DuotoneIcon`/`DuotoneTile` compat exports exist ONLY so unmigrated files
   compile; migrate those usages to the new vocabulary
   (`foreground`/`primary`/`muted`/`current` + `Icon`/`PlainIcon`).
10. Long lists: `max-h-[26rem] overflow-y-auto` (or similar) — tokens drive
    the thin scrollbar already.

## Conversions cheat-sheet (old → Hairline)

- `@/components/ui/button` → `@/components/button` (variants:
  primary/secondary/outline/ghost/destructive/link; sizes xs/sm/md/lg/icon;
  props `loading`, `icon`, `trailingIcon` ReactNode slots).
- `ui/input`, `ui/textarea`, `ui/select`, `ui/checkbox`, `ui/switch`,
  `ui/radio-group`, `ui/slider` → hairline equivalents (read their props:
  e.g. Input has `label/hint/error/leading/trailing/clearable`,
  Select has `options/value/onValueChange`).
- `ui/dialog`, `ui/drawer`, `ui/sheet` → `dialog` (title/description/footer
  fn/size) or `sheet` (side left/right/bottom, drag-to-dismiss).
- `ui/dropdown-menu`, `ui/popover`, `ui/tooltip` → declarative API
  (`trigger` + `items` for dropdown; children-as-`({close})` for popover).
- `ui/tabs` → `tabs` (LiquidTabs where the old liquid-tabs was used) —
  read each installed source for props.
- `ui/badge`, `ui/avatar`, `ui/progress`, `ui/skeleton`, `ui/spinner` →
  hairline versions (Badge: tone/dot/count/icon; Avatar: name/src/status;
  SkeletonSwap for loading swaps).
- sonner/toasts → `toast-stack` API (above).
- `ui/alert` → `alert` (tone + icon slot).
- recharts → Hairline SVG charts (they take data arrays; read source).
- `Icon name="…" tone="ink"` → `tone="foreground"`; `accent` → `primary`;
  `muted` stays `muted` (new meaning: muted-foreground).

## Your report back

Include: files changed, Hairline components used, any API mismatch you hit
(and how you resolved it), any hardcoded color you found in installed
sources and remapped, any gap you had to compose, and any test assertion you
updated. Flag anything you were NOT able to complete.
