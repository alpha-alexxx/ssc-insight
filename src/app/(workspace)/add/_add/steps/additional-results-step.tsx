"use client";

import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import { formatTime, type AttemptInput } from "@/lib/domain";

export function AdditionalResultsStep({
  values,
  set,
  computedValues,
}: {
  values: AttemptInput;
  set: <K extends keyof AttemptInput>(key: K, value: AttemptInput[K]) => void;
  computedValues: AttemptInput;
}) {
  return (
    <section className="space-y-4" aria-label="Additional results">
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
              set(key, value === "" ? null : Number(value))
            }
          />
        ))}
        <Input
          label="Overall time (hh:mm:ss)"
          readOnly
          value={formatTime(computedValues.overallTimeSeconds).padStart(8, "0")}
        />
      </div>
      <Textarea
        label="Notes"
        minRows={4}
        maxLength={5000}
        placeholder="What went well? What needs another look?"
        value={values.notes}
        onValueChange={(value) => set("notes", value)}
      />
    </section>
  );
}
