# Graph Report - ssc-insight-2  (2026-11-21)

## Corpus Check
- 497 files · ~359,952 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 4, .css 2, .example 1)

## Summary
- 3698 nodes · 11736 edges · 173 communities (105 shown, 68 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 143 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `30f69a0f`
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
- chat-composer.tsx
- trash-view.tsx
- workspace-chrome.tsx
- provider.ts
- score-forecast.ts
- api.ts
- Request Proxy and Public Origins
- email-client.ts
- next
- Study Plan Progress APIs
- exam-switcher.tsx
- plan-facts.ts
- rate-limit.ts
- credentials.ts
- Score Observatory verification
- performance-view.tsx
- film-section.tsx
- compare-view.tsx
- cn
- Button
- app/layout.tsx
- RouteSkeleton
- result-editor.tsx
- api
- requireUser
- connection-input.ts
- RouteError
- extraction.ts
- config-core.ts
- queries/exams.ts
- Continuous Integration Validation Workflow
- cn
- calendar-view.tsx
- devDependencies
- sections.tsx
- theme-style-provider.tsx
- mock-form.tsx
- trash-view.tsx
- progress.ts
- client-types.ts
- private-workspace.tsx
- calendar-view.tsx
- react
- shot.mjs
- Caching and Revalidation Policy
- client-types.ts
- plan-day-view.tsx
- exams-panel.tsx
- motion
- conversations.ts
- requireUser
- utils.ts
- verify-backup-transfer.mjs
- api
- next.config.ts
- Todo API Review and Ownership
- ai-chat-sheet.tsx
- ai-composer.tsx
- data-parts.tsx
- Folder-Based Routing and Upstash Rate Limiting — Design
- performance/page.tsx
- subject-deep-dive.tsx
- rate-limit-upstash.ts
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
- ownership.test.ts
- compare-view.tsx
- verify-backup-transfer.mjs
- ai.ts
- filters-url.ts
- models/route.ts
- ask-view.tsx
- formatNumber
- security-panel.tsx
- Panel
- prisma
- use-ai-workspace.tsx
- ndjson.ts
- Paper Tokens and Design Handover
- useToast
- ProviderStreamDecoder
- shortDate
- rate-limit-budget.ts
- chrome.tsx
- attempt-sort.ts
- next.config.ts
- ref_node_test
- TokenBucketRateLimiter
- vercel.json
- explain-search.ts
- verify-ownership.mjs
- verify-trash.mjs
- ai-prompt-security.test.ts
- Folder-Based Routing and Upstash Rate Limiting — Implementation Plan
- require-user.ts

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

## Communities (173 total, 68 thin omitted)

### Community 0 - "calendar-entries.ts"
Cohesion: 0.08
Nodes (40): AgendaGroups(), AgendaView(), EarlierRanges(), CalendarMetrics(), CalendarSurface(), QuietDays(), MetricCell(), addToCounts() (+32 more)

### Community 1 - "my-tasks-view.tsx"
Cohesion: 0.06
Nodes (41): ApplyOp, ConfirmState, MyTasksView(), bulkRescheduleApply(), bulkStatus(), bulkTrashSelected(), clearSelection(), createTask() (+33 more)

### Community 2 - "view-model.ts"
Cohesion: 0.12
Nodes (28): categoryLabel(), CellRow(), MonthCell(), MonthGrid, WEEKDAYS, planTickClass(), CompactRow(), DayTicks() (+20 more)

### Community 4 - "command-palette.tsx"
Cohesion: 0.06
Nodes (45): AI Status Endpoint Cache Policy (/api/ai/status), Analytics Projections Cache Policy (/api/analytics), api() Client Fetch cache: no-store (src/lib/api-client.ts), Backup Export Raw File Exception (GET /api/backup), Next.js 16 Cache Components Not Enabled, Caching and Revalidation Policy (Phase 8 reference), Filters/Scope URL State Mirror (src/lib/filters-url.ts), force-dynamic Public Auth-Adjacent Pages (+37 more)

### Community 7 - "subject-performance.test.ts"
Cohesion: 0.04
Nodes (67): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, cmdk@^1.1.1, @duo-icons/react@^1.0.1, @hookform/resolvers@^5.9.2, lucide-react@^0.468.0, motion@^12.0.0 (+59 more)

### Community 8 - "ai-settings-form.tsx"
Cohesion: 0.07
Nodes (34): @hookform/resolvers, react-hook-form, AiSettingsForm(), chooseProvider(), fetchModels(), patchFields(), payloadFrom(), test() (+26 more)

### Community 10 - "calendar-view.tsx"
Cohesion: 0.16
Nodes (25): DuotoneIcon(), DuotoneTile(), InkArt(), Faq(), FAQ_ITEMS, FilmSection(), Landing(), LandingError() (+17 more)

### Community 11 - "app-shell.tsx"
Cohesion: 0.12
Nodes (31): GET, runtime, DELETE, GET, POST, runtime, applyTodos(), calendarCounts() (+23 more)

### Community 14 - "personal-task-drawer.tsx"
Cohesion: 0.12
Nodes (27): AskRoute(), AskView(), FOLLOW_UPS, DayDrawer(), DayLedgerProps, blankTask(), PersonalTaskDrawer(), TaskEditorLoader() (+19 more)

### Community 15 - "Setup and Operations Handbook"
Cohesion: 0.03
Nodes (100): attemptData(), attemptInclude, attemptWhere(), mapSubjects(), StoredAnalyticsAttempt, StoredAttempt, toAnalyticsAttempt(), toAttempt() (+92 more)

### Community 16 - "ai-composer.tsx"
Cohesion: 0.12
Nodes (40): EmptyChart(), AttemptBreakdown(), BreakdownDonut(), DeepDive(), GroupedScoreBars(), InsightCallout(), paperMax(), PerformanceOverview (+32 more)

### Community 17 - "lib/trash.ts"
Cohesion: 0.14
Nodes (24): GET(), accessLog(), AccessLogEvent, bypassesMaintenance(), classifyPath(), EnvLike, isCronPath(), maintenanceActive() (+16 more)

### Community 18 - "RequestError"
Cohesion: 0.05
Nodes (90): Baseline architecture, Call-site inventory (39 total), zod, GET, runtime, GET, maxDuration, POST (+82 more)

### Community 19 - "Mock Entry Form and Validation"
Cohesion: 0.13
Nodes (21): AppearancePanel(), PaletteChip(), StyleGlyph(), initialPalette(), initialStyle(), PALETTE_IDS, PALETTE_STORAGE_KEY, PaletteId (+13 more)

### Community 20 - "exam-settings.ts"
Cohesion: 0.04
Nodes (97): GET, GET, PATCH, preferencesSchema, runtime, scopePayload(), settingsSchema, targetEditSchema (+89 more)

### Community 21 - "chat-composer.tsx"
Cohesion: 0.29
Nodes (8): ChatComposer(), attach(), downscaleToDataUrl(), IMAGE_MAX_EDGE, IMAGE_QUALITY, isImageFile(), MAX_ATTACHED_IMAGES, prepareImages()

### Community 22 - "trash-view.tsx"
Cohesion: 0.14
Nodes (13): args, evaluate(), height, pending, problems, report, send(), settle (+5 more)

### Community 23 - "workspace-chrome.tsx"
Cohesion: 0.24
Nodes (12): The layout keeps only what must survive navigation, dynamic, WorkspaceLayout(), QueryProvider(), ToastProvider(), useAiWorkspace(), Handlers, useKeyboardShortcuts() (+4 more)

### Community 24 - "provider.ts"
Cohesion: 0.11
Nodes (41): aiAborted(), aiInvalidOutput(), aiOutputIncomplete(), aiRefused(), aiTimeout(), AiContentPart, AiProvider, AiStructuredFormat (+33 more)

### Community 25 - "score-forecast.ts"
Cohesion: 0.12
Nodes (25): Accuracy Footer Divisor Column (83.3% Accuracy), Marks Obtained (70/90) and Score Strip, Outcome Card Illustration (Reasoning), Outcome Counts with Proportion Bars (Correct / Incorrect / Unattempted), Percentile Availability Note ('No standalone subject percentile recorded'), Score-Centered Answer Distribution Ring (77.8% SCORE), Serif Subject Heading with Attempt/Question Subtitle, Soft-Rounded Warm Paper Card Surface (+17 more)

### Community 26 - "api.ts"
Cohesion: 0.06
Nodes (77): Task 5: Wire the limiter into the request path, bodySchema, maxDuration, POST(), runtime, COACH_FORMAT, maxDuration, POST() (+69 more)

### Community 27 - "Request Proxy and Public Origins"
Cohesion: 0.10
Nodes (38): ActiveExamFooterNote(), AppFrame(), AppHeader(), AppHeaderProps, AppSidebar(), HeaderLocation(), NavItem(), VIEW_META (+30 more)

### Community 28 - "email-client.ts"
Cohesion: 0.14
Nodes (29): readSecurityUser(), SecurityUser, useAuthSecurity(), authClient, AuthFailureReason, authGet(), authPost(), AuthSessionRow (+21 more)

### Community 29 - "next"
Cohesion: 0.08
Nodes (37): next, metadata, metadata, AddMockView(), AddRouteInner(), CalendarRoute(), CompareRoute(), DashboardRoute() (+29 more)

### Community 30 - "Study Plan Progress APIs"
Cohesion: 0.10
Nodes (31): subjectProfile(), analyze(), average(), buildWhereYouStand(), comparePoints(), deepDiveFor(), derivedSectionPoint(), explicitSectionPoint() (+23 more)

### Community 31 - "exam-switcher.tsx"
Cohesion: 0.27
Nodes (19): BulkBar(), MenuOption(), TaskToolbar(), TrashRow(), AuthControl(), AuthControlProps, AuthError(), useAuthActions() (+11 more)

### Community 32 - "plan-facts.ts"
Cohesion: 0.16
Nodes (13): LANDING_PLAN, plan, buildLandingPlan(), category(), isMock(), LandingPlanDay, LandingPlanTask, RawDay (+5 more)

### Community 33 - "rate-limit.ts"
Cohesion: 0.13
Nodes (22): apiRateLimiter, Bucket, clientIp(), BudgetState, decideRateLimit(), describeDecision(), L2_TIMEOUT_MS, L2_WINDOW (+14 more)

### Community 34 - "credentials.ts"
Cohesion: 0.20
Nodes (21): DELETE, GET, PUT, runtime, isAiThinking(), sameCredentialTarget(), AiCredentialInput, AiCredentialSummary (+13 more)

### Community 35 - "Score Observatory verification"
Cohesion: 0.07
Nodes (53): GET, idSchema, kindSchema, runtime, POST, runtime, POST, runtime (+45 more)

### Community 36 - "performance-view.tsx"
Cohesion: 0.09
Nodes (37): DistributionPanel(), PAD, FindingsPanel(), points(), sentence(), TONE_ICON, TONE_TEXT, PerformanceView() (+29 more)

### Community 37 - "film-section.tsx"
Cohesion: 0.12
Nodes (27): attemptMeritPercentage(), CHAPTERS, COACH_ANSWER, CountNumber(), FILM_GAP_PTS, FILM_METRICS, FILM_PCT_DELTA, FILM_SUBJECT_BARS (+19 more)

### Community 38 - "compare-view.tsx"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 39 - "cn"
Cohesion: 0.07
Nodes (43): PlanCategoryLegend(), AttemptPagination, windowedPages(), FloatingInk(), MockTable(), AvatarImage, DialogFooter(), FormControl (+35 more)

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
Cohesion: 0.13
Nodes (18): ResultEditor(), fill(), weekdayDateLabel(), istClock, istDateKey(), istDayKey, longDay, monthDay (+10 more)

### Community 44 - "api"
Cohesion: 0.12
Nodes (15): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+7 more)

### Community 45 - "requireUser"
Cohesion: 0.12
Nodes (15): jobs, validate, name, permissions, contents, run, uses, with (+7 more)

### Community 46 - "connection-input.ts"
Cohesion: 0.11
Nodes (27): AI_THINKING_VALUES, AiCredentialInput, connectionFields, connectionPolicy(), normaliseAiConnectionInput(), NormalisedConnection, RawConnection, rawConnectionSchema (+19 more)

### Community 47 - "RouteError"
Cohesion: 0.15
Nodes (14): AddError(), AskError(), CalendarError(), CompareError(), DashboardError(), HistoryError(), MyTasksError(), PerformanceError() (+6 more)

### Community 48 - "extraction.ts"
Cohesion: 0.12
Nodes (26): ExtractionReview(), update(), updateSubject(), FieldIssues(), NullableDuration(), optionalNumber(), blankExtractedSubject(), deriveCounts() (+18 more)

### Community 49 - "config-core.ts"
Cohesion: 0.13
Nodes (25): maxDuration, POST, PROBE_MESSAGES, runtime, AI_THINKING_LEVELS, AiConfig, AiThinking, DEFAULT_AI_BASE_URL (+17 more)

### Community 50 - "queries/exams.ts"
Cohesion: 0.13
Nodes (20): ExamScope, ExamScopeContext, ExamScopeProvider(), tierLabelFallback(), activeExamPattern(), CustomExamDto, CustomExamInput, CustomTierDto (+12 more)

### Community 51 - "Continuous Integration Validation Workflow"
Cohesion: 0.20
Nodes (8): Multi-Theme System (data-palette x data-style), Palettes x Styles Theme Matrix, Typography Scale (Source Serif 4 + DM Sans), Missing Radius System Finding, Elevation Model and --shadow-pop Token, Restrained Motion Language, Tokenized Radius Scale (panel/control/card/pill), Sticky Identity Column for Mock History

### Community 52 - "cn"
Cohesion: 0.18
Nodes (9): args, evaluate(), height, pending, report, send(), target, width (+1 more)

### Community 53 - "calendar-view.tsx"
Cohesion: 0.14
Nodes (25): CalendarLegend(), stepSize(), CalendarLoading(), CalendarView(), currentPath(), MemoMonthGrid, MemoWeekView, monthMeta() (+17 more)

### Community 54 - "devDependencies"
Cohesion: 0.07
Nodes (29): devDependencies, eslint@^9.0.0, eslint-config-next@^16.0.0, prettier@^3.9.10, react-is@^19.3.1, tailwindcss@^4.0.0, @tailwindcss/postcss@^4.0.0, @tanstack/react-query-devtools@^5.105.0 (+21 more)

### Community 55 - "sections.tsx"
Cohesion: 0.20
Nodes (10): Request and Ownership Architecture, Neon Agent Tooling Setup (Codex plugin + MCP), Expiring QA Branch Migration Rehearsal, Selected Neon Environment (org/project/branch), Private-Accounts Migration (claim two shared mocks), Session-Derived Ownership Model, Isolation and Ownership Verification, Google Sign-In via Neon Auth OAuth (+2 more)

### Community 56 - "theme-style-provider.tsx"
Cohesion: 0.17
Nodes (12): scripts, build, check, db:generate, db:migrate, dev, lint, postinstall (+4 more)

### Community 57 - "mock-form.tsx"
Cohesion: 0.06
Nodes (55): DurationInput(), change(), formatParts(), blankSubject(), defaultTierId(), fullMockSectionHeading(), meritSubjectIds(), MockForm() (+47 more)

### Community 58 - "trash-view.tsx"
Cohesion: 0.20
Nodes (9): Confirmed requirements, Dated personal todos and AI-assisted planning, Existing foundation, Finalized navigation and lifecycle, Phase 1 — Design the dated planner and review flow, Phase 2 — Extend task storage and manual workflows, Phase 3 — Add AI proposal and confirmed-apply workflows, Phase 4 — Validate and document (+1 more)

### Community 59 - "progress.ts"
Cohesion: 0.11
Nodes (20): GET, POST, runtime, createPersonalTask(), personalTaskCategories, PersonalTaskCreate, personalTaskPriorities, personalTaskStatuses (+12 more)

### Community 60 - "client-types.ts"
Cohesion: 0.25
Nodes (5): Dashboard Analytical Scopes (full/subject/sectional/all), Backup Format v2 and Account Transfer, Semantic Chart Palette and Chart Rules, Core Product Workflows, JSON Backup Format Version 2

### Community 61 - "private-workspace.tsx"
Cohesion: 0.25
Nodes (10): GuardLedgerRow(), GuardNotice(), GuardNoticeProps, GuardRow, GuardStyles(), GuardTone, PrivateWorkspace(), PrivateWorkspaceProps (+2 more)

### Community 62 - "calendar-view.tsx"
Cohesion: 0.11
Nodes (28): AssistantBody(), ChatTranscript(), ChatTranscriptProps, EditButton(), ReasoningTrace(), TurnActions, TurnActionsProps, CopyButton() (+20 more)

### Community 63 - "react"
Cohesion: 0.18
Nodes (22): BackupPreviewCard(), DataPanel(), Reveal(), RevealItem(), ActiveTargetCard(), DefaultRow(), describeSignature(), PercentileExplainer() (+14 more)

### Community 64 - "shot.mjs"
Cohesion: 0.40
Nodes (6): Known Limitations (duo-icons fill-rule, native inputs), Design System Source-of-Truth Map, Icon Inconsistency Finding (14 ad-hoc sizes), Icon Size Scale (14/16/18/22/28), Named Imports for Bundle Reduction, Raw Lucide Imports Migrated into Semantic Icon Map

### Community 68 - "Caching and Revalidation Policy"
Cohesion: 0.50
Nodes (5): WorkspaceShell Client Orchestrator and Its Three Hooks, dashboard.tsx Monolith Split Finding, UI Baseline Audit Findings (26 prioritized items), 15-Phase Execution Order, Unified Segmented Control (.segment-group)

### Community 69 - "client-types.ts"
Cohesion: 0.13
Nodes (14): AiConfigSource, AiCredentialSummary, AiModelsResponse, AiResponseUsage, AiScreenContext, AiSettingsResponse, AiSourceState, AiTestResponse (+6 more)

### Community 70 - "plan-day-view.tsx"
Cohesion: 0.11
Nodes (37): DayLedger(), EmptyActions(), LoadLine(), DayActions, DaySections(), AttemptEntryRow(), entryPlanRow(), PersonalEntryRow() (+29 more)

### Community 71 - "exams-panel.tsx"
Cohesion: 0.09
Nodes (48): CustomExamDialog(), describeTier(), ExamRow(), ExamsPanel(), maxOf(), SourceSummary, StageSummary, SUBJECT_CHOICES (+40 more)

### Community 72 - "motion"
Cohesion: 0.17
Nodes (14): motion, GoogleSignInButton(), CountUp(), Petals, PetalSpec, TypedLine(), EmailAuthButton(), Hero() (+6 more)

### Community 73 - "conversations.ts"
Cohesion: 0.21
Nodes (14): CONVERSATIONS_STORAGE_KEY, isRole(), loadConversations(), MAX_CONVERSATION_MESSAGES, MAX_CONVERSATIONS, newConversationId(), parseConversation(), parseMessage() (+6 more)

### Community 74 - "requireUser"
Cohesion: 0.11
Nodes (51): Task 7: RSC foundation, Tasks 8–19: Route migrations, @tanstack/react-query, GET, GET, GET, runtime, AddRoute() (+43 more)

### Community 75 - "utils.ts"
Cohesion: 0.12
Nodes (22): CalendarToolbar(), LayerToggles(), PeriodNav(), UNIT, AGENDA_WINDOW, CALENDAR_MODES, CalendarMode, LAYER_META (+14 more)

### Community 89 - "api"
Cohesion: 0.07
Nodes (42): remove(), TodoAiComposerInner(), apply(), duplicateWarning(), proposedValue(), EMPTY_TASKS, patchDayInPlan(), patchTaskInPlan() (+34 more)

### Community 124 - "ai-chat-sheet.tsx"
Cohesion: 0.08
Nodes (48): Client State Architecture Audit — 2026-10-31, Design decisions, Findings, Migration roadmap (executed order), Standing gaps (out of scope, recorded), AiPlanSheet(), TrashDetailSheet(), AiChatSheet() (+40 more)

### Community 125 - "ai-composer.tsx"
Cohesion: 0.14
Nodes (23): BoardView(), handleDrop(), columnFor(), COLUMNS, nextStatus(), PersonalTaskDisplayStatus, STATUS_META, StatusDot() (+15 more)

### Community 126 - "data-parts.tsx"
Cohesion: 0.10
Nodes (29): AttemptInput, buildAttempt(), FULL_ROWS, LANDING_ATTEMPTS, LANDING_FULL_MOCKS, LANDING_LATEST, LANDING_SCOPES, LANDING_SUMMARY (+21 more)

### Community 127 - "Folder-Based Routing and Upstash Rate Limiting — Design"
Cohesion: 0.14
Nodes (13): Architecture, Colocation rule, Decisions, Folder-Based Routing and Upstash Rate Limiting — Design, Goals, Invariants that must not move, Non-goals, Rate limiting (+5 more)

### Community 128 - "performance/page.tsx"
Cohesion: 0.21
Nodes (12): GET, runtime, dynamic, PerformancePage(), Filters, analyticsKeys, analyticsQueryOptions(), serializeAnalyticsParams() (+4 more)

### Community 129 - "subject-deep-dive.tsx"
Cohesion: 0.16
Nodes (20): accuracyTone(), DeepDiveCards(), PAD, SUBJECT_TOKENS, SubjectLineChart(), TONE_CLASS, AreaTrendChart(), PAD (+12 more)

### Community 130 - "rate-limit-upstash.ts"
Cohesion: 0.24
Nodes (15): BREAKER_OPEN_MS, BREAKER_THRESHOLD, BreakerState, initialBreaker(), isBreakerOpen(), onFailure(), onSuccess(), tickBreaker() (+7 more)

### Community 131 - "ssrf-core.ts"
Cohesion: 0.26
Nodes (11): RFC-1918, assertSafeBaseUrl(), assertSafeBaseUrlShape(), BLOCKED_HOSTNAMES, inV4Range(), ipv4Octets(), isBlockedAddress(), parseBaseUrl() (+3 more)

### Community 139 - "Add Mock Route"
Cohesion: 0.14
Nodes (29): BrowserFrame(), MockupCaption(), CompareScreen(), delta(), duration(), accuracyTone(), ChipTone, MockChip() (+21 more)

### Community 140 - "Button"
Cohesion: 0.15
Nodes (12): lucide-react, radix-ui, react, QuickAddBar(), AiCoachCard(), DeleteMockButton(), MockDetailDialog(), EmptyScopeNotice() (+4 more)

### Community 141 - "Mock Comparison Route"
Cohesion: 0.05
Nodes (73): collectCursors(), GET, runtime, NAV_GROUPS, planHref(), CommandPalette(), CommandPaletteProps, loadRecentSearches() (+65 more)

### Community 142 - "ownership.test.ts"
Cohesion: 0.36
Nodes (5): AccountUser, LookupResult, SessionError, verifiedUser(), attemptSchema

### Community 143 - "compare-view.tsx"
Cohesion: 0.11
Nodes (36): buildComparison(), buildSectionRows(), ChangeCell(), CompareReference, CompareView, Comparison, ComparisonLedger(), ComparisonRow (+28 more)

### Community 144 - "verify-backup-transfer.mjs"
Cohesion: 0.29
Nodes (8): api(), backup(), cookies, preview(), raw(), replace(), settings, user()

### Community 145 - "ai.ts"
Cohesion: 0.20
Nodes (10): AiActivity, clockLabel(), FEATURE_META, STATUS_DOT, AiStatus, AiActivityEntry, aiKeys, aiStatusQueryOptions (+2 more)

### Community 146 - "filters-url.ts"
Cohesion: 0.09
Nodes (28): Review Focus, Task 0: Toolchain and baseline, Task 1: Spec and plan documents, Task 20: Retire the shell, Task 21: Verification and documentation closeout, Task 2: Route, colocation and client-boundary guards, Task 3: Pure rate-limit policy, Task 4: Command budget and Upstash adapter (+20 more)

### Community 147 - "models/route.ts"
Cohesion: 0.21
Nodes (12): maxDuration, POST, runtime, AiConnectionInput, resolveDraftConnection(), AiModel, fetchModelCatalog(), ModelCatalogTarget (+4 more)

### Community 148 - "ask-view.tsx"
Cohesion: 0.31
Nodes (10): ConversationGroup, ConversationList, ConversationRow, groupConversations(), relativeLabel(), startOfDay(), startOfWeek(), ChatHistoryApi (+2 more)

### Community 149 - "formatNumber"
Cohesion: 0.13
Nodes (17): AttemptBreakdownPanel(), InsightCallout(), Axis, RadarPanel(), SUBJECT_TOKENS, BreakdownCounts, BreakdownDonut(), DonutLegend() (+9 more)

### Community 150 - "security-panel.tsx"
Cohesion: 0.11
Nodes (38): class-variance-authority, ChangePasswordDialog(), DisableTwoFactorDialog(), EnrollDialog(), EnrollStep, RegenerateCodesDialog(), close(), AuthPanelDialog() (+30 more)

### Community 151 - "Panel"
Cohesion: 0.19
Nodes (18): PersonalTasksPanel(), AboutPanel(), BouncingSwitch(), EMPTY_PREFERENCES, RemindersPanel(), initialsOf(), SecurityPanel(), SettingsBody() (+10 more)

### Community 153 - "use-ai-workspace.tsx"
Cohesion: 0.25
Nodes (12): AiWorkspace, AiWorkspaceContext, AiWorkspaceProvider(), INSIGHT_REQUEST_TEXT, insightToChatText(), newId(), trimChatHistory(), useAiWorkspaceState() (+4 more)

### Community 154 - "ndjson.ts"
Cohesion: 0.28
Nodes (5): AiChatEvent, ChatUsage, encoder, NdjsonDecoder, parseChatEvent()

### Community 155 - "Paper Tokens and Design Handover"
Cohesion: 0.20
Nodes (9): args, evaluate(), pending, send(), target, url, wait, widths (+1 more)

### Community 156 - "useToast"
Cohesion: 0.15
Nodes (14): SettingsRoute(), SettingsView(), useBackupImport(), GoogleGlyph(), GoogleSignInButtonProps, ERROR_COPY, Toast, ToastApi (+6 more)

### Community 158 - "shortDate"
Cohesion: 0.13
Nodes (34): Loading, error and not-found surfaces, DashboardPlanApi, PipelineProgressSection(), PipelineRevisionSection(), PipelineUpcomingSection(), PlanApi, PlanWithToday, ProgressRing() (+26 more)

### Community 159 - "rate-limit-budget.ts"
Cohesion: 0.49
Nodes (8): budgetState, checkBudget(), initialBudget(), nextBudget(), noteCommand(), resetBudgetForTests(), spendCommand(), BUDGET_CAPS

### Community 160 - "chrome.tsx"
Cohesion: 0.32
Nodes (7): signIn(), FloatingAsk(), RAIL_ITEMS, SectionRail(), onScroll(), read(), startGoogleSignIn()

### Community 161 - "attempt-sort.ts"
Cohesion: 0.33
Nodes (6): ASC_SORTERS, AttemptSortRow, buildAttemptStats(), monthSplit(), AttemptStats, SortKey

### Community 162 - "next.config.ts"
Cohesion: 0.40
Nodes (4): cspDev, cspProduction, nextConfig, productionHeaders

### Community 163 - "ref_node_test"
Cohesion: 0.10
Nodes (10): packageDir, REPLACEMENTS, targets, root, allSourceFiles(), APP, privateFiles(), ROOT (+2 more)

### Community 166 - "explain-search.ts"
Cohesion: 0.22
Nodes (6): @prisma/adapter-pg@^7.10.1, @prisma/adapter-pg, env, match, prisma, queries

### Community 167 - "verify-ownership.mjs"
Cohesion: 0.33
Nodes (6): api(), cookies, created, input, original, raw()

### Community 168 - "verify-trash.mjs"
Cohesion: 0.21
Nodes (10): api(), full, ids, raw(), api(), cookies, created, input (+2 more)

### Community 169 - "ai-prompt-security.test.ts"
Cohesion: 0.07
Nodes (44): MAX_TODO_PROMPT_CHARS, AiContext, average(), buildAiContext(), fullMockProfile(), payload(), recentFullMock(), sectionProfile() (+36 more)

### Community 171 - "Folder-Based Routing and Upstash Rate Limiting — Implementation Plan"
Cohesion: 0.40
Nodes (4): Baseline and environment facts (measured in Task 0), Folder-Based Routing and Upstash Rate Limiting — Implementation Plan, Global Constraints, Rulings carried into this plan

### Community 174 - "require-user.ts"
Cohesion: 0.12
Nodes (18): Context, devHandle(), handle(), privateNoStore, runtime, dynamic, LandingPage(), metadata (+10 more)

## Ambiguous Edges - Review These
- `Stack Inventory (Next 16.4.3, React 19.2, TS 5.9, Tailwind 4, Recharts 3, motion 12)` → `Private Accounts Release Notes`  [AMBIGUOUS]
  docs/ui-overhaul/phase-1-audit.md · relation: conceptually_related_to

## Knowledge Gaps
- **36 isolated node(s):** `RFC-1918`, `Analytics Projections Cache Policy (/api/analytics)`, `force-dynamic Public Auth-Adjacent Pages`, `Health Endpoint Rate-Limit-Exempt (/api/health)`, `Firebase/Mongo Runtime Dependencies Removed` (+31 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1133 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **68 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `calendar-entries.ts`, `my-tasks-view.tsx`, `view-model.ts`, `subject-deep-dive.tsx`, `ai-settings-form.tsx`, `calendar-view.tsx`, `Add Mock Route`, `Button`, `Mock Comparison Route`, `personal-task-drawer.tsx`, `compare-view.tsx`, `ai-composer.tsx`, `ai.ts`, `Mock Entry Form and Validation`, `ask-view.tsx`, `formatNumber`, `security-panel.tsx`, `Panel`, `chat-composer.tsx`, `Request Proxy and Public Origins`, `next`, `shortDate`, `exam-switcher.tsx`, `chrome.tsx`, `performance-view.tsx`, `film-section.tsx`, `RouteSkeleton`, `require-user.ts`, `calendar-view.tsx`, `calendar-view.tsx`, `react`, `plan-day-view.tsx`, `exams-panel.tsx`, `motion`, `utils.ts`, `api`, `ai-chat-sheet.tsx`, `ai-composer.tsx`, `data-parts.tsx`?**
  _High betweenness centrality (0.100) - this node is a cross-community bridge._
- **What connects `RFC-1918`, `Analytics Projections Cache Policy (/api/analytics)`, `force-dynamic Public Auth-Adjacent Pages` to the rest of the system?**
  _36 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `calendar-entries.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07764876632801161 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Button` to `calendar-entries.ts`, `my-tasks-view.tsx`, `view-model.ts`, `subject-deep-dive.tsx`, `subject-performance.test.ts`, `ai-settings-form.tsx`, `calendar-view.tsx`, `Add Mock Route`, `Mock Comparison Route`, `personal-task-drawer.tsx`, `compare-view.tsx`, `ai-composer.tsx`, `ai.ts`, `filters-url.ts`, `Mock Entry Form and Validation`, `ask-view.tsx`, `formatNumber`, `security-panel.tsx`, `Panel`, `chat-composer.tsx`, `use-ai-workspace.tsx`, `workspace-chrome.tsx`, `Request Proxy and Public Origins`, `useToast`, `next`, `shortDate`, `email-client.ts`, `exam-switcher.tsx`, `chrome.tsx`, `performance-view.tsx`, `film-section.tsx`, `cn`, `app/layout.tsx`, `RouteError`, `extraction.ts`, `queries/exams.ts`, `calendar-view.tsx`, `mock-form.tsx`, `private-workspace.tsx`, `calendar-view.tsx`, `react`, `plan-day-view.tsx`, `exams-panel.tsx`, `motion`, `requireUser`, `utils.ts`, `api`, `ai-chat-sheet.tsx`, `ai-composer.tsx`, `data-parts.tsx`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Should `my-tasks-view.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05925925925925926 - nodes in this community are weakly interconnected._
- **Why does `next` connect `next` to `subject-performance.test.ts`, `Button`, `Mock Comparison Route`, `ai-composer.tsx`, `lib/trash.ts`, `filters-url.ts`, `RequestError`, `workspace-chrome.tsx`, `Request Proxy and Public Origins`, `shortDate`, `next.config.ts`, `performance-view.tsx`, `app/layout.tsx`, `require-user.ts`, `RouteError`, `calendar-view.tsx`, `private-workspace.tsx`, `plan-day-view.tsx`, `exams-panel.tsx`, `requireUser`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Stack Inventory (Next 16.4.3, React 19.2, TS 5.9, Tailwind 4, Recharts 3, motion 12)` and `Private Accounts Release Notes`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._