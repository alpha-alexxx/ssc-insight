"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { linkHost } from "@/lib/plan/view-model";
import { istTodayIso } from "@/lib/plan/view-model";
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
 * A coach-suggested task rendered from a ```task-suggestion fenced block:
 * the model never writes; the user's Add click does. Dismissed cards leave
 * the conversation text untouched.
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
  return (
    <div
      role="group"
      aria-label="Task suggestion from the coach"
      className="mt-3 border-l-2 border-l-accent bg-paper py-2 pl-3"
    >
      <p className="section-label text-accent">Suggested task</p>
      <p className="mt-1.5 text-[13px] font-medium leading-snug">
        {suggestion.title}
      </p>
      <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted">
        <span className="rounded-pill border border-rule-soft bg-soft px-2 py-0.5">
          {suggestion.category === "other"
            ? "Personal"
            : suggestion.category.replace(/_/g, " ")}
        </span>
        {dueDate && <span className="tabular">Due {dueDate}</span>}
        {suggestion.priority !== "normal" && (
          <span
            className={
              suggestion.priority === "high" ? "text-accent font-medium" : ""
            }
          >
            {suggestion.priority} priority
          </span>
        )}
        {host && <span className="truncate">Link: {host}</span>}
      </p>
      {suggestion.notes && (
        <p className="mt-1 text-[11px] leading-relaxed text-muted">
          {suggestion.notes}
        </p>
      )}
      {suggestion.urlRemovedReason && (
        <p className="mt-1 text-[11px] text-warning">
          {suggestion.urlRemovedReason}
        </p>
      )}
      {state === "added" ? (
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-positive">
          <Check size={13} /> Added to My Tasks
        </p>
      ) : state === "failed" ? (
        <div className="mt-2">
          <p role="alert" className="text-xs text-danger">
            {failure}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-1.5"
            onClick={add}
          >
            Retry
          </Button>
        </div>
      ) : (
        <div className="mt-2.5 flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            className="min-h-11 flex-1 sm:min-h-0 sm:flex-none"
            onClick={add}
            disabled={!taskApi || state === "busy"}
          >
            {state === "busy" ? "Adding…" : "Add task"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="min-h-11 sm:min-h-0"
            onClick={() => setState("dismissed")}
            disabled={state === "busy"}
          >
            Dismiss
          </Button>
        </div>
      )}
    </div>
  );
}
