"use client";

import {
  BarChart3,
  BookOpen,
  ChevronRight,
  GitCompare,
  Lightbulb,
  Target,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const QUICK_QUESTIONS = [
  {
    text: "What should I focus on this week?",
    icon: Target,
  },
  {
    text: "Why did my last full mock score change?",
    icon: TrendingUp,
  },
  {
    text: "Which subject has the weakest accuracy?",
    icon: BarChart3,
  },
  {
    text: "Suggest a study plan based on my weak topics",
    icon: BookOpen,
  },
  {
    text: "Compare my last five mocks",
    icon: GitCompare,
  },
  {
    text: "Important topics to revise next?",
    icon: Lightbulb,
  },
];

/**
 * The invitation over an empty conversation — identical on the sheet and the
 * /ask page (one state, two surfaces): one serif question, one sentence of
 * scope, and the ruled list of quick questions. A row click sends the
 * question as the first message of the active conversation.
 */
export function ChatEmptyState({
  onSend,
  className,
}: {
  onSend: (text: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-5 pt-2", className)}>
      <div>
        <h3 className="font-serif text-[1.375rem] font-medium leading-tight text-ink">
          What would help you study today?
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Ask anything about your mocks, targets, or plan. Earlier chats stay
          on this device.
        </p>
      </div>
      <div className="border-t border-rule-soft">
        {QUICK_QUESTIONS.map((question) => (
          <button
            key={question.text}
            type="button"
            onClick={() => onSend(question.text)}
            className="group flex min-h-12 w-full items-center gap-3 border-b border-rule-soft px-1 py-3 text-left text-sm leading-snug text-ink transition-colors hover:bg-soft"
          >
            <question.icon
              size={15}
              className="shrink-0 text-muted transition-colors group-hover:text-accent"
            />
            <span className="min-w-0 flex-1">{question.text}</span>
            <ChevronRight
              size={15}
              className="shrink-0 text-muted transition-colors group-hover:text-accent"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
