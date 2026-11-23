"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * The boxed one-time-code input (the WealthRight grammar, in house tokens):
 * six bordered cells over one real, transparent `<input>`.
 *
 * Why one input under the boxes: SMS autofill (`autocomplete="one-time-code"`),
 * password-manager codes, paste-splitting and a single logical field for
 * screen readers all want exactly one real text field — six separate inputs
 * break all four. Typing appends digits, backspace deletes, paste fills from
 * any position, and the cell after the last digit carries the focus border.
 *
 * The entered digit pops once (`.otp-pop`, reduced-motion aware). Controlled:
 * the forms own the code string and validate it on submit against the same
 * `authOtpSchema` the wire uses.
 */
export function OtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  disabled,
  autoFocus,
  label = "One-time code",
  invalid,
  className,
}: {
  value: string
  onChange: (value: string) => void
  /** Fired once when the final digit lands. */
  onComplete?: (value: string) => void
  length?: number
  disabled?: boolean
  autoFocus?: boolean
  label?: string
  invalid?: boolean
  className?: string
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [focused, setFocused] = React.useState(false)
  const completedRef = React.useRef(false)

  const chars = Array.from({ length }, (_, i) => value[i] ?? "")
  const activeIndex = Math.min(value.length, length - 1)

  function sync(next: string) {
    const clean = next.replace(/\D/g, "").slice(0, length)
    onChange(clean)
    if (clean.length === length && !completedRef.current) {
      completedRef.current = true
      onComplete?.(clean)
    }
    if (clean.length < length) completedRef.current = false
  }

  return (
    <div
      className={cn("group/otp relative", className)}
      data-focus={focused || undefined}
      data-invalid={invalid || undefined}
      onClick={() => {
        if (!disabled) inputRef.current?.focus()
      }}
    >
      {/* The one real field — typing surface, autofill target, a11y node. */}
      <input
        ref={inputRef}
        aria-label={label}
        aria-invalid={invalid || undefined}
        autoComplete="one-time-code"
        inputMode="numeric"
        maxLength={length}
        disabled={disabled}
        autoFocus={autoFocus}
        value={value}
        onChange={(event) => sync(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="absolute inset-0 size-full cursor-pointer bg-transparent text-transparent caret-transparent opacity-0 outline-none"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none flex select-none gap-2.5"
      >
        {chars.map((char, index) => (
          <span
            key={index}
            className={cn(
              "grid h-[3.25rem] flex-1 place-items-center rounded-control border bg-paper text-lg font-medium tabular-nums text-ink transition-colors duration-150 sm:h-14",
              char ? "border-rule" : "border-rule-soft",
              focused && index === activeIndex && "border-accent",
              invalid && "border-danger",
              disabled && "opacity-50",
            )}
          >
            {char ? (
              <span className="otp-pop motion-reduce:animate-none">{char}</span>
            ) : null}
          </span>
        ))}
      </div>
    </div>
  )
}
