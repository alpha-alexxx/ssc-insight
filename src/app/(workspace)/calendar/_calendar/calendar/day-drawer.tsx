"use client";
import { Sheet } from "@/components/sheet";
import { DayLedger, type DayLedgerProps } from "./day-ledger";
import { longDate } from "@/lib/format";

/**
 * The day ledger as a bottom sheet on phones: tapping a day in the month or
 * week grid slides the schedule up over the grid instead of leaving it below
 * the fold. The body is the exact component the day surface and the desktop
 * rail use, so all three stay one implementation — the sheet only adds the
 * drag handle, the scroll region and the safe-area padding.
 *
 * Only mounted below `md`; tablets and desktop use the inline panel.
 */
export function DayDrawer({
  open,
  onOpenChange,
  ...ledger
}: DayLedgerProps & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      side="bottom"
      title={<span className="sr-only">Schedule for {longDate(ledger.date)}</span>}
    >
      <DayLedger {...ledger} variant="drawer" />
    </Sheet>
  );
}
