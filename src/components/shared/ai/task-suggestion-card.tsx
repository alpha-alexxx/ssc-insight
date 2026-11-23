"use client";

import { useState } from "react";
import { ApprovalCard, type ApprovalDetail } from "@/components/approval-card";
import { shortDate } from "@/lib/format";
import { linkHost, istTodayIso } from "@/lib/plan/view-model";
import type { TaskSuggestion } from "@/lib/ai/task-suggestion";

/** What a chat surface needs beyond chat state to add a suggested task: the
 * create handler performs the actual personal-task write (AI stays
 * read-only; this card's Add click is the confirm step). */
export type AiSheetTaskApi = {
  createPersonalTask: (input: {
    title: string;
    notes?: string;
    dueDate?: string | null;
    url?: string | null;
    category: string;
    priority: string;
    status: string;
  }) => Promise<unknown>;
};

/**
 * A coach-suggested task rendered from a ```task-suggestion fenced block, on
 * Hairline's `ApprovalCard`: the model never writes; the user's Add-task
 * click does (approve = add, deny = dismiss). Dismissed cards leave the
 * conversation text untouched.
 */
export function TaskSuggestionCard({
  suggestion,
  taskApi,
  onTaskAdded,
}: {
  suggestion: TaskSuggestion;
  taskApi?: AiSheetTaskApi;
  onTaskAdded?: () => void;
}) {
  const [state, setState] = useState<
    "pending" | "busy" | "added" | "failed" | "dismissed"
  >("pending");
  const [failure, setFailure] = useState("");
  const host = suggestion.url ? linkHost(suggestion.url) : null;
  // Personal todos now require a date; when the model leaves one out, the
  // confirmation card defaults to today (IST) instead of failing on save.
  const dueDate = suggestion.dueDate ?? istTodayIso();

  const add = () => {
    if (!taskApi || (state !== "pending" && state !== "failed")) return;
    setState("busy");
    setFailure("");
    taskApi
      .createPersonalTask({
        title: suggestion.title,
        notes: suggestion.notes || undefined,
        dueDate,
        url: suggestion.url,
        category: suggestion.category,
        priority: suggestion.priority,
        status: "todo",
      })
      .then(() => {
        setState("added");
        onTaskAdded?.();
      })
      .catch((cause: unknown) => {
        setState("failed");
        setFailure(
          cause instanceof Error ? cause.message : "Could not add the task.",
        );
      });
  };

  if (state === "dismissed") return null;

  const details: ApprovalDetail[] = [
    {
      label: "Category",
      value:
        suggestion.category === "other"
          ? "Personal"
          : suggestion.category.replace(/_/g, " "),
    },
    { label: "Due", value: shortDate(dueDate) },
  ];
  if (suggestion.priority !== "normal") {
    details.push({ label: "Priority", value: suggestion.priority });
  }
  if (host) {
    details.push({ label: "Link", value: host });
  }

  return (
    <div className="mt-3">
      <ApprovalCard
        title={suggestion.title}
        description={suggestion.notes || undefined}
        details={details}
        reason={suggestion.urlRemovedReason ?? undefined}
        status={state === "added" ? "approved" : "pending"}
        onApprove={add}
        onDeny={() => {
          if (state === "pending") setState("dismissed");
        }}
        approveLabel={state === "busy" ? "Adding…" : "Add task"}
        denyLabel="Dismiss"
      />
      {state === "failed" && failure ? (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {failure}
        </p>
      ) : null}
    </div>
  );
}
