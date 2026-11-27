import type { DashboardScope } from "@/lib/domain";

/** The four analytical readings supported by the product showcase. */
export type LandingSceneKey = DashboardScope;

/** The three device layouts supported by the responsive showcase. */
export type LandingDeviceKind = "phone" | "tablet" | "laptop";

/** Visuals available to the plan bento; layout remains the parent's choice. */
export type LandingPlanTileKind = "schedule" | "day" | "phases" | "workload";

/** A serializable analytical point, derived by `projectPerformance()`. */
export type LandingPreviewPoint = {
  key: string;
  date: string;
  name: string;
  seriesId: string;
  seriesLabel: string;
  sourceType: "full" | "subject" | "sectional";
  origin: "attempt" | "full-derived";
  score: number;
  maxScore: number;
  percentage: number;
  accuracy: number | null;
  attempted: number;
  questions: number;
  timeSeconds: number | null;
};

/** Plain data that can cross from a Server Component into a client island. */
export type LandingScopePreviewData = {
  scene: LandingSceneKey;
  pointCount: number;
  /** Only the full-mock scene has a like-for-like sample target reference. */
  targetPercentage: number | null;
  points: readonly LandingPreviewPoint[];
};
