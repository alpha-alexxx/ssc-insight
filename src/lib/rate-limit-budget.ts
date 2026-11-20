import { BUDGET_CAPS } from "./rate-limit-core";

/** Re-exported so callers track the budget without reaching into the policy. */
export { BUDGET_CAPS };

/**
 * Per-instance daily Redis-command budget.
 *
 * The Upstash free tier allows ~10k commands/day. Every L2 consultation spends
 * at least one, so the deployment needs a guard rail that degrades gracefully
 * before the allowance is gone rather than discovering the ceiling at midnight.
 *
 * Deliberately per-instance and in-memory: a shared counter would itself cost a
 * Redis command on every check, which is the thing being conserved. The
 * consequence is that N warm instances can each spend up to the cap, so the caps
 * sit below the provider limit and this module trades that over-spend risk for
 * zero overhead. `rate-limit-core.ts` decides what to do with the state; this
 * module only tracks it.
 */

export type BudgetState = {
  /** The IST day the counter belongs to. */
  day: string;
  /** Redis commands recorded since that day began, per this instance. */
  commandsToday: number;
  softCap: number;
  hardCap: number;
};

/** A budget that has spent nothing. */
export function initialBudget(day: string): BudgetState {
  return {
    day,
    commandsToday: 0,
    softCap: BUDGET_CAPS.softCap,
    hardCap: BUDGET_CAPS.hardCap,
  };
}

/**
 * Reconcile a stored budget against the current IST day.
 *
 * A day change zeroes the counter; otherwise the stored value stands. The count
 * is monotonic because the only writer is {@link noteCommand}, which always
 * increments the value it just read — a stale copy is never written back.
 */
export function nextBudget(
  prev: BudgetState,
  prevDay: string,
  nowDay: string,
): BudgetState {
  if (prevDay !== nowDay) return initialBudget(nowDay);
  return prev;
}

/** Record one spent command against a budget value. */
export function noteCommand(state: BudgetState, nowDay: string): BudgetState {
  if (state.day !== nowDay) return { ...initialBudget(nowDay), commandsToday: 1 };
  return { ...state, commandsToday: state.commandsToday + 1 };
}

/** Where the budget stands: "ok" below soft, "soft" at soft, "hard" at hard. */
export function checkBudget(state: BudgetState): "ok" | "soft" | "hard" {
  if (state.commandsToday >= state.hardCap) return "hard";
  if (state.commandsToday >= state.softCap) return "soft";
  return "ok";
}

// ── The per-instance singleton ──────────────────────────────────────────────
// Held at module scope so a warm serverless instance keeps its count across
// requests. `undefined` means "nothing spent yet"; the day is set on first use
// from the caller's IST day key.

let current: BudgetState | undefined;

/** Today's budget for this instance, rolling over at the IST day boundary. */
export function budgetState(nowDay: string): BudgetState {
  if (!current) {
    current = initialBudget(nowDay);
    return current;
  }
  current = nextBudget(current, current.day, nowDay);
  return current;
}

/** Charge one Redis command to this instance's budget and return the new state. */
export function spendCommand(nowDay: string): BudgetState {
  current = noteCommand(budgetState(nowDay), nowDay);
  return current;
}

/** Test seam: forget the singleton between cases. */
export function resetBudgetForTests(): void {
  current = undefined;
}
