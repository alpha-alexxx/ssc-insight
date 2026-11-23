import { test } from "node:test";
import assert from "node:assert/strict";
import { isSameOrigin, VARY_ORIGIN } from "../src/lib/origin-core";

/**
 * The same-origin verdict must be identical at both enforcement points —
 * the proxy (edge) and the route layer (Node) — so the comparison is pinned
 * here, pure, with no runtime involved.
 */

test("an absent Origin header passes: non-browser clients have none", () => {
  assert.equal(isSameOrigin(null, "ssc.example"), true);
  assert.equal(isSameOrigin(undefined as unknown as null, "ssc.example"), true);
});

test("a matching host passes regardless of scheme case or port spelling", () => {
  assert.equal(isSameOrigin("https://ssc.example", "ssc.example"), true);
  assert.equal(isSameOrigin("http://ssc.example", "ssc.example"), true);
  assert.equal(isSameOrigin("https://ssc.example:3000", "ssc.example:3000"), true);
  // A different port is a different origin — the host comparison includes it.
  assert.equal(isSameOrigin("https://ssc.example:3000", "ssc.example"), false);
});

test("cross-origin, unparsable and non-http(s) origins are refused", () => {
  assert.equal(isSameOrigin("https://evil.example", "ssc.example"), false);
  assert.equal(isSameOrigin("http://evil.example:8080", "ssc.example"), false);
  assert.equal(isSameOrigin("javascript:alert(1)", "ssc.example"), false);
  assert.equal(isSameOrigin("data:text/html,x", "ssc.example"), false);
  assert.equal(isSameOrigin("not a url", "ssc.example"), false);
  assert.equal(isSameOrigin("", "ssc.example"), true);
});

test("a missing Host with a present Origin is refused (cannot verify)", () => {
  assert.equal(isSameOrigin("https://ssc.example", null), false);
});

test("every API response advertises the Origin vary header", () => {
  assert.equal(VARY_ORIGIN, "Origin");
});
