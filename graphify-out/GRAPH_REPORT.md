# Graph Report - ssc-insight-2  (2026-11-20)

## Corpus Check
- 405 files · ~305,908 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 4, .css 2, .example 1)

## Summary
- 3214 nodes · 9760 edges · 162 communities (86 shown, 76 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 102 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `664422c0`
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
- ai-settings-form.tsx
- exam-settings.ts
- calendar-view.tsx
- app-shell.tsx
- package.json
- exams/route.ts
- personal-task-drawer.tsx
- Setup and Operations Handbook
- ai-composer.tsx
- lib/trash.ts
- audit
- Mock Entry Form and Validation
- Paper Design System Handbook
- readBody
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
- Button
- credentials.ts
- Score Observatory verification
- shortDate
- ai-chat-sheet.tsx
- compare-view.tsx
- exams-panel.tsx
- Button
- app/layout.tsx
- form.tsx
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
- trash-view.tsx
- client-types.ts
- private-workspace.tsx
- calendar-view.tsx
- targets-panel.tsx
- shot.mjs
- Caching and Revalidation Policy
- ssrf-core.ts
- ai/todos/route.ts
- context.ts
- sheet.tsx
- client-types.ts
- query-client.ts
- icon.tsx
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
- react
- verify-backup-transfer.mjs
- about-panel.tsx
- ref_node_fs
- toast.tsx
- next
- google-sign-in-button.tsx
- Paper Tokens and Design Handover
- view-model.ts
- format.ts
- Pooled Vercel Runtime
- vercel.json
- ai-prompt-security.test.ts

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
- `Baseline architecture` --references--> `PrivateWorkspace()`  [INFERRED]
  docs/state-audit.md → src/components/private-workspace.tsx
- `Migration roadmap (executed order)` --references--> `useTodoList()`  [INFERRED]
  docs/state-audit.md → src/components/use-todos-data.tsx
- `Findings` --references--> `useWorkspaceData()`  [INFERRED]
  docs/state-audit.md → src/components/use-workspace-data.ts
- `Baseline architecture` --references--> `AiUsage`  [INFERRED]
  docs/state-audit.md → src/lib/ai/provider.ts
- `Design decisions` --references--> `ApiError`  [INFERRED]
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

## Communities (162 total, 76 thin omitted)

### Community 0 - "PlainIcon"
Cohesion: 0.13
Nodes (37): DashboardOverview(), Panel(), DashboardView(), RecentAttemptsPanel(), IconName, PlainIcon(), MetricCell(), MetricStripSkeleton() (+29 more)

### Community 1 - "ai-composer.tsx"
Cohesion: 0.10
Nodes (29): nextStatus(), PersonalTaskDisplayStatus, STATUS_META, StatusDot(), statusOf(), DraftResponse, Proposal, weekdayDateLabel() (+21 more)

### Community 2 - "personal-todos.tsx"
Cohesion: 0.11
Nodes (21): addToCounts(), AttemptEntry, attemptScorePct(), buildCalendarIndex(), compareEntries(), countAll(), EMPTY_COUNTS, emptyCounts() (+13 more)

### Community 4 - "command-palette.tsx"
Cohesion: 0.06
Nodes (45): AI Status Endpoint Cache Policy (/api/ai/status), Analytics Projections Cache Policy (/api/analytics), api() Client Fetch cache: no-store (src/lib/api-client.ts), Backup Export Raw File Exception (GET /api/backup), Next.js 16 Cache Components Not Enabled, Caching and Revalidation Policy (Phase 8 reference), Filters/Scope URL State Mirror (src/lib/filters-url.ts), force-dynamic Public Auth-Adjacent Pages (+37 more)

### Community 7 - "subject-performance.test.ts"
Cohesion: 0.05
Nodes (38): dependencies, clsx@^2.1.1, cmdk@^1.1.1, @duo-icons/react@^1.0.1, lucide-react@^0.468.0, motion@^12.0.0, @neon/config@^1.9.3, @neon/env@^1.6.4 (+30 more)

### Community 8 - "ai-settings-form.tsx"
Cohesion: 0.10
Nodes (23): @hookform/resolvers@^5.9.2, react-hook-form@^7.92.0, @hookform/resolvers, react-hook-form, AiSettingsForm(), chooseProvider(), fetchModels(), patchFields() (+15 more)

### Community 10 - "calendar-view.tsx"
Cohesion: 0.12
Nodes (30): dynamic, LandingPage(), metadata, Faq(), FAQ_ITEMS, Landing(), ERROR_COPY, LandingError() (+22 more)

### Community 11 - "app-shell.tsx"
Cohesion: 0.09
Nodes (41): @prisma/adapter-pg@^7.10.1, @prisma/adapter-pg, GET, runtime, DELETE, PATCH, runtime, DELETE (+33 more)

### Community 13 - "exams/route.ts"
Cohesion: 0.14
Nodes (12): assignTierIds(), customExamInputSchema, customSubjectSchema, customTierSchema, POST, PUT, runtime, Entry (+4 more)

### Community 14 - "personal-task-drawer.tsx"
Cohesion: 0.18
Nodes (19): DayDrawer(), DayLedgerProps, blankTask(), PersonalTaskDrawer(), TaskEditorLoader(), TaskEditorForm(), buildDraft(), save() (+11 more)

### Community 15 - "Setup and Operations Handbook"
Cohesion: 0.04
Nodes (66): assertSummary(), attemptFingerprint(), attemptLabel(), backfillLegacyQualifying(), BACKUP_FORMAT, BACKUP_FORMAT_VERSION, BACKUP_MAX_ATTEMPTS, BACKUP_MAX_BYTES (+58 more)

### Community 16 - "ai-composer.tsx"
Cohesion: 0.06
Nodes (72): recharts@^3.0.0, recharts, EmptyChart(), FindingsPanel(), points(), sentence(), TONE_ICON, TONE_TEXT (+64 more)

### Community 17 - "lib/trash.ts"
Cohesion: 0.14
Nodes (24): GET(), accessLog(), AccessLogEvent, bypassesMaintenance(), classifyPath(), EnvLike, isCronPath(), maintenanceActive() (+16 more)

### Community 18 - "audit"
Cohesion: 0.11
Nodes (23): bearerToken(), GET, maxDuration, runtime, secretMatches(), dynamic, GET, HealthStatus (+15 more)

### Community 19 - "Mock Entry Form and Validation"
Cohesion: 0.12
Nodes (24): AppearancePanel(), PaletteChip(), StyleGlyph(), Swap(), initialPalette(), initialStyle(), microMotion(), PALETTE_IDS (+16 more)

### Community 20 - "Paper Design System Handbook"
Cohesion: 0.05
Nodes (91): GET, runtime, DELETE, GET, GET, PATCH, preferencesSchema, PUT (+83 more)

### Community 21 - "readBody"
Cohesion: 0.10
Nodes (28): Baseline architecture, Call-site inventory (39 total), POST, Context, devHandle(), handle(), privateNoStore, runtime (+20 more)

### Community 22 - "trash-view.tsx"
Cohesion: 0.14
Nodes (13): args, evaluate(), height, pending, problems, report, send(), settle (+5 more)

### Community 23 - "queries/exams.ts"
Cohesion: 0.13
Nodes (20): ExamScope, ExamScopeContext, ExamScopeProvider(), tierLabelFallback(), activeExamPattern(), CustomExamDto, CustomExamInput, CustomTierDto (+12 more)

### Community 24 - "provider.ts"
Cohesion: 0.10
Nodes (47): aiAborted(), AiBillability, aiBusy(), aiEndpointError(), AiError, AiErrorCode, aiInvalidOutput(), aiModelError() (+39 more)

### Community 25 - "score-forecast.ts"
Cohesion: 0.12
Nodes (25): Accuracy Footer Divisor Column (83.3% Accuracy), Marks Obtained (70/90) and Score Strip, Outcome Card Illustration (Reasoning), Outcome Counts with Proportion Bars (Correct / Incorrect / Unattempted), Percentile Availability Note ('No standalone subject percentile recorded'), Score-Centered Answer Distribution Ring (77.8% SCORE), Serif Subject Heading with Attempt/Question Subtitle, Soft-Rounded Warm Paper Card Surface (+17 more)

### Community 26 - "api.ts"
Cohesion: 0.08
Nodes (51): bodySchema, maxDuration, POST(), runtime, COACH_FORMAT, maxDuration, POST(), runtime (+43 more)

### Community 27 - "Request Proxy and Public Origins"
Cohesion: 0.10
Nodes (41): ActiveExamFooterNote(), AppFrame(), AppHeader(), AppSidebar(), HeaderLocation(), NavItem(), PlanCategoryLegend(), SelectContent (+33 more)

### Community 28 - "progress.ts"
Cohesion: 0.05
Nodes (60): zod, DELETE, dynamic, GET, PATCH, POST, PUT, runtime (+52 more)

### Community 29 - "use-workspace-data.ts"
Cohesion: 0.07
Nodes (46): DateRangeFilter(), SCOPES, AttemptPageParams, useAttemptsByIds(), EMPTY_ATTEMPTS, useWorkspaceData(), useDebouncedValue(), ATTEMPT_SORT_KEYS (+38 more)

### Community 30 - "Study Plan Progress APIs"
Cohesion: 0.13
Nodes (26): analyze(), average(), buildWhereYouStand(), comparePoints(), deepDiveFor(), DeepDiveSubject, derivedSectionPoint(), explicitSectionPoint() (+18 more)

### Community 31 - "ai-prompt-security.test.ts"
Cohesion: 0.23
Nodes (23): AuthControl(), AuthControlProps, AuthError(), ExamSwitcher(), BulkBar(), TaskRow(), filterCount(), MenuOption() (+15 more)

### Community 32 - "plan-day-view.tsx"
Cohesion: 0.08
Nodes (23): LANDING_PLAN, plan, buildLandingPlan(), category(), isMock(), LandingPlanDay, LandingPlanTask, RawDay (+15 more)

### Community 33 - "Button"
Cohesion: 0.11
Nodes (27): Migration roadmap (executed order), lucide-react, PersonalCalendar(), personalMonthRange(), categoryMeta(), Group, GroupRow(), KanbanBoard() (+19 more)

### Community 34 - "credentials.ts"
Cohesion: 0.16
Nodes (25): DELETE, GET, PUT, runtime, dynamic, GET(), runtime, aiConfig() (+17 more)

### Community 35 - "Score Observatory verification"
Cohesion: 0.06
Nodes (61): GET, idSchema, kindSchema, runtime, POST, runtime, POST, runtime (+53 more)

### Community 36 - "shortDate"
Cohesion: 0.24
Nodes (20): AgendaGroups(), AgendaView(), EarlierRanges(), CalendarMetrics(), categoryLabel(), QuietDays(), CellRow(), planTickClass() (+12 more)

### Community 37 - "ai-chat-sheet.tsx"
Cohesion: 0.17
Nodes (18): AiSheetTaskApi, ChatHistoryPanel(), CoachChatTab(), CoachMemo(), CoachMemos(), CoachUserTurn(), inlineNodes(), LogMockTab() (+10 more)

### Community 38 - "compare-view.tsx"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 39 - "exams-panel.tsx"
Cohesion: 0.10
Nodes (39): CustomExamDialog(), describeTier(), ExamRow(), ExamsPanel(), maxOf(), SourceSummary, StageSummary, SUBJECT_CHOICES (+31 more)

### Community 40 - "Button"
Cohesion: 0.10
Nodes (15): ws@^8.22.0, ws, logs, pending, target, ws, args, logs (+7 more)

### Community 41 - "app/layout.tsx"
Cohesion: 0.09
Nodes (19): @fontsource-variable/dm-sans@^5.3.0, @fontsource-variable/source-serif-4@^5.3.1, next-themes@^0.4.6, @vercel/analytics@^2.0.1, @vercel/speed-insights@^2.0.0, @fontsource-variable/dm-sans, @fontsource-variable/source-serif-4, next-themes (+11 more)

### Community 42 - "form.tsx"
Cohesion: 0.13
Nodes (18): class-variance-authority@^0.7.1, @radix-ui/react-label@^2.1.17, @radix-ui/react-slot@^1.5.0, class-variance-authority, @radix-ui/react-label, @radix-ui/react-slot, FormControl, FormDescription (+10 more)

### Community 43 - "format.ts"
Cohesion: 0.26
Nodes (11): NumberField, ResultEditor(), fill(), totals(), fillFromAttempt(), isLoggableType(), matchAttemptForTask(), namesMatch() (+3 more)

### Community 44 - "api"
Cohesion: 0.12
Nodes (15): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+7 more)

### Community 45 - "requireUser"
Cohesion: 0.12
Nodes (15): jobs, validate, name, permissions, contents, run, uses, with (+7 more)

### Community 46 - "connection-input.ts"
Cohesion: 0.07
Nodes (55): maxDuration, POST, runtime, maxDuration, runtime, AiConfig, DEFAULT_AI_BASE_URL, Env (+47 more)

### Community 47 - "reminders-panel.tsx"
Cohesion: 0.12
Nodes (18): motion, pageEnter, saveBarSpring, staggerContainer, staggerItem, switchBounce, tabSwap, tapSpring (+10 more)

### Community 48 - "extraction.ts"
Cohesion: 0.12
Nodes (27): ExtractionReview(), update(), updateSubject(), FieldIssues(), NullableDuration(), optionalNumber(), blankExtractedSubject(), deriveCounts() (+19 more)

### Community 49 - "my-tasks-view.tsx"
Cohesion: 0.07
Nodes (49): GET, maxDuration, POST, runtime, GET, POST, runtime, privateHeaders (+41 more)

### Community 50 - "Dashboard and Outcome Visual References"
Cohesion: 0.12
Nodes (30): AddMockView(), LogMockPayload, AiCoachCard(), AppHeaderProps, VIEW_META, useExamScope(), ScopeFilters(), viewTransition() (+22 more)

### Community 51 - "Continuous Integration Validation Workflow"
Cohesion: 0.20
Nodes (8): Multi-Theme System (data-palette x data-style), Palettes x Styles Theme Matrix, Typography Scale (Source Serif 4 + DM Sans), Missing Radius System Finding, Elevation Model and --shadow-pop Token, Restrained Motion Language, Tokenized Radius Scale (panel/control/card/pill), Sticky Identity Column for Mock History

### Community 52 - "cn"
Cohesion: 0.18
Nodes (9): args, evaluate(), height, pending, report, send(), target, width (+1 more)

### Community 53 - "fixtures.ts"
Cohesion: 0.11
Nodes (27): AttemptInput, buildAttempt(), FULL_ROWS, LANDING_ATTEMPTS, LANDING_FULL_MOCKS, LANDING_LATEST, LANDING_SCOPES, LANDING_SUMMARY (+19 more)

### Community 54 - "devDependencies"
Cohesion: 0.08
Nodes (33): devDependencies, eslint@^9.0.0, eslint-config-next@^16.0.0, prettier@^3.9.10, prisma@7.10.1, tailwindcss@^4.0.0, @tailwindcss/postcss@^4.0.0, @tanstack/react-query-devtools@^5.105.0 (+25 more)

### Community 55 - "sections.tsx"
Cohesion: 0.20
Nodes (10): Request and Ownership Architecture, Neon Agent Tooling Setup (Codex plugin + MCP), Expiring QA Branch Migration Rehearsal, Selected Neon Environment (org/project/branch), Private-Accounts Migration (claim two shared mocks), Session-Derived Ownership Model, Isolation and Ownership Verification, Google Sign-In via Neon Auth OAuth (+2 more)

### Community 56 - "theme-style-provider.tsx"
Cohesion: 0.17
Nodes (12): scripts, build, check, db:generate, db:migrate, dev, lint, postinstall (+4 more)

### Community 57 - "mock-entry.test.ts"
Cohesion: 0.16
Nodes (25): DurationInput(), change(), formatParts(), blankSubject(), defaultTierId(), fullMockSectionHeading(), meritSubjectIds(), MockForm() (+17 more)

### Community 58 - "trash-view.tsx"
Cohesion: 0.20
Nodes (9): Confirmed requirements, Dated personal todos and AI-assisted planning, Existing foundation, Finalized navigation and lifecycle, Phase 1 — Design the dated planner and review flow, Phase 2 — Extend task storage and manual workflows, Phase 3 — Add AI proposal and confirmed-apply workflows, Phase 4 — Validate and document (+1 more)

### Community 59 - "trash-view.tsx"
Cohesion: 0.18
Nodes (24): AttemptPagination, windowedPages(), KindFilter, messageOf(), rowKey(), toItemRef(), TrashView(), ungroupedCount() (+16 more)

### Community 60 - "client-types.ts"
Cohesion: 0.25
Nodes (5): Dashboard Analytical Scopes (full/subject/sectional/all), Backup Format v2 and Account Transfer, Semantic Chart Palette and Chart Rules, Core Product Workflows, JSON Backup Format Version 2

### Community 61 - "private-workspace.tsx"
Cohesion: 0.20
Nodes (13): dynamic, WorkspaceLayout(), GuardLedgerRow(), GuardNotice(), GuardNoticeProps, GuardRow, GuardStyles(), GuardTone (+5 more)

### Community 62 - "calendar-view.tsx"
Cohesion: 0.08
Nodes (40): DuotoneTile(), CalendarSurface(), CalendarToolbar(), LayerToggles(), CalendarLegend(), PeriodNav(), stepSize(), UNIT (+32 more)

### Community 63 - "targets-panel.tsx"
Cohesion: 0.17
Nodes (21): Reveal(), RevealItem(), targetsSchema(), RemindersPanel(), useOptionalSettingsGuard(), usePanelDraft(), ActiveTargetCard(), DefaultRow() (+13 more)

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
Cohesion: 0.19
Nodes (24): DayActions, DaySections(), AttemptEntryRow(), entryPlanRow(), PersonalEntryRow(), PlanEntryRow(), RevisionEntryRow(), SectionHead() (+16 more)

### Community 71 - "context.ts"
Cohesion: 0.19
Nodes (14): AiContext, average(), buildAiContext(), fullMockProfile(), payload(), recentFullMock(), sectionProfile(), subjectProfile() (+6 more)

### Community 72 - "sheet.tsx"
Cohesion: 0.15
Nodes (22): AiChatSheet(), Masthead(), onScroll(), read(), NAV, TodoAiComposer(), duplicateWarning(), proposedValue() (+14 more)

### Community 73 - "client-types.ts"
Cohesion: 0.07
Nodes (46): ChatHistoryApi, INSIGHT_REQUEST_TEXT, insightToChatText(), newId(), trimChatHistory(), useAiWorkspace(), chatBaseForSend(), AiConfigSource (+38 more)

### Community 74 - "query-client.ts"
Cohesion: 0.43
Nodes (6): QueryProvider(), getQueryClient(), makeQueryClient(), NO_RETRY_STATUSES, retryDelay(), shouldRetry()

### Community 75 - "icon.tsx"
Cohesion: 0.25
Nodes (12): DuoGlyph(), DuoIcon, DuotoneIcon(), IconEntry, ICONS, IconTone, resolveIcon(), BackupPreviewCard() (+4 more)

### Community 89 - "api"
Cohesion: 0.09
Nodes (38): Client State Architecture Audit — 2026-10-31, Design decisions, Findings, Standing gaps (out of scope, recorded), @tanstack/react-query, apply(), useToast(), EMPTY_TASKS (+30 more)

### Community 139 - "Add Mock Route"
Cohesion: 0.14
Nodes (27): CompareScreen(), delta(), duration(), accuracyTone(), ChipTone, MockChip(), MockStat(), formatDuration() (+19 more)

### Community 140 - "MyTasksView"
Cohesion: 0.07
Nodes (36): ApplyOp, ConfirmState, MyTasksView(), bulkRescheduleApply(), bulkStatus(), bulkTrashSelected(), clearSelection(), createTask() (+28 more)

### Community 141 - "Mock Comparison Route"
Cohesion: 0.05
Nodes (77): @radix-ui/react-dialog@^1.3.1, @radix-ui/react-dialog, collectCursors(), GET, runtime, NAV_GROUPS, planHref(), CommandPalette() (+69 more)

### Community 142 - "ref_node_assert"
Cohesion: 0.07
Nodes (27): filterAttempts(), targetMarks(), Marking, SubjectResult, attemptSchema, input, AttemptSeed, MARKING (+19 more)

### Community 143 - "compare-view.tsx"
Cohesion: 0.14
Nodes (30): accuracyTone(), AttemptTotals, comparablePercentage(), Delta(), scoreBarTone(), totalsFor(), typeChip(), buildComparison() (+22 more)

### Community 144 - "react"
Cohesion: 0.20
Nodes (7): radix-ui, react, CollapsibleContent, RadioGroup, RadioGroupItem, ScrollArea, ScrollBar

### Community 145 - "verify-backup-transfer.mjs"
Cohesion: 0.09
Nodes (24): api(), backup(), cookies, preview(), raw(), replace(), settings, api() (+16 more)

### Community 146 - "about-panel.tsx"
Cohesion: 0.31
Nodes (8): AboutPanel(), Avatar, AvatarFallback, AvatarImage, Badge(), BadgeProps, badgeVariants, CATALOG_VERSION

### Community 147 - "ref_node_fs"
Cohesion: 0.20
Nodes (4): packageDir, REPLACEMENTS, targets, root

### Community 148 - "toast.tsx"
Cohesion: 0.29
Nodes (7): Toast, ToastApi, ToastCard(), ToastContext, ToastTone, ToastViewport(), TONE_STYLES

### Community 149 - "next"
Cohesion: 0.29
Nodes (3): next, metadata, metadata

### Community 151 - "google-sign-in-button.tsx"
Cohesion: 0.14
Nodes (13): @neondatabase/auth@0.7.0-beta, @neondatabase/auth, useAuthActions(), signIn(), GoogleGlyph(), GoogleSignInButton(), signIn(), GoogleSignInButtonProps (+5 more)

### Community 155 - "Paper Tokens and Design Handover"
Cohesion: 0.20
Nodes (9): args, evaluate(), pending, send(), target, url, wait, widths (+1 more)

### Community 157 - "view-model.ts"
Cohesion: 0.11
Nodes (27): PageHeader(), MonthCell(), MonthGrid, WEEKDAYS, TASK_LEGEND, PlanErrorCard(), PlanWeekView(), WeekRow() (+19 more)

### Community 158 - "format.ts"
Cohesion: 0.10
Nodes (28): AttemptOutcomeCard(), AttemptRecordCard(), outcomes, percent(), ScoreRing(), subjectIcons, tierSuffix(), DayNotes() (+20 more)

### Community 160 - "Pooled Vercel Runtime"
Cohesion: 0.40
Nodes (4): cspDev, cspProduction, nextConfig, productionHeaders

### Community 169 - "ai-prompt-security.test.ts"
Cohesion: 0.07
Nodes (43): MAX_TODO_PROMPT_CHARS, chatMessages(), coachMessages(), contextBlock(), extractionMessages(), FALLBACK_SHAPE, marksFor(), paperLabel() (+35 more)

## Ambiguous Edges - Review These
- `Stack Inventory (Next 16.4.3, React 19.2, TS 5.9, Tailwind 4, Recharts 3, motion 12)` → `Private Accounts Release Notes`  [AMBIGUOUS]
  docs/ui-overhaul/phase-1-audit.md · relation: conceptually_related_to

## Knowledge Gaps
- **36 isolated node(s):** `RFC-1918`, `Analytics Projections Cache Policy (/api/analytics)`, `force-dynamic Public Auth-Adjacent Pages`, `Health Endpoint Rate-Limit-Exempt (/api/health)`, `Firebase/Mongo Runtime Dependencies Removed` (+31 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1031 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **76 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Request Proxy and Public Origins` to `PlainIcon`, `ai-composer.tsx`, `ai-settings-form.tsx`, `calendar-view.tsx`, `Add Mock Route`, `MyTasksView`, `Mock Comparison Route`, `personal-task-drawer.tsx`, `compare-view.tsx`, `ai-composer.tsx`, `react`, `about-panel.tsx`, `Mock Entry Form and Validation`, `use-workspace-data.ts`, `format.ts`, `view-model.ts`, `ai-prompt-security.test.ts`, `Button`, `shortDate`, `ai-chat-sheet.tsx`, `exams-panel.tsx`, `form.tsx`, `reminders-panel.tsx`, `Dashboard and Outcome Visual References`, `fixtures.ts`, `trash-view.tsx`, `calendar-view.tsx`, `targets-panel.tsx`, `ai/todos/route.ts`, `sheet.tsx`, `icon.tsx`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **What connects `RFC-1918`, `Analytics Projections Cache Policy (/api/analytics)`, `force-dynamic Public Auth-Adjacent Pages` to the rest of the system?**
  _36 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `PlainIcon` be split into smaller, more focused modules?**
  _Cohesion score 0.1276595744680851 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `PlainIcon`, `ai-composer.tsx`, `subject-performance.test.ts`, `ai-settings-form.tsx`, `calendar-view.tsx`, `Add Mock Route`, `MyTasksView`, `Mock Comparison Route`, `personal-task-drawer.tsx`, `compare-view.tsx`, `ai-composer.tsx`, `Setup and Operations Handbook`, `about-panel.tsx`, `Mock Entry Form and Validation`, `toast.tsx`, `queries/exams.ts`, `google-sign-in-button.tsx`, `Request Proxy and Public Origins`, `view-model.ts`, `format.ts`, `ai-prompt-security.test.ts`, `use-workspace-data.ts`, `Button`, `shortDate`, `ai-chat-sheet.tsx`, `exams-panel.tsx`, `app/layout.tsx`, `form.tsx`, `format.ts`, `reminders-panel.tsx`, `extraction.ts`, `Dashboard and Outcome Visual References`, `fixtures.ts`, `devDependencies`, `mock-entry.test.ts`, `trash-view.tsx`, `private-workspace.tsx`, `calendar-view.tsx`, `targets-panel.tsx`, `ai/todos/route.ts`, `sheet.tsx`, `client-types.ts`, `query-client.ts`, `icon.tsx`, `api`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Should `ai-composer.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09851551956815115 - nodes in this community are weakly interconnected._
- **Why does `next` connect `next` to `PlainIcon`, `subject-performance.test.ts`, `calendar-view.tsx`, `Mock Comparison Route`, `ai-composer.tsx`, `lib/trash.ts`, `readBody`, `Request Proxy and Public Origins`, `progress.ts`, `use-workspace-data.ts`, `format.ts`, `view-model.ts`, `Pooled Vercel Runtime`, `app/layout.tsx`, `Dashboard and Outcome Visual References`, `devDependencies`, `private-workspace.tsx`, `calendar-view.tsx`, `ai/todos/route.ts`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Stack Inventory (Next 16.4.3, React 19.2, TS 5.9, Tailwind 4, Recharts 3, motion 12)` and `Private Accounts Release Notes`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._