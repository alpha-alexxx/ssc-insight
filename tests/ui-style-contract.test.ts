import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import * as buttonModule from "../src/components/ui/button";

type ButtonVariants = (options?: {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "icon";
}) => string;

const buttonVariants = (
  buttonModule as typeof buttonModule & { buttonVariants?: ButtonVariants }
).buttonVariants;

function source(path: string) {
  const url = new URL(`../${path}`, import.meta.url);
  return existsSync(url) ? readFileSync(url, "utf8") : "";
}

function sourceRegion(componentSource: string, startMarker: string, endMarker: string) {
  const startIndex = componentSource.indexOf(startMarker);
  if (startIndex === -1) return "";

  const endIndex = componentSource.indexOf(endMarker, startIndex + startMarker.length);
  return endIndex === -1 ? "" : componentSource.slice(startIndex, endIndex);
}

const buttonSource = source("src/components/ui/button.tsx");
const spinnerSource = source("src/components/ui/spinner.tsx");
const inputSource = source("src/components/ui/input.tsx");
const textareaSource = source("src/components/ui/textarea.tsx");
const fieldSource = source("src/components/ui/field.tsx");
const selectSource = source("src/components/ui/select.tsx");
const checkboxSource = source("src/components/ui/checkbox.tsx");
const radioGroupSource = source("src/components/ui/radio-group.tsx");
const switchSource = source("src/components/ui/switch.tsx");
const tabsSource = source("src/components/ui/tabs.tsx");
const toggleGroupSource = source("src/components/ui/toggle-group.tsx");
const paginationSource = source("src/components/ui/pagination.tsx");
const sidebarSource = source("src/components/ui/sidebar.tsx");
const sidebarMenuButtonVariantsSource = sourceRegion(
  sidebarSource,
  "const sidebarMenuButtonVariants",
  "const SidebarMenuButton",
);
const sidebarMenuActionSource = sourceRegion(
  sidebarSource,
  "const SidebarMenuAction",
  "const SidebarMenuBadge",
);
const sidebarMenuSubButtonSource = sourceRegion(
  sidebarSource,
  "const SidebarMenuSubButton",
  "SidebarMenuSubButton.displayName",
);

function assertClasses(actual: string, expected: readonly string[]) {
  const classes = new Set(actual.split(/\s+/));
  for (const className of expected) {
    assert.ok(classes.has(className), `missing class: ${className}`);
  }
}

test("Button exports the five semantic variants and token-sized controls", () => {
  assert.equal(typeof buttonVariants, "function");
  if (!buttonVariants) return;

  const variantClasses = {
    default: [
      "bg-accent",
      "text-paper",
      "hover:bg-accent-hover",
      "[background-image:var(--accent-sheen)]",
    ],
    secondary: [
      "border",
      "border-rule-soft",
      "bg-soft",
      "text-ink",
      "hover:border-rule",
      "hover:bg-canvas",
    ],
    outline: ["border", "border-rule", "bg-paper", "text-ink", "hover:bg-canvas"],
    ghost: ["bg-transparent", "text-muted", "hover:bg-soft", "hover:text-ink"],
    destructive: ["bg-danger", "text-paper", "hover:bg-danger-hover"],
  } as const;

  for (const [variant, expected] of Object.entries(variantClasses)) {
    assertClasses(buttonVariants({ variant: variant as keyof typeof variantClasses }), expected);
  }

  assertClasses(buttonVariants({ size: "default" }), [
    "h-[var(--control-height)]",
    "px-4",
  ]);
  assertClasses(buttonVariants({ size: "sm" }), [
    "h-[var(--control-height-sm)]",
    "px-3",
    "text-[length:var(--type-secondary)]",
  ]);
  assertClasses(buttonVariants({ size: "icon" }), ["size-[var(--control-height)]"]);
});

test("Button keeps semantic interaction states and a narrow icon contract", () => {
  assert.doesNotMatch(buttonSource, /disabled:opacity-/);
  assert.doesNotMatch(buttonSource, /focus-visible:outline-accent/);
  assert.match(
    buttonSource,
    /transition-\[color,background-color,border-color,box-shadow,transform\]/,
  );
  assert.match(buttonSource, /duration-\[var\(--dur-quick\)\]/);

  for (const className of [
    "disabled:pointer-events-none",
    "disabled:cursor-not-allowed",
    "disabled:border-rule-soft",
    "disabled:bg-soft",
    "disabled:text-muted",
    "disabled:[background-image:none]",
    "active:translate-y-px",
    "motion-reduce:active:translate-y-0",
  ]) {
    assert.ok(buttonSource.includes(className), className);
  }

  assert.ok(buttonSource.includes("[&_svg[data-icon]]:size-4"));
  assert.ok(buttonSource.includes("[&_svg[data-icon]]:shrink-0"));
  assert.equal(buttonSource.includes("[&_svg]:"), false);
  assert.match(buttonSource, /asChild\s*=\s*false/);
  assert.match(buttonSource, /data-slot=["']button["']/);
  assert.doesNotMatch(buttonSource, /\bisLoading\b/);
});

test("Spinner is a decorative reduced-motion-safe Lucide primitive", () => {
  assert.notEqual(spinnerSource, "", "spinner.tsx must exist");
  assert.match(spinnerSource, /Loader2/);
  assert.match(spinnerSource, /data-slot=["']spinner["']/);
  assert.match(spinnerSource, /["']data-icon["']:\s*dataIcon\s*=\s*["']inline-start["']/);
  assert.match(spinnerSource, /data-icon=\{dataIcon\}/);
  assert.match(spinnerSource, /aria-hidden=["']true["']/);
  assert.match(spinnerSource, /animate-spin/);
  assert.match(spinnerSource, /motion-reduce:animate-none/);
  assert.match(spinnerSource, /React\.ComponentProps<typeof Loader2>/);
});

test("Input and Textarea share token geometry and semantic field states", () => {
  assert.notEqual(textareaSource, "", "textarea.tsx must exist");

  const sharedClasses = [
    "w-full",
    "px-[var(--control-pad-x)]",
    "border-rule",
    "bg-paper",
    "text-ink",
    "rounded-control",
    "text-[length:var(--type-body)]",
    "placeholder:text-muted",
    "transition-colors",
    "duration-[var(--dur-quick)]",
    "aria-invalid:border-danger",
    "aria-invalid:focus-visible:outline-danger",
    "read-only:bg-soft",
    "disabled:cursor-not-allowed",
    "disabled:border-rule-soft",
    "disabled:bg-soft",
    "disabled:text-muted",
  ];

  for (const [name, componentSource] of [
    ["Input", inputSource],
    ["Textarea", textareaSource],
  ] as const) {
    for (const className of sharedClasses) {
      assert.ok(componentSource.includes(className), `${name}: ${className}`);
    }
    assert.match(componentSource, new RegExp(`data-slot=["']${name.toLowerCase()}["']`));
    assert.doesNotMatch(componentSource, /disabled:opacity-/);
  }

  assert.ok(inputSource.includes("h-[var(--control-height)]"));
  assert.ok(inputSource.includes("py-0"));
  assert.ok(textareaSource.includes("min-h-24"));
  assert.ok(textareaSource.includes("py-[var(--control-pad-y)]"));
  assert.ok(textareaSource.includes("resize-y"));
  assert.doesNotMatch(textareaSource, /\bh-\[var\(--control-height\)\]/);
});

test("Field preserves alert semantics, readable floors, and semantic disabled states", () => {
  assert.match(fieldSource, /data-\[invalid=true\]:text-danger/);
  assert.ok(fieldSource.includes("text-[length:var(--type-secondary)]"));
  assert.ok(fieldSource.includes("text-pretty"));
  assert.ok(fieldSource.includes("text-[length:var(--type-label)]"));
  assert.match(fieldSource, /role=["']alert["']/);
  assert.match(fieldSource, /new Map\(errors\.map/);
  assert.ok(fieldSource.includes("data-[disabled=true]:text-muted"));
  assert.doesNotMatch(fieldSource, /disabled[^\s"']*:opacity-|group-data-\[disabled=true\][^\s"']*:opacity-/);
  assert.doesNotMatch(fieldSource, /\bdark:/);
});

test("Select composes token controls, semantic states, and floating elevation", () => {
  for (const className of [
    "h-[var(--control-height)]",
    "px-[var(--control-pad-x)]",
    "rounded-control",
    "text-[length:var(--type-body)]",
    "aria-invalid:border-danger",
    "aria-invalid:focus-visible:outline-danger",
    "disabled:cursor-not-allowed",
    "disabled:border-rule-soft",
    "disabled:bg-soft",
    "disabled:text-muted",
  ]) {
    assert.ok(selectSource.includes(className), `SelectTrigger: ${className}`);
  }

  for (const className of ["rounded-floating", "border-rule", "bg-paper", "shadow-pop"]) {
    assert.ok(selectSource.includes(className), `SelectContent: ${className}`);
  }

  for (const className of [
    "min-h-[var(--control-height-sm)]",
    "rounded-control",
    "text-[length:var(--type-secondary)]",
    "data-[disabled]:text-muted",
  ]) {
    assert.ok(selectSource.includes(className), `SelectItem: ${className}`);
  }

  assert.doesNotMatch(selectSource, /(?:disabled|data-\[disabled\])[^\s"']*:opacity-/);
  assert.doesNotMatch(selectSource, /focus-visible:outline-accent/);
  assert.match(selectSource, /<ChevronDown[\s\S]*?data-icon=/);
  assert.match(selectSource, /<Check[\s\S]*?data-icon=/);
  assert.doesNotMatch(selectSource, /<(?:ChevronDown|Check)[^>]*\bsize=/);
});

test("Checkbox and Radio use token geometry, touch targets, and semantic disabled states", () => {
  for (const [name, componentSource] of [
    ["Checkbox", checkboxSource],
    ["RadioGroupItem", radioGroupSource],
  ] as const) {
    for (const className of [
      "size-4",
      "tap-target",
      "rounded-[calc(var(--radius-control)/2)]",
      "disabled:pointer-events-none",
      "disabled:cursor-not-allowed",
      "disabled:border-rule-soft",
      "disabled:bg-soft",
      "disabled:text-muted",
      "disabled:data-[state=checked]:border-rule-soft",
      "disabled:data-[state=checked]:bg-soft",
    ]) {
      assert.ok(componentSource.includes(className), `${name}: ${className}`);
    }
    assert.doesNotMatch(componentSource, /focus-visible:(?:outline|ring)-accent/);
    assert.doesNotMatch(componentSource, /disabled:opacity-/);
  }

  assert.match(checkboxSource, /<Check[\s\S]*?data-icon=/);
  assert.doesNotMatch(checkboxSource, /<Check[^>]*\bsize=/);
  assert.match(checkboxSource, /data-slot=["']checkbox["']/);
  assert.match(radioGroupSource, /data-slot=["']radio-group-item["']/);
});

test("Switch keeps token motion and geometry with a readable SwitchRow description", () => {
  for (const className of [
    "h-5",
    "w-9",
    "size-4",
    "tap-target",
    "rounded-control",
    "rounded-[calc(var(--radius-control)/2)]",
    "duration-[var(--dur-quick)]",
    "disabled:pointer-events-none",
    "disabled:cursor-not-allowed",
    "disabled:border-rule-soft",
    "disabled:bg-soft",
    "disabled:data-[state=checked]:border-rule-soft",
    "disabled:data-[state=checked]:bg-soft",
    "text-[length:var(--type-secondary)]",
    "text-pretty",
  ]) {
    assert.ok(switchSource.includes(className), `Switch: ${className}`);
  }

  assert.match(switchSource, /data-slot=["']switch["']/);
  assert.match(switchSource, /data-slot=["']switch-thumb["']/);
  assert.doesNotMatch(switchSource, /focus-visible:(?:outline|ring)-accent/);
  assert.doesNotMatch(switchSource, /disabled:opacity-/);
});

test("Tabs expose a wrap-or-scroll overflow contract without shrinking labels", () => {
  assert.match(tabsSource, /overflowBehavior\?:\s*["']wrap["']\s*\|\s*["']scroll["']/);
  assert.match(tabsSource, /overflowBehavior\s*=\s*["']wrap["']/);
  assert.match(tabsSource, /data-slot=["']tabs-list["']/);
  assert.match(tabsSource, /data-overflow-behavior=\{overflowBehavior\}/);
  for (const className of [
    "flex-wrap",
    "flex-nowrap",
    "overflow-x-auto",
    "overscroll-x-contain",
    "[scrollbar-width:none]",
    "[&::-webkit-scrollbar]:hidden",
    "[&>*]:shrink-0",
    "text-[length:var(--type-secondary)]",
  ]) {
    assert.ok(tabsSource.includes(className), `Tabs: ${className}`);
  }
  assert.doesNotMatch(tabsSource, /overflowBehavior[\s\S]*?text-(?:xs|\[0\.)/);
});

test("ToggleGroup adapts segment overflow and gives card items token interaction states", () => {
  assert.match(
    toggleGroupSource,
    /overflowBehavior\?:\s*["']wrap["']\s*\|\s*["']scroll["']/,
  );
  assert.match(toggleGroupSource, /overflowBehavior\s*=\s*["']wrap["']/);
  assert.match(toggleGroupSource, /data-slot=["']toggle-group["']/);
  assert.match(toggleGroupSource, /data-slot=["']toggle-group-item["']/);
  assert.ok(toggleGroupSource.includes("segment-group"));
  for (const className of [
    "flex-wrap",
    "flex-nowrap",
    "overflow-x-auto",
    "overscroll-x-contain",
    "[scrollbar-width:none]",
    "[&::-webkit-scrollbar]:hidden",
    "[&>*]:shrink-0",
    "rounded-control",
    "transition-[color,background-color,border-color]",
    "duration-[var(--dur-quick)]",
    "disabled:pointer-events-none",
    "disabled:cursor-not-allowed",
    "disabled:border-rule-soft",
    "disabled:bg-soft",
    "disabled:text-muted",
  ]) {
    assert.ok(toggleGroupSource.includes(className), `ToggleGroup: ${className}`);
  }
  assert.doesNotMatch(toggleGroupSource, /disabled:opacity-/);
  assert.doesNotMatch(toggleGroupSource, /\bdark:/);
});

test("Pagination uses token boxes, readable type, and semantic disabled states", () => {
  for (const className of [
    "size-[var(--control-height-sm)]",
    "tap-target",
    "rounded-control",
    "text-[length:var(--type-secondary)]",
    "tabular-nums",
    "duration-[var(--dur-quick)]",
    "disabled:pointer-events-none",
    "disabled:cursor-not-allowed",
    "disabled:border-rule-soft",
    "disabled:bg-soft",
    "disabled:text-muted",
  ]) {
    assert.ok(paginationSource.includes(className), `Pagination: ${className}`);
  }
  assert.match(paginationSource, /data-slot=["']pagination-page["']/);
  assert.match(paginationSource, /data-slot=["']pagination-ellipsis["']/);
  assert.doesNotMatch(paginationSource, /\bsize-8\b/);
  assert.doesNotMatch(paginationSource, /disabled:opacity-/);
  assert.doesNotMatch(paginationSource, /focus-visible:(?:outline|ring)-accent/);
});

test("Sidebar menu controls use shared geometry and semantic interaction states", () => {
  const disabledClasses = [
    "disabled:pointer-events-none",
    "disabled:cursor-not-allowed",
    "disabled:border-sidebar-border",
    "disabled:bg-sidebar-accent",
    "disabled:text-sidebar-foreground/60",
    "aria-disabled:pointer-events-none",
    "aria-disabled:cursor-not-allowed",
    "aria-disabled:border-sidebar-border",
    "aria-disabled:bg-sidebar-accent",
    "aria-disabled:text-sidebar-foreground/60",
  ] as const;
  const regions = [
    {
      name: "sidebarMenuButtonVariants",
      source: sidebarMenuButtonVariantsSource,
      expected: [
        "h-[var(--sidebar-row-h)]",
        "h-[var(--sidebar-row-h-lg)]",
        "h-[var(--control-height-sm)]",
        "group-data-[collapsible=icon]:size-[var(--sidebar-row-h-lg)]!",
        "rounded-control",
      ],
    },
    {
      name: "SidebarMenuAction",
      source: sidebarMenuActionSource,
      expected: ["size-5", "rounded-control", "tap-target"],
    },
    {
      name: "SidebarMenuSubButton",
      source: sidebarMenuSubButtonSource,
      expected: ["h-[var(--control-height-sm)]", "rounded-control"],
    },
  ] as const;

  for (const region of regions) {
    assert.notEqual(region.source, "", `${region.name}: source region`);
    for (const className of [...region.expected, ...disabledClasses]) {
      assert.ok(region.source.includes(className), `${region.name}: ${className}`);
    }
    assert.doesNotMatch(
      region.source,
      /\b(?:h-7|h-8|size-10)(?:!|\b)/,
      `${region.name}: fixed geometry`,
    );
    assert.doesNotMatch(
      region.source,
      /(?:disabled|aria-disabled):opacity-/,
      `${region.name}: disabled opacity`,
    );
    assert.doesNotMatch(
      region.source,
      /(?:outline-none|ring-sidebar-ring|focus-visible:)/,
      `${region.name}: local focus override`,
    );
  }
});

test("Task 3B primitives contain no legacy disabled opacity or accent focus overrides", () => {
  for (const [name, componentSource] of [
    ["checkbox", checkboxSource],
    ["radio-group", radioGroupSource],
    ["switch", switchSource],
    ["tabs", tabsSource],
    ["toggle-group", toggleGroupSource],
    ["pagination", paginationSource],
    ["sidebar", sidebarSource],
  ] as const) {
    assert.doesNotMatch(componentSource, /disabled:opacity-/, name);
    assert.doesNotMatch(componentSource, /aria-disabled:opacity-/, name);
    assert.doesNotMatch(componentSource, /focus-visible:outline-accent/, name);
  }
});
