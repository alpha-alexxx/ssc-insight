# Task 5A Report — Shared responsive foundations and public/auth consumers

**Status:** Complete
**Date:** 2026-11-23 (IST)

## Scope delivered

- Split `.action-row` (always intrinsic/wrapping) from `.action-row-stack` (phone-stacked below 40rem, intrinsic/wrapping above it).
- Raised global table headers, section labels, `FieldSeparator`, dropdown labels, and PageHeader metadata to `--type-label`.
- Applied the small-control minimum-height token to dropdown items.
- Migrated `AlertDialogFooter` to the explicit stacked action role.
- Composed `ThemeToggle` and the landing mobile-menu trigger with shared ghost/icon Buttons.
- Removed only the `h-11` overrides from sign-in, sign-up, and forgot-password CTAs.
- Preserved strings, handlers, disabled/busy states, DOM semantics, the three-line menu glyph, icon callbacks, and documented decorative/OTP/password exceptions.
- No settings, add, calendar, tasks, AI, package-manifest, or unrelated source files were edited.

## Graphify prerequisite

Attempted before source exploration:

```text
graphify query "Which shared responsive foundations and public/auth consumers implement Task 5A action-row, readable-floor, control-token, and Button-composition contracts?"
```

Known stale-launcher failure (exit code 1):

```text
did not find executable at 'C:\Users\ankit\AppData\Roaming\uv\python\cpython-3.13-windows-x86_64-none\python.exe': The system cannot find the path specified.
```

No alternate launcher or graph rebuild was attempted.

## Strict TDD evidence

1. Added `tests/responsive-ui-contract.test.ts` before production changes.
2. Verified RED twice after tightening the FieldSeparator assertion: **9 tests, 1 pass, 8 expected contract failures**.
3. Applied only the brief's minimal styling/composition changes.
4. Verified GREEN: **9 tests, 9 pass, 0 fail**.

The focused test covers action-role CSS, readable floors, primitive tokens, Button composition, preserved accessibility/handlers/content, and the documented auth exceptions.

## Verification

| Gate | Command | Result |
|---|---|---|
| Focused contracts | `npx tsx --test tests/responsive-ui-contract.test.ts` | PASS — 9/9 |
| Shared UI contracts | `npx tsx --test tests/ui-style-contract.test.ts` | PASS — 19/19 |
| Theme/style contracts | `npx tsx --test tests/theme-style.test.ts` | PASS — 16/16 |
| Appearance contracts | `npx tsx --test tests/appearance-contract.test.ts` | PASS — 5/5 |
| Typecheck | `npm run typecheck` | PASS |
| Scoped lint | `npx eslint tests/responsive-ui-contract.test.ts ...` | PASS — 0 errors; 1 pre-existing warning in `sign-in-form.tsx:283` for the unchanged internal `window.location.assign()` flow |
| Diff hygiene | `git diff --check` | PASS |
| Full suite | `npm test` | PASS — 532/532 |

## Diff review

The source diff is limited to the ten files explicitly listed by Task 5A, plus the required focused test and this report. The pre-existing untracked `docs/` directory was left untouched and is not part of the commit.

## Concerns

- Graphify remains unavailable because its configured uv Python executable is missing.
- Scoped lint retains one pre-existing warning in an unchanged sign-in navigation line; changing it would violate this task's behavior-preservation and minimal-scope contract.
