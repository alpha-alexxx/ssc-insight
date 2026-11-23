import type { IconName } from "@/components/icon";
import { SUBJECTS } from "@/lib/domain";
import type { CalendarViewMode } from "@/lib/calendar-url";
import type { PlanTaskType } from "@/lib/plan/schema";
import type { CalendarLayer } from "@/lib/plan/calendar-entries";
import { isMockType } from "@/lib/plan/view-model";

/**
 * Calendar presentation helpers. Pure class/data functions with no JSX, so the
 * month, week, day and agenda surfaces agree on one grammar.
 *
 * The calendar uses **three kinds of ink** rather than three chip colors:
 * scheduled work is printed (a tinted row with a 2px category rule), personal
 * work is a margin note (an outlined row with a status dot), and logged work
 * is a stamp (a neutral row with a serif score). Form carries the layer, so
 * within the printed layer the **subject** carries the hue: the global chart
 * identity set (chart-1 quant, chart-2 reasoning, chart-3 english, chart-4
 * ga, chart-5 computer) that every chart in the app uses.
 *
 * Hairline rebuild: every swatch/tint is a semantic token class
 * (--chart-N/--primary/--success/--warning/--border/--foreground washes).
 */

/** The mode union lives with the URL mirror. */
export type CalendarMode = CalendarViewMode;

/** Days rendered per agenda window — one bounded fortnight. */
export const AGENDA_WINDOW = 14;

export const CALENDAR_MODES: {
  id: CalendarMode;
  label: string;
  short: string;
  icon: IconName;
}[] = [
  { id: "month", label: "Month", short: "M", icon: "calendar" },
  { id: "week", label: "Week", short: "W", icon: "layers" },
  { id: "day", label: "Day", short: "D", icon: "file" },
  { id: "agenda", label: "Agenda", short: "A", icon: "check" },
];

/* ---------- layer toggles and legend ---------- */

export const LAYER_META: Record<
  CalendarLayer,
  { label: string; icon: IconName; swatch: string; tick: string }
> = {
  plan: {
    label: "Plan",
    icon: "calendar",
    /* Printed: a tinted bar with a solid category rule. */
    swatch: "bg-primary/10 border-l-2 border-l-primary",
    tick: "bg-primary",
  },
  tasks: {
    label: "Personal",
    icon: "check",
    /* A margin note: outline only, no tint. */
    swatch: "bg-background border border-border",
    tick: "bg-success",
  },
  mocks: {
    label: "Logged",
    icon: "report",
    /* A stamp: neutral with an ink figure. */
    swatch: "bg-muted border-l-2 border-l-foreground",
    tick: "bg-foreground",
  },
};

/* ---------- plan category grammar (unchanged meanings) ---------- */

/** The global chart-hue index of the subject a plan task studies.
 * A full mock (live/paid) spans every subject and a mixed practice set
 * ("best questions") has none, so neither borrows a subject hue: the full
 * mock keeps the plan's primary ink, the mixed set stays neutral. */
export type PlanSubjectHue = 1 | 2 | 3 | 4 | 5;

export function planSubjectHue(task: {
  type: PlanTaskType;
}): PlanSubjectHue | null {
  switch (task.type) {
    case "maths_sectional":
    case "maths_topic":
      return 1; // quant
    case "reasoning_sectional":
      return 2; // reasoning
    case "english_sectional":
      return 3; // english
    case "gk_sectional":
      return 4; // ga
    case "computer_mock":
    case "computer_pyq":
      return 5; // computer
    default:
      return null;
  }
}

/* Per-hue class sets. Static literal strings so Tailwind's scanner emits
   every chart utility these surfaces use. */
const SUBJECT_ROW: Record<PlanSubjectHue, string> = {
  1: "border-l-chart-1 bg-chart-1/10 text-foreground",
  2: "border-l-chart-2 bg-chart-2/10 text-foreground",
  3: "border-l-chart-3 bg-chart-3/10 text-foreground",
  4: "border-l-chart-4 bg-chart-4/10 text-foreground",
  5: "border-l-chart-5 bg-chart-5/10 text-foreground",
};
const SUBJECT_TICK: Record<PlanSubjectHue, string> = {
  1: "bg-chart-1",
  2: "bg-chart-2",
  3: "bg-chart-3",
  4: "bg-chart-4",
  5: "bg-chart-5",
};
const SUBJECT_PILL: Record<PlanSubjectHue, string> = {
  1: "bg-chart-1/10 text-chart-1",
  2: "bg-chart-2/10 text-chart-2",
  3: "bg-chart-3/10 text-chart-3",
  4: "bg-chart-4/10 text-chart-4",
  5: "bg-chart-5/10 text-chart-5",
};

/** Category → row tint plus the 2px left rule that carries the subject hue. */
export function planRowClass(task: {
  type: PlanTaskType;
  completed: boolean;
}): string {
  if (task.completed)
    return "border-l-2 border-l-success bg-success/5 text-muted-foreground";
  const hue = planSubjectHue(task);
  if (hue) return `border-l-2 ${SUBJECT_ROW[hue]}`;
  if (isMockType(task.type))
    return "border-l-2 border-l-primary bg-primary/10 text-foreground";
  return "border-l-2 border-l-border bg-muted text-foreground";
}

/** The solid fill for the 2px rule and the <sm compact marker. */
export function planTickClass(task: {
  type: PlanTaskType;
  completed: boolean;
}): string {
  if (task.completed) return "bg-success";
  const hue = planSubjectHue(task);
  if (hue) return SUBJECT_TICK[hue];
  if (isMockType(task.type)) return "bg-primary";
  return "bg-border";
}

/** The month-grid cell pill: a token-tinted wash whose text carries the
 * subject hue, the solid tick inside carrying the same hue. */
export function planPillClass(task: {
  type: PlanTaskType;
  completed: boolean;
}): string {
  if (task.completed) return "bg-success/10 text-muted-foreground";
  const hue = planSubjectHue(task);
  if (hue) return SUBJECT_PILL[hue];
  if (isMockType(task.type)) return "bg-primary/10 text-primary";
  return "bg-muted text-foreground";
}

/** Per-category glyph, shared by every surface. */
export function taskIconName(type: PlanTaskType): IconName {
  if (isMockType(type)) return "file";
  if (type.endsWith("_sectional")) return "book";
  if (type === "maths_topic") return "target";
  return "layers";
}

/** Plan-category key: subject work carries its global chart hue; a full
 * mock (every subject) keeps the plan's primary ink; a mixed practice set
 * stays neutral. */
export const TASK_LEGEND: { label: string; swatch: string }[] = [
  { label: SUBJECTS.quant.short, swatch: "bg-chart-1/10 border-l-2 border-l-chart-1" },
  { label: SUBJECTS.reasoning.short, swatch: "bg-chart-2/10 border-l-2 border-l-chart-2" },
  { label: SUBJECTS.english.short, swatch: "bg-chart-3/10 border-l-2 border-l-chart-3" },
  { label: SUBJECTS.ga.short, swatch: "bg-chart-4/10 border-l-2 border-l-chart-4" },
  { label: SUBJECTS.computer.short, swatch: "bg-chart-5/10 border-l-2 border-l-chart-5" },
  { label: "Mock test", swatch: "bg-primary/10 border-l-2 border-l-primary" },
  { label: "Other", swatch: "bg-muted border-l-2 border-l-border" },
];
