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
      {
        view: "performance",
        label: "Performance",
        href: VIEW_HREF.performance,
      },
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

/* ------------------------------------------------------------------ */
/*  Navigation item                                                    */
/* ------------------------------------------------------------------ */

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
  const isTodayPlan = item.view === "plan";

  const content = (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        "group relative flex h-9 items-center rounded-xl text-[13px] transition-all",
        expanded
          ? "w-full justify-start gap-2.5 px-3"
          : "mx-auto size-9 justify-center px-0",
        active
          ? "bg-accent font-semibold text-accent-foreground shadow-2xs ring-1 ring-sidebar-border/80"
          : "font-medium text-muted-foreground hover:bg-accent/60 hover:text-foreground",
      )}
    >
      {/* Active left accent bar */}
      {active && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute left-0 rounded-r-full bg-primary",
            expanded ? "top-2 bottom-2 w-0.75" : "top-2.5 bottom-2.5 w-0.5",
          )}
        />
      )}

      <span
        className={cn(
          "flex shrink-0 items-center justify-center transition-transform duration-150 group-hover:scale-105",
          active
            ? "text-primary"
            : "text-muted-foreground group-hover:text-foreground",
        )}
      >
        <PlainIcon
          name={VIEW_META[item.view].icon}
          size={16}
          tone={active ? "primary" : "current"}
        />
      </span>

      {expanded && (
        <>
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          {isTodayPlan && (
            <span
              className={cn(
                "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-tight",
                active
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground group-hover:bg-background/80",
              )}
            >
              Today
            </span>
          )}
        </>
      )}
    </Link>
  );

  if (expanded) return content;

  return (
    <Tooltip content={item.label} side="right">
      <span className="flex w-full justify-center">{content}</span>
    </Tooltip>
  );
}

/* ------------------------------------------------------------------ */
/*  Ask AI trigger — the one animated icon in the rail                 */
/* ------------------------------------------------------------------ */

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

  const button = (
    <Button
      variant="secondary"
      size="sm"
      onClick={onOpenAi}
      aria-label="Ask AI"
      className={cn(
        "group relative overflow-hidden border border-primary/20 bg-primary/8 text-foreground shadow-2xs transition-all hover:border-primary/35 hover:bg-primary/14",
        inHeader
          ? "h-8 w-auto gap-2 px-2.5"
          : expanded
            ? "h-9 w-full justify-start gap-2.5 px-3"
            : "mx-auto size-9 justify-center px-0",
      )}
    >
      <SparklesIcon
        size={16}
        color="var(--primary)"
        animateOnHover
        animateOnTap
      />
      {(expanded || inHeader) && (
        <>
          <span className="font-medium">Ask AI</span>
          {!inHeader && (
            <span className="ml-auto rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
              Coach
            </span>
          )}
        </>
      )}
    </Button>
  );

  if (expanded || inHeader) return button;

  return (
    <Tooltip content="Ask AI" side="right">
      <span className="flex w-full justify-center">{button}</span>
    </Tooltip>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer identity + account dropdown                                 */
/* ------------------------------------------------------------------ */

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

  const displayName = name || "My workspace";
  const displayEmail = email || "Private account";

  const triggerButton = (
    <button
      type="button"
      aria-label="Account menu"
      className={cn(
        "group flex items-center rounded-xl border border-transparent text-left transition-all hover:border-sidebar-border/80 hover:bg-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        expanded
          ? "w-full justify-start gap-2.5 p-1.5"
          : "mx-auto size-9 justify-center p-0",
      )}
    >
      <span className="relative shrink-0">
        <Avatar name={displayName} src={imageUrl || undefined} size="sm" />
        <span
          aria-hidden="true"
          className="
          absolute -right-0.5 -bottom-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-sidebar"
        />
      </span>

      {expanded && (
        <>
          <span className="grid min-w-0 flex-1">
            <span className="truncate text-[12px] font-semibold leading-tight text-foreground">
              {displayName}
            </span>
            <span className="mt-0.5 truncate text-[10px] leading-tight text-muted-foreground">
              {displayEmail}
            </span>
          </span>
          <span className="shrink-0 pr-0.5 text-muted-foreground opacity-60 transition-opacity group-hover:opacity-100">
            <PlainIcon name="moreVertical" size={14} tone="current" />
          </span>
        </>
      )}
    </button>
  );

  const items: MenuEntry[] = [
    { type: "label", label: displayName },
    {
      id: "settings",
      label: "Settings",
      icon: <PlainIcon name="settings" size={14} />,
      onSelect: () => onGoTo("settings"),
    },
    {
      id: "trash",
      label: "Trash",
      icon: <PlainIcon name="trash" size={14} />,
      onSelect: () => onGoTo("trash"),
    },
    { type: "separator" },
    {
      id: "signout",
      label: "Sign out",
      icon: <PlainIcon name="logout" size={14} />,
      destructive: true,
      onSelect: signOut,
    },
  ];

  const menu = (
    <DropdownMenu
      trigger={triggerButton}
      items={items}
      side="top"
      align={expanded ? "start" : "center"}
      label="Account"
      minWidth={expanded ? 216 : 220}
    />
  );

  if (expanded) return menu;

  return (
    <Tooltip content={`${displayName} · Account`} side="right">
      <span className="flex w-full justify-center">{menu}</span>
    </Tooltip>
  );
}

/* ------------------------------------------------------------------ */
/*  Workspace sidebar body                                             */
/* ------------------------------------------------------------------ */

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
    <div className="flex h-full min-h-0 flex-col bg-sidebar text-sidebar-foreground select-none">
      {/* ── Brand Header ── */}
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-sidebar-border/80",
          expanded ? "px-3.5" : "justify-center px-0",
        )}
      >
        <Link
          href="/dashboard"
          aria-label="SSC Insight dashboard"
          onClick={onNavigate}
          className={cn(
            "group flex items-center gap-2.5 rounded-xl transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            expanded ? "w-full" : "justify-center",
          )}
        >
          <span className="relative grid size-8 shrink-0 place-items-center rounded-xl border border-sidebar-border bg-background shadow-2xs ring-1 ring-primary/10 transition-transform duration-150 group-hover:scale-[1.03]">
            <PlainIcon name="book" size={16} tone="primary" />
          </span>

          {expanded && (
            <span className="grid min-w-0 flex-1 text-left">
              <span className="truncate font-serif text-[1.1875rem] font-semibold leading-none tracking-[-0.035em] text-foreground">
                ssc<span className="text-primary">insight.</span>
              </span>
              <span className="mt-1 truncate text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
                Mock workspace
              </span>
            </span>
          )}
        </Link>
      </div>

      {/* ── Primary Navigation ── */}
      <nav
        aria-label="Workspace"
        className={cn(
          "no-scrollbar min-h-0 flex-1 overflow-y-auto py-3",
          expanded ? " space-y-5 px-2.5" : "space-y-3 px-1.5",
        )}
      >
        {NAV_GROUPS.map((group, groupIdx) => (
          <div key={group.label}>
            {expanded ? (
              <p className="mb-1.5 flex items-center gap-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
                <span>{group.label}</span>
                <span
                  className="h-px flex-1 bg-sidebar-border/70"
                  aria-hidden="true"
                />
              </p>
            ) : (
              groupIdx > 0 && (
                <div
                  className="mx-auto mb-2.5 h-px w-5 bg-sidebar-border/80"
                  aria-hidden="true"
                />
              )
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

              {/* Primary Mock-Logging CTA */}
              {group.label === "Results" && (
                <li
                  className={expanded ? "pt-2" : "flex justify-center pt-1.5"}
                >
                  {expanded ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={onAddMock}
                      className="h-9 w-full justify-start gap-2.5 px-3 shadow-xs"
                    >
                      <PlusSignIcon
                        size={16}
                        color="var(--primary-foreground)"
                        animateOnHover
                        animateOnTap
                      />
                      <span className="font-medium">Log a mock</span>
                    </Button>
                  ) : (
                    <Tooltip content="Log a mock" side="right">
                      <Button
                        variant="primary"
                        size="icon"
                        onClick={onAddMock}
                        aria-label="Log a mock"
                        className="size-9 shadow-xs"
                      >
                        <PlusSignIcon
                          size={16}
                          color="var(--primary-foreground)"
                          animateOnTap
                        />
                      </Button>
                    </Tooltip>
                  )}
                </li>
              )}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── Footer Utilities & Account ── */}
      <div
        className={cn(
          "flex shrink-0 flex-col border-t border-sidebar-border/80 bg-sidebar/60",
          expanded ? "gap-2 p-2.5" : "items-center gap-1.5 px-1.5 py-2.5",
        )}
      >
        <AskAiButton
          aiEnabled={aiEnabled}
          onOpenAi={onOpenAi}
          expanded={expanded}
        />

        {/* Quick Utility Strip: Side-by-side when expanded, stacked with tooltips when collapsed */}
        {expanded ? (
          <div className="grid grid-cols-2 gap-1 rounded-xl border border-sidebar-border/60 bg-background/40 p-0.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onGoTo("settings")}
              className={cn(
                "h-7 justify-center gap-1.5 rounded-lg px-2 text-xs",
                view === "settings"
                  ? "bg-accent font-semibold text-accent-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <PlainIcon
                name="settings"
                size={14}
                tone={view === "settings" ? "primary" : "current"}
              />
              <span className="truncate">Settings</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onGoTo("trash")}
              className={cn(
                "h-7 justify-center gap-1.5 rounded-lg px-2 text-xs",
                view === "trash"
                  ? "bg-accent font-semibold text-accent-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <PlainIcon
                name="trash"
                size={14}
                tone={view === "trash" ? "primary" : "current"}
              />
              <span className="truncate">Trash</span>
            </Button>
          </div>
        ) : (
          <div className="flex w-full flex-col items-center gap-1">
            <Tooltip content="Settings" side="right">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Settings"
                onClick={() => onGoTo("settings")}
                className={cn(
                  "size-9",
                  view === "settings"
                    ? "bg-accent text-accent-foreground ring-1 ring-sidebar-border/80"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <PlainIcon
                  name="settings"
                  size={16}
                  tone={view === "settings" ? "primary" : "current"}
                />
              </Button>
            </Tooltip>

            <Tooltip content="Trash" side="right">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Trash"
                onClick={() => onGoTo("trash")}
                className={cn(
                  "size-9",
                  view === "trash"
                    ? "bg-accent text-accent-foreground ring-1 ring-sidebar-border/80"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <PlainIcon
                  name="trash"
                  size={16}
                  tone={view === "trash" ? "primary" : "current"}
                />
              </Button>
            </Tooltip>
          </div>
        )}

        <div className="h-px w-full bg-sidebar-border/60" aria-hidden="true" />

        <SidebarUserMenu
          name={userName}
          email={userEmail}
          imageUrl={userImage}
          expanded={expanded}
          onGoTo={onGoTo}
        />
      </div>
    </div>
  );
}
