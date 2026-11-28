"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import { Spinner } from "@/components/spinner";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { AiSettingsForm } from "@/components/ai-settings-form";
import { ExtractionReview } from "@/components/shared/add/extraction-review";
import { useExamScope } from "@/components/exam-context";
import { prepareImages } from "@/components/shared/ai/image";
import { parseReport } from "@/lib/report-parser";
import {
  MAX_EXTRACT_CHARS,
  extractionToAttempt,
  validateExtractionDraft,
  type ExtractionDraft,
  type ExtractedSubjectDraft,
} from "@/lib/ai/extraction";
import { SUBJECTS } from "@/lib/domain";
import { mockTypeLabel } from "@/lib/format";
import type { AttemptInput, PatternShape } from "@/lib/domain";
import type { AiCredentialSummary } from "@/lib/ai/client-types";

/** A reviewed mock draft handed to the real form. */
export type LogMockPayload = {
  values: Partial<AttemptInput>;
  date: string;
};

/** The small uppercase field label grammar used across the flow. */
const fieldLabel =
  "text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground";

function isSubjectIncomplete(subject: ExtractedSubjectDraft) {
  return (
    subject.questions == null ||
    subject.correct == null ||
    subject.incorrect == null
  );
}

/**
 * The parsed draft as a roster: one ruled row per subject with its question
 * count and right/wrong split, plus a live aggregate bar so the reader can
 * verify totals against the scorecard at a glance.
 */
function SubjectRoster({
  draft,
  shape,
  onChange,
  onOpenDetails,
  onBack,
  onContinue,
  error,
}: {
  draft: ExtractionDraft;
  shape: PatternShape;
  onChange: (next: ExtractionDraft) => void;
  onOpenDetails: () => void;
  onBack: () => void;
  onContinue: () => void;
  error: string;
}) {
  const blockers = draft.issues.filter((issue) => issue.severity === "blocker");
  const warnings = draft.issues.filter((issue) => issue.severity === "warning");
  const ready = blockers.length === 0 && draft.subjects.length > 0;

  // Keep initially incomplete rows expanded so typing the final digit doesn't
  // unmount the input mid-keystroke; also allow clicking any row to tweak it.
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>(
    () => {
      const initial: Record<number, boolean> = {};
      draft.subjects.forEach((subject, idx) => {
        if (isSubjectIncomplete(subject)) {
          initial[idx] = true;
        }
      });
      return initial;
    },
  );

  const toggleRow = (index: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const setSubject = (index: number, patch: Partial<ExtractedSubjectDraft>) => {
    onChange(
      validateExtractionDraft(shape, {
        ...draft,
        subjects: draft.subjects.map((subject, at) =>
          at === index ? { ...subject, ...patch } : subject,
        ),
      }),
    );
  };

  const totals = useMemo(() => {
    let questions = 0;
    let correct = 0;
    let incorrect = 0;

    for (const s of draft.subjects) {
      questions += s.questions ?? 0;
      correct += s.correct ?? 0;
      incorrect += s.incorrect ?? 0;
    }

    const unattempted = Math.max(0, questions - correct - incorrect);
    const netScore =
      correct * shape.marking.correct - incorrect * shape.marking.incorrect;
    const maxScore = questions * shape.marking.correct;

    return {
      questions,
      correct,
      incorrect,
      unattempted,
      netScore: Number(netScore.toFixed(2)),
      maxScore: Number(maxScore.toFixed(2)),
    };
  }, [draft.subjects, shape.marking]);

  const metaItems = [
    draft.platform?.trim(),
    draft.date,
    draft.type ? mockTypeLabel(draft.type) : null,
  ].filter(Boolean);

  return (
    <div className="flex flex-col">
      {/* ── Roster Header & Metadata ── */}
      <div className="shrink-0 border-b border-border/60 pb-3.5 pt-1">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Back to scorecard input"
              title="Back to scorecard input"
              onClick={onBack}
              className="mt-0.5 shrink-0"
            >
              <Icon name="arrowLeft" size={14} />
            </Button>
            <div className="min-w-0">
              <h3 className="break-words font-serif text-[1.1875rem] font-medium leading-tight text-foreground sm:text-[1.25rem]">
                {draft.name?.trim() || "Parsed scorecard"}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {metaItems.length > 0
                  ? metaItems.join(" · ")
                  : "Verify the parsed subject breakdown before continuing."}
              </p>
            </div>
          </div>

          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-[0.03em]",
              ready
                ? "bg-success/10 text-success"
                : "bg-warning/15 text-warning",
            )}
          >
            {ready ? (
              <>
                <Icon name="check" size={11} tone="success" />
                Ready
              </>
            ) : (
              `${blockers.length} unresolved`
            )}
          </span>
        </div>

        {/* ── Aggregate Verification Bar ── */}
        {draft.subjects.length > 0 && (
          <div className="mt-3 grid grid-cols-4 gap-2 rounded-xl bg-muted/50 px-3 py-2 text-center shadow-[inset_0_0_0_1px_var(--border)] sm:px-4">
            <div>
              <p className={fieldLabel}>Net Score</p>
              <p className="mt-0.5 font-serif text-sm font-medium tabular-nums text-foreground">
                {totals.netScore}
                {totals.maxScore > 0 && (
                  <span className="text-[11px] font-normal text-muted-foreground">
                    /{totals.maxScore}
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className={fieldLabel}>Correct</p>
              <p className="mt-0.5 text-sm font-medium tabular-nums text-success">
                {totals.correct}
              </p>
            </div>
            <div>
              <p className={fieldLabel}>Wrong</p>
              <p className="mt-0.5 text-sm font-medium tabular-nums text-destructive">
                {totals.incorrect}
              </p>
            </div>
            <div>
              <p className={fieldLabel}>Skipped</p>
              <p className="mt-0.5 text-sm font-medium tabular-nums text-muted-foreground">
                {totals.unattempted}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Subject Rows ── */}
      <div className="py-1">
        <ul className="divide-y divide-border/60 border-b border-border/60">
          {draft.subjects.map((subject, index) => {
            const incomplete = isSubjectIncomplete(subject);
            const isEditing = Boolean(expandedRows[index] || incomplete);
            const subjectUnattempted =
              !incomplete &&
              subject.questions != null &&
              subject.correct != null &&
              subject.incorrect != null
                ? Math.max(
                    0,
                    subject.questions - subject.correct - subject.incorrect,
                  )
                : null;

            return (
              <li key={`${subject.subjectId}-${index}`} className="py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => toggleRow(index)}
                    className="group flex min-w-0 flex-1 cursor-pointer items-baseline justify-between gap-3 text-left outline-none focus-visible:underline"
                    title={
                      isEditing ? "Hide inline fields" : "Click to edit numbers"
                    }
                  >
                    <span className="min-w-0 truncate font-serif text-[15px] font-medium text-foreground group-hover:text-primary">
                      {SUBJECTS[subject.subjectId].name}
                    </span>

                    {incomplete ? (
                      <span className="shrink-0 rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-medium text-warning">
                        Needs values
                      </span>
                    ) : (
                      <span className="flex shrink-0 items-baseline gap-2.5 text-xs tabular-nums text-muted-foreground">
                        <span>{subject.questions}Q</span>
                        <span className="font-medium text-success">
                          {subject.correct} ✓
                        </span>
                        <span className="font-medium text-destructive">
                          {subject.incorrect} ✗
                        </span>
                        {subjectUnattempted != null && (
                          <span className="hidden text-[11px] text-muted-foreground/80 sm:inline">
                            ({subjectUnattempted} skip)
                          </span>
                        )}
                      </span>
                    )}
                  </button>
                </div>

                {isEditing && (
                  <div className="mt-2.5 grid grid-cols-3 gap-2.5 rounded-xl bg-muted/30 p-2.5 shadow-[inset_0_0_0_1px_var(--border)]">
                    {(
                      [
                        ["questions", "Total Qs"],
                        ["correct", "Correct"],
                        ["incorrect", "Wrong"],
                      ] as const
                    ).map(([field, label]) => (
                      <Input
                        key={field}
                        type="number"
                        min={0}
                        inputMode="numeric"
                        label={label}
                        size="sm"
                        value={subject[field] ?? ""}
                        onChange={(event) =>
                          setSubject(index, {
                            [field]:
                              event.target.value === ""
                                ? null
                                : Number(event.target.value),
                          })
                        }
                      />
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {/* ── Validation Notices ── */}
        {warnings.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {warnings.map((issue) => (
              <li
                key={`${issue.code}-${issue.path ?? ""}`}
                className="rounded-lg border-l-2 border-l-warning bg-warning/5 py-1.5 pl-3 pr-2.5 text-xs leading-relaxed text-muted-foreground"
              >
                {issue.message}
              </li>
            ))}
          </ul>
        )}

        {blockers.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {blockers.map((issue) => (
              <li
                key={`${issue.code}-${issue.path ?? ""}`}
                role="alert"
                className="rounded-lg border-l-2 border-l-destructive bg-destructive/5 py-1.5 pl-3 pr-2.5 text-xs leading-relaxed text-destructive"
              >
                {issue.message}
              </li>
            ))}
          </ul>
        )}

        {error && (
          <p
            role="alert"
            className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive"
          >
            {error}
          </p>
        )}
      </div>

      {/* ── Roster Footer Actions ── */}
      <div className="mt-3 flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
        <div className="flex items-center gap-1.5">
          <Button type="button" variant="ghost" size="sm" onClick={onBack}>
            Back
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenDetails}
          >
            Edit all details
          </Button>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={onContinue}
          disabled={!ready}
          trailingIcon={<Icon name="chevronRight" size={13} />}
        >
          Continue to form
        </Button>
      </div>
    </div>
  );
}

/** Paste → parse (AI or standard) → review → hand the reviewed draft to the
 * real form. This tab never saves; /add remains the sole save path. */
export function LogMockFlow({
  configured,
  visionEnabled,
  onAiConfigured,
  onLogMock,
  variant = "compact",
  onTakeoverChange,
  onHandoff,
  onDirtyChange,
}: {
  configured: boolean;
  visionEnabled: boolean;
  onAiConfigured?: (credential: AiCredentialSummary | null) => void;
  onLogMock: (draft: LogMockPayload) => void;
  /** "page" renders inside the dialog/page column; "compact" is the sheet behavior. */
  variant?: "compact" | "page";
  /** Fires when the takeover state flips (parsed draft opens or closes). */
  onTakeoverChange?: (active: boolean) => void;
  /** Fires after a successful hand-off to the real form. */
  onHandoff?: () => void;
  /** Reports pasted, attached, or reviewed work that has not been handed off. */
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const { activeShape } = useExamScope();
  const shape = activeShape ?? {
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

  const [paste, setPaste] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [preparingImages, setPreparingImages] = useState(false);
  const [draft, setDraft] = useState<ExtractionDraft | null>(null);
  const [reviewing, setReviewing] = useState<false | "roster" | "details">(
    false,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [statusChecked, setStatusChecked] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(configured);

  const page = variant === "page";
  const takeover = page && reviewing !== false && draft != null;
  const dirty = Boolean(paste || images.length || draft);

  useLayoutEffect(() => {
    onTakeoverChange?.(takeover);
  }, [takeover, onTakeoverChange]);

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  function reset() {
    setPaste("");
    setImages([]);
    setDraft(null);
    setReviewing(false);
    setError("");
  }

  // Verify AI availability on mount
  useEffect(() => {
    let cancelled = false;
    void api<{ enabled: boolean }>("/api/ai/status")
      .then((status) => {
        if (!cancelled) setAiEnabled(Boolean(status.enabled));
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setStatusChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const canParseWithAi =
    (paste.trim().length > 0 || images.length > 0) && !busy && !preparingImages;
  const canParseStandard = paste.trim().length > 0 && !busy;

  const importWithAi = async () => {
    setBusy(true);
    setError("");
    setDraft(null);
    try {
      const result = await api<{ draft?: ExtractionDraft }>("/api/ai/extract", {
        method: "POST",
        body: JSON.stringify({
          text: paste,
          ...(images.length ? { images } : {}),
        }),
      });
      if (!result.draft) throw new Error("Could not arrange this report.");
      setDraft(result.draft);
      setReviewing("roster");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not arrange this report.",
      );
    } finally {
      setBusy(false);
    }
  };

  const importStandard = () => {
    setError("");
    try {
      const parsed = parseReport(shape, paste);
      onLogMock({
        values: parsed.values,
        date: "",
      });
      onHandoff?.();
      reset();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not read this report.",
      );
    }
  };

  const useReviewed = () => {
    if (!draft) return;
    try {
      const reviewed = extractionToAttempt(shape, draft, "");
      onLogMock(reviewed);
      onHandoff?.();
      reset();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Resolve the highlighted fields before continuing.",
      );
    }
  };

  // ── 1. Full Details Editor View ──
  if (reviewing === "details" && draft) {
    return (
      <div className="flex flex-col">
        <header className="mb-3 flex shrink-0 items-center gap-2.5 border-b border-border/60 pb-3 pt-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Back to the roster"
            title="Back to the roster"
            onClick={() => setReviewing("roster")}
          >
            <Icon name="arrowLeft" size={14} />
          </Button>
          <div className="min-w-0">
            <p className="font-serif text-[1.125rem] font-medium leading-tight text-foreground">
              Edit details
            </p>
            <p className={fieldLabel}>Every field of the parsed draft</p>
          </div>
        </header>

        <div>
          <ExtractionReview
            draft={draft}
            shape={shape}
            onChange={setDraft}
            onUse={useReviewed}
            onBack={() => setReviewing("roster")}
            onDiscard={reset}
          />
        </div>
      </div>
    );
  }

  // ── 2. Subject Roster Review View ──
  if (reviewing && draft) {
    return (
      <SubjectRoster
        draft={draft}
        shape={shape}
        onChange={setDraft}
        onOpenDetails={() => setReviewing("details")}
        onBack={() => {
          setReviewing(false);
          setError("");
        }}
        onContinue={useReviewed}
        error={error}
      />
    );
  }

  // ── 3. Initial Scorecard Paste / Screenshot View ──
  return (
    <div className="flex flex-col py-1">
      {!page && (
        <h3 className="mb-1.5 font-serif text-[1.25rem] font-medium leading-tight text-foreground">
          Log a mock test
        </h3>
      )}
      <p className="text-[13px] leading-relaxed text-muted-foreground">
        Paste your raw scorecard text
        {visionEnabled ? " or attach a screenshot" : ""}. You can verify and
        edit every subject’s numbers before sending them to the mock form.
      </p>

      <Textarea
        id="ai-log-mock-paste"
        label="Scorecard text"
        value={paste}
        onValueChange={setPaste}
        maxLength={MAX_EXTRACT_CHARS}
        minRows={8}
        maxRows={14}
        placeholder="Paste the copied scorecard text here (platform, subject scores, correct/wrong counts)…"
        className="mt-3.5"
        footer={
          <div className="flex w-full items-center justify-between gap-2">
            {visionEnabled ? (
              <label
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10",
                  (images.length >= 2 || preparingImages) &&
                    "pointer-events-none opacity-50",
                )}
              >
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  disabled={images.length >= 2 || preparingImages}
                  className="sr-only"
                  aria-label="Attach scorecard screenshots"
                  onChange={(event) => {
                    const files = event.target.files;
                    if (files?.length) {
                      setPreparingImages(true);
                      void prepareImages(files, images.length)
                        .then((next) => {
                          if (next.length)
                            setImages((current) =>
                              [...current, ...next].slice(0, 2),
                            );
                        })
                        .finally(() => setPreparingImages(false));
                    }
                    event.target.value = "";
                  }}
                />
                <Icon name="sparkles" size={12} />
                <span>
                  {preparingImages
                    ? "Preparing image…"
                    : images.length > 0
                      ? `Screenshots (${images.length}/2)`
                      : "Attach screenshot"}
                </span>
              </label>
            ) : (
              <span />
            )}

            {paste.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPaste("")}
              >
                Clear text
              </Button>
            )}
          </div>
        }
      />

      {/* ── Attached Image Thumbnails ── */}
      {visionEnabled && images.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          {images.map((image, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-xl border border-border bg-muted/40"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- user-attached data URL, not a remote asset */}
              <img
                src={image}
                alt={`Scorecard screenshot ${index + 1}`}
                className="h-16 w-20 object-cover"
              />
              <button
                type="button"
                aria-label={`Remove screenshot ${index + 1}`}
                className="absolute right-1 top-1 flex size-5 cursor-pointer items-center justify-center rounded-full bg-background/90 text-muted-foreground shadow-sm backdrop-blur-xs transition-colors hover:bg-destructive hover:text-destructive-foreground"
                onClick={() =>
                  setImages((current) =>
                    current.filter((_, at) => at !== index),
                  )
                }
              >
                <Icon name="close" size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Error Banner ── */}
      {error && (
        <p
          role="alert"
          className="mt-3 rounded-xl border border-warning/40 bg-warning/10 px-3.5 py-2.5 text-xs leading-relaxed text-warning"
        >
          {error}
        </p>
      )}

      {/* ── Primary Actions Bar ── */}
      <div className="mt-4 flex flex-col gap-2.5 border-t border-border/60 pt-3.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-2">
        <p className="flex min-w-0 items-center gap-1.5 text-[11.5px] text-muted-foreground">
          {!statusChecked ? (
            <>
              <Spinner size="xs" label="Checking AI availability…" />
              <span>Checking AI status…</span>
            </>
          ) : (
            <>
              <Icon name="info" size={13} className="shrink-0" />
              <span>
                {aiEnabled
                  ? "Cross-checked against your exam pattern."
                  : "Standard rule-based parser active."}
              </span>
            </>
          )}
        </p>

        <div className="flex shrink-0 items-center gap-2">
          {aiEnabled && paste.trim().length > 0 && images.length === 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={importStandard}
              disabled={!canParseStandard}
              title="Instant rule-based parse without AI"
            >
              Quick parse
            </Button>
          )}

          {aiEnabled ? (
            <Button
              type="button"
              size="sm"
              onClick={() => void importWithAi()}
              disabled={!canParseWithAi}
              icon={
                busy ? (
                  <Spinner size="xs" label="Reading scorecard…" />
                ) : (
                  <Icon name="sparkles" size={13} />
                )
              }
            >
              {busy ? "Reading scorecard…" : "Parse with AI"}
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={importStandard}
              disabled={!canParseStandard}
              icon={<Icon name="paste" size={13} />}
            >
              Parse report
            </Button>
          )}
        </div>
      </div>

      {/* ── Inline Provider Setup when AI is unconfigured ── */}
      {statusChecked && !aiEnabled && !configured && (
        <div className="mt-4 rounded-xl bg-muted/50 p-4 shadow-[inset_0_0_0_1px_var(--border)]">
          <p className="mb-2.5 text-xs font-medium text-foreground">
            Want AI-assisted extraction for messy scorecards or screenshots?
          </p>
          <AiSettingsForm
            variant="panel"
            showHeading={false}
            onChanged={(cred) => {
              setAiEnabled(Boolean(cred));
              onAiConfigured?.(cred);
            }}
          />
        </div>
      )}
    </div>
  );
}
