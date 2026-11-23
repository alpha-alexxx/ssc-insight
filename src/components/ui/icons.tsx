/**
 * Hugeicons barrel — the single source of icons for the whole app.
 *
 * Replaces `lucide-react` and `@duo-icons/react`. Every lucide name used in the
 * codebase is re-exported here as a wrapper component with the same call API
 * (`<Search size={16} />`, `<X className="..." />`, `<Loader2 className="animate-spin" />`),
 * so call sites only change the import source:
 *
 *   import { Search, Plus, X } from "lucide-react"
 *   →
 *   import { Search, Plus, X } from "@/components/ui/icons"
 *
 * Wrappers render `<HugeiconsIcon>` with `primaryColor="currentColor"` so they
 * inherit text color (matching lucide's `currentColor` stroke). `strokeWidth`
 * and `size` pass through. `secondaryColor` is available for duotone contexts.
 *
 * Canonical sizes (kept from the prior system): 14 micro · 16 inline ·
 * 18 nav/row · 22 tile · 28 large tile. Default 24 matches lucide.
 *
 * Source priority: shadcn core → @animate-ui → @hairline → custom. Icons are
 * not registry components; Hugeicons is the icon library (consistent stroke
 * style, one size scale) per the rebuild spec.
 */
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement, HugeiconsIconProps } from "@hugeicons/react";
import {
  Activity01Icon,
  Add01Icon,
  AiSparklesIcon,
  Alert01Icon,
  AlertCircleIcon,
  ArrowDown01Icon,
  ArrowDownRight01Icon,
  ArrowDownToLineIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  ArrowUpRight01Icon,
  Award01Icon,
  BarChartIcon,
  BellIcon,
  Book01Icon,
  BookOpen01Icon,
  Brain01Icon,
  BrainCircuitIcon,
  Calendar03Icon,
  CalendarClockIcon,
  Calculator01Icon,
  Cancel01Icon,
  ChartColumnIncreasingIcon,
  CheckIcon,
  CheckListIcon,
  CheckmarkBadge01Icon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardPasteIcon,
  Clock01Icon,
  Clock02Icon,
  Columns3CogIcon,
  Compass01Icon,
  ComputerIcon,
  CopyIcon as CopyIconData,
  DashboardSquare02Icon,
  Delete01Icon,
  EllipsisIcon,
  EyeIcon,
  EyeOffIcon,
  File01Icon,
  FileCheckIcon,
  Fire02Icon,
  Flag01Icon,
  FlaskConicalIcon,
  FolderOpenIcon as FolderOpenIconData,
  GitBranchIcon as GitBranchIconData,
  GitCompareArrowsIcon,
  GitCompareIcon,
  Globe02Icon,
  HistoryIcon,
  ImagePlusIcon,
  InformationCircleIcon,
  Layers01Icon,
  LightbulbIcon,
  Loading03Icon,
  Logout01Icon,
  Mail01Icon,
  Menu01Icon,
  MessageSquareIcon,
  MinusSignIcon,
  MonitorSmartphoneIcon,
  Moon02Icon,
  MoreHorizontalIcon,
  PanelLeftIcon,
  PauseIcon,
  PencilEdit01Icon,
  PlayIcon,
  PlusSignIcon,
  QuestionIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  SaveIcon,
  ScanLineIcon,
  Search01Icon,
  Settings01Icon,
  Share02Icon,
  Shield01Icon,
  ShieldCheckIcon,
  ShieldOffIcon,
  SlidersHorizontalIcon,
  StarAward01Icon,
  Sun02Icon,
  Tag01Icon,
  Target01Icon,
  TrendingUpIcon,
  Upload04Icon,
  UserCircleIcon,
  WrenchIcon,
  ZapIcon,
} from "@hugeicons/core-free-icons";

/** Props every icon wrapper accepts (lucide-compatible subset + Hugeicons extras). */
export type IconProps = Omit<HugeiconsIconProps, "icon">;

/** Re-export the raw data type + generic component for advanced use. */
export type { IconSvgElement } from "@hugeicons/react";
export { HugeiconsIcon } from "@hugeicons/react";

/**
 * Build a lucide-compatible wrapper around a Hugeicons icon-data element.
 * `primaryColor` defaults to `currentColor` so the glyph inherits text color,
 * matching lucide's stroke behavior. `secondaryColor` enables native duotone.
 */
function makeIcon(icon: IconSvgElement) {
  return function HugeIconWrapper({
    size = 24,
    className,
    strokeWidth,
    absoluteStrokeWidth,
    primaryColor = "currentColor",
    secondaryColor,
    disableSecondaryOpacity,
    altIcon,
    showAlt,
    ...rest
  }: IconProps) {
    return (
      <HugeiconsIcon
        icon={icon}
        size={size}
        className={className}
        strokeWidth={strokeWidth}
        absoluteStrokeWidth={absoluteStrokeWidth}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        disableSecondaryOpacity={disableSecondaryOpacity}
        altIcon={altIcon}
        showAlt={showAlt}
        aria-hidden="true"
        {...rest}
      />
    );
  };
}

/* Re-export the raw icon data for components that need native duotone control
   (primaryColor/secondaryColor per render), e.g. `src/components/icon.tsx`. */
export {
  Activity01Icon as ActivityIconData,
  Add01Icon as AddIconData,
  AiSparklesIcon as SparklesIconData,
  Alert01Icon as WarningIconData,
  AlertCircleIcon as DangerIconData,
  ArrowDownRight01Icon as ArrowDownRightIconData,
  ArrowDownToLineIcon as DownloadIconData,
  ArrowLeft01Icon as ArrowLeftIconData,
  ArrowRight01Icon as ArrowRightIconData,
  ArrowUpRight01Icon as ArrowUpRightIconData,
  Award01Icon as AwardIconData,
  Book01Icon as BookIconData,
  Brain01Icon as BrainIconData,
  Calendar03Icon as CalendarIconData,
  Clock01Icon as ClockIconData,
  Clock02Icon as TimerIconData,
  BellIcon as BellIconData,
  Calculator01Icon as CalculatorIconData,
  Cancel01Icon as CloseIconData,
  ChartColumnIncreasingIcon as ReportIconData,
  CheckIcon as CheckIconData,
  ChevronDownIcon as ChevronDownIconData,
  ChevronRightIcon as ChevronRightIconData,
  ClipboardPasteIcon as PasteIconData,
  ComputerIcon as ComputerIconData,
  DashboardSquare02Icon as DashboardIconData,
  Delete01Icon as TrashIconData,
  EllipsisIcon as MoreIconData,
  File01Icon as FileIconData,
  FileCheckIcon as FileCheckIconData,
  Fire02Icon as FireIconData,
  GitCompareArrowsIcon as CompareIconData,
  Globe02Icon as GlobeIconData,
  HistoryIcon as HistoryIconData,
  InformationCircleIcon as InfoIconData,
  Layers01Icon as LayersIconData,
  Logout01Icon as LogoutIconData,
  Menu01Icon as MenuIconData,
  MinusSignIcon as MinusIconData,
  Moon02Icon as MoonIconData,
  PlusSignIcon as PlusIconData,
  QuestionIcon as HelpIconData,
  RefreshCwIcon as RefreshIconData,
  SaveIcon as SaveIconData,
  Search01Icon as SearchIconData,
  Settings01Icon as SettingsIconData,
  ShieldCheckIcon as ShieldIconData,
  Sun02Icon as SunIconData,
  Target01Icon as TargetIconData,
  TrendingUpIcon as TrendIconData,
  Upload04Icon as UploadIconData,
  UserCircleIcon as UserIconData,
};

/* ---- lucide-compatible named wrappers (the 79 distinct names used in app) ---- */

// navigation & views
export const Dashboard = makeIcon(DashboardSquare02Icon);
export const History = makeIcon(HistoryIcon);
export const Compass = makeIcon(Compass01Icon);

// actions
export const Activity = makeIcon(Activity01Icon);
export const AddCircle = makeIcon(Add01Icon);
export const Check = makeIcon(CheckIcon);
export const CheckCircle = makeIcon(CheckIcon);
export const Copy = makeIcon(CopyIconData);
export const CopyIcon = Copy;
export const ClipboardPaste = makeIcon(ClipboardPasteIcon);
export const Delete = makeIcon(Delete01Icon);
export const Ellipsis = makeIcon(EllipsisIcon);
export const Eye = makeIcon(EyeIcon);
export const EyeOff = makeIcon(EyeOffIcon);
export const FileCheck2 = makeIcon(FileCheckIcon);
export const Flag = makeIcon(Flag01Icon);
export const ImagePlus = makeIcon(ImagePlusIcon);
export const List = makeIcon(Menu01Icon);
export const ListChecks = makeIcon(CheckListIcon);
export const ListTodo = makeIcon(CheckListIcon);
export const Loader2 = makeIcon(Loading03Icon);
export const LogOut = makeIcon(Logout01Icon);
export const MailWarning = makeIcon(Mail01Icon);
export const MessageSquare = makeIcon(MessageSquareIcon);
export const Minus = makeIcon(MinusSignIcon);
export const MoreHorizontal = makeIcon(MoreHorizontalIcon);
export const Pause = makeIcon(PauseIcon);
export const Pencil = makeIcon(PencilEdit01Icon);
export const Play = makeIcon(PlayIcon);
export const Plus = makeIcon(PlusSignIcon);
export const RefreshCw = makeIcon(RefreshCwIcon);
export const RotateCcw = makeIcon(RotateCcwIcon);
export const Save = makeIcon(SaveIcon);
export const ScanLine = makeIcon(ScanLineIcon);
export const Search = makeIcon(Search01Icon);
export const Share2 = makeIcon(Share02Icon);
export const Share2Icon = Share2;
export const SlidersHorizontal = makeIcon(SlidersHorizontalIcon);
export const Sparkles = makeIcon(AiSparklesIcon);
export const SquarePen = makeIcon(PencilEdit01Icon);
export const Star = makeIcon(StarAward01Icon);
export const StarIcon = Star;
export const Tag = makeIcon(Tag01Icon);
export const TagIcon = Tag;
export const Trash2 = makeIcon(Delete01Icon);
export const Wrench = makeIcon(WrenchIcon);
export const X = makeIcon(Cancel01Icon);
export const Zap = makeIcon(ZapIcon);

// arrows & chevrons
export const ArrowDown = makeIcon(ArrowDown01Icon);
export const ArrowDownRight = makeIcon(ArrowDownRight01Icon);
export const ArrowDownToLine = makeIcon(ArrowDownToLineIcon);
export const ArrowLeft = makeIcon(ArrowLeft01Icon);
export const ArrowRight = makeIcon(ArrowRight01Icon);
export const ArrowUp = makeIcon(ArrowUp01Icon);
export const ArrowUpRight = makeIcon(ArrowUpRight01Icon);
export const ChevronDown = makeIcon(ChevronDownIcon);
export const ChevronLeft = makeIcon(ChevronLeftIcon);
export const ChevronRight = makeIcon(ChevronRightIcon);

// concepts
export const Award = makeIcon(Award01Icon);
export const BarChart3 = makeIcon(BarChartIcon);
export const Bell = makeIcon(BellIcon);
export const BookOpen = makeIcon(BookOpen01Icon);
export const Brain = makeIcon(Brain01Icon);
export const BrainCircuit = makeIcon(BrainCircuitIcon);
export const Calculator = makeIcon(Calculator01Icon);
export const CalendarClock = makeIcon(CalendarClockIcon);
export const CalendarDays = makeIcon(Calendar03Icon);
export const CalendarPlus = makeIcon(Calendar03Icon);
export const ChartNoAxesColumnIncreasing = makeIcon(ChartColumnIncreasingIcon);
export const CircleHelp = makeIcon(QuestionIcon);
export const Columns3 = makeIcon(Columns3CogIcon);
export const FlaskConical = makeIcon(FlaskConicalIcon);
export const FolderOpen = makeIcon(FolderOpenIconData);
export const FolderOpenIcon = FolderOpen;
export const GitBranch = makeIcon(GitBranchIconData);
export const GitBranchIcon = GitBranch;
export const GitCompare = makeIcon(GitCompareIcon);
export const GitCompareArrows = makeIcon(GitCompareArrowsIcon);
export const Layers3 = makeIcon(Layers01Icon);
export const Lightbulb = makeIcon(LightbulbIcon);
export const Monitor = makeIcon(ComputerIcon);
export const MonitorSmartphone = makeIcon(MonitorSmartphoneIcon);
export const PanelLeftDashed = makeIcon(PanelLeftIcon);
export const Shield = makeIcon(Shield01Icon);
export const ShieldCheck = makeIcon(ShieldCheckIcon);
export const ShieldOff = makeIcon(ShieldOffIcon);
export const TrendingUp = makeIcon(TrendingUpIcon);

// badges
export const BadgeCheck = makeIcon(CheckmarkBadge01Icon);

// themes
export const Menu = makeIcon(Menu01Icon);
export const Moon = makeIcon(Moon02Icon);
export const Settings = makeIcon(Settings01Icon);
export const Sun = makeIcon(Sun02Icon);

// subjects (re-exported for symmetry; icon.tsx owns the semantic layer)
export const Book = makeIcon(Book01Icon);
export const Calendar = makeIcon(Calendar03Icon);
export const Computer = makeIcon(ComputerIcon);
export const File = makeIcon(File01Icon);
export const Fire = makeIcon(Fire02Icon);
export const Globe = makeIcon(Globe02Icon);
export const Target = makeIcon(Target01Icon);
export const UploadFile = makeIcon(Upload04Icon);
export const UserCard = makeIcon(UserCircleIcon);

// lucide type alias for backward-compat with code that annotates `LucideIcon`.
// The wrapper component type is structurally compatible for the props in use.
export type LucideIcon = ReturnType<typeof makeIcon>;

/** Generic icon renderer for data-driven cases: `<Icon icon={data} size={16} />`. */
export function Icon({ icon, ...rest }: { icon: IconSvgElement } & IconProps) {
  return <HugeiconsIcon icon={icon} aria-hidden="true" {...rest} />;
}
