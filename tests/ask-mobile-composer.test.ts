import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

/**
 * Contract for the /ask mobile composer — the phone rebuild of March's
 * "conjusted" surface. Every assertion names a defect that shipped before it:
 *
 *   1. The root was sized `100dvh − 52px − 2rem` while the real chrome is
 *      56px header + 16px×2 wrapper padding = 5.5rem, so the page — not the
 *      conversation — scrolled, and the Android keyboard pushed it further.
 *   2. Three mode chips (Chat/Todos/Mock) plus the ring plus the model badge
 *      wrapped across two rows inside a 375px composer.
 *   3. The context panel had no Sheet below lg: the popover-only regression
 *      failed tests/ask-context-panel.test.ts.
 *   4. The header's "+" was a labelled `sm` Button rendering icon-only on
 *      phones — a 28px lozenge, not a square, beside a 36px history button.
 *   5. The composer field was one dense row (~32px) and the send button 32px —
 *      under every touch minimum.
 *   6. The four-part disclaimer wrapped to two lines on phones.
 */

function source(path: string) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

/** Strip line comments so prose about a pattern cannot satisfy an assertion. */
function code(text: string) {
  return text
    .split("\n")
    .filter((line) => !/^\s*(\/\/|\*|\/\*)/.test(line))
    .join("\n");
}

const view = code(source("src/app/(workspace)/ask/_ask/ask-view-hairline.tsx"));
const composer = code(source("src/components/prompt-composer.tsx"));
const page = code(source("src/app/(workspace)/ask/page.tsx"));

test("the root is sized by the real chrome, not a guessed header height", () => {
  // 56px sticky header + the TWO nested py-4 wrappers (SidebarInset's main and
  // .workspace-content) = 7.5rem on phones; md:py-5 twice = 8.5rem from md.
  // The first cut guessed one wrapper and left 32px of page scroll.
  assert.match(
    view,
    /h-\[calc\(100dvh-5\.5rem\)\]/,
    "mobile root height = 56px header + top wrapper padding; the bottom padding is returned via -mb-8",
  );
  assert.match(
    view,
    /md:h-\[calc\(100dvh-6rem\)\]/,
    "md: the height adds the returned bottom padding back (3.5+2.5)",
  );
  assert.ok(
    !/app-header-h/.test(view),
    "the phantom --app-header-h variable is gone (it was never defined)",
  );
});

test("mobile modes live in one select pill; the tablist is desktop-only", () => {
  assert.match(
    view,
    /import \{ PillSelect \} from "@\/components\/pill-select"/,
    "the house select is the mode menu",
  );
  assert.match(
    view,
    /<PillSelect[\s\S]{0,600}?label="Assistant mode"/,
    "the mode pill is a labelled PillSelect",
  );
  const tablist = view.match(/role="tablist"[\s\S]{0,200}className="([^"]*)"/);
  assert.ok(tablist, "the desktop tablist still exists");
  assert.match(
    tablist[1],
    /hidden/,
    "the chips are hidden on phones — no second mode UI",
  );
  // The old toolbar wrapped; the rebuilt one must not.
  assert.ok(
    !/flex w-full min-w-0 flex-wrap/.test(view),
    "the toolbar never wraps to a second row",
  );
});

test("the context ring opens a Popover on lg+ and a bottom Sheet below lg", () => {
  assert.match(view, /<Popover\b/, "the desktop Popover stays");
  const sheets = view.match(/<Sheet\b[\s\S]*?<\/Sheet>/g) ?? [];
  assert.ok(
    sheets.some((block) => /Context window & plan limits/.test(block)),
    "below lg the same body opens in a Sheet (ask-context-panel.test.ts)",
  );
  const ringSheet = view.match(
    /aria-label="Open context window[^"]*"[\s\S]{0,300}?className="([^"]*)"/g,
  );
  assert.ok(ringSheet, "a second ring trigger exists for the Sheet");
  assert.ok(
    ringSheet.some((cls) => /lg:hidden/.test(cls)),
    "the Sheet trigger is mobile-only",
  );
});

test("the header's actions are two identical square icon buttons on phones", () => {
  assert.match(
    view,
    /aria-label="New chat"/,
    "the + button is a real icon button with its own label",
  );
  const sizeNine = view.match(/className="size-9"/g) ?? [];
  assert.ok(
    sizeNine.length >= 2,
    "both header actions are 36×36 — the + no longer renders as a wide sm pill",
  );
  // The dedicated icon button must be the phone rendering, gated md:hidden —
  // the labelled sm pill is hidden below md, so phones never see a text-width
  // "+" lozenge.
  assert.match(
    view,
    /className="inline-flex md:hidden"[\s\S]{0,400}?aria-label="New chat"/,
    "the + icon button owns the phone range outright",
  );
});

test("the composer field and send button clear the touch minimum on phones", () => {
  assert.match(
    composer,
    /min-h-\[52px\][\s\S]{0,400}?sm:min-h-0/,
    "the text field breathes on phones, desktop keeps its density",
  );
  const send = composer.match(
    /type=\{action === "send" \? "submit" : "button"\}[\s\S]{0,600}?className=\{`([^`]*)`\}/,
  );
  assert.ok(send, "the send button class is found");
  assert.match(send[1], /size-10/, "40px send on phones");
  assert.match(send[1], /sm:size-8/, "desktop keeps the 32px send");
  assert.match(
    composer,
    /min-h-11[\s\S]{0,80}?sm:min-h-0/,
    "the action row is a 44px touch row on phones",
  );
});

test("the disclaimer is one line on phones and whole from sm up", () => {
  assert.match(
    view,
    /className="hidden sm:inline">Latest 20 full mocks</,
    "the middle facts fold away below sm",
  );
  assert.match(view, /Read-only/, "the promise is still made");
  assert.match(view, /Answers can be wrong/, "so is the caveat");
});

test("the page pins the keyboard behavior with interactiveWidget", () => {
  assert.match(
    page,
    /interactiveWidget: "resizes-content"/,
    "the Android keyboard resizes dvh instead of sliding the page up",
  );
});

test("the conversation column contains its scroll on phones", () => {
  assert.match(
    view,
    /overscroll-contain/,
    "rubber-banding never chains to the page scroller",
  );
});

test("the mode-tool dialogs hug their content instead of stretching", () => {
  // flex-1 on the dialog body (and on the flow roots inside it) let the body
  // grow to fill the 85dvh panel, parking short content above ~260px of dead
  // panel. The body must scroll; the flows must hug.
  assert.ok(
    !/bodyClassName=\{cn\(\s*"min-h-0 flex-1/.test(view),
    "the ask dialog bodies no longer stretch with flex-1",
  );
  assert.match(
    view,
    /pb-\[max\(12px,env\(safe-area-inset-bottom\)\)\]/,
    "the body respects the gesture-nav inset like ai-plan-sheet does",
  );
  const flow = code(
    source("src/components/shared/ai/log-mock-flow.tsx"),
  );
  const stretchRoots = flow.match(/flex min-h-0 flex-1 flex-col/g) ?? [];
  assert.equal(
    stretchRoots.length,
    0,
    "LogMockFlow step roots hug their content; the dialog body owns scrolling",
  );
});

test("the composer dock reaches the screen edge", () => {
  // The workspace's two nested py-4 wrappers left a 32px (40px md) void under
  // the disclaimer; the root gives that padding back with a negative margin
  // and adds it to the column height instead.
  assert.match(view, /-mb-8/, "cancels the wrappers' 2×16px bottom padding");
  assert.match(view, /md:-mb-10/, "and 2×20px from md");
  assert.match(
    view,
    /h-\[calc\(100dvh-5\.5rem\)\]/,
    "the column height adds the returned padding back",
  );
});

test("the tool footers read as sentences, not squeezed slivers", () => {
  const todos = code(source("src/components/shared/tasks/ai-composer.tsx"));
  // The footer row stacks on phones, so the info sentence keeps its measure
  // and the buttons get their own row.
  assert.match(
    todos,
    /flex flex-col gap-2\.5 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between/,
    "the todos footer stacks below sm and splits inline from sm",
  );
  assert.ok(
    !/flex min-w-0 flex-1 items-start gap-2 text-xs/.test(todos),
    "the info paragraph is no longer a squeezed flex-1 sliver",
  );
  assert.match(
    todos,
    /grid grid-cols-2 items-end gap-3/,
    "the date inputs share a baseline even when one label wraps",
  );
  // The mock footer's parser note must not truncate mid-word.
  const flow = code(source("src/components/shared/ai/log-mock-flow.tsx"));
  const note = flow.match(/Cross-checked[^"']*\.["']/)?.[0] ?? "";
  assert.ok(note, "the parser note text is present");
  assert.ok(
    !/className="truncate"\s*>\s*\{aiEnabled/.test(flow),
    "the mock footer note is not truncated",
  );
});
