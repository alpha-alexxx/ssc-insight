"use client";

import * as React from "react";

export interface HeroBeamStageProps {
  /** Number of falling beams (clamped to 0–48). */
  beams?: number;
  /** Deterministic seed for the lane layout. */
  seed?: number;
  /** Render the very faint masked grid layer. */
  grid?: boolean;
}

/**
 * Deterministic lane generator — same seed always yields the same layout,
 * so the server render and the client hydration agree (never Math.random()).
 */
function hash(seed: number, i: number) {
  let x = (Math.imul(i + 1, 0x9e3779b1) ^ Math.imul((seed | 0) + 3, 0x85ebca6b)) >>> 0;
  x = Math.imul((x >>> 16) ^ x, 0x45d9f3b) >>> 0;
  x = Math.imul((x >>> 16) ^ x, 0x45d9f3b) >>> 0;
  x = ((x >>> 16) ^ x) >>> 0;
  return x / 4294967296;
}

const css = `
.lh-hbs {
  --lh-hbs-ink: var(--primary);
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  container-type: inline-size;
}
.lh-hbs-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(color-mix(in srgb, var(--border) 55%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--border) 55%, transparent) 1px, transparent 1px);
  background-size: 64px 64px;
  opacity: .5;
  -webkit-mask-image: radial-gradient(80% 70% at 50% 38%, #000 0%, transparent 72%);
  mask-image: radial-gradient(80% 70% at 50% 38%, #000 0%, transparent 72%);
}
.lh-hbs-stage {
  position: absolute;
  inset: 0;
  -webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 46%, transparent 66%);
  mask-image: linear-gradient(to bottom, #000 0%, #000 46%, transparent 66%);
}
.lh-hbs-rail {
  position: absolute;
  top: 0;
  bottom: 0;
  left: var(--lh-hbs-x);
  width: 1px;
  background: linear-gradient(
    to bottom,
    transparent,
    color-mix(in srgb, var(--border) 70%, transparent) 25%,
    color-mix(in srgb, var(--border) 70%, transparent) 75%,
    transparent
  );
  opacity: .55;
}
.lh-hbs-beam {
  position: absolute;
  top: 0;
  left: var(--lh-hbs-x);
  width: var(--lh-hbs-w, 1px);
  height: 100%;
  margin-left: calc(var(--lh-hbs-w, 1px) / -2 + .5px);
  background: linear-gradient(
    to bottom,
    transparent calc(100% - var(--lh-hbs-len)),
    color-mix(in srgb, var(--lh-hbs-ink) 70%, transparent) calc(100% - 14px),
    color-mix(in srgb, var(--lh-hbs-ink) 100%, transparent) 100%
  );
  opacity: 0;
  animation: lh-hbs-fall var(--lh-hbs-d) cubic-bezier(.45, 0, .7, 1) var(--lh-hbs-dl) infinite;
  will-change: transform, opacity;
}
.lh-hbs-beam::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 50%;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--lh-hbs-ink) 85%, transparent);
  transform: translateX(-50%);
}
@keyframes lh-hbs-fall {
  0% { transform: translate3d(0, -100%, 0); opacity: 0; }
  12% { opacity: var(--lh-hbs-o); }
  80% { opacity: var(--lh-hbs-o); }
  100% { transform: translate3d(0, 4%, 0); opacity: 0; }
}
.lh-hbs-horizon {
  position: absolute;
  left: 50%;
  bottom: calc(min(1100px, 120cqi) / -2);
  width: min(1100px, 120cqi);
  aspect-ratio: 1;
  border-radius: 50%;
  transform: translateX(-50%);
  box-shadow: inset 0 1.5px 0 color-mix(in srgb, var(--lh-hbs-ink) 35%, transparent);
}
.lh-hbs-glow {
  position: absolute;
  inset: 1px;
  border-radius: 50%;
  background: radial-gradient(
    closest-side,
    color-mix(in srgb, var(--lh-hbs-ink) 22%, transparent),
    transparent 70%
  );
  opacity: .6;
  animation: lh-hbs-breathe 6s ease-in-out infinite;
}
@keyframes lh-hbs-breathe {
  0%, 100% { opacity: .5; }
  50% { opacity: .85; }
}
/* Glow bloom only on ink themes; paper keeps a crisp thin rule. */
.dark .lh-hbs-horizon {
  box-shadow:
    inset 0 1.5px 0 color-mix(in srgb, var(--lh-hbs-ink) 45%, transparent),
    inset 0 22px 50px -24px color-mix(in srgb, var(--lh-hbs-ink) 30%, transparent),
    0 -2px 14px color-mix(in srgb, var(--lh-hbs-ink) 25%, transparent);
}
.dark .lh-hbs-beam::after {
  box-shadow: 0 0 6px 1px color-mix(in srgb, var(--lh-hbs-ink) 45%, transparent);
}
@media (prefers-color-scheme: dark) {
  .lh-hbs-horizon {
    box-shadow:
      inset 0 1.5px 0 color-mix(in srgb, var(--lh-hbs-ink) 45%, transparent),
      inset 0 22px 50px -24px color-mix(in srgb, var(--lh-hbs-ink) 30%, transparent),
      0 -2px 14px color-mix(in srgb, var(--lh-hbs-ink) 25%, transparent);
  }
  .lh-hbs-beam::after {
    box-shadow: 0 0 6px 1px color-mix(in srgb, var(--lh-hbs-ink) 45%, transparent);
  }
}
@media (prefers-reduced-motion: reduce) {
  .lh-hbs-beam,
  .lh-hbs-glow {
    animation: none;
  }
  .lh-hbs-beam {
    opacity: var(--lh-hbs-o);
    transform: translate3d(0, var(--lh-hbs-rest), 0);
  }
  .lh-hbs-glow {
    opacity: .6;
  }
}
`;

/** One deterministic lane per beam. */
function lanesFor(beams: number, seed: number) {
  const count = Math.max(0, Math.min(48, Math.floor(beams)));
  return Array.from({ length: count }, (_, i) => {
    const jitter = (hash(seed, i * 5 + 1) - 0.5) * (70 / Math.max(1, count));
    const x = Math.min(98, Math.max(2, ((i + 0.5) / Math.max(1, count)) * 100 + jitter));
    const center = 1 - Math.abs(x - 50) / 50;
    return {
      x: x.toFixed(2),
      d: (5 + hash(seed, i * 5 + 2) * 5).toFixed(2),
      dl: (-hash(seed, i * 5 + 3) * 10).toFixed(2),
      len: Math.round(70 + hash(seed, i * 5 + 4) * 150),
      // 0.10–0.35, slightly stronger toward the centre.
      o: (0.1 + center * 0.15 + hash(seed, i * 5 + 5) * 0.1).toFixed(2),
      w: hash(seed, i * 5 + 6) > 0.72 ? 2 : 1,
      rest: (-20 - hash(seed, i * 5 + 7) * 60).toFixed(1),
    };
  });
}

/**
 * Decorative landing-hero background: thin primary-tinted beams falling
 * behind the copy, above a horizon arc. Purely presentational.
 */
export function HeroBeamStage({ beams = 14, seed = 4, grid = true }: HeroBeamStageProps) {
  const lanes = lanesFor(beams, seed);

  return (
    <div className="lh-hbs absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <style href="lh-hero-beams" precedence="default">{css}</style>
      {grid ? <div className="lh-hbs-grid" /> : null}
      <div className="lh-hbs-stage">
        {lanes.map((lane) => (
          <React.Fragment key={`${lane.x}-${lane.d}`}>
            <span className="lh-hbs-rail" style={{ "--lh-hbs-x": `${lane.x}%` } as React.CSSProperties} />
            <span
              className="lh-hbs-beam"
              style={
                {
                  "--lh-hbs-x": `${lane.x}%`,
                  "--lh-hbs-d": `${lane.d}s`,
                  "--lh-hbs-dl": `${lane.dl}s`,
                  "--lh-hbs-len": `${lane.len}px`,
                  "--lh-hbs-o": lane.o,
                  "--lh-hbs-w": `${lane.w}px`,
                  "--lh-hbs-rest": `${lane.rest}%`,
                } as React.CSSProperties
              }
            />
          </React.Fragment>
        ))}
      </div>
      <div className="lh-hbs-horizon">
        <div className="lh-hbs-glow" />
      </div>
    </div>
  );
}
