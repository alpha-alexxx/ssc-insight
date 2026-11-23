import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

function source(path: string) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

const toastSource = source("src/components/toast-stack.tsx");

/**
 * Contract: the third argument to `useSyncExternalStore` (the server
 * snapshot) must be a stable, cached value.
 *
 * React compares snapshots with `Object.is`. A getter that builds a new object
 * or array on every call never compares equal, so React re-renders forever and
 * logs the error this test exists to prevent:
 *
 *   The result of getServerSnapshot should be cached to avoid an infinite loop
 *
 * `Toaster` mounts in the root layout, so that failure reached every route.
 */
test("the toast server snapshot is a hoisted identifier, not an inline literal", () => {
  const call = /useSyncExternalStore\(\s*subscribe\s*,\s*[A-Za-z_$][\w$]*\s*,\s*([^)]+)\)/.exec(
    toastSource,
  );
  assert.ok(call, "Toaster should read the store through useSyncExternalStore");

  const serverSnapshot = call[1]!.trim();
  // An identifier (`getNone`) compares by stable reference across calls. An
  // inline arrow, array literal or object literal is rebuilt every call and
  // would restore the infinite loop.
  assert.match(
    serverSnapshot,
    /^[A-Za-z_$][\w$]*$/,
    `server snapshot must be a cached identifier, got: ${serverSnapshot}`,
  );
});

test("that identifier resolves to one module-level empty array", () => {
  // e.g.  const NO_TOASTS: ToastData[] = [];  const getNone = () => NO_TOASTS;
  const hoisted = /const\s+([A-Za-z_$][\w$]*)\s*(?::[^=]+)?=\s*\[\s*\]/.exec(
    toastSource,
  );
  assert.ok(
    hoisted,
    "a module-level empty array constant must exist to serve as the server snapshot",
  );

  const getterName = /useSyncExternalStore\(\s*subscribe\s*,\s*[A-Za-z_$][\w$]*\s*,\s*([A-Za-z_$][\w$]*)\s*\)/.exec(
    toastSource,
  )?.[1];
  assert.ok(getterName, "the server snapshot getter should be a named identifier");

  const getter = new RegExp(
    `const\\s+${getterName}\\s*=\\s*\\(\\)\\s*=>\\s*([A-Za-z_$][\\w$]*)\\s*;`,
  ).exec(toastSource);
  assert.ok(getter, `${getterName} should be a zero-argument getter`);
  assert.equal(
    getter[1],
    hoisted[1],
    `${getterName} must return the cached constant, not build a new array`,
  );
});

test("the client snapshot returns the store's own reference", () => {
  // `toasts` is only reassigned on mutation, so returning it directly is stable
  // between changes — that half of the store was never the problem.
  const getter = /const\s+getToasts\s*=\s*\(\)\s*=>\s*toasts\s*;/.exec(toastSource);
  assert.ok(
    getter,
    "getToasts must return the stored array reference so unchanged state compares equal",
  );
});
