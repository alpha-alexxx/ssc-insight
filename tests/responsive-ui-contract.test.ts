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

test("Task 5B consumers use readable typography tokens", () => {
  const banned = /text-(?:\[10px\]|\[11px\]|\[0\.625rem\]|\[0\.6875rem\])(?=[\s"'])/;
  for (const [name, component] of task5bSources) {
    assert.doesNotMatch(component, banned, `${name} retains sub-floor visible type`);
  }

  for (const component of task5bSources.map(([, sourceText]) => sourceText)) {
    assert.match(
      component,
      /text-\[length:var\(--type-(?:label|secondary)\)\]/,
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
  assert.match(targetAction, /isTargeted[\s\S]*?disabled:opacity-100/);
  assert.match(targetAction, /enabledKeys\.length === 0[\s\S]*?text-muted/);
  assert.match(targetAction, /Enable a tier first/);
  assert.match(targetAction, /This is the exam the workspace follows/);
  assert.match(targetAction, /Make this the exam the workspace follows/);
  assert.doesNotMatch(targetAction, /px-\d|py-\d|text-\[0\./);
});

test("Task 5B action clusters and stacked footers use their audited roles", () => {
  assert.equal(classTokenCount(examsSource, "action-row-stack"), 1);
  assert.equal(classTokenCount(dataPanelSource, "action-row-stack"), 1);
  const explicitSecurityFooters = classTokenCount(securitySource, "action-row-stack");
  const alertDialogFooters = securitySource.match(/<AlertDialogFooter>/g)?.length ?? 0;
  assert.equal(explicitSecurityFooters, 9);
  assert.equal(explicitSecurityFooters + alertDialogFooters, 10);
  assert.equal(classTokenCount(mockFormSource, "action-row-stack"), 1);

  assert.equal(classTokenCount(securitySource, "action-row"), 1);
  assert.equal(classTokenCount(mockFormSource, "action-row"), 1);
  assert.equal(classTokenCount(examsSource, "action-row"), 0);
  assert.equal(classTokenCount(dataPanelSource, "action-row"), 0);
  assert.match(dataPanelSource, /action-row-stack mt-4 sm:justify-start/);
  assert.equal(
    securitySource.match(/action-row-stack sm:justify-between/g)?.length,
    2,
  );
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
    mockFormSource.indexOf('className="panel sticky'),
    mockFormSource.indexOf(
      'className="action-row-stack',
      mockFormSource.indexOf('className="panel sticky'),
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
    "disabled={busy}",
    '"Saving…"',
  ]) {
    assert.ok(mockFormSource.includes(fragment), `mock form contract lost: ${fragment}`);
  }
});

test("Task 5C1 Calendar prose uses readable role tokens with only the documented decorative numeral exception", () => {
  const decorativeTodayNumeral =
    /<span className="font-serif text-\[11px\] font-semibold text-accent" aria-hidden="true">[\s\S]*?<\/span>/;
  assert.match(calendarMonthSource, decorativeTodayNumeral);

  const banned =
    /text-(?:\[9px\]|\[10px\]|\[11px\]|\[0\.625rem\]|\[0\.6875rem\])(?=[\s"'])/;
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
    assert.match(
      component,
      /text-\[length:var\(--type-(?:label|secondary)\)\]/,
      `${name} is missing role-based typography tokens`,
    );
  }
});

test("Task 5C1 Calendar controls consume shared target and field contracts", () => {
  assert.match(calendarPeriodSource, /import\s+\{\s*Input\s*\}/);
  assert.match(
    calendarPeriodSource,
    /<Input[\s\S]*?type="date"[\s\S]*?value=\{selected\}[\s\S]*?onChange=\{\(event\) => \{[\s\S]*?onSelect\(event\.target\.value\)/,
  );
  assert.doesNotMatch(calendarPeriodSource, /<input\b|\bh-9\b/);

  const close = calendarEventSource.slice(
    calendarEventSource.indexOf("<Dialog.Close"),
    calendarEventSource.indexOf("</Dialog.Close>") + "</Dialog.Close>".length,
  );
  assert.match(close, /<Dialog\.Close asChild>/);
  assert.match(close, /<Button/);
  assert.match(close, /type="button"/);
  assert.match(close, /variant="ghost"/);
  assert.match(close, /size="icon"/);
  assert.match(close, /aria-label="Close event"/);
  assert.doesNotMatch(close, /<button\b/);

  assert.equal(calendarEventSource.match(/"tap-target /g)?.length, 2);
  const checkboxStarts = [...calendarEventSource.matchAll(/role="checkbox"/g)].map(
    (match) => calendarEventSource.lastIndexOf("<button", match.index),
  );
  assert.equal(checkboxStarts.length, 2);
  for (const start of checkboxStarts) {
    const control = calendarEventSource.slice(
      start,
      calendarEventSource.indexOf("</button>", start),
    );
    assert.match(control, /tap-target/);
    assert.match(control, /<span[\s\S]*?size-4[\s\S]*?border[\s\S]*?aria-hidden="true"/);
  }
  assert.match(calendarDayLedgerSource, /onClick=\{onMarkAllDone\}[\s\S]*?tap-target/);
  const agendaGroups = calendarAgendaSource.slice(
    calendarAgendaSource.indexOf("function AgendaGroups"),
    calendarAgendaSource.indexOf("function EarlierRanges"),
  );
  assert.match(
    agendaGroups,
    /onClick=\{\(\) => onGoToDate\(date\)\}[\s\S]*?className="tap-target inline-flex/,
    "AgendaGroups Open is missing the shared target",
  );

  const earlierRanges = calendarAgendaSource.slice(
    calendarAgendaSource.indexOf("function EarlierRanges"),
  );
  assert.match(
    earlierRanges,
    /onClick=\{\(\) => setOpen\(\(value\) => !value\)\}[\s\S]*?className="tap-target inline-flex/,
    "EarlierRanges disclosure is missing the shared target",
  );
  assert.match(
    earlierRanges,
    /onClick=\{\(\) => onGoToDate\(date\)\}[\s\S]*?className="tap-target flex w-full/,
    "EarlierRanges date row is missing the shared target",
  );

  for (const [name, component] of task5c1Sources) {
    assert.doesNotMatch(
      component,
      /\bh-9\b|\bmin-h-10\b|after:-inset-/,
      `${name} retains fixed or custom target geometry`,
    );
  }
});

test("Task 5C1 Calendar action groups use their audited intrinsic and stacked roles", () => {
  assert.equal(classTokenCount(calendarAgendaSource, "action-row-stack"), 1);
  assert.equal(classTokenCount(calendarAgendaSource, "action-row"), 0);
  assert.equal(classTokenCount(calendarEventSource, "action-row-stack"), 1);
  assert.equal(classTokenCount(calendarEventSource, "action-row"), 0);
  assert.equal(classTokenCount(calendarDayLedgerSource, "action-row"), 1);
  assert.equal(classTokenCount(calendarDayLedgerSource, "action-row-stack"), 0);
});

test("Task 5C1 presentation edits preserve Calendar callbacks, labels, and selection semantics", () => {
  for (const fragment of [
    "onOpenChange={(open) => !open && onClose()}",
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
    [calendarPeriodSource, ["onClick={() => onStep(-1)}", "onClick={() => onStep(1)}", "if (event.target.value) onSelect(event.target.value)"]],
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
    /className="cal-page min-w-0 @container\/cal-page"/,
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
    /className="cal-toolbar [^"]*@container\/cal-toolbar/,
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
    "@lg/cal-toolbar:inline-flex",
    "@lg/cal-toolbar:w-auto",
    "@lg/cal-toolbar:flex-none",
  ]) {
    assert.ok(modeLayers.includes(fragment), `Mode/layers fold missing: ${fragment}`);
  }
  assert.doesNotMatch(modeLayers, /\bsm:/);
  assert.ok(modeLayers.includes("max-[359px]:hidden"));
  assert.ok(modeLayers.includes('aria-label="Calendar view"'));

  const layerGroupStart = calendarLayersSource.indexOf(
    'className="segment-group grid w-full grid-cols-3',
  );
  const layerGroupEnd = calendarLayersSource.indexOf('"\n    >', layerGroupStart);
  assert.notEqual(layerGroupStart, -1, "missing LayerToggles group class");
  assert.notEqual(layerGroupEnd, -1, "missing LayerToggles group class end");
  const layerGroupClass = calendarLayersSource.slice(layerGroupStart, layerGroupEnd);
  for (const fragment of [
    "@lg/cal-toolbar:inline-flex",
    "@lg/cal-toolbar:w-auto",
    "@lg/cal-toolbar:[&_.segment]:flex-none",
  ]) {
    assert.ok(layerGroupClass.includes(fragment), `Layer fold missing: ${fragment}`);
  }
  assert.doesNotMatch(layerGroupClass, /\bsm:/);

  assert.match(
    calendarEventSource,
    /<Dialog\.Content className="[^"]*@container\/event-dialog/,
  );
  const revisionStart = calendarEventSource.indexOf('<dl className="mt-4');
  const revisionEnd = calendarEventSource.indexOf("</dl>", revisionStart);
  assert.notEqual(revisionStart, -1, "missing event revision matrix");
  assert.notEqual(revisionEnd, -1, "missing event revision matrix end");
  const revisionMatrix = calendarEventSource.slice(revisionStart, revisionEnd);
  assert.ok(revisionMatrix.includes("@sm/event-dialog:grid-cols-3"));
  assert.doesNotMatch(revisionMatrix, /\bsm:/);
});

test("Task 5D1 My Tasks prose uses readable role tokens with only the documented board initial exception", () => {
  const decorativeBoardInitial =
    /className="flex size-3 items-center justify-center rounded-\[2px\] bg-soft text-\[7px\] font-semibold uppercase"[\s\S]*?aria-hidden="true"[\s\S]*?\{host\.charAt\(0\)\}/;
  assert.match(boardViewSource, decorativeBoardInitial);

  const banned =
    /text-(?:\[9px\]|\[10px\]|\[11px\]|\[0\.5625rem\]|\[0\.625rem\]|\[0\.6875rem\])(?=[\s"'])/;
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
      /text-\[length:var\(--type-(?:label|secondary)\)\]/,
      `${name} is missing role-based typography tokens`,
    );
  }
});

test("Task 5D1 route controls inherit shared target and control contracts", () => {
  assert.doesNotMatch(planRailSource, /\bh-7\b/);
  const openDay = planRailSource.slice(
    planRailSource.indexOf("<Button"),
    planRailSource.indexOf("</Button>") + "</Button>".length,
  );
  assert.match(openDay, /<Button/);
  assert.match(openDay, /asChild/);
  assert.match(openDay, /size="sm"/);
  assert.match(openDay, /variant="outline"/);
  assert.match(openDay, /href=\{`\/plan\/\$\{recommended\.day\.date\}`\}/);
  assert.doesNotMatch(openDay, /text-\[0\.6875rem\]/);

  assert.doesNotMatch(myTasksViewSource, /\bmin-h-9\b/);
  const groupButton = myTasksViewSource.slice(
    myTasksViewSource.indexOf('aria-pressed={filters.group === group.id && tab === "all"}'),
    myTasksViewSource.indexOf("</button>", myTasksViewSource.indexOf('aria-pressed={filters.group === group.id && tab === "all"}')),
  );
  assert.match(groupButton, /className=\{cn\(/);
  assert.match(groupButton, /min-h-\[var\(--control-height-sm\)\]/);
  assert.match(groupButton, /tap-target/);

  const filterChipRegion = myTasksViewSource.slice(
    myTasksViewSource.indexOf("activeEntries.length > 0"),
    myTasksViewSource.indexOf("selecting &&"),
  );
  assert.match(
    filterChipRegion,
    /rounded-pill border border-accent\/40[\s\S]*?min-h-\[var\(--control-height-sm\)\][\s\S]*?tap-target/,
  );
  const clearAllStart = filterChipRegion.indexOf("Clear all");
  const clearAllButton = filterChipRegion.slice(
    Math.max(0, filterChipRegion.lastIndexOf("<button", clearAllStart)),
    filterChipRegion.indexOf("</button>", clearAllStart),
  );
  assert.match(clearAllButton, /min-h-\[var\(--control-height-sm\)\]/);
  assert.match(clearAllButton, /tap-target/);
  assert.match(clearAllButton, /text-\[length:var\(--type-label\)\]/);

  for (const [name, component] of task5d1Sources) {
    assert.doesNotMatch(
      component,
      /\bh-(?:7|9)\b/,
      `${name} retains a fixed control height`,
    );
  }
  assert.doesNotMatch(boardViewSource, /text-\[0\.8125rem\]/);
});

test("Task 5D1 footers use their audited stacked and wrapping roles", () => {
  assert.equal(classTokenCount(myTasksViewSource, "action-row-stack"), 3);
  assert.equal(classTokenCount(myTasksViewSource, "action-row"), 0);
  assert.equal(classTokenCount(planRailSource, "action-row"), 0);
  assert.equal(classTokenCount(boardViewSource, "action-row"), 0);

  const taskFooter = myTasksViewSource.slice(
    myTasksViewSource.indexOf("Move to Trash?"),
    myTasksViewSource.indexOf("</Dialog.Content>"),
  );
  assert.match(taskFooter, /className="action-row-stack mt-4 justify-end gap-2 sm:mx-0"/);

  const rescheduleFooter = myTasksViewSource.slice(
    myTasksViewSource.indexOf("New date"),
    myTasksViewSource.indexOf("</form>"),
  );
  assert.match(rescheduleFooter, /className="action-row-stack justify-end gap-2"/);
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
