# Graph Report - ssc-insight-2  (2026-11-21)

## Corpus Check
- 499 files · ~361,778 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 4, .css 2, .example 1)

## Summary
- 3712 nodes · 11783 edges · 171 communities (106 shown, 65 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 143 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `dffc22fa`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- calendar-entries.ts
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
- database
- package.json
- LruCache
- personal-task-drawer.tsx
- Setup and Operations Handbook
- ai-composer.tsx
- lib/trash.ts
- RequestError
- Mock Entry Form and Validation
- exam-settings.ts
- chat-composer.tsx
- trash-view.tsx
- workspace-chrome.tsx
- provider.ts
- score-forecast.ts
- coach/route.ts
- Request Proxy and Public Origins
- email-client.ts
- compare-route.tsx
- Study Plan Progress APIs
- exam-switcher.tsx
- plan-facts.ts
- rate-limit.ts
- credentials.ts
- Score Observatory verification
- performance-view.tsx
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
- ai.test.ts
- exams-panel.tsx
- Continuous Integration Validation Workflow
- cn
- formatNumber
- devDependencies
- sections.tsx
- theme-style-provider.tsx
- mock-form.tsx
- trash-view.tsx
- domain.ts
- client-types.ts
- MyTasksView
- calendar-view.tsx
- react
- shot.mjs
- Caching and Revalidation Policy
- client-types.ts
- plan-day-view.tsx
- security-panel.tsx
- sheet.tsx
- conversations.ts
- requireUser
- calendar-view.tsx
- verify-backup-transfer.mjs
- api
- next.config.ts
- Todo API Review and Ownership
- personal-todos.tsx
- view-model.ts
- fixtures.ts
- Folder-Based Routing and Upstash Rate Limiting — Design
- performance/page.tsx
- subject-deep-dive.tsx
- data-parts.tsx
- ssrf-core.ts
- Primary Architecture Handbook
- PostCSS Build Configuration
- Personal Workspace Migration Requirements
- Authenticated QA and Google Consent
- Controlled Neon Prisma Migrations
- Personal Calendar Counts and Invalidation
- Add Mock Route
- Button
- Mock Comparison Route
- ref_node_assert
- compare-view.tsx
- verify-backup-transfer.mjs
- audit.ts
- filters-url.ts
- add-route.tsx
- ask-view.tsx
- formatNumber
- Label
- reminders-panel.tsx
- atoms.tsx
- use-ai-workspace.tsx
- routes.test.ts
- Paper Tokens and Design Handover
- useToast
- form.tsx
- shortDate
- ai/todos.ts
- Review Focus
- verify-neon.mjs
- next
- ref_node_test
- vercel.json
- explain-search.ts
- verify-ownership.mjs
- verify-trash.mjs
- ai-prompt-security.test.ts
- Folder-Based Routing and Upstash Rate Limiting — Implementation Plan

## God Nodes (most connected - your core abstractions)
1. `cn()` - 314 edges
2. `Button()` - 138 edges
3. `react` - 137 edges
4. `PlainIcon()` - 135 edges
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

## Communities (171 total, 65 thin omitted)

### Community 0 - "calendar-entries.ts"
Cohesion: 0.08
Nodes (40): AgendaGroups(), AgendaView(), EarlierRanges(), CalendarMetrics(), CalendarSurface(), QuietDays(), CompactRow(), DayTicks() (+32 more)

### Community 1 - "my-tasks-view.tsx"
Cohesion: 0.07
Nodes (38): ApplyOp, ConfirmState, RescheduleState, TAB_ITEMS, OverviewStrip(), TasksEmptyState(), activeFilterEntries(), asString() (+30 more)

### Community 2 - "view-model.ts"
Cohesion: 0.12
Nodes (28): categoryLabel(), CellRow(), MonthCell(), MonthGrid, WEEKDAYS, periodTitle(), weekStart(), planTickClass() (+20 more)

### Community 4 - "command-palette.tsx"
Cohesion: 0.06
Nodes (45): AI Status Endpoint Cache Policy (/api/ai/status), Analytics Projections Cache Policy (/api/analytics), api() Client Fetch cache: no-store (src/lib/api-client.ts), Backup Export Raw File Exception (GET /api/backup), Next.js 16 Cache Components Not Enabled, Caching and Revalidation Policy (Phase 8 reference), Filters/Scope URL State Mirror (src/lib/filters-url.ts), force-dynamic Public Auth-Adjacent Pages (+37 more)

### Community 7 - "subject-performance.test.ts"
Cohesion: 0.04
Nodes (66): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, cmdk@^1.1.1, @duo-icons/react@^1.0.1, @hookform/resolvers@^5.9.2, lucide-react@^0.468.0, motion@^12.0.0 (+58 more)

### Community 8 - "ai-settings-form.tsx"
Cohesion: 0.06
Nodes (33): @hookform/resolvers, lucide-react, react-hook-form, metadata, metadata, AiSettingsForm(), chooseProvider(), fetchModels() (+25 more)

### Community 10 - "calendar-view.tsx"
Cohesion: 0.14
Nodes (28): InkArt(), FloatingAsk(), RAIL_ITEMS, SectionRail(), onScroll(), read(), Faq(), FAQ_ITEMS (+20 more)

### Community 11 - "database"
Cohesion: 0.06
Nodes (63): mutationSchema, POST, runtime, DELETE, idSchema, PUT, runtime, POST (+55 more)

### Community 14 - "personal-task-drawer.tsx"
Cohesion: 0.12
Nodes (27): AiActivity, clockLabel(), FEATURE_META, STATUS_DOT, AskRoute(), AskView(), FOLLOW_UPS, DayDrawer() (+19 more)

### Community 15 - "Setup and Operations Handbook"
Cohesion: 0.03
Nodes (108): GET, maxDuration, POST, runtime, ok(), privateHeaders, privateJson(), attemptData() (+100 more)

### Community 16 - "ai-composer.tsx"
Cohesion: 0.10
Nodes (42): recharts@^3.0.0, recharts, EmptyChart(), AttemptBreakdown(), BreakdownDonut(), DeepDive(), GroupedScoreBars(), InsightCallout() (+34 more)

### Community 17 - "lib/trash.ts"
Cohesion: 0.09
Nodes (34): Context, devHandle(), handle(), privateNoStore, runtime, GET(), accessLog(), AccessLogEvent (+26 more)

### Community 18 - "RequestError"
Cohesion: 0.06
Nodes (54): Baseline architecture, Call-site inventory (39 total), Rate limiting, zod, maxDuration, POST, runtime, DELETE (+46 more)

### Community 19 - "Mock Entry Form and Validation"
Cohesion: 0.12
Nodes (23): AppearancePanel(), PaletteChip(), StyleGlyph(), Swap(), initialPalette(), initialStyle(), microMotion(), PALETTE_IDS (+15 more)

### Community 20 - "exam-settings.ts"
Cohesion: 0.04
Nodes (110): GET, runtime, customExamInputSchema, customSubjectSchema, customTierSchema, DELETE, GET, runtime (+102 more)

### Community 21 - "chat-composer.tsx"
Cohesion: 0.20
Nodes (13): AskChatTab(), LogMockPayload, LogMockTab(), SheetUsageFooter(), SubjectRoster(), ChatComposer(), attach(), downscaleToDataUrl() (+5 more)

### Community 22 - "trash-view.tsx"
Cohesion: 0.14
Nodes (13): args, evaluate(), height, pending, problems, report, send(), settle (+5 more)

### Community 23 - "workspace-chrome.tsx"
Cohesion: 0.11
Nodes (26): dynamic, WorkspaceLayout(), GuardLedgerRow(), GuardNotice(), GuardNoticeProps, GuardRow, GuardStyles(), GuardTone (+18 more)

### Community 24 - "provider.ts"
Cohesion: 0.08
Nodes (36): aiEndpointError(), aiModelError(), aiProviderAuth(), aiProviderRateLimit(), AiContentPart, AiProvider, AiStructuredFormat, ANTHROPIC_THINKING_BUDGET (+28 more)

### Community 25 - "score-forecast.ts"
Cohesion: 0.12
Nodes (25): Accuracy Footer Divisor Column (83.3% Accuracy), Marks Obtained (70/90) and Score Strip, Outcome Card Illustration (Reasoning), Outcome Counts with Proportion Bars (Correct / Incorrect / Unattempted), Percentile Availability Note ('No standalone subject percentile recorded'), Score-Centered Answer Distribution Ring (77.8% SCORE), Serif Subject Heading with Attempt/Question Subtitle, Soft-Rounded Warm Paper Card Surface (+17 more)

### Community 26 - "coach/route.ts"
Cohesion: 0.13
Nodes (50): bodySchema, maxDuration, POST(), runtime, COACH_FORMAT, maxDuration, POST(), runtime (+42 more)

### Community 27 - "Request Proxy and Public Origins"
Cohesion: 0.10
Nodes (42): PlanCategoryLegend(), ActiveExamFooterNote(), AppFrame(), AppHeader(), AppSidebar(), HeaderLocation(), NavItem(), ThemeToggle() (+34 more)

### Community 28 - "email-client.ts"
Cohesion: 0.08
Nodes (50): readSecurityUser(), SecurityUser, useAuthSecurity(), FormError(), OtpFlow(), PanelStep, RegisterForm(), SignInCredentialsForm() (+42 more)

### Community 29 - "compare-route.tsx"
Cohesion: 0.21
Nodes (18): CompareRoute(), CompareReference, DashboardRoute(), NO_FILTERS, HistoryRoute(), PerformanceRoute(), platformsOf(), useExamScope() (+10 more)

### Community 30 - "Study Plan Progress APIs"
Cohesion: 0.19
Nodes (21): analyze(), average(), buildWhereYouStand(), comparePoints(), deepDiveFor(), DeepDiveSubject, derivedSectionPoint(), explicitSectionPoint() (+13 more)

### Community 31 - "exam-switcher.tsx"
Cohesion: 0.26
Nodes (21): BulkBar(), filterCount(), MenuOption(), PRIORITY_LABELS, SORT_LABELS, STATUS_LABELS, TaskToolbar(), TrashRow() (+13 more)

### Community 32 - "plan-facts.ts"
Cohesion: 0.07
Nodes (25): LANDING_PLAN, plan, buildLandingPlan(), category(), isMock(), LandingPlanDay, LandingPlanTask, RawDay (+17 more)

### Community 33 - "rate-limit.ts"
Cohesion: 0.07
Nodes (52): aiRateLimiter, apiRateLimiter, BREAKER_OPEN_MS, BREAKER_THRESHOLD, BreakerState, initialBreaker(), isBreakerOpen(), onFailure() (+44 more)

### Community 34 - "credentials.ts"
Cohesion: 0.20
Nodes (20): GET, dynamic, GET(), runtime, isAiThinking(), AiCredentialInput, AiCredentialSummary, credentialStorageAvailable() (+12 more)

### Community 35 - "Score Observatory verification"
Cohesion: 0.07
Nodes (54): GET, idSchema, kindSchema, runtime, POST, POST, runtime, GET (+46 more)

### Community 36 - "performance-view.tsx"
Cohesion: 0.09
Nodes (23): points(), sentence(), TONE_ICON, TONE_TEXT, AnswerStack, PerformancePoint, Distribution, DISTRIBUTION_MIN_POINTS (+15 more)

### Community 37 - "film-section.tsx"
Cohesion: 0.12
Nodes (27): attemptMeritPercentage(), CHAPTERS, COACH_ANSWER, CountNumber(), FILM_GAP_PTS, FILM_METRICS, FILM_PCT_DELTA, FILM_SUBJECT_BARS (+19 more)

### Community 38 - "compare-view.tsx"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 39 - "trash-view.tsx"
Cohesion: 0.16
Nodes (26): KindFilter, messageOf(), rowKey(), toItemRef(), TrashView(), ungroupedCount(), AttemptPagination, windowedPages() (+18 more)

### Community 40 - "Button"
Cohesion: 0.10
Nodes (15): ws@^8.22.0, ws, logs, pending, target, ws, args, logs (+7 more)

### Community 41 - "app/layout.tsx"
Cohesion: 0.09
Nodes (19): Problem, @fontsource-variable/dm-sans@^5.3.0, @fontsource-variable/source-serif-4@^5.3.1, next-themes@^0.4.6, @vercel/analytics@^2.0.1, @vercel/speed-insights@^2.0.0, @fontsource-variable/dm-sans, @fontsource-variable/source-serif-4 (+11 more)

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
Cohesion: 0.06
Nodes (62): maxDuration, PROBE_MESSAGES, runtime, aiConfig(), aiConfigOrNull(), AI_THINKING_LEVELS, AI_THINKING_VALUES, AiConfig (+54 more)

### Community 47 - "RouteError"
Cohesion: 0.15
Nodes (14): AddError(), AskError(), CalendarError(), CompareError(), DashboardError(), HistoryError(), MyTasksError(), PerformanceError() (+6 more)

### Community 48 - "extraction.ts"
Cohesion: 0.12
Nodes (27): ExtractionReview(), update(), updateSubject(), FieldIssues(), NullableDuration(), optionalNumber(), blankExtractedSubject(), deriveCounts() (+19 more)

### Community 49 - "ai.test.ts"
Cohesion: 0.08
Nodes (31): aiBusy(), parseExtraction(), AiQuotaLimits, AiQuotaUsage, chargedOnFailure(), CONTEXT_TOKEN_ESTIMATE, planReservation(), ReservationPlan (+23 more)

### Community 50 - "exams-panel.tsx"
Cohesion: 0.07
Nodes (42): CustomExamDialog(), describeTier(), ExamRow(), maxOf(), SourceSummary, StageSummary, SUBJECT_CHOICES, TierSummary (+34 more)

### Community 51 - "Continuous Integration Validation Workflow"
Cohesion: 0.20
Nodes (8): Multi-Theme System (data-palette x data-style), Palettes x Styles Theme Matrix, Typography Scale (Source Serif 4 + DM Sans), Missing Radius System Finding, Elevation Model and --shadow-pop Token, Restrained Motion Language, Tokenized Radius Scale (panel/control/card/pill), Sticky Identity Column for Mock History

### Community 52 - "cn"
Cohesion: 0.18
Nodes (9): args, evaluate(), height, pending, report, send(), target, width (+1 more)

### Community 53 - "formatNumber"
Cohesion: 0.20
Nodes (17): AttemptBreakdownPanel(), DistributionPanel(), PAD, FindingsPanel(), InsightCallout(), PerformanceView(), RadarPanel(), SubjectDeepDive() (+9 more)

### Community 54 - "devDependencies"
Cohesion: 0.06
Nodes (31): devDependencies, eslint@^9.0.0, eslint-config-next@^16.0.0, prettier@^3.9.10, prisma@7.10.1, react-is@^19.3.1, tailwindcss@^4.0.0, @tailwindcss/postcss@^4.0.0 (+23 more)

### Community 55 - "sections.tsx"
Cohesion: 0.20
Nodes (10): Request and Ownership Architecture, Neon Agent Tooling Setup (Codex plugin + MCP), Expiring QA Branch Migration Rehearsal, Selected Neon Environment (org/project/branch), Private-Accounts Migration (claim two shared mocks), Session-Derived Ownership Model, Isolation and Ownership Verification, Google Sign-In via Neon Auth OAuth (+2 more)

### Community 56 - "theme-style-provider.tsx"
Cohesion: 0.17
Nodes (12): scripts, build, check, db:generate, db:migrate, dev, lint, postinstall (+4 more)

### Community 57 - "mock-form.tsx"
Cohesion: 0.15
Nodes (26): DurationInput(), change(), formatParts(), blankSubject(), defaultTierId(), fullMockSectionHeading(), meritSubjectIds(), MockForm() (+18 more)

### Community 58 - "trash-view.tsx"
Cohesion: 0.20
Nodes (9): Confirmed requirements, Dated personal todos and AI-assisted planning, Existing foundation, Finalized navigation and lifecycle, Phase 1 — Design the dated planner and review flow, Phase 2 — Extend task storage and manual workflows, Phase 3 — Add AI proposal and confirmed-apply workflows, Phase 4 — Validate and document (+1 more)

### Community 59 - "domain.ts"
Cohesion: 0.14
Nodes (16): filterAttempts(), attemptListSchema, duplicateKey(), MAIN_SUBJECT_IDS, optionalNumber, parseTime(), PatternShape, PatternSubjects (+8 more)

### Community 60 - "client-types.ts"
Cohesion: 0.25
Nodes (5): Dashboard Analytical Scopes (full/subject/sectional/all), Backup Format v2 and Account Transfer, Semantic Chart Palette and Chart Rules, Core Product Workflows, JSON Backup Format Version 2

### Community 61 - "MyTasksView"
Cohesion: 0.15
Nodes (14): MyTasksView(), bulkRescheduleApply(), bulkStatus(), bulkTrashSelected(), clearSelection(), createTask(), cycleStatus(), duplicate() (+6 more)

### Community 62 - "calendar-view.tsx"
Cohesion: 0.17
Nodes (19): AssistantBody(), ChatTranscript(), ChatTranscriptProps, EditButton(), ReasoningTrace(), TurnActions, TurnActionsProps, CopyButton() (+11 more)

### Community 63 - "react"
Cohesion: 0.12
Nodes (25): radix-ui, react, BackupPreviewCard(), DataPanel(), SettingsRoute(), ActiveTargetCard(), DefaultRow(), describeSignature() (+17 more)

### Community 64 - "shot.mjs"
Cohesion: 0.40
Nodes (6): Known Limitations (duo-icons fill-rule, native inputs), Design System Source-of-Truth Map, Icon Inconsistency Finding (14 ad-hoc sizes), Icon Size Scale (14/16/18/22/28), Named Imports for Bundle Reduction, Raw Lucide Imports Migrated into Semantic Icon Map

### Community 68 - "Caching and Revalidation Policy"
Cohesion: 0.50
Nodes (5): WorkspaceShell Client Orchestrator and Its Three Hooks, dashboard.tsx Monolith Split Finding, UI Baseline Audit Findings (26 prioritized items), 15-Phase Execution Order, Unified Segmented Control (.segment-group)

### Community 69 - "client-types.ts"
Cohesion: 0.11
Nodes (18): AiConfigSource, AiCredentialSummary, AiModelsResponse, AiResponseUsage, AiScreenContext, AiSettingsResponse, AiSourceState, AiStatus (+10 more)

### Community 70 - "plan-day-view.tsx"
Cohesion: 0.21
Nodes (21): DaySections(), AttemptEntryRow(), entryPlanRow(), PersonalEntryRow(), PlanEntryRow(), RevisionEntryRow(), SectionHead(), StatusDot() (+13 more)

### Community 71 - "security-panel.tsx"
Cohesion: 0.14
Nodes (34): AboutPanel(), ExamsPanel(), MotionButton, describeDevice(), EnrollStep, initialsOf(), SecurityPanel(), SessionsCard() (+26 more)

### Community 72 - "sheet.tsx"
Cohesion: 0.17
Nodes (20): AiPlanSheet(), TrashDetailSheet(), AiChatSheet(), EmailAuthButton(), Masthead(), onScroll(), read(), NAV (+12 more)

### Community 73 - "conversations.ts"
Cohesion: 0.22
Nodes (12): CONVERSATIONS_STORAGE_KEY, isRole(), loadConversations(), MAX_CONVERSATION_MESSAGES, MAX_CONVERSATIONS, parseConversation(), parseMessage(), parseStoredConversations() (+4 more)

### Community 74 - "requireUser"
Cohesion: 0.12
Nodes (42): Task 7: RSC foundation, Tasks 8–19: Route migrations, GET, GET, AddPage(), dynamic, AskPage(), dynamic (+34 more)

### Community 75 - "calendar-view.tsx"
Cohesion: 0.07
Nodes (45): CalendarToolbar(), LayerToggles(), CalendarLegend(), PeriodNav(), stepSize(), UNIT, CalendarLoading(), CalendarView() (+37 more)

### Community 89 - "api"
Cohesion: 0.08
Nodes (42): Client State Architecture Audit — 2026-10-31, Design decisions, Findings, Standing gaps (out of scope, recorded), dynamic, MyTasksPage(), MyTasksRoute(), TodoAiComposerInner() (+34 more)

### Community 124 - "personal-todos.tsx"
Cohesion: 0.14
Nodes (20): Migration roadmap (executed order), categoryMeta(), Group, GroupRow(), KanbanBoard(), PageLayout, PersonalTodos(), clearSelection() (+12 more)

### Community 125 - "view-model.ts"
Cohesion: 0.10
Nodes (27): BoardView(), handleDrop(), columnFor(), COLUMNS, AiSheetTaskApi, TaskSuggestionCard(), nextStatus(), PersonalTaskDisplayStatus (+19 more)

### Community 126 - "fixtures.ts"
Cohesion: 0.12
Nodes (18): AttemptInput, buildAttempt(), FULL_ROWS, LANDING_ATTEMPTS, LANDING_FULL_MOCKS, LANDING_LATEST, LANDING_SCOPES, LANDING_TARGET (+10 more)

### Community 127 - "Folder-Based Routing and Upstash Rate Limiting — Design"
Cohesion: 0.18
Nodes (10): Architecture, Colocation rule, Decisions, Folder-Based Routing and Upstash Rate Limiting — Design, Goals, Invariants that must not move, Non-goals, Redistribution of the shell's local state (+2 more)

### Community 128 - "performance/page.tsx"
Cohesion: 0.19
Nodes (12): @tanstack/react-query, dynamic, dynamic, TrashPage(), Filters, analyticsKeys, analyticsQueryOptions(), serializeAnalyticsParams() (+4 more)

### Community 129 - "subject-deep-dive.tsx"
Cohesion: 0.15
Nodes (21): accuracyTone(), DeepDiveCards(), PAD, SUBJECT_TOKENS, SubjectLineChart(), TONE_CLASS, AreaTrendChart(), PAD (+13 more)

### Community 130 - "data-parts.tsx"
Cohesion: 0.20
Nodes (15): DuotoneIcon(), LANDING_SUMMARY, AiPanel(), DashboardScreen(), CHART, CHIP_TONES, MockChip(), MockLedger() (+7 more)

### Community 131 - "ssrf-core.ts"
Cohesion: 0.26
Nodes (11): RFC-1918, assertSafeBaseUrl(), assertSafeBaseUrlShape(), BLOCKED_HOSTNAMES, inV4Range(), ipv4Octets(), isBlockedAddress(), parseBaseUrl() (+3 more)

### Community 139 - "Add Mock Route"
Cohesion: 0.14
Nodes (27): BrowserFrame(), MockupCaption(), CompareScreen(), delta(), duration(), accuracyTone(), ChipTone, MockStat() (+19 more)

### Community 140 - "Button"
Cohesion: 0.14
Nodes (25): DayLedger(), EmptyActions(), LoadLine(), DayActions, ErrorState(), SelectionBar(), PlanRail(), QuickAddBar() (+17 more)

### Community 141 - "Mock Comparison Route"
Cohesion: 0.06
Nodes (69): collectCursors(), GET, runtime, NAV_GROUPS, planHref(), CommandPalette(), CommandPaletteProps, loadRecentSearches() (+61 more)

### Community 142 - "ref_node_assert"
Cohesion: 0.07
Nodes (27): targetMarks(), Marking, SubjectResult, attemptSchema, input, AttemptSeed, MARKING, T1 (+19 more)

### Community 143 - "compare-view.tsx"
Cohesion: 0.13
Nodes (33): buildComparison(), buildSectionRows(), ChangeCell(), CompareView, Comparison, ComparisonLedger(), ComparisonRow, PickerRow() (+25 more)

### Community 144 - "verify-backup-transfer.mjs"
Cohesion: 0.29
Nodes (8): api(), backup(), cookies, preview(), raw(), replace(), settings, user()

### Community 145 - "audit.ts"
Cohesion: 0.13
Nodes (14): bearerToken(), GET, maxDuration, runtime, secretMatches(), dynamic, GET, HealthStatus (+6 more)

### Community 146 - "filters-url.ts"
Cohesion: 0.14
Nodes (20): FiltersState, ATTEMPT_SORT_KEYS, dashboardScopeSchema, filtersSchema, PageSize, SortKey, DEFAULT_SCOPE, defaultListState (+12 more)

### Community 147 - "add-route.tsx"
Cohesion: 0.27
Nodes (11): AddMockView(), AddRoute(), AddRouteInner(), CalendarRoute(), PlanDayRoute(), useAllAttempts(), safeWorkspaceReturnTo(), AiChatTab (+3 more)

### Community 148 - "ask-view.tsx"
Cohesion: 0.31
Nodes (10): ConversationGroup, ConversationList, ConversationRow, groupConversations(), relativeLabel(), startOfDay(), startOfWeek(), ChatHistoryApi (+2 more)

### Community 149 - "formatNumber"
Cohesion: 0.15
Nodes (15): motion, Axis, SUBJECT_TOKENS, ChatEmptyState(), READS, SUGGESTIONS, DUR, EASE (+7 more)

### Community 150 - "Label"
Cohesion: 0.22
Nodes (13): DisableTwoFactorDialog(), EnrollDialog(), RegenerateCodesDialog(), close(), AuthPanelDialog(), TotpStep(), DialogContent, DialogDescription (+5 more)

### Community 151 - "reminders-panel.tsx"
Cohesion: 0.15
Nodes (17): pageEnter, Reveal(), RevealItem(), saveBarSpring, staggerContainer, staggerItem, switchBounce, tabSwap (+9 more)

### Community 152 - "atoms.tsx"
Cohesion: 0.23
Nodes (9): CountUp(), FloatingInk(), Petals, PetalSpec, TypedLine(), HeroArt(), Hero(), LedgerFacts() (+1 more)

### Community 153 - "use-ai-workspace.tsx"
Cohesion: 0.15
Nodes (18): AiWorkspace, AiWorkspaceContext, INSIGHT_REQUEST_TEXT, insightToChatText(), newId(), trimChatHistory(), useAiWorkspaceState(), chatBaseForSend() (+10 more)

### Community 154 - "routes.test.ts"
Cohesion: 0.22
Nodes (11): The layout keeps only what must survive navigation, AppHeaderProps, VIEW_META, AI_VIEWS, APP_VIEWS, AppView, PATH_VIEW, VIEW_HREF (+3 more)

### Community 155 - "Paper Tokens and Design Handover"
Cohesion: 0.20
Nodes (9): args, evaluate(), pending, send(), target, url, wait, widths (+1 more)

### Community 156 - "useToast"
Cohesion: 0.15
Nodes (15): useAuthActions(), signIn(), GoogleGlyph(), GoogleSignInButton(), signIn(), GoogleSignInButtonProps, Toast, ToastApi (+7 more)

### Community 157 - "form.tsx"
Cohesion: 0.23
Nodes (10): FormControl, FormDescription, FormFieldContext, FormFieldContextValue, FormItem, FormItemContext, FormItemContextValue, FormLabel (+2 more)

### Community 158 - "shortDate"
Cohesion: 0.13
Nodes (39): Loading, error and not-found surfaces, DashboardPlanApi, PersonalTasksPanel(), PipelineProgressSection(), PipelineRevisionSection(), PipelineUpcomingSection(), PlanApi, PlanWithToday (+31 more)

### Community 159 - "ai/todos.ts"
Cohesion: 0.23
Nodes (10): MAX_TODO_PROMPT_CHARS, parseTodoProposals(), Target, TODO_DATE_QUESTION, todoDraftRequestSchema, TodoProposal, todoProposalSchema, todoOperationSchema (+2 more)

### Community 160 - "Review Focus"
Cohesion: 0.20
Nodes (10): Review Focus, Task 0: Toolchain and baseline, Task 1: Spec and plan documents, Task 20: Retire the shell, Task 21: Verification and documentation closeout, Task 2: Route, colocation and client-boundary guards, Task 3: Pure rate-limit policy, Task 4: Command budget and Upstash adapter (+2 more)

### Community 161 - "verify-neon.mjs"
Cohesion: 0.50
Nodes (4): api(), full, ids, raw()

### Community 162 - "next"
Cohesion: 0.09
Nodes (19): cspDev, cspProduction, nextConfig, productionHeaders, next, GET, runtime, dynamic (+11 more)

### Community 163 - "ref_node_test"
Cohesion: 0.12
Nodes (10): packageDir, REPLACEMENTS, targets, root, allSourceFiles(), APP, privateFiles(), ROOT (+2 more)

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
Cohesion: 0.08
Nodes (39): AiContext, average(), buildAiContext(), fullMockProfile(), payload(), recentFullMock(), sectionProfile(), subjectProfile() (+31 more)

### Community 171 - "Folder-Based Routing and Upstash Rate Limiting — Implementation Plan"
Cohesion: 0.40
Nodes (4): Baseline and environment facts (measured in Task 0), Folder-Based Routing and Upstash Rate Limiting — Implementation Plan, Global Constraints, Rulings carried into this plan

## Ambiguous Edges - Review These
- `Stack Inventory (Next 16.4.3, React 19.2, TS 5.9, Tailwind 4, Recharts 3, motion 12)` → `Private Accounts Release Notes`  [AMBIGUOUS]
  docs/ui-overhaul/phase-1-audit.md · relation: conceptually_related_to

## Knowledge Gaps
- **36 isolated node(s):** `RFC-1918`, `Analytics Projections Cache Policy (/api/analytics)`, `force-dynamic Public Auth-Adjacent Pages`, `Health Endpoint Rate-Limit-Exempt (/api/health)`, `Firebase/Mongo Runtime Dependencies Removed` (+31 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1137 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **65 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Request Proxy and Public Origins` to `calendar-entries.ts`, `my-tasks-view.tsx`, `view-model.ts`, `subject-deep-dive.tsx`, `data-parts.tsx`, `ai-settings-form.tsx`, `calendar-view.tsx`, `Add Mock Route`, `Button`, `Mock Comparison Route`, `personal-task-drawer.tsx`, `compare-view.tsx`, `ai-composer.tsx`, `Mock Entry Form and Validation`, `ask-view.tsx`, `chat-composer.tsx`, `Label`, `formatNumber`, `atoms.tsx`, `reminders-panel.tsx`, `email-client.ts`, `compare-route.tsx`, `shortDate`, `exam-switcher.tsx`, `form.tsx`, `film-section.tsx`, `trash-view.tsx`, `RouteSkeleton`, `exams-panel.tsx`, `formatNumber`, `MyTasksView`, `calendar-view.tsx`, `react`, `plan-day-view.tsx`, `security-panel.tsx`, `sheet.tsx`, `calendar-view.tsx`, `api`, `personal-todos.tsx`, `view-model.ts`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **What connects `RFC-1918`, `Analytics Projections Cache Policy (/api/analytics)`, `force-dynamic Public Auth-Adjacent Pages` to the rest of the system?**
  _36 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `calendar-entries.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08245981830887492 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `calendar-entries.ts`, `my-tasks-view.tsx`, `view-model.ts`, `subject-deep-dive.tsx`, `data-parts.tsx`, `subject-performance.test.ts`, `ai-settings-form.tsx`, `calendar-view.tsx`, `Add Mock Route`, `Button`, `Mock Comparison Route`, `personal-task-drawer.tsx`, `compare-view.tsx`, `ai-composer.tsx`, `filters-url.ts`, `add-route.tsx`, `Mock Entry Form and Validation`, `formatNumber`, `chat-composer.tsx`, `reminders-panel.tsx`, `atoms.tsx`, `workspace-chrome.tsx`, `ask-view.tsx`, `Request Proxy and Public Origins`, `email-client.ts`, `compare-route.tsx`, `shortDate`, `exam-switcher.tsx`, `useToast`, `form.tsx`, `use-ai-workspace.tsx`, `film-section.tsx`, `trash-view.tsx`, `app/layout.tsx`, `result-editor.tsx`, `RouteError`, `extraction.ts`, `exams-panel.tsx`, `formatNumber`, `mock-form.tsx`, `calendar-view.tsx`, `plan-day-view.tsx`, `security-panel.tsx`, `sheet.tsx`, `calendar-view.tsx`, `api`, `Label`, `personal-todos.tsx`, `view-model.ts`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Should `my-tasks-view.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07020408163265306 - nodes in this community are weakly interconnected._
- **Why does `next` connect `next` to `subject-performance.test.ts`, `ai-settings-form.tsx`, `Button`, `Mock Comparison Route`, `ai-composer.tsx`, `lib/trash.ts`, `filters-url.ts`, `add-route.tsx`, `RequestError`, `chat-composer.tsx`, `workspace-chrome.tsx`, `Request Proxy and Public Origins`, `compare-route.tsx`, `shortDate`, `trash-view.tsx`, `app/layout.tsx`, `RouteError`, `requireUser`, `calendar-view.tsx`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Stack Inventory (Next 16.4.3, React 19.2, TS 5.9, Tailwind 4, Recharts 3, motion 12)` and `Private Accounts Release Notes`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._