# Task 3A Report — Button and form primitives

## Status

Implemented Task 3A only: Button, Spinner, Input, Textarea, Field, and Select primitive composition plus the focused UI style contract test. Numeric/color token ownership remains in Task 2; no global token values or consumers were changed.

## Documentation evidence

### Graphify

Attempted before source discovery:

```text
graphify query "How are the Button, Input, Textarea, Field, Select, and Spinner UI primitives implemented and tested for the two-style responsive UI Task 3A?"
```

Known launcher failure reproduced (exit 1):

```text
did not find executable at 'C:\Users\ankit\AppData\Roaming\uv\python\cpython-3.13-windows-x86_64-none\python.exe': The system cannot find the path specified.
```

No Graphify output files were changed.

### shadcn project info

Ran `npx shadcn@latest info --json` successfully. Relevant output:

- Framework: Next.js 16.4.6, App Router/RSC, TypeScript.
- Tailwind: v4; configured CSS file is `src/app/globals.css` (not modified).
- shadcn base: Radix; style: New York; icon library: Lucide.
- Aliases resolve UI primitives to `@/components/ui`.
- Existing registry component inventory included Button, Field, Input, and Select; Spinner and Textarea were not installed or overwritten.

Ran `npx shadcn@latest docs button input textarea field select spinner` successfully. Returned documentation/evidence URLs:

| Primitive | Documentation | Example/API |
| --- | --- | --- |
| Button | https://ui.shadcn.com/docs/components/radix/button | https://ui.shadcn.com/code/apps/v4/registry/bases/radix/examples/button-example.tsx |
| Input | https://ui.shadcn.com/docs/components/radix/input | https://ui.shadcn.com/code/apps/v4/registry/bases/radix/examples/input-example.tsx |
| Textarea | https://ui.shadcn.com/docs/components/radix/textarea | https://ui.shadcn.com/code/apps/v4/registry/bases/radix/examples/textarea-example.tsx |
| Field | https://ui.shadcn.com/docs/components/radix/field | https://ui.shadcn.com/code/apps/v4/registry/bases/radix/examples/field-example.tsx |
| Select | https://ui.shadcn.com/docs/components/radix/select | https://ui.shadcn.com/code/apps/v4/registry/bases/radix/examples/select-example.tsx · https://www.radix-ui.com/docs/primitives/components/select.md |
| Spinner | https://ui.shadcn.com/docs/components/radix/spinner | https://ui.shadcn.com/code/apps/v4/registry/bases/radix/examples/spinner-example.tsx |

The six shadcn documentation pages were also fetched successfully (HTTP 200). No `add`, `init`, `apply`, install, overwrite, or package-manifest command was run.

## TDD evidence

### RED

Created `tests/ui-style-contract.test.ts` before production edits, then ran:

```text
npx tsx --test tests/ui-style-contract.test.ts
```

Verified expected RED (exit 1):

```text
tests 6
pass 0
fail 6
```

The failures mapped directly to the missing Task 3A contracts:

1. `buttonVariants` was not exported.
2. Button still used disabled opacity and a component-local accent focus outline.
3. Spinner did not exist.
4. Textarea did not exist and Input lacked the composed state contract.
5. Field lacked tokenized readable floors and semantic disabled treatment.
6. Select lacked the required token radii/states/elevation contract.

### GREEN

After the smallest scoped primitive implementation, the first rerun passed 5/6. The remaining failure was a test-pattern mismatch: Spinner correctly defaulted its overridable `data-icon` through destructuring (`dataIcon = "inline-start"`), while the source assertion expected a literal JSX attribute. The test was corrected to assert both the default assignment and forwarded `data-icon={dataIcon}`.

Final command:

```text
npx tsx --test tests/ui-style-contract.test.ts
```

Final result (exit 0):

```text
tests 6
pass 6
fail 0
```

## Implementation summary

- Button now exports `buttonVariants`, provides all five required variants, consumes control/type/duration tokens, uses semantic disabled styling without opacity, relies on the global focus contract, and scopes icon sizing to `svg[data-icon]` only.
- Spinner is a standalone decorative Lucide `Loader2` primitive with forwarded SVG props, a default inline-start icon contract, spin animation, and reduced-motion fallback. Button gained no loading API.
- Input and Textarea now expose data slots, explicitly compose token geometry/padding/type, and share invalid, readonly, disabled, placeholder, and transition semantics without disabled opacity.
- Field keeps the shadcn API, grouped semantics, alert role, and error de-duplication while using tokenized description/error floors and semantic disabled/selected colors without a manual dark override.
- Select preserves the Radix API and behavior while tokenizing trigger/item/content geometry, invalid and disabled states, floating elevation, and icon sizing through `data-icon` selectors rather than Lucide size props.

## Verification

All required verification passed:

| Check | Result |
| --- | --- |
| `npx tsx --test tests/ui-style-contract.test.ts` | PASS — 6/6 |
| `npm run typecheck` | PASS — `tsc --noEmit` |
| `npx eslint tests/ui-style-contract.test.ts src/components/ui/button.tsx src/components/ui/input.tsx src/components/ui/field.tsx src/components/ui/select.tsx src/components/ui/spinner.tsx src/components/ui/textarea.tsx` | PASS — no findings |
| `git diff --check` | PASS — no output |

## Self-review and scope audit

- Reviewed the complete scoped diff.
- Changed only the four allowed existing primitives, two allowed new primitives, the required focused test, and this required report.
- Did not modify `src/app/globals.css`, consumers, choice/navigation/overlay primitives, Appearance, package manifests/lockfiles, or plan documents.
- Did not install or overwrite shadcn registry files.
- Did not dispatch subagents.
- Pre-existing untracked `docs/` remains untouched and excluded from the Task 3A commit.

## Commit

Conventional commit subject: `feat(ui): refine button and form primitives` (the Task 3A commit containing this report; final hash is reported after commit creation).

## Concerns

- Graphify remains unavailable because its uv-managed Python launcher points at a missing interpreter; the required query could not return project context.
- Per ruling R8, verification used the existing coherent dependency tree without changing manifests. Dependency state outside this worktree remains a baseline environmental dependency.
- No consumer or browser changes were in scope; this slice therefore relies on contract tests, TypeScript, and scoped lint rather than consumer-level visual QA.
