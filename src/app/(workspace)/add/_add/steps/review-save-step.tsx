"use client";

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

function ScoreRing({
  score,
  maxScore,
  size = 40,
  strokeWidth = 3,
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
        className="transition-[stroke-dashoffset] duration-500"
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size * 0.24}
        fontWeight={600}
        fill="currentColor"
        className="tabular-nums"
        transform={`rotate(90 ${size / 2} ${size / 2})`}
      >
        {Math.round(percentage * 100)}%
      </text>
    </svg>
  );
}

function SubjectRow({
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
    <div className="flex items-center gap-3 border border-border bg-background px-3 py-2.5">
      <span className="w-16 shrink-0 text-sm font-medium text-foreground">
        {SUBJECTS[subject.subjectId].name}
      </span>
      <ScoreRing score={score} maxScore={maxScore} size={36} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium tabular-nums text-foreground">
          {formatScore(score)} <span className="font-normal text-muted-foreground">/ {maxScore}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          {subject.correct} correct · {subject.incorrect} incorrect ·{" "}
          {subject.questions - subject.correct - subject.incorrect} unattempted
        </p>
      </div>
      {subject.timeSeconds != null && subject.timeSeconds > 0 && (
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {formatTime(subject.timeSeconds)}
        </span>
      )}
      {qualifying && (
        <span className="shrink-0 text-[11px] text-muted-foreground">qualifying</span>
      )}
    </div>
  );
}

function ReviewBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-border bg-muted/40 p-4">
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function ReviewSaveStep({
  values,
  shape,
  stats,
  overallTimeSeconds,
  examName,
  tierLabel,
  date,
}: {
  values: AttemptInput;
  shape: PatternShape;
  stats: { score: number; maxScore: number; accuracy: number | null; attempted: number; unattempted: number };
  overallTimeSeconds: number;
  examName: string;
  tierLabel: string;
  date: string;
}) {
  const qualifyingSubject = shape.subjects.find((s) => s.qualifying);
  const meritRows = values.subjects.filter(
    (s) => !qualifyingSubject || s.subjectId !== qualifyingSubject.subjectId,
  );
  const qualifyingRows = qualifyingSubject
    ? values.subjects.filter((s) => s.subjectId === qualifyingSubject.subjectId)
    : [];

  const hasAdditional =
    values.rank != null ||
    values.participants != null ||
    values.percentile != null ||
    (values.notes ?? "").length > 0;

  return (
    <section className="space-y-4" aria-label="Review and save">
      <ReviewBlock title="Mock details">
        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">Mock name</dt>
            <dd className="mt-0.5 font-medium text-foreground">{values.name || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Platform</dt>
            <dd className="mt-0.5 font-medium text-foreground">{values.platform || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Exam · tier</dt>
            <dd className="mt-0.5 font-medium text-foreground">
              {examName} · {tierLabel}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Attempt date</dt>
            <dd className="mt-0.5 font-medium tabular-nums text-foreground">{date || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Marking</dt>
            <dd className="mt-0.5 font-medium text-foreground">
              +{shape.marking.correct} correct ·{" "}
              {shape.marking.incorrect > 0 ? `−${shape.marking.incorrect} incorrect` : "no penalty"}
            </dd>
          </div>
          {values.type !== "full" && (
            <div>
              <dt className="text-xs text-muted-foreground">Mock type</dt>
              <dd className="mt-0.5 font-medium capitalize text-foreground">{values.type} mock</dd>
            </div>
          )}
        </dl>
      </ReviewBlock>

      <ReviewBlock title="Subject results">
        <div className="space-y-2">
          {meritRows.map((s) => (
            <SubjectRow key={s.subjectId} subject={s} marking={shape.marking} />
          ))}
        </div>
      </ReviewBlock>

      {qualifyingRows.length > 0 && qualifyingSubject && (
        <ReviewBlock title={`${SUBJECTS[qualifyingSubject.subjectId].name} · qualifying`}>
          <div className="space-y-2">
            {qualifyingRows.map((s) => (
              <SubjectRow key={s.subjectId} subject={s} marking={shape.marking} qualifying />
            ))}
          </div>
        </ReviewBlock>
      )}

      {hasAdditional && (
        <ReviewBlock title="Additional results">
          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
            {values.rank != null && (
              <div>
                <dt className="text-xs text-muted-foreground">Rank</dt>
                <dd className="mt-0.5 font-medium tabular-nums text-foreground">
                  {formatNumber(values.rank, 0)}
                </dd>
              </div>
            )}
            {values.participants != null && (
              <div>
                <dt className="text-xs text-muted-foreground">Participants</dt>
                <dd className="mt-0.5 font-medium tabular-nums text-foreground">
                  {formatNumber(values.participants, 0)}
                </dd>
              </div>
            )}
            {values.percentile != null && (
              <div>
                <dt className="text-xs text-muted-foreground">Percentile</dt>
                <dd className="mt-0.5 font-medium tabular-nums text-foreground">
                  {formatNumber(values.percentile, 2)}
                </dd>
              </div>
            )}
            {(values.notes ?? "").length > 0 && (
              <div className="sm:col-span-3">
                <dt className="text-xs text-muted-foreground">Notes</dt>
                <dd className="mt-0.5 whitespace-pre-wrap text-foreground">{values.notes}</dd>
              </div>
            )}
          </dl>
        </ReviewBlock>
      )}

      <ReviewBlock title="Overall">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs text-muted-foreground">Score</dt>
            <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
              {formatNumber(stats.score)}{" "}
              <span className="text-sm font-normal text-muted-foreground">/ {stats.maxScore}</span>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Accuracy</dt>
            <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
              {stats.accuracy == null ? "—" : `${formatNumber(stats.accuracy, 2)}%`}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Attempted</dt>
            <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
              {stats.attempted}
              {stats.unattempted > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  · {stats.unattempted} left
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Total time</dt>
            <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
              {formatTime(overallTimeSeconds)}
            </dd>
          </div>
        </dl>
      </ReviewBlock>
    </section>
  );
}
