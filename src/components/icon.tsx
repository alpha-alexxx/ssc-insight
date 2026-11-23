"use client";
// Unified icon system for the Hairline rebuild.
//
// Two sources, one semantic vocabulary:
// - Animate UI animated Hugeicons (`@animate-ui/icons-hugeicons-*`, installed
//   through the shadcn CLI; land in components/animate-ui/icons/hugeicons/).
//   Used on interactive surfaces, opt-in per call site via `animated`.
// - Static Hugeicons via `HugeiconsIcon` + `@hugeicons/core-free-icons` — the
//   default everywhere (dense lists, tables, inline text) and the fallback for
//   every semantic name with no animated equivalent.
//
// The density rule: static in dense lists/tables and inline text; animated on
// interactive elements (hover + tap); a few hero icons on landing (view-once);
// `loop` reserved for progress affordances.
//
// Sizes come from one scale: 14 micro · 16 inline (default) · 20 control ·
// 24 feature. No ad-hoc values.
//
// ANIMATED INVENTORY (79 installed; every slug verified against the
// @animate-ui registry — slugs are never guessed):
//   activity-01, add-01, arrow-down-01, arrow-left-01, arrow-right-01,
//   arrow-up-01, attachment-01, battery-medium-01, bell-ring, bookmark,
//   bot, bot-message-square, calendar, calendar-check, calendar-plus,
//   cancel-01, chart-bar-increasing, chart-column, chart-line,
//   chart-no-axes-column, checkmark-circle-02, circle-check-big,
//   clipboard-list, clock-01, compass, copy-01, delete-02, download-01,
//   filter-horizontal, finger-print, flag, flame, flash, folder-open,
//   gauge, globe-02, hourglass, key-01, layout-dashboard, list, loading-03,
//   lock-keyhole, logout-01, mail-01, menu-01, message-square-plus,
//   message-square-text, mic, minus-sign, moon-02, more-horizontal,
//   more-vertical, notification-01, panel-left, pause, pencil-edit-02, pin,
//   play, plus-sign, refresh, rocket-01, search-01, send-horizontal,
//   settings-02, share-03, shield-check, sliders-horizontal, sparkles,
//   square-kanban, star, sun-03, target-01, trending-down, trending-up,
//   trophy, upload-01, user-round, view, wand-sparkles.
//
// STATIC-ONLY semantic names (no animated slug exists — recorded):
//   history, compare, help, save, paste, file, fileCheck, book, award,
//   layers, warning, danger, info, arrowUpRight, arrowDownRight,
//   chevronRight, chevronDown, quant, reasoning, english, computer.

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

import { Activity01Icon as AActivity } from "@/components/animate-ui/icons/hugeicons/activity-01";
import { Add01Icon as AAdd } from "@/components/animate-ui/icons/hugeicons/add-01";
import { Attachment01Icon as APaperclip } from "@/components/animate-ui/icons/hugeicons/attachment-01";
import { BatteryMedium01Icon as ABattery } from "@/components/animate-ui/icons/hugeicons/battery-medium-01";
import { BellRingIcon as ABellRing } from "@/components/animate-ui/icons/hugeicons/bell-ring";
import { BookmarkIcon as ABookmark } from "@/components/animate-ui/icons/hugeicons/bookmark";
import { BotMessageSquareIcon as ABot } from "@/components/animate-ui/icons/hugeicons/bot-message-square";
import { CalendarCheckIcon as ACalendarCheck } from "@/components/animate-ui/icons/hugeicons/calendar-check";
import { CalendarPlusIcon as ACalendarPlus } from "@/components/animate-ui/icons/hugeicons/calendar-plus";
import { CalendarIcon as ACalendar } from "@/components/animate-ui/icons/hugeicons/calendar";
import { Cancel01Icon as AClose } from "@/components/animate-ui/icons/hugeicons/cancel-01";
import { ChartBarIncreasingIcon as AReport } from "@/components/animate-ui/icons/hugeicons/chart-bar-increasing";
import { ChartLineIcon as AChartLine } from "@/components/animate-ui/icons/hugeicons/chart-line";
import { ChartNoAxesColumnIcon as AChart } from "@/components/animate-ui/icons/hugeicons/chart-no-axes-column";
import { CheckmarkCircle02Icon as ACheckCircle } from "@/components/animate-ui/icons/hugeicons/checkmark-circle-02";
import { CircleCheckBigIcon as ASuccess } from "@/components/animate-ui/icons/hugeicons/circle-check-big";
import { ClipboardListIcon as AClipboard } from "@/components/animate-ui/icons/hugeicons/clipboard-list";
import { Clock01Icon as AClock } from "@/components/animate-ui/icons/hugeicons/clock-01";
import { CompassIcon as ACompass } from "@/components/animate-ui/icons/hugeicons/compass";
import { Copy01Icon as ACopy } from "@/components/animate-ui/icons/hugeicons/copy-01";
import { Delete02Icon as ATrash } from "@/components/animate-ui/icons/hugeicons/delete-02";
import { Download01Icon as ADownload } from "@/components/animate-ui/icons/hugeicons/download-01";
import { FilterHorizontalIcon as AFilter } from "@/components/animate-ui/icons/hugeicons/filter-horizontal";
import { FingerPrintIcon as AFingerprint } from "@/components/animate-ui/icons/hugeicons/finger-print";
import { FlagIcon as AFlag } from "@/components/animate-ui/icons/hugeicons/flag";
import { FlameIcon as AFire } from "@/components/animate-ui/icons/hugeicons/flame";
import { FlashIcon as AFlash } from "@/components/animate-ui/icons/hugeicons/flash";
import { FolderOpenIcon as AFolder } from "@/components/animate-ui/icons/hugeicons/folder-open";
import { GaugeIcon as AGauge } from "@/components/animate-ui/icons/hugeicons/gauge";
import { Globe02Icon as AGlobe } from "@/components/animate-ui/icons/hugeicons/globe-02";
import { HourglassIcon as ATimer } from "@/components/animate-ui/icons/hugeicons/hourglass";
import { Key01Icon as AKey } from "@/components/animate-ui/icons/hugeicons/key-01";
import { LayoutDashboardIcon as ADashboard } from "@/components/animate-ui/icons/hugeicons/layout-dashboard";
import { ListIcon as AList } from "@/components/animate-ui/icons/hugeicons/list";
import { Loading03Icon as ALoading } from "@/components/animate-ui/icons/hugeicons/loading-03";
import { LockKeyholeIcon as ALock } from "@/components/animate-ui/icons/hugeicons/lock-keyhole";
import { Logout01Icon as ALogout } from "@/components/animate-ui/icons/hugeicons/logout-01";
import { Mail01Icon as AMail } from "@/components/animate-ui/icons/hugeicons/mail-01";
import { Menu01Icon as AMenu } from "@/components/animate-ui/icons/hugeicons/menu-01";
import { MessageSquarePlusIcon as AChatPlus } from "@/components/animate-ui/icons/hugeicons/message-square-plus";
import { MessageSquareTextIcon as AChat } from "@/components/animate-ui/icons/hugeicons/message-square-text";
import { MicIcon as AMic } from "@/components/animate-ui/icons/hugeicons/mic";
import { MinusSignIcon as AMinus } from "@/components/animate-ui/icons/hugeicons/minus-sign";
import { Moon02Icon as AMoon } from "@/components/animate-ui/icons/hugeicons/moon-02";
import { MoreHorizontalIcon as AMore } from "@/components/animate-ui/icons/hugeicons/more-horizontal";
import { MoreVerticalIcon as AMoreVertical } from "@/components/animate-ui/icons/hugeicons/more-vertical";
import { Notification01Icon as ABell } from "@/components/animate-ui/icons/hugeicons/notification-01";
import { PanelLeftIcon as APanelLeft } from "@/components/animate-ui/icons/hugeicons/panel-left";
import { PauseIcon as APause } from "@/components/animate-ui/icons/hugeicons/pause";
import { PencilEdit02Icon as AEdit } from "@/components/animate-ui/icons/hugeicons/pencil-edit-02";
import { PinIcon as APin } from "@/components/animate-ui/icons/hugeicons/pin";
import { PlayIcon as APlay } from "@/components/animate-ui/icons/hugeicons/play";
import { PlusSignIcon as APlus } from "@/components/animate-ui/icons/hugeicons/plus-sign";
import { RefreshIcon as ARefresh } from "@/components/animate-ui/icons/hugeicons/refresh";
import { Rocket01Icon as ARocket } from "@/components/animate-ui/icons/hugeicons/rocket-01";
import { Search01Icon as ASearch } from "@/components/animate-ui/icons/hugeicons/search-01";
import { SendHorizontalIcon as ASend } from "@/components/animate-ui/icons/hugeicons/send-horizontal";
import { Settings02Icon as ASettings } from "@/components/animate-ui/icons/hugeicons/settings-02";
import { Share03Icon as AShare } from "@/components/animate-ui/icons/hugeicons/share-03";
import { ShieldCheckIcon as AShield } from "@/components/animate-ui/icons/hugeicons/shield-check";
import { SlidersHorizontalIcon as ASliders } from "@/components/animate-ui/icons/hugeicons/sliders-horizontal";
import { SparklesIcon as ASparkles } from "@/components/animate-ui/icons/hugeicons/sparkles";
import { SquareKanbanIcon as AKanban } from "@/components/animate-ui/icons/hugeicons/square-kanban";
import { StarIcon as AStar } from "@/components/animate-ui/icons/hugeicons/star";
import { Sun03Icon as ASun } from "@/components/animate-ui/icons/hugeicons/sun-03";
import { Target01Icon as ATarget } from "@/components/animate-ui/icons/hugeicons/target-01";
import { TrendingDownIcon as ATrendDown } from "@/components/animate-ui/icons/hugeicons/trending-down";
import { TrendingUpIcon as ATrend } from "@/components/animate-ui/icons/hugeicons/trending-up";
import { TrophyIcon as ATrophy } from "@/components/animate-ui/icons/hugeicons/trophy";
import { Upload01Icon as AUpload } from "@/components/animate-ui/icons/hugeicons/upload-01";
import { UserRoundIcon as AUser } from "@/components/animate-ui/icons/hugeicons/user-round";
import { ViewIcon as AView } from "@/components/animate-ui/icons/hugeicons/view";
import { WandSparklesIcon as AWand } from "@/components/animate-ui/icons/hugeicons/wand-sparkles";
import { ArrowLeft01Icon as AArrowLeft } from "@/components/animate-ui/icons/hugeicons/arrow-left-01";
import { ArrowRight01Icon as AArrowRight } from "@/components/animate-ui/icons/hugeicons/arrow-right-01";

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

type AnimatedCmp = React.ComponentType<{
  size?: number;
  color?: string;
  animateOnHover?: boolean;
  animateOnTap?: boolean;
  animateOnView?: boolean;
  animateOnViewOnce?: boolean;
  loop?: boolean;
  loopDelay?: number;
  speed?: number;
  delay?: number;
}>;

/** Animated variants that exist in the @animate-ui registry (never guessed). */
const ANIMATED_ICONS: Partial<Record<IconName, AnimatedCmp>> = {
  // navigation & views
  dashboard: ADashboard as AnimatedCmp,
  settings: ASettings as AnimatedCmp,
  menu: AMenu as AnimatedCmp,
  panelLeft: APanelLeft as AnimatedCmp,
  // themes
  sun: ASun as AnimatedCmp,
  moon: AMoon as AnimatedCmp,
  // actions
  add: AAdd as AnimatedCmp,
  plus: APlus as AnimatedCmp,
  check: ACheckCircle as AnimatedCmp,
  close: AClose as AnimatedCmp,
  search: ASearch as AnimatedCmp,
  refresh: ARefresh as AnimatedCmp,
  more: AMore as AnimatedCmp,
  moreVertical: AMoreVertical as AnimatedCmp,
  sparkles: ASparkles as AnimatedCmp,
  logout: ALogout as AnimatedCmp,
  copy: ACopy as AnimatedCmp,
  share: AShare as AnimatedCmp,
  edit: AEdit as AnimatedCmp,
  view: AView as AnimatedCmp,
  filter: AFilter as AnimatedCmp,
  sliders: ASliders as AnimatedCmp,
  play: APlay as AnimatedCmp,
  pause: APause as AnimatedCmp,
  send: ASend as AnimatedCmp,
  mic: AMic as AnimatedCmp,
  wand: AWand as AnimatedCmp,
  // data & files
  download: ADownload as AnimatedCmp,
  upload: AUpload as AnimatedCmp,
  report: AReport as AnimatedCmp,
  trash: ATrash as AnimatedCmp,
  clipboard: AClipboard as AnimatedCmp,
  bookmark: ABookmark as AnimatedCmp,
  pin: APin as AnimatedCmp,
  flag: AFlag as AnimatedCmp,
  folder: AFolder as AnimatedCmp,
  // concepts
  target: ATarget as AnimatedCmp,
  trend: ATrend as AnimatedCmp,
  trendDown: ATrendDown as AnimatedCmp,
  clock: AClock as AnimatedCmp,
  timer: ATimer as AnimatedCmp,
  bell: ABell as AnimatedCmp,
  bellRing: ABellRing as AnimatedCmp,
  calendar: ACalendar as AnimatedCmp,
  calendarPlus: ACalendarPlus as AnimatedCmp,
  calendarCheck: ACalendarCheck as AnimatedCmp,
  shield: AShield as AnimatedCmp,
  user: AUser as AnimatedCmp,
  fire: AFire as AnimatedCmp,
  activity: AActivity as AnimatedCmp,
  trophy: ATrophy as AnimatedCmp,
  gauge: AGauge as AnimatedCmp,
  compass: ACompass as AnimatedCmp,
  rocket: ARocket as AnimatedCmp,
  flash: AFlash as AnimatedCmp,
  star: AStar as AnimatedCmp,
  chart: AChart as AnimatedCmp,
  chartLine: AChartLine as AnimatedCmp,
  kanban: AKanban as AnimatedCmp,
  list: AList as AnimatedCmp,
  key: AKey as AnimatedCmp,
  lock: ALock as AnimatedCmp,
  mail: AMail as AnimatedCmp,
  fingerprint: AFingerprint as AnimatedCmp,
  battery: ABattery as AnimatedCmp,
  // AI surfaces
  ai: ABot as AnimatedCmp,
  chat: AChat as AnimatedCmp,
  chatPlus: AChatPlus as AnimatedCmp,
  paperclip: APaperclip as AnimatedCmp,
  // statuses
  success: ASuccess as AnimatedCmp,
  loading: ALoading as AnimatedCmp,
  // directions
  arrowLeft: AArrowLeft as AnimatedCmp,
  arrowRight: AArrowRight as AnimatedCmp,
  minus: AMinus as AnimatedCmp,
  // subjects
  ga: AGlobe as AnimatedCmp,
};

/** Resolve a semantic name to its static Hugeicons icon-data element. */
export function resolveIcon(name: IconName): IconSvgElement {
  return STATIC_ICONS[name] ?? Activity01Icon;
}

/** True when the semantic name has an animated variant installed. */
export function hasAnimated(name: IconName): boolean {
  return Boolean(ANIMATED_ICONS[name]);
}

export type IconTone =
  | "current"
  | "foreground"
  | "primary"
  | "muted"
  | "destructive"
  | "success"
  | "warning";

const TONE_COLOR: Record<IconTone, string> = {
  current: "currentColor",
  foreground: "var(--foreground)",
  primary: "var(--primary)",
  muted: "var(--muted-foreground)",
  destructive: "var(--destructive)",
  success: "var(--success)",
  warning: "var(--warning)",
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
  animated = false,
  animateOn = "hover",
  loop = false,
  tone = "current",
  title,
  className = "",
  strokeWidth = 2,
}: {
  name: IconName;
  /** One of 14/16/20/24 in practice; no hard enum so compose stays flexible. */
  size?: number;
  animated?: boolean;
  animateOn?: IconTrigger;
  loop?: boolean;
  tone?: IconTone;
  /** Accessible name when the icon stands alone. */
  title?: string;
  className?: string;
  strokeWidth?: number;
}) {
  const AnimatedCmp = animated ? ANIMATED_ICONS[name] : undefined;
  if (AnimatedCmp) {
    const animatedProps = {
      size,
      color: TONE_COLOR[tone],
      ...(animateOn === "hover" ? { animateOnHover: true, animateOnTap: true } : {}),
      ...(animateOn === "tap" ? { animateOnTap: true } : {}),
      ...(animateOn === "viewOnce" ? { animateOnView: true, animateOnViewOnce: true } : {}),
      ...(loop ? { loop: true, loopDelay: 0.6 } : {}),
    };
    return (
      <span
        className={`inline-flex shrink-0 align-[-0.125em] ${className}`}
        role={title ? "img" : undefined}
        aria-label={title}
        aria-hidden={title ? undefined : true}
      >
        <AnimatedCmp {...animatedProps} />
      </span>
    );
  }
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
    <Icon
      name={name}
      size={size}
      tone={tone}
      className={className}
      strokeWidth={strokeWidth}
      animated={false}
    />
  );
}
