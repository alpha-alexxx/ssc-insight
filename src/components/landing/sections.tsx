import Link from "next/link";
import { PlainIcon } from "@/components/icon";
import { FlutedFooter } from "@/components/fluted-footer";
import { shortDate } from "@/lib/format";
import { totals } from "@/lib/domain";
import { LANDING_ATTEMPTS, LANDING_FULL_MOCKS, LANDING_SUMMARY } from "./fixtures";
import type { LandingPlanData } from "./plan-facts";
import { Faq } from "./faq";
import { PlanGrid, PlanLegend } from "./planner-section";
import { ScopeDiagram } from "./scope-diagram";
import { EYEBROW, Section, SectionHead } from "./section";
import { LINK_BUTTON } from "./atoms";
import { AiPanel } from "./mockups/ai-panel";
import { BrowserFrame, MockupCaption } from "./mockups/browser-frame";
import { CompareScreen } from "./mockups/compare-screen";
import { DayWorkspaceScreen } from "./mockups/day-workspace-screen";

/**
 * The editorial sections between the two plates.
 *
 * All server components: copy, the fact strip, the scope diagram and the plan
 * grid are static HTML, and only the small interactive islands inside them
 * (the FAQ accordion, the mockups' tabs) ship JavaScript.
 */

/* ---------- 03 · Analytical scopes ---------- */

export function ScopesSection() {
  return (
    <Section id="scopes" number="03" className="py-20 sm:py-24">
      <SectionHead
        eyebrow="Analytical scopes"
        title="One record, four readings."
        lede="Switching a tab changes how a saved mock is projected. It never changes what was saved, and it never counts the same attempt twice."
      />
      <div className="pt-12">
        <ScopeDiagram />
      </div>

      <div className="mt-12 grid gap-6 border-t border-border pt-8 sm:grid-cols-3">
        {[
          {
            title: "A full mock is never counted twice",
            body: "All mocks reads every saved attempt exactly once. Its subjects and sections are projections of that one record, not extra records.",
          },
          {
            title: "Derived sections carry no borrowed numbers",
            body: "Section I and II sum their subjects. They do not inherit the parent mock's score override, rank, percentile or overall time.",
          },
          {
            title: "Missing stays missing",
            body: "A subject you never attempted draws no line. It is never plotted as zero, and no value is borrowed from another attempt to fill the gap.",
          },
        ].map((item) => (
          <div key={item.title}>
            <h3 className="font-serif text-[1.0625rem] leading-tight tracking-[-0.01em] text-foreground">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------- 04 · The 50-day plan ---------- */

export function PlanSection({ plan }: { plan: LandingPlanData }) {
  return (
    <Section id="plan" number="04" className="py-20 sm:py-24">
      <SectionHead
        eyebrow="The 50-day plan"
        title="A schedule that doesn't move."
        lede="Built from the RBE daily targets: three phases, every test dated, every source link kept. Recording progress never rewrites the plan."
      />

      <div className="mt-12">
        <PlanGrid plan={plan} />
        <PlanLegend plan={plan} />
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)] lg:items-start">
        <figure className="m-0">
          <BrowserFrame url={`sscinsight.app/plan/${plan.sampleDay.date}`}>
            <DayWorkspaceScreen plan={plan} />
          </BrowserFrame>
          <MockupCaption>
            Day {plan.sampleDay.day} of 50 · {plan.sampleDay.dayType} — the
            day&apos;s assignments, the four habits, and the revision block.
          </MockupCaption>
        </figure>

        <div className="lg:pt-2">
          <h3 className="font-serif text-[1.375rem] leading-tight tracking-[-0.02em] text-foreground">
            Every day opens into its own workspace.
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {plan.taskCount} scheduled tasks across {plan.days.length} days,{" "}
            {plan.mockDayCount} of them carrying a full-length mock. Each day
            lists its assignments with the original source link, the four daily
            habits, and its revision block.
          </p>
          <dl className="mt-7 divide-y divide-border border-y border-border">
            {[
              ["Attempt date", "what the tracker records and charts use"],
              ["Scheduled date", "the plan's own day, which never moves"],
              ["Revision", "marked by hand, never by attempting"],
              ["Source link", "every test keeps its original RBE link"],
            ].map(([term, detail]) => (
              <div key={term} className="py-3">
                <dt className="text-[13px] font-medium text-foreground">{term}</dt>
                <dd className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {detail}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Section>
  );
}

/* ---------- 05 · Compare ---------- */

export function CompareSection() {
  // The two mocks the ledger compares, described in words outside the
  // aria-hidden mockup so the information is not trapped in decoration.
  const withPercentile = LANDING_FULL_MOCKS.at(-1)!;
  const earlier = LANDING_FULL_MOCKS.at(-2)!;
  const later = totals(withPercentile);
  const before = totals(earlier);
  const delta = later.score - before.score;

  return (
    <Section id="compare" number="05" className="py-20 sm:py-24">
      <SectionHead
        eyebrow="Compare"
        title="Find the difference behind the score."
        lede="Two to four results side by side — score, percentage, accuracy, attempted, time and time per question — with a difference column in the unit that matters."
      />

      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
        <div className="lg:sticky lg:top-24">
          <dl className="divide-y divide-border border-y border-border">
            {[
              { term: "Score", detail: `${before.score} → ${later.score} of ${later.maxScore}` },
              { term: "Difference", detail: `${delta > 0 ? "+" : ""}${delta} marks` },
              {
                term: "Percentage",
                detail: `${before.percentage.toFixed(1)}% → ${later.percentage.toFixed(1)}%`,
              },
              {
                term: "Accuracy",
                detail: `${(before.accuracy ?? 0).toFixed(1)}% → ${(later.accuracy ?? 0).toFixed(1)}%`,
              },
              {
                term: "Attempts compared",
                detail: `${shortDate(earlier.completedAt)} and ${shortDate(withPercentile.completedAt)}`,
              },
            ].map((row) => (
              <div key={row.term} className="flex items-baseline justify-between gap-4 py-3">
                <dt className={EYEBROW}>{row.term}</dt>
                <dd className="text-right text-sm tabular-nums text-foreground">{row.detail}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            Where two records have different maximums, percentages stand in for
            marks. Percentile only appears when a platform actually published
            one — it is never inferred.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Comparing {LANDING_ATTEMPTS.filter((a) => a.type !== "full").length}{" "}
            sectional and subject results works the same way.
          </p>
        </div>

        <figure className="m-0">
          <BrowserFrame url="sscinsight.app/compare">
            <CompareScreen />
          </BrowserFrame>
          <MockupCaption>
            Two full mocks compared across every metric, with a subject-level
            breakdown and a difference column in percentage points.
          </MockupCaption>
        </figure>
      </div>
    </Section>
  );
}

/* ---------- Plate II · optional AI + privacy ---------- */

export function AiSection() {
  return (
    <div className="pb-14 pt-6 sm:pb-16">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-center">
        <div>
          <p className={EYEBROW}>Optional · AI coach</p>
          <h2 className="mt-3 text-balance font-serif text-[clamp(1.5rem,2.6vw,2.25rem)] font-[450] leading-[1.1] tracking-[-0.02em] text-foreground">
            A second reading, if you want one.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            Point the coach at any OpenAI-compatible endpoint with your own key
            and it returns a structured read of your recent mocks: strengths,
            focus areas and next actions. Bring a key, or skip it — the tracker
            behaves the same either way.
          </p>
          <ul className="mt-7 divide-y divide-border border-y border-border">
            {[
              "Read-only: it cannot create, edit or schedule a mock.",
              "Sends aggregates and your latest 20 full mocks — no notes, email or identity.",
              "Paste a scorecard and it prepares a draft; the form is the only place that saves.",
            ].map((line) => (
              <li
                key={line}
                className="flex items-start gap-3 py-3 text-sm leading-relaxed text-muted-foreground"
              >
                <span
                  aria-hidden="true"
                  className="mt-[0.45rem] size-1.5 shrink-0 rounded-full bg-primary"
                />
                {line}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs text-muted-foreground">
            Hidden entirely when no provider is configured.
          </p>
        </div>

        <div className="mx-auto w-full max-w-sm lg:max-w-none">
          <AiPanel />
        </div>
      </div>
    </div>
  );
}

export function PrivacySection() {
  return (
    <div
      id="privacy"
      className="grid gap-10 border-t border-border py-16 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"
    >
      <div>
        <p className={EYEBROW}>Private by construction</p>
        <h2 className="mt-3 text-balance font-serif text-[clamp(1.5rem,2.6vw,2.25rem)] font-[450] leading-[1.1] tracking-[-0.02em] text-foreground">
          Your account is the boundary.
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
          Google sign-in, isolated records, and no shared surface anywhere. Every
          read and write is scoped to the verified user — there is no guest
          record and no administrator view.
        </p>
        <div className="mt-7 flex items-start gap-3 rounded-2xl bg-card p-4 shadow-[inset_0_0_0_1px_var(--border)]">
          <PlainIcon name="shield" size={20} tone="foreground" className="mt-0.5 shrink-0" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Account changes remount the workspace, so a different Google account
            never sees a stale session&apos;s data.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-card p-5 shadow-[inset_0_0_0_1px_var(--border)]">
          <p className={`${EYEBROW} flex items-center gap-2`}>
            <PlainIcon name="download" size={14} tone="primary" />
            In the file
          </p>
          <ul className="mt-3 space-y-1.5 text-[13px] leading-relaxed">
            {[
              "Every attempt and subject result",
              "Notes, rank, participants, percentile",
              "Per-subject timing and overrides",
              "Your target score",
            ].map((line) => (
              <li key={line} className="flex gap-2">
                <span aria-hidden="true" className="text-success">
                  +
                </span>
                <span className="text-muted-foreground">{line}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-card p-5 shadow-[inset_0_0_0_1px_var(--border)]">
          <p className={`${EYEBROW} flex items-center gap-2`}>
            <PlainIcon name="shield" size={14} tone="primary" />
            Never in the file
          </p>
          <ul className="mt-3 space-y-1.5 text-[13px] leading-relaxed">
            {[
              "Email address or user ID",
              "Sign-in credentials",
              "Your AI provider key",
              "Anything from another account",
            ].map((line) => (
              <li key={line} className="flex gap-2">
                <span aria-hidden="true" className="text-destructive">
                  −
                </span>
                <span className="text-muted-foreground">{line}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="sm:col-span-2">
          <p className="text-xs leading-relaxed text-muted-foreground">
            One JSON file, <span className="tabular-nums">ssc-insight-backup</span>{" "}
            version 2, imports into a different Google account — merge or
            replace, atomically. Your AI key is sealed with AES-256-GCM before
            it is stored and is shown back only as its last four characters.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- 06 · FAQ ---------- */

export function FaqSection() {
  return (
    <Section id="faq" number="06" className="py-20 sm:py-24">
      <SectionHead
        eyebrow="Questions"
        title="The details, before you sign in."
        lede="Plain answers about accounts, scoring and leaving with your data."
      />
      <Faq />
    </Section>
  );
}

/* ---------- 07 · Final CTA + footer ---------- */

export function FinalCta({ authAvailable }: { authAvailable: boolean }) {
  const summary = LANDING_SUMMARY;
  return (
    <Section id="start" number="07" bordered={false} className="py-20 sm:py-28">
      <div className="relative overflow-hidden rounded-[28px] bg-card px-6 py-14 shadow-[inset_0_0_0_1px_var(--border)] sm:px-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 size-[22rem] rounded-full bg-primary/10 blur-3xl"
        />
        <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className={EYEBROW}>Start here</p>
            <h2 className="mt-3 max-w-xl text-balance font-serif text-[clamp(1.875rem,3.6vw,2.875rem)] font-[450] leading-[1.08] tracking-[-0.02em] text-foreground">
              Start with the mock you already took.
            </h2>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
              Create a free account, log one result, and the ledger begins —
              trend, target gap and plan position from a single attempt.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              {authAvailable ? (
                <>
                  <Link href="/sign-up" className={LINK_BUTTON.primary}>
                    Start For Free
                  </Link>
                  <Link href="/sign-in" className={LINK_BUTTON.ghost}>
                    I already have an account
                  </Link>
                </>
              ) : (
                <span
                  aria-disabled="true"
                  className={`${LINK_BUTTON.primary} pointer-events-none opacity-45`}
                >
                  Sign-in unavailable
                </span>
              )}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Google or email · no card, no test series, nothing shared.
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-x-8 gap-y-4 border-t border-border pt-5 lg:min-w-[16rem] lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0">
            {[
              { label: "Marks in a paper", value: "390" },
              { label: "Target reference", value: `${Math.round(summary.targetPercentage)}%` },
              { label: "Plan length", value: "50 days" },
              { label: "Export", value: "JSON" },
            ].map((row) => (
              <div key={row.label}>
                <dt className={EYEBROW}>{row.label}</dt>
                <dd className="mt-1 font-serif text-2xl leading-none tracking-[-0.02em] tabular-nums text-foreground">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Section>
  );
}

export function LandingFooter() {
  const year = new Date().getFullYear();
  return (
    <div className="mt-auto w-full bg-background">
      {/* The paper-and-plan facts, kept as the small print above the footer. */}
      <div className="mx-auto max-w-6xl px-5 pt-16 sm:px-8">
        <div className="grid gap-x-10 gap-y-9 pb-14 sm:grid-cols-2">
          <div>
            <p className={EYEBROW}>The paper</p>
            <ul className="mt-3 space-y-1.5 text-[13px]">
              {[
                ["Full mock", "130 Q · 390 marks"],
                ["Section I", "Quant + Reasoning · 180"],
                ["Section II", "English + GA · 210"],
                ["Marking", "+3 correct · −1 wrong"],
              ].map(([term, detail]) => (
                <li key={term} className="flex flex-wrap justify-between gap-x-3">
                  <span className="text-foreground">{term}</span>
                  <span className="text-muted-foreground">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className={EYEBROW}>The plan</p>
            <ul className="mt-3 space-y-1.5 text-[13px]">
              {[
                ["Window", "26 Oct – 14 Dec 2026"],
                ["Phase 1", "Build · days 1–20"],
                ["Phase 2", "Speed & Accuracy · 21–45"],
                ["Phase 3", "Final Revision · 46–50"],
              ].map(([term, detail]) => (
                <li key={term} className="flex flex-wrap justify-between gap-x-3">
                  <span className="text-foreground">{term}</span>
                  <span className="text-muted-foreground">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1240px] px-4 pb-10 sm:px-6">
        <FlutedFooter
          wordmark="SSC Insight"
          tagline="A private mock tracker for SSC CGL Tier 2. One account, one workspace."
          columns={[
            {
              title: "This page",
              links: [
                { label: "The workspace", href: "#workspace" },
                { label: "Analytical scopes", href: "#scopes" },
                { label: "The 50-day plan", href: "#plan" },
                { label: "Compare", href: "#compare" },
                { label: "Questions", href: "#faq" },
              ],
            },
          ]}
          accent="var(--primary)"
          legal={`Dates in India Standard Time · SSC CGL Tier 2 · ${year} · Not affiliated with the Staff Selection Commission.`}
        />
      </div>
    </div>
  );
}

/** Shared by the showcase caption: how many sample attempts the page shows. */
export const SAMPLE_ATTEMPT_COUNT = LANDING_ATTEMPTS.length;
