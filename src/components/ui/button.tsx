import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex touch-manipulation items-center justify-center gap-2 whitespace-nowrap rounded-control text-sm font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-[var(--dur-quick)] active:translate-y-px motion-reduce:active:translate-y-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:border disabled:border-rule-soft disabled:bg-soft disabled:text-muted disabled:[background-image:none] [&_svg[data-icon]]:pointer-events-none [&_svg[data-icon]]:size-4 [&_svg[data-icon]]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-accent text-paper hover:bg-accent-hover [background-image:var(--accent-sheen)]",
        secondary:
          "border border-rule-soft bg-soft text-ink hover:border-rule hover:bg-canvas",
        outline: "border border-rule bg-paper text-ink hover:bg-canvas",
        ghost: "bg-transparent text-muted hover:bg-soft hover:text-ink",
        destructive: "bg-danger text-paper hover:bg-danger-hover",
      },
      size: {
        default: "h-[var(--control-height)] px-4",
        sm: "h-[var(--control-height-sm)] px-3 text-[length:var(--type-secondary)]",
        icon: "size-[var(--control-height)]",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
