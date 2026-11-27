"use client";
import { type ReactNode } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/button";
import { Icon } from "@/components/icon";
import { SidebarTrigger } from "@/components/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  WorkspaceSidebar,
  VIEW_META,
  navGroupForView,
} from "@/components/workspace-sidebar";
import { Breadcrumb } from "@/components/breadcrumb";
import { VIEW_HREF, type AppView } from "@/lib/routes";

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

/**
 * Application shell — Hairline-only composition.
 *
 * The vendored `<Sidebar>` owns the panel itself: its width, its fold, the
 * mobile drawer, and the `sidebar_state` cookie that lets the server layout
 * paint the right geometry on the first frame. The shell keeps only what sits
 * inside it — the header (trigger, search, theme), the where-you-are
 * breadcrumb, and the page frame. Exam/tier scope lives in the sidebar's
 * account menu. Everything visual is Hairline (Sidebar, Button, ThemeToggle)
 * over the six-palette token set; geometry stays Hairline's own.
 */

export function AppFrame({
  view,
  userName,
  userEmail,
  userImage,
  onOpenSearch,
  searchSlot,
  children,
  defaultSidebarCollapsed = false,
  defaultSidebarWidth = 240,
}: {
  view: AppView;
  userName: string;
  userEmail: string;
  userImage: string;
  onOpenSearch: () => void;
  /**
   * The command palette's own search pill, rendered by the header because the
   * palette grows out of it. The header only places it; the palette owns it.
   */
  searchSlot?: ReactNode;
  children: ReactNode;
  defaultSidebarCollapsed?: boolean;
  defaultSidebarWidth?: number;
}) {
  return (
    // dvh, not vh: with min-h-screen the shell's floor is the LARGE viewport,
    // so on a phone every page keeps 40-90px of paper below the content when
    // the URL bar is shown (the /ask composer floated above it). vh and dvh
    // are identical on desktop, so nothing else moves.
    <div className="min-h-dvh">
      <WorkspaceSidebar
        view={view}
        userName={userName}
        userEmail={userEmail}
        userImage={userImage}
        defaultCollapsed={defaultSidebarCollapsed}
        defaultWidth={defaultSidebarWidth}
      >
        <AppHeader onOpenSearch={onOpenSearch} searchSlot={searchSlot} />
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
      </WorkspaceSidebar>
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
  searchSlot,
}: {
  onOpenSearch: () => void;
  searchSlot?: ReactNode;
}) {
  return (
    <header className="sticky inset-x-0 top-0 z-20 flex h-14 w-full shrink-0 items-center gap-1 border-b border-border bg-background/95 px-2 backdrop-blur-sm sm:gap-2 sm:px-4">
      {/* One control, one job: fold the panel on wide layouts, open the drawer
          below md. The glyph animates with the fold, so the header never has to
          render-condition on the viewport — 44px on phones, 36px from md. */}
      <SidebarTrigger className="size-11 tap-target md:size-9" />

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
