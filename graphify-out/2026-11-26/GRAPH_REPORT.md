# Graph Report - ssc-insight  (2026-11-25)

## Corpus Check
- 657 files · ~513,192 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 4, .css 2, .example 1)

## Summary
- 4930 nodes · 14197 edges · 223 communities (156 shown, 67 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 228 edges (avg confidence: 0.85)
- Token cost: 116,500 input · 41,800 output

## Graph Freshness
- Built from commit: `93ccf743`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- calendar-entries.ts
- database
- ui-interaction-motion.ts
- exam-settings.ts
- AI Provider Settings
- view-model.ts
- entry-rows.tsx
- fixtures.ts
- backup.ts
- Date Picker & Form Widgets
- trash-view.tsx
- NumberRoll
- coo-pigeon.tsx
- toast-stack.tsx
- AI Streaming Routes
- button.tsx
- Runtime Dependencies
- TextMorph
- Trend Charts & Time Brush
- AI Provider & Error Types
- lib/trash.ts
- "ssc_insight"."MockAttempt"
- cn
- lib/search.ts
- repository.ts
- api
- Performance Performance
- domain.test.ts
- ref_node_assert
- chat-notice.tsx
- totals
- next
- plan-shared.tsx
- Film Section
- ask-view-hairline.tsx
- Landing Sections
- loadExamContext
- use-ai-workspace.tsx
- ai-settings-form.tsx
- Plan Facts
- Combobox
- Proxy
- Contract Test
- workspace-sidebar.tsx
- lib/todos.ts
- Audit Md
- sign-in-form.tsx
- Data Table
- rate-limit.ts
- ref_node_fs
- devDependencies
- Chameleon Hideengine
- Readme Md
- mock-form.tsx
- Layout
- motion
- next
- auth-shell.tsx
- empty-state.tsx
- api/settings/route.ts
- Email Client
- Ai Subsystem
- liquid-tabs.tsx
- Performance Test
- useInteractionReducedMotion
- Product Workflows
- Claude Md
- .tmp-hp-command-palette.tsx
- istTodayIso
- Skeleton
- my-tasks-view.tsx
- require-user.ts
- log-mock-flow.tsx
- credentials.ts
- Analytics
- Command Palette
- Fluted Footer
- AskMessage.tsx
- theme-toggle.tsx
- Error Routeerror
- compare-view.tsx
- Tools Shot
- Ink Trend
- Password Input
- date-picker.tsx
- route-skeleton.tsx
- Thinking Trace
- Tsconfig Compileroptions
- Components
- sign-up-form.tsx
- attachment-chip.tsx
- verify-backup-transfer.mjs
- ai-settings-form.tsx
- copy-button.tsx
- Stack Toast
- Filters Url
- Screenshots Dashboard
- Workflows Ci
- Tools Check
- colocation.test.ts
- Report Md
- Not Found
- onboarding-checklist.tsx
- Brand Palettes
- Check Contrast
- Hall Illustration
- Compare Bars
- Thinking Indicator
- area-chart.tsx
- Rate Limiting
- Auth Wire
- Query Layer
- Ask Ask
- Package Scripts
- Model Picker
- Daynav Check
- Theme System
- Dot Meter
- Resp Probe
- Analytics Scopes
- Exam Catalog
- Final Dashboard
- empty-state-scenes.ts
- Faq Accordion
- extraction.ts
- ws
- Hairline Dashboard
- Explain Search
- verify-ownership.mjs
- security-panel.tsx
- app/layout.tsx
- workspace-command-palette.tsx
- workspace-chrome.tsx
- .tmp-hp-registry.json
- Feature Tabs
- stepper-input.tsx
- Morphing Nav
- Input
- usage-meter.tsx
- Announcement Pill
- image.ts
- ask-surface-contract.test.ts
- filter-horizontal.tsx
- settings-view.tsx
- message-square-text.tsx
- Arrow Down
- mic.tsx
- Arrow Right
- more-horizontal.tsx
- plus-sign.tsx
- Bell Ring
- Hugeicons Bookmark
- share-03.tsx
- trophy.tsx
- Hugeicons Calendar
- Calendar Check
- Hugeicons Cancel
- upload-01.tsx
- audit
- masthead.tsx
- Checkmark Circle
- Clipboard List
- Hugeicons Clock
- useIsMobile
- Hugeicons Delete
- Hugeicons Download
- prisma
- add-01.tsx
- Hugeicons Flag
- avatar.tsx
- Folder Open
- Hugeicons Gauge
- Hugeicons Globe
- Hugeicons Hourglass
- Hugeicons Key
- Layout Dashboard
- Hugeicons List
- Hugeicons Logout
- chart-column.tsx
- Square Plus
- chart-bar-increasing.tsx
- chart-line.tsx
- Minus Sign
- Hugeicons Moon
- More Vertical
- loading-03.tsx
- verify-trash.mjs
- Hugeicons Rocket
- Hugeicons Search
- Shield Check
- Sliders Horizontal
- Square Kanban
- Hugeicons Target
- Trending Down
- performance-metrics.ts
- calendar-plus.tsx
- chart-no-axes-column.tsx
- Domain Rules
- Error Page
- circle-check-big.tsx
- Ink Books
- arrow-left-01.tsx
- lock-keyhole.tsx
- Connection Refused
- Date Semantics
- Postcss Config
- Culori D
- Vercel
- send-horizontal.tsx
- finger-print.tsx
- view.tsx
- overrides
- 20261025000000_ai_usage/migration.sql
- 20261028000000_ai_credential/migration.sql
- pin.tsx
- wand-sparkles.tsx

## God Nodes (most connected - your core abstractions)
1. `react` - 285 edges
2. `cn()` - 184 edges
3. `PlainIcon()` - 155 edges
4. `Button()` - 152 edges
5. `motion` - 96 edges
6. `shortDate()` - 88 edges
7. `useInteractionReducedMotion()` - 87 edges
8. `NumberRoll()` - 82 edges
9. `@animate-ui/react` - 81 edges
10. `TextMorph()` - 79 edges

## Surprising Connections (you probably didn't know these)
- `Ink Trend Brush Illustration` --conceptually_related_to--> `Landing()`  [AMBIGUOUS]
  public/landing/ink-trend.png → src/components/landing/index.tsx
- `Score Progress Metaphor` --conceptually_related_to--> `MockTrend()`  [INFERRED]
  public/landing/ink-trend.png → src/components/landing/mockups/data-parts.tsx
- `parse()` --calls--> `parseTodoProposals()`  [EXTRACTED]
  tests/ai-todos.test.ts → src/lib/ai/todos.ts
- `Six palettes onto Hairline tokens (approved)` --semantically_similar_to--> `Six brand palettes (data-palette)`  [INFERRED] [semantically similar]
  UI_AUDIT.md → DESIGN.md
- `build()` --calls--> `buildCalendarIndex()`  [EXTRACTED]
  tests/calendar-entries.test.ts → src/lib/plan/calendar-entries.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **AI Read-Only Trust Messaging** — docs_ui_screenshots_hairline_final_ask_readonly_pledge, docs_ui_screenshots_hairline_final_ask_ask_route, docs_ui_screenshots_hairline_final_ask_conversation_rail, docs_ui_screenshots_hairline_final_ask_read_ledger, docs_ui_screenshots_hairline_final_ask_provider_setup_card [EXTRACTED 1.00]
- **AI subsystem guardrails** — agents_ai_subsystem, agents_context_privacy, agents_prompt_sanitization, agents_ai_quota, agents_ssrf_protection, agents_ai_credential_encryption [EXTRACTED 1.00]
- **Ask Page Three-Column Composition** — docs_ui_screenshots_hairline_final_ask_ask_route, docs_ui_screenshots_hairline_final_ask_three_column_grid, docs_ui_screenshots_hairline_final_ask_conversation_rail, docs_ui_screenshots_hairline_final_ask_read_ledger [EXTRACTED 1.00]
- **Ink Compass Still-Life Composition** — public_landing_ink_compass, public_landing_ink_compass_compass_motif, public_landing_ink_compass_ledger_scroll_motif, public_landing_ink_compass_wax_seal_motif [EXTRACTED 1.00]
- **Ink Hero Student Artwork** — public_landing_ink_hero_student_illustration, public_landing_ink_hero_student_student_writing, public_landing_ink_hero_student_book_stack, public_landing_ink_hero_student_red_disc, public_landing_ink_hero_student_ink_wash_aesthetic, public_landing_ink_hero_student_aspirant_practice_metaphor [EXTRACTED 1.00]
- **Scholar's Ascent Composition** — public_landing_ink_lantern_scholar_figure, public_landing_ink_lantern_glowing_lantern, public_landing_ink_lantern_stone_staircase, public_landing_ink_lantern_summit_flag [EXTRACTED 1.00]
- **Ink Trend Editorial Composition** — public_landing_ink_trend, public_landing_ink_trend_rising_trend_line, public_landing_ink_trend_plateau_dip_segment, public_landing_ink_trend_red_accent_dot, public_landing_ink_trend_gray_brush_baseline, public_landing_ink_trend_brush_stroke_medium [EXTRACTED 1.00]
- **Sidebar Navigation Grammar** — docs_ui_screenshots_dashboard_workspace_sidebar, docs_ui_screenshots_dashboard_study_planner_group, docs_ui_screenshots_dashboard_results_group, docs_ui_screenshots_dashboard_log_a_mock_cta, docs_ui_screenshots_dashboard_active_exam_note [EXTRACTED 1.00]
- **Soft delete and /trash recovery pipeline** — agents_soft_delete, agents_trash_retention, agents_trash_uuid_cast, agents_trash_cron, claude_attempt_where_boundary, claude_prune_targets_for_exam, product_trash_page, readme_trash_retention_note [EXTRACTED 1.00]
- **Theme system (palettes, styles, dark mode)** — agents_multi_theme_system, design_six_brand_palettes, design_two_styles_mira_sera, design_theme_switching_mechanism, claude_theme_toggle_crossfade, claude_appearance_panel, ui_audit_two_axis_theme [EXTRACTED 1.00]
- **Dashboard degraded section stack (plan, overdue, latest result)** — docs_ui_screenshots_hairline_dashboard_todays_plan_section, docs_ui_screenshots_hairline_dashboard_personal_overdue_metric, docs_ui_screenshots_hairline_dashboard_latest_result_section, docs_ui_screenshots_hairline_dashboard_degraded_state_pattern [INFERRED 0.85]
- **Dashboard Loading Skeleton Regions** — docs_ui_screenshots_dashboard_skeleton_loading_state, docs_ui_screenshots_dashboard_metric_strip, docs_ui_screenshots_dashboard_todays_plan_panel, docs_ui_screenshots_dashboard_personal_tasks_card, docs_ui_screenshots_dashboard_plan_calendar_strip, docs_ui_screenshots_dashboard_performance_preview_panel [INFERRED 0.85]
- **Failed dashboard-final.png capture event (verify: replace with a real dashboard screenshot)** — docs_ui_screenshots_dashboard_final_dashboard_final_screenshot, docs_ui_screenshots_dashboard_final_browser_connection_error_page, docs_ui_screenshots_dashboard_final_err_connection_refused, docs_ui_screenshots_dashboard_final_localhost_127_0_0_1_dev_server [INFERRED 0.85]
- **Hairline Dashboard Loading Composition** — docs_ui_screenshots_hairline_final_dashboard_dashboard_loading_state, docs_ui_screenshots_hairline_final_dashboard_metric_strip_skeleton, docs_ui_screenshots_hairline_final_dashboard_plan_overview_section_head, docs_ui_screenshots_hairline_final_dashboard_personal_tasks_card [INFERRED 0.85]
- **Hairline Workspace Chrome Grammar** — docs_ui_screenshots_hairline_final_dashboard_workspace_shell_chrome, docs_ui_screenshots_hairline_final_dashboard_sidebar_navigation_groups, docs_ui_screenshots_hairline_final_dashboard_log_a_mock_cta [INFERRED 0.85]
- **Ink Hall Editorial Composition** — public_landing_ink_hall_illustration, public_landing_ink_hall_empty_exam_hall, public_landing_ink_hall_lone_candidate, public_landing_ink_hall_red_seal_stamp, public_landing_ink_hall_negative_space_composition, public_landing_ink_hall_ink_wash_aesthetic, public_landing_ink_hall_solo_aspirant_metaphor [INFERRED 0.85]
- **Monochrome Wash with Single Warm Accent** — public_landing_ink_lantern_glowing_lantern, public_landing_ink_lantern_ink_wash_style, public_landing_ink_lantern_scholar_figure [INFERRED 0.85]

## Communities (223 total, 67 thin omitted)

### Community 0 - "calendar-entries.ts"
Cohesion: 0.06
Nodes (65): AgendaGroups(), AgendaView(), EarlierRanges(), CalendarMetrics(), MetricCell(), CalendarSurface(), DayLedger(), EmptyActions() (+57 more)

### Community 1 - "database"
Cohesion: 0.05
Nodes (66): zod, POST, POST, GET, runtime, maxDuration, POST, runtime (+58 more)

### Community 2 - "ui-interaction-motion.ts"
Cohesion: 0.06
Nodes (38): AlertProps, AlertTone, ICON_TONE, ICONS, TONE, ButtonGroup(), ButtonGroupItem, ButtonGroupOrientation (+30 more)

### Community 3 - "exam-settings.ts"
Cohesion: 0.06
Nodes (72): GET, PATCH, PatternSection, CUSTOM_FIRST_TIER_ID, CustomExamDef, customExamPattern(), CustomTierDef, ExamDef (+64 more)

### Community 4 - "AI Provider Settings"
Cohesion: 0.06
Nodes (66): maxDuration, runtime, maxDuration, PROBE_MESSAGES, runtime, aiConfig(), aiConfigOrNull(), AI_THINKING_LEVELS (+58 more)

### Community 5 - "view-model.ts"
Cohesion: 0.06
Nodes (59): MonthCell(), MonthGrid, PlanCategoryLegend(), WEEKDAYS, DashboardPlanApi, PipelineProgressSection(), PipelineRevisionSection(), PipelineUpcomingSection() (+51 more)

### Community 6 - "entry-rows.tsx"
Cohesion: 0.09
Nodes (42): DaySections(), AttemptEntryRow(), entryPlanRow(), PersonalEntryRow(), PlanEntryRow(), RevisionEntryRow(), SectionHead(), StatusDot() (+34 more)

### Community 7 - "fixtures.ts"
Cohesion: 0.11
Nodes (39): CompareScreen(), delta(), duration(), DashboardScreen(), accuracyTone(), CHART, CHIP_TONES, ChipTone (+31 more)

### Community 8 - "backup.ts"
Cohesion: 0.04
Nodes (67): assertSummary(), attemptLabel(), backfillLegacyQualifying(), BACKUP_FORMAT, BACKUP_FORMAT_VERSION, BACKUP_INSERT_CHUNK_SIZE, BACKUP_MAX_ATTEMPTS, BACKUP_MAX_BYTES (+59 more)

### Community 9 - "Date Picker & Form Widgets"
Cohesion: 0.17
Nodes (31): react-dom, ContextMenu(), ContextMenuProps, DropdownMenu(), DropdownMenuProps, Align, enterStyle(), findFloatingPortal() (+23 more)

### Community 10 - "trash-view.tsx"
Cohesion: 0.16
Nodes (21): TrashDetailSheet(), KindFilter, kindIconName(), messageOf(), toItemRef(), TrashPanel(), TrashView(), emptyTrashRequest() (+13 more)

### Community 11 - "NumberRoll"
Cohesion: 0.07
Nodes (40): Column, columns(), Digit, NOTHING_NEW, NumberRoll(), NumberRollProps, Place(), STRIP (+32 more)

### Community 12 - "coo-pigeon.tsx"
Cohesion: 0.05
Nodes (34): playStrip(), preloadStrips(), StripPlay, COO_ART, COO_GEO, COO_FLY_ART, COO_FLY_FRAMES, BEAK (+26 more)

### Community 13 - "toast-stack.tsx"
Cohesion: 0.08
Nodes (42): niceMax(), niceStep(), snap(), subscribeNothing(), subscribeReduced(), ThresholdLine(), ThresholdLineDatum, ThresholdLineProps (+34 more)

### Community 14 - "AI Streaming Routes"
Cohesion: 0.09
Nodes (58): bodySchema, maxDuration, POST(), runtime, COACH_FORMAT, maxDuration, POST(), runtime (+50 more)

### Community 15 - "button.tsx"
Cohesion: 0.05
Nodes (61): blankTask(), PersonalTaskDrawer(), TaskEditorLoader(), BackupPreviewCard(), ActionStatus, ButtonProps, DEFAULT_LABELS, SelfDrawingCheck() (+53 more)

### Community 16 - "Runtime Dependencies"
Cohesion: 0.05
Nodes (52): dependencies, @animate-ui/react@^2.4.6, @base-ui/react@^1.9.0, class-variance-authority@^0.7.1, clsx@^2.1.1, @hookform/resolvers@^5.9.2, @hugeicons/core-free-icons@^4.4.0, @hugeicons/react@^1.1.10 (+44 more)

### Community 17 - "TextMorph"
Cohesion: 0.09
Nodes (33): ClarifyingQuestion(), ClarifyingQuestionProps, DrawnCheck(), QuestionAnswer, QuestionOption, Reveal(), subscribeReduced(), swap() (+25 more)

### Community 18 - "Trend Charts & Time Brush"
Cohesion: 0.06
Nodes (51): pad(), TimeBrush(), TimeBrushProps, addDays(), DAY, DAY_WORDS, DAYS, durationShort() (+43 more)

### Community 19 - "AI Provider & Error Types"
Cohesion: 0.08
Nodes (57): aiAborted(), AiBillability, aiBusy(), aiEndpointError(), AiError, AiErrorCode, aiInvalidOutput(), aiModelError() (+49 more)

### Community 20 - "lib/trash.ts"
Cohesion: 0.07
Nodes (53): GET, idSchema, kindSchema, runtime, POST, runtime, POST, runtime (+45 more)

### Community 21 - ""ssc_insight"."MockAttempt""
Cohesion: 0.07
Nodes (36): MockAttempt_completedAt_idx, MockAttempt_platform_completedAt_idx, MockAttempt_type_completedAt_idx, "ssc_insight"."MockAttempt", "ssc_insight"."SubjectResult", "ssc_insight"."TrackerSettings", SubjectResult_attemptId_position_key, SubjectResult_subjectId_attemptId_idx (+28 more)

### Community 22 - "cn"
Cohesion: 0.08
Nodes (49): AskEmptyState(), greeting(), SCOPE, STARTERS, CalendarToolbar(), categoryLabel(), LayerToggles(), CellRow() (+41 more)

### Community 23 - "lib/search.ts"
Cohesion: 0.10
Nodes (38): collectCursors(), GET, runtime, escapeLike(), getStudyPlan(), ATTEMPT_PHASES, attemptItem(), attemptPhaseWhere() (+30 more)

### Community 24 - "repository.ts"
Cohesion: 0.09
Nodes (44): GET, GET, attemptData(), attemptInclude, attemptWhere(), mapSubjects(), StoredAnalyticsAttempt, StoredAttempt (+36 more)

### Community 25 - "api"
Cohesion: 0.16
Nodes (20): remove(), apply(), useTodoCalendar(), useTodoTasks(), api(), ApiError, Envelope, readEnvelope() (+12 more)

### Community 26 - "Performance Performance"
Cohesion: 0.10
Nodes (47): AttemptBreakdownPanel(), DistributionPanel(), PAD, FindingsPanel(), points(), sentence(), TONE_ICON, TONE_TEXT (+39 more)

### Community 27 - "domain.test.ts"
Cohesion: 0.19
Nodes (10): filterAttempts(), duplicateKey(), parseTime(), SubjectId, subjectIds, aliases, numberAfter(), parseReport() (+2 more)

### Community 28 - "ref_node_assert"
Cohesion: 0.05
Nodes (55): MAX_TODO_PROMPT_CHARS, buildAiContext(), attachImages(), chatMessages(), coachMessages(), contextBlock(), extractionMessages(), FALLBACK_SHAPE (+47 more)

### Community 29 - "chat-notice.tsx"
Cohesion: 0.10
Nodes (31): ChatNotice(), ChatNoticeKind, ChatNoticeProps, Countdown(), Reveal(), subscribeReduced(), swap(), TWO_DIGITS (+23 more)

### Community 30 - "totals"
Cohesion: 0.11
Nodes (22): AttemptInput, buildAttempt(), FULL_ROWS, LANDING_ATTEMPTS, LANDING_FULL_MOCKS, LANDING_LATEST, LANDING_SCOPES, LANDING_SUMMARY (+14 more)

### Community 31 - "next"
Cohesion: 0.08
Nodes (30): cspDev, cspProduction, nextConfig, productionHeaders, next, CalendarRoute(), DashboardRoute(), NO_FILTERS (+22 more)

### Community 32 - "plan-shared.tsx"
Cohesion: 0.32
Nodes (14): BoardView(), handleDrop(), columnFor(), COLUMNS, nextStatus(), PersonalTaskDisplayStatus, ProgressRule(), STATUS_META (+6 more)

### Community 33 - "Film Section"
Cohesion: 0.07
Nodes (36): animations, Pause(), PauseProps, animations, Play(), PlayProps, animations, Refresh() (+28 more)

### Community 34 - "ask-view-hairline.tsx"
Cohesion: 0.06
Nodes (51): AskRoute(), AskViewHairline(), ComposerMode, estimateTokens(), HIDE_CHAT_FEEDBACK_BUTTONS, INVISIBLE_SCROLL, MODES, useOnline() (+43 more)

### Community 35 - "Landing Sections"
Cohesion: 0.12
Nodes (32): dynamic, LandingPage(), metadata, FloatingAsk(), RAIL_ITEMS, SectionRail(), onScroll(), read() (+24 more)

### Community 36 - "loadExamContext"
Cohesion: 0.20
Nodes (20): GET, runtime, GET, runtime, ComparePage(), dynamic, dynamic, HistoryPage() (+12 more)

### Community 37 - "use-ai-workspace.tsx"
Cohesion: 0.06
Nodes (54): AiWorkspace, AiWorkspaceContext, ChatHistoryApi, ChatPhase, INSIGHT_REQUEST_TEXT, insightToChatText(), newId(), trimChatHistory() (+46 more)

### Community 38 - "ai-settings-form.tsx"
Cohesion: 0.06
Nodes (30): MaintenancePage(), metadata, AiSettingsForm(), chooseProvider(), patchFields(), Catalog, credentialToValues(), EMPTY_CATALOG (+22 more)

### Community 39 - "Plan Facts"
Cohesion: 0.07
Nodes (29): SignUpPlateArt(), LANDING_PLAN, plan, buildLandingPlan(), category(), isMock(), LandingPlanData, LandingPlanDay (+21 more)

### Community 40 - "Combobox"
Cohesion: 0.11
Nodes (36): AlertIcon(), Box(), Check(), Chevron(), Combobox(), ComboboxBase, ComboboxMultipleProps, ComboboxProps (+28 more)

### Community 41 - "Proxy"
Cohesion: 0.14
Nodes (25): GET(), accessLog(), AccessLogEvent, bypassesMaintenance(), classifyPath(), EnvLike, isAuthPage(), isCronPath() (+17 more)

### Community 42 - "Contract Test"
Cohesion: 0.06
Nodes (31): boardViewSource, calendarAgendaSource, calendarDayLedgerSource, calendarEntriesSource, calendarEventSource, calendarLayersSource, calendarMonthSource, calendarPeriodSource (+23 more)

### Community 43 - "workspace-sidebar.tsx"
Cohesion: 0.16
Nodes (21): animations, PanelLeft(), PanelLeftProps, AppFrame(), AppHeader(), ThemeToggleBridge(), ScrollArea(), ScrollBar() (+13 more)

### Community 44 - "lib/todos.ts"
Cohesion: 0.13
Nodes (30): GET, runtime, DELETE, GET, POST, runtime, applyTodos(), calendarCounts() (+22 more)

### Community 45 - "Audit Md"
Cohesion: 0.07
Nodes (16): Conversions cheat-sheet (shadcn to Hairline), Hairline UI component library, MIGRATION.md (Hairline migration guide), toast-stack API, Hairline AI chat parts set, Coverage map (category to component or gap), DEV_AUTH_BYPASS route verification (19 routes), Gate questions resolved (section 9) (+8 more)

### Community 46 - "sign-in-form.tsx"
Cohesion: 0.07
Nodes (42): react-hook-form, AuthFieldError(), DoneStage(), ForgotForm(), RequestStage(), Stage, StepPanel(), onForgot() (+34 more)

### Community 47 - "Data Table"
Cohesion: 0.07
Nodes (39): react, Box(), cellText(), cellValue(), compare(), Cursor, DataTable(), DataTableAction (+31 more)

### Community 48 - "rate-limit.ts"
Cohesion: 0.07
Nodes (54): aiRateLimiterFree, aiRateLimiterPersonal, apiRateLimiter, BREAKER_OPEN_MS, BREAKER_THRESHOLD, BreakerState, initialBreaker(), isBreakerOpen() (+46 more)

### Community 49 - "ref_node_fs"
Cohesion: 0.15
Nodes (6): ALLOW, files, PALETTE_CLASS, violations, walk(), root

### Community 50 - "devDependencies"
Cohesion: 0.07
Nodes (30): devDependencies, culori@^4.0.2, eslint@^9.0.0, eslint-config-next@^16.0.0, prettier@^3.9.10, react-is@^19.3.1, tailwindcss@^4.0.0, @tailwindcss/postcss@^4.0.0 (+22 more)

### Community 51 - "Chameleon Hideengine"
Cohesion: 0.11
Nodes (15): HIDE_BODY, HIDE_BRANCH, HIDE_GEO, clamp(), easeIn(), easeOut(), Flick, Hide() (+7 more)

### Community 52 - "Readme Md"
Cohesion: 0.09
Nodes (16): graphify knowledge graph (graphify-out/), SSC Insight, SSC Insight (CGL Tier 2 mock tracker), Component decision table, Density and motion tokens (:root), Type scale (--type-*), SSC CGL Tier 2 mock tracker (product definition), Agent tooling (neon-postgres plugin, MCP) (+8 more)

### Community 53 - "mock-form.tsx"
Cohesion: 0.15
Nodes (25): DurationInput(), change(), formatParts(), blankSubject(), defaultTierId(), fullMockSectionHeading(), Labeled(), meritSubjectIds() (+17 more)

### Community 54 - "Layout"
Cohesion: 0.15
Nodes (15): initialTheme(), persist(), ThemePrefs, ThemePrefsContext, ThemeStyleProvider(), DEFAULT_THEME, normalizeTheme(), PALETTE_STORAGE_KEY (+7 more)

### Community 55 - "motion"
Cohesion: 0.03
Nodes (36): @animate-ui/react, motion, Activity01Props, animations, animations, ArrowUp01Props, animations, Attachment01Props (+28 more)

### Community 56 - "next"
Cohesion: 0.34
Nodes (11): CompareRoute(), HistoryRoute(), PerformanceRoute(), platformsOf(), ScopeFilters(), EMPTY_ATTEMPTS, useAnalyticsData(), useFiltersState() (+3 more)

### Community 57 - "auth-shell.tsx"
Cohesion: 0.15
Nodes (17): dynamic, ForgotPasswordPage(), metadata, dynamic, metadata, SignInPage(), dynamic, metadata (+9 more)

### Community 58 - "empty-state.tsx"
Cohesion: 0.12
Nodes (25): TasksEmptyState(), drawIn(), drawOut(), EmptyState(), EmptyStateAction, EmptyStateProps, EmptyStateSecondaryAction, FILL (+17 more)

### Community 59 - "api/settings/route.ts"
Cohesion: 0.08
Nodes (30): assignTierIds(), customExamInputSchema, customSubjectSchema, customTierSchema, DELETE, POST, PUT, runtime (+22 more)

### Community 60 - "Email Client"
Cohesion: 0.14
Nodes (29): readSecurityUser(), SecurityUser, useAuthSecurity(), OtpLogin(), authClient, AuthFailureReason, authGet(), authPost() (+21 more)

### Community 61 - "Ai Subsystem"
Cohesion: 0.09
Nodes (15): AI env config (config-core.ts), Four AI wire protocols, AiUsage quota ledger (reserve/settle), Ask AI two surfaces (sheet + /ask), Device-local conversation history, NDJSON chat stream with 15s ping, User-configured AI provider (presets, formats, write-only key), /ask page with three mode chips (+7 more)

### Community 62 - "liquid-tabs.tsx"
Cohesion: 0.11
Nodes (15): BEHIND, clamp(), colorOf(), FRONT, half(), liquidPath(), LiquidTab, LiquidTabs() (+7 more)

### Community 63 - "Performance Test"
Cohesion: 0.08
Nodes (24): targetMarks(), targetPercentage(), Marking, SubjectResult, AttemptSeed, MARKING, T1, attemptSchema (+16 more)

### Community 64 - "useInteractionReducedMotion"
Cohesion: 0.10
Nodes (24): Accordion(), AccordionItem, AccordionProps, Chevron(), Fold(), Breadcrumb(), BreadcrumbProps, Crumb (+16 more)

### Community 65 - "Product Workflows"
Cohesion: 0.08
Nodes (18): Backup format v5, buildCalendarIndex, /calendar unified 3-layer ledger, Personal tasks (/my-tasks), Soft delete and /trash recovery, 50-day study plan (static JSON), /api/cron/trash-cleanup, clampImportedDeletedAt (+10 more)

### Community 66 - "Claude Md"
Cohesion: 0.10
Nodes (18): percentiles (goal percentile per exam), Settings eight sections, settings-guard.tsx dirty-state guard, 20261102000000_targets_and_preferences, tierTargets (per-tier override map), attemptWhere() soft-delete read boundary, CI pipeline (.github/workflows/ci.yml), ESLint mockAttempt boundary rule (+10 more)

### Community 67 - ".tmp-hp-command-palette.tsx"
Cohesion: 0.14
Nodes (22): Check(), CommandItem, CommandPalette(), CommandPaletteProps, Kbd(), LeavingPane(), Marked(), match() (+14 more)

### Community 68 - "istTodayIso"
Cohesion: 0.16
Nodes (35): @tanstack/react-query, GET, runtime, AddPage(), dynamic, CalendarPage(), dynamic, DashboardPage() (+27 more)

### Community 69 - "Skeleton"
Cohesion: 0.10
Nodes (29): AuthPageLoading(), AuthPageLoading(), AuthPageLoading(), CalendarLoading(), PersonalTasksPanel(), PlanWithToday, DashboardView(), RecentAttemptsPanel() (+21 more)

### Community 70 - "my-tasks-view.tsx"
Cohesion: 0.05
Nodes (50): DayDrawer(), DayLedgerProps, AiPlanSheet(), BulkBar(), ApplyOp, ConfirmState, MyTasksView(), bulkRescheduleApply() (+42 more)

### Community 71 - "require-user.ts"
Cohesion: 0.09
Nodes (29): Context, devHandle(), handle(), privateNoStore, runtime, withServiceOrigin(), dynamic, WorkspaceLayout() (+21 more)

### Community 72 - "log-mock-flow.tsx"
Cohesion: 0.17
Nodes (20): EmptyChart(), DuotoneIcon(), DuotoneTile(), Icon(), resolveIcon(), ExtractionReview(), update(), updateSubject() (+12 more)

### Community 73 - "credentials.ts"
Cohesion: 0.12
Nodes (31): RFC-1918, DELETE, GET, PUT, runtime, isAiThinking(), AiCredentialInput, AiCredentialSummary (+23 more)

### Community 74 - "Analytics"
Cohesion: 0.10
Nodes (35): AiContext, average(), fullMockProfile(), payload(), recentFullMock(), sectionProfile(), subjectProfile(), analyze() (+27 more)

### Community 75 - "Command Palette"
Cohesion: 0.14
Nodes (23): Check(), CommandItem, CommandPalette(), CommandPaletteProps, Kbd(), LeavingPane(), Marked(), match() (+15 more)

### Community 76 - "Fluted Footer"
Cohesion: 0.17
Nodes (20): DefaultMark(), drawWordMask(), FlutedColumn, FlutedFooter(), FlutedFooterProps, FlutedLink, NO_COLUMNS, NO_LINKS (+12 more)

### Community 77 - "AskMessage.tsx"
Cohesion: 0.08
Nodes (42): AskMarkdown, components, markdownColumnClass, plugins, AIChat, AskMessage(), AskMessageProps, AssistantTurn() (+34 more)

### Community 78 - "theme-toggle.tsx"
Cohesion: 0.15
Nodes (18): animations, Sparkles(), SparklesProps, AppearancePanel(), PaletteChip(), ThemeToggleNextBridge(), useThemePrefs(), OPTIONS (+10 more)

### Community 79 - "Error Routeerror"
Cohesion: 0.12
Nodes (17): ForgotPasswordError(), SignInError(), SignUpError(), AddError(), AskError(), CalendarError(), CompareError(), DashboardError() (+9 more)

### Community 80 - "compare-view.tsx"
Cohesion: 0.08
Nodes (57): AverageThreshold(), BAR_KEYS, buildBarData(), buildComparison(), buildSectionRows(), CardShell(), ChangeCell(), comparable() (+49 more)

### Community 81 - "Tools Shot"
Cohesion: 0.17
Nodes (9): args, logs, outDir, pending, routes, target, waitMs, widths (+1 more)

### Community 82 - "Ink Trend"
Cohesion: 0.17
Nodes (13): Ink Compass Still-Life Illustration, Ink Lantern Plate Artwork, Aspirant's Journey Metaphor, Glowing Red Paper Lantern, Sumi-e Ink Wash Style, Scholar Figure with Lantern, Ascending Stone Staircase, Summit Flag (+5 more)

### Community 83 - "Password Input"
Cohesion: 0.13
Nodes (17): animateLayer(), BUTTON_SIZES, BUTTON_TONES, hidden(), IconMorph(), IconMorphButton(), IconMorphButtonProps, IconMorphMode (+9 more)

### Community 84 - "date-picker.tsx"
Cohesion: 0.28
Nodes (15): addDays(), addMonths(), Arrow(), DatePicker(), DatePickerProps, DAYS, fromISO(), localToday() (+7 more)

### Community 85 - "route-skeleton.tsx"
Cohesion: 0.36
Nodes (12): AddLoading(), AskLoading(), CompareLoading(), PerformanceLoading(), SettingsLoading(), TrashLoading(), RouteSkeleton(), SkeletonFilterRow() (+4 more)

### Community 86 - "Thinking Trace"
Cohesion: 0.16
Nodes (18): Elapsed(), formatDuration(), Reveal(), RUNNING_LABEL, SOURCE_TONES, Spinner(), StepCheck(), subscribeReduced() (+10 more)

### Community 87 - "Tsconfig Compileroptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 88 - "Components"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 89 - "sign-up-form.tsx"
Cohesion: 0.29
Nodes (8): ButtonSize, ButtonVariant, GoogleGlyph(), GoogleSignInButton(), signIn(), GoogleSignInButtonProps, toast(), startGoogleSignIn()

### Community 90 - "attachment-chip.tsx"
Cohesion: 0.31
Nodes (10): AttachmentChip(), AttachmentChipProps, AttachmentStatus, extension(), formatBytes(), Reveal(), subscribeReduced(), swap() (+2 more)

### Community 91 - "verify-backup-transfer.mjs"
Cohesion: 0.29
Nodes (8): api(), backup(), cookies, preview(), raw(), replace(), settings, user()

### Community 92 - "ai-settings-form.tsx"
Cohesion: 0.07
Nodes (63): @hookform/resolvers, AboutPanel(), CustomExamDialog(), describeTier(), ExamRow(), ExamsPanel(), maxOf(), SourceSummary (+55 more)

### Community 93 - "copy-button.tsx"
Cohesion: 0.31
Nodes (8): Alert(), Check(), CopyButton(), CopyButtonProps, CopyState, SIZES, TONES, writeClipboard()

### Community 94 - "Stack Toast"
Cohesion: 0.26
Nodes (13): Arrive(), bucket(), ChatHistory(), ChatHistoryProps, ChatSummary, layer(), Mark(), Row() (+5 more)

### Community 95 - "Filters Url"
Cohesion: 0.12
Nodes (25): AddMockView(), AddRoute(), AddRouteInner(), LogMockPayload, FiltersState, ATTEMPT_SORT_KEYS, DashboardScope, dashboardScopeSchema (+17 more)

### Community 96 - "Screenshots Dashboard"
Cohesion: 0.23
Nodes (13): Dashboard Loading State Screenshot, Active Exam Note (SSC CGL · dates in IST), Log a Mock Primary CTA, Metric Strip (4-cell overview), Performance Preview Panel, Personal Tasks Card, Study Calendar Strip (skeleton row), Quick-Add Todo Input (+5 more)

### Community 97 - "Workflows Ci"
Cohesion: 0.12
Nodes (15): jobs, validate, name, on, pull_request, push, permissions, contents (+7 more)

### Community 98 - "Tools Check"
Cohesion: 0.14
Nodes (13): args, evaluate(), height, pending, problems, report, send(), settle (+5 more)

### Community 99 - "colocation.test.ts"
Cohesion: 0.22
Nodes (6): allSourceFiles(), APP, privateFiles(), ROOT, SRC, walkInto()

### Community 100 - "Report Md"
Cohesion: 0.13
Nodes (12): Component decision table (source to path), Deferred items and why, Sandbox heap OOM verification constraint, ui/icons.tsx barrel (79 wrappers), LiquidButton on landing FinalCta, liquid-tabs installed but not wired, New runtime dependencies, Registries installed (shadcn, animate-ui, hairline, hugeicons) (+4 more)

### Community 101 - "Not Found"
Cohesion: 0.22
Nodes (11): NotFoundClient(), metadata, NotFound(), Fetch(), CARD, mix(), NotFound(), NotFoundProps (+3 more)

### Community 102 - "onboarding-checklist.tsx"
Cohesion: 0.39
Nodes (8): Check(), OnboardingChecklist(), OnboardingChecklistProps, OnboardingTask, Ring(), subscribeReduced(), swap(), useReducedMotion()

### Community 103 - "Brand Palettes"
Cohesion: 0.17
Nodes (5): Proposed --chart-1..5 aliases (decision 3), graphite palette (only sheen tokens), orange palette (terracotta default), Shared status tokens (--positive/--warning/--danger), --chart-1..5 global subject identity

### Community 104 - "Check Contrast"
Cohesion: 0.23
Nodes (11): culori, Block, CHART_TOKENS, contrast(), CSS_PATH, main(), parseBlocks(), relLum() (+3 more)

### Community 105 - "Hall Illustration"
Cohesion: 0.22
Nodes (8): Empty Examination Hall, Ink Hall Illustration, Lone Candidate Figure, Red Seal Stamp, Stack of Study Books, Ink Hero Student Illustration, Terracotta Sun Disc, Student Writing at Desk

### Community 106 - "Compare Bars"
Cohesion: 0.26
Nodes (12): clamp01(), CompareBars(), CompareBarsDatum, CompareBarsProps, createPacer(), ease(), niceMax(), Pacer (+4 more)

### Community 107 - "Thinking Indicator"
Cohesion: 0.23
Nodes (12): Elapsed(), formatElapsed(), IndicatorVariant, Mark(), subscribeReduced(), swap(), TENTHS, ThinkingIndicator() (+4 more)

### Community 108 - "area-chart.tsx"
Cohesion: 0.24
Nodes (11): AreaChart(), AreaChartProps, AreaLayout, AreaSeries, COLORS, LAYOUTS, monotone(), niceTop() (+3 more)

### Community 109 - "Rate Limiting"
Cohesion: 0.18
Nodes (7): defineRoute, origin-core.ts (isSameOrigin), rate-limit-breaker.ts Upstash circuit breaker, rate-limit-budget.ts daily Redis command cap, api() client helper (api-client.ts), ApiError (status/code/retryAfterSeconds), API reference (endpoints and envelopes)

### Community 110 - "Auth Wire"
Cohesion: 0.18
Nodes (9): auth-shell.tsx plate-art card layout, better-auth v1.7.6 HTTP contract, Dedicated auth pages (/sign-in, /sign-up, /forgot-password), Email auth and 2FA wire contract (email-client.ts), otp-input.tsx boxed 6-digit input, private-workspace.tsx session guard, requireUser(), security-panel.tsx with use-auth-security.ts (+1 more)

### Community 111 - "Query Layer"
Cohesion: 0.18
Nodes (4): prefetchInto(), Route topology (public vs authenticated), Shared read services (src/lib/services/*), (workspace) route group

### Community 112 - "Ask Ask"
Cohesion: 0.23
Nodes (9): Hairline Final Ask Screenshot, Ask AI Workspace Page (/ask), Conversation Rail, Hairline Design Pass, Log a Mock Sidebar CTA, No Chats Yet Empty State, Set Up Your AI Provider Card, Read Ledger Panel (+1 more)

### Community 113 - "Package Scripts"
Cohesion: 0.17
Nodes (12): scripts, build, check, db:generate, db:migrate, dev, lint, postinstall (+4 more)

### Community 114 - "Model Picker"
Cohesion: 0.15
Nodes (18): lucide-react, Citation(), CitationProps, CitationSource, hostname(), subscribeReduced(), useReducedMotion(), EFFORTS (+10 more)

### Community 115 - "Daynav Check"
Cohesion: 0.18
Nodes (9): args, evaluate(), height, pending, report, send(), target, width (+1 more)

### Community 116 - "Theme System"
Cohesion: 0.20
Nodes (4): appearance-panel.tsx palette and style pickers, next-themes owns light/dark (.dark), Radius scale (mira vs sera zeros), zaj/shadcn-ui rebuild (shadcn + Hugeicons)

### Community 117 - "Dot Meter"
Cohesion: 0.29
Nodes (10): DotMeter(), DotMeterItem, DotMeterProps, Field, FieldProps, mix(), subscribeNothing(), subscribeReduced() (+2 more)

### Community 118 - "Resp Probe"
Cohesion: 0.20
Nodes (9): args, evaluate(), pending, send(), target, url, wait, widths (+1 more)

### Community 119 - "Analytics Scopes"
Cohesion: 0.20
Nodes (6): performance-metrics.ts (single derivation), /performance evidence stack, dashboard-overview.tsx metric strip, dashboard-view.tsx composition, Make every attempt count outcome cards, Tracker behavior (tier marking, scopes, accuracy)

### Community 120 - "Exam Catalog"
Cohesion: 0.22
Nodes (8): SSC exam catalog (7 built-ins + custom), exam-pattern.ts (client-safe), exams.ts (server-side catalog), Non-objective stages (ExamStage metadata), slotFidelity: approximate, structureSignature(), tierDefaults (structure-keyed marks defaults), Mock logging (full/subject/sectional)

### Community 121 - "Final Dashboard"
Cohesion: 0.33
Nodes (9): Hairline Final Dashboard Screenshot, Dashboard Loading State (Mid-Load Frame), Log a Mock Primary CTA, Metric Strip Loading Skeleton, Next.js Dev Overlay Artifacts, Personal Tasks Card, Plan Overview Editorial Section Head, Sidebar Study Planner & Results Nav Groups (+1 more)

### Community 122 - "empty-state-scenes.ts"
Cohesion: 0.22
Nodes (17): scopeTrash(), box(), C, chart(), done(), facingCircle(), inbox(), line() (+9 more)

### Community 123 - "Faq Accordion"
Cohesion: 0.31
Nodes (8): FaqAccordion(), FaqAccordionProps, FaqItem, PlusMinus(), subscribeReduced(), useReducedMotion(), Faq(), FAQ_ITEMS

### Community 124 - "extraction.ts"
Cohesion: 0.19
Nodes (17): deriveCounts(), deriveQuestions(), exactInteger(), ExtractionIssue, extractionModelSchema, extractionSubjectIds, inferType(), issue() (+9 more)

### Community 125 - "ws"
Cohesion: 0.25
Nodes (6): ws@^8.22.0, ws, logs, pending, target, ws

### Community 126 - "Hairline Dashboard"
Cohesion: 0.39
Nodes (7): Hairline Dashboard Screenshot (degraded/unavailable state), Latest Result Section, Next.js Dev Overlay Issues Badge (2 Issues), Personal Overdue Metric (Nothing overdue in My Tasks), Sidebar Navigation: Study Planner + Results Groups, Today's Plan Dashboard Section, Workspace Header: Breadcrumb, Search, Theme Toggle

### Community 127 - "Explain Search"
Cohesion: 0.20
Nodes (7): @prisma/adapter-pg@^7.10.1, @prisma/adapter-pg, globalDb, env, match, prisma, queries

### Community 128 - "verify-ownership.mjs"
Cohesion: 0.33
Nodes (6): api(), cookies, created, input, original, raw()

### Community 129 - "security-panel.tsx"
Cohesion: 0.15
Nodes (18): BackupCodesGrid(), ChangePasswordDialog(), describeDevice(), DisableTwoFactorDialog(), ENROLL_STEPS, EnrollDialog(), EnrollStep, ErrorBanner() (+10 more)

### Community 130 - "app/layout.tsx"
Cohesion: 0.10
Nodes (17): @fontsource-variable/dm-sans@^5.3.0, @fontsource-variable/source-serif-4@^5.3.1, next-themes@^0.4.6, @vercel/analytics@^2.0.1, @vercel/speed-insights@^2.0.0, @fontsource-variable/dm-sans, @fontsource-variable/source-serif-4, next-themes (+9 more)

### Community 131 - "workspace-command-palette.tsx"
Cohesion: 0.16
Nodes (19): collectResultsByType(), normalizeForSearch(), searchHasMore(), SearchHit, searchIsReady(), SearchPage, useSearch(), UseSearchOptions (+11 more)

### Community 132 - "workspace-chrome.tsx"
Cohesion: 0.13
Nodes (18): App shell (sidebar-07 composition), EmptyScopeNotice(), ScopeGate(), Handlers, useKeyboardShortcuts(), isTypingTarget(), onKey(), WorkspaceChrome() (+10 more)

### Community 133 - ".tmp-hp-registry.json"
Cohesion: 0.14
Nodes (13): author, css, dependencies, description, docs, files, meta, license (+5 more)

### Community 134 - "Feature Tabs"
Cohesion: 0.36
Nodes (7): FeatureTab, FeatureTabs(), FeatureTabsProps, Leaving, Pane(), subscribeReduced(), useReducedMotion()

### Community 135 - "stepper-input.tsx"
Cohesion: 0.43
Nodes (7): MinusIcon(), PlusIcon(), shake(), StepperInput(), StepperInputProps, subscribeReduced(), useReducedMotion()

### Community 136 - "Morphing Nav"
Cohesion: 0.36
Nodes (7): MorphingNav(), MorphingNavProps, NavItem, Shown, Slide(), subscribeReduced(), useReducedMotion()

### Community 137 - "Input"
Cohesion: 0.19
Nodes (22): Field(), FieldProps, FieldSize, fieldSurface(), Line(), setNativeValue(), useFieldIds(), useShake() (+14 more)

### Community 138 - "usage-meter.tsx"
Cohesion: 0.36
Nodes (7): GROUPED, number, Reveal(), subscribeReduced(), UsageMeter(), UsageMeterProps, useReducedMotion()

### Community 139 - "Announcement Pill"
Cohesion: 0.43
Nodes (6): AnnouncementPill(), AnnouncementPillProps, Arrow(), Phase, subscribeReduced(), useReducedMotion()

### Community 140 - "image.ts"
Cohesion: 0.38
Nodes (6): downscaleToDataUrl(), IMAGE_MAX_EDGE, IMAGE_QUALITY, isImageFile(), MAX_ATTACHED_IMAGES, prepareImages()

### Community 141 - "ask-surface-contract.test.ts"
Cohesion: 0.29
Nodes (4): empty, emptyCode, view, viewCode

### Community 143 - "settings-view.tsx"
Cohesion: 0.07
Nodes (40): dynamic, SettingsPage(), DataPanel(), MotionButton, pageEnter, saveBarSpring, staggerContainer, staggerItem (+32 more)

### Community 149 - "plus-sign.tsx"
Cohesion: 0.40
Nodes (3): animations, PlusSign(), PlusSignProps

### Community 158 - "audit"
Cohesion: 0.11
Nodes (22): bearerToken(), GET, maxDuration, runtime, secretMatches(), dynamic, GET, HealthStatus (+14 more)

### Community 159 - "masthead.tsx"
Cohesion: 0.18
Nodes (11): animations, Menu01(), Menu01Props, LINK_BUTTON, TypedLine(), HeroCtas(), Hero(), Masthead() (+3 more)

### Community 163 - "useIsMobile"
Cohesion: 0.70
Nodes (4): getServerSnapshot(), getSnapshot(), subscribe(), useIsMobile()

### Community 167 - "add-01.tsx"
Cohesion: 0.40
Nodes (3): Add01(), Add01Props, animations

### Community 169 - "avatar.tsx"
Cohesion: 0.24
Nodes (9): Avatar(), AvatarGroup(), AvatarGroupProps, AvatarProps, AvatarSize, AvatarStatus, initials(), PX (+1 more)

### Community 187 - "verify-trash.mjs"
Cohesion: 0.21
Nodes (10): api(), full, ids, raw(), api(), cookies, created, input (+2 more)

### Community 200 - "performance-metrics.ts"
Cohesion: 0.09
Nodes (31): BandCell, DELTA_TONE, PreviewBand(), parsePoint(), Sparkline(), SparklinePoint, SparklineProps, subscribeReduced() (+23 more)

### Community 206 - "Domain Rules"
Cohesion: 0.50
Nodes (4): attemptSchemaFor(pattern), domain.ts scoring and layout rules, Sectional SectionId model (Section III qualifying), Subject taxonomy (quant/reasoning/english/ga/computer)

### Community 207 - "Error Page"
Cohesion: 1.00
Nodes (4): Browser Connection Error Page, Dashboard Final Screenshot, ERR_CONNECTION_REFUSED, Localhost 127.0.0.1 Dev Server

### Community 212 - "Connection Refused"
Cohesion: 1.00
Nodes (3): ERR_CONNECTION_REFUSED — 127.0.0.1 refused to connect (Chrome 'This site can't be reached' page), SSC Insight History Route (/history) — intended screenshot subject, not captured, History Reference Screenshot — Chrome ERR_CONNECTION_REFUSED error page

### Community 228 - "overrides"
Cohesion: 0.67
Nodes (3): zod, overrides, @neondatabase/auth

### Community 229 - "20261025000000_ai_usage/migration.sql"
Cohesion: 0.83
Nodes (3): AiUsage_userId_day_idx, AiUsage_userId_status_createdAt_idx, "ssc_insight"."AiUsage"

## Ambiguous Edges - Review These
- `Landing()` → `Ink Trend Brush Illustration`  [AMBIGUOUS]
  public/landing/ink-trend.png · relation: conceptually_related_to
- `SSC Insight History Route (/history) — intended screenshot subject, not captured` → `History Reference Screenshot — Chrome ERR_CONNECTION_REFUSED error page`  [AMBIGUOUS]
  docs/ui-screenshots/history.png · relation: references
- `Study Calendar Strip (skeleton row)` → `Dashboard Loading State Screenshot`  [AMBIGUOUS]
  docs/ui-screenshots/dashboard.png · relation: references

## Knowledge Gaps
- **68 isolated node(s):** `RFC-1918`, `ui/icons.tsx barrel (79 wrappers)`, `LiquidButton on landing FinalCta`, `icon.tsx semantic layer (Icon/PlainIcon/Duotone)`, `Component decision table (source to path)` (+63 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1667 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **67 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Data Table` to `calendar-entries.ts`, `ui-interaction-motion.ts`, `view-model.ts`, `entry-rows.tsx`, `fixtures.ts`, `backup.ts`, `Date Picker & Form Widgets`, `trash-view.tsx`, `NumberRoll`, `coo-pigeon.tsx`, `toast-stack.tsx`, `button.tsx`, `Runtime Dependencies`, `TextMorph`, `Trend Charts & Time Brush`, `cn`, `api`, `Performance Performance`, `chat-notice.tsx`, `totals`, `next`, `plan-shared.tsx`, `Film Section`, `ask-view-hairline.tsx`, `Landing Sections`, `use-ai-workspace.tsx`, `ai-settings-form.tsx`, `Combobox`, `workspace-sidebar.tsx`, `sign-in-form.tsx`, `Chameleon Hideengine`, `mock-form.tsx`, `Layout`, `motion`, `next`, `auth-shell.tsx`, `empty-state.tsx`, `Email Client`, `liquid-tabs.tsx`, `useInteractionReducedMotion`, `.tmp-hp-command-palette.tsx`, `Skeleton`, `my-tasks-view.tsx`, `require-user.ts`, `log-mock-flow.tsx`, `Command Palette`, `Fluted Footer`, `AskMessage.tsx`, `theme-toggle.tsx`, `Error Routeerror`, `compare-view.tsx`, `Password Input`, `date-picker.tsx`, `Thinking Trace`, `sign-up-form.tsx`, `attachment-chip.tsx`, `ai-settings-form.tsx`, `copy-button.tsx`, `Stack Toast`, `Filters Url`, `Not Found`, `onboarding-checklist.tsx`, `Compare Bars`, `Thinking Indicator`, `area-chart.tsx`, `Model Picker`, `Dot Meter`, `Faq Accordion`, `security-panel.tsx`, `app/layout.tsx`, `workspace-command-palette.tsx`, `workspace-chrome.tsx`, `Feature Tabs`, `stepper-input.tsx`, `Morphing Nav`, `Input`, `usage-meter.tsx`, `Announcement Pill`, `filter-horizontal.tsx`, `settings-view.tsx`, `message-square-text.tsx`, `Arrow Down`, `mic.tsx`, `Arrow Right`, `more-horizontal.tsx`, `plus-sign.tsx`, `Bell Ring`, `Hugeicons Bookmark`, `share-03.tsx`, `trophy.tsx`, `Hugeicons Calendar`, `Calendar Check`, `Hugeicons Cancel`, `upload-01.tsx`, `masthead.tsx`, `Checkmark Circle`, `Clipboard List`, `Hugeicons Clock`, `useIsMobile`, `Hugeicons Delete`, `Hugeicons Download`, `add-01.tsx`, `Hugeicons Flag`, `avatar.tsx`, `Folder Open`, `Hugeicons Gauge`, `Hugeicons Globe`, `Hugeicons Hourglass`, `Hugeicons Key`, `Layout Dashboard`, `Hugeicons List`, `Hugeicons Logout`, `chart-column.tsx`, `Square Plus`, `chart-bar-increasing.tsx`, `chart-line.tsx`, `Minus Sign`, `Hugeicons Moon`, `More Vertical`, `loading-03.tsx`, `Hugeicons Rocket`, `Hugeicons Search`, `Shield Check`, `Sliders Horizontal`, `Square Kanban`, `Hugeicons Target`, `Trending Down`, `performance-metrics.ts`, `calendar-plus.tsx`, `chart-no-axes-column.tsx`, `circle-check-big.tsx`, `arrow-left-01.tsx`, `lock-keyhole.tsx`, `send-horizontal.tsx`, `finger-print.tsx`, `view.tsx`, `pin.tsx`, `wand-sparkles.tsx`?**
  _High betweenness centrality (0.387) - this node is a cross-community bridge._
- **What connects `RFC-1918`, `ui/icons.tsx barrel (79 wrappers)`, `LiquidButton on landing FinalCta` to the rest of the system?**
  _68 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `calendar-entries.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06358024691358025 - nodes in this community are weakly interconnected._
- **Why does `next` connect `next` to `calendar-entries.ts`, `database`, `app/layout.tsx`, `workspace-command-palette.tsx`, `workspace-chrome.tsx`, `view-model.ts`, `trash-view.tsx`, `settings-view.tsx`, `Runtime Dependencies`, `cn`, `masthead.tsx`, `Landing Sections`, `ai-settings-form.tsx`, `Proxy`, `workspace-sidebar.tsx`, `sign-in-form.tsx`, `next`, `auth-shell.tsx`, `istTodayIso`, `Skeleton`, `require-user.ts`, `performance-metrics.ts`, `Error Routeerror`, `Filters Url`, `Not Found`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Should `database` be split into smaller, more focused modules?**
  _Cohesion score 0.05322128851540616 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Landing()` and `Ink Trend Brush Illustration`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `SSC Insight History Route (/history) — intended screenshot subject, not captured` and `History Reference Screenshot — Chrome ERR_CONNECTION_REFUSED error page`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._