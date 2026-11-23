"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * Switch on the Radix umbrella package, drawn in the ledger's own geometry:
 * a square-cornered 36×20 track with a square thumb, an ink fill when on and
 * a hairline when off. Round is reserved by the Frame Rule for status dots
 * and the answer ring, so this is deliberately not a pill.
 *
 * The thumb is 16px inside a 20px track with a 2px inset, so the motion is a
 * pure `translate` that the style tokens can retime.
 */
const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> & {
    /** Accessible name when the visible label is not a `<label>` around it. */
    label?: string;
  }
>(({ className, label, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    data-slot="switch"
    aria-label={label}
    className={cn(
      "peer tap-target inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-control border p-[2px]",
      "transition-colors duration-[var(--dur-quick)]",
      "border-rule bg-paper data-[state=checked]:border-ink data-[state=checked]:bg-ink",
      "disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-rule-soft disabled:bg-soft",
      "disabled:data-[state=checked]:border-rule-soft disabled:data-[state=checked]:bg-soft",
      "disabled:[&_[data-slot=switch-thumb]]:bg-muted",
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      data-slot="switch-thumb"
      className={cn(
        "pointer-events-none block size-4 shrink-0 rounded-[calc(var(--radius-control)/2)] bg-rule transition-transform duration-[var(--dur-quick)]",
        "data-[state=checked]:translate-x-4 data-[state=checked]:bg-paper",
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = SwitchPrimitive.Root.displayName;

/** A labelled row: title, optional description, control on the right. */
function SwitchRow({
  title,
  description,
  control,
  className,
}: {
  title: string;
  description?: string;
  control: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-b border-rule-soft py-3 last:border-b-0",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{title}</p>
        {description && (
          <p className="mt-0.5 text-pretty text-[length:var(--type-secondary)] leading-relaxed text-muted">
            {description}
          </p>
        )}
      </div>
      <div className="shrink-0 pt-0.5">{control}</div>
    </div>
  );
}

export { Switch, SwitchRow };
