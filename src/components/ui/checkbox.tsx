"use client";

import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Checkbox on the Radix umbrella package, square and ink-filled when on —
 * the same geometry as the plan's completion toggles and the native
 * `input[type=checkbox]` styling in the base layer, so a Radix checkbox and a
 * native one never look like different products.
 *
 * Radix supplies the indeterminate state, keyboard handling and
 * `aria-checked`; `data-state` drives the visuals.
 */
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    data-slot="checkbox"
    className={cn(
      "peer tap-target inline-flex size-4 shrink-0 items-center justify-center rounded-[calc(var(--radius-control)/2)] border border-rule bg-paper",
      "transition-colors duration-[var(--dur-quick)]",
      "data-[state=checked]:border-ink data-[state=checked]:bg-ink data-[state=checked]:text-paper",
      "data-[state=indeterminate]:border-ink data-[state=indeterminate]:bg-ink data-[state=indeterminate]:text-paper",
      "disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-rule-soft disabled:bg-soft disabled:text-muted",
      "disabled:data-[state=checked]:border-rule-soft disabled:data-[state=checked]:bg-soft disabled:data-[state=checked]:text-muted",
      "disabled:data-[state=indeterminate]:border-rule-soft disabled:data-[state=indeterminate]:bg-soft disabled:data-[state=indeterminate]:text-muted",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center [&_svg[data-icon]]:size-2.5">
      <Check data-icon="inline-start" strokeWidth={3} aria-hidden="true" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
