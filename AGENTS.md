<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md

This file gives a coding agent the working knowledge needed to change this repository safely. `AGENTS.md` is its mirror — **they carry the same context and must be updated together**. If the two ever disagree, prefer the code and the authoritative docs listed below, then fix both files.

## What this project is

SSC Insight is a private SSC CGL Tier 2 mock tracker. It records full, sectional, and subject mocks, derives performance views, and supports a portable JSON backup that can be imported into a different signed-in account.

`/` is a public landing (signed-in visitors redirect to `/dashboard`); the authenticated workspace is the `(workspace)` route group (`/dashboard`, `/add`, `/history`, `/compare`, `/performance`, `/settings`, `/calendar`, `/my-tasks`, `/plan/[date]`), whose layout authenticates, mounts the persistent providers and chrome, and renders each route's own Server Component page.

Authoritative docs — read the relevant one before changing its area:

- `PRODUCT.md` — product behavior, scope boundaries, private-account rules.
- `DESIGN.md` — paper-and-ink visual system, chart tokens, interaction rules.
- `README.md` — Neon/Vercel setup, environment variables, migrations, verification scripts.
- `docs/private-accounts.md`, `docs/neon-migration.md` — ownership and migration history.
- `docs/caching.md` — the cache-policy matrix.
- `docs/ui-overhaul/*` — the 15-phase design overhaul history.

## graphify

This project has a knowledge graph at `graphify-out/` — roughly 1,650 nodes, ~4,110 edges and 97 labelled communities covering TypeScript symbols, the docs corpus (`PRODUCT.md`, `DESIGN.md`, `README.md`, `docs/**`) and the reference screenshots.

When the user types `/graphify`, use the installed graphify skill before doing anything else.

```bash
graphify query "<question>"              # scoped subgraph for "how does X work" / "what calls Y"
graphify query "<question>" --dfs        # trace one specific path through the graph
graphify path "MockForm()" "domain.ts"   # shortest path between two concepts
graphify explain "analytical scopes"     # one concept and its neighbours
graphify update .                        # re-extract code after edits (AST only, no API cost)
```

Rules:

- Before your first grep, folder listing or speculative source read for a codebase question, run `graphify query "<question>"` and read only the lines it points at. Put this rule in every subagent prompt that explores code.
- `path` answers "how are these two connected"; `explain` answers "what is this and what touches it".
- Read `graphify-out/GRAPH_REPORT.md` only for broad architecture review or when query/path/explain are not enough. Open `graphify-out/graph.html` in a browser for the interactive view (no server needed).
- **The graph is a map, not the source of truth.** It tells you which file and line to read; it does not prove an invariant. Confirm every rule against this file and the actual source before changing code. `INFERRED` edges are heuristic, and ~78 nodes are weakly connected — treat those as real documentation gaps, never as license to invent a relationship.
- Graphify indexes code symbols and extracted doc/screenshot concepts. It does not model runtime behavior, Next.js version specifics, or test results — those live in the Next.js docs, this file, and the test files.
- After modifying code, run `graphify update .` (re-extracts **code files only**). Doc, markdown and screenshot changes need the heavier `/graphify --update` skill flow, which dispatches semantic extraction.
- Dirty `graphify-out/` files are expected after hooks or incremental updates and are never a reason to skip the graph. Skip it only when the task is about the graph itself being stale or wrong, or the user says not to use it.
- `graph.json` and `graph.html` are regenerated whole on every build, so large diffs in a pull request are expected — do not flag them as churn or suggest dropping the graph. Never hand-edit anything in `graphify-out/`.

## Commands

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

Run one test file:

```bash
npx tsx --test tests/backup.test.ts
npx tsx --test --test-name-pattern "legacy v1" tests/backup.test.ts
```

Use Node 22.20+ (CI uses Node 22). The project intentionally uses webpack, not Turbopack.

CI (`.github/workflows/ci.yml`) runs: `npm ci`, `npx prisma generate`, `npx next typegen`, `typecheck`, `lint`, `test`, `build`.

Additional QA scripts (require disposable session cookies and a QA branch; never use production accounts):

```bash
TEST_SESSION_COOKIE=... node scripts/integration-check.mjs
TEST_SESSION_COOKIE=... TEST_OTHER_SESSION_COOKIE=... node scripts/verify-ownership.mjs
ALLOW_DESTRUCTIVE_REPLACE=1 TEST_SESSION_COOKIE=... TEST_OTHER_SESSION_COOKIE=... \
  node scripts/verify-backup-transfer.mjs
```

## Next.js constraints

`AGENTS.md` is generated and re-added by `next dev`; do not remove it. Read the bundled docs under `node_modules/next/dist/docs/` before writing Next.js code — this Next 16 version differs from older conventions.

- App Router; server components by default. Client state lives behind `"use client"` boundaries.
- Cache Components are not enabled. Personalized APIs use `Cache-Control: private, no-store`; do not add shared caching or `revalidate` behavior to account data.
- Route handlers authenticate independently; page middleware (`src/proxy.ts`) covers only pages.
- The client JSON helper is `api()` in `src/lib/api-client.ts`; it sets `cache: "no-store"`, unwraps `{ data }`, and dispatches session events on 401/AUTH_UNAVAILABLE.

## Request and ownership architecture

```
Browser client components
  -> /api/* route handler (src/app/api/**/route.ts)
  -> requireUser() (src/lib/auth/require-user.ts)
  -> repository (src/lib/repository.ts)
  -> Prisma + @prisma/adapter-neon
```

- Ownership is always the verified Neon Auth user ID from `requireUser()`. Never accept `userId` from a body, query, or backup.
- `src/lib/api.ts` centralizes `{ data }` / `{ error: { code, message } }`, `private, no-store`, same-origin checks, JSON/body size limits, and Prisma error mapping. Same-origin enforcement is the pure `src/lib/origin-core.ts` (`isSameOrigin`), imported by the proxy (edge) and by `defineRoute`, which guards **every** method — a request carrying a cross-origin `Origin` header is refused 403 before the handler runs; missing Origin (non-browser clients) passes. Every API response carries `Vary: Origin`, and no CORS Allow headers exist by design: nothing outside the app can call the API. The backup GET is the exception to the envelope: it returns a raw downloadable file.
- Foreign and nonexistent record IDs intentionally return the same 404.
- `src/components/private-workspace.tsx` re-verifies the session and unmounts private UI on mismatch; session failures hide data.
- `/` is the only sign-in surface and also the Neon Auth `loginUrl`. It remains a dynamic Server Component wrapper: it calls `requireUser()` with cookie caching disabled, redirects verified users to `/dashboard`, and otherwise renders the landing with `GoogleSignInButton` (`authEnabled` from `GOOGLE_AUTH_ENABLED`) in the masthead, hero, and final CTA. There is no `/sign-in` route — it is a permanent `next.config` redirect to `/` (as are `/login` and `/signin`). OAuth start lives in one place, `startGoogleSignIn()` in `src/lib/auth/sign-in.ts`, shared by the landing button and `auth-control.tsx`. Keep the authoritative server check separate from the client affordance; client `useSession()` is only a UI fallback.
- **Email auth (optional, wire-level).** When `EMAIL_AUTH_ENABLED === "true"`, the landing's email dialog (`src/components/auth-panel.tsx`, opened from `landing/email-auth.tsx`) and Settings → Sign-in & security (`settings/_settings/security-panel.tsx` + `use-auth-security.ts`) speak the better-auth HTTP contract through the same `/api/auth/*` proxy — `src/lib/auth/email-client.ts` is the one wire layer (password sign-up/sign-in, emailed OTP via the SDK's bundled `emailOtp` client, TOTP two-factor, sessions). The Neon SDK bundles `emailOTPClient` but NOT `twoFactorClient`, so 2FA and sessions are raw same-origin fetches, and `signInEmail` returns a `{ status: "signed-in" | "two-factor-required" }` union rather than throwing for control flow. Success navigates with a full `window.location.assign("/dashboard")` — the session cookie must exist for the next server render. Whether any method succeeds is a property of the hosted Neon Auth config (email + password, OTP delivery, two-factor plugin — Neon console); `mapAuthWireError` turns 404/`NOT_FOUND` into the honest "not enabled" failure, never a fake error. Password resets ride the email-otp reset endpoints (`/email-otp/request-password-reset`, `/email-otp/reset-password` — verified against better-auth 1.7.6): the code path is the forgotten-password flow on both surfaces AND the first-password path for Google-only accounts, because reset-password creates a credential account when none exists and marks the email verified. Session revocation after a reset is the provider's managed config, so the Settings dialog re-checks the session and redirects to `/` when it died. Still true: no app code writes `neon_auth`, no credentials are stored app-side, and both auth gates (`GOOGLE_AUTH_ENABLED`, `EMAIL_AUTH_ENABLED`) are UI-only.
- Failure queries land on `/`, never a dedicated page: `/auth/complete` forwards OAuth errors as `/?error=oauth`, the proxy and workspace layout use `/?error=unavailable`, and `private-workspace.tsx` uses `/?error=session`. `OAUTH_ERROR_PATH` is deliberately bare `/` because better-auth appends its own `error=<provider-code>`; the landing collapses the repeated key (Next hands it back as an array) and treats any unknown code as a failed OAuth round trip, raises a toast, then strips `?error` via `history.replaceState`. `/` is also the `bypassesMaintenance` entry that keeps sign-in reachable during maintenance.
- Auth uses Neon Auth with Google. The app stores no email/user row and has no ownership relation to Neon Auth tables. A different Google account is a separate workspace. Do not write to `neon_auth` or add a server-side owner-reassignment endpoint.

- Rate limiting is **two layers**, decided by the pure `src/lib/rate-limit-core.ts`:
  an in-memory token bucket per instance (L1, free) and a Upstash sliding
  window (L2, one Redis command, cross-instance authority). Reads never consult
  L2; writes cost 5 against the shared 300/min window, and AI has its **own
  dedicated 20-per-minute budget in both layers** (L1 bucket 20 burst / 20/min
  sustained, L2 window `ssc:rl:ai` at cost 1) so the most expensive class never
  contends with writes; a drained L1 bucket asks L2 rather than refusing,
  because L1 is per-instance and its denial is not proof of abuse. Consecutive
  denials **escalate `Retry-After` exponentially per instance** (cap 120s,
  reset on any allow) — spam backoff, with L2 still the cross-instance
  authority. **Degrading never means allowing** — when L2 is skipped (no
  credentials, daily budget, open circuit) the L1 verdict still stands.
  `src/lib/rate-limit-budget.ts` caps consulted commands per instance per IST
  day (soft 8000 / hard 9500 of a 10k allowance) and
  `src/lib/rate-limit-breaker.ts` opens after 3 consecutive Upstash failures for
  60 s, so a Redis outage runs L1-only instead of failing requests. Every
  `defineRoute` handler is limited by `kind`; the three AI streaming routes
  (`chat`/`coach`/`extract`) bypass `defineRoute` and consume the `ai` class
  explicitly; `/api/health` and `/api/cron/*` are deliberately exempt. The 429
  body and the `X-RateLimit-*` / `Retry-After` header names are unchanged, so
  `ApiError.retryAfterSeconds` and the query client's retry delay keep working.
  Never add a second limiter, and never make a limiter throw on a Redis failure.

## Persistence and domain model

Prisma models (`prisma/schema.prisma`, PostgreSQL schema `ssc_insight`):

- `MockAttempt` — one saved attempt: type, date, optional overrides, rank/participants/percentile, notes, source, owner `userId`.
- `SubjectResult` — child rows keyed by `(attemptId, subjectId)`; ownership cascades from the attempt.
- `TrackerSettings` — one row per user: `activeExamId`, `activeTierId`, `enabledTiers`, `targets` (the versioned target envelope), `preferences` (in-app reminders).

`src/generated/prisma` is generated output; do not edit it.

**Exam catalog** (`src/lib/exam-pattern.ts` + `src/lib/exams.ts`). Seven built-ins — CGL, CHSL, MTS, CPO, GD Constable, Stenographer, Selection Post — plus user custom exams. `exam-pattern.ts` is client-safe (types, `patternMaxScore`, `structureSignature`); `exams.ts` holds the catalog table and should stay server-side. Every number is transcribed from the official notice named in that exam's `source` (`cycle`, `notice`, `url`, `retrievedAt`); SSC changes patterns between cycles, so a correction is a new `CATALOG_VERSION`, and attempts snapshot their marking and per-subject counts so a correction never rewrites history. Non-objective stages (DEST, typing, dictation, PST/PET, DME, DV) are `ExamStage` metadata — qualifying, unscored, and never an attempt tier. A tier's `slotFidelity: "approximate"` marks a paper whose official part does not fit the five canonical slots (CGL Paper II Statistics, Paper III Finance & Economics).

`src/lib/target-settings.ts` owns THREE independent target systems, which must never be conflated:

- `percentiles` — one goal percentile per exam. Never computed, never converted from marks, never a selection probability.
- `tierDefaults` — marks defaults keyed by `structureSignature()`. The signature covers the merit subject/question multiset, the qualifying flags and the marking, so a default can only ever resolve on a tier with the same paper and therefore the same maximum. The intended collision is CGL Tier 1 = CHSL Tier 1 = Selection Post CBE (all 200 at +2/−0.50).
- `tierTargets` — per-tier overrides, keyed `"examId:tierId"`. A **missing key means inherit**, so inherit / override / reset is one map. Precedence is override (including an explicit `null`) → structure default → none.

`TrackerSettings.examTargets` was the pre-v2 map (one marks value per exam, measured against the primary tier); migration `20261102000000_targets_and_preferences` rewrites it into `targets` with each legacy value pinned to its **frozen** primary tier, and a value above the corrected ceiling is kept and flagged `outOfRange` rather than dropped or clamped. Never validate stored targets on read; validate on write.

Domain rules live in `src/lib/domain.ts`:

- Subjects: `quant`, `reasoning`, `english`, `ga`, `computer`.
- Counts and maxima are per **tier**, from the catalog — not global constants. CGL Tier 2 happens to be 30/30/45/25 (+ qualifying Computer 20) for 390.
- Subject mocks: exactly one subject, custom counts.
- Sectionals: a tier that declares sections (CGL and CHSL Tier 2) pairs Quant+Reasoning (Section I) and English+GA (Section II). `SectionId` runs `section1`–`section4`; Section III is the qualifying Computer Knowledge test on both Tier 2 papers and is excluded from merit sectional analytics.
- Scoring is `+marking.correct` / `−marking.incorrect` from the attempt's snapshot. `subjectStats()` and `totals()` derive scores, accuracy, percentages, skipped counts, and time. Do not persist derived values.
- Legacy `scoreOverride` / `overallTimeSeconds` are supported; new form entries go through `src/lib/mock-entry.ts`.
- `attemptSchemaFor(pattern)` is the write/import validation contract. Reuse it rather than duplicating layout rules.
- No database seed: new users start empty.

## Dashboard analytics model

`src/lib/analytics.ts` is server-side and returns the complete dashboard payload. The four dashboard tabs are **analytical scopes**, not record filters:

| Scope | Projection |
| --- | --- |
| `full` | One point per saved full mock |
| `subject` | One point per `(attemptId, subjectId)` from full, sectional, and standalone subject mocks |
| `sectional` | Explicit sectional attempts (one section each) plus Section I/II derived from every full mock |
| `all` | One point per saved parent attempt, compared by percentage |

Critical invariants:

- Never union projections for All Mocks; one full mock must not count again as four subjects and two sections.
- Explicit sectionals produce one section point; full mocks produce two derived section points. Do not derive a second copy from an explicit sectional. **Qualifying sections (Section III) never produce a point**, so a full mock contributes exactly two merit section points.
- Derived sections sum child results and do not inherit the full mock's score override, rank, percentile, or overall time.
- Subject/section charts show every populated series together. Missing values stay `null`, not zero.
- `whereYouStand` (radar) is global across mock types and should not change when switching dashboard tabs; platform/date/search constraints still apply.
- `AnswerStack` retains genuine saved-percentile provenance for analytics compatibility, but compact outcome cards always display score percentage (marks ÷ maximum). Parent full/sectional percentiles are never copied to subject slices or derived sections.
- The target reference is a `TargetReference` resolved on the server for the SAME tier the analytics were scoped to: `{ marks, maxScore, percentage, tierLabel, comparable }`. A target set on a 100-mark paper is never drawn against a 390-mark axis. The combined all-tiers view spans different maxima, so its reference is marked incomparable rather than drawn as one misleading line.
- `/api/analytics?view=full|subject|sectional|all` ignores parent `type`/`subject` filters; platform/date/search still apply. An explicit `tier` filter wins when choosing the target's paper. History/Compare use the persisted-record filters separately.

`Dashboard` keeps `scope` separate from `filters`. Clicking a dashboard tab changes scope; History/Compare change persisted-record filters.

## Study planner

The 50-day plan is static source data (`src/data/study-plan.json`, zod-validated in `src/lib/plan/schema.ts`; note the export declares 273 tests but contains 262 — counts always derive from actual rows). User progress lives in `PlanTaskProgress` / `PlanDayProgress` / `PersonalTask` (migration `20261027000000_study_planner`), keyed by deterministic plan identities (`taskKey = d{day}:{taskIndex}`, plan day number) — completing work never rewrites the schedule, and there is no seed or duplicate-row risk.

- `src/lib/plan/plan.ts` (server-only) reads the validated plan; `src/lib/plan/view-model.ts` is the client-safe layer: view types, IST date helpers, and the derivation functions (`planProgressStats`, `nextRecommendedAction`, `upcomingMocks`, `nextMockDay`, `monthGridDays`, `revisionQueue`) shared by the dashboard, calendar, and tasks — tested in `tests/study-plan.test.ts`.
- `src/lib/plan/progress.ts` merges plan × progress and owns all mutations. Routes: `GET /api/plan` (merged payload), `POST /api/plan/progress` (zod discriminated union: task patch / checklist / day revision / day notes), `GET|POST /api/tasks`, `PUT|DELETE /api/tasks/[id]` — all through `defineRoute` with ownership scoping like every other route.
- `usePlanData` owns merged study-plan progress and the personal-task list; `use-todos-data.tsx` owns the shell-lifetime todo query cache. Views: `plan/calendar-view.tsx` (the container) with its surfaces in `plan/calendar/`, `plan/plan-day-view.tsx`, `plan/plan-week-view.tsx`, `plan/dashboard-plan-sections.tsx`.
- Planner routes are real addresses: `/plan` redirects to `/plan/<today IST>`, `/plan/<date>` is the day workspace, and `/plan/week/<date>` is the seven-day schedule. The shell derives `isWeekView` and resolves the date from either prefix — do not `decodeURIComponent` the pathname again (Next already decoded it, and a second decode throws on a stray `%`).
- `/calendar` is a **unified ledger over three layers** — plan assignments, personal dated tasks, and logged attempts — toggled inline and mirrored in the URL. `src/lib/plan/calendar-entries.ts` is the one derived index: `buildCalendarIndex` flattens the plan (tasks and day-level revision), personal tasks by `dueDate` (undated excluded) and attempts by IST `completedAt` into date-keyed, pre-sorted entries; every surface and the metric strip read it, so nothing re-derives per surface and nothing scans all attempts per day. Revision is a kind inside the plan layer sourced from `day.revisionTasks` (never the today-relative `revisionQueue`). Any date is addressable — there is no plan clamp. The view mode is **derived** (`explicit ?? (isMobile ? "agenda" : "month")`) and only an explicit pick is serialized, so the automatic phone default never bakes into a shared link. `day-sections.tsx` renders the four labelled sections for the Day view, agenda groups and the rail; `day-ledger.tsx` is its margin-and-rules chrome. Phone day detail and the personal-task editor are both vaul drawers (`ui/drawer.tsx`), never nested, and always closed before another overlay opens.
- Tracker results and plan results are deliberately separate stores: the tracker keeps full subject-level MockAttempts; plan progress records the plan task's own score/wrong/unattempted fields. Revision completion is always manual.
- Personal tasks carry an optional external link validated by `safeHttpUrl` (strict http(s) only; empty → null). `safeHttpUrlCore` lives in the client-safe `view-model.ts` and is re-exported wrapped in zod by server-only `progress.ts` — do not duplicate the policy. Links render as `target="_blank" rel="noopener noreferrer nofollow"` anchors with the host shown. Display status derives `overdue` via `effectiveStatus()` (completed is never overdue); the dot mapping lives in `plan-shared.tsx` `STATUS_META` and uses only theme-protected semantic tokens. AI task suggestions (`src/lib/ai/task-suggestion.ts`) are a prompt-convention fenced block parsed client-side; **AI task creation is client-confirmed — the model never writes, and the task persists only on the user's Add click.** The AI panel's Log a Mock tab never saves either: it hands a reviewed draft through `AddMockView prefill` → `MockForm initialDraft` (applied once via the same `applyExtracted` merge path), keeping `MockForm` the sole save path.

- Dashboard order is Overview → Today's Plan → Study Calendar, then supporting panels and performance. Today's Plan uses today's structured assignments plus the shared personal-task workspace and an overdue preview excluding the selected personal date. Personal selection and Study Calendar selection are independent. The section head is editorial (small-caps dateline + serif title + one hairline, day stepping as a single bordered group); it owns the plan position, so `TodayFocusPanel` names its phase rather than repeating the day and day type.
- `/my-tasks` renders `tasks/my-tasks-view.tsx` (not `PersonalTodos`, which is the dashboard column). It reads the shell's shared `usePlanData` through `tasks/plan-rail.tsx` to show what the schedule expects, but completing plan work stays on the plan — a personal task and a plan assignment are deliberately different records. `/calendar` shows the same dated tasks as one toggled layer beside the plan and logged results. Personal lists preserve groups, subtasks, Trash, and legacy undated records. `/api/todos/calendar` aggregates per-date pending/completed counts over an inclusive maximum of 42 days, always scoped to the verified owner and excluding Trash. List pagination never limits calendar counts. `updatePersonalTask` (`/api/tasks`) sends the **status**, never a derived boolean: mapping every status to `completed` collapsed "in progress" and ran the reopen cascade that clears every subtask tick.

## AI subsystem

AI is optional, read-only, and server-only. It must fail closed without breaking the tracker.

- **Config**: `src/lib/ai/config-core.ts` parses `AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL`, `AI_JSON_MODE`, `AI_DAILY_REQUEST_LIMIT`, `AI_DAILY_TOKEN_LIMIT`, `AI_MAX_OUTPUT_TOKENS`, and `AI_TIMEOUT_MS`. `src/lib/ai/config.ts` adds `server-only`. Missing key/model returns `enabled:false` from `/api/ai/status`; data routes return `503 AI_NOT_CONFIGURED`.
- **Per-user credentials (web-configured)**: users may enter their own provider, base URL, model, and key in the UI (`AiSettingsForm`, rendered in Settings → AI provider and inside the AI Sheet when unconfigured). `src/lib/ai/resolve.ts` resolves per request: the user's stored credential wins, then the server env is the fallback; `source: "user" | "env"` drives quota (the deployment's `AI_DAILY_*` caps apply to the shared env key only).
  - Keys are encrypted with AES-256-GCM under `AI_CREDENTIAL_SECRET` (`crypto-core.ts` is testable; `crypto.ts` is the `server-only` entry) into `AiCredential.apiKeyEnc`. The plaintext never leaves the server: `AiCredentialSummary` deliberately has no `apiKey` field and the only display value is a 4-character `keyHint`. `AiCredential` is never read by backups.
  - Because the base URL is user-controlled, `src/lib/ai/ssrf-core.ts` blocks loopback, RFC1918, link-local/metadata (`169.254.169.254`), CGNAT, multicast, and reserved ranges plus the equivalent IPv6 forms; `ssrf.ts` adds a DNS resolution check that runs **immediately before every provider call** (save-time shape validation alone cannot see `host -> 10.0.0.5`). Each resolved address must be public. `redirect: "error"` stays on the fetch. Residual risk: DNS rebinding between our check and the provider's own resolution is not fully closed without IP pinning — do not describe it as complete.
  - `AI_CREDENTIAL_SECRET` is optional: when absent the credential form reports storage unavailable and AI works from env only. Rotating it makes stored rows undecryptable (they degrade to "not configured", not an error).
- **Provider**: native `fetch` through a protocol facade in `src/lib/ai/provider.ts`; no provider SDK. Four wire protocols are supported via `src/lib/ai/protocols.ts`: `openai-responses`, `openai-chat` (legacy default for old rows/env), `openai-completions`, `anthropic-messages` (`x-api-key` + dated `anthropic-version`). Missing protocol/auth/path fields on a config or stored row mean the old Chat Completions + Bearer contract — never guess a preset default at runtime. One repair call is allowed for invalid JSON; coach insight output is first clamped back inside its contract by `coerceCoachInsight` (schemas.ts), so a near-miss answer — one extra focus area, an over-length headline — never burns that call. native structured output (`text.format` / `response_format` / `output_config`) falls back once to prompt-only when the provider rejects it. Timeout semantics: the provider timer is a total wall clock for non-streaming completions; streams open with the first-byte grace (`AI_FIRST_TOKEN_TIMEOUT_MS`, clamp 5s–300s, default 120s — the thinking-model fix) and then re-arm the inter-chunk stall timer (`AI_TIMEOUT_MS`) after every received chunk. `config.thinking` (`default|off|low|medium|high`) maps to per-protocol reasoning params; thinking parameters are omitted for structured-JSON requests, and Anthropic's budget clamps below its 1,024-token floor. Reasoning deltas (anthropic `thinking_delta`, openai reasoning summaries, relay `reasoning_content`) are parsed and forwarded through `onReasoning` — never accumulated or stored server-side. Messages are `string | content-parts` for vision: each protocol maps parts to its own wire shape; legacy completions flattens to text. User-resolved credentials default to the 32,000-token reply ceiling (the Settings form max, via the pure `userReplyCaps` policy in `resolve-core.ts`) and deliberately ignore the deployment's `AI_MAX_OUTPUT_TOKENS` — its generic default once leaked onto personal keys and truncated every thinking-model reply — and default to a 120s provider timeout; both are overridable per user (`AiCredential.maxOutputTokens`). A truncation stop reason with partial text is surfaced to the chat UI, not silently shown as complete. Never probe a second protocol with user data: protocol selection is explicit.
- **Provider identity ≠ protocol**: `src/lib/ai/providers.ts` presets carry `protocol`, `authMode`, and endpoint defaults; `custom` exposes all four formats. Saved-key reuse (`sameCredentialTarget`) fingerprints provider + protocol + auth mode + generation/models paths.
- **No-auth providers** (`authMode: "none"`, e.g. Ollama) require no key; the first save stores an encrypted sentinel so an app rollback still reads a valid envelope.
- **Resolution**: `resolveAiConfig` returns user/env precedence via the pure `resolve-core.ts` policy. An undecryptable/invalid stored credential is a hard failure (`AI_PERSONAL_CONFIG_INVALID`), never a silent env fallback. Personal keys use `USER_KEY_SAFETY_LIMITS` (400 req / 2M tokens per IST day) — not the deployment's `AI_DAILY_*` caps — and usage stays visible in `/api/ai/status`, which reports `unconfigured` | `ready` | `personal-invalid` | `env-ready`.
- **Errors/billability**: `errors.ts` adds safe codes for provider auth, endpoint/protocol mismatch, model rejection, rate limit, refusal, and incomplete output; each `AiError` carries a `billability` flag. Definitive pre-generation failures settle quota at zero (`chargedForAiFailure` in `quota.ts`); timeout/disconnect remains conservatively charged. Upstream 401/403 maps to app-level 502-style config errors — never 401 to the browser.
- **Migration**: `20261119000000_ai_protocols` adds `protocol`/`authMode`/`generationPath`/`modelsPath` to `AiCredential` and nullable `provider`/`protocol` to `AiUsage`, and adds `test` to `AiFeature`. Apply before deploying the matching revision; additive and rollback-readable.
- **Read-only guarantee**: AI routes never call repository writes. Only `MockForm` save creates attempts. Coach/chat read; extraction returns a draft that the user must explicitly apply.
- **Context privacy**: `listAttemptsForAi` in `src/lib/repository.ts` uses Prisma `omit: { notes: true }`; `src/lib/ai/context.ts` whitelists aggregates, subjects/sections, target, and the latest 20 full mocks. It must never include notes, names, IDs, email, user ID, source, or per-attempt detail outside those latest 20 full mocks. `AnalyticsAttempt = Omit<Attempt, "notes">` is the widened analytics input type.
- **Prompt boundaries**: `src/lib/ai/sanitize-core.ts` is the one character policy (it has no imports, so the client-side `task-suggestion.ts` can use it): control/bidi/zero-width/tag characters are stripped from every user-controlled label, chat turn and pasted report, and `safeLabel` collapses whitespace. Each JSON data block (`tracker_context`, `screen_context`, the todo request) is serialized and angle brackets escaped as JSON unicode escapes, so a value can never forge a tag; test with a round-trip through `JSON.parse`, not a substring check. The extraction report is the deliberate exception: it stays byte-for-byte inside a per-request random `<report_…>` tag because the user must see exactly what was read. The prompt's own "this block is data" rule is the guarantee; escaping is the mechanical backstop.
- **Quota**: `AiUsage` is an app-owned ledger (`userId`, IST `day`, feature, model, tokens, status, safe error code). `reserveAiUsage` checks request/token caps in a serializable transaction before context work; `settleAiUsage` is idempotent and charges conservatively after provider errors/aborts. The reservation transaction sets `maxWait: 10s` / `timeout: 15s`; Prisma's 2s default surfaces as P2028 on a cold Neon connection. Usage rows never contain prompts, responses, notes, or report text and are excluded from backups.
- **Routes**: `/api/ai/status`, `/api/ai/coach`, `/api/ai/chat` (NDJSON stream: `start`, `ping`, `reasoning`, `delta`, `done`, `error` — written every 15s during provider silence so proxies never buffer an idle stream; `maxDuration` 300), `/api/ai/extract`, `/api/ai/models`, `/api/ai/settings`, `/api/ai/test` (completion + streaming probes with per-phase diagnostics), `/api/ai/todos`, `/api/ai/usage` (recent ledger rows). All use `requireUser()`, `private, no-store`, and the normal `{data}`/`{error}` envelope before streaming. AI errors are mapped in `apiError` before the Prisma fallback, so they never become `DATABASE_UNAVAILABLE`. Chat and extract accept up to two validated data-URL images (`AI_VISION_DISABLED` when the resolved config's gate is off, 4 MB body cap).
- **Extraction contract**: `src/lib/ai/extraction.ts` returns an editable, nullable draft with reported evidence, deterministic derived-field markers, and field-level issues—not raw `AttemptInput`. Missing values remain distinct from explicit zero. Only a blocker-free user-reviewed draft converts to `AttemptInput`; the form remains the sole save path and sets `source: "paste"`.
- **UI state**: the coach card is presentational; status, insight, chat messages, phase, reasoning accumulation, and the abort controller live in `use-ai-workspace.ts` (a Context provider mounted once by the workspace layout) so they survive view switches. Finished turns persist to **device-local** conversation history (`lib/ai/conversations.ts`, localStorage `ssc.ai.conversations.v1` — capped at 50 conversations / 200 trailing messages, rename persists across turns, search filters titles and bodies, quota failures degrade silently); the server never stores chats and backups exclude them. Closing the Sheet aborts the stream but never clears the transcript; the in-flight stream aborts on close/unmount, and a stopped turn is marked (`stopped` on the ChatMessage) instead of vanishing. AI controls are hidden/disabled when unconfigured. Vision: attached screenshots (downscaled client-side, `shared/ai/image.ts`) persist on the user turn but are never re-sent in follow-up history.
- **Docs/tests**: `tests/ai.test.ts` covers config, quota, IST day keys, context privacy, extraction normalization, provider JSON/stream/repair/timeout paths, NDJSON decoding, and AI error mapping. Tests use fake fetch; CI makes no real provider calls.

## Backup and account transfer

`src/lib/backup.ts` is the browser-safe format/planning layer. `src/lib/repository.ts` owns database export/import.

- Current format: `format: "ssc-insight-backup"`, `formatVersion: 5`, `exportedAt`, `summary` (`attempts`, `subjectResults`, first/last completion, plus plan-task / plan-day / personal-task / group counts), `settings` (`activeExamId`, `activeTierId`, `enabledTiers`, the `targets` envelope, `preferences`), `customExams`, a `planner` block, full attempts, warnings. No email, `userId`, or credentials.
- The `planner` block carries `planTasks`, `planDays`, `todoGroups` (by name) and `personalTasks`. It is the account's study record: leaving it out made the export silently drop every completion, note and personal task.
- Planner restore is **always merge and never destructive**: a completed flag never regresses to false, score/percentile/notes fill only when absent, checklist/revision ids union, and a personal task matched on `(title, dueDate)` is left alone. Replace deletes mocks only — it never deletes planner work.
- Legacy formats remain importable: v4 (tier-level scope with the pre-v2 `examTargets` map, migrated to per-tier overrides on the frozen primary tier), v3 (exam-level scope), v2 (single `targetScore` → `cgl:tier2`), and top-level v1 (`schemaVersion: 1`, attempts only, no settings or planner). A file with a newer version is refused with an "update the app" message.
- Import modes: `merge` (skip exact content duplicates, report coarse-key content conflicts, preserve existing data) and `replace` (delete all current attempts, then mirror the deduplicated file).
- Imports are transactional and chunked. New IDs and bookkeeping timestamps are generated; `completedAt` and `source` are preserved.
- A SHA-256 preview fingerprint covers destination content, incoming content, current/incoming settings, the planner block, mode, and `applyTarget`. Commits with a stale fingerprint return 409.
- Replace is client-gated by an explicit safety JSON download and a confirmation naming the signed-in account, and server-gated by `confirmReplace: true`.
- The import transport limit is 4 MB (Vercel request-body constraint); the attempt schema limit is 10,000. CSV is read-only and never importable.
- Scope and targets are applied only when `applyTarget` is set.
- User-facing move flow: export JSON from the old account → sign out → sign in with the other Google account → import → merge or replace. This moves data, not the login identity.

## UI and charts

- **Route rendering (2026-11-20 folder-routing shift).** Every workspace route is a real Server Component page that authenticates, prefetches its own data, and renders components from a private folder beside it. The old single client orchestrator (`workspace-shell.tsx`, deleted) rendered every view from `usePathname()`; do not reintroduce it.
  - `(workspace)/layout.tsx` is the auth gate and provider host: `requireUser()` → `PrivateWorkspace` → `QueryProvider` → `ExamScopeProvider` → `ToastProvider` → `WorkspaceChrome`. Providers must stay in the layout — mounting the query client in a page would drop the cache on every navigation.
  - `components/workspace-chrome.tsx` owns only what must survive a route change: sidebar/header (`app-shell.tsx`), `CommandPalette`, `useKeyboardShortcuts`, and the AI drawer (`useAiWorkspace` + `AiChatSheet`). The drawer lives here because its transcript and any in-flight stream would otherwise be lost on navigation.
  - **Colocation:** a route's components live in `<route>/_<segment>/` (e.g. `dashboard/_dashboard/`, `plan/[date]/_plan/`). The moment a second route imports one, it moves to `src/components/shared/`. `tests/colocation.test.ts` enforces this by import-graph scan; `tests/routes.test.ts` enforces that every route has `page.tsx` + `loading.tsx` + `error.tsx` (dynamic routes also `not-found.tsx`), that no page is a client component, and that every page calls `requireUser()`.
  - **Server prefetch:** `lib/rsc/prefetch.ts` `prefetchInto()` seeds the TanStack cache before render. It never throws, never caches a rejection, and never writes `undefined` — a data outage must degrade to the client's normal error banner, not a 500. Wrap any pre-page scope read in `safely()`. Pages call the same key factories the client hooks import; a hand-written key literal silently never hydrates.
  - **Reads live in `lib/services/*`** (`trash.ts`, `analytics.ts`, `attempts.ts`), called by both the page and its `/api/*` handler so the two paths cannot drift on scope, ownership or the trash filter. Route handlers keep their `{data}`/`{error}` envelope and cache headers.
  - `loading.tsx` mirrors the route's real geometry (never a spinner); `error.tsx` is a thin client file over `components/shared/route-error.tsx` and receives **`{ error, retry }`** in this Next version — use `retry()` (re-fetches), not `reset()`.
  - Per-route client state: `components/shared/use-filters-state.ts` owns filters/scope/paging and mirrors to the URL with `history.replaceState` (**never** `router.push` — typing must not trigger RSC round-trips). `use-analytics-data.ts` owns the analytics payload, target and unfiltered attempts. `use-plan-data.ts`, `use-todos-data.tsx` and `use-ai-workspace.ts` are otherwise unchanged.
  - Cross-route one-shots (the AI panel's reviewed mock draft) cross through `stores/ui-store.ts` as request/consume pairs, **never** a URL parameter — a draft is user content and would land in history and logs.
- **App shell:** `app-shell.tsx` wraps the workspace in shadcn's `SidebarProvider` (`collapsible="icon"`, 15rem paper sidebar collapsing to a 3.5rem rail, left Sheet below `md`). The sidebar-07 composition uses `SidebarMenuButton` for branding, navigation, and the footer account settings link. Navigation groups live in the `Sidebar` below the wordmark; `SidebarRail`/`SidebarTrigger` control it, `SidebarMenuButton` provides collapsed-item tooltips, and links call `onRouteIntent` then `setOpenMobile(false)`. Sidebar open state is owned by shadcn's provider/cookie; the workspace layout reads `sidebar_state` into `defaultSidebarOpen` for reloads — do not add parallel state. Collapsed text uses the screen-reader-only helper rather than zero-width wrapping blocks; the navigation stays vertically scrollable on short screens. `SidebarInset` is the single `<main id="main-content">`; the routed page renders inside it. Page titles/actions use `page-header.tsx` inside the content, not the 56px sticky header (which carries the trigger, current view, AI trigger, theme, settings, and account).
- Filters and the dashboard scope are mirrored to the address bar via `history.replaceState` (parse/serialize in `src/lib/filters-url.ts`): shared links restore the view on load, but Back changes routes, not filters — deliberate, no RSC round-trips while typing. `/compare` additionally mirrors its selection as `?ids=` (max four, comma-separated, only on /compare), so a comparison is shareable and survives reload. The mirror is skipped on `/add`, `/calendar`, `/plan/*`, `/my-tasks`, and `/settings` so it cannot strip Add Mock query params; `safeWorkspaceReturnTo` accepts the planner routes plus `/dashboard`, `/history` and `/compare`. The strict filter schema (`filtersSchema` in `lib/domain.ts`) is shared by the analytics API and the lenient URL parser.
- `refresh()` is a scoped invalidation (analytics + the unfiltered attempt list). Analytics keys off (scope, debounced filters) — instant on mount, 350ms behind typing bursts, `keepPreviousData` holds the previous view instead of flashing skeletons. The exam/scope payload and AI status load once and revalidate only on explicit actions.
- Navigation hrefs may be functions (`NAV_GROUPS`) so a date-bearing route — the sidebar's "Today's plan" — resolves per render instead of freezing the IST date at module load.
- `PerformanceOverview`, `HistoryPanel`, and `CompareView` are `memo`-wrapped; the shell stabilizes their props (useCallback handlers, `useMemo` derived lists, a `useMemo`'d coach node) so chat-stream tokens and filter keystrokes do not re-render the charts.
- `dashboard-view.tsx` composes `/dashboard`: one `PageHeader`, a compact real-data overview strip (`dashboard-overview.tsx`) that owns the headline metrics, a primary/secondary two-column workspace, then performance analysis. The overview renders one divided `.metric-strip` (not individual cards), and each cell is itself the link to the surface that acts on it. `performance-overview.tsx` must not re-introduce a second headline stat strip — it renders a quiet `dl` metadata row (`.performance-meta`) instead. `performance-overview.tsx` renders the dashboard charts; `src/components/ui/chart.tsx` is the local shadcn-style Recharts wrapper; `src/components/dashboard-panels.tsx` provides `Panel`/`EmptyChart`.
- **`/performance` (the analytical workspace).** A real Server Component page (`performance/page.tsx` prefetches analytics + scoped attempts with `prefetchInto`) whose client view (`_performance/`) renders the evidence stack: `ScoreBand` → `FindingsPanel` (threshold-gated observations from `src/lib/performance-metrics.ts` — the ONE derivation both the dashboard preview and this page read) → hand-rolled SVG panels (`trend-panel.tsx` area/subject-lines, `radar-panel.tsx` over the scoped `radial` stacks, `attempt-breakdown-panel.tsx`, `distribution-panel.tsx` over `distributionBuckets`, `subject-deep-dive.tsx` over `deepDive`). Scope lives in `?scope=` via `use-filters-state`; the target line and gap figure respect `TargetReference.comparable` — a mixed-maxima view never draws one misleading target. `performance-overview.tsx` (Recharts) stays dashboard-only; the /performance panels are hand-rolled SVG with `useReducedMotion`-gated entrance draw-ins. The outcome donut lives in `src/components/shared/charts/breakdown-donut.tsx` beside score-band/sparkline.
- Dashboard motion primitives: `motion-swap.tsx` (`Swap`) fades content in over 4px when a `swapKey` changes — used for the plan-day swap and the analytics-scope swap — and `microMotion(style)` in `theme-style-provider.tsx` supplies its per-style duration next to `viewTransition()`. A swap deliberately has no `AnimatePresence`, no exit animation, and no height animation, because collapsing a tall panel would jump the scroll position. Progress rules transition width via `--dur-enter`; hover/press states use `--dur-quick`. Charts stay unanimated on data change, and every one of these effects becomes an instant change under `prefers-reduced-motion`. The shared JS-motion vocabulary (`EASE`, `DUR`, `staggerContainer/Item`, `pressTap`, `drawPath`, springs) lives in `src/lib/motion.ts` and mirrors the CSS `--ease-out-soft` curve; entrance draw-ins on `/performance` charts and the landing film are `useReducedMotion`-gated.
- `src/app/globals.css` + `src/lib/chart-theme.ts` define paper/ink/accent and semantic chart tokens. Preserve them. Shadcn-only aliases (`--background`, `--border`, `--sidebar-*`, …) map onto those tokens; `--accent` stays terracotta and is never repurposed as shadcn's neutral hover. `tw-animate-css` is not installed, so the Sheet/tooltip primitives use local `data-state` CSS (`sheet-overlay`, `sheet-content`) with the existing duration/easing tokens instead of generated `animate-in` utilities.
- **Responsive system (dashboard is the reference):** type and geometry are read from tokens in `globals.css` (`--type-*`, `--metric-cell-pad-*`, `--band-cell-pad-*`, `--day-nav-size`, `--tap-min`), so a `[data-style]` or a breakpoint resizes by overriding a token — never by re-declaring a class. The **phone token block sits last** in `globals.css` and deliberately supersedes every style density (44px controls, 40px compact, 16px type steps); a style block appended below it would silently win on phones again. Divider strips respond to their container, not the viewport: `.workspace-content` and `.strip-frame` are query containers and `.metric-strip`/`.score-band` fold to 2×2 under 680px of content — that is what fixes the 768–1023 squeeze caused by the 15rem sidebar, and it leaves 1024+ four-across as shipped. `.metric-strip-scroll` (My Tasks) opts out. Three shared utilities carry the touch rules: `.tap-target` (44px hit area without changing visual size), `.action-row` (full-width stacked actions on phones, inline from `sm`), and the unlayered 16px form-field rule that defeats iOS focus zoom app-wide, including portaled sheets. Desktop ≥1280px stays pixel-identical — verify with `tools/shot.mjs` before/after and `tools/resp-probe.mjs`.
- Design rules: warm paper surfaces, square corners, thin rules, serif headings, no shadows, disabled chart animation, reduced-motion support, visible legends/labels, and accessible data tables (`View data`). The reference-led outcome cards are the scoped exception: they use soft rounding and subject icons without changing surrounding dashboard geometry.
- “Make every attempt count” renders `analytics.radial` as responsive, compact outcome cards across every scope. Cards show coverage, a score-centered answer-distribution ring, three outcome counts/shares and proportion bars, marks/max, accuracy, and genuine reported-percentile availability. Parent full/sectional percentiles are never copied to subject slices or derived sections; the ring center always shows score percentage (marks ÷ maximum). An aggregate card has no single attempt date — dated saved attempts use the companion `AttemptRecordCard` in the same module, which shows the real attempt date and a result action.
- Charts use a single percentage axis; raw marks stay in tooltips/tables. Do not introduce dual-axis charts.
- **Date semantics (no migration):** scheduled date = plan day/static task date; attempt date = `MockAttempt.completedAt` (user-entered date at IST midnight, used by filters/ordering/analytics/charts); recorded date = `createdAt`, shown only as “Logged” in the detail dialog. Trend ordering uses `completedAt`, never `createdAt` (regression-tested in `tests/subject-performance.test.ts`). Logging a tracker attempt never creates, moves, or auto-completes a plan task.
- Dates are displayed in Asia/Kolkata via the memoized formatters in `src/lib/format.ts` (`shortDate`, `longDate`, `istDateKey`, `istTimeLabel`, `isIsoDate`, `mockTypeLabel`) — do not construct new `Intl.DateTimeFormat` instances in components. The dashboard header clock (`dashboard-clock.tsx`) uses `istTimeLabel` and schedules its next tick on the minute boundary rather than a drifting interval. Weekday names come from `isoWeekdayName`/`isoWeekdayShort` in `src/lib/plan/view-model.ts`, which memoize one formatter per weekday instead of rebuilding one per cell. Invalid/legacy dates render a neutral `—` rather than an invented date.
- `/add` renders `add-mock-view.tsx` inside a Suspense boundary (it reads `date`, `name`, `returnTo` via `useSearchParams`) and still hands the save to `MockForm`; planner “Add mock record” actions route there with the selected date.
- **Ask AI in two surfaces.** The right-side sheet (`ai-chat-sheet.tsx`, ~520px, full width on mobile, `dvh` flex layout, safe-area composer) keeps three tabs (Ask / Todos / Log) on the shared `.segment` grammar with visited panels kept mounted (`hidden`, never unmounted) so a Todos draft or a pasted scorecard survives switching tabs; the dedicated `/ask` route renders the same conversation full-page in a measured three-column grid — `lg:[17.5rem_1fr] xl:[17.5rem_1fr_15.5rem]` — with the conversation rail + usage footer on the left, the read-ledger timeline of real usage rows on the right, and the `ask/_ask/` vaul bottom drawer below `lg`. A stopped stream, usage (`aiUsageLabel`), and the shared `ChatEmptyState` render identically on both surfaces. BOTH render through the shared components in `components/shared/ai/` — `chat-transcript.tsx` (mixed bubble grammar: right-aligned user bubbles with a `you` avatar, assistant answers as bordered document cards with an `ai` avatar + clock stamp, the read-the-workspace reasoning strip naming the four real context sources, per-turn Copy/Edit/Regenerate, New-replies pill), `chat-composer.tsx` (elevated auto-growing field, attach/paste/drop screenshots when vision is on, follow-up chip row), `markdown.tsx` (GFM reader: ruled tables, per-block code copy, safe links, no raw HTML), `thinking-indicator.tsx` (honest Connecting/Thinking phases, rotating read narration, source chips), `conversation-list.tsx` (search/rename/two-step delete over time-grouped rows with a sliding active marker; refuses deleting the conversation that owns an in-flight answer), `usage-footer.tsx` (quota meter + read-only pledge), `role-avatar.tsx` (avatars, clock stamps, source chips), `task-suggestion-card.tsx`, and `copy-button.tsx`. Colocation pushes anything two surfaces need there — do not fork the transcript per surface. Todos keeps the change ledger (`+`/`~`/`−` markers, inline `Edit`, sticky `N of M selected` / `Apply`) in `shared/tasks/ai-composer.tsx`; Log keeps the subject roster (`30Q · 18 ✓ · 6 ✗`) gated by the same `validateExtractionDraft` contract, with `ExtractionReview` behind `Edit details`. Chat accepts a validated orientation-only screen context (`{ view, date? }`, wrapped as `<screen_context>`); it carries no titles, notes, IDs, email, or attempt records.
- `src/app/not-found.tsx` is the styled 404 for unknown pages; unknown `/api/*` paths answer with the JSON envelope via the catch-all route handler.
- **Landing page (`src/components/landing/`):** a server-rendered page with named client islands (masthead, hero art, typed terminal, petals, ink art, count-up facts, the product film, showcase tabs, the scroll-spy rail, FAQ, the error announcer), alternating paper with two ink **plates** that carry a tone-inverted ink wash. The hero's terminal lines, the film's figures and the fact strip all derive from the fixtures/plan data — the landing never hand-types a number. The film (film-section.tsx) is a 24s four-scene loop of the real mockups with Pause/Restart transport; reduced motion renders it static. The floating ask pill starts the Google sign-in, because `/` is anonymous-only. Petals are a fixed literal table — never Math.random() at render. Plates change only their own `--plate-*` variables, never semantic tokens, which is why a paper product mockup sits on a plate and still looks like the workspace. The product showcase is hook-free code in `mockups/` (container-query scaled, inline SVG — **never import Recharts on `/`**), and every figure is derived through `totals()`/`analyze()` in `fixtures.ts`, with plan counts from `plan-data.ts` (server-only, sourced from the real JSON). Scroll reveals are CSS scroll-driven animations over an always-visible base (`.rise`, `.scope-fan`), so no observer can blank a section and no JavaScript is required; `@react-spring/web` was removed. `tests/landing-fixtures.test.ts` and `tests/plan-facts.test.ts` fail if a mockup could show a number the product cannot produce.
- **Client data layer (2026-10-31 state architecture):** TanStack Query owns ALL server state; Zustand carries a small global-UI store; everything else stays component-local. The old bespoke layers (`use-todos-data` Map cache, `ssc:todos-changed`, shell-fetch hooks) are gone — do not reintroduce them.
  - **Server state = TanStack Query.** One factory in `src/lib/query-client.ts` (browser singleton, server per-request) mounted workspace-scoped by `components/query-provider.tsx`: logout unmounts the shell and drops the cache, and `ssc:session-ended` triggers `queryClient.clear()` as defense in depth. Devtools are dev-only. In-memory only — never persist the query cache to storage.
  - **Keys and options live in `src/lib/queries/*`** (settings, attempts, analytics, plan, todos, ai, search): hierarchical factories — `["mock-attempts","list",params]` / `["mock-attempts","detail",id]` / `["todos","list",params]` / `["plan","current"]` — plus `queryOptions`. Never define keys inline in components; never use raw URL strings as keys. List/detail/full scopes are separate so a write invalidates exactly one record or one family.
  - **Mutations invalidate by prefix, never the whole cache.** `invalidateQueries` refetches only active observers (the mounted-key fan-out). Optimistic writes snapshot in `onMutate` and roll back with `setQueryData` (`usePlanOptimistic` is the pattern). The write limiter is 20 req/30s — do not broaden invalidation scopes; a 429 surfaces as `ApiError` and the retry policy honors `Retry-After`.
  - **`api()` throws `ApiError`** (`status`, `code`, `retryAfterSeconds`) with a guarded JSON parse. Exactly two raw-`fetch` exceptions remain: the AI chat NDJSON stream and the backup blob download (a stream/blob is not a cacheable resource). Everything else goes through `api()`.
  - **Zustand = `src/stores/ui-store.ts` only:** ⌘K palette visibility, AI drawer open/tab, planner date, quick-add nonce (the request/consume pair replaced `ssc:tasks-quick-add`). No persistence middleware; no server data in stores, ever; subscribe with narrow selectors. Durable prefs keep their own homes (theme tokens in localStorage, `sidebar_state` cookie, `ssc.tasks.view`).
  - Per-resource caching matrix: `docs/caching.md`. Defaults: 30s staleTime, 5min gcTime, no refetchOnWindowFocus, one retry (skipping auth/validation/abort).
- **Theme transition (the one sanctioned global crossfade):** `theme-toggle.tsx` renders the GIF-style circular disc — ink disc, paper glyph; both tokens invert in `.dark`, so one rule set serves all palette × style combinations with no `dark:` variants — and per click opens a one-shot `theme-animating` class on `<html>` for ~480ms; globals.css scopes that window to color properties at `--dur-view`. layout.tsx deliberately omits next-themes' `disableTransitionOnChange` because it injects a global `transition: none` kill-switch. Multiple toggles share a module-level morph timer; reduced motion skips the window and CSS freezes the morph. Keep the window narrow — never grow it into a general animation utility.
- **Multi-theme system:** `data-palette` (orange=original default, blue, lime, violet, rose, graphite) and `data-style` (vega=original default, sera, mira) are `<html>` attributes set before paint by the inline script in `theme-style-provider.tsx` (localStorage `ssc.palette`/`ssc.style`, safe defaults) and resolved entirely by CSS custom properties in `globals.css` — never hardcode palette hexes in components. Chart series colors are fixed per subject and identical in every palette (static identity: terracotta score/Quant/Section I/incorrect, blue Reasoning/Section II, olive average/correct, teal time, warm gray Computer); dark mode declares lightness-tuned variants of the same hues once in `.dark`; only `--chart-target`/`--chart-skipped` track the theme's muted/rule-soft surfaces; no `[data-palette]` block declares chart hues. Styles vary geometry/density/motion via tokens (`--radius-*`, `--control-*`, `--table-cell-*`, `--dur-*`, `--elev-pop`); density vars are consumed by the base element defaults and component classes, so Tailwind utilities still override per view. Mira's density tokens are rem-based and sit one "sm" step below vega; `--type-body`/`--type-segment` tokenize body and segment text so styles resize them without re-declaring the class. The sheen tokens (`--accent-sheen`, `--canvas-sheen`, default `none`) are graphite-only: a metallic gradient on the primary Button variant and a faint body canvas wash, derived from ink/paper so dark mode needs no per-mode rule. The selection UI is `appearance-panel.tsx` in Settings — shadcn ToggleGroups in the card variant (choices apply instantly, aria-pressed via Radix, mounted-gated selected states). next-themes keeps owning light/dark; each palette defines its own dark charcoal tint in `.dark[data-palette=…]`. All 18 combinations keep AA accent contrast (verified) and identical layout/behavior.

## Settings

`(workspace)/settings/_settings/` owns `/settings`: eight groups (Exams & tiers, Targets, Reminders, Appearance, AI provider, Sign-in & security, Data & backup, About & account) behind one navigable rail. The section is a real selection that gates the rendered panel and mirrors to `?section=`; it is **not** the old always-mounted stack where every panel was `hidden lg:block` and the rail only recoloured a button.

- `settings-view.tsx` — section state, the rail/tab strip, the sticky save bar, and the discard dialog (rendered at the view root — it was exported-but-never-mounted dead code until 2026-11-20). `components/shared/settings-guard.tsx` lets each draft-holding panel register `{ isDirty, reset, save }` in state (not a ref, so the bar reacts as dirtiness changes). The save bar slides in when the active panel is dirty and drives its real save/reset; leaving a dirty section asks before discarding; `beforeunload` binds while anything is dirty. Draft panels use react-hook-form + zod from `components/shared/settings-schema.ts`, each schema mirroring the server contract. The section swap and save-bar spring are the one settings-scoped motion exception (`_settings/_lib/motion-presets.tsx`, reduced-motion aware — see DESIGN.md); dashboard Swap rules are unchanged.
- `exams-panel.tsx` — tier enablement is a staged RHF draft committed via the save bar (`PUT /api/settings`, scope only). Disabling the active tier moves the scope somewhere that still resolves. Custom exams are created/edited in a `Dialog` (own local state) and deleted behind an `AlertDialog`.
- `targets-panel.tsx` — three tabs (Per tier / Structure defaults / Percentile goal) over one RHF form; rows are namespaced fields (`tier:`, `default:`, `pct:`) validated against the server-shipped ceilings. The server resolves every target and ships `resolvedTargets`, `percentiles` and `targetPeers`, so the editor never computes a maximum. The save bar batches every dirty row into one `PATCH /api/settings { edits }`; per-row Save commits a single row, and inherit/clear stay instant.
- `reminders-panel.tsx` — **in-app only**. There is no service worker, push subscription, email or background job, so nothing can reach a closed tab; the panel says so (with the "In-app only · no email" Badge) rather than presenting a toggle that looks like a reminder. One RHF preferences draft; switches carry the settings-scoped bounce.
- `ai-settings-form.tsx` — one RHF draft on shadcn `Select`/`Input` primitives; the key stays write-only with a ghost Eye reveal. Test-connection keeps the real `POST /api/ai/test` and renders Badge states (Testing…/Connected/Failed). It registers with the guard in Settings and no-ops in the chat sheet (`useOptionalSettingsGuard`); the sticky bar saves in Settings, the sheet keeps its own button.
- `data-panel.tsx` — export/import with a preview that counts mocks AND planner rows (untouched). `about-panel.tsx` describes the ACTIVE catalog entry (paper, marks, marking, duration, source notice, catalog `Badge`) and shows an `Avatar` with account initials.

- `security-panel.tsx` + `use-auth-security.ts` — Sign-in & security: identity, password set/change, TOTP two-factor lifecycle (enroll ladder with QR + backup codes, disable, regenerate) and session list with revoke-others. Instant actions + dialogs + toasts, deliberately NOT a registered draft (nothing here edits tracker settings). Wire calls ride `src/lib/auth/email-client.ts`; session data comes from the SDK's `useSession`, sessions from a `['auth','sessions']` query.
One client cache backs all of it: `/api/exams` returns the catalog, the scope, the targets envelope and every resolved target. There is no separate `["settings"]` query — a write that updated one and not the other is exactly how a target could silently disagree with its own maximum.

## Testing

Tests use the built-in `node:test` runner with `tsx`. There are no component, browser, or visual-regression tests. Key coverage:

- `tests/domain.test.ts`, `tests/mock-entry.test.ts` — scoring, IST dates, layouts, overrides.
- `tests/subject-performance.test.ts` — scope projections, no-double-counting, radar, outcome-card aggregates/percentile provenance, target helpers.
- `tests/backup.test.ts` — v1/v2 format, summary integrity, fingerprints, merge/replace planning, ownership stripping, limits.
- `tests/attempt-persistence.test.ts`, `tests/ownership.test.ts`, `tests/api.test.ts` — persistence mapping, forged ownership, response safety.

The authenticated scripts are integration checks, not unit tests; they require live QA sessions and should run against a disposable Neon branch with cleanup.

Run `typecheck`, `lint`, and `test` before calling a change done; CI runs all three plus `build`.

## Environment and deployment

- Copy `.env.example`; real values stay server-side. Required: `DATABASE_URL`, `DATABASE_URL_UNPOOLED` (migrations), `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`, `GOOGLE_AUTH_ENABLED`. Optional AI: `AI_API_KEY`, `AI_MODEL`, and the tuning variables documented above.
- The AI usage migration is `prisma/migrations/20261025000000_ai_usage`; the protocol migration is `20261119000000_ai_protocols`; per-user model behavior (thinking, maxOutputTokens, historyTurns, visionEnabled on `AiCredential`) is `20261120000000_ai_preferences`. Apply before deploying the matching revision. Backups remain unaffected.
- Migrations use the unpooled URL via `prisma.config.ts`. Never run `prisma migrate reset`, never target the Neon Auth schema, and do not apply migrations automatically in arbitrary builds.
- `.neon` is local/ignored; `neon.ts` declares services. `neon deploy` reconciles services and pulls env values.
- Vercel deployment uses the pooled URL; the backup import cap is 4 MB because Vercel request bodies are about 4.5 MB.
- Do not add scheduled backups/reminders; backups are manual by product decision.

## Trash and data recovery

Deleting supported records is a **soft delete**. `src/lib/trash-core.ts` is the client-safe
policy layer; `src/lib/trash.ts` is the server service; `/trash` is the only surface that
lists or restores deleted work.

- **Scope is four kinds**: `attempt`, `task`, `exam`, `group`. Their tables carry
  `deletedAt TIMESTAMPTZ(3)` with an `@@index([userId, deletedAt])` (`PersonalTask` already
  had the column from `20261029000000_personal_todos`).
- **No `TrashEntry` table, no stored `expiresAt`, no `deletionBatchId`.** Expiry is derived
  (`deletedAt + TRASH_RETENTION_MS`). A stored copy could disagree with the source, and no
  trashed parent has independently trashed children, so batching buys nothing.
- **One retention constant.** `TRASH_RETENTION_DAYS` in `trash-core.ts` feeds the UI copy,
  the list cutoff, the restore check and the cleanup job. Never restate `15` or a day in
  milliseconds in a component.
- **Every read filters `deletedAt: null`.** The attempt boundary is `attemptWhere()` in
  `attempt-persistence.ts`, which covers analytics, history, compare, the calendar and the
  plan matcher at once. The ESLint rule
  `MemberExpression[property.name='mockAttempt']` enforces the boundary at lint time;
  `repository.ts`, `trash.ts` and `search.ts` are the only exemptions, and `search.ts` is a
  reviewed one (keyset pagination) that applies the filter itself. The single deliberate
  unfiltered read is the exam-delete attempt count in `api/exams/route.ts`, which must see
  trashed attempts too — it carries an inline disable with that reason.
- **Every restore and purge predicate carries `deletedAt: { not: null }`.** That is what
  stops a crafted id from touching a live row, and it is why delete/restore/purge of an
  already-trashed or live record respectively answers 404 rather than acting twice.
- **Exam pruning happens at purge, never at trash.** Deleting a custom exam sets `deletedAt`
  and moves the scope to another enabled tier; `enabledTiers` and `targets` are left intact
  so restore is lossless. `pruneTargetsForExam` (in `target-settings.ts`, pure and tested)
  runs only when the exam is permanently removed, and it keeps a structure default as long
  as any surviving tier still carries that paper.
- **A trashed exam keeps its `enabledTiers` keys, and `PUT /api/settings` must tolerate
  them.** `tierKeyResolves` only knows the live catalog, so the settings write accepts a key
  naming a trashed exam as a preserved reservation. Do not "simplify" that away: it is what
  keeps the scope switcher and Settings saveable while an exam sits in Trash.
- **Name uniqueness spans live and trashed** for custom exams and task groups. That is what
  makes restore conflict-free. Create/rename return a specific 409 naming Trash instead of a
  raw `P2002`.
- **`CustomExam.id` is a live Postgres `UUID`; every other recoverable id is `TEXT`**
  (`prisma/schema.prisma` says `String` for all four, so the schema under-describes this
  column). `listTrash`'s raw `UNION ALL` across the four kinds must cast it — `"id"::text` —
  or PostgreSQL answers `42804 UNION types text and uuid cannot be matched`, which `apiError`
  has no case for and so reports as a generic `DATABASE_UNAVAILABLE` 503. Any new raw SQL
  that unions the kind tables inherits the same requirement.
- **Backups never carry Trash.** `exportBackup` filters live rows only. Import restores a
  trashed exam or group it collides with rather than duplicating it, and clamps an incoming
  `deletedAt` (`clampImportedDeletedAt`) so an older file cannot import already-expired
  rows. Replace mode hard-deletes live mocks and leaves Trash untouched — it is the one
  sanctioned exception to "nothing is destroyed immediately" and is gated by the mandatory
  safety download.
- **Expiry is enforced by the API, not the scheduler.** `listTrash` excludes expired rows and
  `restoreTrash` rejects them with 409. `GET /api/cron/trash-cleanup` (bearer `CRON_SECRET`,
  503 when unset, listed in `isCronPath`/`bypassesMaintenance` and passed through by the
  proxy) only reclaims storage, drained in batches with per-kind failure isolation.
- **`/my-tasks` has no Trash.** The task list API rejects `view=trash`; deleted tasks are
  recovered from `/trash` only. The same holds for `PersonalTodos`, which backs the dashboard
  column and the calendar's personal layer.
- **Migration order is load-bearing**: apply `20261103000000_trash` before deploying the
  revision. New code against an un-migrated database fails every attempt read; an app
  rollback after the migration makes trashed rows live again to the old code.

## Documentation map

Change behavior in this order: update the implementation, then the relevant of `PRODUCT.md` (behavior), `DESIGN.md` (visual/chart rules), `README.md` (setup/API/verification). Keep `CLAUDE.md` and `AGENTS.md` focused on architecture and invariants rather than duplicating every product rule, and update both together when an invariant changes.

`graphify-out/` is generated and committed. Run `graphify update .` after code changes; when an architecture rule in this file changes, the `/graphify --update` skill flow refreshes the doc-derived nodes so queries answer from the current rules.

