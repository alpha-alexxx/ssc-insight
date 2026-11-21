"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  GitCompare,
  Target,
} from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  {
    text: "What should I focus on this week?",
    icon: Target,
    label: "Plan this week",
  },
  {
    text: "Which subject has the weakest accuracy?",
    icon: BarChart3,
    label: "Find the weak subject",
  },
  {
    text: "Compare my last five mocks",
    icon: GitCompare,
    label: "Compare recent mocks",
  },
  {
    text: "Suggest a study plan based on my weak topics",
    icon: BookOpen,
    label: "Build a revision plan",
  },
];

/**
 * The invitation over an empty conversation — identical on the sheet and
 * the /ask page (one state, two surfaces). Deliberately slim: one question,
 * one sentence that carries the whole read-only + grounding story, and the
 * one-tap suggestions. The source chips and the pledge live elsewhere (the
 * header's Read-only chip, the usage footer), so a returning reader lands
 * on actions, not an introduction.
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
      className={cn("flex flex-col gap-5 pt-2", className)}
    >
      <motion.div variants={reduced ? undefined : staggerItem}>
        <h3 className="font-serif text-[1.375rem] font-medium leading-tight text-ink">
          What would help you study today?
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          Answers read your aggregates and latest 20 full mocks — never your
          notes or identity.
        </p>
      </motion.div>
      <div className="grid gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((suggestion) => (
          <motion.button
            key={suggestion.text}
            variants={reduced ? undefined : staggerItem}
            type="button"
            onClick={() => onSend(suggestion.text)}
            className="group flex min-h-11 items-center gap-2.5 rounded-card border border-rule-soft bg-paper px-3 py-2 text-left transition-colors hover:border-accent/40"
          >
            <span
              aria-hidden
              className="grid size-7 shrink-0 place-items-center rounded-control border border-rule-soft bg-canvas text-muted transition-colors group-hover:text-accent"
            >
              <suggestion.icon size={13} />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
              {suggestion.label}
            </span>
            <ArrowUpRight
              size={12}
              aria-hidden
              className="shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100"
            />
          </motion.button>
        ))}
      </div>
      <motion.p
        variants={reduced ? undefined : staggerItem}
        className="px-1 text-[0.6875rem] leading-relaxed text-muted"
      >
        Chats stay on this device; the server stores no conversations.
      </motion.p>
    </motion.div>
  );
}
