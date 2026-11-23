"use client";

import { Button } from "@/components/button";
import { DropdownMenu } from "@/components/dropdown-menu";
import { PlainIcon } from "@/components/icon";

/**
 * Select-mode toolbar: bulk status, reschedule, and trash for the selection,
 * plus the "everything matching the current filters" scope action tucked
 * behind the ⋯ menu (confirm-gated by the parent) instead of sitting
 * permanently in the page as a red button.
 *
 * Restoring is deliberately absent: deleted tasks are recovered from /trash,
 * which is the only surface that lists them.
 *
 * Hairline rebuild: Hairline Button + declarative DropdownMenu (trigger +
 * items); icons are the static vocabulary.
 */
export function BulkBar({
  selectedCount,
  pageTotal,
  busy,
  scopeTotal,
  onSelectAll,
  onClear,
  onComplete,
  onInProgress,
  onReschedule,
  onTrash,
  onScopeTrash,
}: {
  selectedCount: number;
  pageTotal: number;
  busy: boolean;
  /** Total matching the current view/filters (for the scope action). */
  scopeTotal: number;
  onSelectAll: () => void;
  onClear: () => void;
  onComplete?: () => void;
  onInProgress?: () => void;
  onReschedule?: () => void;
  onTrash?: () => void;
  onScopeTrash?: () => void;
}) {
  const has = selectedCount > 0;
  return (
    <div
      role="toolbar"
      aria-label="Bulk actions"
      className="flex flex-wrap items-center gap-2 rounded-xl bg-primary/5 px-3 py-2 shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--primary)_30%,transparent)]"
    >
      <span className="text-xs font-medium tabular-nums text-foreground">
        {selectedCount} selected
      </span>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        {selectedCount < pageTotal && (
          <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={onSelectAll}>
            Select all on page
          </Button>
        )}
        <Button type="button" variant="ghost" size="sm" disabled={busy || !has} onClick={onClear}>
          Clear
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={busy || !has} onClick={onComplete}>
          <PlainIcon name="check" size={13} />
          Complete
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={busy || !has} onClick={onInProgress}>
          <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
          In progress
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={busy || !has} onClick={onReschedule}>
          <PlainIcon name="calendarPlus" size={13} />
          Reschedule
        </Button>
        <Button type="button" variant="destructive" size="sm" disabled={busy || !has} onClick={onTrash}>
          <PlainIcon name="trash" size={13} />
          Trash
        </Button>
        <DropdownMenu
          trigger={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label="More selection actions"
              disabled={busy}
            >
              <PlainIcon name="more" size={15} />
            </Button>
          }
          align="end"
          label="More selection actions"
          items={[
            ...(selectedCount < pageTotal
              ? [
                  {
                    type: "item" as const,
                    id: "select-all",
                    label: "Select all on page",
                    onSelect: onSelectAll,
                  },
                ]
              : []),
            ...(onScopeTrash && scopeTotal > 0
              ? [
                  { type: "separator" as const },
                  {
                    type: "item" as const,
                    id: "scope-trash",
                    label: `Trash all matching (${scopeTotal})…`,
                    icon: <PlainIcon name="trash" size={13} />,
                    destructive: true,
                    onSelect: onScopeTrash,
                  },
                ]
              : []),
          ]}
        />
      </div>
    </div>
  );
}
