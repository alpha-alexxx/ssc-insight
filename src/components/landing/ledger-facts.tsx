import { StatsBand, type Stat } from "@/components/stats-band";
import type { LandingPlanData } from "./plan-facts";
import { EYEBROW } from "./section";

/**
 * The numbers strip: five product constants as one ruled row of figures, on
 * Hairline's StatsBand — the hairlines draw themselves and each figure rolls
 * up from zero as it arrives, while screen readers get the real figures
 * straight away.
 *
 * Every figure is a real product constant or a plan-derived count; the plan
 * task count comes from the rows (262), never the export's declared total.
 */
export function LedgerFacts({ plan }: { plan: LandingPlanData }) {
  const facts: Stat[] = [
    {
      value: 390,
      suffix: " marks",
      label: "in a full mock · +3 correct, −1 incorrect",
    },
    {
      value: 4,
      suffix: " scopes",
      label: "one saved record, four readings",
    },
    {
      value: plan.days.length,
      suffix: " days",
      label: "26 Oct – 14 Dec 2026, three phases",
    },
    {
      value: plan.taskCount,
      suffix: " tasks",
      label: "scheduled across the study plan",
    },
    {
      value: 1,
      suffix: " file",
      label: "JSON backup, importable anywhere",
    },
  ];

  return (
    <section aria-label="At a glance" className="bg-background pb-20 pt-14 sm:pb-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className={`${EYEBROW} mb-5`}>The paper, the plan, the export</p>
        <StatsBand stats={facts} />
      </div>
    </section>
  );
}
