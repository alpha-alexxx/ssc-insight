import assert from "node:assert/strict";
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
