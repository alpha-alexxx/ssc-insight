import type { CounterStat } from "@/components/hyperblur/stats-counters";
import type { DeviceGalleryDevice } from "@/components/hyperblur/showcase-device-gallery";
import type { FeaturesLiveTabsItem } from "@/components/hyperblur/features-live-tabs";
import type { OrbitCaption, OrbitItem } from "@/components/hyperblur/features-orbit";
import type { TiltedWallReview } from "@/components/hyperblur/proof-tilted-wall";
import type { VersusMetric, VersusSide } from "@/components/hyperblur/comparison-versus";
import { projectPerformance } from "@/lib/analytics";
import { totals } from "@/lib/domain";
import { shortDate } from "@/lib/format";
import {
  LANDING_ATTEMPTS,
  LANDING_FULL_MOCKS,
  LANDING_SCOPES,
  LANDING_SUMMARY,
} from "./fixtures";
import type { LandingPlanData } from "./plan-facts";
import type {
  LandingDeviceKind,
  LandingSceneKey,
  LandingScopePreviewData,
} from "./previews/types";

const SCENE_ORDER = ["full", "subject", "sectional", "all"] as const;

export type LandingFeatureItem = FeaturesLiveTabsItem & {
  scene: LandingSceneKey;
};

/** Four tabs, in the same order as the real analytical scopes. */
export const LANDING_FEATURES: readonly LandingFeatureItem[] = SCENE_ORDER.map(
  (scene) => {
    const scope = LANDING_SCOPES[scene];
    const titles: Record<LandingSceneKey, string> = {
      full: "One sitting, one honest score",
      subject: "Every subject keeps its own line",
      sectional: "Sections derived, never duplicated",
      all: "Every saved record, exactly once",
    };
    return {
      scene,
      label: scope.label,
      title: titles[scene],
      body: `${scope.summary.charAt(0).toUpperCase()}${scope.summary.slice(1)}. Missing values stay missing, and percentages keep different paper sizes comparable.`,
      stat: `${scope.pointCount} analytical points`,
    };
  },
);

/** Serializable chart inputs; the browser never needs the exam catalog. */
export const LANDING_SCOPE_PREVIEWS: Readonly<
  Record<LandingSceneKey, LandingScopePreviewData>
> = Object.fromEntries(
  SCENE_ORDER.map((scene) => {
    const points = projectPerformance([...LANDING_ATTEMPTS], scene).map(
      (point) => ({
        key: point.key,
        date: point.date,
        name: point.name,
        seriesId: point.seriesId,
        seriesLabel: point.seriesLabel,
        sourceType: point.sourceType,
        origin: point.origin,
        score: point.score,
        maxScore: point.maxScore,
        percentage: point.percentage,
        accuracy: point.accuracy,
        attempted: point.attempted,
        questions: point.questions,
        timeSeconds: point.timeSeconds,
      }),
    );
    return [
      scene,
      {
        scene,
        pointCount: LANDING_SCOPES[scene].pointCount,
        targetPercentage:
          scene === "full" ? LANDING_SUMMARY.targetPercentage : null,
        points,
      },
    ];
  }),
) as unknown as Record<LandingSceneKey, LandingScopePreviewData>;

export type LandingDeviceDefinition = Omit<DeviceGalleryDevice, "id"> & {
  id: LandingDeviceKind;
};

/** Deliberately no watch: the product's three responsive layouts only. */
export const LANDING_DEVICES: readonly LandingDeviceDefinition[] = [
  {
    id: "phone",
    label: "Phone",
    headline: "Today’s work, within a thumb’s reach",
    detail:
      "The day’s assignments, daily habits and latest result stack into one focused column. Tables retain their own horizontal scroll rather than crushing the ledger.",
  },
  {
    id: "tablet",
    label: "Tablet",
    headline: "The plan and its evidence, side by side",
    detail:
      "A wider calendar makes room for dated assignments while the selected day keeps its tasks and checklist visible. The same records drive every view.",
  },
  {
    id: "laptop",
    label: "Computer",
    headline: "The complete analytical workspace",
    detail:
      "The persistent sidebar, divided score band, full-mock trend, subject radar and answer ledger share one screen without changing the underlying records.",
  },
];

function phaseProgression(plan: LandingPlanData): number[] {
  const totalDays = plan.days.length;
  return plan.phases.map((phase) => {
    const throughPhase = plan.days.filter((day) => day.day <= phase.to).length;
    return totalDays ? (throughPhase / totalDays) * 100 : 0;
  });
}

/** The four counters and all of their sparklines come from fixture/plan rows. */
export function buildLandingStats(plan: LandingPlanData): CounterStat[] {
  const fullTrend = LANDING_SUMMARY.trend.map((point) => point.percentage);
  const latest = fullTrend.at(-1) ?? 0;
  const first = fullTrend[0] ?? 0;
  const scopeTrend = SCENE_ORDER.map(
    (scene) => LANDING_SCOPES[scene].pointCount,
  );
  return [
    {
      value: LANDING_SUMMARY.latestMax,
      label: "Marks in the sample full-mock paper; its line plots real score percentages.",
      suffix: " marks",
      delta: `${latest.toFixed(1)}% latest · ${(latest - first >= 0 ? "+" : "")}${(latest - first).toFixed(1)} pp across samples`,
      trend: fullTrend,
    },
    {
      value: SCENE_ORDER.length,
      label: "Analytical scopes; each line compares the real projection counts.",
      suffix: " scopes",
      delta: SCENE_ORDER.map(
        (scene) => `${LANDING_SCOPES[scene].label} ${LANDING_SCOPES[scene].pointCount}`,
      ).join(" · "),
      trend: scopeTrend,
    },
    {
      value: plan.days.length,
      label: "Days in the fixed schedule; the line reaches the end of each real phase.",
      suffix: " days",
      delta: plan.phases.map((phase) => phase.name).join(" → "),
      trend: phaseProgression(plan),
    },
    {
      value: plan.taskCount,
      label: "Scheduled assignments, counted from the actual rows rather than the source declaration.",
      suffix: " tasks",
      delta: `${plan.mockDayCount} days include a full-length mock`,
      trend: plan.days.map((day) => day.taskCount),
    },
  ];
}

function minutes(seconds: number | null): string {
  if (seconds == null) return "—";
  const rounded = Math.round(seconds / 60);
  return `${Math.floor(rounded / 60)}h ${String(rounded % 60).padStart(2, "0")}m`;
}

function ratio(before: number, after: number): number {
  return before === 0 ? (after === 0 ? 1 : 0) : after / before;
}

export type LandingComparison = {
  before: VersusSide;
  after: VersusSide;
  metrics: VersusMetric[];
  badge: string;
  note: string;
};

/** First and latest full mocks; only totals() supplies their measurements. */
export const LANDING_COMPARISON: LandingComparison = (() => {
  const earlierAttempt = LANDING_FULL_MOCKS.at(-2)!;
  const latestAttempt = LANDING_FULL_MOCKS.at(-1)!;
  const earlier = totals(earlierAttempt);
  const latest = totals(latestAttempt);
  const before: VersusSide = {
    label: "Earlier",
    title: earlierAttempt.name,
    points: [
      `${shortDate(earlierAttempt.completedAt)} · ${earlierAttempt.platform}`,
      `${earlier.score} / ${earlier.maxScore} marks`,
      `${earlier.correct} correct · ${earlier.incorrect} incorrect · ${earlier.unattempted} unattempted`,
    ],
  };
  const after: VersusSide = {
    label: "Latest",
    title: latestAttempt.name,
    points: [
      `${shortDate(latestAttempt.completedAt)} · ${latestAttempt.platform}`,
      `${latest.score} / ${latest.maxScore} marks`,
      `${latest.correct} correct · ${latest.incorrect} incorrect · ${latest.unattempted} unattempted`,
    ],
  };
  const metric = (
    label: string,
    beforeValue: number,
    afterValue: number,
    format: (value: number) => string,
  ): VersusMetric => ({
    label,
    before: format(beforeValue),
    after: format(afterValue),
    ratio: ratio(beforeValue, afterValue),
  });
  return {
    before,
    after,
    metrics: [
      metric("Score", earlier.score, latest.score, (value) => `${value} / ${latest.maxScore}`),
      metric("Score percentage", earlier.percentage, latest.percentage, (value) => `${value.toFixed(1)}%`),
      metric("Accuracy", earlier.accuracy ?? 0, latest.accuracy ?? 0, (value) => `${value.toFixed(1)}%`),
      metric("Attempted", earlier.attempted, latest.attempted, (value) => `${value} questions`),
      metric("Time taken", earlier.timeSeconds ?? 0, latest.timeSeconds ?? 0, (value) => minutes(value)),
    ],
    badge: "→",
    note: "Two illustrative sample attempts, not evidence that the tracker caused an improvement.",
  };
})();

export const LANDING_REVIEW_NOTE =
  "Twelve fictional product scenarios — not customer testimonials, real people, or ratings.";

const SCENARIO_HIGHLIGHTS = [
  "Log a full mock without losing subject detail",
  "Compare percentage across different paper sizes",
  "Keep full, subject and sectional projections distinct",
  "See missing subjects as missing, never zero",
  "Open a dated plan day and record each assignment",
  "Keep daily habits separate from test completion",
  "Find the widest subject gap in the latest result",
  "Compare two attempts in the unit that matters",
  "Preserve reported percentile only where it exists",
  "Move accounts with a portable JSON backup",
  "Use the optional coach without allowing writes",
  "Return to the same ledger on phone or computer",
] as const;

/** Named scenarios make the illustrative provenance explicit on every card. */
export const LANDING_REVIEWS: TiltedWallReview[] = SCENARIO_HIGHLIGHTS.map(
  (highlight, index) => ({
    name: `Scenario ${String(index + 1).padStart(2, "0")}`,
    role: "Fictional workflow · no person or rating",
    highlight,
    quote: `In this illustrative workflow: ${highlight}. This describes product behavior, not a claimed customer outcome.`,
  }),
);

export const LANDING_ORBIT_ITEMS: OrbitItem[] = [
  { label: "Full mocks", ring: "inner" },
  { label: "Subject results", ring: "inner" },
  { label: "Section I & II", ring: "inner" },
  { label: "Attempt dates", ring: "inner" },
  { label: "50-day plan", ring: "outer" },
  { label: "Daily habits", ring: "outer" },
  { label: "JSON backup", ring: "outer" },
  { label: "Optional AI", ring: "outer" },
];

export const LANDING_ORBIT_CAPTIONS: OrbitCaption[] = [
  {
    title: "One private ledger",
    description: "Attempts remain saved records; analytical scopes are readings, not copies.",
  },
  {
    title: "A fixed plan around them",
    description: "Scheduled dates, assignments and habits stay distinct from attempt dates.",
  },
  {
    title: "Portable by design",
    description: "A backup carries your study record without carrying your sign-in identity.",
  },
  {
    title: "AI stays optional",
    description: "A configured coach can read permitted aggregates; it never writes to the tracker.",
  },
];

/** One server-safe composition root; pass the small plan payload, not plan-data.ts. */
export function buildLandingSectionData(plan: LandingPlanData) {
  return {
    features: LANDING_FEATURES,
    scopePreviews: LANDING_SCOPE_PREVIEWS,
    devices: LANDING_DEVICES,
    stats: buildLandingStats(plan),
    comparison: LANDING_COMPARISON,
    reviews: LANDING_REVIEWS,
    reviewNote: LANDING_REVIEW_NOTE,
    orbitItems: LANDING_ORBIT_ITEMS,
    orbitCaptions: LANDING_ORBIT_CAPTIONS,
  };
}

export type LandingSectionData = ReturnType<typeof buildLandingSectionData>;
