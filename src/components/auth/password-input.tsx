"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * A password field with the see/hide affordance: an icon button inside the
 * field's right edge, `aria-pressed` + `aria-label` swapping with the state,
 * and the input's `type` following it. `autoComplete` passes through so the
 * sign-in / new-password contexts keep their browser contracts.
 *
 * The toggle never autofocuses or steals the IME; it is type="button" so a
 * press inside a form never submits.
 */
export function PasswordInput({
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "type">) {
  const [visible, setVisible] = React.useState(false)

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        className={cn("block w-full pr-11", className)}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        aria-pressed={visible}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted transition-colors duration-150 hover:text-ink focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
      >
        {visible ? (
          <EyeOff aria-hidden="true" className="size-4" />
        ) : (
          <Eye aria-hidden="true" className="size-4" />
        )}
      </button>
    </div>
  )
}
