"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * The one-time-code step, adapted from Hyperblur's `auth-flow-otp-verify`.
 *
 * Kept whole: one real native input under a segmented rail (so `one-time-code`
 * autofill, paste-splitting and a single accessibility field all hold), digits
 * dropping into their slots, the caret in the slot you are on, the glowing bar
 * that glides to the next slot, the automatic check the moment the last digit
 * lands, the verifying sweep, the error shake, the success pill with its drawn
 * check, and the resend button with its depleting ring.
 *
 * Two deliberate departures from the original:
 *  1. No Text / Call / Email delivery switch. This provider emails a code and
 *     sends TOTP from an authenticator app — a channel picker would offer
 *     methods that do not exist. `channel` picks the copy, and an
 *     authenticator code has no resend affordance (nothing to resend).
 *  2. The parent owns the outcome. `status` and `error` come from the form that
 *     performs the network call, so the rail never claims a code was verified
 *     before the server said so, and the reset flow can use the same rail to
 *     capture a code it cannot check yet.
 */

export type OtpStatus = "idle" | "verifying" | "error" | "success";

export type OtpChannel = "email" | "authenticator";

export interface OtpRailResend {
  /** Seconds the resend button stays locked; the ring depletes over this. */
  seconds: number;
  onResend: () => void | Promise<void>;
}

export interface OtpRailProps {
  value: string;
  onValueChange: (value: string) => void;
  /** Runs once when the last digit lands. The parent decides what that means. */
  onComplete?: (code: string) => void;
  status?: OtpStatus;
  /** The form's failure copy; shown in the rail's status line. */
  error?: React.ReactNode;
  /** Idle copy under the rail, when there is nothing else to say. */
  hint?: React.ReactNode;
  resend?: OtpRailResend | null;
  channel: OtpChannel;
  length?: number;
  onBack?: () => void;
  backLabel?: string;
  autoFocus?: boolean;
  className?: string;
}

const css = `
@keyframes lh-otp-drop {
  0% { opacity: 0; transform: translate3d(0, -12px, 0) scale(.72); }
  62% { opacity: 1; transform: translate3d(0, 2px, 0) scale(1.05); }
  100% { opacity: 1; transform: none; }
}
@keyframes lh-otp-shake {
  0%, 100% { transform: translateX(0); }
  18% { transform: translateX(-8px); }
  36% { transform: translateX(6px); }
  54% { transform: translateX(-4px); }
  72% { transform: translateX(2px); }
}
@keyframes lh-otp-sweep {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}
@keyframes lh-otp-blink {
  50% { opacity: 0; }
}
@keyframes lh-otp-draw {
  to { stroke-dashoffset: 0; }
}
.lh-otp-rail {
  position: relative;
  display: grid;
  grid-template-columns: repeat(var(--lh-otp-n, 6), 1fr);
  overflow: hidden;
  height: 62px;
  border-radius: 14px;
  background: var(--background);
  box-shadow: inset 0 0 0 1px var(--border);
  transition: box-shadow 250ms var(--ease-out-soft, cubic-bezier(.22, 1, .36, 1));
}
.lh-otp-field[data-focus="true"] .lh-otp-rail {
  box-shadow: inset 0 0 0 1px var(--ring), 0 0 0 3px color-mix(in oklab, var(--ring) 16%, transparent);
}
.lh-otp-field[data-status="error"] .lh-otp-rail {
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--destructive) 60%, transparent);
  animation: lh-otp-shake 440ms cubic-bezier(.36, .07, .19, .97);
}
.lh-otp-field[data-status="success"] .lh-otp-rail {
  box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--success) 55%, transparent);
  background: color-mix(in oklab, var(--success) 6%, var(--background));
}
.lh-otp-slot {
  position: relative;
  display: grid;
  place-items: center;
  font-size: 25px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: var(--foreground);
}
.lh-otp-slot + .lh-otp-slot::before {
  content: "";
  position: absolute;
  left: 0;
  top: 24%;
  bottom: 24%;
  width: 1px;
  background: var(--border);
}
.lh-otp-field[data-status="error"] .lh-otp-slot { color: var(--destructive); }
.lh-otp-field[data-status="success"] .lh-otp-slot { color: var(--success); }
.lh-otp-digit { display: inline-block; animation: lh-otp-drop 360ms cubic-bezier(.3, 1.4, .5, 1) both; }
.lh-otp-dot { width: 5px; height: 5px; border-radius: 50%; background: color-mix(in oklab, var(--muted-foreground) 45%, transparent); }
.lh-otp-caret {
  width: 2px;
  height: 26px;
  border-radius: 2px;
  background: var(--primary);
  animation: lh-otp-blink 1s steps(1) infinite;
}
.lh-otp-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2.5px;
  width: calc(100% / var(--lh-otp-n, 6));
  transform: translateX(calc(var(--lh-otp-i, 0) * 100%));
  background: var(--primary);
  border-radius: 3px 3px 0 0;
  opacity: .85;
  transition: transform 320ms cubic-bezier(.3, 1.2, .5, 1), opacity 200ms ease;
}
.lh-otp-field[data-focus="false"] .lh-otp-bar { opacity: .3; }
.lh-otp-field[data-status="error"] .lh-otp-bar { background: var(--destructive); }
.lh-otp-field[data-status="success"] .lh-otp-bar { opacity: 0; }
.lh-otp-scan {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, color-mix(in oklab, var(--primary) 18%, transparent), transparent);
  animation: lh-otp-sweep 1.1s cubic-bezier(.6, 0, .4, 1) infinite;
}
.lh-otp-check path {
  stroke-dasharray: 24;
  stroke-dashoffset: 24;
  animation: lh-otp-draw 480ms 80ms cubic-bezier(.65, 0, .35, 1) forwards;
}
.lh-otp-ring-fill { transition: stroke-dashoffset 1s linear; }
@media (prefers-reduced-motion: reduce) {
  .lh-otp-digit, .lh-otp-caret, .lh-otp-scan, .lh-otp-field[data-status="error"] .lh-otp-rail, .lh-otp-check path {
    animation: none;
  }
  .lh-otp-check path { stroke-dashoffset: 0; }
  .lh-otp-ring-fill { transition: none; }
  .lh-otp-bar { transition: none; }
}
`;

export function OtpRail({
  value,
  onValueChange,
  onComplete,
  status = "idle",
  error,
  hint,
  resend = null,
  channel,
  length = 6,
  onBack,
  backLabel = "Go back",
  autoFocus = false,
  className,
}: OtpRailProps) {
  const id = React.useId();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [focused, setFocused] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const seconds = resend?.seconds ?? 0;
  // A fresh mount means a code was just sent, so the clock starts here; a
  // successful resend restarts it in the handler below.
  const [left, setLeft] = React.useState(seconds);
  const completeRef = React.useRef<string | null>(null);

  const counting = Boolean(resend) && left > 0;
  React.useEffect(() => {
    if (!counting) return;
    const timer = window.setTimeout(
      () => setLeft((current) => Math.max(0, current - 1)),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [counting, left]);

  // The code checks itself once the last digit lands — exactly once per value.
  React.useEffect(() => {
    if (value.length < length) {
      completeRef.current = null;
      return;
    }
    if (completeRef.current === value) return;
    completeRef.current = value;
    onComplete?.(value);
  }, [value, length, onComplete]);

  // A rejection shakes the rail, then hands the reader a clean field.
  React.useEffect(() => {
    if (status !== "error") return;
    completeRef.current = null;
    const timer = window.setTimeout(() => {
      onValueChange("");
      inputRef.current?.focus();
    }, 620);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (status === "verifying" || status === "success") return;
    const next = event.target.value.replace(/\D/g, "").slice(0, length);
    onValueChange(next);
  }

  async function handleResend() {
    if (!resend || left > 0 || sending || status === "verifying" || status === "success") {
      return;
    }
    setSending(true);
    try {
      await resend.onResend();
      setLeft(resend.seconds);
      completeRef.current = null;
      onValueChange("");
      inputRef.current?.focus();
    } catch {
      // The form owns the failure copy; the clock stays spent so a retry is one tap.
    } finally {
      setSending(false);
    }
  }

  const active = Math.min(value.length, length - 1);
  const messageId = `${id}-message`;
  const locked = status === "verifying" || status === "success";

  const message =
    status === "success"
      ? "Verified. One moment…"
      : status === "error"
        ? (error ?? "That code isn't right. Try again.")
        : status === "verifying"
          ? "Checking the code…"
          : (hint ??
            (channel === "email"
              ? "Paste the code or type it — it checks itself when complete."
              : "Type the 6-digit code from your authenticator app."));

  const tone =
    status === "error"
      ? "error"
      : status === "success"
        ? "success"
        : status === "verifying"
          ? "pending"
          : "idle";

  const circumference = 2 * Math.PI * 8.5;
  const ratio = seconds > 0 ? Math.min(1, Math.max(0, left / seconds)) : 0;

  return (
    <div
      className={cn("flex flex-col", className)}
      onKeyDown={(event) => {
        if (event.key === "Escape" && onBack) {
          event.preventDefault();
          onBack();
        }
      }}
    >
      <style href="lh-auth-otp" precedence="default">
        {css}
      </style>

      <div
        className="lh-otp-field"
        data-focus={focused ? "true" : "false"}
        data-status={status}
        style={
          {
            "--lh-otp-n": length,
            "--lh-otp-i": active,
          } as React.CSSProperties
        }
        aria-busy={status === "verifying" || undefined}
      >
        <div className="relative">
          <input
            ref={inputRef}
            id={id}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onClick={() => inputRef.current?.focus()}
            readOnly={locked}
            autoFocus={autoFocus}
            autoComplete="one-time-code"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={length}
            spellCheck={false}
            aria-label={`${length}-digit ${channel === "email" ? "emailed" : "authenticator"} code`}
            aria-invalid={status === "error" || undefined}
            aria-describedby={messageId}
            className="absolute inset-0 z-20 h-full w-full cursor-text bg-transparent text-[16px] text-transparent caret-transparent opacity-[0.01] outline-none"
          />

          {/* The rail the reader sees; the input above it is the only field. */}
          <div aria-hidden="true" className="lh-otp-rail">
            {Array.from({ length }, (_, i) => {
              const char = value[i];
              const isActive = focused && i === active && status !== "success";
              return (
                <span key={i} className="lh-otp-slot">
                  {char ? (
                    <span key={`${i}-${char}`} className="lh-otp-digit">
                      {char}
                    </span>
                  ) : isActive ? (
                    <span className="lh-otp-caret" />
                  ) : (
                    <span className="lh-otp-dot" />
                  )}
                </span>
              );
            })}
            <span className="lh-otp-bar" />
            {status === "verifying" ? <span className="lh-otp-scan" /> : null}
            {status === "success" ? (
              <span className="absolute inset-y-0 right-2 z-10 grid place-items-center text-success">
                <svg
                  viewBox="0 0 24 24"
                  className="lh-otp-check size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </span>
            ) : null}
          </div>
        </div>

        <p
          id={messageId}
          role="status"
          aria-live="polite"
          data-tone={tone}
          className={cn(
            "mt-2.5 flex min-h-[1.35rem] items-center gap-1.5 text-[12.5px] leading-snug",
            tone === "error" && "text-destructive",
            tone === "success" && "text-success",
            (tone === "idle" || tone === "pending") && "text-muted-foreground",
          )}
        >
          {message}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="cursor-pointer text-xs font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
          >
            {backLabel}
          </button>
        ) : (
          <span />
        )}

        {resend ? (
          <button
            type="button"
            onClick={handleResend}
            disabled={left > 0 || sending || status === "success"}
            className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-full pr-3 pl-1 text-xs font-medium text-foreground shadow-[inset_0_0_0_1px_var(--border)] transition-colors hover:bg-accent disabled:cursor-default disabled:text-muted-foreground disabled:hover:bg-transparent"
          >
            <span className="relative grid size-6 place-items-center" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="-rotate-90">
                <circle
                  cx="10"
                  cy="10"
                  r="8.5"
                  stroke="var(--border)"
                  strokeWidth="2"
                />
                <circle
                  className="lh-otp-ring-fill"
                  cx="10"
                  cy="10"
                  r="8.5"
                  stroke="var(--primary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={circumference.toFixed(2)}
                  strokeDashoffset={(circumference * (1 - ratio)).toFixed(2)}
                />
              </svg>
              <span className="absolute text-[9px] font-semibold tabular-nums">
                {left > 0 ? left : "↻"}
              </span>
            </span>
            {sending ? "Sending…" : left > 0 ? "Resend soon" : "Resend code"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
