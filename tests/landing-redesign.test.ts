import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { totals } from "../src/lib/domain";
import { LANDING_FULL_MOCKS, LANDING_SCOPES } from "../src/components/landing/fixtures";
import { buildLandingPlan } from "../src/components/landing/plan-facts";
import planJson from "../src/data/study-plan.json";
import { studyPlanSchema } from "../src/lib/plan/schema";
import {
  buildLandingSectionData,
  buildLandingStats,
  LANDING_COMPARISON,
  LANDING_DEVICES,
  LANDING_FEATURES,
  LANDING_REVIEW_NOTE,
  LANDING_REVIEWS,
} from "../src/components/landing/section-data";

const source = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const planSource = studyPlanSchema.parse(planJson);
const plan = buildLandingPlan(planSource.daily_targets, planSource.phases);
const data = buildLandingSectionData(plan);

test("the landing composes every requested registry mechanism below the unchanged hero", () => {
  const page = source("src/components/landing/index.tsx");
  const sections = source("src/components/landing/redesigned-sections.tsx");
  assert.match(page, /<Hero /);
  assert.match(page, /<RedesignedSections /);
  assert.match(page, /<PrivacySection /);
  assert.match(page, /<FaqSection /);
  assert.match(page, /<CtaBanner\b/);
  assert.match(page, /<LandingFooter /);
  assert.ok(page.indexOf("<PrivacySection") < page.indexOf("<FaqSection"));
  assert.ok(page.indexOf("<FaqSection") < page.indexOf("<CtaBanner"));
  assert.ok(page.indexOf("<CtaBanner") < page.indexOf("<LandingFooter"));
  assert.doesNotMatch(page, /LedgerFacts|FilmSection|Plate|Showcase/);
  for (const component of ["ShowcaseDeviceGallery", "FeaturesLiveTabs", "BentoLiveWidgets", "FeaturesOrbit", "StatsCounters", "ComparisonVersus", "ProofTiltedWall", "DiamondGrid", "NoiseField"]) {
    assert.ok(sections.includes(`<${component}`), `missing ${component}`);
  }
  const footer = source("src/components/landing/footer.tsx");
  assert.match(footer, /<FlutedFooter/);
  assert.match(footer, /The paper-and-plan facts, kept as the small print/);
  assert.equal(source("src/components/landing/hero.tsx"), readFileSync(new URL("../src/components/landing/hero.tsx", import.meta.url), "utf8"));
});

test("the device tour is exactly phone, tablet and computer", () => {
  assert.deepEqual(LANDING_DEVICES.map((device) => device.id), ["phone", "tablet", "laptop"]);
  assert.equal(LANDING_DEVICES.at(-1)?.label, "Computer");
  const gallery = source("src/components/hyperblur/showcase-device-gallery.tsx");
  assert.match(gallery, /screens\?: Partial<Record<DeviceGalleryKind, React.ReactNode>>/);
  assert.match(gallery, /--device-count/);
  const sections = source("src/components/landing/redesigned-sections.tsx");
  assert.doesNotMatch(sections, /watch|Wander|Kyoto/);
});

test("the four scope tabs use the real projection counts", () => {
  assert.deepEqual(LANDING_FEATURES.map((item) => item.scene), ["full", "subject", "sectional", "all"]);
  for (const item of LANDING_FEATURES) {
    assert.equal(item.stat, `${LANDING_SCOPES[item.scene].pointCount} analytical points`);
    assert.equal(data.scopePreviews[item.scene].pointCount, LANDING_SCOPES[item.scene].pointCount);
    assert.equal(data.scopePreviews[item.scene].points.length, LANDING_SCOPES[item.scene].pointCount);
  }
  assert.doesNotMatch(source("src/components/landing/redesigned-sections.tsx"), /from "recharts"/);
});

test("counter values and trends are derived from product and plan rows", () => {
  const stats = buildLandingStats(plan);
  assert.equal(stats.length, 4);
  assert.deepEqual(stats.map((stat) => stat.value), [390, 4, plan.days.length, plan.taskCount]);
  assert.deepEqual(stats[0].trend?.length, LANDING_FULL_MOCKS.length);
  assert.deepEqual(stats[1].trend, Object.values(LANDING_SCOPES).map((scope) => scope.pointCount));
  assert.deepEqual(stats[2].trend?.at(-1), 100);
  assert.equal(stats[3].trend?.length, plan.days.length);
  assert.equal(stats[3].trend?.reduce((sum, count) => sum + count, 0), plan.taskCount);
});

test("comparison uses the last two full mocks and real totals", () => {
  const earlier = LANDING_FULL_MOCKS.at(-2)!;
  const latest = LANDING_FULL_MOCKS.at(-1)!;
  assert.equal(LANDING_COMPARISON.before.title, earlier.name);
  assert.equal(LANDING_COMPARISON.after.title, latest.name);
  const score = LANDING_COMPARISON.metrics.find((metric) => metric.label === "Score")!;
  assert.equal(score.before, `${totals(earlier).score} / ${totals(latest).maxScore}`);
  assert.equal(score.after, `${totals(latest).score} / ${totals(latest).maxScore}`);
  assert.equal(LANDING_COMPARISON.metrics.length, 5);
  assert.match(LANDING_COMPARISON.note, /not evidence/);
});

test("proof cards are disclosed fictional workflows, never customer claims", () => {
  assert.equal(LANDING_REVIEWS.length, 12);
  assert.match(LANDING_REVIEW_NOTE, /not customer testimonials/);
  for (const [index, review] of LANDING_REVIEWS.entries()) {
    assert.equal(review.name, `Scenario ${String(index + 1).padStart(2, "0")}`);
    assert.match(review.role, /Fictional workflow/);
    assert.ok(review.highlight && review.quote.includes(review.highlight), `missing highlight in scenario ${index + 1}`);
    assert.equal(review.rating, undefined);
  }
  const sections = source("src/components/landing/redesigned-sections.tsx");
  assert.match(sections, /score=""/);
  assert.match(sections, /cta=\{null\}/);
  assert.match(source("src/components/landing/index.tsx"), /authAvailable=\{authAvailable\}/);
  assert.match(source("src/components/hyperblur/proof-tilted-wall.tsx"), /r.rating == null \? 0/);
});

test("interactive blocks expose pause, reduced motion and honest auth behavior", () => {
  for (const [path, label] of [
    ["features-live-tabs.tsx", "Pause tour"],
    ["showcase-device-gallery.tsx", "Pause tour"],
    ["features-orbit.tsx", "Pause orbit"],
    ["proof-tilted-wall.tsx", "Pause wall"],
  ] as const) {
    const text = source(`src/components/hyperblur/${path}`);
    assert.ok(text.includes(label), `${path} lost ${label}`);
    assert.match(text, /prefers-reduced-motion/);
  }
  assert.match(source("src/components/hyperblur/cta-banner.tsx"), /Sign-in unavailable/);
  for (const path of ["diamond-grid.tsx", "noise-field.tsx"]) {
    const text = source(`src/components/aicanvas/${path}`);
    assert.match(text, /IntersectionObserver/);
    assert.match(text, /MutationObserver/);
    assert.match(text, /visibilitychange/);
    assert.match(text, /pointer-events-none/);
    assert.match(text, /prefers-reduced-motion/);
  }
});
