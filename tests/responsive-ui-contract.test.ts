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
const themeToggleSource = source("src/components/theme-toggle.tsx");
const pageHeaderSource = source("src/components/page-header.tsx");
const mastheadSource = source("src/components/landing/masthead.tsx");
const signInSource = source("src/components/auth/sign-in-form.tsx");
const signUpSource = source("src/components/auth/sign-up-form.tsx");
const forgotSource = source("src/components/auth/forgot-form.tsx");
const examsSource = source("src/app/(workspace)/settings/_settings/exams-panel.tsx");
const dataPanelSource = source("src/app/(workspace)/settings/_settings/data-panel.tsx");
const securitySource = source("src/app/(workspace)/settings/_settings/security-panel.tsx");
const targetsSource = source("src/app/(workspace)/settings/_settings/targets-panel.tsx");
const remindersSource = source("src/app/(workspace)/settings/_settings/reminders-panel.tsx");
const mockFormSource = source("src/app/(workspace)/add/_add/mock-form.tsx");
const calendarViewSource = source(
  "src/app/(workspace)/calendar/_calendar/calendar-view.tsx",
);
const calendarToolbarSource = source(
  "src/app/(workspace)/calendar/_calendar/calendar/calendar-toolbar.tsx",
);
const calendarEventSource = source(
  "src/app/(workspace)/calendar/_calendar/event-dialog.tsx",
);
const calendarDayLedgerSource = source(
  "src/app/(workspace)/calendar/_calendar/calendar/day-ledger.tsx",
);
const calendarSurfaceSource = source(
  "src/app/(workspace)/calendar/_calendar/calendar/calendar-surface.tsx",
);
const calendarAgendaSource = source(
  "src/app/(workspace)/calendar/_calendar/calendar/agenda-view.tsx",
);
const calendarLayersSource = source(
  "src/app/(workspace)/calendar/_calendar/calendar/layer-toggles.tsx",
);
const calendarEntriesSource = source(
  "src/app/(workspace)/calendar/_calendar/calendar/entry-rows.tsx",
);
const calendarPeriodSource = source(
  "src/app/(workspace)/calendar/_calendar/calendar/period-nav.tsx",
);
const calendarMonthSource = source(
  "src/app/(workspace)/calendar/_calendar/calendar/month-grid.tsx",
);
const calendarWeekSource = source(
  "src/app/(workspace)/calendar/_calendar/calendar/week-view.tsx",
);
const boardViewSource = source("src/app/(workspace)/my-tasks/_tasks/board-view.tsx");
const myTasksViewSource = source(
  "src/app/(workspace)/my-tasks/_tasks/my-tasks-view.tsx",
);
const planRailSource = source("src/app/(workspace)/my-tasks/_tasks/plan-rail.tsx");
const taskToolbarSource = source(
  "src/app/(workspace)/my-tasks/_tasks/task-toolbar.tsx",
);

const task5d1Sources = [
  ["board", boardViewSource],
  ["my tasks view", myTasksViewSource],
  ["plan rail", planRailSource],
  ["task toolbar", taskToolbarSource],
] as const;

const task5c1Sources = [
  ["event dialog", calendarEventSource],
  ["day ledger", calendarDayLedgerSource],
  ["calendar surface", calendarSurfaceSource],
  ["agenda", calendarAgendaSource],
  ["layer toggles", calendarLayersSource],
  ["entry rows", calendarEntriesSource],
  ["period navigation", calendarPeriodSource],
  ["month grid", calendarMonthSource],
  ["week view", calendarWeekSource],
] as const;

const task5bSources = [
  ["exams", examsSource],
  ["data", dataPanelSource],
  ["security", securitySource],
  ["targets", targetsSource],
  ["reminders", remindersSource],
  ["add mock", mockFormSource],
] as const;

function classTokenCount(component: string, token: string) {
  let count = 0;
  for (const match of component.matchAll(/className="([^"]*)"/g)) {
    count += match[1].split(/\s+/).filter((entry) => entry === token).length;
  }
  return count;
}

function assertDeclarations(block: string, declarations: readonly RegExp[]) {
  for (const declaration of declarations) assert.match(block, declaration);
}







test("landing mobile menu trigger composes the shared ghost icon Button", () => {
  const start = mastheadSource.indexOf("MOBILE_NAV_TRIGGER");
  const trigger = mastheadSource.slice(
    start,
    mastheadSource.indexOf("</Button>", start) + "</Button>".length,
  );
  assert.match(trigger, /<Button/);
  assert.match(trigger, /variant="ghost"/);
  assert.match(trigger, /size="icon"/);
  assert.match(trigger, /type="button"/);
  assert.match(trigger, /aria-label="Open navigation"/);
  assert.match(trigger, /md:hidden/);
  assert.match(trigger, /Menu01Icon/);
  assert.doesNotMatch(trigger, /\bsize-9\b/);
  assert.doesNotMatch(trigger, /<button\b/);
});

/**
 * The phone bar is logo · theme · hamburger. Packing Log in / Sign up beside
 * the trigger pushed it past the viewport (21px clipped at 360px, 61px at
 * 320px, i.e. unreachable), so below `sm` the auth pair moves into the drawer
 * with the section links. The trigger itself must keep `md:hidden` so phones
 * never lose their only route to the sections.
 */
test("landing phone bar keeps the hamburger reachable and puts auth in the drawer", () => {
  // The bar's auth wrapper is hidden below `sm` and returns as a flex row.
  const wrapper = mastheadSource.match(
    /<div className="hidden items-center gap-3 sm:flex">([\s\S]*?)<\/div>/,
  );
  assert.ok(wrapper, "the bar's auth pair must sit in a `hidden … sm:flex` wrapper");
  assert.match(wrapper[1], /href="\/sign-in"/);
  assert.match(wrapper[1], /href="\/sign-up"/);

  // The theme toggle and the trigger column never shrink, so nothing can push
  // the hamburger out of the viewport.
  assert.match(mastheadSource, /flex shrink-0 items-center/);
  assert.match(mastheadSource, /className="shrink-0"/);

  // The drawer carries both auth destinations and the disabled fallback.
  assert.match(mastheadSource, /className=\{cn\(LINK_BUTTON\.primary, "w-full justify-center"\)\}/);
  assert.match(mastheadSource, /className=\{cn\(LINK_BUTTON\.ghost, "w-full justify-center"\)\}/);
  assert.match(mastheadSource, /href="\/sign-up"[\s\S]{0,200}Start For Free/);
  assert.match(mastheadSource, /href="\/sign-in"[\s\S]{0,220}I already have an account/);
  assert.match(mastheadSource, /variant="outline" className="w-full justify-center" disabled/);

  // Section links still close the sheet, and the section list is still shared.
  assert.match(mastheadSource, /onClick=\{close\}/);
  assert.match(mastheadSource, /\[\.\.\.NAV, \{ href: "#faq", label: "Questions" \}\]/);
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
    "disabled={code.length !== 6 || status === \"verifying\"}",
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
    '<Link href="/sign-in" className="w-full justify-center">',
    "Go to sign in",
    "onClick={onBack}",
  ]) {
    assert.ok(forgotSource.includes(fragment), `forgot contract lost: ${fragment}`);
  }
});

test("decorative plates and OTP/password compound control exceptions stay intact", () => {
  const authShell = source("src/components/auth/auth-shell.tsx");
  const brandPanel = source("src/components/auth/brand-panel.tsx");
  const authCard = source("src/components/auth/auth-card.tsx");
  const otp = source("src/components/code-input.tsx");
  const rails = source("src/components/auth/otp-rail.tsx");
  const password = source("src/components/password-input.tsx");
  const forgotPlate = source("src/components/auth/plates/forgot-plate.tsx");
  const signInPlate = source("src/components/auth/plates/sign-in-plate.tsx");

  // The brand plate keeps its tone-inverted eyebrow, and the split stage keeps
  // all three readings in the rotation (the task's own leads).
  assert.match(
    brandPanel,
    /aria-hidden="true"[\s\S]*?uppercase tracking-\[0\.14em\] text-primary-foreground\/70/,
  );
  for (const plate of ["SignInPlateArt", "SignUpPlateArt", "ForgotPlateArt"]) {
    assert.ok(authShell.includes(`<${plate} />`), `auth shell lost ${plate}`);
  }
  // The tilt surface stays decorative-only: its layers are hidden, the form is not.
  assert.match(authCard, /aria-hidden="true"/);
  assert.doesNotMatch(authCard, /aria-hidden="true"[^>]*>\s*\{children\}/);
  // The auth rail is one native input under a rail — never six fields.
  assert.equal(rails.match(/<input/g)?.length, 1);
  assert.match(rails, /autoComplete="one-time-code"/);
  assert.ok(otp.includes("h-10"));
  assert.ok(otp.includes("@min-[22rem]:h-11"));
  assert.ok(password.includes("size-7"));
  assert.ok(password.includes("aria-pressed"));
  assert.ok(forgotPlate.includes("tracking-[0.14em] text-primary-foreground/70"));
  assert.ok(forgotPlate.includes("font-serif text-2xl"));
  assert.ok(signInPlate.includes("text-[0.6875rem]"));
  assert.ok(signInPlate.includes("tracking-[0.14em] text-primary-foreground/70"));
});

test("Task 5B consumers use readable typography tokens", () => {
  const banned = /text-(?:\[10px\]|\[11px\]|\[0\.625rem\]|\[0\.6875rem\])(?=[\s"'])/;
  for (const [name, component] of task5bSources) {
    assert.doesNotMatch(component, banned, `${name} retains sub-floor visible type`);
  }

  for (const component of task5bSources.map(([, sourceText]) => sourceText)) {
    assert.match(
      component,
      /text-(?:xs|sm|\[13px\]|\[length:var\(--type-(?:label|secondary)\)\])/,
      "Task 5B consumer is missing its role-based typography token",
    );
  }
});

test("Task 5B Buttons inherit shared control sizing and the exam target action uses Button semantics", () => {
  for (const [name, component] of task5bSources) {
    assert.doesNotMatch(component, /\bh-(?:7|9)\b/, `${name} retains a fixed Button height`);
  }

  const targetAction = examsSource.slice(
    examsSource.lastIndexOf("<", examsSource.indexOf("aria-pressed={isTargeted}")),
    examsSource.indexOf("</", examsSource.indexOf("aria-pressed={isTargeted}")) + 80,
  );
  assert.match(targetAction, /^<Button/);
  assert.match(targetAction, /type="button"/);
  assert.match(targetAction, /size="sm"/);
  assert.match(targetAction, /variant=\{isTargeted \? "secondary" : "outline"\}/);
  assert.match(targetAction, /aria-pressed=\{isTargeted\}/);
  assert.match(targetAction, /disabled=\{busy \|\| enabledKeys\.length === 0 \|\| isTargeted\}/);
  assert.match(targetAction, /onClick=\{onTargeted\}/);
  // Hairline rebuild: the targeted state is the primary tone (was accent ink).
  assert.match(targetAction, /isTargeted[\s\S]*?text-primary/);
  assert.match(targetAction, /enabledKeys\.length === 0[\s\S]*?text-muted-foreground/);
  assert.match(targetAction, /Enable a tier first/);
  assert.match(targetAction, /This is the exam the workspace follows/);
  assert.match(targetAction, /Make this the exam the workspace follows/);
  assert.doesNotMatch(targetAction, /px-\d|py-\d|text-\[0\./);
});

test("Task 5B action clusters and stacked footers use their audited roles", () => {
  // Hairline rebuild: the legacy .action-row/.action-row-stack roles are gone
  // from every settings panel; clusters are plain token classes now.
  for (const [name, component] of task5bSources) {
    assert.doesNotMatch(
      component,
      /action-row(?:-stack)?/,
      `${name} retains a legacy action-row class`,
    );
  }
  // Exams keeps one phone-full-width primary action (create custom exam).
  assert.match(examsSource, /max-sm:w-full/);
  // The import actions keep a wrapping, phone-safe cluster.
  assert.match(dataPanelSource, /mt-4 flex flex-wrap items-center gap-2 sm:justify-start/);
  // Security's confirmations ride Hairline Dialog footers: one dialog per
  // auth action, each with a destructive left of its cancel.
  assert.equal(securitySource.match(/<Dialog\b/g)?.length ?? 0, 5);
  assert.equal(securitySource.match(/variant="destructive"/g)?.length ?? 0, 3);
  // Mock form (Hairline rebuild): the sticky footer keeps a wrapping,
  // phone-safe actions cluster instead of the legacy .action-row-stack role.
  assert.match(
    mockFormSource,
    /sticky bottom-0[\s\S]*?className="flex flex-wrap gap-3 sm:w-auto"/,
  );
  // …and the import actions keep a wrapping row instead of .action-row.
  assert.match(mockFormSource, /className="mt-5 flex flex-wrap gap-3"/);
});

test("Task 5B mixed input, slider, time, and score rows stay role-appropriate", () => {
  const targetMarks = targetsSource.indexOf("Target marks");
  const tierTargetControls = targetsSource.slice(
    targetsSource.lastIndexOf("<div", targetMarks),
    targetsSource.indexOf("</li>", targetMarks),
  );
  const goalPercentile = targetsSource.indexOf("Goal percentile");
  const percentileControls = targetsSource.slice(
    targetsSource.lastIndexOf("<div", goalPercentile),
    targetsSource.indexOf("</li>", goalPercentile),
  );
  const quietHoursStart = remindersSource.indexOf('name="quietHours.start"');
  const quietHours = remindersSource.slice(
    remindersSource.lastIndexOf("<RevealItem", quietHoursStart),
    remindersSource.indexOf("{formState.errors.quietHours"),
  );
  const scoreSummary = mockFormSource.slice(
    mockFormSource.indexOf('className="sticky bottom-0'),
    mockFormSource.indexOf(
      'className="flex flex-wrap gap-3 sm:w-auto"',
      mockFormSource.indexOf('className="sticky bottom-0'),
    ),
  );

  assert.match(tierTargetControls, /flex flex-wrap items-end/);
  assert.match(percentileControls, /flex flex-wrap items-center/);
  assert.match(quietHours, /flex flex-wrap items-end/);
  assert.match(scoreSummary, /flex flex-wrap items-center justify-between/);
  for (const mixedRow of [tierTargetControls, percentileControls, quietHours, scoreSummary]) {
    assert.doesNotMatch(mixedRow, /action-row(?:-stack)?/);
  }
});

test("Task 5B presentation edits preserve audited handlers, conditions, and labels", () => {
  for (const fragment of [
    "onClick={onTargeted}",
    "disabled={busy || enabledKeys.length === 0 || isTargeted}",
    '{isTargeted ? "Your exam" : "Set as your exam"}',
  ]) {
    assert.ok(examsSource.includes(fragment), `exam contract lost: ${fragment}`);
  }
  for (const fragment of [
    "onClick={onDownloadSafety}",
    "onClick={onOpenReplace}",
    "onClick={onReset}",
    "disabled={busy || !safetyDownloaded}",
  ]) {
    assert.ok(dataPanelSource.includes(fragment), `data contract lost: ${fragment}`);
  }
  for (const fragment of [
    "onClick={() => setRegenerateOpen(true)}",
    "onClick={() => setDisableOpen(true)}",
    "onClick={() => setEnrollOpen(true)}",
    "onSubmit={resetForm.handleSubmit",
  ]) {
    assert.ok(securitySource.includes(fragment), `security contract lost: ${fragment}`);
  }
  for (const fragment of [
    "onValueChange={([next]) => onChange(String(next))}",
    "disabled={pending || invalid}",
    `title="Remove this tier's own target and use the structure default"`,
  ]) {
    assert.ok(targetsSource.includes(fragment), `target contract lost: ${fragment}`);
  }
  for (const fragment of [
    'name="quietHours.start"',
    'name="quietHours.end"',
    "onCheckedChange={field.onChange}",
  ]) {
    assert.ok(remindersSource.includes(fragment), `reminder contract lost: ${fragment}`);
  }
  for (const fragment of [
    "onClick={importPaste}",
    "onClick={() => void importWithAi()}",
    "onSubmit={save}",
    "loading={busy}",
    '"Saving…"',
  ]) {
    assert.ok(mockFormSource.includes(fragment), `mock form contract lost: ${fragment}`);
  }
});

test("Task 5C1 Calendar prose uses readable role tokens with only the documented decorative numeral exception", () => {
  const decorativeTodayNumeral =
    /<span className="font-serif text-\[11px\] font-semibold text-primary" aria-hidden="true">[\s\S]*?<\/span>/;
  assert.match(calendarMonthSource, decorativeTodayNumeral);

  /* Hairline rebuild: the readable floor is 11px (Hairline's own type
     scale), so only sub-11px visible type is banned. */
  const banned =
    /text-(?:\[9px\]|\[10px\]|\[0\.625rem\]|\[0\.6875rem\])(?=[\s"'])/;
  for (const [name, component] of task5c1Sources) {
    const visibleSource =
      name === "month grid" ? component.replace(decorativeTodayNumeral, "") : component;
    assert.doesNotMatch(
      visibleSource,
      banned,
      `${name} retains ordinary sub-floor visible type`,
    );
  }

  for (const [name, component] of task5c1Sources) {
    /* Hairline rebuild: period navigation's only own copy (the "Any date
       works…" hint) is owned by the Hairline DatePicker's Field, so its type
       sizes live in that component rather than in this source. */
    if (name === "period navigation") continue;
    assert.match(
      component,
      /text-\[(?:11|12|13)(?:\.\d+)?px\]/,
      `${name} is missing readable typography sizes`,
    );
  }
});

test("Task 5C1 Calendar controls consume shared target and field contracts", () => {
  /* Hairline rebuild: the date jump is the Hairline DatePicker (typed or
     picked, plain YYYY-MM-DD values) rather than a raw Input type="date". */
  assert.match(calendarPeriodSource, /import\s+\{\s*DatePicker\s*\}/);
  assert.match(
    calendarPeriodSource,
    /<DatePicker[\s\S]*?value=\{selected\}[\s\S]*?onValueChange=\{\(value\) => \{[\s\S]*?onSelect\(value\)/,
  );
  assert.doesNotMatch(calendarPeriodSource, /<input\b|\bh-9\b/);

  /* Hairline rebuild: the close affordance and the checkbox glyphs are owned
     by the Hairline Dialog and Checkbox components. */
  assert.match(calendarEventSource, /<Dialog[\s\S]*?open=\{!!task\}/);
  const checkboxControls = [...calendarEventSource.matchAll(/<Checkbox/g)].length;
  assert.equal(checkboxControls, 2);
  for (const match of [...calendarEventSource.matchAll(/<Checkbox[\s\S]*?aria-label=\{`Mark/g)]) {
    assert.ok(match[0].length > 0, "Hairline checkbox missing its accessible name");
  }
  assert.match(calendarDayLedgerSource, /onClick=\{onMarkAllDone\}/);
  const agendaGroups = calendarAgendaSource.slice(
    calendarAgendaSource.indexOf("function AgendaGroups"),
    calendarAgendaSource.indexOf("function EarlierRanges"),
  );
  assert.match(
    agendaGroups,
    /onClick=\{\(\) => onGoToDate\(date\)\}[\s\S]*?className="inline-flex/,
    "AgendaGroups Open is missing the shared target",
  );

  const earlierRanges = calendarAgendaSource.slice(
    calendarAgendaSource.indexOf("function EarlierRanges"),
  );
  assert.match(
    earlierRanges,
    /onClick=\{\(\) => setOpen\(\(value\) => !value\)\}[\s\S]*?className="inline-flex/,
    "EarlierRanges disclosure is missing the shared target",
  );
  assert.match(
    earlierRanges,
    /onClick=\{\(\) => onGoToDate\(date\)\}[\s\S]*?className="flex w-full/,
    "EarlierRanges date row is missing the shared target",
  );

  for (const [name, component] of task5c1Sources) {
    /* Hairline rebuild: min-h-9 (36px) is the shared touch floor, so only the
       old fixed heights and custom halos are banned. */
    assert.doesNotMatch(
      component,
      /\bmin-h-10\b|after:-inset-/,
      `${name} retains fixed or custom target geometry`,
    );
  }
});

test("Task 5C1 Calendar action groups use their audited intrinsic and stacked roles", () => {
  /* Hairline rebuild: the overlays own their footers (Dialog/Sheet footer
     props), so the legacy action-row roles no longer appear in the calendar
     sources; the day ledger's actions are plain wrapping flex rows. */
  assert.equal(classTokenCount(calendarAgendaSource, "action-row-stack"), 0);
  assert.equal(classTokenCount(calendarAgendaSource, "action-row"), 0);
  assert.equal(classTokenCount(calendarEventSource, "action-row-stack"), 0);
  assert.equal(classTokenCount(calendarEventSource, "action-row"), 0);
  assert.equal(classTokenCount(calendarDayLedgerSource, "action-row"), 0);
  assert.equal(classTokenCount(calendarDayLedgerSource, "action-row-stack"), 0);
});

test("Task 5C1 presentation edits preserve Calendar callbacks, labels, and selection semantics", () => {
  for (const fragment of [
    "if (!open) onClose()",
    "onToggleRevision(",
    "!day.revisionDone.includes(String(revisionIndex))",
    "onToggleChecklist(day, item.id, !item.done)",
    "onClick={() => onOpenPlanDay(task.date)}",
    "onClick={() => onToggleComplete(task)}",
  ]) {
    assert.ok(calendarEventSource.includes(fragment), `event contract lost: ${fragment}`);
  }
  for (const fragment of [
    "onClick={onMarkAllDone}",
    "onAddPersonal(date)",
    "onAddMock(date)",
    "href={`/plan/${date}`}",
  ]) {
    assert.ok(calendarDayLedgerSource.includes(fragment), `ledger contract lost: ${fragment}`);
  }
  for (const fragment of [
    "setWindowState({ start: selected, days: days + AGENDA_WINDOW })",
    "onClick={() => onGoToDate(date)}",
    "onClick={() => setOpen((value) => !value)}",
    "onClick={() => onGoToDate(today)}",
  ]) {
    assert.ok(calendarAgendaSource.includes(fragment), `agenda contract lost: ${fragment}`);
  }
  for (const [component, fragments] of [
    [calendarLayersSource, ["onClick={() => onToggle(layer, !active)}", "aria-pressed={active}"]],
    [calendarPeriodSource, ["onClick={() => onStep(-1)}", "onClick={() => onStep(1)}", "if (value) onSelect(value)"]],
    [calendarMonthSource, ["aria-label={label}", "onClick={onSelect}", "tabIndex={isTabStop ? 0 : -1}"]],
    [calendarWeekSource, ["aria-label={label}", "onClick={onSelect}", 'layout="column"', 'layout="row"']],
  ] as const) {
    for (const fragment of fragments) {
      assert.ok(component.includes(fragment), `Calendar contract lost: ${fragment}`);
    }
  }
});

test("Task 5C2 Calendar local folds query their named containers", () => {
  assert.match(
    calendarViewSource,
    /className="[^"]*@container\/cal-page"/,
  );
  const surfaceStart = calendarViewSource.indexOf(
    '<div\n        className={\n          mode === "month"',
  );
  const surfaceEnd = calendarViewSource.indexOf("</aside>", surfaceStart);
  assert.notEqual(surfaceStart, -1, "missing Calendar surface/rail region");
  assert.notEqual(surfaceEnd, -1, "missing Calendar rail end");
  const surfaceRail = calendarViewSource.slice(surfaceStart, surfaceEnd);
  for (const fragment of [
    "@5xl/cal-page:grid-cols-[minmax(0,1.9fr)_minmax(340px,1fr)]",
    "@3xl/cal-page:block",
    "@5xl/cal-page:sticky",
    "@5xl/cal-page:top-[4.25rem]",
    "@5xl/cal-page:self-start",
  ]) {
    assert.ok(surfaceRail.includes(fragment), `Calendar fold missing: ${fragment}`);
  }
  assert.doesNotMatch(surfaceRail, /\b(?:md|xl):/);
  assert.ok(calendarViewSource.includes('open={isMobile && dayDrawerOpen}'));
  assert.ok(calendarViewSource.includes('mode === "month" || mode === "week"'));

  assert.match(
    calendarToolbarSource,
    /className="[^"]*@container\/cal-toolbar/,
  );
  const titleNavStart = calendarToolbarSource.indexOf(
    '<div className="flex flex-col gap-2',
  );
  const titleNavEnd = calendarToolbarSource.indexOf("<PeriodNav", titleNavStart);
  assert.notEqual(titleNavStart, -1, "missing toolbar title/navigation region");
  assert.notEqual(titleNavEnd, -1, "missing toolbar period navigation");
  const titleNavigation = calendarToolbarSource.slice(titleNavStart, titleNavEnd);
  for (const fragment of [
    "@lg/cal-toolbar:flex-row",
    "@lg/cal-toolbar:items-center",
    "@lg/cal-toolbar:justify-between",
    "@lg/cal-toolbar:text-[1.25rem]",
    "@lg/cal-toolbar:justify-end",
  ]) {
    assert.ok(titleNavigation.includes(fragment), `Title/navigation fold missing: ${fragment}`);
  }
  assert.doesNotMatch(titleNavigation, /\bsm:/);
  assert.ok(titleNavigation.includes('aria-live="polite"'));

  const modeLayersStart = calendarToolbarSource.indexOf(
    '<div className="mt-2 flex flex-col gap-2',
  );
  const modeLayersEnd = calendarToolbarSource.indexOf(
    "<LayerToggles",
    modeLayersStart,
  );
  assert.notEqual(modeLayersStart, -1, "missing toolbar mode/layers region");
  assert.notEqual(modeLayersEnd, -1, "missing toolbar layer controls");
  const modeLayers = calendarToolbarSource.slice(modeLayersStart, modeLayersEnd);
  for (const fragment of [
    "@lg/cal-toolbar:flex-row",
    "@lg/cal-toolbar:flex-wrap",
    "@lg/cal-toolbar:items-center",
    "@lg/cal-toolbar:justify-between",
    "@lg/cal-toolbar:w-auto",
    "@lg/cal-toolbar:flex-none",
  ]) {
    assert.ok(modeLayers.includes(fragment), `Mode/layers fold missing: ${fragment}`);
  }
  assert.doesNotMatch(modeLayers, /\bsm:/);
  assert.ok(modeLayers.includes("max-[359px]:hidden"));
  assert.ok(modeLayers.includes('label="Calendar view"'));

  const layerGroupStart = calendarLayersSource.indexOf(
    'className="grid w-full grid-cols-3',
  );
  const layerGroupEnd = calendarLayersSource.indexOf('"\n    >', layerGroupStart);
  assert.notEqual(layerGroupStart, -1, "missing LayerToggles group class");
  assert.notEqual(layerGroupEnd, -1, "missing LayerToggles group class end");
  const layerGroupClass = calendarLayersSource.slice(layerGroupStart, layerGroupEnd);
  for (const fragment of [
    "@lg/cal-toolbar:inline-flex",
    "@lg/cal-toolbar:w-auto",
    "@lg/cal-toolbar:[&>button]:flex-none",
  ]) {
    assert.ok(layerGroupClass.includes(fragment), `Layer fold missing: ${fragment}`);
  }
  assert.doesNotMatch(layerGroupClass, /\bsm:/);

  /* Hairline rebuild: the event dialog is the Hairline Dialog; its revision
     matrix folds on the viewport sm breakpoint instead of a named container
     (the dialog sizes itself). */
  assert.match(
    calendarEventSource,
    /<Dialog[\s\S]*?open=\{!!task\}/,
  );
  const revisionStart = calendarEventSource.indexOf('<dl className="mt-4');
  const revisionEnd = calendarEventSource.indexOf("</dl>", revisionStart);
  assert.notEqual(revisionStart, -1, "missing event revision matrix");
  assert.notEqual(revisionEnd, -1, "missing event revision matrix end");
  const revisionMatrix = calendarEventSource.slice(revisionStart, revisionEnd);
  assert.ok(revisionMatrix.includes("sm:grid-cols-3"));
  assert.doesNotMatch(revisionMatrix, /@sm\/event-dialog/);
});

test("Task 5D1 My Tasks prose uses readable role tokens with only the documented board initial exception", () => {
  const decorativeBoardInitial =
    /className="flex size-3 items-center justify-center rounded-\[2px\] bg-muted text-\[7px\] font-semibold uppercase"[\s\S]*?aria-hidden="true"[\s\S]*?\{host\.charAt\(0\)\}/;
  assert.match(boardViewSource, decorativeBoardInitial);

  /* Hairline rebuild: the readable floor is 11px (Hairline's own type
     scale), so only sub-11px visible type is banned. */
  const banned =
    /text-(?:\[9px\]|\[10px\]|\[0\.5625rem\]|\[0\.625rem\]|\[0\.6875rem\])(?=[\s"'])/;
  for (const [name, component] of task5d1Sources) {
    const visibleSource =
      name === "board" ? component.replace(decorativeBoardInitial, "") : component;
    assert.doesNotMatch(
      visibleSource,
      banned,
      `${name} retains ordinary sub-floor visible type`,
    );
  }

  for (const [name, component] of task5d1Sources) {
    assert.match(
      component,
      /text-\[(?:11|12|13)(?:\.\d+)?px\]/,
      `${name} is missing readable typography sizes`,
    );
  }
});

test("Task 5D1 route controls inherit shared target and control contracts", () => {
  assert.doesNotMatch(planRailSource, /\bh-7\b/);
  /* Hairline rebuild: the rail's "Open day" is a token-styled link pill. */
  const openDay = planRailSource.slice(
    planRailSource.indexOf("recommended &&"),
    planRailSource.indexOf("Today's workspace"),
  );
  assert.match(openDay, /<Link/);
  assert.match(openDay, /href=\{`\/plan\/\$\{recommended\.day\.date\}`\}/);
  assert.match(openDay, /min-h-9/);
  assert.match(openDay, /Open day <PlainIcon name="arrowRight" size=\{12\} \/>/);
  assert.doesNotMatch(openDay, /text-\[0\.6875rem\]/);

  const groupButton = myTasksViewSource.slice(
    myTasksViewSource.indexOf('aria-pressed={filters.group === group.id && tab === "all"}'),
    myTasksViewSource.indexOf("</button>", myTasksViewSource.indexOf('aria-pressed={filters.group === group.id && tab === "all"}')),
  );
  assert.match(groupButton, /className=\{cn\(/);
  assert.match(groupButton, /min-h-9/);

  const filterChipRegion = myTasksViewSource.slice(
    myTasksViewSource.indexOf("activeEntries.length > 0"),
    myTasksViewSource.indexOf("selecting &&"),
  );
  assert.match(
    filterChipRegion,
    /rounded-full bg-primary\/10[\s\S]*?min-h-8/,
  );
  const clearAllStart = filterChipRegion.indexOf("Clear all");
  const clearAllButton = filterChipRegion.slice(
    Math.max(0, filterChipRegion.lastIndexOf("<button", clearAllStart)),
    filterChipRegion.indexOf("</button>", clearAllStart),
  );
  assert.match(clearAllButton, /min-h-8/);
  assert.match(clearAllButton, /text-\[11px\]/);

  for (const [name, component] of task5d1Sources) {
    assert.doesNotMatch(
      component,
      /\bh-7\b/,
      `${name} retains a fixed control height`,
    );
  }
  assert.doesNotMatch(boardViewSource, /text-\[0\.8125rem\]/);
});

test("Task 5D1 footers use their audited stacked and wrapping roles", () => {
  /* Hairline rebuild: the overlays own their footers (the Dialog footer
     prop), so the legacy action-row roles no longer appear in these
     sources; the remaining footers are plain wrapping flex rows. */
  assert.equal(classTokenCount(myTasksViewSource, "action-row-stack"), 0);
  assert.equal(classTokenCount(myTasksViewSource, "action-row"), 0);
  assert.equal(classTokenCount(planRailSource, "action-row"), 0);
  assert.equal(classTokenCount(boardViewSource, "action-row"), 0);

  const taskFooter = myTasksViewSource.slice(
    myTasksViewSource.indexOf("Move to Trash?"),
    myTasksViewSource.indexOf("</Dialog>", myTasksViewSource.indexOf("Move to Trash?")),
  );
  assert.match(taskFooter, /footer=\{/);
  assert.match(taskFooter, /variant="ghost"[\s\S]*?Cancel/);

  const rescheduleFooter = myTasksViewSource.slice(
    myTasksViewSource.indexOf("New date"),
    myTasksViewSource.indexOf("</form>"),
  );
  assert.match(rescheduleFooter, /className="flex justify-end gap-2"/);
  assert.match(rescheduleFooter, /<Button[\s\S]*?variant="ghost"[\s\S]*?disabled=\{busy\}[\s\S]*?Cancel/);
  assert.match(rescheduleFooter, /<Button disabled=\{busy\}>Reschedule<\/Button>/);
});

test("Task 5D1 local folds query named containers", () => {
  const pageRegion = myTasksViewSource.slice(
    myTasksViewSource.indexOf('aria-label="My tasks"'),
    myTasksViewSource.indexOf("</aside>"),
  );
  assert.match(
    pageRegion,
    /className="personal-workspace min-w-0 @container\/mt-page"/,
  );
  assert.ok(pageRegion.includes("@5xl/mt-page:grid-cols-[minmax(0,1fr)_minmax(300px,360px)]"));
  assert.ok(pageRegion.includes("@5xl/mt-page:col-start-2"));
  assert.ok(pageRegion.includes("@5xl/mt-page:col-start-1"));
  assert.ok(pageRegion.includes("@5xl/mt-page:row-start-1"));
  assert.doesNotMatch(pageRegion, /\blg:/);

  const boardGridClass = boardViewSource.slice(
    boardViewSource.indexOf("// The board is its own container"),
    boardViewSource.indexOf("{COLUMNS.map"),
  );
  assert.match(boardGridClass, /@container\/board/);
  assert.match(boardGridClass, /<div className="@container\/board">/);
  assert.ok(
    boardGridClass.includes(
      'className="grid items-start gap-3 @sm/board:grid-cols-2 @2xl/board:grid-cols-3"',
    ),
  );
  assert.ok(boardViewSource.includes("})}\n      </div>\n    </div>\n  );"));
  assert.doesNotMatch(boardGridClass, /\b(?:sm|lg):/);

  const toolbarDesktop = taskToolbarSource.slice(
    taskToolbarSource.indexOf('<div className="hidden items-center gap-2 @lg/tasks-toolbar:flex">'),
    taskToolbarSource.indexOf('<div className="flex items-center gap-2 @lg/tasks-toolbar:hidden">'),
  );
  assert.match(
    toolbarDesktop,
    /className="hidden items-center gap-2 @lg\/tasks-toolbar:flex"/,
  );
  assert.ok(toolbarDesktop.includes("DropdownMenu"));
  assert.ok(toolbarDesktop.includes('variant="outline"'));
  assert.doesNotMatch(toolbarDesktop, /\bmd:/);
  const toolbarPhone = taskToolbarSource.slice(
    taskToolbarSource.indexOf('<div className="flex items-center gap-2 @lg/tasks-toolbar:hidden">'),
    taskToolbarSource.indexOf("{layoutSegment}"),
  );
  assert.ok(toolbarPhone.includes("@lg/tasks-toolbar:hidden"));
  assert.doesNotMatch(toolbarPhone, /\bmd:/);
});

test("Task 5D1 presentation edits preserve route handlers and state contracts", () => {
  for (const fragment of [
    "patchFilters({ [entry.key]: \"all\" } as Partial<TaskFilters>)",
    "clearFilters();",
    "resetPage();",
    "onClick={() => setGroupsOpen(true)}",
    "patchFilters({ group: group.id })",
    "onPatchFilters({ sort: value })",
    "onClick={() => setSheetOpen(true)}",
    "onCycleStatus(task, column)",
    "handleDrop(column.id)",
    "onClick={() => onEdit(task)}",
    "void bulkRescheduleApply()",
    "dueDate: newDate",
    "setPage(page - 1)",
    "setPage(page + 1)",
    "href={`/plan/week/${today}`}",
    "href=\"/calendar\"",
  ]) {
    assert.ok(
      myTasksViewSource.includes(fragment) ||
        boardViewSource.includes(fragment) ||
        taskToolbarSource.includes(fragment) ||
        planRailSource.includes(fragment),
      `route contract lost: ${fragment}`,
    );
  }
  assert.ok(myTasksViewSource.includes('aria-label="Task calendar"'));
  assert.ok(myTasksViewSource.includes("<PersonalCalendar"));
  assert.ok(myTasksViewSource.includes("<PlanRail plan={planApi.plan}"));
});
