# Graph Report - ssc-insight-2  (2026-11-20)

## Corpus Check
- 475 files · ~335,649 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 5, .css 2, .example 1)

## Summary
- 3504 nodes · 10955 edges · 164 communities (97 shown, 67 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 141 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fa24e699`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- icon.tsx
- my-tasks-view.tsx
- calendar-view.tsx
- README.md SSC Insight
- UI Overhaul Phase 1 Audit & Baseline Assessment
- SSC Insight Architecture
- SSC Insight Architecture
- package.json
- ai-settings-form.tsx
- PRODUCT.md SSC Insight
- sections.tsx
- lib/todos.ts
- DESIGN.md SSC Insight
- ref_server_only
- personal-task-drawer.tsx
- backup.ts
- performance-overview.tsx
- proxy.ts
- RequestError
- theme-style-provider.tsx
- exam-settings.ts
- useToast
- ui-check.mjs
- queries/exams.ts
- provider.ts
- Desktop Dashboard View ('Your preparation, in perspective.')
- coach/route.ts
- app-shell.tsx
- audit.ts
- @tanstack/react-query
- lib/analytics.ts
- exam-switcher.tsx
- schema.ts
- rate-limit.ts
- credentials.ts
- lib/trash.ts
- performance-metrics.ts
- longDate
- compilerOptions
- exams-panel.tsx
- shot.mjs
- app/layout.tsx
- RouteSkeleton
- format.ts
- components.json
- ci.yml
- connection-input.ts
- RouteError
- ai-chat-sheet.tsx
- repository.ts
- workspace-chrome.tsx
- Paper-and-Ink Design System
- daynav-check.mjs
- fixtures.ts
- devDependencies
- Neon PostgreSQL + Prisma 7 Stack
- scripts
- mock-form.tsx
- Dated personal todos and AI-assisted planning
- cn
- Core Product Workflows
- private-workspace.tsx
- react
- targets-panel.tsx
- Raw Lucide Imports Migrated into Semantic Icon Map
- UI Baseline Audit Findings (26 prioritized items)
- ssrf-core.ts
- entry-rows.tsx
- reminders-panel.tsx
- task-toolbar.tsx
- use-ai-workspace.tsx
- requireUser
- period-nav.tsx
- Conservative Caching Policy (private by default)
- api
- Per-User Encrypted AI Credentials
- postcss.config.mjs
- filters-url.ts
- view-model.ts
- data-parts.tsx
- Folder-Based Routing and Upstash Rate Limiting — Design
- Review Focus
- explain-search.ts
- showcase.tsx
- ws
- Generated Next.js Agent Rules Block
- URL State Mirror (filters/scope in address bar)
- Vercel Configuration Preparation
- Accessibility Pass (skip link, focus, aria)
- Built-in 50-Day Study Plan (26 Oct - 14 Dec 2026)
- AI Coach, Chat Drawer, and Assisted Paste
- history-screen.tsx
- next
- lib/search.ts
- domain.ts
- compare-view.tsx
- ref_node_crypto
- verify-ownership.mjs
- about-panel.tsx
- ref_node_assert
- rate-limit-upstash.ts
- routes.test.ts
- form.tsx
- google-sign-in-button.tsx
- prisma
- verify-backup-transfer.mjs
- rate-limit-budget.ts
- resp-probe.mjs
- toast.tsx
- useIsMobile
- PlainIcon
- TokenBucketRateLimiter
- queries/attempts.ts
- vercel.json
- ai.test.ts

## God Nodes (most connected - your core abstractions)
1. `cn()` - 279 edges
2. `PlainIcon()` - 135 edges
3. `react` - 125 edges
4. `Button()` - 121 edges
5. `SSC Insight Architecture` - 104 edges
6. `SSC Insight Architecture` - 104 edges
7. `shortDate()` - 81 edges
8. `database()` - 75 edges
9. `README.md SSC Insight` - 73 edges
10. `RequestError` - 66 edges

## Surprising Connections (you probably didn't know these)
- `Global Constraints` --references--> `requireUser()`  [INFERRED]
  docs/superpowers/plans/2026-11-20-folder-routing.md → src/lib/auth/require-user.ts
- `Task 2: Route, colocation and client-boundary guards` --references--> `requireUser()`  [INFERRED]
  docs/superpowers/plans/2026-11-20-folder-routing.md → src/lib/auth/require-user.ts
- `Risk register` --references--> `requireUser()`  [INFERRED]
  docs/superpowers/specs/2026-11-20-folder-routing-design.md → src/lib/auth/require-user.ts
- `Server prefetch contract` --references--> `requireUser()`  [INFERRED]
  docs/superpowers/specs/2026-11-20-folder-routing-design.md → src/lib/auth/require-user.ts
- `The layout keeps only what must survive navigation` --references--> `AiChatSheet()`  [INFERRED]
  docs/superpowers/specs/2026-11-20-folder-routing-design.md → src/components/ai-chat-sheet.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Shared Personal Work Data Flow** — agents_shell_scoped_todo_query_cache, agents_dedicated_personal_workspace_and_forty_two_day_summary, agents_overview_today_plan_study_calendar_order [EXTRACTED 1.00]
- **Theme Palette Style Contrast Contract** — design_before_paint_palette_and_style_attributes, design_semantic_canvas_paper_ink_accent_and_chart_tokens, design_aa_contrast_and_focus_rules [EXTRACTED 1.00]
- **Reviewed Three Mode AI Workflow** — product_three_mode_ai_panel, product_explicitly_reviewed_versioned_ai_todo_proposals, product_nullable_reviewed_extraction_draft, product_session_only_in_memory_chat [EXTRACTED 1.00]
- **15-Phase UI/UX Overhaul Program** — docs_ui_overhaul_phase_1_audit_findings, docs_ui_overhaul_phase_1_audit_phase_plan, docs_ui_overhaul_phase_2_design_spec_printed_progress_ledger, docs_ui_overhaul_phase_5_to_14_implementation_segment_group, docs_ui_overhaul_phase_15_handover_conventions [EXTRACTED 1.00]
- **Single Percentage-Axis Chart Convention Across Breakpoints** — docs_images_dashboard_desktop_quant_performance_chart, docs_images_dashboard_desktop_subject_deep_dive_chart, docs_images_dashboard_mobile_responsive_chart_axes [INFERRED 0.75]
- **Score-Centered Answer-Distribution Ring Pattern** — docs_images_card_score_centered_ring, docs_images_card_outcome_counts_bars, docs_images_dashboard_desktop_make_every_attempt_count_panel [INFERRED 0.85]
- **Dashboard Reference Asset Set (outcome card + desktop + mobile)** — docs_images_card_outcome_card, docs_images_dashboard_desktop_dashboard_view, docs_images_dashboard_mobile_mobile_dashboard_view [INFERRED 0.85]
- **Printed-Ledger Design Identity Family** — design_paper_and_ink_system, design_typography_scale, docs_ui_overhaul_phase_2_design_spec_printed_progress_ledger, docs_ui_overhaul_phase_2_design_spec_radius_scale, docs_ui_overhaul_phase_1_audit_radius_system [INFERRED 0.85]
- **Private-Account Auth and Ownership Flow** — claude_request_ownership_architecture, readme_google_signin_oauth, docs_private_accounts_ownership_model, docs_private_accounts_migration [INFERRED 0.85]

## Communities (164 total, 67 thin omitted)

### Community 0 - "icon.tsx"
Cohesion: 0.10
Nodes (39): Loading, error and not-found surfaces, CalendarLoading(), PersonalTasksPanel(), PlanWithToday, DashboardView(), RecentAttemptsPanel(), DoneDot(), EmptyCell() (+31 more)

### Community 1 - "my-tasks-view.tsx"
Cohesion: 0.04
Nodes (67): ApplyOp, ConfirmState, RescheduleState, TAB_ITEMS, OverviewStrip(), TasksEmptyState(), activeFilterEntries(), asString() (+59 more)

### Community 2 - "calendar-view.tsx"
Cohesion: 0.05
Nodes (80): AgendaGroups(), AgendaView(), EarlierRanges(), CalendarMetrics(), CalendarSurface(), CalendarToolbar(), categoryLabel(), QuietDays() (+72 more)

### Community 4 - "UI Overhaul Phase 1 Audit & Baseline Assessment"
Cohesion: 0.06
Nodes (45): AI Status Endpoint Cache Policy (/api/ai/status), Analytics Projections Cache Policy (/api/analytics), api() Client Fetch cache: no-store (src/lib/api-client.ts), Backup Export Raw File Exception (GET /api/backup), Next.js 16 Cache Components Not Enabled, Caching and Revalidation Policy (Phase 8 reference), Filters/Scope URL State Mirror (src/lib/filters-url.ts), force-dynamic Public Auth-Adjacent Pages (+37 more)

### Community 7 - "package.json"
Cohesion: 0.04
Nodes (62): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, cmdk@^1.1.1, @duo-icons/react@^1.0.1, @hookform/resolvers@^5.9.2, lucide-react@^0.468.0, @neon/config@^1.9.3 (+54 more)

### Community 8 - "ai-settings-form.tsx"
Cohesion: 0.07
Nodes (34): class-variance-authority, @hookform/resolvers, react-hook-form, AiSettingsForm(), chooseProvider(), fetchModels(), patchFields(), payloadFrom() (+26 more)

### Community 10 - "sections.tsx"
Cohesion: 0.15
Nodes (26): Faq(), FAQ_ITEMS, Landing(), ERROR_COPY, LandingError(), LedgerFacts(), BrowserFrame(), MockupCaption() (+18 more)

### Community 11 - "lib/todos.ts"
Cohesion: 0.10
Nodes (36): POST, GET, runtime, DELETE, PATCH, runtime, DELETE, GET (+28 more)

### Community 14 - "personal-task-drawer.tsx"
Cohesion: 0.18
Nodes (18): DayDrawer(), DayLedgerProps, blankTask(), PersonalTaskDrawer(), TaskEditorLoader(), TaskEditorForm(), buildDraft(), save() (+10 more)

### Community 15 - "backup.ts"
Cohesion: 0.04
Nodes (66): assertSummary(), attemptLabel(), backfillLegacyQualifying(), BACKUP_FORMAT, BACKUP_FORMAT_VERSION, BACKUP_INSERT_CHUNK_SIZE, BACKUP_MAX_ATTEMPTS, BACKUP_MAX_BYTES (+58 more)

### Community 16 - "performance-overview.tsx"
Cohesion: 0.12
Nodes (40): EmptyChart(), AttemptBreakdown(), BreakdownDonut(), DeepDive(), GroupedScoreBars(), InsightCallout(), paperMax(), PerformanceOverview (+32 more)

### Community 17 - "proxy.ts"
Cohesion: 0.10
Nodes (33): Context, devHandle(), handle(), privateNoStore, runtime, GET(), accessLog(), AccessLogEvent (+25 more)

### Community 18 - "RequestError"
Cohesion: 0.04
Nodes (80): Baseline architecture, Call-site inventory (39 total), maxDuration, POST, runtime, DELETE, GET, PUT (+72 more)

### Community 19 - "theme-style-provider.tsx"
Cohesion: 0.11
Nodes (25): motion@^12.0.0, motion, AppearancePanel(), PaletteChip(), StyleGlyph(), Swap(), initialPalette(), initialStyle() (+17 more)

### Community 20 - "exam-settings.ts"
Cohesion: 0.04
Nodes (97): GET, runtime, customExamInputSchema, customSubjectSchema, customTierSchema, GET, runtime, preferencesSchema (+89 more)

### Community 21 - "useToast"
Cohesion: 0.10
Nodes (26): AiActivity, FEATURE_LABELS, relative(), STATUS_DOT, AskRoute(), AskView(), dynamic, SettingsPage() (+18 more)

### Community 22 - "ui-check.mjs"
Cohesion: 0.14
Nodes (13): args, evaluate(), height, pending, problems, report, send(), settle (+5 more)

### Community 23 - "queries/exams.ts"
Cohesion: 0.13
Nodes (13): CustomExamDto, CustomExamInput, CustomTierDto, CustomTierInput, deleteCustomExamRequest(), EffectiveTargetDto, examsKeys, examsQueryOptions (+5 more)

### Community 24 - "provider.ts"
Cohesion: 0.08
Nodes (53): aiAborted(), AiBillability, aiEndpointError(), AiError, AiErrorCode, aiInvalidOutput(), aiModelError(), aiOutputIncomplete() (+45 more)

### Community 25 - "Desktop Dashboard View ('Your preparation, in perspective.')"
Cohesion: 0.12
Nodes (25): Accuracy Footer Divisor Column (83.3% Accuracy), Marks Obtained (70/90) and Score Strip, Outcome Card Illustration (Reasoning), Outcome Counts with Proportion Bars (Correct / Incorrect / Unattempted), Percentile Availability Note ('No standalone subject percentile recorded'), Score-Centered Answer Distribution Ring (77.8% SCORE), Serif Subject Heading with Attempt/Question Subtitle, Soft-Rounded Warm Paper Card Surface (+17 more)

### Community 26 - "coach/route.ts"
Cohesion: 0.09
Nodes (53): bodySchema, maxDuration, POST(), runtime, COACH_FORMAT, maxDuration, POST(), runtime (+45 more)

### Community 27 - "app-shell.tsx"
Cohesion: 0.11
Nodes (33): ActiveExamFooterNote(), AppFrame(), AppHeader(), AppSidebar(), HeaderLocation(), NavItem(), ThemeToggle(), SidebarContent (+25 more)

### Community 28 - "audit.ts"
Cohesion: 0.14
Nodes (14): bearerToken(), GET, maxDuration, runtime, secretMatches(), dynamic, GET, HealthStatus (+6 more)

### Community 29 - "@tanstack/react-query"
Cohesion: 0.13
Nodes (27): @tanstack/react-query, CompareRoute(), HistoryRoute(), FindingsPanel(), points(), sentence(), TONE_ICON, TONE_TEXT (+19 more)

### Community 30 - "lib/analytics.ts"
Cohesion: 0.12
Nodes (32): totalsFor(), AiContext, average(), buildAiContext(), fullMockProfile(), payload(), recentFullMock(), sectionProfile() (+24 more)

### Community 31 - "exam-switcher.tsx"
Cohesion: 0.20
Nodes (22): BulkBar(), TrashRow(), AuthControl(), AuthControlProps, AuthError(), useAuthActions(), signIn(), ExamSwitcher() (+14 more)

### Community 32 - "schema.ts"
Cohesion: 0.08
Nodes (25): LANDING_PLAN, plan, buildLandingPlan(), category(), isMock(), LandingPlanData, LandingPlanDay, LandingPlanTask (+17 more)

### Community 33 - "rate-limit.ts"
Cohesion: 0.13
Nodes (22): apiRateLimiter, Bucket, clientIp(), BudgetState, decideRateLimit(), describeDecision(), L2_TIMEOUT_MS, L2Verdict (+14 more)

### Community 34 - "credentials.ts"
Cohesion: 0.31
Nodes (13): isAiThinking(), AiCredentialInput, AiCredentialSummary, encryptionKey(), getAiCredential(), saveAiCredential(), b64url(), CredentialCryptoError (+5 more)

### Community 35 - "lib/trash.ts"
Cohesion: 0.06
Nodes (62): zod, GET, idSchema, kindSchema, runtime, POST, runtime, POST (+54 more)

### Community 36 - "performance-metrics.ts"
Cohesion: 0.10
Nodes (24): ScoreBand(), Analytics, AnswerStack, PerformancePoint, Distribution, DISTRIBUTION_MIN_POINTS, DistributionBucket, distributionBuckets() (+16 more)

### Community 37 - "longDate"
Cohesion: 0.13
Nodes (23): periodTitle(), weekStart(), MyTasksView(), bulkRescheduleApply(), bulkStatus(), bulkTrashSelected(), clearSelection(), createTask() (+15 more)

### Community 38 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 39 - "exams-panel.tsx"
Cohesion: 0.10
Nodes (42): CustomExamDialog(), describeTier(), ExamRow(), ExamsPanel(), maxOf(), SourceSummary, StageSummary, SUBJECT_CHOICES (+34 more)

### Community 40 - "shot.mjs"
Cohesion: 0.17
Nodes (9): args, logs, outDir, pending, routes, target, waitMs, widths (+1 more)

### Community 41 - "app/layout.tsx"
Cohesion: 0.13
Nodes (14): @fontsource-variable/dm-sans@^5.3.0, @fontsource-variable/source-serif-4@^5.3.1, next-themes@^0.4.6, @vercel/analytics@^2.0.1, @vercel/speed-insights@^2.0.0, @fontsource-variable/dm-sans, @fontsource-variable/source-serif-4, next-themes (+6 more)

### Community 42 - "RouteSkeleton"
Cohesion: 0.25
Nodes (18): AddLoading(), AskLoading(), CalendarLoading(), CompareLoading(), DashboardLoading(), HistoryLoading(), MytasksLoading(), PerformanceLoading() (+10 more)

### Community 43 - "format.ts"
Cohesion: 0.13
Nodes (18): NumberField, ResultEditor(), fill(), DashboardClock(), istClock, istDateKey(), istDayKey, longDay (+10 more)

### Community 44 - "components.json"
Cohesion: 0.12
Nodes (15): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+7 more)

### Community 45 - "ci.yml"
Cohesion: 0.12
Nodes (15): jobs, validate, name, permissions, contents, run, uses, with (+7 more)

### Community 46 - "connection-input.ts"
Cohesion: 0.07
Nodes (54): AI_THINKING_LEVELS, AI_THINKING_VALUES, AiThinking, DEFAULT_AI_BASE_URL, Env, integerEnv(), normaliseBaseUrl(), readAiConfig() (+46 more)

### Community 47 - "RouteError"
Cohesion: 0.15
Nodes (14): AddError(), AskError(), CalendarError(), CompareError(), DashboardError(), HistoryError(), MyTasksError(), PerformanceError() (+6 more)

### Community 48 - "ai-chat-sheet.tsx"
Cohesion: 0.11
Nodes (31): LogMockPayload, LogMockTab(), QUICK_QUESTIONS, SubjectRoster(), ExtractionReview(), update(), updateSubject(), FieldIssues() (+23 more)

### Community 49 - "repository.ts"
Cohesion: 0.07
Nodes (61): POST, assignTierIds(), DELETE, POST, PUT, DELETE, idSchema, PUT (+53 more)

### Community 50 - "workspace-chrome.tsx"
Cohesion: 0.11
Nodes (26): Architecture, Colocation rule, Rate limiting, Redistribution of the shell's local state, Server prefetch contract, The layout keeps only what must survive navigation, dynamic, WorkspaceLayout() (+18 more)

### Community 51 - "Paper-and-Ink Design System"
Cohesion: 0.20
Nodes (8): Multi-Theme System (data-palette x data-style), Palettes x Styles Theme Matrix, Typography Scale (Source Serif 4 + DM Sans), Missing Radius System Finding, Elevation Model and --shadow-pop Token, Restrained Motion Language, Tokenized Radius Scale (panel/control/card/pill), Sticky Identity Column for Mock History

### Community 52 - "daynav-check.mjs"
Cohesion: 0.18
Nodes (9): args, evaluate(), height, pending, report, send(), target, width (+1 more)

### Community 53 - "fixtures.ts"
Cohesion: 0.14
Nodes (16): AttemptInput, buildAttempt(), FULL_ROWS, LANDING_ATTEMPTS, LANDING_FULL_MOCKS, LANDING_LATEST, LANDING_SCOPES, LANDING_TARGET (+8 more)

### Community 54 - "devDependencies"
Cohesion: 0.07
Nodes (27): devDependencies, eslint@^9.0.0, eslint-config-next@^16.0.0, prettier@^3.9.10, react-is@^19.3.1, tailwindcss@^4.0.0, @tailwindcss/postcss@^4.0.0, @tanstack/react-query-devtools@^5.105.0 (+19 more)

### Community 55 - "Neon PostgreSQL + Prisma 7 Stack"
Cohesion: 0.20
Nodes (10): Request and Ownership Architecture, Neon Agent Tooling Setup (Codex plugin + MCP), Expiring QA Branch Migration Rehearsal, Selected Neon Environment (org/project/branch), Private-Accounts Migration (claim two shared mocks), Session-Derived Ownership Model, Isolation and Ownership Verification, Google Sign-In via Neon Auth OAuth (+2 more)

### Community 56 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, check, db:generate, db:migrate, dev, lint, postinstall (+4 more)

### Community 57 - "mock-form.tsx"
Cohesion: 0.16
Nodes (26): DurationInput(), change(), formatParts(), blankSubject(), defaultTierId(), fullMockSectionHeading(), meritSubjectIds(), MockForm() (+18 more)

### Community 58 - "Dated personal todos and AI-assisted planning"
Cohesion: 0.20
Nodes (9): Confirmed requirements, Dated personal todos and AI-assisted planning, Existing foundation, Finalized navigation and lifecycle, Phase 1 — Design the dated planner and review flow, Phase 2 — Extend task storage and manual workflows, Phase 3 — Add AI proposal and confirmed-apply workflows, Phase 4 — Validate and document (+1 more)

### Community 59 - "cn"
Cohesion: 0.21
Nodes (18): PlanCategoryLegend(), AttemptPagination, windowedPages(), Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem(), PaginationNext() (+10 more)

### Community 60 - "Core Product Workflows"
Cohesion: 0.25
Nodes (5): Dashboard Analytical Scopes (full/subject/sectional/all), Backup Format v2 and Account Transfer, Semantic Chart Palette and Chart Rules, Core Product Workflows, JSON Backup Format Version 2

### Community 61 - "private-workspace.tsx"
Cohesion: 0.25
Nodes (10): GuardLedgerRow(), GuardNotice(), GuardNoticeProps, GuardRow, GuardStyles(), GuardTone, PrivateWorkspace(), PrivateWorkspaceProps (+2 more)

### Community 62 - "react"
Cohesion: 0.10
Nodes (25): lucide-react, react, metadata, metadata, AssistantBody(), ChatTranscript(), ChatTranscriptProps, EditButton() (+17 more)

### Community 63 - "targets-panel.tsx"
Cohesion: 0.15
Nodes (21): radix-ui, ActiveTargetCard(), DefaultRow(), describeSignature(), PercentileExplainer(), PercentileRow(), sourceLabel(), targetForSignature() (+13 more)

### Community 64 - "Raw Lucide Imports Migrated into Semantic Icon Map"
Cohesion: 0.40
Nodes (6): Known Limitations (duo-icons fill-rule, native inputs), Design System Source-of-Truth Map, Icon Inconsistency Finding (14 ad-hoc sizes), Icon Size Scale (14/16/18/22/28), Named Imports for Bundle Reduction, Raw Lucide Imports Migrated into Semantic Icon Map

### Community 68 - "UI Baseline Audit Findings (26 prioritized items)"
Cohesion: 0.50
Nodes (5): WorkspaceShell Client Orchestrator and Its Three Hooks, dashboard.tsx Monolith Split Finding, UI Baseline Audit Findings (26 prioritized items), 15-Phase Execution Order, Unified Segmented Control (.segment-group)

### Community 69 - "ssrf-core.ts"
Cohesion: 0.25
Nodes (11): RFC-1918, assertSafeBaseUrl(), assertSafeBaseUrlShape(), BLOCKED_HOSTNAMES, inV4Range(), ipv4Octets(), isBlockedAddress(), parseBaseUrl() (+3 more)

### Community 70 - "entry-rows.tsx"
Cohesion: 0.21
Nodes (21): DaySections(), AttemptEntryRow(), entryPlanRow(), PersonalEntryRow(), PlanEntryRow(), RevisionEntryRow(), SectionHead(), StatusDot() (+13 more)

### Community 71 - "reminders-panel.tsx"
Cohesion: 0.14
Nodes (19): pageEnter, Reveal(), RevealItem(), saveBarSpring, staggerContainer, staggerItem, switchBounce, tabSwap (+11 more)

### Community 72 - "task-toolbar.tsx"
Cohesion: 0.16
Nodes (24): AiPlanSheet(), filterCount(), MenuOption(), PRIORITY_LABELS, SORT_LABELS, STATUS_LABELS, TaskToolbar(), TrashDetailSheet() (+16 more)

### Community 73 - "use-ai-workspace.tsx"
Cohesion: 0.06
Nodes (50): AiWorkspace, AiWorkspaceContext, AiWorkspaceProvider(), INSIGHT_REQUEST_TEXT, insightToChatText(), newId(), trimChatHistory(), useAiWorkspaceState() (+42 more)

### Community 74 - "requireUser"
Cohesion: 0.11
Nodes (48): Task 7: RSC foundation, Tasks 8–19: Route migrations, GET, GET, runtime, GET, AskPage(), dynamic (+40 more)

### Community 75 - "period-nav.tsx"
Cohesion: 0.22
Nodes (4): PeriodNav(), UNIT, AGENDA_WINDOW, PopoverContent

### Community 89 - "api"
Cohesion: 0.09
Nodes (37): Client State Architecture Audit — 2026-10-31, Design decisions, Findings, Migration roadmap (executed order), Standing gaps (out of scope, recorded), remove(), EMPTY_TASKS, patchDayInPlan() (+29 more)

### Community 124 - "filters-url.ts"
Cohesion: 0.16
Nodes (18): FiltersState, useFiltersState(), ATTEMPT_SORT_KEYS, dashboardScopeSchema, DEFAULT_SCOPE, defaultListState, lenientDirSchema, lenientFiltersSchema (+10 more)

### Community 125 - "view-model.ts"
Cohesion: 0.13
Nodes (22): BoardView(), handleDrop(), columnFor(), COLUMNS, nextStatus(), PersonalTaskDisplayStatus, STATUS_META, StatusDot() (+14 more)

### Community 126 - "data-parts.tsx"
Cohesion: 0.22
Nodes (12): HeroArt(), DashboardScreen(), CHART, CHIP_TONES, ChipTone, MockLedger(), MockMetricStrip(), MockRadar() (+4 more)

### Community 127 - "Folder-Based Routing and Upstash Rate Limiting — Design"
Cohesion: 0.10
Nodes (15): Baseline and environment facts (measured in Task 0), Folder-Based Routing and Upstash Rate Limiting — Implementation Plan, Global Constraints, Rulings carried into this plan, Decisions, Folder-Based Routing and Upstash Rate Limiting — Design, Goals, Invariants that must not move (+7 more)

### Community 128 - "Review Focus"
Cohesion: 0.20
Nodes (10): Review Focus, Task 0: Toolchain and baseline, Task 1: Spec and plan documents, Task 20: Retire the shell, Task 21: Verification and documentation closeout, Task 2: Route, colocation and client-boundary guards, Task 3: Pure rate-limit policy, Task 4: Command budget and Upstash adapter (+2 more)

### Community 129 - "explain-search.ts"
Cohesion: 0.22
Nodes (6): @prisma/adapter-pg@^7.10.1, @prisma/adapter-pg, env, match, prisma, queries

### Community 130 - "showcase.tsx"
Cohesion: 0.50
Nodes (3): EASE, TabId, TABS

### Community 131 - "ws"
Cohesion: 0.25
Nodes (6): ws@^8.22.0, ws, logs, pending, target, ws

### Community 139 - "history-screen.tsx"
Cohesion: 0.16
Nodes (24): LANDING_SUMMARY, AiPanel(), CompareScreen(), delta(), duration(), accuracyTone(), MockChip(), MockStat() (+16 more)

### Community 140 - "next"
Cohesion: 0.08
Nodes (24): cspDev, cspProduction, nextConfig, productionHeaders, next, dynamic, LandingPage(), metadata (+16 more)

### Community 141 - "lib/search.ts"
Cohesion: 0.05
Nodes (78): @radix-ui/react-dialog@^1.3.1, @radix-ui/react-dialog, collectCursors(), GET, runtime, NAV_GROUPS, planHref(), CommandPalette() (+70 more)

### Community 142 - "domain.ts"
Cohesion: 0.05
Nodes (43): filterAttempts(), targetMarks(), targetPercentage(), attemptListSchema, duplicateKey(), MAIN_SUBJECT_IDS, Marking, optionalNumber (+35 more)

### Community 143 - "compare-view.tsx"
Cohesion: 0.15
Nodes (30): buildComparison(), buildSectionRows(), ChangeCell(), CompareReference, CompareView, Comparison, ComparisonLedger(), ComparisonRow (+22 more)

### Community 144 - "ref_node_crypto"
Cohesion: 0.21
Nodes (10): api(), full, ids, raw(), api(), cookies, created, input (+2 more)

### Community 145 - "verify-ownership.mjs"
Cohesion: 0.33
Nodes (6): api(), cookies, created, input, original, raw()

### Community 146 - "about-panel.tsx"
Cohesion: 0.31
Nodes (8): AboutPanel(), Avatar, AvatarFallback, AvatarImage, Badge(), BadgeProps, badgeVariants, CATALOG_VERSION

### Community 147 - "ref_node_assert"
Cohesion: 0.11
Nodes (10): packageDir, REPLACEMENTS, targets, root, allSourceFiles(), APP, privateFiles(), ROOT (+2 more)

### Community 148 - "rate-limit-upstash.ts"
Cohesion: 0.22
Nodes (16): BREAKER_OPEN_MS, BREAKER_THRESHOLD, BreakerState, initialBreaker(), isBreakerOpen(), onFailure(), onSuccess(), tickBreaker() (+8 more)

### Community 149 - "routes.test.ts"
Cohesion: 0.24
Nodes (10): AppHeaderProps, VIEW_META, AI_VIEWS, APP_VIEWS, AppView, PATH_VIEW, VIEW_HREF, VIEW_PATH (+2 more)

### Community 150 - "form.tsx"
Cohesion: 0.23
Nodes (10): FormControl, FormDescription, FormFieldContext, FormFieldContextValue, FormItem, FormItemContext, FormItemContextValue, FormLabel (+2 more)

### Community 151 - "google-sign-in-button.tsx"
Cohesion: 0.48
Nodes (4): GoogleGlyph(), GoogleSignInButton(), GoogleSignInButtonProps, Hero()

### Community 153 - "verify-backup-transfer.mjs"
Cohesion: 0.29
Nodes (8): api(), backup(), cookies, preview(), raw(), replace(), settings, user()

### Community 154 - "rate-limit-budget.ts"
Cohesion: 0.49
Nodes (8): budgetState, checkBudget(), initialBudget(), nextBudget(), noteCommand(), resetBudgetForTests(), spendCommand(), BUDGET_CAPS

### Community 155 - "resp-probe.mjs"
Cohesion: 0.20
Nodes (9): args, evaluate(), pending, send(), target, url, wait, widths (+1 more)

### Community 156 - "toast.tsx"
Cohesion: 0.29
Nodes (7): Toast, ToastApi, ToastCard(), ToastContext, ToastTone, ToastViewport(), TONE_STYLES

### Community 157 - "useIsMobile"
Cohesion: 0.70
Nodes (4): getServerSnapshot(), getSnapshot(), subscribe(), useIsMobile()

### Community 158 - "PlainIcon"
Cohesion: 0.12
Nodes (39): DayLedger(), EmptyActions(), LoadLine(), DayActions, DashboardPlanApi, PipelineProgressSection(), PipelineRevisionSection(), PipelineUpcomingSection() (+31 more)

### Community 160 - "queries/attempts.ts"
Cohesion: 0.27
Nodes (11): GET, AddMockView(), AddRoute(), AddRouteInner(), AddPage(), dynamic, safeWorkspaceReturnTo(), attemptDetailQueryOptions() (+3 more)

### Community 169 - "ai.test.ts"
Cohesion: 0.06
Nodes (50): MAX_TODO_PROMPT_CHARS, AiConfig, parseExtraction(), attachImages(), chatMessages(), coachMessages(), contextBlock(), extractionMessages() (+42 more)

## Ambiguous Edges - Review These
- `Stack Inventory (Next 16.4.3, React 19.2, TS 5.9, Tailwind 4, Recharts 3, motion 12)` → `Private Accounts Release Notes`  [AMBIGUOUS]
  docs/ui-overhaul/phase-1-audit.md · relation: conceptually_related_to

## Knowledge Gaps
- **36 isolated node(s):** `RFC-1918`, `Analytics Projections Cache Policy (/api/analytics)`, `force-dynamic Public Auth-Adjacent Pages`, `Health Endpoint Rate-Limit-Exempt (/api/health)`, `Firebase/Mongo Runtime Dependencies Removed` (+31 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1080 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **67 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `icon.tsx`, `my-tasks-view.tsx`, `calendar-view.tsx`, `showcase.tsx`, `package.json`, `ai-settings-form.tsx`, `sections.tsx`, `history-screen.tsx`, `next`, `lib/search.ts`, `personal-task-drawer.tsx`, `compare-view.tsx`, `backup.ts`, `performance-overview.tsx`, `about-panel.tsx`, `theme-style-provider.tsx`, `useToast`, `form.tsx`, `google-sign-in-button.tsx`, `app-shell.tsx`, `toast.tsx`, `@tanstack/react-query`, `PlainIcon`, `exam-switcher.tsx`, `queries/attempts.ts`, `useIsMobile`, `lib/trash.ts`, `longDate`, `exams-panel.tsx`, `app/layout.tsx`, `format.ts`, `RouteError`, `ai-chat-sheet.tsx`, `workspace-chrome.tsx`, `mock-form.tsx`, `cn`, `private-workspace.tsx`, `targets-panel.tsx`, `entry-rows.tsx`, `reminders-panel.tsx`, `task-toolbar.tsx`, `use-ai-workspace.tsx`, `period-nav.tsx`, `api`, `filters-url.ts`, `view-model.ts`, `data-parts.tsx`, `Folder-Based Routing and Upstash Rate Limiting — Design`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **What connects `RFC-1918`, `Analytics Projections Cache Policy (/api/analytics)`, `force-dynamic Public Auth-Adjacent Pages` to the rest of the system?**
  _36 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `icon.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09795918367346938 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `cn` to `icon.tsx`, `my-tasks-view.tsx`, `calendar-view.tsx`, `ai-settings-form.tsx`, `sections.tsx`, `history-screen.tsx`, `lib/search.ts`, `personal-task-drawer.tsx`, `compare-view.tsx`, `performance-overview.tsx`, `about-panel.tsx`, `theme-style-provider.tsx`, `useToast`, `form.tsx`, `app-shell.tsx`, `@tanstack/react-query`, `PlainIcon`, `exam-switcher.tsx`, `lib/trash.ts`, `performance-metrics.ts`, `longDate`, `exams-panel.tsx`, `RouteSkeleton`, `ai-chat-sheet.tsx`, `react`, `targets-panel.tsx`, `entry-rows.tsx`, `reminders-panel.tsx`, `task-toolbar.tsx`, `period-nav.tsx`, `view-model.ts`, `data-parts.tsx`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Should `my-tasks-view.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0449603291213635 - nodes in this community are weakly interconnected._
- **Why does `next` connect `next` to `icon.tsx`, `calendar-view.tsx`, `package.json`, `lib/search.ts`, `performance-overview.tsx`, `proxy.ts`, `RequestError`, `useToast`, `app-shell.tsx`, `@tanstack/react-query`, `PlainIcon`, `queries/attempts.ts`, `lib/trash.ts`, `app/layout.tsx`, `RouteError`, `ai-chat-sheet.tsx`, `workspace-chrome.tsx`, `private-workspace.tsx`, `react`, `requireUser`, `filters-url.ts`, `Folder-Based Routing and Upstash Rate Limiting — Design`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Stack Inventory (Next 16.4.3, React 19.2, TS 5.9, Tailwind 4, Recharts 3, motion 12)` and `Private Accounts Release Notes`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._