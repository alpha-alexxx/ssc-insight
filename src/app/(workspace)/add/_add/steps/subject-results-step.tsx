"use client";

import { StepperInput } from "@/components/stepper-input";
import { DurationInput } from "../duration-input";
import { SUBJECTS, formatNumber, type AttemptInput, type PatternShape, type SubjectResult } from "@/lib/domain";
import { Labeled, fullMockSectionHeading } from "../form-helpers";

export function SubjectResultsStep({
  values,
  shape,
  updateSubject,
  importVersion,
}: {
  values: AttemptInput;
  shape: PatternShape;
  updateSubject: (index: number, changes: Partial<SubjectResult>) => void;
  importVersion: number;
}) {
  return (
    <section className="space-y-7" aria-label="Subject results">
      <p className="text-xs text-muted-foreground">
        +{shape.marking.correct} correct ·{" "}
        {shape.marking.incorrect > 0
          ? `−${shape.marking.incorrect} incorrect`
          : "no penalty"}{" "}
        · 0 unattempted
      </p>

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
                    value={
                      s.correct * shape.marking.correct -
                      s.incorrect * shape.marking.incorrect
                    }
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
                {formatNumber(
                  s.correct * shape.marking.correct -
                    s.incorrect * shape.marking.incorrect,
                )}{" "}
                calculated marks
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
