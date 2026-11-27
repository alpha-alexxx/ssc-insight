"use client";

import * as React from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * The brand side of the split, adapted from Hyperblur's `auth-split-brand`.
 *
 * The original rotates invented customer quotes over a violet drift. This
 * product is a private, single-reader tracker — there are no customers to
 * quote — so the rotating slot carries the three readings the plates already
 * derive from real data (the mock ledger, the 50-day plan, the recovery
 * surface). The mechanism is kept whole: a 6s rotation that pauses on hover
 * and focus, one progress hairline per reading, real dot buttons, and the
 * `aria-live` line that stops announcing while it is advancing on its own.
 *
 * The drift and the ruled grid are `primary-foreground` tints over the
 * `primary` plate, so the panel inverts correctly in every palette and mode,
 * and both freeze under reduced motion (the rotation stops too — the dots
 * still choose a reading).
 *
 * The slides arrive as server-rendered nodes from the page shell, so the
 * plate art keeps its server-only plan/fixture reads.
 */

export interface BrandSlide {
  /** The caption under the dots, e.g. "The mock ledger". */
  label: string;
  art: React.ReactNode;
}

const INTERVAL = 6000;

const css = `
@keyframes lh-auth-drift-a {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(16%, 10%, 0) scale(1.14); }
}
@keyframes lh-auth-drift-b {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1.08); }
  50% { transform: translate3d(-14%, -8%, 0) scale(.94); }
}
@keyframes lh-auth-fill {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
.lh-auth-drift-a { animation: lh-auth-drift-a 18s ease-in-out infinite; }
.lh-auth-drift-b { animation: lh-auth-drift-b 21s ease-in-out infinite; }
.lh-auth-dots-rail { opacity: .72; }
.lh-auth-dot-inner[data-fill="true"] {
  transform-origin: left center;
  animation: lh-auth-fill var(--lh-auth-interval, 6s) linear forwards;
}
@media (prefers-reduced-motion: reduce) {
  .lh-auth-drift-a, .lh-auth-drift-b, .lh-auth-dot-inner[data-fill="true"] {
    animation: none;
  }
  .lh-auth-dot-inner[data-fill="true"] { transform: scaleX(1); }
}
`;

export function BrandPanel({
  eyebrow,
  slides,
  className,
}: {
  eyebrow: string;
  slides: BrandSlide[];
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const count = slides.length;
  const auto = !reduced && !paused && count > 1;

  React.useEffect(() => {
    if (!auto) return;
    const id = window.setInterval(
      () => setIndex((current) => (current + 1) % count),
      INTERVAL,
    );
    return () => window.clearInterval(id);
  }, [auto, count]);

  const active = Math.min(index, Math.max(0, count - 1));

  return (
    <aside
      aria-label="What this workspace reads"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      data-paused={paused ? "true" : undefined}
      style={{ "--lh-auth-interval": `${INTERVAL}ms` } as React.CSSProperties}
      className={cn(
        "relative isolate flex-col overflow-hidden bg-primary text-primary-foreground",
        className,
      )}
    >
      <style href="lh-auth-brand" precedence="default">
        {css}
      </style>

      {/* The drifting wash. Decorative, inert, frozen under reduced motion. */}
      <span
        aria-hidden="true"
        className="lh-auth-drift-a pointer-events-none absolute -left-[16%] -top-[20%] size-[62%] rounded-full bg-primary-foreground/12 opacity-80 blur-[70px]"
      />
      <span
        aria-hidden="true"
        className="lh-auth-drift-b pointer-events-none absolute -bottom-[20%] -right-[18%] size-[56%] rounded-full bg-warning/18 opacity-75 blur-[72px]"
      />
      {/* The ruled grid, masked away from the middle so it never fights the art. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(color-mix(in oklab, var(--primary-foreground) 9%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, var(--primary-foreground) 9%, transparent) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage:
            "radial-gradient(ellipse at 28% 16%, #000 6%, transparent 76%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 28% 16%, #000 6%, transparent 76%)",
        }}
      />

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-primary via-primary/40 to-transparent"
      />

      <div className="relative z-10 flex h-full flex-col gap-8 p-7 lg:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground/70">
          {eyebrow}
        </p>

        <div
          className="relative mt-auto grid"
          aria-roledescription="carousel"
        >
          {slides.map((slide, i) => (
            <div
              key={slide.label}
              aria-hidden={i !== active}
              inert={i !== active}
              className={cn(
                "col-start-1 row-start-1 transition-opacity duration-500 ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none",
                i === active ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              {slide.art}
            </div>
          ))}
        </div>

        <div className="flex items-end justify-between gap-6 border-t border-primary-foreground/20 pt-5">
          <p className="text-xs leading-relaxed text-primary-foreground/70">
            {slides[active]?.label}
          </p>
          {count > 1 ? (
            <span className="lh-auth-dots-rail flex shrink-0 items-center gap-1.5">
              {slides.map((slide, i) => (
                <button
                  key={slide.label}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show reading ${i + 1} of ${count}: ${slide.label}`}
                  aria-current={i === active ? "true" : undefined}
                  className="group relative grid h-6 w-7 cursor-pointer place-items-center rounded-full outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary-foreground"
                >
                  <span className="h-[3px] w-5 overflow-hidden rounded-full bg-primary-foreground/25">
                    <span
                      // Remounting on activation restarts the progress fill.
                      key={`${i}-${i === active ? "on" : "off"}`}
                      data-fill={i === active ? "true" : "false"}
                      className="lh-auth-dot-inner block h-full w-full rounded-full bg-primary-foreground"
                      style={{
                        transform: i === active ? undefined : "scaleX(0)",
                      }}
                    />
                  </span>
                </button>
              ))}
            </span>
          ) : null}
        </div>

        {/* One announcement per deliberate choice — never while rotating. */}
        <p className="sr-only" aria-live={paused ? "polite" : "off"}>
          {paused && count > 1
            ? `Reading ${active + 1} of ${count}: ${slides[active]?.label ?? ""}`
            : ""}
        </p>
      </div>
    </aside>
  );
}
