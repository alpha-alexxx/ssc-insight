"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  GitCompare,
  Sparkles,
  Target,
} from "@/components/ui/icons";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  {
    text: "What should I focus on this week?",
    label: "Plan this week",
    hint: "A plan from your recent trend",
    icon: Target,
    tone: { bg: "var(--accent-soft)", fg: "var(--accent)" },
  },
  {
    text: "Which subject has the weakest accuracy?",
    label: "Find the weak subject",
    hint: "Spot topics that need more work",
    icon: BarChart3,
    tone: {
      bg: "color-mix(in oklab, var(--chart-reasoning) 14%, transparent)",
      fg: "var(--chart-reasoning)",
    },
  },
  {
    text: "Compare my last five mocks",
    label: "Compare recent mocks",
    hint: "See your progress side by side",
    icon: GitCompare,
    tone: { bg: "var(--warning-soft)", fg: "var(--warning)" },
  },
  {
    text: "Suggest a study plan based on my weak topics",
    label: "Build a revision plan",
    hint: "Turn insights into action",
    icon: BookOpen,
    tone: { bg: "var(--positive-soft)", fg: "var(--positive)" },
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
      className={cn("flex flex-col items-center gap-5 pt-6 text-center", className)}
    >
      <motion.div
        variants={reduced ? undefined : staggerItem}
        className="flex flex-col items-center gap-3"
      >
        <span
          aria-hidden="true"
          className="grid size-12 place-items-center rounded-full bg-accent-soft text-accent"
        >
          <Sparkles size={20} />
        </span>
        <h3 className="font-serif text-[1.75rem] font-medium leading-tight tracking-[-0.02em] text-ink">
          {greeting}
        </h3>
        <p className="max-w-sm text-[0.8125rem] leading-relaxed text-muted">
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
            className="group flex min-h-14 items-center gap-3 rounded-card border border-rule-soft bg-paper px-3 py-2.5 text-left transition-colors hover:border-accent/40"
          >
            <span
              aria-hidden="true"
              className="grid size-9 shrink-0 place-items-center rounded-[0.625rem]"
              style={{ background: suggestion.tone.bg, color: suggestion.tone.fg }}
            >
              <suggestion.icon size={16} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold leading-tight text-ink">
                {suggestion.label}
              </span>
              <span className="block truncate text-[0.6875rem] leading-snug text-muted">
                {suggestion.hint}
              </span>
            </span>
            <ArrowRight
              size={14}
              aria-hidden
              className="shrink-0 text-muted transition-all group-hover:translate-x-0.5 group-hover:text-accent motion-reduce:transition-none"
            />
          </motion.button>
        ))}
      </div>

      <motion.p
        variants={reduced ? undefined : staggerItem}
        className="text-[0.6875rem] text-muted"
      >
        Chats stay on this device; the server stores no conversations.
      </motion.p>
    </motion.div>
  );
}
