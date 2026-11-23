"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * The landing's fixed chrome — the two things that follow you through the
 * page without ever owning it:
 *
 *  - <SectionRail/>: the numbered spine. A hair-thin scroll-progress rule
 *    with a primary fill, then the section index; the active number turns
 *    primary, its dash grows, and labels surface on hover. Scroll-spy runs on
 *    one IntersectionObserver reading the middle band of the viewport.
 *  - <FloatingAsk/>: the primary pill. For an anonymous visitor "Ask AI" leads
 *    to the sign-in page — the one gate in front of the workspace.
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
        {/* the scroll-progress rule, filled top-down in primary */}
        <div aria-hidden="true" className="relative w-px bg-border">
          <div
            className="absolute inset-x-0 top-0 h-full origin-top bg-primary transition-transform duration-150 ease-out"
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
                  className="group flex items-center justify-end gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                >
                  <span
                    className={cn(
                      "text-[9px] font-semibold uppercase tracking-[0.14em] transition-opacity duration-150",
                      isActive
                        ? "text-foreground opacity-100"
                        : "text-muted-foreground opacity-0 group-hover:opacity-100",
                    )}
                  >
                    {item.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "h-px transition-all duration-200",
                      isActive ? "w-6 bg-primary" : "w-3 bg-border group-hover:bg-foreground",
                    )}
                  />
                  <span
                    className={cn(
                      "w-5 text-right text-[10px] leading-none tabular-nums",
                      isActive ? "font-semibold text-primary" : "text-muted-foreground",
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
  return (
    <Link
      href="/sign-in"
      aria-label="Ask AI — sign in to open the workspace"
      className="fixed right-5 bottom-5 z-40 inline-flex items-center gap-2.5 rounded-full bg-primary py-3.5 pr-5 pl-4 text-primary-foreground transition-transform duration-150 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background print:hidden"
    >
      <span aria-hidden="true" className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary-foreground opacity-60 motion-reduce:animate-none" />
        <span className="relative inline-flex size-2 rounded-full bg-primary-foreground" />
      </span>
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">
        Ask AI
      </span>
    </Link>
  );
}
