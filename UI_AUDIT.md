# UI Audit — Hairline-only rebuild of ssc-insight

Status: **migration COMPLETE** (branch `ui/hairline`). The rebuild is done:
- Token system: six OKLCH palettes × light/dark via `data-theme` + `.dark`,
  graphite default, WCAG AA gate (`scripts/check-contrast.ts`, 216 pairs PASS).
- Chrome, all 13 workspace pages, landing, auth pages, AI surfaces, system
  pages rebuilt on Hairline UI (+ Animate UI animated Hugeicons, static
  Hugeicons fallback).
- Legacy removed: `components/ui/*` (shadcn primitives), sonner, radix,
  cmdk, recharts; hard-color gate `scripts/check-ui-tokens.ts` PASS.
- Gates at completion: tsc clean, eslint 0 errors, 516/516 tests,
  all 19 routes HTTP 200, dashboard + /ask browser-verified with screenshots
  (`docs/ui-screenshots/hairline-final-*.png`).

### User decisions (gate outcome)

1. **Branch**: `ui/hairline` (not `zaj/hairline-ui`).
2. **Style axis: DROPPED.** No `data-style="vega|lyra"`, no dual geometry, no
   override layer (§9.1 options a/b/c are all moot). Hairline's own default
   look — its built-in per-component border radius — is used as shipped.
   Theme axes are exactly two: `class="dark"` (next-themes) + `data-theme`
   palette (six, default **Graphite**).
3. **shadcn is fully replaced.** No shadcn core components remain; the shadcn
   CLI is used only as the installer for Hairline (and @animate-ui icons).
   Hairline provides everything else.

---

## 0. Preflight (detected)

| Item | Value |
|---|---|
| Repository | `ssc-insight` (already in place — nothing cloned) |
| Framework | Next.js **16.4.6** (App Router, `--webpack` dev server), React **19.2** |
| Styling | Tailwind CSS **v4** (`@tailwindcss/postcss`; no `tailwind.config.*`) |
| Package manager | **npm** (`package-lock.json` is the repo's lockfile; a stray `bun.lock` from the sandbox is also present/tracked) — commands will use `npm`/`npx` |
| Existing UI folders | `src/components/ui/` (35 shadcn-style primitives — TO BE DESTROYED), `src/components/animate-ui/` (2 Animate-UI components from the previous iteration — to be re-fetched as icons), `src/components/icon.tsx` + `ui/icons.tsx` (Hugeicons system), plus ~40 app components (all to be replaced) |
| Routes/pages | 19 pages total (see §4) |
| AI/chat features | **Yes** — `/ask` (full chat: transcript, composer, conversation list, usage), `/dashboard` (AI coach card), `/settings` (AI provider form), `/my-tasks` (AI plan sheet + composer), `/add` (AI extraction review); global AI sheet in the workspace chrome; `/api/ai/*` (9 route files — untouched) |
| Git state | **NOT CLEAN** — see §8 |

---

## 1. Hairline inventory (all 259 components, from llms-full.txt)

Install pattern for every free component:
`npx shadcn@latest add https://hairlineui.com/r/<name>.json`
(MIT-licensed; 258 free + 1 premium block.)

### 1.1 Foundations
`button` · `button-group` · `split-button` · `copy-button` · `action-button`
· `expanding-button-group` · `floating-button-group` · `icon-morph`
· `input` · `textarea` · `password-input` · `search-input` · `select`
· `multi-select` · `date-picker` · `time-picker` · `timezone-picker`
· `checkbox` · `radio-group` · `switch` · `slider` · `color-picker`
· `currency-input` · `phone-input` · `credit-card-input` · `rating-input`
· `segmented-control` · `badge` · `avatar` · `spinner` · `progress`
· `skeleton` · `kbd` · `steps` · `code-input` · `stepper-input`
· `tag-input` · `inline-edit` · `wheel-picker` · `combobox`

### 1.2 Layout & navigation
`tabs` · `liquid-tabs` · `feature-tabs` · `accordion` · `faq-accordion`
· `collapsible` · `breadcrumb` · `pagination` · `toggle-group` · `morphing-nav`
· `page-outline` · `split-pane` · `week-calendar` · `shortcut-sheet`
· `magnifying-dock` · `morphing-chart` (chart w/ nav behavior)

### 1.3 Overlays
`tooltip` · `popover` · `hover-card` · `dropdown-menu` · `context-menu`
· `dialog` · `sheet` · `command-palette` · `combobox` · `tour-line`
· `lasso` · `stamp`

### 1.4 Data & display
`data-table` · `kanban-board` · `filter-bar` · `tree-view` · `sparkline`
· `trend-chart` · `area-chart` · `combo-chart` · `stage-bars` · `activity-rings`
· `donut-chart` · `activity-heatmap` · `live-line-chart` · `earnings-chart`
· `steps-chart` · `revenue-chart` · `compare-bars` · `threshold-line`
· `pillar-chart` · `pace` · `dot-meter` · `balance-meter` · `spending-ring`
· `status-bars` · `range-brush` · `tick-tape` · `goal-tape` · `range-ruler`
· `ratio-balancer` · `number-roll` · `stats-band` · `level-dial` · `lens-bars`
· `json-inspector` · `doc-comments` · `changelog-timeline/trace/scrubber`
· `timeline` · `task-card` · `sortable-list` · `onboarding-checklist`
· `leaderboard` · `seat-map` · `api-keys` · `env-editor` · `backup-codes`
· `ip-allowlist` · `team-members` · `webhooks` · `domain-connect` · `integrations`
· `log-stream` · `job-queue` · `csv-import` · `notification-inbox`
· `release-train` · `time-overlap` · `weekly-hours` · `cron-input`
· `time-range-picker` · `date-range-picker`

### 1.5 Feedback & states
`alert` · `toast-stack` · `empty-state` · `not-found` · `spinner`
· `skeleton`(+`SkeletonSwap`) · `status-capsule` · `status-button`
· `chat-notice` · `thinking-indicator`

### 1.6 Forms
`settings-form` · `steps-form` · `waitlist-field` · `amount-field` · `search-input`
(+ all §1.1 inputs)

### 1.7 Marketing / auth blocks
`stats-band` · `announcement-pill` · `testimonials` · `faq-accordion`
· `logo-marquee` · `expanding-gallery` · `card-deck` · `scroll-story`
· `pricing-toggle` · `pricing-calculator` · `pricing-plans` · `comparison-table`
· `auth-card` · `create-password` · `verify-code` · `waitlist` · `username`
· `cookie-banner` · `cookie-consent` · `newsletter-footer` · `feedback`
· `sudo-gate` · `delete-workspace` · `terms` · `passkey-button` · `pay-button`
· footers: `tide-footer` · `skyline-footer` · `fluted-footer` · `ridge-footer`
· `monolith-footer` · `atlas-footer`
· **premium (NOT free, not installable without an All-Access token):**
`halftone-hero` — the only hero block; source not public.

### 1.8 AI chat parts (complete set)
`prompt-composer` · `agent-composer` · `mention-menu` · `attachment-chip`
· `mode-switcher` · `model-picker` · `voice-input` · `voice-note`
· `thinking-indicator` · `thinking-trace` · `tool-call` · `clarifying-question`
· `approval-card` · `plan` · `web-research` · `command-output` · `task-progress`
· `task-log` · `streaming-answer` · `code-block` · `citation`
· `response-versions` · `selection-actions` · `inline-rewrite` · `diff-review`
· `action-receipt` · `chat-notice` · `usage-meter` · `usage-limits`
· `chat-scroll` · `message-edit` · `chat-history` · `live-activity`
· `live-cursors` · `live-map` · `agent-playback`

### 1.9 Specialty / decorative (not needed for coverage)
`folder` · `reactions` · `voice-bar` · `voice-orb` · `dither-veil`
· `shortcut-recorder` · `video-player` · `float` · `light-writing` · `delete-undo`
· `add-to-cart` · `slide-to-send` · `camera-key` · `snowfall` · `live-qr`
· `signature-pad` · `token-bucket` · `streak-chain` · `merge-button` · `afterglow`
· `hold-to-start` · `scene-mixer` · `track-player` · `mist-reveal` · `grain-reveal`
· `film-develop` · `reeded-reveal` · `variant-pick` · `inpaint-brush` · `sand-away`
· `burn-away` · `shatter-away` · `drain-away` · `clear-to-dust` · `text-morph`
· `privacy-mask` · `avatar-cropper` · `drop-zone` · `drop-zone-membrane`
· `swipe-actions` · `hold-to-confirm` · `image-compare` · `workflow-canvas`
· `wallet` · `convert` · `booking` · `cart` · `referral` · `buy-box` · `checkout`
· `order-status` · `subscription` · `file-share` · `poll` · `storage` · `app`-specific

---

## 2. Hairline's theming model (from the docs)

- **Token names:** the standard **shadcn/ui theme variables** (the docs: "takes
  on the project's shadcn theme… Needs React 19, Tailwind CSS v4 and shadcn/ui
  theme variables (any style, light and dark)"). Explicitly referenced in
  component docs: `--primary`, `--primary-foreground`, `--chart-1 … --chart-5`,
  `--foreground`, plus the implied standard set (`--background`, `--card`,
  `--muted`, `--border`, `--ring`, `--destructive`, `--sidebar-*`, etc.).
  Chart components color series **in order `--chart-1`..`--chart-5`**.
- **Radius/border/density/font control: NONE.** No `--radius` or density/font
  tokens are referenced anywhere in the docs. Geometry is per-component:
  `size` props (`xs/sm/md/lg`, px values), variants (`pill|field`,
  `rows|cards`, `underline|pills`), hardcoded Tailwind radius utilities
  (`rounded-full`, `rounded-lg`, …) inside each component's source. → This is
  the **Vega/Lyra blocker**, see §9.
- **Tailwind setup:** needs a shadcn-style base (the CSS variables + a
  Tailwind v4 `@theme` mapping so `bg-primary` etc. resolve). Hairline ships
  **no base layer of its own** — the project's `globals.css` must define the
  variables (that's where our 6 palettes live).
- **Icons it ships:** **lucide-react** (109 of 259 components declare
  `npm: lucide-react`). The CLI installs it as a dependency of those
  components. → Replace per task §5 rule 2: through each component's real
  icon slots where offered (`icon`, `leading/trailing`, `action.icon`,
  MenuEntry.icon, etc.), else report.
- **Animation library:** none ("No animation library and no provider to set
  up") — all motion is hand-rolled inside each component (CSS/WAAPI).
- **Dependencies between components:** internal needs (`text-morph`,
  `number-roll`, `status-button`, …) are installed automatically by the CLI.

---

## 3. Coverage map — required category → Hairline component (or gap)

| Category / need | Hairline component | Notes |
|---|---|---|
| Button | `button` | variants primary/secondary/outline/ghost/destructive/link; sizes xs–icon; `icon`/`trailingIcon` ReactNode slots (Hugeicons drop in); `loading` |
| Input | `input` | label/hint/error; leading/trailing; clearable; 28/36px |
| Textarea | `textarea` | auto-height, footer/action slots, ⌘↵ submit |
| Label (standalone) | — **gap** | every Hairline field has a `label` prop; compose standalone labels only where needed |
| Select | `select`, `multi-select`, `combobox` | |
| Checkbox | `checkbox` | boolean + "mixed" |
| Radio | `radio-group` | list/cards variants |
| Switch | `switch` | async-aware thumb |
| Slider | `slider` | single + range |
| Toggle / Toggle group | `toggle-group` | merged-fill behavior |
| Badge | `badge` | tones, dot, count, 12px `icon` slot |
| Avatar | `avatar` + `AvatarGroup` | initials fallback, status |
| Separator | — **gap** | compose hairline divs from tokens |
| Skeleton | `skeleton` + `SkeletonSwap` | |
| Kbd | `kbd` (+ `shortcut-sheet`) | |
| Typography | — **gap** | Tailwind + tokens; no component |
| **Sidebar** | — **GAP (biggest)** | no sidebar component. Compose: rail + `Sheet` (mobile) + `button`/`tooltip`/`avatar`/`dropdown-menu`/`breadcrumb`. Custom component `components/workspace-sidebar.tsx` |
| Navigation menu / menubar | `morphing-nav` | dropdown-panel nav |
| Breadcrumb | `breadcrumb` | icon slots |
| Tabs | `tabs`, `liquid-tabs`, `feature-tabs` | |
| Resizable | `split-pane` | |
| Scroll area | — **gap** | CSS overflow (composed) |
| Aspect ratio | — **gap** | CSS `aspect-ratio` |
| Card | — **gap** | compose from tokens (border/bg/radius) — note Hairline has no generic Card |
| Sheet / Drawer | `sheet` (`side=bottom` = drawer) | |
| Collapsible | `collapsible` | |
| Accordion | `accordion`, `faq-accordion` | |
| Dialog | `dialog` | footer-as-function; size sm/md/lg |
| Alert dialog | — near-gap | compose: `dialog` + destructive `button`s; dedicated confirm patterns exist as `delete-workspace`, `hold-to-confirm`, `delete-undo` |
| Popover | `popover` | children-as-`({close})` |
| Tooltip | `tooltip` | shortcut prop |
| Hover card | `hover-card` | |
| Dropdown menu | `dropdown-menu` | MenuEntry `icon` slot, checkbox rows |
| Context menu | `context-menu` | |
| Command palette | `command-palette` | fuzzy, nested, hotkey |
| Combobox | `combobox` | async search, chips |
| Table (sort/filter/paginate) | `data-table` | full: sort/search/select/row actions/undo/editable/expandable detail/`pageSize` — replaces current custom tables + shadcn pattern |
| Pagination | `pagination` | |
| Charts | `trend-chart`, `area-chart`, `combo-chart`, `donut-chart`, `stage-bars`, `activity-rings`, `activity-heatmap`, `live-line-chart`, `sparkline`, `compare-bars`, `threshold-line`, `pillar-chart`, `morphing-chart`, `earnings-chart`, `steps-chart`, `revenue-chart` | **all SVG, zero npm deps — recharts becomes unnecessary** |
| Radar chart | — **gap** | compose custom SVG radar from tokens (used on /performance) |
| Month-grid calendar | — **gap** | `week-calendar` covers week/day; compose the month grid from tokens (current /calendar page) |
| Date picker | `date-picker`, `date-range-picker` | typed or picked |
| Calendar | `week-calendar` | drag-create/resize events |
| Carousel | — **gap** | `card-deck`/`expanding-gallery` adjacent; compose if needed |
| Empty states | `empty-state` | scenes inbox/search/done/offline/chart + action status |
| Stat cards | `stats-band`, `number-roll`, `sparkline`, `dot-meter`, `pace`, `spending-ring`, `balance-meter` | |
| Alert | `alert` | tone + custom `icon` slot |
| Toast | `toast-stack` | `toast.*` API incl. promise; replaces sonner |
| Loading | `spinner`, `thinking-indicator`, `skeleton` | |
| Error boundaries / error pages | custom + `not-found` | `not-found` has search + links |
| Forms | `settings-form` + field components | validate + async `check` + autosave + unsaved-bar |
| Hero | — **gap (premium)** | `halftone-hero` is pay-walled; compose custom hero from primitives + `stats-band` |
| Features | `feature-tabs`, `scroll-story` | |
| Testimonials | `testimonials` | |
| FAQ | `faq-accordion` | |
| Footer | 6 free footers (`tide/skyline/fluted/ridge/monolith/atlas`) | |
| Pricing | n/a — app has no pricing page (single-tier) | |
| Login/signup | `auth-card` (+ `create-password`, `verify-code`, `passkey-button`) | email→password/code/link flow; providers (Google); matches the app's email+OTP+TOTP structure |
| Forgot password | `auth-card` `onForgot` | |
| **AI — conversation list** | `chat-history` | day-grouped, searchable, rename, delete-undo |
| **AI — prompt input** | `prompt-composer` (+ `agent-composer`) | auto-grow, files (onFilesSelected), send⇄stop via `status` |
| **AI — streaming text** | `streaming-answer` (`StreamingText` + `AnswerActions` + `FollowUps`) | accepts custom markdown renderer as children |
| **AI — reasoning** | `thinking-trace` (`variant=reasoning`), `thinking-indicator` | collapsible, live timer |
| **AI — tool calls** | `tool-call` | preparing/running/done/error/denied + input/output render |
| **AI — citations** | `citation` + `web-research` + AnswerActions `sources` | inline numbered chips |
| **AI — suggestions** | `FollowUps` (+ `empty-state`) | |
| **AI — code blocks** | `code-block` | streaming highlight, copy, wrap, fold, Apply |
| **AI — markdown** | keep `react-markdown`+`remark-gfm` (proposed) rendered through `StreamingText` children | |
| **AI — model selector** | `model-picker` | speed/intelligence/reasoning/locked |
| **AI — empty/loading** | `empty-state`, `thinking-indicator`, `skeleton` | |
| **AI — usage** | `usage-meter`, `usage-limits` | bar/ring, reset countdown |
| **AI — jump-to-latest** | `chat-scroll` | follow/let-go behavior |
| **AI — edit & resend** | `message-edit` | |
| **AI — notices** | `chat-notice` | error/offline/rate-limit/context |
| **AI — attachments** | `attachment-chip` | upload/processing/ready/error |
| **AI — task suggestion confirm** | `approval-card`, `plan`, `action-receipt` | direct fit for the app's TaskSuggestionCard |

---

## 4. App pages/layouts — keep / migrate / replace + functional check

Functional state: verified in the last session — all 19 routes render HTTP 200
under `DEV_AUTH_BYPASS=true` (Neon DB unavailable in sandbox, so DB-driven
content shows loading/error states; chrome + components render). "works" below
means route + chrome render; data-dependent interiors are "works (sandbox
degraded)".

**Everything visual is REPLACE (destroy & rebuild). "Keep" = non-visual
infrastructure only.**

| Page / layout | Verdict | Functional check |
|---|---|---|
| `src/app/layout.tsx` | replace (rebuild providers/head) | works — root shell, fonts, prepaint script (to be rewritten for the new 3-axis theme) |
| `(workspace)/layout.tsx` | replace visuals, keep auth-gate structure | works — requireUser + cookie sidebar state |
| `/` landing (`page.tsx` + `landing/*` ~20 components) | replace | works — hero, plates, sections, FAQ, footer (all custom today) |
| `/sign-in`, `/sign-up`, `/forgot-password` | replace | works — RHF+zod forms, Google OAuth, OTP/TOTP (Neon Auth unavailable in sandbox) |
| `/maintenance` | replace visuals | works |
| `/not-found` | replace | works |
| `/dashboard` (+ `_dashboard/*` 4 files) | replace | works — overview strip, plan sections, AI coach, week strip |
| `/history` (+2) | replace | works — server-paged table (→ `data-table`) |
| `/calendar` (+15 sub-files) | replace | works — month/week/day/agenda ledger (biggest; month grid is the gap) |
| `/compare` (+2) | replace | works — picker + insight stack |
| `/add` (+4, MockForm ~48KB) | replace visuals | works — RHF+zod subject rows; AI extraction review |
| `/ask` (+3) | replace | works — the AI surface (full Hairline AI set available) |
| `/my-tasks` (+10) | replace | works — board/list, bulk, AI plan sheet |
| `/performance` (+8) | replace | works — trend/radar/distribution (radar = gap) |
| `/plan`, `/plan/[date]` (+3), `/plan/week/[date]` (+2) | replace | works |
| `/settings` (+8 panels) | replace | works — 8 sections + guard (→ `settings-form` patterns) |
| `/trash` (+2) | replace | works — retention, bulk restore/purge |
| `app-shell.tsx`, `workspace-chrome.tsx`, all `components/*` (~148 files) | replace | works (as verified) |
| `components/ui/*` (35 primitives), `ui/icons.tsx` barrel | **destroy** | works today but out-of-scope for the new system |
| hooks (`use-ai-workspace`, `use-plan-data`, `use-todos-data`, `use-*`), `lib/*`, `api/*`, `stores/*`, prisma | **keep** (non-visual) | works — untouched per constraints |
| `globals.css` (2974 lines, mira/sera + 6 palettes) | **destroy** → new 6-palette OKLCH system | works — replaced by the new token system |

---

## 5. Icon inventory (current → target)

**Current:** ALL icons are Hugeicons, centralized:
- `src/components/ui/icons.tsx` barrel — 63 named wrappers in active use:
  `Activity AddCircle AlertCircle ArrowDown ArrowDownRight ArrowDownToLine
  ArrowLeft ArrowRight ArrowUp ArrowUpRight Award BadgeCheck BarChart3 Bell
  Book BookOpen Brain BrainCircuit Calculator Calendar CalendarClock
  CalendarDays CalendarPlus ChartNoAxesColumnIncreasing Check CheckCircle
  ChevronDown ChevronLeft ChevronRight CircleHelp ClipboardPaste Columns3
  Compass Computer Copy Dashboard Delete Ellipsis Eye EyeOff File FileCheck2
  Fire Flag FlaskConical FolderOpen GitBranch GitCompare GitCompareArrows Globe
  History ImagePlus Info Layers3 Lightbulb List ListChecks ListTodo Loader2
  LogOut MailWarning Menu MessageSquare Minus Monitor MonitorSmartphone Moon
  MoreHorizontal PanelLeftDashed Pause Pencil Play Plus RefreshCw RotateCcw
  Save ScanLine Search Settings Share2 Shield ShieldCheck ShieldOff
  SlidersHorizontal Sparkles SquarePen Star Sun Tag Target Trash2 TrendingUp
  UploadFile UserCard Wrench X Zap`
- `src/components/icon.tsx` semantic layer — 56 names (`dashboard … quant
  reasoning english ga computer` incl. subjects, tones, statuses) consumed by
  ~25 call sites.

**Target (per task §5):** Animate UI animated Hugeicons,
`npx shadcn@latest add @animate-ui/icons-hugeicons-<slug>` (lands in
`components/animate-ui/icons/`; first install pulls `@animate-ui/react/icons`
core). Slugs must be looked up on the docs page / MCP — **not guessed**.
Per-icon table (icon | slug | path | used-at) is produced during migration; every
name above gets either an animated equivalent or a recorded static
`HugeiconsIcon` fallback. Density rule: static Hugeicons in dense lists/tables;
animated on interactive (hover+tap), few hero icons (`animateOnViewOnce`),
`loop` only for progress. Sizes from one scale: 16 / 20 / 24.

**Icons inside Hairline components (lucide-react in 109 components):** replaced
through each component's real icon slots (Button `icon`/`trailingIcon`, Input
`leading/trailing`, Badge `icon`, Alert `icon`, dropdown MenuEntry `icon`,
EmptyState action `icon`, ToolCall `icon`, Combobox option `icon`/`image`,
ModelPicker option `icon`, …). Components with hardcoded internal lucide icons
and no slot → **report at migration time** (candidate list: password-input eye,
copy-button, search-input magnifier, toast-stack glyphs, auth-card providers).
Google "G" brand glyph stays inline SVG (brand mark).

---

## 6. Icon/UI packages in package.json (current → plan)

| Package | Current | Plan |
|---|---|---|
| `@hugeicons/react`, `@hugeicons/core-free-icons` | ✓ | **keep** (static fallback + Hairline icon-slot replacement) |
| `@animate-ui/react` | ✓ | **keep** (runtime for animated icons; first icon install adds `@animate-ui/react/icons`) |
| `motion` ^14 | ✓ | **keep** (peer dep of animate-ui icons) |
| `lucide-react` | ✗ (removed last session) | **will return transitively** via Hairline installs (109 components need it) → replaced slot-by-slot; stays as a dependency only while Hairline's installed components import it internally |
| `sonner` | ✓ | **remove** (→ `toast-stack`) |
| `radix-ui` | ✓ | **remove** (no shadcn primitives allowed; Hairline self-contains) |
| `cmdk` | ✓ | **remove** (→ `command-palette`) |
| `recharts` | ✓ | **remove** (→ Hairline charts, zero-dep SVG) |
| `react-markdown` + `remark-gfm` | ✓ | **keep (approval requested)** — AI markdown via `StreamingText` children |
| `next-themes` | ✓ | **keep** — task §4b specifies it |
| `class-variance-authority`, `clsx`, `tailwind-merge` | ✓ | **keep** — `cn` helper + cva for composed components |
| `react-hook-form`, `zod` | ✓ | **keep (approval requested)** — MockForm/settings validation |
| `@tanstack/react-query` | ✓ | keep (data layer, non-visual) |

---

## 7. Non-Hairline libraries proposed (task §0 "source rules")

1. **react-hook-form + zod** — the 48KB MockForm + settings panels run complex
   cross-field zod schemas; Hairline fields are controlled
   (`value`/`onValueChange`) and compose with RHF; Hairline's own
   `validate`/`check` props don't cover cross-field schemas.
2. **react-markdown + remark-gfm** — AI answers render GFM; `StreamingText`
   accepts a custom renderer as children.
3. **next-themes** — task §4b mandates it for light/dark.
4. **motion + @animate-ui/react** — runtime required by Animate UI icons.
5. **@hugeicons/react + @hugeicons/core-free-icons** — static fallback per task §5.
6. **culori (new)** — for `scripts/check-contrast.ts` WCAG gate (task §4b).
7. **clsx / tailwind-merge / cva** — `cn` helper + variant authoring for the
   composed components (sidebar, cards, hero, radar).

Everything else visual comes from Hairline only.

---

## 8. Git state (STOP condition from §0.2) — RESOLVED

The earlier unclean entries were sandbox churn, captured by the external
auto-snapshot commits on `main` (397137b) — audit + screenshots + `bun.lock`
mode change; no code changes. `ui/hairline` was created from that tip with a
clean tree. Drift mitigation stays in force (verify
`git branch --show-current` before every commit; keep `main` == branch tip).

---

## 9. Gate questions (task §1C) — RESOLVED

### 9.1 Vega & Lyra on Hairline — **dropped by user decision**

Hairline exposes only color tokens (no `--radius`, border-weight, density or
font tokens); geometry is per-component. Per the user: no style type at all —
just the default, with the border radius Hairline itself provides. No
`data-style` attribute exists in the new system; no CSS override layer.

### 9.2 Six palettes onto Hairline's tokens — **YES, cleanly (approved)**

Hairline reads exactly the standard shadcn variable set; the 6
palette × light/dark blocks (`[data-theme=…]`, `.dark[data-theme=…]`) define
every token (background…sidebar-*, chart-1..5) with nothing leaking between
palettes. Palette hues (OKLCH): terracotta ~40 / blue ~255 / lime ~125 /
violet ~295 / rose ~10 / graphite ~260. **Default: graphite.** Two caveats
to verify on install (policy: remap or wrap, never blind-fork):
- tone colors (success/warning/danger in Badge/Alert/StatusButton…) may be
  hardcoded oklch inside component source — remap to our tokens where found;
- premium hero aside, a few decorative components (live-qr, snowfall,
  halftone) hardcode accents — they're not in our coverage set.

---

## 10. Known risks / open items

1. **MCP server**: no `.mcp.json` exists in the repo and I cannot confirm a
   connected shadcn MCP from this environment (task §2 requires it for
   registry search). Fallback: the uploaded `llms-full.txt` (complete) +
   `hairlineui.com/r/registry.json` + `animate-ui.com/r/registry.json` are
   the same data. Flag for your decision at setup.
2. **Sidebar** is the largest composed surface (no Hairline sidebar).
3. **Month calendar grid** (current /calendar) — `week-calendar` covers
   week/day; month grid composed from tokens.
4. **Radar chart** on /performance — compose custom SVG from tokens.
5. lucide-react returns transitively via Hairline installs; removal of the
   *dependency* is not possible while installed components import it
   internally — the *usage* is swapped to Hugeicons through icon slots.
6. Hero must be composed (premium block) — `stats-band` +
   primitives.
