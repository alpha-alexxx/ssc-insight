import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-control border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-accent text-paper hover:bg-accent-hover",
        secondary:
          "border-transparent bg-soft text-ink hover:bg-rule-soft",
        destructive:
          "border-transparent bg-danger text-paper hover:bg-danger-hover",
        positive:
          "border-transparent bg-positive text-paper hover:bg-positive/80",
        warning:
          "border-transparent bg-warning text-paper hover:bg-warning/80",
        outline: "border-rule-soft text-ink",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
