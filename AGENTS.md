<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.
This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.
<!-- END:nextjs-agent-rules -->

# AGENTS.md

This file gives a coding agent the working knowledge needed to change this repository safely. `CLAUDE.md` is its mirror — **they carry the same context and must be updated together**. If the two ever disagree, prefer the code and the authoritative docs listed below, then fix both files.

## What this project is

**SSC Insight** is a private SSC exam mock tracker and study workspace. It records full, sectional, and subject mocks across built-in and custom SSC exam patterns, derives performance views, manages a 50-day study plan and personal tasks, provides an optional read-only AI coach, and supports portable JSON backups that can be imported into a different signed-in account.

### Route topology

- **Public routes:** `/` (editorial landing; signed-in visitors redirect to `/dashboard`), `/sign-in`, `/sign-up`, `/forgot-password` (`next.config` redirects `/login` and `/signin` to `/sign-in` with query passthrough).
- **Authenticated `(workspace)` route group:** `/dashboard`, `/add`, `/history`, `/compare`, `/performance`, `/calendar`, `/plan` (redirects to `/plan/<today IST>`), `/plan/[date]`, `/plan/week/[date]`, `/my-tasks`, `/ask`, `/trash`, `/settings`.
- The `(workspace)/layout.tsx` authenticates, mounts persistent providers and chrome, and renders each route's own Server Component page.

### Authoritative docs — read the relevant one before changing its area

- `PRODUCT.md` — product behavior, scope boundaries, private-account rules.
- `DESIGN.md` — paper-and-ink visual system, chart tokens, interaction rules.
- `README.md` — Neon/Vercel setup, environment variables, migrations, verification scripts.
- `docs/private-accounts.md`, `docs/neon-migration.md` — ownership and migration history.
- `docs/caching.md` — the client cache-policy matrix.
- `docs/ui-overhaul/*` — the 15-phase design overhaul history.

---

## graphify (Knowledge Graph)

This project has a knowledge graph at `graphify-out/` — roughly 1,650 nodes, ~4,110 edges, and 97 labelled communities covering TypeScript symbols, the docs corpus (`PRODUCT.md`, `DESIGN.md`, `README.md`, `docs/**`), and reference screenshots.

When the user types `/graphify`, use the installed graphify skill before doing anything else.

```bash
graphify query "<question>"              # scoped subgraph for "how does X work" / "what calls Y"
graphify query "<question>" --dfs        # trace one specific path through the graph
graphify path "MockForm()" "domain.ts"   # shortest path between two concepts
graphify explain "analytical scopes"     # one concept and its neighbours
graphify update .                        # re-extract code after edits (AST only, no API cost)
```

### Graph rules

- **Query first:** Before your first `grep`, folder listing, or speculative source read for a codebase question, run `graphify query "<question>"` and read only the lines it points at. Include this rule in every subagent prompt that explores code.
- `path` answers "how are these two connected"; `explain` answers "what is this and what touches it".
- Read `graphify-out/GRAPH_REPORT.md` only for broad architecture review or when `query`/`path`/`explain` are not enough. Open `graphify-out/graph.html` in a browser for the interactive view (no server needed).
- **The graph is a map, not the source of truth.** It tells you which file and line to read; it does not prove an invariant. Confirm every rule against this file and the actual source before changing code. `INFERRED` edges are heuristic, and ~78 nodes are weakly connected — treat those as real documentation gaps, never as license to invent a relationship.
- Graphify indexes code symbols and extracted doc/screenshot concepts. It does not model runtime behavior, Next.js version specifics, or test results — those live in `node_modules/next/dist/docs/`, this file, and `tests/`.
- **Post-edit update:** After modifying code, run `graphify update .` (re-extracts **code files only**). Doc, markdown, and screenshot changes need the heavier `/graphify --update` skill flow, which dispatches semantic extraction.
- Dirty `graphify-out/` files are expected after hooks or incremental updates and are never a reason to skip the graph. Skip it only when the task is about the graph itself being stale/wrong, or the user says not to use it.
- `graph.json` and `graph.html` are regenerated whole on every build, so large diffs in a pull request are expected — do not flag them as churn or suggest dropping the graph. Never hand-edit anything in `graphify-out/`.

---

## Commands & QA

Use **Node 22.20+** (CI uses Node 22). The project intentionally uses **webpack**, not Turbopack.

```bash
npm ci                 # install; postinstall runs prisma generate
npm run dev            # next dev --webpack --hostname 0.0.0.0
npm run build          # prisma generate && next build --webpack
npm run start          # production server
npm run typecheck      # tsc --noEmit
npm run lint           # eslint .
npm test               # tsx --test tests/*.test.ts
npm run db:generate    # prisma generate
npm run db:migrate     # prisma migrate deploy
npm run verify:neon    # authenticated QA; needs a running app + TEST_SESSION_COOKIE
```

Run a single test file or pattern:

```bash
npx tsx --test tests/backup.test.ts
npx tsx --test --test-name-pattern "legacy v1" tests/backup.test.ts
```

CI (`.github/workflows/ci.yml`) runs: `npm ci`, `npx prisma generate`, `npx next typegen`, `typecheck`, `lint`, `test`, `build`. Always run `typecheck`, `lint`, and `test` before calling a change done.

Authenticated QA scripts (require disposable session cookies and a disposable Neon QA branch; **never use production accounts**):

```bash
TEST_SESSION_COOKIE=... node scripts/integration-check.mjs
TEST_SESSION_COOKIE=... TEST_OTHER_SESSION_COOKIE=... node scripts/verify-ownership.mjs
ALLOW_DESTRUCTIVE_REPLACE=1 TEST_SESSION_COOKIE=... TEST_OTHER_SESSION_COOKIE=... \
  node scripts/verify-backup-transfer.mjs
```

---

## Next.js & Folder-Routing Architecture

`AGENTS.md` is generated/updated by `next dev`; do not remove the `nextjs-agent-rules` block. Read the bundled docs under `node_modules/next/dist/docs/` before writing Next.js code — this Next 16 version differs from older conventions.

### Core Next.js rules

- **App Router; Server Components by default.** Client state lives behind `"use client"` boundaries.
- **No shared caching for user data:** Cache Components are not enabled. Personalized APIs use `Cache-Control: private, no-store`; never add shared caching or `revalidate` behavior to account data.
- **Independent API auth:** Route handlers (`/api/*`) authenticate independently via `requireUser()`. Page middleware (`src/proxy.ts`) covers only pages.
- **Client HTTP helper:** `api()` in `src/lib/api-client.ts` sets `cache: "no-store"`, unwraps `{ data }`, throws `ApiError` (`status`, `code`, `retryAfterSeconds`) with guarded JSON parsing, and dispatches session events on `401`/`AUTH_UNAVAILABLE`. Only two raw `fetch` calls are permitted in client code: the AI chat NDJSON stream and the backup blob download.
- **404 handling:** `src/app/not-found.tsx` renders the styled 404 for unknown pages; unknown `/api/*` paths return the JSON error envelope via the catch-all route handler.

### Folder-routing & Server Component prefetch (2026-11-20 architecture)

Every workspace route is a real Server Component page that authenticates, prefetches its own data, and renders components from a private folder beside it. The old single client orchestrator (`workspace-shell.tsx`, deleted) rendered every view from `usePathname()`; **do not reintroduce it**.

- **Layout & Providers:** `(workspace)/layout.tsx` is the auth gate and provider host:
  `requireUser()` → `PrivateWorkspace` → `QueryProvider` → `ExamScopeProvider` → `ToastProvider` → `WorkspaceChrome`.
  Providers must stay in the layout — mounting the query client in a page would drop the cache on every navigation.
- **Persistent Chrome:** `src/components/workspace-chrome.tsx` owns only what must survive a route change: sidebar/header (`app-shell.tsx`), `CommandPalette`, `useKeyboardShortcuts`, and the single AI transcript provider (`AiWorkspaceProvider` in the layout, consumed here so a conversation opened on `/ask` keeps its in-flight stream). **The right-side AI Sheet is deleted** (`ai-chat-sheet.tsx` removed, along with the "Ask AI" header button and the `aiChatOpen`/`aiChatTab` UI-store fields): `/ask` is the one AI surface, and every entry point (command palette "Ask AI", the dashboard coach card's "Ask a question", the sidebar's AI workspace nav link) routes there.
- **Colocation:** A route's private components live in `<route>/_<segment>/` (e.g., `dashboard/_dashboard/`, `plan/[date]/_plan/`). The moment a second route imports a component, move it to `src/components/shared/`.
  - `tests/colocation.test.ts` enforces this via import-graph scan.
  - `tests/routes.test.ts` enforces that every route has `page.tsx` + `loading.tsx` + `error.tsx` (dynamic routes also require `not-found.tsx`), that no `page.tsx` is a client component, and that every `page.tsx` calls `requireUser()`.
- **Server Prefetch:** `src/lib/rsc/prefetch.ts` (`prefetchInto()`) seeds the TanStack Query cache before render. It never throws, never caches a rejection, and never writes `undefined` — a data outage must degrade to the client's normal error banner, not a 500. Wrap any pre-page scope read in `safely()`. Pages must call the exact same key factories that client hooks import; hand-written key literals will silently fail to hydrate.
- **Shared Read Services:** Reads live in `src/lib/services/*` (`trash.ts`, `analytics.ts`, `attempts.ts`), called by both the Server Component page and its `/api/*` route handler so the two paths cannot drift on scope, ownership, or the trash filter.
- **Loading & Error Boundaries:** `loading.tsx` mirrors the route's real geometry (never a spinner). `error.tsx` is a thin client wrapper over `src/components/shared/route-error.tsx` and receives **`{ error, retry }`** in this Next.js version — call `retry()` (which re-fetches RSC), **not** `reset()`.

---

## Request, Auth, Ownership & Rate Limiting

```text
Browser client components
  -> /api/* route handler (src/app/api/**/route.ts)
  -> requireUser() (src/lib/auth/require-user.ts)
  -> service / repository (src/lib/services/*, src/lib/repository.ts)
  -> Prisma + @prisma/adapter-neon
```

### Ownership & API Envelope

- **Verified ownership only:** Ownership is always the verified Neon Auth user ID from `requireUser()`. Never accept `userId` from a request body, query string, or backup payload.
- **Central route wrapper:** `src/lib/api.ts` (`defineRoute`) centralizes `{ data }` / `{ error: { code, message } }`, `Cache-Control: private, no-store`, same-origin checks, JSON/body size limits, and Prisma error mapping. (Exception: `GET /api/backup` returns a raw downloadable file).
- **Same-origin protection:** Pure `src/lib/origin-core.ts` (`isSameOrigin`) is imported by the edge proxy and by `defineRoute`, guarding **every** HTTP method. Any request carrying a cross-origin `Origin` header is refused with `403` before the handler runs; missing `Origin` (non-browser clients) passes. Every API response carries `Vary: Origin`, and no CORS Allow headers exist by design.
- **404 parity:** Foreign and nonexistent record IDs intentionally return the exact same `404`.
- **Client session guard:** `src/components/private-workspace.tsx` re-verifies the session and unmounts private UI on mismatch; session failures hide data immediately. Keep the authoritative server check (`requireUser()`) separate from client `useSession()` (which is only a UI fallback).

### Authentication Surfaces & Wire Layer

- **Dedicated Auth Pages:** `/sign-in` (Google + email password + emailed-code login + TOTP second step + forgot-password hand-off), `/sign-up`, and `/forgot-password` use a login-04/signup-04 card layout (`src/components/auth/auth-shell.tsx`: a rounded card on the canvas whose right half is a tone-inverted `--plate-*` art composition — the full-mock ledger reading for sign-in, the 50-day plan grid for sign-up, a reassurance reading for forgot-password, all derived through the landing fixtures' real analytics; form on paper; form-first on phones; the plates never remap semantic tokens). Shared primitives: `ui/field.tsx` (shadcn Field grammar, house-tokened), `auth/password-input.tsx` (see/hide toggle), `auth/otp-input.tsx` (boxed 6-digit code — one real transparent input under six cells; used by emailed-code sign-in, TOTP, and reset). Step swaps use the house 4px/enter rise; code cells pop via the `otp-pop` keyframe.
  - `/` is purely an editorial landing page: every CTA (masthead, hero, final CTA, floating ask pill) is a **link** to the auth pages. The masthead pairs ghost "Log in" + default "Sign up"; the hero and final CTA lead with "Start For Free" → `/sign-up` and a ghost "I already have an account" → `/sign-in`. Nothing signs in directly from `/` anymore, and the old landing auth dialog (`auth-panel.tsx`, `landing/email-auth.tsx`) is deleted.
  - Each auth page is a dynamic Server Component that calls `requireUser()` and redirects signed-in visitors to `/dashboard`.
  - Google OAuth start lives in one place: `startGoogleSignIn()` in `src/lib/auth/sign-in.ts`, called from `/sign-in`.
- **Redirects & Error Announcements:**
  - The proxy's `LOGIN_URL` is `/sign-in`. `classifyPath` and `bypassesMaintenance` treat `/`, `/sign-in`, `/sign-up`, and `/forgot-password` as public and reachable during maintenance.
  - Session-failure redirects (proxy, workspace layout, `private-workspace.tsx`) land on `/sign-in?error=<code>` (`unavailable`, `session`, `oauth`, etc.). `src/components/auth/auth-error-announcer.tsx` turns the error code into a single toast and strips the query parameter via `history.replaceState` (note: `/` also mounts an announcer for legacy `OAUTH_ERROR_PATH` callbacks where better-auth appends `error=<provider-code>`, collapsing repeated keys and stripping `?error`).
  - Successful sign-in lands on `/dashboard?welcome=1`, which `workspace-chrome.tsx` toasts once and strips.
- **Email Auth & 2FA Wire Contract (`src/lib/auth/email-client.ts`):**
  - When `EMAIL_AUTH_ENABLED === "true"`, the auth pages and Settings → Sign-in & security (`settings/_settings/security-panel.tsx` + `use-auth-security.ts`) speak the better-auth (v1.7.6) HTTP contract through `/api/auth/*` via `src/lib/auth/email-client.ts` (password sign-up/sign-in, emailed OTP via the SDK's bundled `emailOtp` client, TOTP two-factor, and session management).
  - Because the Neon SDK bundles `emailOTPClient` but **not** `twoFactorClient`, 2FA and session calls are raw same-origin fetches. `signInEmail` returns a `{ status: "signed-in" | "two-factor-required" }` union rather than throwing for control flow.
  - Post-login navigation uses a full `window.location.assign("/dashboard?welcome=1")` so the session cookie is guaranteed present for the next server render.
  - Password resets use `/email-otp/request-password-reset` and `/email-otp/reset-password`. This serves as both the forgotten-password flow and the first-password setup path for Google-only accounts (reset-password creates a credential account when none exists and marks the email verified). Because session revocation on reset is provider-managed, Settings re-checks the session after reset and redirects if invalidated.
  - `mapAuthWireError` maps `404`/`NOT_FOUND` (when an auth plugin isn't enabled in the hosted Neon Auth console) to an honest "not enabled" message.
- **Neon Auth Invariants:** The app stores no email/user row and has no foreign-key relation to Neon Auth tables. A different account is a completely separate workspace. Never write to `neon_auth`, never store credentials app-side, and never add a server-side owner-reassignment endpoint. `GOOGLE_AUTH_ENABLED` and `EMAIL_AUTH_ENABLED` are UI-only gates.

### Two-Layer Rate Limiting

Decided by pure `src/lib/rate-limit-core.ts`:

- **L1 (In-memory per instance, free):** Token bucket.
- **L2 (Upstash Redis sliding window, 1 command, cross-instance authority):**
  - **Reads:** L1 only; never consult L2.
  - **Writes:** Cost `5` against the shared `300/min` L2 window (L1 burst is tighter; client mutations assume ~20 req/30s).
  - **AI (`chat`, `coach`, `extract`):** **Split by key ownership:**
    - **Deployment (env) key:** `10/min` budget in **both** layers (L1 bucket: 10 burst / 10/min sustained; L2 window: `ssc:rl:ai` at cost `1`).
    - **Personal key:** **Unlimited** — `consumeRateLimit(..., hasPersonalKey)` short-circuits the AI class with an infinite allowance and no L2 command, so a user spending their own provider quota is never throttled by us.
    - AI still never contends with writes; a drained L1 bucket consults L2 rather than refusing.
- **Escalation & Fallback invariants:**
  - A drained L1 bucket consults L2 rather than immediately refusing, because L1 is per-instance.
  - Consecutive denials escalate `Retry-After` exponentially per instance (capped at `120s`, reset on any allow).
  - **Degrading never means allowing:** When L2 is skipped (no credentials, daily budget reached, or open circuit breaker), the L1 verdict still stands.
  - `src/lib/rate-limit-budget.ts` caps consulted Redis commands per instance per IST day (soft `8,000` / hard `9,500` of a `10,000` allowance).
  - `src/lib/rate-limit-breaker.ts` opens after 3 consecutive Upstash failures for `60s`, running L1-only during outages instead of failing user requests.
  - Every `defineRoute` handler is rate-limited by `kind`; the three AI streaming routes bypass `defineRoute` and consume the `ai` class explicitly; `/api/health` and `/api/cron/*` are exempt.
  - Never add a second limiter, and never let a limiter throw on a Redis failure.

---

## Persistence, Exam Catalog & Domain Model

### Prisma Schema (`prisma/schema.prisma`, PostgreSQL schema `ssc_insight`)

`src/generated/prisma` is generated output — never edit it by hand. New users start empty (no DB seed).

- `MockAttempt` — one saved attempt: type, date (`completedAt`), optional overrides, rank/participants/percentile, notes, source, owner `userId`, soft-delete `deletedAt`.
- `SubjectResult` — child rows keyed by `(attemptId, subjectId)`; ownership cascades from `MockAttempt`.
- `TrackerSettings` — one row per user: `activeExamId`, `activeTierId`, `enabledTiers`, `targets` (versioned target envelope), `preferences` (in-app reminders).
- `CustomExam` — user-defined exam patterns (`id` is a Postgres `UUID`; see Trash section for `UNION ALL` cast rules).
- `PlanTaskProgress`, `PlanDayProgress`, `PersonalTask`, `TodoGroup` — study planner and personal task tables.
- `AiCredential`, `AiUsage` — encrypted per-user AI config and IST daily usage ledger.

### Exam Catalog (`src/lib/exam-pattern.ts` + `src/lib/exams.ts`)

- Seven built-in exams — **CGL, CHSL, MTS, CPO, GD Constable, Stenographer, Selection Post** — plus user `CustomExam` rows.
- `exam-pattern.ts` is client-safe (types, `patternMaxScore`, `structureSignature`); `exams.ts` holds the catalog table and must stay server-side.
- Every number is transcribed from the official SSC notice named in that exam's `source` (`cycle`, `notice`, `url`, `retrievedAt`). Pattern updates between cycles bump `CATALOG_VERSION`. Saved attempts snapshot their marking and per-subject counts so catalog updates never rewrite history.
- Non-objective stages (DEST, typing, dictation, PST/PET, DME, DV) are `ExamStage` metadata — qualifying, unscored, and never an attempt tier.
- `slotFidelity: "approximate"` marks a tier whose official paper does not fit the five canonical subject slots (e.g., CGL Paper II Statistics, Paper III Finance & Economics).

### Three Independent Target Systems (`src/lib/target-settings.ts`)

Never conflate these three systems:

1. `percentiles` — one goal percentile per exam. Never computed, never converted from marks, never a selection probability.
2. `tierDefaults` — marks defaults keyed by `structureSignature()` (which hashes the merit subject/question multiset, qualifying flags, and marking scheme). A default can only resolve on a tier with the exact same paper and maximum (e.g., intentional collision: CGL Tier 1 = CHSL Tier 1 = Selection Post CBE, all 200 marks at `+2/−0.50`).
3. `tierTargets` — per-tier overrides keyed `"examId:tierId"`. A **missing key means inherit**, so inherit / override / reset live in one map. Precedence: `override` (including explicit `null`) → `structure default` → `none`.

- _Legacy migration:_ `20261102000000_targets_and_preferences` migrated `TrackerSettings.examTargets` into `targets` pinned to each exam's frozen primary tier; values above a corrected ceiling are kept and flagged `outOfRange` rather than dropped or clamped. **Never validate stored targets on read; validate only on write.**

### Domain & Scoring Rules (`src/lib/domain.ts`)

- **Subjects:** `quant`, `reasoning`, `english`, `ga`, `computer`. Counts and maxima are per **tier** from the catalog, never global constants (CGL Tier 2 happens to be 30/30/45/25 + qualifying Computer 20 = 390 merit marks).
- **Subject mocks:** Exactly one subject, custom question counts.
- **Sectionals:** Tiers with sections (CGL & CHSL Tier 2) pair Quant+Reasoning (`section1`) and English+GA (`section2`). `SectionId` runs `section1`–`section4`; `section3` is the qualifying Computer Knowledge test on both Tier 2 papers and is **excluded from merit sectional analytics**.
- **Derived stats:** Scoring uses `+marking.correct` / `−marking.incorrect` from the attempt's snapshot. `subjectStats()` and `totals()` derive scores, accuracy, percentages, skipped counts, and time. **Never persist derived values.**
- **Validation & Entry:** Legacy `scoreOverride` / `overallTimeSeconds` remain supported; new form entries go through `src/lib/mock-entry.ts` and validate via `attemptSchemaFor(pattern)`.
- **Date semantics (IST / `Asia/Kolkata`):**
  - _Scheduled date_ = plan day / static task date.
  - _Attempt date_ = `MockAttempt.completedAt` (user-entered date at IST midnight; used by all filters, ordering, analytics, and trend charts — regression-tested in `tests/subject-performance.test.ts`).
  - _Recorded date_ = `createdAt` (shown only as "Logged" in the detail dialog).
  - Always use the memoized formatters in `src/lib/format.ts` (`shortDate`, `longDate`, `istDateKey`, `istTimeLabel`, `isIsoDate`, `mockTypeLabel`) and `src/lib/plan/view-model.ts` (`isoWeekdayName`, `isoWeekdayShort`). Never instantiate `new Intl.DateTimeFormat` inside components. Invalid/legacy dates render `—`.

---

## Dashboard & Performance Analytics Model

`src/lib/analytics.ts` is server-side and returns the complete dashboard payload. The four dashboard tabs are **analytical scopes**, not record filters:

| Scope       | Projection                                                                                      |
| :---------- | :---------------------------------------------------------------------------------------------- |
| `full`      | One point per saved full mock                                                                   |
| `subject`   | One point per `(attemptId, subjectId)` from full, sectional, and standalone subject mocks       |
| `sectional` | Explicit sectional attempts (one section each) plus Section I & II derived from every full mock |
| `all`       | One point per saved parent attempt, compared on a single percentage axis                        |

### Critical Analytics Invariants

- **No double-counting in `all`:** Never union projections for `all`; one full mock must not count again as four subjects and two sections.
- **Sectional derivation:** Explicit sectionals produce 1 section point; full mocks produce 2 derived merit section points (Section I & II). Never derive a second copy from an explicit sectional. **Qualifying sections (Section III) never produce a point.** Derived sections sum child `SubjectResult` rows and never inherit the parent full mock's `scoreOverride`, `rank`, `percentile`, or `overallTimeSeconds`.
- **Series & Charts:** Charts use a single percentage axis (raw marks stay in tooltips and accessible `View data` tables — never introduce dual-axis charts). Missing values stay `null`, never `0`.
- **Global Radar:** `whereYouStand` (radar) is global across mock types and does not change when switching dashboard scope tabs (platform/date/search filters still apply).
- **Outcome Cards ("Make every attempt count"):** Render `analytics.radial` across every scope. Ring centers always display score percentage (`marks ÷ maximum`). `AnswerStack` retains genuine saved-percentile provenance, and parent full/sectional percentiles are never copied to subject slices or derived sections. Aggregate cards have no attempt date; dated saved attempts use `AttemptRecordCard`.
- **Target Reference Comparability:** `TargetReference` is resolved on the server for the exact tier scoped (`{ marks, maxScore, percentage, tierLabel, comparable }`). A target on a 100-mark paper is never drawn against a 390-mark axis. Combined all-tiers views span different maxima, so `comparable` is `false` and no misleading line is drawn.
- **Scope vs. Filters:** `/api/analytics?view=full|subject|sectional|all` ignores parent `type`/`subject` filters (platform/date/search/tier still apply). Clicking a dashboard tab changes `scope`; History and Compare use persisted-record `filters`.

### `/performance` (Analytical Workspace)

- Server Component `performance/page.tsx` prefetches analytics + scoped attempts via `prefetchInto`.
- Client view (`_performance/`) renders the evidence stack: `ScoreBand` → `FindingsPanel` (threshold-gated observations from `src/lib/performance-metrics.ts` — the single derivation shared by both the dashboard preview and `/performance`) → hand-rolled SVG panels (`trend-panel.tsx`, `radar-panel.tsx`, `attempt-breakdown-panel.tsx`, `distribution-panel.tsx`, `subject-deep-dive.tsx`) and `src/components/shared/charts/breakdown-donut.tsx`.
- Note: `performance-overview.tsx` (Recharts) is dashboard-only; `/performance` uses hand-rolled SVG with `useReducedMotion`-gated entrance draw-ins.

---

## Study Planner, Calendar & Personal Tasks

### 50-Day Study Plan

- **Static source:** `src/data/study-plan.json` (zod-validated in `src/lib/plan/schema.ts`; note the JSON header declares 273 tests but contains 262 actual rows — always derive counts from actual rows).
- **Progress persistence:** Stored in `PlanTaskProgress` and `PlanDayProgress` (migration `20261027000000_study_planner`), keyed by deterministic identities (`taskKey = d{day}:{taskIndex}`, plan day number). Completing work never rewrites the static schedule. Tracker `MockAttempt` rows and plan task scores are separate stores; logging a mock never auto-completes a plan task, and revision completion is always manual.
- **Layers:** `src/lib/plan/plan.ts` (server-only reader), `src/lib/plan/view-model.ts` (client-safe derivations: `planProgressStats`, `nextRecommendedAction`, `upcomingMocks`, `nextMockDay`, `monthGridDays`, `revisionQueue` — tested in `tests/study-plan.test.ts`), and `src/lib/plan/progress.ts` (merges plan × progress and owns mutations via `GET /api/plan` and `POST /api/plan/progress`).
- **Planner URLs:** `/plan` redirects to `/plan/<today IST>`, `/plan/[date]` is the day workspace (`plan-day-view.tsx`), and `/plan/week/[date]` is the 7-day schedule (`plan-week-view.tsx`). **Do not call `decodeURIComponent` on the pathname again** — Next.js already decoded it, and a second decode throws on a stray `%`.

### `/calendar` (Unified 3-Layer Ledger)

- Displays **plan assignments**, **personal dated tasks**, and **logged attempts**, toggled inline and mirrored in the URL.
- `src/lib/plan/calendar-entries.ts` (`buildCalendarIndex`) is the single derived index flattening plan tasks, day-level revision (`day.revisionTasks`, never the today-relative `revisionQueue`), personal tasks by `dueDate` (undated excluded), and attempts by IST `completedAt` into date-keyed, pre-sorted entries.
- Any date is addressable (no plan clamp). View mode is derived (`explicit ?? (isMobile ? "agenda" : "month")`) and only an explicit user pick is serialized to the URL.
- `day-sections.tsx` and `day-ledger.tsx` render the day view, agenda groups, and rail. Phone day detail and the personal-task editor use Vaul drawers (`ui/drawer.tsx`), never nested, always closing one before opening another.

### Personal Tasks & `/my-tasks`

- Routes: `GET|POST /api/tasks`, `PUT|DELETE /api/tasks/[id]`, and `GET /api/todos/calendar` (aggregates per-date pending/completed counts over an inclusive max of 42 days, owner-scoped, excluding trashed tasks; list pagination never limits calendar counts).
- `/my-tasks` renders `tasks/my-tasks-view.tsx` (with `tasks/plan-rail.tsx` reading shared `usePlanData`). The dashboard column renders `PersonalTodos`.
- **Status updates:** `updatePersonalTask` (`/api/tasks`) must send the **`status` enum**, never a derived boolean (mapping status to `completed` collapses `"in_progress"` and triggers the reopen cascade that clears every subtask tick).
- **Overdue & Links:** Display status derives `overdue` via `effectiveStatus()` (completed is never overdue); dot colors live in `plan-shared.tsx` (`STATUS_META`). External links validate through `safeHttpUrlCore` (`view-model.ts`) / `safeHttpUrl` (`progress.ts`) — strict `http(s)` only, rendered with `target="_blank" rel="noopener noreferrer nofollow"`.
- **Trash boundary:** `/my-tasks` and `PersonalTodos` have **no** Trash view (`/api/tasks` rejects `view=trash`). Deleted tasks are recovered exclusively from `/trash`.

---

## AI Subsystem & Ask AI Surfaces

AI is optional, **strictly read-only**, and server-only. It must fail closed without breaking the tracker.

### Configuration, Per-User Credentials & SSRF Protection

- **Env Config:** `src/lib/ai/config-core.ts` (pure) and `src/lib/ai/config.ts` (`server-only`) parse `AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL`, `AI_JSON_MODE`, `AI_DAILY_REQUEST_LIMIT`, `AI_DAILY_TOKEN_LIMIT`, `AI_TIMEOUT_MS`, and `AI_FIRST_TOKEN_TIMEOUT_MS`. **`AI_MAX_OUTPUT_TOKENS` is no longer parsed** — the provider applies its own model default for every generation. When unconfigured, `/api/ai/status` returns `enabled: false` and data routes return `503 AI_NOT_CONFIGURED`.
- **Resolution & Precedence (`src/lib/ai/resolve.ts` + `resolve-core.ts`):** User's stored `AiCredential` wins over server env. An undecryptable or invalid personal credential is a hard failure (`AI_PERSONAL_CONFIG_INVALID`), **never** a silent fallback to the server env key. `/api/ai/status` reports `unconfigured` | `ready` | `personal-invalid` | `env-ready`.
- **Encryption:** Personal API keys are encrypted with AES-256-GCM under `AI_CREDENTIAL_SECRET` (`crypto-core.ts` / `crypto.ts`) into `AiCredential.apiKeyEnc`. Plaintext never leaves the server; `AiCredentialSummary` exposes only a 4-char `keyHint`. `AiCredential` is excluded from backups. No-auth providers (`authMode: "none"`, e.g., Ollama) store an encrypted sentinel.
- **Reply Caps & Quotas:** Personal keys use `userReplyCaps` (defaulting to 120s timeout; **no reply ceiling** — the provider applies its own model default) and **unlimited daily quotas** (`USER_KEY_SAFETY_LIMITS` is `{ requests: Infinity, tokens: Infinity }`). Deployment `AI_DAILY_*` caps apply only to the shared env key; a personal key reserves `0` output tokens against the ledger, so the daily token limit is never a constraint. An env key reserves a conservative `ENV_OUTPUT_RESERVE_TOKENS` completion estimate per call (`outputReserveForSource`) so `AI_DAILY_TOKEN_LIMIT` stays enforceable.
- **SSRF Protection (`src/lib/ai/ssrf-core.ts` + `ssrf.ts`):** Blocks loopback, RFC1918, link-local/cloud metadata (`169.254.169.254`), CGNAT, multicast, reserved ranges, and IPv6 equivalents. `ssrf.ts` runs a live DNS resolution check **immediately before every provider fetch** (every resolved IP must be public) with `redirect: "error"`. _Note: DNS rebinding between check and fetch is not fully closed without IP pinning — do not claim it is complete._

### Wire Protocols, Streaming & Quota Ledger

- **Four Explicit Protocols (`src/lib/ai/provider.ts`, `protocols.ts`, `providers.ts`):** Native `fetch` (no SDKs) supporting `openai-responses`, `openai-chat` (legacy default when protocol fields are null), `openai-completions`, and `anthropic-messages` (`x-api-key` + `anthropic-version`). Never probe a second protocol with user data.
- **Timeouts & Streaming:** Non-streaming calls use `AI_TIMEOUT_MS` as total wall clock. Streams open with a first-byte grace timer (`AI_FIRST_TOKEN_TIMEOUT_MS`, clamped 5s–300s, default 120s for thinking models) and re-arm the inter-chunk stall timer (`AI_TIMEOUT_MS`) on every chunk. `/api/ai/chat` streams NDJSON (`start`, `ping`, `reasoning`, `delta`, `done`, `error`), writing a `ping` every 15s during provider silence (`maxDuration = 300`).
- **Reasoning & Structured JSON:** `config.thinking` (`default|off|low|medium|high`) maps to per-protocol reasoning params (omitted on structured-JSON calls; Anthropic budget clamps below its 1,024-token floor). Reasoning deltas forward via `onReasoning` and are never stored server-side. Coach JSON output is clamped via `coerceCoachInsight` (`schemas.ts`) before allowing at most **one** repair call.
- **Quota Reservation (`src/lib/ai/quota.ts`):** `reserveAiUsage` runs a serializable transaction (`maxWait: 10s`, `timeout: 15s` to avoid Prisma `P2028` on cold Neon connections) before context work; `settleAiUsage` is idempotent. Definitive pre-generation errors (`billability` flag on `AiError` in `errors.ts`) settle at zero (`chargedForAiFailure`); timeouts/aborts charge conservatively. Upstream `401`/`403` map to `502`-style app config errors, never `401` to the browser.

### Context Privacy, Prompt Boundaries & Read-Only Guarantee

- **Zero AI DB Writes:** AI routes never write to the repository. Coach/chat only read. Task suggestions (`src/lib/ai/task-suggestion.ts`, `/api/ai/todos`) and scorecard extractions (`src/lib/ai/extraction.ts`, `/api/ai/extract`) return drafts that persist **only** when the user explicitly clicks Apply/Add or saves `MockForm` (`source: "paste"`).
- **Context Whitelist (`src/lib/ai/context.ts`):** `listAttemptsForAi` in `src/lib/repository.ts` uses Prisma `omit: { notes: true }` (`AnalyticsAttempt = Omit<Attempt, "notes">`). Context includes only aggregates, subject/section stats, target, and the latest 20 full mocks — never notes, names, IDs, email, `userId`, or `source`. Orientation screen context (`<screen_context>`) carries only `{ view, date? }`.
- **Sanitization (`src/lib/ai/sanitize-core.ts`):** Strips control/bidi/zero-width/tag characters from labels, chat turns, and reports. JSON data blocks (`tracker_context`, `screen_context`, todo requests) escape `<` and `>` as JSON unicode escapes so user strings cannot forge XML tags (test via `JSON.parse` round-trip). _Exception:_ Extraction reports stay byte-for-byte inside a per-request random `<report_…>` tag so the user sees exactly what was read.

### Ask AI Surface & Chat UI Grammar (2026-11-21 / 2026-11-22)

- **Workspace State & Local History:** `use-ai-workspace.ts` (mounted once in `(workspace)/layout.tsx` via `AiWorkspaceProvider`) holds status, coach insight, messages, phase, live reasoning accumulation, and the abort controller. Completed turns persist to **device-local** storage (`src/lib/ai/conversations.ts`, key `ssc.ai.conversations.v1`, capped at 50 conversations / 200 trailing messages; excluded from server and backups). Attached vision screenshots (up to 2 data-URL images, 4 MB cap, downscaled via `shared/ai/image.ts`) persist on the user turn locally but are not re-sent in follow-up history. **The right-side AI Sheet is deleted** — there is no slide-over, no header "Ask AI" button, and no `aiChatOpen`/`aiChatTab` UI-store fields.
- **Single Surface: `/ask` Route (`src/app/(workspace)/ask/`):**
  - Three-column grid (`lg:[17.5rem_1fr] xl:[17.5rem_1fr_15.5rem]`) with `conversation-list.tsx` + `usage-footer.tsx` on the left, the `46rem` chat column in the center, the read-ledger timeline of real `/api/ai/usage` rows on the right, and a Vaul bottom drawer below `lg`.
  - Its Chat/Todos/Mock mode chips keep all three tools in one place (`visited` panels stay mounted so a Todos draft or a pasted scorecard survives switching chips).
- **Transcript Grammar (`chat-transcript.tsx`):**
  - **No avatars:** `role-avatar.tsx` and `thinking-indicator.tsx` are **deleted**. User prompts are the only bubbles; assistant answers render as plain serif prose (`15px/1.7`, `space-y-8`, column `46rem`) topped by the AI turn header row (sparkles circle + `"Coach"` + `model` prop) and followed by always-visible icon action bars (Copy/Edit/Regenerate).
  - **Live Reasoning (`ThinkingBlock`):** Streams reasoning live inside a bordered/tinted collapsible in `chat-transcript.tsx` that auto-opens while reasoning streams (shimmering `"Thinking… · Ns"`, auto-scrolled) and collapses to `"Thought for Ns"` once prose begins (also covering the initial connecting phase).
- **Composer Card & Mode Takeovers (`chat-composer.tsx`):**
  - Renders a single elevated card (`ai-composer-card`) holding the auto-growing textarea, **mode chips (Chat / Todos / Mock)**, paperclip (vision), usage chip, clear trash, and the bottom-right ink-square send⇄stop morph button, with the disclaimer below the card.
  - In `/ask`, switching mode chips takes over the center column: **Todos** embeds `shared/tasks/ai-composer.tsx` (slim prompt + template chips + Options disclosure → draft change ledger takeover; Apply toasts, stays, and appends a system line) and **Mock** embeds `shared/ai/log-mock-flow.tsx` (`LogMockFlow` + `LogMockPayload` → subject roster takeover gated by `validateExtractionDraft` → hands off via `useUiStore.requestMockPrefill` to `/add` and appends a system line). Mode chips hide during takeovers, display a dot when a draft is pending, and reset to Chat on each visit.

---

## Client State, Caching & URL Synchronization

- **Server State = TanStack Query (`src/lib/query-client.ts`, `src/lib/queries/*`):**
  - Workspace-scoped in-memory cache (`components/query-provider.tsx`); never persisted to localStorage. Logout unmounts the shell and `ssc:session-ended` calls `queryClient.clear()`.
  - All query keys and `queryOptions` live in `src/lib/queries/*` (settings, attempts, analytics, plan, todos, ai, search) using hierarchical factories (`["mock-attempts", "list", params]`, `["mock-attempts", "detail", id]`). Never inline query keys or use raw URLs as keys.
  - Mutations invalidate by prefix, never the whole cache. Optimistic updates snapshot in `onMutate` and roll back via `setQueryData` (see `usePlanOptimistic`).
  - Defaults (`docs/caching.md`): `30s` `staleTime`, `5m` `gcTime`, `refetchOnWindowFocus: false`, 1 retry (skipping auth/validation/abort and honoring `Retry-After` on `429`).
- **Global UI State = Zustand (`src/stores/ui-store.ts` only):**
  - Holds only ⌘K palette visibility, planner date, quick-add nonce, the attempt-detail id, and the reviewed-mock-draft handoff. **The AI drawer open/tab fields are gone** with the Sheet; `/ask` owns its own mode/rail state locally. Never put server data in Zustand.
- **URL Mirroring (`src/components/shared/use-filters-state.ts`, `src/lib/filters-url.ts`):**
  - Mirrors filters, dashboard scope, and `/compare` selection (`?ids=`, max 4) to the address bar via `history.replaceState` (**never `router.push`**, so typing never triggers RSC round-trips).
  - Skipped on `/add`, `/calendar`, `/plan/*`, `/my-tasks`, and `/settings` so route-specific query params (`?date=`, `?section=`, etc.) are never clobbered. `safeWorkspaceReturnTo` validates `returnTo` targets.

---

## UI System, Themes, Motion & Settings

### App Shell & Performance

- `src/components/app-shell.tsx` wraps the workspace in shadcn's `SidebarProvider` (`collapsible="icon"`, `15rem` paper sidebar collapsing to a `3.5rem` rail, left Sheet below `md`). Open state is owned by the `sidebar_state` cookie read in `(workspace)/layout.tsx`.
- **Sidebar footer grammar (sidebar-07 NavUser).** Footer stack, top to bottom: Settings + Trash icon pair (expanded only), then `SidebarUserMenu` (avatar + name over email + in-place logout), then the active-exam note. Collapsed, the rail keeps only the avatar: Settings and Trash fold into the avatar dropdown (identity, Settings, Trash, Sign out). Both avatar menus share one `UserMenuItems` fragment so the actions cannot drift.
- **No `authEnabled` prop.** It meant *Google OAuth availability*, which is meaningless inside the workspace: `(workspace)/layout.tsx` already called `requireUser()`, so a session exists and sign-out always works. Gating on it hid a signed-in user behind "Sign-in unavailable" whenever `GOOGLE_AUTH_ENABLED` was off. `auth-control.tsx` exports `SidebarUserMenu` (the footer identity block) and `useAuthActions`.
- **The header carries no account identity:** trigger, current view, search, exam switcher, theme toggle, and — only when the sidebar is collapsed or the viewport is a phone — Ask AI. Settings, Trash, and sign-out live in the sidebar footer and the avatar dropdown; the phone Sheet carries the same block. Each added control costs page-title width at 375px — check horizontal overflow at 375/768/1024.
- `PerformanceOverview`, `HistoryPanel`, and `CompareView` are `memo`-wrapped with stabilized props so chat stream tokens and filter keystrokes do not re-render charts.
- Navigation `href` entries in `NAV_GROUPS` may be functions so date-bearing links ("Today's plan") resolve per render rather than freezing the IST date at module load.

### Multi-Theme System & Responsive Tokens (`src/app/globals.css`, `src/lib/chart-theme.ts`)

- **18 Theme Combinations:** `data-palette` (`orange` default, `blue`, `lime`, `violet`, `rose`, `graphite`) × `data-style` (`vega` default, `sera`, `mira`) × light/dark (`next-themes`), set before paint by `theme-style-provider.tsx` (`localStorage` keys `ssc.palette` / `ssc.style`).
- **Token Invariants:** Never hardcode palette hexes in components. `--accent` is always the palette's primary accent (terracotta in default orange) and must never be repurposed as shadcn's neutral hover. Chart subject colors are static across all palettes (terracotta Score/Quant/Section I/Incorrect, blue Reasoning/Section II, olive Average/Correct, teal Time, warm gray Computer).
- **Theme Crossfade:** `theme-toggle.tsx` applies a one-shot `theme-animating` class on `<html>` for ~480ms during toggle clicks (`disableTransitionOnChange` is intentionally omitted in root layout).
- **Responsive Container Queries & Phone Token Ordering:**
  - `.workspace-content` and `.strip-frame` are CSS query containers; `.metric-strip` and `.score-band` fold to `2×2` under `680px` of container width (solving the `768px–1023px` tablet squeeze beside the `15rem` sidebar). `.metric-strip-scroll` opts out.
  - **Load-bearing CSS order:** The **phone token block sits last** in `src/app/globals.css` (`44px` controls, `40px` compact, `16px` form fields to prevent iOS focus zoom, `.tap-target`, `.action-row`). Never append a `[data-style]` block below the phone block or it will override mobile touch targets. Verify desktop (`≥1280px`) and mobile layout with `tools/shot.mjs` and `tools/resp-probe.mjs`.

### Motion Rules (`src/lib/motion.ts`, `src/components/motion-swap.tsx`)

- `Swap` fades content in over `4px` when `swapKey` changes (no `AnimatePresence`, no exit animation, no height animation to avoid scroll jumps).
- Charts never animate on data updates; entrance draw-ins on `/performance` and the landing film are gated by `useReducedMotion`.

### Landing Page (`src/components/landing/`)

- Server-rendered editorial page with client islands, alternating paper with two tone-inverted ink plates (`--plate-*` variables only).
- Product showcase mockups (`src/components/landing/mockups/`) are hook-free inline SVG (**never import Recharts on `/`**). Every figure is derived through `totals()` / `analyze()` in `fixtures.ts` and `plan-data.ts` (enforced by `tests/landing-fixtures.test.ts` and `tests/plan-facts.test.ts`). Petals use a fixed literal table (never `Math.random()`).

### Settings (`src/app/(workspace)/settings/_settings/`)

- Eight sections (**Exams & tiers, Targets, Reminders, Appearance, AI provider, Sign-in & security, Data & backup, About & account**) gated by active selection and mirrored to `?section=`.
- **Dirty-state Guard:** Draft-holding panels use `react-hook-form` + zod (`src/components/shared/settings-schema.ts`) and register `{ isDirty, reset, save }` in state via `src/components/shared/settings-guard.tsx`. The sticky save bar and discard confirmation dialog in `settings-view.tsx` drive the active panel's save/reset and bind `beforeunload`.
- **Single Settings Cache:** `/api/exams` returns the catalog, active scope, `targets` envelope, `resolvedTargets`, `percentiles`, and `targetPeers`. There is no separate `["settings"]` query key.
- **Reminders (`reminders-panel.tsx`):** Strictly **in-app only** (no service worker, push, email, or cron).

---

## Backup & Account Transfer

`src/lib/backup.ts` is the client-safe format/planning layer; `src/lib/repository.ts` owns database export/import.

- **Format v5 (`format: "ssc-insight-backup"`, `formatVersion: 5`):** Carries `exportedAt`, `summary`, `settings`, `customExams`, `planner` (`planTasks`, `planDays`, `todoGroups`, `personalTasks`), full `attempts`, and `warnings`. Contains no email, `userId`, `AiCredential`, `AiUsage`, or Trash rows.
- **Backward Compatibility:** Imports v1 (`schemaVersion: 1`), v2, v3, v4, and v5. Newer unknown versions are refused with an "update the app" error. CSV is export-only and never importable.
- **Import Modes & Fingerprinting:**
  - `merge`: Skips exact content duplicates, reports coarse-key conflicts, preserves existing data.
  - `replace`: Hard-deletes all current live `MockAttempt` rows (gated by a mandatory client safety JSON download, account-name confirmation, and server `confirmReplace: true`), then imports deduplicated attempts.
  - **Planner restore is always non-destructive merge** (even in `replace` mode): completion flags never regress to `false`, scores/notes fill only when absent, checklist/revision IDs union, and personal tasks matched on `(title, dueDate)` are untouched.
  - Commits verify a **SHA-256 preview fingerprint** covering destination state, incoming payload, settings, planner block, mode, and `applyTarget`; stale fingerprints return `409`.
  - Transport body limit is **4 MB** (Vercel limit); schema attempt limit is `10,000`.

---

## Trash & Data Recovery

Deleting supported records is a **soft delete** (`deletedAt TIMESTAMPTZ(3)`). `src/lib/trash-core.ts` is the client-safe policy; `src/lib/trash.ts` is the server service; `/trash` is the sole recovery UI.

- **Four Recoverable Kinds:** `attempt` (`MockAttempt`), `task` (`PersonalTask`), `exam` (`CustomExam`), and `group` (`TodoGroup`).
- **Retention & Expiry:** Single constant `TRASH_RETENTION_DAYS` (`15` days) in `trash-core.ts`. Expiry is derived (`deletedAt + TRASH_RETENTION_MS`) — there is no `TrashEntry` table or stored `expiresAt`. `listTrash` excludes expired rows and `restoreTrash` rejects them with `409`.
- **Read & Write Predicates:**
  - Every live read filters `deletedAt: null`. For attempts, `attemptWhere()` in `src/lib/attempt-persistence.ts` is enforced at lint time via ESLint (`MemberExpression[property.name='mockAttempt']`; only `repository.ts`, `trash.ts`, `search.ts`, and the inline-documented exam-delete count in `api/exams/route.ts` are exempt).
  - Every restore and purge predicate requires `deletedAt: { not: null }` so a crafted ID can never mutate or purge a live row (answering `404` instead).
- **Custom Exams & Groups:**
  - Deleting a custom exam sets `deletedAt` and moves active scope to another enabled tier, leaving `enabledTiers` and `targets` intact so restore is lossless. `PUT /api/settings` tolerates `enabledTiers` keys belonging to trashed exams. `pruneTargetsForExam` (`target-settings.ts`) runs **only at permanent purge**.
  - Name uniqueness for custom exams and task groups spans both live and trashed rows (create/rename returns a specific `409` naming Trash rather than a raw `P2002`).
  - **Postgres UUID Cast Gotcha:** `CustomExam.id` is a Postgres `UUID` column while the other three kinds use `TEXT`. In `listTrash`'s raw `UNION ALL`, `CustomExam.id` **must** be cast as `"id"::text` or PostgreSQL throws `42804 UNION types text and uuid cannot be matched` (which surfaces as a `503 DATABASE_UNAVAILABLE`).
- **Cron Cleanup:** `GET /api/cron/trash-cleanup` (authenticated by bearer `CRON_SECRET`, `503` when unset, listed in `isCronPath` / `bypassesMaintenance`) drains expired rows in batches with per-kind failure isolation.

---

## Environment, Migrations & Documentation Map

### Environment Variables (`.env.example`)

- **Required:** `DATABASE_URL` (pooled), `DATABASE_URL_UNPOOLED` (migrations via `prisma.config.ts`), `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`, `GOOGLE_AUTH_ENABLED`.
- **Optional Auth / Ops / AI:** `EMAIL_AUTH_ENABLED`, `CRON_SECRET`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `AI_CREDENTIAL_SECRET`, `AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL`, `AI_JSON_MODE`, `AI_DAILY_REQUEST_LIMIT`, `AI_DAILY_TOKEN_LIMIT`, `AI_TIMEOUT_MS`, `AI_FIRST_TOKEN_TIMEOUT_MS`. **`AI_MAX_OUTPUT_TOKENS` is no longer used** — the provider applies its own model default.

### Database Migration Discipline

- Never run `prisma migrate reset`, never touch the `neon_auth` schema, and always apply migrations via `npm run db:migrate` **before** deploying code that depends on new columns:
  - `20261025000000_ai_usage` — AI usage ledger.
  - `20261027000000_study_planner` — Study planner tables.
  - `20261029000000_personal_todos` — Personal tasks & groups.
  - `20261102000000_targets_and_preferences` — Versioned `targets` envelope & `preferences`.
  - `20261103000000_trash` — Soft-delete `deletedAt` across recoverable tables (load-bearing: un-migrated DBs will fail every attempt read).
  - `20261119000000_ai_protocols` — Multi-protocol fields on `AiCredential` & `AiUsage`.
  - `20261120000000_ai_preferences` — Per-user model behavior (`thinking`, `historyTurns`, `visionEnabled`) on `AiCredential`. **`maxOutputTokens` column still exists but is no longer read or written**; dropping it is a separate corrective migration, deliberately not bundled here so this change stays additive and rollback-readable.

### Documentation Update Order

When changing behavior or architecture, update in this order:

1. Implementation and unit tests (`tests/*.test.ts`).
2. Relevant product/design/setup docs: `PRODUCT.md`, `DESIGN.md`, `README.md`, `docs/caching.md`.
3. Both **`AGENTS.md` and `CLAUDE.md` together** when any architectural rule or invariant changes.
4. Run `graphify update .` after code edits (and `/graphify --update` when architecture docs change).
