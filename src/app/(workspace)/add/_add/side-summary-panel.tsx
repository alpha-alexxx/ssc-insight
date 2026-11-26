"use client";

import { useState } from "react";
import { Sheet } from "@/components/sheet";
import { PlainIcon } from "@/components/icon";
import {
  SUBJECTS,
  formatNumber,
  formatScore,
  formatTime,
  type AttemptInput,
  type PatternShape,
  type SubjectResult,
} from "@/lib/domain";

function scoreColor(percentage: number) {
  return percentage >= 0.7
    ? "var(--success)"
    : percentage >= 0.4
      ? "var(--warning)"
      : "var(--destructive)";
}

/** Small score ring: score percentage with a hue that tracks the band. */
function ScoreRing({
  score,
  maxScore,
  size = 32,
  strokeWidth = 2.5,
}: {
  score: number;
  maxScore: number;
  size?: number;
  strokeWidth?: number;
}) {
  const percentage = maxScore > 0 ? Math.min(Math.max(score / maxScore, 0), 1) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentage);
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
      aria-hidden="true"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--border)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={scoreColor(percentage)}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-[stroke-dashoffset] duration-300"
      />
    </svg>
  );
}

function MiniStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-lg font-semibold tabular-nums leading-tight text-foreground">
        {value}
      </dd>
      {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

function SubjectMini({
  subject,
  marking,
  qualifying = false,
}: {
  subject: SubjectResult;
  marking: { correct: number; incorrect: number };
  qualifying?: boolean;
}) {
  const score =
    subject.scoreOverride ??
    subject.correct * marking.correct - subject.incorrect * marking.incorrect;
  const maxScore = subject.questions * marking.correct;
  return (
    <div className="flex items-center gap-2.5 border border-border bg-muted/40 px-2.5 py-2">
      <span
        className="w-16 shrink-0 truncate text-xs font-medium text-foreground"
        title={SUBJECTS[subject.subjectId].name}
      >
        {SUBJECTS[subject.subjectId].short}
      </span>
      <ScoreRing score={score} maxScore={maxScore} size={28} />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium tabular-nums text-foreground">
          {formatScore(score)}{" "}
          <span className="font-normal text-muted-foreground">/ {maxScore}</span>
        </p>
        <p className="text-[10px] text-muted-foreground">
          {subject.correct}c · {subject.incorrect}i ·{" "}
          {subject.questions - subject.correct - subject.incorrect}u
        </p>
      </div>
      {qualifying && (
        <span className="shrink-0 text-[10px] text-muted-foreground">sep.</span>
      )}
    </div>
  );
}

function SummaryBody({
  values,
  shape,
  stats,
  overallTimeSeconds,
  includesQualifying,
  qualifyingSubject,
}: {
  values: AttemptInput;
  shape: PatternShape;
  stats: { score: number; maxScore: number; accuracy: number | null; attempted: number; unattempted: number };
  overallTimeSeconds: number;
  includesQualifying: boolean;
  qualifyingSubject: (typeof shape.subjects)[number] | undefined;
}) {
  const meritRows = values.subjects.filter(
    (s) => !qualifyingSubject || s.subjectId !== qualifyingSubject.subjectId,
  );
  const qualifyingRows = qualifyingSubject
    ? values.subjects.filter((s) => s.subjectId === qualifyingSubject.subjectId)
    : [];

  return (
    <div className="space-y-4">
      {/* Core metrics */}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-b border-border pb-4">
        <MiniStat
          label="Score"
          value={`${formatNumber(stats.score)} / ${stats.maxScore}`}
        />
        <MiniStat
          label="Accuracy"
          value={stats.accuracy == null ? "—" : `${formatNumber(stats.accuracy, 2)}%`}
        />
        <MiniStat label="Total time" value={formatTime(overallTimeSeconds)} />
        <MiniStat
          label="Attempted"
          value={`${stats.attempted}`}
          sub={stats.unattempted > 0 ? `${stats.unattempted} unattempted` : undefined}
        />
      </dl>

      {/* Subject mini-cards */}
      {meritRows.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-medium text-muted-foreground">Subjects</h4>
          <div className="space-y-2">
            {meritRows.map((s) => (
              <SubjectMini key={s.subjectId} subject={s} marking={shape.marking} />
            ))}
          </div>
        </div>
      )}

      {includesQualifying && qualifyingRows.length > 0 && qualifyingSubject && (
        <div className="border-t border-border pt-3">
          <h4 className="mb-2 text-xs font-medium text-muted-foreground">
            {SUBJECTS[qualifyingSubject.subjectId].short} · qualifying
          </h4>
          <div className="space-y-2">
            {qualifyingRows.map((s) => (
              <SubjectMini key={s.subjectId} subject={s} marking={shape.marking} qualifying />
            ))}
          </div>
        </div>
      )}

      {/* Breakdown */}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border pt-3 text-xs">
        <div>
          <dt className="text-muted-foreground">Correct</dt>
          <dd className="mt-0.5 text-sm font-medium tabular-nums text-success">
            {values.subjects.reduce((sum, s) => sum + s.correct, 0)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Incorrect</dt>
          <dd className="mt-0.5 text-sm font-medium tabular-nums text-destructive">
            {values.subjects.reduce((sum, s) => sum + s.incorrect, 0)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Unattempted</dt>
          <dd className="mt-0.5 text-sm font-medium tabular-nums text-muted-foreground">
            {values.subjects.reduce(
              (sum, s) => sum + s.questions - s.correct - s.incorrect,
              0,
            )}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Total questions</dt>
          <dd className="mt-0.5 text-sm font-medium tabular-nums text-foreground">
            {values.subjects.reduce((sum, s) => sum + s.questions, 0)}
          </dd>
        </div>
      </dl>
    </div>
  );
}

/**
 * The live summary beside the steps form.
 * Desktop (lg+): a sticky right rail with the requested accent hairline on its
 * inner edge. Mobile: a floating pill opens the same body in a bottom sheet.
 */
export function SideSummaryPanel({
  values,
  shape,
  stats,
  overallTimeSeconds,
  includesQualifying,
  qualifyingSubject,
}: {
  values: AttemptInput;
  shape: PatternShape;
  stats: { score: number; maxScore: number; accuracy: number | null; attempted: number; unattempted: number };
  overallTimeSeconds: number;
  includesQualifying: boolean;
  qualifyingSubject: (typeof shape.subjects)[number] | undefined;
}) {
  const [open, setOpen] = useState(false);
  const body = (
    <SummaryBody
      values={values}
      shape={shape}
      stats={stats}
      overallTimeSeconds={overallTimeSeconds}
      includesQualifying={includesQualifying}
      qualifyingSubject={qualifyingSubject}
    />
  );

  return (
    <>
      {/* Desktop rail: 2px accent hairline on the inner (left) edge */}
      <aside
        className="sticky top-24 hidden w-80 shrink-0 self-start lg:block"
        aria-label="Live summary"
      >
        <div className="border-l-2 border-l-[var(--accent)] py-1 pl-5">
          <h3 className="font-serif text-lg text-foreground">Live summary</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Updates as you type
          </p>
          <div className="mt-4">{body}</div>
        </div>
      </aside>

      {/* Mobile: floating pill + bottom sheet */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          className="fixed bottom-5 right-5 z-30 flex h-11 items-center gap-2 rounded-full bg-primary px-4 text-[13px] font-medium text-primary-foreground shadow-[0_0_0_1px_var(--border),0_4px_16px_-4px_rgba(0,0,0,0.25)] transition-transform active:scale-[0.97]"
        >
          <PlainIcon name="list" size={16} />
          Summary
          <span className="tabular-nums">
            {formatNumber(stats.score)}
          </span>
        </button>
        <Sheet
          open={open}
          onOpenChange={setOpen}
          side="bottom"
          title="Live summary"
          description="Updates as you type"
        >
          <div className="pb-6">{body}</div>
        </Sheet>
      </div>
    </>
  );
}
