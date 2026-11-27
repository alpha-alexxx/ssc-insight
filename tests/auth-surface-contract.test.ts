import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

/**
 * Source contracts for the auth surfaces.
 *
 * The three auth pages are a deliberate adaptation of three Hyperblur auth
 * parts and one Hairline component: the registry originals are vendored as a
 * reference and never rendered, and the adapted files must keep the house
 * rules the design rests on — token-only colour, reduced-motion parity, one
 * real field under the code rail, honest state, and a bounded success beat.
 * None of that is visible to `tsc`, so it is pinned here.
 */

const source = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

/** Source with comments removed — these checks are about code, not prose. */
function code(text: string) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

const shell = source("src/components/auth/auth-shell.tsx");
const brandPanel = source("src/components/auth/brand-panel.tsx");
const authCard = source("src/components/auth/auth-card.tsx");
const rail = source("src/components/auth/otp-rail.tsx");
const successPanel = source("src/components/auth/success-panel.tsx");
const light = source("src/components/auth/afterglow-light.ts");
const timeoutHelper = source("src/components/auth/with-auth-timeout.ts");
const signIn = source("src/components/auth/sign-in-form.tsx");
const signUp = source("src/components/auth/sign-up-form.tsx");
const forgot = source("src/components/auth/forgot-form.tsx");
const pages = [
  "src/app/sign-in/page.tsx",
  "src/app/sign-up/page.tsx",
  "src/app/forgot-password/page.tsx",
].map((path) => ({ path, text: source(path) }));

test("the pages render the adapted parts, never the vendored originals", () => {
  for (const { path, text } of pages) {
    assert.doesNotMatch(
      text,
      /@\/components\/hyperblur\//,
      `${path} must not render a Hyperblur original`,
    );
    assert.match(text, /AuthShell/, `${path} must compose the auth shell`);
  }
  for (const adapted of ["auth-card", "brand-panel"]) {
    assert.match(shell, new RegExp(`@/components/auth/${adapted}`));
  }
  // The rail is the forms' control, not the shell's chrome.
  assert.match(signIn, /@\/components\/auth\/otp-rail/);
  assert.match(forgot, /@\/components\/auth\/otp-rail/);
  // The originals stay as reference material only: house pattern from the hero.
  for (const vendored of ["auth-split-brand", "auth-tilt-spotlight", "auth-flow-otp-verify"]) {
    assert.ok(
      source(`src/components/hyperblur/${vendored}.tsx`).includes("export function"),
      `${vendored} must remain vendored`,
    );
  }
});

test("every auth surface is token-coloured and reduced-motion aware", () => {
  for (const [name, text] of [
    ["brand-panel", brandPanel],
    ["auth-card", authCard],
    ["otp-rail", rail],
  ] as const) {
    assert.match(text, /prefers-reduced-motion/, `${name} needs a reduced-motion block`);
    assert.doesNotMatch(
      code(text),
      /#[0-9a-fA-F]{6}\b/,
      `${name} must not hard-code a colour`,
    );
    // Every animation/transition is neutralised by the media block that
    // follows it; a decorative effect that keeps running is a defect.
    assert.match(text, /animation: none/, `${name} must stop its animations`);
  }
  // The light needs concrete colours, so its fallbacks are the one exception.
  assert.match(light, /FALLBACK_AFTERGLOW_COLORS/);
  assert.doesNotMatch(
    code(shell),
    /#[0-9a-fA-F]{6}\b/,
    "the shell must not hard-code a colour",
  );
});

test("the brand panel rotates real readings and stops for the reader", () => {
  // Pauses on hover and focus, and never announces while rotating.
  assert.match(brandPanel, /onPointerEnter=\{\(\) => setPaused\(true\)\}/);
  assert.match(brandPanel, /onFocus=\{\(\) => setPaused\(true\)\}/);
  assert.match(brandPanel, /aria-live=\{paused \? "polite" : "off"\}/);
  assert.match(brandPanel, /aria-roledescription="carousel"/);
  // Real controls, not decorative dots.
  assert.match(brandPanel, /<button[\s\S]{0,400}aria-label=\{`Show reading/);
  // The slides come from the shell as server-rendered plate art.
  assert.match(shell, /<SignInPlateArt \/>/);
  assert.match(shell, /<SignUpPlateArt \/>/);
  assert.match(shell, /<ForgotPlateArt \/>/);
});

test("the task card tilts for a mouse only, and never under reduced motion", () => {
  assert.match(authCard, /useReducedMotion/);
  assert.match(authCard, /event\.pointerType !== "mouse"/);
  assert.match(authCard, /return;/);
  assert.match(authCard, /--lh-auth-rx/);
  assert.match(authCard, /--lh-auth-glow/);
  // The tilt is shallow on purpose: this is a form, not a showcase.
  assert.match(authCard, /TILT_DEGREES = 3/);
});

test("the code rail is one real field, status-driven, with no invented channels", () => {
  assert.equal(rail.match(/<input/g)?.length, 1, "the rail must use one input");
  assert.match(rail, /autoComplete="one-time-code"/);
  assert.match(rail, /inputMode="numeric"/);
  assert.match(rail, /aria-describedby=\{messageId\}/);
  assert.match(rail, /role="status"/);
  // The outcome belongs to the form that made the call.
  for (const prop of ['status?: OtpStatus', "onComplete", "error?", "resend?"]) {
    assert.ok(rail.includes(prop), `rail lost its ${prop} contract`);
  }
  // Only the two channels that exist. No Text/Call switch, no destinations map.
  assert.match(rail, /export type OtpChannel = "email" \| "authenticator"/);
  assert.doesNotMatch(code(rail), /destinations|"sms"|"call"/);
  // An authenticator code has nothing to resend, and the copy says so.
  assert.match(signIn, /channel="authenticator"/);
  assert.match(signIn, /resend=\{null\}/);
});

test("the success beat is bounded, and reduced motion does not wait", () => {
  for (const [name, text] of [
    ["sign-in", signIn],
    ["sign-up", signUp],
  ] as const) {
    assert.match(text, /SUCCESS_HOLD_MS = 1100/, `${name} lost its bounded hold`);
    assert.match(text, /reduced \? 0 : SUCCESS_HOLD_MS/, `${name} must skip the wait`);
    assert.match(text, /router\.replace\("\/dashboard\?welcome=1"\)/, `${name} redirect target`);
    // The light runs, and the redirect is scheduled off the success state —
    // never inline after the await (that would throw the light away).
    assert.match(text, /ref=\{setGlow\}/);
    assert.match(text, /\.play\(update\)/);
    assert.match(text, /useAfterglowColors\(\)/);
  }
  // The reset flow ends on its own panel: no redirect, real next step.
  assert.doesNotMatch(code(forgot), /\/dashboard\?welcome=1/);
  assert.match(forgot, /href="\/sign-in"/);
  assert.match(successPanel, /role="status"/);
});

test("the reset flow captures the code and never claims it was verified", () => {
  assert.match(forgot, /stage === "code"/);
  // Completing the rail advances; the check happens with the new password.
  assert.match(
    forgot,
    /onComplete=\{\(\) => \{[\s\S]{0,240}setStage\("password"\)/,
  );
  assert.match(forgot, /resetPasswordWithOtp/);
  assert.match(forgot, /caught\.reason === "invalid-code"/);
  // The wire's own copy is reused, not re-invented.
  assert.match(forgot, /authFailureCopy/);
  assert.match(signIn, /authFailureCopy/);
});

test("the auth copy stays honest about what the provider does", () => {
  // No fabricated figures: the plates derive theirs from the fixtures.
  for (const text of [brandPanel, authCard, rail, signIn, signUp, forgot]) {
    assert.doesNotMatch(
      code(text),
      /\b\d{1,3}%\s+(uptime|less|faster|fewer)\b/i,
      "auth surfaces must not invent proof figures",
    );
  }
  // A frozen network never freezes the card: every wire call is bounded.
  for (const [name, text] of [
    ["sign-in", signIn],
    ["sign-up", signUp],
    ["forgot", forgot],
  ] as const) {
    assert.match(text, /withAuthTimeout\(/, `${name} must bound its auth calls`);
  }
  assert.match(
    timeoutHelper,
    /AUTH_CALL_TIMEOUT_MS/,
    "the bound lives in one place",
  );
  assert.match(timeoutHelper, /EmailAuthError\(\s*"unavailable"/);

  // The Google path is still gated by its flag and the shared button.
  assert.match(signIn, /<GoogleSignInButton/);
  assert.match(signUp, /<GoogleSignInButton/);
  assert.match(signIn, /googleEnabled/);
  assert.match(signIn, /emailEnabled/);
});
