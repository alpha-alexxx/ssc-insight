"use client";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/button";
import { Icon, PlainIcon } from "@/components/icon";
import { Menu01Icon } from "@/components/animate-ui/icons/hugeicons/menu-01";
import { PanelLeftIcon } from "@/components/animate-ui/icons/hugeicons/panel-left";
import { Sheet } from "@/components/sheet";
import { Tooltip } from "@/components/tooltip";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  WorkspaceSidebarBody,
  VIEW_META,
} from "@/components/workspace-sidebar";
import { ExamSwitcher } from "@/components/exam-switcher";
import { VIEW_HREF, type AppView } from "@/lib/routes";
import { cn } from "@/lib/utils";

export { PATH_VIEW, VIEW_HREF, VIEW_PATH, viewForPathname } from "@/lib/routes";
export type { AppView } from "@/lib/routes";
export {
  NAV_GROUPS,
  VIEW_META,
  planHref,
} from "@/components/workspace-sidebar";

/** Platform check for the search kbd hint — the shortcut itself accepts both. */
const IS_APPLE_PLATFORM =
  typeof navigator !== "undefined" &&
  /Mac|iP(hone|ad|od)/.test(navigator.userAgent);

const SIDEBAR_COOKIE = "sidebar_state";

/**
 * Application shell — Hairline-only composition.
 *
 * The sidebar owns expanded/collapsed (persisted in `sidebar_state` so the
 * server layout can paint it right) and the mobile Sheet; the shell keeps
 * the header (breadcrumb, search, exam scope, theme), route intent, and the
 * page frame. Everything visual is Hairline (Button, Sheet, Tooltip,
 * ThemeToggle) over the six-palette token set; geometry stays Hairline's own.
 */

export function AppFrame({
  view,
  userName,
  userEmail,
  userImage,
  aiEnabled,
  onAddMock,
  onOpenAi,
  onOpenSearch,
  onOpenSettings,
  onOpenTrash,
  searchSlot,
  children,
  defaultSidebarOpen = true,
}: {
  view: AppView;
  userName: string;
  userEmail: string;
  userImage: string;
  aiEnabled: boolean;
  onRouteIntent: (view: AppView) => void;
  onAddMock: () => void;
  onOpenAi: () => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onOpenTrash: () => void;
  /**
   * The command palette's own search pill, rendered by the header because the
   * palette grows out of it. The header only places it; the palette owns it.
   */
  searchSlot?: ReactNode;
  children: ReactNode;
  defaultSidebarOpen?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultSidebarOpen);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => {
      const next = !prev;
      document.cookie = `${SIDEBAR_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      return next;
    });
  }, []);

  // Keep the cookie in sync with the first mount so server paints match.
  useEffect(() => {
    document.cookie = `${SIDEBAR_COOKIE}=${expanded}; path=/; max-age=31536000; samesite=lax`;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cookie mirrors state on mount only
  }, []);

  const router = useRouter();
  const go = (next: "settings" | "trash") => {
    router.push(VIEW_HREF[next]);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden shrink-0 border-r border-sidebar-border transition-[width] duration-200 md:block",
          expanded ? "w-60" : "w-14",
        )}
      >
        <WorkspaceSidebarBody
          view={view}
          userName={userName}
          userEmail={userEmail}
          userImage={userImage}
          aiEnabled={aiEnabled}
          expanded={expanded}
          onOpenAi={onOpenAi}
          onAddMock={onAddMock}
          onGoTo={go}
        />
      </aside>

      {/* Mobile sidebar */}
      <Sheet
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        side="left"
        title="Navigation"
        width={272}
        className="p-0 bg-sidebar text-sidebar-foreground border-sidebar-border"
      >
        <div className="h-full">
          <WorkspaceSidebarBody
            view={view}
            userName={userName}
            userEmail={userEmail}
            userImage={userImage}
            aiEnabled={aiEnabled}
            expanded
            onOpenAi={() => {
              setMobileOpen(false);
              onOpenAi();
            }}
            onAddMock={() => {
              setMobileOpen(false);
              onAddMock();
            }}
            onGoTo={go}
            onNavigate={() => setMobileOpen(false)}
          />
        </div>
      </Sheet>

      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-200",
          expanded ? "md:pl-60" : "md:pl-14",
        )}
      >
        <AppHeader
          view={view}
          aiEnabled={aiEnabled}
          onOpenAi={onOpenAi}
          onOpenSearch={onOpenSearch}
          onToggleSidebar={toggleExpanded}
          onOpenMobileNav={() => setMobileOpen(true)}
          sidebarExpanded={expanded}
          searchSlot={searchSlot}
        />
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-[1560px] flex-1 px-3 py-4 focus:outline-none sm:px-5 md:py-5"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

/**
 * Top-of-app navigation bar. Full-bleed: pinned to the top, left, and right
 * of the viewport. Only the bottom edge carries a hairline — the other three
 * edges are the viewport itself.
 */
export function AppHeader({
  view,
  aiEnabled,
  onOpenAi,
  onOpenSearch,
  onToggleSidebar,
  onOpenMobileNav,
  sidebarExpanded,
  searchSlot,
}: {
  view: AppView;
  aiEnabled: boolean;
  onOpenAi: () => void;
  onOpenSearch: () => void;
  onToggleSidebar: () => void;
  onOpenMobileNav: () => void;
  sidebarExpanded: boolean;
  searchSlot?: ReactNode;
}) {
  const router = useRouter();
  const { label } = VIEW_META[view];
  const openSettings = () => router.push(VIEW_HREF.settings);

  return (
    <header className="sticky inset-x-0 top-0 z-20 flex h-14 w-full shrink-0 items-center gap-1 border-b border-border bg-background/95 px-2 backdrop-blur-sm sm:gap-2 sm:px-4">
      {/* Mobile: open the nav Sheet. Desktop: fold/unfold the sidebar rail. */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
        className="size-11 md:hidden"
      >
        <Menu01Icon size={16} animateOnHover animateOnTap />
      </Button>
      <Tooltip
        content={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          aria-label={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
          className="hidden size-8 md:inline-flex"
        >
          <PanelLeftIcon size={16} animateOnHover animateOnTap />
        </Button>
      </Tooltip>

      <HeaderLocation label={label} />

      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
        {/* The palette's pill. It replaces the old Search button: the palette
            grows out of this exact box, so it has to be the real trigger. */}
        {searchSlot ?? (
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenSearch}
            aria-label="Search"
            className="h-8 gap-2 px-3"
          >
            <Icon name="search" size={14} />
            <span className="hidden sm:inline">Search</span>
            <kbd
              aria-hidden="true"
              className="hidden rounded-sm px-1 font-sans text-[10px] font-medium tracking-wide text-muted-foreground md:inline"
            >
              {IS_APPLE_PLATFORM ? "⌘K" : "Ctrl K"}
            </kbd>
          </Button>
        )}

        <ExamSwitcher onManageExams={openSettings} compact />

        <ThemeToggleBridge />
      </div>
    </header>
  );
}

/** Hairline ThemeToggle driven by next-themes (the app's source of truth). */
function ThemeToggleBridge() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <ThemeToggle
      value={resolvedTheme === "dark" ? "dark" : "light"}
      onValueChange={(next) => setTheme(next)}
      className="shrink-0"
    />
  );
}

/**
 * Current-location indicator. Rendered as a breadcrumb landmark so assistive
 * technologies announce it consistently with the rest of the app.
 */
function HeaderLocation({ label }: { label: string }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex min-w-[3.25rem] flex-1 items-center gap-2 overflow-hidden sm:min-w-0 sm:flex-none"
    >
      <span className="hidden shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:inline">
        Workspace
      </span>
      <PlainIcon
        name="chevronRight"
        size={12}
        className="hidden shrink-0 text-muted-foreground sm:inline"
      />
      {/* The leaf title is the one thing that must survive a narrow bar. */}
      <span
        className="min-w-0 truncate text-[13px] font-semibold text-foreground"
        aria-current="page"
      >
        {label}
      </span>
    </nav>
  );
}
