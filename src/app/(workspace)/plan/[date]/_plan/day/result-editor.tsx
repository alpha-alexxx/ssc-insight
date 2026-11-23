"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/button";
import { Checkbox } from "@/components/checkbox";
import { Input } from "@/components/input";
import { PlainIcon } from "@/components/icon";
import { Textarea } from "@/components/textarea";
import { toast } from "@/components/toast-stack";
import { totals, type Attempt } from "@/lib/domain";
import type { usePlanData } from "@/components/use-plan-data";
import { fillFromAttempt, matchAttemptForTask } from "@/lib/plan/attempt-match";
import type { PlanTaskView } from "@/lib/plan/view-model";

type NumberField = "score" | "wrong" | "unattempted" | "percentile";

/** Hides the browser's number spinners (the old `no-spin` utility). */
const NO_SPIN =
  "tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

/**
 * The plan task's record-result step — the "record" half of the day's
 * attempt → record workflow. Opened and closed explicitly from the row (no
 * silent expansion), everything drafts locally and saves with one explicit
 * "Save result" call; blanks stay unknown (never zero). When the tracker has
 * a matching attempt for this task, one click prefills the draft from it —
 * nothing writes until Save.
 *
 * Hairline rebuild: the fields are the Hairline Input/Textarea/Checkbox; the
 * save toast is the toast-stack API.
 */
export function ResultEditor({
  task,
  planApi,
  attempts,
  onClose,
}: {
  task: PlanTaskView;
  planApi: ReturnType<typeof usePlanData>;
  attempts: Attempt[];
  onClose: () => void;
}) {
  const { updateTask } = planApi;
  const [score, setScore] = useState(task.score?.toString() ?? "");
  const [wrong, setWrong] = useState(task.wrong?.toString() ?? "");
  const [unattempted, setUnattempted] = useState(
    task.unattempted?.toString() ?? "",
  );
  const [percentile, setPercentile] = useState(
    task.percentile?.toString() ?? "",
  );
  const [rev1, setRev1] = useState(task.rev1);
  const [rev2, setRev2] = useState(task.rev2);
  const [rev3, setRev3] = useState(task.rev3);
  const [notes, setNotes] = useState(task.notes);

  const matched = useMemo(
    () => matchAttemptForTask(task, attempts),
    [task, attempts],
  );

  const parse = (raw: string, max?: number): number | null | "invalid" => {
    const trimmed = raw.trim();
    if (trimmed === "") return null;
    const value = Number(trimmed);
    if (Number.isNaN(value) || value < 0) return "invalid";
    if (max !== undefined && value > max) return "invalid";
    return value;
  };

  const parsed = {
    score: parse(score, task.marks),
    percentile: parse(percentile, 100),
    wrong: parse(wrong, task.marks),
    unattempted: parse(unattempted, task.questions),
  };
  const invalid = Object.values(parsed).some((value) => value === "invalid");

  const dirty =
    parsed.score !== (task.score ?? null) ||
    parsed.percentile !== (task.percentile ?? null) ||
    parsed.wrong !== (task.wrong ?? null) ||
    parsed.unattempted !== (task.unattempted ?? null) ||
    rev1 !== task.rev1 ||
    rev2 !== task.rev2 ||
    rev3 !== task.rev3 ||
    notes !== task.notes;

  function fill() {
    if (!matched) return;
    const draft = fillFromAttempt(matched);
    setScore(draft.score.toString());
    setWrong(draft.wrong.toString());
    setUnattempted(draft.unattempted.toString());
    if (draft.percentile != null) setPercentile(draft.percentile.toString());
  }

  function save() {
    if (invalid || !dirty) return;
    updateTask(task.key, {
      score: parsed.score === "invalid" ? undefined : parsed.score,
      percentile:
        parsed.percentile === "invalid" ? undefined : parsed.percentile,
      wrong: parsed.wrong === "invalid" ? undefined : parsed.wrong,
      unattempted:
        parsed.unattempted === "invalid" ? undefined : parsed.unattempted,
      rev1,
      rev2,
      rev3,
      notes,
    });
    toast.success("Result saved", { description: task.name });
    onClose();
  }

  const numberField = (
    field: NumberField,
    label: string,
    value: string,
    set: (value: string) => void,
    max?: number,
    step?: string,
  ) => (
    <Input
      label={label}
      type="number"
      min={0}
      max={max}
      step={step}
      value={value}
      placeholder="—"
      aria-invalid={parse(value, max) === "invalid"}
      onChange={(e) => set(e.target.value)}
      inputClassName={NO_SPIN}
    />
  );

  return (
    <div className="mt-3 ml-0 rounded-2xl bg-muted/40 p-4 shadow-[inset_0_0_0_1px_var(--border)] sm:ml-[52px]">
      {matched && (
        <div className="mb-3 flex flex-col gap-2 rounded-xl bg-primary/10 px-3 py-2 shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--primary)_30%,transparent)] sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-foreground">
            <span className="font-medium">Matched attempt:</span>{" "}
            {matched.name} · {totals(matched).score}/{totals(matched).maxScore}
            {matched.percentile != null
              ? ` · ${matched.percentile}%ile`
              : ""}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={fill}
          >
            <PlainIcon name="download" size={12} /> Fill from attempt
          </Button>
        </div>
      )}
      <p className="mb-3 text-xs font-medium text-foreground">
        How did “{task.name}” go?
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {numberField("score", "Score", score, setScore, task.marks)}
        {numberField("wrong", "Wrong", wrong, setWrong, task.marks)}
        {numberField(
          "unattempted",
          "Unattempted",
          unattempted,
          setUnattempted,
          task.questions,
        )}
        {numberField("percentile", "Percentile", percentile, setPercentile, 100, "0.01")}
      </div>
      <div className="mt-3 flex flex-wrap gap-4">
        {(
          [
            ["Rev-1 done", rev1, setRev1] as const,
            ["Rev-2 done", rev2, setRev2] as const,
            ["Rev-3 done", rev3, setRev3] as const,
          ]
        ).map(([label, value, set]) => (
          <Checkbox
            key={label}
            size="sm"
            checked={value}
            label={label}
            onCheckedChange={(checked) => set(checked)}
          />
        ))}
      </div>
      <div className="mt-3">
        <Textarea
          label="Weak areas / notes for this test"
          minRows={2}
          maxRows={8}
          maxLength={2000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Tricks, formulas, mistakes to revisit"
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-muted-foreground">
          Empty fields stay unknown — a blank score is never counted as zero.
        </p>
        <div className="flex items-center gap-2">
          {invalid && (
            <span role="alert" className="text-[11px] text-destructive">
              Check the highlighted numbers.
            </span>
          )}
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={invalid || !dirty}
            onClick={save}
            title={dirty ? undefined : "Nothing to save yet"}
          >
            Save result
          </Button>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {dirty ? "Unsaved result changes." : "Result saved."}
      </p>
    </div>
  );
}
