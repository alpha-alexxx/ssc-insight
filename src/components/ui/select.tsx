"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "radix-ui";
import { Check, ChevronDown } from "@/components/ui/icons";

import { cn } from "@/lib/utils";

/**
 * Select on the Radix umbrella package. Radix supplies the listbox semantics,
 * typeahead, keyboard navigation and focus return that a native `<select>`
 * gets for free but cannot style to the paper system.
 *
 * Use the native `<select>` where a plain option list is enough (it is 16px
 * on phones for free, so iOS never zooms); reach for this when the options
 * need structure, icons or a custom row layout.
 */
const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    data-slot="select-trigger"
    className={cn(
      "flex h-[var(--control-height)] w-full items-center justify-between gap-2 rounded-control border border-rule bg-paper px-[var(--control-pad-x)] text-left text-[length:var(--type-body)] text-ink",
      "touch-manipulation transition-colors duration-[var(--dur-quick)] hover:border-ink data-[placeholder]:text-muted",
      "aria-invalid:border-danger aria-invalid:focus-visible:outline-danger disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-rule-soft disabled:bg-soft disabled:text-muted",
      "[&_svg[data-icon]]:size-4 [&_svg[data-icon]]:shrink-0",
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown data-icon="inline-end" className="text-muted" aria-hidden="true" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      data-slot="select-content"
      position={position}
      className={cn(
        "popover-content z-50 max-h-72 min-w-[8rem] overflow-hidden rounded-floating border border-rule bg-paper text-ink shadow-pop",
        position === "popper" && "w-full min-w-[var(--radix-select-trigger-width)]",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    data-slot="select-label"
    className={cn(
      "px-2 py-1.5 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-muted",
      className,
    )}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    data-slot="select-item"
    className={cn(
      "relative flex min-h-[var(--control-height-sm)] cursor-pointer select-none items-center gap-2 rounded-control px-2 py-1.5 pr-7 text-[length:var(--type-secondary)] outline-none",
      "data-[highlighted]:bg-soft data-[state=checked]:font-medium data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:text-muted",
      "[&_svg[data-icon]]:size-4 [&_svg[data-icon]]:shrink-0",
      className,
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    <SelectPrimitive.ItemIndicator className="absolute right-2">
      <Check data-icon="inline-end" className="text-accent" aria-hidden="true" />
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    data-slot="select-separator"
    className={cn("my-1 h-px bg-rule-soft", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
