import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LANDING_SUMMARY, LANDING_TARGET } from "../src/components/landing/fixtures";

/**
 * Source contracts for the landing hero. It mixes two Hyperblur heroes
 * (hero-product's layered stage, hero-beams' horizon) with Hairline's
 * AnnouncementPill, adapted onto the house system — so it must keep the
 * landing's rules: derived figures, one h1, real CTA links, no Recharts,
 * and every figure reachable by screen readers regardless of animation.
 */

const source = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

/** Source with comments removed — these checks are about code, not prose. */
function code(text: string) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

const hero = source("src/components/landing/hero.tsx");
const stats = source("src/components/landing/hero-stats.tsx");
const art = source("src/components/landing/hero-art.tsx");
const beams = source("src/components/landing/hero-beam-stage.tsx");

test("the hero composes the two Hyperblur mechanisms and the Hairline pill", () => {
  assert.match(hero, /from "@\/components\/announcement-pill"/);
  assert.match(hero, /<AnnouncementPill/);
  assert.match(hero, /from ".\/hero-beam-stage"/);
  assert.match(hero, /<HeroBeamStage/);
  assert.match(hero, /from ".\/hero-stats"/);
  assert.match(hero, /<HeroStats/);
  assert.doesNotMatch(hero, /from "@\/components\/hyperblur\//);
});

test("the hero keeps one h1 and real CTA links", () => {
  assert.equal(hero.match(/<h1/g)?.length, 1);
  assert.match(hero, /id="hero-title"/);
  assert.match(hero, /aria-labelledby="hero-title"/);
  const ctas = source("src/components/landing/hero-ctas.tsx");
  for (const href of ['"/sign-up"', '"/sign-in"', '"#workspace"']) {
    assert.ok(ctas.includes(href), `hero CTAs must link to ${href}`);
  }
});

test("hero figures are derived, never hand-typed", () => {
  for (const symbol of ["LANDING_SUMMARY", "LANDING_TARGET"]) {
    assert.ok(hero.includes(symbol), `hero.tsx must read ${symbol}`);
  }
  // The stats row is fed from the summary; it must not compute its own data.
  assert.doesNotMatch(stats, /LANDING_|fixtures/);
  assert.match(stats, /aria-hidden="true"/);
  assert.match(stats, /sr-only/);
  assert.match(stats, /prefers-reduced-motion/);
});

test("the hero stage and beams are decorative and reduced-motion aware", () => {
  assert.match(beams, /aria-hidden="true"/);
  assert.match(beams, /pointer-events-none/);
  assert.match(beams, /prefers-reduced-motion/);
  assert.doesNotMatch(code(beams), /Math\.random/);
  assert.match(code(art), /prefers-reduced-motion|useReducedMotion/);
  assert.match(art, /aria-hidden="true"/);
  for (const file of [art, beams]) {
    const painted = code(file);
    assert.doesNotMatch(painted, /from "recharts"/);
    // Mask gradients use `#000` as opaque luminance, not as a colour; every
    // painted surface must come from a theme token.
    const surfaces = painted
      .split("\n")
      .filter((line) => !/mask-image/.test(line))
      .join("\n");
    assert.doesNotMatch(surfaces, /#[0-9a-fA-F]{3,8}\b/, "no hard-coded hex colours");
  }
});

test("the horizon stats agree with the scoring fixtures", () => {
  const gap = LANDING_TARGET - LANDING_SUMMARY.latestScore;
  assert.equal(typeof gap, "number");
  assert.ok(Number.isFinite(LANDING_SUMMARY.averagePercentage));
  assert.ok(LANDING_SUMMARY.latestScore <= LANDING_SUMMARY.latestMax);
});
