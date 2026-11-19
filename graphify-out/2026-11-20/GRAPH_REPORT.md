# Graph Report - ssc-insight-2  (2026-11-20)

## Corpus Check
- 404 files · ~301,733 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 4, .css 2, .example 1)

## Summary
- 3187 nodes · 9690 edges · 167 communities (85 shown, 82 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 100 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e5db0306`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- utils.ts
- ai-composer.tsx
- personal-todos.tsx
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
- RequestError
- personal-task-drawer.tsx
- Setup and Operations Handbook
- ai-composer.tsx
- lib/trash.ts
- route-handler.ts
- Mock Entry Form and Validation
- Paper Design System Handbook
- toast.tsx
- trash-view.tsx
- queries/exams.ts
- provider.ts
- score-forecast.ts
- extract/route.ts
- Request Proxy and Public Origins
- progress.ts
- command-palette.tsx
- Study Plan Progress APIs
- ai-prompt-security.test.ts
- plan-day-view.tsx
- personal-todos.tsx
- Button
- Score Observatory verification
- PlainIcon
- ai-chat-sheet.tsx
- compare-view.tsx
- ref_node_fs
- Button
- trash-view.tsx
- trash-core.ts
- format.ts
- api
- requireUser
- connection-input.ts
- use-plan-data.ts
- extraction.ts
- my-tasks-view.tsx
- Dashboard and Outcome Visual References
- Continuous Integration Validation Workflow
- cn
- fixtures.ts
- devDependencies
- sections.tsx
- theme-style-provider.tsx
- mock-entry.test.ts
- trash-view.tsx
- ai/todos.ts
- client-types.ts
- private-workspace.tsx
- calendar-view.tsx
- targets-panel.tsx
- shot.mjs
- Caching and Revalidation Policy
- use-tasks-view-state.ts
- ai/todos/route.ts
- day-ledger.tsx
- sheet.tsx
- client-types.ts
- query-client.ts
- Shadcn Aliases and Tailwind Configuration
- verify-backup-transfer.mjs
- api
- next.config.ts
- Todo API Review and Ownership
- Primary Architecture Handbook
- PostCSS Build Configuration
- Personal Workspace Migration Requirements
- Authenticated QA and Google Consent
- Controlled Neon Prisma Migrations
- Personal Calendar Counts and Invalidation
- Add Mock Route
- MyTasksView
- Mock Comparison Route
- ref_node_assert
- compare-view.tsx
- form.tsx
- credentials.ts
- about-panel.tsx
- routes.test.ts
- prisma
- maintenance/page.tsx
- scroll-area.tsx
- google-sign-in-button.tsx
- Neon Ownership Migration and QA
- ws
- Paper Tokens and Design Handover
- resolve.ts
- agenda-view.tsx
- board-view.tsx
- Pooled Vercel Runtime
- vercel.json
- ProviderStreamDecoder
- ai-prompt-security.test.ts

## God Nodes (most connected - your core abstractions)
1. `cn()` - 260 edges
2. `PlainIcon()` - 134 edges
3. `Button()` - 116 edges
4. `react` - 110 edges
5. `SSC Insight Architecture` - 104 edges
6. `SSC Insight Architecture` - 104 edges
7. `shortDate()` - 81 edges
8. `database()` - 74 edges
9. `README.md SSC Insight` - 73 edges
10. `RequestError` - 67 edges

## Surprising Connections (you probably didn't know these)
- `Findings` --references--> `usePlanData()`  [INFERRED]
  docs/state-audit.md → src/components/use-plan-data.ts
- `Findings` --references--> `useWorkspaceData()`  [INFERRED]
  docs/state-audit.md → src/components/use-workspace-data.ts
- `Baseline architecture` --references--> `AiUsage`  [INFERRED]
  docs/state-audit.md → src/lib/ai/provider.ts
- `Design decisions` --references--> `ApiError`  [INFERRED]
  docs/state-audit.md → src/lib/api-client.ts
- `Migration roadmap (executed order)` --references--> `ApiError`  [INFERRED]
  docs/state-audit.md → src/lib/api-client.ts

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

## Communities (167 total, 82 thin omitted)

### Community 0 - "utils.ts"
Cohesion: 0.16
Nodes (24): AiCoachCard(), DashboardOverview(), Panel(), DashboardView(), RecentAttemptsPanel(), MetricCell(), MetricStripSkeleton(), PerformancePreview() (+16 more)

### Community 1 - "ai-composer.tsx"
Cohesion: 0.09
Nodes (29): lucide-react, radix-ui, react, metadata, DraftResponse, Proposal, weekdayDateLabel(), GroupsManagerDialog() (+21 more)

### Community 2 - "personal-todos.tsx"
Cohesion: 0.11
Nodes (21): addToCounts(), AttemptEntry, attemptScorePct(), buildCalendarIndex(), compareEntries(), countAll(), EMPTY_COUNTS, emptyCounts() (+13 more)

### Community 4 - "command-palette.tsx"
Cohesion: 0.06
Nodes (45): AI Status Endpoint Cache Policy (/api/ai/status), Analytics Projections Cache Policy (/api/analytics), api() Client Fetch cache: no-store (src/lib/api-client.ts), Backup Export Raw File Exception (GET /api/backup), Next.js 16 Cache Components Not Enabled, Caching and Revalidation Policy (Phase 8 reference), Filters/Scope URL State Mirror (src/lib/filters-url.ts), force-dynamic Public Auth-Adjacent Pages (+37 more)

### Community 7 - "subject-performance.test.ts"
Cohesion: 0.05
Nodes (53): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, cmdk@^1.1.1, @duo-icons/react@^1.0.1, lucide-react@^0.468.0, motion@^12.0.0, @neon/config@^1.9.3 (+45 more)

### Community 8 - "ai-settings-form.tsx"
Cohesion: 0.08
Nodes (28): AiSettingsForm(), chooseProvider(), fetchModels(), patchFields(), payloadFrom(), remove(), test(), Catalog (+20 more)

### Community 10 - "calendar-view.tsx"
Cohesion: 0.11
Nodes (34): Faq(), FAQ_ITEMS, Landing(), ERROR_COPY, LandingError(), LedgerFacts(), BrowserFrame(), MockupCaption() (+26 more)

### Community 11 - "app-shell.tsx"
Cohesion: 0.10
Nodes (35): POST, GET, runtime, DELETE, PATCH, runtime, DELETE, GET (+27 more)

### Community 13 - "RequestError"
Cohesion: 0.06
Nodes (66): zod, maxDuration, POST, runtime, DELETE, GET, PUT, runtime (+58 more)

### Community 14 - "personal-task-drawer.tsx"
Cohesion: 0.23
Nodes (15): DayDrawer(), DayLedgerProps, blankTask(), PersonalTaskDrawer(), TaskEditorLoader(), TaskEditorForm(), buildDraft(), save() (+7 more)

### Community 15 - "Setup and Operations Handbook"
Cohesion: 0.04
Nodes (73): GET, maxDuration, runtime, privateHeaders, assertSummary(), attemptFingerprint(), attemptLabel(), backfillLegacyQualifying() (+65 more)

### Community 16 - "ai-composer.tsx"
Cohesion: 0.06
Nodes (64): EmptyChart(), PageHeader(), AttemptBreakdown(), BreakdownDonut(), DeepDive(), GroupedScoreBars(), InsightCallout(), paperMax() (+56 more)

### Community 17 - "lib/trash.ts"
Cohesion: 0.10
Nodes (33): Context, devHandle(), handle(), privateNoStore, runtime, GET(), accessLog(), AccessLogEvent (+25 more)

### Community 18 - "route-handler.ts"
Cohesion: 0.11
Nodes (26): dynamic, GET, HealthStatus, runtime, DELETE, dynamic, GET, PATCH (+18 more)

### Community 19 - "Mock Entry Form and Validation"
Cohesion: 0.12
Nodes (24): AppearancePanel(), PaletteChip(), StyleGlyph(), Swap(), initialPalette(), initialStyle(), microMotion(), PALETTE_IDS (+16 more)

### Community 20 - "Paper Design System Handbook"
Cohesion: 0.05
Nodes (76): runtime, GET, TargetReference, PatternShape, ALL_TIERS_ID, CUSTOM_FIRST_TIER_ID, CustomExamDef, customExamPattern() (+68 more)

### Community 21 - "toast.tsx"
Cohesion: 0.09
Nodes (18): @fontsource-variable/dm-sans@^5.3.0, @fontsource-variable/source-serif-4@^5.3.1, next-themes@^0.4.6, @vercel/analytics@^2.0.1, @vercel/speed-insights@^2.0.0, @fontsource-variable/dm-sans, @fontsource-variable/source-serif-4, next-themes (+10 more)

### Community 22 - "trash-view.tsx"
Cohesion: 0.14
Nodes (13): args, evaluate(), height, pending, problems, report, send(), settle (+5 more)

### Community 23 - "queries/exams.ts"
Cohesion: 0.09
Nodes (33): ExamScope, ExamScopeContext, ExamScopeProvider(), tierLabelFallback(), CustomExamDialog(), describeTier(), ExamRow(), maxOf() (+25 more)

### Community 24 - "provider.ts"
Cohesion: 0.11
Nodes (47): aiAborted(), AiBillability, aiBusy(), aiEndpointError(), AiError, AiErrorCode, aiInvalidOutput(), aiModelError() (+39 more)

### Community 25 - "score-forecast.ts"
Cohesion: 0.12
Nodes (25): Accuracy Footer Divisor Column (83.3% Accuracy), Marks Obtained (70/90) and Score Strip, Outcome Card Illustration (Reasoning), Outcome Counts with Proportion Bars (Correct / Incorrect / Unattempted), Percentile Availability Note ('No standalone subject percentile recorded'), Score-Centered Answer Distribution Ring (77.8% SCORE), Serif Subject Heading with Attempt/Question Subtitle, Soft-Rounded Warm Paper Card Surface (+17 more)

### Community 26 - "extract/route.ts"
Cohesion: 0.12
Nodes (41): bodySchema, maxDuration, POST(), runtime, COACH_FORMAT, maxDuration, POST(), runtime (+33 more)

### Community 27 - "Request Proxy and Public Origins"
Cohesion: 0.10
Nodes (40): ActiveExamFooterNote(), AppFrame(), AppSidebar(), NavItem(), MockTable(), PlanCategoryLegend(), DrawerFooter(), DrawerHeader() (+32 more)

### Community 28 - "progress.ts"
Cohesion: 0.10
Nodes (36): mutationSchema, POST, runtime, GET, runtime, DELETE, idSchema, PUT (+28 more)

### Community 29 - "command-palette.tsx"
Cohesion: 0.13
Nodes (32): @radix-ui/react-dialog, NAV_GROUPS, planHref(), CommandPalette(), CommandPaletteProps, loadRecentSearches(), PaletteBody(), persistRecentSearches() (+24 more)

### Community 30 - "Study Plan Progress APIs"
Cohesion: 0.08
Nodes (41): buildSectionRows(), average(), fullMockProfile(), payload(), recentFullMock(), sectionProfile(), subjectProfile(), analyze() (+33 more)

### Community 31 - "ai-prompt-security.test.ts"
Cohesion: 0.22
Nodes (24): AppHeader(), HeaderLocation(), AuthControl(), AuthControlProps, AuthError(), ExamSwitcher(), BulkBar(), TaskRow() (+16 more)

### Community 32 - "plan-day-view.tsx"
Cohesion: 0.09
Nodes (18): LANDING_PLAN, plan, buildLandingPlan(), category(), isMock(), parsed, parsePlanTaskKey(), planChecklistItemSchema (+10 more)

### Community 33 - "personal-todos.tsx"
Cohesion: 0.12
Nodes (25): Migration roadmap (executed order), categoryMeta(), Group, GroupRow(), KanbanBoard(), OverdueTodoPreview(), PageLayout, PersonalTodos() (+17 more)

### Community 34 - "Button"
Cohesion: 0.12
Nodes (34): next, DashboardPlanApi, PipelineProgressSection(), PipelineRevisionSection(), PipelineUpcomingSection(), PlanApi, ProgressRing(), StudyPipelinePanel() (+26 more)

### Community 35 - "Score Observatory verification"
Cohesion: 0.07
Nodes (55): bearerToken(), GET, maxDuration, runtime, secretMatches(), GET, idSchema, kindSchema (+47 more)

### Community 36 - "PlainIcon"
Cohesion: 0.09
Nodes (31): CompareView, ErrorState(), SelectionBar(), DateRangeFilter(), DuoGlyph(), DuoIcon, IconEntry, IconName (+23 more)

### Community 37 - "ai-chat-sheet.tsx"
Cohesion: 0.12
Nodes (21): AiSheetTaskApi, CoachChatTab(), CoachMemo(), CoachMemos(), inlineNodes(), MEMO_LABELS, MemoBlock, MessageContent() (+13 more)

### Community 38 - "compare-view.tsx"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 39 - "ref_node_fs"
Cohesion: 0.25
Nodes (3): packageDir, REPLACEMENTS, targets

### Community 40 - "Button"
Cohesion: 0.17
Nodes (9): args, logs, outDir, pending, routes, target, waitMs, widths (+1 more)

### Community 41 - "trash-view.tsx"
Cohesion: 0.11
Nodes (39): ExamsPanel(), MotionButton, SettingsGuardProvider(), useSettingsGuard(), initialSection(), isSection(), SaveBar(), SECTION_IDS (+31 more)

### Community 43 - "format.ts"
Cohesion: 0.26
Nodes (10): NumberField, ResultEditor(), fill(), fillFromAttempt(), isLoggableType(), matchAttemptForTask(), namesMatch(), normalizeName() (+2 more)

### Community 44 - "api"
Cohesion: 0.12
Nodes (15): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+7 more)

### Community 45 - "requireUser"
Cohesion: 0.12
Nodes (15): jobs, validate, name, permissions, contents, run, uses, with (+7 more)

### Community 46 - "connection-input.ts"
Cohesion: 0.09
Nodes (43): aiConfig(), aiConfigOrNull(), AiConfig, DEFAULT_AI_BASE_URL, Env, integerEnv(), normaliseBaseUrl(), readAiConfig() (+35 more)

### Community 47 - "use-plan-data.ts"
Cohesion: 0.12
Nodes (24): Toast, ToastApi, ToastCard(), ToastContext, ToastProvider(), ToastTone, ToastViewport(), TONE_STYLES (+16 more)

### Community 48 - "extraction.ts"
Cohesion: 0.11
Nodes (28): LogMockTab(), SubjectRoster(), ExtractionReview(), update(), updateSubject(), FieldIssues(), NullableDuration(), optionalNumber() (+20 more)

### Community 49 - "my-tasks-view.tsx"
Cohesion: 0.09
Nodes (38): GET, GET, runtime, attemptData(), attemptInclude, attemptWhere(), mapSubjects(), StoredAnalyticsAttempt (+30 more)

### Community 50 - "Dashboard and Outcome Visual References"
Cohesion: 0.08
Nodes (41): AddMockView(), LogMockPayload, CompareReference, DashboardClock(), useExamScope(), ScopeFilters(), viewTransition(), collectSelectedAttempts() (+33 more)

### Community 51 - "Continuous Integration Validation Workflow"
Cohesion: 0.20
Nodes (8): Multi-Theme System (data-palette x data-style), Palettes x Styles Theme Matrix, Typography Scale (Source Serif 4 + DM Sans), Missing Radius System Finding, Elevation Model and --shadow-pop Token, Restrained Motion Language, Tokenized Radius Scale (panel/control/card/pill), Sticky Identity Column for Mock History

### Community 52 - "cn"
Cohesion: 0.18
Nodes (9): args, evaluate(), height, pending, report, send(), target, width (+1 more)

### Community 53 - "fixtures.ts"
Cohesion: 0.10
Nodes (24): motion, GoogleSignInButton(), AttemptInput, buildAttempt(), FULL_ROWS, LANDING_ATTEMPTS, LANDING_FULL_MOCKS, LANDING_LATEST (+16 more)

### Community 54 - "devDependencies"
Cohesion: 0.09
Nodes (23): devDependencies, eslint@^9.0.0, eslint-config-next@^16.0.0, prettier@^3.9.10, tailwindcss@^4.0.0, @tailwindcss/postcss@^4.0.0, tsx@^4.20.0, @types/node@^22.0.0 (+15 more)

### Community 55 - "sections.tsx"
Cohesion: 0.20
Nodes (10): Request and Ownership Architecture, Neon Agent Tooling Setup (Codex plugin + MCP), Expiring QA Branch Migration Rehearsal, Selected Neon Environment (org/project/branch), Private-Accounts Migration (claim two shared mocks), Session-Derived Ownership Model, Isolation and Ownership Verification, Google Sign-In via Neon Auth OAuth (+2 more)

### Community 56 - "theme-style-provider.tsx"
Cohesion: 0.17
Nodes (12): scripts, build, check, db:generate, db:migrate, dev, lint, postinstall (+4 more)

### Community 57 - "mock-entry.test.ts"
Cohesion: 0.08
Nodes (44): DurationInput(), change(), formatParts(), blankSubject(), defaultTierId(), fullMockSectionHeading(), meritSubjectIds(), MockForm() (+36 more)

### Community 58 - "trash-view.tsx"
Cohesion: 0.20
Nodes (9): Confirmed requirements, Dated personal todos and AI-assisted planning, Existing foundation, Finalized navigation and lifecycle, Phase 1 — Design the dated planner and review flow, Phase 2 — Extend task storage and manual workflows, Phase 3 — Add AI proposal and confirmed-apply workflows, Phase 4 — Validate and document (+1 more)

### Community 59 - "ai/todos.ts"
Cohesion: 0.11
Nodes (23): maxDuration, runtime, MAX_TODO_PROMPT_CHARS, parseTodoProposals(), Target, TODO_DATE_QUESTION, todoDraftMessages(), todoDraftRequestSchema (+15 more)

### Community 60 - "client-types.ts"
Cohesion: 0.25
Nodes (5): Dashboard Analytical Scopes (full/subject/sectional/all), Backup Format v2 and Account Transfer, Semantic Chart Palette and Chart Rules, Core Product Workflows, JSON Backup Format Version 2

### Community 61 - "private-workspace.tsx"
Cohesion: 0.16
Nodes (16): Baseline architecture, Call-site inventory (39 total), dynamic, WorkspaceLayout(), GuardLedgerRow(), GuardNotice(), GuardNoticeProps, GuardRow (+8 more)

### Community 62 - "calendar-view.tsx"
Cohesion: 0.15
Nodes (24): CalendarSurface(), CalendarLegend(), stepSize(), CalendarView(), currentPath(), MemoMonthGrid, MemoWeekView, monthMeta() (+16 more)

### Community 63 - "targets-panel.tsx"
Cohesion: 0.07
Nodes (44): @hookform/resolvers@^5.9.2, react-hook-form@^7.92.0, @hookform/resolvers, react-hook-form, pageEnter, Reveal(), RevealItem(), saveBarSpring (+36 more)

### Community 64 - "shot.mjs"
Cohesion: 0.40
Nodes (6): Known Limitations (duo-icons fill-rule, native inputs), Design System Source-of-Truth Map, Icon Inconsistency Finding (14 ad-hoc sizes), Icon Size Scale (14/16/18/22/28), Named Imports for Bundle Reduction, Raw Lucide Imports Migrated into Semantic Icon Map

### Community 68 - "Caching and Revalidation Policy"
Cohesion: 0.50
Nodes (5): WorkspaceShell Client Orchestrator and Its Three Hooks, dashboard.tsx Monolith Split Finding, UI Baseline Audit Findings (26 prioritized items), 15-Phase Execution Order, Unified Segmented Control (.segment-group)

### Community 69 - "use-tasks-view-state.ts"
Cohesion: 0.13
Nodes (16): OverviewStrip(), activeFilterEntries(), asString(), DEFAULT_FILTERS, LAYOUTS, loadStored(), PRIORITIES, SORTS (+8 more)

### Community 70 - "ai/todos/route.ts"
Cohesion: 0.20
Nodes (23): DaySections(), AttemptEntryRow(), entryPlanRow(), PersonalEntryRow(), PlanEntryRow(), RevisionEntryRow(), SectionHead(), StatusDot() (+15 more)

### Community 71 - "day-ledger.tsx"
Cohesion: 0.36
Nodes (6): DayLedger(), EmptyActions(), LoadLine(), DayActions, dayTypeLabel(), types

### Community 72 - "sheet.tsx"
Cohesion: 0.14
Nodes (25): AiChatSheet(), AttemptPagination, windowedPages(), Masthead(), onScroll(), read(), NAV, AiPlanSheet() (+17 more)

### Community 73 - "client-types.ts"
Cohesion: 0.09
Nodes (28): INSIGHT_REQUEST_TEXT, insightToChatText(), newId(), trimChatHistory(), useAiWorkspace(), chatBaseForSend(), AiConfigSource, AiCredentialSummary (+20 more)

### Community 74 - "query-client.ts"
Cohesion: 0.15
Nodes (13): Client State Architecture Audit — 2026-10-31, Design decisions, Findings, Standing gaps (out of scope, recorded), @tanstack/react-query-devtools@^5.105.0, @tanstack/react-query-devtools, QueryProvider(), ApiError (+5 more)

### Community 89 - "api"
Cohesion: 0.10
Nodes (38): @tanstack/react-query, apply(), AttemptPageParams, useAttemptsByIds(), useTodoCalendar(), EMPTY_ATTEMPTS, api(), Envelope (+30 more)

### Community 139 - "Add Mock Route"
Cohesion: 0.12
Nodes (33): DuotoneIcon(), AiPanel(), CompareScreen(), delta(), duration(), DashboardScreen(), accuracyTone(), CHART (+25 more)

### Community 140 - "MyTasksView"
Cohesion: 0.15
Nodes (15): MyTasksView(), bulkRescheduleApply(), bulkStatus(), bulkTrashSelected(), clearSelection(), createTask(), cycleStatus(), duplicate() (+7 more)

### Community 141 - "Mock Comparison Route"
Cohesion: 0.09
Nodes (44): collectCursors(), GET, runtime, SearchHit, searchIsReady(), SearchPage, UseSearchOptions, escapeLike() (+36 more)

### Community 142 - "ref_node_assert"
Cohesion: 0.18
Nodes (7): AccountUser, LookupResult, SessionError, verifiedUser(), root, T2, attemptSchema

### Community 143 - "compare-view.tsx"
Cohesion: 0.08
Nodes (59): accuracyTone(), AttemptTotals, comparablePercentage(), Delta(), scoreBarTone(), totalsFor(), typeChip(), AttemptOutcomeCard() (+51 more)

### Community 144 - "form.tsx"
Cohesion: 0.18
Nodes (14): @radix-ui/react-label@^2.1.17, @radix-ui/react-label, FormControl, FormDescription, FormFieldContext, FormFieldContextValue, FormItem, FormItemContext (+6 more)

### Community 145 - "credentials.ts"
Cohesion: 0.06
Nodes (47): RFC-1918, api(), backup(), cookies, preview(), raw(), replace(), settings (+39 more)

### Community 146 - "about-panel.tsx"
Cohesion: 0.31
Nodes (8): AboutPanel(), Avatar, AvatarFallback, AvatarImage, Badge(), BadgeProps, badgeVariants, CATALOG_VERSION

### Community 147 - "routes.test.ts"
Cohesion: 0.24
Nodes (10): AppHeaderProps, VIEW_META, AI_VIEWS, APP_VIEWS, AppView, PATH_VIEW, VIEW_HREF, VIEW_PATH (+2 more)

### Community 151 - "google-sign-in-button.tsx"
Cohesion: 0.21
Nodes (8): useAuthActions(), signIn(), GoogleGlyph(), signIn(), GoogleSignInButtonProps, authClient, OAUTH_ERROR_PATH, startGoogleSignIn()

### Community 153 - "Neon Ownership Migration and QA"
Cohesion: 0.22
Nodes (6): @prisma/adapter-pg@^7.10.1, @prisma/adapter-pg, env, match, prisma, queries

### Community 154 - "ws"
Cohesion: 0.25
Nodes (6): ws@^8.22.0, ws, logs, pending, target, ws

### Community 155 - "Paper Tokens and Design Handover"
Cohesion: 0.20
Nodes (9): args, evaluate(), pending, send(), target, url, wait, widths (+1 more)

### Community 156 - "resolve.ts"
Cohesion: 0.17
Nodes (12): aiConnectionSchema, AiQuotaLimits, AiQuotaUsage, chargedOnFailure(), planReservation(), ReservationPlan, AiConfigSource, quotaLimitsForSource() (+4 more)

### Community 157 - "agenda-view.tsx"
Cohesion: 0.12
Nodes (38): AgendaGroups(), AgendaView(), EarlierRanges(), CalendarMetrics(), categoryLabel(), QuietDays(), CellRow(), MonthCell() (+30 more)

### Community 158 - "board-view.tsx"
Cohesion: 0.32
Nodes (11): nextStatus(), PersonalTaskDisplayStatus, STATUS_META, StatusDot(), statusOf(), BoardView(), handleDrop(), columnFor() (+3 more)

### Community 160 - "Pooled Vercel Runtime"
Cohesion: 0.40
Nodes (4): cspDev, cspProduction, nextConfig, productionHeaders

### Community 169 - "ai-prompt-security.test.ts"
Cohesion: 0.10
Nodes (32): AiContext, chatMessages(), coachMessages(), contextBlock(), extractionMessages(), FALLBACK_SHAPE, marksFor(), paperLabel() (+24 more)

## Ambiguous Edges - Review These
- `Stack Inventory (Next 16.4.3, React 19.2, TS 5.9, Tailwind 4, Recharts 3, motion 12)` → `Private Accounts Release Notes`  [AMBIGUOUS]
  docs/ui-overhaul/phase-1-audit.md · relation: conceptually_related_to

## Knowledge Gaps
- **36 isolated node(s):** `RFC-1918`, `Analytics Projections Cache Policy (/api/analytics)`, `force-dynamic Public Auth-Adjacent Pages`, `Health Endpoint Rate-Limit-Exempt (/api/health)`, `Firebase/Mongo Runtime Dependencies Removed` (+31 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1025 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **82 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Request Proxy and Public Origins` to `utils.ts`, `ai-composer.tsx`, `ai-settings-form.tsx`, `calendar-view.tsx`, `Add Mock Route`, `MyTasksView`, `personal-task-drawer.tsx`, `compare-view.tsx`, `ai-composer.tsx`, `form.tsx`, `about-panel.tsx`, `Mock Entry Form and Validation`, `scroll-area.tsx`, `queries/exams.ts`, `agenda-view.tsx`, `board-view.tsx`, `ai-prompt-security.test.ts`, `command-palette.tsx`, `personal-todos.tsx`, `Button`, `PlainIcon`, `ai-chat-sheet.tsx`, `trash-view.tsx`, `extraction.ts`, `Dashboard and Outcome Visual References`, `fixtures.ts`, `calendar-view.tsx`, `targets-panel.tsx`, `ai/todos/route.ts`, `day-ledger.tsx`, `sheet.tsx`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **What connects `RFC-1918`, `Analytics Projections Cache Policy (/api/analytics)`, `force-dynamic Public Auth-Adjacent Pages` to the rest of the system?**
  _36 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ai-composer.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0851063829787234 - nodes in this community are weakly interconnected._
- **Why does `react` connect `ai-composer.tsx` to `utils.ts`, `subject-performance.test.ts`, `ai-settings-form.tsx`, `calendar-view.tsx`, `Add Mock Route`, `personal-task-drawer.tsx`, `compare-view.tsx`, `ai-composer.tsx`, `form.tsx`, `about-panel.tsx`, `Mock Entry Form and Validation`, `Setup and Operations Handbook`, `toast.tsx`, `scroll-area.tsx`, `queries/exams.ts`, `google-sign-in-button.tsx`, `Request Proxy and Public Origins`, `command-palette.tsx`, `agenda-view.tsx`, `ai-prompt-security.test.ts`, `board-view.tsx`, `personal-todos.tsx`, `Button`, `PlainIcon`, `ai-chat-sheet.tsx`, `trash-view.tsx`, `format.ts`, `use-plan-data.ts`, `extraction.ts`, `Dashboard and Outcome Visual References`, `fixtures.ts`, `mock-entry.test.ts`, `private-workspace.tsx`, `calendar-view.tsx`, `targets-panel.tsx`, `use-tasks-view-state.ts`, `ai/todos/route.ts`, `day-ledger.tsx`, `sheet.tsx`, `client-types.ts`, `query-client.ts`, `api`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Should `personal-todos.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10846560846560846 - nodes in this community are weakly interconnected._
- **Why does `zod` connect `RequestError` to `plan-day-view.tsx`, `Score Observatory verification`, `subject-performance.test.ts`, `ai-settings-form.tsx`, `ai-prompt-security.test.ts`, `app-shell.tsx`, `Mock Comparison Route`, `connection-input.ts`, `Setup and Operations Handbook`, `extraction.ts`, `compare-view.tsx`, `Dashboard and Outcome Visual References`, `Paper Design System Handbook`, `extract/route.ts`, `ai/todos.ts`, `progress.ts`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Stack Inventory (Next 16.4.3, React 19.2, TS 5.9, Tailwind 4, Recharts 3, motion 12)` and `Private Accounts Release Notes`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._