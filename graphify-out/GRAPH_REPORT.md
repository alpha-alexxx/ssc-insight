# Graph Report - ssc-insight-2  (2026-11-19)

## Corpus Check
- 399 files · ~296,201 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 4, .css 2, .example 1)

## Summary
- 3131 nodes · 9518 edges · 176 communities (95 shown, 81 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 99 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `abec9a5d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Mirrored Architecture Handbook
- icon.tsx
- personal-todos.tsx
- ssrf-core.ts
- command-palette.tsx
- domain.ts
- Primary Architecture Handbook
- subject-performance.test.ts
- client-types.ts
- exam-settings.ts
- calendar-view.tsx
- app-shell.tsx
- package.json
- route-handler.ts
- Migration Ownership and Cache Policies
- Setup and Operations Handbook
- ai-composer.tsx
- lib/trash.ts
- route-handler.ts
- Mock Entry Form and Validation
- Paper Design System Handbook
- lib/todos.ts
- trash-view.tsx
- mock-form.tsx
- provider.ts
- score-forecast.ts
- extract/route.ts
- Request Proxy and Public Origins
- Extraction Normalization and Evidence
- history-screen.tsx
- Study Plan Progress APIs
- ai-prompt-security.test.ts
- plan-day-view.tsx
- repository.ts
- study-plan.test.ts
- Score Observatory verification
- RequestError
- Analytical Projections and Subject Statistics
- compare-view.tsx
- performance-metrics.ts
- Button
- Lint Formatting and Build Tooling
- trash-core.ts
- queries/exams.ts
- api
- requireUser
- connection-input.ts
- test/route.ts
- extraction.ts
- my-tasks-view.tsx
- Dashboard and Outcome Visual References
- Continuous Integration Validation Workflow
- cn
- extract/route.ts
- attempt-pagination.tsx
- sections.tsx
- theme-style-provider.tsx
- mock-entry.test.ts
- trash-view.tsx
- domain.test.ts
- client-types.ts
- SSC Insight
- personal-task-drawer.tsx
- extract/route.ts
- shot.mjs
- Caching and Revalidation Policy
- trajectory-explorer.tsx
- ai/todos/route.ts
- content.ts
- cn
- workspace-shell.tsx
- api
- Shadcn Aliases and Tailwind Configuration
- verify-backup-transfer.mjs
- Paper Tokens and Design Handover
- next.config.ts
- Todo API Review and Ownership
- Primary Architecture Handbook
- PostCSS Build Configuration
- Personal Workspace Migration Requirements
- Authenticated QA and Google Consent
- Controlled Neon Prisma Migrations
- Personal Calendar Counts and Invalidation
- Add Mock Route
- Study Calendar Route
- Mock Comparison Route
- Dashboard Workspace Route
- Mock History Route
- Personal Tasks Route
- performance/page.tsx
- Daily Study Plan Route
- status/route.ts
- week/[date]/page.tsx
- Workspace Settings Route
- ref_node_assert
- vercel.json
- Neon Ownership Migration and QA
- Neon Ownership Migration and QA
- error-boundary.tsx
- Paper Tokens and Design Handover
- ws
- Google OAuth Configuration Helper
- Native Fetch OpenAI Compatible Provider
- Outcome Cards and Dated AttemptRecordCard
- Pooled Vercel Runtime
- vercel.json
- credentials.ts
- ai/todos/route.ts
- totals
- ai-prompt-security.test.ts
- showcase.tsx
- ProviderStreamDecoder
- prisma
- overrides
- maintenance/page.tsx

## God Nodes (most connected - your core abstractions)
1. `cn()` - 249 edges
2. `PlainIcon()` - 134 edges
3. `Button()` - 119 edges
4. `react` - 106 edges
5. `SSC Insight Architecture` - 104 edges
6. `SSC Insight Architecture` - 104 edges
7. `shortDate()` - 81 edges
8. `database()` - 74 edges
9. `README.md SSC Insight` - 73 edges
10. `RequestError` - 67 edges

## Surprising Connections (you probably didn't know these)
- `Findings` --references--> `usePlanData()`  [INFERRED]
  docs/state-audit.md → src/components/use-plan-data.ts
- `Migration roadmap (executed order)` --references--> `useTodoList()`  [INFERRED]
  docs/state-audit.md → src/components/use-todos-data.tsx
- `Migration roadmap (executed order)` --references--> `useTodoMutations()`  [INFERRED]
  docs/state-audit.md → src/components/use-todos-data.tsx
- `Findings` --references--> `useWorkspaceData()`  [INFERRED]
  docs/state-audit.md → src/components/use-workspace-data.ts
- `Baseline architecture` --references--> `AiUsage`  [INFERRED]
  docs/state-audit.md → src/lib/ai/provider.ts

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

## Communities (176 total, 81 thin omitted)

### Community 0 - "Mirrored Architecture Handbook"
Cohesion: 0.26
Nodes (11): RFC-1918, assertSafeBaseUrl(), assertSafeBaseUrlShape(), BLOCKED_HOSTNAMES, inV4Range(), ipv4Octets(), isBlockedAddress(), parseBaseUrl() (+3 more)

### Community 1 - "icon.tsx"
Cohesion: 0.11
Nodes (24): Panel(), DateRangeFilter(), useExamScope(), DuoGlyph(), DuoIcon, DuotoneTile(), IconEntry, IconName (+16 more)

### Community 2 - "personal-todos.tsx"
Cohesion: 0.11
Nodes (21): addToCounts(), AttemptEntry, attemptScorePct(), buildCalendarIndex(), compareEntries(), countAll(), EMPTY_COUNTS, emptyCounts() (+13 more)

### Community 4 - "command-palette.tsx"
Cohesion: 0.06
Nodes (45): AI Status Endpoint Cache Policy (/api/ai/status), Analytics Projections Cache Policy (/api/analytics), api() Client Fetch cache: no-store (src/lib/api-client.ts), Backup Export Raw File Exception (GET /api/backup), Next.js 16 Cache Components Not Enabled, Caching and Revalidation Policy (Phase 8 reference), Filters/Scope URL State Mirror (src/lib/filters-url.ts), force-dynamic Public Auth-Adjacent Pages (+37 more)

### Community 7 - "subject-performance.test.ts"
Cohesion: 0.05
Nodes (42): dependencies, class-variance-authority@^0.7.1, cmdk@^1.1.1, @duo-icons/react@^1.0.1, lucide-react@^0.468.0, motion@^12.0.0, @neon/config@^1.9.3, @neon/env@^1.6.4 (+34 more)

### Community 8 - "client-types.ts"
Cohesion: 0.10
Nodes (22): Catalog, EMPTY_CATALOG, EMPTY_FORM, Form, Props, Label, labelVariants, AiConfigSource (+14 more)

### Community 10 - "calendar-view.tsx"
Cohesion: 0.13
Nodes (29): dynamic, LandingPage(), metadata, Faq(), FAQ_ITEMS, Landing(), ERROR_COPY, LandingError() (+21 more)

### Community 11 - "app-shell.tsx"
Cohesion: 0.10
Nodes (35): POST, GET, runtime, DELETE, PATCH, runtime, DELETE, GET (+27 more)

### Community 13 - "route-handler.ts"
Cohesion: 0.09
Nodes (34): mutationSchema, POST, runtime, GET, runtime, DELETE, idSchema, PUT (+26 more)

### Community 14 - "Migration Ownership and Cache Policies"
Cohesion: 0.13
Nodes (24): PersonalCalendar(), personalMonthRange(), categoryMeta(), Group, GroupRow(), KanbanBoard(), OverdueTodoPreview(), PageLayout (+16 more)

### Community 15 - "Setup and Operations Handbook"
Cohesion: 0.05
Nodes (43): attemptLabel(), BACKUP_INSERT_CHUNK_SIZE, BACKUP_REQUEST_MAX_BYTES, BACKUP_SAMPLE_LIMIT, backupAttemptSchema, backupAttemptsWithBounds, BackupPersonalTask, BackupPlanDayProgress (+35 more)

### Community 16 - "ai-composer.tsx"
Cohesion: 0.06
Nodes (66): EmptyChart(), AttemptBreakdown(), BreakdownDonut(), DeepDive(), GroupedScoreBars(), InsightCallout(), paperMax(), PerformanceOverview (+58 more)

### Community 17 - "lib/trash.ts"
Cohesion: 0.11
Nodes (33): Context, devHandle(), handle(), privateNoStore, runtime, GET(), accessLog(), AccessLogEvent (+25 more)

### Community 18 - "route-handler.ts"
Cohesion: 0.11
Nodes (24): dynamic, GET, HealthStatus, runtime, DELETE, dynamic, GET, PATCH (+16 more)

### Community 19 - "Mock Entry Form and Validation"
Cohesion: 0.15
Nodes (19): AppearancePanel(), PaletteChip(), StyleGlyph(), initialPalette(), initialStyle(), microMotion(), PALETTE_IDS, PALETTE_STORAGE_KEY (+11 more)

### Community 20 - "Paper Design System Handbook"
Cohesion: 0.05
Nodes (97): GET, runtime, GET, GET, PATCH, preferencesSchema, PUT, runtime (+89 more)

### Community 21 - "lib/todos.ts"
Cohesion: 0.10
Nodes (22): @fontsource-variable/dm-sans@^5.3.0, @fontsource-variable/source-serif-4@^5.3.1, next-themes@^0.4.6, @vercel/analytics@^2.0.1, @vercel/speed-insights@^2.0.0, @fontsource-variable/dm-sans, @fontsource-variable/source-serif-4, next-themes (+14 more)

### Community 22 - "trash-view.tsx"
Cohesion: 0.14
Nodes (13): args, evaluate(), height, pending, problems, report, send(), settle (+5 more)

### Community 23 - "mock-form.tsx"
Cohesion: 0.27
Nodes (11): DurationInput(), formatParts(), blankSubject(), defaultTierId(), fullMockSectionHeading(), meritSubjectIds(), MockForm(), applyExtracted() (+3 more)

### Community 24 - "provider.ts"
Cohesion: 0.10
Nodes (44): aiAborted(), AiBillability, aiBusy(), aiEndpointError(), AiError, AiErrorCode, aiInvalidOutput(), aiModelError() (+36 more)

### Community 25 - "score-forecast.ts"
Cohesion: 0.12
Nodes (25): Accuracy Footer Divisor Column (83.3% Accuracy), Marks Obtained (70/90) and Score Strip, Outcome Card Illustration (Reasoning), Outcome Counts with Proportion Bars (Correct / Incorrect / Unattempted), Percentile Availability Note ('No standalone subject percentile recorded'), Score-Centered Answer Distribution Ring (77.8% SCORE), Serif Subject Heading with Attempt/Question Subtitle, Soft-Rounded Warm Paper Card Surface (+17 more)

### Community 26 - "extract/route.ts"
Cohesion: 0.16
Nodes (30): bodySchema, maxDuration, POST(), runtime, COACH_FORMAT, maxDuration, POST(), runtime (+22 more)

### Community 27 - "Request Proxy and Public Origins"
Cohesion: 0.11
Nodes (35): ActiveExamFooterNote(), AppFrame(), AppHeader(), AppHeaderProps, AppSidebar(), HeaderLocation(), NavItem(), VIEW_META (+27 more)

### Community 28 - "Extraction Normalization and Evidence"
Cohesion: 0.08
Nodes (34): clsx@^2.1.1, @neondatabase/serverless@^1.2.0, zustand@^5.0.16, devDependencies, eslint@^9.0.0, eslint-config-next@^16.0.0, prettier@^3.9.10, tailwindcss@^4.0.0 (+26 more)

### Community 29 - "history-screen.tsx"
Cohesion: 0.39
Nodes (8): AiSettingsForm(), change(), chooseProvider(), fetchModels(), payload(), remove(), save(), test()

### Community 30 - "Study Plan Progress APIs"
Cohesion: 0.18
Nodes (22): buildSectionRows(), analyze(), average(), buildWhereYouStand(), comparePoints(), deepDiveFor(), DeepDiveSubject, derivedSectionPoint() (+14 more)

### Community 31 - "ai-prompt-security.test.ts"
Cohesion: 0.23
Nodes (23): AuthControl(), AuthControlProps, AuthError(), ExamSwitcher(), BulkBar(), TaskRow(), filterCount(), MenuOption() (+15 more)

### Community 32 - "plan-day-view.tsx"
Cohesion: 0.08
Nodes (24): LANDING_PLAN, plan, buildLandingPlan(), category(), isMock(), LandingPlanData, LandingPlanDay, LandingPlanTask (+16 more)

### Community 33 - "repository.ts"
Cohesion: 0.15
Nodes (21): AiChatSheet(), Masthead(), onScroll(), read(), NAV, AiPlanSheet(), ThemeToggle(), TrashDetailSheet() (+13 more)

### Community 34 - "study-plan.test.ts"
Cohesion: 0.12
Nodes (40): TaskSuggestionCard(), AttemptOutcomeCard(), AttemptRecordCard(), outcomes, percent(), ScoreRing(), subjectIcons, tierSuffix() (+32 more)

### Community 35 - "Score Observatory verification"
Cohesion: 0.06
Nodes (61): bearerToken(), GET, maxDuration, runtime, secretMatches(), GET, idSchema, kindSchema (+53 more)

### Community 36 - "RequestError"
Cohesion: 0.08
Nodes (50): zod, DELETE, GET, PUT, runtime, maxDuration, POST, runtime (+42 more)

### Community 37 - "Analytical Projections and Subject Statistics"
Cohesion: 0.12
Nodes (25): AiSheetTaskApi, CoachChatTab(), CoachMemo(), CoachMemos(), inlineNodes(), LogMockTab(), MEMO_LABELS, MemoBlock (+17 more)

### Community 38 - "compare-view.tsx"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 39 - "performance-metrics.ts"
Cohesion: 0.20
Nodes (4): packageDir, REPLACEMENTS, targets, root

### Community 40 - "Button"
Cohesion: 0.17
Nodes (9): args, logs, outDir, pending, routes, target, waitMs, widths (+1 more)

### Community 41 - "Lint Formatting and Build Tooling"
Cohesion: 0.09
Nodes (47): CustomExamDialog(), describeTier(), ExamRow(), ExamsPanel(), maxOf(), SourceSummary, StageSummary, SUBJECT_CHOICES (+39 more)

### Community 43 - "queries/exams.ts"
Cohesion: 0.15
Nodes (16): DayLedger(), EmptyActions(), LoadLine(), DayActions, DayNotes(), FlowSection(), HeroFigure(), PlanDayView() (+8 more)

### Community 44 - "api"
Cohesion: 0.12
Nodes (15): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+7 more)

### Community 45 - "requireUser"
Cohesion: 0.12
Nodes (15): jobs, validate, name, permissions, contents, run, uses, with (+7 more)

### Community 46 - "connection-input.ts"
Cohesion: 0.10
Nodes (41): aiConfig(), aiConfigOrNull(), AiConfig, DEFAULT_AI_BASE_URL, Env, integerEnv(), normaliseBaseUrl(), readAiConfig() (+33 more)

### Community 47 - "test/route.ts"
Cohesion: 0.17
Nodes (15): maxDuration, POST, runtime, maxDuration, POST, runtime, AiConnectionInput, aiConnectionSchema (+7 more)

### Community 48 - "extraction.ts"
Cohesion: 0.20
Nodes (16): deriveCounts(), deriveQuestions(), exactInteger(), ExtractionIssue, extractionModelSchema, extractionSubjectIds, inferType(), issue() (+8 more)

### Community 49 - "my-tasks-view.tsx"
Cohesion: 0.10
Nodes (41): GET, GET, GET, GET, attemptData(), attemptInclude, attemptWhere(), mapSubjects() (+33 more)

### Community 50 - "Dashboard and Outcome Visual References"
Cohesion: 0.07
Nodes (45): EMPTY_ATTEMPTS, useWorkspaceData(), useDebouncedValue(), ASC_SORTERS, AttemptSortRow, buildAttemptStats(), monthSplit(), ATTEMPT_SORT_KEYS (+37 more)

### Community 51 - "Continuous Integration Validation Workflow"
Cohesion: 0.20
Nodes (8): Multi-Theme System (data-palette x data-style), Palettes x Styles Theme Matrix, Typography Scale (Source Serif 4 + DM Sans), Missing Radius System Finding, Elevation Model and --shadow-pop Token, Restrained Motion Language, Tokenized Radius Scale (panel/control/card/pill), Sticky Identity Column for Mock History

### Community 52 - "cn"
Cohesion: 0.18
Nodes (9): args, evaluate(), height, pending, report, send(), target, width (+1 more)

### Community 53 - "extract/route.ts"
Cohesion: 0.12
Nodes (24): ExamScope, ExamScopeContext, ExamScopeProvider(), tierLabelFallback(), RemindersPanel(), usePanelDraft(), Switch, SwitchRow() (+16 more)

### Community 54 - "attempt-pagination.tsx"
Cohesion: 0.29
Nodes (13): AttemptPagination, windowedPages(), Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem(), PaginationNext(), PaginationPage() (+5 more)

### Community 55 - "sections.tsx"
Cohesion: 0.20
Nodes (10): Request and Ownership Architecture, Neon Agent Tooling Setup (Codex plugin + MCP), Expiring QA Branch Migration Rehearsal, Selected Neon Environment (org/project/branch), Private-Accounts Migration (claim two shared mocks), Session-Derived Ownership Model, Isolation and Ownership Verification, Google Sign-In via Neon Auth OAuth (+2 more)

### Community 56 - "theme-style-provider.tsx"
Cohesion: 0.17
Nodes (12): scripts, build, check, db:generate, db:migrate, dev, lint, postinstall (+4 more)

### Community 57 - "mock-entry.test.ts"
Cohesion: 0.23
Nodes (11): change(), save(), AttemptInput, calculatedEntry(), completionTimestamp(), durationSeconds(), MOCK_PLATFORMS, platformSelection() (+3 more)

### Community 58 - "trash-view.tsx"
Cohesion: 0.20
Nodes (9): Confirmed requirements, Dated personal todos and AI-assisted planning, Existing foundation, Finalized navigation and lifecycle, Phase 1 — Design the dated planner and review flow, Phase 2 — Extend task storage and manual workflows, Phase 3 — Add AI proposal and confirmed-apply workflows, Phase 4 — Validate and document (+1 more)

### Community 59 - "domain.test.ts"
Cohesion: 0.21
Nodes (9): filterAttempts(), duplicateKey(), parseTime(), SUBJECTS, aliases, numberAfter(), parseReport(), attemptSchema (+1 more)

### Community 60 - "client-types.ts"
Cohesion: 0.25
Nodes (5): Dashboard Analytical Scopes (full/subject/sectional/all), Backup Format v2 and Account Transfer, Semantic Chart Palette and Chart Rules, Core Product Workflows, JSON Backup Format Version 2

### Community 61 - "SSC Insight"
Cohesion: 0.15
Nodes (15): Baseline architecture, Call-site inventory (39 total), GuardLedgerRow(), GuardNotice(), GuardNoticeProps, GuardRow, GuardStyles(), GuardTone (+7 more)

### Community 62 - "personal-task-drawer.tsx"
Cohesion: 0.08
Nodes (41): Swap(), PageHeader(), CalendarSurface(), CalendarToolbar(), LayerToggles(), CalendarLegend(), PeriodNav(), stepSize() (+33 more)

### Community 63 - "extract/route.ts"
Cohesion: 0.09
Nodes (41): PlanCategoryLegend(), BackupPreviewCard(), DataPanel(), ActiveTargetCard(), DefaultRow(), describeSignature(), PercentileExplainer(), PercentileRow() (+33 more)

### Community 64 - "shot.mjs"
Cohesion: 0.40
Nodes (6): Known Limitations (duo-icons fill-rule, native inputs), Design System Source-of-Truth Map, Icon Inconsistency Finding (14 ad-hoc sizes), Icon Size Scale (14/16/18/22/28), Named Imports for Bundle Reduction, Raw Lucide Imports Migrated into Semantic Icon Map

### Community 68 - "Caching and Revalidation Policy"
Cohesion: 0.50
Nodes (5): WorkspaceShell Client Orchestrator and Its Three Hooks, dashboard.tsx Monolith Split Finding, UI Baseline Audit Findings (26 prioritized items), 15-Phase Execution Order, Unified Segmented Control (.segment-group)

### Community 69 - "trajectory-explorer.tsx"
Cohesion: 0.30
Nodes (12): nextStatus(), PersonalTaskDisplayStatus, STATUS_META, StatusDot(), statusOf(), BoardView(), handleDrop(), columnFor() (+4 more)

### Community 70 - "ai/todos/route.ts"
Cohesion: 0.22
Nodes (21): DaySections(), AttemptEntryRow(), entryPlanRow(), PersonalEntryRow(), PlanEntryRow(), RevisionEntryRow(), SectionHead(), StatusDot() (+13 more)

### Community 71 - "content.ts"
Cohesion: 0.11
Nodes (44): AgendaGroups(), AgendaView(), EarlierRanges(), CalendarMetrics(), categoryLabel(), QuietDays(), CellRow(), MonthCell() (+36 more)

### Community 72 - "cn"
Cohesion: 0.09
Nodes (27): average(), buildAiContext(), fullMockProfile(), payload(), recentFullMock(), sectionProfile(), subjectProfile(), AiQuotaLimits (+19 more)

### Community 73 - "workspace-shell.tsx"
Cohesion: 0.09
Nodes (36): next, dynamic, WorkspaceLayout(), AddMockView(), LogMockPayload, AiCoachCard(), DashboardClock(), viewTransition() (+28 more)

### Community 74 - "api"
Cohesion: 0.08
Nodes (31): lucide-react, radix-ui, react, metadata, NumberField, DraftResponse, Proposal, weekdayDateLabel() (+23 more)

### Community 89 - "Paper Tokens and Design Handover"
Cohesion: 0.18
Nodes (18): DayDrawer(), DayLedgerProps, blankTask(), PersonalTaskDrawer(), TaskEditorLoader(), TaskEditorForm(), buildDraft(), save() (+10 more)

### Community 139 - "Add Mock Route"
Cohesion: 0.16
Nodes (24): DuotoneIcon(), AiPanel(), CompareScreen(), delta(), duration(), accuracyTone(), MockChip(), MockStat() (+16 more)

### Community 140 - "Study Calendar Route"
Cohesion: 0.14
Nodes (15): OverviewStrip(), activeFilterEntries(), asString(), DEFAULT_FILTERS, LAYOUTS, loadStored(), PRIORITIES, SORTS (+7 more)

### Community 141 - "Mock Comparison Route"
Cohesion: 0.05
Nodes (77): @radix-ui/react-dialog@^1.3.1, @radix-ui/react-dialog, collectCursors(), GET, runtime, NAV_GROUPS, planHref(), CommandPalette() (+69 more)

### Community 142 - "Dashboard Workspace Route"
Cohesion: 0.07
Nodes (29): targetMarks(), AccountUser, LookupResult, SessionError, verifiedUser(), Marking, SubjectResult, AttemptSeed (+21 more)

### Community 143 - "Mock History Route"
Cohesion: 0.18
Nodes (24): accuracyTone(), AttemptTotals, comparablePercentage(), Delta(), scoreBarTone(), typeChip(), buildComparison(), ChangeCell() (+16 more)

### Community 144 - "Personal Tasks Route"
Cohesion: 0.13
Nodes (13): BACKUP_FORMAT, BACKUP_FORMAT_VERSION, BACKUP_MAX_ATTEMPTS, backup, english, full, ga, PLANNER (+5 more)

### Community 145 - "performance/page.tsx"
Cohesion: 0.13
Nodes (16): api(), full, ids, raw(), api(), cookies, created, input (+8 more)

### Community 146 - "Daily Study Plan Route"
Cohesion: 0.13
Nodes (19): ResultEditor(), fill(), Attempt, istClock, istDateKey(), istDayKey, longDay, monthDate() (+11 more)

### Community 147 - "status/route.ts"
Cohesion: 0.24
Nodes (8): dynamic, runtime, providerLabel(), quotaLimitsForSource(), resolveSourcePolicy(), StoredCredentialState, USER_KEY_SAFETY_LIMITS, root

### Community 148 - "week/[date]/page.tsx"
Cohesion: 0.14
Nodes (16): AttemptInput, buildAttempt(), FULL_ROWS, LANDING_ATTEMPTS, LANDING_FULL_MOCKS, LANDING_LATEST, LANDING_SCOPES, LANDING_TARGET (+8 more)

### Community 149 - "Workspace Settings Route"
Cohesion: 0.17
Nodes (12): Client State Architecture Audit — 2026-10-31, Design decisions, Findings, Migration roadmap (executed order), Standing gaps (out of scope, recorded), QueryProvider(), ApiError, getQueryClient() (+4 more)

### Community 150 - "ref_node_assert"
Cohesion: 0.15
Nodes (10): api(), backup(), cookies, preview(), raw(), replace(), settings, chatBaseForSend() (+2 more)

### Community 151 - "vercel.json"
Cohesion: 0.31
Nodes (7): useAuthActions(), signIn(), GoogleGlyph(), GoogleSignInButton(), signIn(), GoogleSignInButtonProps, startGoogleSignIn()

### Community 152 - "Neon Ownership Migration and QA"
Cohesion: 0.31
Nodes (8): assertSummary(), backfillLegacyQualifying(), BackupError, computedSummary(), formatIssues(), isRecord(), parseBackup(), parseImportRequest()

### Community 153 - "Neon Ownership Migration and QA"
Cohesion: 0.29
Nodes (4): env, match, prisma, queries

### Community 154 - "error-boundary.tsx"
Cohesion: 0.25
Nodes (4): ErrorBoundary, ErrorFallback(), Props, State

### Community 155 - "Paper Tokens and Design Handover"
Cohesion: 0.20
Nodes (9): args, evaluate(), pending, send(), target, url, wait, widths (+1 more)

### Community 156 - "ws"
Cohesion: 0.25
Nodes (6): ws@^8.22.0, ws, logs, pending, target, ws

### Community 157 - "Google OAuth Configuration Helper"
Cohesion: 0.09
Nodes (37): @tanstack/react-query, TodoAiComposer(), apply(), duplicateWarning(), proposedValue(), useToast(), EMPTY_TASKS, patchDayInPlan() (+29 more)

### Community 158 - "Native Fetch OpenAI Compatible Provider"
Cohesion: 0.15
Nodes (15): MyTasksView(), bulkRescheduleApply(), bulkStatus(), bulkTrashSelected(), clearSelection(), createTask(), cycleStatus(), duplicate() (+7 more)

### Community 159 - "Outcome Cards and Dated AttemptRecordCard"
Cohesion: 0.40
Nodes (4): BACKUP_MAX_BYTES, BackupPreview, ImportMode, ImportResult

### Community 160 - "Pooled Vercel Runtime"
Cohesion: 0.40
Nodes (4): cspDev, cspProduction, nextConfig, productionHeaders

### Community 166 - "credentials.ts"
Cohesion: 0.32
Nodes (12): AiCredentialInput, AiCredentialSummary, encryptionKey(), getAiCredential(), saveAiCredential(), b64url(), CredentialCryptoError, credentialKey() (+4 more)

### Community 167 - "ai/todos/route.ts"
Cohesion: 0.14
Nodes (18): maxDuration, runtime, MAX_TODO_PROMPT_CHARS, coachInsightSchema, extractJsonText(), parseModelJson(), structuredFormatFor(), loadAiContext() (+10 more)

### Community 168 - "totals"
Cohesion: 0.18
Nodes (16): totalsFor(), LANDING_SUMMARY, HeroArt(), Hero(), DashboardScreen(), CHART, CHIP_TONES, ChipTone (+8 more)

### Community 169 - "ai-prompt-security.test.ts"
Cohesion: 0.10
Nodes (32): AiContext, chatMessages(), coachMessages(), contextBlock(), extractionMessages(), FALLBACK_SHAPE, marksFor(), paperLabel() (+24 more)

### Community 170 - "showcase.tsx"
Cohesion: 0.40
Nodes (4): motion, EASE, TabId, TABS

### Community 174 - "overrides"
Cohesion: 0.67
Nodes (3): zod, overrides, @neondatabase/auth

## Ambiguous Edges - Review These
- `Stack Inventory (Next 16.4.3, React 19.2, TS 5.9, Tailwind 4, Recharts 3, motion 12)` → `Private Accounts Release Notes`  [AMBIGUOUS]
  docs/ui-overhaul/phase-1-audit.md · relation: conceptually_related_to

## Knowledge Gaps
- **36 isolated node(s):** `RFC-1918`, `Analytics Projections Cache Policy (/api/analytics)`, `force-dynamic Public Auth-Adjacent Pages`, `Health Endpoint Rate-Limit-Exempt (/api/health)`, `Firebase/Mongo Runtime Dependencies Removed` (+31 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1009 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **81 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `extract/route.ts` to `icon.tsx`, `client-types.ts`, `calendar-view.tsx`, `Add Mock Route`, `Mock Comparison Route`, `Migration Ownership and Cache Policies`, `Mock History Route`, `ai-composer.tsx`, `Request Proxy and Public Origins`, `history-screen.tsx`, `Google OAuth Configuration Helper`, `ai-prompt-security.test.ts`, `Native Fetch OpenAI Compatible Provider`, `repository.ts`, `study-plan.test.ts`, `Analytical Projections and Subject Statistics`, `totals`, `Lint Formatting and Build Tooling`, `queries/exams.ts`, `extract/route.ts`, `attempt-pagination.tsx`, `personal-task-drawer.tsx`, `trajectory-explorer.tsx`, `ai/todos/route.ts`, `content.ts`, `api`, `Paper Tokens and Design Handover`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **What connects `RFC-1918`, `Analytics Projections Cache Policy (/api/analytics)`, `force-dynamic Public Auth-Adjacent Pages` to the rest of the system?**
  _36 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `icon.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11397849462365592 - nodes in this community are weakly interconnected._
- **Why does `next` connect `workspace-shell.tsx` to `icon.tsx`, `subject-performance.test.ts`, `calendar-view.tsx`, `Mock Comparison Route`, `ai-composer.tsx`, `lib/trash.ts`, `route-handler.ts`, `lib/todos.ts`, `error-boundary.tsx`, `Request Proxy and Public Origins`, `Extraction Normalization and Evidence`, `Pooled Vercel Runtime`, `repository.ts`, `study-plan.test.ts`, `RequestError`, `queries/exams.ts`, `maintenance/page.tsx`, `Dashboard and Outcome Visual References`, `SSC Insight`, `personal-task-drawer.tsx`, `content.ts`, `api`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Should `personal-todos.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10846560846560846 - nodes in this community are weakly interconnected._
- **Why does `react` connect `api` to `icon.tsx`, `subject-performance.test.ts`, `client-types.ts`, `calendar-view.tsx`, `Add Mock Route`, `Study Calendar Route`, `Mock Comparison Route`, `Migration Ownership and Cache Policies`, `Mock History Route`, `ai-composer.tsx`, `Mock Entry Form and Validation`, `Workspace Settings Route`, `lib/todos.ts`, `mock-form.tsx`, `vercel.json`, `error-boundary.tsx`, `Request Proxy and Public Origins`, `Extraction Normalization and Evidence`, `Google OAuth Configuration Helper`, `ai-prompt-security.test.ts`, `Outcome Cards and Dated AttemptRecordCard`, `repository.ts`, `study-plan.test.ts`, `Analytical Projections and Subject Statistics`, `totals`, `Lint Formatting and Build Tooling`, `showcase.tsx`, `queries/exams.ts`, `Dashboard and Outcome Visual References`, `extract/route.ts`, `attempt-pagination.tsx`, `SSC Insight`, `personal-task-drawer.tsx`, `extract/route.ts`, `trajectory-explorer.tsx`, `ai/todos/route.ts`, `content.ts`, `workspace-shell.tsx`, `Paper Tokens and Design Handover`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Stack Inventory (Next 16.4.3, React 19.2, TS 5.9, Tailwind 4, Recharts 3, motion 12)` and `Private Accounts Release Notes`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._