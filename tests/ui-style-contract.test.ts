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

const buttonSource = source("src/components/ui/button.tsx");
const spinnerSource = source("src/components/ui/spinner.tsx");
const inputSource = source("src/components/ui/input.tsx");
const textareaSource = source("src/components/ui/textarea.tsx");
const fieldSource = source("src/components/ui/field.tsx");
const selectSource = source("src/components/ui/select.tsx");

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
