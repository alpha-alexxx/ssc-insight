# Graph Report - ssc-insight-2  (2026-11-20)

## Corpus Check
- 458 files · ~325,673 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 4, .css 2, .example 1)

## Summary
- 3430 nodes · 10699 edges · 159 communities (93 shown, 66 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 141 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `307c0713`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- dashboard-view.tsx
- my-tasks-view.tsx
- view-model.ts
- ssrf-core.ts
- command-palette.tsx
- domain.ts
- Primary Architecture Handbook
- subject-performance.test.ts
- ai-settings-form.tsx
- exam-settings.ts
- calendar-view.tsx
- app-shell.tsx
- package.json
- LruCache
- personal-task-drawer.tsx
- Setup and Operations Handbook
- ai-composer.tsx
- lib/trash.ts
- RequestError
- Mock Entry Form and Validation
- Paper Design System Handbook
- require-user.ts
- trash-view.tsx
- queries/exams.ts
- provider.ts
- score-forecast.ts
- api.ts
- Request Proxy and Public Origins
- database
- queries/attempts.ts
- Study Plan Progress APIs
- ai-prompt-security.test.ts
- plan-day-view.tsx
- rate-limit.ts
- credentials.ts
- Score Observatory verification
- performance-metrics.ts
- personal-todos.tsx
- compare-view.tsx
- exams-panel.tsx
- Button
- app/layout.tsx
- RouteSkeleton
- format.ts
- api
- requireUser
- connection-input.ts
- RouteError
- extraction.ts
- loadExamContext
- workspace-chrome.tsx
- Continuous Integration Validation Workflow
- cn
- fixtures.ts
- devDependencies
- sections.tsx
- theme-style-provider.tsx
- mock-form.tsx
- trash-view.tsx
- trash-view.tsx
- client-types.ts
- private-workspace.tsx
- calendar-view.tsx
- react
- shot.mjs
- Caching and Revalidation Policy
- ssrf-core.ts
- PlainIcon
- context.ts
- ai-chat-sheet.tsx
- client-types.ts
- requireUser
- utils.ts
- verify-backup-transfer.mjs
- api
- next.config.ts
- Todo API Review and Ownership
- filters-url.ts
- task-row.tsx
- data-parts.tsx
- Folder-Based Routing and Upstash Rate Limiting — Design
- Review Focus
- explain-search.ts
- showcase.tsx
- ws
- Primary Architecture Handbook
- PostCSS Build Configuration
- Personal Workspace Migration Requirements
- Authenticated QA and Google Consent
- Controlled Neon Prisma Migrations
- Personal Calendar Counts and Invalidation
- Add Mock Route
- use-plan-data.ts
- Mock Comparison Route
- exam.ts
- domain.ts
- verify-trash.mjs
- verify-ownership.mjs
- about-panel.tsx
- ref_node_assert
- Folder-Based Routing and Upstash Rate Limiting — Implementation Plan
- verify-neon.mjs
- analytics/route.ts
- google-sign-in-button.tsx
- prisma
- Paper Tokens and Design Handover
- Button
- next
- vercel.json
- ai-prompt-security.test.ts

## God Nodes (most connected - your core abstractions)
1. `cn()` - 264 edges
2. `PlainIcon()` - 135 edges
3. `Button()` - 123 edges
4. `react` - 116 edges
5. `SSC Insight Architecture` - 104 edges
6. `SSC Insight Architecture` - 104 edges
7. `shortDate()` - 83 edges
8. `database()` - 74 edges
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

## Communities (159 total, 66 thin omitted)

### Community 0 - "dashboard-view.tsx"
Cohesion: 0.11
Nodes (33): Loading, error and not-found surfaces, CalendarLoading(), DashboardPlanApi, PersonalTasksPanel(), PipelineRevisionSection(), PipelineUpcomingSection(), PlanApi, PlanWithToday (+25 more)

### Community 1 - "my-tasks-view.tsx"
Cohesion: 0.04
Nodes (65): lucide-react, ApplyOp, ConfirmState, MyTasksView(), bulkRescheduleApply(), bulkStatus(), bulkTrashSelected(), clearSelection() (+57 more)

### Community 2 - "view-model.ts"
Cohesion: 0.06
Nodes (63): AgendaGroups(), AgendaView(), EarlierRanges(), CalendarMetrics(), CalendarSurface(), categoryLabel(), QuietDays(), CellRow() (+55 more)

### Community 4 - "command-palette.tsx"
Cohesion: 0.06
Nodes (45): AI Status Endpoint Cache Policy (/api/ai/status), Analytics Projections Cache Policy (/api/analytics), api() Client Fetch cache: no-store (src/lib/api-client.ts), Backup Export Raw File Exception (GET /api/backup), Next.js 16 Cache Components Not Enabled, Caching and Revalidation Policy (Phase 8 reference), Filters/Scope URL State Mirror (src/lib/filters-url.ts), force-dynamic Public Auth-Adjacent Pages (+37 more)

### Community 7 - "subject-performance.test.ts"
Cohesion: 0.05
Nodes (55): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, cmdk@^1.1.1, @duo-icons/react@^1.0.1, @hookform/resolvers@^5.9.2, lucide-react@^0.468.0, motion@^12.0.0 (+47 more)

### Community 8 - "ai-settings-form.tsx"
Cohesion: 0.06
Nodes (44): @radix-ui/react-label@^2.1.17, @hookform/resolvers, @radix-ui/react-label, react-hook-form, AiSettingsForm(), chooseProvider(), fetchModels(), patchFields() (+36 more)

### Community 10 - "calendar-view.tsx"
Cohesion: 0.14
Nodes (26): dynamic, LandingPage(), metadata, Faq(), FAQ_ITEMS, Landing(), ERROR_COPY, LandingError() (+18 more)

### Community 11 - "app-shell.tsx"
Cohesion: 0.10
Nodes (35): GET, runtime, DELETE, PATCH, runtime, DELETE, GET, POST (+27 more)

### Community 14 - "personal-task-drawer.tsx"
Cohesion: 0.20
Nodes (17): DayDrawer(), blankTask(), PersonalTaskDrawer(), TaskEditorLoader(), TaskEditorForm(), buildDraft(), save(), Drawer() (+9 more)

### Community 15 - "Setup and Operations Handbook"
Cohesion: 0.03
Nodes (99): GET, maxDuration, runtime, privateHeaders, attemptInclude, mapSubjects(), StoredAnalyticsAttempt, StoredAttempt (+91 more)

### Community 16 - "ai-composer.tsx"
Cohesion: 0.11
Nodes (41): EmptyChart(), AttemptBreakdown(), BreakdownDonut(), DeepDive(), GroupedScoreBars(), InsightCallout(), paperMax(), PerformanceOverview (+33 more)

### Community 17 - "lib/trash.ts"
Cohesion: 0.14
Nodes (24): GET(), accessLog(), AccessLogEvent, bypassesMaintenance(), classifyPath(), EnvLike, isCronPath(), maintenanceActive() (+16 more)

### Community 18 - "RequestError"
Cohesion: 0.06
Nodes (67): Baseline architecture, Call-site inventory (39 total), Rate limiting, zod, maxDuration, POST, runtime, DELETE (+59 more)

### Community 19 - "Mock Entry Form and Validation"
Cohesion: 0.11
Nodes (24): AppearancePanel(), PaletteChip(), StyleGlyph(), Swap(), initialPalette(), initialStyle(), microMotion(), PALETTE_IDS (+16 more)

### Community 20 - "Paper Design System Handbook"
Cohesion: 0.05
Nodes (93): GET, GET, PATCH, preferencesSchema, runtime, scopePayload(), settingsSchema, targetEditSchema (+85 more)

### Community 21 - "require-user.ts"
Cohesion: 0.16
Nodes (15): Context, devHandle(), handle(), privateNoStore, runtime, dynamic, devAuthBypassActive(), devBypassUser() (+7 more)

### Community 22 - "trash-view.tsx"
Cohesion: 0.14
Nodes (13): args, evaluate(), height, pending, problems, report, send(), settle (+5 more)

### Community 23 - "queries/exams.ts"
Cohesion: 0.13
Nodes (20): ExamScope, ExamScopeContext, ExamScopeProvider(), tierLabelFallback(), activeExamPattern(), CustomExamDto, CustomExamInput, CustomTierDto (+12 more)

### Community 24 - "provider.ts"
Cohesion: 0.09
Nodes (47): aiAborted(), AiBillability, aiBusy(), aiEndpointError(), AiError, AiErrorCode, aiInvalidOutput(), aiModelError() (+39 more)

### Community 25 - "score-forecast.ts"
Cohesion: 0.12
Nodes (25): Accuracy Footer Divisor Column (83.3% Accuracy), Marks Obtained (70/90) and Score Strip, Outcome Card Illustration (Reasoning), Outcome Counts with Proportion Bars (Correct / Incorrect / Unattempted), Percentile Availability Note ('No standalone subject percentile recorded'), Score-Centered Answer Distribution Ring (77.8% SCORE), Serif Subject Heading with Attempt/Question Subtitle, Soft-Rounded Warm Paper Card Surface (+17 more)

### Community 26 - "api.ts"
Cohesion: 0.10
Nodes (52): bodySchema, maxDuration, POST(), runtime, COACH_FORMAT, maxDuration, POST(), runtime (+44 more)

### Community 27 - "Request Proxy and Public Origins"
Cohesion: 0.11
Nodes (41): PlanCategoryLegend(), ActiveExamFooterNote(), AppFrame(), AppHeader(), AppSidebar(), HeaderLocation(), NavItem(), RadioGroup (+33 more)

### Community 28 - "database"
Cohesion: 0.08
Nodes (36): dynamic, GET, HealthStatus, runtime, mutationSchema, POST, runtime, GET (+28 more)

### Community 29 - "queries/attempts.ts"
Cohesion: 0.14
Nodes (25): CompareRoute(), HistoryRoute(), PerformanceRoute(), platformsOf(), DateRangeFilter(), useExamScope(), PageHeader(), ScopeFilters() (+17 more)

### Community 30 - "Study Plan Progress APIs"
Cohesion: 0.08
Nodes (36): buildComparison(), buildSectionRows(), analyze(), average(), buildWhereYouStand(), comparePoints(), deepDiveFor(), DeepDiveSubject (+28 more)

### Community 31 - "ai-prompt-security.test.ts"
Cohesion: 0.34
Nodes (16): BulkBar(), MenuOption(), TaskToolbar(), TrashRow(), AuthControl(), AuthControlProps, AuthError(), ExamSwitcher() (+8 more)

### Community 32 - "plan-day-view.tsx"
Cohesion: 0.08
Nodes (25): LANDING_PLAN, plan, buildLandingPlan(), category(), isMock(), LandingPlanData, LandingPlanDay, LandingPlanTask (+17 more)

### Community 33 - "rate-limit.ts"
Cohesion: 0.07
Nodes (45): apiRateLimiter, BREAKER_OPEN_MS, BREAKER_THRESHOLD, BreakerState, initialBreaker(), isBreakerOpen(), onFailure(), onSuccess() (+37 more)

### Community 34 - "credentials.ts"
Cohesion: 0.32
Nodes (12): AiCredentialInput, AiCredentialSummary, encryptionKey(), getAiCredential(), saveAiCredential(), b64url(), CredentialCryptoError, credentialKey() (+4 more)

### Community 35 - "Score Observatory verification"
Cohesion: 0.07
Nodes (51): GET, idSchema, kindSchema, runtime, POST, runtime, GET, runtime (+43 more)

### Community 36 - "performance-metrics.ts"
Cohesion: 0.09
Nodes (31): FindingsPanel(), points(), sentence(), TONE_ICON, TONE_TEXT, PerformanceView(), ScoreBand(), Analytics (+23 more)

### Community 37 - "personal-todos.tsx"
Cohesion: 0.11
Nodes (24): dynamic, PlanPage(), TaskSuggestionCard(), PersonalCalendar(), personalMonthRange(), categoryMeta(), Group, GroupRow() (+16 more)

### Community 38 - "compare-view.tsx"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 39 - "exams-panel.tsx"
Cohesion: 0.07
Nodes (60): motion, SettingsPage(), CustomExamDialog(), describeTier(), ExamRow(), ExamsPanel(), maxOf(), SourceSummary (+52 more)

### Community 40 - "Button"
Cohesion: 0.17
Nodes (9): args, logs, outDir, pending, routes, target, waitMs, widths (+1 more)

### Community 41 - "app/layout.tsx"
Cohesion: 0.09
Nodes (19): Problem, @fontsource-variable/dm-sans@^5.3.0, @fontsource-variable/source-serif-4@^5.3.1, next-themes@^0.4.6, @vercel/analytics@^2.0.1, @vercel/speed-insights@^2.0.0, @fontsource-variable/dm-sans, @fontsource-variable/source-serif-4 (+11 more)

### Community 42 - "RouteSkeleton"
Cohesion: 0.27
Nodes (17): AddLoading(), CalendarLoading(), CompareLoading(), DashboardLoading(), HistoryLoading(), MytasksLoading(), PerformanceLoading(), PlanDayLoading() (+9 more)

### Community 43 - "format.ts"
Cohesion: 0.23
Nodes (13): NumberField, ResultEditor(), fill(), totalsFor(), Attempt, totals(), fillFromAttempt(), isLoggableType() (+5 more)

### Community 44 - "api"
Cohesion: 0.12
Nodes (15): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+7 more)

### Community 45 - "requireUser"
Cohesion: 0.12
Nodes (15): jobs, validate, name, permissions, contents, run, uses, with (+7 more)

### Community 46 - "connection-input.ts"
Cohesion: 0.08
Nodes (50): AiConfig, DEFAULT_AI_BASE_URL, Env, integerEnv(), normaliseBaseUrl(), readAiConfig(), AiConnectionInput, aiConnectionSchema (+42 more)

### Community 47 - "RouteError"
Cohesion: 0.16
Nodes (13): AddError(), CalendarError(), CompareError(), DashboardError(), HistoryError(), MyTasksError(), PerformanceError(), PlanDayError() (+5 more)

### Community 48 - "extraction.ts"
Cohesion: 0.12
Nodes (27): SubjectRoster(), ExtractionReview(), update(), updateSubject(), FieldIssues(), NullableDuration(), optionalNumber(), blankExtractedSubject() (+19 more)

### Community 49 - "loadExamContext"
Cohesion: 0.17
Nodes (24): PUT, GET, POST, runtime, ComparePage(), dynamic, dynamic, HistoryPage() (+16 more)

### Community 50 - "workspace-chrome.tsx"
Cohesion: 0.10
Nodes (30): The layout keeps only what must survive navigation, dynamic, WorkspaceLayout(), AppHeaderProps, VIEW_META, QueryProvider(), ScopeGate(), Toast (+22 more)

### Community 51 - "Continuous Integration Validation Workflow"
Cohesion: 0.20
Nodes (8): Multi-Theme System (data-palette x data-style), Palettes x Styles Theme Matrix, Typography Scale (Source Serif 4 + DM Sans), Missing Radius System Finding, Elevation Model and --shadow-pop Token, Restrained Motion Language, Tokenized Radius Scale (panel/control/card/pill), Sticky Identity Column for Mock History

### Community 52 - "cn"
Cohesion: 0.18
Nodes (9): args, evaluate(), height, pending, report, send(), target, width (+1 more)

### Community 53 - "fixtures.ts"
Cohesion: 0.14
Nodes (17): AttemptInput, buildAttempt(), FULL_ROWS, LANDING_ATTEMPTS, LANDING_FULL_MOCKS, LANDING_LATEST, LANDING_SCOPES, LANDING_SUMMARY (+9 more)

### Community 54 - "devDependencies"
Cohesion: 0.07
Nodes (28): devDependencies, eslint@^9.0.0, eslint-config-next@^16.0.0, prettier@^3.9.10, tailwindcss@^4.0.0, @tailwindcss/postcss@^4.0.0, @tanstack/react-query-devtools@^5.105.0, tsx@^4.20.0 (+20 more)

### Community 55 - "sections.tsx"
Cohesion: 0.20
Nodes (10): Request and Ownership Architecture, Neon Agent Tooling Setup (Codex plugin + MCP), Expiring QA Branch Migration Rehearsal, Selected Neon Environment (org/project/branch), Private-Accounts Migration (claim two shared mocks), Session-Derived Ownership Model, Isolation and Ownership Verification, Google Sign-In via Neon Auth OAuth (+2 more)

### Community 56 - "theme-style-provider.tsx"
Cohesion: 0.17
Nodes (12): scripts, build, check, db:generate, db:migrate, dev, lint, postinstall (+4 more)

### Community 57 - "mock-form.tsx"
Cohesion: 0.14
Nodes (29): DurationInput(), change(), formatParts(), blankSubject(), defaultTierId(), fullMockSectionHeading(), meritSubjectIds(), MockForm() (+21 more)

### Community 58 - "trash-view.tsx"
Cohesion: 0.20
Nodes (9): Confirmed requirements, Dated personal todos and AI-assisted planning, Existing foundation, Finalized navigation and lifecycle, Phase 1 — Design the dated planner and review flow, Phase 2 — Extend task storage and manual workflows, Phase 3 — Add AI proposal and confirmed-apply workflows, Phase 4 — Validate and document (+1 more)

### Community 59 - "trash-view.tsx"
Cohesion: 0.13
Nodes (33): dynamic, TrashPage(), KindFilter, messageOf(), rowKey(), toItemRef(), TrashView(), ungroupedCount() (+25 more)

### Community 60 - "client-types.ts"
Cohesion: 0.25
Nodes (5): Dashboard Analytical Scopes (full/subject/sectional/all), Backup Format v2 and Account Transfer, Semantic Chart Palette and Chart Rules, Core Product Workflows, JSON Backup Format Version 2

### Community 61 - "private-workspace.tsx"
Cohesion: 0.19
Nodes (12): GuardLedgerRow(), GuardNotice(), GuardNoticeProps, GuardRow, GuardStyles(), GuardTone, PrivateWorkspace(), PrivateWorkspaceProps (+4 more)

### Community 62 - "calendar-view.tsx"
Cohesion: 0.14
Nodes (25): Migration roadmap (executed order), CalendarLegend(), stepSize(), CalendarView(), currentPath(), MemoMonthGrid, MemoWeekView, monthMeta() (+17 more)

### Community 63 - "react"
Cohesion: 0.16
Nodes (22): radix-ui, react, ActiveTargetCard(), DefaultRow(), describeSignature(), PercentileExplainer(), PercentileRow(), sourceLabel() (+14 more)

### Community 64 - "shot.mjs"
Cohesion: 0.40
Nodes (6): Known Limitations (duo-icons fill-rule, native inputs), Design System Source-of-Truth Map, Icon Inconsistency Finding (14 ad-hoc sizes), Icon Size Scale (14/16/18/22/28), Named Imports for Bundle Reduction, Raw Lucide Imports Migrated into Semantic Icon Map

### Community 68 - "Caching and Revalidation Policy"
Cohesion: 0.50
Nodes (5): WorkspaceShell Client Orchestrator and Its Three Hooks, dashboard.tsx Monolith Split Finding, UI Baseline Audit Findings (26 prioritized items), 15-Phase Execution Order, Unified Segmented Control (.segment-group)

### Community 69 - "ssrf-core.ts"
Cohesion: 0.18
Nodes (16): RFC-1918, maxDuration, POST, runtime, resolveDraftConnection(), AiConfigSource, assertSafeBaseUrl(), assertSafeBaseUrlShape() (+8 more)

### Community 70 - "PlainIcon"
Cohesion: 0.13
Nodes (33): DayActions, DaySections(), AttemptEntryRow(), entryPlanRow(), PersonalEntryRow(), PlanEntryRow(), RevisionEntryRow(), SectionHead() (+25 more)

### Community 71 - "context.ts"
Cohesion: 0.19
Nodes (14): AiContext, average(), buildAiContext(), fullMockProfile(), payload(), recentFullMock(), sectionProfile(), subjectProfile() (+6 more)

### Community 72 - "ai-chat-sheet.tsx"
Cohesion: 0.11
Nodes (31): AiPlanSheet(), TrashDetailSheet(), AiChatSheet(), AiSheetTaskApi, ChatHistoryPanel(), CoachChatTab(), CoachMemo(), CoachMemos() (+23 more)

### Community 73 - "client-types.ts"
Cohesion: 0.05
Nodes (55): api(), backup(), cookies, preview(), raw(), replace(), settings, AiWorkspace (+47 more)

### Community 74 - "requireUser"
Cohesion: 0.17
Nodes (31): Task 7: RSC foundation, Tasks 8–19: Route migrations, @tanstack/react-query, GET, CalendarPage(), dynamic, DashboardPage(), dynamic (+23 more)

### Community 75 - "utils.ts"
Cohesion: 0.11
Nodes (21): CalendarToolbar(), LayerToggles(), PeriodNav(), UNIT, AGENDA_WINDOW, CALENDAR_MODES, CalendarMode, LAYER_META (+13 more)

### Community 89 - "api"
Cohesion: 0.13
Nodes (22): Client State Architecture Audit — 2026-10-31, Design decisions, Findings, Standing gaps (out of scope, recorded), apply(), useTodoCalendar(), api(), ApiError (+14 more)

### Community 124 - "filters-url.ts"
Cohesion: 0.15
Nodes (15): ATTEMPT_SORT_KEYS, dashboardScopeSchema, filtersSchema, DEFAULT_SCOPE, defaultListState, lenientDirSchema, lenientFiltersSchema, lenientPageSchema (+7 more)

### Community 125 - "task-row.tsx"
Cohesion: 0.30
Nodes (13): BoardView(), handleDrop(), columnFor(), COLUMNS, nextStatus(), PersonalTaskDisplayStatus, STATUS_META, StatusDot() (+5 more)

### Community 126 - "data-parts.tsx"
Cohesion: 0.28
Nodes (11): DashboardScreen(), CHART, CHIP_TONES, ChipTone, MockLedger(), MockMetricStrip(), MockRadar(), MockRing() (+3 more)

### Community 127 - "Folder-Based Routing and Upstash Rate Limiting — Design"
Cohesion: 0.18
Nodes (10): Architecture, Colocation rule, Decisions, Folder-Based Routing and Upstash Rate Limiting — Design, Goals, Invariants that must not move, Non-goals, Redistribution of the shell's local state (+2 more)

### Community 128 - "Review Focus"
Cohesion: 0.20
Nodes (10): Review Focus, Task 0: Toolchain and baseline, Task 1: Spec and plan documents, Task 20: Retire the shell, Task 21: Verification and documentation closeout, Task 2: Route, colocation and client-boundary guards, Task 3: Pure rate-limit policy, Task 4: Command budget and Upstash adapter (+2 more)

### Community 129 - "explain-search.ts"
Cohesion: 0.22
Nodes (6): @prisma/adapter-pg@^7.10.1, @prisma/adapter-pg, env, match, prisma, queries

### Community 130 - "showcase.tsx"
Cohesion: 0.36
Nodes (6): BrowserFrame(), MockupCaption(), EASE, Showcase(), TabId, TABS

### Community 131 - "ws"
Cohesion: 0.25
Nodes (6): ws@^8.22.0, ws, logs, pending, target, ws

### Community 139 - "Add Mock Route"
Cohesion: 0.16
Nodes (23): CompareScreen(), delta(), duration(), accuracyTone(), MockChip(), MockStat(), DayWorkspaceScreen(), formatDuration() (+15 more)

### Community 140 - "use-plan-data.ts"
Cohesion: 0.12
Nodes (25): CalendarRoute(), DashboardRoute(), NO_FILTERS, MyTasksRoute(), PlanDayRoute(), PlanWeekRoute(), useAllAttempts(), useAiWorkspace() (+17 more)

### Community 141 - "Mock Comparison Route"
Cohesion: 0.05
Nodes (78): @radix-ui/react-dialog@^1.3.1, @radix-ui/react-dialog, collectCursors(), GET, runtime, NAV_GROUPS, planHref(), CommandPalette() (+70 more)

### Community 142 - "exam.ts"
Cohesion: 0.14
Nodes (11): Marking, AttemptSeed, MARKING, T1, attemptSchema, computer, english, ga (+3 more)

### Community 143 - "domain.ts"
Cohesion: 0.10
Nodes (39): ChangeCell(), CompareReference, CompareView, Comparison, ComparisonLedger(), ComparisonRow, ErrorState(), PickerRow() (+31 more)

### Community 144 - "verify-trash.mjs"
Cohesion: 0.43
Nodes (6): api(), cookies, created, input, raw(), visible()

### Community 145 - "verify-ownership.mjs"
Cohesion: 0.33
Nodes (6): api(), cookies, created, input, original, raw()

### Community 146 - "about-panel.tsx"
Cohesion: 0.31
Nodes (8): AboutPanel(), Avatar, AvatarFallback, AvatarImage, Badge(), BadgeProps, badgeVariants, CATALOG_VERSION

### Community 147 - "ref_node_assert"
Cohesion: 0.07
Nodes (22): packageDir, REPLACEMENTS, targets, maxDuration, runtime, MAX_TODO_PROMPT_CHARS, parseTodoProposals(), Target (+14 more)

### Community 148 - "Folder-Based Routing and Upstash Rate Limiting — Implementation Plan"
Cohesion: 0.40
Nodes (4): Baseline and environment facts (measured in Task 0), Folder-Based Routing and Upstash Rate Limiting — Implementation Plan, Global Constraints, Rulings carried into this plan

### Community 149 - "verify-neon.mjs"
Cohesion: 0.50
Nodes (4): api(), full, ids, raw()

### Community 150 - "analytics/route.ts"
Cohesion: 0.60
Nodes (4): GET, runtime, filtersFrom(), parseScope()

### Community 151 - "google-sign-in-button.tsx"
Cohesion: 0.21
Nodes (9): useAuthActions(), signIn(), GoogleGlyph(), GoogleSignInButton(), signIn(), GoogleSignInButtonProps, HeroArt(), Hero() (+1 more)

### Community 155 - "Paper Tokens and Design Handover"
Cohesion: 0.20
Nodes (9): args, evaluate(), pending, send(), target, url, wait, widths (+1 more)

### Community 158 - "Button"
Cohesion: 0.11
Nodes (38): DayLedger(), DayLedgerProps, EmptyActions(), LoadLine(), PipelineProgressSection(), PlanRail(), DayNotes(), FlowSection() (+30 more)

### Community 160 - "next"
Cohesion: 0.09
Nodes (19): cspDev, cspProduction, nextConfig, productionHeaders, next, GET, metadata, metadata (+11 more)

### Community 169 - "ai-prompt-security.test.ts"
Cohesion: 0.08
Nodes (43): MAX_EXTRACT_CHARS, chatMessages(), coachMessages(), contextBlock(), extractionMessages(), FALLBACK_SHAPE, marksFor(), paperLabel() (+35 more)

## Ambiguous Edges - Review These
- `Stack Inventory (Next 16.4.3, React 19.2, TS 5.9, Tailwind 4, Recharts 3, motion 12)` → `Private Accounts Release Notes`  [AMBIGUOUS]
  docs/ui-overhaul/phase-1-audit.md · relation: conceptually_related_to

## Knowledge Gaps
- **36 isolated node(s):** `RFC-1918`, `Analytics Projections Cache Policy (/api/analytics)`, `force-dynamic Public Auth-Adjacent Pages`, `Health Endpoint Rate-Limit-Exempt (/api/health)`, `Firebase/Mongo Runtime Dependencies Removed` (+31 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1063 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **66 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Request Proxy and Public Origins` to `dashboard-view.tsx`, `my-tasks-view.tsx`, `view-model.ts`, `showcase.tsx`, `ai-settings-form.tsx`, `calendar-view.tsx`, `Add Mock Route`, `Mock Comparison Route`, `personal-task-drawer.tsx`, `domain.ts`, `ai-composer.tsx`, `about-panel.tsx`, `Mock Entry Form and Validation`, `queries/attempts.ts`, `Button`, `ai-prompt-security.test.ts`, `performance-metrics.ts`, `personal-todos.tsx`, `exams-panel.tsx`, `RouteSkeleton`, `extraction.ts`, `trash-view.tsx`, `calendar-view.tsx`, `react`, `PlainIcon`, `ai-chat-sheet.tsx`, `utils.ts`, `task-row.tsx`, `data-parts.tsx`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **What connects `RFC-1918`, `Analytics Projections Cache Policy (/api/analytics)`, `force-dynamic Public Auth-Adjacent Pages` to the rest of the system?**
  _36 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dashboard-view.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1072463768115942 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `dashboard-view.tsx`, `my-tasks-view.tsx`, `view-model.ts`, `showcase.tsx`, `subject-performance.test.ts`, `ai-settings-form.tsx`, `calendar-view.tsx`, `Add Mock Route`, `use-plan-data.ts`, `Mock Comparison Route`, `personal-task-drawer.tsx`, `domain.ts`, `ai-composer.tsx`, `about-panel.tsx`, `Mock Entry Form and Validation`, `queries/exams.ts`, `google-sign-in-button.tsx`, `Request Proxy and Public Origins`, `queries/attempts.ts`, `Button`, `ai-prompt-security.test.ts`, `next`, `performance-metrics.ts`, `personal-todos.tsx`, `exams-panel.tsx`, `app/layout.tsx`, `format.ts`, `RouteError`, `extraction.ts`, `workspace-chrome.tsx`, `fixtures.ts`, `mock-form.tsx`, `trash-view.tsx`, `private-workspace.tsx`, `calendar-view.tsx`, `PlainIcon`, `ai-chat-sheet.tsx`, `client-types.ts`, `requireUser`, `utils.ts`, `api`, `task-row.tsx`, `data-parts.tsx`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Should `my-tasks-view.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0438871473354232 - nodes in this community are weakly interconnected._
- **Why does `zod` connect `RequestError` to `plan-day-view.tsx`, `Score Observatory verification`, `subject-performance.test.ts`, `ai-settings-form.tsx`, `ai-prompt-security.test.ts`, `app-shell.tsx`, `Mock Comparison Route`, `connection-input.ts`, `Setup and Operations Handbook`, `extraction.ts`, `domain.ts`, `filters-url.ts`, `ref_node_assert`, `Paper Design System Handbook`, `api.ts`, `database`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Stack Inventory (Next 16.4.3, React 19.2, TS 5.9, Tailwind 4, Recharts 3, motion 12)` and `Private Accounts Release Notes`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._