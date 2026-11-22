import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { PALETTES, STYLES } from "../src/lib/theme-style";

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

function sourceRegion(startMarker: string, endMarker: string) {
  const start = appearanceSource.indexOf(startMarker);
  assert.notEqual(start, -1, `missing start marker: ${startMarker}`);
  const end = appearanceSource.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(end, -1, `missing end marker: ${endMarker}`);
  return appearanceSource.slice(start, end);
}

function matchCount(source: string, pattern: RegExp) {
  return Array.from(source.matchAll(pattern)).length;
}

test("Appearance consumes canonical metadata and types without widening the provider API", () => {
  assert.deepEqual(importNames("@/lib/theme-style"), [
    "PALETTES",
    "STYLES",
    "PaletteId",
    "StyleId",
  ]);
  assert.deepEqual(importNames("./theme-style-provider"), ["useThemePrefs"]);

  assert.equal(PALETTES.length, 6);
  assert.deepEqual(
    STYLES.map(({ id, label }) => ({ id, label })),
    [
      { id: "mira", label: "Mira · Refined" },
      { id: "sera", label: "Sera · Brutal" },
    ],
  );
  assert.equal(matchCount(appearanceSource, /PALETTES\.map\(/g), 1);
  assert.equal(matchCount(appearanceSource, /STYLES\.map\(/g), 1);
  assert.match(appearanceSource, /<span[^>]*>\{s\.label\}<\/span>/);
  assert.doesNotMatch(appearanceSource, /Mira · Refined|Sera · Brutal/);
});

test("StyleGlyph has only exhaustive Mira and Sera previews with fixed illustrative geometry", () => {
  const glyphSource = sourceRegion(
    "function StyleGlyph",
    "export function AppearancePanel",
  );
  const miraSource = sourceRegion('case "mira":', 'case "sera":');
  const seraSource = sourceRegion('case "sera":', "const exhaustive: never = style;");

  assert.match(glyphSource, /switch\s*\(style\)/);
  assert.deepEqual(
    Array.from(glyphSource.matchAll(/case\s+["']([^"']+)["']\s*:/g), ([, id]) => id),
    ["mira", "sera"],
  );
  assert.equal(matchCount(glyphSource, /aria-hidden=["']true["']/g), 2);
  assert.doesNotMatch(glyphSource, /\bvega\b|default\s*:/i);
  assert.match(glyphSource, /const exhaustive: never = style;/);
  assert.match(glyphSource, /return exhaustive;/);

  assert.match(miraSource, /rounded-\[0\.75rem\]/);
  assert.ok(
    matchCount(miraSource, /rounded-\[0\.5rem\]/g) >= 2,
    "Mira preview must show its approved rounded inner/control geometry",
  );
  assert.match(seraSource, /rounded-none/);
  assert.match(seraSource, /border-2 border-ink/);
  assert.match(
    seraSource,
    /boxShadow:\s*["']0\.25rem 0\.25rem 0 0 var\(--ink\)["']/,
  );
});

test("Appearance keeps responsive palette and two-style selector geometry", () => {
  const paletteGroup = sourceRegion(
    'aria-label="Color palette"',
    "{PALETTES.map",
  );
  const styleGroup = sourceRegion('aria-label="Visual style"', "{STYLES.map");

  assert.match(appearanceSource, /className="p-4 pt-2 sm:p-6 sm:pt-2"/);
  assert.match(
    paletteGroup,
    /className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6"/,
  );
  assert.match(
    styleGroup,
    /className="grid grid-cols-1 gap-2 sm:grid-cols-2"/,
  );
  assert.doesNotMatch(styleGroup, /grid-cols-3/);
});

test("Appearance copy and swatches use readable type and semantic radius contracts", () => {
  assert.match(appearanceSource, /className="flex h-9 w-full overflow-hidden rounded-control border border-rule-soft"/);
  assert.doesNotMatch(appearanceSource, /text-\[(?:10|11)px\]/);
  assert.doesNotMatch(appearanceSource, /rounded-\[[0-9.]+px\]/);
  assert.match(
    appearanceSource,
    /className="text-\[length:var\(--type-secondary\)\] text-pretty leading-relaxed muted"[\s\S]*?\{s\.description\}/,
  );
  assert.match(
    appearanceSource,
    /className="text-\[length:var\(--type-secondary\)\] text-pretty leading-relaxed muted"[\s\S]*?Follows your system by default;/,
  );
  assert.match(
    appearanceSource,
    /className="text-xs font-medium text-ink">\{palette\.label\}/,
  );
});

test("Appearance preserves mounted single-selection ToggleGroup behavior", () => {
  assert.equal(matchCount(appearanceSource, /<ToggleGroup(?:\s|>)/g), 2);
  assert.equal(matchCount(appearanceSource, /type="single"/g), 2);
  assert.equal(matchCount(appearanceSource, /variant="card"/g), 4);
  assert.equal(matchCount(appearanceSource, /<fieldset/g), 2);
  assert.equal(matchCount(appearanceSource, /<legend/g), 2);
  assert.match(appearanceSource, /const \[mounted, setMounted\] = useState\(false\)/);
  assert.match(appearanceSource, /useEffect\(\(\) => \{[\s\S]*?setMounted\(true\);[\s\S]*?\}, \[\]\);/);
  assert.match(appearanceSource, /value=\{mounted \? palette : ""\}/);
  assert.match(appearanceSource, /value=\{mounted \? style : ""\}/);
  assert.match(
    appearanceSource,
    /onValueChange=\{\(value\) => value && setPalette\(value as PaletteId\)\}/,
  );
  assert.match(
    appearanceSource,
    /onValueChange=\{\(value\) => value && setStyle\(value as StyleId\)\}/,
  );
  assert.match(appearanceSource, /<ThemeToggle \/>/);
});
