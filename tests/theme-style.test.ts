import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";
import {
  DEFAULT_THEME,
  PALETTE_STORAGE_KEY,
  THEMES,
  THEME_PREFS_SCRIPT,
  normalizeTheme,
} from "../src/lib/theme-style";

type PrepaintOptions = {
  storage?: Record<string, string>;
  getItemThrows?: boolean;
};

function runPrepaint({
  storage: initialStorage = {},
  getItemThrows = false,
}: PrepaintOptions = {}) {
  const dataset: Record<string, string> = {};
  const storage = new Map(Object.entries(initialStorage));

  vm.runInNewContext(THEME_PREFS_SCRIPT, {
    document: { documentElement: { dataset } },
    localStorage: {
      getItem(key: string) {
        if (getItemThrows) throw new Error("getItem unavailable");
        return storage.get(key) ?? null;
      },
      setItem() {
        /* prepaint script never writes in the new contract */
      },
    },
  });
  return dataset;
}

test("default palette is graphite and needs no attribute", () => {
  assert.equal(DEFAULT_THEME, "graphite");
});

test("the six palettes carry unique ids", () => {
  const ids = THEMES.map((t) => t.id);
  assert.equal(ids.length, 6);
  assert.equal(new Set(ids).size, 6);
  for (const expected of [
    "terracotta",
    "blue",
    "lime",
    "violet",
    "rose",
    "graphite",
  ] as const) {
    assert.ok(ids.includes(expected), `${expected} must exist`);
  }
});

test("every palette declares label, description and an oklch swatch", () => {
  for (const t of THEMES) {
    assert.equal(typeof t.label, "string");
    assert.equal(typeof t.description, "string");
    assert.match(t.swatch, /^oklch\(/);
  }
});

test("normalizeTheme accepts valid ids and falls back to graphite", () => {
  for (const t of THEMES) assert.equal(normalizeTheme(t.id), t.id);
  assert.equal(normalizeTheme("orange"), DEFAULT_THEME);
  assert.equal(normalizeTheme(undefined), DEFAULT_THEME);
  assert.equal(normalizeTheme(42), DEFAULT_THEME);
});

test("prepaint sets data-theme=graphite by default", () => {
  assert.deepEqual(runPrepaint(), { theme: "graphite" });
});

test("prepaint restores a saved palette", () => {
  assert.deepEqual(
    runPrepaint({ storage: { [PALETTE_STORAGE_KEY]: "terracotta" } }),
    { theme: "terracotta" },
  );
});

test("prepaint migrates the legacy orange palette to terracotta", () => {
  assert.deepEqual(runPrepaint({ storage: { "ssc.palette": "orange" } }), {
    theme: "terracotta",
  });
});

test("prepaint ignores unknown values", () => {
  assert.deepEqual(
    runPrepaint({ storage: { [PALETTE_STORAGE_KEY]: "rainbow" } }),
    { theme: "graphite" },
  );
});

test("prepaint survives a throwing localStorage", () => {
  assert.deepEqual(runPrepaint({ getItemThrows: true }), { theme: "graphite" });
});

test("globals.css defines all six palettes in both modes", () => {
  const css = readFileSync(
    new URL("../src/app/globals.css", import.meta.url),
    "utf8",
  );
  // Graphite is the attribute-less default: :root carries light, .dark carries dark.
  assert.ok(
    /:root\s*{[^}]*--background:\s*oklch\(/.test(css),
    "graphite light block (:root)",
  );
  assert.ok(
    /\.dark\s*{[^}]*--background:\s*oklch\(/.test(css),
    "graphite dark block (.dark)",
  );
  for (const t of THEMES) {
    if (t.id === "graphite") continue;
    assert.ok(css.includes(`[data-theme="${t.id}"]`), `${t.id} light block`);
    assert.ok(
      css.includes(`.dark[data-theme="${t.id}"]`),
      `${t.id} dark block`,
    );
  }
});
