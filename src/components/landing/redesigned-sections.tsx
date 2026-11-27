"use client";

import { BentoLiveWidgets } from "@/components/hyperblur/bento-live-widgets";
import { ComparisonVersus } from "@/components/hyperblur/comparison-versus";
import { FeaturesLiveTabs } from "@/components/hyperblur/features-live-tabs";
import { FeaturesOrbit } from "@/components/hyperblur/features-orbit";
import { ProofTiltedWall } from "@/components/hyperblur/proof-tilted-wall";
import { ShowcaseDeviceGallery } from "@/components/hyperblur/showcase-device-gallery";
import { StatsCounters } from "@/components/hyperblur/stats-counters";
import { DiamondGrid } from "@/components/aicanvas/diamond-grid";
import { NoiseField } from "@/components/aicanvas/noise-field";
import { PlainIcon, type IconName } from "@/components/icon";
import type { LandingPlanData } from "./plan-facts";
import type { LandingSectionData } from "./section-data";
import { DevicePreview, PlanCoachTile, PlanDayTile, PlanPhaseTile, PlanScheduleTile, PlanWorkloadTile, ScopeScene, ScopeSceneThumbnail } from "./previews";

/** Client islands own ReactNode previews; the landing page stays a server tree. */
export function RedesignedSections({ data, plan }: { data: LandingSectionData; plan: LandingPlanData }) {
  const orbitIcons: IconName[] = ["dashboard", "layers", "compare", "calendar", "book", "check", "download", "sparkles"];
  return (
    <>
      <ShowcaseDeviceGallery
        eyebrow="01 · The workspace"
        title="One ledger, shaped to the screen in your hand."
        subtitle="Phone, tablet and computer views use the same saved records and the same plan. These are real token-built product mockups, not stock screenshots."
        appName="SSC Insight"
        devices={[...data.devices]}
        defaultDevice="laptop"
        accent="var(--primary)"
        screens={{
          phone: <DevicePreview device="phone" plan={plan} />,
          tablet: <DevicePreview device="tablet" plan={plan} />,
          laptop: <DevicePreview device="laptop" plan={plan} />,
        }}
      />

      <div className="relative">
        <DiamondGrid />
        <div className="relative">
          <FeaturesLiveTabs
            eyebrow="02 · Analytical scopes"
            title="One record, four live readings."
            subtitle="Switch the projection, never the saved attempt. Every miniature and stage uses the tracker's own sample analytics."
            items={[...data.features]}
            accent="var(--primary)"
            renderScene={(scene, context) => context === "mini"
              ? <ScopeSceneThumbnail scene={scene} data={data.scopePreviews[scene]} />
              : <ScopeScene data={data.scopePreviews[scene]} />}
          />
        </div>
      </div>

      <div className="relative">
        <NoiseField />
        <div className="relative">
          <BentoLiveWidgets
            eyebrow="03 · The 50-day plan"
            title="A fixed schedule, with the evidence beside it."
            subtitle="Real plan rows, dated assignments, four daily habits and the sample full-mock trend—without turning study work into fake live activity."
            accent="var(--primary)"
            tiles={[
              { id: "trend", title: "The full-mock trend", eyebrow: "Performance", children: <PlanScheduleTile /> },
              { id: "phases", title: `${plan.days.length} days, three phases`, eyebrow: "Schedule", children: <PlanPhaseTile plan={plan} /> },
              { id: "day", title: "Every day opens into work", eyebrow: `Day ${plan.sampleDay.day}`, children: <PlanDayTile plan={plan} /> },
              { id: "workload", title: `${plan.taskCount} scheduled tasks`, eyebrow: "Workload", children: <PlanWorkloadTile plan={plan} /> },
              { id: "coach", title: "A second reading, if you want one", eyebrow: "Optional · read-only AI", children: <PlanCoachTile /> },
            ]}
          />
        </div>
      </div>

      <FeaturesOrbit
        eyebrow="04 · One connected workspace"
        title="The plan, the ledger and the way out, in one orbit."
        subtitle="Every chip names a real product capability. Nothing here is an integration your account does not have."
        items={data.orbitItems.map((item, index) => ({ ...item, icon: <PlainIcon name={orbitIcons[index] ?? "check"} size={20} tone="current" /> }))}
        captions={[...data.orbitCaptions]}
        primaryCta={{ label: "See the workspace", href: "#workspace" }}
        secondaryCta={{ label: "Start for free", href: "/sign-up" }}
        accent="var(--primary)"
        mark={<PlainIcon name="chartLine" size={40} tone="current" />}
      />

      <StatsCounters
        eyebrow="05 · The paper, the plan, the export"
        title="Product constants, not marketing multiples."
        subtitle="Every figure and sparkline derives from the SSC pattern, the sample analytics or actual study-plan rows."
        stats={data.stats}
        accent="var(--primary)"
        footnote="Illustrative sample data. The task count always comes from actual plan rows, never a stale declared total."
      />

      <ComparisonVersus
        eyebrow="06 · Compare"
        title="Find the difference behind the score."
        subtitle={`${data.comparison.note} Percentile appears only when a platform reported it; different paper sizes are compared by percentage.`}
        before={data.comparison.before}
        after={data.comparison.after}
        metrics={data.comparison.metrics}
        badge={data.comparison.badge}
        accent="var(--primary)"
      />

      <ProofTiltedWall
        id="stories"
        eyebrow="08 · Illustrative study scenarios"
        title="Twelve ways the same workspace fits the work."
        subtitle={data.reviewNote}
        score=""
        cta={null}
        reviews={data.reviews}
        accent="var(--primary)"
        columns={4}
        speed={56}
      />

    </>
  );
}
