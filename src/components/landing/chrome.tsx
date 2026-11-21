"use client";

import { useEffect, useState } from "react";
import { startGoogleSignIn } from "@/lib/auth/sign-in";
import { cn } from "@/lib/utils";

/**
 * The landing's fixed chrome — the two things that follow you through the
 * page without ever owning it:
 *
 *  - <SectionRail/>: the numbered spine. A hair-thin scroll-progress rule
 *    with an accent fill, then the section index; the active number turns
 *    accent, its dash grows, and labels surface on hover. Scroll-spy runs on
 *    one IntersectionObserver reading the middle band of the viewport.
 *  - <FloatingAsk/>: the black pill. `/` is the only sign-in surface, so for
 *    an anonymous visitor "Ask AI" starts exactly what the hero CTA starts —
 *    the Google round trip that leads to the workspace.
 */

const RAIL_ITEMS: { id: string; no: string; label: string }[] = [
  { id: "intro", no: "00", label: "Intro" },
  { id: "workspace", no: "01", label: "Workspace" },
  { id: "film", no: "02", label: "Film" },
  { id: "scopes", no: "03", label: "Method" },
  { id: "plan", no: "04", label: "Plan" },
  { id: "compare", no: "05", label: "Proof" },
  { id: "privacy", no: "06", label: "Privacy" },
  { id: "faq", no: "07", label: "Questions" },
];

export function SectionRail() {
  const [active, setActive] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const sections = RAIL_ITEMS.map((item) =>
      document.getElementById(item.id),
    ).filter((el): el is HTMLElement => el !== null);

    // The section whose band crosses the middle 20% of the viewport wins.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 },
    );
    sections.forEach((section) => observer.observe(section));

    let frame = 0;
    function read() {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0);
    }
    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(read);
    }
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <nav
      aria-label="Section index"
      className="fixed top-1/2 right-6 z-30 hidden -translate-y-1/2 xl:block print:hidden"
    >
      <div className="flex items-stretch gap-3">
        {/* the scroll-progress rule, filled top-down in accent */}
        <div aria-hidden="true" className="relative w-px bg-rule-soft">
          <div
            className="absolute inset-x-0 top-0 h-full origin-top bg-accent transition-transform duration-150 ease-out"
            style={{ transform: `scaleY(${progress})` }}
          />
        </div>

        <ul className="flex flex-col gap-2.5">
          {RAIL_ITEMS.map((item) => {
            const isActive = active === item.id;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={isActive ? "true" : undefined}
                  className="group flex items-center justify-end gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  <span
                    className={cn(
                      "text-[0.5625rem] font-semibold uppercase tracking-[0.14em] transition-opacity duration-150",
                      isActive
                        ? "text-ink opacity-100"
                        : "text-muted opacity-0 group-hover:opacity-100",
                    )}
                  >
                    {item.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "h-px transition-all duration-200",
                      isActive ? "w-6 bg-accent" : "w-3 bg-rule group-hover:bg-ink",
                    )}
                  />
                  <span
                    className={cn(
                      "tabular-nums w-5 text-right text-[0.625rem] leading-none",
                      isActive ? "font-semibold text-accent" : "text-muted",
                    )}
                  >
                    {item.no}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

export function FloatingAsk() {
  const [starting, setStarting] = useState(false);

  return (
    <button
      type="button"
      disabled={starting}
      onClick={() => {
        setStarting(true);
        startGoogleSignIn().catch(() => setStarting(false));
      }}
      aria-label="Ask AI — signs in and opens the workspace"
      className="fixed right-5 bottom-5 z-40 inline-flex items-center gap-2.5 rounded-full bg-ink py-3.5 pr-5 pl-4 text-paper transition-transform duration-150 hover:scale-[1.03] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent print:hidden"
    >
      <span aria-hidden="true" className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75 motion-reduce:animate-none" />
        <span className="relative inline-flex size-2 rounded-full bg-accent" />
      </span>
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em]">
        Ask AI
      </span>
    </button>
  );
}
