import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BREAKER_OPEN_MS,
  BREAKER_THRESHOLD,
  initialBreaker,
  isBreakerOpen,
  onFailure,
  onSuccess,
  tickBreaker,
} from "../src/lib/rate-limit-breaker";

/**
 * Circuit breaker state machine.
 *
 * The behaviour that matters: a rate limiter must never take the app down. These
 * tests pin the exact failure count that opens the circuit, that it stays open
 * for the documented window, that it reopens immediately if the probe fails, and
 * that a success closes it.
 */

const T0 = 1_000_000;

test("a new breaker is closed", () => {
  assert.equal(isBreakerOpen(initialBreaker(), T0), false);
});

test("one failure does not open the circuit", () => {
  const state = onFailure(initialBreaker(), T0);
  assert.equal(state.failures, 1);
  assert.equal(isBreakerOpen(state, T0), false);
});

test("consecutive failures below the threshold keep it closed", () => {
  let state = initialBreaker();
  for (let i = 0; i < BREAKER_THRESHOLD - 1; i += 1) state = onFailure(state, T0);
  assert.equal(isBreakerOpen(state, T0), false);
});

test("the threshold-th consecutive failure opens the circuit", () => {
  let state = initialBreaker();
  for (let i = 0; i < BREAKER_THRESHOLD; i += 1) state = onFailure(state, T0);
  assert.equal(state.openedAt, T0);
  assert.equal(isBreakerOpen(state, T0), true);
});

test("the circuit stays open for the documented window", () => {
  let state = initialBreaker();
  for (let i = 0; i < BREAKER_THRESHOLD; i += 1) state = onFailure(state, T0);
  assert.equal(isBreakerOpen(state, T0 + BREAKER_OPEN_MS - 1), true);
  assert.deepEqual(BREAKER_OPEN_MS, 60_000);
});

test("the circuit closes after the window elapses so a probe can pass", () => {
  let state = initialBreaker();
  for (let i = 0; i < BREAKER_THRESHOLD; i += 1) state = onFailure(state, T0);
  const probed = tickBreaker(state, T0 + BREAKER_OPEN_MS);
  assert.equal(probed.openedAt, null);
  assert.equal(isBreakerOpen(probed, T0 + BREAKER_OPEN_MS), false);
});

test("a failed probe re-opens the circuit immediately", () => {
  let state = initialBreaker();
  for (let i = 0; i < BREAKER_THRESHOLD; i += 1) state = onFailure(state, T0);
  const reopened = onFailure(tickBreaker(state, T0 + BREAKER_OPEN_MS), T0 + BREAKER_OPEN_MS);
  assert.equal(isBreakerOpen(reopened, T0 + BREAKER_OPEN_MS), true);
});

test("a success closes the circuit and clears the failure count", () => {
  const state = onSuccess();
  assert.deepEqual(state, { failures: 0, openedAt: null });
});

test("ticking a closed breaker changes nothing", () => {
  const state = initialBreaker();
  assert.equal(tickBreaker(state, T0 + 10 * BREAKER_OPEN_MS), state);
});
