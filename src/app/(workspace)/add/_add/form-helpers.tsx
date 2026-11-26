"use client";
import {
  SUBJECTS,
  type Attempt,
  type PatternShape,
  type SubjectId,
  type SubjectResult,
} from "@/lib/domain";
import type { ExamDef } from "@/lib/exams";

/** Merit-bearing (non-qualifying) subject ids of a pattern, in order. */
export function meritSubjectIds(shape: PatternShape): SubjectId[] {
  return shape.subjects.filter((s) => !s.qualifying).map((s) => s.subjectId);
}

export function blankSubject(id: SubjectId, shape: PatternShape): SubjectResult {
  return {
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
  };
}

export function fullMockSectionHeading(subjectId: SubjectId, shape: PatternShape) {
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
export function defaultTierId(
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

/** Visible caption column for controls whose own label is aria-only
 * (StepperInput, SegmentedControl); matches the Field label row. */
export function Labeled({
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
