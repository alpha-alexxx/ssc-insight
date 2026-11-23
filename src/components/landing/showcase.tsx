import { FeatureTabs } from "@/components/feature-tabs";
import { BrowserFrame, MockupCaption } from "./mockups/browser-frame";
import { CompareScreen } from "./mockups/compare-screen";
import { DashboardScreen } from "./mockups/dashboard-screen";
import { HistoryScreen } from "./mockups/history-screen";
import { PlannerScreen } from "./mockups/planner-screen";
import type { LandingPlanData } from "./plan-facts";
import { EYEBROW } from "./section";

/**
 * Plate I: the product showcase, on Hairline's FeatureTabs.
 *
 * The tablist is a real tablist (arrow keys, Home and End), the hairline under
 * the chosen tab slides over with a little give, and the panel's height eases
 * to the new content while it slides in through a light blur — the whole
 * specimen reads like turning a page rather than switching a dashboard
 * filter.
 */

type TabId = "dashboard" | "history" | "compare" | "planner";

const TABS: { id: TabId; label: string; url: string; caption: string }[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    url: "sscinsight.app/dashboard",
    caption:
      "One account, today's plan and the performance that matters — the divided metric strip, the score band, the trend, the subject radar and the answer breakdown.",
  },
  {
    id: "history",
    label: "History",
    url: "sscinsight.app/history",
    caption:
      "Every saved attempt in one sortable ledger: mock name, type, platform, attempt date, score, accuracy and time taken.",
  },
  {
    id: "compare",
    label: "Compare",
    url: "sscinsight.app/compare",
    caption:
      "Two to four results side by side — score, percentage, accuracy, attempted, time and time per question, with each subject broken out and a difference column.",
  },
  {
    id: "planner",
    label: "Planner",
    url: "sscinsight.app/calendar",
    caption:
      "The 50-day plan as a calendar: every scheduled mock, sectional and topic test on its date, with the selected day's assignments and the four daily habits.",
  },
];

export function Showcase({ plan }: { plan: LandingPlanData }) {
  const tabs = TABS.map((item) => ({
    id: item.id,
    label: item.label,
    content: (
      <figure className="m-0">
        <BrowserFrame url={item.url}>
          {item.id === "dashboard" ? <DashboardScreen /> : null}
          {item.id === "history" ? <HistoryScreen /> : null}
          {item.id === "compare" ? <CompareScreen /> : null}
          {item.id === "planner" ? <PlannerScreen plan={plan} /> : null}
        </BrowserFrame>
        <MockupCaption>{item.caption}</MockupCaption>
      </figure>
    ),
  }));

  return (
    <div className="relative">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <p className={EYEBROW}>The workspace</p>
          <h2 className="mt-3 text-balance font-serif text-[clamp(1.5rem,2.6vw,2.25rem)] font-[450] leading-[1.1] tracking-[-0.02em] text-foreground">
            The tracker you sign into.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            Every screen below is a rendering of the real workspace — drawn
            with the app&apos;s own design tokens and populated with sample
            data. Nothing here is a stock dashboard screenshot.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <FeatureTabs tabs={tabs} />
      </div>
    </div>
  );
}
