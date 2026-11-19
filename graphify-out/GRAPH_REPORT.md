# Graph Report - ssc-insight-2  (2026-11-20)

## Corpus Check
- 405 files · ~305,351 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 4, .css 2, .example 1)

## Summary
- 3210 nodes · 9749 edges · 172 communities (91 shown, 81 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 102 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `adffa72d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- PlainIcon
- ai-composer.tsx
- personal-todos.tsx
- ssrf-core.ts
- command-palette.tsx
- domain.ts
- Primary Architecture Handbook
- subject-performance.test.ts
- _lib/schema.ts
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
- performance-metrics.ts
- trash-view.tsx
- queries/exams.ts
- provider.ts
- score-forecast.ts
- api.ts
- Request Proxy and Public Origins
- progress.ts
- use-workspace-data.ts
- Study Plan Progress APIs
- ai-prompt-security.test.ts
- plan-day-view.tsx
- PersonalTodos
- credentials.ts
- Score Observatory verification
- shortDate
- ai-chat-sheet.tsx
- compare-view.tsx
- exams-panel.tsx
- Button
- settings-view.tsx
- trash-core.ts
- format.ts
- api
- requireUser
- connection-input.ts
- reminders-panel.tsx
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
- domain.ts
- client-types.ts
- private-workspace.tsx
- calendar-view.tsx
- targets-panel.tsx
- shot.mjs
- Caching and Revalidation Policy
- ssrf-core.ts
- ai/todos/route.ts
- models/route.ts
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
- cn
- verify-backup-transfer.mjs
- about-panel.tsx
- routes.test.ts
- prisma
- backup.test.ts
- attempts.ts
- google-sign-in-button.tsx
- parseBackup
- Neon Ownership Migration and QA
- showcase.tsx
- Paper Tokens and Design Handover
- resolve.ts
- view-model.ts
- plan-day-view.tsx
- attempt-sort.ts
- Pooled Vercel Runtime
- vercel.json
- @neon/config
- ProviderStreamDecoder
- use-backup-import.ts
- ai-prompt-security.test.ts
- @radix-ui/react-avatar

## God Nodes (most connected - your core abstractions)
1. `cn()` - 262 edges
2. `PlainIcon()` - 132 edges
3. `Button()` - 118 edges
4. `react` - 110 edges
5. `SSC Insight Architecture` - 104 edges
6. `SSC Insight Architecture` - 104 edges
7. `shortDate()` - 83 edges
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

## Communities (172 total, 81 thin omitted)

### Community 0 - "PlainIcon"
Cohesion: 0.08
Nodes (58): next, AiCoachCard(), AttemptOutcomeCard(), AttemptRecordCard(), outcomes, percent(), ScoreRing(), subjectIcons (+50 more)

### Community 1 - "ai-composer.tsx"
Cohesion: 0.07
Nodes (37): lucide-react, metadata, metadata, PersonalCalendar(), personalMonthRange(), categoryMeta(), Group, PageLayout (+29 more)

### Community 2 - "personal-todos.tsx"
Cohesion: 0.10
Nodes (33): MetricCell(), AgendaGroups(), AgendaView(), EarlierRanges(), CalendarMetrics(), QuietDays(), addToCounts(), adjacentEntryDate() (+25 more)

### Community 4 - "command-palette.tsx"
Cohesion: 0.06
Nodes (45): AI Status Endpoint Cache Policy (/api/ai/status), Analytics Projections Cache Policy (/api/analytics), api() Client Fetch cache: no-store (src/lib/api-client.ts), Backup Export Raw File Exception (GET /api/backup), Next.js 16 Cache Components Not Enabled, Caching and Revalidation Policy (Phase 8 reference), Filters/Scope URL State Mirror (src/lib/filters-url.ts), force-dynamic Public Auth-Adjacent Pages (+37 more)

### Community 7 - "subject-performance.test.ts"
Cohesion: 0.04
Nodes (45): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, cmdk@^1.1.1, @duo-icons/react@^1.0.1, @fontsource-variable/dm-sans@^5.3.0, @fontsource-variable/source-serif-4@^5.3.1, lucide-react@^0.468.0 (+37 more)

### Community 8 - "_lib/schema.ts"
Cohesion: 0.22
Nodes (8): aiSchema, AiValues, examsScopeSchema, ExamsScopeValues, remindersSchema, ReminderValues, TargetsValues, timeOfDay

### Community 10 - "calendar-view.tsx"
Cohesion: 0.14
Nodes (29): DuotoneIcon(), DuotoneTile(), Faq(), FAQ_ITEMS, Landing(), ERROR_COPY, LandingError(), LedgerFacts() (+21 more)

### Community 11 - "app-shell.tsx"
Cohesion: 0.10
Nodes (36): POST, GET, runtime, DELETE, PATCH, runtime, DELETE, GET (+28 more)

### Community 13 - "RequestError"
Cohesion: 0.08
Nodes (54): zod, POST, POST, assignTierIds(), customExamInputSchema, customSubjectSchema, customTierSchema, DELETE (+46 more)

### Community 14 - "personal-task-drawer.tsx"
Cohesion: 0.20
Nodes (17): DayDrawer(), DayLedgerProps, blankTask(), PersonalTaskDrawer(), TaskEditorLoader(), TaskEditorForm(), buildDraft(), save() (+9 more)

### Community 15 - "Setup and Operations Handbook"
Cohesion: 0.04
Nodes (44): attemptLabel(), BACKUP_INSERT_CHUNK_SIZE, BACKUP_REQUEST_MAX_BYTES, BACKUP_SAMPLE_LIMIT, backupAttemptSchema, backupAttemptsWithBounds, BackupPersonalTask, BackupPlanDayProgress (+36 more)

### Community 16 - "ai-composer.tsx"
Cohesion: 0.11
Nodes (43): EmptyChart(), AttemptBreakdown(), BreakdownDonut(), DeepDive(), GroupedScoreBars(), InsightCallout(), paperMax(), PerformanceOverview (+35 more)

### Community 17 - "lib/trash.ts"
Cohesion: 0.09
Nodes (36): Context, devHandle(), handle(), privateNoStore, runtime, GET(), dynamic, LandingPage() (+28 more)

### Community 18 - "route-handler.ts"
Cohesion: 0.09
Nodes (33): bearerToken(), GET, maxDuration, runtime, secretMatches(), dynamic, GET, HealthStatus (+25 more)

### Community 19 - "Mock Entry Form and Validation"
Cohesion: 0.06
Nodes (42): next-themes@^0.4.6, next-themes, metadata, RootLayout(), AppearancePanel(), PaletteChip(), StyleGlyph(), ErrorBoundary (+34 more)

### Community 20 - "Paper Design System Handbook"
Cohesion: 0.05
Nodes (82): GET, runtime, GET, AiBundle, loadAiBundle(), loadAiContext(), PatternSection, ALL_TIERS_ID (+74 more)

### Community 21 - "performance-metrics.ts"
Cohesion: 0.09
Nodes (26): FindingsPanel(), points(), sentence(), TONE_ICON, TONE_TEXT, PerformancePoint, Distribution, DISTRIBUTION_MIN_POINTS (+18 more)

### Community 22 - "trash-view.tsx"
Cohesion: 0.14
Nodes (13): args, evaluate(), height, pending, problems, report, send(), settle (+5 more)

### Community 23 - "queries/exams.ts"
Cohesion: 0.14
Nodes (18): ExamScope, ExamScopeContext, ExamScopeProvider(), tierLabelFallback(), activeExamPattern(), CustomExamDto, CustomExamInput, CustomTierDto (+10 more)

### Community 24 - "provider.ts"
Cohesion: 0.11
Nodes (45): aiAborted(), AiBillability, aiBusy(), aiEndpointError(), AiError, AiErrorCode, aiInvalidOutput(), aiModelError() (+37 more)

### Community 25 - "score-forecast.ts"
Cohesion: 0.12
Nodes (25): Accuracy Footer Divisor Column (83.3% Accuracy), Marks Obtained (70/90) and Score Strip, Outcome Card Illustration (Reasoning), Outcome Counts with Proportion Bars (Correct / Incorrect / Unattempted), Percentile Availability Note ('No standalone subject percentile recorded'), Score-Centered Answer Distribution Ring (77.8% SCORE), Serif Subject Heading with Attempt/Question Subtitle, Soft-Rounded Warm Paper Card Surface (+17 more)

### Community 26 - "api.ts"
Cohesion: 0.07
Nodes (59): bodySchema, maxDuration, POST(), runtime, COACH_FORMAT, maxDuration, POST(), runtime (+51 more)

### Community 27 - "Request Proxy and Public Origins"
Cohesion: 0.14
Nodes (29): ActiveExamFooterNote(), AppFrame(), AppHeader(), AppSidebar(), HeaderLocation(), NavItem(), Sidebar, SidebarContent (+21 more)

### Community 28 - "progress.ts"
Cohesion: 0.10
Nodes (34): mutationSchema, POST, runtime, GET, runtime, DELETE, idSchema, PUT (+26 more)

### Community 29 - "use-workspace-data.ts"
Cohesion: 0.13
Nodes (24): EMPTY_ATTEMPTS, useWorkspaceData(), ATTEMPT_SORT_KEYS, DashboardScope, dashboardScopeSchema, Filters, filtersSchema, DEFAULT_SCOPE (+16 more)

### Community 30 - "Study Plan Progress APIs"
Cohesion: 0.12
Nodes (31): AiContext, average(), buildAiContext(), fullMockProfile(), payload(), recentFullMock(), sectionProfile(), subjectProfile() (+23 more)

### Community 31 - "ai-prompt-security.test.ts"
Cohesion: 0.15
Nodes (34): AuthControl(), AuthControlProps, AuthError(), ExamSwitcher(), BulkBar(), TaskRow(), filterCount(), MenuOption() (+26 more)

### Community 32 - "plan-day-view.tsx"
Cohesion: 0.08
Nodes (23): LANDING_PLAN, plan, buildLandingPlan(), category(), isMock(), LandingPlanDay, LandingPlanTask, RawDay (+15 more)

### Community 33 - "PersonalTodos"
Cohesion: 0.25
Nodes (13): Migration roadmap (executed order), GroupRow(), KanbanBoard(), OverdueTodoPreview(), PersonalTodos(), clearSelection(), mutate(), runBulkDelete() (+5 more)

### Community 34 - "credentials.ts"
Cohesion: 0.21
Nodes (19): DELETE, GET, PUT, runtime, sameCredentialTarget(), AiCredentialInput, AiCredentialSummary, credentialStorageAvailable() (+11 more)

### Community 35 - "Score Observatory verification"
Cohesion: 0.07
Nodes (55): GET, idSchema, kindSchema, runtime, POST, runtime, POST, runtime (+47 more)

### Community 36 - "shortDate"
Cohesion: 0.12
Nodes (24): CalendarToolbar(), categoryLabel(), LayerToggles(), CellRow(), MonthCell(), WEEKDAYS, PeriodNav(), UNIT (+16 more)

### Community 37 - "ai-chat-sheet.tsx"
Cohesion: 0.12
Nodes (22): AiChatSheet(), AiSheetTaskApi, ChatHistoryPanel(), CoachChatTab(), CoachMemo(), CoachMemos(), CoachUserTurn(), inlineNodes() (+14 more)

### Community 38 - "compare-view.tsx"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 39 - "exams-panel.tsx"
Cohesion: 0.17
Nodes (21): CustomExamDialog(), describeTier(), ExamsPanel(), maxOf(), SourceSummary, StageSummary, SUBJECT_CHOICES, TierSummary (+13 more)

### Community 40 - "Button"
Cohesion: 0.10
Nodes (15): ws@^8.22.0, ws, logs, pending, target, ws, args, logs (+7 more)

### Community 41 - "settings-view.tsx"
Cohesion: 0.16
Nodes (17): MotionButton, PanelDraft, SettingsGuard, SettingsGuardContext, SettingsGuardProvider(), useOptionalSettingsGuard(), usePanelDraft(), useSettingsGuard() (+9 more)

### Community 43 - "format.ts"
Cohesion: 0.13
Nodes (20): NumberField, ResultEditor(), fill(), Attempt, istClock, istDateKey(), istDayKey, longDay (+12 more)

### Community 44 - "api"
Cohesion: 0.12
Nodes (15): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+7 more)

### Community 45 - "requireUser"
Cohesion: 0.12
Nodes (15): jobs, validate, name, permissions, contents, run, uses, with (+7 more)

### Community 46 - "connection-input.ts"
Cohesion: 0.08
Nodes (39): AiSettingsForm(), chooseProvider(), fetchModels(), patchFields(), payloadFrom(), remove(), test(), Catalog (+31 more)

### Community 47 - "reminders-panel.tsx"
Cohesion: 0.13
Nodes (20): @hookform/resolvers@^5.9.2, react-hook-form@^7.92.0, @hookform/resolvers, react-hook-form, pageEnter, Reveal(), RevealItem(), saveBarSpring (+12 more)

### Community 48 - "extraction.ts"
Cohesion: 0.12
Nodes (26): ExtractionReview(), update(), updateSubject(), FieldIssues(), NullableDuration(), optionalNumber(), blankExtractedSubject(), deriveCounts() (+18 more)

### Community 49 - "my-tasks-view.tsx"
Cohesion: 0.10
Nodes (35): GET, maxDuration, runtime, privateHeaders, attemptData(), attemptInclude, attemptWhere(), mapSubjects() (+27 more)

### Community 50 - "Dashboard and Outcome Visual References"
Cohesion: 0.13
Nodes (27): AddMockView(), LogMockPayload, CompareReference, DashboardClock(), useExamScope(), ScopeFilters(), SCOPES, viewTransition() (+19 more)

### Community 51 - "Continuous Integration Validation Workflow"
Cohesion: 0.20
Nodes (8): Multi-Theme System (data-palette x data-style), Palettes x Styles Theme Matrix, Typography Scale (Source Serif 4 + DM Sans), Missing Radius System Finding, Elevation Model and --shadow-pop Token, Restrained Motion Language, Tokenized Radius Scale (panel/control/card/pill), Sticky Identity Column for Mock History

### Community 52 - "cn"
Cohesion: 0.18
Nodes (9): args, evaluate(), height, pending, report, send(), target, width (+1 more)

### Community 53 - "fixtures.ts"
Cohesion: 0.10
Nodes (30): totalsFor(), AttemptInput, buildAttempt(), FULL_ROWS, LANDING_ATTEMPTS, LANDING_FULL_MOCKS, LANDING_LATEST, LANDING_SCOPES (+22 more)

### Community 54 - "devDependencies"
Cohesion: 0.07
Nodes (35): @prisma/client@7.10.1, recharts@^3.0.0, zustand@^5.0.16, devDependencies, eslint@^9.0.0, eslint-config-next@^16.0.0, prettier@^3.9.10, tailwindcss@^4.0.0 (+27 more)

### Community 55 - "sections.tsx"
Cohesion: 0.20
Nodes (10): Request and Ownership Architecture, Neon Agent Tooling Setup (Codex plugin + MCP), Expiring QA Branch Migration Rehearsal, Selected Neon Environment (org/project/branch), Private-Accounts Migration (claim two shared mocks), Session-Derived Ownership Model, Isolation and Ownership Verification, Google Sign-In via Neon Auth OAuth (+2 more)

### Community 56 - "theme-style-provider.tsx"
Cohesion: 0.17
Nodes (12): scripts, build, check, db:generate, db:migrate, dev, lint, postinstall (+4 more)

### Community 57 - "mock-entry.test.ts"
Cohesion: 0.15
Nodes (26): DurationInput(), change(), formatParts(), blankSubject(), defaultTierId(), fullMockSectionHeading(), meritSubjectIds(), MockForm() (+18 more)

### Community 58 - "trash-view.tsx"
Cohesion: 0.20
Nodes (9): Confirmed requirements, Dated personal todos and AI-assisted planning, Existing foundation, Finalized navigation and lifecycle, Phase 1 — Design the dated planner and review flow, Phase 2 — Extend task storage and manual workflows, Phase 3 — Add AI proposal and confirmed-apply workflows, Phase 4 — Validate and document (+1 more)

### Community 59 - "domain.ts"
Cohesion: 0.13
Nodes (17): filterAttempts(), attemptListSchema, duplicateKey(), FULL_MOCK_MAX_SCORE, MAIN_SUBJECT_IDS, optionalNumber, PAGE_SIZES, parseTime() (+9 more)

### Community 60 - "client-types.ts"
Cohesion: 0.25
Nodes (5): Dashboard Analytical Scopes (full/subject/sectional/all), Backup Format v2 and Account Transfer, Semantic Chart Palette and Chart Rules, Core Product Workflows, JSON Backup Format Version 2

### Community 61 - "private-workspace.tsx"
Cohesion: 0.12
Nodes (19): Baseline architecture, Call-site inventory (39 total), Client State Architecture Audit — 2026-10-31, Findings, Standing gaps (out of scope, recorded), dynamic, WorkspaceLayout(), GuardLedgerRow() (+11 more)

### Community 62 - "calendar-view.tsx"
Cohesion: 0.13
Nodes (26): CalendarSurface(), CalendarLegend(), stepSize(), CalendarLoading(), CalendarView(), currentPath(), MemoMonthGrid, MemoWeekView (+18 more)

### Community 63 - "targets-panel.tsx"
Cohesion: 0.19
Nodes (20): targetsSchema(), ActiveTargetCard(), DefaultRow(), describeSignature(), PercentileExplainer(), PercentileRow(), sourceLabel(), targetForSignature() (+12 more)

### Community 64 - "shot.mjs"
Cohesion: 0.40
Nodes (6): Known Limitations (duo-icons fill-rule, native inputs), Design System Source-of-Truth Map, Icon Inconsistency Finding (14 ad-hoc sizes), Icon Size Scale (14/16/18/22/28), Named Imports for Bundle Reduction, Raw Lucide Imports Migrated into Semantic Icon Map

### Community 68 - "Caching and Revalidation Policy"
Cohesion: 0.50
Nodes (5): WorkspaceShell Client Orchestrator and Its Three Hooks, dashboard.tsx Monolith Split Finding, UI Baseline Audit Findings (26 prioritized items), 15-Phase Execution Order, Unified Segmented Control (.segment-group)

### Community 69 - "ssrf-core.ts"
Cohesion: 0.25
Nodes (11): RFC-1918, assertSafeBaseUrl(), assertSafeBaseUrlShape(), BLOCKED_HOSTNAMES, inV4Range(), ipv4Octets(), isBlockedAddress(), parseBaseUrl() (+3 more)

### Community 70 - "ai/todos/route.ts"
Cohesion: 0.18
Nodes (24): DaySections(), AttemptEntryRow(), entryPlanRow(), PersonalEntryRow(), PlanEntryRow(), RevisionEntryRow(), SectionHead(), StatusDot() (+16 more)

### Community 71 - "models/route.ts"
Cohesion: 0.20
Nodes (14): maxDuration, POST, runtime, aiConnectionSchema, relativePath(), resolveDraftConnection(), AiModel, fetchModelCatalog() (+6 more)

### Community 72 - "sheet.tsx"
Cohesion: 0.14
Nodes (27): AttemptPagination, windowedPages(), Masthead(), onScroll(), read(), NAV, AiPlanSheet(), TrashDetailSheet() (+19 more)

### Community 73 - "client-types.ts"
Cohesion: 0.07
Nodes (46): ChatHistoryApi, INSIGHT_REQUEST_TEXT, insightToChatText(), newId(), trimChatHistory(), useAiWorkspace(), chatBaseForSend(), AiConfigSource (+38 more)

### Community 74 - "query-client.ts"
Cohesion: 0.31
Nodes (8): @tanstack/react-query-devtools@^5.105.0, @tanstack/react-query-devtools, QueryProvider(), getQueryClient(), makeQueryClient(), NO_RETRY_STATUSES, retryDelay(), shouldRetry()

### Community 89 - "api"
Cohesion: 0.11
Nodes (32): Design decisions, @tanstack/react-query, EMPTY_TASKS, patchDayInPlan(), patchTaskInPlan(), PersonalTaskInput, PlanDataApi, usePlanData() (+24 more)

### Community 139 - "Add Mock Route"
Cohesion: 0.16
Nodes (24): AiPanel(), CompareScreen(), delta(), duration(), accuracyTone(), ChipTone, MockChip(), MockStat() (+16 more)

### Community 140 - "MyTasksView"
Cohesion: 0.07
Nodes (30): MyTasksView(), bulkRescheduleApply(), bulkStatus(), bulkTrashSelected(), clearSelection(), createTask(), cycleStatus(), duplicate() (+22 more)

### Community 141 - "Mock Comparison Route"
Cohesion: 0.06
Nodes (68): collectCursors(), GET, runtime, NAV_GROUPS, planHref(), CommandPalette(), CommandPaletteProps, loadRecentSearches() (+60 more)

### Community 142 - "ref_node_assert"
Cohesion: 0.05
Nodes (32): packageDir, REPLACEMENTS, targets, targetMarks(), targetPercentage(), Marking, SubjectResult, root (+24 more)

### Community 143 - "compare-view.tsx"
Cohesion: 0.18
Nodes (25): accuracyTone(), AttemptTotals, comparablePercentage(), Delta(), scoreBarTone(), typeChip(), buildComparison(), buildSectionRows() (+17 more)

### Community 144 - "cn"
Cohesion: 0.07
Nodes (45): radix-ui, @radix-ui/react-dialog, react, PlanCategoryLegend(), ExamRow(), AccordionContent, AccordionItem, AccordionTrigger (+37 more)

### Community 145 - "verify-backup-transfer.mjs"
Cohesion: 0.09
Nodes (24): api(), backup(), cookies, preview(), raw(), replace(), settings, api() (+16 more)

### Community 146 - "about-panel.tsx"
Cohesion: 0.31
Nodes (8): AboutPanel(), Avatar, AvatarFallback, AvatarImage, Badge(), BadgeProps, badgeVariants, CATALOG_VERSION

### Community 147 - "routes.test.ts"
Cohesion: 0.24
Nodes (10): AppHeaderProps, VIEW_META, AI_VIEWS, APP_VIEWS, AppView, PATH_VIEW, VIEW_HREF, VIEW_PATH (+2 more)

### Community 149 - "backup.test.ts"
Cohesion: 0.13
Nodes (13): BACKUP_FORMAT, BACKUP_FORMAT_VERSION, BACKUP_MAX_ATTEMPTS, backup, english, full, ga, PLANNER (+5 more)

### Community 150 - "attempts.ts"
Cohesion: 0.27
Nodes (9): AttemptPageParams, useAttemptsByIds(), SortKey, allAttemptsQueryOptions, attemptDetailQueryOptions(), attemptKeys, AttemptListParams, attemptListQueryOptions() (+1 more)

### Community 151 - "google-sign-in-button.tsx"
Cohesion: 0.20
Nodes (10): useAuthActions(), signIn(), GoogleGlyph(), GoogleSignInButton(), signIn(), GoogleSignInButtonProps, Hero(), authClient (+2 more)

### Community 152 - "parseBackup"
Cohesion: 0.31
Nodes (8): assertSummary(), backfillLegacyQualifying(), BackupError, computedSummary(), formatIssues(), isRecord(), parseBackup(), parseImportRequest()

### Community 153 - "Neon Ownership Migration and QA"
Cohesion: 0.22
Nodes (6): @prisma/adapter-pg@^7.10.1, @prisma/adapter-pg, env, match, prisma, queries

### Community 154 - "showcase.tsx"
Cohesion: 0.40
Nodes (4): motion, EASE, TabId, TABS

### Community 155 - "Paper Tokens and Design Handover"
Cohesion: 0.20
Nodes (9): args, evaluate(), pending, send(), target, url, wait, widths (+1 more)

### Community 156 - "resolve.ts"
Cohesion: 0.13
Nodes (23): dynamic, GET(), runtime, aiConfig(), aiConfigOrNull(), AiConfig, DEFAULT_AI_BASE_URL, Env (+15 more)

### Community 157 - "view-model.ts"
Cohesion: 0.10
Nodes (30): DashboardOverview(), MetricStripSkeleton(), PageHeader(), MonthGrid, PlanWeekView(), WeekRow(), PlanRail(), addIsoDays() (+22 more)

### Community 158 - "plan-day-view.tsx"
Cohesion: 0.17
Nodes (20): DayNotes(), FlowSection(), HeroFigure(), PlanDayView(), PlanNotFound(), nextStatus(), PersonalTaskDisplayStatus, ProgressRule() (+12 more)

### Community 159 - "attempt-sort.ts"
Cohesion: 0.40
Nodes (5): ASC_SORTERS, AttemptSortRow, buildAttemptStats(), monthSplit(), AttemptStats

### Community 160 - "Pooled Vercel Runtime"
Cohesion: 0.40
Nodes (4): cspDev, cspProduction, nextConfig, productionHeaders

### Community 166 - "@neon/config"
Cohesion: 0.30
Nodes (4): @neon/config@^1.9.3, @radix-ui/react-separator@^1.2.0, @neon/config, @radix-ui/react-separator

### Community 168 - "use-backup-import.ts"
Cohesion: 0.40
Nodes (4): BACKUP_MAX_BYTES, BackupPreview, ImportMode, ImportResult

### Community 169 - "ai-prompt-security.test.ts"
Cohesion: 0.08
Nodes (41): MAX_TODO_PROMPT_CHARS, chatMessages(), coachMessages(), contextBlock(), extractionMessages(), FALLBACK_SHAPE, marksFor(), paperLabel() (+33 more)

## Ambiguous Edges - Review These
- `Stack Inventory (Next 16.4.3, React 19.2, TS 5.9, Tailwind 4, Recharts 3, motion 12)` → `Private Accounts Release Notes`  [AMBIGUOUS]
  docs/ui-overhaul/phase-1-audit.md · relation: conceptually_related_to

## Knowledge Gaps
- **36 isolated node(s):** `RFC-1918`, `Analytics Projections Cache Policy (/api/analytics)`, `force-dynamic Public Auth-Adjacent Pages`, `Health Endpoint Rate-Limit-Exempt (/api/health)`, `Firebase/Mongo Runtime Dependencies Removed` (+31 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1030 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **81 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `cn` to `PlainIcon`, `ai-composer.tsx`, `personal-todos.tsx`, `subject-performance.test.ts`, `calendar-view.tsx`, `Add Mock Route`, `MyTasksView`, `Mock Comparison Route`, `personal-task-drawer.tsx`, `compare-view.tsx`, `ai-composer.tsx`, `about-panel.tsx`, `Mock Entry Form and Validation`, `queries/exams.ts`, `google-sign-in-button.tsx`, `showcase.tsx`, `Request Proxy and Public Origins`, `view-model.ts`, `plan-day-view.tsx`, `ai-prompt-security.test.ts`, `use-workspace-data.ts`, `shortDate`, `ai-chat-sheet.tsx`, `exams-panel.tsx`, `use-backup-import.ts`, `settings-view.tsx`, `format.ts`, `connection-input.ts`, `reminders-panel.tsx`, `extraction.ts`, `Dashboard and Outcome Visual References`, `fixtures.ts`, `devDependencies`, `mock-entry.test.ts`, `private-workspace.tsx`, `calendar-view.tsx`, `targets-panel.tsx`, `ai/todos/route.ts`, `sheet.tsx`, `client-types.ts`, `query-client.ts`, `api`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **What connects `RFC-1918`, `Analytics Projections Cache Policy (/api/analytics)`, `force-dynamic Public Auth-Adjacent Pages` to the rest of the system?**
  _36 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `PlainIcon` be split into smaller, more focused modules?**
  _Cohesion score 0.07826384142173616 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `cn` to `PlainIcon`, `ai-composer.tsx`, `personal-todos.tsx`, `calendar-view.tsx`, `Add Mock Route`, `MyTasksView`, `Mock Comparison Route`, `personal-task-drawer.tsx`, `compare-view.tsx`, `ai-composer.tsx`, `about-panel.tsx`, `Mock Entry Form and Validation`, `Request Proxy and Public Origins`, `view-model.ts`, `plan-day-view.tsx`, `ai-prompt-security.test.ts`, `PersonalTodos`, `shortDate`, `ai-chat-sheet.tsx`, `exams-panel.tsx`, `settings-view.tsx`, `connection-input.ts`, `reminders-panel.tsx`, `Dashboard and Outcome Visual References`, `fixtures.ts`, `calendar-view.tsx`, `targets-panel.tsx`, `ai/todos/route.ts`, `sheet.tsx`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Should `ai-composer.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06821480406386067 - nodes in this community are weakly interconnected._
- **Why does `next` connect `PlainIcon` to `Pooled Vercel Runtime`, `ai-composer.tsx`, `subject-performance.test.ts`, `plan-day-view.tsx`, `Mock Comparison Route`, `ai-composer.tsx`, `lib/trash.ts`, `Dashboard and Outcome Visual References`, `Mock Entry Form and Validation`, `use-workspace-data.ts`, `route-handler.ts`, `devDependencies`, `view-model.ts`, `api.ts`, `Request Proxy and Public Origins`, `private-workspace.tsx`, `calendar-view.tsx`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Stack Inventory (Next 16.4.3, React 19.2, TS 5.9, Tailwind 4, Recharts 3, motion 12)` and `Private Accounts Release Notes`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._