import { Hero } from "./hero";
import { LandingError } from "./landing-error";
import { LedgerFacts } from "./ledger-facts";
import { Masthead } from "./masthead";
import { LANDING_PLAN } from "./plan-data";
import { FloatingAsk, SectionRail } from "./chrome";
import { FilmSection } from "./film-section";
import {
  AiSection,
  CompareSection,
  FaqSection,
  FinalCta,
  LandingFooter,
  PlanSection,
  PrivacySection,
  ScopesSection,
} from "./sections";
import { Plate } from "./section";
import { Showcase } from "./showcase";

/**
 * The public landing page — the only sign-in surface, and the first thing an
 * anonymous visitor sees.
 *
 * Structure: a server-rendered page with a handful of named client islands
 * (masthead, hero art and CTAs, the showcase tabs, the film player, the FAQ
 * accordion, the error announcer). Everything else — copy, section heads,
 * mockup markup, the fact strip, the plan grid — is static HTML, so the page
 * is fully readable before hydration and without JavaScript.
 *
 * The root is `min-h-screen flex flex-col` with the footer pushed by
 * `mt-auto`, so short viewports never float the footer mid-air.
 */
export function Landing({
  authEnabled,
  emailEnabled,
  errorCode,
}: {
  authEnabled: boolean;
  emailEnabled: boolean;
  errorCode?: string;
}) {
  const authAvailable = authEnabled || emailEnabled;
  return (
    <div
      id="top"
      className="flex min-h-screen flex-col overflow-x-clip bg-background text-foreground"
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-[13px] focus:font-medium focus:text-primary-foreground focus:shadow-[inset_0_0_0_1px_var(--border)]"
      >
        Skip to main content
      </a>
      <LandingError errorCode={errorCode} />
      <Masthead authAvailable={authAvailable} />
      <SectionRail />
      <FloatingAsk />

      <main id="main-content" className="flex-1">
        <Hero authAvailable={authAvailable} plan={LANDING_PLAN} />
        <LedgerFacts plan={LANDING_PLAN} />

        <Plate id="workspace" label="Plate I · The workspace">
          <div className="pb-20 pt-6 sm:pb-24">
            <Showcase plan={LANDING_PLAN} />
          </div>
        </Plate>

        <FilmSection plan={LANDING_PLAN} />

        <ScopesSection />
        <PlanSection plan={LANDING_PLAN} />
        <CompareSection />

        <Plate label="Plate II · Yours alone">
          <AiSection />
          <PrivacySection />
        </Plate>

        <FaqSection />
        <FinalCta authAvailable={authAvailable} />
      </main>

      <LandingFooter />
    </div>
  );
}
