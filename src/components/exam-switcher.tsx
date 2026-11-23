"use client";

import { useState } from "react";
import { DropdownMenu, type MenuEntry } from "@/components/dropdown-menu";
import { Button } from "@/components/button";
import { PlainIcon } from "@/components/icon";
import { useExamScope } from "@/components/exam-context";
import {
  examsKeys,
  putScopeRequest,
  switcherEntries,
  type SwitcherEntry,
} from "@/lib/queries/exams";
import { attemptKeys } from "@/lib/queries/attempts";
import { analyticsKeys } from "@/lib/queries/analytics";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

/**
 * The header exam switcher: one entry per enabled tier ("SSC CGL · Tier 2")
 * plus a combined "· All tiers" entry when an exam has two or more enabled
 * tiers. Switching persists the full scope (PUT /api/settings), and the
 * workspace — dashboard, history, add form, analytics — re-scopes through
 * the exam context. Rendered with Hairline's DropdownMenu.
 */
export function ExamSwitcher({
  onManageExams,
  // Compact rendering for tight headers (mobile pass); cosmetic only.
  compact = false,
}: {
  onManageExams: () => void;
  compact?: boolean;
}) {
  const scope = useExamScope();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  if (!scope.exams) {
    return (
      <span
        aria-hidden="true"
        className="inline-flex size-11 shrink-0 items-center rounded-full bg-muted/40 sm:h-8 sm:w-20"
      />
    );
  }

  const { exams } = scope;
  const entries = switcherEntries(exams);
  const activeKey = `${exams.activeExamId}:${exams.activeTierId}`;
  const active = entries.find((entry) => entry.key === activeKey);

  const switchScope = async (entry: SwitcherEntry) => {
    if (entry.key === activeKey || busy) return;
    setBusy(true);
    try {
      // Scope-only write: the server keeps the target envelope and
      // preferences exactly as they are, so switching tiers can never
      // overwrite a target edited elsewhere. The response is the full fresh
      // workspace, patched straight into the one cache.
      const fresh = await putScopeRequest({
        activeExamId: entry.examId,
        activeTierId: entry.tierId,
        enabledTiers: exams.enabledTiers,
      });
      queryClient.setQueryData(examsKeys.current(), fresh);
      // Attempts and analytics are tier-scoped, so the new scope invalidates
      // both (paged lists, the detail cache and the dashboard payload).
      await queryClient.invalidateQueries({ queryKey: attemptKeys.all });
      await queryClient.invalidateQueries({ queryKey: analyticsKeys.all });
    } finally {
      setBusy(false);
    }
  };

  const items: MenuEntry[] = [
    { type: "label", label: "Your exam tiers" },
    { type: "separator" },
    ...(entries.length === 0
      ? [{ type: "item" as const, id: "none", label: "No tiers enabled yet", disabled: true }]
      : entries.map((entry) => ({
          type: "item" as const,
          id: entry.key,
          label: entry.isCustom ? `${entry.label} · custom` : entry.label,
          icon: entry.key === activeKey ? <PlainIcon name="check" size={14} tone="primary" /> : undefined,
          onSelect: () => void switchScope(entry),
        }))),
    { type: "separator" },
    { id: "manage", label: "Manage exams", icon: <PlainIcon name="settings" size={14} />, onSelect: onManageExams },
  ];

  return (
    <DropdownMenu
      trigger={
        <Button
          variant="ghost"
          size="sm"
          disabled={busy}
          aria-label={`Active scope: ${active?.label ?? "exam"}. Switch exam or tier.`}
          className={cn("h-8 max-w-[10rem] gap-1.5 px-2.5 sm:max-w-[16rem]", compact && "max-w-8 px-0 sm:max-w-[16rem] sm:px-2.5")}
        >
          <PlainIcon name="layers" size={14} tone="primary" />
          <span className="truncate text-[12px] font-medium">{compact ? null : active?.label}</span>
          {compact ? null : <PlainIcon name="chevronDown" size={12} />}
        </Button>
      }
      items={items}
      side="bottom"
      align="end"
      label="Exam scope"
      minWidth={224}
    />
  );
}
