import { Hero } from "./hero";
import { LandingError } from "./landing-error";
import { Masthead } from "./masthead";
import { LANDING_PLAN } from "./plan-data";
import { FloatingAsk, SectionRail } from "./chrome";
import { buildLandingSectionData } from "./section-data";
import { RedesignedSections } from "./redesigned-sections";
import { PrivacySection } from "./privacy-section";
import { FaqSection } from "./faq-section";
import { LandingFooter } from "./footer";
import { CtaBanner } from "@/components/hyperblur/cta-banner";

/**
 * The public landing: the unchanged masthead and hero, then the registry-led
 * product story. Server code derives a small serializable payload; client
 * islands own the interactive previews and their motion lifecycle.
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
  const sectionData = buildLandingSectionData(LANDING_PLAN);
  return (
    <div id="top" className="flex min-h-screen flex-col overflow-x-clip bg-background text-foreground">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-[13px] focus:font-medium focus:text-primary-foreground focus:shadow-[inset_0_0_0_1px_var(--border)]">
        Skip to main content
      </a>
      <LandingError errorCode={errorCode} />
      <Masthead authAvailable={authAvailable} />
      <SectionRail />
      <FloatingAsk />

      <main id="main-content" className="flex-1">
        <Hero authAvailable={authAvailable} plan={LANDING_PLAN} />
        <RedesignedSections data={sectionData} plan={LANDING_PLAN} />
        <PrivacySection />
        <FaqSection />
        <CtaBanner
          id="start"
          title="Start with the mock you already took."
          text="Create a free account, log one result, and the ledger begins—trend, target gap and plan position from a single attempt. Google or email · no card · nothing shared."
          primary={{ label: "Start For Free", href: "/sign-up" }}
          secondary={{ label: "I already have an account", href: "/sign-in" }}
          accent="var(--primary)"
          authAvailable={authAvailable}
        />
      </main>

      <LandingFooter />
    </div>
  );
}
