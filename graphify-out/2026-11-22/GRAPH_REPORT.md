# Graph Report - ssc-insight-2  (2026-11-21)

## Corpus Check
- 510 files · ~366,324 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 4, .css 2, .example 1)

## Summary
- 3743 nodes · 11896 edges · 167 communities (97 shown, 70 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 143 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7a24691a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- calendar-view.tsx
- MyTasksView
- progress.ts
- ssrf-core.ts
- command-palette.tsx
- domain.ts
- Primary Architecture Handbook
- subject-performance.test.ts
- config-core.ts
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
- calendar-entries.ts
- trash-view.tsx
- private-workspace.tsx
- provider.ts
- score-forecast.ts
- coach/route.ts
- Request Proxy and Public Origins
- email-client.ts
- models/route.ts
- lib/analytics.ts
- task-toolbar.tsx
- plan-facts.ts
- rate-limit.ts
- credentials.ts
- Score Observatory verification
- chat-transcript.tsx
- film-section.tsx
- compare-view.tsx
- backup.test.ts
- Button
- app/layout.tsx
- RouteSkeleton
- result-editor.tsx
- api
- requireUser
- connection-input.ts
- RouteError
- mock-form.tsx
- rate-limit-upstash.ts
- exams-panel.tsx
- Continuous Integration Validation Workflow
- cn
- sign-in-form.tsx
- devDependencies
- sections.tsx
- theme-style-provider.tsx
- format.ts
- trash-view.tsx
- chat-composer.tsx
- client-types.ts
- route-handler.ts
- cn
- react
- shot.mjs
- Caching and Revalidation Policy
- Folder-Based Routing and Upstash Rate Limiting — Design
- plan-day-view.tsx
- exams-panel.tsx
- sheet.tsx
- attempt-outcome-card.tsx
- requireUser
- explain-search.ts
- verify-backup-transfer.mjs
- parseBackup
- next.config.ts
- Todo API Review and Ownership
- format.ts
- ProviderStreamDecoder
- atoms.tsx
- lib/search.ts
- plan/[date]/not-found.tsx
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
- next.config.ts
- compare-view.tsx
- verify-backup-transfer.mjs
- use-backup-import.ts
- filters-url.ts
- ai-settings-form.tsx
- reminders-panel.tsx
- use-ai-workspace.tsx
- Paper Tokens and Design Handover
- workspace-chrome.tsx
- sections.tsx
- dashboard-view.tsx
- view-model.ts
- Review Focus
- useToast
- ref_node_fs
- vercel.json
- ai-prompt-security.test.ts
- ai/todos.ts
- conversation-list.tsx
- LruCache

## God Nodes (most connected - your core abstractions)
1. `cn()` - 306 edges
2. `Button()` - 148 edges
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

## Communities (167 total, 70 thin omitted)

### Community 0 - "calendar-view.tsx"
Cohesion: 0.09
Nodes (32): CalendarSurface(), CalendarToolbar(), LayerToggles(), CalendarLegend(), PeriodNav(), stepSize(), UNIT, CalendarView() (+24 more)

### Community 1 - "MyTasksView"
Cohesion: 0.14
Nodes (16): MyTasksView(), bulkRescheduleApply(), bulkStatus(), bulkTrashSelected(), clearSelection(), createTask(), cycleStatus(), duplicate() (+8 more)

### Community 2 - "progress.ts"
Cohesion: 0.09
Nodes (31): mutationSchema, POST, runtime, GET, runtime, DELETE, idSchema, PUT (+23 more)

### Community 4 - "command-palette.tsx"
Cohesion: 0.06
Nodes (45): AI Status Endpoint Cache Policy (/api/ai/status), Analytics Projections Cache Policy (/api/analytics), api() Client Fetch cache: no-store (src/lib/api-client.ts), Backup Export Raw File Exception (GET /api/backup), Next.js 16 Cache Components Not Enabled, Caching and Revalidation Policy (Phase 8 reference), Filters/Scope URL State Mirror (src/lib/filters-url.ts), force-dynamic Public Auth-Adjacent Pages (+37 more)

### Community 7 - "subject-performance.test.ts"
Cohesion: 0.04
Nodes (67): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, cmdk@^1.1.1, @duo-icons/react@^1.0.1, @hookform/resolvers@^5.9.2, lucide-react@^0.468.0, motion@^12.0.0 (+59 more)

### Community 8 - "config-core.ts"
Cohesion: 0.11
Nodes (29): maxDuration, POST, PROBE_MESSAGES, runtime, aiConfig(), aiConfigOrNull(), AI_THINKING_LEVELS, AI_THINKING_VALUES (+21 more)

### Community 10 - "history-screen.tsx"
Cohesion: 0.13
Nodes (30): BrowserFrame(), MockupCaption(), CompareScreen(), delta(), duration(), accuracyTone(), ChipTone, MockChip() (+22 more)

### Community 11 - "lib/todos.ts"
Cohesion: 0.12
Nodes (31): POST, GET, runtime, DELETE, GET, POST, runtime, applyTodos() (+23 more)

### Community 13 - "repository.ts"
Cohesion: 0.08
Nodes (43): GET, maxDuration, runtime, privateHeaders, attemptData(), attemptInclude, attemptWhere(), mapSubjects() (+35 more)

### Community 14 - "personal-task-drawer.tsx"
Cohesion: 0.09
Nodes (38): AiActivity, clockLabel(), FEATURE_META, STATUS_DOT, AskRoute(), AskView(), ComposerMode, FOLLOW_UPS (+30 more)

### Community 15 - "Setup and Operations Handbook"
Cohesion: 0.05
Nodes (42): attemptLabel(), BACKUP_INSERT_CHUNK_SIZE, BACKUP_SAMPLE_LIMIT, backupAttemptSchema, backupAttemptsWithBounds, BackupPersonalTask, BackupPlanDayProgress, BackupPlanner (+34 more)

### Community 16 - "ai-composer.tsx"
Cohesion: 0.11
Nodes (39): EmptyChart(), AttemptBreakdown(), BreakdownDonut(), DeepDive(), GroupedScoreBars(), InsightCallout(), paperMax(), PerformanceOverview (+31 more)

### Community 17 - "lib/trash.ts"
Cohesion: 0.10
Nodes (33): Context, devHandle(), handle(), privateNoStore, runtime, GET(), accessLog(), AccessLogEvent (+25 more)

### Community 18 - "RequestError"
Cohesion: 0.06
Nodes (72): POST, bearerToken(), GET, maxDuration, runtime, secretMatches(), assignTierIds(), customExamInputSchema (+64 more)

### Community 19 - "Mock Entry Form and Validation"
Cohesion: 0.12
Nodes (23): AppearancePanel(), PaletteChip(), StyleGlyph(), Swap(), initialPalette(), initialStyle(), microMotion(), PALETTE_IDS (+15 more)

### Community 20 - "exam-settings.ts"
Cohesion: 0.05
Nodes (79): GET, runtime, AiBundle, loadAiBundle(), Entry, PatternSection, PatternShape, SubjectId (+71 more)

### Community 21 - "calendar-entries.ts"
Cohesion: 0.08
Nodes (51): AgendaGroups(), AgendaView(), EarlierRanges(), CalendarMetrics(), categoryLabel(), QuietDays(), CellRow(), MonthCell() (+43 more)

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
Cohesion: 0.07
Nodes (58): zod, bodySchema, maxDuration, POST(), runtime, COACH_FORMAT, maxDuration, POST() (+50 more)

### Community 27 - "Request Proxy and Public Origins"
Cohesion: 0.09
Nodes (44): The layout keeps only what must survive navigation, ActiveExamFooterNote(), AppFrame(), AppHeader(), AppHeaderProps, AppSidebar(), HeaderLocation(), NavItem() (+36 more)

### Community 28 - "email-client.ts"
Cohesion: 0.17
Nodes (26): readSecurityUser(), SecurityUser, useAuthSecurity(), OtpLogin(), AuthFailureReason, authGet(), authPost(), AuthSessionRow (+18 more)

### Community 29 - "models/route.ts"
Cohesion: 0.22
Nodes (12): maxDuration, POST, runtime, aiConnectionSchema, resolveDraftConnection(), AiModel, fetchModelCatalog(), ModelCatalogTarget (+4 more)

### Community 30 - "lib/analytics.ts"
Cohesion: 0.06
Nodes (48): analyze(), average(), buildWhereYouStand(), comparePoints(), deepDiveFor(), derivedSectionPoint(), explicitSectionPoint(), filterAttempts() (+40 more)

### Community 31 - "task-toolbar.tsx"
Cohesion: 0.10
Nodes (41): BulkBar(), filterCount(), MenuOption(), PRIORITY_LABELS, SORT_LABELS, STATUS_LABELS, TaskToolbar(), asString() (+33 more)

### Community 32 - "plan-facts.ts"
Cohesion: 0.08
Nodes (23): LANDING_PLAN, plan, buildLandingPlan(), category(), isMock(), LandingPlanDay, LandingPlanTask, RawDay (+15 more)

### Community 33 - "rate-limit.ts"
Cohesion: 0.09
Nodes (37): aiRateLimiter, apiRateLimiter, Bucket, budgetState, checkBudget(), initialBudget(), nextBudget(), noteCommand() (+29 more)

### Community 34 - "credentials.ts"
Cohesion: 0.17
Nodes (25): DELETE, GET, PUT, runtime, dynamic, GET(), runtime, isAiThinking() (+17 more)

### Community 35 - "Score Observatory verification"
Cohesion: 0.07
Nodes (54): GET, idSchema, kindSchema, runtime, POST, runtime, GET, runtime (+46 more)

### Community 36 - "chat-transcript.tsx"
Cohesion: 0.23
Nodes (12): AssistantBody(), ChatTranscript(), ChatTranscriptProps, EditButton(), ThinkingBlock(), TurnActions, TurnActionsProps, CopyButton() (+4 more)

### Community 37 - "film-section.tsx"
Cohesion: 0.12
Nodes (27): attemptMeritPercentage(), CHAPTERS, COACH_ANSWER, CountNumber(), FILM_GAP_PTS, FILM_METRICS, FILM_PCT_DELTA, FILM_SUBJECT_BARS (+19 more)

### Community 38 - "compare-view.tsx"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 39 - "backup.test.ts"
Cohesion: 0.13
Nodes (13): BACKUP_FORMAT, BACKUP_FORMAT_VERSION, BACKUP_MAX_ATTEMPTS, backup, english, full, ga, PLANNER (+5 more)

### Community 40 - "Button"
Cohesion: 0.10
Nodes (15): ws@^8.22.0, ws, logs, pending, target, ws, args, logs (+7 more)

### Community 41 - "app/layout.tsx"
Cohesion: 0.10
Nodes (18): @fontsource-variable/dm-sans@^5.3.0, @fontsource-variable/source-serif-4@^5.3.1, next-themes@^0.4.6, @vercel/analytics@^2.0.1, @vercel/speed-insights@^2.0.0, @fontsource-variable/dm-sans, @fontsource-variable/source-serif-4, next-themes (+10 more)

### Community 42 - "RouteSkeleton"
Cohesion: 0.25
Nodes (18): AddLoading(), AskLoading(), CalendarLoading(), CompareLoading(), DashboardLoading(), HistoryLoading(), MytasksLoading(), PerformanceLoading() (+10 more)

### Community 43 - "result-editor.tsx"
Cohesion: 0.24
Nodes (11): NumberField, ResultEditor(), fill(), fillFromAttempt(), isLoggableType(), matchAttemptForTask(), namesMatch(), normalizeName() (+3 more)

### Community 44 - "api"
Cohesion: 0.12
Nodes (15): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+7 more)

### Community 45 - "requireUser"
Cohesion: 0.12
Nodes (15): jobs, validate, name, permissions, contents, run, uses, with (+7 more)

### Community 46 - "connection-input.ts"
Cohesion: 0.13
Nodes (23): AiCredentialInput, aiCredentialSchema, connectionFields, connectionPolicy(), normaliseAiConnectionInput(), NormalisedConnection, RawConnection, rawConnectionSchema (+15 more)

### Community 47 - "RouteError"
Cohesion: 0.12
Nodes (17): ForgotPasswordError(), SignInError(), SignUpError(), AddError(), AskError(), CalendarError(), CompareError(), DashboardError() (+9 more)

### Community 48 - "mock-form.tsx"
Cohesion: 0.07
Nodes (60): DurationInput(), change(), formatParts(), blankSubject(), defaultTierId(), fullMockSectionHeading(), meritSubjectIds(), MockForm() (+52 more)

### Community 49 - "rate-limit-upstash.ts"
Cohesion: 0.23
Nodes (16): BREAKER_OPEN_MS, BREAKER_THRESHOLD, BreakerState, initialBreaker(), isBreakerOpen(), onFailure(), onSuccess(), tickBreaker() (+8 more)

### Community 50 - "exams-panel.tsx"
Cohesion: 0.08
Nodes (31): dynamic, WorkspaceLayout(), ExamScope, ExamScopeContext, ExamScopeProvider(), tierLabelFallback(), QueryProvider(), Toast (+23 more)

### Community 51 - "Continuous Integration Validation Workflow"
Cohesion: 0.20
Nodes (8): Multi-Theme System (data-palette x data-style), Palettes x Styles Theme Matrix, Typography Scale (Source Serif 4 + DM Sans), Missing Radius System Finding, Elevation Model and --shadow-pop Token, Restrained Motion Language, Tokenized Radius Scale (panel/control/card/pill), Sticky Identity Column for Mock History

### Community 52 - "cn"
Cohesion: 0.18
Nodes (9): args, evaluate(), height, pending, report, send(), target, width (+1 more)

### Community 53 - "sign-in-form.tsx"
Cohesion: 0.09
Nodes (47): @hookform/resolvers, react-hook-form, ChangePasswordDialog(), DisableTwoFactorDialog(), EnrollDialog(), EnrollStep, initialsOf(), RegenerateCodesDialog() (+39 more)

### Community 54 - "devDependencies"
Cohesion: 0.06
Nodes (31): devDependencies, eslint@^9.0.0, eslint-config-next@^16.0.0, prettier@^3.9.10, prisma@7.10.1, react-is@^19.3.1, tailwindcss@^4.0.0, @tailwindcss/postcss@^4.0.0 (+23 more)

### Community 55 - "sections.tsx"
Cohesion: 0.20
Nodes (10): Request and Ownership Architecture, Neon Agent Tooling Setup (Codex plugin + MCP), Expiring QA Branch Migration Rehearsal, Selected Neon Environment (org/project/branch), Private-Accounts Migration (claim two shared mocks), Session-Derived Ownership Model, Isolation and Ownership Verification, Google Sign-In via Neon Auth OAuth (+2 more)

### Community 56 - "theme-style-provider.tsx"
Cohesion: 0.17
Nodes (12): scripts, build, check, db:generate, db:migrate, dev, lint, postinstall (+4 more)

### Community 57 - "format.ts"
Cohesion: 0.11
Nodes (23): DayNotes(), FlowSection(), HeroFigure(), PlanDayView(), PlanNotFound(), dynamic, PlanPage(), PersonalCalendar() (+15 more)

### Community 58 - "trash-view.tsx"
Cohesion: 0.20
Nodes (9): Confirmed requirements, Dated personal todos and AI-assisted planning, Existing foundation, Finalized navigation and lifecycle, Phase 1 — Design the dated planner and review flow, Phase 2 — Extend task storage and manual workflows, Phase 3 — Add AI proposal and confirmed-apply workflows, Phase 4 — Validate and document (+1 more)

### Community 59 - "chat-composer.tsx"
Cohesion: 0.29
Nodes (8): ChatComposer(), attach(), downscaleToDataUrl(), IMAGE_MAX_EDGE, IMAGE_QUALITY, isImageFile(), MAX_ATTACHED_IMAGES, prepareImages()

### Community 60 - "client-types.ts"
Cohesion: 0.25
Nodes (5): Dashboard Analytical Scopes (full/subject/sectional/all), Backup Format v2 and Account Transfer, Semantic Chart Palette and Chart Rules, Core Product Workflows, JSON Backup Format Version 2

### Community 61 - "route-handler.ts"
Cohesion: 0.09
Nodes (29): Baseline architecture, Call-site inventory (39 total), Rate limiting, GET, runtime, DELETE, dynamic, GET (+21 more)

### Community 62 - "cn"
Cohesion: 0.08
Nodes (35): radix-ui, react, AvatarImage, CollapsibleContent, DrawerFooter(), DrawerHeader(), FormControl, FormDescription (+27 more)

### Community 63 - "react"
Cohesion: 0.19
Nodes (20): DataPanel(), ActiveTargetCard(), DefaultRow(), describeSignature(), PercentileExplainer(), PercentileRow(), sourceLabel(), targetForSignature() (+12 more)

### Community 64 - "shot.mjs"
Cohesion: 0.40
Nodes (6): Known Limitations (duo-icons fill-rule, native inputs), Design System Source-of-Truth Map, Icon Inconsistency Finding (14 ad-hoc sizes), Icon Size Scale (14/16/18/22/28), Named Imports for Bundle Reduction, Raw Lucide Imports Migrated into Semantic Icon Map

### Community 68 - "Caching and Revalidation Policy"
Cohesion: 0.50
Nodes (5): WorkspaceShell Client Orchestrator and Its Three Hooks, dashboard.tsx Monolith Split Finding, UI Baseline Audit Findings (26 prioritized items), 15-Phase Execution Order, Unified Segmented Control (.segment-group)

### Community 69 - "Folder-Based Routing and Upstash Rate Limiting — Design"
Cohesion: 0.17
Nodes (11): Architecture, Colocation rule, Decisions, Folder-Based Routing and Upstash Rate Limiting — Design, Goals, Invariants that must not move, Non-goals, Problem (+3 more)

### Community 70 - "plan-day-view.tsx"
Cohesion: 0.18
Nodes (22): DayActions, DaySections(), AttemptEntryRow(), entryPlanRow(), PersonalEntryRow(), PlanEntryRow(), RevisionEntryRow(), SectionHead() (+14 more)

### Community 71 - "exams-panel.tsx"
Cohesion: 0.08
Nodes (47): dynamic, SettingsPage(), CustomExamDialog(), describeTier(), ExamRow(), ExamsPanel(), maxOf(), SourceSummary (+39 more)

### Community 72 - "sheet.tsx"
Cohesion: 0.17
Nodes (20): AiPlanSheet(), TrashDetailSheet(), AiChatSheet(), GoogleGlyph(), GoogleSignInButtonProps, Masthead(), onScroll(), read() (+12 more)

### Community 73 - "attempt-outcome-card.tsx"
Cohesion: 0.27
Nodes (8): AttemptOutcomeCard(), outcomes, percent(), ScoreRing(), subjectIcons, tierSuffix(), AnswerStack, tierLabelFor()

### Community 74 - "requireUser"
Cohesion: 0.10
Nodes (58): Task 7: RSC foundation, Tasks 8–19: Route migrations, @tanstack/react-query, GET, runtime, AddPage(), dynamic, AskPage() (+50 more)

### Community 75 - "explain-search.ts"
Cohesion: 0.22
Nodes (6): @prisma/adapter-pg@^7.10.1, @prisma/adapter-pg, env, match, prisma, queries

### Community 89 - "parseBackup"
Cohesion: 0.31
Nodes (8): assertSummary(), backfillLegacyQualifying(), BackupError, computedSummary(), formatIssues(), isRecord(), parseBackup(), parseImportRequest()

### Community 124 - "format.ts"
Cohesion: 0.05
Nodes (60): Migration roadmap (executed order), lucide-react, metadata, metadata, TaskEditorLoader(), ApplyOp, ConfirmState, RescheduleState (+52 more)

### Community 126 - "atoms.tsx"
Cohesion: 0.29
Nodes (8): CountUp(), FloatingInk(), InkArt(), Petals, PetalSpec, TypedLine(), Hero(), LedgerFacts()

### Community 127 - "lib/search.ts"
Cohesion: 0.10
Nodes (38): collectCursors(), GET, runtime, escapeLike(), getStudyPlan(), ATTEMPT_PHASES, attemptItem(), attemptPhaseWhere() (+30 more)

### Community 129 - "Panel"
Cohesion: 0.05
Nodes (77): motion, PersonalTasksPanel(), AttemptBreakdownPanel(), DistributionPanel(), PAD, FindingsPanel(), points(), sentence() (+69 more)

### Community 130 - "attempt-pagination.tsx"
Cohesion: 0.17
Nodes (25): KindFilter, messageOf(), rowKey(), toItemRef(), TrashView(), ungroupedCount(), AttemptPagination, windowedPages() (+17 more)

### Community 131 - "ssrf-core.ts"
Cohesion: 0.23
Nodes (12): RFC-1918, AiConnectionInput, assertSafeBaseUrl(), assertSafeBaseUrlShape(), BLOCKED_HOSTNAMES, inV4Range(), ipv4Octets(), isBlockedAddress() (+4 more)

### Community 139 - "Add Mock Route"
Cohesion: 0.10
Nodes (28): AttemptInput, buildAttempt(), FULL_ROWS, LANDING_ATTEMPTS, LANDING_FULL_MOCKS, LANDING_LATEST, LANDING_SCOPES, LANDING_SUMMARY (+20 more)

### Community 140 - "Button"
Cohesion: 0.09
Nodes (48): next, DayLedger(), EmptyActions(), LoadLine(), EventDialog(), PlanDoneState(), RevFlag(), DashboardPlanApi (+40 more)

### Community 141 - "command-palette.tsx"
Cohesion: 0.12
Nodes (33): @radix-ui/react-dialog, NAV_GROUPS, planHref(), CommandPalette(), CommandPaletteProps, loadRecentSearches(), PaletteBody(), persistRecentSearches() (+25 more)

### Community 142 - "next.config.ts"
Cohesion: 0.40
Nodes (4): cspDev, cspProduction, nextConfig, productionHeaders

### Community 143 - "compare-view.tsx"
Cohesion: 0.10
Nodes (43): buildComparison(), buildSectionRows(), ChangeCell(), CompareView, Comparison, ComparisonLedger(), ComparisonRow, ErrorState() (+35 more)

### Community 144 - "verify-backup-transfer.mjs"
Cohesion: 0.09
Nodes (24): api(), backup(), cookies, preview(), raw(), replace(), settings, api() (+16 more)

### Community 145 - "use-backup-import.ts"
Cohesion: 0.40
Nodes (4): BACKUP_MAX_BYTES, BackupPreview, ImportMode, ImportResult

### Community 146 - "filters-url.ts"
Cohesion: 0.10
Nodes (37): AddMockView(), AddRoute(), AddRouteInner(), CompareRoute(), CompareReference, HistoryRoute(), PerformanceRoute(), platformsOf() (+29 more)

### Community 149 - "ai-settings-form.tsx"
Cohesion: 0.13
Nodes (14): Catalog, credentialToValues(), EMPTY_CATALOG, EMPTY_FORM, Props, PROTOCOL_LABELS, THINKING_LABELS, THINKING_LEVELS (+6 more)

### Community 151 - "reminders-panel.tsx"
Cohesion: 0.09
Nodes (30): AboutPanel(), pageEnter, Reveal(), RevealItem(), saveBarSpring, staggerContainer, staggerItem, switchBounce (+22 more)

### Community 152 - "use-ai-workspace.tsx"
Cohesion: 0.07
Nodes (48): AiWorkspace, AiWorkspaceContext, INSIGHT_REQUEST_TEXT, insightToChatText(), newId(), trimChatHistory(), useAiWorkspaceState(), chatBaseForSend() (+40 more)

### Community 155 - "Paper Tokens and Design Handover"
Cohesion: 0.20
Nodes (9): args, evaluate(), pending, send(), target, url, wait, widths (+1 more)

### Community 156 - "workspace-chrome.tsx"
Cohesion: 0.07
Nodes (43): Client State Architecture Audit — 2026-10-31, Design decisions, Findings, Standing gaps (out of scope, recorded), CalendarRoute(), DashboardRoute(), NO_FILTERS, MyTasksRoute() (+35 more)

### Community 157 - "sections.tsx"
Cohesion: 0.12
Nodes (30): dynamic, LandingPage(), metadata, FloatingAsk(), RAIL_ITEMS, SectionRail(), onScroll(), read() (+22 more)

### Community 158 - "dashboard-view.tsx"
Cohesion: 0.21
Nodes (18): Loading, error and not-found surfaces, CalendarLoading(), PlanWithToday, DashboardView(), RecentAttemptsPanel(), DoneDot(), EmptyCell(), WeekCell() (+10 more)

### Community 159 - "view-model.ts"
Cohesion: 0.13
Nodes (26): BoardView(), handleDrop(), columnFor(), COLUMNS, nextStatus(), PersonalTaskDisplayStatus, ProgressRule(), STATUS_META (+18 more)

### Community 160 - "Review Focus"
Cohesion: 0.13
Nodes (14): Baseline and environment facts (measured in Task 0), Folder-Based Routing and Upstash Rate Limiting — Implementation Plan, Global Constraints, Review Focus, Rulings carried into this plan, Task 0: Toolchain and baseline, Task 1: Spec and plan documents, Task 20: Retire the shell (+6 more)

### Community 162 - "useToast"
Cohesion: 0.14
Nodes (18): dynamic, ForgotPasswordPage(), metadata, dynamic, metadata, SignInPage(), dynamic, metadata (+10 more)

### Community 163 - "ref_node_fs"
Cohesion: 0.11
Nodes (10): packageDir, REPLACEMENTS, targets, root, allSourceFiles(), APP, privateFiles(), ROOT (+2 more)

### Community 169 - "ai-prompt-security.test.ts"
Cohesion: 0.08
Nodes (40): AiContext, average(), buildAiContext(), fullMockProfile(), payload(), recentFullMock(), sectionProfile(), subjectProfile() (+32 more)

### Community 174 - "ai/todos.ts"
Cohesion: 0.23
Nodes (10): MAX_TODO_PROMPT_CHARS, parseTodoProposals(), Target, TODO_DATE_QUESTION, todoDraftRequestSchema, TodoProposal, todoProposalSchema, todoOperationSchema (+2 more)

### Community 177 - "conversation-list.tsx"
Cohesion: 0.39
Nodes (8): ConversationGroup, ConversationList, ConversationRow, groupConversations(), relativeLabel(), startOfDay(), startOfWeek(), ChatHistoryApi

## Ambiguous Edges - Review These
- `Stack Inventory (Next 16.4.3, React 19.2, TS 5.9, Tailwind 4, Recharts 3, motion 12)` → `Private Accounts Release Notes`  [AMBIGUOUS]
  docs/ui-overhaul/phase-1-audit.md · relation: conceptually_related_to

## Knowledge Gaps
- **36 isolated node(s):** `RFC-1918`, `Analytics Projections Cache Policy (/api/analytics)`, `force-dynamic Public Auth-Adjacent Pages`, `Health Endpoint Rate-Limit-Exempt (/api/health)`, `Firebase/Mongo Runtime Dependencies Removed` (+31 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1150 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **70 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `calendar-view.tsx`, `MyTasksView`, `Panel`, `attempt-pagination.tsx`, `history-screen.tsx`, `Add Mock Route`, `Button`, `command-palette.tsx`, `personal-task-drawer.tsx`, `compare-view.tsx`, `ai-composer.tsx`, `filters-url.ts`, `Mock Entry Form and Validation`, `calendar-entries.ts`, `ai-settings-form.tsx`, `reminders-panel.tsx`, `Request Proxy and Public Origins`, `sections.tsx`, `dashboard-view.tsx`, `task-toolbar.tsx`, `view-model.ts`, `chat-transcript.tsx`, `film-section.tsx`, `RouteSkeleton`, `mock-form.tsx`, `conversation-list.tsx`, `sign-in-form.tsx`, `format.ts`, `chat-composer.tsx`, `react`, `plan-day-view.tsx`, `exams-panel.tsx`, `sheet.tsx`, `format.ts`, `atoms.tsx`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **What connects `RFC-1918`, `Analytics Projections Cache Policy (/api/analytics)`, `force-dynamic Public Auth-Adjacent Pages` to the rest of the system?**
  _36 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `calendar-view.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09302325581395349 - nodes in this community are weakly interconnected._
- **Why does `react` connect `cn` to `calendar-view.tsx`, `Panel`, `attempt-pagination.tsx`, `subject-performance.test.ts`, `history-screen.tsx`, `Add Mock Route`, `Button`, `command-palette.tsx`, `personal-task-drawer.tsx`, `compare-view.tsx`, `ai-composer.tsx`, `use-backup-import.ts`, `filters-url.ts`, `Mock Entry Form and Validation`, `calendar-entries.ts`, `ai-settings-form.tsx`, `reminders-panel.tsx`, `private-workspace.tsx`, `use-ai-workspace.tsx`, `Request Proxy and Public Origins`, `workspace-chrome.tsx`, `email-client.ts`, `dashboard-view.tsx`, `task-toolbar.tsx`, `view-model.ts`, `sections.tsx`, `useToast`, `chat-transcript.tsx`, `film-section.tsx`, `app/layout.tsx`, `result-editor.tsx`, `RouteError`, `mock-form.tsx`, `conversation-list.tsx`, `exams-panel.tsx`, `sign-in-form.tsx`, `format.ts`, `chat-composer.tsx`, `react`, `plan-day-view.tsx`, `exams-panel.tsx`, `sheet.tsx`, `requireUser`, `format.ts`, `atoms.tsx`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Should `MyTasksView` be split into smaller, more focused modules?**
  _Cohesion score 0.13852813852813853 - nodes in this community are weakly interconnected._
- **Why does `next` connect `Button` to `calendar-view.tsx`, `plan/[date]/not-found.tsx`, `attempt-pagination.tsx`, `Panel`, `subject-performance.test.ts`, `command-palette.tsx`, `next.config.ts`, `personal-task-drawer.tsx`, `ai-composer.tsx`, `lib/trash.ts`, `filters-url.ts`, `private-workspace.tsx`, `Request Proxy and Public Origins`, `workspace-chrome.tsx`, `sections.tsx`, `dashboard-view.tsx`, `useToast`, `app/layout.tsx`, `RouteError`, `exams-panel.tsx`, `sign-in-form.tsx`, `format.ts`, `route-handler.ts`, `exams-panel.tsx`, `sheet.tsx`, `requireUser`, `format.ts`, `atoms.tsx`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Stack Inventory (Next 16.4.3, React 19.2, TS 5.9, Tailwind 4, Recharts 3, motion 12)` and `Private Accounts Release Notes`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._