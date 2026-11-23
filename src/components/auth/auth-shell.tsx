import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { ForgotPlateArt } from "@/components/auth/plates/forgot-plate";
import { SignInPlateArt } from "@/components/auth/plates/sign-in-plate";
import { SignUpPlateArt } from "@/components/auth/plates/sign-up-plate";

/**
 * The auth pages' chrome, in Hairline tokens: the same split card the old
 * login-04 layout had — the form half on card tokens, the right half a
 * tone-inverted plate on `primary` — now composed as the token card
 * (rounded, ruled by an inset hairline, unshadowed) per the house card
 * recipe. Each page carries a distinct plate: the ledger for sign-in, the
 * 50-day plan for sign-up, the reassurance reading for forgot-password.
 *
 * The plate art is server-rendered inside this server component; the forms
 * stay client islands within the same card. On phones the plate is hidden
 * and the form leads, so the task is never behind a scroll. The page root
 * is `min-h-screen flex flex-col` with the footer at `mt-auto`, so the
 * honest one-line footer always sits at the bottom of the viewport.
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
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header — wordmark left, theme right, on the canvas above the card. */}
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
        <div className="w-full max-w-md md:max-w-4xl">
          {/* The auth card: grid of form | plate, rounded, ruled by the inset
              hairline, unshadowed — the token card recipe. */}
          <div className="grid overflow-hidden rounded-2xl bg-card text-card-foreground shadow-[inset_0_0_0_1px_var(--border)] md:grid-cols-2">
            {/* The task */}
            <div className="flex flex-col px-6 py-8 sm:px-10 sm:py-10 md:justify-center">
              {children}
            </div>

            {/* The plate — hidden on phones, tone-inverted on primary. */}
            <div
              aria-hidden="true"
              className="relative hidden items-center overflow-hidden border-l border-border bg-primary px-10 py-12 text-primary-foreground md:flex xl:px-12"
            >
              <div
                aria-hidden="true"
                className="absolute -right-24 -top-24 size-72 rounded-full bg-primary-foreground/10 opacity-80 blur-2xl"
              />
              <div className="relative flex w-full flex-col gap-10">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground/70">
                  {PLATE_LABEL[task]}
                </p>
                {PLATE_ART[task]}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* The block's under-card line — honest, no fake legal copy. */}
      <footer className="mt-auto px-4 pb-6 sm:px-8">
        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          One account, one workspace. Export everything, anytime.
        </p>
      </footer>
    </div>
  );
}
