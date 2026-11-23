"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet } from "@/components/sheet";
import { Menu01Icon } from "@/components/animate-ui/icons/hugeicons/menu-01";
import { LINK_BUTTON } from "./atoms";
import { cn } from "@/lib/utils";

export const NAV: { href: string; label: string }[] = [
  { href: "#workspace", label: "Workspace" },
  { href: "#scopes", label: "Scopes" },
  { href: "#plan", label: "Plan" },
  { href: "#compare", label: "Compare" },
  { href: "#privacy", label: "Privacy" },
];

/**
 * The mobile navigation trigger — Hairline's ghost icon Button with the
 * animated menu glyph (the one dense-list exception on this page: it is the
 * masthead's primary interactive control).
 */
const MOBILE_NAV_TRIGGER = (
  <Button
    variant="ghost"
    size="icon"
    type="button"
    aria-label="Open navigation"
    className="size-11 md:hidden"
  >
    <Menu01Icon size={16} animateOnHover animateOnTap />
  </Button>
);

/**
 * The landing masthead.
 *
 * Client-side because it owns three pieces of UI state: the scroll-triggered
 * hairline (so the bar reads as floating over content once you leave the
 * hero), the reading-progress rule, and the mobile navigation sheet. The
 * theme toggle is Hairline's, driven by next-themes like the workspace's.
 *
 * The scroll listener is passive and only ever flips a boolean, so it does
 * not re-render on every frame; the progress rule is a transform driven by
 * the same scroll position at no layout cost.
 */
export function Masthead({ authAvailable }: { authAvailable: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    let frame = 0;
    function read() {
      frame = 0;
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(window.scrollY > 8);
      setProgress(scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0);
    }
    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(read);
    }
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-background/85 backdrop-blur-sm transition-colors duration-200",
        scrolled ? "border-border" : "border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <a
          href="#top"
          className="font-serif text-2xl tracking-[-0.02em] text-foreground transition-opacity hover:opacity-80"
          aria-label="SSC Insight — back to top"
        >
          ssc<span className="text-primary">insight</span>
          <span className="text-primary">.</span>
        </a>

        <nav aria-label="Landing sections" className="hidden md:block">
          <ul className="flex items-center gap-7">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="rounded-sm text-[13px] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1 sm:gap-3">
          <ThemeToggle
            value={resolvedTheme === "dark" ? "dark" : "light"}
            onValueChange={(next) => setTheme(next)}
            className="shrink-0"
          />
          {authAvailable ? (
            <>
              {/* The nav pair: ghost for the known, filled for the new. */}
              <Link href="/sign-in" aria-label="Log in" className={LINK_BUTTON.smGhost}>
                Log in
              </Link>
              <Link href="/sign-up" aria-label="Sign up" className={LINK_BUTTON.smPrimary}>
                Sign up
              </Link>
            </>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Sign-in unavailable
            </Button>
          )}
          <Sheet
            side="right"
            width={380}
            title={
              <span className="font-serif tracking-[-0.02em]">
                ssc<span className="text-primary">insight</span>
                <span className="text-primary">.</span>
              </span>
            }
            description="SSC CGL Tier 2 · Mock tracker"
            trigger={MOBILE_NAV_TRIGGER}
          >
            {({ close }) => (
              <nav aria-label="Landing sections">
                <ul className="flex flex-col">
                  {[...NAV, { href: "#faq", label: "Questions" }].map((item) => (
                    <li key={item.href} className="border-b border-border">
                      <a
                        href={item.href}
                        onClick={close}
                        className="block py-3.5 font-serif text-lg tracking-[-0.02em] text-foreground"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>

                <p className="mt-8 pt-6 text-xs leading-relaxed text-muted-foreground">
                  A private tracker for SSC CGL Tier 2. One account, one
                  workspace, and a JSON export whenever you want out.
                </p>
              </nav>
            )}
          </Sheet>
        </div>
      </div>

      {/* Reading progress: a 2px rule the width of the page. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[2px] overflow-hidden"
      >
        <div
          className="h-full origin-left bg-primary transition-transform duration-150 ease-out"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
    </header>
  );
}
