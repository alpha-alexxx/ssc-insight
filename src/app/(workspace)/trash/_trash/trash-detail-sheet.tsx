"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/button";
import { Sheet } from "@/components/sheet";
import { Skeleton } from "@/components/skeleton";
import { PlainIcon } from "@/components/icon";
import { TRASH_KIND_META, type TrashKind } from "@/lib/trash-core";
import { trashDetailQueryOptions } from "@/lib/queries/trash";

/**
 * Read-only record detail for one trashed item.
 *
 * A Sheet rather than a route: the list must stay where the user left it —
 * selection, filters and page are all live state — and the detail is a
 * decision aid ("is this the mock I meant?"), not a destination. The server
 * formats every field, so this component renders strings and cannot invent a
 * number the product would not produce elsewhere.
 */
export function TrashDetailSheet({
  kind,
  id,
  onClose,
  onRestore,
  onPurge,
  busy,
}: {
  kind: TrashKind | null;
  id: string;
  onClose: () => void;
  onRestore: () => void;
  onPurge: () => void;
  busy: boolean;
}) {
  const query = useQuery(trashDetailQueryOptions(kind, id));
  const detail = query.data;

  return (
    <Sheet
      open={!!kind}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      side="right"
      width={448}
      title={detail?.item.title ?? "Deleted record"}
      description={
        kind
          ? `${TRASH_KIND_META[kind].module} · recoverable until it expires — then it is gone for good.`
          : "Recoverable until it expires — then it is gone for good."
      }
      footer={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={onPurge}
            disabled={busy || !detail}
            className="text-destructive hover:text-destructive"
            icon={<PlainIcon name="trash" size={13} />}
          >
            Delete permanently
          </Button>
          <Button size="sm" onClick={onRestore} disabled={busy || !detail} icon={<PlainIcon name="refresh" size={13} />}>
            Restore
          </Button>
        </>
      }
    >
      {query.isError ? (
        <p role="alert" className="py-6 text-xs text-destructive">
          This record could not be loaded.
        </p>
      ) : !detail ? (
        <div className="space-y-2 pt-2" role="status" aria-label="Loading details">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} shape="line" height={20} />
          ))}
        </div>
      ) : (
        <>
          <dl className="divide-y divide-border border-y border-border">
            {detail.fields.map((field) => (
              <div
                key={field.label}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2.5"
              >
                <dt className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
                  {field.label}
                </dt>
                <dd className="max-w-full min-w-0 text-right text-xs break-words">
                  {field.value}
                </dd>
              </div>
            ))}
          </dl>

          {detail.subjects?.length ? (
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Subjects
              </p>
              <table className="w-full text-xs tabular-nums">
                <caption className="sr-only">
                  Subject-level results for this deleted mock
                </caption>
                <thead>
                  <tr className="text-left text-xs text-muted-foreground">
                    <th scope="col" className="py-1 font-medium">
                      Subject
                    </th>
                    <th scope="col" className="py-1 text-right font-medium">
                      Questions
                    </th>
                    <th scope="col" className="py-1 text-right font-medium">
                      Correct
                    </th>
                    <th scope="col" className="py-1 text-right font-medium">
                      Wrong
                    </th>
                    <th scope="col" className="py-1 text-right font-medium">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {detail.subjects.map((subject) => (
                    <tr key={subject.subject}>
                      <th scope="row" className="py-1.5 text-left font-normal">
                        {subject.subject}
                      </th>
                      <td className="py-1.5 text-right">{subject.questions}</td>
                      <td className="py-1.5 text-right">{subject.correct}</td>
                      <td className="py-1.5 text-right">{subject.incorrect}</td>
                      <td className="py-1.5 text-right">{subject.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </>
      )}
    </Sheet>
  );
}
