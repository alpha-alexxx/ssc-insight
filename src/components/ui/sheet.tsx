"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * shadcn Sheet primitive, adapted to SSC Insight's paper design system.
 *
 * The generated shadcn animation utilities depend on tw-animate-css, which
 * this project deliberately does not install. `sheet-overlay` /
 * `sheet-content` in globals.css provide the same enter/exit motion using
 * the project's duration/easing tokens and the global reduced-motion rule.
 */

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn("sheet-overlay fixed inset-0 z-50 bg-ink/25", className)}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

type SheetSide = "top" | "right" | "bottom" | "left";

const sideClasses: Record<SheetSide, string> = {
  top: "inset-x-0 top-0 max-h-[90dvh] rounded-b-[var(--radius-floating)] border-b",
  bottom:
    "inset-x-0 bottom-0 max-h-[90dvh] rounded-t-[var(--radius-floating)] border-t",
  left: "inset-y-0 left-0 h-dvh w-[86vw] rounded-r-[var(--radius-floating)] border-r sm:max-w-[28.75rem]",
  right:
    "inset-y-0 right-0 h-dvh w-[86vw] rounded-l-[var(--radius-floating)] border-l sm:max-w-[28.75rem]",
};

interface SheetContentProps extends React.ComponentPropsWithoutRef<
  typeof SheetPrimitive.Content
> {
  side?: SheetSide;
  showCloseButton?: boolean;
  overlayClassName?: string;
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(
  (
    {
      side = "right",
      className,
      children,
      showCloseButton = true,
      overlayClassName,
      ...props
    },
    ref,
  ) => (
    <SheetPortal>
      <SheetOverlay className={overlayClassName} />
      <SheetPrimitive.Content
        ref={ref}
        data-side={side}
        className={cn(
          "sheet-content fixed z-50 flex flex-col gap-4 border-rule bg-background p-0 shadow-pop",
          sideClasses[side],
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close className="tap-target absolute right-2 top-2 z-10 inline-flex size-[var(--control-height-sm)] touch-manipulation items-center justify-center rounded-control text-muted transition-[color,background-color] duration-[var(--dur-quick)] hover:bg-soft hover:text-ink disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-soft disabled:text-muted [&_svg[data-icon]]:size-4">
            <X data-icon="inline-start" />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  ),
);
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col gap-1.5 p-4", className)} {...props} />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "mt-auto flex flex-col-reverse gap-2 p-4 sm:flex-row sm:justify-end",
      className,
    )}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn(
      "font-serif text-[length:var(--type-section-title)] font-medium leading-snug text-foreground",
      className,
    )}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn(
      "text-pretty text-[length:var(--type-secondary)] leading-relaxed text-muted-foreground",
      className,
    )}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
