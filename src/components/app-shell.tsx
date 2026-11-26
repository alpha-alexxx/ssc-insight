"use client";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/button";
import { Icon } from "@/components/icon";
import { PanelLeftIcon } from "@/components/animate-ui/icons/hugeicons/panel-left";
import { Sheet } from "@/components/sheet";
import { Tooltip } from "@/components/tooltip";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  WorkspaceSidebarBody,
  VIEW_META,
  navGroupForView,
} from "@/components/workspace-sidebar";
import { Breadcrumb } from "@/components/breadcrumb";
import { VIEW_HREF, type AppView } from "@/lib/routes";
import { useIsMobile } from "@/hooks/use-mobile";
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
 * the header (collapse trigger, search, Ask AI, theme), the where-you-are
 * breadcrumb, route intent, and the page frame. Exam/tier scope lives in the
 * sidebar's account menu. Everything visual is Hairline (Button, Sheet,
 * Tooltip, ThemeToggle) over the six-palette token set; geometry stays
 * Hairline's own.
 */

export function AppFrame({
  view,
  userName,
  userEmail,
  userImage,
  onAddMock,
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
  onRouteIntent: (view: AppView) => void;
  onAddMock: () => void;
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
    // dvh, not vh: with min-h-screen the shell's floor is the LARGE viewport,
    // so on a phone every page keeps 40-90px of paper below the content when
    // the URL bar is shown (the /ask composer floated above it). vh and dvh
    // are identical on desktop, so nothing else moves.
    <div className="min-h-dvh">
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
          expanded={expanded}
          onAddMock={onAddMock}
          onGoTo={go}
          onToggleSidebar={toggleExpanded}
        />
      </aside>

      {/* Mobile sidebar — flush: a drawer that belongs to the page, not a card over it. */}
      <Sheet
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        side="left"
        title="Navigation"
        width={272}
        headerless
        flush
        className="bg-sidebar text-sidebar-foreground"
        contentClassName="min-h-0 flex-1 overflow-y-auto overscroll-contain p-0 text-[13px] text-foreground"
      >
        <div className="h-full">
          <WorkspaceSidebarBody
            view={view}
            userName={userName}
            userEmail={userEmail}
            userImage={userImage}
            expanded
            onAddMock={() => {
              setMobileOpen(false);
              onAddMock();
            }}
            onGoTo={go}
            onNavigate={() => setMobileOpen(false)}
            variant="mobile"
          />
        </div>
      </Sheet>

      <div
        className={cn(
          "flex min-h-dvh flex-col transition-[padding] duration-200",
          expanded ? "md:pl-60" : "md:pl-14",
        )}
      >
        <AppHeader
          onOpenSearch={onOpenSearch}
          onToggleSidebar={toggleExpanded}
          onOpenMobileNav={() => setMobileOpen(true)}
          sidebarExpanded={expanded}
          searchSlot={searchSlot}
        />
        {/* Where-you-are strip: under the app bar so the header row stays clean
            ("Workspace / group / view"), then the routed page starts. /ask is
            excluded: it sizes itself to header + one padding and must not grow. */}
        {view !== "ask" && (
          <nav
            aria-label="Breadcrumb"
            className="mx-auto w-full max-w-[1560px] px-3 pt-3 sm:px-5"
          >
            <Breadcrumb
              items={[
                { label: "Workspace", href: VIEW_HREF.dashboard },
                ...(navGroupForView(view)
                  ? [{ label: navGroupForView(view) as string }]
                  : []),
                { label: VIEW_META[view].label },
              ]}
              className="min-w-0"
            />
          </nav>
        )}
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
  onOpenSearch,
  onToggleSidebar,
  onOpenMobileNav,
  sidebarExpanded,
  searchSlot,
}: {
  onOpenSearch: () => void;
  onToggleSidebar: () => void;
  onOpenMobileNav: () => void;
  sidebarExpanded: boolean;
  searchSlot?: ReactNode;
}) {
  // Render-conditioned on the viewport, not CSS-hidden: the collapse toggle
  // must not exist on phones at all (no paint, no focus, no tooltip), and the
  // hook's 768px breakpoint matches the sidebar's own md: geometry exactly.
  const isMobile = useIsMobile();

  return (
    <header className="sticky inset-x-0 top-0 z-20 flex h-14 w-full shrink-0 items-center gap-1 border-b border-border bg-background/95 px-2 backdrop-blur-sm sm:gap-2 sm:px-4">
      {/* Mobile: open the nav Sheet. Desktop: fold/unfold the sidebar rail. */}
      {isMobile ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMobileNav}
          aria-label="Open navigation"
          className="size-11"
        >
          <PanelLeftIcon size={16} animateOnHover animateOnTap />
        </Button>
      ) : (
        <Tooltip
          content={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            aria-label={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
            className="size-8"
          >
            <PanelLeftIcon size={16} animateOnHover animateOnTap />
          </Button>
        </Tooltip>
      )}

      {/* The pill claims the free width on phones; from `sm` it is the fixed pill
          it has always been, so the header's existing balance is untouched. */}
      <div className="ml-auto flex w-full min-w-0 flex-1 items-center justify-end gap-1 sm:w-auto sm:flex-none sm:shrink-0 sm:gap-2">
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
