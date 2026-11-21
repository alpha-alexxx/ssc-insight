# Graph Report - ssc-insight-2  (2026-11-21)

## Corpus Check
- 511 files · ~366,120 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 4, .css 2, .example 1)

## Summary
- 3750 nodes · 11915 edges · 188 communities (119 shown, 69 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 143 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8c1b66b2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- calendar-view.tsx
- my-tasks-view.tsx
- month-grid.tsx
- ssrf-core.ts
- command-palette.tsx
- domain.ts
- Primary Architecture Handbook
- subject-performance.test.ts
- ai-settings-form.tsx
- exam-settings.ts
- sections.tsx
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
- calendar-entries.ts
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
- exams-panel.tsx
- Continuous Integration Validation Workflow
- cn
- sign-in-form.tsx
- devDependencies
- sections.tsx
- theme-style-provider.tsx
- mock-form.tsx
- trash-view.tsx
- mock-entry.test.ts
- client-types.ts
- (workspace)/layout.tsx
- Button
- react
- shot.mjs
- Caching and Revalidation Policy
- Folder-Based Routing and Upstash Rate Limiting — Design
- plan-day-view.tsx
- security-panel.tsx
- sheet.tsx
- rate-limit-budget.ts
- requireUser
- toast.tsx
- verify-backup-transfer.mjs
- api
- next.config.ts
- Todo API Review and Ownership
- format.ts
- ProviderStreamDecoder
- atoms.tsx
- search-core.ts
- ref_node_assert
- Panel
- attempt-pagination.tsx
- ssrf-core.ts
- Primary Architecture Handbook
- PostCSS Build Configuration
- Personal Workspace Migration Requirements
- Authenticated QA and Google Consent
- Controlled Neon Prisma Migrations
- Personal Calendar Counts and Invalidation
- Add Mock Route
- Button
- command-palette.tsx
- subject-performance.test.ts
- compare-view.tsx
- verify-backup-transfer.mjs
- audit.ts
- filters-url.ts
- rate-limit.ts
- usage/route.ts
- ai-settings-form.tsx
- ChangePasswordDialog
- settings-view.tsx
- conversations.ts
- use-ai-workspace.tsx
- workspace-chrome.tsx
- Paper Tokens and Design Handover
- workspace-chrome.tsx
- index.tsx
- dashboard-view.tsx
- view-model.ts
- Review Focus
- lib/search.ts
- next
- ref_node_fs
- agenda-view.tsx
- vercel.json
- plan-shared.tsx
- verify-ownership.mjs
- verify-trash.mjs
- ai-prompt-security.test.ts
- client-types.ts
- ai.ts
- plan-facts.ts
- ai/todos.ts
- services/analytics.ts
- use-search.ts
- conversation-list.tsx
- pace.test.ts
- colocation.test.ts
- icon.tsx
- LruCache
- ws
- verify-neon.mjs
- duration-input.tsx

## God Nodes (most connected - your core abstractions)
1. `cn()` - 311 edges
2. `Button()` - 147 edges
3. `react` - 141 edges
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

## Communities (188 total, 69 thin omitted)

### Community 0 - "calendar-view.tsx"
Cohesion: 0.13
Nodes (28): CalendarLegend(), stepSize(), CalendarLoading(), CalendarView(), currentPath(), MemoMonthGrid, MemoWeekView, monthMeta() (+20 more)

### Community 1 - "my-tasks-view.tsx"
Cohesion: 0.06
Nodes (41): ApplyOp, ConfirmState, MyTasksView(), bulkRescheduleApply(), bulkStatus(), bulkTrashSelected(), clearSelection(), createTask() (+33 more)

### Community 2 - "month-grid.tsx"
Cohesion: 0.12
Nodes (24): CalendarToolbar(), categoryLabel(), LayerToggles(), CellRow(), MonthCell(), PlanCategoryLegend(), WEEKDAYS, PeriodNav() (+16 more)

### Community 4 - "command-palette.tsx"
Cohesion: 0.06
Nodes (45): AI Status Endpoint Cache Policy (/api/ai/status), Analytics Projections Cache Policy (/api/analytics), api() Client Fetch cache: no-store (src/lib/api-client.ts), Backup Export Raw File Exception (GET /api/backup), Next.js 16 Cache Components Not Enabled, Caching and Revalidation Policy (Phase 8 reference), Filters/Scope URL State Mirror (src/lib/filters-url.ts), force-dynamic Public Auth-Adjacent Pages (+37 more)

### Community 7 - "subject-performance.test.ts"
Cohesion: 0.04
Nodes (69): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, cmdk@^1.1.1, @duo-icons/react@^1.0.1, @hookform/resolvers@^5.9.2, lucide-react@^0.468.0, motion@^12.0.0 (+61 more)

### Community 8 - "ai-settings-form.tsx"
Cohesion: 0.20
Nodes (13): AiSettingsForm(), chooseProvider(), fetchModels(), patchFields(), payloadFrom(), remove(), test(), credentialToValues() (+5 more)

### Community 10 - "sections.tsx"
Cohesion: 0.15
Nodes (23): Faq(), FAQ_ITEMS, BrowserFrame(), MockupCaption(), CompareScreen(), delta(), duration(), DayWorkspaceScreen() (+15 more)

### Community 11 - "database"
Cohesion: 0.06
Nodes (63): mutationSchema, POST, runtime, DELETE, idSchema, PUT, runtime, POST (+55 more)

### Community 13 - "repository.ts"
Cohesion: 0.07
Nodes (47): GET, maxDuration, runtime, privateHeaders, attemptData(), attemptInclude, attemptWhere(), escapeLike() (+39 more)

### Community 14 - "personal-task-drawer.tsx"
Cohesion: 0.16
Nodes (23): AskRoute(), AskView(), FOLLOW_UPS, DayDrawer(), blankTask(), PersonalTaskDrawer(), TaskEditorLoader(), ChatEmptyState() (+15 more)

### Community 15 - "Setup and Operations Handbook"
Cohesion: 0.04
Nodes (65): assertSummary(), backfillLegacyQualifying(), BACKUP_FORMAT, BACKUP_FORMAT_VERSION, BACKUP_MAX_ATTEMPTS, BACKUP_MAX_BYTES, BACKUP_SAMPLE_LIMIT, backupAttemptSchema (+57 more)

### Community 16 - "ai-composer.tsx"
Cohesion: 0.11
Nodes (41): EmptyChart(), AttemptBreakdown(), BreakdownDonut(), DeepDive(), GroupedScoreBars(), InsightCallout(), paperMax(), PerformanceOverview (+33 more)

### Community 17 - "lib/trash.ts"
Cohesion: 0.10
Nodes (33): Context, devHandle(), handle(), privateNoStore, runtime, GET(), accessLog(), AccessLogEvent (+25 more)

### Community 18 - "RequestError"
Cohesion: 0.06
Nodes (70): Baseline architecture, Call-site inventory (39 total), zod, maxDuration, POST, PROBE_MESSAGES, runtime, POST (+62 more)

### Community 19 - "Mock Entry Form and Validation"
Cohesion: 0.12
Nodes (22): AppearancePanel(), PaletteChip(), StyleGlyph(), initialPalette(), initialStyle(), PALETTE_IDS, PALETTE_STORAGE_KEY, PaletteId (+14 more)

### Community 20 - "exam-settings.ts"
Cohesion: 0.06
Nodes (71): GET, AiBundle, loadAiBundle(), PatternShape, ALL_TIERS_ID, CUSTOM_FIRST_TIER_ID, CustomExamDef, customExamPattern() (+63 more)

### Community 21 - "calendar-entries.ts"
Cohesion: 0.12
Nodes (20): addToCounts(), AttemptEntry, attemptScorePct(), buildCalendarIndex(), compareEntries(), countAll(), countEntries(), countOn() (+12 more)

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
Cohesion: 0.08
Nodes (61): bodySchema, maxDuration, POST(), runtime, COACH_FORMAT, maxDuration, POST(), runtime (+53 more)

### Community 27 - "Request Proxy and Public Origins"
Cohesion: 0.09
Nodes (47): ActiveExamFooterNote(), AppFrame(), AppHeader(), AppSidebar(), HeaderLocation(), NavItem(), FormControl, FormDescription (+39 more)

### Community 28 - "email-client.ts"
Cohesion: 0.15
Nodes (29): readSecurityUser(), SecurityUser, useAuthSecurity(), useToast(), AuthFailureReason, authGet(), authPost(), AuthSessionRow (+21 more)

### Community 29 - "compare-route.tsx"
Cohesion: 0.21
Nodes (18): CompareRoute(), CompareReference, HistoryRoute(), PerformanceRoute(), platformsOf(), useExamScope(), PageHeader(), ScopeFilters() (+10 more)

### Community 30 - "Study Plan Progress APIs"
Cohesion: 0.22
Nodes (19): analyze(), average(), buildWhereYouStand(), comparePoints(), deepDiveFor(), derivedSectionPoint(), explicitSectionPoint(), paceOf() (+11 more)

### Community 31 - "exam-switcher.tsx"
Cohesion: 0.26
Nodes (21): BulkBar(), filterCount(), MenuOption(), PRIORITY_LABELS, SORT_LABELS, STATUS_LABELS, TaskToolbar(), TrashRow() (+13 more)

### Community 32 - "plan-facts.ts"
Cohesion: 0.09
Nodes (18): LANDING_PLAN, plan, parsed, parsePlanTaskKey(), planChecklistItemSchema, PlanDay, planDaySchema, planRevisionSchema (+10 more)

### Community 33 - "rate-limit.ts"
Cohesion: 0.18
Nodes (17): AI_L2_COST, AI_RATE_LIMIT, AI_WINDOW_SECONDS, BudgetState, decideRateLimit(), describeDecision(), ESCALATION_CAP_SECONDS, L2_TIMEOUT_MS (+9 more)

### Community 34 - "credentials.ts"
Cohesion: 0.21
Nodes (20): DELETE, GET, PUT, runtime, isAiThinking(), AiCredentialInput, AiCredentialSummary, credentialStorageAvailable() (+12 more)

### Community 35 - "Score Observatory verification"
Cohesion: 0.07
Nodes (51): GET, idSchema, kindSchema, runtime, POST, runtime, GET, runtime (+43 more)

### Community 36 - "loadExamContext"
Cohesion: 0.21
Nodes (17): GET, GET, ComparePage(), dynamic, dynamic, HistoryPage(), attemptListSchema, attemptKeys (+9 more)

### Community 37 - "film-section.tsx"
Cohesion: 0.12
Nodes (27): attemptMeritPercentage(), CHAPTERS, COACH_ANSWER, CountNumber(), FILM_GAP_PTS, FILM_METRICS, FILM_PCT_DELTA, FILM_SUBJECT_BARS (+19 more)

### Community 38 - "compare-view.tsx"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 39 - "trash-view.tsx"
Cohesion: 0.26
Nodes (15): KindFilter, messageOf(), rowKey(), toItemRef(), TrashView(), ungroupedCount(), emptyTrashRequest(), purgeTrashRequest() (+7 more)

### Community 40 - "Button"
Cohesion: 0.17
Nodes (9): args, logs, outDir, pending, routes, target, waitMs, widths (+1 more)

### Community 41 - "app/layout.tsx"
Cohesion: 0.13
Nodes (15): @fontsource-variable/dm-sans@^5.3.0, @fontsource-variable/source-serif-4@^5.3.1, next-themes@^0.4.6, @vercel/analytics@^2.0.1, @vercel/speed-insights@^2.0.0, @fontsource-variable/dm-sans, @fontsource-variable/source-serif-4, next-themes (+7 more)

### Community 42 - "RouteSkeleton"
Cohesion: 0.25
Nodes (18): AddLoading(), AskLoading(), CalendarLoading(), CompareLoading(), DashboardLoading(), HistoryLoading(), MytasksLoading(), PerformanceLoading() (+10 more)

### Community 43 - "result-editor.tsx"
Cohesion: 0.26
Nodes (10): NumberField, ResultEditor(), fill(), fillFromAttempt(), isLoggableType(), matchAttemptForTask(), namesMatch(), normalizeName() (+2 more)

### Community 44 - "api"
Cohesion: 0.12
Nodes (15): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+7 more)

### Community 45 - "requireUser"
Cohesion: 0.12
Nodes (15): jobs, validate, name, permissions, contents, run, uses, with (+7 more)

### Community 46 - "connection-input.ts"
Cohesion: 0.06
Nodes (65): maxDuration, POST, runtime, aiConfig(), aiConfigOrNull(), AI_THINKING_LEVELS, AI_THINKING_VALUES, AiConfig (+57 more)

### Community 47 - "RouteError"
Cohesion: 0.12
Nodes (17): ForgotPasswordError(), SignInError(), SignUpError(), AddError(), AskError(), CalendarError(), CompareError(), DashboardError() (+9 more)

### Community 48 - "extraction.ts"
Cohesion: 0.12
Nodes (26): ExtractionReview(), update(), updateSubject(), FieldIssues(), NullableDuration(), optionalNumber(), blankExtractedSubject(), deriveCounts() (+18 more)

### Community 49 - "rate-limit-upstash.ts"
Cohesion: 0.21
Nodes (17): BREAKER_OPEN_MS, BREAKER_THRESHOLD, BreakerState, initialBreaker(), isBreakerOpen(), onFailure(), onSuccess(), tickBreaker() (+9 more)

### Community 50 - "exams-panel.tsx"
Cohesion: 0.08
Nodes (35): CustomExamDialog(), describeTier(), ExamRow(), maxOf(), SourceSummary, StageSummary, SUBJECT_CHOICES, TierSummary (+27 more)

### Community 51 - "Continuous Integration Validation Workflow"
Cohesion: 0.20
Nodes (8): Multi-Theme System (data-palette x data-style), Palettes x Styles Theme Matrix, Typography Scale (Source Serif 4 + DM Sans), Missing Radius System Finding, Elevation Model and --shadow-pop Token, Restrained Motion Language, Tokenized Radius Scale (panel/control/card/pill), Sticky Identity Column for Mock History

### Community 52 - "cn"
Cohesion: 0.18
Nodes (9): args, evaluate(), height, pending, report, send(), target, width (+1 more)

### Community 53 - "sign-in-form.tsx"
Cohesion: 0.11
Nodes (36): @hookform/resolvers, react-hook-form, ForgotForm(), Stage, CodeInput(), FormError(), onForgot(), OtpLogin() (+28 more)

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
Cohesion: 0.21
Nodes (20): blankSubject(), defaultTierId(), fullMockSectionHeading(), meritSubjectIds(), MockForm(), applyAiDraft(), applyExtracted(), importPaste() (+12 more)

### Community 58 - "trash-view.tsx"
Cohesion: 0.20
Nodes (9): Confirmed requirements, Dated personal todos and AI-assisted planning, Existing foundation, Finalized navigation and lifecycle, Phase 1 — Design the dated planner and review flow, Phase 2 — Extend task storage and manual workflows, Phase 3 — Add AI proposal and confirmed-apply workflows, Phase 4 — Validate and document (+1 more)

### Community 59 - "mock-entry.test.ts"
Cohesion: 0.13
Nodes (16): filterAttempts(), AttemptInput, duplicateKey(), Marking, parseTime(), aliases, numberAfter(), parseReport() (+8 more)

### Community 60 - "client-types.ts"
Cohesion: 0.25
Nodes (5): Dashboard Analytical Scopes (full/subject/sectional/all), Backup Format v2 and Account Transfer, Semantic Chart Palette and Chart Rules, Core Product Workflows, JSON Backup Format Version 2

### Community 61 - "(workspace)/layout.tsx"
Cohesion: 0.22
Nodes (9): dynamic, SettingsPage(), SettingsRoute(), useBackupImport(), AccountUser, LookupResult, SessionError, verifiedUser() (+1 more)

### Community 62 - "Button"
Cohesion: 0.09
Nodes (29): lucide-react, radix-ui, react, QuickAddBar(), AssistantBody(), ChatTranscript(), ChatTranscriptProps, EditButton() (+21 more)

### Community 63 - "react"
Cohesion: 0.20
Nodes (19): DataPanel(), ActiveTargetCard(), DefaultRow(), describeSignature(), PercentileExplainer(), PercentileRow(), sourceLabel(), targetForSignature() (+11 more)

### Community 64 - "shot.mjs"
Cohesion: 0.40
Nodes (6): Known Limitations (duo-icons fill-rule, native inputs), Design System Source-of-Truth Map, Icon Inconsistency Finding (14 ad-hoc sizes), Icon Size Scale (14/16/18/22/28), Named Imports for Bundle Reduction, Raw Lucide Imports Migrated into Semantic Icon Map

### Community 68 - "Caching and Revalidation Policy"
Cohesion: 0.50
Nodes (5): WorkspaceShell Client Orchestrator and Its Three Hooks, dashboard.tsx Monolith Split Finding, UI Baseline Audit Findings (26 prioritized items), 15-Phase Execution Order, Unified Segmented Control (.segment-group)

### Community 69 - "Folder-Based Routing and Upstash Rate Limiting — Design"
Cohesion: 0.10
Nodes (15): Baseline and environment facts (measured in Task 0), Folder-Based Routing and Upstash Rate Limiting — Implementation Plan, Global Constraints, Rulings carried into this plan, Decisions, Folder-Based Routing and Upstash Rate Limiting — Design, Goals, Invariants that must not move (+7 more)

### Community 70 - "plan-day-view.tsx"
Cohesion: 0.19
Nodes (23): DayLedger(), DayLedgerProps, EmptyActions(), LoadLine(), DayActions, DaySections(), AttemptEntryRow(), entryPlanRow() (+15 more)

### Community 71 - "security-panel.tsx"
Cohesion: 0.13
Nodes (35): AboutPanel(), ExamsPanel(), MotionButton, describeDevice(), EnrollStep, initialsOf(), SecurityPanel(), SessionsCard() (+27 more)

### Community 72 - "sheet.tsx"
Cohesion: 0.11
Nodes (32): AiPlanSheet(), TrashDetailSheet(), AiChatSheet(), AskChatTab(), LogMockTab(), SheetUsageFooter(), SubjectRoster(), Masthead() (+24 more)

### Community 73 - "rate-limit-budget.ts"
Cohesion: 0.49
Nodes (8): budgetState, checkBudget(), initialBudget(), nextBudget(), noteCommand(), resetBudgetForTests(), spendCommand(), BUDGET_CAPS

### Community 74 - "requireUser"
Cohesion: 0.14
Nodes (38): Tasks 8–19: Route migrations, @tanstack/react-query, GET, runtime, GET, AddPage(), dynamic, AskPage() (+30 more)

### Community 75 - "toast.tsx"
Cohesion: 0.12
Nodes (15): useAuthActions(), signIn(), GoogleGlyph(), signIn(), GoogleSignInButtonProps, Toast, ToastApi, ToastCard() (+7 more)

### Community 89 - "api"
Cohesion: 0.13
Nodes (22): Client State Architecture Audit — 2026-10-31, Design decisions, Findings, Migration roadmap (executed order), Standing gaps (out of scope, recorded), apply(), useTodoCalendar(), api() (+14 more)

### Community 124 - "format.ts"
Cohesion: 0.06
Nodes (46): DraftResponse, Proposal, TodoAiComposerInner(), duplicateWarning(), proposedValue(), weekdayDateLabel(), categoryMeta(), Group (+38 more)

### Community 126 - "atoms.tsx"
Cohesion: 0.26
Nodes (9): CountUp(), FloatingInk(), InkArt(), Petals, PetalSpec, TypedLine(), Hero(), LedgerFacts() (+1 more)

### Community 127 - "search-core.ts"
Cohesion: 0.17
Nodes (18): collectCursors(), GET, runtime, attemptPhaseWhere(), decodeSearchCursors(), encodeSearchCursors(), fromBase64Url(), parseSearchTypes() (+10 more)

### Community 128 - "ref_node_assert"
Cohesion: 0.30
Nodes (4): Filters, analyticsKeys, analyticsQueryOptions(), serializeAnalyticsParams()

### Community 129 - "Panel"
Cohesion: 0.07
Nodes (57): motion, PersonalTasksPanel(), AttemptBreakdownPanel(), DistributionPanel(), PAD, FindingsPanel(), points(), sentence() (+49 more)

### Community 130 - "attempt-pagination.tsx"
Cohesion: 0.26
Nodes (14): AttemptPagination, windowedPages(), Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem(), PaginationNext(), PaginationPage() (+6 more)

### Community 131 - "ssrf-core.ts"
Cohesion: 0.23
Nodes (12): RFC-1918, AiConnectionInput, assertSafeBaseUrl(), assertSafeBaseUrlShape(), BLOCKED_HOSTNAMES, inV4Range(), ipv4Octets(), isBlockedAddress() (+4 more)

### Community 139 - "Add Mock Route"
Cohesion: 0.07
Nodes (52): AttemptInput, buildAttempt(), FULL_ROWS, LANDING_ATTEMPTS, LANDING_FULL_MOCKS, LANDING_LATEST, LANDING_SCOPES, LANDING_SUMMARY (+44 more)

### Community 140 - "Button"
Cohesion: 0.09
Nodes (47): DashboardPlanApi, PipelineProgressSection(), PipelineRevisionSection(), PipelineUpcomingSection(), PlanApi, ProgressRing(), StudyPipelinePanel(), TodayFocusPanel() (+39 more)

### Community 141 - "command-palette.tsx"
Cohesion: 0.17
Nodes (24): NAV_GROUPS, planHref(), CommandPalette(), CommandPaletteProps, loadRecentSearches(), PaletteBody(), persistRecentSearches(), RecentAction (+16 more)

### Community 142 - "subject-performance.test.ts"
Cohesion: 0.17
Nodes (10): all, attemptSchema, english, full, ga, quant, reasoning, section1 (+2 more)

### Community 143 - "compare-view.tsx"
Cohesion: 0.09
Nodes (43): buildComparison(), buildSectionRows(), ChangeCell(), CompareView, Comparison, ComparisonLedger(), ComparisonRow, ErrorState() (+35 more)

### Community 144 - "verify-backup-transfer.mjs"
Cohesion: 0.29
Nodes (8): api(), backup(), cookies, preview(), raw(), replace(), settings, user()

### Community 145 - "audit.ts"
Cohesion: 0.10
Nodes (19): bearerToken(), GET, maxDuration, runtime, secretMatches(), dynamic, GET, HealthStatus (+11 more)

### Community 146 - "filters-url.ts"
Cohesion: 0.13
Nodes (23): AddMockView(), AddRoute(), AddRouteInner(), LogMockPayload, FiltersState, ATTEMPT_SORT_KEYS, filtersSchema, DEFAULT_SCOPE (+15 more)

### Community 147 - "rate-limit.ts"
Cohesion: 0.15
Nodes (12): aiRateLimiter, apiRateLimiter, Bucket, clientIp(), escalatedRetryAfter(), RateLimitHeaders, rateLimitHeadersFor(), rateLimitHeadersForDecision() (+4 more)

### Community 148 - "usage/route.ts"
Cohesion: 0.67
Nodes (3): GET, runtime, listRecentAiUsage()

### Community 149 - "ai-settings-form.tsx"
Cohesion: 0.10
Nodes (17): Catalog, EMPTY_CATALOG, EMPTY_FORM, Props, PROTOCOL_LABELS, THINKING_LABELS, THINKING_LEVELS, aiSchema (+9 more)

### Community 150 - "ChangePasswordDialog"
Cohesion: 0.21
Nodes (13): @radix-ui/react-dialog, ChangePasswordDialog(), DisableTwoFactorDialog(), EnrollDialog(), RegenerateCodesDialog(), close(), CommandDialog(), DialogContent (+5 more)

### Community 151 - "settings-view.tsx"
Cohesion: 0.13
Nodes (21): pageEnter, Reveal(), RevealItem(), saveBarSpring, staggerContainer, staggerItem, switchBounce, tabSwap (+13 more)

### Community 152 - "conversations.ts"
Cohesion: 0.19
Nodes (16): chatBaseForSend(), ChatMessage, CONVERSATIONS_STORAGE_KEY, isRole(), loadConversations(), MAX_CONVERSATION_MESSAGES, MAX_CONVERSATIONS, newConversationId() (+8 more)

### Community 153 - "use-ai-workspace.tsx"
Cohesion: 0.16
Nodes (16): AiWorkspace, AiWorkspaceContext, INSIGHT_REQUEST_TEXT, insightToChatText(), newId(), trimChatHistory(), useAiWorkspaceState(), CoachResponse (+8 more)

### Community 154 - "workspace-chrome.tsx"
Cohesion: 0.09
Nodes (29): Architecture, Colocation rule, Rate limiting, Redistribution of the shell's local state, Server prefetch contract, The layout keeps only what must survive navigation, dynamic, WorkspaceLayout() (+21 more)

### Community 155 - "Paper Tokens and Design Handover"
Cohesion: 0.20
Nodes (9): args, evaluate(), pending, send(), target, url, wait, widths (+1 more)

### Community 156 - "workspace-chrome.tsx"
Cohesion: 0.11
Nodes (27): CalendarRoute(), DashboardRoute(), NO_FILTERS, MyTasksRoute(), PlanDayRoute(), PlanWeekRoute(), AiCoachCard(), useAllAttempts() (+19 more)

### Community 157 - "index.tsx"
Cohesion: 0.17
Nodes (16): dynamic, LandingPage(), metadata, FloatingAsk(), RAIL_ITEMS, SectionRail(), onScroll(), read() (+8 more)

### Community 158 - "dashboard-view.tsx"
Cohesion: 0.10
Nodes (37): Loading, error and not-found surfaces, PlanWithToday, DashboardView(), RecentAttemptsPanel(), DoneDot(), EmptyCell(), WeekCell(), WeekStripPanel() (+29 more)

### Community 159 - "view-model.ts"
Cohesion: 0.13
Nodes (15): MonthGrid, isoMonthEnd(), isoMonthStart(), IST_TODAY, MOCK_TYPES, monthGridDays(), personalTasksByDate(), PersonalTaskView (+7 more)

### Community 160 - "Review Focus"
Cohesion: 0.18
Nodes (11): Review Focus, Task 0: Toolchain and baseline, Task 1: Spec and plan documents, Task 20: Retire the shell, Task 21: Verification and documentation closeout, Task 2: Route, colocation and client-boundary guards, Task 3: Pure rate-limit policy, Task 4: Command budget and Upstash adapter (+3 more)

### Community 161 - "lib/search.ts"
Cohesion: 0.20
Nodes (16): getStudyPlan(), ATTEMPT_PHASES, matchTier(), takeFrom(), taskPhaseWhere(), keysetAfter(), runSearch(), searchGroups() (+8 more)

### Community 162 - "next"
Cohesion: 0.09
Nodes (21): cspDev, cspProduction, nextConfig, productionHeaders, next, dynamic, ForgotPasswordPage(), metadata (+13 more)

### Community 163 - "ref_node_fs"
Cohesion: 0.12
Nodes (8): packageDir, REPLACEMENTS, targets, root, env, match, prisma, queries

### Community 164 - "agenda-view.tsx"
Cohesion: 0.29
Nodes (13): AgendaGroups(), AgendaView(), EarlierRanges(), CalendarMetrics(), CalendarSurface(), QuietDays(), adjacentEntryDate(), CalendarIndex (+5 more)

### Community 166 - "plan-shared.tsx"
Cohesion: 0.32
Nodes (12): BoardView(), handleDrop(), columnFor(), COLUMNS, nextStatus(), PersonalTaskDisplayStatus, STATUS_META, StatusDot() (+4 more)

### Community 167 - "verify-ownership.mjs"
Cohesion: 0.33
Nodes (6): api(), cookies, created, input, original, raw()

### Community 168 - "verify-trash.mjs"
Cohesion: 0.43
Nodes (6): api(), cookies, created, input, raw(), visible()

### Community 169 - "ai-prompt-security.test.ts"
Cohesion: 0.08
Nodes (38): buildAiContext(), recentFullMock(), subjectProfile(), attachImages(), chatMessages(), coachMessages(), contextBlock(), extractionMessages() (+30 more)

### Community 170 - "client-types.ts"
Cohesion: 0.15
Nodes (12): AiConfigSource, AiCredentialSummary, AiModelsResponse, AiResponseUsage, AiScreenContext, AiSettingsResponse, AiSourceState, AiTestResponse (+4 more)

### Community 171 - "ai.ts"
Cohesion: 0.20
Nodes (10): AiActivity, clockLabel(), FEATURE_META, STATUS_DOT, AiStatus, AiActivityEntry, aiKeys, aiStatusQueryOptions (+2 more)

### Community 173 - "plan-facts.ts"
Cohesion: 0.21
Nodes (10): buildLandingPlan(), category(), isMock(), LandingPlanDay, LandingPlanTask, RawDay, RawPhase, RawTask (+2 more)

### Community 174 - "ai/todos.ts"
Cohesion: 0.23
Nodes (10): MAX_TODO_PROMPT_CHARS, parseTodoProposals(), Target, TODO_DATE_QUESTION, todoDraftRequestSchema, TodoProposal, todoProposalSchema, todoOperationSchema (+2 more)

### Community 175 - "services/analytics.ts"
Cohesion: 0.33
Nodes (8): GET, runtime, TargetReference, dashboardScopeSchema, filtersFrom(), listAttempts(), loadAnalytics(), parseScope()

### Community 176 - "use-search.ts"
Cohesion: 0.24
Nodes (8): SearchHit, searchIsReady(), SearchPage, UseSearchOptions, searchKeys, normalizeSearchQuery(), SEARCH_QUERY_MIN, SearchResultItem

### Community 177 - "conversation-list.tsx"
Cohesion: 0.36
Nodes (9): ConversationGroup, ConversationList, ConversationRow, groupConversations(), relativeLabel(), startOfDay(), startOfWeek(), ChatHistoryApi (+1 more)

### Community 178 - "pace.test.ts"
Cohesion: 0.20
Nodes (8): SubjectResult, attemptSchema, computer, english, ga, meritSubjects, quant, reasoning

### Community 179 - "colocation.test.ts"
Cohesion: 0.22
Nodes (6): allSourceFiles(), APP, privateFiles(), ROOT, SRC, walkInto()

### Community 180 - "icon.tsx"
Cohesion: 0.33
Nodes (8): DuoGlyph(), DuoIcon, DuotoneIcon(), DuotoneTile(), IconEntry, ICONS, IconTone, resolveIcon()

### Community 182 - "ws"
Cohesion: 0.25
Nodes (6): ws@^8.22.0, ws, logs, pending, target, ws

### Community 183 - "verify-neon.mjs"
Cohesion: 0.50
Nodes (4): api(), full, ids, raw()

### Community 184 - "duration-input.tsx"
Cohesion: 0.70
Nodes (4): DurationInput(), change(), formatParts(), durationSeconds()

## Ambiguous Edges - Review These
- `Stack Inventory (Next 16.4.3, React 19.2, TS 5.9, Tailwind 4, Recharts 3, motion 12)` → `Private Accounts Release Notes`  [AMBIGUOUS]
  docs/ui-overhaul/phase-1-audit.md · relation: conceptually_related_to

## Knowledge Gaps
- **36 isolated node(s):** `RFC-1918`, `Analytics Projections Cache Policy (/api/analytics)`, `force-dynamic Public Auth-Adjacent Pages`, `Health Endpoint Rate-Limit-Exempt (/api/health)`, `Firebase/Mongo Runtime Dependencies Removed` (+31 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1151 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **69 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Button` to `calendar-view.tsx`, `my-tasks-view.tsx`, `month-grid.tsx`, `Panel`, `attempt-pagination.tsx`, `subject-performance.test.ts`, `ai-settings-form.tsx`, `sections.tsx`, `Add Mock Route`, `Button`, `command-palette.tsx`, `personal-task-drawer.tsx`, `compare-view.tsx`, `Setup and Operations Handbook`, `ai-composer.tsx`, `filters-url.ts`, `Mock Entry Form and Validation`, `ai-settings-form.tsx`, `ChangePasswordDialog`, `settings-view.tsx`, `private-workspace.tsx`, `use-ai-workspace.tsx`, `workspace-chrome.tsx`, `Request Proxy and Public Origins`, `workspace-chrome.tsx`, `compare-route.tsx`, `dashboard-view.tsx`, `exam-switcher.tsx`, `email-client.ts`, `index.tsx`, `next`, `agenda-view.tsx`, `film-section.tsx`, `plan-shared.tsx`, `trash-view.tsx`, `app/layout.tsx`, `ai.ts`, `result-editor.tsx`, `RouteError`, `extraction.ts`, `conversation-list.tsx`, `exams-panel.tsx`, `icon.tsx`, `sign-in-form.tsx`, `duration-input.tsx`, `mock-form.tsx`, `react`, `Folder-Based Routing and Upstash Rate Limiting — Design`, `plan-day-view.tsx`, `security-panel.tsx`, `sheet.tsx`, `toast.tsx`, `api`, `format.ts`, `atoms.tsx`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **What connects `RFC-1918`, `Analytics Projections Cache Policy (/api/analytics)`, `force-dynamic Public Auth-Adjacent Pages` to the rest of the system?**
  _36 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `calendar-view.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1268939393939394 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `Request Proxy and Public Origins` to `calendar-view.tsx`, `my-tasks-view.tsx`, `month-grid.tsx`, `Panel`, `attempt-pagination.tsx`, `ai-settings-form.tsx`, `sections.tsx`, `Add Mock Route`, `Button`, `command-palette.tsx`, `personal-task-drawer.tsx`, `compare-view.tsx`, `ai-composer.tsx`, `Mock Entry Form and Validation`, `ai-settings-form.tsx`, `ChangePasswordDialog`, `settings-view.tsx`, `index.tsx`, `dashboard-view.tsx`, `exam-switcher.tsx`, `compare-route.tsx`, `agenda-view.tsx`, `film-section.tsx`, `plan-shared.tsx`, `trash-view.tsx`, `RouteSkeleton`, `ai.ts`, `conversation-list.tsx`, `exams-panel.tsx`, `sign-in-form.tsx`, `Button`, `react`, `plan-day-view.tsx`, `security-panel.tsx`, `sheet.tsx`, `format.ts`, `atoms.tsx`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Should `my-tasks-view.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Why does `next` connect `next` to `calendar-view.tsx`, `subject-performance.test.ts`, `sections.tsx`, `Button`, `command-palette.tsx`, `ai-composer.tsx`, `lib/trash.ts`, `filters-url.ts`, `RequestError`, `private-workspace.tsx`, `workspace-chrome.tsx`, `Request Proxy and Public Origins`, `workspace-chrome.tsx`, `compare-route.tsx`, `index.tsx`, `dashboard-view.tsx`, `trash-view.tsx`, `app/layout.tsx`, `RouteError`, `sign-in-form.tsx`, `(workspace)/layout.tsx`, `Folder-Based Routing and Upstash Rate Limiting — Design`, `plan-day-view.tsx`, `sheet.tsx`, `requireUser`, `atoms.tsx`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Stack Inventory (Next 16.4.3, React 19.2, TS 5.9, Tailwind 4, Recharts 3, motion 12)` and `Private Accounts Release Notes`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._