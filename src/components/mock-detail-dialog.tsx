"use client";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
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
 * Result detail dialog + delete confirmation (Phase 6 + 11).
 * The native window.confirm() is replaced by a themable Radix AlertDialog:
 * focus is trapped, Escape cancels, and the destructive action requires an
 * explicit activation. Dialog enter/exit run on CSS data-state animations.
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
    >
      <DialogContent className="rounded-panel w-[calc(100%-32px)] max-w-4xl max-h-[85vh] overflow-auto p-6 md:p-8">
        <DialogTitle className="font-serif text-3xl leading-tight pr-8">
          {detail?.name}
        </DialogTitle>
        <DialogDescription className="muted text-xs mt-2">
          {detail &&
            `${detail.platform} · ${typeName(detail.type)} · attempted ${longDate(detail.completedAt)}${
              detail.createdAt ? ` · logged ${longDate(detail.createdAt)}` : ""
            }`}
        </DialogDescription>
        {detail && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 py-7 tabular">
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
                  <p className="text-xs muted mb-1">{s.label}</p>
                  <p className="font-serif text-2xl">{s.value}</p>
                </div>
              ))}
            </div>
            <div className="overflow-auto">
              <table className="w-full text-xs tabular">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Score</th>
                    <th>Correct</th>
                    <th>Incorrect</th>
                    <th>Skipped</th>
                    <th>Accuracy</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.subjects.map((s) => {
                    const t = subjectStats(s, detail.marking);
                    return (
                      <tr key={s.subjectId}>
                        <td>{SUBJECTS[s.subjectId].short}</td>
                        <td>
                          {n(t.score)} / {t.maxScore}
                        </td>
                        <td>{s.correct}</td>
                        <td>{s.incorrect}</td>
                        <td>{t.unattempted}</td>
                        <td>
                          {n(t.accuracy)}
                          {t.accuracy != null ? "%" : ""}
                        </td>
                        <td>{formatTime(s.timeSeconds)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs muted">
              Overall: {totals(detail).attempted} attempted ·{" "}
              {formatTime(totals(detail).timeSeconds)}
            </p>
            {detail.notes && (
              <p className="text-sm mt-5 p-4 bg-canvas rounded-control whitespace-pre-wrap">
                {detail.notes}
              </p>
            )}
            <div className="flex flex-wrap justify-between gap-3 mt-7">
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Destructive zone of the detail dialog: opens the confirm AlertDialog. */
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
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={disabled}>
          Move to Trash
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-panel w-[calc(100%-32px)] max-w-md p-6">
        <AlertDialogTitle className="font-serif text-2xl leading-tight">
          Move “{attempt.name}” to Trash?
        </AlertDialogTitle>
        <AlertDialogDescription className="muted text-sm mt-2 leading-relaxed">
          The result leaves your charts, averages and insights right away, and
          stays recoverable in Trash for 15 days.
        </AlertDialogDescription>
        <div className="flex justify-end gap-2 mt-6">
          <AlertDialogCancel>Keep mock</AlertDialogCancel>
          <AlertDialogAction onClick={() => onDelete(attempt)}>
            Move to Trash
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
