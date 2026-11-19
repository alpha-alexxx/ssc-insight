# Graph Report - ssc-insight-2  (2026-11-20)

## Corpus Check
- 399 files · ~298,562 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 4, .css 2, .example 1)

## Summary
- 3133 nodes · 9532 edges · 176 communities (97 shown, 79 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 99 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `21b9954a`
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
- toast.tsx
- trash-view.tsx
- queries/exams.ts
- provider.ts
- score-forecast.ts
- extract/route.ts
- Request Proxy and Public Origins
- progress.ts
- api/settings/route.ts
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
- plan-facts.ts
- extraction.ts
- my-tasks-view.tsx
- Dashboard and Outcome Visual References
- Continuous Integration Validation Workflow
- cn
- fixtures.ts
- trash-view.tsx
- sections.tsx
- theme-style-provider.tsx
- mock-entry.test.ts
- trash-view.tsx
- ai/todos.ts
- client-types.ts
- private-workspace.tsx
- calendar-view.tsx
- extract/route.ts
- shot.mjs
- Caching and Revalidation Policy
- ai.test.ts
- ai/todos/route.ts
- view-model.ts
- sheet.tsx
- client-types.ts
- status/route.ts
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
- Panel
- models.ts
- ssrf-core.ts
- usage.ts
- verify-backup-transfer.mjs
- google-sign-in-button.tsx
- Neon Ownership Migration and QA
- Neon Ownership Migration and QA
- ws
- Paper Tokens and Design Handover
- resolve.ts
- agenda-view.tsx
- board-view.tsx
- Outcome Cards and Dated AttemptRecordCard
- Pooled Vercel Runtime
- vercel.json
- task-suggestion.ts
- ProviderStreamDecoder
- useAiWorkspace
- ai-prompt-security.test.ts
- showcase.tsx
- verify-ownership.mjs
- verify-trash.mjs
- verify-neon.mjs
- ui-store.ts

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

## Communities (176 total, 79 thin omitted)

### Community 0 - "Panel"
Cohesion: 0.10
Nodes (27): PerformancePreview(), ScoreBand(), Sparkline(), Analytics, AnswerStack, PerformancePoint, Distribution, DISTRIBUTION_MIN_POINTS (+19 more)

### Community 1 - "ai-composer.tsx"
Cohesion: 0.10
Nodes (20): lucide-react@^0.468.0, lucide-react, metadata, metadata, DraftResponse, Proposal, GroupsManagerDialog(), PRIORITIES (+12 more)

### Community 2 - "personal-todos.tsx"
Cohesion: 0.11
Nodes (21): addToCounts(), AttemptEntry, attemptScorePct(), buildCalendarIndex(), compareEntries(), countAll(), EMPTY_COUNTS, emptyCounts() (+13 more)

### Community 4 - "command-palette.tsx"
Cohesion: 0.06
Nodes (45): AI Status Endpoint Cache Policy (/api/ai/status), Analytics Projections Cache Policy (/api/analytics), api() Client Fetch cache: no-store (src/lib/api-client.ts), Backup Export Raw File Exception (GET /api/backup), Next.js 16 Cache Components Not Enabled, Caching and Revalidation Policy (Phase 8 reference), Filters/Scope URL State Mirror (src/lib/filters-url.ts), force-dynamic Public Auth-Adjacent Pages (+37 more)

### Community 7 - "subject-performance.test.ts"
Cohesion: 0.03
Nodes (81): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, cmdk@^1.1.1, @duo-icons/react@^1.0.1, @fontsource-variable/dm-sans@^5.3.0, @fontsource-variable/source-serif-4@^5.3.1, @neon/config@^1.9.3 (+73 more)

### Community 8 - "ai-settings-form.tsx"
Cohesion: 0.12
Nodes (22): AiSettingsForm(), change(), chooseProvider(), fetchModels(), payload(), remove(), save(), test() (+14 more)

### Community 10 - "calendar-view.tsx"
Cohesion: 0.14
Nodes (28): dynamic, LandingPage(), metadata, DuotoneIcon(), DuotoneTile(), Faq(), FAQ_ITEMS, Landing() (+20 more)

### Community 11 - "app-shell.tsx"
Cohesion: 0.11
Nodes (34): POST, GET, runtime, DELETE, PATCH, runtime, DELETE, GET (+26 more)

### Community 13 - "RequestError"
Cohesion: 0.07
Nodes (48): zod, maxDuration, POST, runtime, maxDuration, POST, runtime, GET (+40 more)

### Community 14 - "personal-task-drawer.tsx"
Cohesion: 0.19
Nodes (18): DayDrawer(), DayLedgerProps, blankTask(), PersonalTaskDrawer(), TaskEditorLoader(), TaskEditorForm(), buildDraft(), save() (+10 more)

### Community 15 - "Setup and Operations Handbook"
Cohesion: 0.04
Nodes (44): attemptLabel(), BACKUP_INSERT_CHUNK_SIZE, BACKUP_REQUEST_MAX_BYTES, BACKUP_SAMPLE_LIMIT, backupAttemptSchema, backupAttemptsWithBounds, BackupPersonalTask, BackupPlanDayProgress (+36 more)

### Community 16 - "ai-composer.tsx"
Cohesion: 0.11
Nodes (42): recharts@^3.0.0, recharts, EmptyChart(), AttemptBreakdown(), BreakdownDonut(), DeepDive(), GroupedScoreBars(), InsightCallout() (+34 more)

### Community 17 - "lib/trash.ts"
Cohesion: 0.14
Nodes (24): GET(), accessLog(), AccessLogEvent, bypassesMaintenance(), classifyPath(), EnvLike, isCronPath(), maintenanceActive() (+16 more)

### Community 18 - "audit.ts"
Cohesion: 0.13
Nodes (14): bearerToken(), GET, maxDuration, runtime, secretMatches(), dynamic, GET, HealthStatus (+6 more)

### Community 19 - "Mock Entry Form and Validation"
Cohesion: 0.12
Nodes (24): AppearancePanel(), PaletteChip(), StyleGlyph(), Swap(), initialPalette(), initialStyle(), microMotion(), PALETTE_IDS (+16 more)

### Community 20 - "Paper Design System Handbook"
Cohesion: 0.05
Nodes (79): GET, runtime, TargetReference, dashboardScopeSchema, PatternSection, SubjectId, ALL_TIERS_ID, CATALOG_VERSION (+71 more)

### Community 21 - "toast.tsx"
Cohesion: 0.10
Nodes (18): next-themes@^0.4.6, next-themes, metadata, RootLayout(), ErrorBoundary, ErrorFallback(), Props, State (+10 more)

### Community 22 - "trash-view.tsx"
Cohesion: 0.14
Nodes (13): args, evaluate(), height, pending, problems, report, send(), settle (+5 more)

### Community 23 - "queries/exams.ts"
Cohesion: 0.13
Nodes (22): ExamScope, ExamScopeContext, ExamScopeProvider(), tierLabelFallback(), RemindersPanel(), Switch, SwitchRow(), activeExamPattern() (+14 more)

### Community 24 - "provider.ts"
Cohesion: 0.11
Nodes (46): aiAborted(), AiBillability, aiBusy(), aiEndpointError(), AiError, AiErrorCode, aiInvalidOutput(), aiModelError() (+38 more)

### Community 25 - "score-forecast.ts"
Cohesion: 0.12
Nodes (25): Accuracy Footer Divisor Column (83.3% Accuracy), Marks Obtained (70/90) and Score Strip, Outcome Card Illustration (Reasoning), Outcome Counts with Proportion Bars (Correct / Incorrect / Unattempted), Percentile Availability Note ('No standalone subject percentile recorded'), Score-Centered Answer Distribution Ring (77.8% SCORE), Serif Subject Heading with Attempt/Question Subtitle, Soft-Rounded Warm Paper Card Surface (+17 more)

### Community 26 - "extract/route.ts"
Cohesion: 0.19
Nodes (26): bodySchema, maxDuration, POST(), runtime, POST(), bodySchema, maxDuration, POST() (+18 more)

### Community 27 - "Request Proxy and Public Origins"
Cohesion: 0.08
Nodes (51): ActiveExamFooterNote(), AppFrame(), AppHeader(), AppHeaderProps, AppSidebar(), HeaderLocation(), NavItem(), VIEW_META (+43 more)

### Community 28 - "progress.ts"
Cohesion: 0.09
Nodes (34): mutationSchema, POST, runtime, GET, runtime, DELETE, idSchema, PUT (+26 more)

### Community 29 - "api/settings/route.ts"
Cohesion: 0.12
Nodes (33): assignTierIds(), customExamInputSchema, customSubjectSchema, customTierSchema, DELETE, GET, POST, PUT (+25 more)

### Community 30 - "Study Plan Progress APIs"
Cohesion: 0.14
Nodes (29): totalsFor(), average(), buildAiContext(), fullMockProfile(), payload(), recentFullMock(), sectionProfile(), subjectProfile() (+21 more)

### Community 31 - "ai-prompt-security.test.ts"
Cohesion: 0.19
Nodes (24): AuthControl(), AuthControlProps, AuthError(), useAuthActions(), signIn(), ExamSwitcher(), signIn(), BulkBar() (+16 more)

### Community 32 - "plan-day-view.tsx"
Cohesion: 0.11
Nodes (13): parsed, parsePlanTaskKey(), planChecklistItemSchema, PlanDay, planDaySchema, planRevisionSchema, PlanTask, planTaskSchema (+5 more)

### Community 33 - "personal-todos.tsx"
Cohesion: 0.11
Nodes (22): categoryMeta(), Group, GroupRow(), KanbanBoard(), PageLayout, PersonalTodos(), clearSelection(), mutate() (+14 more)

### Community 34 - "PlainIcon"
Cohesion: 0.08
Nodes (61): next, AttemptOutcomeCard(), AttemptRecordCard(), outcomes, percent(), ScoreRing(), subjectIcons, tierSuffix() (+53 more)

### Community 35 - "Score Observatory verification"
Cohesion: 0.08
Nodes (49): GET, idSchema, kindSchema, runtime, POST, runtime, POST, runtime (+41 more)

### Community 36 - "visuals.ts"
Cohesion: 0.16
Nodes (12): CalendarToolbar(), LayerToggles(), PeriodNav(), UNIT, AGENDA_WINDOW, CALENDAR_MODES, CalendarMode, planRowClass() (+4 more)

### Community 37 - "ai-chat-sheet.tsx"
Cohesion: 0.14
Nodes (20): AiSheetTaskApi, CoachChatTab(), CoachMemo(), CoachMemos(), inlineNodes(), MEMO_LABELS, MemoBlock, MessageContent() (+12 more)

### Community 38 - "compare-view.tsx"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 39 - "ref_node_fs"
Cohesion: 0.25
Nodes (4): packageDir, REPLACEMENTS, targets, root

### Community 40 - "Button"
Cohesion: 0.17
Nodes (9): args, logs, outDir, pending, routes, target, waitMs, widths (+1 more)

### Community 41 - "trash-view.tsx"
Cohesion: 0.10
Nodes (41): LogMockTab(), SubjectRoster(), CustomExamDialog(), describeTier(), ExamRow(), ExamsPanel(), maxOf(), SourceSummary (+33 more)

### Community 43 - "format.ts"
Cohesion: 0.12
Nodes (21): NumberField, ResultEditor(), fill(), weekdayDateLabel(), istClock, istDateKey(), istDayKey, longDay (+13 more)

### Community 44 - "api"
Cohesion: 0.12
Nodes (15): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+7 more)

### Community 45 - "requireUser"
Cohesion: 0.12
Nodes (15): jobs, validate, name, permissions, contents, run, uses, with (+7 more)

### Community 46 - "connection-input.ts"
Cohesion: 0.13
Nodes (27): DEFAULT_AI_BASE_URL, Env, integerEnv(), normaliseBaseUrl(), readAiConfig(), AiConnectionInput, AiCredentialInput, connectionFields (+19 more)

### Community 47 - "plan-facts.ts"
Cohesion: 0.19
Nodes (11): LANDING_PLAN, plan, buildLandingPlan(), category(), isMock(), LandingPlanData, LandingPlanDay, LandingPlanTask (+3 more)

### Community 48 - "extraction.ts"
Cohesion: 0.18
Nodes (17): deriveCounts(), deriveQuestions(), exactInteger(), ExtractedSubjectDraft, ExtractionIssue, extractionModelSchema, extractionSubjectIds, inferType() (+9 more)

### Community 49 - "my-tasks-view.tsx"
Cohesion: 0.11
Nodes (37): GET, runtime, attemptData(), attemptInclude, attemptWhere(), mapSubjects(), StoredAnalyticsAttempt, StoredAttempt (+29 more)

### Community 50 - "Dashboard and Outcome Visual References"
Cohesion: 0.07
Nodes (54): @tanstack/react-query, AddMockView(), LogMockPayload, CompareReference, DashboardClock(), DateRangeFilter(), ScopeFilters(), SCOPES (+46 more)

### Community 51 - "Continuous Integration Validation Workflow"
Cohesion: 0.20
Nodes (8): Multi-Theme System (data-palette x data-style), Palettes x Styles Theme Matrix, Typography Scale (Source Serif 4 + DM Sans), Missing Radius System Finding, Elevation Model and --shadow-pop Token, Restrained Motion Language, Tokenized Radius Scale (panel/control/card/pill), Sticky Identity Column for Mock History

### Community 52 - "cn"
Cohesion: 0.18
Nodes (9): args, evaluate(), height, pending, report, send(), target, width (+1 more)

### Community 53 - "fixtures.ts"
Cohesion: 0.13
Nodes (16): AttemptInput, buildAttempt(), FULL_ROWS, LANDING_ATTEMPTS, LANDING_LATEST, LANDING_SCOPES, LANDING_TARGET, OTHER_ROWS (+8 more)

### Community 54 - "trash-view.tsx"
Cohesion: 0.13
Nodes (32): AttemptPagination, windowedPages(), KindFilter, messageOf(), rowKey(), toItemRef(), TrashView(), ungroupedCount() (+24 more)

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
Cohesion: 0.20
Nodes (13): maxDuration, runtime, MAX_TODO_PROMPT_CHARS, parseTodoProposals(), Target, TODO_DATE_QUESTION, todoDraftMessages(), todoDraftRequestSchema (+5 more)

### Community 60 - "client-types.ts"
Cohesion: 0.25
Nodes (5): Dashboard Analytical Scopes (full/subject/sectional/all), Backup Format v2 and Account Transfer, Semantic Chart Palette and Chart Rules, Core Product Workflows, JSON Backup Format Version 2

### Community 61 - "private-workspace.tsx"
Cohesion: 0.08
Nodes (30): Baseline architecture, Call-site inventory (39 total), Client State Architecture Audit — 2026-10-31, Design decisions, Findings, Migration roadmap (executed order), Standing gaps (out of scope, recorded), @tanstack/react-query-devtools@^5.105.0 (+22 more)

### Community 62 - "calendar-view.tsx"
Cohesion: 0.13
Nodes (27): PageHeader(), CalendarLegend(), stepSize(), CalendarLoading(), CalendarView(), currentPath(), MemoMonthGrid, MemoWeekView (+19 more)

### Community 63 - "extract/route.ts"
Cohesion: 0.11
Nodes (28): radix-ui, react, BackupPreviewCard(), DataPanel(), ActiveTargetCard(), DefaultRow(), describeSignature(), PercentileExplainer() (+20 more)

### Community 64 - "shot.mjs"
Cohesion: 0.40
Nodes (6): Known Limitations (duo-icons fill-rule, native inputs), Design System Source-of-Truth Map, Icon Inconsistency Finding (14 ad-hoc sizes), Icon Size Scale (14/16/18/22/28), Named Imports for Bundle Reduction, Raw Lucide Imports Migrated into Semantic Icon Map

### Community 68 - "Caching and Revalidation Policy"
Cohesion: 0.50
Nodes (5): WorkspaceShell Client Orchestrator and Its Three Hooks, dashboard.tsx Monolith Split Finding, UI Baseline Audit Findings (26 prioritized items), 15-Phase Execution Order, Unified Segmented Control (.segment-group)

### Community 69 - "ai.test.ts"
Cohesion: 0.12
Nodes (17): COACH_FORMAT, maxDuration, runtime, AiQuotaLimits, AiQuotaUsage, chargedOnFailure(), CONTEXT_TOKEN_ESTIMATE, planReservation() (+9 more)

### Community 70 - "ai/todos/route.ts"
Cohesion: 0.22
Nodes (20): DaySections(), AttemptEntryRow(), entryPlanRow(), PersonalEntryRow(), PlanEntryRow(), RevisionEntryRow(), SectionHead(), StatusDot() (+12 more)

### Community 71 - "view-model.ts"
Cohesion: 0.11
Nodes (17): DayLedger(), EmptyActions(), LoadLine(), DayActions, dayTypeLabel(), isoMonthEnd(), isoMonthStart(), IST_TODAY (+9 more)

### Community 72 - "sheet.tsx"
Cohesion: 0.20
Nodes (17): AiChatSheet(), Masthead(), onScroll(), read(), NAV, AiPlanSheet(), TrashDetailSheet(), SheetContent (+9 more)

### Community 73 - "client-types.ts"
Cohesion: 0.15
Nodes (17): INSIGHT_REQUEST_TEXT, trimChatHistory(), chatBaseForSend(), AiConfigSource, AiResponseUsage, AiScreenContext, AiSourceState, AiStatus (+9 more)

### Community 74 - "status/route.ts"
Cohesion: 0.17
Nodes (17): dynamic, GET(), runtime, Context, devHandle(), handle(), privateNoStore, runtime (+9 more)

### Community 89 - "api"
Cohesion: 0.12
Nodes (31): useToast(), EMPTY_TASKS, patchDayInPlan(), patchTaskInPlan(), PersonalTaskInput, PlanDataApi, usePlanData(), usePlanOptimistic() (+23 more)

### Community 139 - "Add Mock Route"
Cohesion: 0.12
Nodes (33): LANDING_SUMMARY, AiPanel(), CompareScreen(), delta(), duration(), DashboardScreen(), accuracyTone(), CHART (+25 more)

### Community 140 - "my-tasks-view.tsx"
Cohesion: 0.06
Nodes (41): ApplyOp, ConfirmState, MyTasksView(), bulkRescheduleApply(), bulkStatus(), bulkTrashSelected(), clearSelection(), createTask() (+33 more)

### Community 141 - "Mock Comparison Route"
Cohesion: 0.05
Nodes (78): @radix-ui/react-dialog@^1.3.1, @radix-ui/react-dialog, collectCursors(), GET, runtime, NAV_GROUPS, planHref(), CommandPalette() (+70 more)

### Community 142 - "Dashboard Workspace Route"
Cohesion: 0.05
Nodes (35): filterAttempts(), targetMarks(), AccountUser, LookupResult, SessionError, verifiedUser(), duplicateKey(), Marking (+27 more)

### Community 143 - "compare-view.tsx"
Cohesion: 0.10
Nodes (42): accuracyTone(), AttemptTotals, comparablePercentage(), Delta(), scoreBarTone(), typeChip(), buildComparison(), buildSectionRows() (+34 more)

### Community 144 - "Personal Tasks Route"
Cohesion: 0.13
Nodes (13): BACKUP_FORMAT, BACKUP_FORMAT_VERSION, BACKUP_MAX_ATTEMPTS, backup, english, full, ga, PLANNER (+5 more)

### Community 145 - "credentials.ts"
Cohesion: 0.20
Nodes (20): DELETE, GET, PUT, runtime, aiCredentialSchema, AiCredentialInput, AiCredentialSummary, credentialStorageAvailable() (+12 more)

### Community 146 - "Panel"
Cohesion: 0.23
Nodes (12): AiCoachCard(), Panel(), useExamScope(), FindingsPanel(), points(), sentence(), TONE_ICON, TONE_TEXT (+4 more)

### Community 147 - "models.ts"
Cohesion: 0.30
Nodes (9): relativePath(), AiModel, fetchModelCatalog(), ModelCatalogTarget, ModelDiscoveryError, parseModelCatalog(), ANTHROPIC_VERSION, joinProviderUrl() (+1 more)

### Community 148 - "ssrf-core.ts"
Cohesion: 0.26
Nodes (11): RFC-1918, assertSafeBaseUrl(), assertSafeBaseUrlShape(), BLOCKED_HOSTNAMES, inV4Range(), ipv4Octets(), isBlockedAddress(), parseBaseUrl() (+3 more)

### Community 149 - "usage.ts"
Cohesion: 0.22
Nodes (10): dayKey(), nextIstMidnight(), secondsUntilIstMidnight(), getAiUsageToday(), prismaCode(), releaseAiUsage(), ReservationInput, serializable() (+2 more)

### Community 150 - "verify-backup-transfer.mjs"
Cohesion: 0.29
Nodes (8): api(), backup(), cookies, preview(), raw(), replace(), settings, user()

### Community 151 - "google-sign-in-button.tsx"
Cohesion: 0.23
Nodes (8): GoogleGlyph(), GoogleSignInButton(), GoogleSignInButtonProps, LANDING_FULL_MOCKS, HeroArt(), Hero(), MockRing(), MockTrend()

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

### Community 156 - "resolve.ts"
Cohesion: 0.20
Nodes (11): aiConnectionSchema, canonicalTarget(), CredentialTarget, sameCredentialTarget(), AiConfigSource, quotaLimitsForSource(), resolveSourcePolicy(), StoredCredentialState (+3 more)

### Community 157 - "agenda-view.tsx"
Cohesion: 0.14
Nodes (33): MetricCell(), AgendaGroups(), AgendaView(), EarlierRanges(), CalendarMetrics(), CalendarSurface(), categoryLabel(), QuietDays() (+25 more)

### Community 158 - "board-view.tsx"
Cohesion: 0.30
Nodes (12): nextStatus(), PersonalTaskDisplayStatus, STATUS_META, StatusDot(), statusOf(), BoardView(), handleDrop(), columnFor() (+4 more)

### Community 159 - "Outcome Cards and Dated AttemptRecordCard"
Cohesion: 0.40
Nodes (4): BACKUP_MAX_BYTES, BackupPreview, ImportMode, ImportResult

### Community 160 - "Pooled Vercel Runtime"
Cohesion: 0.40
Nodes (4): cspDev, cspProduction, nextConfig, productionHeaders

### Community 166 - "task-suggestion.ts"
Cohesion: 0.19
Nodes (9): CATEGORIES, isHttpUrl(), ParsedChatContent, parseSuggestionBody(), parseTaskSuggestions(), PRIORITIES, TaskSuggestion, personalTasksByDate() (+1 more)

### Community 168 - "useAiWorkspace"
Cohesion: 0.24
Nodes (8): insightToChatText(), newId(), useAiWorkspace(), AiChatEvent, ChatUsage, encoder, NdjsonDecoder, parseChatEvent()

### Community 169 - "ai-prompt-security.test.ts"
Cohesion: 0.16
Nodes (24): AiContext, chatMessages(), coachMessages(), contextBlock(), extractionMessages(), FALLBACK_SHAPE, marksFor(), paperLabel() (+16 more)

### Community 170 - "showcase.tsx"
Cohesion: 0.27
Nodes (8): motion@^12.0.0, motion, BrowserFrame(), MockupCaption(), EASE, Showcase(), TabId, TABS

### Community 171 - "verify-ownership.mjs"
Cohesion: 0.33
Nodes (6): api(), cookies, created, input, original, raw()

### Community 173 - "verify-trash.mjs"
Cohesion: 0.43
Nodes (6): api(), cookies, created, input, raw(), visible()

### Community 174 - "verify-neon.mjs"
Cohesion: 0.50
Nodes (4): api(), full, ids, raw()

### Community 175 - "ui-store.ts"
Cohesion: 0.50
Nodes (3): AiChatTab, UiState, useUiStore

## Ambiguous Edges - Review These
- `Stack Inventory (Next 16.4.3, React 19.2, TS 5.9, Tailwind 4, Recharts 3, motion 12)` → `Private Accounts Release Notes`  [AMBIGUOUS]
  docs/ui-overhaul/phase-1-audit.md · relation: conceptually_related_to

## Knowledge Gaps
- **36 isolated node(s):** `RFC-1918`, `Analytics Projections Cache Policy (/api/analytics)`, `force-dynamic Public Auth-Adjacent Pages`, `Health Endpoint Rate-Limit-Exempt (/api/health)`, `Firebase/Mongo Runtime Dependencies Removed` (+31 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1011 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **79 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Request Proxy and Public Origins` to `Panel`, `ai-composer.tsx`, `ai-settings-form.tsx`, `calendar-view.tsx`, `Add Mock Route`, `my-tasks-view.tsx`, `Mock Comparison Route`, `personal-task-drawer.tsx`, `compare-view.tsx`, `ai-composer.tsx`, `Panel`, `Mock Entry Form and Validation`, `google-sign-in-button.tsx`, `queries/exams.ts`, `agenda-view.tsx`, `board-view.tsx`, `ai-prompt-security.test.ts`, `personal-todos.tsx`, `PlainIcon`, `visuals.ts`, `ai-chat-sheet.tsx`, `trash-view.tsx`, `showcase.tsx`, `Dashboard and Outcome Visual References`, `trash-view.tsx`, `calendar-view.tsx`, `extract/route.ts`, `ai/todos/route.ts`, `view-model.ts`, `sheet.tsx`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **What connects `RFC-1918`, `Analytics Projections Cache Policy (/api/analytics)`, `force-dynamic Public Auth-Adjacent Pages` to the rest of the system?**
  _36 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Panel` be split into smaller, more focused modules?**
  _Cohesion score 0.10227272727272728 - nodes in this community are weakly interconnected._
- **Why does `next` connect `PlainIcon` to `Pooled Vercel Runtime`, `ai-composer.tsx`, `Panel`, `subject-performance.test.ts`, `view-model.ts`, `calendar-view.tsx`, `Mock Comparison Route`, `RequestError`, `ai-composer.tsx`, `lib/trash.ts`, `Dashboard and Outcome Visual References`, `toast.tsx`, `Request Proxy and Public Origins`, `private-workspace.tsx`, `calendar-view.tsx`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Should `ai-composer.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10080645161290322 - nodes in this community are weakly interconnected._
- **Why does `react` connect `extract/route.ts` to `ai-composer.tsx`, `subject-performance.test.ts`, `ai-settings-form.tsx`, `calendar-view.tsx`, `Add Mock Route`, `my-tasks-view.tsx`, `Mock Comparison Route`, `personal-task-drawer.tsx`, `compare-view.tsx`, `ai-composer.tsx`, `Panel`, `Mock Entry Form and Validation`, `toast.tsx`, `queries/exams.ts`, `google-sign-in-button.tsx`, `Request Proxy and Public Origins`, `agenda-view.tsx`, `board-view.tsx`, `ai-prompt-security.test.ts`, `Outcome Cards and Dated AttemptRecordCard`, `personal-todos.tsx`, `PlainIcon`, `ai-chat-sheet.tsx`, `trash-view.tsx`, `showcase.tsx`, `format.ts`, `Dashboard and Outcome Visual References`, `trash-view.tsx`, `mock-entry.test.ts`, `private-workspace.tsx`, `calendar-view.tsx`, `ai/todos/route.ts`, `view-model.ts`, `sheet.tsx`, `client-types.ts`, `api`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Stack Inventory (Next 16.4.3, React 19.2, TS 5.9, Tailwind 4, Recharts 3, motion 12)` and `Private Accounts Release Notes`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._