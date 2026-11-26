"use client";

import { Input } from "@/components/input";
import { Select, type SelectOption } from "@/components/select";
import { DatePicker } from "@/components/date-picker";
import { Checkbox } from "@/components/checkbox";
import {
  SUBJECTS,
  formatNumber,
  sectionForSubjects,
  type Attempt,
  type AttemptInput,
  type PatternShape,
  type SubjectId,
} from "@/lib/domain";
import { meritSubjectIds, blankSubject } from "../form-helpers";
import { MOCK_PLATFORMS } from "@/lib/mock-entry";

export function MockDetailsStep({
  values,
  setValues,
  attempt,
  shape,
  examName,
  tierOptions,
  effectiveTierId,
  chooseTier,
  platformChoice,
  setPlatformChoice,
  date,
  setDate,
  onDuplicateReviewed,
}: {
  values: AttemptInput;
  setValues: React.Dispatch<React.SetStateAction<AttemptInput>>;
  attempt?: Attempt;
  shape: PatternShape;
  examName: string;
  tierOptions: { id: string; label: string }[];
  effectiveTierId: string;
  chooseTier: (tierId: string) => void;
  platformChoice: string;
  setPlatformChoice: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
  onDuplicateReviewed: () => void;
}) {
  const set = <K extends keyof AttemptInput>(key: K, value: AttemptInput[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    onDuplicateReviewed();
  };

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
    onDuplicateReviewed();
  };

  const qualifyingSubject = shape.subjects.find((s) => s.qualifying);
  const includesQualifying =
    values.type === "full" &&
    qualifyingSubject != null &&
    values.subjects.some((s) => s.subjectId === qualifyingSubject.subjectId);

  return (
    <section className="space-y-5" aria-label="Mock details">
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
                    (shape.subjects.find((s) => s.subjectId === id)?.questions ?? 0),
                  0,
                ) * shape.marking.correct
              } marks`,
            },
            { value: "subject", label: "Subject mock" },
            ...(shape.sections.length > 0
              ? [{ value: "sectional", label: "Sectional mock" }]
              : []),
          ]}
          onValueChange={(value) => chooseType(value as AttemptInput["type"])}
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
              set("subjects", [blankSubject(value as SubjectId, shape)])
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
                    (shape.subjects.find((s) => s.subjectId === id)?.questions ?? 0),
                  0,
                ) * shape.marking.correct
              } marks`,
            }))}
            onValueChange={(value) => {
              const section = shape.sections.find((s) => s.id === value);
              if (!section) return;
              set(
                "subjects",
                section.subjectIds.map((id) => blankSubject(id, shape)),
              );
            }}
          />
        )}
      </div>

      {values.type === "full" && qualifyingSubject && (
        <div className="border-t border-border pt-4">
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
                      (s) => s.subjectId !== qualifyingSubject.subjectId,
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
                  (shape.subjects.find((s) => s.subjectId === id)?.questions ?? 0),
                0,
              ) * shape.marking.correct,
              0,
            )}{" "}
            marks. Its time is included in overall time.
          </p>
        </div>
      )}
    </section>
  );
}
