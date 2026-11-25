"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/button";
import { DropdownMenu, type MenuEntry } from "@/components/dropdown-menu";
import { PlainIcon } from "@/components/icon";
import { PlusSignIcon } from "@/components/animate-ui/icons/hugeicons/plus-sign";
import { PanelLeftIcon } from "@/components/animate-ui/icons/hugeicons/panel-left";
import { useExamScope } from "@/components/exam-context";
import { analyticsKeys } from "@/lib/queries/analytics";
import { attemptKeys } from "@/lib/queries/attempts";
import {
  examsKeys,
  putScopeRequest,
  switcherEntries,
  type SwitcherEntry,
} from "@/lib/queries/exams";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog } from "@/components/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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

/** Sidebar group for each view — feeds the "Workspace / {group} / {view}" breadcrumb. */
export function navGroupForView(view: AppView): string | null {
  const group = NAV_GROUPS.find((g) =>
    g.items.some((item) => item.view === view),
  );
  return group?.label ?? null;
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
/*  Navigation item                                                   */
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
/*  Footer identity + account dropdown                                */
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const scope = useExamScope();
  const queryClient = useQueryClient();

  const signOut = () => {
    setSigningOut(true);
    void authClient.signOut({ callbackURL: "/" });
  };

  const displayName = name || "My workspace";
  const displayEmail = email || "Private account";

  // Same scope switch the header ExamSwitcher performed — one entry per
  // enabled tier plus the combined "All tiers" view. A checkbox row keeps the
  // menu open while the write lands (like the theme pickers), and keyboard
  // navigation reaches every tier.
  const switchScope = async (entry: SwitcherEntry) => {
    if (!scope.exams || switching) return;
    setSwitching(true);
    try {
      const fresh = await putScopeRequest({
        activeExamId: entry.examId,
        activeTierId: entry.tierId,
        enabledTiers: scope.exams.enabledTiers,
      });
      queryClient.setQueryData(examsKeys.current(), fresh);
      await queryClient.invalidateQueries({ queryKey: attemptKeys.all });
      await queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
    } finally {
      setSwitching(false);
    }
  };

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
          className="absolute -right-0.5 -bottom-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-sidebar"
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

  const entries = scope.exams ? switcherEntries(scope.exams) : [];
  const activeKey = scope.exams
    ? `${scope.exams.activeExamId}:${scope.exams.activeTierId}`
    : "";

  const items: MenuEntry[] = [
    { type: "label", label: displayName },
    // The exam scope moved here from the app header. It lists only the exams
    // the user enabled in Settings (Exams & tiers); which tier of an exam is
    // active is a Settings concern — the switcher just moves between exams.
    ...(scope.exams
      ? ([
          { type: "label", label: "Exam" },
          ...(entries.length === 0
            ? [
                {
                  type: "item" as const,
                  id: "no-exams",
                  label: "No exams selected yet",
                  disabled: true,
                },
              ]
            : entries.map((entry) => ({
                type: "checkbox" as const,
                id: entry.key,
                label: entry.label,
                checked: entry.key === activeKey,
                onCheckedChange: () => void switchScope(entry),
              }))),
          {
            type: "item" as const,
            id: "manage-exams",
            label: "Manage exams",
            icon: <PlainIcon name="settings" size={14} />,
            onSelect: () => {
              setMenuOpen(false);
              onGoTo("settings");
            },
          },
        ] satisfies MenuEntry[])
      : []),
    { type: "separator" },
    {
      id: "signout",
      label: "Log out",
      icon: <PlainIcon name="logout" size={14} />,
      destructive: true,
      onSelect: () => setConfirmOpen(true),
    },
  ];

  const menu = (
    <>
      <DropdownMenu
        trigger={triggerButton}
        items={items}
        side="top"
        align={expanded ? "start" : "center"}
        label="Account"
        minWidth={expanded ? 216 : 220}
        open={menuOpen}
        onOpenChange={setMenuOpen}
      />
      {/* Logout confirmation — a decision, so it gets its own dialog even when
          the menu that opened it sits in the phone Sheet's top layer. */}
      <Dialog
        open={confirmOpen}
        onOpenChange={(next) => {
          if (!signingOut) setConfirmOpen(next);
        }}
        title="Log out of workspace?"
        description="You can sign back in any time to pick up right where you left off."
        size="sm"
        footer={({ close }) => (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={close}
              disabled={signingOut}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={signOut}
              disabled={signingOut}
              className="gap-2"
            >
              <PlainIcon name="logout" size={14} tone="current" />
              <span>{signingOut ? "Signing out…" : "Log out"}</span>
            </Button>
          </>
        )}
      >
        <div className="overflow-hidden rounded-xl border border-sidebar-border/80 bg-accent/40 shadow-2xs">
          {/* Active account row */}
          <div className="flex items-center gap-2.5 p-2.5">
            <span className="relative shrink-0">
              <Avatar
                name={displayName}
                src={imageUrl || undefined}
                size="sm"
              />
              <span
                aria-hidden="true"
                className="absolute -right-0.5 -bottom-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-background"
              />
            </span>

            <div className="grid min-w-0 flex-1 text-left">
              <span className="truncate text-[12px] font-semibold leading-tight text-foreground">
                {displayName}
              </span>
              <span className="mt-0.5 truncate text-[11px] leading-tight text-muted-foreground">
                {displayEmail}
              </span>
            </div>

            <span className="shrink-0 rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-tight text-primary">
              Synced
            </span>
          </div>

          {/* Hairline divider */}
          <div
            className="h-px w-full bg-sidebar-border/70"
            aria-hidden="true"
          />

          {/* Workspace reassurance strip */}
          <div className="flex items-center gap-2 bg-background/50 px-2.5 py-2 text-[11px] text-muted-foreground">
            <PlainIcon name="layers" size={14} tone="primary" />
            <span className="truncate">
              Your study plan, mock history, and tasks stay saved.
            </span>
          </div>
        </div>
      </Dialog>
    </>
  );

  if (expanded) return menu;

  return (
    <Tooltip content={`${displayName} · Account`} side="right">
      <span className="flex w-full justify-center">{menu}</span>
    </Tooltip>
  );
}

/* ------------------------------------------------------------------ */
/*  Workspace sidebar body                                            */
/* ------------------------------------------------------------------ */

export interface WorkspaceSidebarProps {
  view: AppView;
  userName: string;
  userEmail: string;
  userImage: string;
  expanded: boolean;
  onAddMock: () => void;
  onGoTo: (next: "settings" | "trash") => void;
  onNavigate?: () => void;
  /** Desktop only: fold the rail back out from the collapsed state. */
  onToggleSidebar?: () => void;
  /** Which surface hosts the body: the fixed desktop rail or the phone Sheet. */
  variant?: "desktop" | "mobile";
}

/** The sidebar body — shared by the desktop aside and the mobile sheet. */
export function WorkspaceSidebarBody(props: WorkspaceSidebarProps) {
  const {
    view,
    userName,
    userEmail,
    userImage,
    expanded,
    onAddMock,
    onGoTo,
    onNavigate = () => undefined,
    onToggleSidebar,
    variant = "desktop",
  } = props;
  const routerPathname = usePathname();
  void routerPathname;

  // The phone Sheet complained about density: trim its paddings one step
  // below the desktop rail's, without touching desktop geometry.
  const pad = variant === "mobile" ? "px-2" : "px-2.5";

  return (
    <div className="flex h-full min-h-0 flex-col bg-sidebar text-sidebar-foreground select-none">
      {/* ── Brand Header ── */}
      <div
        className={cn(
          "relative flex h-14 shrink-0 items-center border-b border-sidebar-border/80",
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

        {/* Collapsed rail: hovering the brand row reveals the expand affordance
            in the logo's place — the same grammar ChatGPT's rail uses. The veil
            ignores pointers until it is actually shown, so the brand link
            underneath keeps its clicks and keyboard focus. */}
        {!expanded && (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Expand sidebar"
            tabIndex={-1}
            className="pointer-events-none absolute inset-0 grid place-items-center bg-sidebar text-foreground opacity-0 outline-none transition-opacity duration-150 hover:pointer-events-auto hover:opacity-100 focus-visible:pointer-events-auto focus-visible:opacity-100"
          >
            <PanelLeftIcon size={16} animateOnHover animateOnTap />
          </button>
        )}
      </div>

      {/* ── Primary Navigation ── */}
      <ScrollArea className="min-h-0 flex-1">
        <nav
          aria-label="Workspace"
          className={cn(
            "pb-3 pt-2",
            expanded ? `space-y-5 ${pad}` : "space-y-3 px-1.5",
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
        <ScrollBar />
      </ScrollArea>

      {/* ── Footer Utilities & Account ── */}
      <div
        className={cn(
          "flex shrink-0 flex-col border-t border-sidebar-border/80 bg-sidebar/60",
          expanded
            ? variant === "mobile"
              ? "gap-1.5 p-2"
              : "gap-2 p-2.5"
            : "items-center gap-1.5 px-1.5 py-2.5",
        )}
      >
        {/* Quick Utility Strip: Side-by-side when expanded, stacked with tooltips when collapsed.
            The AI workspace is a route (/ask), reachable from the nav group. */}
        {expanded ? (
          <div
            className={cn(
              "grid grid-cols-2 gap-1 rounded-xl border border-sidebar-border/60 bg-background/40 p-0.5",
              variant === "mobile" && "rounded-lg",
            )}
          >
            {(["settings", "trash"] as const).map((target) => {
              const active = view === target;
              return (
                <Button
                  key={target}
                  variant="ghost"
                  size="sm"
                  aria-current={active ? "page" : undefined}
                  onClick={() => onGoTo(target)}
                  className={cn(
                    "group relative h-7 justify-center gap-1.5 rounded-lg px-2 text-xs transition-all",
                    active
                      ? "bg-accent font-semibold text-accent-foreground shadow-2xs ring-1 ring-sidebar-border/80"
                      : "font-medium text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                  )}
                >
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-1.5 bottom-1.5 w-0.75 rounded-r-full bg-primary"
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
                      name={VIEW_META[target].icon}
                      size={14}
                      tone={active ? "primary" : "current"}
                    />
                  </span>
                  <span className="truncate">{VIEW_META[target].label}</span>
                </Button>
              );
            })}
          </div>
        ) : (
          <div className="flex w-full flex-col items-center gap-1">
            {(["settings", "trash"] as const).map((target) => {
              const active = view === target;
              return (
                <Tooltip
                  key={target}
                  content={VIEW_META[target].label}
                  side="right"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={VIEW_META[target].label}
                    aria-current={active ? "page" : undefined}
                    onClick={() => onGoTo(target)}
                    className={cn(
                      "group relative size-9 rounded-xl transition-all",
                      active
                        ? "bg-accent font-semibold text-accent-foreground shadow-2xs ring-1 ring-sidebar-border/80"
                        : "font-medium text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                    )}
                  >
                    {active && (
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-2.5 bottom-2.5 w-0.5 rounded-r-full bg-primary"
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
                        name={VIEW_META[target].icon}
                        size={16}
                        tone={active ? "primary" : "current"}
                      />
                    </span>
                  </Button>
                </Tooltip>
              );
            })}
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
