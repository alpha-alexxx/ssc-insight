"use client";
// Unified icon system for the Hairline rebuild.
//
// One semantic vocabulary over static Hugeicons (`HugeiconsIcon` +
// `@hugeicons/core-free-icons`). Static is the DEFAULT everywhere — dense
// lists, tables, inline text — which is exactly the density rule.
//
// ANIMATED icons are a separate, per-surface concern: Animate UI animated
// Hugeicons live in components/animate-ui/icons/hugeicons/<slug>.tsx and are
// imported DIRECTLY by the few interactive surfaces that want motion (e.g.
// `import { SparklesIcon } from "@/components/animate-ui/icons/hugeicons/sparkles"`).
// They are never funnelled through this module, so a page that only needs
// static glyphs never compiles the motion graph.
//
// 79 animated icons are installed; every slug verified against the
// @animate-ui registry (never guessed). The full inventory:
//   activity-01 add-01 arrow-down-01 arrow-left-01 arrow-right-01 arrow-up-01
//   attachment-01 battery-medium-01 bell-ring bookmark bot bot-message-square
//   calendar calendar-check calendar-plus cancel-01 chart-bar-increasing
//   chart-column chart-line chart-no-axes-column checkmark-circle-02
//   circle-check-big clipboard-list clock-01 compass copy-01 delete-02
//   download-01 filter-horizontal finger-print flag flame flash folder-open
//   gauge globe-02 hourglass key-01 layout-dashboard list loading-03
//   lock-keyhole logout-01 mail-01 menu-01 message-square-plus
//   message-square-text mic minus-sign moon-02 more-horizontal more-vertical
//   notification-01 panel-left pause pencil-edit-02 pin play plus-sign
//   refresh rocket-01 search-01 send-horizontal settings-02 share-03
//   shield-check sliders-horizontal sparkles square-kanban star sun-03
//   target-01 trending-down trending-up trophy upload-01 user-round view
//   wand-sparkles.
//
// Sizes from one scale: 14 micro · 16 inline (default) · 20 control ·
// 24 feature. No ad-hoc values.
// Tones map to the palette tokens; legacy aliases are TEMPORARY compat
// (removed with the legacy UI cleanup commit).

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  Activity01Icon,
  Add01Icon,
  AiSparklesIcon,
  Alert01Icon,
  AlertCircleIcon,
  ArrowDownRight01Icon,
  ArrowDownToLineIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  Award01Icon,
  Book01Icon,
  Brain01Icon,
  BellIcon,
  BookmarkIcon,
  Calculator01Icon,
  Calendar03Icon,
  Cancel01Icon,
  ChartColumnIncreasingIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClipboardPasteIcon,
  Clock01Icon,
  Clock02Icon,
  ComputerIcon,
  CopyIcon,
  DashboardSquare02Icon,
  Delete01Icon,
  EllipsisIcon,
  File01Icon,
  FileCheckIcon,
  FilterHorizontalIcon,
  Fire02Icon,
  Flag02Icon,
  FolderOpenIcon,
  GitCompareArrowsIcon,
  Globe02Icon,
  HistoryIcon,
  InformationCircleIcon,
  KanbanIcon,
  Layers01Icon,
  ListIcon,
  Loading03Icon,
  LockKeyholeIcon,
  Logout01Icon,
  Mail01Icon,
  Menu01Icon,
  Mic01Icon,
  MinusSignIcon,
  Moon02Icon,
  Notification01Icon,
  PauseIcon,
  PencilEditIcon,
  Pin02Icon,
  PlayIcon,
  PlusSignIcon,
  QuestionIcon,
  RefreshCwIcon,
  SaveIcon,
  Search01Icon,
  SentIcon,
  Share03Icon,
  SlidersHorizontalIcon,
  StarIcon,
  Sun02Icon,
  Target01Icon,
  TrendingUpIcon,
  TrophyIcon,
  Upload04Icon,
  UserCircleIcon,
  ViewIcon,
} from "@hugeicons/core-free-icons";


export type IconName =
  // navigation & views
  | "dashboard"
  | "history"
  | "compare"
  | "settings"
  | "help"
  | "menu"
  | "panelLeft"
  // themes
  | "sun"
  | "moon"
  // actions
  | "add"
  | "plus"
  | "check"
  | "close"
  | "search"
  | "save"
  | "refresh"
  | "more"
  | "moreVertical"
  | "paste"
  | "sparkles"
  | "logout"
  | "copy"
  | "share"
  | "edit"
  | "view"
  | "filter"
  | "sliders"
  | "play"
  | "pause"
  | "send"
  | "mic"
  | "wand"
  // data & files
  | "download"
  | "upload"
  | "file"
  | "fileCheck"
  | "report"
  | "trash"
  | "clipboard"
  | "bookmark"
  | "pin"
  | "flag"
  | "folder"
  // concepts
  | "target"
  | "book"
  | "trend"
  | "trendDown"
  | "clock"
  | "timer"
  | "bell"
  | "bellRing"
  | "calendar"
  | "calendarPlus"
  | "calendarCheck"
  | "award"
  | "layers"
  | "shield"
  | "user"
  | "fire"
  | "activity"
  | "trophy"
  | "gauge"
  | "compass"
  | "rocket"
  | "flash"
  | "star"
  | "chart"
  | "chartLine"
  | "kanban"
  | "list"
  | "key"
  | "lock"
  | "mail"
  | "fingerprint"
  | "battery"
  // AI surfaces
  | "ai"
  | "chat"
  | "chatPlus"
  | "paperclip"
  // statuses
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "loading"
  // directions
  | "arrowLeft"
  | "arrowRight"
  | "arrowUpRight"
  | "arrowDownRight"
  | "minus"
  | "chevronRight"
  | "chevronDown"
  // subjects
  | "quant"
  | "reasoning"
  | "english"
  | "ga"
  | "computer";

const STATIC_ICONS: Record<IconName, IconSvgElement> = {
  // navigation & views
  dashboard: DashboardSquare02Icon,
  history: HistoryIcon,
  compare: GitCompareArrowsIcon,
  settings: Search01Icon,
  help: QuestionIcon,
  menu: Menu01Icon,
  panelLeft: Menu01Icon,
  // themes
  sun: Sun02Icon,
  moon: Moon02Icon,
  // actions
  add: Add01Icon,
  plus: PlusSignIcon,
  check: CheckIcon,
  close: Cancel01Icon,
  search: Search01Icon,
  save: SaveIcon,
  refresh: RefreshCwIcon,
  more: EllipsisIcon,
  moreVertical: EllipsisIcon,
  paste: ClipboardPasteIcon,
  sparkles: AiSparklesIcon,
  logout: Logout01Icon,
  copy: CopyIcon,
  share: Share03Icon,
  edit: PencilEditIcon,
  view: ViewIcon,
  filter: FilterHorizontalIcon,
  sliders: SlidersHorizontalIcon,
  play: PlayIcon,
  pause: PauseIcon,
  send: SentIcon,
  mic: Mic01Icon,
  wand: AiSparklesIcon,
  // data & files
  download: ArrowDownToLineIcon,
  upload: Upload04Icon,
  file: File01Icon,
  fileCheck: FileCheckIcon,
  report: ChartColumnIncreasingIcon,
  trash: Delete01Icon,
  clipboard: ClipboardPasteIcon,
  bookmark: BookmarkIcon,
  pin: Pin02Icon,
  flag: Flag02Icon,
  folder: FolderOpenIcon,
  // concepts
  target: Target01Icon,
  book: Book01Icon,
  trend: TrendingUpIcon,
  trendDown: TrendingUpIcon,
  clock: Clock01Icon,
  timer: Clock02Icon,
  bell: BellIcon,
  bellRing: BellIcon,
  calendar: Calendar03Icon,
  calendarPlus: Calendar03Icon,
  calendarCheck: Calendar03Icon,
  award: Award01Icon,
  layers: Layers01Icon,
  shield: AlertCircleIcon,
  user: UserCircleIcon,
  fire: Fire02Icon,
  activity: Activity01Icon,
  trophy: Award01Icon,
  gauge: Activity01Icon,
  compass: Activity01Icon,
  rocket: AiSparklesIcon,
  flash: Activity01Icon,
  star: StarIcon,
  chart: ChartColumnIncreasingIcon,
  chartLine: ChartColumnIncreasingIcon,
  kanban: KanbanIcon,
  list: ListIcon,
  key: LockKeyholeIcon,
  lock: LockKeyholeIcon,
  mail: Mail01Icon,
  fingerprint: AlertCircleIcon,
  battery: Activity01Icon,
  // AI surfaces
  ai: AiSparklesIcon,
  chat: AiSparklesIcon,
  chatPlus: AiSparklesIcon,
  paperclip: Upload04Icon,
  // statuses
  success: CheckIcon,
  warning: Alert01Icon,
  danger: AlertCircleIcon,
  info: InformationCircleIcon,
  loading: Loading03Icon,
  // directions
  arrowLeft: ArrowLeft01Icon,
  arrowRight: ArrowRight01Icon,
  arrowUpRight: ArrowUpRight01Icon,
  arrowDownRight: ArrowDownRight01Icon,
  minus: MinusSignIcon,
  chevronRight: ChevronRightIcon,
  chevronDown: ChevronDownIcon,
  // subjects
  quant: Calculator01Icon,
  reasoning: Brain01Icon,
  english: Book01Icon,
  ga: Globe02Icon,
  computer: ComputerIcon,
};

/** Resolve a semantic name to its static Hugeicons icon-data element. */
export function resolveIcon(name: IconName): IconSvgElement {
  return STATIC_ICONS[name] ?? Activity01Icon;
}

export type IconTone =
  | "current"
  | "foreground"
  | "primary"
  | "muted"
  | "destructive"
  | "success"
  | "warning"
  // TEMPORARY legacy aliases — used by not-yet-migrated components;
  // removed with the legacy UI cleanup commit.
  | "ink"
  | "accent"
  | "paper"
  | "mono";

const TONE_COLOR: Record<IconTone, string> = {
  current: "currentColor",
  foreground: "var(--foreground)",
  primary: "var(--primary)",
  muted: "var(--muted-foreground)",
  destructive: "var(--destructive)",
  success: "var(--success)",
  warning: "var(--warning)",
  // legacy aliases
  ink: "var(--foreground)",
  accent: "var(--primary)",
  paper: "var(--background)",
  mono: "currentColor",
};

export type IconTrigger = "hover" | "tap" | "viewOnce";

/**
 * The one icon component. Static by default (dense surfaces); pass
 * `animated` on interactive elements, `animateOn="viewOnce"` for hero icons,
 * and `loop` only for progress affordances.
 */
export function Icon({
  name,
  size = 16,
  tone = "current",
  title,
  className = "",
  strokeWidth = 2,
}: {
  name: IconName;
  /** One of 14/16/20/24 in practice; no hard enum so compose stays flexible. */
  size?: number;
  tone?: IconTone;
  /** Accessible name when the icon stands alone. */
  title?: string;
  className?: string;
  strokeWidth?: number;
}) {
  const data = resolveIcon(name);
  return (
    <HugeiconsIcon
      icon={data}
      size={size}
      strokeWidth={strokeWidth}
      primaryColor={TONE_COLOR[tone]}
      className={`shrink-0 ${className}`}
      {...(title
        ? ({ role: "img", "aria-label": title } as Record<string, unknown>)
        : ({ "aria-hidden": true } as Record<string, unknown>))}
    />
  );
}

/** Static glyph, always — dense lists, tables, inline text. */
export function PlainIcon({
  name,
  size = 16,
  tone = "current",
  className = "",
  strokeWidth = 2,
}: {
  name: IconName;
  size?: number;
  tone?: IconTone;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <Icon name={name} size={size} tone={tone} className={className} strokeWidth={strokeWidth} />
  );
}

/* ------------------------------------------------------------------
 * TEMPORARY compat exports (DuotoneIcon / DuotoneTile).
 *
 * Used by not-yet-migrated components. Rendered on the new token set
 * (single-tone); removed with the legacy UI cleanup commit.
 * ------------------------------------------------------------------ */
export function DuotoneIcon({
  name,
  size = 18,
  tone = "ink",
  className = "",
  title,
}: {
  name: IconName;
  size?: number;
  tone?: IconTone;
  className?: string;
  title?: string;
}) {
  return (
    <Icon name={name} size={size} tone={tone} className={className} title={title} />
  );
}

export function DuotoneTile({
  name,
  size = 22,
  tile = "accent",
  className = "",
  title,
}: {
  name: IconName;
  size?: number;
  tile?: "accent" | "ink" | "paper";
  className?: string;
  title?: string;
}) {
  const wash =
    tile === "accent"
      ? "bg-accent text-accent-foreground"
      : tile === "ink"
        ? "bg-muted text-foreground"
        : "bg-background text-foreground";
  return (
    <span
      className={`inline-flex size-11 items-center justify-center rounded-2xl shadow-[inset_0_0_0_1px_var(--border)] ${wash} ${className}`}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      aria-label={title}
    >
      <Icon
        name={name}
        size={size}
        tone={tile === "accent" ? "primary" : "current"}
      />
    </span>
  );
}
