# Task 4 Report — Appearance selector

## Scope

Implemented Task 4 only:

- `src/components/appearance-panel.tsx`
- `tests/appearance-contract.test.ts`
- this report

No Settings shell, global CSS, provider contract/behavior, UI primitives, other consumers, package manifests, lockfiles, plans, or unrelated source files were changed. The pre-existing untracked `docs/` directory was left untouched and is excluded from the Task 4 commit.

Ledger context was limited to rulings R1, R2, R4, R8, and R10 as requested.

## Required Graphify attempt

Attempted before source discovery:

```text
graphify query "How does appearance-panel consume canonical palettes and styles from theme-style, and what responsive selector contract should Task 4 preserve?"
```

Known launcher failure reproduced:

```text
did not find executable at 'C:\Users\ankit\AppData\Roaming\uv\python\cpython-3.13-windows-x86_64-none\python.exe': The system cannot find the path specified.
```

Exit code: `1`. No graph files were modified.

## Component reference

Ran the read-only project-aware documentation command:

```text
npx shadcn@latest docs toggle-group
```

Reviewed the current shadcn ToggleGroup and Radix API documentation. The controlled `type="single"` contract, non-empty `onValueChange` guard, roving focus, and keyboard behavior remain unchanged.

## TDD evidence

### RED

Created `tests/appearance-contract.test.ts` before editing production source, then ran:

```text
npx tsx --test tests/appearance-contract.test.ts
```

Verified RED against the unchanged Appearance source: `5` tests, `1` passed, `4` failed for the expected missing Task 4 contracts:

1. canonical `@/lib/theme-style` import boundary;
2. exhaustive two-preview `StyleGlyph` contract;
3. phone padding and one/two-column style layout;
4. semantic radius and readable secondary-copy contracts.

### GREEN

After the minimal source edit, the first rerun reached `4/5`: production behavior matched, but the test import helper crossed an adjacent named import while locating the canonical module. The helper was narrowed to parse one import declaration at a time; no production source was changed for that test-only correction.

Final focused run:

```text
npx tsx --test tests/appearance-contract.test.ts
```

Result: `5` passed, `0` failed.

## Implementation

- Appearance now imports palette/style metadata and ID types directly from `@/lib/theme-style`; the provider import contains only `useThemePrefs`.
- The palette swatch frame uses `rounded-control`; its micro-bar uses the approved computed half-control radius, with no arbitrary pixel radius classes.
- `StyleGlyph` now switches exhaustively over only Mira and Sera. Mira uses explicit `0.75rem` outer and `0.5rem` inner preview radii; Sera stays square with a 2px ink border and `0.25rem` hard offset shadow. The legacy fallback wireframe is removed.
- Inner padding is `p-4 pt-2 sm:p-6 sm:pt-2`.
- The palette grid remains 2/3/6 responsive; the style grid is 1/2 responsive with `gap-2`.
- Style descriptions and the dark-mode explanation use `--type-secondary`, pretty wrapping, relaxed leading, and muted color.
- Canonical labels, the mounted hydration gate, single-selection ToggleGroups, empty pre-mount values, non-empty change guards, fieldset/legend semantics, instant persistence, and `ThemeToggle` remain intact.

## Verification

| Check | Command | Result |
|---|---|---|
| Focused RED | `npx tsx --test tests/appearance-contract.test.ts` | expected `1` pass / `4` fail before source edits |
| Focused GREEN | `npx tsx --test tests/appearance-contract.test.ts` | `5` pass / `0` fail |
| Existing theme contracts | `npx tsx --test tests/theme-style.test.ts` | `16` pass / `0` fail |
| Typecheck | `npm run typecheck` | pass, exit `0` |
| Scoped lint | `npx eslint src/components/appearance-panel.tsx tests/appearance-contract.test.ts` | pass, exit `0` |
| Diff check | `git diff --check` | pass, no output |
| Full suite | `npm test` | `523` pass / `0` fail |

## Self-review

- Reviewed the exact Appearance source and new contract test against every Task 4 brief item.
- Confirmed the production diff changes only `src/components/appearance-panel.tsx`.
- Confirmed there are exactly two canonical style cases, two style cards, six palette choices, two single-selection groups, two mounted value gates, and two non-empty value guards.
- Confirmed no 10/11px readable copy, arbitrary pixel radius classes, three-column style rule, hard-coded visible style labels, Vega/default preview, provider widening, or one-time migration prompt remains.
- Confirmed no Settings shell, globals, provider, primitive, consumer, package, plan, or unrelated changes entered the Task 4 diff.

## Commit

Conventional commit subject: `feat(ui): refine appearance selector` (the Task 4 commit containing this report; final hash is reported after commit creation).

## Concerns

- The required Graphify query remains blocked by the known stale uv Python launcher path above. This did not affect direct source, focused test, typecheck, lint, full-suite, or diff verification.
- The pre-existing untracked `docs/` directory remains outside this task and was intentionally not staged.
