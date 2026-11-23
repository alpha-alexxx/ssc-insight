"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Icon, type IconName } from "@/components/icon";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

const SUGGESTIONS: {
  text: string;
  label: string;
  hint: string;
  icon: IconName;
  tile: string;
}[] = [
  {
    text: "What should I focus on this week?",
    label: "Plan this week",
    hint: "A plan from your recent trend",
    icon: "target",
    tile: "bg-primary/10 text-primary",
  },
  {
    text: "Which subject has the weakest accuracy?",
    label: "Find the weak subject",
    hint: "Spot topics that need more work",
    icon: "chart",
    tile: "bg-chart-2/10 text-chart-2",
  },
  {
    text: "Compare my last five mocks",
    label: "Compare recent mocks",
    hint: "See your progress side by side",
    icon: "compare",
    tile: "bg-warning/10 text-warning",
  },
  {
    text: "Suggest a study plan based on my weak topics",
    label: "Build a revision plan",
    hint: "Turn insights into action",
    icon: "book",
    tile: "bg-success/10 text-success",
  },
];

function greetingFor(hour: number): string {
  if (hour < 5) return "Burning the midnight oil";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/**
 * The invitation over an empty conversation — identical on the sheet and
 * the /ask page (one state, two surfaces), composed like the reference's
 * centered greeting: medallion, time-of-day hello with the reader's first
 * name, one sentence carrying the read-only + grounding story, then the
 * tinted suggestion cards and the device footnote.
 *
 * The greeting computes after mount — the server renders a plain "Welcome
 * back" so the clock can never disagree between renders.
 */
export function ChatEmptyState({
  onSend,
  firstName,
  className,
}: {
  onSend: (text: string) => void;
  /** First name for the greeting; omit for a nameless hello (the sheet). */
  firstName?: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [greeting, setGreeting] = useState("Welcome back");
  const [greeted, setGreeted] = useState(false);
  // The clock only exists on the client, so the greeting adjusts once on the
  // first client render (render-phase, guarded) — the server always renders
  // the plain "Welcome back", and there is never a hydration mismatch.
  if (!greeted && typeof window !== "undefined") {
    setGreeted(true);
    const hour = new Date().getHours();
    setGreeting(
      firstName ? `${greetingFor(hour)}, ${firstName}` : greetingFor(hour),
    );
  }

  return (
    <motion.div
      variants={reduced ? undefined : staggerContainer(0.07)}
      initial={reduced ? undefined : "hidden"}
      animate={reduced ? undefined : "show"}
      className={cn(
        "flex flex-col items-center gap-5 pt-6 text-center",
        className,
      )}
    >
      <motion.div
        variants={reduced ? undefined : staggerItem}
        className="flex flex-col items-center gap-3"
      >
        <span
          aria-hidden="true"
          className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary"
        >
          <Icon name="sparkles" size={20} />
        </span>
        <h3 className="font-serif text-[1.75rem] font-medium leading-tight tracking-[-0.02em] text-foreground">
          {greeting}
        </h3>
        <p className="max-w-sm text-[13px] leading-relaxed text-muted-foreground">
          Answers read your aggregates and latest 20 full mocks — never your
          notes or identity.
        </p>
      </motion.div>

      <div className="grid w-full gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((suggestion) => (
          <motion.button
            key={suggestion.text}
            variants={reduced ? undefined : staggerItem}
            type="button"
            onClick={() => onSend(suggestion.text)}
            className="group flex min-h-14 items-center gap-3 rounded-2xl border border-border bg-background px-3 py-2.5 text-left transition-colors hover:border-primary/40"
          >
            <span
              aria-hidden="true"
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-[0.625rem]",
                suggestion.tile,
              )}
            >
              <Icon name={suggestion.icon} size={16} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold leading-tight text-foreground">
                {suggestion.label}
              </span>
              <span className="block truncate text-[11px] leading-snug text-muted-foreground">
                {suggestion.hint}
              </span>
            </span>
            <Icon
              name="arrowRight"
              size={14}
              className="shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary motion-reduce:transition-none"
            />
          </motion.button>
        ))}
      </div>

      <motion.p
        variants={reduced ? undefined : staggerItem}
        className="text-[11px] text-muted-foreground"
      >
        Chats stay on this device; the server stores no conversations.
      </motion.p>
    </motion.div>
  );
}
