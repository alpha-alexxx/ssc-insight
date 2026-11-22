# Task 5C1 Report — Calendar typography, targets, and action roles

## Status

Implemented reduced Task 5C1 only. Calendar state, dates, layer masks, entry ordering, callbacks, routes, strings, and mutations were preserved. Task 5C2 container-fold work was not performed.

## Changes

- Replaced ordinary 9–11px Calendar prose with `--type-label` or `--type-secondary` according to role; retained only the documented `aria-hidden` Today numeral exception.
- Kept month/week tick/list substitutions and complete day-button accessible labels intact while raising meaningful wide-mode names and summaries to the readable floor.
- Composed the period date field with the shared `Input` while preserving `type="date"`, value, and change handling.
- Composed the Event dialog close action with the shared ghost/icon `Button`.
- Replaced hard-coded checkbox hit-area insets with `tap-target`; kept a separate 16px visual mark and preserved checkbox ARIA state and callbacks.
- Added shared target geometry to audited raw Calendar actions.
- Applied `action-row-stack` to the Agenda primary footer and Event dialog footer; retained the Day ledger peer actions as intrinsic `action-row`.
- Added focused source contracts for typography, geometry, action roles, documented decorative exceptions, and behavior preservation.

## TDD evidence

- RED: focused responsive suite failed 3 new Task 5C1 contracts against unchanged production code (typography, shared controls, action roles).
- RED refinement: checkbox visual-preservation assertion failed before the hit target and 16px mark were separated.
- GREEN: `npx tsx --test tests/responsive-ui-contract.test.ts` — 18 passed, 0 failed.

## Verification

- `npx tsx --test tests/responsive-ui-contract.test.ts tests/calendar-url.test.ts tests/calendar-entries.test.ts tests/todos.test.ts` — 56 passed, 0 failed.
- `npm run typecheck` — passed.
- Scoped ESLint over the focused test and nine approved Calendar files — passed.
- `git diff --check` — passed.
- `npm test` — 541 passed, 0 failed.

## Graphify

Attempted exactly once:

```text
graphify query "Task 5C1 calendar typography targets and action roles"
```

Known launcher failure reproduced (exit 1):

```text
did not find executable at 'C:\Users\ankit\AppData\Roaming\uv\python\cpython-3.13-windows-x86_64-none\python.exe': The system cannot find the path specified.
```

No retry or graph update was performed.

## Concerns

- None in the reduced 5C1 scope. Responsive container-fold migration remains intentionally deferred to Task 5C2.

## Review fix — round 1/5

- Finding: the earlier Agenda control assertion used the first `counts.plan.total` occurrence and accidentally re-selected the `AgendaGroups` Open button, so removing `tap-target` from an `EarlierRanges` date row remained green.
- Fix: scoped the assertions to the `AgendaGroups` and `EarlierRanges` function slices and directly matched the Open, disclosure, and mapped date-row buttons. Production files were unchanged.
- `npx tsx --test --test-name-pattern "Task 5C1 Calendar controls consume shared target and field contracts" tests/responsive-ui-contract.test.ts` — 1 passed, 0 failed.
- `npx tsx --test tests/responsive-ui-contract.test.ts` — 18 passed, 0 failed.
- `npx eslint tests/responsive-ui-contract.test.ts` — passed with no findings.
- `git diff --check` — passed with no output.
- Commit: `test(ui): scope Calendar target contract` (round-one follow-up; hash reported with delivery).
