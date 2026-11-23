import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";
import {
  DEFAULT_PALETTE,
  DEFAULT_STYLE,
  PALETTE_STORAGE_KEY,
  PALETTES,
  STYLE_STORAGE_KEY,
  STYLES,
  THEME_PREFS_SCRIPT,
  microMotion,
  normalizePalette,
  normalizeStyle,
  viewTransition,
} from "../src/lib/theme-style";

type PrepaintOptions = {
  storage?: Record<string, string>;
  getItemThrows?: boolean;
  setItemThrows?: boolean;
};

function runPrepaint({
  storage: initialStorage = {},
  getItemThrows = false,
  setItemThrows = false,
}: PrepaintOptions = {}) {
  const dataset: Record<string, string> = {};
  const storage = new Map(Object.entries(initialStorage));
  const writes: Array<[string, string]> = [];

  vm.runInNewContext(THEME_PREFS_SCRIPT, {
    document: { documentElement: { dataset } },
    localStorage: {
      getItem(key: string) {
        if (getItemThrows) throw new Error("getItem unavailable");
        return storage.get(key) ?? null;
      },
      setItem(key: string, value: string) {
        if (setItemThrows) throw new Error("setItem unavailable");
        storage.set(key, value);
        writes.push([key, value]);
      },
    },
  });

  return { dataset, storage, writes };
}

const globalsCss = readFileSync(
  new URL("../src/app/globals.css", import.meta.url),
  "utf8",
);

function customPropertiesFor(selector: string) {
  const selectorStart = globalsCss.indexOf(`${selector} {`);
  assert.notEqual(selectorStart, -1, `missing ${selector} block`);

  const blockStart = globalsCss.indexOf("{", selectorStart) + 1;
  const blockEnd = globalsCss.indexOf("\n}", blockStart);
  assert.notEqual(blockEnd, -1, `unterminated ${selector} block`);

  return new Map(
    Array.from(
      globalsCss.slice(blockStart, blockEnd).matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g),
      ([, property, value]) => [property, value.trim()],
    ),
  );
}

const ROOT_MIRA_CONTRACT = {
  "--radius-control": "0.5rem",
  "--radius-card": "0.625rem",
  "--radius-panel": "0.75rem",
  "--radius-floating": "0.75rem",
  "--radius-segment": "0.5rem",
  "--radius-pill": "999rem",
  "--panel-border-width": "1px",
  "--panel-border-color": "var(--rule-soft)",
  "--stat-rule-width": "1px",
  "--control-pad-y": "0.5rem",
  "--control-pad-x": "0.75rem",
  "--control-height": "2.25rem",
  "--control-height-sm": "2rem",
  "--table-cell-pad-y": "0.625rem",
  "--table-cell-pad-x": "0.75rem",
  "--label-gap": "0.375rem",
  "--nav-pad-y": "0.5rem",
  "--nav-pad-x": "0.75rem",
  "--segment-pad-y": "0.375rem",
  "--segment-pad-x": "0.625rem",
  "--stat-cell-pad-y": "1rem",
  "--stat-cell-pad-x": "1.25rem",
  "--type-page-title": "clamp(1.75rem, 2.4vw, 2.25rem)",
  "--type-workspace-title": "clamp(1.5rem, 2.2vw, 1.875rem)",
  "--type-section-title": "1.25rem",
  "--type-panel-title": "1rem",
  "--type-panel-title-dense": "0.9375rem",
  "--type-metric": "clamp(1.5rem, 2.2vw, 1.875rem)",
  "--type-stat": "2.25rem",
  "--type-section-label": "0.75rem",
  "--type-body": "0.875rem",
  "--type-secondary": "0.8125rem",
  "--type-label": "0.75rem",
  "--type-segment": "0.8125rem",
  "--metric-cell-pad-y": "0.75rem",
  "--metric-cell-pad-x": "0.875rem",
  "--band-cell-pad-y": "0.875rem",
  "--band-cell-pad-x": "1rem",
  "--day-nav-size": "2rem",
  "--app-header-h": "3.25rem",
  "--tap-min": "2.75rem",
  "--sidebar-row-h": "2rem",
  "--sidebar-row-h-lg": "2.5rem",
  "--sidebar-header-pad-y": "0.5rem",
  "--dur-quick": "140ms",
  "--dur-enter": "180ms",
  "--dur-view": "200ms",
  "--focus-ring": "var(--accent)",
  "--focus-keyline": "var(--paper)",
} as const;

const SERA_CONTRACT = {
  "--radius-control": "0",
  "--radius-card": "0",
  "--radius-panel": "0",
  "--radius-floating": "0",
  "--radius-segment": "0",
  "--radius-pill": "0",
  "--panel-border-width": "2px",
  "--panel-border-color": "var(--ink)",
  "--stat-rule-width": "2px",
  "--elev-pop": "0.25rem 0.25rem 0 0 var(--ink)",
  "--dur-quick": "100ms",
  "--dur-enter": "140ms",
  "--dur-view": "160ms",
  "--ease-out-soft": "cubic-bezier(0.2, 0.9, 0.25, 1)",
  "--focus-ring": "var(--ink)",
  "--focus-keyline": "var(--paper)",
  "--sidebar-rule-w": "2px",
  "--sidebar-rule-color": "var(--ink)",
  "--landing-lift": "0.375rem 0.375rem 0 0 var(--ink)",
} as const;

test("globals CSS makes the root the complete Mira contract with no Vega", () => {
  assert.doesNotMatch(globalsCss, /\bvega\b/i);

  const rootProperties = customPropertiesFor(":root");
  for (const [property, value] of Object.entries(ROOT_MIRA_CONTRACT)) {
    assert.equal(rootProperties.get(property), value, property);
  }
});

test("globals CSS keeps Sera as the sole exact style token override", () => {
  assert.doesNotMatch(globalsCss, /\[data-style=(["'])mira\1\]/i);

  const styleTokenBlocks = Array.from(
    globalsCss.matchAll(/^\s*\[data-style=(["'])([^"']+)\1\]\s*\{/gim),
    ([, , style]) => style,
  );
  assert.deepEqual(styleTokenBlocks, ["sera"]);

  const seraProperties = customPropertiesFor('[data-style="sera"]');
  assert.deepEqual(Object.fromEntries(seraProperties), SERA_CONTRACT);

  for (const property of [
    "--control-height",
    "--control-height-sm",
    "--control-pad-y",
    "--control-pad-x",
    "--table-cell-pad-y",
    "--table-cell-pad-x",
    "--type-body",
    "--type-secondary",
    "--type-label",
    "--type-segment",
    "--tap-min",
  ]) {
    assert.equal(seraProperties.has(property), false, property);
  }
});

test("globals CSS keeps all style selectors before phone touch density", () => {
  const seraIndex = globalsCss.indexOf('[data-style="sera"] {');
  const phoneIndex = globalsCss.indexOf("Phone touch density");

  assert.ok(seraIndex >= 0 && seraIndex < phoneIndex);
  assert.doesNotMatch(globalsCss.slice(phoneIndex), /\[data-style=/i);
});

test("globals CSS keeps segment text legible and uses the segment radius", () => {
  assert.doesNotMatch(globalsCss, /font-size:\s*0\.7188rem/i);
  assert.match(
    globalsCss,
    /\.segment-group\s*\{[\s\S]*?border-radius:\s*var\(--radius-segment\);/,
  );
  assert.match(
    globalsCss,
    /\.segment\s*\{[\s\S]*?border-radius:\s*var\(--radius-segment\);[\s\S]*?font-size:\s*var\(--type-segment\);/,
  );
});

test("globals CSS provides contrast-keyed and forced-colors focus rings", () => {
  assert.match(
    globalsCss,
    /:focus-visible\s*\{[\s\S]*?outline:\s*2px solid var\(--focus-ring\);[\s\S]*?outline-offset:\s*2px;[\s\S]*?box-shadow:\s*0 0 0 1px var\(--focus-keyline\);/,
  );
  assert.match(
    globalsCss,
    /@media\s*\(forced-colors:\s*active\)\s*\{[\s\S]*?:focus-visible[\s\S]*?outline-color:\s*(?:CanvasText|Highlight|LinkText|ButtonText);[\s\S]*?box-shadow:\s*none;/i,
  );
  assert.doesNotMatch(globalsCss, /@import[^;]*tw-animate-css/i);
});

test("globals CSS preserves rem-based phone field and touch floors", () => {
  const phoneIndex = globalsCss.indexOf("Phone touch density");
  const phoneEnd = globalsCss.indexOf("Page-level action rows", phoneIndex);
  const phoneCss = globalsCss.slice(phoneIndex, phoneEnd);

  for (const property of [
    "--control-height",
    "--control-height-sm",
    "--day-nav-size",
    "--tap-min",
  ]) {
    assert.match(phoneCss, new RegExp(`${property}:\\s*2\\.75rem;`), property);
  }
  for (const property of [
    "--control-pad-y",
    "--control-pad-x",
    "--segment-pad-y",
    "--segment-pad-x",
  ]) {
    assert.match(phoneCss, new RegExp(`${property}:\\s*[0-9.]+rem;`), property);
  }
  assert.match(
    globalsCss,
    /input:not\(\[type="checkbox"\]\)[\s\S]*?textarea\s*\{\s*font-size:\s*1rem;/,
  );
});

test("exports the exact ordered two-style and six-palette choices", () => {
  assert.deepEqual(
    STYLES.map(({ id, label }) => ({ id, label })),
    [
      { id: "mira", label: "Mira · Refined" },
      { id: "sera", label: "Sera · Brutal" },
    ],
  );
  assert.deepEqual(
    PALETTES.map(({ id }) => id),
    ["orange", "blue", "lime", "violet", "rose", "graphite"],
  );
});

test("normalizes palette values to the six valid IDs or orange", () => {
  for (const id of [
    "orange",
    "blue",
    "lime",
    "violet",
    "rose",
    "graphite",
  ] as const) {
    assert.equal(normalizePalette(id), id);
  }

  for (const value of [null, undefined, "unknown", "", 0, {}, []]) {
    assert.equal(normalizePalette(value), DEFAULT_PALETTE);
  }
});

test("normalizes style values to Mira or Sera and migrates legacy Vega", () => {
  assert.equal(normalizeStyle("mira"), "mira");
  assert.equal(normalizeStyle("sera"), "sera");

  for (const value of [null, undefined, "unknown", "", "vega", 0, {}, []]) {
    assert.equal(normalizeStyle(value), DEFAULT_STYLE);
  }
});

test("prepaint defaults empty storage to orange and Mira and persists Mira", () => {
  const result = runPrepaint();

  assert.deepEqual(result.dataset, { palette: "orange", style: "mira" });
  assert.equal(result.storage.get(STYLE_STORAGE_KEY), "mira");
  assert.deepEqual(result.writes, [[STYLE_STORAGE_KEY, "mira"]]);
});

test("prepaint preserves valid blue and Sera preferences", () => {
  const result = runPrepaint({
    storage: {
      [PALETTE_STORAGE_KEY]: "blue",
      [STYLE_STORAGE_KEY]: "sera",
    },
  });

  assert.deepEqual(result.dataset, { palette: "blue", style: "sera" });
  assert.deepEqual(result.writes, []);
});

test("prepaint migrates legacy Vega and invalid styles to persisted Mira", () => {
  for (const style of ["vega", "future-style"]) {
    const result = runPrepaint({
      storage: { [STYLE_STORAGE_KEY]: style },
    });

    assert.equal(result.dataset.style, "mira", style);
    assert.equal(result.storage.get(STYLE_STORAGE_KEY), "mira", style);
    assert.deepEqual(result.writes, [[STYLE_STORAGE_KEY, "mira"]], style);
  }
});

test("prepaint normalizes an invalid palette to orange", () => {
  const result = runPrepaint({
    storage: {
      [PALETTE_STORAGE_KEY]: "chartreuse",
      [STYLE_STORAGE_KEY]: "sera",
    },
  });

  assert.deepEqual(result.dataset, { palette: "orange", style: "sera" });
});

test("prepaint still assigns both datasets when storage reads throw", () => {
  const result = runPrepaint({ getItemThrows: true });

  assert.deepEqual(result.dataset, { palette: "orange", style: "mira" });
});

test("prepaint still assigns both datasets when migration writes throw", () => {
  const result = runPrepaint({ setItemThrows: true });

  assert.deepEqual(result.dataset, { palette: "orange", style: "mira" });
});

test("returns the exact exhaustive motion mappings", () => {
  assert.deepEqual(viewTransition("mira"), {
    duration: 0.2,
    ease: "easeOut",
  });
  assert.deepEqual(viewTransition("sera"), {
    duration: 0.16,
    ease: "circOut",
  });
  assert.deepEqual(microMotion("mira"), {
    duration: 0.18,
    ease: "easeOut",
  });
  assert.deepEqual(microMotion("sera"), {
    duration: 0.14,
    ease: "circOut",
  });
});
