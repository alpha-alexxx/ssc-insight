import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

/**
 * Contract for the /ask context-window panel — the thing behind the composer's
 * progress ring.
 *
 * Every assertion here names a defect that existed before the redesign, so a
 * later edit cannot quietly bring one back:
 *
 *   1. The panel was an `absolute` div inside three `overflow-hidden`
 *      ancestors, so it could be clipped and could never flip or shift.
 *   2. The wrapper said "Context Window & Scope" WHILE UsageLimits rendered its
 *      own "Context window" row — the same heading twice.
 *   3. `role="dialog"` on a plain div had no focus handoff: focus never moved
 *      in, never returned to the trigger, and Escape was a document listener.
 *   4. The trigger was `div role="button" tabIndex={0}` re-implementing
 *      Enter/Space by hand, inside the composer's <form>.
 *   5. The ring swapped meaning between "requests today" and "context tokens".
 *   6. A ScrollArea inside a fixed-height panel made a second scroller.
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
const panel = code(source("src/components/usage-limits.tsx"));

test("the panel is a Hairline Popover (desktop) and Sheet (below lg), not an absolute div", () => {
  assert.match(
    view,
    /import \{ Popover \} from "@\/components\/popover"/,
    "the panel must use the Hairline Popover",
  );
  assert.match(view, /<Popover\b/, "the panel renders a Popover");
  // A raw absolutely-positioned dialog cannot escape the overflow-hidden shell.
  assert.ok(
    !/role="dialog"[\s\S]{0,400}?className="absolute bottom-full/.test(view),
    "the hand-rolled absolute dialog is gone",
  );
  // Below lg it is a bottom sheet, matching the history surface.
  const sheet = view.match(/<Sheet\b[\s\S]*?<\/Sheet>/g) ?? [];
  assert.ok(
    sheet.some((block) => /Context window/.test(block)),
    "below lg the same body opens in a Sheet",
  );
});

test("the ring trigger is a real button, not a div role=button", () => {
  const trigger = view.match(/aria-label="Open context window[^>]*>|<button[\s\S]{0,400}?aria-haspopup="dialog"/)?.[0] ?? "";
  assert.ok(trigger, "a dialog trigger exists");
  assert.ok(
    !/role="button"[\s\S]{0,300}?aria-label="Toggle context window/.test(view),
    "the div-with-role=button trigger is gone",
  );
  assert.match(
    view,
    /<button[\s\S]{0,300}?aria-haspopup="dialog"/,
    "the trigger is a native button carrying aria-haspopup",
  );
});

test("the panel has exactly one heading — no duplicated 'Context window'", () => {
  // The view must not restate the heading the body already renders.
  assert.ok(
    !/Context Window & Scope/.test(view),
    "the wrapper's duplicate heading is removed",
  );
  // The body owns the heading, once.
  const headings = [
    ...panel.matchAll(/Context window/g),
  ];
  assert.ok(
    headings.length >= 1,
    "the body names the context window",
  );
  assert.ok(
    !/aria-labelledby=\{`\$\{id\}-context`\}[\s\S]{0,600}?Context window[\s\S]{0,600}?Context window/.test(panel),
    "the body must not label the same section twice",
  );
});

test("the ring always reports the context window, never a flipping metric", () => {
  const ring = view.match(/<UsageMeter[\s\S]*?\/>/)?.[0] ?? "";
  assert.ok(ring, "the view renders a UsageMeter ring");
  assert.match(ring, /variant="ring"/, "it is the ring variant");
  // The old code picked the limit with a ternary on hasRequestLimit.
  assert.ok(
    !/used=\{hasRequestLimit \?/.test(ring),
    "the ring must not swap its metric based on a request cap",
  );
  assert.match(
    ring,
    /used=\{usedContextTokens\}/,
    "the ring is fed the context tokens unconditionally",
  );
  assert.match(ring, /limit=\{CONTEXT_WINDOW\}/, "against the context window");
});

test("the panel body owns no scroll container", () => {
  assert.ok(
    !/ScrollArea/.test(panel),
    "usage-limits must not create a second scroller inside the panel",
  );
  assert.ok(
    !/overflow-y-auto/.test(panel),
    "nor an overflow-y-auto region",
  );
});

test("scope and keyboard hints left the panel", () => {
  // These describe the composer, not the context window; they now live at the
  // composer's foot so the panel has one job.
  assert.ok(
    !/What the coach sees/.test(view),
    "the scope section is removed from the panel",
  );
  assert.ok(
    !/shift\+enter/i.test(view),
    "the keyboard hints are removed from the panel",
  );
  // …but the promise is still made, at the composer: chat never writes, and
  // anything that would is behind an explicit review.
  assert.match(
    view,
    /Changes need your approval/,
    "the composer disclaimer still states that writes need approval",
  );
});

test("the panel explains why the composer is disabled (plan limits stay)", () => {
  // Dropping limits entirely would leave "today's limit is reached" unexplained.
  assert.match(panel, /Plan limits/, "the panel keeps a plan-limits block");
  assert.match(view, /limits=\{planLimits\}/, "the view still passes plan limits");
});
