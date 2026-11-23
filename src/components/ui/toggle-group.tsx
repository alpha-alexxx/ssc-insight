"use client";

import * as React from "react";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * Radix toggle group in two variants:
 *
 * - `segment` (default) — styled as the project's `.segment-group` /
 *   `.segment` pattern so it inherits every palette, style and breakpoint
 *   rule — including the 44px phone hit area and the phone
 *   `--segment-pad-x` tightening.
 * - `card` — rich selection cards (the Appearance panel's palette and
 *   style pickers): the group takes the caller's grid classes, and each
 *   item is a bordered card whose pressed state reads `data-state="on"`.
 *   Item content is caller-owned (swatches, glyphs), so the variant only
 *   owns the card chrome and the selected border/wash.
 *
 * It is deliberately **inline** rather than a popover or dropdown: overlays
 * all portal at z-50, and these controls must stay reachable while a drawer
 * is open.
 */

type ToggleGroupVariant = "segment" | "card";

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> & {
    variant?: ToggleGroupVariant;
    overflowBehavior?: "wrap" | "scroll";
  }
>(
  (
    { className, variant = "segment", overflowBehavior = "wrap", ...props },
    ref,
  ) => (
    <ToggleGroupPrimitive.Root
      ref={ref}
      data-slot="toggle-group"
      data-overflow-behavior={variant === "segment" ? overflowBehavior : undefined}
      className={cn(
        variant === "segment" && "segment-group max-w-full",
        variant === "segment" &&
          (overflowBehavior === "scroll"
            ? "flex-nowrap overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>*]:shrink-0"
            : "flex-wrap"),
        variant === "card" && "w-full",
        className,
      )}
      {...props}
    />
  ),
);
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

/**
 * One option. `aria-pressed` is what `.segment` styles, and Radix sets
 * `data-state="on"` on the pressed item, so both selectors agree. The card
 * variant drives its selected border/wash from `data-[state=on]` instead —
 * no conditional className, the group's `value` owns the state.
 */
const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> & {
    variant?: ToggleGroupVariant;
  }
>(({ className, variant = "segment", ...props }, ref) => (
  <ToggleGroupPrimitive.Item
    ref={ref}
    data-slot="toggle-group-item"
    className={cn(
      variant === "card"
        ? "flex flex-col items-stretch rounded-control border border-rule-soft text-left transition-[color,background-color,border-color] duration-[var(--dur-quick)] hover:border-rule data-[state=on]:border-accent data-[state=on]:bg-accent-soft disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-rule-soft disabled:bg-soft disabled:text-muted"
        : "segment",
      className,
    )}
    {...props}
  />
));
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleGroupItem };
