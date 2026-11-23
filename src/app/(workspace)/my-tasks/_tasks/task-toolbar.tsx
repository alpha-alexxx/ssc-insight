"use client";

import { useState, type RefObject } from "react";
import { Button } from "@/components/button";
import { DropdownMenu, type MenuEntry } from "@/components/dropdown-menu";
import { Input } from "@/components/input";
import { PlainIcon } from "@/components/icon";
import { Select } from "@/components/select";
import { SegmentedControl } from "@/components/segmented-control";
import { Sheet } from "@/components/sheet";
import type {
  TaskFilters,
  TaskLayout,
  TaskSort,
  TaskStatusFilter,
} from "./use-tasks-view-state";
import type { TaskGroup } from "@/components/shared/tasks/types";

const SORT_LABELS: Record<TaskSort, string> = {
  priority: "Priority",
  date: "Due date",
  newest: "Newest first",
  title: "Title",
};
const STATUS_LABELS: Record<TaskStatusFilter, string> = {
  all: "Any status",
  todo: "To do",
  in_progress: "In progress",
  completed: "Done",
};
const PRIORITY_LABELS: Record<string, string> = {
  all: "Any priority",
  high: "High",
  normal: "Normal",
  low: "Low",
};

export function filterCount(filters: TaskFilters): number {
  return (
    (filters.status !== "all" ? 1 : 0) +
    (filters.priority !== "all" ? 1 : 0) +
    (filters.group !== "all" ? 1 : 0)
  );
}

/** An option row that carries a drawn check when it is the active choice. */
function menuOption(
  id: string,
  label: string,
  active: boolean,
  onSelect: () => void,
): MenuEntry {
  return {
    type: "item",
    id,
    label,
    icon: active ? <PlainIcon name="check" size={13} /> : undefined,
    onSelect,
  };
}

/**
 * Search, sort, filters, layout, and select mode in one control row.
 * Desktop uses labeled dropdowns; below md the filter controls collapse
 * into a single "Filters (n)" bottom sheet with the same options.
 *
 * Hairline rebuild: search is the Hairline Input (leading icon), the
 * dropdowns are the declarative DropdownMenu, the layout switch is the
 * SegmentedControl, and the mobile filter surface is the Hairline Sheet.
 */
export function TaskToolbar({
  tab,
  layout,
  filters,
  groups,
  search,
  onSearch,
  onPatchFilters,
  onClearFilters,
  onLayout,
  selecting,
  hasItems,
  onToggleSelect,
  searchRef,
}: {
  tab: string;
  layout: TaskLayout;
  filters: TaskFilters;
  groups: TaskGroup[];
  search: string;
  onSearch: (value: string) => void;
  onPatchFilters: (patch: Partial<TaskFilters>) => void;
  onClearFilters: () => void;
  onLayout: (layout: TaskLayout) => void;
  selecting: boolean;
  hasItems: boolean;
  onToggleSelect: () => void;
  searchRef?: RefObject<HTMLInputElement | null>;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const active = filterCount(filters);

  const filtersItems: MenuEntry[] = [
    ...(tab === "all"
      ? ([
          { type: "label", label: "Status" } as MenuEntry,
          ...(["all", "todo", "in_progress", "completed"] as TaskStatusFilter[]).map((value) =>
            menuOption(
              `status-${value}`,
              STATUS_LABELS[value],
              filters.status === value,
              () => onPatchFilters({ status: value }),
            ),
          ),
          { type: "separator" } as MenuEntry,
        ])
      : []),
    { type: "label", label: "Priority" } as MenuEntry,
    ...(["all", "high", "normal", "low"] as const).map((value) =>
      menuOption(
        `priority-${value}`,
        PRIORITY_LABELS[value],
        filters.priority === value,
        () => onPatchFilters({ priority: value }),
      ),
    ),
    { type: "separator" } as MenuEntry,
    { type: "label", label: "Group" } as MenuEntry,
    menuOption("group-all", "All groups", filters.group === "all", () =>
      onPatchFilters({ group: "all" }),
    ),
    menuOption("group-ungrouped", "Ungrouped", filters.group === "ungrouped", () =>
      onPatchFilters({ group: "ungrouped" }),
    ),
    ...groups.map((group) =>
      menuOption(`group-${group.id}`, group.name, filters.group === group.id, () =>
        onPatchFilters({ group: group.id }),
      ),
    ),
    ...(active > 0
      ? ([
          { type: "separator" } as MenuEntry,
          {
            type: "item",
            id: "clear-filters",
            label: "Clear all filters",
            onSelect: onClearFilters,
          } as MenuEntry,
        ])
      : []),
  ];

  const layoutSegment = (
    <SegmentedControl
      label="Layout"
      value={layout}
      onValueChange={(value) => onLayout(value as TaskLayout)}
      size="sm"
      className="shrink-0"
      options={[
        { value: "list", label: "List" },
        { value: "board", label: "Board" },
      ]}
    />
  );

  const selectButton = hasItems ? (
    <Button
      type="button"
      variant={selecting ? "primary" : "outline"}
      size="sm"
      aria-pressed={selecting}
      onClick={onToggleSelect}
      title="Select mode (S)"
    >
      <PlainIcon name="check" size={13} />
      Select
    </Button>
  ) : null;

  return (
    <>
      <div className="@container/tasks-toolbar flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 basis-52">
          <Input
            ref={searchRef}
            aria-label="Search tasks"
            value={search}
            maxLength={200}
            placeholder="Search tasks…"
            leading={<PlainIcon name="search" size={14} />}
            onValueChange={onSearch}
          />
        </div>
        <div className="hidden items-center gap-2 @lg/tasks-toolbar:flex">
          <DropdownMenu
            trigger={
              <Button type="button" variant="outline" size="sm">
                Sort: {SORT_LABELS[filters.sort]}
              </Button>
            }
            align="end"
            label="Sort tasks"
            items={(["priority", "date", "newest", "title"] as TaskSort[]).map(
              (value) =>
                menuOption(
                  `sort-${value}`,
                  SORT_LABELS[value],
                  filters.sort === value,
                  () => onPatchFilters({ sort: value }),
                ),
            )}
          />
          <DropdownMenu
            trigger={
              <Button type="button" variant="outline" size="sm">
                Filters
                {active > 0 && (
                  <span className="ml-1 rounded-full bg-primary px-1.5 text-[11px] font-semibold leading-4 text-primary-foreground">
                    {active}
                  </span>
                )}
              </Button>
            }
            align="end"
            label="Filter tasks"
            items={filtersItems}
          />
          {selectButton}
        </div>
        <div className="flex items-center gap-2 @lg/tasks-toolbar:hidden">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSheetOpen(true)}
          >
            Filters
            {active > 0 && (
              <span className="ml-1 rounded-full bg-primary px-1.5 text-[11px] font-semibold leading-4 text-primary-foreground">
                {active}
              </span>
            )}
          </Button>
          {selectButton}
        </div>
        {layoutSegment}
      </div>
      <Sheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        side="bottom"
        title="Filters & sorting"
        description="Applied to the current list immediately."
        footer={
          <div className="flex w-full justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={active === 0}
              onClick={onClearFilters}
            >
              Clear all
            </Button>
            <Button type="button" size="sm" onClick={() => setSheetOpen(false)}>
              Done
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-3 pb-2">
          {tab === "all" && (
            <Select
              hideLabel
              label="Status filter"
              value={filters.status}
              onValueChange={(value) =>
                onPatchFilters({ status: value as TaskStatusFilter })
              }
              options={(["all", "todo", "in_progress", "completed"] as TaskStatusFilter[]).map(
                (value) => ({ value, label: STATUS_LABELS[value] }),
              )}
            />
          )}
          <Select
            hideLabel
            label="Priority filter"
            value={filters.priority}
            onValueChange={(value) => onPatchFilters({ priority: value as TaskFilters["priority"] })}
            options={(["all", "high", "normal", "low"] as const).map((value) => ({
              value,
              label: PRIORITY_LABELS[value],
            }))}
          />
          <Select
            hideLabel
            label="Group filter"
            value={filters.group}
            onValueChange={(value) => onPatchFilters({ group: value })}
            options={[
              { value: "all", label: "All groups" },
              { value: "ungrouped", label: "Ungrouped" },
              ...groups.map((group) => ({ value: group.id, label: group.name })),
            ]}
          />
          <Select
            hideLabel
            label="Sort"
            value={filters.sort}
            onValueChange={(value) => onPatchFilters({ sort: value as TaskSort })}
            options={(["priority", "date", "newest", "title"] as TaskSort[]).map(
              (value) => ({ value, label: SORT_LABELS[value] }),
            )}
          />
        </div>
      </Sheet>
    </>
  );
}
