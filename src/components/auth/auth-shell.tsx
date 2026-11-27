import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthCard } from "@/components/auth/auth-card";
import { BrandPanel, type BrandSlide } from "@/components/auth/brand-panel";
import { ForgotPlateArt } from "@/components/auth/plates/forgot-plate";
import { SignInPlateArt } from "@/components/auth/plates/sign-in-plate";
import { SignUpPlateArt } from "@/components/auth/plates/sign-up-plate";

/**
 * The auth pages' chrome: a split stage, adapted from Hyperblur's
 * `auth-split-brand`.
 *
 * The brand half is the plate (a tone-inverted reading derived through the
 * landing fixtures' real analytics), now carrying a drifting wash and the
 * three readings on a rotation instead of invented customer quotes — this is
 * a private tracker, so the honest social proof is the product's own output.
 * The task half is the adapted `auth-tilt-spotlight` card: paper, a rotating
 * conic frame, a spotlight on the pointer and a 3° tilt.
 *
 * The two halves are siblings rather than nested cards, so neither surface
 * needs a shadow and the split reads as one composition in every palette.
 * Below `md` the brand half folds away — the eyebrow rides above the card
 * instead — so the form leads and the task is never behind a scroll. The
 * footer stays at the bottom of the viewport with `mt-auto`.
 *
 * The slide art is server-rendered here and handed to the client panel, so
 * the plates keep their server-only fixture and plan reads.
 */

export type AuthShellTask = "sign-in" | "sign-up" | "forgot";

const LEDGER: BrandSlide = { label: "The mock ledger", art: <SignInPlateArt /> };
const PLAN: BrandSlide = { label: "The 50-day plan", art: <SignUpPlateArt /> };
const RECOVERY: BrandSlide = {
  label: "Recovery, without the loss",
  art: <ForgotPlateArt />,
};

const EYEBROW: Record<AuthShellTask, string> = {
  "sign-in": "SSC Insight · Mock tracker",
  "sign-up": "SSC Insight · The 50-day plan",
  forgot: "SSC Insight · Account recovery",
};

/** The task's own reading leads; the other two are what else the product reads. */
const SLIDES: Record<AuthShellTask, BrandSlide[]> = {
  "sign-in": [LEDGER, PLAN, RECOVERY],
  "sign-up": [PLAN, LEDGER, RECOVERY],
  forgot: [RECOVERY, LEDGER, PLAN],
};

export function AuthShell({
  task,
  children,
}: {
  task: AuthShellTask;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header — wordmark left, theme right, on the canvas above the stage. */}
      <header className="flex items-center justify-between px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="font-serif text-xl text-foreground transition-opacity hover:opacity-80"
        >
          ssc<span className="text-primary">insight</span>
          <span className="text-primary">.</span>
        </Link>
        <ThemeToggle />
      </header>

      <main
        id="main-content"
        className="flex flex-1 items-center justify-center px-4 pb-10 sm:px-8"
      >
        <div className="w-full max-w-md md:max-w-5xl xl:max-w-6xl">
          {/* Phones: the eyebrow is all the brand half needs. */}
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground md:hidden">
            {EYEBROW[task]}
          </p>

          <div className="grid items-stretch gap-4 md:grid-cols-[1.04fr_1fr] lg:gap-5">
            <BrandPanel
              eyebrow={EYEBROW[task]}
              slides={SLIDES[task]}
              className="hidden md:flex md:min-h-[34rem] lg:min-h-[38rem]"
            />

            {/* The task. The card is the tilt surface; the forms own the steps. */}
            <AuthCard className="md:min-h-[34rem] lg:min-h-[38rem]">
              {children}
            </AuthCard>
          </div>
        </div>
      </main>

      {/* The block's under-stage line — honest, no fake legal copy. */}
      <footer className="mt-auto px-4 pb-6 sm:px-8">
        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          One account, one workspace. Export everything, anytime.
        </p>
      </footer>
    </div>
  );
}
