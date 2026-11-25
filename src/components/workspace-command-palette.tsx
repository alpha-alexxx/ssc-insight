"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUiStore } from "@/stores/ui-store";
import { CommandPalette, type CommandItem } from "@/components/command-palette";
import { Kbd } from "@/components/kbd";
import { PlainIcon } from "@/components/icon";
import {
  collectResultsByType,
  normalizeForSearch,
  searchHasMore,
  useSearch,
} from "@/components/search/use-search";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { NAV_GROUPS, VIEW_META, planHref } from "@/components/workspace-sidebar";
import { cn } from "@/lib/utils";

/**
 * Global search palette (⌘K) — Hairline's command-palette, fed by this app.
 *
 * The vendored `command-palette` owns every piece of the interaction Hairline
 * ships: the pill that grows into the panel, fuzzy ranking with the matched
 * letters marked, the highlight gliding between rows, the panel easing to fit
 * its results, nested pages, and a shortcut that blurs into a spinner and then
 * a drawn check. What it cannot own is this app's async search — it ranks a
 * static `items` array — so this file is the adapter: it composes the live
 * groups out of pages, quick actions and server results and hands them over as
 * one list.
 *
 * Behaviour preserved exactly: pages and quick actions are static client data
 * and render instantly; everything else queries `/api/search` — 350ms debounce,
 * two-character minimum, abortable, cached by TanStack Query, keyset-paginated
 * with a Load more row. Recent queries persist under the app's `ssc.*`
 * convention.
 *
 * The search words stay HERE, not inside the primitive, because the debounced
 * copy is what queries the server. Both are passed back down (`query` /
 * `onQueryChange`), which is also how a "Recent searches" row refills the field.
 */

const RECENT_KEY = "ssc.search.recent";
const RECENT_MAX = 8;
const DEBOUNCE_MS = 350;

function loadRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(
      window.localStorage.getItem(RECENT_KEY) ?? "[]",
    );
    if (!Array.isArray(parsed)) return [];
    return [
      ...new Set(
        parsed.filter(
          (entry): entry is string =>
            typeof entry === "string" &&
            entry.trim().length >= 2 &&
            entry.length <= 80,
        ),
      ),
    ].slice(0, RECENT_MAX);
  } catch {
    return [];
  }
}

function persistRecentSearches(list: string[]) {
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    // Private modes may refuse writes; the list is a convenience, not data.
  }
}

/** Every row's icon, sized for the palette's 16px slot. */
function Icon({ name }: { name: Parameters<typeof PlainIcon>[0]["name"] }) {
  return <PlainIcon name={name} size={16} />;
}

export interface WorkspaceCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aiEnabled: boolean;
  onAddMock: () => void;
  onOpenAi: () => void;
  /**
   * The header's search pill. It has to be a node in the header's own tree so
   * the palette can measure it — the palette clones it with the ref, the click
   * and `aria-expanded`, which is why the header only has to draw it.
   */
  trigger?: React.ReactElement<CommandTriggerProps>;
}

/** What the palette gives the pill it clones. */
export type CommandTriggerProps = {
  ref?: React.Ref<HTMLButtonElement>;
  "aria-haspopup"?: "dialog";
  "aria-expanded"?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export function WorkspaceCommandPalette({
  open,
  onOpenChange,
  aiEnabled,
  onAddMock,
  onOpenAi,
  trigger,
}: WorkspaceCommandPaletteProps) {
  const router = useRouter();
  const [raw, setRaw] = useState("");
  const debounced = useDebouncedValue(raw, DEBOUNCE_MS);
  const query = normalizeForSearch(debounced);
  const searching = query.length >= 2;

  const search = useSearch({ query, enabled: open });
  const grouped = collectResultsByType(search.data?.pages);
  const hasMore = searchHasMore(search.data?.pages);
  const resultCount =
    grouped.attempts.length +
    grouped.tasks.length +
    grouped.groups.length +
    grouped.plan.length;

  const [recent, setRecent] = useState<string[]>(loadRecentSearches);

  const remember = useCallback((value: string) => {
    const normalized = normalizeForSearch(value);
    if (normalized.length < 2) return;
    const next = [
      normalized,
      ...loadRecentSearches().filter(
        (entry) => entry.toLowerCase() !== normalized.toLowerCase(),
      ),
    ].slice(0, RECENT_MAX);
    persistRecentSearches(next);
    setRecent(next);
  }, []);

  const clearRecent = () => {
    persistRecentSearches([]);
    setRecent([]);
  };

  // "New task" mirrors the `n` shortcut on My Tasks: bump the quick-add
  // request in the UI store. The view consumes the request whenever it is
  // (or becomes) mounted, so no timing dance is needed for navigation.
  const newTask = () => {
    if (!window.location.pathname.startsWith("/my-tasks"))
      router.push("/my-tasks");
    useUiStore.getState().requestQuickAdd();
  };

  // The static half: every page, then the quick actions. Grouped in the order
  // they first appear, which is the order Hairline draws the headings in.
  const staticItems = useMemo<CommandItem[]>(() => {
    const rows: CommandItem[] = [];
    for (const group of NAV_GROUPS) {
      for (const item of group.items) {
        const { label, icon } = VIEW_META[item.view];
        rows.push({
          id: `page:${item.view}:${item.label}`,
          label: item.label,
          group: "Go to",
          icon: <Icon name={icon} />,
          keywords: [label, group.label],
          onSelect: () =>
            router.push(
              typeof item.href === "function" ? item.href() : item.href,
            ),
        });
      }
    }
    rows.push(
      {
        id: "action:add-mock",
        label: "Log a mock",
        group: "Actions",
        icon: <Icon name="plus" />,
        keywords: ["add attempt", "new mock", "record score"],
        onSelect: onAddMock,
      },
      {
        id: "action:new-task",
        label: "New task",
        group: "Actions",
        icon: <Icon name="list" />,
        keywords: ["add task", "quick add", "personal task"],
        onSelect: newTask,
      },
    );
    if (aiEnabled) {
      rows.push({
        id: "action:ask-ai",
        label: "Ask AI",
        group: "Actions",
        icon: <Icon name="sparkles" />,
        keywords: ["chat", "assistant", "coach"],
        onSelect: onOpenAi,
      });
    }
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- static nav data; router stable
  }, [aiEnabled, onAddMock, onOpenAi, router]);

  // Recent searches lead the first page — rows that refill the field instead of
  // navigating. The palette clears its own field on open, so these only show
  // while it is empty, which is exactly when they are useful.
  const items = useMemo<CommandItem[]>(() => {
    if (recent.length === 0) return staticItems;
    const recents: CommandItem[] = recent.map((entry) => ({
      id: `recent:${entry}`,
      label: entry,
      group: "Recent searches",
      icon: <Icon name="history" />,
      setQuery: entry,
    }));
    const withClear: CommandItem[] = [
      ...recents,
      {
        id: "recent:clear",
        label: "Clear history",
        group: "Recent searches",
        icon: <Icon name="close" />,
        onSelect: clearRecent,
      },
    ];
    return [...withClear, ...staticItems];
  }, [recent, staticItems]);

  // The async half. Only while the query is real: before that the static list
  // is the whole answer, and the debounce has not asked the server yet.
  const searchItems = useMemo<CommandItem[]>(() => {
    if (!searching) return [];
    const rows: CommandItem[] = [];

    for (const item of grouped.attempts) {
      rows.push({
        id: `attempt:${item.id}`,
        label: item.title,
        group: "Mock history",
        icon: <Icon name="history" />,
        description: item.subtitle ?? undefined,
        onSelect: () => {
          remember(query);
          // The URL param is the handoff: /history seeds its filter state from
          // the address bar on mount, so ?search=… restores the filter and the
          // mirror keeps it shareable.
          router.push(`/history?search=${encodeURIComponent(item.title)}`);
        },
      });
    }
    for (const item of grouped.tasks) {
      rows.push({
        id: `task:${item.id}`,
        label: item.title,
        group: "Your tasks",
        icon: <Icon name="check" />,
        description: item.subtitle ?? undefined,
        onSelect: () => {
          remember(query);
          router.push("/my-tasks");
        },
      });
    }
    for (const item of grouped.groups) {
      rows.push({
        id: `group:${item.id}`,
        label: item.title,
        group: "Task groups",
        icon: <Icon name="layers" />,
        description: item.subtitle ?? undefined,
        onSelect: () => {
          remember(query);
          router.push("/my-tasks");
        },
      });
    }
    for (const item of grouped.plan) {
      rows.push({
        id: `plan:${item.id}`,
        label: item.title,
        group: "Study plan",
        icon: <Icon name="calendar" />,
        description: item.subtitle ?? undefined,
        onSelect: () => {
          remember(query);
          if (item.date) router.push(planHref(item.date));
        },
      });
    }

    // Pagination is a row, so it is reachable from the keyboard like any other.
    if (hasMore) {
      rows.push({
        id: "search:more",
        label: search.isFetchingNextPage ? "Loading…" : "Load more results",
        group: "More",
        icon: <Icon name="chevronDown" />,
        keepOpen: true,
        onSelect: () => search.fetchNextPage(),
      });
    }
    return rows;
  }, [searching, grouped, hasMore, query, remember, router, search]);

  const allItems = useMemo(
    () => [...items, ...searchItems],
    [items, searchItems],
  );

  const placeholder = searching
    ? `Searching ${resultCount} ${resultCount === 1 ? "result" : "results"}…`
    : "Search mocks, tasks, plan days…";

  const loadingFirstPage = searching && search.isPending && !search.data;
  const searchFailed = searching && search.isError;
  const nothingFound =
    searching && !loadingFirstPage && !searchFailed && resultCount === 0;

  return (
    <CommandPalette
      items={allItems}
      open={open}
      onOpenChange={onOpenChange}
      // ⌘K stays owned by `use-keyboard-shortcuts`; a second listener here
      // would toggle twice and land back on the state it started in.
      hotkey=""
      placeholder={placeholder}
      query={raw}
      onQueryChange={setRaw}
      // The pill is drawn in the app header and cloned here, so the palette can
      // fade it out as the panel grows out of its box — the hand-off Hairline is
      // built for.
      trigger={trigger}
    >
      {loadingFirstPage && <SearchSkeleton />}
      {searchFailed && (
        <div role="alert" className="px-3 py-5">
          <p className="font-serif text-[15px] text-foreground">
            Search could not load.
          </p>
          <p className="mt-1 max-w-xs text-[12px] leading-relaxed text-muted-foreground">
            {search.error instanceof Error
              ? search.error.message
              : "The connection dropped before results arrived."}
          </p>
          <button
            type="button"
            onClick={() => void search.refetch()}
            className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium text-foreground shadow-[inset_0_0_0_1px_var(--border)] transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <PlainIcon name="refresh" size={13} /> Retry
          </button>
        </div>
      )}
      {nothingFound && (
        <div role="status" className="px-3 py-5">
          <p className="font-serif text-[15px] text-foreground">
            No matches for “{query}”.
          </p>
          <p className="mt-1 max-w-xs text-[12px] leading-relaxed text-muted-foreground">
            {allItems.length > 0
              ? `Nothing in your records matches — the ${allItems.length} ${allItems.length === 1 ? "page above" : "pages above"} did.`
              : "Try a mock name, a task title, a group, or a plan day."}
          </p>
        </div>
      )}
    </CommandPalette>
  );
}

/** The first page is on its way: three quiet rows where results will land. */
function SearchSkeleton() {
  return (
    <div aria-hidden="true" className="px-1.5 py-1">
      {[0, 1, 2].map((row) => (
        <div key={row} className="flex h-10 items-center gap-3 px-3 opacity-60">
          <span className="size-4 shrink-0 animate-[ui-blink_1.2s_ease-in-out_infinite] rounded-full bg-muted" />
          <span
            className="h-3.5 rounded-full bg-muted"
            style={{ width: `${68 - row * 14}%` }}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * The pill's face, drawn in the header: search icon, "Search…", ⌘K. It has to
 * look exactly like the face the palette paints while it folds back into the
 * pill, or the hand-off would show — so the geometry here is Hairline's, with
 * two app rules on top: on phones the pill takes the width the header has
 * spare and keeps its label, and the ⌘K hint hides because a touch screen has
 * no keyboard to hint at. `PillFace` in `command-palette.tsx` carries the same
 * pair, so the folded state matches at every width.
 */
export function CommandPaletteTrigger({
  className,
  ...props
}: CommandTriggerProps & { className?: string }) {
  return (
    <button
      {...props}
      type="button"
      aria-label="Search"
      className={cn(
        "inline-flex h-9 w-full min-w-0 items-center gap-2 whitespace-nowrap rounded-full bg-background pl-3 pr-1.5 text-[13px] text-muted-foreground shadow-[inset_0_0_0_1px_var(--border)] transition-[box-shadow,color] duration-300 hover:text-foreground hover:shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--foreground)_22%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 sm:w-auto sm:shrink-0",
        className,
      )}
    >
      <PlainIcon name="search" size={16} />
      <span className="min-w-0 flex-1 truncate pr-2 text-left sm:flex-none sm:pr-6">
        Search…
      </span>
      <span className="hidden items-center gap-0.5 sm:flex">
        <Kbd keys={["mod"]} size="sm" />
        <Kbd keys={["k"]} size="sm" />
      </span>
    </button>
  );
}
