"use client";

import * as React from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Icon, PlainIcon, type IconName } from "@/components/icon";
import { cn } from "@/lib/utils";

/**
 * The first screen of a conversation: a small greeting, four compact starting
 * points that ask real questions about the tracker, and a transparent scope
 * strip showing what the coach can see.
 *
 * Presentational on purpose. Scrolling belongs to the host (`/ask` owns a
 * single scroller per state): a second scroll container here would nest inside
 * the transcript's, and the inner one would never receive the wheel.
 */

const STARTERS: {
  icon: IconName;
  tag: string;
  title: string;
  prompt: string;
}[] = [
  {
    icon: "target",
    tag: "Diagnostics",
    title: "Where am I losing marks?",
    prompt:
      "Where am I losing the most marks across my recent mocks, and what is causing it?",
  },
  {
    icon: "calendar",
    tag: "Next steps",
    title: "Plan my next 7 days",
    prompt:
      "Build me a 7-day study plan from my weakest subjects and recent mock results.",
  },
  {
    icon: "trend",
    tag: "Momentum",
    title: "Is my accuracy improving?",
    prompt:
      "Compare my accuracy and attempt rate across my last five full mocks. Is it improving?",
  },
  {
    icon: "flag",
    tag: "Goal check",
    title: "Am I on track for my target?",
    prompt:
      "How far is my latest score from my target, and what would close the gap fastest?",
  },
];

const SCOPE = [
  { icon: "shield" as const, label: "Read-only access" },
  { icon: "history" as const, label: "Latest 20 full mocks" },
  { icon: "file" as const, label: "Personal notes never sent" },
];

function greeting(firstName?: string) {
  const hour = new Date().getHours();
  if (hour < 12) {
    return firstName ? `Morning, ${firstName}` : "Morning";
  }
  if (hour < 17) {
    return firstName ? `Afternoon, ${firstName}` : "Afternoon";
  }
  return firstName ? `Evening, ${firstName}` : "Evening";
}

export function AskEmptyState({
  firstName,
  disabled,
  onPick,
}: {
  firstName?: string;
  /** AI is not configured (or a turn is in flight): cards are shown but inert. */
  disabled?: boolean;
  onPick: (prompt: string) => void;
}) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-176 min-w-0 flex-col justify-center py-4 sm:py-6">
      {/* ── Greeting ─────────────────────────────────────── */}
      <div className="flex flex-col items-start">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10.5px] font-medium text-primary shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--primary)_20%,transparent)]">
          <Sparkles className="size-3 shrink-0" aria-hidden="true" />
          <span>Personal Study Coach</span>
        </div>

        <h2 className="mt-3 font-serif text-[1.0625rem] font-medium leading-snug tracking-[-0.01em] text-foreground sm:text-[1.125rem]">
          {greeting(firstName)}. What would help most today?
        </h2>

        <p className="mt-1.5 max-w-[60ch] text-[12.5px] leading-relaxed text-muted-foreground">
          Grounded in your tracker snapshot — never guessed from nothing.
        </p>
      </div>

      {/* ── Starter prompts ──────────────────────────────── */}
      <div className="mt-5">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/80">
          Suggested starting points
        </p>

        <ul
          aria-label="Suggested questions"
          className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-2"
        >
          {STARTERS.map((item) => (
            <li key={item.title} className="flex min-w-0">
              <button
                type="button"
                disabled={disabled}
                onClick={() => onPick(item.prompt)}
                className={cn(
                  "group/starter relative flex h-full w-full min-w-0 cursor-pointer flex-col justify-between gap-1.5 rounded-xl bg-background/80 px-3 py-2.5 text-left",
                  "shadow-[inset_0_0_0_1px_var(--border)] outline-none transition-all duration-200",
                  "hover:bg-accent/35 hover:shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--primary)_40%,var(--border))]",
                  "focus-visible:ring-2 focus-visible:ring-ring/50 active:scale-[0.99]",
                  "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-background/80 disabled:hover:shadow-[inset_0_0_0_1px_var(--border)]",
                  "motion-reduce:transition-none",
                )}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span
                      aria-hidden="true"
                      className="grid size-6 shrink-0 place-items-center rounded-lg bg-muted/80 text-muted-foreground transition-colors duration-200 group-hover/starter:bg-primary/10 group-hover/starter:text-primary"
                    >
                      <PlainIcon name={item.icon} size={13} />
                    </span>
                    <span className="truncate text-[10px] font-medium tracking-wide text-muted-foreground">
                      {item.tag}
                    </span>
                  </div>

                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-3 shrink-0 text-muted-foreground/40 transition-all duration-200 group-hover/starter:translate-x-0.5 group-hover/starter:-translate-y-0.5 group-hover/starter:text-primary"
                  />
                </div>

                <div className="min-w-0">
                  <span className="block text-[12.5px] font-medium leading-snug text-foreground transition-colors group-hover/starter:text-primary">
                    {item.title}
                  </span>
                  <span className="mt-0.5 line-clamp-1 block text-[11.5px] leading-snug text-muted-foreground">
                    {item.prompt}
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Privacy & scope strip ────────────────────────── */}
      <ul
        aria-label="Privacy and data scope"
        className="mt-4 flex flex-wrap items-center gap-1.5 text-[10.5px] text-muted-foreground"
      >
        {SCOPE.map((item) => (
          <li
            key={item.label}
            className="inline-flex items-center gap-1 rounded-full bg-muted/40 px-2 py-0.5 shadow-[inset_0_0_0_1px_var(--border)]"
          >
            <Icon name={item.icon} size={11} tone="primary" />
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
