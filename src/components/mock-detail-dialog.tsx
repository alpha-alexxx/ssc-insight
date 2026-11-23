"use client";
import { Dialog } from "@/components/dialog";
import { Button } from "./button";
import {
  SUBJECTS,
  subjectStats,
  totals,
  formatNumber as n,
  formatTime,
  type Attempt,
} from "@/lib/domain";
import { longDate, mockTypeLabel } from "@/lib/format";

/**
 * Result detail dialog + delete confirmation.
 *
 * Hairline Dialog (title/description/footer, lg size) with a nested confirm
 * dialog for the destructive action: focus is trapped in each surface,
 * Escape cancels the topmost one first, and the confirm needs an explicit
 * activation. The props contract (attempt/onClose/onEdit/onCompare/onDelete/
 * busy) is unchanged — the workspace chrome still owns this dialog.
 */

const typeName = mockTypeLabel;

export function MockDetailDialog({
  attempt,
  onClose,
  onEdit,
  onCompare,
  onDelete,
  busy,
}: {
  attempt: Attempt | null;
  onClose: () => void;
  onEdit: (attempt: Attempt) => void;
  onCompare: (attempt: Attempt) => void;
  /** Confirm deletion. The dialog itself only opens the confirm step. */
  onDelete: (attempt: Attempt) => void;
  busy: boolean;
}) {
  const detail = attempt;
  return (
    <Dialog
      open={!!detail}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      size="lg"
      title={detail?.name ?? ""}
      description={
        detail
          ? `${detail.platform} · ${typeName(detail.type)} · attempted ${longDate(detail.completedAt)}${
              detail.createdAt ? ` · logged ${longDate(detail.createdAt)}` : ""
            }`
          : undefined
      }
      footer={
        detail ? (
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            <DeleteMockButton attempt={detail} onDelete={onDelete} disabled={busy} />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCompare(detail)}
              >
                Compare
              </Button>
              <Button size="sm" onClick={() => onEdit(detail)}>
                Edit result
              </Button>
            </div>
          </div>
        ) : undefined
      }
    >
      {detail && (
        <div className="pb-2">
          <dl className="grid grid-cols-2 gap-5 py-5 tabular-nums sm:grid-cols-4">
            {[
              {
                label: "Score",
                value: `${n(totals(detail).score)} / ${totals(detail).maxScore}`,
              },
              {
                label: "Accuracy",
                value:
                  totals(detail).accuracy == null
                    ? "—"
                    : `${n(totals(detail).accuracy, 2)}%`,
              },
              {
                label: "Rank",
                value: detail.rank
                  ? `${n(detail.rank)} / ${n(detail.participants)}`
                  : "—",
              },
              {
                label: "Percentile",
                value:
                  detail.percentile != null
                    ? `${n(detail.percentile, 2)}%`
                    : "—",
              },
            ].map((s) => (
              <div key={s.label}>
                <dt className="text-xs text-muted-foreground">{s.label}</dt>
                <dd className="mt-1 font-serif text-2xl leading-none text-foreground">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
          <div className="max-w-full overflow-x-auto">
            <table className="w-full text-xs tabular-nums">
              <caption className="sr-only">
                Score breakdown by subject for {detail.name}
              </caption>
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th scope="col" className="border-b border-border py-2 pr-4 font-medium">
                    Subject
                  </th>
                  <th scope="col" className="border-b border-border py-2 pr-4 font-medium">
                    Score
                  </th>
                  <th scope="col" className="border-b border-border py-2 pr-4 font-medium">
                    Correct
                  </th>
                  <th scope="col" className="border-b border-border py-2 pr-4 font-medium">
                    Incorrect
                  </th>
                  <th scope="col" className="border-b border-border py-2 pr-4 font-medium">
                    Skipped
                  </th>
                  <th scope="col" className="border-b border-border py-2 pr-4 font-medium">
                    Accuracy
                  </th>
                  <th scope="col" className="border-b border-border py-2 font-medium">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {detail.subjects.map((s) => {
                  const t = subjectStats(s, detail.marking);
                  return (
                    <tr key={s.subjectId} className="border-b border-border last:border-b-0">
                      <td className="py-2 pr-4 font-medium text-foreground">
                        {SUBJECTS[s.subjectId].short}
                      </td>
                      <td className="py-2 pr-4 text-foreground">
                        {n(t.score)} / {t.maxScore}
                      </td>
                      <td className="py-2 pr-4 text-foreground">{s.correct}</td>
                      <td className="py-2 pr-4 text-foreground">{s.incorrect}</td>
                      <td className="py-2 pr-4 text-foreground">{t.unattempted}</td>
                      <td className="py-2 pr-4 text-foreground">
                        {n(t.accuracy)}
                        {t.accuracy != null ? "%" : ""}
                      </td>
                      <td className="py-2 text-foreground">
                        {formatTime(s.timeSeconds)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Overall: {totals(detail).attempted} attempted ·{" "}
            {formatTime(totals(detail).timeSeconds)}
          </p>
          {detail.notes && (
            <p className="mt-5 whitespace-pre-wrap rounded-[14px] bg-muted/50 p-4 text-sm leading-relaxed text-foreground">
              {detail.notes}
            </p>
          )}
        </div>
      )}
    </Dialog>
  );
}

/** Destructive zone of the detail dialog: opens the confirm dialog. */
function DeleteMockButton({
  attempt,
  onDelete,
  disabled,
}: {
  attempt: Attempt;
  onDelete: (attempt: Attempt) => void;
  disabled: boolean;
}) {
  return (
    <Dialog
      size="sm"
      title={`Move “${attempt.name}” to Trash?`}
      description="The result leaves your charts, averages and insights right away, and stays recoverable in Trash for 15 days."
      trigger={
        <Button variant="destructive" size="sm" disabled={disabled}>
          Move to Trash
        </Button>
      }
      footer={({ close }) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={close}>
            Keep mock
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(attempt)}>
            Move to Trash
          </Button>
        </div>
      )}
    />
  );
}
