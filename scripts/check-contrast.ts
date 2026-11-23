/**
 * WCAG AA contrast gate for the six-palette OKLCH token system.
 *
 * Parses src/app/globals.css, resolves every shadcn-style token for each
 * palette x mode (light/dark), and fails (exit 1) if any required pair
 * falls below:
 *   - 4.5:1 for text/background pairs (normal text)
 *   - 3.0:1 for chart series against their background (non-text graphics)
 *
 * Run: npx tsx scripts/check-contrast.ts
 */
import { readFileSync } from "node:fs";
import { rgb } from "culori";

const CSS_PATH = new URL("../src/app/globals.css", import.meta.url);

type Tokens = Record<string, string>;

interface Block {
  selector: string;
  tokens: Tokens;
}

function parseBlocks(css: string): Block[] {
  // Strip @-rules (e.g. `@theme inline { ... }`) with nested braces via depth scan.
  let src = "";
  let depth = 0;
  let atRule = false;
  for (const ch of css) {
    if (ch === "@" && depth === 0) atRule = true;
    if (atRule) {
      if (ch === "{" || ch === "(") depth++;
      if (ch === "}") {
        depth--;
        if (depth <= 0) {
          depth = 0;
          atRule = false;
        }
      }
      if (ch === ")") depth = Math.max(0, depth - 1);
      if (ch === ";" && depth === 0) atRule = false;
      continue;
    }
    src += ch;
  }

  const blocks: Block[] = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    const selector = m[1].replace(/\/\*[\s\S]*?\*\//g, "").trim();
    if (selector.startsWith("@")) continue;
    const tokens: Tokens = {};
    const declRe = /--([a-z0-9-]+)\s*:\s*([^;]+);/g;
    let d: RegExpExecArray | null;
    while ((d = declRe.exec(m[2]))) {
      tokens[d[1]] = d[2].trim();
    }
    if (Object.keys(tokens).length > 0) blocks.push({ selector, tokens });
  }
  return blocks;
}

function resolveVar(value: string, chain: Tokens, fallbacks: Tokens[]): string {
  let v = value.trim();
  const seen = new Set<string>();
  while (v.startsWith("var(")) {
    const name = v.slice(4, v.indexOf(")")).trim();
    if (seen.has(name)) return v;
    seen.add(name);
    const next = chain[name.replace(/^--/, "")] ?? fallbacks.find((f) => f[name.replace(/^--/, "")])?.[name.replace(/^--/, "")];
    if (!next) return v;
    v = next;
  }
  return v;
}

function relLum(color: string): number | null {
  const r = rgb(color);
  if (!r) return null;
  const f = (v: number) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * f(r.r) + 0.7152 * f(r.g) + 0.0722 * f(r.b);
}

function contrast(a: string, b: string): number {
  const la = relLum(a);
  const lb = relLum(b);
  if (la == null || lb == null) return NaN;
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

const TEXT_PAIRS: Array<[string, string]> = [
  ["foreground", "background"],
  ["primary-foreground", "primary"],
  ["secondary-foreground", "secondary"],
  ["muted-foreground", "background"],
  ["accent-foreground", "accent"],
  ["destructive-foreground", "destructive"],
  ["success-foreground", "success"],
  ["warning-foreground", "warning"],
  ["card-foreground", "card"],
  ["popover-foreground", "popover"],
  ["sidebar-foreground", "sidebar"],
  ["sidebar-primary-foreground", "sidebar-primary"],
  ["sidebar-accent-foreground", "sidebar-accent"],
];

const CHART_TOKENS = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"];

function main(): number {
  const css = readFileSync(CSS_PATH, "utf8");
  const blocks = parseBlocks(css);

  const lightRoot = blocks.find((b) => b.selector === ":root");
  const darkRoot = blocks.find((b) => b.selector === ".dark");
  if (!lightRoot || !darkRoot) {
    console.error("FATAL: :root or .dark token block not found");
    return 1;
  }

  const palettes = ["graphite", "terracotta", "blue", "lime", "violet", "rose"];
  let failures = 0;

  for (const palette of palettes) {
    for (const mode of ["light", "dark"] as const) {
      const root = mode === "light" ? lightRoot : darkRoot;
      const block =
        palette === "graphite"
          ? root
          : blocks.find(
              (b) =>
                b.selector ===
                (mode === "light" ? `[data-theme="${palette}"]` : `.dark[data-theme="${palette}"]`)
            );
      if (!block) {
        console.error(`FATAL: missing token block for ${palette} ${mode}`);
        failures++;
        continue;
      }
      const chain: Tokens = { ...root.tokens, ...block.tokens };
      const get = (name: string) => resolveVar(chain[name] ?? "", chain, [root.tokens]);

      const pairs: Array<[string, string, number]> = [];
      for (const [fg, bg] of TEXT_PAIRS) pairs.push([fg, bg, 4.5]);
      for (const c of CHART_TOKENS) pairs.push([c, "background", 3.0]);

      for (const [fg, bg, min] of pairs) {
        const fgV = get(fg);
        const bgV = get(bg);
        const c = contrast(fgV, bgV);
        if (!Number.isFinite(c) || c < min) {
          failures++;
          console.log(
            `FAIL ${palette}/${mode}: ${fg}(${fgV}) on ${bg}(${bgV}) = ${Number.isFinite(c) ? c.toFixed(2) : "unparseable"} (min ${min})`
          );
        }
      }
    }
  }

  const totalChecks = palettes.length * 2 * (TEXT_PAIRS.length + CHART_TOKENS.length);
  if (failures === 0) {
    console.log(`check-contrast: PASS — ${totalChecks} pairs, all >= AA thresholds`);
    return 0;
  }
  console.log(`check-contrast: FAIL — ${failures} failing pairs of ${totalChecks}`);
  return 1;
}

process.exit(main());
