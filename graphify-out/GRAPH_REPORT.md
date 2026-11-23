# Graph Report - ssc-insight  (2026-11-24)

## Corpus Check
- Large corpus: 667 files · ~496,516 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 4775 nodes · 13978 edges · 222 communities (151 shown, 71 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 226 edges (avg confidence: 0.85)
- Token cost: 116,500 input · 41,800 output

## Community Hubs (Navigation)
- Study Calendar Layer
- API Envelope & Route Handlers
- Motion & Interaction Primitives
- Exam Catalog & Targets
- AI Provider Settings
- Dashboard View & Primitives
- Settings Panels
- Task Editor & Plan View Model
- Backup & Import Pipeline
- Date Picker & Form Widgets
- Buttons & Utility Views
- Number Roll & Chart Widgets
- Coo & Fetch Demo Engines
- Toast & Threshold Widgets
- AI Streaming Routes
- My Tasks View
- Runtime Dependencies
- Text Morph & Copy Widgets
- Trend Charts & Time Brush
- AI Provider & Error Types
- Trash Core
- Shared Utils & Icons
- Command Palette & Result Routes
- Search Pipeline
- Database & Todos Core
- Ask View & Chat Sheet
- Performance Performance
- Repository
- Security Test
- Empty State
- Data Parts
- Client
- Format
- Film Section
- Chat Transcript
- Landing Sections
- User Requireuser
- Use Ai
- Deep Dive
- Plan Facts
- Combobox
- Proxy
- Contract Test
- Chrome
- Require User
- Audit Md
- In Form
- Data Table
- Rate Limit
- Node Assert
- Domain Totals
- Chameleon Hideengine
- Readme Md
- Mock Form
- Layout
- Animate React
- State Scenes
- Ai Test
- Package Devdependencies
- Exams
- Email Client
- Ai Subsystem
- Ai Extraction
- Performance Test
- Motion
- Product Workflows
- Claude Md
- Entry Rows
- Personal Todos
- Client Types
- Queries Exams
- Auth Shell
- Compare Compare
- Ai Credentials
- Analytics
- Command Palette
- Fluted Footer
- Streaming Answer
- Appearance
- Error Routeerror
- Domain
- Tools Shot
- Ink Trend
- Password Input
- Limit Upstash
- Skeleton
- Thinking Trace
- Tsconfig Compileroptions
- Components
- Up Form
- Queries Attempts
- Input Input
- Ai Ssrf
- Settings Security
- Stack Toast
- Filters Url
- Screenshots Dashboard
- Workflows Ci
- Tools Check
- Settings Loadexamcontext
- Report Md
- Not Found
- Private
- Brand Palettes
- Check Contrast
- Hall Illustration
- Compare Bars
- Thinking Indicator
- Domain Test
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
- Queries Analytics
- Limit Budget
- Hairline Dashboard
- Explain Search
- Trash Cleanup
- Security Changepassworddialog
- Error Boundary
- Kbd
- Onboarding Checklist
- Combo Chart
- Feature Tabs
- Ledger Facts
- Morphing Nav
- Stepper Input
- Verify Trash
- Announcement Pill
- Citation
- Provider Providerstreamdecoder
- Next Config
- Hugeicons Activity
- Hugeicons Add
- Arrow Down
- Arrow Left
- Arrow Right
- Arrow Up
- Hugeicons Attachment
- Bell Ring
- Hugeicons Bookmark
- Hugeicons Bot
- Message Square
- Hugeicons Calendar
- Calendar Check
- Hugeicons Cancel
- Bar Increasing
- Chart Column
- Chart Line
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
- Hugeicons Mail
- Square Plus
- Square Text
- Hugeicons Mic
- Minus Sign
- Hugeicons Moon
- More Vertical
- Hugeicons Notification
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
- Trending Up
- Hugeicons Trophy
- Hugeicons Upload
- User Round
- Wand Sparkles
- Logo Marquee
- Use Mobile
- Domain Rules
- Error Page
- Prisma
- Ink Books
- Ai Usage
- Limit Tokenbucketratelimiter
- Connection Refused
- Package Overrides
- Not Found
- Not Found
- Date Semantics
- Postcss Config
- Culori D
- Vercel

## God Nodes (most connected - your core abstractions)
1. `react` - 288 edges
2. `cn()` - 171 edges
3. `Button()` - 157 edges
4. `PlainIcon()` - 153 edges
5. `motion` - 98 edges
6. `shortDate()` - 88 edges
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
- **AI subsystem guardrails** — agents_ai_subsystem, agents_context_privacy, agents_prompt_sanitization, agents_ai_quota, agents_ssrf_protection, agents_ai_credential_encryption [EXTRACTED 1.00]
- **Soft delete and /trash recovery pipeline** — agents_soft_delete, agents_trash_retention, agents_trash_uuid_cast, agents_trash_cron, claude_attempt_where_boundary, claude_prune_targets_for_exam, product_trash_page, readme_trash_retention_note [EXTRACTED 1.00]
- **Theme system (palettes, styles, dark mode)** — agents_multi_theme_system, design_six_brand_palettes, design_two_styles_mira_sera, design_theme_switching_mechanism, claude_theme_toggle_crossfade, claude_appearance_panel, ui_audit_two_axis_theme [EXTRACTED 1.00]
- **Failed dashboard-final.png capture event (verify: replace with a real dashboard screenshot)** — docs_ui_screenshots_dashboard_final_dashboard_final_screenshot, docs_ui_screenshots_dashboard_final_browser_connection_error_page, docs_ui_screenshots_dashboard_final_err_connection_refused, docs_ui_screenshots_dashboard_final_localhost_127_0_0_1_dev_server [INFERRED 0.85]
- **Sidebar Navigation Grammar** — docs_ui_screenshots_dashboard_workspace_sidebar, docs_ui_screenshots_dashboard_study_planner_group, docs_ui_screenshots_dashboard_results_group, docs_ui_screenshots_dashboard_log_a_mock_cta, docs_ui_screenshots_dashboard_active_exam_note [EXTRACTED 1.00]
- **Dashboard Loading Skeleton Regions** — docs_ui_screenshots_dashboard_skeleton_loading_state, docs_ui_screenshots_dashboard_metric_strip, docs_ui_screenshots_dashboard_todays_plan_panel, docs_ui_screenshots_dashboard_personal_tasks_card, docs_ui_screenshots_dashboard_plan_calendar_strip, docs_ui_screenshots_dashboard_performance_preview_panel [INFERRED 0.85]
- **Dashboard degraded section stack (plan, overdue, latest result)** — docs_ui_screenshots_hairline_dashboard_todays_plan_section, docs_ui_screenshots_hairline_dashboard_personal_overdue_metric, docs_ui_screenshots_hairline_dashboard_latest_result_section, docs_ui_screenshots_hairline_dashboard_degraded_state_pattern [INFERRED 0.85]
- **Ask Page Three-Column Composition** — docs_ui_screenshots_hairline_final_ask_ask_route, docs_ui_screenshots_hairline_final_ask_three_column_grid, docs_ui_screenshots_hairline_final_ask_conversation_rail, docs_ui_screenshots_hairline_final_ask_read_ledger [EXTRACTED 1.00]
- **AI Read-Only Trust Messaging** — docs_ui_screenshots_hairline_final_ask_readonly_pledge, docs_ui_screenshots_hairline_final_ask_ask_route, docs_ui_screenshots_hairline_final_ask_conversation_rail, docs_ui_screenshots_hairline_final_ask_read_ledger, docs_ui_screenshots_hairline_final_ask_provider_setup_card [EXTRACTED 1.00]
- **Hairline Dashboard Loading Composition** — docs_ui_screenshots_hairline_final_dashboard_dashboard_loading_state, docs_ui_screenshots_hairline_final_dashboard_metric_strip_skeleton, docs_ui_screenshots_hairline_final_dashboard_plan_overview_section_head, docs_ui_screenshots_hairline_final_dashboard_personal_tasks_card [INFERRED 0.85]
- **Hairline Workspace Chrome Grammar** — docs_ui_screenshots_hairline_final_dashboard_workspace_shell_chrome, docs_ui_screenshots_hairline_final_dashboard_sidebar_navigation_groups, docs_ui_screenshots_hairline_final_dashboard_log_a_mock_cta [INFERRED 0.85]
- **Ink Compass Still-Life Composition** — public_landing_ink_compass, public_landing_ink_compass_compass_motif, public_landing_ink_compass_ledger_scroll_motif, public_landing_ink_compass_wax_seal_motif [EXTRACTED 1.00]
- **Ink Hall Editorial Composition** — public_landing_ink_hall_illustration, public_landing_ink_hall_empty_exam_hall, public_landing_ink_hall_lone_candidate, public_landing_ink_hall_red_seal_stamp, public_landing_ink_hall_negative_space_composition, public_landing_ink_hall_ink_wash_aesthetic, public_landing_ink_hall_solo_aspirant_metaphor [INFERRED 0.85]
- **Ink Hero Student Artwork** — public_landing_ink_hero_student_illustration, public_landing_ink_hero_student_student_writing, public_landing_ink_hero_student_book_stack, public_landing_ink_hero_student_red_disc, public_landing_ink_hero_student_ink_wash_aesthetic, public_landing_ink_hero_student_aspirant_practice_metaphor [EXTRACTED 1.00]
- **Scholar's Ascent Composition** — public_landing_ink_lantern_scholar_figure, public_landing_ink_lantern_glowing_lantern, public_landing_ink_lantern_stone_staircase, public_landing_ink_lantern_summit_flag [EXTRACTED 1.00]
- **Monochrome Wash with Single Warm Accent** — public_landing_ink_lantern_glowing_lantern, public_landing_ink_lantern_ink_wash_style, public_landing_ink_lantern_scholar_figure [INFERRED 0.85]
- **Ink Trend Editorial Composition** — public_landing_ink_trend, public_landing_ink_trend_rising_trend_line, public_landing_ink_trend_plateau_dip_segment, public_landing_ink_trend_red_accent_dot, public_landing_ink_trend_gray_brush_baseline, public_landing_ink_trend_brush_stroke_medium [EXTRACTED 1.00]

## Communities (222 total, 71 thin omitted)

### Community 0 - "Study Calendar Layer"
Cohesion: 0.05
Nodes (92): AgendaGroups(), AgendaView(), EarlierRanges(), CalendarMetrics(), MetricCell(), CalendarSurface(), CalendarToolbar(), DayActions (+84 more)

### Community 1 - "API Envelope & Route Handlers"
Cohesion: 0.05
Nodes (83): zod, maxDuration, POST, runtime, DELETE, PUT, runtime, maxDuration (+75 more)

### Community 2 - "Motion & Interaction Primitives"
Cohesion: 0.04
Nodes (81): react, Accordion(), AccordionItem, AccordionProps, Chevron(), Fold(), AlertProps, AlertTone (+73 more)

### Community 3 - "Exam Catalog & Targets"
Cohesion: 0.05
Nodes (82): GET, GET, PATCH, preferencesSchema, runtime, scopePayload(), settingsSchema, targetEditSchema (+74 more)

### Community 4 - "AI Provider Settings"
Cohesion: 0.05
Nodes (70): Catalog, credentialToValues(), EMPTY_CATALOG, EMPTY_FORM, Props, PROTOCOL_LABELS, THINKING_LABELS, THINKING_LEVELS (+62 more)

### Community 5 - "Dashboard View & Primitives"
Cohesion: 0.07
Nodes (54): AuthPageLoading(), AuthPageLoading(), AuthPageLoading(), CalendarLoading(), DashboardPlanApi, PersonalTasksPanel(), PipelineProgressSection(), PipelineRevisionSection() (+46 more)

### Community 6 - "Settings Panels"
Cohesion: 0.06
Nodes (66): AboutPanel(), DataPanel(), ExamsPanel(), maxOf(), MotionButton, pageEnter, Reveal(), RevealItem() (+58 more)

### Community 7 - "Task Editor & Plan View Model"
Cohesion: 0.06
Nodes (54): blankTask(), PersonalTaskDrawer(), TaskEditorLoader(), BoardView(), handleDrop(), columnFor(), COLUMNS, Checkbox() (+46 more)

### Community 8 - "Backup & Import Pipeline"
Cohesion: 0.04
Nodes (68): assertSummary(), attemptFingerprint(), attemptLabel(), backfillLegacyQualifying(), BACKUP_FORMAT, BACKUP_FORMAT_VERSION, BACKUP_MAX_ATTEMPTS, BACKUP_MAX_BYTES (+60 more)

### Community 9 - "Date Picker & Form Widgets"
Cohesion: 0.10
Nodes (57): react-dom, ContextMenu(), ContextMenuProps, addDays(), addMonths(), Arrow(), DatePicker(), DatePickerProps (+49 more)

### Community 10 - "Buttons & Utility Views"
Cohesion: 0.06
Nodes (47): CalendarError(), DashboardError(), HistoryError(), BulkBar(), QuickAddBar(), PlanDayError(), PlanWeekError(), CustomExamDialog() (+39 more)

### Community 11 - "Number Roll & Chart Widgets"
Cohesion: 0.05
Nodes (60): Avatar(), AvatarGroup(), AvatarGroupProps, AvatarProps, AvatarSize, AvatarStatus, initials(), PX (+52 more)

### Community 12 - "Coo & Fetch Demo Engines"
Cohesion: 0.05
Nodes (34): playStrip(), preloadStrips(), StripPlay, COO_ART, COO_GEO, COO_FLY_ART, COO_FLY_FRAMES, BEAK (+26 more)

### Community 13 - "Toast & Threshold Widgets"
Cohesion: 0.05
Nodes (56): BEHIND, clamp(), colorOf(), FRONT, half(), liquidPath(), LiquidTab, LiquidTabs() (+48 more)

### Community 14 - "AI Streaming Routes"
Cohesion: 0.10
Nodes (51): bodySchema, maxDuration, POST(), runtime, COACH_FORMAT, maxDuration, POST(), runtime (+43 more)

### Community 15 - "My Tasks View"
Cohesion: 0.06
Nodes (48): AiPlanSheet(), MyTasksRoute(), ApplyOp, ConfirmState, MyTasksView(), bulkRescheduleApply(), bulkStatus(), bulkTrashSelected() (+40 more)

### Community 16 - "Runtime Dependencies"
Cohesion: 0.05
Nodes (56): dependencies, @animate-ui/react@^2.4.6, class-variance-authority@^0.7.1, clsx@^2.1.1, @fontsource-variable/dm-sans@^5.3.0, @fontsource-variable/source-serif-4@^5.3.1, @hugeicons/core-free-icons@^4.4.0, @hugeicons/react@^1.1.10 (+48 more)

### Community 17 - "Text Morph & Copy Widgets"
Cohesion: 0.06
Nodes (51): lucide-react, AreaChart(), AreaChartProps, AreaLayout, AreaSeries, COLORS, LAYOUTS, monotone() (+43 more)

### Community 18 - "Trend Charts & Time Brush"
Cohesion: 0.06
Nodes (51): pad(), TimeBrush(), TimeBrushProps, addDays(), DAY, DAY_WORDS, DAYS, durationShort() (+43 more)

### Community 19 - "AI Provider & Error Types"
Cohesion: 0.09
Nodes (53): aiAborted(), AiBillability, aiBusy(), aiEndpointError(), AiError, AiErrorCode, aiInvalidOutput(), aiModelError() (+45 more)

### Community 20 - "Trash Core"
Cohesion: 0.08
Nodes (49): GET, idSchema, kindSchema, runtime, GET, runtime, loadTrashPage(), TrashQueryInput (+41 more)

### Community 21 - "Shared Utils & Icons"
Cohesion: 0.08
Nodes (41): PlanCategoryLegend(), HistoryPanel, HistoryStats(), sortLabel(), accuracyTone(), AttemptTotals, Delta(), scoreBarTone() (+33 more)

### Community 22 - "Command Palette & Result Routes"
Cohesion: 0.09
Nodes (39): next, MaintenancePage(), metadata, CalendarRoute(), CompareRoute(), ErrorState(), HistoryRoute(), PerformanceRoute() (+31 more)

### Community 23 - "Search Pipeline"
Cohesion: 0.08
Nodes (47): collectCursors(), GET, runtime, normalizeForSearch(), SearchHit, searchIsReady(), SearchPage, useSearch() (+39 more)

### Community 24 - "Database & Todos Core"
Cohesion: 0.09
Nodes (41): dynamic, GET, HealthStatus, runtime, GET, runtime, GET, DELETE (+33 more)

### Community 25 - "Ask View & Chat Sheet"
Cohesion: 0.10
Nodes (40): AiActivity, AskRoute(), AskView(), ComposerMode, MODES, AiChatSheet(), AskChatTab(), SheetUsageFooter() (+32 more)

### Community 26 - "Performance Performance"
Cohesion: 0.08
Nodes (40): AttemptBreakdownPanel(), DistributionPanel(), PAD, FindingsPanel(), points(), sentence(), TONE_ICON, TONE_TEXT (+32 more)

### Community 27 - "Repository"
Cohesion: 0.08
Nodes (42): GET, runtime, GET, TargetReference, attemptData(), attemptInclude, attemptWhere(), mapSubjects() (+34 more)

### Community 28 - "Security Test"
Cohesion: 0.09
Nodes (37): AiContext, average(), buildAiContext(), fullMockProfile(), payload(), recentFullMock(), sectionProfile(), subjectProfile() (+29 more)

### Community 29 - "Empty State"
Cohesion: 0.07
Nodes (43): ChatNotice(), ChatNoticeKind, ChatNoticeProps, Countdown(), Reveal(), subscribeReduced(), swap(), TWO_DIGITS (+35 more)

### Community 30 - "Data Parts"
Cohesion: 0.11
Nodes (40): CompareScreen(), delta(), duration(), DashboardScreen(), accuracyTone(), CHART, CHIP_TONES, ChipTone (+32 more)

### Community 31 - "Client"
Cohesion: 0.08
Nodes (39): remove(), apply(), EMPTY_TASKS, patchDayInPlan(), patchTaskInPlan(), PersonalTaskInput, PlanDataApi, usePlanOptimistic() (+31 more)

### Community 32 - "Format"
Cohesion: 0.09
Nodes (33): DayDrawer(), DayLedger(), DayLedgerProps, EmptyActions(), LoadLine(), TasksEmptyState(), DayNotes(), FlowSection() (+25 more)

### Community 33 - "Film Section"
Cohesion: 0.07
Nodes (36): animations, Pause(), PauseProps, animations, Play(), PlayProps, animations, Refresh() (+28 more)

### Community 34 - "Chat Transcript"
Cohesion: 0.08
Nodes (38): ApprovalCard(), ApprovalCardProps, ApprovalDetail, ApprovalStatus, DrawnCheck(), LABELS, subscribeReduced(), swap() (+30 more)

### Community 35 - "Landing Sections"
Cohesion: 0.11
Nodes (33): dynamic, LandingPage(), metadata, FloatingAsk(), RAIL_ITEMS, SectionRail(), onScroll(), read() (+25 more)

### Community 36 - "User Requireuser"
Cohesion: 0.17
Nodes (32): @tanstack/react-query, GET, GET, AskPage(), dynamic, CalendarPage(), dynamic, DashboardPage() (+24 more)

### Community 37 - "Use Ai"
Cohesion: 0.10
Nodes (32): AiWorkspace, AiWorkspaceContext, INSIGHT_REQUEST_TEXT, insightToChatText(), newId(), trimChatHistory(), useAiWorkspaceState(), chatBaseForSend() (+24 more)

### Community 38 - "Deep Dive"
Cohesion: 0.09
Nodes (35): SUBJECT_CHART, SUBJECT_INDEX, subjectChartIndex(), subjectColor(), subjectColorClass(), accuracyTone(), DeepDiveCards(), PAD (+27 more)

### Community 39 - "Plan Facts"
Cohesion: 0.07
Nodes (28): LANDING_PLAN, plan, buildLandingPlan(), category(), isMock(), LandingPlanData, LandingPlanDay, LandingPlanTask (+20 more)

### Community 40 - "Combobox"
Cohesion: 0.11
Nodes (35): AlertIcon(), Box(), Check(), Chevron(), Combobox(), ComboboxBase, ComboboxMultipleProps, ComboboxProps (+27 more)

### Community 41 - "Proxy"
Cohesion: 0.13
Nodes (26): GET(), accessLog(), AccessLogEvent, bypassesMaintenance(), classifyPath(), EnvLike, isAuthPage(), isCronPath() (+18 more)

### Community 42 - "Contract Test"
Cohesion: 0.06
Nodes (31): boardViewSource, calendarAgendaSource, calendarDayLedgerSource, calendarEntriesSource, calendarEventSource, calendarLayersSource, calendarMonthSource, calendarPeriodSource (+23 more)

### Community 43 - "Chrome"
Cohesion: 0.11
Nodes (26): App shell (sidebar-07 composition), animations, Menu01(), Menu01Props, animations, PanelLeft(), PanelLeftProps, AppFrame() (+18 more)

### Community 44 - "Require User"
Cohesion: 0.10
Nodes (24): Context, devHandle(), handle(), privateNoStore, runtime, withServiceOrigin(), dynamic, WorkspaceLayout() (+16 more)

### Community 45 - "Audit Md"
Cohesion: 0.07
Nodes (16): Conversions cheat-sheet (shadcn to Hairline), Hairline UI component library, MIGRATION.md (Hairline migration guide), toast-stack API, Hairline AI chat parts set, Coverage map (category to component or gap), DEV_AUTH_BYPASS route verification (19 routes), Gate questions resolved (section 9) (+8 more)

### Community 46 - "In Form"
Cohesion: 0.12
Nodes (30): react-hook-form@^7.92.0, react-hook-form, AuthFieldError(), DoneStage(), ForgotForm(), RequestStage(), Stage, StepPanel() (+22 more)

### Community 47 - "Data Table"
Cohesion: 0.10
Nodes (31): Box(), cellText(), cellValue(), compare(), Cursor, DataTable(), DataTableAction, DataTableProps (+23 more)

### Community 48 - "Rate Limit"
Cohesion: 0.11
Nodes (29): aiRateLimiter, apiRateLimiter, Bucket, clientIp(), AI_L2_COST, AI_RATE_LIMIT, AI_WINDOW_SECONDS, BudgetState (+21 more)

### Community 49 - "Node Assert"
Cohesion: 0.08
Nodes (16): ALLOW, files, PALETTE_CLASS, violations, walk(), api(), full, ids (+8 more)

### Community 50 - "Domain Totals"
Cohesion: 0.11
Nodes (23): totalsFor(), LINK_BUTTON, TypedLine(), AttemptInput, buildAttempt(), FULL_ROWS, LANDING_ATTEMPTS, LANDING_FULL_MOCKS (+15 more)

### Community 51 - "Chameleon Hideengine"
Cohesion: 0.11
Nodes (15): HIDE_BODY, HIDE_BRANCH, HIDE_GEO, clamp(), easeIn(), easeOut(), Flick, Hide() (+7 more)

### Community 52 - "Readme Md"
Cohesion: 0.09
Nodes (16): graphify knowledge graph (graphify-out/), SSC Insight, SSC Insight (CGL Tier 2 mock tracker), Component decision table, Density and motion tokens (:root), Type scale (--type-*), SSC CGL Tier 2 mock tracker (product definition), Agent tooling (neon-postgres plugin, MCP) (+8 more)

### Community 53 - "Mock Form"
Cohesion: 0.16
Nodes (27): DurationInput(), change(), formatParts(), blankSubject(), defaultTierId(), fullMockSectionHeading(), Labeled(), meritSubjectIds() (+19 more)

### Community 54 - "Layout"
Cohesion: 0.11
Nodes (20): next-themes@^0.4.6, next-themes, metadata, RootLayout(), ThemeProvider(), initialTheme(), persist(), ThemePrefs (+12 more)

### Community 55 - "Animate React"
Cohesion: 0.06
Nodes (13): @animate-ui/react, animations, BatteryMedium01Props, animations, CalendarPlusProps, animations, ChartNoAxesColumnProps, animations (+5 more)

### Community 56 - "State Scenes"
Cohesion: 0.10
Nodes (29): api(), cookies, created, input, original, raw(), scopeTrash(), box() (+21 more)

### Community 57 - "Ai Test"
Cohesion: 0.10
Nodes (23): MAX_TODO_PROMPT_CHARS, parseExtraction(), COACH_STRING_LIMITS, coachInsightSchema, coerceCoachInsight(), coerceItem(), coerceItems(), extractJsonText() (+15 more)

### Community 58 - "Package Devdependencies"
Cohesion: 0.07
Nodes (29): devDependencies, eslint@^9.0.0, eslint-config-next@^16.0.0, prettier@^3.9.10, react-is@^19.3.1, tailwindcss@^4.0.0, @tailwindcss/postcss@^4.0.0, @tanstack/react-query-devtools@^5.105.0 (+21 more)

### Community 59 - "Exams"
Cohesion: 0.12
Nodes (23): assignTierIds(), customExamInputSchema, customSubjectSchema, customTierSchema, DELETE, POST, PUT, runtime (+15 more)

### Community 60 - "Email Client"
Cohesion: 0.16
Nodes (27): readSecurityUser(), SecurityUser, useAuthSecurity(), AuthFailureReason, authGet(), authPost(), AuthSessionRow, changePassword() (+19 more)

### Community 61 - "Ai Subsystem"
Cohesion: 0.09
Nodes (15): AI env config (config-core.ts), Four AI wire protocols, AiUsage quota ledger (reserve/settle), Ask AI two surfaces (sheet + /ask), Device-local conversation history, NDJSON chat stream with 15s ping, User-configured AI provider (presets, formats, write-only key), /ask page with three mode chips (+7 more)

### Community 62 - "Ai Extraction"
Cohesion: 0.13
Nodes (25): ExtractionReview(), update(), updateSubject(), FieldIssues(), NullableDuration(), optionalNumber(), blankExtractedSubject(), deriveCounts() (+17 more)

### Community 63 - "Performance Test"
Cohesion: 0.08
Nodes (23): targetMarks(), targetPercentage(), Marking, AttemptSeed, MARKING, T1, attemptSchema, computer (+15 more)

### Community 64 - "Motion"
Cohesion: 0.07
Nodes (12): motion, animations, Copy01Props, animations, Loading03Props, animations, LockKeyholeProps, animations (+4 more)

### Community 65 - "Product Workflows"
Cohesion: 0.08
Nodes (18): Backup format v5, buildCalendarIndex, /calendar unified 3-layer ledger, Personal tasks (/my-tasks), Soft delete and /trash recovery, 50-day study plan (static JSON), /api/cron/trash-cleanup, clampImportedDeletedAt (+10 more)

### Community 66 - "Claude Md"
Cohesion: 0.10
Nodes (18): percentiles (goal percentile per exam), Settings eight sections, settings-guard.tsx dirty-state guard, 20261102000000_targets_and_preferences, tierTargets (per-tier override map), attemptWhere() soft-delete read boundary, CI pipeline (.github/workflows/ci.yml), ESLint mockAttempt boundary rule (+10 more)

### Community 67 - "Entry Rows"
Cohesion: 0.19
Nodes (23): DaySections(), AttemptEntryRow(), entryPlanRow(), PersonalEntryRow(), PlanEntryRow(), RevisionEntryRow(), SectionHead(), StatusDot() (+15 more)

### Community 68 - "Personal Todos"
Cohesion: 0.13
Nodes (24): PersonalCalendar(), personalMonthRange(), categoryMeta(), Group, GroupRow(), KanbanBoard(), OverdueTodoPreview(), PageLayout (+16 more)

### Community 69 - "Client Types"
Cohesion: 0.08
Nodes (23): clockLabel(), FEATURE_META, STATUS_DOT, AI_VIEWS, AiConfigSource, AiModelsResponse, AiResponseUsage, AiScreenContext (+15 more)

### Community 70 - "Queries Exams"
Cohesion: 0.13
Nodes (21): ExamScope, ExamScopeContext, ExamScopeProvider(), tierLabelFallback(), activeExamPattern(), CustomExamDto, CustomExamInput, CustomTierDto (+13 more)

### Community 71 - "Auth Shell"
Cohesion: 0.13
Nodes (18): dynamic, ForgotPasswordPage(), metadata, dynamic, metadata, SignInPage(), dynamic, metadata (+10 more)

### Community 72 - "Compare Compare"
Cohesion: 0.18
Nodes (23): accuracyTone(), AverageThreshold(), buildComparison(), ChangeCell(), comparable(), CompareReference, CompareView, Comparison (+15 more)

### Community 73 - "Ai Credentials"
Cohesion: 0.21
Nodes (17): GET, isAiThinking(), AiCredentialInput, AiCredentialSummary, credentialStorageAvailable(), describeAiCredential(), encryptionKey(), getAiCredential() (+9 more)

### Community 74 - "Analytics"
Cohesion: 0.19
Nodes (21): buildSectionRows(), analyze(), AnswerStack, average(), buildWhereYouStand(), comparePoints(), deepDiveFor(), derivedSectionPoint() (+13 more)

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
Cohesion: 0.15
Nodes (18): animations, Sparkles(), SparklesProps, AppearancePanel(), PaletteChip(), ThemeToggleNextBridge(), useThemePrefs(), OPTIONS (+10 more)

### Community 79 - "Error Routeerror"
Cohesion: 0.14
Nodes (11): ForgotPasswordError(), SignInError(), SignUpError(), AddError(), AskError(), CompareError(), MyTasksError(), PerformanceError() (+3 more)

### Community 80 - "Domain"
Cohesion: 0.12
Nodes (18): ASC_SORTERS, AttemptSortRow, buildAttemptStats(), monthSplit(), attemptListSchema, AttemptStats, FULL_MOCK_MAX_SCORE, MAIN_SUBJECT_IDS (+10 more)

### Community 81 - "Tools Shot"
Cohesion: 0.10
Nodes (15): ws@^8.22.0, ws, logs, pending, target, ws, args, logs (+7 more)

### Community 82 - "Ink Trend"
Cohesion: 0.17
Nodes (13): Ink Compass Still-Life Illustration, Ink Lantern Plate Artwork, Aspirant's Journey Metaphor, Glowing Red Paper Lantern, Sumi-e Ink Wash Style, Scholar Figure with Lantern, Ascending Stone Staircase, Summit Flag (+5 more)

### Community 83 - "Password Input"
Cohesion: 0.14
Nodes (18): animateLayer(), BUTTON_SIZES, BUTTON_TONES, hidden(), IconMorph(), IconMorphButton(), IconMorphButtonProps, IconMorphMode (+10 more)

### Community 84 - "Limit Upstash"
Cohesion: 0.23
Nodes (16): BREAKER_OPEN_MS, BREAKER_THRESHOLD, BreakerState, initialBreaker(), isBreakerOpen(), onFailure(), onSuccess(), tickBreaker() (+8 more)

### Community 85 - "Skeleton"
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
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+9 more)

### Community 89 - "Up Form"
Cohesion: 0.16
Nodes (13): @hookform/resolvers@^5.9.2, @hookform/resolvers, SignUpForm(), StepPanel(), ButtonSize, ButtonVariant, GoogleGlyph(), GoogleSignInButton() (+5 more)

### Community 90 - "Queries Attempts"
Cohesion: 0.22
Nodes (14): GET, AddMockView(), AddRoute(), AddRouteInner(), AddPage(), dynamic, safeWorkspaceReturnTo(), allAttemptsQueryOptions (+6 more)

### Community 91 - "Input Input"
Cohesion: 0.22
Nodes (13): NumberField, ResultEditor(), fill(), Input(), Attempt, istDateKey(), fillFromAttempt(), isLoggableType() (+5 more)

### Community 92 - "Ai Ssrf"
Cohesion: 0.26
Nodes (11): RFC-1918, assertSafeBaseUrl(), assertSafeBaseUrlShape(), BLOCKED_HOSTNAMES, inV4Range(), ipv4Octets(), isBlockedAddress(), parseBaseUrl() (+3 more)

### Community 93 - "Settings Security"
Cohesion: 0.20
Nodes (14): describeDevice(), EnrollStep, SessionsCard(), authEmailSchema, authNameSchema, authOtpSchema, authPasswordSchema, authTotpSchema (+6 more)

### Community 94 - "Stack Toast"
Cohesion: 0.21
Nodes (15): Arrive(), bucket(), ChatHistory(), ChatHistoryProps, ChatSummary, layer(), Mark(), Row() (+7 more)

### Community 95 - "Filters Url"
Cohesion: 0.15
Nodes (15): ATTEMPT_SORT_KEYS, dashboardScopeSchema, filtersSchema, DEFAULT_SCOPE, defaultListState, lenientDirSchema, lenientFiltersSchema, lenientPageSchema (+7 more)

### Community 96 - "Screenshots Dashboard"
Cohesion: 0.23
Nodes (13): Dashboard Loading State Screenshot, Active Exam Note (SSC CGL · dates in IST), Log a Mock Primary CTA, Metric Strip (4-cell overview), Performance Preview Panel, Personal Tasks Card, Study Calendar Strip (skeleton row), Quick-Add Todo Input (+5 more)

### Community 97 - "Workflows Ci"
Cohesion: 0.12
Nodes (15): jobs, validate, name, permissions, contents, run, uses, with (+7 more)

### Community 98 - "Tools Check"
Cohesion: 0.14
Nodes (13): args, evaluate(), height, pending, problems, report, send(), settle (+5 more)

### Community 99 - "Settings Loadexamcontext"
Cohesion: 0.36
Nodes (12): GET, ComparePage(), dynamic, dynamic, HistoryPage(), loadExamContext(), attemptFiltersFrom(), AttemptQueryInput (+4 more)

### Community 100 - "Report Md"
Cohesion: 0.13
Nodes (12): Component decision table (source to path), Deferred items and why, Sandbox heap OOM verification constraint, ui/icons.tsx barrel (79 wrappers), LiquidButton on landing FinalCta, liquid-tabs installed but not wired, New runtime dependencies, Registries installed (shadcn, animate-ui, hairline, hugeicons) (+4 more)

### Community 101 - "Not Found"
Cohesion: 0.22
Nodes (11): NotFoundClient(), metadata, NotFound(), Fetch(), CARD, mix(), NotFound(), NotFoundProps (+3 more)

### Community 102 - "Private"
Cohesion: 0.20
Nodes (11): GuardLedgerRow(), GuardNotice(), GuardNoticeProps, GuardRow, GuardTone, PrivateWorkspaceGuard(), PrivateWorkspaceProps, ReverifyMark() (+3 more)

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

### Community 108 - "Domain Test"
Cohesion: 0.21
Nodes (9): filterAttempts(), duplicateKey(), parseTime(), subjectIds, aliases, numberAfter(), parseReport(), attemptSchema (+1 more)

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

### Community 124 - "Queries Analytics"
Cohesion: 0.33
Nodes (5): Filters, analyticsKeys, analyticsQueryOptions(), serializeAnalyticsParams(), trashListParams()

### Community 125 - "Limit Budget"
Cohesion: 0.49
Nodes (8): budgetState, checkBudget(), initialBudget(), nextBudget(), noteCommand(), resetBudgetForTests(), spendCommand(), BUDGET_CAPS

### Community 126 - "Hairline Dashboard"
Cohesion: 0.39
Nodes (7): Hairline Dashboard Screenshot (degraded/unavailable state), Latest Result Section, Next.js Dev Overlay Issues Badge (2 Issues), Personal Overdue Metric (Nothing overdue in My Tasks), Sidebar Navigation: Study Planner + Results Groups, Today's Plan Dashboard Section, Workspace Header: Breadcrumb, Search, Theme Toggle

### Community 127 - "Explain Search"
Cohesion: 0.22
Nodes (6): @prisma/adapter-pg@^7.10.1, @prisma/adapter-pg, env, match, prisma, queries

### Community 128 - "Trash Cleanup"
Cohesion: 0.31
Nodes (7): bearerToken(), GET, maxDuration, runtime, secretMatches(), CleanupResult, purgeExpiredTrash()

### Community 129 - "Security Changepassworddialog"
Cohesion: 0.22
Nodes (4): ChangePasswordDialog(), DisableTwoFactorDialog(), EnrollDialog(), close()

### Community 130 - "Error Boundary"
Cohesion: 0.25
Nodes (4): ErrorBoundary, ErrorFallback(), Props, State

### Community 131 - "Kbd"
Cohesion: 0.31
Nodes (8): ARROWS, isMac(), Kbd(), KbdProps, MAC, matches(), PC, subscribeNoop()

### Community 132 - "Onboarding Checklist"
Cohesion: 0.39
Nodes (8): Check(), OnboardingChecklist(), OnboardingChecklistProps, OnboardingTask, Ring(), subscribeReduced(), swap(), useReducedMotion()

### Community 133 - "Combo Chart"
Cohesion: 0.39
Nodes (7): ComboChart(), ComboChartProps, ComboDay, monotone(), niceTop(), subscribeReduced(), useReducedMotion()

### Community 134 - "Feature Tabs"
Cohesion: 0.36
Nodes (7): FeatureTab, FeatureTabs(), FeatureTabsProps, Leaving, Pane(), subscribeReduced(), useReducedMotion()

### Community 135 - "Ledger Facts"
Cohesion: 0.43
Nodes (6): LedgerFacts(), Stat, StatsBand(), StatsBandProps, subscribeReduced(), useReducedMotion()

### Community 136 - "Morphing Nav"
Cohesion: 0.36
Nodes (7): MorphingNav(), MorphingNavProps, NavItem, Shown, Slide(), subscribeReduced(), useReducedMotion()

### Community 137 - "Stepper Input"
Cohesion: 0.43
Nodes (7): MinusIcon(), PlusIcon(), shake(), StepperInput(), StepperInputProps, subscribeReduced(), useReducedMotion()

### Community 138 - "Verify Trash"
Cohesion: 0.43
Nodes (6): api(), cookies, created, input, raw(), visible()

### Community 139 - "Announcement Pill"
Cohesion: 0.43
Nodes (6): AnnouncementPill(), AnnouncementPillProps, Arrow(), Phase, subscribeReduced(), useReducedMotion()

### Community 140 - "Citation"
Cohesion: 0.43
Nodes (6): Citation(), CitationProps, CitationSource, hostname(), subscribeReduced(), useReducedMotion()

### Community 142 - "Next Config"
Cohesion: 0.40
Nodes (4): cspDev, cspProduction, nextConfig, productionHeaders

### Community 144 - "Hugeicons Add"
Cohesion: 0.40
Nodes (3): Add01(), Add01Props, animations

### Community 189 - "Plus Sign"
Cohesion: 0.40
Nodes (3): animations, PlusSign(), PlusSignProps

### Community 204 - "Logo Marquee"
Cohesion: 0.60
Nodes (4): LogoMarquee(), LogoMarqueeProps, subscribeReduced(), useReducedMotion()

### Community 205 - "Use Mobile"
Cohesion: 0.70
Nodes (4): getServerSnapshot(), getSnapshot(), subscribe(), useIsMobile()

### Community 206 - "Domain Rules"
Cohesion: 0.50
Nodes (4): attemptSchemaFor(pattern), domain.ts scoring and layout rules, Sectional SectionId model (Section III qualifying), Subject taxonomy (quant/reasoning/english/ga/computer)

### Community 207 - "Error Page"
Cohesion: 1.00
Nodes (4): Browser Connection Error Page, Dashboard Final Screenshot, ERR_CONNECTION_REFUSED, Localhost 127.0.0.1 Dev Server

### Community 210 - "Ai Usage"
Cohesion: 0.67
Nodes (3): GET, runtime, listRecentAiUsage()

### Community 212 - "Connection Refused"
Cohesion: 1.00
Nodes (3): ERR_CONNECTION_REFUSED — 127.0.0.1 refused to connect (Chrome 'This site can't be reached' page), SSC Insight History Route (/history) — intended screenshot subject, not captured, History Reference Screenshot — Chrome ERR_CONNECTION_REFUSED error page

### Community 213 - "Package Overrides"
Cohesion: 0.67
Nodes (3): zod, overrides, @neondatabase/auth

## Ambiguous Edges - Review These
- `Landing()` → `Ink Trend Brush Illustration`  [AMBIGUOUS]
  public/landing/ink-trend.png · relation: conceptually_related_to
- `Dashboard Loading State Screenshot` → `Study Calendar Strip (skeleton row)`  [AMBIGUOUS]
  docs/ui-screenshots/dashboard.png · relation: references
- `History Reference Screenshot — Chrome ERR_CONNECTION_REFUSED error page` → `SSC Insight History Route (/history) — intended screenshot subject, not captured`  [AMBIGUOUS]
  docs/ui-screenshots/history.png · relation: references

## Knowledge Gaps
- **68 isolated node(s):** `RFC-1918`, `Shared read services (src/lib/services/*)`, `origin-core.ts (isSameOrigin)`, `private-workspace.tsx session guard`, `otp-input.tsx boxed 6-digit input` (+63 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1599 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **71 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Motion & Interaction Primitives` to `Study Calendar Layer`, `AI Provider Settings`, `Dashboard View & Primitives`, `Settings Panels`, `Task Editor & Plan View Model`, `Backup & Import Pipeline`, `Date Picker & Form Widgets`, `Buttons & Utility Views`, `Number Roll & Chart Widgets`, `Coo & Fetch Demo Engines`, `Toast & Threshold Widgets`, `My Tasks View`, `Runtime Dependencies`, `Text Morph & Copy Widgets`, `Trend Charts & Time Brush`, `Shared Utils & Icons`, `Command Palette & Result Routes`, `Ask View & Chat Sheet`, `Performance Performance`, `Empty State`, `Data Parts`, `Client`, `Format`, `Film Section`, `Chat Transcript`, `Landing Sections`, `Use Ai`, `Deep Dive`, `Combobox`, `Chrome`, `Require User`, `In Form`, `Data Table`, `Domain Totals`, `Chameleon Hideengine`, `Mock Form`, `Layout`, `Animate React`, `Email Client`, `Ai Extraction`, `Motion`, `Entry Rows`, `Personal Todos`, `Client Types`, `Queries Exams`, `Auth Shell`, `Compare Compare`, `Command Palette`, `Fluted Footer`, `Streaming Answer`, `Appearance`, `Domain`, `Password Input`, `Thinking Trace`, `Up Form`, `Queries Attempts`, `Input Input`, `Settings Security`, `Stack Toast`, `Not Found`, `Private`, `Compare Bars`, `Thinking Indicator`, `Model Picker`, `Dot Meter`, `Faq Accordion`, `Error Boundary`, `Kbd`, `Onboarding Checklist`, `Combo Chart`, `Feature Tabs`, `Ledger Facts`, `Morphing Nav`, `Stepper Input`, `Announcement Pill`, `Citation`, `Hugeicons Activity`, `Hugeicons Add`, `Arrow Down`, `Arrow Left`, `Arrow Right`, `Arrow Up`, `Hugeicons Attachment`, `Bell Ring`, `Hugeicons Bookmark`, `Hugeicons Bot`, `Message Square`, `Hugeicons Calendar`, `Calendar Check`, `Hugeicons Cancel`, `Bar Increasing`, `Chart Column`, `Chart Line`, `Checkmark Circle`, `Clipboard List`, `Hugeicons Clock`, `Hugeicons Compass`, `Hugeicons Delete`, `Hugeicons Download`, `Filter Horizontal`, `Finger Print`, `Hugeicons Flag`, `Hugeicons Flame`, `Hugeicons Flash`, `Folder Open`, `Hugeicons Gauge`, `Hugeicons Globe`, `Hugeicons Hourglass`, `Hugeicons Key`, `Layout Dashboard`, `Hugeicons List`, `Hugeicons Logout`, `Hugeicons Mail`, `Square Plus`, `Square Text`, `Hugeicons Mic`, `Minus Sign`, `Hugeicons Moon`, `More Vertical`, `Hugeicons Notification`, `Pencil Edit`, `Hugeicons Pin`, `Plus Sign`, `Hugeicons Rocket`, `Hugeicons Search`, `Shield Check`, `Sliders Horizontal`, `Square Kanban`, `Hugeicons Star`, `Hugeicons Sun`, `Hugeicons Target`, `Trending Down`, `Trending Up`, `Hugeicons Trophy`, `Hugeicons Upload`, `User Round`, `Wand Sparkles`, `Logo Marquee`, `Use Mobile`?**
  _High betweenness centrality (0.367) - this node is a cross-community bridge._
- **What connects `RFC-1918`, `Shared read services (src/lib/services/*)`, `origin-core.ts (isSameOrigin)` to the rest of the system?**
  _68 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Study Calendar Layer` be split into smaller, more focused modules?**
  _Cohesion score 0.051991150442477874 - nodes in this community are weakly interconnected._
- **Why does `next` connect `Command Palette & Result Routes` to `Study Calendar Layer`, `API Envelope & Route Handlers`, `Error Boundary`, `Dashboard View & Primitives`, `Buttons & Utility Views`, `Next Config`, `Runtime Dependencies`, `Shared Utils & Icons`, `Ask View & Chat Sheet`, `Format`, `Landing Sections`, `User Requireuser`, `Proxy`, `Chrome`, `Require User`, `In Form`, `Domain Totals`, `Layout`, `Auth Shell`, `Not Found`, `Not Found`, `Up Form`, `Queries Attempts`, `Not Found`, `Private`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Should `API Envelope & Route Handlers` be split into smaller, more focused modules?**
  _Cohesion score 0.04757050628610262 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Landing()` and `Ink Trend Brush Illustration`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Dashboard Loading State Screenshot` and `Study Calendar Strip (skeleton row)`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._