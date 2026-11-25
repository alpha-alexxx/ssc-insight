import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

/**
 * Structural contract for the /ask surface.
 *
 * These read the sources and assert the properties that were wrong before, so
 * a later edit cannot silently reintroduce them:
 *   · the transcript must not nest ChatScroll's scroller inside ScrollArea
 *   · ChatScroll must get a real height, not `min-h-full`
 *   · the empty state must not own a scroll container
 *   · one mobile history control, model label in the composer, tools centered
 */

function source(path: string) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

const view = source("src/app/(workspace)/ask/_ask/ask-view-hairline.tsx");
const empty = source("src/app/(workspace)/ask/_ask/ask-empty-state.tsx");

/** Strip line comments so prose about a pattern cannot satisfy an assertion. */
function code(text: string) {
  return text
    .split("\n")
    .filter((line) => !/^\s*(\/\/|\*|\/\*)/.test(line))
    .join("\n");
}

const viewCode = code(view);
const emptyCode = code(empty);

test("the empty state owns no scroll container — the host provides the one scroller", () => {
  assert.ok(
    !/from "@\/components\/ui\/scroll-area"/.test(emptyCode),
    "ask-empty-state must not import ScrollArea",
  );
  assert.ok(
    !/<ScrollArea/.test(emptyCode),
    "ask-empty-state must not render ScrollArea",
  );
  // A `h-full` viewport inside the host's scroller would be the nested case.
  assert.ok(
    !/viewportClassName/.test(emptyCode),
    "ask-empty-state must not declare a scroll viewport",
  );
});

test("ChatScroll is never wrapped in ScrollArea (one scroller per state)", () => {
  // Find each <ScrollArea …>…</ScrollArea> region and assert ChatScroll is not inside.
  const regions = [...viewCode.matchAll(/<ScrollArea\b[\s\S]*?<\/ScrollArea>/g)];
  for (const [region] of regions) {
    assert.ok(
      !/<ChatScroll/.test(region),
      "ChatScroll must not be nested inside ScrollArea",
    );
  }
});

test("the populated transcript gives ChatScroll a real height, not min-h-full", () => {
  const chatScroll = viewCode.match(/<ChatScroll[\s\S]*?>/)?.[0] ?? "";
  assert.ok(chatScroll, "the view should render ChatScroll");
  assert.match(
    chatScroll,
    /className="[^"]*\bh-full\b/,
    "ChatScroll needs h-full so its inner scroller resolves against a real height",
  );
  assert.ok(
    !/className="[^"]*\bmin-h-full\b/.test(chatScroll),
    "min-h-full leaves the inner scroller unbounded",
  );
});

test("exactly one history control below lg, and it opens the sheet", () => {
  const iconButtons = [
    ...viewCode.matchAll(/aria-label="Conversation history"[\s\S]{0,240}?<\/Button>/g),
  ];
  assert.equal(
    iconButtons.length,
    1,
    "the mobile history entry point is duplicated",
  );
  assert.match(iconButtons[0]![0], /setHistorySheet\(true\)/);
  // Its hide-at-lg lives on the wrapper (a Button's own `className` cannot win
  // against the base `inline-flex` — see the dedicated test below).
  const before = viewCode.slice(0, viewCode.indexOf('aria-label="Conversation history"'));
  assert.match(
    before.slice(-200),
    /<span className="inline-flex lg:hidden">/,
    "the icon button is wrapped and hidden from lg up",
  );
  // The desktop rail toggle still exists, also wrapped.
  assert.match(viewCode, /<span className="hidden lg:inline-flex">/);
});

test("the header carries no model badge", () => {
  // The header used to show the answering model in a Badge beside the title
  // (first desktop-only, then at every width). It is deliberately gone: the
  // title is a plain heading again and the header imports neither primitive.
  assert.ok(
    !/\bBadge\b/.test(viewCode),
    "the header must not render a model Badge",
  );
  assert.ok(
    !/from "@\/components\/badge"/.test(viewCode),
    "the Badge import is dead once the header badge is removed",
  );
  assert.ok(
    !/from "@\/components\/tooltip"/.test(viewCode),
    "the Tooltip existed only to explain the badge; it is dead too",
  );
  // The heading itself is a single plain line — no sibling chip on it.
  const heading = viewCode.match(/<h1[\s\S]{0,220}?<\/h1>/)?.[0] ?? "";
  assert.ok(heading, "the view should still render an h1");
  assert.match(heading, />\s*Ask AI\s*</, "the title is plain 'Ask AI'");
  // The subtitle survives, still phone-hidden.
  assert.match(
    viewCode,
    /hidden truncate text-\[12px\][^"]*sm:block/,
    "the subtitle is unchanged",
  );
  // The in-input chip stays gone as well: no model label anywhere in the view.
  assert.ok(
    !/truncateModelLabel|modelLabel/.test(viewCode),
    "no model label is rendered in the composer either",
  );
});

test("breakpoint visibility on a Button rides a wrapper, never the Button", () => {
  // `Button` appends `className` raw and always ships `inline-flex`, which sits
  // later in the stylesheet than `.hidden` — so `hidden` in a Button's OWN
  // className never wins. Children (a `<span className="hidden md:inline">`
  // label inside the button) are ordinary elements and are fine, so this checks
  // each Button's opening tag only.
  const openingTags = [...viewCode.matchAll(/<Button\b[^>]*>/g)].map(
    ([tag]) => tag,
  );
  assert.ok(openingTags.length > 0, "the view should render Buttons");
  for (const tag of openingTags) {
    const own = tag.match(/className="([^"]*)"/)?.[1] ?? "";
    assert.ok(
      !/\bhidden\b/.test(own),
      `a Button cannot be hidden via its own className: ${tag.slice(0, 90)}`,
    );
    assert.ok(
      !/\b(sm|md|lg):hidden\b/.test(own),
      `a Button cannot carry a responsive hide: ${tag.slice(0, 90)}`,
    );
  }
  // Both history controls the user sees must be wrapped.
  assert.match(viewCode, /<span className="hidden lg:inline-flex">\s*<Button/);
  assert.match(viewCode, /<span className="inline-flex lg:hidden">\s*<Button/);
});

test("both mode tools open in a centered Dialog with a hidden-but-live scrollbar", () => {
  for (const title of ["Plan todos with AI", "Log a mock with AI"]) {
    const block = viewCode.match(
      new RegExp(`<Dialog[\\s\\S]*?title="${title}"[\\s\\S]*?</Dialog>`),
    )?.[0];
    assert.ok(block, `${title} should render in a Dialog`);
    assert.match(
      block,
      /bodyClassName=\{cn\(/,
      `${title}'s body must use the no-scrollbar recipe`,
    );
    assert.match(
      block,
      /NO_SCROLLBAR/,
      `${title}'s body hides the bar`,
    );
    // Hiding the bar must not be achieved by dropping the scroll container.
    assert.match(
      block,
      /overflow-y-auto/,
      `${title}'s body must still be scrollable`,
    );
  }
  // The tools must no longer be sheets. Inspect each <Sheet>…</Sheet> block on
  // its own; matching the title across the whole file would let a later block
  // satisfy a lazy pattern meant for an earlier one.
  const sheetBlocks = [
    ...viewCode.matchAll(/<Sheet\b[\s\S]*?<\/Sheet>/g),
  ].map(([block]) => block);
  assert.ok(sheetBlocks.length > 0, "the history sheet should remain");
  for (const block of sheetBlocks) {
    assert.ok(
      !/Plan todos with AI|Log a mock with AI/.test(block),
      "mode tools should not be Sheets",
    );
  }
  // The one remaining sheet is the mobile history list.
  assert.ok(
    sheetBlocks.some((block) => /title="Conversation history"/.test(block)),
    "mobile history still opens in a sheet",
  );
});

test("the no-scrollbar helper hides the bar and never disables overflow", () => {
  const helper = source("src/lib/ui-scroll.ts");
  assert.match(helper, /scrollbar-width:none/);
  assert.match(helper, /::-webkit-scrollbar\]:hidden/);
  assert.ok(
    !/overflow-hidden/.test(helper),
    "hiding the bar must not disable scrolling",
  );
});

test("the greeting was reduced to a single compact line", () => {
  // The old two-line greeting used a nested block span inside the h2.
  assert.ok(
    !/<h2[\s\S]{0,400}?<span className="mt-1 block/.test(emptyCode),
    "the greeting should not carry the second stacked line",
  );
  assert.match(emptyCode, /text-\[1\.0625rem\]/, "greeting uses the compact size");
});

test("starter cards were tightened, not merely restyled", () => {
  assert.match(emptyCode, /px-3 py-2\.5/, "cards use the compact padding");
  assert.match(emptyCode, /size-6/, "icon tiles shrank");
  assert.match(emptyCode, /line-clamp-1/, "the preview is a single line");
});
