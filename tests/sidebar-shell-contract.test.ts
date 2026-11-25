import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

/**
 * Structural contract for the shell's three mobile fixes.
 *
 * Each assertion is a property that was wrong before, so a later edit cannot
 * quietly put it back:
 *   · the phone search pill must claim the header's spare width, not sit at 8px
 *   · the sidebar's active row must be the liquid drop, not its own fill + ring
 *   · the phone nav Sheet must be flush, not a rounded card floating on a gutter
 */

function source(path: string) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

/** Strip comments so prose describing a pattern cannot satisfy an assertion. */
function code(text: string) {
  return text
    .split("\n")
    .filter((line) => !/^\s*(\/\/|\*|\/\*)/.test(line))
    .join("\n");
}

const shell = code(source("src/components/app-shell.tsx"));
const sidebar = code(source("src/components/workspace-sidebar.tsx"));
const palette = code(source("src/components/command-palette.tsx"));
const adapter = code(source("src/components/workspace-command-palette.tsx"));
const nav = code(source("src/components/liquid-nav.tsx"));
const sheet = code(source("src/components/sheet.tsx"));

/** Just `NavItem` — the footer's Settings/Trash pair is a different surface and keeps its own fill. */
const navItem = sidebar.slice(
  sidebar.indexOf("function NavItem("),
  sidebar.indexOf("export function SidebarUserMenu("),
);

test("the phone search pill claims the header's spare width", () => {
  // The right-hand cluster grows on phones and goes back to a fixed pill from sm.
  assert.match(
    shell,
    /ml-auto flex w-full min-w-0 flex-1 items-center justify-end gap-1 sm:w-auto sm:flex-none sm:shrink-0 sm:gap-2/,
    "the header cluster must fill the phone bar and stop filling it from sm",
  );
  // The pill itself fills that cluster, then returns to its intrinsic width.
  assert.match(
    adapter,
    /inline-flex h-9 w-full min-w-0 items-center/,
    "the pill must fill its cluster on phones",
  );
  assert.match(adapter, /sm:w-auto sm:shrink-0/, "the pill must not grow from sm");
  // The palette's wrapper has to grow too, or the button has nothing to fill.
  assert.match(
    palette,
    /inline-flex min-w-0 max-w-full flex-1 sm:flex-none/,
    "the palette wrapper must fill on phones",
  );
});

test("the pill keeps its label on phones and hides only the keyboard hint", () => {
  // Both faces — the header trigger and the palette's folded face — agree.
  for (const [name, component] of [
    ["trigger", adapter],
    ["folded face", palette],
  ] as const) {
    assert.match(
      component,
      /min-w-0 flex-1 truncate[^"]*sm:flex-none/,
      `${name}: the label must survive on phones`,
    );
    assert.match(
      component,
      /hidden items-center gap-0\.5 sm:flex/,
      `${name}: the shortcut hint must wait for a keyboard`,
    );
    assert.doesNotMatch(
      component,
      /hidden pr-6 sm:inline/,
      `${name}: the label may not be hidden below sm`,
    );
  }
});

test("the active nav row defers its fill to the liquid drop", () => {
  assert.match(
    sidebar,
    /import \{ LiquidNav \} from "@\/components\/liquid-nav"/,
    "the sidebar must render the liquid nav",
  );
  assert.match(sidebar, /<LiquidNav\b/, "the nav must be wrapped in LiquidNav");
  assert.match(sidebar, /<LiquidNav\s+active=\{view\}/, "the drop follows the view");
  assert.match(
    navItem,
    /data-liquid-nav=\{item\.view\}/,
    "every row must be measurable by the drop",
  );
  // The row's own active treatment is colour only; a fill or ring here would
  // fight the drop that is already behind it.
  assert.doesNotMatch(
    navItem,
    /bg-accent font-semibold/,
    "the active row must not paint its own fill",
  );
  assert.doesNotMatch(
    navItem,
    /ring-1 ring-sidebar-border/,
    "the active row must not paint its own ring",
  );
  assert.doesNotMatch(
    navItem,
    /rounded-r-full bg-primary/,
    "the old left accent bar must be gone",
  );
  assert.match(
    navItem,
    /active\s*\?\s*"font-semibold text-primary-foreground"/,
    "the active row takes the drop's foreground",
  );
});

test("the drop is decoration: hidden from AT and never in front of the rows", () => {
  assert.match(nav, /<svg\s+aria-hidden="true"/s, "the drop layer is decorative");
  assert.match(nav, /pointer-events-none absolute inset-0 z-0/, "the drop sits behind");
  assert.match(nav, /relative z-10/, "the rows sit above the drop");
  assert.match(
    navItem,
    /aria-current=\{active \? "page" : undefined\}/,
    "the row keeps its own link semantics",
  );
});

test("the drop is placed, not slid, whenever it could be lying", () => {
  // First mount, a resize, a webfont arriving, or a highlight that appears
  // after having been hidden.
  assert.match(nav, /if \(instant \|\| motion\.current\.hidden\)/, "must place instead of gliding");
  assert.match(nav, /new ResizeObserver/, "must re-measure when the list reflows");
  assert.match(nav, /document\.fonts\?\.ready/, "must re-measure when the font lands");
  assert.match(nav, /aim\(active, reduced\)/, "must honour reduced motion");
});

test("the phone nav sheet is flush, not a floating card", () => {
  assert.match(
    shell,
    /<Sheet[\s\S]*?side="left"[\s\S]*?flush\b/,
    "the nav sheet must opt into the flush geometry",
  );
  // `flush` is the only thing that removes the gutter and the rounding.
  assert.match(sheet, /flush\?: boolean;/, "Sheet must expose flush");
  assert.match(sheet, /flush \? "p-0" : "p-2"/, "flush removes the gutter");
  assert.match(sheet, /flush \? "" : "rounded-\[20px\]"/, "flush squares the side panel");
  assert.match(
    sheet,
    /border-r border-border/,
    "flush draws one rule on the sheet's inner edge",
  );
  assert.doesNotMatch(
    shell,
    /p-0 bg-sidebar text-sidebar-foreground border-sidebar-border/,
    "the call site may not re-add the old floating chrome",
  );
});

test("the sheet's floating close button clears the wordmark", () => {
  assert.match(
    sidebar,
    /expanded && variant === "mobile" && "pr-12"/,
    "the mobile brand row must keep clear of the sheet's close button",
  );
});
