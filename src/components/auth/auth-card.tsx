"use client";

import * as React from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * The task surface, adapted from Hyperblur's `auth-tilt-spotlight` card.
 *
 * What survives from the original: the pointer tilt, the rotating conic
 * frame, and the spotlight that follows the cursor. What changes: every
 * colour is a semantic token (the original hard-codes violet on near-black),
 * the tilt is 3° rather than 9° (this is a form to fill in, not a showcase),
 * and the surface is the house paper card — inset hairline, no drop shadow.
 *
 * Motion rules:
 *  - one `onPointerMove` writes `--lh-auth-*` variables through `setProperty`;
 *    no React state, so nothing re-renders per frame (the `hero-art` rig
 *    pattern);
 *  - tilt only for a real mouse, never on touch or under reduced motion;
 *  - the conic frame only spins on devices with a hovering pointer, and is
 *    static under reduced motion — its `@property` registration lives here so
 *    the angle can actually animate.
 *
 * The card is `aria-hidden`-decorated only in its layers; the form inside is
 * untouched. `overflow-hidden` on the surface clips the spotlight, never the
 * focus rings (they sit inside the content padding).
 */

const css = `
@property --lh-auth-angle { syntax: "<angle>"; inherits: false; initial-value: 0deg; }

.lh-auth-card {
  position: relative;
  isolation: isolate;
  width: 100%;
  border-radius: 18px;
  padding: 1px;
  --lh-auth-rx: 0deg;
  --lh-auth-ry: 0deg;
  --lh-auth-x: 50%;
  --lh-auth-y: 0%;
  --lh-auth-glow: 0;
  transform: rotateX(var(--lh-auth-rx)) rotateY(var(--lh-auth-ry));
  transition: transform 520ms var(--ease-out-soft, cubic-bezier(.22, 1, .36, 1));
}
.lh-auth-card[data-live="true"] {
  transition: transform 120ms linear;
}
.lh-auth-card::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  background: conic-gradient(
    from var(--lh-auth-angle),
    transparent 0deg,
    color-mix(in oklab, var(--primary) 46%, transparent) 44deg,
    transparent 118deg,
    transparent 182deg,
    color-mix(in oklab, var(--warning) 32%, transparent) 226deg,
    transparent 304deg
  );
}
@media (hover: hover) and (pointer: fine) {
  .lh-auth-card::before {
    animation: lh-auth-orbit 14s linear infinite;
  }
}
@keyframes lh-auth-orbit {
  to { --lh-auth-angle: 360deg; }
}
.lh-auth-card__surface {
  position: relative;
  z-index: 1;
  overflow: hidden;
  border-radius: 17px;
  background: var(--card);
  color: var(--card-foreground);
  box-shadow: inset 0 0 0 1px var(--border);
}
.lh-auth-card__glow {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  border-radius: inherit;
  opacity: var(--lh-auth-glow);
  background: radial-gradient(
    240px circle at var(--lh-auth-x) var(--lh-auth-y),
    color-mix(in oklab, var(--primary) 13%, transparent),
    transparent 72%
  );
  transition: opacity 400ms var(--ease-out-soft, cubic-bezier(.22, 1, .36, 1));
}
.lh-auth-check-path {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: lh-auth-draw 420ms 180ms cubic-bezier(.65, 0, .35, 1) forwards;
}
@keyframes lh-auth-draw {
  to { stroke-dashoffset: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .lh-auth-card { transform: none; transition: none; }
  .lh-auth-card::before { animation: none; }
  .lh-auth-card__glow { display: none; }
  .lh-auth-check-path { animation: none; stroke-dashoffset: 0; }
}
`;

/** The tilt leaves the pointer a shallow rotation, never a spin. */
const TILT_DEGREES = 3;

export function AuthCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || reduced || event.pointerType !== "mouse") return;
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    el.style.setProperty("--lh-auth-x", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--lh-auth-y", `${(py * 100).toFixed(1)}%`);
    el.style.setProperty("--lh-auth-glow", "1");
    el.style.setProperty(
      "--lh-auth-rx",
      `${((0.5 - py) * TILT_DEGREES).toFixed(2)}deg`,
    );
    el.style.setProperty(
      "--lh-auth-ry",
      `${((px - 0.5) * TILT_DEGREES).toFixed(2)}deg`,
    );
    el.dataset.live = "true";
  }

  function onPointerLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--lh-auth-rx", "0deg");
    el.style.setProperty("--lh-auth-ry", "0deg");
    el.style.setProperty("--lh-auth-glow", "0");
    el.dataset.live = "false";
  }

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={cn("lh-auth-card", className)}
    >
      <style href="lh-auth-card" precedence="default">
        {css}
      </style>
      <div className="lh-auth-card__surface flex h-full flex-col">
        {/* The spotlight paints under the content, over the paper. */}
        <span aria-hidden="true" className="lh-auth-card__glow" />
        {/* The card owns no padding of its own: the step that fills it pads
            itself, so Afterglow can wrap the whole surface and the light
            keeps the card's rounded shape instead of a rectangle inside it. */}
        <div className="relative z-[1] flex flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
