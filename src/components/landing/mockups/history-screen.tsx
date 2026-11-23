import { totals, type SubjectId } from "@/lib/domain";
import { shortDate } from "@/lib/format";
import { LANDING_ATTEMPTS, LANDING_SUMMARY } from "../fixtures";
import type { ChipTone } from "./data-parts";
import {
  MOCK_ROW_HEAD,
  MOCK_TABLE,
  MockChip,
  MockStat,
  accuracyTone,
} from "./data-parts";
import { MockPageHead, MockPanel, WorkspaceFrame } from "./workspace-frame";

/**
 * The mock-history mockup: four KPI cells above a ruled, sortable table in a
 * horizontal scroll container. Every row is a real fixture attempt, and every
 * figure is the `totals()` result for that attempt.
 */

const TYPE_LABEL = {
  full: "Full mock",
  subject: "Subject",
  sectional: "Sectional",
} as const;

const TYPE_TONE: Record<keyof typeof TYPE_LABEL, ChipTone> = {
  full: "accent",
  subject: "positive",
  sectional: "warning",
};

const SUBJECT_SHORT: Record<SubjectId, string> = {
  quant: "Quant",
  reasoning: "Reasoning",
  english: "English",
  ga: "General Awareness",
  computer: "Computer",
};

export function HistoryScreen() {
  const s = LANDING_SUMMARY;
  const rows = [...LANDING_ATTEMPTS].reverse();

  return (
    <WorkspaceFrame
      view="Mock history"
      active="Mock history"
      actions={
        <span className="rounded-full bg-primary px-[0.6em] py-[0.2em] text-[0.8em] font-medium text-primary-foreground">
          + Add mock
        </span>
      }
    >
      <MockPageHead
        title="Mock history"
        subtitle="Every saved result with its actual attempt date, score and details."
        actions={
          <span className="rounded-full px-[0.55em] py-[0.2em] text-[0.8em] shadow-[inset_0_0_0_1px_var(--border)]">
            Export CSV
          </span>
        }
      />

      <div className="px-[1.1em] py-[0.9em]">
        <div className="grid grid-cols-2 gap-[0.5em] @[560px]:grid-cols-4">
          {[
            {
              label: "Total mocks",
              value: String(LANDING_ATTEMPTS.length),
              hint: "+2 this month",
            },
            {
              label: "Average score",
              value: String(
                Math.round(((s.averagePercentage ?? 0) / 100) * s.latestMax),
              ),
              unit: "/ 390",
              hint: `${(s.averagePercentage ?? 0).toFixed(1)}% of the paper`,
            },
            {
              label: "Average accuracy",
              value: `${(s.weightedAccuracy ?? 0).toFixed(1)}%`,
              hint: "Correct ÷ attempted",
            },
            {
              label: "Average time",
              value: "1:26:40",
              hint: "Per full mock",
            },
          ].map((cell) => (
            <div
              key={cell.label}
              className="rounded-lg bg-card px-[0.7em] py-[0.55em] shadow-[inset_0_0_0_1px_var(--border)]"
            >
              <MockStat {...cell} />
            </div>
          ))}
        </div>

        <MockPanel
          className="mt-[0.8em]"
          title="All saved mocks"
          description={`${LANDING_ATTEMPTS.length} results · sorted by attempt date`}
          action={<span className="text-muted-foreground">Search mocks… /</span>}
          bodyClassName="!px-0 !pb-0"
        >
          <div className="overflow-x-auto">
            <table className={MOCK_TABLE}>
              <thead>
                <tr>
                  <th scope="col" className="sticky left-0 z-[1] bg-card">
                    Mock name
                  </th>
                  <th scope="col">Type</th>
                  <th scope="col">Platform</th>
                  <th scope="col">Attempt date</th>
                  <th scope="col" className="text-right">
                    Score
                  </th>
                  <th scope="col">Accuracy</th>
                  <th scope="col" className="text-right">
                    Time taken
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((attempt) => {
                  const t = totals(attempt);
                  const percentage = t.percentage;
                  const firstSubject = attempt.subjects[0]!;
                  return (
                    <tr key={attempt.id}>
                      <th scope="row" className={`${MOCK_ROW_HEAD} sticky left-0 z-[1] bg-card`}>
                        <span className="flex items-center gap-[0.45em]">
                          <span
                            aria-hidden="true"
                            className="grid size-[1.5em] shrink-0 place-items-center rounded-full bg-primary/10 text-[0.7em] font-semibold text-primary"
                          >
                            {SUBJECT_SHORT[firstSubject.subjectId]
                              .slice(0, 2)
                              .toUpperCase()}
                          </span>
                          <span className="min-w-0">
                            <span className="block max-w-[16em] truncate font-medium">
                              {attempt.name}
                            </span>
                            <span className="block text-[0.78em] text-muted-foreground">
                              {TYPE_LABEL[attempt.type]}
                            </span>
                          </span>
                        </span>
                      </th>
                      <td>
                        <MockChip tone={TYPE_TONE[attempt.type]}>
                          {TYPE_LABEL[attempt.type]}
                        </MockChip>
                      </td>
                      <td>
                        <MockChip>{attempt.platform}</MockChip>
                      </td>
                      <td className="text-muted-foreground">{shortDate(attempt.completedAt)}</td>
                      <td className="text-right">
                        <span className="flex flex-col items-end gap-[0.25em]">
                          <span className="font-medium text-foreground">
                            {t.score} / {t.maxScore}
                          </span>
                          <span className="block h-[0.35em] w-[4.5em] overflow-hidden rounded-full bg-muted">
                            <span
                              className="block h-full rounded-full bg-primary"
                              style={{
                                width: `${Math.max(0, Math.min(100, percentage))}%`,
                              }}
                            />
                          </span>
                        </span>
                      </td>
                      <td>
                        <MockChip tone={accuracyTone(t.accuracy)}>
                          {t.accuracy == null ? "—" : `${t.accuracy.toFixed(1)}%`}
                        </MockChip>
                      </td>
                      <td className="text-right tabular-nums text-muted-foreground">
                        {formatDuration(t.timeSeconds)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-border px-[0.9em] py-[0.5em] text-[0.78em] text-muted-foreground">
            <span>
              Showing 1–{LANDING_ATTEMPTS.length} of {LANDING_ATTEMPTS.length} mocks
            </span>
            <span className="flex gap-[0.5em]">
              <span className="rounded-[2px] bg-primary px-[0.4em] text-primary-foreground">1</span>
              <span>Next ›</span>
            </span>
          </div>
        </MockPanel>
      </div>
    </WorkspaceFrame>
  );
}

/** h:mm:ss, matching `formatTime` (round-first) but tolerating a null duration. */
function formatDuration(seconds: number | null) {
  if (seconds == null) return "—";
  const total = Math.round(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor(total / 60) % 60;
  const s = total % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
