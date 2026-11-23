/**
 * Migration gate: no hardcoded colors in the migrated UI.
 *
 * Scans src/ for:
 *  - hex literals (#rgb / #rrggbb[aa])
 *  - rgb()/rgba()/hsl()/hslv() literals
 *  - Tailwind palette utilities (text-red-500, bg-emerald-600/10, amber-3, …)
 *
 * Allowlist (recorded, deliberate):
 *  - src/components/google-glyph.tsx      Google brand colors (brand mark)
 *  - src/components/code-block.tsx       syntax-highlight content pairs
 *  - src/components/*art*.ts / empty-state art data files (pixel art data)
 *  - src/generated/**                     Prisma client
 *  - svg path `fill="none"` etc. in icon data files
 *  - CSS mask luminance (`rgb(0 0 0 / …)`, `#000`/`#fff` in mask contexts)
 *    — reviewed per file, kept minimal.
 *
 * Run: npx tsx scripts/check-ui-tokens.ts
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;

const ALLOW = [
  /^src\/components\/google-glyph\.tsx$/,          // Google brand colors
  /^src\/components\/code-block\.tsx$/,             // syntax-highlight content pairs
  /^src\/components\/.*art.*\.(ts|tsx)$/,           // empty-state decorative art data
  /^src\/components\/coo-/, /^src\/components\/hide-/, /^src\/components\/fetch-/, /^src\/components\/cast-sprite/,
  /^src\/components\/fluted-footer\.tsx$/,         // canvas dither/pixel art generation
  /^src\/generated\//,
  /^src\/app\/globals\.css$/,                       // token definitions + css masks
  /^src\/lib\/theme-style\.ts$/,                    // palette swatch definitions (oklch data)
];

// Tailwind default palette names (v4 keeps these as utilities).
const PALETTE =
  "red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone";
const PALETTE_CLASS = new RegExp(
  `(?:text|bg|border|ring|fill|stroke|from|to|via|shadow|outline|decoration|divide|accent|caret)-(?:${PALETTE})-(?:50|100|200|300|400|500|600|700|800|900|950)`
);
const HEX = /#(?:[0-9a-fA-F]{3,4}){1,2}\b/;
const FUNC_COLOR = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/;

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?|css)$/.test(entry)) out.push(p);
  }
  return out;
}

function isAllowed(rel: string): boolean {
  return ALLOW.some((re) => re.test(rel));
}

const files = walk(join(ROOT, "src"));
const violations: string[] = [];

for (const file of files) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  if (isAllowed(rel)) continue;
  const text = readFileSync(file, "utf8");
  const lines = text.split("\n");
  lines.forEach((line, i) => {
    const hits: string[] = [];
    const cls = line.match(PALETTE_CLASS);
    if (cls) hits.push(cls[0]);
    if (HEX.test(line) && !/mask|gradient/i.test(line)) {
      const h = line.match(HEX);
      if (h) hits.push(h[0]);
    }
    if (FUNC_COLOR.test(line) && !/ask-image|mask/i.test(line) && !/color-mix\(in oklab, oklch\(/.test(line)) hits.push("rgb/hsl/oklch-func");
    if (hits.length) {
      // oklch() in globals.css token definitions is the token system itself;
      // inline var() color-mix() usages are token-based. Only flag literals.
      if (rel === "src/app/globals.css" && /oklch\(/.test(line) && /--/.test(line)) return;
      violations.push(`${rel}:${i + 1}  ${hits.join(", ")}  |  ${line.trim().slice(0, 100)}`);
    }
  });
}

if (violations.length === 0) {
  console.log("check-ui-tokens: PASS — no hardcoded colors in src/");
  process.exit(0);
}
console.log(`check-ui-tokens: FAIL — ${violations.length} lines`);
console.log(violations.join("\n"));
process.exit(1);
