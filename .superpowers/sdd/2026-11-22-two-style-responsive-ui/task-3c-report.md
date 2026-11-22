# Task 3C Report — Dialog, alert, sheet, and drawer primitives

## Scope

Implemented Task 3C only:

- `src/components/ui/dialog.tsx`
- `src/components/ui/alert-dialog.tsx`
- `src/components/ui/sheet.tsx`
- `src/components/ui/drawer.tsx`
- `tests/ui-style-contract.test.ts`

No consumers, globals, forms, choice/navigation primitives, Appearance code, business logic, package manifests, lockfiles, or unrelated source files were changed. The pre-existing untracked `docs/` directory was left untouched and is excluded from the Task 3C commit.

Ledger context was limited to rulings R3, R8, R10, and R11 as requested.

## Required graph and shadcn documentation

### Graphify

Attempted before source discovery:

```text
graphify query "Task 3C overlay primitive contracts for dialog alert-dialog sheet drawer and ui style tests"
```

Known launcher failure reproduced and recorded:

```text
did not find executable at 'C:\Users\ankit\AppData\Roaming\uv\python\cpython-3.13-windows-x86_64-none\python.exe': The system cannot find the path specified.
```

Exit code: `1`. No graph files were modified.

### shadcn

Ran the project-aware, read-only documentation command without `add`, `init`, overwrite flags, dependency installation, or manifest changes:

```text
npx shadcn@latest docs dialog alert-dialog sheet drawer
```

Resolved and fetched the current documentation pages:

- Dialog: <https://ui.shadcn.com/docs/components/radix/dialog>
- Alert Dialog: <https://ui.shadcn.com/docs/components/radix/alert-dialog>
- Sheet: <https://ui.shadcn.com/docs/components/radix/sheet>
- Drawer: <https://ui.shadcn.com/docs/components/radix/drawer>

## TDD evidence

### RED

Extended `tests/ui-style-contract.test.ts` first with source-region assertions covering:

- floating surface radius, rule/background/elevation tokens and forbidden legacy classes;
- Dialog/Sheet close-control visual size, 44px hit contract, global focus, semantic disabled states, and `data-icon` sizing;
- title and description typography floors;
- retained Radix/Vaul composition and exports;
- retained Sheet side/options/dvh behavior and Drawer physics/handle/single-scroll/safe-area behavior.

Then ran:

```text
npx tsx --test tests/ui-style-contract.test.ts
```

Verified RED against unchanged production sources: `18` tests, `14` passed, `4` failed for the expected missing Task 3C contracts:

1. `DialogContent: rounded-floating`
2. `DialogClose: size-[var(--control-height-sm)]`
3. `DialogTitle: font-serif`
4. legacy Dialog `focus-visible:ring-*`

### GREEN

After the minimal source changes, the first focused rerun reached `17/18`: behavior was correct, but one Sheet-side assertion accidentally depended on whether the string literal followed the property on the same physical line. The assertion was corrected to accept whitespace while preserving the same side-specific class contract; no production code was changed for that test-only correction.

Final focused run:

```text
npx tsx --test tests/ui-style-contract.test.ts
```

Result: `18` passed, `0` failed.

## Implementation

- Dialog and AlertDialog content now use `rounded-floating` with the existing rule/background and `shadow-pop` contracts; AlertDialog uses the rem width calculation and no longer suppresses focus fallback.
- Dialog and Sheet close controls use the small control visual size plus `tap-target`, token radius and quick color/background transition, semantic disabled states, global focus, and `svg[data-icon]` sizing.
- Dialog/Alert titles use `--type-panel-title`; Sheet/Drawer titles use `--type-section-title`; all descriptions use `--type-secondary`, muted semantic color, relaxed leading, and pretty wrapping.
- Sheet retains its side API and applies `--radius-floating` only to exposed corners; its max width is the equivalent `28.75rem`.
- Drawer retains Vaul defaults, portal/overlay, drag handle, one scroll body, max-dvh, and title export while using floating top corners, `shadow-pop`, and the `0.75rem` safe-area fallback.

## Verification

| Check | Command | Result |
|---|---|---|
| Focused RED | `npx tsx --test tests/ui-style-contract.test.ts` | expected `14` pass / `4` fail before source edits |
| Focused GREEN | `npx tsx --test tests/ui-style-contract.test.ts` | `18` pass / `0` fail |
| Typecheck | `npm run typecheck` | pass, exit `0` |
| Scoped lint | `npx eslint tests/ui-style-contract.test.ts src/components/ui/dialog.tsx src/components/ui/alert-dialog.tsx src/components/ui/sheet.tsx src/components/ui/drawer.tsx` | pass, exit `0` |
| Diff check | `git diff --check` | pass, no output |
| Full suite | `npm test` | `517` pass / `0` fail |

## Self-review

- Reviewed the exact four permitted source files and the focused test diff.
- Confirmed Dialog/Alert/Sheet/Drawer Root, Trigger, Portal, Overlay, Content, Close where applicable, Title, Description, Alert Action/Cancel, and all prior public exports remain intact.
- Confirmed Sheet still exposes `side`, `showCloseButton`, and `overlayClassName`; keeps `86vw`, dvh sizing, and side-local borders/motion classes.
- Confirmed Drawer still defaults `shouldScaleBackground={false}` and `fixed={true}`, retains its drag handle, and contains exactly one `overflow-y-auto` body.
- Confirmed the four overlay sources contain no `disabled:opacity-*`, `focus-visible:ring-*`, `focus-visible:outline-none`, or floating-content `rounded-panel` regressions.
- Confirmed no global CSS, consumer, package, or manifest changes entered the diff.

## Commit

Conventional commit subject: `feat(ui): refine overlay primitives` (the Task 3C commit containing this report; final hash is reported after commit creation).

## Concerns

- The required Graphify query remains blocked by the known stale uv Python launcher path above. This did not affect source/test verification.
- The pre-existing untracked `docs/` directory remains outside this task and was intentionally not staged.
