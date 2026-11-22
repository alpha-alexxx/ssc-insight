# Task 5C2 Report — Calendar named-container folds

## Status

Implemented Task 5C2 only. Calendar layout, toolbar, layer toggles, and event revision folds now respond to their named containers. Behavior, data, strings, ARIA, handlers, drawer conditions, mode checks, and global styles were preserved.

## Changes

- Named the Calendar page root `cal-page` container.
- Kept the month/week rail hidden below `@3xl/cal-page`, stacked it from `@3xl/cal-page`, and enabled the two-column sticky layout from `@5xl/cal-page` with the prior 68px offset expressed as `4.25rem`.
- Named the toolbar `cal-toolbar` container and moved its title/navigation and mode/layer folds from viewport `sm` to `@lg/cal-toolbar`.
- Made `LayerToggles` consume the ancestor `cal-toolbar` query for grid-to-inline composition.
- Named the Event Dialog content `event-dialog` container and moved the revision matrix 2→3 column fold to `@sm/event-dialog`.
- Added a focused source contract that isolates each audited class region, rejects the old viewport fold markers, asserts the named owners and thresholds, and protects the phone drawer/mode checks plus toolbar live-region/narrow-label contracts.

## TDD evidence

- RED: `npx tsx --test --test-name-pattern "Task 5C2" tests/responsive-ui-contract.test.ts` — 0 passed, 1 failed on the missing `@container/cal-page` owner before any production edit.
- GREEN: the same focused command — 1 passed, 0 failed after the minimal class-only source edits.
- Focused responsive suite: `npx tsx --test tests/responsive-ui-contract.test.ts` — 19 passed, 0 failed.

## Verification

- Relevant Calendar behavior: `npx tsx --test tests/calendar-url.test.ts tests/calendar-entries.test.ts tests/todos.test.ts` — 38 passed, 0 failed.
- `npm run typecheck` — passed.
- Scoped ESLint over the four approved source files and focused test — passed with no findings.
- `git diff --check` — passed with no output.
- `npm test` — 542 passed, 0 failed.

## Graphify

Attempted exactly once:

```text
graphify query "Task 5C2 calendar named-container folds, responsive contract tests, and target class regions"
```

Known launcher failure reproduced (exit 1):

```text
did not find executable at 'C:\Users\ankit\AppData\Roaming\uv\python\cpython-3.13-windows-x86_64-none\python.exe': The system cannot find the path specified.
```

No retry or graph update was performed.

## Concerns

- None in Task 5C2 scope. The pre-existing untracked `docs/` directory was not modified or staged.

## Review fix — round 1/5

- Finding: the Task 5C2 contract searched named-query fragments across whole toolbar/layer files and rejected `sm:` globally, so a query in the wrong class region could satisfy the test and an unrelated viewport utility could fail it.
- Fix: sliced the title/navigation classes, mode/layers classes, and `LayerToggles` group class independently; each slice now asserts its own named-query fragments and rejects legacy viewport folds only inside that audited region.
- Updated stale source comments from viewport `sm`/`xl` language to named-container-width language. Production classes and behavior were unchanged.
- `npx tsx --test --test-name-pattern "Task 5C2" tests/responsive-ui-contract.test.ts` — 1 passed, 0 failed.
- `npx tsx --test tests/responsive-ui-contract.test.ts` — 19 passed, 0 failed.
- Scoped ESLint over the three changed source/test files — passed with no findings.
- `git diff --check` — passed with no output.
- Commit: separate round-one follow-up; hash reported with delivery.
