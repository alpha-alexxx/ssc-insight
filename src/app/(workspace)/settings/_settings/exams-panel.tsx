"use client";

import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Reveal, RevealItem } from "./_lib/motion-presets";
import { PanelCard } from "./_lib/panel";
import { examsScopeSchema, type ExamsScopeValues } from "@/components/shared/settings-schema";
import { PlainIcon } from "@/components/icon";
import { Button } from "@/components/button";
import { Checkbox } from "@/components/checkbox";
import { Input } from "@/components/input";
import { Accordion } from "@/components/accordion";
import { Alert } from "@/components/alert";
import { Dialog } from "@/components/dialog";
import { toast } from "@/components/toast-stack";
import { useExamScope } from "@/components/exam-context";
import {
  createCustomExamRequest,
  deleteCustomExamRequest,
  examsKeys,
  putScopeRequest,
  updateCustomExamRequest,
  type CustomExamInput,
  type CustomTierInput,
  type ExamsResponse,
} from "@/lib/queries/exams";
import { SUBJECTS, type SubjectId } from "@/lib/domain";
import { trashKeys } from "@/lib/queries/trash";
import { cn } from "@/lib/utils";
import { usePanelDraft } from "@/components/shared/settings-guard";

/**
 * Exams & tiers: enable the tiers you are preparing for, see each paper's
 * real shape (subjects, marks, marking, duration and stages), set the
 * targeted tier, and build custom exams.
 *
 * Everything here is descriptive rather than decipherable-into-marks: the
 * catalog is versioned source data (see lib/exams.ts), so the panel shows
 * what the notice says and links where the number came from. Tier
 * enablement is a staged react-hook-form draft; the sticky save bar owns
 * the save/discard affordances.
 */
export function ExamsPanel() {
  const scope = useExamScope();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<CustomExamInput | null>(null);
  const [deleting, setDeleting] = useState<{ id: string; name: string } | null>(
    null,
  );

  const exams = scope.exams;

  // The staged draft. `values` re-syncs from the query cache whenever the
  // saved scope changes (including right after this panel's own save), so
  // the dirty flag always compares against the true server state.
  const savedTiers = exams?.enabledTiers;
  const values = useMemo(() => ({ enabledTiers: savedTiers ?? [] }), [savedTiers]);
  const form = useForm<ExamsScopeValues>({
    resolver: zodResolver(examsScopeSchema),
    defaultValues: values,
    values,
    mode: "onChange",
  });
  const { watch, setValue, handleSubmit, formState } = form;
  const watchedTiers = watch("enabledTiers");
  const enabled = useMemo(() => new Set(watchedTiers), [watchedTiers]);

  const saveScope = useCallback(
    async ({ enabledTiers: remaining }: ExamsScopeValues) => {
      if (!exams) return;
      setBusy(true);
      setError("");
      try {
        // If the active tier was just disabled, move the scope somewhere that
        // still resolves — preferring the same exam, then the exam's anchor.
        const activeKey = `${exams.activeExamId}:${exams.activeTierId}`;
        let activeExamId = exams.activeExamId;
        let activeTierId = exams.activeTierId;
        if (
          exams.activeTierId !== "all" &&
          remaining.length > 0 &&
          !remaining.includes(activeKey)
        ) {
          const sameExam = remaining.find((k) =>
            k.startsWith(`${exams.activeExamId}:`),
          );
          const next = sameExam ?? remaining[0]!;
          const sep = next.indexOf(":");
          activeExamId = next.slice(0, sep);
          activeTierId = next.slice(sep + 1);
        }
        const fresh = await putScopeRequest({
          activeExamId,
          activeTierId,
          enabledTiers: remaining,
        });
        queryClient.setQueryData<ExamsResponse>(examsKeys.current(), fresh);
        // The scope drives attempt and analytics queries, so they re-read.
        await queryClient.invalidateQueries({ queryKey: ["mock-attempts"] });
        await queryClient.invalidateQueries({ queryKey: ["analytics"] });
        toast.success("Exams updated");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save your exams");
      } finally {
        setBusy(false);
      }
    },
    [exams, queryClient],
  );

  const save = useCallback(
    () => handleSubmit(saveScope)(),
    [handleSubmit, saveScope],
  );
  const reset = useCallback(() => form.reset(), [form]);
  usePanelDraft("exams", {
    isDirty: formState.isDirty,
    reset,
    save,
  });

  const setTargeted = useCallback(
    async (examId: string) => {
      if (!exams) return;
      const firstEnabled =
        exams.enabledTiers
          .filter((key) => key.startsWith(`${examId}:`))
          .map((key) => key.slice(examId.length + 1))[0] ??
        exams.builtIn.find((exam) => exam.id === examId)?.primaryTierId ??
        exams.customExams.find((exam) => exam.id === examId)?.tiers[0]?.id;
      if (!firstEnabled) return;
      setBusy(true);
      setError("");
      try {
        const fresh = await putScopeRequest({
          activeExamId: examId,
          activeTierId: firstEnabled,
          enabledTiers: exams.enabledTiers,
        });
        queryClient.setQueryData<ExamsResponse>(examsKeys.current(), fresh);
        await queryClient.invalidateQueries({ queryKey: ["mock-attempts"] });
        await queryClient.invalidateQueries({ queryKey: ["analytics"] });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not change the exam");
      } finally {
        setBusy(false);
      }
    },
    [exams, queryClient],
  );

  const removeCustom = useCallback(
    async (id: string) => {
      setBusy(true);
      setError("");
      try {
        await deleteCustomExamRequest(id);
        await queryClient.invalidateQueries({ queryKey: examsKeys.all });
        // The exam is now a Trash row; a mounted /trash must show it.
        await queryClient.invalidateQueries({ queryKey: trashKeys.all });
        setDeleting(null);
        toast.success("Moved to Trash", {
          description: "Recoverable for 15 days",
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not delete the exam");
      } finally {
        setBusy(false);
      }
    },
    [queryClient],
  );

  const anyDialogOpen = creating || editing != null || deleting != null;

  if (!exams) {
    return (
      <PanelCard
        icon="layers"
        title="Exams & tiers"
        description={
          scope.failed
            ? "Your exam list could not be loaded."
            : "Loading your exams…"
        }
      >
        {scope.failed ? (
          <div className="flex items-center gap-3">
            <p role="alert" className="text-xs text-destructive">
              Check your connection, then try again.
            </p>
            <Button
              size="sm"
              variant="outline"
              icon={<PlainIcon name="refresh" size={13} />}
              onClick={scope.refresh}
            >
              Retry
            </Button>
          </div>
        ) : (
          <div className="space-y-2" role="status" aria-label="Loading exams">
            {Array.from({ length: 3 }, (_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-[14px] bg-muted"
                style={{ opacity: 1 - i * 0.15 }}
              />
            ))}
          </div>
        )}
      </PanelCard>
    );
  }

  const toggleTier = (key: string, on: boolean) => {
    const base = new Set(watch("enabledTiers"));
    if (on) base.add(key);
    else base.delete(key);
    setValue("enabledTiers", [...base], { shouldDirty: true });
  };

  return (
    <div className="flex flex-col gap-4">
      <PanelCard
        icon="layers"
        title="Exams & tiers"
        description="Enable the tiers you are preparing for, then pick which one the workspace follows."
      >
        <Reveal>
          {exams.enabledTiers.length === 0 && !formState.isDirty && (
            <RevealItem>
              <Alert tone="warning" title="Nothing is enabled yet.">
                Tick at least one tier below so mocks, targets and performance
                views have a scope.
              </Alert>
            </RevealItem>
          )}
          <RevealItem>
            <ul className="divide-y divide-border">
              {exams.builtIn.map((exam) => (
                <ExamRow
                  key={exam.id}
                  examId={exam.id}
                  name={exam.name}
                  cycle={exam.source.cycle}
                  tiers={exam.tiers.map((tier) => ({
                    id: tier.id,
                    label: tier.label,
                    maxScore: maxOf(tier),
                    durationMinutes: tier.durationMinutes ?? null,
                    subjects: tier.subjects.map((s) => ({
                      subjectId: s.subjectId,
                      questions: s.questions,
                      qualifying: s.qualifying,
                    })),
                    marking: tier.marking,
                    role: tier.role ?? null,
                  }))}
                  sources={[exam.source]}
                  stages={(exam.stages ?? []).map((stage) => ({
                    id: stage.id,
                    label: stage.label,
                    durationMinutes: stage.durationMinutes ?? null,
                    note: stage.note ?? null,
                  }))}
                  enabled={enabled}
                  activeExamId={exams.activeExamId}
                  activeTierId={exams.activeTierId}
                  busy={busy}
                  onToggleTier={toggleTier}
                  onTargeted={() => void setTargeted(exam.id)}
                />
              ))}
              {exams.customExams.map((exam) => (
                <ExamRow
                  key={exam.id}
                  examId={exam.id}
                  name={exam.name}
                  custom
                  tiers={exam.tiers.map((tier) => ({
                    id: tier.id,
                    label: tier.label,
                    maxScore: tier.maxScore,
                    durationMinutes: null,
                    subjects: tier.subjects,
                    marking: tier.marking,
                    role: null,
                  }))}
                  sources={[]}
                  stages={[]}
                  enabled={enabled}
                  activeExamId={exams.activeExamId}
                  activeTierId={exams.activeTierId}
                  busy={busy}
                  onToggleTier={toggleTier}
                  onTargeted={() => void setTargeted(exam.id)}
                  onEdit={() => {
                    setEditing({
                      id: exam.id,
                      name: exam.name,
                      tiers: exam.tiers.map((tier) => ({
                        id: tier.id,
                        label: tier.label,
                        subjects: tier.subjects.map((s) => ({ ...s })),
                        marking: { ...tier.marking },
                      })),
                    });
                  }}
                  onDelete={() => setDeleting({ id: exam.id, name: exam.name })}
                />
              ))}
            </ul>
          </RevealItem>
          {formState.errors.enabledTiers && (
            <p role="alert" className="mt-3 text-xs text-destructive">
              {formState.errors.enabledTiers.message}
            </p>
          )}
          {error && (
            <p role="alert" className="mt-3 text-xs text-destructive">
              {error}
            </p>
          )}
          <RevealItem className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="max-sm:w-full sm:ml-auto"
              disabled={anyDialogOpen || exams.customExams.length >= 20}
              onClick={() => setCreating(true)}
              icon={<PlainIcon name="plus" size={14} />}
              title={
                exams.customExams.length >= 20
                  ? "You already have 20 custom exams"
                  : undefined
              }
            >
              Create custom exam
            </Button>
          </RevealItem>
        </Reveal>
      </PanelCard>

      {(creating || editing) && (
        <CustomExamDialog
          initial={
            editing ?? {
              name: "",
              tiers: [
                {
                  label: "Tier 1",
                  subjects: [
                    { subjectId: "quant", questions: 25, qualifying: false },
                  ],
                  marking: { correct: 2, incorrect: 0.5 },
                },
              ],
            }
          }
          isNew={!editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}

      <Dialog
        open={deleting != null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Move ${deleting?.name ?? ""} to Trash?`}
        description={
          <>
            It disappears from the catalog and the scope switcher, and stays
            recoverable in Trash for 15 days. Its tiers, targets and
            percentile goal come back with it — they are only dropped when it
            is deleted permanently. An exam that still has logged mocks
            cannot be deleted.
            {deleting && exams?.activeExamId === deleting.id ? (
              <>
                {" "}
                This is your active exam: your scope moves to another enabled
                tier. Restoring it will not switch the scope back.
              </>
            ) : null}
          </>
        }
        footer={
          <>
            <Button variant="outline" disabled={busy} onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={busy}
              onClick={() => {
                if (deleting) void removeCustom(deleting.id);
              }}
            >
              Move to Trash
            </Button>
          </>
        }
      />
    </div>
  );
}

type TierSummary = {
  id: string;
  label: string;
  maxScore: number;
  durationMinutes: number | null;
  subjects: { subjectId: SubjectId; questions: number; qualifying: boolean }[];
  marking: { correct: number; incorrect: number };
  role: string | null;
};

type StageSummary = {
  id: string;
  label: string;
  durationMinutes: number | null;
  note: string | null;
};

type SourceSummary = { cycle: string; url: string; retrievedAt: string };

function ExamRow({
  examId,
  name,
  cycle,
  custom = false,
  tiers,
  sources,
  stages,
  enabled,
  activeExamId,
  activeTierId,
  busy,
  onToggleTier,
  onTargeted,
  onEdit,
  onDelete,
}: {
  examId: string;
  name: string;
  cycle?: string;
  custom?: boolean;
  tiers: TierSummary[];
  sources: SourceSummary[];
  stages: StageSummary[];
  enabled: Set<string>;
  activeExamId: string;
  activeTierId: string;
  busy: boolean;
  onToggleTier: (key: string, on: boolean) => void;
  onTargeted: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const enabledKeys = tiers
    .map((tier) => `${examId}:${tier.id}`)
    .filter((key) => enabled.has(key));
  // The combined "all" view belongs to this exam, so the exam IS targeted.
  const isTargeted =
    activeExamId === examId &&
    (activeTierId === "all"
      ? enabledKeys.length > 0
      : enabledKeys.includes(`${examId}:${activeTierId}`));

  return (
    <li className="py-3 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="min-w-36 flex-1 text-sm font-medium text-foreground">
          {name}
          {custom ? (
            <span className="ml-1.5 text-xs uppercase tracking-wide text-muted-foreground">
              custom
            </span>
          ) : null}
        </span>
        {cycle && (
          <span className="text-[13px] text-muted-foreground">
            Pattern: {cycle}
          </span>
        )}
        <Button
          type="button"
          size="sm"
          variant={isTargeted ? "secondary" : "outline"}
          aria-pressed={isTargeted}
          disabled={busy || enabledKeys.length === 0 || isTargeted}
          onClick={onTargeted}
          className={cn(
            isTargeted && "text-primary",
            enabledKeys.length === 0 && "text-muted-foreground",
          )}
          title={
            enabledKeys.length === 0
              ? "Enable a tier first"
              : isTargeted
                ? "This is the exam the workspace follows"
                : "Make this the exam the workspace follows"
          }
        >
          {isTargeted ? "Your exam" : "Set as your exam"}
        </Button>
        {custom && onEdit && (
          <Button variant="ghost" size="sm" disabled={busy} onClick={onEdit}>
            Edit
          </Button>
        )}
        {custom && onDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            disabled={busy}
            onClick={onDelete}
          >
            Delete
          </Button>
        )}
      </div>

      <div className="mt-2 space-y-1.5 pl-1">
        {tiers.map((tier) => {
          const key = `${examId}:${tier.id}`;
          const on = enabled.has(key);
          return (
            <Checkbox
              key={tier.id}
              checked={on}
              disabled={busy}
              onCheckedChange={(checked) => onToggleTier(key, checked === true)}
              label={tier.label}
              description={`${describeTier(tier)}${tier.role ? ` · ${tier.role}` : ""}`}
              aria-label={`Enable ${name} ${tier.label}`}
            />
          );
        })}
      </div>

      {(stages.length > 0 || sources.length > 0) && (
        <Accordion
          className="mt-1 pl-1"
          type="single"
          items={[
            {
              value: "detail",
              title: "Stages and source",
              content: (
                <ul className="space-y-1 text-[13px] leading-relaxed text-muted-foreground">
                  {stages.map((stage) => (
                    <li key={stage.id}>
                      <span className="font-medium text-foreground">{stage.label}</span>
                      {stage.durationMinutes ? ` · ${stage.durationMinutes} min` : ""}
                      {" · qualifying, not scored"}
                      {stage.note ? ` — ${stage.note}` : ""}
                    </li>
                  ))}
                  {sources.map((source) => (
                    <li key={source.url}>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="underline decoration-border underline-offset-2 hover:text-primary"
                      >
                        {source.cycle} notice
                      </a>{" "}
                      · read {source.retrievedAt}
                    </li>
                  ))}
                </ul>
              ),
            },
          ]}
        />
      )}
    </li>
  );
}

/** "4 parts · 130 Q · 390 marks · +3/−1 · 135 min" */
function describeTier(tier: TierSummary): string {
  const merit = tier.subjects.filter((s) => !s.qualifying);
  const qualifying = tier.subjects.length - merit.length;
  const questions = merit.reduce((sum, s) => sum + s.questions, 0);
  const parts = `${merit.length} part${merit.length === 1 ? "" : "s"}`;
  const penalty = tier.marking.incorrect
    ? `−${tier.marking.incorrect}`
    : "no negative";
  const bits = [
    parts,
    `${questions} Q`,
    `${tier.maxScore} marks`,
    `+${tier.marking.correct}/${penalty}`,
  ];
  if (tier.durationMinutes) bits.push(`${tier.durationMinutes} min`);
  if (qualifying)
    bits.push(`${qualifying} qualifying`);
  return bits.join(" · ");
}

function maxOf(tier: {
  subjects: readonly { questions: number; qualifying: boolean }[];
  marking: { correct: number };
}): number {
  return (
    tier.subjects
      .filter((s) => !s.qualifying)
      .reduce((sum, s) => sum + s.questions, 0) * tier.marking.correct
  );
}

const SUBJECT_CHOICES: SubjectId[] = [
  "quant",
  "reasoning",
  "english",
  "ga",
  "computer",
];

function CustomExamDialog({
  initial,
  isNew,
  onClose,
  onSaved,
}: {
  initial: CustomExamInput;
  isNew: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<CustomExamInput>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const valid =
    draft.name.trim().length > 0 &&
    draft.tiers.length > 0 &&
    draft.tiers.every(
      (tier) =>
        tier.label.trim().length > 0 &&
        tier.subjects.length > 0 &&
        tier.subjects.every((s) => s.questions >= 1) &&
        tier.marking.correct > 0 &&
        tier.marking.incorrect >= 0,
    );

  const updateTier = (index: number, patch: Partial<CustomTierInput>) => {
    setDraft((prev) => ({
      ...prev,
      tiers: prev.tiers.map((tier, i) =>
        i === index ? { ...tier, ...patch } : tier,
      ),
    }));
  };

  const save = async () => {
    setBusy(true);
    setError("");
    try {
      if (isNew) await createCustomExamRequest(draft);
      else await updateCustomExamRequest({ ...draft, id: draft.id! });
      await queryClient.invalidateQueries({ queryKey: examsKeys.all });
      toast.success(isNew ? "Custom exam created" : "Custom exam updated");
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the exam");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && !busy && onClose()}
      title={isNew ? "Create a custom exam" : `Edit ${initial.name}`}
      size="lg"
      description="Name the exam, then add its tiers. Each tier carries its own subjects, question counts and marking scheme."
      footer={
        <>
          <Button variant="outline" disabled={busy} onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={busy || !valid} loading={busy} onClick={() => void save()}>
            {isNew ? "Create exam" : "Save changes"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Exam name"
          maxLength={80}
          required
          placeholder="e.g. SSC JE, My Practice Paper"
          value={draft.name}
          disabled={busy}
          onValueChange={(name) =>
            setDraft((prev) => ({ ...prev, name }))
          }
        />

        {draft.tiers.map((tier, index) => {
          const meritQuestions = tier.subjects
            .filter((s) => !s.qualifying)
            .reduce((sum, s) => sum + s.questions, 0);
          return (
            <fieldset
              key={tier.id ?? `new-${index}`}
              className="rounded-[14px] border border-border p-3"
            >
              <legend className="flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Tier {index + 1}
                {draft.tiers.length > 1 && (
                  <button
                    type="button"
                    className="text-xs font-normal normal-case text-destructive hover:underline"
                    disabled={busy}
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        tiers: prev.tiers.filter((_, i) => i !== index),
                      }))
                    }
                  >
                    remove
                  </button>
                )}
              </legend>
              <div className="space-y-3">
                <Input
                  label="Tier label"
                  maxLength={40}
                  required
                  placeholder="e.g. Prelims, Mains, Paper 1"
                  disabled={busy}
                  value={tier.label}
                  onValueChange={(label) => updateTier(index, { label })}
                />
                <div className="space-y-2">
                  {SUBJECT_CHOICES.map((id) => {
                    const row = tier.subjects.find(
                      (s) => s.subjectId === id,
                    );
                    return (
                      <div
                        key={id}
                        className="flex flex-wrap items-center gap-3"
                      >
                        <Checkbox
                          checked={row != null}
                          disabled={busy}
                          className="min-w-36 flex-1"
                          onCheckedChange={(checked) => {
                            const subjects =
                              checked === true
                                ? [
                                    ...tier.subjects,
                                    {
                                      subjectId: id,
                                      questions: 25,
                                      qualifying: false,
                                    },
                                  ]
                                : tier.subjects.filter(
                                    (s) => s.subjectId !== id,
                                  );
                            updateTier(index, { subjects });
                          }}
                          label={SUBJECTS[id].name}
                        />
                        {row && (
                          <>
                            <Input
                              type="number"
                              inputMode="numeric"
                              className="max-w-24"
                              inputClassName="appearance-none"
                              label="Questions"
                              min={1}
                              max={500}
                              disabled={busy}
                              value={String(row.questions)}
                              onValueChange={(questions) =>
                                updateTier(index, {
                                  subjects: tier.subjects.map((s) =>
                                    s.subjectId === id
                                      ? {
                                          ...s,
                                          questions: Number(questions),
                                        }
                                      : s,
                                  ),
                                })
                              }
                            />
                            <Checkbox
                              checked={row.qualifying}
                              disabled={busy}
                              onCheckedChange={(checked) =>
                                updateTier(index, {
                                  subjects: tier.subjects.map((s) =>
                                    s.subjectId === id
                                      ? {
                                          ...s,
                                          qualifying: checked === true,
                                        }
                                      : s,
                                  ),
                                })
                              }
                              label="Qualifying (excluded from total)"
                            />
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex flex-wrap items-end gap-3">
                  <Input
                    type="number"
                    inputMode="decimal"
                    className="max-w-24"
                    inputClassName="appearance-none"
                    label="Marks per correct"
                    min={0.25}
                    max={100}
                    step="0.25"
                    disabled={busy}
                    value={String(tier.marking.correct)}
                    onValueChange={(correct) =>
                      updateTier(index, {
                        marking: {
                          ...tier.marking,
                          correct: Number(correct),
                        },
                      })
                    }
                  />
                  <Input
                    type="number"
                    inputMode="decimal"
                    className="max-w-24"
                    inputClassName="appearance-none"
                    label="Penalty per incorrect"
                    min={0}
                    max={100}
                    step="0.05"
                    disabled={busy}
                    value={String(tier.marking.incorrect)}
                    onValueChange={(incorrect) =>
                      updateTier(index, {
                        marking: {
                          ...tier.marking,
                          incorrect: Number(incorrect),
                        },
                      })
                    }
                  />
                  <p className="text-[13px] text-muted-foreground">
                    Maximum: {meritQuestions * tier.marking.correct} marks
                  </p>
                </div>
              </div>
            </fieldset>
          );
        })}

        {draft.tiers.length < 4 && (
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            icon={<PlainIcon name="plus" size={14} />}
            onClick={() =>
              setDraft((prev) => ({
                ...prev,
                tiers: [
                  ...prev.tiers,
                  {
                    label: `Tier ${prev.tiers.length + 1}`,
                    subjects: [
                      {
                        subjectId: "quant",
                        questions: 25,
                        qualifying: false,
                      },
                    ],
                    marking: { correct: 2, incorrect: 0.5 },
                  },
                ],
              }))
            }
          >
            Add tier
          </Button>
        )}
        {error && (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}
      </div>
    </Dialog>
  );
}
