import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

/**
 * Structural contract for the workspace shell.
 *
 * The panel is the hand-rolled `<aside>` + phone `Sheet` in
 * `src/components/app-shell.tsx`, composed by
 * `src/components/workspace-sidebar.tsx`. A Hairline `@hairline/sidebar` build
 * briefly replaced it and was reverted (its vendored file is gone for good
 * unless that becomes a deliberate product decision), so these assertions pin
 * what the restored shell must keep:
 *   · one composition — the same body in the desktop aside and the phone Sheet
 *   · the phone search pill claims the header's spare width
 *   · the active nav row is the liquid drop, not its own fill + ring
 *   · the phone nav Sheet is flush, not a rounded card on a gutter
 *   · the fold round-trips through the one `sidebar_state` cookie, both the
 *     bare boolean and the newer "<collapsed>:<width>" the reverted build wrote
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
const chrome = code(source("src/components/workspace-chrome.tsx"));
const layout = code(source("src/app/(workspace)/layout.tsx"));
const palette = code(source("src/components/command-palette.tsx"));
const adapter = code(source("src/components/workspace-command-palette.tsx"));
const nav = code(source("src/components/liquid-nav.tsx"));
const sheet = code(source("src/components/sheet.tsx"));
const tabs = code(source("src/components/liquid-tabs.tsx"));

/** Just `NavItem` — the footer's Settings/Trash pair is a different surface and keeps its own fill. */
const navItem = sidebar.slice(
  sidebar.indexOf("function NavItem("),
  sidebar.indexOf("export function SidebarUserMenu("),
);

test("the shell has one sidebar composition, not a vendored panel", () => {
  // The restored shell: a fixed desktop aside and a phone Sheet, both fed by
  // the same body. The Hairline vendor file must not come back by accident.
  assert.match(shell, /<aside\b/, "the desktop panel is the hand-rolled aside");
  assert.match(shell, /<Sheet\b/, "the phone panel is the header-opened Sheet");
  assert.equal(
    shell.match(/<WorkspaceSidebarBody\b/g)?.length,
    2,
    "both surfaces render the same sidebar body",
  );
  assert.match(shell, /useIsMobile/, "the header renders open/collapse per viewport");
  assert.match(
    sidebar,
    /export function WorkspaceSidebarBody\(/,
    "the body is exported for the aside and the sheet",
  );
  assert.match(sidebar, /export function SidebarUserMenu\(/, "the account row lives with the nav");
  assert.doesNotMatch(shell, /SidebarTrigger|useSidebar|\bSidebarProvider\b/, "no vendored sidebar API");
  assert.doesNotMatch(sidebar, /from "@\/components\/sidebar"/, "the body imports no vendored sidebar");
  assert.equal(
    existsSync(new URL("../src/components/sidebar.tsx", import.meta.url)),
    false,
    "the vendored Hairline sidebar is deleted",
  );
  // The Hairline-only footer grammar went with it.
  assert.doesNotMatch(sidebar, /FooterUtilities|footerSlot/, "no Hairline footer slot");
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

test("a tabs selection that matches no tab clears the drop instead of lingering", () => {
  // Settings still uses LiquidTabs. The Hairline footer that found this bug is
  // gone, but the primitive's fix is a general one and must stay.
  assert.doesNotMatch(
    tabs,
    /if \(!s \|\| !mark\) return;/,
    "a missing mark must clear, not return",
  );
  assert.match(tabs, /if \(!mark\) \{/, "the no-selection branch exists");
  assert.match(tabs, /pathRef\.current\?\.setAttribute\("d", ""\)/, "it clears the path");
  assert.match(tabs, /if \(instant \|\| m\.cleared\)/, "coming back places, it does not glide");
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

test("the fold round-trips through the one sidebar_state cookie", () => {
  // The shell writes the bare boolean it has always written…
  assert.match(shell, /const SIDEBAR_COOKIE = "sidebar_state"/, "the cookie name is unchanged");
  assert.match(
    shell,
    /SIDEBAR_COOKIE\}=\$\{next\}/,
    "app-shell writes sidebar_state=<open>",
  );
  assert.doesNotMatch(shell, /collapsed\}:\$\{/, "the <collapsed>:<width> format is gone");
  // …and the layout reads both it and the format the reverted build left behind.
  assert.match(layout, /get\("sidebar_state"\)/, "the layout reads the cookie");
  assert.match(layout, /raw\.includes\(":"\)/, "the newer format is detected, not assumed");
  assert.match(layout, /raw\.split\(":"\)\[0\] !== "true"/, "with a colon the first segment is collapsed");
  assert.match(layout, /raw !== "false"/, "a bare value records whether the panel is open");
  assert.match(layout, /defaultSidebarOpen=/, "the fold is passed to the chrome");
  assert.match(chrome, /defaultSidebarOpen = true/, "chrome owns the default fold");
  assert.match(chrome, /defaultSidebarOpen=\{defaultSidebarOpen\}/, "chrome forwards it to the shell");
  // The fold is owned by AppFrame state, seeded from the server-read cookie, so
  // the first paint already matches the user's choice; no second source of truth.
  assert.match(shell, /useState\(defaultSidebarOpen\)/, "the fold starts from the server-rendered default");
  assert.match(shell, /SIDEBAR_COOKIE\}=\$\{expanded\}/, "the mount effect mirrors the resolved fold");
  // The reverted props must not survive anywhere.
  for (const [name, text] of [
    ["app-shell", shell],
    ["chrome", chrome],
    ["layout", layout],
  ] as const) {
    assert.doesNotMatch(text, /defaultSidebarCollapsed|defaultSidebarWidth/, `${name}: Hairline props are gone`);
  }
});

test("the chrome keeps the shell's route callbacks wired", () => {
  for (const prop of ["onRouteIntent", "onAddMock", "onOpenSearch"]) {
    assert.match(chrome, new RegExp(`${prop}=`), `chrome must pass ${prop} to AppFrame`);
  }
  assert.match(shell, /onAddMock: \(\) => void;/, "the shell owns the Log-a-mock action");
  assert.doesNotMatch(shell, /onOpenSettings|onOpenTrash/, "Settings/Trash route through the shell's own go()");
  assert.match(sidebar, /onGoTo: \(next: "settings" \| "trash"\) => void;/, "the sidebar routes Settings/Trash");
});
