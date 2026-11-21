import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * The split-ledger chrome for the auth pages: a full-height ink plate
 * beside the task's form on paper.
 *
 * The plate's content is a deliberate PLACEHOLDER — the showcase miniature
 * that lived here was removed at the product's request; future plate
 * content (art, a product moment, copy) replaces the marked slot below.
 * On phones the plate is hidden and the form leads, so the task is never
 * behind a scroll.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* The plate — hidden on phones. Content pending: keep this slot. */}
      <div
        aria-hidden="true"
        className="plate relative hidden flex-col justify-center overflow-hidden p-10 lg:flex xl:p-14"
      >
        {/* Placeholder: future plate content replaces this reserved block. */}
        <div className="mx-auto aspect-[4/5] w-full max-w-[26rem] rounded-[var(--radius-panel)] border border-dashed border-[var(--plate-rule)]" />
      </div>

      {/* The task */}
      <div className="flex min-h-dvh flex-col">
        <header className="flex items-center justify-between px-5 py-5 sm:px-8">
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
          className="flex flex-1 items-center justify-center px-5 pb-16 sm:px-8"
        >
          <div className="w-full max-w-sm">{children}</div>
        </main>
      </div>
    </div>
  );
}
