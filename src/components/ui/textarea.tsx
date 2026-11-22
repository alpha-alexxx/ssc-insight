import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    data-slot="textarea"
    className={cn(
      "min-h-24 w-full min-w-0 resize-y rounded-control border border-rule bg-paper px-[var(--control-pad-x)] py-[var(--control-pad-y)] text-[length:var(--type-body)] text-ink transition-colors duration-[var(--dur-quick)] placeholder:text-muted",
      "aria-invalid:border-danger aria-invalid:focus-visible:outline-danger read-only:bg-soft",
      "disabled:cursor-not-allowed disabled:border-rule-soft disabled:bg-soft disabled:text-muted disabled:placeholder:text-muted",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
