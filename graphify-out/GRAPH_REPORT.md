# Graph Report - ssc-insight-2  (2026-11-19)

## Corpus Check
- 400 files · ~298,666 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 4, .css 2, .example 1)

## Summary
- 3139 nodes · 9537 edges · 175 communities (95 shown, 80 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 104 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0bd3bd3d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Panel
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
- audit.ts
- Mock Entry Form and Validation
- Paper Design System Handbook
- app/layout.tsx
- trash-view.tsx
- queries/exams.ts
- provider.ts
- score-forecast.ts
- ai/todos/route.ts
- Request Proxy and Public Origins
- Extraction Normalization and Evidence
- label.tsx
- Study Plan Progress APIs
- ai-prompt-security.test.ts
- plan-day-view.tsx
- personal-todos.tsx
- PlainIcon
- Score Observatory verification
- visuals.ts
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
- index.tsx
- extraction.ts
- my-tasks-view.tsx
- Dashboard and Outcome Visual References
- Continuous Integration Validation Workflow
- cn
- context.ts
- attempt-pagination.tsx
- sections.tsx
- theme-style-provider.tsx
- mock-entry.test.ts
- trash-view.tsx
- ai/todos.ts
- client-types.ts
- SSC Insight
- calendar-view.tsx
- extract/route.ts
- shot.mjs
- Caching and Revalidation Policy
- @tanstack/react-query
- ai/todos/route.ts
- view-model.ts
- errors.ts
- client-types.ts
- react
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
- my-tasks-view.tsx
- Mock Comparison Route
- Dashboard Workspace Route
- compare-view.tsx
- Personal Tasks Route
- credentials.ts
- icon.tsx
- models.ts
- error-boundary.tsx
- toast.tsx
- verify-backup-transfer.mjs
- google-sign-in-button.tsx
- Neon Ownership Migration and QA
- Neon Ownership Migration and QA
- ws
- Paper Tokens and Design Handover
- AiSettingsForm
- dashboard-view.tsx
- DuotoneIcon
- Outcome Cards and Dated AttemptRecordCard
- Pooled Vercel Runtime
- vercel.json
- attempt-sort.ts
- ProviderStreamDecoder
- totals
- ai-prompt-security.test.ts
- useKeyboardShortcuts
- prisma
- Baseline architecture
- overrides

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
- `Baseline architecture` --references--> `PrivateWorkspace()`  [INFERRED]
  docs/state-audit.md → src/components/private-workspace.tsx
- `Migration roadmap (executed order)` --references--> `useTodoList()`  [INFERRED]
  docs/state-audit.md → src/components/use-todos-data.tsx
- `Findings` --references--> `useWorkspaceData()`  [INFERRED]
  docs/state-audit.md → src/components/use-workspace-data.ts
- `B. Logging hygiene` --references--> `accessLog()`  [INFERRED]
  .zcode/plans/plan-sess_ab98d128-959d-46b2-9109-b533417f6547.md → src/lib/access-log.ts
- `A. Root-cause AI fixes` --references--> `describeAiCredential()`  [INFERRED]
  .zcode/plans/plan-sess_ab98d128-959d-46b2-9109-b533417f6547.md → src/lib/ai/credentials.ts

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

## Communities (175 total, 80 thin omitted)

### Community 0 - "Panel"
Cohesion: 0.11
Nodes (29): Panel(), FindingsPanel(), points(), sentence(), TONE_ICON, TONE_TEXT, PerformanceView(), PerformancePreview() (+21 more)

### Community 1 - "ai-composer.tsx"
Cohesion: 0.13
Nodes (25): nextStatus(), PersonalTaskDisplayStatus, STATUS_META, StatusDot(), statusOf(), DraftResponse, Proposal, BoardView() (+17 more)

### Community 2 - "personal-todos.tsx"
Cohesion: 0.09
Nodes (32): CalendarMetrics(), CalendarSurface(), DayActions, QuietDays(), addToCounts(), adjacentEntryDate(), AttemptEntry, attemptScorePct() (+24 more)

### Community 4 - "command-palette.tsx"
Cohesion: 0.06
Nodes (45): AI Status Endpoint Cache Policy (/api/ai/status), Analytics Projections Cache Policy (/api/analytics), api() Client Fetch cache: no-store (src/lib/api-client.ts), Backup Export Raw File Exception (GET /api/backup), Next.js 16 Cache Components Not Enabled, Caching and Revalidation Policy (Phase 8 reference), Filters/Scope URL State Mirror (src/lib/filters-url.ts), force-dynamic Public Auth-Adjacent Pages (+37 more)

### Community 7 - "subject-performance.test.ts"
Cohesion: 0.05
Nodes (56): dependencies, clsx@^2.1.1, cmdk@^1.1.1, @duo-icons/react@^1.0.1, @fontsource-variable/dm-sans@^5.3.0, @fontsource-variable/source-serif-4@^5.3.1, lucide-react@^0.468.0, motion@^12.0.0 (+48 more)

### Community 8 - "ai-settings-form.tsx"
Cohesion: 0.20
Nodes (9): Catalog, EMPTY_CATALOG, EMPTY_FORM, Form, Props, AiCredentialSummary, AiModelsResponse, AiSettingsResponse (+1 more)

### Community 10 - "calendar-view.tsx"
Cohesion: 0.18
Nodes (18): Faq(), FAQ_ITEMS, BrowserFrame(), MockupCaption(), PlanGrid(), PlanLegend(), Reveal(), NOTES (+10 more)

### Community 11 - "app-shell.tsx"
Cohesion: 0.10
Nodes (35): POST, GET, runtime, DELETE, PATCH, runtime, DELETE, GET (+27 more)

### Community 13 - "RequestError"
Cohesion: 0.05
Nodes (75): zod, maxDuration, POST, runtime, POST, GET, maxDuration, runtime (+67 more)

### Community 14 - "personal-task-drawer.tsx"
Cohesion: 0.18
Nodes (19): DayDrawer(), DayLedgerProps, blankTask(), PersonalTaskDrawer(), TaskEditorLoader(), TaskEditorForm(), buildDraft(), save() (+11 more)

### Community 15 - "Setup and Operations Handbook"
Cohesion: 0.05
Nodes (43): attemptLabel(), BACKUP_INSERT_CHUNK_SIZE, BACKUP_REQUEST_MAX_BYTES, BACKUP_SAMPLE_LIMIT, backupAttemptSchema, backupAttemptsWithBounds, BackupPersonalTask, BackupPlanDayProgress (+35 more)

### Community 16 - "ai-composer.tsx"
Cohesion: 0.11
Nodes (41): EmptyChart(), AttemptBreakdown(), BreakdownDonut(), DeepDive(), GroupedScoreBars(), InsightCallout(), paperMax(), PerformanceOverview (+33 more)

### Community 17 - "lib/trash.ts"
Cohesion: 0.08
Nodes (38): Context, devHandle(), handle(), privateNoStore, runtime, GET(), accessLog(), AccessLogEvent (+30 more)

### Community 18 - "audit.ts"
Cohesion: 0.14
Nodes (14): bearerToken(), GET, maxDuration, runtime, secretMatches(), dynamic, GET, HealthStatus (+6 more)

### Community 19 - "Mock Entry Form and Validation"
Cohesion: 0.16
Nodes (17): AppearancePanel(), PaletteChip(), StyleGlyph(), Swap(), microMotion(), PALETTE_IDS, PALETTE_STORAGE_KEY, PaletteId (+9 more)

### Community 20 - "Paper Design System Handbook"
Cohesion: 0.04
Nodes (111): GET, runtime, POST, assignTierIds(), customExamInputSchema, customSubjectSchema, customTierSchema, DELETE (+103 more)

### Community 21 - "app/layout.tsx"
Cohesion: 0.19
Nodes (10): next-themes@^0.4.6, next-themes, metadata, RootLayout(), ThemeProvider(), initialPalette(), initialStyle(), persist() (+2 more)

### Community 22 - "trash-view.tsx"
Cohesion: 0.14
Nodes (13): args, evaluate(), height, pending, problems, report, send(), settle (+5 more)

### Community 23 - "queries/exams.ts"
Cohesion: 0.09
Nodes (29): ExamScope, ExamScopeContext, ExamScopeProvider(), tierLabelFallback(), RemindersPanel(), PanelDraft, SettingsGuard, SettingsGuardContext (+21 more)

### Community 24 - "provider.ts"
Cohesion: 0.14
Nodes (34): aiAborted(), aiInvalidOutput(), aiOutputIncomplete(), aiProviderError(), aiRefused(), aiTimeout(), AiProvider, AiStructuredFormat (+26 more)

### Community 25 - "score-forecast.ts"
Cohesion: 0.12
Nodes (25): Accuracy Footer Divisor Column (83.3% Accuracy), Marks Obtained (70/90) and Score Strip, Outcome Card Illustration (Reasoning), Outcome Counts with Proportion Bars (Correct / Incorrect / Unattempted), Percentile Availability Note ('No standalone subject percentile recorded'), Score-Centered Answer Distribution Ring (77.8% SCORE), Serif Subject Heading with Attempt/Question Subtitle, Soft-Rounded Warm Paper Card Surface (+17 more)

### Community 26 - "ai/todos/route.ts"
Cohesion: 0.07
Nodes (63): bodySchema, maxDuration, POST(), runtime, COACH_FORMAT, maxDuration, POST(), runtime (+55 more)

### Community 27 - "Request Proxy and Public Origins"
Cohesion: 0.09
Nodes (50): ActiveExamFooterNote(), AppFrame(), AppHeader(), AppHeaderProps, AppSidebar(), HeaderLocation(), NavItem(), VIEW_META (+42 more)

### Community 28 - "Extraction Normalization and Evidence"
Cohesion: 0.09
Nodes (23): devDependencies, eslint@^9.0.0, eslint-config-next@^16.0.0, prettier@^3.9.10, tailwindcss@^4.0.0, @tailwindcss/postcss@^4.0.0, tsx@^4.20.0, @types/node@^22.0.0 (+15 more)

### Community 29 - "label.tsx"
Cohesion: 0.33
Nodes (6): class-variance-authority@^0.7.1, @radix-ui/react-label@^2.1.17, class-variance-authority, @radix-ui/react-label, Label, labelVariants

### Community 30 - "Study Plan Progress APIs"
Cohesion: 0.10
Nodes (34): AttemptInput, buildAttempt(), FULL_ROWS, LANDING_ATTEMPTS, LANDING_LATEST, LANDING_SCOPES, LANDING_TARGET, OTHER_ROWS (+26 more)

### Community 31 - "ai-prompt-security.test.ts"
Cohesion: 0.20
Nodes (23): AuthControl(), AuthControlProps, AuthError(), useAuthActions(), signIn(), ExamSwitcher(), signIn(), BulkBar() (+15 more)

### Community 32 - "plan-day-view.tsx"
Cohesion: 0.08
Nodes (24): LANDING_PLAN, plan, buildLandingPlan(), category(), isMock(), LandingPlanData, LandingPlanDay, LandingPlanTask (+16 more)

### Community 33 - "personal-todos.tsx"
Cohesion: 0.08
Nodes (42): Migration roadmap (executed order), AiChatSheet(), Masthead(), onScroll(), read(), NAV, categoryMeta(), Group (+34 more)

### Community 34 - "PlainIcon"
Cohesion: 0.13
Nodes (37): PlainIcon(), AgendaGroups(), AgendaView(), EarlierRanges(), DayLedger(), EmptyActions(), LoadLine(), DashboardPlanApi (+29 more)

### Community 35 - "Score Observatory verification"
Cohesion: 0.07
Nodes (54): GET, idSchema, kindSchema, runtime, POST, runtime, POST, runtime (+46 more)

### Community 36 - "visuals.ts"
Cohesion: 0.12
Nodes (22): CalendarToolbar(), categoryLabel(), LayerToggles(), CellRow(), PeriodNav(), UNIT, AGENDA_WINDOW, CALENDAR_MODES (+14 more)

### Community 37 - "ai-chat-sheet.tsx"
Cohesion: 0.12
Nodes (26): AiSheetTaskApi, CoachChatTab(), CoachMemo(), CoachMemos(), inlineNodes(), LogMockTab(), MEMO_LABELS, MemoBlock (+18 more)

### Community 38 - "compare-view.tsx"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 39 - "ref_node_fs"
Cohesion: 0.20
Nodes (4): packageDir, REPLACEMENTS, targets, root

### Community 40 - "Button"
Cohesion: 0.17
Nodes (9): args, logs, outDir, pending, routes, target, waitMs, widths (+1 more)

### Community 41 - "trash-view.tsx"
Cohesion: 0.08
Nodes (51): AboutPanel(), CustomExamDialog(), describeTier(), ExamRow(), ExamsPanel(), maxOf(), SourceSummary, StageSummary (+43 more)

### Community 43 - "format.ts"
Cohesion: 0.14
Nodes (18): NumberField, ResultEditor(), fill(), weekdayDateLabel(), istClock, istDateKey(), istDayKey, longDay (+10 more)

### Community 44 - "api"
Cohesion: 0.12
Nodes (15): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+7 more)

### Community 45 - "requireUser"
Cohesion: 0.12
Nodes (15): jobs, validate, name, permissions, contents, run, uses, with (+7 more)

### Community 46 - "connection-input.ts"
Cohesion: 0.10
Nodes (34): DEFAULT_AI_BASE_URL, Env, integerEnv(), normaliseBaseUrl(), readAiConfig(), AiConnectionInput, AiCredentialInput, connectionFields (+26 more)

### Community 47 - "index.tsx"
Cohesion: 0.22
Nodes (12): dynamic, LandingPage(), metadata, Landing(), ERROR_COPY, LandingError(), LedgerFacts(), Plate() (+4 more)

### Community 48 - "extraction.ts"
Cohesion: 0.11
Nodes (24): deriveCounts(), deriveQuestions(), exactInteger(), ExtractionIssue, extractionModelSchema, extractionSubjectIds, inferType(), issue() (+16 more)

### Community 49 - "my-tasks-view.tsx"
Cohesion: 0.11
Nodes (39): DELETE, GET, idSchema, runtime, GET, POST, runtime, GET (+31 more)

### Community 50 - "Dashboard and Outcome Visual References"
Cohesion: 0.08
Nodes (49): AddMockView(), LogMockPayload, AiCoachCard(), CompareReference, DashboardClock(), DateRangeFilter(), useExamScope(), ScopeFilters() (+41 more)

### Community 51 - "Continuous Integration Validation Workflow"
Cohesion: 0.20
Nodes (8): Multi-Theme System (data-palette x data-style), Palettes x Styles Theme Matrix, Typography Scale (Source Serif 4 + DM Sans), Missing Radius System Finding, Elevation Model and --shadow-pop Token, Restrained Motion Language, Tokenized Radius Scale (panel/control/card/pill), Sticky Identity Column for Mock History

### Community 52 - "cn"
Cohesion: 0.18
Nodes (9): args, evaluate(), height, pending, report, send(), target, width (+1 more)

### Community 53 - "context.ts"
Cohesion: 0.17
Nodes (13): AiContext, average(), buildAiContext(), fullMockProfile(), payload(), recentFullMock(), sectionProfile(), subjectProfile() (+5 more)

### Community 54 - "attempt-pagination.tsx"
Cohesion: 0.26
Nodes (14): AttemptPagination, windowedPages(), Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem(), PaginationNext(), PaginationPage() (+6 more)

### Community 55 - "sections.tsx"
Cohesion: 0.20
Nodes (10): Request and Ownership Architecture, Neon Agent Tooling Setup (Codex plugin + MCP), Expiring QA Branch Migration Rehearsal, Selected Neon Environment (org/project/branch), Private-Accounts Migration (claim two shared mocks), Session-Derived Ownership Model, Isolation and Ownership Verification, Google Sign-In via Neon Auth OAuth (+2 more)

### Community 56 - "theme-style-provider.tsx"
Cohesion: 0.17
Nodes (12): scripts, build, check, db:generate, db:migrate, dev, lint, postinstall (+4 more)

### Community 57 - "mock-entry.test.ts"
Cohesion: 0.13
Nodes (31): DurationInput(), change(), formatParts(), blankSubject(), defaultTierId(), fullMockSectionHeading(), meritSubjectIds(), MockForm() (+23 more)

### Community 58 - "trash-view.tsx"
Cohesion: 0.20
Nodes (9): Confirmed requirements, Dated personal todos and AI-assisted planning, Existing foundation, Finalized navigation and lifecycle, Phase 1 — Design the dated planner and review flow, Phase 2 — Extend task storage and manual workflows, Phase 3 — Add AI proposal and confirmed-apply workflows, Phase 4 — Validate and document (+1 more)

### Community 59 - "ai/todos.ts"
Cohesion: 0.23
Nodes (10): MAX_TODO_PROMPT_CHARS, parseTodoProposals(), Target, TODO_DATE_QUESTION, todoDraftRequestSchema, TodoProposal, todoProposalSchema, todoOperationSchema (+2 more)

### Community 60 - "client-types.ts"
Cohesion: 0.25
Nodes (5): Dashboard Analytical Scopes (full/subject/sectional/all), Backup Format v2 and Account Transfer, Semantic Chart Palette and Chart Rules, Core Product Workflows, JSON Backup Format Version 2

### Community 61 - "SSC Insight"
Cohesion: 0.20
Nodes (13): dynamic, WorkspaceLayout(), GuardLedgerRow(), GuardNotice(), GuardNoticeProps, GuardRow, GuardStyles(), GuardTone (+5 more)

### Community 62 - "calendar-view.tsx"
Cohesion: 0.17
Nodes (21): CalendarLegend(), stepSize(), CalendarView(), currentPath(), MemoMonthGrid, MemoWeekView, monthMeta(), periodTitle() (+13 more)

### Community 63 - "extract/route.ts"
Cohesion: 0.20
Nodes (19): DataPanel(), ActiveTargetCard(), DefaultRow(), describeSignature(), PercentileExplainer(), PercentileRow(), sourceLabel(), targetForSignature() (+11 more)

### Community 64 - "shot.mjs"
Cohesion: 0.40
Nodes (6): Known Limitations (duo-icons fill-rule, native inputs), Design System Source-of-Truth Map, Icon Inconsistency Finding (14 ad-hoc sizes), Icon Size Scale (14/16/18/22/28), Named Imports for Bundle Reduction, Raw Lucide Imports Migrated into Semantic Icon Map

### Community 68 - "Caching and Revalidation Policy"
Cohesion: 0.50
Nodes (5): WorkspaceShell Client Orchestrator and Its Three Hooks, dashboard.tsx Monolith Split Finding, UI Baseline Audit Findings (26 prioritized items), 15-Phase Execution Order, Unified Segmented Control (.segment-group)

### Community 69 - "@tanstack/react-query"
Cohesion: 0.29
Nodes (9): @tanstack/react-query-devtools@^5.105.0, @tanstack/react-query, @tanstack/react-query-devtools, QueryProvider(), getQueryClient(), makeQueryClient(), NO_RETRY_STATUSES, retryDelay() (+1 more)

### Community 70 - "ai/todos/route.ts"
Cohesion: 0.18
Nodes (24): DaySections(), AttemptEntryRow(), entryPlanRow(), PersonalEntryRow(), PlanEntryRow(), RevisionEntryRow(), SectionHead(), StatusDot() (+16 more)

### Community 71 - "view-model.ts"
Cohesion: 0.11
Nodes (27): PageHeader(), MonthCell(), MonthGrid, WEEKDAYS, PersonalCalendar(), personalMonthRange(), PlanErrorCard(), PlanWeekView() (+19 more)

### Community 72 - "errors.ts"
Cohesion: 0.25
Nodes (12): AiBillability, aiBusy(), aiEndpointError(), AiError, AiErrorCode, aiModelError(), aiPersonalConfigInvalid(), aiProviderAuth() (+4 more)

### Community 73 - "client-types.ts"
Cohesion: 0.09
Nodes (29): INSIGHT_REQUEST_TEXT, insightToChatText(), newId(), trimChatHistory(), useAiWorkspace(), chatBaseForSend(), AiConfigSource, AiResponseUsage (+21 more)

### Community 74 - "react"
Cohesion: 0.09
Nodes (15): lucide-react, radix-ui, react, metadata, metadata, GroupsManagerDialog(), buttonVariants, CollapsibleContent (+7 more)

### Community 89 - "api"
Cohesion: 0.09
Nodes (36): Client State Architecture Audit — 2026-10-31, Design decisions, Findings, Standing gaps (out of scope, recorded), useToast(), EMPTY_TASKS, patchDayInPlan(), patchTaskInPlan() (+28 more)

### Community 139 - "Add Mock Route"
Cohesion: 0.14
Nodes (25): CompareScreen(), delta(), duration(), accuracyTone(), ChipTone, MockStat(), formatDuration(), HistoryScreen() (+17 more)

### Community 140 - "my-tasks-view.tsx"
Cohesion: 0.06
Nodes (41): ApplyOp, ConfirmState, MyTasksView(), bulkRescheduleApply(), bulkStatus(), bulkTrashSelected(), clearSelection(), createTask() (+33 more)

### Community 141 - "Mock Comparison Route"
Cohesion: 0.05
Nodes (76): collectCursors(), GET, runtime, NAV_GROUPS, planHref(), CommandPalette(), CommandPaletteProps, loadRecentSearches() (+68 more)

### Community 142 - "Dashboard Workspace Route"
Cohesion: 0.05
Nodes (44): filterAttempts(), targetMarks(), Attempt, attemptListSchema, duplicateKey(), MAIN_SUBJECT_IDS, Marking, optionalNumber (+36 more)

### Community 143 - "compare-view.tsx"
Cohesion: 0.16
Nodes (31): accuracyTone(), AttemptTotals, comparablePercentage(), Delta(), scoreBarTone(), totalsFor(), typeChip(), AttemptRecordCard() (+23 more)

### Community 144 - "Personal Tasks Route"
Cohesion: 0.13
Nodes (13): BACKUP_FORMAT, BACKUP_FORMAT_VERSION, BACKUP_MAX_ATTEMPTS, backup, english, full, ga, PLANNER (+5 more)

### Community 145 - "credentials.ts"
Cohesion: 0.12
Nodes (31): RFC-1918, DELETE, GET, PUT, runtime, sameCredentialTarget(), AiCredentialInput, AiCredentialSummary (+23 more)

### Community 146 - "icon.tsx"
Cohesion: 0.15
Nodes (13): AttemptOutcomeCard(), outcomes, percent(), ScoreRing(), subjectIcons, tierSuffix(), DuoIcon, DuotoneTile() (+5 more)

### Community 147 - "models.ts"
Cohesion: 0.40
Nodes (7): AiModel, fetchModelCatalog(), ModelCatalogTarget, ModelDiscoveryError, parseModelCatalog(), joinProviderUrl(), normaliseProviderPath()

### Community 148 - "error-boundary.tsx"
Cohesion: 0.25
Nodes (4): ErrorBoundary, ErrorFallback(), Props, State

### Community 149 - "toast.tsx"
Cohesion: 0.28
Nodes (8): Toast, ToastApi, ToastCard(), ToastContext, ToastProvider(), ToastTone, ToastViewport(), TONE_STYLES

### Community 150 - "verify-backup-transfer.mjs"
Cohesion: 0.09
Nodes (24): api(), backup(), cookies, preview(), raw(), replace(), settings, api() (+16 more)

### Community 151 - "google-sign-in-button.tsx"
Cohesion: 0.31
Nodes (5): GoogleGlyph(), GoogleSignInButton(), GoogleSignInButtonProps, HeroArt(), Hero()

### Community 152 - "Neon Ownership Migration and QA"
Cohesion: 0.31
Nodes (8): assertSummary(), backfillLegacyQualifying(), BackupError, computedSummary(), formatIssues(), isRecord(), parseBackup(), parseImportRequest()

### Community 153 - "Neon Ownership Migration and QA"
Cohesion: 0.22
Nodes (6): @prisma/adapter-pg@^7.10.1, @prisma/adapter-pg, env, match, prisma, queries

### Community 154 - "ws"
Cohesion: 0.25
Nodes (6): ws@^8.22.0, ws, logs, pending, target, ws

### Community 155 - "Paper Tokens and Design Handover"
Cohesion: 0.20
Nodes (9): args, evaluate(), pending, send(), target, url, wait, widths (+1 more)

### Community 156 - "AiSettingsForm"
Cohesion: 0.39
Nodes (8): AiSettingsForm(), change(), chooseProvider(), fetchModels(), payload(), remove(), save(), test()

### Community 157 - "dashboard-view.tsx"
Cohesion: 0.20
Nodes (19): next, DashboardOverview(), DashboardView(), RecentAttemptsPanel(), MetricCell(), MetricStripSkeleton(), CalendarLoading(), PlanWithToday (+11 more)

### Community 158 - "DuotoneIcon"
Cohesion: 0.39
Nodes (6): DuoGlyph(), DuotoneIcon(), resolveIcon(), AiPanel(), MockChip(), DayWorkspaceScreen()

### Community 159 - "Outcome Cards and Dated AttemptRecordCard"
Cohesion: 0.40
Nodes (4): BACKUP_MAX_BYTES, BackupPreview, ImportMode, ImportResult

### Community 160 - "Pooled Vercel Runtime"
Cohesion: 0.40
Nodes (4): cspDev, cspProduction, nextConfig, productionHeaders

### Community 166 - "attempt-sort.ts"
Cohesion: 0.33
Nodes (6): ASC_SORTERS, AttemptSortRow, buildAttemptStats(), monthSplit(), AttemptStats, SortKey

### Community 168 - "totals"
Cohesion: 0.27
Nodes (12): LANDING_FULL_MOCKS, LANDING_SUMMARY, DashboardScreen(), CHART, CHIP_TONES, MockLedger(), MockMetricStrip(), MockRadar() (+4 more)

### Community 169 - "ai-prompt-security.test.ts"
Cohesion: 0.10
Nodes (32): chatMessages(), coachMessages(), contextBlock(), extractionMessages(), FALLBACK_SHAPE, marksFor(), paperLabel(), sanitizeContextPayload() (+24 more)

### Community 170 - "useKeyboardShortcuts"
Cohesion: 0.50
Nodes (4): Handlers, useKeyboardShortcuts(), isTypingTarget(), onKey()

### Community 173 - "Baseline architecture"
Cohesion: 0.67
Nodes (3): Baseline architecture, Call-site inventory (39 total), AiUsage

### Community 174 - "overrides"
Cohesion: 0.67
Nodes (3): zod, overrides, @neondatabase/auth

## Ambiguous Edges - Review These
- `Stack Inventory (Next 16.4.3, React 19.2, TS 5.9, Tailwind 4, Recharts 3, motion 12)` → `Private Accounts Release Notes`  [AMBIGUOUS]
  docs/ui-overhaul/phase-1-audit.md · relation: conceptually_related_to

## Knowledge Gaps
- **36 isolated node(s):** `RFC-1918`, `Analytics Projections Cache Policy (/api/analytics)`, `force-dynamic Public Auth-Adjacent Pages`, `Health Endpoint Rate-Limit-Exempt (/api/health)`, `Firebase/Mongo Runtime Dependencies Removed` (+31 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1014 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **80 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Request Proxy and Public Origins` to `Panel`, `ai-composer.tsx`, `personal-todos.tsx`, `ai-settings-form.tsx`, `calendar-view.tsx`, `Add Mock Route`, `my-tasks-view.tsx`, `Mock Comparison Route`, `personal-task-drawer.tsx`, `compare-view.tsx`, `ai-composer.tsx`, `icon.tsx`, `queries/exams.ts`, `AiSettingsForm`, `dashboard-view.tsx`, `DuotoneIcon`, `ai-prompt-security.test.ts`, `label.tsx`, `personal-todos.tsx`, `PlainIcon`, `visuals.ts`, `ai-chat-sheet.tsx`, `totals`, `trash-view.tsx`, `index.tsx`, `Dashboard and Outcome Visual References`, `attempt-pagination.tsx`, `calendar-view.tsx`, `extract/route.ts`, `ai/todos/route.ts`, `view-model.ts`, `react`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **What connects `RFC-1918`, `Analytics Projections Cache Policy (/api/analytics)`, `force-dynamic Public Auth-Adjacent Pages` to the rest of the system?**
  _36 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Panel` be split into smaller, more focused modules?**
  _Cohesion score 0.10588235294117647 - nodes in this community are weakly interconnected._
- **Why does `next` connect `dashboard-view.tsx` to `Pooled Vercel Runtime`, `Panel`, `PlainIcon`, `subject-performance.test.ts`, `view-model.ts`, `react`, `Mock Comparison Route`, `RequestError`, `index.tsx`, `ai-composer.tsx`, `lib/trash.ts`, `Dashboard and Outcome Visual References`, `error-boundary.tsx`, `app/layout.tsx`, `Request Proxy and Public Origins`, `SSC Insight`, `calendar-view.tsx`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Should `ai-composer.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12873563218390804 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `Panel`, `ai-composer.tsx`, `personal-todos.tsx`, `subject-performance.test.ts`, `ai-settings-form.tsx`, `calendar-view.tsx`, `Add Mock Route`, `my-tasks-view.tsx`, `Mock Comparison Route`, `personal-task-drawer.tsx`, `compare-view.tsx`, `ai-composer.tsx`, `icon.tsx`, `Mock Entry Form and Validation`, `error-boundary.tsx`, `app/layout.tsx`, `toast.tsx`, `queries/exams.ts`, `google-sign-in-button.tsx`, `Request Proxy and Public Origins`, `dashboard-view.tsx`, `label.tsx`, `ai-prompt-security.test.ts`, `Outcome Cards and Dated AttemptRecordCard`, `personal-todos.tsx`, `PlainIcon`, `visuals.ts`, `ai-chat-sheet.tsx`, `totals`, `trash-view.tsx`, `useKeyboardShortcuts`, `format.ts`, `index.tsx`, `Dashboard and Outcome Visual References`, `attempt-pagination.tsx`, `mock-entry.test.ts`, `SSC Insight`, `calendar-view.tsx`, `extract/route.ts`, `@tanstack/react-query`, `ai/todos/route.ts`, `view-model.ts`, `client-types.ts`, `api`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Stack Inventory (Next 16.4.3, React 19.2, TS 5.9, Tailwind 4, Recharts 3, motion 12)` and `Private Accounts Release Notes`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._