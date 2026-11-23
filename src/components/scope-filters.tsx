"use client";
import { PlainIcon, type IconName } from "./icon";
import { Badge } from "./badge";
import { Button } from "./button";
import { Select } from "./select";
import { DateRangeFilter } from "./date-range-filter";
import { useExamScope } from "./exam-context";
import { SUBJECTS, subjectIds, type DashboardScope, type Filters } from "@/lib/domain";
import { cn } from "@/lib/utils";

/**
 * The analytical control row, shared by `/performance` and the record views.
 *
 * Two ways to read "which mocks am I looking at", and they must not be
 * confused:
 *
 *  - `mode="scope"` (`/performance`) — the four segments pick an ANALYTICAL
 *    SCOPE. One saved full mock yields one point, four subject points or two
 *    section points depending on the scope; it is never four mocks. Drives
 *    `setScope`.
 *  - `mode="type"` (`/history`, `/compare`) — the same four labels act as a
 *    RECORD FILTER over the paged list. Drives `changeFilter("type", …)`.
 *
 * One component so the two surfaces cannot drift apart visually; the mode
 * makes the different meaning explicit rather than hiding it behind a
 * `view === "dashboard"` branch.
 */

const SCOPES: { id: DashboardScope; label: string; icon: IconName }[] = [
  { id: "full", label: "Full mocks", icon: "file" },
  { id: "subject", label: "Subject wise", icon: "book" },
  { id: "sectional", label: "Sectional wise", icon: "layers" },
  { id: "all", label: "All mocks", icon: "history" },
];

export function ScopeFilters({
  mode,
  scope,
  setScope,
  filters,
  setFilters,
  changeFilter,
  platforms,
  onReset,
}: {
  mode: "scope" | "type";
  scope: DashboardScope;
  setScope: (scope: DashboardScope) => void;
  filters: Filters;
  /** Function-form-only filter writer; resets the paged lists' pages. */
  setFilters: (updater: (prev: Filters) => Filters) => void;
  changeFilter: (key: keyof Filters, value: string) => void;
  platforms: string[];
  /** Clears the non-scope filters; only rendered when something is active. */
  onReset?: () => void;
}) {
  const examScope = useExamScope();
  const activeExam = examScope.exams
    ? examScope.exams.builtIn.find(
        (exam) => exam.id === examScope.activeExamId,
      )
    : null;
  const tiers = activeExam?.tiers ?? [];
  const filterActive = !!(
    (filters.platform && filters.platform !== "all") ||
    (filters.from ?? "") ||
    (filters.to ?? "") ||
    (mode === "type" && filters.subject && filters.subject !== "all") ||
    (mode === "type" && filters.tier && filters.tier !== "all")
  );

  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      <div className="flex w-full min-w-0 flex-wrap items-center gap-2">
        {/* The four scope options share one row from sm up; on phones they
            become a 2×2 pill grid so every option stays visible with no
            scrolling and no ragged wrap point. */}
        <div
          role="group"
          aria-label={
            mode === "scope" ? "Analytical scope" : "Filter by mock type"
          }
          className="grid w-full grid-cols-2 gap-1 rounded-[14px] border border-border bg-background p-1 sm:flex sm:w-auto"
        >
          {SCOPES.map((option) => {
            const active =
              mode === "scope"
                ? scope === option.id
                : (filters.type ?? "all") === option.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={active}
                className={cn(
                  "inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-[10px] px-2.5 text-[12px] font-medium transition-colors duration-200 cursor-pointer",
                  active
                    ? "bg-[color-mix(in_oklab,var(--foreground)_9%,var(--background))] font-semibold text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
                onClick={() =>
                  mode === "scope"
                    ? setScope(option.id)
                    : changeFilter("type", option.id)
                }
              >
                <PlainIcon
                  name={option.icon}
                  size={14}
                  className={active ? "" : "text-muted-foreground"}
                />
                {option.label}
              </button>
            );
          })}
        </div>
        {/* Filters close the control group: one full-width row per filter on
            phones (stacked, so the label stays readable and the target full
            width), right-aligned inline from sm up. */}
        <div className="grid w-full grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:ml-auto sm:flex sm:w-auto sm:justify-end">
          <Select
            label="Filter by platform"
            hideLabel
            className="w-full sm:w-auto sm:max-w-[11.5rem]"
            value={filters.platform ?? "all"}
            onValueChange={(value) => changeFilter("platform", value)}
            options={[
              { value: "all", label: "All platforms" },
              ...platforms.map((p) => ({ value: p, label: p })),
            ]}
          />
          {mode === "type" && (
            <Select
              label="Filter by subject"
              hideLabel
              className="w-full sm:w-auto sm:max-w-[11.5rem]"
              value={filters.subject ?? "all"}
              onValueChange={(value) => changeFilter("subject", value)}
              options={[
                { value: "all", label: "All subjects" },
                ...subjectIds.map((id) => ({
                  value: id,
                  label: SUBJECTS[id].short,
                })),
              ]}
            />
          )}
          {tiers.length > 1 && mode === "type" && (
            <Select
              label="Filter by tier"
              hideLabel
              className="w-full sm:w-auto sm:max-w-[11.5rem]"
              value={filters.tier ?? "all"}
              onValueChange={(value) => changeFilter("tier", value)}
              options={[
                { value: "all", label: "All tiers" },
                ...tiers.map((tier) => ({
                  value: tier.id,
                  label: tier.label,
                })),
              ]}
            />
          )}
          <div
            className={cn(
              "flex min-h-9 items-center",
              "[&>span]:w-full sm:[&>span]:w-auto",
              mode === "type" && "max-sm:col-span-2",
            )}
          >
            <DateRangeFilter
              from={filters.from ?? ""}
              to={filters.to ?? ""}
              onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
            />
          </div>
        </div>
      </div>
      {/* Active filters stay visible and reversible: a figure the user cannot
          explain is worse than no figure. */}
      {filterActive && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[12px] text-muted-foreground">
          <span>Filtered</span>
          {[
            filters.platform && filters.platform !== "all"
              ? filters.platform
              : null,
            filters.from ? `from ${filters.from}` : null,
            filters.to ? `to ${filters.to}` : null,
            mode === "type" && filters.subject && filters.subject !== "all"
              ? SUBJECTS[filters.subject as keyof typeof SUBJECTS]?.short ?? null
              : null,
            mode === "type" && filters.tier && filters.tier !== "all"
              ? filters.tier
              : null,
          ]
            .filter(Boolean)
            .map((label) => (
              <Badge key={String(label)} tone="neutral" size="sm">
                {String(label)}
              </Badge>
            ))}
          {onReset && (
            <Button variant="link" size="sm" onClick={onReset}>
              Reset
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
