"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  GitCompare,
  Shield,
  Sparkles,
  Target,
} from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Suggestion tones come from the app's own color identity — the accent for
 * planning, the fixed Reasoning blue for subject diagnosis, the semantic
 * warning/positive pair for comparison and revision. No hardcoded hues.
 */
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
    tone: { bg: "color-mix(in oklab, var(--chart-reasoning) 14%, transparent)", fg: "var(--chart-reasoning)" },
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

/**
 * The invitation over an empty conversation — identical on the sheet and
 * the /ask page (one state, two surfaces). The reference composition: a
 * soft medallion beside the serif question, then tinted suggestion cards
 * with chevrons, and a centered shield footnote — all compact, so a
 * returning reader lands on actions, not an introduction.
 */
export function ChatEmptyState({
  onSend,
  className,
}: {
  onSend: (text: string) => void;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      variants={reduced ? undefined : staggerContainer(0.07)}
      initial={reduced ? undefined : "hidden"}
      animate={reduced ? undefined : "show"}
      className={cn("flex flex-col gap-5 pt-1", className)}
    >
      <motion.div variants={reduced ? undefined : staggerItem} className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-soft text-accent"
        >
          <Sparkles size={17} />
        </span>
        <div className="min-w-0">
          <h3 className="font-serif text-[1.375rem] font-medium leading-tight tracking-[-0.01em] text-ink">
            What would help you study today?
          </h3>
          <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted">
            Answers read your aggregates and latest 20 full mocks — never
            your notes or identity.
          </p>
        </div>
      </motion.div>

      <div className="grid gap-2 sm:grid-cols-2">
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
        className="flex items-center justify-center gap-1.5 text-[0.6875rem] text-muted"
      >
        <Shield size={11} aria-hidden className="text-accent" />
        Chats stay on this device; the server stores no conversations.
      </motion.p>
    </motion.div>
  );
}
