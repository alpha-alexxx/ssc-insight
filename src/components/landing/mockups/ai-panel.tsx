import { PlainIcon } from "@/components/icon";
import { LANDING_SUMMARY } from "../fixtures";
import { MockChip } from "./data-parts";

/**
 * The AI coach sheet, as a static illustration for the optional-AI section.
 *
 * The three tabs are labels, not controls: on the landing nothing is
 * interactive inside a mockup, and showing live tabs would imply the coach
 * works without a configured provider. The answer shown is a plausible
 * read of the sample data, and the privacy footer repeats the real contract.
 */
export function AiPanel() {
  const s = LANDING_SUMMARY;
  const weakest = [...s.whereYouStand]
    .filter((row) => row.subjectId !== "computer" && row.averagePercentage != null)
    .sort((a, b) => (a.averagePercentage ?? 0) - (b.averagePercentage ?? 0))[0];
  const strongest = [...s.whereYouStand]
    .filter((row) => row.subjectId !== "computer" && row.averagePercentage != null)
    .sort((a, b) => (b.averagePercentage ?? 0) - (a.averagePercentage ?? 0))[0];

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-[22px] bg-card text-[12px] text-foreground shadow-[inset_0_0_0_1px_var(--border)] sm:text-[13px]">
      <div className="flex items-start justify-between gap-3 border-b border-border px-[1em] py-[0.8em]">
        <div>
          <p className="flex items-center gap-[0.4em] text-[1.1em] font-[450] text-foreground">
            <PlainIcon name="sparkles" size={14} tone="primary" />
            Your study coach
          </p>
          <p className="mt-[0.15em] text-[0.78em] text-muted-foreground">
            Dashboard · Session-only conversation
          </p>
        </div>
        <span className="text-muted-foreground" aria-hidden="true">
          ✕
        </span>
      </div>

      <div className="flex gap-[0.3em] border-b border-border px-[1em] py-[0.5em]">
        <span className="rounded-full bg-primary px-[0.6em] py-[0.25em] text-[0.78em] font-medium text-primary-foreground">
          Coach chat
        </span>
        <span className="rounded-full px-[0.6em] py-[0.25em] text-[0.78em] text-muted-foreground">
          Plan todos
        </span>
        <span className="rounded-full px-[0.6em] py-[0.25em] text-[0.78em] text-muted-foreground">
          Log a mock
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-[0.6em] px-[1em] py-[0.85em]">
        <p className="self-end rounded-full bg-muted px-[0.6em] py-[0.4em] text-[0.85em] text-foreground">
          What should I focus on this week?
        </p>
        <div className="text-[0.85em] leading-[1.55]">
          <p className="font-medium text-foreground">Accuracy is trending up; time is the lever.</p>
          <ul className="mt-[0.35em] list-disc pl-[1.1em] text-muted-foreground">
            <li>
              Your last full mock reached{" "}
              <span className="font-medium text-foreground">
                {s.latestPercentage.toFixed(1)}%
              </span>{" "}
              — {Math.abs(s.gapToTarget).toFixed(1)} points under target.
            </li>
            <li>
              {strongest?.label ?? "Reasoning"} is your strongest area at{" "}
              {(strongest?.averagePercentage ?? 0).toFixed(1)}%.
            </li>
            <li>
              {weakest?.label ?? "General Awareness"} is the widest gap at{" "}
              {(weakest?.averagePercentage ?? 0).toFixed(1)}%.
            </li>
          </ul>
          <p className="mt-[0.45em] text-muted-foreground">
            A short sectional this week would test whether the gap is recall or
            time.
          </p>
        </div>
        <div className="flex items-center gap-[0.35em] text-[0.75em] text-muted-foreground">
          <MockChip>Reads aggregates only</MockChip>
          <MockChip>Latest 20 full mocks</MockChip>
        </div>
      </div>

      <div className="border-t border-border px-[1em] py-[0.55em] text-[0.72em] leading-snug text-muted-foreground">
        Notes, email and user identity are never sent. The coach never creates,
        edits or schedules anything.
      </div>
      <div className="mx-[1em] mb-[0.9em] flex items-center justify-between rounded-full px-[0.6em] py-[0.4em] text-[0.78em] text-muted-foreground shadow-[inset_0_0_0_1px_var(--border)]">
        Ask about a mock, a weak subject, or what to do next…
        <span className="rounded-full bg-primary px-[0.6em] py-[0.15em] text-primary-foreground">
          Send
        </span>
      </div>
    </div>
  );
}
