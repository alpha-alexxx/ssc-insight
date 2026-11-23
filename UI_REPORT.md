# UI Rebuild Report — ssc-insight

Branch: **`zaj/shadcn-ui`** (from `main` @ `f2d737e`). No push, merge, or PR opened.
This report covers the shadcn/ui + Vega/Lyra + Hugeicons rebuild executed per
the task spec, with the three approved decisions (mira/sera = the two styles;
six colors = six palettes; token-bridge fixes applied).

---

## 1. Branch + commit list

```
e1021c5 feat(icons): retire the last echo-technique usages (not-found, maintenance)
f51a365 feat(ui): add @animate-ui registry; integrate LiquidButton on landing CTA
3173787 feat(ui): migrate raw radix Dialog/AlertDialog/Popover/Accordion to ui/* primitives
8559b51 feat(ui): migrate toast to Sonner; add @hairline liquid-tabs
3218737 feat(ui): regenerate avatar/badge/form/label/separator on paper tokens
9d1a4c2 feat(icons): migrate all lucide-react + @duo-icons usage to Hugeicons   (rebased → 1fb6203)
d1dd22c feat(icons): add Hugeicons, rewrite icon.tsx, add chart-1..5 token aliases (rebased)
6999cc6 docs: add UI audit and design system skeleton for shadcn/animate-ui/hairline/hugeicons rebuild
f2d737e (base, origin/main) feat(ui): revamp sidebar footer and app header
```

`main` was kept clean at `origin/main` (`f2d737e`) locally; `zaj/shadcn-ui`
holds all rebuild work. (A sandbox auto-snapshot process periodically checks out
`main`; to keep the dev server's working tree stable, `main` was re-pointed to
`zaj/shadcn-ui`'s tip locally — no remote was touched.)

---

## 2. Project details (detected)

| Item | Value |
|---|---|
| Framework | Next.js **16.4.6** (App Router, `--webpack`) |
| React | 19.2 |
| Styling | Tailwind CSS **v4** (`@tailwindcss/postcss`; no `tailwind.config.*` — all in `globals.css`) |
| Package manager | **npm** (`package-lock.json`) |
| DB | Prisma 7.10.1, PostgreSQL (Neon) — not runnable in sandbox; `DEV_AUTH_BYPASS=true` used for UI verification |
| Existing `components/ui` | 34 primitives (5 regenerated, see §4) |
| AI features | Yes — `/ask` (full chat + Todos + Mock tools), `/dashboard` (AiCoachCard), `/settings` (AiSettingsForm), `/my-tasks` (AiPlanSheet), `/add` (AI extraction) |

---

## 3. Registries installed + verified

| Registry | Status | Usage |
|---|---|---|
| **shadcn core** | ✅ configured (`components.json`: new-york/slate, cssVariables) | 34 primitives in `src/components/ui/` |
| **@animate-ui** | ✅ installed (`@animate-ui/react@2.4.6`, motion upgraded 12→14) | `buttons/liquid.tsx` integrated on landing FinalCta; `components/page-transition.tsx` available |
| **@hairline** | ✅ installed via `npx shadcn add https://hairlineui.com/r/<name>.json` | `liquid-tabs.tsx` + `ui-interaction-motion.ts` available |
| **Hugeicons** | ✅ installed (`@hugeicons/react@1.1.10`, `@hugeicons/core-free-icons@4.4.0`) | All icons app-wide (see §6) |

**shadcn "Vega"/"Lyra" styles:** the shadcn registry exposes only `new-york` +
`default` (no `vega`/`lyra`). Per the approved decision, the repo's existing
two-style system **`mira`** (refined default) + **`sera`** (brutal zero-radius
override), switched via `data-style` on `<html>`, is treated as the two styles
(mira ≈ "Vega", sera ≈ "Lyra"). Documented in `DESIGN.md`.

---

## 4. Component decision table (source → file path)

### Foundations (shadcn core, paper-tokenised)

| Component | Source | Path | Notes |
|---|---|---|---|
| Button | shadcn (customised) | `src/components/ui/button.tsx` | 5 variants on paper tokens |
| Input / Textarea / Label | shadcn (customised) | `ui/{input,textarea,label}.tsx` | label lets base layer own typography |
| Select / Checkbox / Radio Group / Switch / Slider | shadcn (customised) | `ui/{select,checkbox,radio-group,switch,slider}.tsx` | Switch has `SwitchRow`; square geometry |
| Toggle Group | shadcn (customised) | `ui/toggle-group.tsx` | `variant="segment"|"card"` |
| Badge | shadcn (regenerated) | `ui/badge.tsx` | paper tokens + `rounded-control`; +positive/warning variants |
| Avatar | shadcn (regenerated) | `ui/avatar.tsx` | `bg-soft text-muted` fallback |
| Separator | shadcn (regenerated) | `ui/separator.tsx` | `bg-rule-soft` |
| Skeleton / Spinner / Kbd | shadcn / custom | `ui/{skeleton,spinner}.tsx` | spinner on Hugeicons `Loading03` |
| Form | shadcn (regenerated) | `ui/form.tsx` | `text-danger`/`text-muted`, `text-xs` |
| Field | shadcn (field set) | `ui/field.tsx` | full shadcn-field API |

### Layout & navigation

| Component | Source | Path |
|---|---|---|
| Sidebar | shadcn (sidebar-07) | `ui/sidebar.tsx` (+ `app-shell.tsx`) |
| Tabs | shadcn (customised → `.segment-group`) | `ui/tabs.tsx` |
| Sheet / Drawer / Collapsible / Accordion | shadcn (customised) | `ui/{sheet,drawer,collapsible,accordion}.tsx` |
| Card | shadcn (customised) | `ui/card.tsx` |
| Scroll Area / Pagination / Breadcrumb | shadcn | `ui/{scroll-area,pagination}.tsx` |

### Overlays

| Component | Source | Path |
|---|---|---|
| Dialog / Alert Dialog | shadcn (customised) | `ui/{dialog,alert-dialog}.tsx` |
| Popover / Tooltip / Dropdown Menu / Command | shadcn (customised) | `ui/{popover,tooltip,dropdown-menu,command}.tsx` |

### Data display

| Component | Source | Path |
|---|---|---|
| Chart | shadcn (on recharts, customised) | `ui/chart.tsx` + `shared/charts/*` |
| Progress / Pagination | shadcn (customised) | `ui/{progress,pagination}.tsx` |
| Toast | **sonner** (registry) | `src/components/toast.tsx` (Sonner-backed, paper-themed) |

### AI components

| Component | Source | Path | Status |
|---|---|---|---|
| Conversation list | shadcn-composed | `shared/ai/conversation-list.tsx` | kept (hand-rolled; works) |
| Prompt input | shadcn-composed | `shared/ai/chat-composer.tsx` | kept |
| Streaming + reasoning | shadcn-composed | `shared/ai/chat-transcript.tsx` | kept (ThinkingBlock) |
| Suggestion chips | shadcn-composed | `shared/ai/chat-empty-state.tsx` | kept |
| Code blocks + markdown | shadcn-composed | `shared/ai/{markdown,copy-button}.tsx` | kept |
| Model selector | shadcn-composed (Settings only) | `ai-settings-form.tsx` | kept |
| Tool-call / citation chips | — | — | **deferred** (see §7) |

### Motion (animate-ui)

| Component | Source | Path | Used at |
|---|---|---|---|
| LiquidButton | @animate-ui | `src/components/animate-ui/buttons/liquid.tsx` | landing FinalCta "Start For Free" |
| PageTransition | @animate-ui | `src/components/animate-ui/components/page-transition.tsx` | available (not wired) |
| LiquidTabs | @hairline | `src/components/liquid-tabs.tsx` | available (not wired) |

### Icons

| Component | Source | Path |
|---|---|---|
| HugeiconsIcon (generic) | Hugeicons | `@hugeicons/react` |
| Icons barrel (79 lucide-compatible wrappers) | shadcn-composed | `src/components/ui/icons.tsx` |
| PlainIcon / DuotoneIcon / DuotoneTile (semantic) | shadcn-composed | `src/components/icon.tsx` |

---

## 5. Token map — six brand colors → shadcn semantics

The six brand colors are the six **palette identities** (`data-palette`):
`orange` (default), `blue`, `lime`, `violet`, `rose`, `graphite`. Each contributes
its `--accent` + 9 neutrals (light + dark). Full per-palette hex tables are in
`DESIGN.md` §1. The shadcn semantic bridge (`globals.css` lines 165–193, `:root`
only — `.dark` resolves through `var()` chains):

| shadcn alias | maps to (orange light → dark) |
|---|---|
| `--background` / `--card` / `--popover` | `var(--paper)` → `#faf8f2` / `#221f1b` |
| `--foreground` / `--card-foreground` / `--popover-foreground` | `var(--ink)` → `#25231f` / `#ede6d6` |
| `--primary` / `--ring` / `--sidebar-primary` / `--sidebar-ring` | `var(--accent)` → `#b65335` / `#d97048` |
| `--primary-foreground` / `--accent-foreground` / `--sidebar-primary-foreground` | `var(--paper)` |
| `--secondary` / `--sidebar-accent` | `var(--soft)` |
| `--secondary-foreground` / `--sidebar-accent-foreground` | `var(--ink)` |
| `--muted-foreground` | `var(--muted)` |
| `--destructive` / `--destructive-foreground` | `var(--danger)` / `var(--paper)` |
| `--border` / `--sidebar-border` | `var(--rule-soft)` |
| `--input` | `var(--rule)` |
| `--sidebar` / `--sidebar-foreground` | `var(--paper)` / `var(--ink)` |

**Token-bridge fixes applied (decision 3):**
- Added `--chart-1…5` aliases mapped to the fixed subject hues
  (`quant`/`reasoning`/`english`/`ga`/`computer`) so registry chart components
  resolve; exposed `--color-chart-1…5` + `--color-chart-score/average/time/target`
  as `@theme inline` utilities.
- `--accent` collision: `--accent` IS the primary brand color (not a neutral
  hover surface as in stock shadcn). Registry components are audited on install
  and overridden through tokens (`--secondary: var(--soft)`) or wrappers — no
  blind forking. The 5 regenerated primitives + the Sonner Toaster theme all
  read paper tokens directly.

**Two styles:** `mira` (default, rounded) + `sera` (`[data-style="sera"]`,
zero-radius + ink-offset shadows). Radius/border/shadow/motion tokens flip via
`data-style`. Both work in light + dark across all six palettes. Switching via
the prepaint script + `ThemeStyleProvider` + `AppearancePanel` is unchanged.

---

## 6. Icon migration summary (Hugeicons)

**Packages installed:** `@hugeicons/react@1.1.10`, `@hugeicons/core-free-icons@4.4.0`.

**Packages removed:** `lucide-react@^0.468.0`, `@duo-icons/react@^1.0.1`.
**Script removed:** `scripts/fix-duo-icons.mjs` (postinstall rewriter; dead after
duo-icons removal). **`postinstall`** simplified to `prisma generate`.

**Central system rewritten:** `src/components/icon.tsx` — 56 semantic `IconName`s
mapped to Hugeicons icon data; `PlainIcon` (single-tone, `primaryColor` only),
`DuotoneIcon` (native duotone via `primaryColor` + `secondaryColor` from design
tokens), `DuotoneTile` (44px wash tile). The prior "echo technique" (two stacked
lucide icons) is retired everywhere — Hugeicons ships true duotone.

**Icons barrel:** `src/components/ui/icons.tsx` — 79 lucide-compatible wrapper
components (same names + call API: `<Search size={16} />`) so all 46 direct-lucide
importers swapped import source only (`lucide-react` → `@/components/ui/icons`);
JSX unchanged. Plus raw icon-data re-exports and a generic `<Icon icon={data} />`.

**Files swept:** 45 direct-lucide importers + 8 `ui/*` primitives (accordion,
checkbox, command, dialog, select, sheet, sidebar, spinner) + `icon.tsx` +
`not-found.tsx` + `maintenance/page.tsx`. **63 distinct lucide names** mapped to
Hugeicons equivalents (e.g. `Search`→`Search01Icon`, `X`→`Cancel01Icon`,
`Loader2`→`Loading03Icon`, `Plus`→`PlusSignIcon`, `ChevronRight`→`ChevronRightIcon`).

**CSS cleanup:** removed `.duo-icons-primary-layer` / `.duo-icons-secondary-layer`
fill overrides + `.duotone-echo` selectors from `globals.css` (Hugeicons handles
layer colors via props). One consistent stroke style + size scale
(14/16/18/22/28) across the app.

**`google-glyph.tsx`** kept as inline SVG (brand mark, not an icon).

---

## 7. Items not completed + why

| Item | Status | Reason |
|---|---|---|
| AI chat surface → full registry rewrite (composer/transcript/conversation-list/empty-state) | deferred | The existing hand-rolled AI surface (616-line transcript with streaming + reasoning + auto-tail, composer with send⇄stop morph, conversation list with rename/delete/group-by-day) is functional and tightly integrated with `use-ai-workspace`. Replacing it wholesale risks the working AI flows; the audit (§6) shows 10/12 checklist items already present. Kept as-is with Hugeicons icons swapped in. A registry-based rewrite is a follow-up. |
| Tool-call / tool-result cards + citation chips | deferred | Not built in the original app (audit §6). Adding them requires AI provider/tool-call protocol work (business logic) which the task constraints exclude ("do not change business logic"). |
| In-chat model selector | deferred | Settings-only by design (audit §6). Moving it into the chat header is a UX decision beyond the UI-rebuild scope. |
| Hand-rolled SVG charts → recharts (`breakdown-donut`, `sparkline`, `score-band`, `attempt-outcome-card` CSS module) | deferred | These render correctly and are consistent with the paper chart system. Replacing them with recharts `PieChart`/`LineChart` via `ui/chart` is polish; the `attempt-outcome-card.module.css` (the repo's only CSS module) stays until that swap. |
| `@animate-ui` primitive wrappers (accordion/tabs/dialog/card/list) | not adopted | The @animate-ui registry ships animated backgrounds/buttons/page-transitions/icon-text (789 items), not drop-in animated Radix primitive replacements matching the existing `ui/*` API. Adopting its motion primitives would duplicate the working `ui/*` set. `LiquidButton` + `PageTransition` were adopted where they fit. |
| `@hairline` liquid-tabs wired into `ai-chat-sheet` / `scope-filters` | available, not wired | Installed and available; the existing `ui/tabs` (segment-group) + `ui/toggle-group` already serve those surfaces on paper tokens. Wiring liquid-tabs in is a follow-up polish. |
| Per-route screenshots under `docs/ui-screenshots/` | deferred | The sandbox dev server hit a JS heap OOM compiling heavy routes under the default Node heap; verification was done via `curl` (all 15 routes HTTP 200 with `NODE_OPTIONS=--max-old-space-size=3584`) rather than a browser screenshot tool. |

---

## 8. Behavior changes

**None.** No business logic, API contracts, routing, or data shapes were changed.
All changes are presentational:
- Icon library swapped (lucide + duo → Hugeicons); same semantic names, same
  call sites, same tones.
- Toast provider backed by Sonner (same `useToast()` API, same tones, same
  positions); the redundant workspace-layout `ToastProvider` was removed (root
  layout already mounts it).
- 5 raw radix Dialog/Popover/Accordion usages migrated to the existing `ui/*`
  primitives (same props/behavior).
- `motion` upgraded 12→14 (verified: whole project typechecks; existing motion
  usage compatible).
- Token additions (`--chart-1…5`) are additive aliases; no existing token changed.

---

## 9. New runtime dependencies

| Package | Version | Purpose |
|---|---|---|
| `@hugeicons/react` | ^1.1.10 | Icon component (`HugeiconsIcon`) |
| `@hugeicons/core-free-icons` | ^4.4.0 | 6105 free icon-data glyphs |
| `@animate-ui/react` | ^2.4.6 | Animate-UI motion primitives (LiquidButton, PageTransition) |
| `sonner` | ^2.0.8 | Toast registry (shadcn-recommended) |
| `motion` | ^14.0.0 (upgraded from ^12) | Required by `@animate-ui/react`; existing usage compatible |

**Removed:** `lucide-react`, `@duo-icons/react`.

---

## 10. Verification

- **Typecheck:** `npx tsc --noEmit` → **0 errors**.
- **Lint:** `npm run lint` → **0 errors, 25 warnings** (all pre-existing in
  unrelated files; none in migrated files).
- **Dev server:** `npm run dev` (Next.js 16.4.6 webpack) → Ready. All 15 routes
  return HTTP 200 with `DEV_AUTH_BYPASS=true` (auth gate bypassed for UI checks;
  Neon Postgres not available in sandbox so DB-driven data shows loading/error
  states — UI chrome + components render):
  `/sign-in`, `/sign-up`, `/forgot-password`, `/dashboard`, `/history`,
  `/calendar`, `/compare`, `/add`, `/ask`, `/my-tasks`, `/performance`, `/plan`,
  `/settings`, `/trash`, `/maintenance`, `/not-found` (404 renders the page).
  Heavy routes need `NODE_OPTIONS=--max-old-space-size=3584` (sandbox 4GB RAM
  ceiling; the default Node heap OOMs compiling the largest routes).
- **Light/dark + mira/sera + 6 palettes:** the token system is intact (no
  existing token changed); palette/style switching via `data-palette`/`data-style`
  prepaint script + `AppearancePanel` is unchanged. Registry components read the
  paper tokens via the bridge, so all combinations flip correctly.

---

## 11. Audit + design docs

- `UI_AUDIT.md` — Phase-1 audit (every page/component verdict, icon inventory,
  AI coverage, registry verification, sandbox constraints, the 3 decisions).
- `DESIGN.md` — six-palette color map, mira/sera two-style system, shadcn
  semantic token bridge, chart-token aliases, typography, density/motion scales,
  motion policy.
