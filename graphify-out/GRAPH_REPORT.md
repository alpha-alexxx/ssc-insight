# Graph Report - ssc-insight  (2026-11-24)

## Corpus Check
- 656 files · ~497,550 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 10 file(s) not represented in the graph (top: (none) 4, .css 2, .example 1)

## Summary
- 4843 nodes · 14096 edges · 236 communities (162 shown, 74 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 225 edges (avg confidence: 0.85)
- Token cost: 116,500 input · 41,800 output

## Graph Freshness
- Built from commit: `31ed7646`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Study Calendar Layer
- database
- Motion & Interaction Primitives
- Exam Catalog & Targets
- AI Provider Settings
- Dashboard View & Primitives
- Settings Panels
- personal-todos.tsx
- Backup & Import Pipeline
- Date Picker & Form Widgets
- trash-view.tsx
- NumberRoll
- fetch-dog.tsx
- toast-stack.tsx
- AI Streaming Routes
- My Tasks View
- Runtime Dependencies
- TextMorph
- Trend Charts & Time Brush
- AI Provider & Error Types
- lib/trash.ts
- "ssc_insight"."MockAttempt"
- compare-route.tsx
- lib/search.ts
- date-picker.tsx
- cn
- Performance Performance
- Repository
- Security Test
- Empty State
- Data Parts
- api
- plan-day-view.tsx
- Film Section
- approval-card.tsx
- Landing Sections
- User Requireuser
- Use Ai
- sparkline.tsx
- Plan Facts
- Combobox
- Proxy
- Contract Test
- Chrome
- auth/[...path]/route.ts
- Audit Md
- sign-in-form.tsx
- Data Table
- rate-limit.ts
- ref_node_fs
- ui-interaction-motion.ts
- Chameleon Hideengine
- Readme Md
- mock-form.tsx
- Layout
- @animate-ui/react
- State Scenes
- ai/todos/route.ts
- empty-state.tsx
- LruCache
- Email Client
- Ai Subsystem
- liquid-tabs.tsx
- Performance Test
- motion
- Product Workflows
- Claude Md
- entry-rows.tsx
- view-model.ts
- coo-pigeon.tsx
- Queries Exams
- Auth Shell
- trend-chart.tsx
- credentials.ts
- Analytics
- Command Palette
- Fluted Footer
- Streaming Answer
- Appearance
- Error Routeerror
- domain.ts
- Tools Shot
- Ink Trend
- Password Input
- search-core.ts
- Skeleton
- Thinking Trace
- Tsconfig Compileroptions
- Components
- toast
- CooEngine
- use-plan-data.ts
- dialog.tsx
- copy-button.tsx
- Stack Toast
- Filters Url
- Screenshots Dashboard
- Workflows Ci
- Tools Check
- donut-chart.tsx
- Report Md
- Not Found
- (workspace)/layout.tsx
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
- Backup Transfer
- Faq Accordion
- useAiWorkspaceState
- attachment-chip.tsx
- Hairline Dashboard
- Explain Search
- ref_node_crypto
- security-panel.tsx
- app/layout.tsx
- workspace-command-palette.tsx
- Onboarding Checklist
- attempt-outcome-card.tsx
- Feature Tabs
- clarifying-question.tsx
- Morphing Nav
- colocation.test.ts
- Verify Trash
- Announcement Pill
- Citation
- message-edit.tsx
- next
- use-search.ts
- ws
- Arrow Down
- Arrow Left
- Arrow Right
- Arrow Up
- api/[...path]/route.ts
- Bell Ring
- Hugeicons Bookmark
- Hugeicons Bot
- Message Square
- Hugeicons Calendar
- Calendar Check
- Hugeicons Cancel
- Bar Increasing
- Badge
- response-versions.tsx
- Checkmark Circle
- Clipboard List
- Hugeicons Clock
- Hugeicons Compass
- Hugeicons Delete
- Hugeicons Download
- Filter Horizontal
- Finger Print
- Hugeicons Flag
- Hugeicons Flame
- Hugeicons Flash
- Folder Open
- Hugeicons Gauge
- Hugeicons Globe
- Hugeicons Hourglass
- Hugeicons Key
- Layout Dashboard
- Hugeicons List
- Hugeicons Logout
- usage-meter.tsx
- Square Plus
- Square Text
- appearance-panel.tsx
- Minus Sign
- Hugeicons Moon
- More Vertical
- publicOrigin
- Pencil Edit
- Hugeicons Pin
- Plus Sign
- Hugeicons Rocket
- Hugeicons Search
- Shield Check
- Sliders Horizontal
- Square Kanban
- Hugeicons Star
- Hugeicons Sun
- Hugeicons Target
- Trending Down
- markdown.tsx
- Hugeicons Trophy
- calendar-plus.tsx
- User Round
- Wand Sparkles
- Logo Marquee
- chart-no-axes-column.tsx
- Domain Rules
- Error Page
- circle-check-big.tsx
- Ink Books
- copy-01.tsx
- lock-keyhole.tsx
- Connection Refused
- more-horizontal.tsx
- panel-left.tsx
- play.tsx
- Date Semantics
- Postcss Config
- Culori D
- Vercel
- refresh.tsx
- send-horizontal.tsx
- settings-02.tsx
- share-03.tsx
- sparkles.tsx
- view.tsx
- useKeyboardShortcuts
- 20261025000000_ai_usage/migration.sql
- 20261028000000_ai_credential/migration.sql

## God Nodes (most connected - your core abstractions)
1. `react` - 288 edges
2. `cn()` - 171 edges
3. `Button()` - 157 edges
4. `PlainIcon()` - 153 edges
5. `motion` - 98 edges
6. `shortDate()` - 89 edges
7. `useInteractionReducedMotion()` - 87 edges
8. `@animate-ui/react` - 81 edges
9. `NumberRoll()` - 79 edges
10. `TextMorph()` - 79 edges

## Surprising Connections (you probably didn't know these)
- `Ink Trend Brush Illustration` --conceptually_related_to--> `Landing()`  [AMBIGUOUS]
  public/landing/ink-trend.png → src/components/landing/index.tsx
- `Score Progress Metaphor` --conceptually_related_to--> `MockTrend()`  [INFERRED]
  public/landing/ink-trend.png → src/components/landing/mockups/data-parts.tsx
- `Six palettes onto Hairline tokens (approved)` --semantically_similar_to--> `Six brand palettes (data-palette)`  [INFERRED] [semantically similar]
  UI_AUDIT.md → DESIGN.md
- `contextWith()` --calls--> `buildAiContext()`  [EXTRACTED]
  tests/ai-prompt-security.test.ts → src/lib/ai/context.ts
- `config()` --calls--> `generationPathFor()`  [EXTRACTED]
  tests/ai-provider-protocols.test.ts → src/lib/ai/protocols.ts

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

## Communities (236 total, 74 thin omitted)

### Community 0 - "Study Calendar Layer"
Cohesion: 0.06
Nodes (69): AgendaGroups(), AgendaView(), EarlierRanges(), CalendarMetrics(), MetricCell(), CalendarSurface(), DayDrawer(), DayLedger() (+61 more)

### Community 1 - "database"
Cohesion: 0.05
Nodes (88): zod, GET, runtime, dynamic, GET, HealthStatus, runtime, mutationSchema (+80 more)

### Community 2 - "Motion & Interaction Primitives"
Cohesion: 0.06
Nodes (46): Accordion(), AccordionItem, AccordionProps, Chevron(), Fold(), Breadcrumb(), BreadcrumbProps, Crumb (+38 more)

### Community 3 - "Exam Catalog & Targets"
Cohesion: 0.05
Nodes (90): GET, runtime, GET, PUT, GET, preferencesSchema, runtime, scopePayload() (+82 more)

### Community 4 - "AI Provider Settings"
Cohesion: 0.05
Nodes (81): maxDuration, POST, runtime, maxDuration, POST, PROBE_MESSAGES, runtime, Catalog (+73 more)

### Community 5 - "Dashboard View & Primitives"
Cohesion: 0.13
Nodes (43): DashboardPlanApi, PersonalTasksPanel(), PipelineProgressSection(), PipelineRevisionSection(), PipelineUpcomingSection(), PlanApi, PlanWithToday, ProgressRing() (+35 more)

### Community 6 - "Settings Panels"
Cohesion: 0.07
Nodes (60): dynamic, SettingsPage(), AboutPanel(), DataPanel(), ExamsPanel(), MotionButton, pageEnter, Reveal() (+52 more)

### Community 7 - "personal-todos.tsx"
Cohesion: 0.06
Nodes (45): blankTask(), PersonalTaskDrawer(), TaskEditorLoader(), DraftResponse, Proposal, TodoAiComposerInner(), apply(), duplicateWarning() (+37 more)

### Community 8 - "Backup & Import Pipeline"
Cohesion: 0.03
Nodes (72): GET, maxDuration, runtime, privateHeaders, assertSummary(), attemptLabel(), backfillLegacyQualifying(), BACKUP_FORMAT (+64 more)

### Community 9 - "Date Picker & Form Widgets"
Cohesion: 0.17
Nodes (31): react-dom, BulkBar(), ContextMenu(), ContextMenuProps, DropdownMenu(), DropdownMenuProps, Align, enterStyle() (+23 more)

### Community 10 - "trash-view.tsx"
Cohesion: 0.10
Nodes (34): GET, runtime, TrashDetailSheet(), KindFilter, messageOf(), toItemRef(), TrashPanel(), TrashView() (+26 more)

### Community 11 - "NumberRoll"
Cohesion: 0.08
Nodes (36): Column, columns(), Digit, NOTHING_NEW, NumberRoll(), NumberRollProps, Place(), STRIP (+28 more)

### Community 12 - "fetch-dog.tsx"
Cohesion: 0.15
Nodes (11): playStrip(), preloadStrips(), StripPlay, FETCH_ART, FETCH_FRAMES, clamp(), Clip, easeIn() (+3 more)

### Community 13 - "toast-stack.tsx"
Cohesion: 0.11
Nodes (25): emit(), getNone(), getToasts(), Glyph(), listeners, NO_TOASTS, POP, remove() (+17 more)

### Community 14 - "AI Streaming Routes"
Cohesion: 0.07
Nodes (66): bodySchema, maxDuration, POST(), runtime, COACH_FORMAT, maxDuration, POST(), runtime (+58 more)

### Community 15 - "My Tasks View"
Cohesion: 0.05
Nodes (56): ApplyOp, ConfirmState, MyTasksView(), bulkRescheduleApply(), bulkStatus(), bulkTrashSelected(), clearSelection(), createTask() (+48 more)

### Community 16 - "Runtime Dependencies"
Cohesion: 0.03
Nodes (85): dependencies, @animate-ui/react@^2.4.6, class-variance-authority@^0.7.1, clsx@^2.1.1, @hookform/resolvers@^5.9.2, @hugeicons/core-free-icons@^4.4.0, @hugeicons/react@^1.1.10, lucide-react@^1.78.0 (+77 more)

### Community 17 - "TextMorph"
Cohesion: 0.10
Nodes (27): BadgeProps, BadgeTone, DOT, FILL, LINE, ChatScroll(), ChatScrollProps, subscribeReduced() (+19 more)

### Community 18 - "Trend Charts & Time Brush"
Cohesion: 0.10
Nodes (31): pad(), TimeBrush(), TimeBrushProps, addDays(), DAY, DAY_WORDS, DAYS, durationShort() (+23 more)

### Community 19 - "AI Provider & Error Types"
Cohesion: 0.07
Nodes (57): aiAborted(), AiBillability, aiBusy(), aiEndpointError(), AiError, AiErrorCode, aiInvalidOutput(), aiModelError() (+49 more)

### Community 20 - "lib/trash.ts"
Cohesion: 0.07
Nodes (61): POST, bearerToken(), GET, maxDuration, runtime, secretMatches(), assignTierIds(), customExamInputSchema (+53 more)

### Community 21 - ""ssc_insight"."MockAttempt""
Cohesion: 0.07
Nodes (36): MockAttempt_completedAt_idx, MockAttempt_platform_completedAt_idx, MockAttempt_type_completedAt_idx, "ssc_insight"."MockAttempt", "ssc_insight"."SubjectResult", "ssc_insight"."TrackerSettings", SubjectResult_attemptId_position_key, SubjectResult_subjectId_attemptId_idx (+28 more)

### Community 22 - "compare-route.tsx"
Cohesion: 0.22
Nodes (18): CompareRoute(), CompareReference, HistoryRoute(), PerformanceRoute(), platformsOf(), DateRangeFilter(), useExamScope(), PageHeader() (+10 more)

### Community 23 - "lib/search.ts"
Cohesion: 0.18
Nodes (20): escapeLike(), getStudyPlan(), ATTEMPT_PHASES, attemptItem(), attemptPhaseWhere(), matchTier(), takeFrom(), taskPhaseWhere() (+12 more)

### Community 24 - "date-picker.tsx"
Cohesion: 0.14
Nodes (30): addDays(), addMonths(), Arrow(), DatePicker(), DatePickerProps, DAYS, fromISO(), localToday() (+22 more)

### Community 25 - "cn"
Cohesion: 0.05
Nodes (75): AiActivity, clockLabel(), FEATURE_META, STATUS_DOT, AskRoute(), AskView(), ComposerMode, MODES (+67 more)

### Community 26 - "Performance Performance"
Cohesion: 0.06
Nodes (61): DistributionPanel(), PAD, FindingsPanel(), points(), sentence(), TONE_ICON, TONE_TEXT, Panel() (+53 more)

### Community 27 - "Repository"
Cohesion: 0.09
Nodes (39): DELETE, GET, idSchema, runtime, attemptData(), attemptInclude, attemptWhere(), mapSubjects() (+31 more)

### Community 28 - "Security Test"
Cohesion: 0.09
Nodes (35): AiContext, average(), buildAiContext(), fullMockProfile(), payload(), recentFullMock(), sectionProfile(), subjectProfile() (+27 more)

### Community 29 - "Empty State"
Cohesion: 0.10
Nodes (29): ChatNotice(), ChatNoticeKind, ChatNoticeProps, Countdown(), Reveal(), subscribeReduced(), swap(), TWO_DIGITS (+21 more)

### Community 30 - "Data Parts"
Cohesion: 0.07
Nodes (56): AttemptInput, buildAttempt(), FULL_ROWS, LANDING_ATTEMPTS, LANDING_FULL_MOCKS, LANDING_LATEST, LANDING_SCOPES, LANDING_SUMMARY (+48 more)

### Community 31 - "api"
Cohesion: 0.08
Nodes (35): AddMockView(), AddRoute(), AddRouteInner(), remove(), LogMockPayload, AiActivityEntry, api(), ApiError (+27 more)

### Community 32 - "plan-day-view.tsx"
Cohesion: 0.14
Nodes (25): EventDialog(), PlanDoneState(), RevFlag(), BoardView(), handleDrop(), columnFor(), COLUMNS, DayNotes() (+17 more)

### Community 33 - "Film Section"
Cohesion: 0.12
Nodes (27): attemptMeritPercentage(), CHAPTERS, COACH_ANSWER, CountNumber(), FILM_GAP_PTS, FILM_METRICS, FILM_PCT_DELTA, FILM_SUBJECT_BARS (+19 more)

### Community 34 - "approval-card.tsx"
Cohesion: 0.29
Nodes (9): ApprovalCard(), ApprovalCardProps, ApprovalDetail, ApprovalStatus, DrawnCheck(), LABELS, subscribeReduced(), swap() (+1 more)

### Community 35 - "Landing Sections"
Cohesion: 0.07
Nodes (54): dynamic, LandingPage(), metadata, LINK_BUTTON, TypedLine(), FloatingAsk(), RAIL_ITEMS, SectionRail() (+46 more)

### Community 36 - "User Requireuser"
Cohesion: 0.10
Nodes (58): @tanstack/react-query, GET, POST, runtime, GET, runtime, AddPage(), dynamic (+50 more)

### Community 37 - "Use Ai"
Cohesion: 0.13
Nodes (26): AiWorkspace, AiWorkspaceContext, INSIGHT_REQUEST_TEXT, trimChatHistory(), chatBaseForSend(), ChatMessage, CoachMeta, CoachResponse (+18 more)

### Community 38 - "sparkline.tsx"
Cohesion: 0.43
Nodes (6): parsePoint(), Sparkline(), SparklinePoint, SparklineProps, subscribeReduced(), useReducedMotion()

### Community 39 - "Plan Facts"
Cohesion: 0.08
Nodes (20): SignUpPlateArt(), LANDING_PLAN, plan, buildLandingPlan(), category(), isMock(), parsed, parsePlanTaskKey() (+12 more)

### Community 40 - "Combobox"
Cohesion: 0.10
Nodes (37): AlertIcon(), Box(), Check(), Chevron(), Combobox(), ComboboxBase, ComboboxMultipleProps, ComboboxOption (+29 more)

### Community 41 - "Proxy"
Cohesion: 0.16
Nodes (23): accessLog(), AccessLogEvent, bypassesMaintenance(), classifyPath(), EnvLike, isAuthPage(), isCronPath(), maintenanceActive() (+15 more)

### Community 42 - "Contract Test"
Cohesion: 0.06
Nodes (31): boardViewSource, calendarAgendaSource, calendarDayLedgerSource, calendarEntriesSource, calendarEventSource, calendarLayersSource, calendarMonthSource, calendarPeriodSource (+23 more)

### Community 43 - "Chrome"
Cohesion: 0.12
Nodes (30): App shell (sidebar-07 composition), AppFrame(), AppHeader(), HeaderLocation(), ThemeToggleBridge(), ExamSwitcher(), EmptyScopeNotice(), ScopeGate() (+22 more)

### Community 44 - "auth/[...path]/route.ts"
Cohesion: 0.27
Nodes (10): Context, devHandle(), handle(), privateNoStore, runtime, withServiceOrigin(), devAuthBypassActive(), devBypassUser() (+2 more)

### Community 45 - "Audit Md"
Cohesion: 0.07
Nodes (16): Conversions cheat-sheet (shadcn to Hairline), Hairline UI component library, MIGRATION.md (Hairline migration guide), toast-stack API, Hairline AI chat parts set, Coverage map (category to component or gap), DEV_AUTH_BYPASS route verification (19 routes), Gate questions resolved (section 9) (+8 more)

### Community 46 - "sign-in-form.tsx"
Cohesion: 0.07
Nodes (50): react-hook-form@^7.92.0, react-hook-form, AuthFieldError(), DoneStage(), ForgotForm(), RequestStage(), Stage, StepPanel() (+42 more)

### Community 47 - "Data Table"
Cohesion: 0.09
Nodes (33): Box(), cellText(), cellValue(), compare(), Cursor, DataTable(), DataTableAction, DataTableColumn (+25 more)

### Community 48 - "rate-limit.ts"
Cohesion: 0.07
Nodes (55): aiRateLimiter, apiRateLimiter, BREAKER_OPEN_MS, BREAKER_THRESHOLD, BreakerState, initialBreaker(), isBreakerOpen(), onFailure() (+47 more)

### Community 49 - "ref_node_fs"
Cohesion: 0.15
Nodes (6): ALLOW, files, PALETTE_CLASS, violations, walk(), root

### Community 50 - "ui-interaction-motion.ts"
Cohesion: 0.10
Nodes (27): niceMax(), niceStep(), snap(), subscribeNothing(), subscribeReduced(), ThresholdLine(), ThresholdLineDatum, ThresholdLineProps (+19 more)

### Community 51 - "Chameleon Hideengine"
Cohesion: 0.11
Nodes (15): HIDE_BODY, HIDE_BRANCH, HIDE_GEO, clamp(), easeIn(), easeOut(), Flick, Hide() (+7 more)

### Community 52 - "Readme Md"
Cohesion: 0.09
Nodes (16): graphify knowledge graph (graphify-out/), SSC Insight, SSC Insight (CGL Tier 2 mock tracker), Component decision table, Density and motion tokens (:root), Type scale (--type-*), SSC CGL Tier 2 mock tracker (product definition), Agent tooling (neon-postgres plugin, MCP) (+8 more)

### Community 53 - "mock-form.tsx"
Cohesion: 0.06
Nodes (68): DurationInput(), change(), formatParts(), blankSubject(), defaultTierId(), fullMockSectionHeading(), Labeled(), meritSubjectIds() (+60 more)

### Community 54 - "Layout"
Cohesion: 0.15
Nodes (15): initialTheme(), persist(), ThemePrefs, ThemePrefsContext, ThemeStyleProvider(), DEFAULT_THEME, normalizeTheme(), PALETTE_STORAGE_KEY (+7 more)

### Community 55 - "@animate-ui/react"
Cohesion: 0.06
Nodes (16): @animate-ui/react, Activity01Props, animations, Add01(), Add01Props, animations, animations, BatteryMedium01Props (+8 more)

### Community 56 - "State Scenes"
Cohesion: 0.18
Nodes (20): scopeTrash(), box(), C, chart(), done(), facingCircle(), inbox(), line() (+12 more)

### Community 57 - "ai/todos/route.ts"
Cohesion: 0.20
Nodes (13): maxDuration, runtime, MAX_TODO_PROMPT_CHARS, parseTodoProposals(), Target, TODO_DATE_QUESTION, todoDraftMessages(), todoDraftRequestSchema (+5 more)

### Community 58 - "empty-state.tsx"
Cohesion: 0.14
Nodes (23): TasksEmptyState(), drawIn(), drawOut(), EmptyState(), EmptyStateAction, EmptyStateProps, EmptyStateSecondaryAction, FILL (+15 more)

### Community 60 - "Email Client"
Cohesion: 0.15
Nodes (27): readSecurityUser(), SecurityUser, useAuthSecurity(), authClient, AuthFailureReason, authGet(), authPost(), AuthSessionRow (+19 more)

### Community 61 - "Ai Subsystem"
Cohesion: 0.09
Nodes (15): AI env config (config-core.ts), Four AI wire protocols, AiUsage quota ledger (reserve/settle), Ask AI two surfaces (sheet + /ask), Device-local conversation history, NDJSON chat stream with 15s ping, User-configured AI provider (presets, formats, write-only key), /ask page with three mode chips (+7 more)

### Community 62 - "liquid-tabs.tsx"
Cohesion: 0.11
Nodes (15): BEHIND, clamp(), colorOf(), FRONT, half(), liquidPath(), LiquidTab, LiquidTabs() (+7 more)

### Community 63 - "Performance Test"
Cohesion: 0.06
Nodes (33): filterAttempts(), targetMarks(), targetPercentage(), duplicateKey(), Marking, SubjectResult, attemptSchema, input (+25 more)

### Community 64 - "motion"
Cohesion: 0.06
Nodes (15): motion, animations, Attachment01Props, animations, ChartLineProps, animations, Loading03Props, animations (+7 more)

### Community 65 - "Product Workflows"
Cohesion: 0.08
Nodes (18): Backup format v5, buildCalendarIndex, /calendar unified 3-layer ledger, Personal tasks (/my-tasks), Soft delete and /trash recovery, 50-day study plan (static JSON), /api/cron/trash-cleanup, clampImportedDeletedAt (+10 more)

### Community 66 - "Claude Md"
Cohesion: 0.10
Nodes (18): percentiles (goal percentile per exam), Settings eight sections, settings-guard.tsx dirty-state guard, 20261102000000_targets_and_preferences, tierTargets (per-tier override map), attemptWhere() soft-delete read boundary, CI pipeline (.github/workflows/ci.yml), ESLint mockAttempt boundary rule (+10 more)

### Community 67 - "entry-rows.tsx"
Cohesion: 0.10
Nodes (42): CalendarToolbar(), DaySections(), AttemptEntryRow(), entryPlanRow(), PersonalEntryRow(), PlanEntryRow(), RevisionEntryRow(), SectionHead() (+34 more)

### Community 68 - "view-model.ts"
Cohesion: 0.09
Nodes (30): categoryLabel(), MonthGrid, CompactRow(), DayTicks(), WeekDayCell(), WeekView, PersonalCalendar(), personalMonthRange() (+22 more)

### Community 69 - "coo-pigeon.tsx"
Cohesion: 0.10
Nodes (20): COO_ART, COO_GEO, COO_FLY_ART, COO_FLY_FRAMES, BEAK, BOX, clamp(), COO_ROUTE (+12 more)

### Community 70 - "Queries Exams"
Cohesion: 0.07
Nodes (39): CustomExamDialog(), describeTier(), ExamRow(), maxOf(), SourceSummary, StageSummary, SUBJECT_CHOICES, TierSummary (+31 more)

### Community 71 - "Auth Shell"
Cohesion: 0.15
Nodes (17): dynamic, ForgotPasswordPage(), metadata, dynamic, metadata, SignInPage(), dynamic, metadata (+9 more)

### Community 72 - "trend-chart.tsx"
Cohesion: 0.17
Nodes (20): dateWords(), ease(), formatDuration(), lerp(), lerpAll(), monotoneSegments(), nextBucket(), niceTop() (+12 more)

### Community 73 - "credentials.ts"
Cohesion: 0.12
Nodes (32): RFC-1918, DELETE, GET, PUT, runtime, isAiThinking(), sameCredentialTarget(), AiCredentialInput (+24 more)

### Community 74 - "Analytics"
Cohesion: 0.10
Nodes (40): accuracyTone(), AverageThreshold(), buildComparison(), buildSectionRows(), ChangeCell(), comparable(), CompareView, Comparison (+32 more)

### Community 75 - "Command Palette"
Cohesion: 0.15
Nodes (22): Check(), CommandItem, CommandPalette(), CommandPaletteProps, Kbd(), LeavingPane(), Marked(), match() (+14 more)

### Community 76 - "Fluted Footer"
Cohesion: 0.17
Nodes (20): DefaultMark(), drawWordMask(), FlutedColumn, FlutedFooter(), FlutedFooterProps, FlutedLink, NO_COLUMNS, NO_LINKS (+12 more)

### Community 77 - "Streaming Answer"
Cohesion: 0.12
Nodes (21): AnswerActions(), AnswerActionsProps, AnswerCitation, AnswerFeedback, AnswerSegment, AnswerSource, AnswerStatus, Caret() (+13 more)

### Community 78 - "Appearance"
Cohesion: 0.14
Nodes (18): animations, Menu01(), Menu01Props, Masthead(), onScroll(), read(), NAV, OPTIONS (+10 more)

### Community 79 - "Error Routeerror"
Cohesion: 0.12
Nodes (18): react, ForgotPasswordError(), SignInError(), SignUpError(), AddError(), AskError(), CalendarError(), CompareError() (+10 more)

### Community 80 - "domain.ts"
Cohesion: 0.09
Nodes (34): HistoryPanel, HistoryStats(), sortLabel(), accuracyTone(), AttemptTotals, scoreBarTone(), totalsFor(), typeChip() (+26 more)

### Community 81 - "Tools Shot"
Cohesion: 0.17
Nodes (9): args, logs, outDir, pending, routes, target, waitMs, widths (+1 more)

### Community 82 - "Ink Trend"
Cohesion: 0.17
Nodes (13): Ink Compass Still-Life Illustration, Ink Lantern Plate Artwork, Aspirant's Journey Metaphor, Glowing Red Paper Lantern, Sumi-e Ink Wash Style, Scholar Figure with Lantern, Ascending Stone Staircase, Summit Flag (+5 more)

### Community 83 - "Password Input"
Cohesion: 0.21
Nodes (12): animateLayer(), BUTTON_SIZES, BUTTON_TONES, hidden(), IconMorph(), IconMorphButton(), IconMorphButtonProps, IconMorphMode (+4 more)

### Community 84 - "search-core.ts"
Cohesion: 0.19
Nodes (17): collectCursors(), GET, runtime, decodeSearchCursors(), encodeSearchCursors(), fromBase64Url(), normalizeSearchQuery(), parseSearchTypes() (+9 more)

### Community 85 - "Skeleton"
Cohesion: 0.12
Nodes (26): AuthPageLoading(), AuthPageLoading(), AuthPageLoading(), AddLoading(), AskLoading(), CalendarLoading(), CompareLoading(), DashboardLoading() (+18 more)

### Community 86 - "Thinking Trace"
Cohesion: 0.16
Nodes (18): Elapsed(), formatDuration(), Reveal(), RUNNING_LABEL, SOURCE_TONES, Spinner(), StepCheck(), subscribeReduced() (+10 more)

### Community 87 - "Tsconfig Compileroptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 88 - "Components"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+9 more)

### Community 89 - "toast"
Cohesion: 0.39
Nodes (6): GoogleGlyph(), GoogleSignInButton(), signIn(), GoogleSignInButtonProps, toast(), startGoogleSignIn()

### Community 91 - "use-plan-data.ts"
Cohesion: 0.11
Nodes (23): MyTasksRoute(), NumberField, ResultEditor(), fill(), EMPTY_TASKS, patchDayInPlan(), patchTaskInPlan(), PersonalTaskInput (+15 more)

### Community 92 - "dialog.tsx"
Cohesion: 0.18
Nodes (12): AlertProps, AlertTone, ICON_TONE, ICONS, TONE, DialogProps, WIDTH, MODAL_ROOT (+4 more)

### Community 93 - "copy-button.tsx"
Cohesion: 0.19
Nodes (14): Alert(), Check(), CopyButton(), CopyButtonProps, CopyState, SIZES, TONES, writeClipboard() (+6 more)

### Community 94 - "Stack Toast"
Cohesion: 0.26
Nodes (13): Arrive(), bucket(), ChatHistory(), ChatHistoryProps, ChatSummary, layer(), Mark(), Row() (+5 more)

### Community 95 - "Filters Url"
Cohesion: 0.15
Nodes (18): FiltersState, ATTEMPT_SORT_KEYS, DashboardScope, dashboardScopeSchema, DEFAULT_SCOPE, defaultListState, lenientDirSchema, lenientFiltersSchema (+10 more)

### Community 96 - "Screenshots Dashboard"
Cohesion: 0.23
Nodes (13): Dashboard Loading State Screenshot, Active Exam Note (SSC CGL · dates in IST), Log a Mock Primary CTA, Metric Strip (4-cell overview), Performance Preview Panel, Personal Tasks Card, Study Calendar Strip (skeleton row), Quick-Add Todo Input (+5 more)

### Community 97 - "Workflows Ci"
Cohesion: 0.12
Nodes (15): jobs, validate, name, on, pull_request, push, permissions, contents (+7 more)

### Community 98 - "Tools Check"
Cohesion: 0.14
Nodes (13): args, evaluate(), height, pending, problems, report, send(), settle (+5 more)

### Community 99 - "donut-chart.tsx"
Cohesion: 0.24
Nodes (12): AttemptBreakdownPanel(), InsightCallout(), colorOf(), DonutChart(), DonutChartProps, DonutSlice, NONE, PALETTE (+4 more)

### Community 100 - "Report Md"
Cohesion: 0.13
Nodes (12): Component decision table (source to path), Deferred items and why, Sandbox heap OOM verification constraint, ui/icons.tsx barrel (79 wrappers), LiquidButton on landing FinalCta, liquid-tabs installed but not wired, New runtime dependencies, Registries installed (shadcn, animate-ui, hairline, hugeicons) (+4 more)

### Community 101 - "Not Found"
Cohesion: 0.18
Nodes (13): NotFoundClient(), metadata, NotFound(), Fetch(), FetchHandle, CARD, mix(), NotFound() (+5 more)

### Community 102 - "(workspace)/layout.tsx"
Cohesion: 0.13
Nodes (18): dynamic, WorkspaceLayout(), GuardLedgerRow(), GuardNotice(), GuardNoticeProps, GuardRow, GuardTone, PrivateWorkspace() (+10 more)

### Community 103 - "Brand Palettes"
Cohesion: 0.17
Nodes (5): Proposed --chart-1..5 aliases (decision 3), graphite palette (only sheen tokens), orange palette (terracotta default), Shared status tokens (--positive/--warning/--danger), --chart-1..5 global subject identity

### Community 104 - "Check Contrast"
Cohesion: 0.21
Nodes (12): culori@^4.0.2, culori, Block, CHART_TOKENS, contrast(), CSS_PATH, main(), parseBlocks() (+4 more)

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
Cohesion: 0.26
Nodes (11): EFFORTS, IconLayer(), Meter(), ModelIcon(), ModelOption, ModelPicker(), ModelPickerProps, Phase (+3 more)

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

### Community 122 - "Backup Transfer"
Cohesion: 0.29
Nodes (8): api(), backup(), cookies, preview(), raw(), replace(), settings, user()

### Community 123 - "Faq Accordion"
Cohesion: 0.31
Nodes (8): FaqAccordion(), FaqAccordionProps, FaqItem, PlusMinus(), subscribeReduced(), useReducedMotion(), Faq(), FAQ_ITEMS

### Community 124 - "useAiWorkspaceState"
Cohesion: 0.24
Nodes (8): insightToChatText(), newId(), useAiWorkspaceState(), AiChatEvent, ChatUsage, encoder, NdjsonDecoder, parseChatEvent()

### Community 125 - "attachment-chip.tsx"
Cohesion: 0.31
Nodes (10): AttachmentChip(), AttachmentChipProps, AttachmentStatus, extension(), formatBytes(), Reveal(), subscribeReduced(), swap() (+2 more)

### Community 126 - "Hairline Dashboard"
Cohesion: 0.39
Nodes (7): Hairline Dashboard Screenshot (degraded/unavailable state), Latest Result Section, Next.js Dev Overlay Issues Badge (2 Issues), Personal Overdue Metric (Nothing overdue in My Tasks), Sidebar Navigation: Study Planner + Results Groups, Today's Plan Dashboard Section, Workspace Header: Breadcrumb, Search, Theme Toggle

### Community 127 - "Explain Search"
Cohesion: 0.22
Nodes (6): @prisma/adapter-pg@^7.10.1, @prisma/adapter-pg, env, match, prisma, queries

### Community 128 - "ref_node_crypto"
Cohesion: 0.18
Nodes (10): api(), full, ids, raw(), api(), cookies, created, input (+2 more)

### Community 129 - "security-panel.tsx"
Cohesion: 0.10
Nodes (25): ChangePasswordDialog(), describeDevice(), DisableTwoFactorDialog(), EnrollDialog(), EnrollStep, RegenerateCodesDialog(), SecurityPanel(), SessionsCard() (+17 more)

### Community 130 - "app/layout.tsx"
Cohesion: 0.11
Nodes (15): @fontsource-variable/dm-sans@^5.3.0, @fontsource-variable/source-serif-4@^5.3.1, @vercel/analytics@^2.0.1, @vercel/speed-insights@^2.0.0, @fontsource-variable/dm-sans, @fontsource-variable/source-serif-4, @vercel/analytics, @vercel/speed-insights (+7 more)

### Community 131 - "workspace-command-palette.tsx"
Cohesion: 0.17
Nodes (19): ARROWS, isMac(), Kbd(), KbdProps, MAC, matches(), PC, subscribeNoop() (+11 more)

### Community 132 - "Onboarding Checklist"
Cohesion: 0.39
Nodes (8): Check(), OnboardingChecklist(), OnboardingChecklistProps, OnboardingTask, Ring(), subscribeReduced(), swap(), useReducedMotion()

### Community 133 - "attempt-outcome-card.tsx"
Cohesion: 0.24
Nodes (9): AttemptOutcomeCard(), outcomes, percent(), ScoreRing(), subjectIcons, subjectSeries, tierSuffix(), AnswerStack (+1 more)

### Community 134 - "Feature Tabs"
Cohesion: 0.36
Nodes (7): FeatureTab, FeatureTabs(), FeatureTabsProps, Leaving, Pane(), subscribeReduced(), useReducedMotion()

### Community 135 - "clarifying-question.tsx"
Cohesion: 0.31
Nodes (9): ClarifyingQuestion(), ClarifyingQuestionProps, DrawnCheck(), QuestionAnswer, QuestionOption, Reveal(), subscribeReduced(), swap() (+1 more)

### Community 136 - "Morphing Nav"
Cohesion: 0.36
Nodes (7): MorphingNav(), MorphingNavProps, NavItem, Shown, Slide(), subscribeReduced(), useReducedMotion()

### Community 137 - "colocation.test.ts"
Cohesion: 0.22
Nodes (6): allSourceFiles(), APP, privateFiles(), ROOT, SRC, walkInto()

### Community 138 - "Verify Trash"
Cohesion: 0.43
Nodes (6): api(), cookies, created, input, raw(), visible()

### Community 139 - "Announcement Pill"
Cohesion: 0.43
Nodes (6): AnnouncementPill(), AnnouncementPillProps, Arrow(), Phase, subscribeReduced(), useReducedMotion()

### Community 140 - "Citation"
Cohesion: 0.43
Nodes (6): Citation(), CitationProps, CitationSource, hostname(), subscribeReduced(), useReducedMotion()

### Community 141 - "message-edit.tsx"
Cohesion: 0.36
Nodes (8): CopyGlyph(), Leaving(), MessageEdit(), MessageEditProps, Outgoing, subscribeReduced(), swap(), useReducedMotion()

### Community 142 - "next"
Cohesion: 0.12
Nodes (14): cspDev, cspProduction, nextConfig, productionHeaders, next, CalendarRoute(), metadata, PlanDayRoute() (+6 more)

### Community 143 - "use-search.ts"
Cohesion: 0.25
Nodes (7): SearchHit, searchIsReady(), SearchPage, UseSearchOptions, searchKeys, SEARCH_QUERY_MIN, SearchResultItem

### Community 144 - "ws"
Cohesion: 0.25
Nodes (6): ws@^8.22.0, ws, logs, pending, target, ws

### Community 149 - "api/[...path]/route.ts"
Cohesion: 0.25
Nodes (7): DELETE, dynamic, GET, PATCH, POST, PUT, runtime

### Community 158 - "Badge"
Cohesion: 0.36
Nodes (6): MaintenancePage(), metadata, Badge(), PX, Spinner(), SpinnerProps

### Community 159 - "response-versions.tsx"
Cohesion: 0.39
Nodes (7): Leaving, LeavingPane(), ResponseVersions(), ResponseVersionsProps, subscribeReduced(), swap(), useReducedMotion()

### Community 179 - "usage-meter.tsx"
Cohesion: 0.36
Nodes (7): GROUPED, number, Reveal(), subscribeReduced(), UsageMeter(), UsageMeterProps, useReducedMotion()

### Community 182 - "appearance-panel.tsx"
Cohesion: 0.43
Nodes (6): next-themes@^0.4.6, next-themes, AppearancePanel(), PaletteChip(), ThemeToggleNextBridge(), useThemePrefs()

### Community 186 - "publicOrigin"
Cohesion: 0.52
Nodes (3): GET(), publicOrigin(), publicUrl()

### Community 189 - "Plus Sign"
Cohesion: 0.40
Nodes (3): animations, PlusSign(), PlusSignProps

### Community 199 - "markdown.tsx"
Cohesion: 0.60
Nodes (5): codeElementOf(), HastNode, languageOf(), Markdown, textValue()

### Community 204 - "Logo Marquee"
Cohesion: 0.60
Nodes (4): LogoMarquee(), LogoMarqueeProps, subscribeReduced(), useReducedMotion()

### Community 206 - "Domain Rules"
Cohesion: 0.50
Nodes (4): attemptSchemaFor(pattern), domain.ts scoring and layout rules, Sectional SectionId model (Section III qualifying), Subject taxonomy (quant/reasoning/english/ga/computer)

### Community 207 - "Error Page"
Cohesion: 1.00
Nodes (4): Browser Connection Error Page, Dashboard Final Screenshot, ERR_CONNECTION_REFUSED, Localhost 127.0.0.1 Dev Server

### Community 212 - "Connection Refused"
Cohesion: 1.00
Nodes (3): ERR_CONNECTION_REFUSED — 127.0.0.1 refused to connect (Chrome 'This site can't be reached' page), SSC Insight History Route (/history) — intended screenshot subject, not captured, History Reference Screenshot — Chrome ERR_CONNECTION_REFUSED error page

### Community 214 - "panel-left.tsx"
Cohesion: 0.40
Nodes (3): animations, PanelLeft(), PanelLeftProps

### Community 215 - "play.tsx"
Cohesion: 0.40
Nodes (3): animations, Play(), PlayProps

### Community 222 - "refresh.tsx"
Cohesion: 0.40
Nodes (3): animations, Refresh(), RefreshProps

### Community 224 - "settings-02.tsx"
Cohesion: 0.40
Nodes (3): animations, Settings02(), Settings02Props

### Community 226 - "sparkles.tsx"
Cohesion: 0.40
Nodes (3): animations, Sparkles(), SparklesProps

### Community 228 - "useKeyboardShortcuts"
Cohesion: 0.50
Nodes (4): Handlers, useKeyboardShortcuts(), isTypingTarget(), onKey()

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
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1613 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **74 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Error Routeerror` to `Study Calendar Layer`, `Motion & Interaction Primitives`, `AI Provider Settings`, `Dashboard View & Primitives`, `Settings Panels`, `personal-todos.tsx`, `Backup & Import Pipeline`, `Date Picker & Form Widgets`, `trash-view.tsx`, `NumberRoll`, `fetch-dog.tsx`, `toast-stack.tsx`, `My Tasks View`, `Runtime Dependencies`, `TextMorph`, `Trend Charts & Time Brush`, `compare-route.tsx`, `date-picker.tsx`, `cn`, `Performance Performance`, `Empty State`, `Data Parts`, `api`, `plan-day-view.tsx`, `Film Section`, `approval-card.tsx`, `Landing Sections`, `User Requireuser`, `Use Ai`, `sparkline.tsx`, `Combobox`, `Chrome`, `sign-in-form.tsx`, `Data Table`, `ui-interaction-motion.ts`, `Chameleon Hideengine`, `mock-form.tsx`, `Layout`, `@animate-ui/react`, `empty-state.tsx`, `Email Client`, `liquid-tabs.tsx`, `motion`, `entry-rows.tsx`, `view-model.ts`, `coo-pigeon.tsx`, `Queries Exams`, `Auth Shell`, `trend-chart.tsx`, `Analytics`, `Command Palette`, `Fluted Footer`, `Streaming Answer`, `Appearance`, `domain.ts`, `Password Input`, `Skeleton`, `Thinking Trace`, `toast`, `use-plan-data.ts`, `dialog.tsx`, `copy-button.tsx`, `Stack Toast`, `Filters Url`, `donut-chart.tsx`, `Not Found`, `(workspace)/layout.tsx`, `Compare Bars`, `Thinking Indicator`, `area-chart.tsx`, `Model Picker`, `Dot Meter`, `Faq Accordion`, `attachment-chip.tsx`, `security-panel.tsx`, `app/layout.tsx`, `workspace-command-palette.tsx`, `Onboarding Checklist`, `attempt-outcome-card.tsx`, `Feature Tabs`, `clarifying-question.tsx`, `Morphing Nav`, `Announcement Pill`, `Citation`, `message-edit.tsx`, `Arrow Down`, `Arrow Left`, `Arrow Right`, `Arrow Up`, `Bell Ring`, `Hugeicons Bookmark`, `Hugeicons Bot`, `Message Square`, `Hugeicons Calendar`, `Calendar Check`, `Hugeicons Cancel`, `Bar Increasing`, `Badge`, `response-versions.tsx`, `Checkmark Circle`, `Clipboard List`, `Hugeicons Clock`, `Hugeicons Compass`, `Hugeicons Delete`, `Hugeicons Download`, `Filter Horizontal`, `Finger Print`, `Hugeicons Flag`, `Hugeicons Flame`, `Hugeicons Flash`, `Folder Open`, `Hugeicons Gauge`, `Hugeicons Globe`, `Hugeicons Hourglass`, `Hugeicons Key`, `Layout Dashboard`, `Hugeicons List`, `Hugeicons Logout`, `usage-meter.tsx`, `Square Plus`, `Square Text`, `appearance-panel.tsx`, `Minus Sign`, `Hugeicons Moon`, `More Vertical`, `Pencil Edit`, `Hugeicons Pin`, `Plus Sign`, `Hugeicons Rocket`, `Hugeicons Search`, `Shield Check`, `Sliders Horizontal`, `Square Kanban`, `Hugeicons Star`, `Hugeicons Sun`, `Hugeicons Target`, `Trending Down`, `markdown.tsx`, `Hugeicons Trophy`, `calendar-plus.tsx`, `User Round`, `Wand Sparkles`, `Logo Marquee`, `chart-no-axes-column.tsx`, `circle-check-big.tsx`, `copy-01.tsx`, `lock-keyhole.tsx`, `more-horizontal.tsx`, `panel-left.tsx`, `play.tsx`, `refresh.tsx`, `send-horizontal.tsx`, `settings-02.tsx`, `share-03.tsx`, `sparkles.tsx`, `view.tsx`, `useKeyboardShortcuts`?**
  _High betweenness centrality (0.401) - this node is a cross-community bridge._
- **What connects `RFC-1918`, `ui/icons.tsx barrel (79 wrappers)`, `LiquidButton on landing FinalCta` to the rest of the system?**
  _68 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Study Calendar Layer` be split into smaller, more focused modules?**
  _Cohesion score 0.058002735978112174 - nodes in this community are weakly interconnected._
- **Why does `next` connect `next` to `Study Calendar Layer`, `database`, `app/layout.tsx`, `workspace-command-palette.tsx`, `Dashboard View & Primitives`, `Settings Panels`, `trash-view.tsx`, `Runtime Dependencies`, `compare-route.tsx`, `cn`, `Badge`, `api`, `plan-day-view.tsx`, `Landing Sections`, `User Requireuser`, `Proxy`, `Chrome`, `sign-in-form.tsx`, `publicOrigin`, `Auth Shell`, `Appearance`, `Error Routeerror`, `Filters Url`, `Not Found`, `(workspace)/layout.tsx`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Should `database` be split into smaller, more focused modules?**
  _Cohesion score 0.047039199332777316 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Landing()` and `Ink Trend Brush Illustration`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `SSC Insight History Route (/history) — intended screenshot subject, not captured` and `History Reference Screenshot — Chrome ERR_CONNECTION_REFUSED error page`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._