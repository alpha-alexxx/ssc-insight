import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { ForgotPlateArt } from "@/components/auth/plates/forgot-plate";
import { SignInPlateArt } from "@/components/auth/plates/sign-in-plate";
import { SignUpPlateArt } from "@/components/auth/plates/sign-up-plate";
import { cn } from "@/lib/utils";

/**
 * The login-04 / signup-04 chrome, in house tokens.
 *
 * The shadcn block wraps the task in a bordered card with a plain image on
 * one side; this app's equivalent keeps the warm-paper editorial system: the
 * page canvas holds a rounded `--radius-card` card, whose left half is the
 * task's form and whose right half is the tone-inverted `--plate-*` art
 * composition (the `plate` class supplies the ink wash). Each page carries a
 * distinct plate — the ledger for sign-in, the 50-day plan for sign-up, the
 * reassurance reading for forgot-password.
 *
 * The plate art is server-rendered inside this server component; the forms
 * stay client islands within the same card. On phones the plate is hidden
 * and the form leads, so the task is never behind a scroll.
 */

export type AuthShellTask = "sign-in" | "sign-up" | "forgot";

const PLATE_ART: Record<AuthShellTask, React.ReactNode> = {
  "sign-in": <SignInPlateArt />,
  "sign-up": <SignUpPlateArt />,
  forgot: <ForgotPlateArt />,
};

const PLATE_LABEL: Record<AuthShellTask, string> = {
  "sign-in": "SSC Insight · Mock tracker",
  "sign-up": "SSC Insight · The 50-day plan",
  forgot: "SSC Insight · Account recovery",
};

export function AuthShell({
  task,
  children,
}: {
  task: AuthShellTask;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      {/* Header — wordmark left, theme right, on the canvas above the card. */}
      <header className="flex items-center justify-between px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="landing-wordmark text-xl text-ink transition-opacity hover:opacity-80"
        >
          ssc<span className="text-accent">insight</span>
          <span className="text-accent">.</span>
        </Link>
        <ThemeToggle />
      </header>

      <main
        id="main-content"
        className="flex flex-1 items-center justify-center px-4 pb-10 sm:px-8"
      >
        <div className="w-full max-w-md md:max-w-4xl">
          {/* The login-04 card: grid of form | plate, rounded, ruled, unshadowed. */}
          <div className="overflow-hidden rounded-card border border-rule-soft bg-paper">
            <div className="grid md:grid-cols-2">
              {/* The task */}
              <div className="flex flex-col px-6 py-8 sm:px-10 sm:py-10 md:justify-center">
                {children}
              </div>

              {/* The plate — hidden on phones. */}
              <div
                aria-hidden="true"
                className={cn(
                  "plate relative hidden items-center overflow-hidden border-l border-[var(--plate-rule)] px-10 py-12 md:flex xl:px-12",
                )}
              >
                <div
                  aria-hidden="true"
                  className="landing-blob absolute -right-24 -top-24 size-72 bg-[var(--plate-surface)] opacity-80"
                />
                <div className="relative flex w-full flex-col gap-10">
                  <p className="section-label text-[var(--plate-muted)]">
                    {PLATE_LABEL[task]}
                  </p>
                  {PLATE_ART[task]}
                </div>
              </div>
            </div>
          </div>

          {/* The block's under-card line — honest, no fake legal copy. */}
          <p className="mt-4 text-center text-xs leading-relaxed text-muted">
            One account, one workspace. Export everything, anytime.
          </p>
        </div>
      </main>
    </div>
  );
}
