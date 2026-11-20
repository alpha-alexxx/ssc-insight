import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, dirname, relative, resolve, sep } from "node:path";

/**
 * Colocation guard.
 *
 * A route's private `_<segment>/` folder is the route's own property: it may be
 * imported by that route and by nothing else. The rule is invisible to `tsc`
 * and easy to break by accident (one convenient import and two routes silently
 * share a component that one of them will later change), so it is enforced by
 * an import-graph scan instead of by review.
 *
 * Owner of a private file = the route directory the underscore folder sits in.
 * Legal importers = any file at or below that owner directory.
 */

const ROOT = process.cwd();
const SRC = join(ROOT, "src");
const APP = join(SRC, "app");

const SOURCE_RE = /\.(ts|tsx)$/;

/** Every .ts/.tsx file under src, absolute. */
function allSourceFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) allSourceFiles(full, out);
    else if (SOURCE_RE.test(entry)) out.push(full);
  }
  return out;
}

/** Every file inside an underscore-prefixed folder, with its owning route dir. */
function privateFiles(
  dir: string,
  owner = dir,
  out: { file: string; owner: string }[] = [],
): { file: string; owner: string }[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (!statSync(full).isDirectory()) continue;
    if (entry.startsWith("_")) {
      // The owner is the route directory this private folder lives in.
      walkInto(full, owner, out);
    } else {
      privateFiles(full, full, out);
    }
  }
  return out;
}

function walkInto(
  dir: string,
  owner: string,
  out: { file: string; owner: string }[],
) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walkInto(full, owner, out);
    else if (SOURCE_RE.test(entry)) out.push({ file: full, owner });
  }
}

/** Resolve an import specifier relative to the importing file, or null. */
function resolveSpecifier(fromFile: string, spec: string): string | null {
  let base: string;
  if (spec.startsWith("@/")) base = join(SRC, spec.slice(2));
  else if (spec.startsWith(".")) base = resolve(dirname(fromFile), spec);
  else return null; // package import

  for (const candidate of [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    join(base, "index.ts"),
    join(base, "index.tsx"),
  ]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

/** Import specifiers in one file. */
function importsOf(file: string): string[] {
  const text = readFileSync(file, "utf8");
  const specs: string[] = [];
  const re = /(?:from\s*|import\s*\(\s*)["']([^"']+)["']/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) specs.push(match[1]);
  return specs;
}

const isInside = (child: string, parent: string) =>
  child === parent || child.startsWith(parent + sep);

test("a route's private folder is only imported from inside that route", () => {
  const privates = privateFiles(APP);
  if (privates.length === 0) return; // nothing colocated yet

  const byTarget = new Map<string, string>();
  for (const { file, owner } of privates) byTarget.set(file, owner);

  const violations: string[] = [];
  for (const source of allSourceFiles(SRC)) {
    for (const spec of importsOf(source)) {
      const target = resolveSpecifier(source, spec);
      if (!target) continue;
      const owner = byTarget.get(target);
      if (!owner) continue;
      if (isInside(source, owner)) continue;
      violations.push(
        `${relative(SRC, source)} imports ${relative(SRC, target)} (owned by ${relative(SRC, owner)})`,
      );
    }
  }
  assert.deepEqual(violations, []);
});

test("shared components live outside route folders", () => {
  // A component imported by two different routes belongs in components/shared.
  // This asserts the two anchors that already have many consumers are not
  // reached through a route's private folder.
  const privates = privateFiles(APP);
  const anchors = ["components/shared", "components/ui"];
  for (const { file } of privates) {
    const rel = relative(SRC, file);
    for (const anchor of anchors) {
      assert.ok(
        !rel.startsWith(anchor),
        `private route file ${rel} must not live under ${anchor}`,
      );
    }
  }
});
