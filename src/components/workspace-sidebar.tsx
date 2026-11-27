"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  CalendarCheck,
  CalendarDays,
  ChartLine,
  History,
  LayoutDashboard,
  ListTodo,
  Plus,
  Scale,
  Settings,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/button";
import { Dialog } from "@/components/dialog";
import type { MenuEntry } from "@/components/dropdown-menu";
import { useExamScope } from "@/components/exam-context";
import { PlainIcon } from "@/components/icon";
import {
  Sidebar,
  type SidebarIcon,
  type SidebarItem,
  type SidebarSection,
} from "@/components/sidebar";
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

/**
 * Workspace sidebar — this app's contents fed into the vendored Hairline
 * `Sidebar`.
 *
 * The panel owns the whole interaction (fold, edge drag, rail peek, phone
 * drawer, ⌘B); this module only says what the workspace is: the nav groups,
 * the account menu with exam scope and sign-out, and the `sidebar_state`
 * cookie the server layout reads to paint the right first frame.
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

/** Lucide twins of VIEW_META's PlainIcon names — the vendored panel draws its own glyphs. */
const NAV_ICONS: Record<AppView, SidebarIcon> = {
  dashboard: LayoutDashboard,
  calendar: CalendarDays,
  plan: CalendarCheck,
  tasks: ListTodo,
  history: History,
  compare: Scale,
  performance: ChartLine,
  ask: Sparkles,
  add: Plus,
  settings: Settings,
  trash: Trash2,
};

/** "Study planner" → "study-planner", the section's stable id. */
const slug = (label: string) =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** The create action rides at the end of Results, its old home. The panel never lands the drop on an accent row. */
const ADD_ITEM: SidebarItem = {
  id: "add",
  label: "Log a mock",
  icon: Plus,
  href: VIEW_HREF.add,
  accent: true,
};

/** Settings and Trash are utility destinations, deliberately not nav-group entries. */
const FOOTER_ITEMS: SidebarItem[] = [
  { id: "settings", label: "Settings", icon: Settings, href: VIEW_HREF.settings },
  { id: "trash", label: "Trash", icon: Trash2, href: VIEW_HREF.trash },
];

/** Platform check for the search hint — display only; the palette accepts both shortcuts. */
const IS_APPLE_PLATFORM =
  typeof navigator !== "undefined" &&
  /Mac|iP(hone|ad|od)/.test(navigator.userAgent);

/**
 * Hairline's own label formula, reproduced on purpose: `--p` runs 1 → 0 as the
 * panel folds, so the brand text fades with the edge instead of disappearing
 * at a breakpoint. Only opacity changes, so the text keeps its layout while
 * the spring is mid-flight.
 */
const FOLD_LABEL: React.CSSProperties = {
  opacity: "clamp(0, calc(var(--p, 1) * 1.5 - 0.35), 1)",
};

/**
 * The brand row. The whole row is the dashboard link, so the panel needs no
 * second toggle beside Hairline's own.
 */
function SidebarBrand() {
  return (
    <Link
      href={VIEW_HREF.dashboard}
      aria-label="SSC Insight dashboard"
      className="group/brand flex min-w-8 items-center gap-2.5 overflow-clip whitespace-nowrap rounded-[8px] outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-[8px] border border-border bg-background ring-1 ring-primary/10 transition-colors duration-150 group-hover/brand:bg-accent/40">
        <PlainIcon name="book" size={16} tone="primary" />
      </span>
      <span className="min-w-0" style={FOLD_LABEL}>
        <span className="block font-serif text-[1.1875rem] font-semibold leading-none tracking-[-0.035em] text-foreground">
          ssc<span className="text-primary">insight.</span>
        </span>
        <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
          Mock workspace
        </span>
      </span>
    </Link>
  );
}

/** `"<collapsed>:<width>"` — the workspace layout parses it to paint the right first frame. */
function persistSidebar(next: { collapsed: boolean; width: number }) {
  document.cookie = `sidebar_state=${next.collapsed}:${next.width}; path=/; max-age=31536000; samesite=lax`;
}

export interface WorkspaceSidebarProps {
  view: AppView;
  userName: string;
  userEmail: string;
  userImage: string;
  /** The cookie's collapsed flag, as read on the server. Uncontrolled from here on. */
  defaultCollapsed: boolean;
  /** The cookie's open width, as read on the server. */
  defaultWidth: number;
  onOpenSearch: () => void;
  /** The page column: header + breadcrumb + `<main>`. */
  children: React.ReactNode;
}

export function WorkspaceSidebar({
  view,
  userName,
  userEmail,
  userImage,
  defaultCollapsed,
  defaultWidth,
  onOpenSearch,
  children,
}: WorkspaceSidebarProps): React.JSX.Element {
  const router = useRouter();
  const queryClient = useQueryClient();
  const scope = useExamScope();

  // Subscribes to route transitions so date-bearing hrefs (e.g. "Today's plan"
  // in IST) resolve on the render that is actually navigated from.
  usePathname();

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [signingOut, setSigningOut] = React.useState(false);
  const [switching, setSwitching] = React.useState(false);

  // The panel is uncontrolled: the server's cookie read is the only source of
  // the first frame. This ref only pairs the two halves of the cookie, because
  // Hairline reports the fold and the width separately (the boolean alone on a
  // toggle, the width alone on a drag).
  const lastState = React.useRef({
    collapsed: defaultCollapsed,
    width: defaultWidth,
  });

  const displayName = userName || "My workspace";
  const displayEmail = userEmail || "Private account";

  const entries = scope.exams ? switcherEntries(scope.exams) : [];
  const activeKey = scope.exams
    ? `${scope.exams.activeExamId}:${scope.exams.activeTierId}`
    : "";

  // One scope write at a time: a second tick during a pending PUT would race
  // the first, and the checkbox rows stay open, so double taps are easy.
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

  const signOut = () => {
    setSigningOut(true);
    void authClient.signOut({ callbackURL: "/" });
  };

  const userMenu: MenuEntry[] = [
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
            onSelect: () => router.push(VIEW_HREF.settings),
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

  const sections: SidebarSection[] = NAV_GROUPS.map((group) => ({
    id: slug(group.label),
    label: group.label,
    items: [
      ...group.items.map((item) => ({
        id: item.view,
        label: item.label,
        href: resolveHref(item.href),
        icon: NAV_ICONS[item.view],
      })),
      ...(group.label === "Results" ? [ADD_ITEM] : []),
    ],
  }));

  return (
    <>
      <Sidebar
        sections={sections}
        footer={FOOTER_ITEMS}
        value={view}
        defaultCollapsed={defaultCollapsed}
        defaultWidth={defaultWidth}
        minWidth={220}
        maxWidth={360}
        onCollapsedChange={(collapsed) => {
          lastState.current.collapsed = collapsed;
          persistSidebar(lastState.current);
        }}
        onWidthChange={(width) => {
          lastState.current.width = width;
          persistSidebar(lastState.current);
        }}
        user={{
          name: displayName,
          detail: displayEmail,
          avatar: userImage || undefined,
        }}
        userMenu={userMenu}
        onSearch={onOpenSearch}
        searchShortcut={IS_APPLE_PLATFORM ? "⌘K" : "Ctrl K"}
        brand={<SidebarBrand />}
        linkAs={Link}
        label="Workspace"
        drawerBelow={768}
        className="min-h-dvh"
      >
        {children}
      </Sidebar>

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
        <div className="overflow-hidden rounded-[10px] border border-border bg-accent/40">
          <div className="flex items-center gap-2.5 p-2.5">
            <span className="relative shrink-0">
              <Avatar
                name={displayName}
                src={userImage || undefined}
                size="sm"
              />
              <span
                aria-hidden="true"
                className="absolute -right-0.5 -bottom-0.5 size-2 rounded-full bg-success ring-2 ring-background"
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

            <span className="shrink-0 rounded-[5px] bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-tight text-primary">
              Synced
            </span>
          </div>

          <div className="h-px w-full bg-border" aria-hidden="true" />

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
}
