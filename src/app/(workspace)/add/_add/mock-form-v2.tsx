"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/button";
import { PlainIcon } from "@/components/icon";
import { Textarea } from "@/components/textarea";
import { SegmentedControl } from "@/components/segmented-control";
import { Alert } from "@/components/alert";
import { StepsForm, type Step } from "@/components/steps-form";
import {
  attemptSchemaFor,
  sectionForSubjects,
  SUBJECTS,
  totals,
  type Attempt,
  type AttemptInput,
  type PatternShape,
  type SubjectId,
  type SubjectResult,
  formatTime,
} from "@/lib/domain";
import { useExamScope } from "@/components/exam-context";
import {
  calculatedEntry,
  completionDate,
  completionTimestamp,
  platformSelection,
} from "@/lib/mock-entry";
import { istTodayIso } from "@/lib/plan/view-model";
import { isIsoDate } from "@/lib/format";
import { api } from "@/lib/api-client";
import { parseReport } from "@/lib/report-parser";
import type { AiStatus, ExtractResponse } from "@/lib/ai/client-types";
import {
  extractionToAttempt,
  MAX_EXTRACT_CHARS,
  type ExtractionDraft,
} from "@/lib/ai/extraction";
import { ExtractionReview } from "@/components/shared/add/extraction-review";
import { SideSummaryPanel } from "./side-summary-panel";
import { MockDetailsStep } from "./steps/mock-details-step";
import { SubjectResultsStep } from "./steps/subject-results-step";
import { AdditionalResultsStep } from "./steps/additional-results-step";
import { ReviewSaveStep } from "./steps/review-save-step";
import {
  blankSubject,
  defaultTierId,
  meritSubjectIds,
} from "./form-helpers";

/* ── Draft persistence ──────────────────────────────────────────────── */
const DRAFT_KEY = "ssc.add.draft.v2";
const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // a week

type StoredDraft = {
  version: 2;
  savedAt: number;
  values: AttemptInput;
  date: string;
  platformChoice: string;
};

function loadDraft(): StoredDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredDraft;
    if (
      parsed?.version !== 2 ||
      typeof parsed.savedAt !== "number" ||
      Date.now() - parsed.savedAt > DRAFT_TTL_MS
    ) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveDraft(draft: StoredDraft | null) {
  try {
    if (draft) localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    else localStorage.removeItem(DRAFT_KEY);
  } catch {
    // Storage full or unavailable: the form keeps working without persistence.
  }
}

const FIELDS_BACKED = new Set<string>([
  "name",
  "platform",
  "rank",
  "participants",
  "percentile",
  "notes",
]);
void FIELDS_BACKED;

export function MockFormV2({
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
  knownAttempts?: Attempt[];
  initialDate?: string;
  initialName?: string;
  initialDraft?: { values: Partial<AttemptInput>; date?: string };
  onPrefillApplied?: () => void;
  backLabel?: string;
  onClose: () => void;
  onSaved: (returnTo?: string | null) => void | Promise<void>;
}) {
  const scope = useExamScope();
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
  const tierLabel =
    (scope.exams
      ? (scope.exams.builtIn
          .find((exam) => exam.id === shape.examId)
          ?.tiers.find((t) => t.id === shape.tierId)?.label ??
        scope.exams.customExams
          .find((exam) => exam.id === shape.examId)
          ?.tiers.find((t) => t.id === shape.tierId)?.label)
      : null) ?? shape.tierId;

  /* ── Draft restore (new attempts only; edits keep their saved values) ──
   * useState lazy initializers run exactly once, so localStorage is read once
   * here; no refs are touched during render. */
  const [mountDraft] = useState<StoredDraft | null>(() => (attempt ? null : loadDraft()));
  const mountValid = Boolean(
    mountDraft &&
      mountDraft.values.examId === shape.examId &&
      mountDraft.values.tierId === shape.tierId,
  );
  const [values, setValues] = useState<AttemptInput>(
    attempt ??
      (mountValid
        ? mountDraft!.values
        : {
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
          }),
  );
  const [date, setDate] = useState(
    attempt
      ? completionDate(attempt.completedAt)
      : (mountValid && isIsoDate(mountDraft!.date)
          ? mountDraft!.date
          : (initialDate && isIsoDate(initialDate)
              ? initialDate
              : istTodayIso())),
  );
  const [platformChoice, setPlatformChoice] = useState(
    mountValid
      ? mountDraft!.platformChoice
      : platformSelection(attempt?.platform ?? ""),
  );
  const draftDirty = useRef(false);
  const markDirty = useCallback(() => {
    draftDirty.current = true;
  }, []);
  // Debounced persistence of the in-progress draft (new attempts only).
  useEffect(() => {
    if (attempt) return;
    if (!draftDirty.current) return;
    const timer = window.setTimeout(() => {
      saveDraft({
        version: 2,
        savedAt: Date.now(),
        values,
        date,
        platformChoice,
      });
    }, 600);
    return () => window.clearTimeout(timer);
  }, [values, date, platformChoice, attempt]);

  const [mode, setMode] = useState<"form" | "paste">("form");
  const [paste, setPaste] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [importVersion, setImportVersion] = useState(0);
  const [error, setError] = useState("");
  const [duplicateReviewed, setDuplicateReviewed] = useState(false);
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
  const prefillAppliedRef = useRef(false);

  // Plain functions (not useCallback): the React compiler memoizes them from
  // their real dependencies, and a generic useCallback broke its inference.
  const setField = <K extends keyof AttemptInput>(key: K, value: AttemptInput[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setDuplicateReviewed(false);
    markDirty();
  };
  const updateSubject = (index: number, changes: Partial<SubjectResult>) => {
    setValues((v) => ({
      ...v,
      subjects: v.subjects.map((s, i) => (i === index ? { ...s, ...changes } : s)),
    }));
    setDuplicateReviewed(false);
    markDirty();
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
    markDirty();
  };

  const computedValues = useMemo(
    () => calculatedEntry(values),
    [values],
  );
  const stats = totals(computedValues);
  const qualifyingSubject = shape.subjects.find((s) => s.qualifying);
  const includesQualifying =
    values.type === "full" &&
    qualifyingSubject != null &&
    values.subjects.some((s) => s.subjectId === qualifyingSubject.subjectId);

  async function save() {
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
          // Throw (not return): StepsForm only stays on the review step when
          // onSubmit throws. The next press saves the repeat attempt.
          throw new Error(
            "A mock with this name and platform already exists. Review it above, or press Try again to log a repeat attempt.",
          );
        }
      }
      await api(`/api/mock-attempts${attempt ? `/${attempt.id}` : ""}`, {
        method: attempt ? "PUT" : "POST",
        body: JSON.stringify(input),
      });
      saveDraft(null); // the draft is now a saved record
      await onSaved();
    } catch (e) {
      if (e instanceof Error && e.message.includes("already exists")) throw e;
      const message = e instanceof Error ? e.message : "Could not save mock";
      throw new Error(message);
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
    markDirty();
  }
  // Runs once per mount; the deps intentionally mirror the initial state.
  useEffect(() => {
    if (!initialDraft || prefillAppliedRef.current) return;
    prefillAppliedRef.current = true;
    applyExtracted({
      values: initialDraft.values,
      warnings: [],
      date: initialDraft.date,
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
      markDirty();
    } catch (cause) {
      setAiError(
        cause instanceof Error
          ? cause.message
          : "Resolve the highlighted fields before continuing.",
      );
    }
  }

  /* ── Steps ──────────────────────────────────────────────────────────── */

  const detailsStep: Step = {
      id: "details",
      label: "Details",
      title: "Mock details",
      description: "Name, platform, date, and the paper you sat.",
      content: (
        <MockDetailsStep
          values={values}
          setValues={setValues}
          attempt={attempt}
          shape={shape}
          examName={examName}
          tierOptions={tierOptions}
          effectiveTierId={effectiveTierId}
          chooseTier={chooseTier}
          platformChoice={platformChoice}
          setPlatformChoice={(value) => {
            setPlatformChoice(value);
            markDirty();
          }}
          date={date}
          setDate={(value) => {
            setDate(value);
            markDirty();
          }}
          onDuplicateReviewed={markDirty}
        />
      ),
      validate: () => {
        if (!values.name.trim())
          return "Give the mock a name so you can find it later.";
        if (platformChoice === "other" && !values.platform.trim())
          return "Name the platform, or pick one of the listed ones.";
        if (!isIsoDate(date))
          return "Choose the date you attempted this mock.";
        return null;
      },
  };

  const subjectsStep: Step = {
      id: "subjects",
      label: "Subjects",
      title: "Subject results",
      description: "Questions, correct, incorrect, and time per subject.",
      content: (
        <SubjectResultsStep
          values={values}
          shape={shape}
          updateSubject={updateSubject}
          importVersion={importVersion}
        />
      ),
      validate: () => {
        const over = values.subjects.find(
          (s) => s.correct + s.incorrect > s.questions,
        );
        if (over)
          return `${SUBJECTS[over.subjectId].name}: correct + incorrect cannot exceed the questions attempted.`;
        return null;
      },
    };

  const additionalStep: Step = {
      id: "additional",
      label: "Optional",
      title: "Additional results",
      description: "Rank, percentile, and notes — all of it optional.",
      content: (
        <AdditionalResultsStep
          values={values}
          set={setField}
          computedValues={computedValues}
        />
      ),
    };

  const reviewStep: Step = {
      id: "review",
      label: "Review",
      title: "Review & save",
      description: "Read it back once, then save the mock.",
      content: (
        <ReviewSaveStep
          values={values}
          shape={shape}
          stats={stats}
          overallTimeSeconds={computedValues.overallTimeSeconds ?? 0}
          examName={examName}
          tierLabel={tierLabel}
          date={date}
        />
      ),
    };

  const steps: Step[] = [detailsStep, subjectsStep, additionalStep, reviewStep];

  if (mode === "paste") {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
          <div>
            <h1 className="font-serif text-xl tracking-tight text-foreground">
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
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="font-serif text-xl tracking-tight text-foreground">
            {attempt ? "Edit mock" : "Log a mock"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Record the result now; refine the details before saving.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {!attempt && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                saveDraft(null);
                setValues({
                  name: "",
                  platform: "",
                  completedAt: "",
                  type: "full",
                  examId: shape.examId,
                  tierId: shape.tierId,
                  marking: shape.marking,
                  subjects: meritSubjectIds(shape).map((id) => blankSubject(id, shape)),
                  notes: "",
                  source: "manual",
                });
                setDate(istTodayIso());
                setPlatformChoice(platformSelection(""));
                setWarnings([]);
                setDuplicateReviewed(false);
                setError("");
                draftDirty.current = false;
              }}
            >
              Reset form
            </Button>
          )}
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
      </div>

      {warnings.length > 0 && (
        <Alert tone="warning" title="Review your report" className="mb-4">
          {warnings.map((w, i) => (
            <p key={i} className="mt-1">
              {w}
            </p>
          ))}
        </Alert>
      )}
      {error && (
        <div ref={errorRef} className="mb-4">
          <Alert tone="danger" title={error} />
        </div>
      )}

      <div className="flex items-start gap-8">
        <div className="min-w-0 flex-1">
          <StepsForm
            steps={steps}
            onSubmit={save}
            submitLabels={{
              idle: duplicateReviewed
                ? "Save repeat mock"
                : attempt
                  ? "Update mock"
                  : "Save mock",
              pending: "Saving…",
              success: "Saved",
            }}
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <PlainIcon name="arrowLeft" size={16} /> {backLabel}
            </Button>
            <p className="text-xs text-muted-foreground" aria-live="polite">
              {formatTime(computedValues.overallTimeSeconds)} total ·{" "}
              {stats.attempted} attempted
            </p>
          </div>
        </div>
        <SideSummaryPanel
          values={values}
          shape={shape}
          stats={stats}
          overallTimeSeconds={computedValues.overallTimeSeconds ?? 0}
          includesQualifying={includesQualifying}
          qualifyingSubject={qualifyingSubject}
        />
      </div>
    </div>
  );
}
