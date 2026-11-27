import type { CSSProperties } from "react";
import { shortDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { MockChip, MockTrend, subjectChartColor } from "../mockups/data-parts";
import { MockPanel } from "../mockups/workspace-frame";
import type {
  LandingPreviewPoint,
  LandingSceneKey,
  LandingScopePreviewData,
} from "./types";

const SERIES_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function seriesColor(point: LandingPreviewPoint, index: number): string {
  if (point.seriesId in SERIES_BY_ID) return SERIES_BY_ID[point.seriesId]!;
  return SERIES_COLORS[index % SERIES_COLORS.length]!;
}

const SERIES_BY_ID: Record<string, string> = {
  full: "var(--primary)",
  all: "var(--primary)",
  section1: "var(--chart-1)",
  section2: "var(--chart-2)",
};

function seriesRows(points: readonly LandingPreviewPoint[]) {
  const rows = new Map<string, LandingPreviewPoint[]>();
  for (const point of points) {
    const current = rows.get(point.seriesId) ?? [];
    current.push(point);
    rows.set(point.seriesId, current);
  }
  return [...rows.values()];
}

function MiniSeries({ points, color }: { points: readonly LandingPreviewPoint[]; color: string }) {
  return (
    <div className="h-[5.5em] min-w-0">
      <MockTrend
        points={points.map((point) => ({ percentage: point.percentage }))}
        color={color}
        showGrid={false}
      />
    </div>
  );
}

function FullScene({ data }: { data: LandingScopePreviewData }) {
  const latest = data.points.at(-1);
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-end justify-between gap-3 border-b border-border pb-3">
        <div>
          <p className="text-[0.78em] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Latest full mock</p>
          <p className="mt-1 font-serif text-[2em] leading-none tabular-nums">
            {latest ? `${latest.percentage.toFixed(1)}%` : "—"}
          </p>
        </div>
        {latest ? (
          <div className="text-right text-[0.82em] text-muted-foreground">
            <p className="font-medium text-foreground">{latest.name}</p>
            <p>{shortDate(latest.date)} · {latest.score}/{latest.maxScore} marks</p>
          </div>
        ) : null}
      </div>
      <div className="mt-4 min-h-0 flex-1">
        <MockTrend points={[...data.points]} target={data.targetPercentage ?? undefined} />
      </div>
      <p className="mt-2 text-[0.78em] text-muted-foreground">
        {data.pointCount} saved full mocks · one point per sitting · dashed line is the comparable sample target.
      </p>
    </div>
  );
}

function ProjectedScene({ data }: { data: LandingScopePreviewData }) {
  const series = seriesRows(data.points);
  return (
    <div className="flex h-full flex-col">
      <div className="grid min-h-0 flex-1 gap-x-5 gap-y-3 sm:grid-cols-2">
        {series.map((points, index) => {
          const first = points[0]!;
          const color =
            data.scene === "subject"
              ? subjectChartColor(first.seriesId as Parameters<typeof subjectChartColor>[0])
              : seriesColor(first, index);
          const average = points.reduce((sum, point) => sum + point.percentage, 0) / points.length;
          return (
            <section key={first.seriesId} className="min-w-0 border-b border-border pb-2">
              <div className="flex items-baseline justify-between gap-3">
                <h4 className="truncate text-[0.9em] font-medium text-foreground">{first.seriesLabel}</h4>
                <p className="shrink-0 text-[0.78em] tabular-nums text-muted-foreground">
                  {points.length} pts · {average.toFixed(1)}% avg
                </p>
              </div>
              <MiniSeries points={points} color={color} />
            </section>
          );
        })}
      </div>
      <p className="mt-2 text-[0.78em] text-muted-foreground">
        {data.pointCount} analytical points · {data.scene === "subject" ? "qualifying Computer remains a separate subject series" : "qualifying sections never enter the merit projection"}.
      </p>
    </div>
  );
}

function AllScene({ data }: { data: LandingScopePreviewData }) {
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        <MockTrend points={[...data.points]} />
      </div>
      <ol className="mt-3 grid max-h-[12em] gap-1 overflow-hidden sm:grid-cols-2">
        {data.points.map((point) => (
          <li key={point.key} className="flex min-w-0 items-center gap-2 border-t border-border py-1.5 text-[0.76em]">
            <MockChip tone={point.sourceType === "full" ? "accent" : point.sourceType === "subject" ? "positive" : "warning"}>
              {point.seriesLabel}
            </MockChip>
            <span className="min-w-0 flex-1 truncate text-muted-foreground">{point.name}</span>
            <span className="shrink-0 font-medium tabular-nums text-foreground">{point.percentage.toFixed(1)}%</span>
          </li>
        ))}
      </ol>
      <p className="mt-2 text-[0.78em] text-muted-foreground">
        {data.pointCount} saved parent attempts · one point per record · percentages normalize unlike paper sizes.
      </p>
    </div>
  );
}

/** Hook-free analytical scene; data is projected on the server in section-data. */
export function ScopeScene({ data }: { data: LandingScopePreviewData }) {
  return (
    <div className={cn("h-full min-h-[22em] rounded-xl bg-card p-4 text-[12px] text-foreground sm:p-5")}>
      {data.scene === "full" ? <FullScene data={data} /> : null}
      {data.scene === "subject" || data.scene === "sectional" ? <ProjectedScene data={data} /> : null}
      {data.scene === "all" ? <AllScene data={data} /> : null}
    </div>
  );
}

/** A thumbnail with the same real series, used by each feature tab. */
export function ScopeSceneThumbnail({ scene, data }: { scene: LandingSceneKey; data: LandingScopePreviewData }) {
  const rows = seriesRows(data.points);
  return (
    <div className="relative h-full min-h-[8em] overflow-hidden rounded-lg bg-card p-3" data-scene={scene}>
      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        <span>{scene} projection</span>
        <span>{data.pointCount} points</span>
      </div>
      <div className={cn("mt-3 grid gap-2", rows.length > 2 && "grid-cols-2")}>
        {rows.slice(0, 4).map((points, index) => (
          <MiniSeries key={points[0]?.seriesId ?? index} points={points} color={seriesColor(points[0]!, index)} />
        ))}
      </div>
      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-primary" style={{ "--scene-points": data.pointCount } as CSSProperties} />
    </div>
  );
}

export function ScopeScenePreview(props: { data: LandingScopePreviewData }) {
  return (
    <MockPanel title="Analytical scope" description="Illustrative sample data · projected by the real tracker rules">
      <ScopeScene {...props} />
    </MockPanel>
  );
}
