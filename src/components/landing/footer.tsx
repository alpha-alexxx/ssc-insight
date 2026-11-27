import { FlutedFooter } from "@/components/fluted-footer";
import { EYEBROW } from "./section";

/** The existing footer, moved without changing its composition or content. */
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
