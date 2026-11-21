# Graph Report - ssc-insight-2  (2026-11-21)

## Corpus Check
- 499 files · ~363,679 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 4, .css 2, .example 1)

## Summary
- 3718 nodes · 11816 edges · 169 communities (101 shown, 68 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 143 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `04a80dc8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- view-model.ts
- my-tasks-view.tsx
- progress.ts
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
- repository.ts
- personal-task-drawer.tsx
- Setup and Operations Handbook
- ai-composer.tsx
- lib/trash.ts
- RequestError
- Mock Entry Form and Validation
- exam-settings.ts
- chat-composer.tsx
- trash-view.tsx
- private-workspace.tsx
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
- loadExamContext
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
- rate-limit-upstash.ts
- queries/exams.ts
- Continuous Integration Validation Workflow
- cn
- email-schemas.ts
- devDependencies
- sections.tsx
- theme-style-provider.tsx
- mock-form.tsx
- trash-view.tsx
- domain.ts
- client-types.ts
- (workspace)/layout.tsx
- calendar-view.tsx
- react
- shot.mjs
- Caching and Revalidation Policy
- SecurityPanel
- plan-day-view.tsx
- exams-panel.tsx
- sheet.tsx
- rate-limit-budget.ts
- requireUser
- GoogleSignInButton
- verify-backup-transfer.mjs
- api
- next.config.ts
- Todo API Review and Ownership
- format.ts
- ProviderStreamDecoder
- fixtures.ts
- Architecture
- performance/page.tsx
- Panel
- useIsMobile
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
- escalatedRetryAfter
- usage/route.ts
- formatNumber
- Label
- settings-view.tsx
- plan/[date]/not-found.tsx
- use-ai-workspace.tsx
- routes.test.ts
- Paper Tokens and Design Handover
- workspace-chrome.tsx
- form.tsx
- react
- week/[date]/not-found.tsx
- Review Focus
- next.config.ts
- ref_node_test
- vercel.json
- explain-search.ts
- verify-ownership.mjs
- verify-trash.mjs
- ai-prompt-security.test.ts

## God Nodes (most connected - your core abstractions)
1. `cn()` - 314 edges
2. `Button()` - 139 edges
3. `react` - 137 edges
4. `PlainIcon()` - 135 edges
5. `SSC Insight Architecture` - 104 edges
6. `SSC Insight Architecture` - 104 edges
7. `shortDate()` - 88 edges
8. `database()` - 75 edges
9. `README.md SSC Insight` - 73 edges
10. `RequestError` - 66 edges

## Surprising Connections (you probably didn't know these)
- `Design decisions` --references--> `ApiError`  [INFERRED]
  docs/state-audit.md → src/lib/api-client.ts
- `Global Constraints` --references--> `requireUser()`  [INFERRED]
  docs/superpowers/plans/2026-11-20-folder-routing.md → src/lib/auth/require-user.ts
- `Task 2: Route, colocation and client-boundary guards` --references--> `requireUser()`  [INFERRED]
  docs/superpowers/plans/2026-11-20-folder-routing.md → src/lib/auth/require-user.ts
- `Risk register` --references--> `requireUser()`  [INFERRED]
  docs/superpowers/specs/2026-11-20-folder-routing-design.md → src/lib/auth/require-user.ts
- `Server prefetch contract` --references--> `requireUser()`  [INFERRED]
  docs/superpowers/specs/2026-11-20-folder-routing-design.md → src/lib/auth/require-user.ts

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

## Communities (169 total, 68 thin omitted)

### Community 0 - "view-model.ts"
Cohesion: 0.05
Nodes (93): AgendaGroups(), AgendaView(), EarlierRanges(), CalendarMetrics(), CalendarSurface(), CalendarToolbar(), categoryLabel(), QuietDays() (+85 more)

### Community 1 - "my-tasks-view.tsx"
Cohesion: 0.05
Nodes (55): lucide-react, metadata, metadata, BoardView(), handleDrop(), columnFor(), COLUMNS, ApplyOp (+47 more)

### Community 2 - "progress.ts"
Cohesion: 0.10
Nodes (29): mutationSchema, POST, runtime, GET, runtime, DELETE, idSchema, PUT (+21 more)

### Community 4 - "command-palette.tsx"
Cohesion: 0.06
Nodes (45): AI Status Endpoint Cache Policy (/api/ai/status), Analytics Projections Cache Policy (/api/analytics), api() Client Fetch cache: no-store (src/lib/api-client.ts), Backup Export Raw File Exception (GET /api/backup), Next.js 16 Cache Components Not Enabled, Caching and Revalidation Policy (Phase 8 reference), Filters/Scope URL State Mirror (src/lib/filters-url.ts), force-dynamic Public Auth-Adjacent Pages (+37 more)

### Community 7 - "subject-performance.test.ts"
Cohesion: 0.04
Nodes (66): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, cmdk@^1.1.1, @duo-icons/react@^1.0.1, @hookform/resolvers@^5.9.2, lucide-react@^0.468.0, motion@^12.0.0 (+58 more)

### Community 8 - "ai-settings-form.tsx"
Cohesion: 0.11
Nodes (23): AiSettingsForm(), chooseProvider(), fetchModels(), patchFields(), payloadFrom(), remove(), test(), Catalog (+15 more)

### Community 10 - "calendar-view.tsx"
Cohesion: 0.11
Nodes (32): dynamic, LandingPage(), metadata, FloatingAsk(), RAIL_ITEMS, SectionRail(), onScroll(), read() (+24 more)

### Community 11 - "database"
Cohesion: 0.10
Nodes (35): GET, runtime, DELETE, PATCH, runtime, DELETE, GET, POST (+27 more)

### Community 13 - "repository.ts"
Cohesion: 0.13
Nodes (31): GET, attemptData(), attemptInclude, attemptWhere(), mapSubjects(), StoredAnalyticsAttempt, StoredAttempt, toAnalyticsAttempt() (+23 more)

### Community 14 - "personal-task-drawer.tsx"
Cohesion: 0.11
Nodes (32): AiActivity, clockLabel(), FEATURE_META, STATUS_DOT, AskView(), FOLLOW_UPS, DayDrawer(), blankTask() (+24 more)

### Community 15 - "Setup and Operations Handbook"
Cohesion: 0.03
Nodes (71): dynamic, SettingsPage(), SettingsRoute(), useBackupImport(), assertSummary(), attemptLabel(), backfillLegacyQualifying(), BACKUP_FORMAT (+63 more)

### Community 16 - "ai-composer.tsx"
Cohesion: 0.10
Nodes (42): recharts@^3.0.0, recharts, EmptyChart(), AttemptBreakdown(), BreakdownDonut(), DeepDive(), GroupedScoreBars(), InsightCallout() (+34 more)

### Community 17 - "lib/trash.ts"
Cohesion: 0.09
Nodes (34): Context, devHandle(), handle(), privateNoStore, runtime, GET(), accessLog(), AccessLogEvent (+26 more)

### Community 18 - "RequestError"
Cohesion: 0.07
Nodes (59): Baseline architecture, Call-site inventory (39 total), zod, maxDuration, POST, runtime, maxDuration, POST (+51 more)

### Community 19 - "Mock Entry Form and Validation"
Cohesion: 0.13
Nodes (20): AppearancePanel(), PaletteChip(), StyleGlyph(), initialPalette(), initialStyle(), PALETTE_IDS, PALETTE_STORAGE_KEY, PaletteId (+12 more)

### Community 20 - "exam-settings.ts"
Cohesion: 0.04
Nodes (93): GET, GET, PATCH, preferencesSchema, runtime, scopePayload(), settingsSchema, targetEditSchema (+85 more)

### Community 21 - "chat-composer.tsx"
Cohesion: 0.26
Nodes (9): AskChatTab(), ChatComposer(), attach(), downscaleToDataUrl(), IMAGE_MAX_EDGE, IMAGE_QUALITY, isImageFile(), MAX_ATTACHED_IMAGES (+1 more)

### Community 22 - "trash-view.tsx"
Cohesion: 0.14
Nodes (13): args, evaluate(), height, pending, problems, report, send(), settle (+5 more)

### Community 23 - "private-workspace.tsx"
Cohesion: 0.25
Nodes (10): GuardLedgerRow(), GuardNotice(), GuardNoticeProps, GuardRow, GuardStyles(), GuardTone, PrivateWorkspace(), PrivateWorkspaceProps (+2 more)

### Community 24 - "provider.ts"
Cohesion: 0.09
Nodes (54): aiAborted(), AiBillability, aiBusy(), aiEndpointError(), AiError, AiErrorCode, aiInvalidOutput(), aiModelError() (+46 more)

### Community 25 - "score-forecast.ts"
Cohesion: 0.12
Nodes (25): Accuracy Footer Divisor Column (83.3% Accuracy), Marks Obtained (70/90) and Score Strip, Outcome Card Illustration (Reasoning), Outcome Counts with Proportion Bars (Correct / Incorrect / Unattempted), Percentile Availability Note ('No standalone subject percentile recorded'), Score-Centered Answer Distribution Ring (77.8% SCORE), Serif Subject Heading with Attempt/Question Subtitle, Soft-Rounded Warm Paper Card Surface (+17 more)

### Community 26 - "coach/route.ts"
Cohesion: 0.09
Nodes (55): bodySchema, maxDuration, POST(), runtime, COACH_FORMAT, maxDuration, POST(), runtime (+47 more)

### Community 27 - "Request Proxy and Public Origins"
Cohesion: 0.10
Nodes (40): PlanCategoryLegend(), ActiveExamFooterNote(), AppFrame(), AppHeader(), AppSidebar(), HeaderLocation(), NavItem(), ThemeToggle() (+32 more)

### Community 28 - "email-client.ts"
Cohesion: 0.14
Nodes (29): readSecurityUser(), SecurityUser, useAuthSecurity(), authClient, AuthFailureReason, authGet(), authPost(), AuthSessionRow (+21 more)

### Community 29 - "compare-route.tsx"
Cohesion: 0.18
Nodes (22): CompareRoute(), CompareReference, HistoryRoute(), PerformanceRoute(), platformsOf(), useExamScope(), ScopeFilters(), SCOPES (+14 more)

### Community 30 - "Study Plan Progress APIs"
Cohesion: 0.12
Nodes (31): AiContext, average(), fullMockProfile(), payload(), recentFullMock(), sectionProfile(), subjectProfile(), analyze() (+23 more)

### Community 31 - "exam-switcher.tsx"
Cohesion: 0.12
Nodes (35): BulkBar(), filterCount(), MenuOption(), PRIORITY_LABELS, SORT_LABELS, STATUS_LABELS, TaskToolbar(), asString() (+27 more)

### Community 32 - "plan-facts.ts"
Cohesion: 0.07
Nodes (27): CountUp(), LedgerFacts(), LANDING_PLAN, plan, buildLandingPlan(), category(), isMock(), LandingPlanData (+19 more)

### Community 33 - "rate-limit.ts"
Cohesion: 0.13
Nodes (26): aiRateLimiter, apiRateLimiter, Bucket, AI_L2_COST, AI_RATE_LIMIT, AI_WINDOW_SECONDS, BudgetState, decideRateLimit() (+18 more)

### Community 34 - "credentials.ts"
Cohesion: 0.21
Nodes (20): DELETE, GET, PUT, runtime, isAiThinking(), AiCredentialInput, AiCredentialSummary, credentialStorageAvailable() (+12 more)

### Community 35 - "Score Observatory verification"
Cohesion: 0.07
Nodes (56): GET, idSchema, kindSchema, runtime, POST, runtime, GET, runtime (+48 more)

### Community 36 - "loadExamContext"
Cohesion: 0.23
Nodes (21): GET, GET, AddPage(), dynamic, ComparePage(), dynamic, dynamic, HistoryPage() (+13 more)

### Community 37 - "film-section.tsx"
Cohesion: 0.12
Nodes (27): attemptMeritPercentage(), CHAPTERS, COACH_ANSWER, CountNumber(), FILM_GAP_PTS, FILM_METRICS, FILM_PCT_DELTA, FILM_SUBJECT_BARS (+19 more)

### Community 38 - "compare-view.tsx"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 39 - "trash-view.tsx"
Cohesion: 0.17
Nodes (27): KindFilter, messageOf(), rowKey(), toItemRef(), TrashView(), ungroupedCount(), AttemptPagination, windowedPages() (+19 more)

### Community 40 - "Button"
Cohesion: 0.10
Nodes (15): ws@^8.22.0, ws, logs, pending, target, ws, args, logs (+7 more)

### Community 41 - "app/layout.tsx"
Cohesion: 0.07
Nodes (25): Decisions, Folder-Based Routing and Upstash Rate Limiting — Design, Goals, Invariants that must not move, Non-goals, Problem, Risk register, @fontsource-variable/dm-sans@^5.3.0 (+17 more)

### Community 42 - "RouteSkeleton"
Cohesion: 0.25
Nodes (18): AddLoading(), AskLoading(), CalendarLoading(), CompareLoading(), DashboardLoading(), HistoryLoading(), MytasksLoading(), PerformanceLoading() (+10 more)

### Community 43 - "result-editor.tsx"
Cohesion: 0.25
Nodes (11): NumberField, ResultEditor(), fill(), Attempt, fillFromAttempt(), isLoggableType(), matchAttemptForTask(), namesMatch() (+3 more)

### Community 44 - "api"
Cohesion: 0.12
Nodes (15): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+7 more)

### Community 45 - "requireUser"
Cohesion: 0.12
Nodes (15): jobs, validate, name, permissions, contents, run, uses, with (+7 more)

### Community 46 - "connection-input.ts"
Cohesion: 0.07
Nodes (57): AI_THINKING_LEVELS, AI_THINKING_VALUES, AiConfig, AiThinking, DEFAULT_AI_BASE_URL, Env, integerEnv(), normaliseBaseUrl() (+49 more)

### Community 47 - "RouteError"
Cohesion: 0.15
Nodes (14): AddError(), AskError(), CalendarError(), CompareError(), DashboardError(), HistoryError(), MyTasksError(), PerformanceError() (+6 more)

### Community 48 - "extraction.ts"
Cohesion: 0.12
Nodes (29): LogMockTab(), SubjectRoster(), ExtractionReview(), update(), updateSubject(), FieldIssues(), NullableDuration(), optionalNumber() (+21 more)

### Community 49 - "rate-limit-upstash.ts"
Cohesion: 0.23
Nodes (16): BREAKER_OPEN_MS, BREAKER_THRESHOLD, BreakerState, initialBreaker(), isBreakerOpen(), onFailure(), onSuccess(), tickBreaker() (+8 more)

### Community 50 - "queries/exams.ts"
Cohesion: 0.16
Nodes (16): ExamScope, ExamScopeContext, ExamScopeProvider(), tierLabelFallback(), activeExamPattern(), CustomExamDto, CustomTierDto, EffectiveTargetDto (+8 more)

### Community 51 - "Continuous Integration Validation Workflow"
Cohesion: 0.20
Nodes (8): Multi-Theme System (data-palette x data-style), Palettes x Styles Theme Matrix, Typography Scale (Source Serif 4 + DM Sans), Missing Radius System Finding, Elevation Model and --shadow-pop Token, Restrained Motion Language, Tokenized Radius Scale (panel/control/card/pill), Sticky Identity Column for Mock History

### Community 52 - "cn"
Cohesion: 0.18
Nodes (9): args, evaluate(), height, pending, report, send(), target, width (+1 more)

### Community 53 - "email-schemas.ts"
Cohesion: 0.14
Nodes (17): authEmailSchema, authNameSchema, authOtpSchema, authPasswordSchema, authTotpSchema, changePasswordSchema, ChangePasswordValues, otpRequestSchema (+9 more)

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
Cohesion: 0.16
Nodes (25): DurationInput(), change(), formatParts(), blankSubject(), defaultTierId(), fullMockSectionHeading(), meritSubjectIds(), MockForm() (+17 more)

### Community 58 - "trash-view.tsx"
Cohesion: 0.20
Nodes (9): Confirmed requirements, Dated personal todos and AI-assisted planning, Existing foundation, Finalized navigation and lifecycle, Phase 1 — Design the dated planner and review flow, Phase 2 — Extend task storage and manual workflows, Phase 3 — Add AI proposal and confirmed-apply workflows, Phase 4 — Validate and document (+1 more)

### Community 59 - "domain.ts"
Cohesion: 0.08
Nodes (27): Client State Architecture Audit — 2026-10-31, Design decisions, Findings, Standing gaps (out of scope, recorded), filterAttempts(), ASC_SORTERS, AttemptSortRow, buildAttemptStats() (+19 more)

### Community 60 - "client-types.ts"
Cohesion: 0.25
Nodes (5): Dashboard Analytical Scopes (full/subject/sectional/all), Backup Format v2 and Account Transfer, Semantic Chart Palette and Chart Rules, Core Product Workflows, JSON Backup Format Version 2

### Community 61 - "(workspace)/layout.tsx"
Cohesion: 0.21
Nodes (10): dynamic, WorkspaceLayout(), QueryProvider(), ToastProvider(), AiWorkspaceProvider(), AccountUser, LookupResult, SessionError (+2 more)

### Community 62 - "calendar-view.tsx"
Cohesion: 0.16
Nodes (20): AssistantBody(), ChatTranscript(), ChatTranscriptProps, EditButton(), ReasoningTrace(), TurnActions, TurnActionsProps, CopyButton() (+12 more)

### Community 63 - "react"
Cohesion: 0.13
Nodes (28): BackupPreviewCard(), DataPanel(), ActiveTargetCard(), DefaultRow(), describeSignature(), PercentileExplainer(), PercentileRow(), sourceLabel() (+20 more)

### Community 64 - "shot.mjs"
Cohesion: 0.40
Nodes (6): Known Limitations (duo-icons fill-rule, native inputs), Design System Source-of-Truth Map, Icon Inconsistency Finding (14 ad-hoc sizes), Icon Size Scale (14/16/18/22/28), Named Imports for Bundle Reduction, Raw Lucide Imports Migrated into Semantic Icon Map

### Community 68 - "Caching and Revalidation Policy"
Cohesion: 0.50
Nodes (5): WorkspaceShell Client Orchestrator and Its Three Hooks, dashboard.tsx Monolith Split Finding, UI Baseline Audit Findings (26 prioritized items), 15-Phase Execution Order, Unified Segmented Control (.segment-group)

### Community 69 - "SecurityPanel"
Cohesion: 0.27
Nodes (10): AboutPanel(), initialsOf(), SecurityPanel(), Avatar, AvatarFallback, AvatarImage, Badge(), BadgeProps (+2 more)

### Community 70 - "plan-day-view.tsx"
Cohesion: 0.13
Nodes (28): DaySections(), AttemptEntryRow(), entryPlanRow(), PersonalEntryRow(), PlanEntryRow(), RevisionEntryRow(), SectionHead(), StatusDot() (+20 more)

### Community 71 - "exams-panel.tsx"
Cohesion: 0.13
Nodes (31): @hookform/resolvers, react-hook-form, CustomExamDialog(), describeTier(), ExamRow(), ExamsPanel(), maxOf(), SourceSummary (+23 more)

### Community 72 - "sheet.tsx"
Cohesion: 0.17
Nodes (20): AiPlanSheet(), TrashDetailSheet(), AiChatSheet(), EmailAuthButton(), Masthead(), onScroll(), read(), NAV (+12 more)

### Community 73 - "rate-limit-budget.ts"
Cohesion: 0.49
Nodes (8): budgetState, checkBudget(), initialBudget(), nextBudget(), noteCommand(), resetBudgetForTests(), spendCommand(), BUDGET_CAPS

### Community 74 - "requireUser"
Cohesion: 0.14
Nodes (30): Task 7: RSC foundation, Tasks 8–19: Route migrations, GET, AskRoute(), AskPage(), dynamic, CalendarPage(), dynamic (+22 more)

### Community 75 - "GoogleSignInButton"
Cohesion: 0.32
Nodes (6): useAuthActions(), signIn(), GoogleGlyph(), GoogleSignInButton(), signIn(), startGoogleSignIn()

### Community 89 - "api"
Cohesion: 0.14
Nodes (21): apply(), useTodoCalendar(), api(), ApiError, Envelope, readEnvelope(), PlanPayloadWithToday, PlanProgressInput (+13 more)

### Community 124 - "format.ts"
Cohesion: 0.07
Nodes (38): Migration roadmap (executed order), DashboardClock(), TodoAiComposerInner(), duplicateWarning(), proposedValue(), weekdayDateLabel(), PersonalCalendar(), personalMonthRange() (+30 more)

### Community 126 - "fixtures.ts"
Cohesion: 0.11
Nodes (23): Petals, TypedLine(), AttemptInput, buildAttempt(), FULL_ROWS, LANDING_ATTEMPTS, LANDING_FULL_MOCKS, LANDING_LATEST (+15 more)

### Community 127 - "Architecture"
Cohesion: 0.33
Nodes (6): Architecture, Colocation rule, Rate limiting, Redistribution of the shell's local state, Server prefetch contract, AiUsage

### Community 128 - "performance/page.tsx"
Cohesion: 0.21
Nodes (12): @tanstack/react-query, GET, runtime, dynamic, dynamic, PerformancePage(), analyticsKeys, analyticsQueryOptions() (+4 more)

### Community 129 - "Panel"
Cohesion: 0.07
Nodes (55): AttemptBreakdownPanel(), DistributionPanel(), PAD, FindingsPanel(), points(), sentence(), TONE_ICON, TONE_TEXT (+47 more)

### Community 130 - "useIsMobile"
Cohesion: 0.70
Nodes (4): getServerSnapshot(), getSnapshot(), subscribe(), useIsMobile()

### Community 131 - "ssrf-core.ts"
Cohesion: 0.26
Nodes (11): RFC-1918, assertSafeBaseUrl(), assertSafeBaseUrlShape(), BLOCKED_HOSTNAMES, inV4Range(), ipv4Octets(), isBlockedAddress(), parseBaseUrl() (+3 more)

### Community 139 - "Add Mock Route"
Cohesion: 0.12
Nodes (36): BrowserFrame(), MockupCaption(), CompareScreen(), delta(), duration(), DashboardScreen(), accuracyTone(), CHART (+28 more)

### Community 140 - "Button"
Cohesion: 0.09
Nodes (48): next, DayLedger(), DayLedgerProps, EmptyActions(), LoadLine(), DayActions, DashboardPlanApi, PersonalTasksPanel() (+40 more)

### Community 141 - "Mock Comparison Route"
Cohesion: 0.06
Nodes (71): collectCursors(), GET, runtime, NAV_GROUPS, planHref(), CommandPalette(), CommandPaletteProps, loadRecentSearches() (+63 more)

### Community 142 - "ref_node_assert"
Cohesion: 0.06
Nodes (34): targetMarks(), SubjectResult, DISTRIBUTION_MIN_POINTS, findings(), RANK_MIN_RESULTS, subjectRanking(), attemptSchema, input (+26 more)

### Community 143 - "compare-view.tsx"
Cohesion: 0.17
Nodes (27): buildComparison(), buildSectionRows(), ChangeCell(), CompareView, Comparison, ComparisonLedger(), ComparisonRow, ErrorState() (+19 more)

### Community 144 - "verify-backup-transfer.mjs"
Cohesion: 0.29
Nodes (8): api(), backup(), cookies, preview(), raw(), replace(), settings, user()

### Community 145 - "audit.ts"
Cohesion: 0.14
Nodes (14): bearerToken(), GET, maxDuration, runtime, secretMatches(), dynamic, GET, HealthStatus (+6 more)

### Community 146 - "filters-url.ts"
Cohesion: 0.14
Nodes (20): AddMockView(), AddRoute(), AddRouteInner(), LogMockPayload, ATTEMPT_SORT_KEYS, dashboardScopeSchema, filtersSchema, DEFAULT_SCOPE (+12 more)

### Community 148 - "usage/route.ts"
Cohesion: 0.67
Nodes (3): GET, runtime, listRecentAiUsage()

### Community 149 - "formatNumber"
Cohesion: 0.12
Nodes (19): motion, FloatingInk(), InkArt(), PetalSpec, ChatEmptyState(), READS, SUGGESTIONS, BreakdownCounts (+11 more)

### Community 150 - "Label"
Cohesion: 0.17
Nodes (25): ChangePasswordDialog(), DisableTwoFactorDialog(), EnrollDialog(), RegenerateCodesDialog(), close(), AuthPanelDialog(), ForgotFlow(), FormError() (+17 more)

### Community 151 - "settings-view.tsx"
Cohesion: 0.07
Nodes (41): MotionButton, pageEnter, Reveal(), RevealItem(), saveBarSpring, staggerContainer, staggerItem, switchBounce (+33 more)

### Community 153 - "use-ai-workspace.tsx"
Cohesion: 0.06
Nodes (53): AiWorkspace, AiWorkspaceContext, ChatHistoryApi, INSIGHT_REQUEST_TEXT, insightToChatText(), newId(), trimChatHistory(), useAiWorkspaceState() (+45 more)

### Community 154 - "routes.test.ts"
Cohesion: 0.22
Nodes (11): The layout keeps only what must survive navigation, AppHeaderProps, VIEW_META, AI_VIEWS, APP_VIEWS, AppView, PATH_VIEW, VIEW_HREF (+3 more)

### Community 155 - "Paper Tokens and Design Handover"
Cohesion: 0.20
Nodes (9): args, evaluate(), pending, send(), target, url, wait, widths (+1 more)

### Community 156 - "workspace-chrome.tsx"
Cohesion: 0.08
Nodes (39): CalendarRoute(), DashboardRoute(), NO_FILTERS, DashboardView(), MyTasksRoute(), AiCoachCard(), TaskSuggestionCard(), ScopeGate() (+31 more)

### Community 157 - "form.tsx"
Cohesion: 0.23
Nodes (10): FormControl, FormDescription, FormFieldContext, FormFieldContextValue, FormItem, FormItemContext, FormItemContextValue, FormLabel (+2 more)

### Community 158 - "react"
Cohesion: 0.08
Nodes (30): Loading, error and not-found surfaces, radix-ui, react, PeriodNav(), UNIT, CalendarLoading(), PlanWithToday, DoneDot() (+22 more)

### Community 160 - "Review Focus"
Cohesion: 0.13
Nodes (14): Baseline and environment facts (measured in Task 0), Folder-Based Routing and Upstash Rate Limiting — Implementation Plan, Global Constraints, Review Focus, Rulings carried into this plan, Task 0: Toolchain and baseline, Task 1: Spec and plan documents, Task 20: Retire the shell (+6 more)

### Community 162 - "next.config.ts"
Cohesion: 0.40
Nodes (4): cspDev, cspProduction, nextConfig, productionHeaders

### Community 163 - "ref_node_test"
Cohesion: 0.09
Nodes (11): packageDir, REPLACEMENTS, targets, personalTasksByDate(), root, allSourceFiles(), APP, privateFiles() (+3 more)

### Community 166 - "explain-search.ts"
Cohesion: 0.22
Nodes (6): @prisma/adapter-pg@^7.10.1, @prisma/adapter-pg, env, match, prisma, queries

### Community 167 - "verify-ownership.mjs"
Cohesion: 0.18
Nodes (10): api(), full, ids, raw(), api(), cookies, created, input (+2 more)

### Community 168 - "verify-trash.mjs"
Cohesion: 0.43
Nodes (6): api(), cookies, created, input, raw(), visible()

### Community 169 - "ai-prompt-security.test.ts"
Cohesion: 0.06
Nodes (53): MAX_TODO_PROMPT_CHARS, buildAiContext(), attachImages(), chatMessages(), coachMessages(), contextBlock(), extractionMessages(), FALLBACK_SHAPE (+45 more)

## Ambiguous Edges - Review These
- `Stack Inventory (Next 16.4.3, React 19.2, TS 5.9, Tailwind 4, Recharts 3, motion 12)` → `Private Accounts Release Notes`  [AMBIGUOUS]
  docs/ui-overhaul/phase-1-audit.md · relation: conceptually_related_to

## Knowledge Gaps
- **36 isolated node(s):** `RFC-1918`, `Analytics Projections Cache Policy (/api/analytics)`, `force-dynamic Public Auth-Adjacent Pages`, `Health Endpoint Rate-Limit-Exempt (/api/health)`, `Firebase/Mongo Runtime Dependencies Removed` (+31 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1138 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **68 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Request Proxy and Public Origins` to `view-model.ts`, `my-tasks-view.tsx`, `Panel`, `ai-settings-form.tsx`, `calendar-view.tsx`, `Add Mock Route`, `Button`, `Mock Comparison Route`, `personal-task-drawer.tsx`, `compare-view.tsx`, `ai-composer.tsx`, `Mock Entry Form and Validation`, `formatNumber`, `Label`, `settings-view.tsx`, `chat-composer.tsx`, `workspace-chrome.tsx`, `compare-route.tsx`, `react`, `exam-switcher.tsx`, `plan-facts.ts`, `form.tsx`, `film-section.tsx`, `trash-view.tsx`, `RouteSkeleton`, `extraction.ts`, `calendar-view.tsx`, `react`, `SecurityPanel`, `plan-day-view.tsx`, `exams-panel.tsx`, `sheet.tsx`, `format.ts`, `fixtures.ts`?**
  _High betweenness centrality (0.102) - this node is a cross-community bridge._
- **What connects `RFC-1918`, `Analytics Projections Cache Policy (/api/analytics)`, `force-dynamic Public Auth-Adjacent Pages` to the rest of the system?**
  _36 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `view-model.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05080091533180778 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `view-model.ts`, `my-tasks-view.tsx`, `Panel`, `useIsMobile`, `subject-performance.test.ts`, `ai-settings-form.tsx`, `calendar-view.tsx`, `Add Mock Route`, `Button`, `Mock Comparison Route`, `personal-task-drawer.tsx`, `compare-view.tsx`, `Setup and Operations Handbook`, `ai-composer.tsx`, `filters-url.ts`, `Mock Entry Form and Validation`, `formatNumber`, `Label`, `settings-view.tsx`, `private-workspace.tsx`, `chat-composer.tsx`, `use-ai-workspace.tsx`, `Request Proxy and Public Origins`, `email-client.ts`, `workspace-chrome.tsx`, `compare-route.tsx`, `exam-switcher.tsx`, `form.tsx`, `film-section.tsx`, `trash-view.tsx`, `app/layout.tsx`, `result-editor.tsx`, `RouteError`, `extraction.ts`, `queries/exams.ts`, `mock-form.tsx`, `(workspace)/layout.tsx`, `calendar-view.tsx`, `react`, `SecurityPanel`, `plan-day-view.tsx`, `exams-panel.tsx`, `sheet.tsx`, `api`, `format.ts`, `fixtures.ts`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Should `my-tasks-view.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.054527750730282376 - nodes in this community are weakly interconnected._
- **Why does `next` connect `Button` to `view-model.ts`, `my-tasks-view.tsx`, `Panel`, `subject-performance.test.ts`, `calendar-view.tsx`, `Mock Comparison Route`, `Setup and Operations Handbook`, `ai-composer.tsx`, `lib/trash.ts`, `filters-url.ts`, `RequestError`, `private-workspace.tsx`, `plan/[date]/not-found.tsx`, `Request Proxy and Public Origins`, `workspace-chrome.tsx`, `compare-route.tsx`, `react`, `week/[date]/not-found.tsx`, `next.config.ts`, `trash-view.tsx`, `app/layout.tsx`, `RouteError`, `(workspace)/layout.tsx`, `requireUser`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Stack Inventory (Next 16.4.3, React 19.2, TS 5.9, Tailwind 4, Recharts 3, motion 12)` and `Private Accounts Release Notes`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._