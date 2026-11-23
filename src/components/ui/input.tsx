import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(
        "block h-[var(--control-height)] w-full min-w-0 rounded-control border border-rule bg-paper px-[var(--control-pad-x)] py-0 text-[length:var(--type-body)] text-ink transition-colors duration-[var(--dur-quick)] placeholder:text-muted",
        "aria-invalid:border-danger aria-invalid:focus-visible:outline-danger read-only:bg-soft",
        "disabled:cursor-not-allowed disabled:border-rule-soft disabled:bg-soft disabled:text-muted disabled:placeholder:text-muted",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
