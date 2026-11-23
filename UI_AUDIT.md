# UI Audit — ssc-insight shadcn/ui + Vega/Lyra + Hugeicons rebuild

Branch: `zaj/shadcn-ui` (from `main` @ `f2d737e`).
This document is the Phase-1 audit required before any migration. It records the
detected environment, registry availability, the existing design system, a full
keep/migrate/replace verdict for every page and component, the icon migration
plan, AI-component coverage, and the open decisions that need approval.

---

## 1. Environment & project detection

| Item | Detected value |
|---|---|
| Repository | `https://github.com/alpha-alexxx/ssc-insight` (confirmed `origin`) |
| Default branch / HEAD | `main` @ `f2d737e feat(ui): revamp sidebar footer and app header` |
| Working branch | `zaj/shadcn-ui` (new, created from `main`) |
| Framework | Next.js **16.4.6** (App Router, `--webpack` dev server) |
| React | 19.2 |
| Language | TypeScript 5.9 (strict) |
| Styling | Tailwind CSS **v4** (`@tailwindcss/postcss`; no `tailwind.config.*` — all config in `globals.css`) |
| Package manager | **npm** (`package-lock.json`; scripts use `npm run`) |
| shadcn config | `components.json`: style `new-york`, baseColor `slate`, `cssVariables: true`, `iconLibrary: lucide`, aliases `@/components`, `@/components/ui`, `@/lib/utils`, `@/lib`, `@/hooks` |
| DB | Prisma 7.10.1, **PostgreSQL** (Neon, multi-schema `ssc_insight`) — cannot run in sandbox (sqlite-only); see §9 |
| Auth | Neon Auth (Google + email/OTP/TOTP) — disabled in sandbox |
| AI | OpenAI-compatible coach (chat / coach / extract / todos) — disabled in sandbox |
| Existing `components/ui` primitives | 34 files |
| Custom components | ~40 top-level + subdirs (`auth/`, `landing/`, `search/`, `shadcn-studio/`, `shared/{add,ai,charts,plan,tasks}`) |
| Routes | 13 workspace pages + 6 auth/marketing pages + 25 API route files |

**App boots:** `npm install` (949 pkgs, 26s) + `postinstall` (`prisma generate` + `fix-duo-icons`) succeeded; `npm run dev` → Next.js 16.4.6 Ready in 283ms, no config/import errors. (The dev server process needs `setsid` to persist across shell calls in this sandbox — solved in the verification phase.)

---

## 2. Registry availability (Task 1-e)

| Registry | Status | How to add | Notes |
|---|---|---|---|
| **shadcn core** | ✅ available | `npx shadcn@latest <add/init>` | `components.json` already present |
| **shadcn styles** | ⚠️ **only `new-york` + `default`** | `https://ui.shadcn.com/r/styles` returns exactly those two | **There is NO `vega` and NO `lyra` style in the shadcn registry.** See §3 / §10. |
| **@animate-ui** | ✅ available | `npx shadcn@latest add https://animate-ui.com/r/<name>.json` (registry index `https://animate-ui.com/r/registry.json`) | Animated Radix/Base UI/React Aria primitives (accordion, alert-dialog, checkbox, collapsible, combobox, context-menu, dialog, drawer, dropdown-menu, hover-card, menubar, navigation-menu, pagination, popover, progress, questionnaire, radio-group, select, sheet, sidebar, slider, switch, tabs, toast, toggle-group, toggle, tooltip) + backgrounds + text/motion atoms. Built on Motion. |
| **@hairline** | ✅ available | `npx shadcn@latest add https://hairlineui.com/r/<name>.json` (index `https://hairlineui.com/r/registry.json`, docs `https://hairlineui.com/llms-full.txt`) | 259 MIT components (AI chat parts, inputs, data, charts, landing sections). Requires React 19 + Tailwind v4 + shadcn theme vars — all satisfied. Uses `lucide-react` icons (must swap to Hugeicons after install). No animation library, no provider. |
| **Hugeicons** | ✅ available | `npm i @hugeicons/react@1.1.10 @hugeicons/core-free-icons@4.4.0` | Replaces `lucide-react` + `@duo-icons/react` |

**⚠️ STOPPER — Vega/Lyra not in shadcn registry.** The task requires implementing
"both shadcn styles, Vega and Lyra" and says to stop if either is unavailable.
The shadcn registry exposes only `new-york` and `default`. Neither `vega` nor
`lyra` is a registry style. The repo's `globals.css` instead defines two styles
named **`mira`** (default, rounded) and **`sera`** (override, zero-radius + ink
offset shadows), switched via `data-style` on `<html>`. The string `"vega"`
appears in the repo **only** as a legacy `localStorage` value that the prepaint
script silently migrates to `mira` (`src/lib/theme-style.ts`, `tests/theme-style.test.ts`).
`"lyra"` does not appear anywhere. This needs a decision — see §10.

---

## 3. The existing design system (read from `globals.css`, 3007 lines)

### 3.1 Six brand colors = six palettes

The "six brand colors" are the six **palette identities**, switched via
`data-palette` on `<html>`: **`orange` (default), `blue`, `lime`, `violet`,
`rose`, `graphite`**. Each palette redeclares 10 neutrals+accent
(`--canvas, --paper, --ink, --muted, --rule, --rule-soft, --soft, --accent,
--accent-hover, --accent-soft`) for light (`[data-palette="X"]`) and dark
(`.dark[data-palette="X"]`). Status colors (`--positive/-soft`, `--warning/-soft`,
`--danger/-hover/-soft`) and chart hues are **shared across all palettes**
(intentional — status semantics stay consistent). Graphite is the only palette
with sheens (`--accent-sheen`, `--canvas-sheen`).

### 3.2 Two styles: mira (default) vs sera (override)

`mira` is the default (no `[data-style="mira"]` selector — enforced by test).
`sera` (`[data-style="sera"]`) overrides geometry only:

| Token | mira (`:root`) | sera |
|---|---|---|
| `--radius-control/card/panel/floating/segment/pill` | 0.5 / 0.625 / 0.75 / 0.75 / 0.5 / 999rem | **all 0** |
| `--panel-border-width` / `--panel-border-color` | 1px / `--rule-soft` | 2px / `--ink` |
| `--stat-rule-width` | 1px | 2px |
| `--elev-pop` | soft layered shadow | `0.25rem 0.25rem 0 0 var(--ink)` (hard ink offset) |
| `--dur-quick/enter/view` | 140/180/200ms | 100/140/160ms |
| `--ease-out-soft` | cubic-bezier(.22,1,.36,1) | cubic-bezier(.2,.9,.25,1) |
| `--focus-ring` | `--accent` | `--ink` |
| `--sidebar-rule-w/color` | 1px / `--rule` | 2px / `--ink` |
| `--landing-lift` | soft layered | `0.375rem 0.375rem 0 0 var(--ink)` |

Sera also hardens component borders/shadows (`.segment` active → inset ink ring,
`.duotone-tile:hover` → ink offset, `.callout-accent` border → `--accent`,
sidebar buttons → ink offsets). Density tokens are **not** overridden by sera
(enforced by test). A phone breakpoint at the end of `globals.css` raises control
heights to a 2.75rem tap floor and must stay last.

### 3.3 shadcn semantic token bridge (lines 165–193, `:root` only)

The bridge maps the paper system onto shadcn semantics so every
palette/style/light/dark combination resolves correctly via `var()` chains
(`.dark` overrides the underlying paper tokens, not the aliases):

`--background: var(--paper)` · `--foreground: var(--ink)` · `--card/-foreground: paper/ink` ·
`--popover/-foreground: paper/ink` · `--primary: var(--accent)` · `--primary-foreground: var(--paper)` ·
`--secondary: var(--soft)` · `--secondary-foreground: var(--ink)` · `--muted-foreground: var(--muted)` ·
`--accent: var(--accent)` ⚠️ · `--accent-foreground: var(--paper)` · `--destructive: var(--danger)` ·
`--destructive-foreground: var(--paper)` · `--border: var(--rule-soft)` · `--input: var(--rule)` ·
`--ring: var(--accent)` · `--sidebar/-foreground/-primary/-primary-foreground/-accent/-accent-foreground/-border/-ring: paper/ink/accent/paper/soft/ink/rule-soft/accent`.

**⚠️ Two migration risks in the bridge:**

1. **`--accent` collision.** shadcn primitives use `bg-accent` for *hover/selection
   surfaces* (expecting a neutral), but here `--accent` IS the primary brand color
   (terracotta). The current bridge compensates with `--secondary: var(--soft)`,
   but registry components that reach for `bg-accent` on hover will get terracotta.
   Must audit every registry component on install and override through tokens or a
   wrapper (per the task: "If a registry component hardcodes colors, override it
   through tokens or wrap it. Do not fork it blindly").

2. **No `--chart-1` … `--chart-5`.** Charts use *named subject hues*
   (`--chart-quant`, `--chart-reasoning`, `--chart-english`, `--chart-ga`,
   `--chart-computer`) plus `--chart-score`, `--chart-average`, `--chart-time`,
   `--chart-target`, `--chart-correct/incorrect/skipped`. The `@theme inline` block
   only exposes 3 chart color utilities. Registry chart components expecting
   `bg-chart-1…5` will not resolve. **Proposed fix:** add `--chart-1…5` aliases
   mapping to the subject hues (see DESIGN.md §4).

### 3.4 Typography

`--font-body: "DM Sans Variable"` · `--font-heading: "Source Serif 4 Variable"`,
loaded via `@fontsource-variable/*` imports in `src/app/layout.tsx` (not
`next/font`). Applied: body = DM Sans; headings/numerics (`.page-title`,
`.panel-title`, `.stat-value`, `.metric-value`, `.workspace-title`, `.wordmark`,
`.landing-wordmark`, `.plate-title`, etc.) = Source Serif 4. Type scale tokens
`--type-page-title/workspace-title/section-title/panel-title[-dense]/metric/stat/
section-label/body/secondary/label/segment`.

### 3.5 Switching mechanism (the "method in globals.css")

Before paint, a blocking inline `<script>` (`THEME_PREFS_SCRIPT` in
`src/lib/theme-style.ts`, injected in `src/app/layout.tsx`) reads
`localStorage["ssc.palette"]` and `localStorage["ssc.style"]` and sets
`document.documentElement.dataset.palette` + `dataset.style` (defaults
`orange` + `mira`; legacy `vega` → `mira`). `next-themes` (attribute `class`,
`storageKey="ssc.theme"`, `system` default) owns `.dark`. `@custom-variant dark`
makes Tailwind `dark:` follow `.dark`. `ThemeStyleProvider` mirrors the DOM
attributes into React state; `AppearancePanel` exposes palette × style pickers
(two `ToggleGroup variant="card"` with `PaletteChip` swatches + `StyleGlyph`
wireframes) and `ThemeToggle` handles light/dark. A `mounted` gate keeps SSR
markup hydration-safe.

---

## 4. Pages audit (keep / migrate / replace)

### 4.1 App shell

| File | Verdict | Notes |
|---|---|---|
| `src/app/layout.tsx` | keep | Root shell: `<html>`/`<body>`, theme + style providers, fonts, toast, error boundary, Vercel analytics. Inline prepaint script. |
| `src/app/(workspace)/layout.tsx` | keep | Auth gate → `PrivateWorkspace` → `QueryProvider` → `ExamScopeProvider` → `ToastProvider` → `AiWorkspaceProvider` → `WorkspaceChrome`. `force-dynamic`. |
| `src/components/app-shell.tsx` (`AppFrame`/`AppSidebar`/`AppHeader`) | migrate | Already uses `ui/sidebar` (sidebar-07). Inline CTA/footer buttons + `.app-header`/`.sidebar-cta`/`.ask-cta` (sera hooks only) → registry `Button`/`SidebarMenuButton` variants. |
| `src/components/workspace-chrome.tsx` | keep | Hosts `CommandPalette`, `AiChatSheet`, `MockDetailDialog`, `MotionConfig reducedMotion="user"`. |

### 4.2 Marketing & auth pages

| Route | Verdict | Notes |
|---|---|---|
| `/` (`page.tsx` → `landing/`) | migrate (heavy) | Hero, HeroArt, TypedLine, Petals, LedgerFacts, Showcase (Plate I), FilmSection, ScopesSection, PlanSection, CompareSection, AiSection+PrivacySection (Plate II), FaqSection, FinalCta, LandingFooter. `.plate-*`/`.landing-*`/`.section-label` → registry Card/Section/Badge/Separator. `atoms.tsx` (CountUp/Petals/TypedLine) → animate-ui. No pricing/testimonials (single-tier free). |
| `/sign-in`, `/sign-up`, `/forgot-password` | migrate | `AuthShell` (login-04 chrome) + RHF+zod forms (email/pass, OTP, TOTP). `.plate-*` → registry Card; `Field`/`Input`/`Button` already used. `lucide` `Loader2`/`Eye`/`EyeOff` → Hugeicons. |
| `/maintenance` | keep | Dependency-free static page (renders while DB down). Inlined duotone `Wrench`. Optional Hugeicons swap if a server-renderable variant exists. |
| `/auth/complete` (route handler) | keep | No UI. Out of scope. |
| `/not-found` (root) | keep | Paper card + inlined duotone `Compass`. |

### 4.3 Workspace pages (heaviest first)

| Route | Verdict | Complexity | Key migration targets |
|---|---|---|---|
| `/calendar` | migrate (heaviest) | `CalendarView` ~700 lines + 15 `_calendar/calendar/*` sub-components; `.cal-*` layout + container queries; month/week/day/agenda | `.cal-*` classes; registry Card/Sheet/Drawer/ToggleGroup |
| `/dashboard` | migrate | `DashboardView` + `dashboard-plan-sections` + `week-strip`; 4 data sources; AI coach; mobile segment switch | `.panel`/`.section-title`/`.segment` → Card/CardTitle/ToggleGroup |
| `/add` | migrate | `MockForm` ~48 KB (largest file); RHF+zod; AI extraction review | `.panel`/`.section-label` swap; field consistency |
| `/plan/[date]` | migrate | `PlanDayView` ~46 KB; guided flow; result editor; raw `radix-ui` Dialog | raw Dialog → `ui/dialog`; Card/Progress |
| `/my-tasks` | migrate | `MyTasksView` ~55 KB + 10 sub-components; board/list; AI plan sheet | raw Dialog → `ui/dialog` (TaskEditor, GroupsManager) |
| `/ask` | migrate | `AskView` ~520 lines; 3-column chat; tool takeovers; mobile drawer | The AI surface — see §6 |
| `/settings` | migrate | `SettingsView` + 8 panels; guard provider; motion presets; raw radix Dialog (backup replace) | raw Dialog → `ui/dialog`; `.panel` → Card; keep motion presets |
| `/history` | migrate | Server-paged table; KPI strip; sortable; search; pagination; phone → `AttemptRecordCard` | `.table-scroll`/`.sticky-col`/`.metric-strip`/`.strip-frame` → registry Table/Metric; bare `<input>` → `Input` |
| `/compare` | migrate | Up-to-4 picker + insight stack | same table/metric targets as history |
| `/performance` | migrate | Score band, findings, trend, radar, breakdown, distribution, deep-dive | `.panel` → Card; charts already use `ui/chart` |
| `/trash` | migrate | 15-day retention; type filter; bulk restore/purge; detail sheet | `.segment` → ToggleGroup; bare `<input>`/`<select>` → `Input`/`Select` |
| `/plan` | keep | Redirect to `/plan/<today>`. |
| `/plan/week/[date]` | migrate | 7-day schedule + revision queue | `.panel`/`.section-label` → Card |

### 4.4 Loading / error / not-found

Every workspace + auth route ships its own `loading.tsx` (`RouteSkeleton`,
`SkeletonHeader`, `SkeletonMetricStrip`, `SkeletonPanel`, `SkeletonFilterRow`,
`SkeletonList` from `shared/route-skeleton`) and `error.tsx` (`RouteError`).
`not-found.tsx` at root + `plan/[date]` + `plan/week/[date]`. **Migrate**
`RouteSkeleton`/`RouteError` to registry `Skeleton`/`Alert` wrappers; keep
per-route copy.

---

## 5. Components audit

### 5.1 `src/components/ui/*` — 34 primitives

29 are **customised to house tokens** (`bg-paper`, `border-rule`, `--radius-*`,
`--control-height`, `--dur-*`, `--shadow-pop`, `--accent-*`, `.dialog-content`
CSS hooks). 5 are **still raw shadcn output** and must be regenerated against
paper tokens: `avatar.tsx`, `badge.tsx`, `form.tsx`, `label.tsx`,
`separator.tsx` (they use `bg-muted`/`bg-primary`/`bg-secondary`/
`bg-destructive`/`text-destructive`/`text-muted-foreground`/`bg-border`).

**Non-standard additions worth preserving during re-generation:**
`spinner.tsx` (`Loader2`, custom `data-slot`/`data-icon`); `switch.tsx`
(`SwitchRow` + `label` prop); `tabs.tsx` (renders as `.segment-group`/`.segment`,
adds `overflowBehavior` + `TabsCaption`); `toggle-group.tsx` (custom
`variant="segment"|"card"` + `overflowBehavior`); `command.tsx` (`suffix` +
`count` props, full-bleed mobile); `pagination.tsx` (uses `PlainIcon`); `progress.tsx`
(`label` prop); `sheet.tsx` (`showCloseButton`, `overlayClassName`, per-side radius);
`dropdown-menu.tsx` (`danger` prop); `drawer.tsx` (`DrawerBody` scroll region);
`sidebar.tsx` (`COLLAPSED_ICON_BUTTON`/`COLLAPSED_TEXT_SPAN` helpers, 800 lines).

**Primitives importing `lucide-react` (8):** `accordion` (ChevronDown), `checkbox`
(Check), `command` (Search), `dialog` (X), `select` (Check, ChevronDown), `sheet`
(X), `sidebar` (PanelLeftDashed), `spinner` (Loader2). None import `@duo-icons/react`.

### 5.2 Hand-rolled components that duplicate registry functionality (prime targets)

| Component | Duplicates | Action |
|---|---|---|
| `toast.tsx` | shadcn `sonner` | Replace with sonner (registry) |
| `shared/charts/breakdown-donut.tsx` | recharts `PieChart` via `ui/chart` | Replace hand-rolled SVG |
| `shared/charts/sparkline.tsx` | recharts `LineChart` via `ui/chart` | Replace hand-rolled SVG |
| `shared/charts/score-band.tsx` + `metric-strip.tsx` + `dashboard-panels.tsx` (`Panel`) | registry stat-card / `ui/card` | Consolidate on `Card` + one `MetricCell` |
| `attempt-outcome-card.tsx` + `attempt-outcome-card.module.css` (the repo's **only** CSS module) | recharts + `ui/card` | Replace bespoke donut + CSS module |
| `shared/ai/chat-composer.tsx` | registry "prompt-input" | Adopt shadcn-chat/animate-ui prompt-input |
| `shared/ai/chat-transcript.tsx` (616 lines) | registry chat-message / reasoning / scroll-to-bottom | Migrate |
| `shared/ai/conversation-list.tsx` (359 lines) | registry conversation-list / sidebar-list | Migrate |
| `shared/ai/chat-empty-state.tsx` | registry "prompt-suggestions" | Migrate |
| `landing/atoms.tsx` (CountUp/Petals/TypedLine/InkArt) | animate-ui motion atoms | Migrate |
| `landing/chrome.tsx` + `landing/masthead.tsx` | registry scroll-progress / `useInView` | Migrate scroll-spy/progress |
| `ai-chat-sheet.tsx` | `ui/tabs` (already maps to `.segment-group`) | Use `ui/tabs` for the segmented bar |
| `mock-detail-dialog.tsx` | `ui/dialog` + `ui/alert-dialog` | Drop raw `radix-ui` Dialog/AlertDialog |
| `date-range-filter.tsx` | `ui/popover` | Drop raw `radix-ui` Popover |
| `shared/tasks/task-editor.tsx`, `shared/tasks/groups-manager.tsx` | `ui/dialog` (or `ui/drawer` on phones) | Drop raw `radix-ui` Dialog |
| `landing/faq.tsx` | `ui/accordion` | Drop raw `radix-ui` Accordion |
| `scope-filters.tsx` | `ui/toggle-group` (`variant="segment"`) | Replace `.segment` buttons |
| `shadcn-studio/command/command-03.tsx` | — | **Delete** (unused copy-pasted example) |
| `ai-settings-form.tsx` model picker | `ui/command` combobox | Replace bespoke model-list search |
| `shared/tasks/personal-calendar.tsx` | registry calendar / `react-day-picker` | Optional |

### 5.3 Components to keep (well-architected, no registry duplicate)

`icon.tsx` (central system — but internals re-point to Hugeicons), `app-shell.tsx`
(structure), `workspace-chrome.tsx`, `error-boundary.tsx`, `query-provider.tsx`,
`theme-provider.tsx`, `theme-style-provider.tsx`, `theme-toggle.tsx`,
`appearance-panel.tsx`, `exam-context.tsx`, `exam-switcher.tsx`, `auth-control.tsx`,
`command-palette.tsx`, `dashboard-clock.tsx`, `dashboard-overview.tsx`,
`page-header.tsx`, `motion-swap.tsx`, `private-workspace.tsx`, `google-glyph.tsx`
(brand SVG — keep), `google-sign-in-button.tsx`, `attempt-display.tsx` (utility),
`attempt-pagination.tsx`, `date-range-filter.tsx` (after Popover swap),
`metric-strip.tsx` (after consolidation), `performance-overview.tsx`,
`performance-preview.tsx`, `scope-filters.tsx` (after ToggleGroup swap),
`ai-coach-card.tsx`, `use-*` hooks (data layer), `shared/route-skeleton.tsx`,
`shared/route-error.tsx`, `shared/empty-scope-notice.tsx`, `shared/settings-guard.tsx`,
`shared/settings-schema.ts`, `shared/use-analytics-data.ts`, `shared/use-filters-state.ts`,
`shared/plan/*`, `shared/tasks/{task-row,task-status-button,personal-todos,ai-composer}`,
`shared/ai/{markdown,copy-button,usage-footer,task-suggestion-card,log-mock-flow}`,
`shared/ai/image.ts`, `auth/{auth-shell,password-input,otp-input,auth-error-announcer,
sign-in-form,sign-up-form,forgot-form,plates/*}`, `landing/{index,hero,hero-art,
reveal,section,film-section,sections,ledger-facts,planner-section,scope-diagram,
plan-facts,fixtures,plan-data,landing-error,motion,mockups/*}`,
`search/{highlight,use-search}`.

---

## 6. AI components coverage

AI features live on `/ask` (full chat + Todos + Mock tools), `/dashboard`
(`AiCoachCard`), `/settings` (`AiSettingsForm`), `/my-tasks` (`AiPlanSheet`,
`ai-composer`), `/add` (AI extraction `ExtractionReview` + `LogMockFlow`). The
global AI sheet is owned by `workspace-chrome` + `use-ai-workspace`.

| Checklist item | Status | Component |
|---|---|---|
| Conversation/message list | ✅ hand-rolled | `shared/ai/conversation-list.tsx` |
| Prompt input (auto-resize, attachments, submit states) | ✅ hand-rolled | `shared/ai/chat-composer.tsx` |
| Streaming text (cursor/loader) | ✅ hand-rolled | `chat-transcript.tsx` `AssistantBody` + `use-ai-workspace` Ndjson delta |
| Reasoning/thinking blocks (collapsible) | ✅ hand-rolled | `chat-transcript.tsx` `ThinkingBlock` (live seconds clock, auto-tail) |
| Tool-call / tool-result cards | ❌ **absent** | Only `task-suggestion-card` (custom fenced-block convention, not tool calls) |
| Source/citation chips | ❌ **absent** | No citation UI |
| Suggestion chips / quick actions | ✅ hand-rolled | `shared/ai/chat-empty-state.tsx` (5 chips, staggered) |
| Code blocks (copy + syntax) | ✅ hand-rolled | `shared/ai/markdown.tsx` `pre` → `CopyButton` |
| Markdown rendering | ✅ hand-rolled | `shared/ai/markdown.tsx` (ReactMarkdown + remark-gfm, no rehype-raw) |
| Model/provider selector | ⚠️ Settings-only, bespoke | `ai-settings-form.tsx` (Selects + custom model-list search; no in-chat picker) |
| Empty states | ✅ | `chat-empty-state` (suggestions) + `ai-chat-sheet` (setup form when unconfigured) |
| Loading states | ✅ | `ThinkingBlock` connecting/thinking dots + `ChatPhase` state machine |

**Gaps:** tool-call cards, citation chips, in-chat model selector. The existing
AI surface is entirely hand-rolled — it duplicates registry chat patterns and is
the single biggest AI migration block. Motion is `motion/react` with
`useReducedMotion` honored; CSS handles `.thinking-shimmer`/`.thinking-dots`.

---

## 7. Icon migration plan (lucide + duo → Hugeicons)

### 7.1 Current state

- **`@duo-icons/react`** — used in **exactly 1 file**: `src/components/icon.tsx`
  (20 named imports). Tinted via `.icon-duo .duo-icons-primary/secondary-layer`
  CSS in `globals.css`. `scripts/fix-duo-icons.mjs` (postinstall) rewrites
  kebab `fill-rule` → camelCase to silence React 19 warnings (cosmetic only).
- **`lucide-react`** — used in **46 files**; **79 distinct names** (73 unique
  after `*Icon`-alias collapse). Heaviest: `icon.tsx` (32), `personal-todos.tsx`
  (12), `ask-view.tsx` (10). 8 `ui/*` primitives hardcode 6 lucide icons
  (`Check`, `ChevronDown`, `Loader2`, `PanelLeftDashed`, `Search`, `X`).

### 7.2 `icon.tsx` — the central system

Exports `IconName` (56 semantic names), `resolveIcon()`, `DuotoneIcon`
(true duotone via Duo, or "echo technique" two-stacked-lucide fallback),
`DuotoneTile` (44px bordered tile), `PlainIcon` (single-tone, default
`strokeWidth 1.75`). Tones: `ink|accent|paper|muted|mono`. Canonical sizes:
14 micro · 16 inline · 18 nav/row · 22 tile · 28 large tile.

### 7.3 Migration surface

1. `package.json` — remove `lucide-react`, `@duo-icons/react`; add
   `@hugeicons/react` + `@hugeicons/core-free-icons`; remove
   `node scripts/fix-duo-icons.mjs` from `postinstall`.
2. `scripts/fix-duo-icons.mjs` — delete.
3. `src/components/icon.tsx` — rewrite the `ICONS` table (56 names → Hugeicons
   components); replace `type LucideIcon`; simplify `DuotoneIcon` (drop echo
   branch if Hugeicons ships native duotone for all names). Keep the
   `IconName`/`PlainIcon`/`DuotoneIcon`/`DuotoneTile` API so the ~25 consumers
   don't change.
4. `src/app/globals.css` lines 1310–1366 — replace `.duo-icons-*` layer
   selectors with Hugeicons' layer classes (or `data-slot`).
5. **46 files** with direct `lucide-react` imports → Hugeicons named imports
   (or route through `icon.tsx`'s `PlainIcon`/`DuotoneIcon`). The 79-name list
   (§7.4) is the mapping table source.
6. **8 ui primitives** — swap hardcoded lucide → Hugeicons (`spinner.tsx` prop
   type is `React.ComponentProps<typeof Loader2>` — must switch to Hugeicons
   component type).
7. `not-found.tsx` + `maintenance/page.tsx` — server-component inline duotone
   echo; collapses to a single Hugeicons glyph once native duotone is available.
8. `google-glyph.tsx` — **keep as inline SVG** (brand mark, not an icon).
9. The 12 data-viz/landing `<svg>` files (charts, mockups) — **out of scope**
   (not icons).

### 7.4 Distinct lucide names to map (79)

`Activity, AlertCircle, ArrowDown, ArrowDownRight, ArrowDownToLine, ArrowLeft,
ArrowRight, ArrowUp, ArrowUpRight, BadgeCheck, BarChart3, Bell, BookOpen, Brain,
BrainCircuit, Calculator, CalendarClock, CalendarDays, CalendarPlus,
ChartNoAxesColumnIncreasing, Check, ChevronDown, ChevronLeft, ChevronRight,
CircleHelp, ClipboardPaste, Columns3, Compass, Copy, CopyIcon, Ellipsis, Eye,
EyeOff, FileCheck2, Flag, FlaskConical, FolderOpenIcon, GitBranchIcon,
GitCompare, GitCompareArrows, History, ImagePlus, Layers3, Lightbulb, List,
ListChecks, ListTodo, Loader2, LogOut, MailWarning, MessageSquare, Minus,
Monitor, MonitorSmartphone, MoreHorizontal, PanelLeftDashed, Pause, Pencil,
Play, Plus, RefreshCw, RotateCcw, Save, ScanLine, Search, Share2Icon, Shield,
ShieldCheck, ShieldOff, SlidersHorizontal, Sparkles, SquarePen, StarIcon,
TagIcon, Trash2, TrendingUp, Wrench, X, Zap` + `type LucideIcon`.

### 7.5 Niche / hard-to-map icons (design attention)

`BrainCircuit`, `ChartNoAxesColumnIncreasing`, `FlaskConical`,
`GitCompareArrows`/`GitCompare`, `MonitorSmartphone`, `MailWarning`,
`ShieldOff`, `ScanLine`, `PanelLeftDashed`, `SquarePen`, `ImagePlus`,
`BadgeCheck`, `CalendarPlus/Clock/Days`, `Columns3`/`ListChecks`/`ListTodo`.
The 20 duo names (`AddCircle, AlertTriangle, Award, Book, Calendar,
CheckCircle, Clipboard, Clock, Dashboard, File, Fire, Info, Menu, Moon2,
Settings, Sun, Target, UploadFile, UserCard, World`) are simple glyphs — low
risk.

---

## 8. Proposed migration plan (layers, after approval)

0. **Regenerate the 5 raw primitives** (`avatar`, `badge`, `form`, `label`,
   `separator`) against paper tokens; add `--chart-1…5` aliases; resolve the
   `--accent` collision strategy (wrapper or token override) for every registry
   component on install.
1. **Registries + tokens + icons:** `npx shadcn` config; add `@animate-ui` +
   `@hairline` registries; install Hugeicons; rewrite `icon.tsx`; sweep 46
   lucide importers; delete `fix-duo-icons.mjs` + `command-03.tsx`.
2. **Foundations:** Button, Input, Textarea, Label, Select, Checkbox,
   Radio Group, Switch, Slider, Toggle, Toggle Group, Badge, Avatar, Separator,
   Skeleton, Kbd, Typography.
3. **Layout & navigation:** Sidebar, Navigation Menu, Menubar, Breadcrumb,
   Tabs, Resizable, Scroll Area, Aspect Ratio, Card, Sheet, Drawer,
   Collapsible, Accordion.
4. **Overlays:** Dialog, Alert Dialog, Popover, Tooltip, Hover Card, Dropdown
   Menu, Context Menu, Command palette, Combobox.
5. **Data display:** Table (TanStack), Pagination, Chart (recharts), Progress,
   Calendar, Date Picker, Carousel, Empty states, Stat cards. Replace the 3
   hand-rolled SVG charts + `attempt-outcome-card` CSS module.
6. **Forms:** shadcn Form + RHF + zod (validation, descriptions,
   disabled/loading states).
7. **Marketing & auth:** landing blocks (hero, features, plan, compare, AI,
   privacy, FAQ, CTA, footer) + sign-in/up/forgot.
8. **AI features:** migrate chat-composer/transcript/conversation-list/
   empty-state to registry patterns; add tool-call + citation chips + in-chat
   model selector.
9. **Remove legacy:** delete unused CSS classes, the CSS module, old icon
   packages.
10. **Verify:** dev server (persistent via `setsid`), every route in light/dark,
    both styles, mobile/tablet/desktop; screenshots under `docs/ui-screenshots/`.
11. **Final report:** branch + commits, component decision table, token map,
    icon migration summary, deferred items, behavior-change confirmation (none).

After each layer: `npm run lint` + `npm run typecheck` + `npm run build`; fix
before continuing.

---

## 9. Sandbox verification constraints (honest disclosure)

- **No Neon Postgres** → Prisma queries fail at runtime; `db:push` cannot run.
  The dev server starts (`npm run dev`), but workspace pages that hit the DB
  will show error states. Auth-gated workspace pages redirect to `/sign-in`
  (Neon Auth not configured). **Verifiable in-browser without credentials:**
  `/` (landing), `/sign-in`, `/sign-up`, `/forgot-password`, `/maintenance`,
  `/not-found`, plus component-level rendering. Workspace interiors require a
  DB to fully exercise; I'll verify their UI via type/lint/build + component
  isolation, and flag any flow that genuinely cannot be browser-verified.
- Dev server background process needs `setsid` to persist across shell calls
  in this sandbox (solved in the verification phase).

---

## 10. Decisions required before proceeding (STOP for approval)

This audit reveals **more than a few pages** (19 pages, ~40 components), so per
the task process I am stopping for approval. Three decisions are needed:

1. **Vega/Lyra vs mira/sera.** The shadcn registry has only `new-york` +
   `default` (no `vega`, no `lyra`). The repo's `globals.css` defines two styles
   `mira` (default, rounded) and `sera` (override, zero-radius + ink offsets),
   switched via `data-style` on `<html>` — this is the "method in globals.css"
   you referenced. `"vega"` exists only as a legacy localStorage value migrated
   to `mira`. **Recommended:** treat the existing **mira/sera** system as the
   two styles (mira = the refined default, sera = the brutal override), keep
   the `data-style` switching mechanism, and document the mira↔"Vega" /
   sera↔"Lyra" mapping in `DESIGN.md`. Confirm or redirect.

2. **Six brand colors = six palettes.** Confirm the six "brand colors" are the
   six palette identities (`orange`, `blue`, `lime`, `violet`, `rose`,
   `graphite`), each contributing its `--accent` (and neutrals) — not six
   single hex values. Status colors (positive/warning/danger) stay shared
   across palettes (as currently designed). Confirm.

3. **Token bridge fixes.** Approve adding `--chart-1…5` aliases (mapped to the
   existing subject hues `quant/reasoning/english/ga/computer`) so registry
   chart components resolve, and approve the `--accent` collision strategy
   (wrap/override registry components that use `bg-accent` for hover, since
   `--accent` here is the primary brand color, not a neutral hover surface).

**Awaiting your approval and the three decisions above before any migration
work begins. No source files have been modified yet (only `.gitignore` for
sandbox-only files).**
