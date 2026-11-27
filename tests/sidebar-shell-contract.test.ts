import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

/**
 * Structural contract for the workspace sidebar.
 *
 * The panel is the vendored Hairline UI `Sidebar` (`src/components/sidebar.tsx`,
 * from `npx shadcn@latest add @hairline/sidebar`) composed by
 * `src/components/workspace-sidebar.tsx`. These assertions are the properties a
 * later edit must not quietly undo:
 *   · the active row is the house LiquidNav drop, never a fill of its own
 *   · the panel is viewport-fixed while the workspace scrolls the WINDOW
 *   · the phone surface is a flush fixed drawer, not a rounded card on a gutter
 *   · the fold/width cookie round-trips through the server layout
 *   · the header's phone search pill still claims the spare width
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

const sidebar = code(source("src/components/sidebar.tsx"));
const nav = code(source("src/components/liquid-nav.tsx"));
const workspace = code(source("src/components/workspace-sidebar.tsx"));
const shell = code(source("src/components/app-shell.tsx"));
const chrome = code(source("src/components/workspace-chrome.tsx"));
const layout = code(source("src/app/(workspace)/layout.tsx"));
const modal = code(source("src/components/modal.ts"));
const palette = code(source("src/components/command-palette.tsx"));
const adapter = code(source("src/components/workspace-command-palette.tsx"));

/** Just `renderRow` — the header, the search row and the account row are different surfaces. */
const renderRow = sidebar.slice(
  sidebar.indexOf("const renderRow = ("),
  sidebar.indexOf("/* the parts of the panel */"),
);

test("the workspace sidebar is composed from the vendored Hairline Sidebar", () => {
  assert.match(
    workspace,
    /import \{\s*Sidebar,/,
    "workspace-sidebar must import the Hairline Sidebar",
  );
  assert.match(workspace, /<Sidebar\b/, "it must render <Sidebar>");
  assert.match(workspace, /\bsections=\{sections\}/, "nav groups feed sections");
  assert.match(workspace, /\bfooter=\{FOOTER_ITEMS\}/, "Settings/Trash are footer rows");
  assert.match(workspace, /\bvalue=\{view\}/, "the current route is the selection");
  assert.match(workspace, /\blinkAs=\{Link\}/, "rows are Next.js links");
  assert.match(workspace, /\bbrand=\{<SidebarBrand \/>\}/, "the wordmark is the brand slot");
  // The old hand-rolled surfaces are gone for good.
  assert.doesNotMatch(workspace, /<aside\b/, "no hand-rolled aside");
  assert.doesNotMatch(workspace, /WorkspaceSidebarBody|function NavItem\(/, "no parallel nav");
  assert.doesNotMatch(workspace, /from "@\/components\/sheet"/, "no phone Sheet");
  assert.doesNotMatch(workspace, /<Tooltip\b/, "the rail peek replaced tooltips");
  assert.doesNotMatch(workspace, /\bonSearch=/, "search is the header's job, not a sidebar row");
  assert.doesNotMatch(workspace, /<LiquidNav\b/, "the drop is wired inside the Sidebar");
});

test("the active nav row defers its fill to the liquid drop", () => {
  assert.match(
    sidebar,
    /import \{ LiquidNav \} from "\.\/liquid-nav"/,
    "the vendored sidebar must render the house liquid nav",
  );
  assert.match(sidebar, /<LiquidNav active=\{shownActive\}/, "the drop follows the page");
  assert.match(
    renderRow,
    /"data-liquid-nav": item\.id/,
    "every destination row must be measurable by the drop",
  );
  assert.match(
    renderRow,
    /item\.accent\s*\n?\s*\?\s*"bg-primary\/6/,
    "an accent row (Log a mock) keeps its own tint",
  );
  assert.match(
    renderRow,
    /active\s*\n?\s*\?\s*"font-semibold text-primary-foreground"/,
    "the active row takes the drop's foreground, nothing else",
  );
  // A fill, a ring or an accent bar here would fight the drop behind the row.
  assert.doesNotMatch(renderRow, /bg-accent text-foreground/, "no grey active fill");
  assert.doesNotMatch(renderRow, /ring-1 ring-sidebar-border/, "no active ring");
  assert.doesNotMatch(renderRow, /rounded-r-full bg-primary/, "no old left accent bar");
  // Hairline's own ghost + WAAPI glide were replaced by the drop.
  assert.doesNotMatch(sidebar, /const ghost =/, "the ghost layer is gone");
  assert.doesNotMatch(sidebar, /layer\.animate\(/, "the WAAPI glide is gone");
});

test("the drop is decoration: hidden from AT and never in front of the rows", () => {
  assert.match(nav, /<svg\s+aria-hidden="true"/s, "the drop layer is decorative");
  assert.match(nav, /pointer-events-none absolute inset-0 z-0/, "the drop sits behind");
  assert.match(nav, /relative z-10/, "the rows sit above the drop");
  assert.match(renderRow, /"aria-current"|aria-current=\{current \? "page" : undefined\}/, "rows keep link semantics");
  // The footer has its own drop, so Settings/Trash glide too.
  assert.equal(
    (sidebar.match(/<LiquidNav active=\{shownActive\}/g) ?? []).length,
    2,
    "the section list and the footer each get a drop",
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

test("the panel is viewport-fixed because the workspace scrolls the window", () => {
  // Panel mode: sticky, full viewport height, so page-level sticky rails and
  // /ask's 100dvh sizing keep resolving against the window.
  assert.match(
    sidebar,
    /"sticky top-0 z-\[2\] h-dvh border-r border-border"/,
    "the open panel sticks to the viewport",
  );
  // No inner-scroll geometry may creep back into the page column.
  assert.match(
    sidebar,
    /className="relative flex min-w-0 flex-1 flex-col"/,
    "the page column flows with the window",
  );
  // A container-type here would lay out-contain the fixed drawer.
  assert.doesNotMatch(sidebar, /@container relative flex w-full/, "no @container root");
});

test("the phone sidebar is a fixed drawer with one rounded open edge", () => {
  assert.match(
    sidebar,
    /"fixed inset-y-0 left-0 z-40 h-dvh rounded-r-xl border-r border-sidebar-border will-change-transform"/,
    "the drawer covers the viewport, draws one hairline, and rounds only its open edge",
  );
  // A little softening on the open edge, not a floating card: no big radius, no halo.
  assert.doesNotMatch(sidebar, /rounded-r-\[20px\]/, "no oversized drawer radius");
  assert.doesNotMatch(sidebar, /rounded-r-\[1[6-9]px\]/, "the drawer radius stays small");
  assert.match(sidebar, /"fixed inset-0 z-30 bg-\[color-mix/, "the scrim is fixed");
  assert.match(
    sidebar,
    /blockBackgroundScroll\(el\)/,
    "the page behind an open drawer cannot scroll",
  );
  assert.match(modal, /export function blockBackgroundScroll\(/, "the guard is shared with modal.ts");
});

test("the fold and the dragged width round-trip through the server layout", () => {
  // One cookie, written by the sidebar from Hairline's two callbacks.
  assert.match(
    workspace,
    /sidebar_state=\$\{next\.collapsed\}:\$\{next\.width\}/,
    "workspace-sidebar writes <collapsed>:<width>",
  );
  assert.match(workspace, /onCollapsedChange=\{/, "the fold is persisted");
  assert.match(workspace, /onWidthChange=\{/, "the dragged width is persisted");
  // The layout parses it for the first paint and passes it down as defaults.
  assert.match(layout, /get\("sidebar_state"\)/, "the layout reads the cookie");
  assert.match(layout, /raw\.split\(":"\)/, "collapsed and width share one value");
  assert.match(layout, /defaultSidebarCollapsed=/, "the fold is passed to the chrome");
  assert.match(layout, /defaultSidebarWidth=/, "the width is passed to the chrome");
  assert.match(chrome, /defaultSidebarCollapsed = false/, "chrome owns the default fold");
  assert.match(chrome, /defaultSidebarWidth = 240/, "chrome owns the default width");
  // Uncontrolled all the way down: no client state mirrors the cookie.
  assert.doesNotMatch(workspace, /useState<boolean>/, "the fold is not mirrored into state");
});

test("the header's single trigger folds the panel and opens the drawer", () => {
  assert.match(shell, /<SidebarTrigger className="size-11 tap-target md:size-9" \/>/, "one control");
  assert.doesNotMatch(shell, /PanelLeftIcon/, "the bespoke panel glyph is gone");
  assert.doesNotMatch(shell, /<Sheet\b/, "the phone nav Sheet is gone");
  assert.doesNotMatch(shell, /useIsMobile/, "the header no longer renders per viewport");
});

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
