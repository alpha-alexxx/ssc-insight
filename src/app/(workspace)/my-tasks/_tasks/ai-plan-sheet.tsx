"use client";

import { Sheet } from "@/components/sheet";
import { TodoAiComposer } from "@/components/shared/tasks/ai-composer";

/**
 * The page-level "Plan with AI" host: a right-side sheet (the app's AI
 * surface idiom) holding the shared review-before-apply composer.
 *
 * Hairline rebuild: the Hairline Sheet (side="right", drag-to-dismiss).
 */
export function AiPlanSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      side="right"
      width={520}
      title="Plan with AI"
      description="Draft tasks from a description, review every change, then apply."
    >
      <div className="pb-[max(16px,env(safe-area-inset-bottom))]">
        <TodoAiComposer compact />
      </div>
    </Sheet>
  );
}
