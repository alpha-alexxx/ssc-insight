"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/button";
import { DropdownMenu, type MenuEntry } from "@/components/dropdown-menu";
import { PlainIcon } from "@/components/icon";
import { SparklesIcon } from "@/components/animate-ui/icons/hugeicons/sparkles";
import { PlusSignIcon } from "@/components/animate-ui/icons/hugeicons/plus-sign";
import { Tooltip } from "@/components/tooltip";
import { useExamScope } from "@/components/exam-context";
import { istTodayIso } from "@/lib/plan/view-model";
import { VIEW_HREF, type AppView } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth/client";

/**
 * Workspace sidebar — Hairline-only composition.
 *
 * Hairline ships no sidebar primitive, so this is the one composed surface
 * (audit §3): `Sheet` carries it on phones, `Button`/`Tooltip`/`Avatar`/
 * `DropdownMenu` build the rail, and every colour comes from the token set.
 * Geometry is Hairline's own (pill buttons, its radii) — never themed.
 *
 * Desktop: an <aside> that folds between expanded (15rem) and the icon rail
 * (3.5rem); the state persists in the `sidebar_state` cookie so the server
 * layout can render the right first paint. Mobile: the header's menu button
 * opens the Sheet below.
 */

/** Plan-day route for "today" (IST) — computed per render, not at module load. */
export function planHref(dateIso?: string): `/${string}` {
  return `/plan/${dateIso ?? istTodayIso()}`;
}

export const VIEW_META: Record<
  AppView,
  { label: string; icon: Parameters<typeof PlainIcon>[0]["name"] }
> = {
  dashboard: { label: "Dashboard", icon: "dashboard" },
  calendar: { label: "Study calendar", icon: "calendar" },
  tasks: { label: "My tasks", icon: "list" },
  plan: { label: "Daily plan", icon: "layers" },
  history: { label: "Mock history", icon: "history" },
  compare: { label: "Compare mocks", icon: "compare" },
  performance: { label: "Performance", icon: "chart" },
  add: { label: "Log a mock", icon: "add" },
  ask: { label: "AI workspace", icon: "sparkles" },
  trash: { label: "Trash", icon: "trash" },
  settings: { label: "Settings", icon: "settings" },
};

export const NAV_GROUPS: {
  label: string;
  items: { view: AppView; label: string; href: string | (() => string) }[];
}[] = [
  {
    label: "Study planner",
    items: [
      { view: "dashboard", label: "Dashboard", href: VIEW_HREF.dashboard },
      { view: "calendar", label: "Study calendar", href: VIEW_HREF.calendar },
      { view: "plan", label: "Today's plan", href: planHref },
      { view: "tasks", label: "My tasks", href: VIEW_HREF.tasks },
    ],
  },
  {
    label: "Results",
    items: [
      { view: "history", label: "Mock history", href: VIEW_HREF.history },
      { view: "compare", label: "Compare mocks", href: VIEW_HREF.compare },
      { view: "performance", label: "Performance", href: VIEW_HREF.performance },
    ],
  },
  {
    label: "Coach",
    items: [{ view: "ask", label: "AI workspace", href: VIEW_HREF.ask }],
  },
];

function resolveHref(href: string | (() => string)): string {
  return typeof href === "function" ? href() : href;
}

function NavItem({
  item,
  active,
  expanded,
  onNavigate,
}: {
  item: { view: AppView; label: string; href: string };
  active: boolean;
  expanded: boolean;
  onNavigate: () => void;
}) {
  const content = (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        "flex h-9 w-full items-center gap-2.5 rounded-full px-3 text-[13px] font-medium transition-colors",
        expanded ? "justify-start" : "justify-center px-0",
        active
          ? "bg-accent text-accent-foreground hover:bg-accent"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      <PlainIcon
        name={VIEW_META[item.view].icon}
        size={16}
        tone={active ? "primary" : "current"}
      />
      {expanded && <span className="truncate">{item.label}</span>}
    </Link>
  );
  if (expanded) return content;
  return (
    <Tooltip content={item.label} side="right">
      <span className="block w-full">{content}</span>
    </Tooltip>
  );
}

/** The Ask AI affordance — the one animated icon in the rail. */
function AskAiButton({
  aiEnabled,
  onOpenAi,
  expanded,
  inHeader = false,
}: {
  aiEnabled: boolean;
  onOpenAi: () => void;
  expanded?: boolean;
  inHeader?: boolean;
}) {
  if (!aiEnabled) return null;
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={onOpenAi}
      aria-label="Ask AI"
      className={cn(
        "gap-2",
        inHeader ? "h-8 w-auto px-2.5" : "h-9 w-full",
        !inHeader && (expanded ? "justify-start px-3" : "justify-center px-0"),
      )}
    >
      <SparklesIcon size={16} color="var(--primary)" animateOnHover animateOnTap />
      {(expanded || inHeader) && <span>Ask AI</span>}
    </Button>
  );
}

/** Identity + actions menu for the footer block. */
export function SidebarUserMenu({
  name,
  email,
  imageUrl,
  expanded,
  onGoTo,
}: {
  name: string;
  email: string;
  imageUrl: string;
  expanded: boolean;
  onGoTo: (next: "settings" | "trash") => void;
}) {
  const signOut = () => {
    void authClient.signOut({ callbackURL: "/" });
  };
  const trigger = (
    <button
      type="button"
      aria-label="Account menu"
      className={cn(
        "flex w-full items-center gap-2.5 rounded-full p-1.5 transition-colors hover:bg-accent",
        expanded ? "justify-start" : "justify-center p-0",
      )}
    >
      <Avatar name={name || "My workspace"} src={imageUrl || undefined} size="sm" />
      {expanded && (
        <span className="grid min-w-0 flex-1 text-left">
          <span className="truncate text-[12px] font-medium leading-none text-foreground">
            {name || "My workspace"}
          </span>
          <span className="mt-1 truncate text-[10px] leading-none text-muted-foreground">
            {email || "Private account"}
          </span>
        </span>
      )}
    </button>
  );

  const items: MenuEntry[] = [
    { type: "label", label: name || "My workspace" },
    { id: "settings", label: "Settings", icon: <PlainIcon name="settings" size={14} />, onSelect: () => onGoTo("settings") },
    { id: "trash", label: "Trash", icon: <PlainIcon name="trash" size={14} />, onSelect: () => onGoTo("trash") },
    { type: "separator" },
    { id: "signout", label: "Sign out", icon: <PlainIcon name="logout" size={14} />, destructive: true, onSelect: signOut },
  ];

  return (
    <DropdownMenu
      trigger={trigger}
      items={items}
      side="top"
      align={expanded ? "start" : "center"}
      label="Account"
      minWidth={expanded ? 200 : 220}
    />
  );
}

function ActiveExamFooterNote({ expanded }: { expanded: boolean }) {
  const scope = useExamScope();
  if (!expanded) return null;
  const label = scope.exams
    ? scope.examLabel(scope.activeExamId, scope.activeTierId)
    : "SSC CGL";
  return (
    <p className="flex items-center gap-1.5 px-3 py-2 text-[10px] leading-relaxed text-muted-foreground">
      <PlainIcon name="calendar" size={11} />
      {label} · dates in IST
    </p>
  );
}

export interface WorkspaceSidebarProps {
  view: AppView;
  userName: string;
  userEmail: string;
  userImage: string;
  aiEnabled: boolean;
  expanded: boolean;
  onOpenAi: () => void;
  onAddMock: () => void;
  onGoTo: (next: "settings" | "trash") => void;
  onNavigate?: () => void;
}

/** The sidebar body — shared by the desktop aside and the mobile sheet. */
export function WorkspaceSidebarBody(props: WorkspaceSidebarProps) {
  const {
    view,
    userName,
    userEmail,
    userImage,
    aiEnabled,
    expanded,
    onOpenAi,
    onAddMock,
    onGoTo,
    onNavigate = () => undefined,
  } = props;
  const routerPathname = usePathname();
  void routerPathname;

  return (
    <div className="flex h-full min-h-0 flex-col bg-sidebar text-sidebar-foreground">
      {/* Brand */}
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-sidebar-border",
          expanded ? "gap-2.5 px-3" : "justify-center px-0",
        )}
      >
        <Link
          href="/dashboard"
          aria-label="SSC Insight dashboard"
          onClick={onNavigate}
          className="flex items-center gap-2.5"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-full border border-sidebar-border bg-background">
            <PlainIcon name="book" size={16} tone="primary" />
          </span>
          {expanded && (
            <span className="grid min-w-0 text-left">
              <span className="truncate font-serif text-[1.1875rem] font-semibold leading-none tracking-[-0.035em]">
                ssc<span className="text-primary">insight.</span>
              </span>
              <span className="mt-1 truncate text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Mock workspace
              </span>
            </span>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav aria-label="Workspace" className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-4 last:mb-0">
            {expanded ? (
              <p className="mb-1.5 flex items-center gap-2.5 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {group.label}
                <span className="h-px flex-1 bg-border" aria-hidden="true" />
              </p>
            ) : (
              <div className="mx-auto mb-1.5 h-px w-6 bg-border" aria-hidden="true" />
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.view}>
                  <NavItem
                    item={{ ...item, href: resolveHref(item.href) }}
                    active={view === item.view}
                    expanded={expanded}
                    onNavigate={onNavigate}
                  />
                </li>
              ))}
              {group.label === "Results" && (
                <li className={expanded ? "pt-1.5" : "pt-1"}>
                  {expanded ? (
                    <Button variant="primary" size="sm" onClick={onAddMock} className="h-9 w-full justify-start gap-2 px-3">
                      <PlusSignIcon size={16} color="var(--primary-foreground)" animateOnHover animateOnTap />
                      <span>Log a mock</span>
                    </Button>
                  ) : (
                    <Tooltip content="Log a mock" side="right">
                      <Button variant="primary" size="icon" onClick={onAddMock} className="size-9">
                        <PlusSignIcon size={16} color="var(--primary-foreground)" animateOnTap />
                      </Button>
                    </Tooltip>
                  )}
                </li>
              )}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="flex shrink-0 flex-col gap-2 border-t border-sidebar-border p-2">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onGoTo("settings")}
            className={cn(
              "h-8 min-w-0 flex-1 justify-center gap-1.5 px-2",
              view === "settings" && "bg-accent text-accent-foreground",
            )}
          >
            <PlainIcon name="settings" size={14} />
            {expanded && <span className="truncate">Settings</span>}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onGoTo("trash")}
            className={cn(
              "h-8 min-w-0 flex-1 justify-center gap-1.5 px-2",
              view === "trash" && "bg-accent text-accent-foreground",
            )}
          >
            <PlainIcon name="trash" size={14} />
            {expanded && <span className="truncate">Trash</span>}
          </Button>
        </div>
        <AskAiButton aiEnabled={aiEnabled} onOpenAi={onOpenAi} expanded={expanded} />
        <SidebarUserMenu
          name={userName}
          email={userEmail}
          imageUrl={userImage}
          expanded={expanded}
          onGoTo={onGoTo}
        />
        <ActiveExamFooterNote expanded={expanded} />
      </div>
    </div>
  );
}
