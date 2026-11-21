# Graph Report - ssc-insight-2  (2026-11-21)

## Corpus Check
- 490 files · ~351,636 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 4, .css 2, .example 1)

## Summary
- 3618 nodes · 11392 edges · 175 communities (108 shown, 67 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 143 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d574291b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- format.ts
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
- exam-settings.ts
- ai-chat-sheet.tsx
- trash-view.tsx
- workspace-chrome.tsx
- provider.ts
- score-forecast.ts
- api.ts
- Request Proxy and Public Origins
- trash-cleanup/route.ts
- next
- Study Plan Progress APIs
- task-toolbar.tsx
- plan-day-view.tsx
- rate-limit.ts
- credentials.ts
- Score Observatory verification
- performance-metrics.ts
- film-section.tsx
- compare-view.tsx
- trash-view.tsx
- Button
- app/layout.tsx
- RouteSkeleton
- result-editor.tsx
- api
- requireUser
- connection-input.ts
- RouteError
- extraction.ts
- loadExamContext
- queries/exams.ts
- Continuous Integration Validation Workflow
- cn
- plan-day-view.tsx
- devDependencies
- sections.tsx
- theme-style-provider.tsx
- mock-form.tsx
- trash-view.tsx
- loadExamContext
- client-types.ts
- private-workspace.tsx
- calendar-view.tsx
- react
- shot.mjs
- Caching and Revalidation Policy
- client-types.ts
- calendar-entries.ts
- exams-panel.tsx
- ai-chat-sheet.tsx
- client-types.ts
- requireUser
- utils.ts
- verify-backup-transfer.mjs
- api
- next.config.ts
- Todo API Review and Ownership
- personal-todos.tsx
- view-model.ts
- data-parts.tsx
- Folder-Based Routing and Upstash Rate Limiting — Design
- Review Focus
- subject-deep-dive.tsx
- lib/motion.ts
- ws
- Primary Architecture Handbook
- PostCSS Build Configuration
- Personal Workspace Migration Requirements
- Authenticated QA and Google Consent
- Controlled Neon Prisma Migrations
- Personal Calendar Counts and Invalidation
- Add Mock Route
- workspace-chrome.tsx
- Mock Comparison Route
- ref_node_assert
- compare-view.tsx
- verify-backup-transfer.mjs
- ai.ts
- filters-url.ts
- colocation.test.ts
- ask-view.tsx
- formatNumber
- analytics/route.ts
- Panel
- prisma
- performance-view.tsx
- ndjson.ts
- Paper Tokens and Design Handover
- react
- ProviderStreamDecoder
- icon.tsx
- ai/todos.ts
- services/attempts.ts
- Client State Architecture Audit — 2026-10-31
- next.config.ts
- ref_node_fs
- context.ts
- vercel.json
- explain-search.ts
- verify-ownership.mjs
- verify-trash.mjs
- ai-prompt-security.test.ts
- task-suggestion.ts
- Folder-Based Routing and Upstash Rate Limiting — Implementation Plan
- verify-neon.mjs
- app/page.tsx

## God Nodes (most connected - your core abstractions)
1. `cn()` - 310 edges
2. `PlainIcon()` - 135 edges
3. `react` - 133 edges
4. `Button()` - 126 edges
5. `SSC Insight Architecture` - 104 edges
6. `SSC Insight Architecture` - 104 edges
7. `shortDate()` - 88 edges
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

## Communities (175 total, 67 thin omitted)

### Community 0 - "format.ts"
Cohesion: 0.18
Nodes (14): EventDialog(), PlanDoneState(), RevFlag(), DashboardClock(), istClock, istDayKey, istTimeLabel(), longDate() (+6 more)

### Community 1 - "my-tasks-view.tsx"
Cohesion: 0.06
Nodes (38): ApplyOp, ConfirmState, MyTasksView(), bulkRescheduleApply(), bulkStatus(), bulkTrashSelected(), clearSelection(), createTask() (+30 more)

### Community 2 - "view-model.ts"
Cohesion: 0.11
Nodes (49): AgendaGroups(), AgendaView(), EarlierRanges(), CalendarMetrics(), CalendarSurface(), categoryLabel(), QuietDays(), CalendarLegend() (+41 more)

### Community 4 - "command-palette.tsx"
Cohesion: 0.06
Nodes (45): AI Status Endpoint Cache Policy (/api/ai/status), Analytics Projections Cache Policy (/api/analytics), api() Client Fetch cache: no-store (src/lib/api-client.ts), Backup Export Raw File Exception (GET /api/backup), Next.js 16 Cache Components Not Enabled, Caching and Revalidation Policy (Phase 8 reference), Filters/Scope URL State Mirror (src/lib/filters-url.ts), force-dynamic Public Auth-Adjacent Pages (+37 more)

### Community 7 - "subject-performance.test.ts"
Cohesion: 0.04
Nodes (62): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, cmdk@^1.1.1, @duo-icons/react@^1.0.1, @hookform/resolvers@^5.9.2, lucide-react@^0.468.0, motion@^12.0.0 (+54 more)

### Community 8 - "ai-settings-form.tsx"
Cohesion: 0.07
Nodes (34): AiSettingsForm(), chooseProvider(), fetchModels(), patchFields(), payloadFrom(), remove(), test(), Catalog (+26 more)

### Community 10 - "calendar-view.tsx"
Cohesion: 0.11
Nodes (33): DuotoneIcon(), CountUp(), InkArt(), FloatingAsk(), RAIL_ITEMS, SectionRail(), onScroll(), read() (+25 more)

### Community 11 - "app-shell.tsx"
Cohesion: 0.12
Nodes (29): GET, runtime, DELETE, GET, POST, runtime, calendarCounts(), completionState() (+21 more)

### Community 14 - "personal-task-drawer.tsx"
Cohesion: 0.20
Nodes (17): DayDrawer(), DayLedgerProps, blankTask(), PersonalTaskDrawer(), TaskEditorLoader(), TaskEditorForm(), buildDraft(), save() (+9 more)

### Community 15 - "Setup and Operations Handbook"
Cohesion: 0.04
Nodes (69): GET, maxDuration, runtime, privateHeaders, assertSummary(), attemptFingerprint(), attemptLabel(), backfillLegacyQualifying() (+61 more)

### Community 16 - "ai-composer.tsx"
Cohesion: 0.11
Nodes (39): EmptyChart(), AttemptBreakdown(), BreakdownDonut(), DeepDive(), GroupedScoreBars(), InsightCallout(), paperMax(), PerformanceOverview (+31 more)

### Community 17 - "lib/trash.ts"
Cohesion: 0.11
Nodes (33): Context, devHandle(), handle(), privateNoStore, runtime, GET(), accessLog(), AccessLogEvent (+25 more)

### Community 18 - "RequestError"
Cohesion: 0.05
Nodes (82): Baseline architecture, Call-site inventory (39 total), zod, maxDuration, POST, runtime, GET, runtime (+74 more)

### Community 19 - "Mock Entry Form and Validation"
Cohesion: 0.12
Nodes (23): AppearancePanel(), PaletteChip(), StyleGlyph(), Swap(), initialPalette(), initialStyle(), microMotion(), PALETTE_IDS (+15 more)

### Community 20 - "exam-settings.ts"
Cohesion: 0.05
Nodes (77): GET, runtime, Marking, ALL_TIERS_ID, CATALOG_VERSION, CUSTOM_FIRST_TIER_ID, CustomExamDef, customExamPattern() (+69 more)

### Community 21 - "ai-chat-sheet.tsx"
Cohesion: 0.12
Nodes (24): AskChatTab(), LogMockPayload, LogMockTab(), SheetUsageFooter(), SubjectRoster(), ExtractionReview(), update(), updateSubject() (+16 more)

### Community 22 - "trash-view.tsx"
Cohesion: 0.14
Nodes (13): args, evaluate(), height, pending, problems, report, send(), settle (+5 more)

### Community 23 - "workspace-chrome.tsx"
Cohesion: 0.10
Nodes (27): The layout keeps only what must survive navigation, dynamic, WorkspaceLayout(), AppHeaderProps, VIEW_META, QueryProvider(), ScopeGate(), ToastProvider() (+19 more)

### Community 24 - "provider.ts"
Cohesion: 0.09
Nodes (53): aiAborted(), AiBillability, aiBusy(), aiEndpointError(), AiError, AiErrorCode, aiInvalidOutput(), aiModelError() (+45 more)

### Community 25 - "score-forecast.ts"
Cohesion: 0.12
Nodes (25): Accuracy Footer Divisor Column (83.3% Accuracy), Marks Obtained (70/90) and Score Strip, Outcome Card Illustration (Reasoning), Outcome Counts with Proportion Bars (Correct / Incorrect / Unattempted), Percentile Availability Note ('No standalone subject percentile recorded'), Score-Centered Answer Distribution Ring (77.8% SCORE), Serif Subject Heading with Attempt/Question Subtitle, Soft-Rounded Warm Paper Card Surface (+17 more)

### Community 26 - "api.ts"
Cohesion: 0.07
Nodes (68): bodySchema, maxDuration, POST(), runtime, COACH_FORMAT, maxDuration, POST(), runtime (+60 more)

### Community 27 - "Request Proxy and Public Origins"
Cohesion: 0.13
Nodes (35): PlanCategoryLegend(), ActiveExamFooterNote(), AppFrame(), AppHeader(), AppSidebar(), HeaderLocation(), NavItem(), Separator (+27 more)

### Community 28 - "trash-cleanup/route.ts"
Cohesion: 0.32
Nodes (6): bearerToken(), GET, maxDuration, runtime, secretMatches(), CleanupResult

### Community 29 - "next"
Cohesion: 0.11
Nodes (24): next, metadata, metadata, CompareRoute(), HistoryRoute(), PerformanceRoute(), platformsOf(), metadata (+16 more)

### Community 30 - "Study Plan Progress APIs"
Cohesion: 0.10
Nodes (30): analyze(), average(), buildWhereYouStand(), comparePoints(), deepDiveFor(), derivedSectionPoint(), explicitSectionPoint(), filterAttempts() (+22 more)

### Community 31 - "task-toolbar.tsx"
Cohesion: 0.15
Nodes (33): lucide-react, EmptyActions(), BulkBar(), PlanRail(), QuickAddBar(), filterCount(), MenuOption(), PRIORITY_LABELS (+25 more)

### Community 32 - "plan-day-view.tsx"
Cohesion: 0.08
Nodes (24): LANDING_PLAN, plan, buildLandingPlan(), category(), isMock(), LandingPlanDay, LandingPlanTask, RawDay (+16 more)

### Community 33 - "rate-limit.ts"
Cohesion: 0.07
Nodes (46): apiRateLimiter, BREAKER_OPEN_MS, BREAKER_THRESHOLD, BreakerState, initialBreaker(), isBreakerOpen(), onFailure(), onSuccess() (+38 more)

### Community 34 - "credentials.ts"
Cohesion: 0.11
Nodes (34): RFC-1918, DELETE, GET, PUT, runtime, isAiThinking(), AiConnectionInput, sameCredentialTarget() (+26 more)

### Community 35 - "Score Observatory verification"
Cohesion: 0.07
Nodes (55): GET, idSchema, kindSchema, runtime, GET, runtime, loadTrashPage(), TrashQueryInput (+47 more)

### Community 36 - "performance-metrics.ts"
Cohesion: 0.16
Nodes (17): PerformancePreview(), ScoreBand(), Sparkline(), Distribution, DISTRIBUTION_MIN_POINTS, DistributionBucket, findings(), FindingTone (+9 more)

### Community 37 - "film-section.tsx"
Cohesion: 0.12
Nodes (27): attemptMeritPercentage(), CHAPTERS, COACH_ANSWER, CountNumber(), FILM_GAP_PTS, FILM_METRICS, FILM_PCT_DELTA, FILM_SUBJECT_BARS (+19 more)

### Community 38 - "compare-view.tsx"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 39 - "trash-view.tsx"
Cohesion: 0.16
Nodes (25): KindFilter, messageOf(), rowKey(), toItemRef(), TrashView(), ungroupedCount(), AttemptPagination, windowedPages() (+17 more)

### Community 40 - "Button"
Cohesion: 0.17
Nodes (9): args, logs, outDir, pending, routes, target, waitMs, widths (+1 more)

### Community 41 - "app/layout.tsx"
Cohesion: 0.10
Nodes (18): @fontsource-variable/dm-sans@^5.3.0, @fontsource-variable/source-serif-4@^5.3.1, next-themes@^0.4.6, @vercel/analytics@^2.0.1, @vercel/speed-insights@^2.0.0, @fontsource-variable/dm-sans, @fontsource-variable/source-serif-4, next-themes (+10 more)

### Community 42 - "RouteSkeleton"
Cohesion: 0.25
Nodes (18): AddLoading(), AskLoading(), CalendarLoading(), CompareLoading(), DashboardLoading(), HistoryLoading(), MytasksLoading(), PerformanceLoading() (+10 more)

### Community 43 - "result-editor.tsx"
Cohesion: 0.24
Nodes (11): NumberField, ResultEditor(), fill(), istDateKey(), fillFromAttempt(), isLoggableType(), matchAttemptForTask(), namesMatch() (+3 more)

### Community 44 - "api"
Cohesion: 0.12
Nodes (15): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+7 more)

### Community 45 - "requireUser"
Cohesion: 0.12
Nodes (15): jobs, validate, name, permissions, contents, run, uses, with (+7 more)

### Community 46 - "connection-input.ts"
Cohesion: 0.07
Nodes (57): maxDuration, POST, PROBE_MESSAGES, runtime, AI_THINKING_LEVELS, AI_THINKING_VALUES, AiConfig, AiThinking (+49 more)

### Community 47 - "RouteError"
Cohesion: 0.15
Nodes (14): AddError(), AskError(), CalendarError(), CompareError(), DashboardError(), HistoryError(), MyTasksError(), PerformanceError() (+6 more)

### Community 48 - "extraction.ts"
Cohesion: 0.20
Nodes (16): deriveCounts(), deriveQuestions(), exactInteger(), ExtractionIssue, extractionModelSchema, extractionSubjectIds, inferType(), issue() (+8 more)

### Community 49 - "loadExamContext"
Cohesion: 0.12
Nodes (27): attemptData(), attemptInclude, attemptWhere(), mapSubjects(), StoredAnalyticsAttempt, StoredAttempt, toAnalyticsAttempt(), toAttempt() (+19 more)

### Community 50 - "queries/exams.ts"
Cohesion: 0.13
Nodes (18): ExamScope, ExamScopeContext, ExamScopeProvider(), tierLabelFallback(), activeExamPattern(), CustomExamDto, CustomExamInput, CustomTierDto (+10 more)

### Community 51 - "Continuous Integration Validation Workflow"
Cohesion: 0.20
Nodes (8): Multi-Theme System (data-palette x data-style), Palettes x Styles Theme Matrix, Typography Scale (Source Serif 4 + DM Sans), Missing Radius System Finding, Elevation Model and --shadow-pop Token, Restrained Motion Language, Tokenized Radius Scale (panel/control/card/pill), Sticky Identity Column for Mock History

### Community 52 - "cn"
Cohesion: 0.18
Nodes (9): args, evaluate(), height, pending, report, send(), target, width (+1 more)

### Community 53 - "plan-day-view.tsx"
Cohesion: 0.16
Nodes (18): PipelineProgressSection(), DayNotes(), FlowSection(), HeroFigure(), PlanDayView(), PlanNotFound(), PlanWeekView(), WeekRow() (+10 more)

### Community 54 - "devDependencies"
Cohesion: 0.07
Nodes (27): devDependencies, eslint@^9.0.0, eslint-config-next@^16.0.0, prettier@^3.9.10, react-is@^19.3.1, tailwindcss@^4.0.0, @tailwindcss/postcss@^4.0.0, @tanstack/react-query-devtools@^5.105.0 (+19 more)

### Community 55 - "sections.tsx"
Cohesion: 0.20
Nodes (10): Request and Ownership Architecture, Neon Agent Tooling Setup (Codex plugin + MCP), Expiring QA Branch Migration Rehearsal, Selected Neon Environment (org/project/branch), Private-Accounts Migration (claim two shared mocks), Session-Derived Ownership Model, Isolation and Ownership Verification, Google Sign-In via Neon Auth OAuth (+2 more)

### Community 56 - "theme-style-provider.tsx"
Cohesion: 0.17
Nodes (12): scripts, build, check, db:generate, db:migrate, dev, lint, postinstall (+4 more)

### Community 57 - "mock-form.tsx"
Cohesion: 0.09
Nodes (42): DurationInput(), change(), formatParts(), blankSubject(), defaultTierId(), fullMockSectionHeading(), meritSubjectIds(), MockForm() (+34 more)

### Community 58 - "trash-view.tsx"
Cohesion: 0.20
Nodes (9): Confirmed requirements, Dated personal todos and AI-assisted planning, Existing foundation, Finalized navigation and lifecycle, Phase 1 — Design the dated planner and review flow, Phase 2 — Extend task storage and manual workflows, Phase 3 — Add AI proposal and confirmed-apply workflows, Phase 4 — Validate and document (+1 more)

### Community 59 - "loadExamContext"
Cohesion: 0.11
Nodes (36): POST, assignTierIds(), customExamInputSchema, customSubjectSchema, customTierSchema, DELETE, GET, POST (+28 more)

### Community 60 - "client-types.ts"
Cohesion: 0.25
Nodes (5): Dashboard Analytical Scopes (full/subject/sectional/all), Backup Format v2 and Account Transfer, Semantic Chart Palette and Chart Rules, Core Product Workflows, JSON Backup Format Version 2

### Community 61 - "private-workspace.tsx"
Cohesion: 0.12
Nodes (19): useAuthActions(), signIn(), GoogleGlyph(), GoogleSignInButton(), signIn(), GoogleSignInButtonProps, GuardLedgerRow(), GuardNotice() (+11 more)

### Community 62 - "calendar-view.tsx"
Cohesion: 0.16
Nodes (20): AssistantBody(), ChatTranscript(), ChatTranscriptProps, EditButton(), ReasoningTrace(), TurnActions, TurnActionsProps, CopyButton() (+12 more)

### Community 63 - "react"
Cohesion: 0.11
Nodes (35): @hookform/resolvers, react-hook-form, DataPanel(), Reveal(), RevealItem(), BouncingSwitch(), EMPTY_PREFERENCES, RemindersPanel() (+27 more)

### Community 64 - "shot.mjs"
Cohesion: 0.40
Nodes (6): Known Limitations (duo-icons fill-rule, native inputs), Design System Source-of-Truth Map, Icon Inconsistency Finding (14 ad-hoc sizes), Icon Size Scale (14/16/18/22/28), Named Imports for Bundle Reduction, Raw Lucide Imports Migrated into Semantic Icon Map

### Community 68 - "Caching and Revalidation Policy"
Cohesion: 0.50
Nodes (5): WorkspaceShell Client Orchestrator and Its Three Hooks, dashboard.tsx Monolith Split Finding, UI Baseline Audit Findings (26 prioritized items), 15-Phase Execution Order, Unified Segmented Control (.segment-group)

### Community 69 - "client-types.ts"
Cohesion: 0.18
Nodes (11): AiConfigSource, AiResponseUsage, AiScreenContext, AiSourceState, AiStatus, AiUsageSummary, AiView, CoachMeta (+3 more)

### Community 70 - "calendar-entries.ts"
Cohesion: 0.07
Nodes (48): DayLedger(), LoadLine(), DayActions, DaySections(), AttemptEntryRow(), entryPlanRow(), PersonalEntryRow(), PlanEntryRow() (+40 more)

### Community 71 - "exams-panel.tsx"
Cohesion: 0.08
Nodes (47): CustomExamDialog(), describeTier(), ExamRow(), ExamsPanel(), maxOf(), SourceSummary, StageSummary, SUBJECT_CHOICES (+39 more)

### Community 72 - "ai-chat-sheet.tsx"
Cohesion: 0.17
Nodes (20): AiPlanSheet(), TrashDetailSheet(), AiChatSheet(), Masthead(), onScroll(), read(), NAV, TodoAiComposer() (+12 more)

### Community 73 - "client-types.ts"
Cohesion: 0.14
Nodes (27): AiWorkspace, AiWorkspaceContext, INSIGHT_REQUEST_TEXT, insightToChatText(), newId(), trimChatHistory(), useAiWorkspaceState(), chatBaseForSend() (+19 more)

### Community 74 - "requireUser"
Cohesion: 0.14
Nodes (38): Tasks 8–19: Route migrations, @tanstack/react-query, GET, runtime, GET, AddPage(), dynamic, AskPage() (+30 more)

### Community 75 - "utils.ts"
Cohesion: 0.15
Nodes (14): CalendarToolbar(), LayerToggles(), PeriodNav(), UNIT, AGENDA_WINDOW, CALENDAR_MODES, CalendarMode, LAYER_META (+6 more)

### Community 89 - "api"
Cohesion: 0.14
Nodes (23): useTodoCalendar(), useTodoTasks(), api(), Envelope, readEnvelope(), analyticsKeys, analyticsQueryOptions(), serializeAnalyticsParams() (+15 more)

### Community 124 - "personal-todos.tsx"
Cohesion: 0.13
Nodes (24): categoryMeta(), Group, GroupRow(), KanbanBoard(), OverdueTodoPreview(), PageLayout, PersonalTodos(), clearSelection() (+16 more)

### Community 125 - "view-model.ts"
Cohesion: 0.07
Nodes (42): BoardView(), handleDrop(), columnFor(), COLUMNS, nextStatus(), PersonalTaskDisplayStatus, STATUS_META, StatusDot() (+34 more)

### Community 126 - "data-parts.tsx"
Cohesion: 0.10
Nodes (29): Petals, TypedLine(), AttemptInput, buildAttempt(), FULL_ROWS, LANDING_ATTEMPTS, LANDING_FULL_MOCKS, LANDING_LATEST (+21 more)

### Community 127 - "Folder-Based Routing and Upstash Rate Limiting — Design"
Cohesion: 0.13
Nodes (14): Architecture, Colocation rule, Decisions, Folder-Based Routing and Upstash Rate Limiting — Design, Goals, Invariants that must not move, Non-goals, Problem (+6 more)

### Community 128 - "Review Focus"
Cohesion: 0.18
Nodes (11): Review Focus, Task 0: Toolchain and baseline, Task 1: Spec and plan documents, Task 20: Retire the shell, Task 21: Verification and documentation closeout, Task 2: Route, colocation and client-boundary guards, Task 3: Pure rate-limit policy, Task 4: Command budget and Upstash adapter (+3 more)

### Community 129 - "subject-deep-dive.tsx"
Cohesion: 0.16
Nodes (20): accuracyTone(), DeepDiveCards(), PAD, SUBJECT_TOKENS, SubjectLineChart(), TONE_CLASS, AreaTrendChart(), PAD (+12 more)

### Community 130 - "lib/motion.ts"
Cohesion: 0.13
Nodes (18): motion, DistributionPanel(), PAD, FloatingInk(), PetalSpec, ChatEmptyState(), READS, SUGGESTIONS (+10 more)

### Community 131 - "ws"
Cohesion: 0.25
Nodes (6): ws@^8.22.0, ws, logs, pending, target, ws

### Community 139 - "Add Mock Route"
Cohesion: 0.14
Nodes (28): BrowserFrame(), MockupCaption(), CompareScreen(), delta(), duration(), accuracyTone(), ChipTone, MockChip() (+20 more)

### Community 140 - "workspace-chrome.tsx"
Cohesion: 0.11
Nodes (30): AddMockView(), AddRoute(), AddRouteInner(), CalendarRoute(), DashboardRoute(), NO_FILTERS, MyTasksRoute(), PlanDayRoute() (+22 more)

### Community 141 - "Mock Comparison Route"
Cohesion: 0.05
Nodes (78): @radix-ui/react-dialog@^1.3.1, @radix-ui/react-dialog, collectCursors(), GET, runtime, NAV_GROUPS, planHref(), CommandPalette() (+70 more)

### Community 142 - "ref_node_assert"
Cohesion: 0.07
Nodes (22): FULL_MOCK_MAX_SCORE, attemptSchema, input, AttemptSeed, MARKING, T1, T2, attemptSchema (+14 more)

### Community 143 - "compare-view.tsx"
Cohesion: 0.11
Nodes (36): buildComparison(), buildSectionRows(), ChangeCell(), CompareReference, CompareView, Comparison, ComparisonLedger(), ComparisonRow (+28 more)

### Community 144 - "verify-backup-transfer.mjs"
Cohesion: 0.29
Nodes (8): api(), backup(), cookies, preview(), raw(), replace(), settings, user()

### Community 145 - "ai.ts"
Cohesion: 0.22
Nodes (9): AiActivity, clockLabel(), FEATURE_META, STATUS_DOT, AiActivityEntry, aiKeys, aiStatusQueryOptions, aiUsageQueryOptions (+1 more)

### Community 146 - "filters-url.ts"
Cohesion: 0.15
Nodes (17): ATTEMPT_SORT_KEYS, dashboardScopeSchema, filtersSchema, DEFAULT_SCOPE, defaultListState, lenientDirSchema, lenientFiltersSchema, lenientPageSchema (+9 more)

### Community 147 - "colocation.test.ts"
Cohesion: 0.22
Nodes (6): allSourceFiles(), APP, privateFiles(), ROOT, SRC, walkInto()

### Community 148 - "ask-view.tsx"
Cohesion: 0.20
Nodes (14): AskRoute(), AskView(), FOLLOW_UPS, ConversationGroup, ConversationList, ConversationRow, groupConversations(), relativeLabel() (+6 more)

### Community 149 - "formatNumber"
Cohesion: 0.26
Nodes (11): AttemptBreakdownPanel(), InsightCallout(), Axis, SUBJECT_TOKENS, BreakdownCounts, BreakdownDonut(), DonutLegend(), ROWS (+3 more)

### Community 150 - "analytics/route.ts"
Cohesion: 0.18
Nodes (14): @radix-ui/react-label@^2.1.17, @radix-ui/react-label, FormControl, FormDescription, FormFieldContext, FormFieldContextValue, FormItem, FormItemContext (+6 more)

### Community 151 - "Panel"
Cohesion: 0.29
Nodes (9): PersonalTasksPanel(), AboutPanel(), Panel(), Avatar, AvatarFallback, AvatarImage, Badge(), BadgeProps (+1 more)

### Community 153 - "performance-view.tsx"
Cohesion: 0.26
Nodes (11): FindingsPanel(), points(), sentence(), TONE_ICON, TONE_TEXT, PerformanceView(), RadarPanel(), SubjectDeepDive() (+3 more)

### Community 154 - "ndjson.ts"
Cohesion: 0.32
Nodes (4): AiChatEvent, ChatUsage, encoder, NdjsonDecoder

### Community 155 - "Paper Tokens and Design Handover"
Cohesion: 0.20
Nodes (9): args, evaluate(), pending, send(), target, url, wait, widths (+1 more)

### Community 156 - "react"
Cohesion: 0.09
Nodes (22): radix-ui, react, dynamic, SettingsPage(), SettingsRoute(), useBackupImport(), Toast, ToastApi (+14 more)

### Community 158 - "icon.tsx"
Cohesion: 0.08
Nodes (47): Loading, error and not-found surfaces, CalendarLoading(), DashboardPlanApi, PipelineRevisionSection(), PipelineUpcomingSection(), PlanApi, PlanWithToday, ProgressRing() (+39 more)

### Community 159 - "ai/todos.ts"
Cohesion: 0.23
Nodes (10): MAX_TODO_PROMPT_CHARS, parseTodoProposals(), Target, TODO_DATE_QUESTION, todoDraftRequestSchema, TodoProposal, todoProposalSchema, todoOperationSchema (+2 more)

### Community 160 - "services/attempts.ts"
Cohesion: 0.26
Nodes (14): GET, ComparePage(), dynamic, dynamic, HistoryPage(), attemptKeys, LIST_ATTEMPTS_MAX, ListAttemptsPagedParams (+6 more)

### Community 161 - "Client State Architecture Audit — 2026-10-31"
Cohesion: 0.29
Nodes (6): Client State Architecture Audit — 2026-10-31, Design decisions, Findings, Migration roadmap (executed order), Standing gaps (out of scope, recorded), ApiError

### Community 162 - "next.config.ts"
Cohesion: 0.40
Nodes (4): cspDev, cspProduction, nextConfig, productionHeaders

### Community 163 - "ref_node_fs"
Cohesion: 0.20
Nodes (4): packageDir, REPLACEMENTS, targets, root

### Community 164 - "context.ts"
Cohesion: 0.29
Nodes (9): AiContext, average(), buildAiContext(), fullMockProfile(), payload(), recentFullMock(), sectionProfile(), subjectProfile() (+1 more)

### Community 166 - "explain-search.ts"
Cohesion: 0.22
Nodes (6): @prisma/adapter-pg@^7.10.1, @prisma/adapter-pg, env, match, prisma, queries

### Community 167 - "verify-ownership.mjs"
Cohesion: 0.33
Nodes (6): api(), cookies, created, input, original, raw()

### Community 168 - "verify-trash.mjs"
Cohesion: 0.43
Nodes (6): api(), cookies, created, input, raw(), visible()

### Community 169 - "ai-prompt-security.test.ts"
Cohesion: 0.14
Nodes (25): attachImages(), chatMessages(), coachMessages(), contextBlock(), extractionMessages(), FALLBACK_SHAPE, marksFor(), paperLabel() (+17 more)

### Community 170 - "task-suggestion.ts"
Cohesion: 0.33
Nodes (6): CATEGORIES, isHttpUrl(), ParsedChatContent, parseSuggestionBody(), PRIORITIES, TaskSuggestion

### Community 171 - "Folder-Based Routing and Upstash Rate Limiting — Implementation Plan"
Cohesion: 0.40
Nodes (4): Baseline and environment facts (measured in Task 0), Folder-Based Routing and Upstash Rate Limiting — Implementation Plan, Global Constraints, Rulings carried into this plan

### Community 173 - "verify-neon.mjs"
Cohesion: 0.50
Nodes (4): api(), full, ids, raw()

### Community 174 - "app/page.tsx"
Cohesion: 0.50
Nodes (3): dynamic, LandingPage(), metadata

## Ambiguous Edges - Review These
- `Stack Inventory (Next 16.4.3, React 19.2, TS 5.9, Tailwind 4, Recharts 3, motion 12)` → `Private Accounts Release Notes`  [AMBIGUOUS]
  docs/ui-overhaul/phase-1-audit.md · relation: conceptually_related_to

## Knowledge Gaps
- **36 isolated node(s):** `RFC-1918`, `Analytics Projections Cache Policy (/api/analytics)`, `force-dynamic Public Auth-Adjacent Pages`, `Health Endpoint Rate-Limit-Exempt (/api/health)`, `Firebase/Mongo Runtime Dependencies Removed` (+31 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1118 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **67 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Request Proxy and Public Origins` to `format.ts`, `my-tasks-view.tsx`, `view-model.ts`, `subject-deep-dive.tsx`, `lib/motion.ts`, `ai-settings-form.tsx`, `calendar-view.tsx`, `Add Mock Route`, `Mock Comparison Route`, `personal-task-drawer.tsx`, `compare-view.tsx`, `ai-composer.tsx`, `ai.ts`, `Mock Entry Form and Validation`, `ask-view.tsx`, `formatNumber`, `ai-chat-sheet.tsx`, `Panel`, `analytics/route.ts`, `performance-view.tsx`, `react`, `next`, `icon.tsx`, `task-toolbar.tsx`, `performance-metrics.ts`, `film-section.tsx`, `trash-view.tsx`, `RouteSkeleton`, `plan-day-view.tsx`, `calendar-view.tsx`, `react`, `calendar-entries.ts`, `exams-panel.tsx`, `ai-chat-sheet.tsx`, `utils.ts`, `personal-todos.tsx`, `view-model.ts`, `data-parts.tsx`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._
- **What connects `RFC-1918`, `Analytics Projections Cache Policy (/api/analytics)`, `force-dynamic Public Auth-Adjacent Pages` to the rest of the system?**
  _36 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `my-tasks-view.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0611764705882353 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `format.ts`, `my-tasks-view.tsx`, `view-model.ts`, `lib/motion.ts`, `subject-deep-dive.tsx`, `subject-performance.test.ts`, `ai-settings-form.tsx`, `calendar-view.tsx`, `Add Mock Route`, `workspace-chrome.tsx`, `Mock Comparison Route`, `personal-task-drawer.tsx`, `compare-view.tsx`, `ai-composer.tsx`, `ai.ts`, `Mock Entry Form and Validation`, `ask-view.tsx`, `formatNumber`, `ai-chat-sheet.tsx`, `workspace-chrome.tsx`, `Panel`, `performance-view.tsx`, `analytics/route.ts`, `Request Proxy and Public Origins`, `next`, `icon.tsx`, `task-toolbar.tsx`, `film-section.tsx`, `trash-view.tsx`, `app/layout.tsx`, `result-editor.tsx`, `RouteError`, `queries/exams.ts`, `plan-day-view.tsx`, `mock-form.tsx`, `private-workspace.tsx`, `calendar-view.tsx`, `react`, `calendar-entries.ts`, `exams-panel.tsx`, `ai-chat-sheet.tsx`, `client-types.ts`, `api`, `personal-todos.tsx`, `view-model.ts`, `data-parts.tsx`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Should `view-model.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10779220779220779 - nodes in this community are weakly interconnected._
- **Why does `next` connect `next` to `view-model.ts`, `subject-performance.test.ts`, `workspace-chrome.tsx`, `Mock Comparison Route`, `ai-composer.tsx`, `lib/trash.ts`, `RequestError`, `ai-chat-sheet.tsx`, `workspace-chrome.tsx`, `Request Proxy and Public Origins`, `react`, `icon.tsx`, `task-toolbar.tsx`, `next.config.ts`, `performance-metrics.ts`, `trash-view.tsx`, `app/layout.tsx`, `app/page.tsx`, `RouteError`, `plan-day-view.tsx`, `private-workspace.tsx`, `calendar-entries.ts`, `requireUser`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Stack Inventory (Next 16.4.3, React 19.2, TS 5.9, Tailwind 4, Recharts 3, motion 12)` and `Private Accounts Release Notes`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._