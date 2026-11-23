"use client";
import { memo } from "react";
import { Pagination } from "./pagination";
import { Select } from "./select";
import { PAGE_SIZES, type PageSize } from "@/lib/domain";
import { cn } from "@/lib/utils";

/**
 * The shared pagination footer for the server-paged attempt lists
 * (/history table, /compare picker): a "Showing X–Y of N" line with the
 * per-page select, and Hairline Pagination — numbered pages with a moving
 * mark from sm up, a compact "Page X of Y" readout in a narrow column.
 *
 * The page number is server-owned: the footer only reports and navigates,
 * it never clamps or reorders rows itself.
 */

export const AttemptPagination = memo(function AttemptPagination({
  page,
  pageCount,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
  noun = "mocks",
  className,
}: {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: PageSize) => void;
  noun?: string;
  className?: string;
}) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const through = Math.min(page * pageSize, total);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-border px-4 py-3",
        className,
      )}
    >
      <p className="text-xs tabular-nums text-muted-foreground" aria-live="polite">
        Showing {from}–{through} of {total} {noun}
      </p>
      <div className="flex items-center gap-2">
        <span className="hidden whitespace-nowrap text-xs text-muted-foreground sm:inline">
          Per page
        </span>
        <Select
          label="Rows per page"
          hideLabel
          size="sm"
          className="w-[76px]"
          value={String(pageSize)}
          onValueChange={(value) => {
            // The options are exactly PAGE_SIZES, so the value is one.
            const next = Number(value) as PageSize;
            if (PAGE_SIZES.includes(next)) onPageSizeChange(next);
          }}
          options={PAGE_SIZES.map((size) => ({
            value: String(size),
            label: String(size),
          }))}
        />
      </div>
      {pageCount > 1 && (
        <Pagination
          page={page}
          pageCount={pageCount}
          onPageChange={onPageChange}
          className="min-w-0 flex-1"
        />
      )}
    </div>
  );
});
