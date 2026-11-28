import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

function source(path: string) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

/** Comments describe behavior but must not satisfy a code contract. */
function code(text: string) {
  return text
    .split("\n")
    .filter((line) => !/^\s*(\/\/|\*|\/\*)/.test(line))
    .join("\n");
}

const todos = code(source("src/components/shared/tasks/ai-composer.tsx"));
const mock = code(source("src/components/shared/ai/log-mock-flow.tsx"));
const dialog = code(source("src/components/dialog.tsx"));
const parent = code(
  source("src/app/(workspace)/ask/_ask/ask-view-hairline.tsx"),
);

test("TodoAiComposer seeds every suggestion field into editable review state", () => {
  assert.match(todos, /initialSuggestion\?: InitialSuggestion/);
  assert.match(todos, /title: string/);
  assert.match(todos, /dueDate\?: string/);
  assert.match(todos, /priority\?: "low" \| "normal" \| "high"/);
  assert.match(todos, /notes\?: string/);
  assert.match(todos, /useState\(initialSuggestion\?\.title \?\? ""\)/);
  assert.match(todos, /useState\(initialSuggestion\?\.dueDate \?\? ""\)/);
  assert.match(todos, /suggestionDraft\(initialSuggestion\)/);
  assert.match(todos, /priority: suggestion\.priority \?\? "normal"/);
  assert.match(todos, /notes: suggestion\.notes \?\? ""/);
  assert.match(todos, /useState\(Boolean\(initialSuggestion\)\)/);
  assert.match(todos, /label="Priority"/);
  assert.match(todos, /label="Notes"/);
});

test("todo dirty state follows unsaved work and clears on reset", () => {
  assert.match(todos, /onDirtyChange\?: \(dirty: boolean\) => void/);
  assert.match(todos, /const dirty = Boolean\(prompt \|\| date \|\| endDate \|\| draft\)/);
  assert.match(todos, /onDirtyChange\?\.\(dirty\)/);
  const reset = todos.match(/function reset\(\) \{([\s\S]*?)\n  \}/)?.[1];
  assert.ok(reset, "the clean reset exists");
  for (const field of ["Prompt", "Date", "EndDate", "Draft", "Reviewing", "Selected"]) {
    assert.match(reset, new RegExp(`set${field}\\(`));
  }
  assert.match(todos, /onClick=\{reset\}/, "Discard uses the clean reset");
});

test("todo apply remains server-confirmed and retains stale-write protection", () => {
  const apply = todos.match(/async function apply\(\) \{([\s\S]*?)\n  \}/)?.[1];
  assert.ok(apply, "the tool owns Apply");
  assert.match(apply, /api\("\/api\/todos\/apply"/);
  assert.match(apply, /idempotencyKey: token\.current/);
  assert.ok(
    apply.indexOf("await invalidateTodos()") < apply.indexOf("onApplied?.(selected.length)"),
    "the callback fires only after server success and cache invalidation",
  );
  assert.ok(
    apply.indexOf("onApplied?.(selected.length)") < apply.indexOf("reset()"),
    "a failed request cannot clean the draft",
  );
  assert.match(todos, /version\?: number/);
  assert.ok(
    !parent.includes("/api/todos/apply"),
    "the parent never writes todo operations itself",
  );
});

test("LogMockFlow reports paste, images, and review edits until clean handoff or discard", () => {
  assert.match(mock, /onDirtyChange\?: \(dirty: boolean\) => void/);
  assert.match(mock, /const dirty = Boolean\(paste \|\| images\.length \|\| draft\)/);
  assert.match(mock, /onDirtyChange\?\.\(dirty\)/);
  const reset = mock.match(/function reset\(\) \{([\s\S]*?)\n  \}/)?.[1];
  assert.ok(reset, "the clean reset exists");
  for (const field of ["Paste", "Images", "Draft", "Reviewing"]) {
    assert.match(reset, new RegExp(`set${field}\\(`));
  }
  assert.match(mock, /onDiscard=\{reset\}/);
  assert.ok((mock.match(/onHandoff\?\.\(\);\s*reset\(\)/g) ?? []).length >= 2);
});

test("the tool dialog body is the only vertical scroll owner", () => {
  for (const [name, flow] of [["todos", todos], ["mock", mock]] as const) {
    assert.ok(!/overflow-y-auto/.test(flow), `${name} has no inner vertical scroller`);
    assert.ok(!/flex min-h-0 flex-1 flex-col/.test(flow), `${name} roots do not stretch`);
    assert.ok(!/min-h-0 flex-1/.test(flow), `${name} has no competing flex scroll region`);
  }
  assert.match(dialog, /bodyClassName \?\?\s*"min-h-0 flex-1 overflow-y-auto overscroll-contain/);
  assert.match(parent, /bodyClassName=\{cn\(\s*"min-h-0 overflow-y-auto overscroll-contain/);
});

test("dialog visible title is opt-in and preserves the accessible title id", () => {
  assert.match(dialog, /showTitle\?: boolean/);
  assert.match(dialog, /showTitle = false/);
  assert.match(dialog, /aria-labelledby=\{titleId\}/);
  assert.match(dialog, /<h2\s+id=\{titleId\}/);
  assert.match(dialog, /showTitle \? "font-serif text-\[22px\]/);
  assert.match(dialog, /: "sr-only"/);
  assert.match(dialog, /\[@media\(pointer:coarse\)\]:size-11/);
});

test("mock extraction still only hands a reviewed draft to the real form", () => {
  assert.match(mock, /onLogMock\(reviewed\)/);
  assert.match(mock, /onLogMock\(\{\s*values: parsed\.values/);
  assert.ok(!/api\([^\n]*mock|\/api\/attempts|method: "(?:PUT|PATCH|DELETE)"/.test(mock));
});

test("tool files contain no parent approval, receipt, or navigation logic", () => {
  for (const flow of [todos, mock, dialog]) {
    assert.ok(
      !/setPendingDraft|setApprovalStatus|ApprovalCard|requestMockPrefill|useRouter|router\.(?:push|replace)|onApprove/.test(flow),
      "the parent remains the sole owner of approval and navigation",
    );
  }
});
