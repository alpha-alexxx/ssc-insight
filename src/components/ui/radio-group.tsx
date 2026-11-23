"use client";

import * as React from "react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * Radio group on the Radix umbrella package. Square indicators, ink fill for
 * the selected option — the Frame Rule keeps round for status dots and the
 * answer ring, so a selected radio is a filled square with an inner paper
 * mark rather than a dot.
 *
 * Radix supplies roving focus and arrow-key selection within the group.
 */
const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    ref={ref}
    data-slot="radio-group"
    className={cn("grid gap-2", className)}
    {...props}
  />
));
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    data-slot="radio-group-item"
    className={cn(
      "tap-target inline-flex size-4 shrink-0 items-center justify-center rounded-[calc(var(--radius-control)/2)] border border-rule bg-paper",
      "transition-colors duration-[var(--dur-quick)]",
      "data-[state=checked]:border-ink data-[state=checked]:bg-ink data-[state=checked]:text-paper",
      "disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-rule-soft disabled:bg-soft disabled:text-muted",
      "disabled:data-[state=checked]:border-rule-soft disabled:data-[state=checked]:bg-soft disabled:data-[state=checked]:text-muted",
      className,
    )}
    {...props}
  >
    <RadioGroupPrimitive.Indicator
      data-slot="radio-group-indicator"
      className="block size-1.5 bg-current"
    />
  </RadioGroupPrimitive.Item>
));
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };
