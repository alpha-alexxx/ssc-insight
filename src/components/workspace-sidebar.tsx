"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/button";
import { Dialog } from "@/components/dialog";
import { DropdownMenu, type MenuEntry } from "@/components/dropdown-menu";
import { useExamScope } from "@/components/exam-context";
import { PlainIcon } from "@/components/icon";
import { LiquidNav } from "@/components/liquid-nav";
import { Tooltip } from "@/components/tooltip";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { PanelLeftIcon } from "@/components/animate-ui/icons/hugeicons/panel-left";
import { PlusSignIcon } from "@/components/animate-ui/icons/hugeicons/plus-sign";
import { authClient } from "@/lib/auth/client";
import { istTodayIso } from "@/lib/plan/view-model";
import { analyticsKeys } from "@/lib/queries/analytics";
import { attemptKeys } from "@/lib/queries/attempts";
import {
  examsKeys,
  putScopeRequest,
  switcherEntries,
  type SwitcherEntry,
} from "@/lib/queries/exams";
import { VIEW_HREF, type AppView } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * Workspace sidebar — the panel itself.
 *
 * Desktop: an <aside> that folds between expanded (15rem) and the icon rail
 * (3.5rem); the state persists in the `sidebar_state` cookie so the server
 * layout renders the right first paint.
 * Mobile: hosted inside the header's navigation Sheet.
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

const FOOTER_UTILITIES = ["settings", "trash"] as const;

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

  const link = (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      data-liquid-nav={item.view}
      className={cn(
        "group relative flex h-9 items-center rounded-xl text-[13px] outline-none transition-[color,background-color] duration-200 focus-visible:ring-2 focus-visible:ring-primary/40 motion-reduce:transition-none",
        expanded
          ? "w-full justify-start gap-2.5 px-3"
          : "mx-auto size-9 justify-center px-0",
        // Active background is painted and animated by LiquidNav behind the list.
        active
          ? "font-semibold text-primary-foreground"
          : "font-medium text-muted-foreground hover:bg-accent/60 hover:text-foreground",
      )}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center transition-transform duration-150 group-hover:scale-105",
          !active && "text-muted-foreground group-hover:text-foreground",
        )}
      >
        <PlainIcon name={VIEW_META[item.view].icon} size={16} tone="current" />
      </span>

      {expanded && (
        <>
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          {isTodayPlan && (
            <span
              className={cn(
                "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-tight transition-colors duration-200",
                active
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : " bg-primary/10 text-primary ring-1 ring-primary/20 group-hover:bg-primary/15",
              )}
            >
              Today
            </span>
          )}
        </>
      )}
    </Link>
  );

  if (expanded) return link;

  return (
    <Tooltip content={item.label} side="right">
      <span className="flex w-full justify-center">{link}</span>
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

  const entries = scope.exams ? switcherEntries(scope.exams) : [];
  const activeKey = scope.exams
    ? `${scope.exams.activeExamId}:${scope.exams.activeTierId}`
    : "";
  const activeEntry = entries.find((entry) => entry.key === activeKey);

  const switchScope = async (entry: SwitcherEntry) => {
    if (!scope.exams || switching || entry.key === activeKey) return;
    setSwitching(true);
    try {
      const fresh = await putScopeRequest({
        activeExamId: entry.examId,
        activeTierId: entry.tierId,
        enabledTiers: scope.exams.enabledTiers,
      });
      queryClient.setQueryData(examsKeys.current(), fresh);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: attemptKeys.all }),
        queryClient.invalidateQueries({ queryKey: analyticsKeys.all }),
      ]);
    } catch {
      // Keep the current cached scope intact if the network write fails.
    } finally {
      setSwitching(false);
    }
  };

  const triggerButton = (
    <button
      type="button"
      aria-label="Account and exam scope menu"
      className={cn(
        "group flex items-center rounded-xl border border-transparent text-left transition-all duration-150 hover:border-sidebar-border/80 hover:bg-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        expanded
          ? "w-full justify-start gap-2.5 p-1.5"
          : "mx-auto size-9 justify-center p-0",
      )}
    >
      <span className="relative shrink-0">
        <Avatar name={displayName} src={imageUrl || undefined} size="sm" />
        <span
          aria-hidden="true"
          className={cn(
            "absolute -right-0.5 -bottom-0.5 size-2 rounded-full ring-2 ring-sidebar transition-colors",
            switching ? "animate-pulse bg-amber-500" : "bg-emerald-500",
          )}
        />
      </span>

      {expanded && (
        <>
          <span className="grid min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <span className="truncate text-[12px] font-semibold leading-tight text-foreground">
                {displayName}
              </span>
              {activeEntry && (
                <span className="max-w-19 shrink-0 truncate rounded bg-primary/10 px-1 py-px text-[9px] font-semibold tracking-tight text-primary">
                  {activeEntry.label}
                </span>
              )}
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
    {
      type: "label",
      label: `${displayName} · ${displayEmail}`,
    },
    ...(scope.exams
      ? ([
          { type: "separator" },
          { type: "label", label: "Exam scope" },
          ...(entries.length === 0
            ? [
                {
                  type: "item" as const,
                  id: "no-exams",
                  label: "No exams enabled yet",
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
            label: "Manage exams & tiers",
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
      onSelect: () => {
        setMenuOpen(false);
        setConfirmOpen(true);
      },
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
        minWidth={expanded ? 224 : 228}
        open={menuOpen}
        onOpenChange={setMenuOpen}
      />

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

          <div
            className="h-px w-full bg-sidebar-border/70"
            aria-hidden="true"
          />

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
    <Tooltip
      content={
        activeEntry
          ? `${displayName} · ${activeEntry.label}`
          : `${displayName} · Account`
      }
      side="right"
    >
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
  expanded: boolean;
  onAddMock: () => void;
  onGoTo: (next: "settings" | "trash") => void;
  onNavigate?: () => void;
  /** Desktop only: fold or expand the sidebar rail. */
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

  // Subscribes to route transitions so dynamic hrefs (e.g., today's plan in IST) stay fresh.
  usePathname();

  const pad = variant === "mobile" ? "px-2" : "px-2.5";
  const isAddActive = view === "add";

  return (
    <div className="flex h-full min-h-0 flex-col bg-sidebar text-sidebar-foreground select-none">
      {/* ── Brand Header ── */}
      <div
        className={cn(
          "group/brand relative flex h-14 shrink-0 items-center border-b border-sidebar-border/80",
          expanded ? "justify-between gap-2 px-3.5" : "justify-center px-0",
          // Keep the wordmark clear of the mobile Sheet's floating close button.
          expanded && variant === "mobile" && "pr-12",
        )}
      >
        <Link
          href="/dashboard"
          aria-label="SSC Insight dashboard"
          onClick={onNavigate}
          className={cn(
            "group/logo flex min-w-0 items-center gap-2.5 rounded-xl transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            expanded ? "flex-1" : "justify-center",
          )}
        >
          <span className="relative grid size-8 shrink-0 place-items-center rounded-xl border border-sidebar-border bg-background shadow-2xs ring-1 ring-primary/10 transition-transform duration-150 group-hover/logo:scale-[1.03]">
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

        {/* Desktop rail collapse button when expanded */}
        {expanded && variant === "desktop" && onToggleSidebar && (
          <Tooltip content="Collapse sidebar" side="bottom">
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label="Collapse sidebar"
              className="grid size-7 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <PanelLeftIcon size={15} animateOnHover animateOnTap />
            </button>
          </Tooltip>
        )}

        {/* Collapsed rail: hovering the header or tabbing to this button reveals
            the expand trigger directly over the brand mark. */}
        {!expanded && onToggleSidebar && (
          <Tooltip content="Expand sidebar" side="right">
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label="Expand sidebar"
              className="pointer-events-none absolute inset-0 grid place-items-center bg-sidebar text-foreground opacity-0 outline-none transition-opacity duration-150 group-hover/brand:pointer-events-auto group-hover/brand:opacity-100 focus-visible:pointer-events-auto focus-visible:opacity-100"
            >
              <span className="grid size-8 place-items-center rounded-xl border border-sidebar-border bg-accent/60 shadow-2xs ring-2 ring-transparent transition-all hover:bg-accent focus-visible:ring-primary/40">
                <PanelLeftIcon size={16} animateOnHover animateOnTap />
              </span>
            </button>
          </Tooltip>
        )}
      </div>

      {/* ── Primary Navigation ── */}
      <ScrollArea className="min-h-0 flex-1">
        <nav aria-label="Workspace" className="pb-3 pt-2.5">
          <LiquidNav
            active={view}
            className={expanded ? pad : "px-1.5"}
            contentClassName={expanded ? "space-y-5" : "space-y-3"}
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

                  {/* Mock-Logging Action CTA: Styled with a primary-tinted surface so it
                      never visually collides with the solid LiquidNav active indicator. */}
                  {group.label === "Results" && (
                    <li
                      className={
                        expanded ? "pt-1.5" : "flex justify-center pt-1.5"
                      }
                    >
                      {expanded ? (
                        <Button
                          variant={isAddActive ? "primary" : "outline"}
                          size="sm"
                          onClick={onAddMock}
                          aria-current={isAddActive ? "page" : undefined}
                          className={cn(
                            "h-9 w-full justify-start gap-2.5 rounded-xl px-3 text-[13px] transition-all",
                            !isAddActive &&
                              "border-primary/25 bg-primary/6 font-semibold text-primary shadow-none hover:border-primary/40 hover:bg-primary/12",
                          )}
                        >
                          <PlusSignIcon
                            size={16}
                            color={
                              isAddActive
                                ? "var(--primary-foreground)"
                                : "var(--primary)"
                            }
                            animateOnHover
                            animateOnTap
                          />
                          <span className="truncate">Log a mock</span>
                        </Button>
                      ) : (
                        <Tooltip content="Log a mock" side="right">
                          <Button
                            variant={isAddActive ? "primary" : "outline"}
                            size="icon"
                            onClick={onAddMock}
                            aria-label="Log a mock"
                            aria-current={isAddActive ? "page" : undefined}
                            className={cn(
                              "size-9 rounded-xl transition-all",
                              !isAddActive &&
                                "border-primary/25 bg-primary/6 text-primary shadow-none hover:border-primary/40 hover:bg-primary/12",
                            )}
                          >
                            <PlusSignIcon
                              size={16}
                              color={
                                isAddActive
                                  ? "var(--primary-foreground)"
                                  : "var(--primary)"
                              }
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
          </LiquidNav>
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
        {expanded ? (
          <div
            className={cn(
              "grid grid-cols-2 gap-1 rounded-xl border border-sidebar-border/60 bg-background/40 p-0.5",
              variant === "mobile" && "rounded-lg",
            )}
          >
            {FOOTER_UTILITIES.map((target) => {
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
                      className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full bg-primary"
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
            {FOOTER_UTILITIES.map((target) => {
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
