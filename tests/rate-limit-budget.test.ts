import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BUDGET_CAPS,
  budgetState,
  checkBudget,
  initialBudget,
  nextBudget,
  noteCommand,
  resetBudgetForTests,
  spendCommand,
} from "../src/lib/rate-limit-budget";

/**
 * Daily Redis-command budget.
 *
 * The free tier allows 10k commands per day. A dashboard load fans out to
 * several queries and a single user session can burn hundreds, so the budget is
 * the guard rail that keeps the whole deployment inside the allowance instead
 * of discovering it at midnight. It counts only commands this module knows were
 * actually issued, and it is per instance — deliberately, because a shared
 * counter would itself cost a command.
 */

const DAY = "2026-11-20";
const NEXT_DAY = "2026-11-21";

test("a fresh budget starts empty with the documented caps", () => {
  const state = initialBudget(DAY);
  assert.equal(state.commandsToday, 0);
  assert.equal(state.day, DAY);
  assert.equal(state.softCap, BUDGET_CAPS.softCap);
  assert.equal(state.hardCap, BUDGET_CAPS.hardCap);
  assert.deepEqual(BUDGET_CAPS, { softCap: 8000, hardCap: 9500 });
});

test("noting a command increments the counter", () => {
  const after = noteCommand(initialBudget(DAY), DAY);
  assert.equal(after.commandsToday, 1);
});

test("the instance counter accumulates across calls and never decreases", () => {
  resetBudgetForTests();
  for (let i = 0; i < 5; i += 1) spendCommand(DAY);
  assert.equal(budgetState(DAY).commandsToday, 5);
  // Reading repeatedly must not reset or lower it.
  assert.equal(budgetState(DAY).commandsToday, 5);
  assert.equal(budgetState(DAY).commandsToday, 5);
  resetBudgetForTests();
});

test("the instance counter starts over on a new IST day", () => {
  resetBudgetForTests();
  spendCommand(DAY);
  spendCommand(DAY);
  assert.equal(budgetState(NEXT_DAY).commandsToday, 0);
  resetBudgetForTests();
});

test("the counter resets when the IST day rolls over", () => {
  let state = initialBudget(DAY);
  for (let i = 0; i < 3; i += 1) state = noteCommand(state, DAY);
  const rolled = nextBudget(state, DAY, NEXT_DAY);
  assert.equal(rolled.commandsToday, 0);
  assert.equal(rolled.day, NEXT_DAY);
});

test("a same-day read is untouched by the rollover check", () => {
  const state = noteCommand(initialBudget(DAY), DAY);
  const same = nextBudget(state, DAY, DAY);
  assert.equal(same.commandsToday, 1);
  assert.equal(same.day, DAY);
});

test("budget state is ok below the soft cap", () => {
  assert.equal(checkBudget({ ...initialBudget(DAY), commandsToday: 0 }), "ok");
  assert.equal(checkBudget({ ...initialBudget(DAY), commandsToday: 7999 }), "ok");
});

test("crossing the soft cap reports soft", () => {
  assert.equal(checkBudget({ ...initialBudget(DAY), commandsToday: 8000 }), "soft");
  assert.equal(checkBudget({ ...initialBudget(DAY), commandsToday: 9499 }), "soft");
});

test("crossing the hard cap reports hard", () => {
  assert.equal(checkBudget({ ...initialBudget(DAY), commandsToday: 9500 }), "hard");
  assert.equal(checkBudget({ ...initialBudget(DAY), commandsToday: 99999 }), "hard");
});
