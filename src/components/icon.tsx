"use client";
// Named imports (not a namespace import) so the bundler can drop the ~6000
// unused glyphs from the client bundle.
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
  BellIcon,
  Brain01Icon,
  Calendar03Icon,
  Calculator01Icon,
  Cancel01Icon,
  ChartColumnIncreasingIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClipboardPasteIcon,
  Clock01Icon,
  Clock02Icon,
  ComputerIcon,
  DashboardSquare02Icon,
  Delete01Icon,
  EllipsisIcon,
  File01Icon,
  FileCheckIcon,
  Fire02Icon,
  GitCompareArrowsIcon,
  Globe02Icon,
  HistoryIcon,
  InformationCircleIcon,
  Layers01Icon,
  Logout01Icon,
  Menu01Icon,
  MinusSignIcon,
  Moon02Icon,
  PlusSignIcon,
  QuestionIcon,
  RefreshCwIcon,
  SaveIcon,
  Search01Icon,
  Settings01Icon,
  ShieldCheckIcon,
  Sun02Icon,
  Target01Icon,
  TrendingUpIcon,
  Upload04Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";

/**
 * Unified icon system — rebuilt on Hugeicons.
 *
 * Hugeicons ships true duotone glyphs natively (`primaryColor` + `secondaryColor`
 * with built-in secondary opacity), so the prior "echo technique" (two stacked
 * Lucide line icons) is retired. Every semantic name renders as a single
 * `<HugeiconsIcon>` whose two layers are tinted from design tokens, so dark
 * mode and palette/style switches flip the colors automatically via CSS
 * custom properties.
 *
 * Rendering:
 * - `PlainIcon` — single-tone glyph (micro utility: close, chevrons, search).
 *   `primaryColor` only; no secondary layer.
 * - `DuotoneIcon` — true duotone (feature surfaces). `primaryColor` + a token
 *   `secondaryColor` wash; `tone="mono"` collapses back to single-tone.
 * - `DuotoneTile` — `DuotoneIcon` inside a 44px bordered wash tile.
 *
 * Canonical sizes (no ad-hoc values): 14 micro · 16 inline · 18 nav/row ·
 * 22 tile · 28 large tile. Default sizes match (16/18/22).
 *
 * Icon library: Hugeicons only. One consistent stroke style + size scale across
 * the app. `lucide-react` and `@duo-icons/react` are removed.
 */

export type IconName =
  // navigation & views
  | "dashboard"
  | "history"
  | "compare"
  | "settings"
  | "help"
  | "menu"
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
  | "paste"
  | "sparkles"
  | "logout"
  // data & files
  | "download"
  | "upload"
  | "file"
  | "fileCheck"
  | "report"
  | "trash"
  // concepts
  | "target"
  | "book"
  | "trend"
  | "clock"
  | "timer"
  | "bell"
  | "calendar"
  | "award"
  | "layers"
  | "shield"
  | "user"
  | "fire"
  | "activity"
  // statuses
  | "success"
  | "warning"
  | "danger"
  | "info"
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

const ICONS: Record<IconName, IconSvgElement> = {
  // navigation & views
  dashboard: DashboardSquare02Icon,
  history: HistoryIcon,
  compare: GitCompareArrowsIcon,
  settings: Settings01Icon,
  help: QuestionIcon,
  menu: Menu01Icon,
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
  paste: ClipboardPasteIcon,
  sparkles: AiSparklesIcon,
  logout: Logout01Icon,
  // data & files
  download: ArrowDownToLineIcon,
  upload: Upload04Icon,
  file: File01Icon,
  fileCheck: FileCheckIcon,
  report: ChartColumnIncreasingIcon,
  trash: Delete01Icon,
  // concepts
  target: Target01Icon,
  book: Book01Icon,
  trend: TrendingUpIcon,
  clock: Clock01Icon,
  timer: Clock02Icon,
  bell: BellIcon,
  calendar: Calendar03Icon,
  award: Award01Icon,
  layers: Layers01Icon,
  shield: ShieldCheckIcon,
  user: UserCircleIcon,
  fire: Fire02Icon,
  activity: Activity01Icon,
  // statuses
  success: CheckIcon,
  warning: Alert01Icon,
  danger: AlertCircleIcon,
  info: InformationCircleIcon,
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

/** Resolve a semantic name to its Hugeicons icon-data element. */
export function resolveIcon(name: IconName): IconSvgElement {
  return ICONS[name] ?? Activity01Icon;
}

export type IconTone = "ink" | "accent" | "paper" | "muted" | "mono";

/**
 * Map a tone to Hugeicons `primaryColor`/`secondaryColor` (CSS token strings).
 * Duotone contexts pass a secondary wash; `mono` always collapses to one layer.
 */
function toneColors(
  tone: IconTone,
  duotone: boolean,
): { primaryColor: string; secondaryColor?: string } {
  if (!duotone || tone === "mono") {
    if (tone === "accent") return { primaryColor: "var(--accent)" };
    if (tone === "paper") return { primaryColor: "var(--paper)" };
    if (tone === "muted") return { primaryColor: "var(--muted)" };
    return { primaryColor: "var(--ink)" };
  }
  switch (tone) {
    case "accent":
      return { primaryColor: "var(--accent)", secondaryColor: "var(--accent-soft)" };
    case "paper":
      return { primaryColor: "var(--paper)", secondaryColor: "var(--ink)" };
    case "muted":
      return { primaryColor: "var(--muted)", secondaryColor: "var(--accent)" };
    case "ink":
    default:
      return { primaryColor: "var(--ink)", secondaryColor: "var(--accent)" };
  }
}

/** True duotone rendering for any semantic icon name. */
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
  /** Accessible name when the icon stands alone. */
  title?: string;
}) {
  const data = resolveIcon(name);
  const { primaryColor, secondaryColor } = toneColors(tone, true);
  return (
    <span
      className={`duotone relative inline-flex shrink-0 ${className}`}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <HugeiconsIcon
        icon={data}
        size={size}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        className="shrink-0"
      />
    </span>
  );
}

/**
 * Icon inside a tile — feature cards, empty states, panel headers.
 * `tile` selects the wash; accent = terracotta wash, ink = charcoal wash.
 */
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
      ? "bg-accent-soft border-accent/30"
      : tile === "ink"
        ? "bg-soft border-rule-soft"
        : "bg-paper border-rule-soft";
  const tone: IconTone = tile === "accent" ? "accent" : "ink";
  return (
    <span
      className={`duotone-tile inline-flex size-11 items-center justify-center border rounded-card ${wash} ${className}`}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      aria-label={title}
    >
      <DuotoneIcon name={name} size={size} tone={tone} />
    </span>
  );
}

/** Plain single-tone glyph for micro utility use (close, chevrons, search). */
export function PlainIcon({
  name,
  size = 16,
  className = "",
  strokeWidth = 1.75,
  tone = "ink",
}: {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
  tone?: IconTone;
}) {
  const data = resolveIcon(name);
  const { primaryColor } = toneColors(tone, false);
  return (
    <HugeiconsIcon
      icon={data}
      size={size}
      strokeWidth={strokeWidth}
      primaryColor={primaryColor}
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    />
  );
}
