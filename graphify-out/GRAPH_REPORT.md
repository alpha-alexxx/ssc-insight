# Graph Report - ssc-insight-2  (2026-11-22)

## Corpus Check
- 510 files · ~368,240 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 4, .css 2, .example 1)

## Summary
- 3748 nodes · 11905 edges · 184 communities (111 shown, 73 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 143 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `71c3b168`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- calendar-view.tsx
- Button
- progress/route.ts
- ssrf-core.ts
- command-palette.tsx
- domain.ts
- Primary Architecture Handbook
- subject-performance.test.ts
- ssrf-core.ts
- exam-settings.ts
- history-screen.tsx
- lib/todos.ts
- package.json
- repository.ts
- personal-task-drawer.tsx
- Setup and Operations Handbook
- ai-composer.tsx
- lib/trash.ts
- RequestError
- Mock Entry Form and Validation
- exam-settings.ts
- result-editor.tsx
- trash-view.tsx
- toast.tsx
- provider.ts
- score-forecast.ts
- coach/route.ts
- Request Proxy and Public Origins
- email-client.ts
- mock-form.tsx
- lib/analytics.ts
- task-toolbar.tsx
- plan-facts.ts
- rate-limit.ts
- credentials.ts
- Score Observatory verification
- chat-transcript.tsx
- film-section.tsx
- compare-view.tsx
- targets-panel.tsx
- Button
- app/layout.tsx
- RouteSkeleton
- sign-in-form.tsx
- api
- requireUser
- connection-input.ts
- RouteError
- extraction.ts
- rate-limit-upstash.ts
- queries/exams.ts
- Continuous Integration Validation Workflow
- cn
- security-panel.tsx
- devDependencies
- sections.tsx
- theme-style-provider.tsx
- format.ts
- trash-view.tsx
- chat-composer.tsx
- client-types.ts
- api.ts
- trash-view.tsx
- workspace-chrome.tsx
- shot.mjs
- Caching and Revalidation Policy
- Folder-Based Routing and Upstash Rate Limiting — Design
- target-settings.ts
- exams-panel.tsx
- sheet.tsx
- progress.ts
- requireUser
- explain-search.ts
- verify-backup-transfer.mjs
- exam-switcher.tsx
- next.config.ts
- Todo API Review and Ownership
- my-tasks-view.tsx
- ProviderStreamDecoder
- atoms.tsx
- lib/search.ts
- next
- Panel
- filters-url.ts
- sign-up-form.tsx
- Primary Architecture Handbook
- PostCSS Build Configuration
- Personal Workspace Migration Requirements
- Authenticated QA and Google Consent
- Controlled Neon Prisma Migrations
- Personal Calendar Counts and Invalidation
- Add Mock Route
- icon.tsx
- command-palette.tsx
- MyTasksView
- compare-view.tsx
- models/route.ts
- ai/todos/route.ts
- filters-url.ts
- ai-settings-form.tsx
- board-view.tsx
- ref_node_test
- about-panel.tsx
- routes.test.ts
- use-ai-workspace.tsx
- cn
- settings-route.tsx
- Paper Tokens and Design Handover
- api
- sections.tsx
- context.ts
- view-model.ts
- Review Focus
- rate-limit-budget.ts
- useToast
- ref_node_fs
- app/page.tsx
- vercel.json
- ws
- AiSettingsForm
- Folder-Based Routing and Upstash Rate Limiting — Implementation Plan
- ai-prompt-security.test.ts
- verify-ownership.mjs
- verify-trash.mjs
- health/route.ts
- prisma
- @neon/config
- maintenance/page.tsx
- ai-chat-sheet.tsx
- rate-limit.ts
- app/not-found.tsx
- LruCache

## God Nodes (most connected - your core abstractions)
1. `cn()` - 306 edges
2. `Button()` - 148 edges
3. `react` - 142 edges
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

## Communities (184 total, 73 thin omitted)

### Community 0 - "calendar-view.tsx"
Cohesion: 0.05
Nodes (92): AgendaGroups(), AgendaView(), EarlierRanges(), CalendarMetrics(), CalendarSurface(), CalendarToolbar(), categoryLabel(), QuietDays() (+84 more)

### Community 1 - "Button"
Cohesion: 0.12
Nodes (43): EventDialog(), PlanDoneState(), RevFlag(), DashboardPlanApi, PersonalTasksPanel(), PipelineProgressSection(), PipelineRevisionSection(), PipelineUpcomingSection() (+35 more)

### Community 2 - "progress/route.ts"
Cohesion: 0.31
Nodes (9): mutationSchema, POST, runtime, getPlanDays(), setChecklistItem(), setDayNotes(), setDayRevision(), TASK_PATCH (+1 more)

### Community 4 - "command-palette.tsx"
Cohesion: 0.06
Nodes (45): AI Status Endpoint Cache Policy (/api/ai/status), Analytics Projections Cache Policy (/api/analytics), api() Client Fetch cache: no-store (src/lib/api-client.ts), Backup Export Raw File Exception (GET /api/backup), Next.js 16 Cache Components Not Enabled, Caching and Revalidation Policy (Phase 8 reference), Filters/Scope URL State Mirror (src/lib/filters-url.ts), force-dynamic Public Auth-Adjacent Pages (+37 more)

### Community 7 - "subject-performance.test.ts"
Cohesion: 0.04
Nodes (64): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, cmdk@^1.1.1, @duo-icons/react@^1.0.1, @hookform/resolvers@^5.9.2, lucide-react@^0.468.0, motion@^12.0.0 (+56 more)

### Community 8 - "ssrf-core.ts"
Cohesion: 0.25
Nodes (11): RFC-1918, assertSafeBaseUrl(), assertSafeBaseUrlShape(), BLOCKED_HOSTNAMES, inV4Range(), ipv4Octets(), isBlockedAddress(), parseBaseUrl() (+3 more)

### Community 10 - "history-screen.tsx"
Cohesion: 0.11
Nodes (38): BrowserFrame(), MockupCaption(), CompareScreen(), delta(), duration(), DashboardScreen(), accuracyTone(), CHART (+30 more)

### Community 11 - "lib/todos.ts"
Cohesion: 0.10
Nodes (36): POST, GET, runtime, DELETE, PATCH, runtime, DELETE, GET (+28 more)

### Community 13 - "repository.ts"
Cohesion: 0.11
Nodes (36): GET, maxDuration, runtime, attemptData(), attemptInclude, attemptWhere(), mapSubjects(), StoredAnalyticsAttempt (+28 more)

### Community 14 - "personal-task-drawer.tsx"
Cohesion: 0.13
Nodes (24): AiActivity, clockLabel(), AskRoute(), AskView(), ComposerMode, FOLLOW_UPS, MODES, DayDrawer() (+16 more)

### Community 15 - "Setup and Operations Handbook"
Cohesion: 0.04
Nodes (68): assertSummary(), attemptLabel(), backfillLegacyQualifying(), BACKUP_FORMAT, BACKUP_FORMAT_VERSION, BACKUP_INSERT_CHUNK_SIZE, BACKUP_MAX_ATTEMPTS, BACKUP_MAX_BYTES (+60 more)

### Community 16 - "ai-composer.tsx"
Cohesion: 0.10
Nodes (42): recharts@^3.0.0, recharts, EmptyChart(), AttemptBreakdown(), BreakdownDonut(), DeepDive(), GroupedScoreBars(), InsightCallout() (+34 more)

### Community 17 - "lib/trash.ts"
Cohesion: 0.09
Nodes (36): Context, devHandle(), handle(), privateNoStore, runtime, withServiceOrigin(), GET(), accessLog() (+28 more)

### Community 18 - "RequestError"
Cohesion: 0.06
Nodes (64): Baseline architecture, Call-site inventory (39 total), Task 5: Wire the limiter into the request path, Rate limiting, zod, POST, bearerToken(), GET (+56 more)

### Community 19 - "Mock Entry Form and Validation"
Cohesion: 0.13
Nodes (21): AppearancePanel(), PaletteChip(), StyleGlyph(), initialPalette(), initialStyle(), PALETTE_IDS, PALETTE_STORAGE_KEY, PaletteId (+13 more)

### Community 20 - "exam-settings.ts"
Cohesion: 0.06
Nodes (66): GET, GET, PATCH, preferencesSchema, PUT, runtime, scopePayload(), settingsSchema (+58 more)

### Community 21 - "result-editor.tsx"
Cohesion: 0.24
Nodes (11): NumberField, ResultEditor(), fill(), istDateKey(), fillFromAttempt(), isLoggableType(), matchAttemptForTask(), namesMatch() (+3 more)

### Community 22 - "trash-view.tsx"
Cohesion: 0.14
Nodes (13): args, evaluate(), height, pending, problems, report, send(), settle (+5 more)

### Community 23 - "toast.tsx"
Cohesion: 0.12
Nodes (22): dynamic, WorkspaceLayout(), GuardLedgerRow(), GuardNotice(), GuardNoticeProps, GuardRow, GuardStyles(), GuardTone (+14 more)

### Community 24 - "provider.ts"
Cohesion: 0.11
Nodes (42): aiAborted(), aiInvalidOutput(), aiOutputIncomplete(), aiRefused(), aiTimeout(), joinProviderUrl(), AiContentPart, AiProvider (+34 more)

### Community 25 - "score-forecast.ts"
Cohesion: 0.12
Nodes (25): Accuracy Footer Divisor Column (83.3% Accuracy), Marks Obtained (70/90) and Score Strip, Outcome Card Illustration (Reasoning), Outcome Counts with Proportion Bars (Correct / Incorrect / Unattempted), Percentile Availability Note ('No standalone subject percentile recorded'), Score-Centered Answer Distribution Ring (77.8% SCORE), Serif Subject Heading with Attempt/Question Subtitle, Soft-Rounded Warm Paper Card Surface (+17 more)

### Community 26 - "coach/route.ts"
Cohesion: 0.06
Nodes (79): bodySchema, maxDuration, POST(), runtime, COACH_FORMAT, maxDuration, POST(), runtime (+71 more)

### Community 27 - "Request Proxy and Public Origins"
Cohesion: 0.12
Nodes (31): ActiveExamFooterNote(), AppFrame(), AppHeader(), AppSidebar(), HeaderLocation(), NavItem(), SidebarContent, SidebarContext (+23 more)

### Community 28 - "email-client.ts"
Cohesion: 0.16
Nodes (26): readSecurityUser(), SecurityUser, useAuthSecurity(), authClient, AuthFailureReason, authGet(), authPost(), AuthSessionRow (+18 more)

### Community 29 - "mock-form.tsx"
Cohesion: 0.13
Nodes (31): DurationInput(), change(), formatParts(), blankSubject(), defaultTierId(), fullMockSectionHeading(), meritSubjectIds(), MockForm() (+23 more)

### Community 30 - "lib/analytics.ts"
Cohesion: 0.19
Nodes (21): analyze(), average(), buildWhereYouStand(), comparePoints(), deepDiveFor(), DeepDiveSubject, derivedSectionPoint(), explicitSectionPoint() (+13 more)

### Community 31 - "task-toolbar.tsx"
Cohesion: 0.12
Nodes (19): filterCount(), PRIORITY_LABELS, SORT_LABELS, STATUS_LABELS, activeFilterEntries(), asString(), DEFAULT_FILTERS, LAYOUTS (+11 more)

### Community 32 - "plan-facts.ts"
Cohesion: 0.08
Nodes (25): DayWorkspaceScreen(), LANDING_PLAN, plan, buildLandingPlan(), category(), isMock(), LandingPlanData, LandingPlanDay (+17 more)

### Community 33 - "rate-limit.ts"
Cohesion: 0.18
Nodes (17): AI_L2_COST, AI_RATE_LIMIT, AI_WINDOW_SECONDS, BudgetState, decideRateLimit(), describeDecision(), ESCALATION_CAP_SECONDS, L2_TIMEOUT_MS (+9 more)

### Community 34 - "credentials.ts"
Cohesion: 0.20
Nodes (21): DELETE, GET, PUT, runtime, isAiThinking(), sameCredentialTarget(), AiCredentialInput, AiCredentialSummary (+13 more)

### Community 35 - "Score Observatory verification"
Cohesion: 0.07
Nodes (52): GET, idSchema, kindSchema, runtime, GET, runtime, loadTrashPage(), TrashQueryInput (+44 more)

### Community 36 - "chat-transcript.tsx"
Cohesion: 0.22
Nodes (12): ActionIconButton(), ChatTranscript(), ChatTranscriptProps, EditButton(), ThinkingBlock(), TurnActions, TurnActionsProps, CopyButton() (+4 more)

### Community 37 - "film-section.tsx"
Cohesion: 0.12
Nodes (27): attemptMeritPercentage(), CHAPTERS, COACH_ANSWER, CountNumber(), FILM_GAP_PTS, FILM_METRICS, FILM_PCT_DELTA, FILM_SUBJECT_BARS (+19 more)

### Community 38 - "compare-view.tsx"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 39 - "targets-panel.tsx"
Cohesion: 0.12
Nodes (27): Reveal(), RevealItem(), RemindersPanel(), ActiveTargetCard(), DefaultRow(), describeSignature(), PercentileExplainer(), PercentileRow() (+19 more)

### Community 40 - "Button"
Cohesion: 0.17
Nodes (9): args, logs, outDir, pending, routes, target, waitMs, widths (+1 more)

### Community 41 - "app/layout.tsx"
Cohesion: 0.09
Nodes (19): Problem, @fontsource-variable/dm-sans@^5.3.0, @fontsource-variable/source-serif-4@^5.3.1, next-themes@^0.4.6, @vercel/analytics@^2.0.1, @vercel/speed-insights@^2.0.0, @fontsource-variable/dm-sans, @fontsource-variable/source-serif-4 (+11 more)

### Community 42 - "RouteSkeleton"
Cohesion: 0.25
Nodes (18): AddLoading(), AskLoading(), CalendarLoading(), CompareLoading(), DashboardLoading(), HistoryLoading(), MytasksLoading(), PerformanceLoading() (+10 more)

### Community 43 - "sign-in-form.tsx"
Cohesion: 0.12
Nodes (27): CodeInput(), FormError(), onForgot(), OtpLogin(), SignInCredentialsForm(), SignInForm(), SignInMode, TotpStep() (+19 more)

### Community 44 - "api"
Cohesion: 0.12
Nodes (15): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+7 more)

### Community 45 - "requireUser"
Cohesion: 0.12
Nodes (15): jobs, validate, name, permissions, contents, run, uses, with (+7 more)

### Community 46 - "connection-input.ts"
Cohesion: 0.08
Nodes (46): maxDuration, POST, PROBE_MESSAGES, runtime, aiConfig(), aiConfigOrNull(), AI_THINKING_LEVELS, AI_THINKING_VALUES (+38 more)

### Community 47 - "RouteError"
Cohesion: 0.12
Nodes (17): ForgotPasswordError(), SignInError(), SignUpError(), AddError(), AskError(), CalendarError(), CompareError(), DashboardError() (+9 more)

### Community 48 - "extraction.ts"
Cohesion: 0.12
Nodes (30): ExtractionReview(), update(), updateSubject(), FieldIssues(), NullableDuration(), optionalNumber(), LogMockFlow(), SubjectRoster() (+22 more)

### Community 49 - "rate-limit-upstash.ts"
Cohesion: 0.23
Nodes (16): BREAKER_OPEN_MS, BREAKER_THRESHOLD, BreakerState, initialBreaker(), isBreakerOpen(), onFailure(), onSuccess(), tickBreaker() (+8 more)

### Community 50 - "queries/exams.ts"
Cohesion: 0.08
Nodes (31): BouncingSwitch(), EMPTY_PREFERENCES, ExamScope, ExamScopeContext, ExamScopeProvider(), tierLabelFallback(), examsScopeSchema, ExamsScopeValues (+23 more)

### Community 51 - "Continuous Integration Validation Workflow"
Cohesion: 0.20
Nodes (8): Multi-Theme System (data-palette x data-style), Palettes x Styles Theme Matrix, Typography Scale (Source Serif 4 + DM Sans), Missing Radius System Finding, Elevation Model and --shadow-pop Token, Restrained Motion Language, Tokenized Radius Scale (panel/control/card/pill), Sticky Identity Column for Mock History

### Community 52 - "cn"
Cohesion: 0.18
Nodes (9): args, evaluate(), height, pending, report, send(), target, width (+1 more)

### Community 53 - "security-panel.tsx"
Cohesion: 0.15
Nodes (25): @hookform/resolvers, lucide-react, react-hook-form, ChangePasswordDialog(), DisableTwoFactorDialog(), EnrollDialog(), EnrollStep, RegenerateCodesDialog() (+17 more)

### Community 54 - "devDependencies"
Cohesion: 0.07
Nodes (29): devDependencies, eslint@^9.0.0, eslint-config-next@^16.0.0, prettier@^3.9.10, react-is@^19.3.1, tailwindcss@^4.0.0, @tailwindcss/postcss@^4.0.0, @tanstack/react-query-devtools@^5.105.0 (+21 more)

### Community 55 - "sections.tsx"
Cohesion: 0.20
Nodes (10): Request and Ownership Architecture, Neon Agent Tooling Setup (Codex plugin + MCP), Expiring QA Branch Migration Rehearsal, Selected Neon Environment (org/project/branch), Private-Accounts Migration (claim two shared mocks), Session-Derived Ownership Model, Isolation and Ownership Verification, Google Sign-In via Neon Auth OAuth (+2 more)

### Community 56 - "theme-style-provider.tsx"
Cohesion: 0.17
Nodes (12): scripts, build, check, db:generate, db:migrate, dev, lint, postinstall (+4 more)

### Community 57 - "format.ts"
Cohesion: 0.09
Nodes (28): PersonalCalendar(), personalMonthRange(), categoryMeta(), Group, GroupRow(), KanbanBoard(), PageLayout, PersonalTodos() (+20 more)

### Community 58 - "trash-view.tsx"
Cohesion: 0.20
Nodes (9): Confirmed requirements, Dated personal todos and AI-assisted planning, Existing foundation, Finalized navigation and lifecycle, Phase 1 — Design the dated planner and review flow, Phase 2 — Extend task storage and manual workflows, Phase 3 — Add AI proposal and confirmed-apply workflows, Phase 4 — Validate and document (+1 more)

### Community 59 - "chat-composer.tsx"
Cohesion: 0.26
Nodes (9): ChatComposer(), attach(), ComposerModeOption, downscaleToDataUrl(), IMAGE_MAX_EDGE, IMAGE_QUALITY, isImageFile(), MAX_ATTACHED_IMAGES (+1 more)

### Community 60 - "client-types.ts"
Cohesion: 0.25
Nodes (5): Dashboard Analytical Scopes (full/subject/sectional/all), Backup Format v2 and Account Transfer, Semantic Chart Palette and Chart Rules, Core Product Workflows, JSON Backup Format Version 2

### Community 61 - "api.ts"
Cohesion: 0.12
Nodes (13): DELETE, dynamic, GET, PATCH, POST, PUT, runtime, privateHeaders (+5 more)

### Community 62 - "trash-view.tsx"
Cohesion: 0.13
Nodes (33): dynamic, TrashPage(), KindFilter, messageOf(), rowKey(), toItemRef(), TrashView(), ungroupedCount() (+25 more)

### Community 63 - "workspace-chrome.tsx"
Cohesion: 0.17
Nodes (15): @tanstack/react-query, EMPTY_ATTEMPTS, Handlers, WorkspaceChrome(), DashboardScope, Filters, analyticsKeys, analyticsQueryOptions() (+7 more)

### Community 64 - "shot.mjs"
Cohesion: 0.40
Nodes (6): Known Limitations (duo-icons fill-rule, native inputs), Design System Source-of-Truth Map, Icon Inconsistency Finding (14 ad-hoc sizes), Icon Size Scale (14/16/18/22/28), Named Imports for Bundle Reduction, Raw Lucide Imports Migrated into Semantic Icon Map

### Community 68 - "Caching and Revalidation Policy"
Cohesion: 0.50
Nodes (5): WorkspaceShell Client Orchestrator and Its Three Hooks, dashboard.tsx Monolith Split Finding, UI Baseline Audit Findings (26 prioritized items), 15-Phase Execution Order, Unified Segmented Control (.segment-group)

### Community 69 - "Folder-Based Routing and Upstash Rate Limiting — Design"
Cohesion: 0.18
Nodes (10): Architecture, Colocation rule, Decisions, Folder-Based Routing and Upstash Rate Limiting — Design, Goals, Invariants that must not move, Non-goals, Redistribution of the shell's local state (+2 more)

### Community 70 - "target-settings.ts"
Cohesion: 0.12
Nodes (23): TierPattern, BUILT_IN_EXAMS, applyTargetEdit(), applyTargetEdits(), EMPTY_TARGETS, isCurrentTargetShape(), isPlainObject(), LEGACY_EXAM_PRIMARY_TIER (+15 more)

### Community 71 - "exams-panel.tsx"
Cohesion: 0.09
Nodes (46): CustomExamDialog(), describeTier(), ExamRow(), ExamsPanel(), maxOf(), SourceSummary, StageSummary, SUBJECT_CHOICES (+38 more)

### Community 72 - "sheet.tsx"
Cohesion: 0.19
Nodes (19): AiPlanSheet(), TrashDetailSheet(), AiChatSheet(), Masthead(), onScroll(), read(), NAV, TodoAiComposer() (+11 more)

### Community 73 - "progress.ts"
Cohesion: 0.13
Nodes (20): GET, runtime, GET, dynamic, MyTasksPage(), MyTasksRoute(), dynamic, PlanPage() (+12 more)

### Community 74 - "requireUser"
Cohesion: 0.12
Nodes (46): Task 7: RSC foundation, Tasks 8–19: Route migrations, GET, runtime, GET, AddPage(), dynamic, AskPage() (+38 more)

### Community 75 - "explain-search.ts"
Cohesion: 0.22
Nodes (6): @prisma/adapter-pg@^7.10.1, @prisma/adapter-pg, env, match, prisma, queries

### Community 89 - "exam-switcher.tsx"
Cohesion: 0.33
Nodes (17): BulkBar(), MenuOption(), TaskToolbar(), TrashRow(), AuthControl(), AuthControlProps, AuthError(), ExamSwitcher() (+9 more)

### Community 124 - "my-tasks-view.tsx"
Cohesion: 0.11
Nodes (22): ApplyOp, ConfirmState, RescheduleState, TAB_ITEMS, TaskSection(), OverviewStrip(), TasksEmptyState(), TaskViewTab (+14 more)

### Community 126 - "atoms.tsx"
Cohesion: 0.20
Nodes (10): CountUp(), FloatingInk(), InkArt(), Petals, PetalSpec, TypedLine(), HeroArt(), Hero() (+2 more)

### Community 127 - "lib/search.ts"
Cohesion: 0.11
Nodes (37): collectCursors(), GET, runtime, escapeLike(), ATTEMPT_PHASES, attemptItem(), attemptPhaseWhere(), decodeSearchCursors() (+29 more)

### Community 128 - "next"
Cohesion: 0.09
Nodes (33): next, CalendarRoute(), DashboardRoute(), NO_FILTERS, metadata, PlanDayRoute(), metadata, dynamic (+25 more)

### Community 129 - "Panel"
Cohesion: 0.05
Nodes (76): motion, AttemptBreakdownPanel(), DistributionPanel(), PAD, FindingsPanel(), points(), sentence(), TONE_ICON (+68 more)

### Community 130 - "filters-url.ts"
Cohesion: 0.15
Nodes (19): AddMockView(), AddRoute(), AddRouteInner(), LogMockPayload, ATTEMPT_SORT_KEYS, filtersSchema, DEFAULT_SCOPE, defaultListState (+11 more)

### Community 131 - "sign-up-form.tsx"
Cohesion: 0.31
Nodes (7): useAuthActions(), signIn(), GoogleGlyph(), GoogleSignInButton(), signIn(), GoogleSignInButtonProps, startGoogleSignIn()

### Community 139 - "Add Mock Route"
Cohesion: 0.13
Nodes (18): AttemptInput, buildAttempt(), FULL_ROWS, LANDING_ATTEMPTS, LANDING_FULL_MOCKS, LANDING_LATEST, LANDING_SCOPES, LANDING_SUMMARY (+10 more)

### Community 140 - "icon.tsx"
Cohesion: 0.16
Nodes (23): Loading, error and not-found surfaces, PlanWithToday, DashboardView(), RecentAttemptsPanel(), DoneDot(), EmptyCell(), WeekCell(), WeekStripPanel() (+15 more)

### Community 141 - "command-palette.tsx"
Cohesion: 0.12
Nodes (32): NAV_GROUPS, planHref(), CommandPalette(), CommandPaletteProps, loadRecentSearches(), PaletteBody(), persistRecentSearches(), RecentAction (+24 more)

### Community 142 - "MyTasksView"
Cohesion: 0.16
Nodes (13): MyTasksView(), bulkRescheduleApply(), bulkStatus(), bulkTrashSelected(), clearSelection(), createTask(), cycleStatus(), duplicate() (+5 more)

### Community 143 - "compare-view.tsx"
Cohesion: 0.09
Nodes (47): buildComparison(), buildSectionRows(), ChangeCell(), CompareView, Comparison, ComparisonLedger(), ComparisonRow, ErrorState() (+39 more)

### Community 144 - "models/route.ts"
Cohesion: 0.22
Nodes (12): maxDuration, POST, runtime, aiConnectionSchema, resolveDraftConnection(), AiModel, fetchModelCatalog(), ModelCatalogTarget (+4 more)

### Community 145 - "ai/todos/route.ts"
Cohesion: 0.20
Nodes (13): maxDuration, runtime, MAX_TODO_PROMPT_CHARS, parseTodoProposals(), Target, TODO_DATE_QUESTION, todoDraftMessages(), todoDraftRequestSchema (+5 more)

### Community 146 - "filters-url.ts"
Cohesion: 0.12
Nodes (24): radix-ui, react, CompareRoute(), CompareReference, HistoryRoute(), PerformanceRoute(), platformsOf(), DateRangeFilter() (+16 more)

### Community 147 - "ai-settings-form.tsx"
Cohesion: 0.08
Nodes (22): Catalog, EMPTY_CATALOG, EMPTY_FORM, Props, PROTOCOL_LABELS, THINKING_LABELS, THINKING_LEVELS, aiSchema (+14 more)

### Community 148 - "board-view.tsx"
Cohesion: 0.36
Nodes (10): BoardView(), handleDrop(), columnFor(), COLUMNS, nextStatus(), PersonalTaskDisplayStatus, StatusDot(), statusOf() (+2 more)

### Community 149 - "ref_node_test"
Cohesion: 0.06
Nodes (27): filterAttempts(), targetMarks(), duplicateKey(), Marking, attemptSchema, input, AttemptSeed, MARKING (+19 more)

### Community 150 - "about-panel.tsx"
Cohesion: 0.31
Nodes (8): AboutPanel(), Avatar, AvatarFallback, AvatarImage, Badge(), BadgeProps, badgeVariants, CATALOG_VERSION

### Community 151 - "routes.test.ts"
Cohesion: 0.17
Nodes (14): The layout keeps only what must survive navigation, AppHeaderProps, VIEW_META, useKeyboardShortcuts(), isTypingTarget(), onKey(), AI_VIEWS, APP_VIEWS (+6 more)

### Community 152 - "use-ai-workspace.tsx"
Cohesion: 0.05
Nodes (60): api(), backup(), cookies, preview(), raw(), replace(), settings, ConversationGroup (+52 more)

### Community 153 - "cn"
Cohesion: 0.11
Nodes (25): PlanCategoryLegend(), DrawerFooter(), DrawerHeader(), FormControl, FormDescription, FormFieldContext, FormFieldContextValue, FormItem (+17 more)

### Community 154 - "settings-route.tsx"
Cohesion: 0.53
Nodes (4): dynamic, SettingsPage(), SettingsRoute(), useBackupImport()

### Community 155 - "Paper Tokens and Design Handover"
Cohesion: 0.20
Nodes (9): args, evaluate(), pending, send(), target, url, wait, widths (+1 more)

### Community 156 - "api"
Cohesion: 0.08
Nodes (38): Client State Architecture Audit — 2026-10-31, Design decisions, Findings, Migration roadmap (executed order), Standing gaps (out of scope, recorded), FEATURE_META, STATUS_DOT, DraftResponse (+30 more)

### Community 157 - "sections.tsx"
Cohesion: 0.14
Nodes (27): DuotoneIcon(), FloatingAsk(), RAIL_ITEMS, SectionRail(), onScroll(), read(), Faq(), FAQ_ITEMS (+19 more)

### Community 158 - "context.ts"
Cohesion: 0.29
Nodes (9): AiContext, average(), buildAiContext(), fullMockProfile(), payload(), recentFullMock(), sectionProfile(), subjectProfile() (+1 more)

### Community 159 - "view-model.ts"
Cohesion: 0.08
Nodes (34): DayLedger(), EmptyActions(), LoadLine(), DayActions, DaySections(), AttemptEntryRow(), entryPlanRow(), PersonalEntryRow() (+26 more)

### Community 160 - "Review Focus"
Cohesion: 0.22
Nodes (9): Review Focus, Task 0: Toolchain and baseline, Task 1: Spec and plan documents, Task 20: Retire the shell, Task 21: Verification and documentation closeout, Task 2: Route, colocation and client-boundary guards, Task 3: Pure rate-limit policy, Task 4: Command budget and Upstash adapter (+1 more)

### Community 161 - "rate-limit-budget.ts"
Cohesion: 0.49
Nodes (8): budgetState, checkBudget(), initialBudget(), nextBudget(), noteCommand(), resetBudgetForTests(), spendCommand(), BUDGET_CAPS

### Community 162 - "useToast"
Cohesion: 0.20
Nodes (13): dynamic, ForgotPasswordPage(), metadata, dynamic, metadata, SignInPage(), dynamic, metadata (+5 more)

### Community 163 - "ref_node_fs"
Cohesion: 0.11
Nodes (10): packageDir, REPLACEMENTS, targets, root, allSourceFiles(), APP, privateFiles(), ROOT (+2 more)

### Community 164 - "app/page.tsx"
Cohesion: 0.19
Nodes (7): cspDev, cspProduction, nextConfig, productionHeaders, dynamic, LandingPage(), metadata

### Community 166 - "ws"
Cohesion: 0.25
Nodes (6): ws@^8.22.0, ws, logs, pending, target, ws

### Community 167 - "AiSettingsForm"
Cohesion: 0.36
Nodes (8): AiSettingsForm(), chooseProvider(), fetchModels(), patchFields(), payloadFrom(), remove(), test(), credentialToValues()

### Community 168 - "Folder-Based Routing and Upstash Rate Limiting — Implementation Plan"
Cohesion: 0.40
Nodes (4): Baseline and environment facts (measured in Task 0), Folder-Based Routing and Upstash Rate Limiting — Implementation Plan, Global Constraints, Rulings carried into this plan

### Community 169 - "ai-prompt-security.test.ts"
Cohesion: 0.10
Nodes (33): AssistantBody(), attachImages(), chatMessages(), coachMessages(), contextBlock(), extractionMessages(), FALLBACK_SHAPE, marksFor() (+25 more)

### Community 170 - "verify-ownership.mjs"
Cohesion: 0.33
Nodes (6): api(), cookies, created, input, original, raw()

### Community 171 - "verify-trash.mjs"
Cohesion: 0.21
Nodes (10): api(), full, ids, raw(), api(), cookies, created, input (+2 more)

### Community 173 - "health/route.ts"
Cohesion: 0.40
Nodes (5): dynamic, GET, HealthStatus, runtime, healthSnapshot()

### Community 177 - "ai-chat-sheet.tsx"
Cohesion: 0.28
Nodes (10): AskChatTab(), SheetUsageFooter(), ChatEmptyState(), greetingFor(), SUGGESTIONS, ConversationList, UsageFooter(), useAiWorkspace() (+2 more)

### Community 178 - "rate-limit.ts"
Cohesion: 0.14
Nodes (13): aiRateLimiter, apiRateLimiter, Bucket, clientIp(), escalatedRetryAfter(), RateClass, RateLimitHeaders, rateLimitHeadersFor() (+5 more)

## Ambiguous Edges - Review These
- `Stack Inventory (Next 16.4.3, React 19.2, TS 5.9, Tailwind 4, Recharts 3, motion 12)` → `Private Accounts Release Notes`  [AMBIGUOUS]
  docs/ui-overhaul/phase-1-audit.md · relation: conceptually_related_to

## Knowledge Gaps
- **36 isolated node(s):** `RFC-1918`, `Analytics Projections Cache Policy (/api/analytics)`, `force-dynamic Public Auth-Adjacent Pages`, `Health Endpoint Rate-Limit-Exempt (/api/health)`, `Firebase/Mongo Runtime Dependencies Removed` (+31 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1152 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **73 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `filters-url.ts` to `calendar-view.tsx`, `Button`, `filters-url.ts`, `next`, `Panel`, `sign-up-form.tsx`, `subject-performance.test.ts`, `history-screen.tsx`, `Add Mock Route`, `icon.tsx`, `command-palette.tsx`, `personal-task-drawer.tsx`, `compare-view.tsx`, `Setup and Operations Handbook`, `ai-composer.tsx`, `ai-settings-form.tsx`, `board-view.tsx`, `result-editor.tsx`, `Mock Entry Form and Validation`, `toast.tsx`, `use-ai-workspace.tsx`, `about-panel.tsx`, `settings-route.tsx`, `cn`, `api`, `mock-form.tsx`, `email-client.ts`, `task-toolbar.tsx`, `view-model.ts`, `sections.tsx`, `useToast`, `Request Proxy and Public Origins`, `chat-transcript.tsx`, `film-section.tsx`, `targets-panel.tsx`, `app/layout.tsx`, `sign-in-form.tsx`, `RouteError`, `extraction.ts`, `ai-chat-sheet.tsx`, `queries/exams.ts`, `security-panel.tsx`, `format.ts`, `chat-composer.tsx`, `trash-view.tsx`, `workspace-chrome.tsx`, `exams-panel.tsx`, `sheet.tsx`, `exam-switcher.tsx`, `my-tasks-view.tsx`, `atoms.tsx`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **What connects `RFC-1918`, `Analytics Projections Cache Policy (/api/analytics)`, `force-dynamic Public Auth-Adjacent Pages` to the rest of the system?**
  _36 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `calendar-view.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.04747899159663865 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `cn` to `calendar-view.tsx`, `Button`, `Panel`, `history-screen.tsx`, `icon.tsx`, `command-palette.tsx`, `personal-task-drawer.tsx`, `compare-view.tsx`, `MyTasksView`, `ai-composer.tsx`, `filters-url.ts`, `ai-settings-form.tsx`, `board-view.tsx`, `Mock Entry Form and Validation`, `about-panel.tsx`, `use-ai-workspace.tsx`, `Request Proxy and Public Origins`, `api`, `sections.tsx`, `task-toolbar.tsx`, `view-model.ts`, `chat-transcript.tsx`, `film-section.tsx`, `targets-panel.tsx`, `AiSettingsForm`, `RouteSkeleton`, `sign-in-form.tsx`, `extraction.ts`, `ai-chat-sheet.tsx`, `queries/exams.ts`, `security-panel.tsx`, `format.ts`, `chat-composer.tsx`, `trash-view.tsx`, `exams-panel.tsx`, `sheet.tsx`, `exam-switcher.tsx`, `my-tasks-view.tsx`, `atoms.tsx`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Should `Button` be split into smaller, more focused modules?**
  _Cohesion score 0.11675741076830005 - nodes in this community are weakly interconnected._
- **Why does `next` connect `next` to `calendar-view.tsx`, `Button`, `filters-url.ts`, `Panel`, `subject-performance.test.ts`, `icon.tsx`, `command-palette.tsx`, `personal-task-drawer.tsx`, `ai-composer.tsx`, `lib/trash.ts`, `filters-url.ts`, `RequestError`, `toast.tsx`, `settings-route.tsx`, `Request Proxy and Public Origins`, `sections.tsx`, `view-model.ts`, `useToast`, `app/page.tsx`, `app/layout.tsx`, `sign-in-form.tsx`, `RouteError`, `maintenance/page.tsx`, `app/not-found.tsx`, `security-panel.tsx`, `api.ts`, `trash-view.tsx`, `workspace-chrome.tsx`, `sheet.tsx`, `progress.ts`, `requireUser`, `atoms.tsx`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Stack Inventory (Next 16.4.3, React 19.2, TS 5.9, Tailwind 4, Recharts 3, motion 12)` and `Private Accounts Release Notes`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._