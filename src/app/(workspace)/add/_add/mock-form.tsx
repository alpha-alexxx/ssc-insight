"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/button";
import { PlainIcon } from "@/components/icon";
import { Input } from "@/components/input";
import { Select, type SelectOption } from "@/components/select";
import { Checkbox } from "@/components/checkbox";
import { Textarea } from "@/components/textarea";
import { DatePicker } from "@/components/date-picker";
import { SegmentedControl } from "@/components/segmented-control";
import { StepperInput } from "@/components/stepper-input";
import { Alert } from "@/components/alert";
import { Collapsible } from "@/components/collapsible";
import { Add01Icon } from "@/components/animate-ui/icons/hugeicons/add-01";
import {
  attemptSchemaFor,
  sectionForSubjects,
  SUBJECTS,
  type Attempt,
  type AttemptInput,
  type PatternShape,
  type SubjectId,
  type SubjectResult,
  totals,
  formatNumber,
  formatScore,
  formatTime,
} from "@/lib/domain";
import { useExamScope } from "@/components/exam-context";
import type { ExamDef } from "@/lib/exams";
import {
  calculatedEntry,
  completionDate,
  completionTimestamp,
  MOCK_PLATFORMS,
  platformSelection,
} from "@/lib/mock-entry";
import { istTodayIso } from "@/lib/plan/view-model";
import { isIsoDate } from "@/lib/format";
import { DurationInput } from "./duration-input";
import { parseReport } from "@/lib/report-parser";
import { api } from "@/lib/api-client";
import type { AiStatus, ExtractResponse } from "@/lib/ai/client-types";
import {
  extractionToAttempt,
  MAX_EXTRACT_CHARS,
  type ExtractionDraft,
} from "@/lib/ai/extraction";
import { ExtractionReview } from "@/components/shared/add/extraction-review";
const blankSubject = (id: SubjectId, shape: PatternShape): SubjectResult => ({
  subjectId: id,
  questions:
    shape.subjects.find((s) => s.subjectId === id)?.questions ??
    SUBJECTS[id].questions,
  correct: 0,
  incorrect: 0,
  qualifying:
    shape.subjects.find((s) => s.subjectId === id)?.qualifying ?? false,
  timeSeconds: 0,
  scoreOverride: null,
});
function fullMockSectionHeading(subjectId: SubjectId, shape: PatternShape) {
  const section = shape.sections.find((s) => s.subjectIds[0] === subjectId);
  if (section) {
    const maxScore =
      section.subjectIds.reduce(
        (sum, id) =>
          sum +
          (shape.subjects.find((s) => s.subjectId === id)?.questions ?? 0),
        0,
      ) * shape.marking.correct;
    return `${section.name} · ${section.description} · ${maxScore} marks`;
  }
  const pattern = shape.subjects.find((s) => s.subjectId === subjectId);
  if (pattern?.qualifying)
    return `${SUBJECTS[subjectId].name} · qualifying · ${pattern.questions * shape.marking.correct} marks`;
  return null;
}
/** The default tier for a new attempt: the most-logged tier of this exam,
 * else the exam's primary tier. */
function defaultTierId(
  exam: ExamDef | null,
  knownAttempts: Attempt[] | undefined,
  examId: string,
): string {
  if (!exam) return "main";
  const counts = new Map<string, number>();
  for (const attempt of knownAttempts ?? []) {
    if (attempt.examId !== examId) continue;
    counts.set(attempt.tierId, (counts.get(attempt.tierId) ?? 0) + 1);
  }
  const [mostLogged] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? [];
  if (mostLogged && exam.tiers.some((t) => t.id === mostLogged))
    return mostLogged;
  return exam.primaryTierId;
}
/** Merit-bearing (non-qualifying) subject ids of a pattern, in order. */
function meritSubjectIds(shape: PatternShape): SubjectId[] {
  return shape.subjects.filter((s) => !s.qualifying).map((s) => s.subjectId);
}

/** Visible caption column for controls whose own label is aria-only
 * (StepperInput, SegmentedControl); matches the Field label row. */
function Labeled({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full flex-col">
      <p className="px-3 pb-1.5 text-[13px] font-medium text-foreground">{label}</p>
      {children}
    </div>
  );
}

export function MockForm({
  attempt,
  knownAttempts,
  initialDate,
  initialName,
  initialDraft,
  onPrefillApplied,
  backLabel = "Back to dashboard",
  onClose,
  onSaved,
}: {
  attempt?: Attempt;
  /** Already-loaded attempts from the shell; saves an extra fetch when the
   * duplicate check runs. Empty/undefined falls back to fetching. */
  knownAttempts?: Attempt[];
  /** Planner-selected date / task title for a new attempt. */
  initialDate?: string;
  initialName?: string;
  /** Reviewed draft from the AI panel's Log a Mock tab, applied once at
   * mount through the same merge path as a paste import. */
  initialDraft?: { values: Partial<AttemptInput>; date?: string };
  /** Called after the initial draft has been applied (shell clears it). */
  onPrefillApplied?: () => void;
  backLabel?: string;
  onClose: () => void;
  onSaved: (returnTo?: string | null) => void | Promise<void>;
}) {
  const scope = useExamScope();
  // Editing locks the exam+tier to the saved attempt; a new attempt uses the
  // active exam and its default (most-logged, else primary) tier.
  const editShape = attempt
    ? scope.resolveShape(attempt.examId, attempt.tierId)
    : null;
  const activeExam = scope.exams
    ? (scope.exams.builtIn.find((exam) => exam.id === scope.activeExamId) ??
      null)
    : null;
  const [tierId, setTierId] = useState(
    () =>
      attempt?.tierId ??
      defaultTierId(activeExam, knownAttempts, scope.activeExamId),
  );
  // The form offers the ENABLED tiers of the active exam — the scope the
  // switcher set. With the combined view active, every enabled tier of the
  // exam is offered and the default falls to the most-logged one.
  const tierOptions: { id: string; label: string }[] = attempt
    ? []
    : (() => {
        if (!scope.exams) return [];
        const examId = scope.activeExamId;
        const enabled = new Set(scope.exams.enabledTiers);
        const tierList =
          scope.exams.builtIn.find((exam) => exam.id === examId)?.tiers ??
          scope.exams.customExams.find((exam) => exam.id === examId)?.tiers ??
          [];
        return tierList
          .filter((tier) => enabled.has(`${examId}:${tier.id}`))
          .map((tier) => ({ id: tier.id, label: tier.label }));
      })();

  // While the exams payload is still loading the raw tierId may not resolve
  // ("main" default for built-ins); normalize to the exam's primary tier so
  // the select, the pattern, and the marks copy always agree.
  const effectiveTierId = attempt
    ? tierId
    : (tierOptions.find(
        (tier) =>
          tier.id ===
          (scope.activeTierId !== "all" ? scope.activeTierId : tierId),
      )?.id ??
      tierOptions.find((tier) => tier.id === tierId)?.id ??
      tierOptions[0]?.id ??
      activeExam?.primaryTierId ??
      tierId);
  const shape: PatternShape =
    editShape ??
    scope.resolveShape(
      scope.activeExamId,
      attempt?.tierId ?? effectiveTierId,
    ) ?? {
      examId: "cgl",
      tierId: "tier2",
      subjects: [
        { subjectId: "quant", questions: 30, qualifying: false },
        { subjectId: "reasoning", questions: 30, qualifying: false },
        { subjectId: "english", questions: 45, qualifying: false },
        { subjectId: "ga", questions: 25, qualifying: false },
        { subjectId: "computer", questions: 20, qualifying: true },
      ],
      marking: { correct: 3, incorrect: 1 },
      sections: [],
    };
  const examName =
    (scope.exams
      ? (scope.exams.builtIn.find(
          (exam) => exam.id === shape.examId,
        )?.name ??
        scope.exams.customExams.find((exam) => exam.id === shape.examId)
          ?.name)
      : null) ?? "SSC CGL";
  const [values, setValues] = useState<AttemptInput>(
    attempt ?? {
      name: initialName ?? "",
      platform: "",
      completedAt: "",
      type: "full",
      examId: shape.examId,
      tierId: shape.tierId,
      marking: shape.marking,
      subjects: meritSubjectIds(shape).map((id) => blankSubject(id, shape)),
      notes: "",
      source: "manual",
    },
  );
  const [date, setDate] = useState(
    attempt
      ? completionDate(attempt.completedAt)
      : initialDate && isIsoDate(initialDate)
        ? initialDate
        : istTodayIso(),
  );
  const [platformChoice, setPlatformChoice] = useState(
    platformSelection(attempt?.platform ?? ""),
  );
  const [mode, setMode] = useState<"form" | "paste">("form");
  const [paste, setPaste] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [importVersion, setImportVersion] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [duplicateReviewed, setDuplicateReviewed] = useState(false);
  const [additionalOpen, setAdditionalOpen] = useState(() =>
    Boolean(
      attempt ||
        values.rank != null ||
        values.participants != null ||
        values.percentile != null ||
        values.notes,
    ),
  );
  const errorRef = useRef<HTMLDivElement>(null);
  const [aiStatus, setAiStatus] = useState<AiStatus | null>(null);
  const [aiStatusChecked, setAiStatusChecked] = useState(false);
  const [aiDraft, setAiDraft] = useState<ExtractionDraft | null>(null);
  const [aiReviewing, setAiReviewing] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState("");
  useEffect(() => {
    if (mode !== "paste" || aiStatusChecked) return;
    let cancelled = false;
    void api<AiStatus>("/api/ai/status")
      .then((status) => {
        if (!cancelled) setAiStatus(status);
      })
      .catch(() => {
        // The deterministic parser remains available without AI status.
      })
      .finally(() => {
        if (!cancelled) setAiStatusChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, [mode, aiStatusChecked]);
  // One-shot AI-panel prefill: apply the reviewed draft once at mount via
  // the same merge path as a paste import, then tell the shell it is used.
  const prefillDraft = initialDraft;
  const prefillAppliedRef = useRef(false);
  const set = <K extends keyof AttemptInput>(
    key: K,
    value: AttemptInput[K],
  ) => {
    setValues((v) => ({ ...v, [key]: value }));
    setDuplicateReviewed(false);
  };
  const updateSubject = (index: number, changes: Partial<SubjectResult>) =>
    set(
      "subjects",
      values.subjects.map((s, i) => (i === index ? { ...s, ...changes } : s)),
    );
  const chooseType = (type: AttemptInput["type"]) => {
    setValues((v) => ({
      ...v,
      type,
      subjects: (
        type === "full"
          ? meritSubjectIds(shape)
          : type === "sectional"
            ? (shape.sections[0]?.subjectIds ?? [])
            : meritSubjectIds(shape).slice(0, 1)
      ).map(
        (id) => v.subjects.find((s) => s.subjectId === id) ?? blankSubject(id, shape),
      ),
    }));
    setDuplicateReviewed(false);
  };
  /** Switch the tier: reset the subject rows to the new pattern. */
  const chooseTier = (nextTierId: string) => {
    const nextShape = scope.resolveShape(scope.activeExamId, nextTierId);
    if (!nextShape) return;
    setTierId(nextTierId);
    setValues((v) => ({
      ...v,
      examId: nextShape.examId,
      tierId: nextShape.tierId,
      marking: nextShape.marking,
      type: "full",
      subjects: meritSubjectIds(nextShape).map((id) =>
        blankSubject(id, nextShape),
      ),
    }));
    setDuplicateReviewed(false);
  };
  const computedValues = calculatedEntry(values);
  const stats = totals(computedValues);
  const qualifyingSubject = shape.subjects.find((s) => s.qualifying);
  const includesQualifying =
    values.type === "full" &&
    qualifyingSubject != null &&
    values.subjects.some((s) => s.subjectId === qualifyingSubject.subjectId);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const input = attemptSchemaFor(shape).parse({
        ...computedValues,
        examId: shape.examId,
        tierId: shape.tierId,
        marking: shape.marking,
        completedAt: date ? completionTimestamp(date) : "",
      });
      if (!attempt && !duplicateReviewed) {
        // Reuse the workspace's loaded attempts when available; fetch only
        // if the shell hasn't delivered them yet (e.g. an immediate save).
        const existing =
          knownAttempts && knownAttempts.length
            ? knownAttempts
            : await api<Attempt[]>("/api/mock-attempts");
        const duplicate = existing.some(
          (a) =>
            a.name.toLowerCase() === input.name.toLowerCase() &&
            a.platform.toLowerCase() === input.platform.toLowerCase(),
        );
        if (duplicate) {
          setDuplicateReviewed(true);
          setError(
            "A mock with this name and platform already exists. Review it, or click Save again to log a repeat attempt.",
          );
          return;
        }
      }
      await api(`/api/mock-attempts${attempt ? `/${attempt.id}` : ""}`, {
        method: attempt ? "PUT" : "POST",
        body: JSON.stringify(input),
      });
      await onSaved();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not save mock";
      setError(message);
      // Surface the failure: the error lives above the form so it can never
      // hide below the fold next to a long subject list.
      requestAnimationFrame(() =>
        errorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    } finally {
      setBusy(false);
    }
  }
  function applyExtracted(draft: {
    values: Partial<AttemptInput>;
    warnings: string[];
    date?: string;
  }) {
    const incoming: Partial<AttemptInput> = { ...draft.values };
    for (const key of Object.keys(incoming) as (keyof AttemptInput)[]) {
      if (incoming[key] === undefined) delete incoming[key];
    }
    const incomingSubjects = incoming.subjects;
    const type = incomingSubjects?.length
      ? (incoming.type ?? values.type)
      : values.type;
    let subjects = values.subjects;
    if (incomingSubjects?.length) {
      const section = sectionForSubjects(incomingSubjects, shape.sections);
      const meritIds = meritSubjectIds(shape);
      const qualifyingIds = shape.subjects
        .filter((s) => s.qualifying)
        .map((s) => s.subjectId);
      const ids: SubjectId[] =
        type === "full"
          ? [
              ...meritIds,
              ...qualifyingIds.filter((id) =>
                incomingSubjects.some((s) => s.subjectId === id),
              ),
            ]
          : type === "sectional"
            ? section
              ? [...section.subjectIds]
              : incomingSubjects.map((s) => s.subjectId)
            : [incomingSubjects[0].subjectId];
      subjects = ids.map((id) => {
        const base =
          values.subjects.find((s) => s.subjectId === id) ??
          blankSubject(id, shape);
        const found = incomingSubjects.find((s) => s.subjectId === id);
        if (!found) return base;
        return {
          ...base,
          ...found,
          subjectId: id,
          qualifying:
            shape.subjects.find((s) => s.subjectId === id)?.qualifying ??
            false,
          questions:
            type === "full"
              ? (shape.subjects.find((s) => s.subjectId === id)?.questions ??
                found.questions)
              : found.questions,
        };
      });
    }
    const platform = incoming.platform;
    let nextPlatform = incoming.platform ?? values.platform;
    let nextChoice = platformChoice;
    if (platform !== undefined) {
      nextChoice = platformSelection(platform);
      nextPlatform = nextChoice === "other" ? platform : nextChoice;
    }
    setValues({
      ...values,
      ...incoming,
      type,
      subjects,
      platform: nextPlatform,
    });
    setPlatformChoice(nextChoice);
    if (draft.date) setDate(draft.date);
    setWarnings(draft.warnings);
    setImportVersion((v) => v + 1);
    setMode("form");
    setDuplicateReviewed(false);
    setError("");
  }
  // Runs once per mount; the deps intentionally mirror the initial state.
  useEffect(() => {
    if (!prefillDraft || prefillAppliedRef.current) return;
    prefillAppliedRef.current = true;
    applyExtracted({
      values: prefillDraft.values,
      warnings: [],
      date: prefillDraft.date,
    });
    onPrefillApplied?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function importPaste() {
    applyExtracted(parseReport(shape, paste));
  }
  async function importWithAi() {
    setAiBusy(true);
    setAiError("");
    setAiDraft(null);
    try {
      const result = await api<ExtractResponse>("/api/ai/extract", {
        method: "POST",
        body: JSON.stringify({
          text: paste,
          examId: shape.examId,
          tierId: shape.tierId,
        }),
      });
      setAiDraft(result.draft);
      setAiReviewing(true);
    } catch (e) {
      setAiError(
        e instanceof Error ? e.message : "Could not arrange this report",
      );
    } finally {
      setAiBusy(false);
    }
  }
  function applyAiDraft() {
    if (!aiDraft) return;
    try {
      const reviewed = extractionToAttempt(shape, aiDraft, values.notes);
      setValues(reviewed.values);
      setDate(reviewed.date);
      setPlatformChoice(platformSelection(reviewed.values.platform));
      setWarnings(reviewed.warnings);
      setImportVersion((version) => version + 1);
      setMode("form");
      setDuplicateReviewed(false);
      setError("");
      setAiDraft(null);
      setAiReviewing(false);
      setAiError("");
    } catch (cause) {
      setAiError(
        cause instanceof Error
          ? cause.message
          : "Resolve the highlighted fields before continuing.",
      );
    }
  }
  return (
    <div className="mx-auto max-w-6xl">
      <Button variant="ghost" size="sm" onClick={onClose} className="mb-4">
        <PlainIcon name="arrowLeft" size={16} /> {backLabel}
      </Button>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {attempt ? "Edit mock" : "Log a mock"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Record the result now; refine the details before saving.
          </p>
        </div>
        <SegmentedControl
          label="Entry method"
          size="sm"
          value={mode}
          onValueChange={(value) => setMode(value as "form" | "paste")}
          options={[
            { value: "form", label: "Manual" },
            {
              value: "paste",
              label: (
                <span className="inline-flex items-center gap-1.5">
                  <PlainIcon name="paste" size={14} /> Paste report
                </span>
              ),
            },
          ]}
        />
      </div>
      {mode === "paste" ? (
        <section className="rounded-2xl bg-card p-4 text-card-foreground shadow-[inset_0_0_0_1px_var(--border)] sm:p-6">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                {aiDraft && aiReviewing ? "Review AI draft" : "Paste a scorecard"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {aiDraft && aiReviewing
                  ? "Check the extracted values before copying them into the form."
                  : "Paste the report text, then choose a standard or AI-assisted import."}
              </p>
            </div>
            <ol
              className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground"
              aria-label="Import progress"
            >
              <li className={!aiReviewing ? "text-foreground" : ""}>1 Paste</li>
              <li aria-hidden="true">/</li>
              <li className={aiReviewing ? "text-foreground" : ""}>2 Review</li>
              <li aria-hidden="true">/</li>
              <li>3 Save</li>
            </ol>
          </div>
          {aiDraft && aiReviewing ? (
            <ExtractionReview
              draft={aiDraft}
              shape={shape}
              onChange={setAiDraft}
              onUse={applyAiDraft}
              onBack={() => setAiReviewing(false)}
              onDiscard={() => {
                setAiDraft(null);
                setAiReviewing(false);
                setAiError("");
              }}
            />
          ) : (
            <>
              <Textarea
                label="Result report"
                minRows={12}
                maxRows={12}
                showCount={false}
                placeholder="Your Score… Sectional Summary…"
                value={paste}
                disabled={aiBusy}
                maxLength={100000}
                onValueChange={(value) => {
                  setPaste(value);
                  setAiDraft(null);
                  setAiReviewing(false);
                  setAiError("");
                }}
              />
              <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
                <span>
                  AI can arrange up to {MAX_EXTRACT_CHARS.toLocaleString("en-IN")} characters. The manual parser accepts longer reports.
                </span>
                <span className={paste.length > MAX_EXTRACT_CHARS ? "text-warning" : ""}>
                  {paste.length.toLocaleString("en-IN")} / {MAX_EXTRACT_CHARS.toLocaleString("en-IN")} for AI
                </span>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button
                  disabled={!paste.trim() || aiBusy}
                  onClick={importPaste}
                  trailingIcon={<PlainIcon name="check" size={15} />}
                >
                  Import with standard parser
                </Button>
                <Button
                  variant="outline"
                  disabled={
                    !paste.trim() ||
                    paste.length > MAX_EXTRACT_CHARS ||
                    aiBusy ||
                    !aiStatus?.enabled
                  }
                  loading={aiBusy}
                  statusLabels={{ pending: "Arranging…" }}
                  icon={<PlainIcon name="sparkles" size={15} />}
                  title={
                    aiStatus && !aiStatus.enabled
                      ? "AI is not configured on this server."
                      : paste.length > MAX_EXTRACT_CHARS
                        ? `AI accepts up to ${MAX_EXTRACT_CHARS.toLocaleString("en-IN")} characters.`
                        : undefined
                  }
                  onClick={() => void importWithAi()}
                >
                  Arrange with AI
                </Button>
                {aiDraft && (
                  <Button variant="outline" onClick={() => setAiReviewing(true)}>
                    Continue AI review
                  </Button>
                )}
              </div>
              {!aiStatusChecked && (
                <p className="mt-3 text-xs text-muted-foreground">Checking AI availability…</p>
              )}
              {aiStatusChecked && !aiStatus && (
                <p className="mt-3 text-xs text-warning">
                  AI status is unavailable. The standard parser still works.
                </p>
              )}
              {aiStatus && !aiStatus.enabled && (
                <p className="mt-3 text-xs text-muted-foreground">
                  {aiStatus.state === "personal-invalid"
                    ? "Your saved AI provider cannot be used. Review it in Settings → AI provider; the standard parser still works."
                    : "AI is not configured. Automatic review and manual entry still work."}
                </p>
              )}
              <p className="mt-3 text-xs text-muted-foreground">
                AI maps the pasted report into an editable draft but never saves. You will review every field before copying it to the form.
              </p>
              {aiError && (
                <Alert tone="warning" title={aiError} className="mt-4" />
              )}
            </>
          )}
        </section>
      ) : (
        <form onSubmit={save} className="space-y-6">
          {warnings.length > 0 && (
            <Alert tone="warning" title="Review your report">
              {warnings.map((w, i) => (
                <p key={i} className="mt-1">
                  {w}
                </p>
              ))}
            </Alert>
          )}
          {error && (
            <div ref={errorRef}>
              <Alert tone="danger" title={error} />
            </div>
          )}
          <section className="rounded-2xl bg-card p-4 text-card-foreground shadow-[inset_0_0_0_1px_var(--border)] sm:p-6">
            <h2 className="mb-1 text-base font-semibold text-foreground">Mock details</h2>
            <p className="mb-5 text-xs text-muted-foreground">
              Fields marked <span aria-hidden="true" className="text-muted-foreground">*</span> are
              required.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Input
                label="Mock name"
                required
                maxLength={150}
                placeholder={`e.g. ${examName} — Mock 12`}
                value={values.name}
                onValueChange={(value) => set("name", value)}
              />
              <Select
                label="Platform"
                placeholder="Select platform"
                value={platformChoice || null}
                options={[
                  ...MOCK_PLATFORMS.map<SelectOption>((p) => ({
                    value: p,
                    label: p,
                  })),
                  { value: "other", label: "Others" },
                ]}
                onValueChange={(value) => {
                  setPlatformChoice(value);
                  set("platform", value === "other" ? "" : value);
                }}
              />
              {platformChoice === "other" && (
                <Input
                  label="Other platform"
                  required
                  maxLength={80}
                  placeholder="Enter the platform name"
                  value={values.platform}
                  onValueChange={(value) => set("platform", value)}
                />
              )}
              <DatePicker
                label={
                  <>
                    Attempt date{" "}
                    <span aria-hidden="true" className="text-muted-foreground">*</span>
                  </>
                }
                value={date}
                onValueChange={(value) => setDate(value ?? "")}
              />
              {!attempt && tierOptions.length > 1 && (
                <Select
                  label="Tier / paper"
                  value={effectiveTierId}
                  options={tierOptions.map((tier) => ({
                    value: tier.id,
                    label: tier.label,
                  }))}
                  onValueChange={chooseTier}
                />
              )}
              <Select
                label="Mock type"
                value={values.type}
                options={[
                  {
                    value: "full",
                    label: `Full mock · ${
                      meritSubjectIds(shape).reduce(
                        (sum, id) =>
                          sum +
                          (shape.subjects.find((s) => s.subjectId === id)
                            ?.questions ?? 0),
                        0,
                      ) * shape.marking.correct
                    } marks`,
                  },
                  { value: "subject", label: "Subject mock" },
                  ...(shape.sections.length > 0
                    ? [{ value: "sectional", label: "Sectional mock" }]
                    : []),
                ]}
                onValueChange={(value) =>
                  chooseType(value as AttemptInput["type"])
                }
              />
              {values.type === "subject" && (
                <Select
                  label="Subject"
                  value={values.subjects[0]?.subjectId ?? null}
                  options={shape.subjects.map((s) => ({
                    value: s.subjectId,
                    label: SUBJECTS[s.subjectId].name,
                  }))}
                  onValueChange={(value) =>
                    set("subjects", [
                      blankSubject(value as SubjectId, shape),
                    ])
                  }
                />
              )}
              {values.type === "sectional" && (
                <Select
                  label="Section"
                  value={
                    sectionForSubjects(values.subjects, shape.sections)?.id ??
                    shape.sections[0]?.id ??
                    null
                  }
                  options={shape.sections.map((section) => ({
                    value: section.id,
                    label: `${section.name} · ${section.description} · ${
                      section.subjectIds.reduce(
                        (sum, id) =>
                          sum +
                          (shape.subjects.find((s) => s.subjectId === id)
                            ?.questions ?? 0),
                        0,
                      ) * shape.marking.correct
                    } marks`,
                  }))}
                  onValueChange={(value) => {
                    const section = shape.sections.find(
                      (s) => s.id === value,
                    );
                    if (!section) return;
                    set(
                      "subjects",
                      section.subjectIds.map((id) =>
                        blankSubject(id, shape),
                      ),
                    );
                  }}
                />
              )}
            </div>
            {values.type === "full" && qualifyingSubject && (
              <div className="mt-5 border-t border-border pt-4">
                <Checkbox
                  checked={includesQualifying}
                  onCheckedChange={(checked) =>
                    set(
                      "subjects",
                      checked
                        ? [
                            ...values.subjects,
                            blankSubject(qualifyingSubject.subjectId, shape),
                          ]
                        : values.subjects.filter(
                            (s) =>
                              s.subjectId !== qualifyingSubject.subjectId,
                          ),
                    )
                  }
                  label={`Include ${SUBJECTS[qualifyingSubject.subjectId].name}`}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  {SUBJECTS[qualifyingSubject.subjectId].short} is scored
                  separately from the main{" "}
                  {formatNumber(
                    meritSubjectIds(shape).reduce(
                      (sum, id) =>
                        sum +
                        (shape.subjects.find((s) => s.subjectId === id)
                          ?.questions ?? 0),
                      0,
                    ) * shape.marking.correct,
                    0,
                  )}{" "}
                  marks. Its time is included in overall time.
                </p>
              </div>
            )}
          </section>
          <section className="rounded-2xl bg-card p-4 text-card-foreground shadow-[inset_0_0_0_1px_var(--border)] sm:p-6">
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-base font-semibold text-foreground">Subject results</h2>
              <p className="text-xs text-muted-foreground">
                +{shape.marking.correct} correct ·{" "}
                {shape.marking.incorrect > 0
                  ? `−${shape.marking.incorrect} incorrect`
                  : "no penalty"}{" "}
                · 0 unattempted
              </p>
            </div>
            <div className="space-y-7">
              {values.subjects.map((s, i) => {
                const sectionHeading =
                  values.type === "full"
                    ? fullMockSectionHeading(s.subjectId, shape)
                    : null;
                return (
                <div key={s.subjectId}>
                  {sectionHeading && (
                    <p className="mb-4 border-b border-border pb-2 text-sm font-medium text-foreground">
                      {sectionHeading}
                    </p>
                  )}
                  <h3 className="mb-3 text-sm font-medium text-foreground">
                    {SUBJECTS[s.subjectId].name}
                  </h3>
                  {/* Three columns until lg: 768-1023 with the sidebar open
                      leaves ~490px, and five ~78px columns wrap the labels
                      and pinch the number fields. */}
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
                    <Labeled label="Questions">
                      <StepperInput
                        label="Questions"
                        variant="field"
                        className="w-full"
                        value={s.questions}
                        min={1}
                        max={500}
                        onValueChange={(value) =>
                          updateSubject(i, { questions: value })
                        }
                        disabled={values.type === "full"}
                      />
                    </Labeled>
                    <Labeled label="Correct">
                      <StepperInput
                        label="Correct"
                        variant="field"
                        className="w-full"
                        value={s.correct}
                        min={0}
                        max={s.questions}
                        onValueChange={(value) =>
                          updateSubject(i, { correct: value })
                        }
                      />
                    </Labeled>
                    <Labeled label="Incorrect">
                      <StepperInput
                        label="Incorrect"
                        variant="field"
                        className="w-full"
                        value={s.incorrect}
                        min={0}
                        max={s.questions}
                        onValueChange={(value) =>
                          updateSubject(i, { incorrect: value })
                        }
                      />
                    </Labeled>
                    <Labeled label="Score">
                      <StepperInput
                        label="Score"
                        variant="field"
                        className="w-full"
                        value={s.correct * 3 - s.incorrect}
                        disabled
                      />
                    </Labeled>
                    <DurationInput
                      key={`${s.subjectId}-${importVersion}`}
                      subjectName={SUBJECTS[s.subjectId].short}
                      value={s.timeSeconds}
                      onChange={(seconds) =>
                        updateSubject(i, { timeSeconds: seconds })
                      }
                    />
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {s.correct + s.incorrect} attempted ·{" "}
                    {s.questions - s.correct - s.incorrect} unattempted ·{" "}
                    {formatNumber(s.correct * 3 - s.incorrect)} calculated marks
                  </p>
                </div>
                );
              })}
            </div>
          </section>
          <section className="rounded-2xl bg-card text-card-foreground shadow-[inset_0_0_0_1px_var(--border)]">
            <div className="px-4 pt-4 sm:px-6">
              <h2 className="text-base font-semibold text-foreground">
                Additional results{" "}
                <span className="text-sm font-normal text-muted-foreground">· optional</span>
              </h2>
            </div>
            <Collapsible
              open={additionalOpen}
              onOpenChange={setAdditionalOpen}
              labels={{ closed: "Expand", open: "Collapse" }}
              placement="top"
              className="px-4 pb-4 sm:px-6 sm:pb-6"
            >
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {(["rank", "participants", "percentile"] as const).map((key) => (
                  <Input
                    key={key}
                    type="number"
                    label={
                      {
                        rank: "Rank",
                        participants: "Participants",
                        percentile: "Percentile (%)",
                      }[key]
                    }
                    step={key === "percentile" ? "0.01" : "1"}
                    value={values[key] ?? ""}
                    onValueChange={(value) =>
                      set(
                        key,
                        value === "" ? null : Number(value),
                      )
                    }
                  />
                ))}
                <Input
                  label="Overall time (hh:mm:ss)"
                  readOnly
                  value={formatTime(computedValues.overallTimeSeconds).padStart(
                    8,
                    "0",
                  )}
                />
              </div>
              <Textarea
                className="mt-5"
                label="Notes"
                minRows={3}
                maxLength={5000}
                placeholder="What went well? What needs another look?"
                value={values.notes}
                onValueChange={(value) => set("notes", value)}
              />
            </Collapsible>
          </section>
          <div className="sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-card p-4 text-card-foreground shadow-[inset_0_0_0_1px_var(--border)] sm:p-5">
            <div className="tabular-nums" aria-live="polite" aria-atomic="true">
              <strong className="text-xl font-semibold text-foreground">
                {formatNumber(stats.score)}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  / {stats.maxScore}
                </span>
              </strong>
              <p className="mt-1 text-xs text-muted-foreground">
                {stats.attempted} attempted · {formatNumber(stats.accuracy, 2)}
                {stats.accuracy == null ? "" : "%"} accuracy · {formatTime(computedValues.overallTimeSeconds)} total
              </p>
              {includesQualifying && qualifyingSubject &&
                (() => {
                  const row = values.subjects.find(
                    (s) => s.subjectId === qualifyingSubject.subjectId,
                  );
                  if (!row) return null;
                  return (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {SUBJECTS[qualifyingSubject.subjectId].short}:{" "}
                      {formatScore(
                        row.scoreOverride ??
                          row.correct * shape.marking.correct -
                            row.incorrect * shape.marking.incorrect,
                      )}{" "}
                      /{" "}
                      {row.questions * shape.marking.correct} · tracked
                      separately
                    </p>
                  );
                })()}
            </div>
            <div className="flex flex-wrap gap-3 sm:w-auto">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                loading={busy}
                statusLabels={{ pending: "Saving…" }}
                icon={
                  <Add01Icon
                    size={16}
                    color="var(--primary-foreground)"
                    animateOnHover
                    animateOnTap
                  />
                }
              >
                {duplicateReviewed
                  ? "Save repeat mock"
                  : attempt
                    ? "Update mock"
                    : "Save mock"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
