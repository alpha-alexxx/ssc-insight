import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { THEMES } from "../src/lib/theme-style";

const appearanceSource = readFileSync(
  new URL("../src/components/appearance-panel.tsx", import.meta.url),
  "utf8",
);

function importNames(modulePath: string) {
  const match = Array.from(
    appearanceSource.matchAll(
      /import\s*\{([^}]*)\}\s*from\s*["']([^"']+)["'];/g,
    ),
  ).find(([, , importedFrom]) => importedFrom === modulePath);
  assert.ok(match, `missing import from ${modulePath}`);
  return match[1]
    .split(",")
    .map((name) => name.trim().replace(/^type\s+/, ""))
    .filter(Boolean);
}

function matchCount(source: string, pattern: RegExp) {
  return Array.from(source.matchAll(pattern)).length;
}

test("Appearance consumes canonical metadata and types without widening the provider API", () => {
  assert.deepEqual(importNames("@/lib/theme-style"), [
    "THEMES",
    "ThemeId",
  ]);
  assert.deepEqual(importNames("@/components/theme-style-provider"), ["useThemePrefs"]);

  assert.equal(THEMES.length, 6);
  assert.equal(matchCount(appearanceSource, /THEMES\.map\(/g), 1);
});

test("the style axis is gone: palette only, no data-style surface", () => {
  assert.doesNotMatch(appearanceSource, /data-style|mira|sera|StyleId|setStyle/);
  assert.doesNotMatch(appearanceSource, /toggle-group|ToggleGroup/i);
});

test("palette choices route through the provider (never localStorage direct)", () => {
  assert.match(appearanceSource, /\{\s*theme,\s*setTheme\s*\}\s*=\s*useThemePrefs\(\)/);
  assert.doesNotMatch(appearanceSource, /localStorage\.setItem/);
});

test("the panel renders a radiogroup with one radio per palette", () => {
  assert.match(appearanceSource, /role="radiogroup"/);
  assert.equal(matchCount(appearanceSource, /role="radio"/g), 1);
});

test("dark mode is next-themes driven through the Hairline toggle", () => {
  assert.match(appearanceSource, /from "next-themes"/);
  assert.match(appearanceSource, /<ThemeToggle/);
});
