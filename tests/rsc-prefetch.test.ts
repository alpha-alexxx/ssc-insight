import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { QueryClient } from "@tanstack/react-query";
import { prefetchInto } from "../src/lib/rsc/prefetch";

/**
 * RSC foundation contracts.
 *
 * Three failures this file exists to catch, none of which `tsc` sees:
 *  1. A prefetch that throws when one loader fails — a database blip would
 *     become a 500 page instead of a normal client fetch.
 *  2. A prefetch key that differs from the client's query key — the payload is
 *     fetched twice and the hydrated one is never read.
 *  3. Filter state that navigates with router.push and re-renders the server
 *     tree on every keystroke.
 */

function newClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

test("prefetchInto seeds every successful entry", async () => {
  const queryClient = newClient();
  await prefetchInto(queryClient, [
    { key: ["a"], load: async () => 1 },
    { key: ["b", 2], load: async () => ({ x: true }) },
  ]);
  assert.equal(queryClient.getQueryData(["a"]), 1);
  assert.deepEqual(queryClient.getQueryData(["b", 2]), { x: true });
});

test("a rejecting loader does not reject prefetchInto", async () => {
  const queryClient = newClient();
  // This is the property that matters: a page must still render when its data
  // source is down, and the client query then shows the normal error state.
  await prefetchInto(queryClient, [
    { key: ["ok"], load: async () => "fine" },
    {
      key: ["boom"],
      load: async () => {
        throw new Error("database unavailable");
      },
    },
  ]);
  assert.equal(queryClient.getQueryData(["ok"]), "fine");
  assert.equal(queryClient.getQueryData(["boom"]), undefined);
});

test("a rejected prefetch entry is not cached as an error state", async () => {
  const queryClient = newClient();
  await prefetchInto(queryClient, [
    {
      key: ["dead"],
      load: async () => {
        throw new Error("nope");
      },
    },
  ]);
  const state = queryClient.getQueryState(["dead"]);
  // No entry at all: the client hook must perform its own first fetch rather
  // than inheriting a permanent hydrated error.
  assert.equal(state, undefined);
});

test("prefetchInto never writes undefined as a value", async () => {
  const queryClient = newClient();
  await prefetchInto(queryClient, [{ key: ["u"], load: async () => undefined }]);
  // An `undefined` seed would look hydrated but render as empty.
  assert.equal(queryClient.getQueryData(["u"]), undefined);
  assert.equal(queryClient.getQueryState(["u"]), undefined);
});

test("a migrated route page prefetches with a query-key factory, not an inline literal", () => {
  // A prefetch key must come from the same factory the client hook imports;
  // a hand-written literal drifts silently and the hydrated payload is never
  // read. Pages that are still shell-rendered placeholders have no query, so
  // only migrated pages (those calling prefetchInto) are checked.
  const migrated = workspacesWithPrefetch().filter((file) =>
    /prefetchInto\(/.test(readFileSync(file, "utf8")),
  );
  for (const file of migrated) {
    const text = readFileSync(file, "utf8");
    assert.ok(
      !/key:\s*\["/.test(text),
      `${file} must use a query-key factory, not an inline key literal`,
    );
  }
});

test("the filters hook mirrors state with replaceState, never router navigation", () => {
  const file = join(process.cwd(), "src", "components", "shared", "use-filters-state.ts");
  assert.ok(existsSync(file), "use-filters-state.ts must exist");
  // Strip comments: the file legitimately *documents* the rule it must obey.
  const text = readFileSync(file, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
  assert.ok(
    !/router\.(push|replace|refresh)/.test(text),
    "filter changes must not trigger RSC round-trips",
  );
  assert.ok(
    !/useRouter\(/.test(text),
    "the filters hook must not even hold a router",
  );
  assert.ok(/history\.replaceState/.test(text), "filters must still mirror to the URL");
});

/** Pages that should have been migrated to server prefetch. */
function workspacesWithPrefetch(): string[] {
  const app = join(process.cwd(), "src", "app");
  const out: string[] = [];
  (function walk(dir: string) {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (entry === "page.tsx" && full.includes("(workspace)")) out.push(full);
    }
  })(app);
  return out;
}

test("prefetch keys equal the keys the client hooks build", async () => {
  // The failure this prevents: the page seeds ["analytics","request","view=all"]
  // but the hook reads a slightly different key, so the hydrated payload is
  // fetched and then ignored — silently, with no error anywhere.
  const { attemptKeys, attemptListQueryOptions } = await import(
    "../src/lib/queries/attempts"
  );
  const paging = {
    filters: { search: "" },
    page: 1,
    pageSize: 10,
    sort: "date" as const,
    dir: "desc" as const,
    withStats: true,
  };
  assert.deepEqual(attemptKeys.list(paging), attemptListQueryOptions(paging).queryKey);

  const { trashKeys, trashListParams, trashListQueryOptions } = await import(
    "../src/lib/queries/trash"
  );
  const trashParams = trashListParams({
    kind: "all",
    q: "",
    status: "all",
    sort: "recent",
    page: 1,
  });
  assert.deepEqual(trashKeys.list(trashParams), trashListQueryOptions(trashParams).queryKey);

  const { analyticsKeys, serializeAnalyticsParams, analyticsQueryOptions } =
    await import("../src/lib/queries/analytics");
  const params = serializeAnalyticsParams("all", {});
  assert.deepEqual(analyticsKeys.request(params), analyticsQueryOptions("all", {}).queryKey);
});
