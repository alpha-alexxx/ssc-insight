"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUiStore } from "@/stores/ui-store";
import { Dialog } from "@/components/dialog";
import { Input } from "@/components/input";
import { Kbd } from "@/components/kbd";
import { Spinner } from "@/components/spinner";
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
 * Global search palette (⌘K) — Hairline composition.
 *
 * Hairline's command-palette owns its query state internally, so it cannot
 * drive this app's async server search. Following the audit's composed-gap
 * pattern, this surface composes Hairline primitives instead: Dialog (the
 * overlay), Input (the field), Kbd, Spinner, and token-styled result rows.
 * Behavior is preserved exactly: pages and quick actions are static client
 * data and render instantly; everything else queries `/api/search` — 350ms
 * debounce, two-character minimum, abortable, cached by TanStack Query,
 * keyset-paginated with Load-more. Recent queries persist under the app's
 * ssc.* convention.
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

export interface WorkspaceCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aiEnabled: boolean;
  onAddMock: () => void;
  onOpenAi: () => void;
}

/** One result row — token-styled, keyboard-focusable, icon + label + meta. */
function Row({
  icon,
  children,
  meta,
  shortcut,
  onClick,
  tone = "muted",
}: {
  icon: Parameters<typeof PlainIcon>[0]["name"];
  children: React.ReactNode;
  meta?: string;
  shortcut?: string;
  onClick: () => void;
  tone?: "muted" | "primary";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-full items-center gap-2.5 rounded-xl px-3 text-left text-[13px] text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      <PlainIcon name={icon} size={16} tone={tone} className="shrink-0" />
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {meta && (
        <span className="max-w-[45%] shrink-0 truncate text-[11px] text-muted-foreground">
          {meta}
        </span>
      )}
      {shortcut && <Kbd keys={[shortcut]} size="sm" />}
    </button>
  );
}

function GroupHeading({ label, count }: { label: string; count?: number }) {
  return (
    <p className="flex items-center gap-2 px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
      {label}
      {count != null && <span className="font-medium normal-case tracking-normal opacity-70">{count}</span>}
    </p>
  );
}

export function WorkspaceCommandPalette({
  open,
  onOpenChange,
  aiEnabled,
  onAddMock,
  onOpenAi,
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

  const remember = (value: string) => {
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
  };

  const clearRecent = () => {
    persistRecentSearches([]);
    setRecent([]);
  };

  const run = (action: () => void) => {
    onOpenChange(false);
    action();
  };

  // "New task" mirrors the `n` shortcut on My Tasks: bump the quick-add
  // request in the UI store. The view consumes the request whenever it is
  // (or becomes) mounted, so no timing dance is needed for navigation.
  const newTask = () => {
    if (!window.location.pathname.startsWith("/my-tasks"))
      router.push("/my-tasks");
    useUiStore.getState().requestQuickAdd();
  };

  const pageActions = useMemo(() => {
    const actions: {
      label: string;
      keywords: string[];
      icon: Parameters<typeof PlainIcon>[0]["name"];
      shortcut?: string;
      run: () => void;
    }[] = [];
    for (const group of NAV_GROUPS) {
      for (const item of group.items) {
        actions.push({
          label: item.label,
          keywords: [VIEW_META[item.view].label, group.label],
          icon: VIEW_META[item.view].icon,
          run: () =>
            router.push(
              typeof item.href === "function" ? item.href() : item.href,
            ),
        });
      }
    }
    actions.push(
      {
        label: "Log a mock",
        keywords: ["add attempt", "new mock", "record score"],
        icon: "plus",
        shortcut: "N",
        run: onAddMock,
      },
      {
        label: "New task",
        keywords: ["add task", "quick add", "personal task"],
        icon: "list",
        run: newTask,
      },
    );
    if (aiEnabled) {
      actions.push({
        label: "Ask AI",
        keywords: ["chat", "assistant", "coach"],
        icon: "sparkles",
        run: onOpenAi,
      });
    }
    return actions;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- static nav data; router stable
  }, [aiEnabled, onAddMock, onOpenAi, router]);

  const needle = query.toLowerCase();
  const matchesStatic = (action: (typeof pageActions)[number]) =>
    !searching ||
    action.label.toLowerCase().includes(needle) ||
    (action.keywords ?? []).some((k) => k.toLowerCase().includes(needle));
  const visiblePages = pageActions.filter((entry) => matchesStatic(entry));

  const loadingFirstPage = searching && search.isPending;
  const searchFailed = searching && search.isError;
  const empty =
    searching &&
    !loadingFirstPage &&
    !searchFailed &&
    resultCount === 0 &&
    visiblePages.length === 0;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search workspace"
      size="md"
      className="p-0"
    >
      <div className="p-4">
        <Input
          autoFocus
          value={raw}
          onValueChange={setRaw}
          placeholder="Search mocks, tasks, plan days…"
          leading={<PlainIcon name="search" size={14} tone="muted" />}
          trailing={
            <span className="hidden items-center gap-1 sm:flex">
              {searching && loadingFirstPage ? (
                <Spinner size="xs" />
              ) : (
                <Kbd keys={["esc"]} size="sm" />
              )}
            </span>
          }
          aria-label="Search mocks, tasks, plan days"
        />
      </div>

      <div className="max-h-[26rem] overflow-y-auto border-t border-border px-2 pb-2">
        {/* Recent searches — only while the input is empty. */}
        {!searching && recent.length > 0 && (
          <div>
            <GroupHeading label="Recent searches" count={recent.length} />
            {recent.map((entry) => (
              <Row
                key={entry}
                icon="history"
                onClick={() => setRaw(entry)}
              >
                {entry}
              </Row>
            ))}
            <button
              type="button"
              onClick={clearRecent}
              className="flex h-9 w-full items-center gap-2.5 rounded-xl px-3 text-left text-[13px] text-muted-foreground transition-colors hover:bg-accent"
            >
              <PlainIcon name="close" size={16} tone="muted" />
              <span className="min-w-0 flex-1">Clear history</span>
            </button>
          </div>
        )}

        {/* Pages & quick actions — static, instant, no fetch. */}
        {visiblePages.length > 0 && (
          <div>
            <GroupHeading
              label={searching ? "Pages & actions" : "Pages"}
              count={visiblePages.length}
            />
            {visiblePages.map((action) => (
              <Row
                key={action.label}
                icon={action.icon}
                shortcut={action.shortcut}
                tone={action.shortcut ? "primary" : "muted"}
                onClick={() => {
                  remember(query);
                  run(() => action.run());
                }}
              >
                {action.label}
              </Row>
            ))}
          </div>
        )}

        {loadingFirstPage && (
          <div>
            <GroupHeading label="Searching…" />
            {[0, 1, 2].map((row) => (
              <div
                key={row}
                className="flex h-10 items-center gap-2.5 px-3 opacity-60"
              >
                <span className="size-4 shrink-0 animate-[ui-blink_1.2s_ease-in-out_infinite] rounded-full bg-muted" />
                <span
                  className="h-3.5 rounded-full bg-muted"
                  style={{ width: `${68 - row * 14}%` }}
                />
              </div>
            ))}
          </div>
        )}

        {searchFailed && (
          <div role="alert" className="px-3 py-6">
            <p className="font-serif text-base text-foreground">
              Search could not load.
            </p>
            <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
              {search.error instanceof Error
                ? search.error.message
                : "The connection dropped before results arrived."}
            </p>
            <button
              type="button"
              onClick={() => void search.refetch()}
              className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium text-foreground shadow-[inset_0_0_0_1px_var(--border)] transition-colors hover:bg-accent"
            >
              <PlainIcon name="refresh" size={13} /> Retry
            </button>
          </div>
        )}

        {searching && grouped.attempts.length > 0 && (
          <div>
            <GroupHeading label="Mock history" count={grouped.attempts.length} />
            {grouped.attempts.map((item) => (
              <Row
                key={item.id}
                icon="history"
                meta={item.subtitle}
                onClick={() =>
                  run(() => {
                    remember(query);
                    // The URL param is the handoff: /history seeds its filter
                    // state from the address bar on mount, so ?search=…
                    // restores the filter and the mirror keeps it shareable.
                    router.push(
                      `/history?search=${encodeURIComponent(item.title)}`,
                    );
                  })
                }
              >
                {item.title}
              </Row>
            ))}
          </div>
        )}

        {searching && grouped.tasks.length > 0 && (
          <div>
            <GroupHeading label="Your tasks" count={grouped.tasks.length} />
            {grouped.tasks.map((item) => (
              <Row
                key={item.id}
                icon="check"
                meta={item.subtitle}
                onClick={() =>
                  run(() => {
                    remember(query);
                    router.push("/my-tasks");
                  })
                }
              >
                {item.title}
              </Row>
            ))}
          </div>
        )}

        {searching && grouped.groups.length > 0 && (
          <div>
            <GroupHeading label="Task groups" count={grouped.groups.length} />
            {grouped.groups.map((item) => (
              <Row
                key={item.id}
                icon="layers"
                meta={item.subtitle}
                onClick={() =>
                  run(() => {
                    remember(query);
                    router.push("/my-tasks");
                  })
                }
              >
                {item.title}
              </Row>
            ))}
          </div>
        )}

        {searching && grouped.plan.length > 0 && (
          <div>
            <GroupHeading label="Study plan" count={grouped.plan.length} />
            {grouped.plan.map((item) => (
              <Row
                key={item.id}
                icon="calendar"
                meta={item.subtitle}
                onClick={() =>
                  run(() => {
                    remember(query);
                    if (item.date) router.push(planHref(item.date));
                  })
                }
              >
                {item.title}
              </Row>
            ))}
          </div>
        )}

        {searching && hasMore && !loadingFirstPage && (
          <button
            type="button"
            onClick={() => void search.fetchNextPage()}
            className={cn(
              "flex h-10 w-full items-center justify-center gap-2 rounded-xl px-3 text-[13px] text-muted-foreground transition-colors hover:bg-accent",
            )}
          >
            {search.isFetchingNextPage ? (
              <>
                <Spinner size="xs" />
                <span>Loading more…</span>
              </>
            ) : (
              <>
                <PlainIcon name="chevronDown" size={14} />
                <span>Load more</span>
              </>
            )}
          </button>
        )}

        {empty && (
          <div className="px-3 py-8 text-center">
            <p className="font-serif text-base text-foreground">
              No matches for “{query}”.
            </p>
            <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
              Try a mock name, a task title, a group, or a plan day.
            </p>
          </div>
        )}

        {searching &&
          !loadingFirstPage &&
          !searchFailed &&
          resultCount === 0 &&
          visiblePages.length > 0 && (
            <p className="px-3 pb-3 pt-1 text-xs text-muted-foreground">
              Nothing in your records matches — the pages above did.
            </p>
          )}
      </div>

      {/* Keyboard legend. Hidden on phones (no keyboard row to spare). */}
      <div className="hidden items-center gap-4 border-t border-border px-4 py-2 text-[10px] text-muted-foreground sm:flex">
        <span>
          <Kbd keys={["↑", "↓"]} size="sm" /> move
        </span>
        <span>
          <Kbd keys={["↵"]} size="sm" /> open
        </span>
        <span>
          <Kbd keys={["esc"]} size="sm" /> close
        </span>
      </div>
    </Dialog>
  );
}
