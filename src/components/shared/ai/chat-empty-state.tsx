"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, BarChart3, BookOpen, GitCompare, Shield, Target } from "lucide-react";
import { EASE, staggerContainer, staggerItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  {
    title: "Plan this week",
    text: "What should I focus on this week?",
    icon: Target,
    hint: "Turns your trend into the next seven days",
  },
  {
    title: "Find the weak subject",
    text: "Which subject has the weakest accuracy?",
    icon: BarChart3,
    hint: "Diagnoses accuracy and coverage per subject",
  },
  {
    title: "Compare recent mocks",
    text: "Compare my last five mocks",
    icon: GitCompare,
    hint: "What moved, what stalled, and why",
  },
  {
    title: "Build a revision plan",
    text: "Suggest a study plan based on my weak topics",
    icon: BookOpen,
    hint: "A concrete plan for the weakest topics",
  },
];

/** What the coach reads — the same four sources the trace strip claims. */
const READS = [
  "Aggregate analytics",
  "Subject profile",
  "Target ledger",
  "Latest 20 mocks",
];

/**
 * The invitation over an empty conversation — identical on the sheet and the
 * /ask page (one state, two surfaces): a read-only pledge card ("what it
 * reads" / "never writes") above a 2×2 grid of one-tap suggestions. A
 * suggestion click sends the question as the first message of the active
 * conversation. Staggered entrance, collapsed under reduced motion.
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
      className={cn("flex flex-col gap-4 pt-2", className)}
    >
      <motion.div
        variants={reduced ? undefined : staggerItem}
        className="rounded-card border border-accent/30 bg-accent-soft/60 px-4 py-4"
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className="grid size-9 shrink-0 place-items-center rounded-control bg-accent/15 text-accent"
          >
            <Shield size={16} />
          </span>
          <div className="min-w-0">
            <h3 className="font-serif text-[1.25rem] font-medium leading-tight text-ink">
              Your read-only coach
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Grounded in your tracker. Ask anything about mocks, targets, or
              plan.
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {READS.map((read) => (
            <span
              key={read}
              className="inline-flex items-center gap-1 rounded-pill border border-rule-soft bg-paper px-2 py-0.5 text-[0.625rem] font-medium text-muted"
            >
              {read}
            </span>
          ))}
        </div>
        <p className="mt-3 flex items-center gap-1.5 border-t border-accent/20 pt-2.5 text-[0.6875rem] text-muted">
          <Shield size={10} aria-hidden className="text-accent" />
          It reads; it never writes — your notes stay yours.
        </p>
      </motion.div>
      <div className="grid gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((suggestion) => (
          <motion.button
            key={suggestion.title}
            variants={reduced ? undefined : staggerItem}
            type="button"
            onClick={() => onSend(suggestion.text)}
            className="group flex min-h-11 items-start gap-2.5 rounded-card border border-rule-soft bg-paper px-3 py-2.5 text-left transition-colors hover:border-accent/40"
          >
            <span
              aria-hidden
              className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-control border border-rule-soft bg-canvas text-muted transition-colors group-hover:text-accent"
            >
              <suggestion.icon size={13} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1 text-sm font-medium text-ink">
                {suggestion.title}
                <ArrowUpRight
                  size={12}
                  aria-hidden
                  className="text-muted opacity-0 transition-opacity group-hover:opacity-100"
                />
              </span>
              <span className="mt-0.5 block text-xs leading-snug text-muted">
                {suggestion.hint}
              </span>
            </span>
          </motion.button>
        ))}
      </div>
      <motion.p
        variants={reduced ? undefined : staggerItem}
        className="px-1 text-[0.6875rem] leading-relaxed text-muted"
      >
        Earlier chats stay on this device; the server stores no conversations.
      </motion.p>
    </motion.div>
  );
}
