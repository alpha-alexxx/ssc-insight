import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

function source(path: string) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

function cssBlock(css: string, selector: RegExp, label: string) {
  const match = css.match(selector);
  assert.ok(match?.[1], `missing ${label} CSS block`);
  return match[1];
}

const globalsSource = source("src/app/globals.css");
const fieldSource = source("src/components/ui/field.tsx");
const dropdownSource = source("src/components/ui/dropdown-menu.tsx");
const alertDialogSource = source("src/components/ui/alert-dialog.tsx");
const themeToggleSource = source("src/components/theme-toggle.tsx");
const pageHeaderSource = source("src/components/page-header.tsx");
const mastheadSource = source("src/components/landing/masthead.tsx");
const signInSource = source("src/components/auth/sign-in-form.tsx");
const signUpSource = source("src/components/auth/sign-up-form.tsx");
const forgotSource = source("src/components/auth/forgot-form.tsx");

function assertDeclarations(block: string, declarations: readonly RegExp[]) {
  for (const declaration of declarations) assert.match(block, declaration);
}

test("action utilities separate intrinsic clusters from phone-stacked footers", () => {
  const shared = cssBlock(
    globalsSource,
    /\.action-row\s*,\s*\.action-row-stack\s*\{([^}]*)\}/,
    "shared action-row",
  );
  assertDeclarations(shared, [
    /display:\s*flex;/,
    /flex-wrap:\s*wrap;/,
    /align-items:\s*center;/,
    /gap:\s*0\.5rem;/,
    /width:\s*auto;/,
  ]);

  const stacked = cssBlock(
    globalsSource,
    /\.action-row\s*,\s*\.action-row-stack\s*\{[^}]*\}\s*\.action-row-stack\s*\{([^}]*)\}/,
    "phone action-row-stack",
  );
  assertDeclarations(stacked, [
    /flex-direction:\s*column;/,
    /flex-wrap:\s*nowrap;/,
    /align-items:\s*stretch;/,
    /width:\s*100%;/,
  ]);

  const desktopStack = cssBlock(
    globalsSource,
    /@media\s*\(min-width:\s*40rem\)\s*\{\s*\.action-row-stack\s*\{([^}]*)\}/,
    "desktop action-row-stack",
  );
  assertDeclarations(desktopStack, [
    /flex-direction:\s*row;/,
    /flex-wrap:\s*wrap;/,
    /align-items:\s*center;/,
    /width:\s*auto;/,
  ]);

  for (const match of globalsSource.matchAll(/^\.action-row\s*\{([^}]*)\}/gm)) {
    assert.doesNotMatch(match[1], /flex-direction:\s*column|align-items:\s*stretch|width:\s*100%/);
  }
});

test("global table and section labels use the readable label token", () => {
  const tableHeader = cssBlock(globalsSource, /^\s*th\s*\{([^}]*)\}/m, "th");
  const sectionLabel = cssBlock(
    globalsSource,
    /^\s*\.section-label\s*\{([^}]*)\}/m,
    "section-label",
  );

  assert.match(tableHeader, /font-size:\s*var\(--type-label\);/);
  assert.match(sectionLabel, /font-size:\s*var\(--type-label\);/);
  assert.doesNotMatch(tableHeader, /font-size:\s*0\.(?:6875|625)rem;/);
  assert.doesNotMatch(sectionLabel, /font-size:\s*0\.(?:6875|625)rem;/);
});

test("shared field and dropdown copy and controls use readable size tokens", () => {
  const separatorSlot = fieldSource.indexOf('data-slot="field-separator-content"');
  assert.notEqual(separatorSlot, -1, "missing FieldSeparator content slot");
  const separatorStart = fieldSource.lastIndexOf("<span", separatorSlot);
  const separatorEnd = fieldSource.indexOf("</span>", separatorSlot);
  const separatorContent = fieldSource.slice(separatorStart, separatorEnd);
  assert.match(separatorContent, /text-\[length:var\(--type-label\)\]/);
  assert.doesNotMatch(separatorContent, /text-\[0\.625rem\]/);

  assert.match(dropdownSource, /DropdownMenuLabel[\s\S]*?text-\[length:var\(--type-label\)\]/);
  const itemClasses = cssBlock(
    dropdownSource,
    /DropdownMenuPrimitive\.Item[\s\S]*?className=\{cn\(\s*"([^"]+)"/,
    "DropdownMenuItem class",
  );
  for (const token of [
    "min-h-[var(--control-height-sm)]",
    "rounded-control",
    "transition-colors",
  ]) {
    assert.ok(itemClasses.includes(token), `DropdownMenuItem missing ${token}`);
  }
});

test("AlertDialogFooter explicitly uses the stacked action role", () => {
  const footer = alertDialogSource.slice(
    alertDialogSource.indexOf("function AlertDialogFooter"),
    alertDialogSource.indexOf("const AlertDialogTitle"),
  );
  assert.match(footer, /action-row-stack/);
  assert.doesNotMatch(footer, /["' ]action-row["' ]/);
  assert.match(footer, /sm:justify-end/);
  assert.match(footer, /sm:gap-2/);
});

test("ThemeToggle composes the shared ghost icon Button without changing its contract", () => {
  assert.match(themeToggleSource, /import\s+\{\s*Button\s*\}/);
  assert.match(themeToggleSource, /<Button[\s\S]*?variant="ghost"[\s\S]*?size="icon"/);
  assert.match(themeToggleSource, /type="button"/);
  assert.match(themeToggleSource, /onClick=\{toggle\}/);
  assert.match(themeToggleSource, /aria-label="Toggle theme"/);
  assert.match(themeToggleSource, /title="Toggle theme"/);
  assert.match(themeToggleSource, /<PlainIcon name="moon" size=\{17\}/);
  assert.match(themeToggleSource, /<PlainIcon name="sun" size=\{17\}/);
  assert.doesNotMatch(themeToggleSource, /\bsize-8\b/);
  assert.doesNotMatch(themeToggleSource, /<button\b/);
});

test("PageHeader keeps readable metadata and intrinsic wrapping actions", () => {
  assert.match(
    pageHeaderSource,
    /meta\s*&&[\s\S]*?text-\[length:var\(--type-label\)\][\s\S]*?\{meta\}/,
  );
  assert.match(pageHeaderSource, /description\s*&&[\s\S]*?text-\[0\.8125rem\]/);
  assert.match(pageHeaderSource, /className="action-row sm:justify-end"/);
  assert.doesNotMatch(pageHeaderSource, /action-row-stack/);
});

test("landing mobile menu trigger composes the shared ghost icon Button", () => {
  const trigger = mastheadSource.slice(
    mastheadSource.indexOf("<SheetTrigger asChild>"),
    mastheadSource.indexOf("</SheetTrigger>"),
  );
  assert.match(trigger, /<Button/);
  assert.match(trigger, /variant="ghost"/);
  assert.match(trigger, /size="icon"/);
  assert.match(trigger, /type="button"/);
  assert.match(trigger, /aria-label="Open navigation"/);
  assert.match(trigger, /md:hidden/);
  assert.equal(trigger.match(/className="h-px w-full bg-current"/g)?.length, 3);
  assert.doesNotMatch(trigger, /\bsize-9\b/);
  assert.doesNotMatch(trigger, /<button\b/);
});

test("auth CTAs inherit Button height while preserving width, states, and labels", () => {
  for (const [name, component, expectedButtons] of [
    ["sign in", signInSource, 5],
    ["sign up", signUpSource, 2],
    ["forgot password", forgotSource, 3],
  ] as const) {
    assert.doesNotMatch(component, /\bh-11\b/, `${name} retains h-11`);
    assert.equal(
      component.match(/className="w-full justify-center"/g)?.length,
      expectedButtons,
      `${name} full-width CTA count`,
    );
  }

  for (const fragment of [
    "disabled={form.formState.isSubmitting}",
    "disabled={requestForm.formState.isSubmitting}",
    "disabled={codeForm.formState.isSubmitting}",
    "Signing in…",
    "Sending…",
    "Verifying…",
    "Email me the code",
    "Verify and sign in",
  ]) {
    assert.ok(signInSource.includes(fragment), `sign-in contract lost: ${fragment}`);
  }
  for (const fragment of [
    "disabled={form.formState.isSubmitting}",
    "Creating account…",
    "Create account",
  ]) {
    assert.ok(signUpSource.includes(fragment), `sign-up contract lost: ${fragment}`);
  }
  for (const fragment of [
    "disabled={busy}",
    "Sending…",
    "Saving…",
    "Email me a reset code",
    "Set new password",
    '<Link href="/sign-in">Go to sign in</Link>',
    "onClick={onBack}",
  ]) {
    assert.ok(forgotSource.includes(fragment), `forgot contract lost: ${fragment}`);
  }
});

test("decorative plates and OTP/password compound control exceptions stay intact", () => {
  const authShell = source("src/components/auth/auth-shell.tsx");
  const otp = source("src/components/auth/otp-input.tsx");
  const password = source("src/components/auth/password-input.tsx");
  const forgotPlate = source("src/components/auth/plates/forgot-plate.tsx");
  const signInPlate = source("src/components/auth/plates/sign-in-plate.tsx");

  assert.match(authShell, /aria-hidden="true"[\s\S]*?section-label text-\[var\(--plate-muted\)\]/);
  assert.ok(otp.includes("h-[3.25rem]"));
  assert.ok(otp.includes("sm:h-14"));
  assert.ok(password.includes("pr-11"));
  assert.ok(password.includes("w-11"));
  assert.ok(forgotPlate.includes("auth-plate-label"));
  assert.ok(forgotPlate.includes("auth-plate-fact-label"));
  assert.ok(signInPlate.includes("text-[0.6875rem]"));
  assert.ok(signInPlate.includes("auth-plate-fact-label"));
});
