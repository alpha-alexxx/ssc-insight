"use client";
import { useEffect, useLayoutEffect, useState } from "react";
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

/**
 * The parsed draft as a roster: one ruled row per subject with its question
 * count and right/wrong split, so the reader verifies the numbers against the
 * scorecard at a glance. Rows that cannot be resolved say so in place; the
 * full field editor stays one tap away behind "Edit details".
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

  const setSubject = (
    index: number,
    patch: Partial<ExtractedSubjectDraft>,
  ) => {
    // Re-run the same validation contract the full editor uses, so fixing a
    // value in the roster clears its blocker instead of leaving stale issues.
    onChange(
      validateExtractionDraft(shape, {
        ...draft,
        subjects: draft.subjects.map((subject, at) =>
          at === index ? { ...subject, ...patch } : subject,
        ),
      }),
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-border px-4 pb-3 pt-4 sm:px-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h3 className="min-w-0 break-words font-serif text-[1.25rem] font-medium leading-tight text-foreground sm:text-[1.375rem]">
            {draft.name?.trim() || "Parsed result"}
          </h3>
          <span
            className={cn(fieldLabel, ready ? "text-success" : "text-warning")}
          >
            {ready
              ? "Ready"
              : `${blockers.length} unresolved`}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {[
            draft.platform?.trim(),
            draft.date,
            draft.type ? mockTypeLabel(draft.type) : null,
          ]
            .filter(Boolean)
            .join(" · ") || "Check the values below against your scorecard."}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-1 sm:px-5">
        <ul className="divide-y divide-border border-b border-border">
          {draft.subjects.map((subject, index) => {
            const incomplete =
              subject.questions == null ||
              subject.correct == null ||
              subject.incorrect == null;
            return (
              <li key={`${subject.subjectId}-${index}`} className="py-2.5">
                <div className="flex items-baseline gap-3">
                  <span className="min-w-0 flex-1 truncate font-serif text-[15px] text-foreground">
                    {SUBJECTS[subject.subjectId].name}
                  </span>
                  {incomplete ? (
                    <span className="shrink-0 text-[11px] font-medium text-warning">
                      Needs a value
                    </span>
                  ) : (
                    <span className="flex shrink-0 items-baseline gap-2.5 text-[11px] tabular-nums text-muted-foreground">
                      <span>{subject.questions}Q</span>
                      <span className="font-medium text-success">
                        {subject.correct} ✓
                      </span>
                      <span className="font-medium text-destructive">
                        {subject.incorrect} ✗
                      </span>
                    </span>
                  )}
                </div>
                {incomplete && (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {(
                      [
                        ["questions", "Questions"],
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

        {warnings.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {warnings.map((issue) => (
              <li
                key={`${issue.code}-${issue.path ?? ""}`}
                className="border-l-2 border-l-warning pl-2.5 text-[11px] leading-relaxed text-muted-foreground"
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
                className="border-l-2 border-l-destructive pl-2.5 text-[11px] leading-relaxed text-destructive"
              >
                {issue.message}
              </li>
            ))}
          </ul>
        )}
        {error && (
          <p role="alert" className="mt-3 text-xs text-destructive">
            {error}
          </p>
        )}
      </div>

      <div className="shrink-0 border-t border-border bg-background px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onBack}>
            Back
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenDetails}
          >
            Edit details
          </Button>
          <Button
            type="button"
            size="sm"
            className="ml-auto"
            onClick={onContinue}
            disabled={!ready}
            trailingIcon={<Icon name="chevronRight" size={13} />}
          >
            Continue to the form
          </Button>
        </div>
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
}: {
  configured: boolean;
  visionEnabled: boolean;
  onAiConfigured?: (credential: AiCredentialSummary | null) => void;
  onLogMock: (draft: LogMockPayload) => void;
  /** "page" renders the roster/details review as a column takeover with a
   * header row (the /ask composer); "compact" is the sheet behavior. */
  variant?: "compact" | "page";
  /** Fires when the takeover state flips (parsed draft opens or closes). */
  onTakeoverChange?: (active: boolean) => void;
  /** Fires after a successful hand-off to the real form. */
  onHandoff?: () => void;
}) {
  const { activeShape } = useExamScope();
  // The tab opens only inside the workspace; the exam scope resolves in the
  // same tick the shell renders. Keep the JSX type-safe while it loads.
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
  /* false = paste step, "roster" = the parsed summary, "details" = the full
     field editor. The roster is the default review surface. */
  const [reviewing, setReviewing] = useState<false | "roster" | "details">(
    false,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [statusChecked, setStatusChecked] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const page = variant === "page";
  const takeover = page && reviewing !== false && draft != null;
  // The host hides the transcript/chips while the roster owns the column.
  useLayoutEffect(() => {
    onTakeoverChange?.(takeover);
  }, [takeover, onTakeoverChange]);

  // Re-check AI availability when the tab opens (cheap status call).
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
      // Hand the deterministic result straight to the real form: /add
      // applies it through applyExtracted exactly like a manual paste import.
      onLogMock({
        values: parsed.values,
        date: "",
      });
      onHandoff?.();
      setPaste("");
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
      if (page) {
        // A fresh parse for the next scorecard; the sheet keeps its state.
        setPaste("");
        setDraft(null);
        setReviewing(false);
      }
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Resolve the highlighted fields before continuing.",
      );
    }
  };

  // The details branch must come first: "roster" is also truthy, so a broad
  // `reviewing &&` branch above it would make "Edit details" unreachable.
  if (reviewing === "details" && draft) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        {page ? (
          <header className="flex shrink-0 items-center gap-2.5 border-b border-border px-4 pb-3 pt-4 sm:px-5">
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
        ) : null}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
        <ExtractionReview
          draft={draft}
          shape={shape}
          onChange={setDraft}
          onUse={useReviewed}
          onBack={() => setReviewing("roster")}
          onDiscard={() => {
            setDraft(null);
            setReviewing(false);
            setError("");
          }}
        />
        </div>
      </div>
    );
  }

  if (reviewing && draft) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        {page ? (
          <header className="flex shrink-0 items-center gap-2.5 border-b border-border px-4 pb-3 pt-4 sm:px-5">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Back to the paste step"
              title="Back to the paste step"
              onClick={() => {
                setReviewing(false);
                setError("");
              }}
            >
              <Icon name="arrowLeft" size={14} />
            </Button>
            <div className="min-w-0">
              <p className="truncate font-serif text-[1.125rem] font-medium leading-tight text-foreground">
                {draft.name?.trim() || "Parsed result"}
              </p>
              <p className={fieldLabel}>Review the parsed subjects</p>
            </div>
          </header>
        ) : null}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
      <h3 className="font-serif text-[1.375rem] font-medium leading-tight text-foreground">
        Log a mock test
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Paste the scorecard. You review the parsed subjects here, then continue
        to the mock form — the only place that saves.
      </p>
      <Textarea
        id="ai-log-mock-paste"
        label="Scorecard text"
        value={paste}
        onValueChange={setPaste}
        maxLength={MAX_EXTRACT_CHARS}
        minRows={10}
        maxRows={16}
        placeholder="Paste the full scorecard section…"
        className="mt-4"
        footer={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setPaste("")}
            disabled={!paste}
          >
            Clear paste
          </Button>
        }
      />

      {visionEnabled && (
        <div className="mt-3">
          <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-primary hover:underline">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              className="sr-only"
              aria-label="Attach scorecard screenshots"
              onChange={(event) => {
                const files = event.target.files;
                if (files?.length) {
                  setPreparingImages(true);
                  void prepareImages(files, images.length)
                    .then((next) => {
                      if (next.length)
                        setImages((current) => [...current, ...next].slice(0, 2));
                    })
                    .finally(() => setPreparingImages(false));
                }
                event.target.value = "";
              }}
            />
            {preparingImages ? "Preparing…" : "Attach scorecard screenshot"}
          </label>
          {images.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {images.map((image, index) => (
                <span key={index} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element -- user-attached data URL, not a remote asset */}
                  <img
                    src={image}
                    alt={`Scorecard screenshot ${index + 1}`}
                    className="h-16 w-16 rounded-lg border border-border object-cover"
                  />
                  <button
                    type="button"
                    aria-label={`Remove screenshot ${index + 1}`}
                    className="flex size-5 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:text-foreground absolute -right-1.5 -top-1.5"
                    onClick={() =>
                      setImages((current) =>
                        current.filter((_, at) => at !== index),
                      )
                    }
                  >
                    <Icon name="close" size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mt-2 rounded-xl border border-warning bg-warning/10 px-3 py-2 text-xs text-warning"
        >
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {aiEnabled ? (
          <Button
            type="button"
            onClick={() => void importWithAi()}
            disabled={!paste.trim() || busy}
            icon={<Icon name="sparkles" size={13} />}
          >
            {busy ? "Reading…" : "Parse with AI"}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={importStandard}
            disabled={!paste.trim()}
            icon={<Icon name="paste" size={13} />}
          >
            Parse report
          </Button>
        )}
      </div>
      <p className="mt-4 flex items-start gap-2 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
        <Icon name="info" size={15} className="mt-0.5 shrink-0" />
        <span>
          {aiEnabled
            ? "AI parsing returns an editable draft with cross-checks; you review every field before continuing."
            : "Standard parsing works without AI. AI-assisted parsing appears once a provider is set up in Settings → AI provider."}
        </span>
      </p>

      {!statusChecked && (
        <p className="mt-3 flex items-center gap-2.5 text-xs text-muted-foreground">
          <Spinner size="xs" label="Checking AI availability…" />
          Checking AI availability…
        </p>
      )}

      {/* Keep provider setup reachable from this tab when AI is off. */}
      {!aiEnabled && !configured && (
        <div className="mt-4 rounded-xl bg-muted p-4 shadow-[inset_0_0_0_1px_var(--border)]">
          <AiSettingsForm
            variant="panel"
            showHeading={false}
            onChanged={onAiConfigured}
          />
        </div>
      )}
    </div>
  );
}
