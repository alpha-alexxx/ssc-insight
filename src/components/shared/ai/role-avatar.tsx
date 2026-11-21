"use client";

import { BarChart3, History, Layers, Shield, Target } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The shared chat turn grammar — avatars, timestamps and the source chips
 * every grounded answer claims to read. Used by BOTH the /ask page transcript
 * and the AI sheet's Ask tab; the two surfaces must never drift apart.
 *
 * The chips mirror the server's own context whitelist (src/lib/ai/context.ts)
 * one-for-one — they are a promise about what was read, not decoration.
 */

export const SOURCE_CHIPS = [
  { icon: BarChart3, label: "Aggregate analytics" },
  { icon: Layers, label: "Subject profile" },
  { icon: Target, label: "Target ledger" },
  { icon: History, label: "Latest 20 mocks" },
] as const;

/** Short clock label for a message timestamp — "09:41". */
export function timeLabel(iso: string | undefined): string {
  if (!iso) return "";
  const time = Date.parse(iso);
  if (!Number.isFinite(time)) return "";
  return new Date(time).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** Text-glyph avatars: the coach is an ink serif circle, the reader a soft one. */
export function RoleAvatar({ role }: { role: "ai" | "user" }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-7 shrink-0 select-none place-items-center rounded-full text-[0.5625rem] font-semibold tracking-wide",
        role === "ai"
          ? "bg-ink font-serif text-paper"
          : "border border-rule-soft bg-soft text-muted",
      )}
    >
      {role === "ai" ? "ai" : "you"}
    </span>
  );
}

/** The shield mark used by the read-only pledges (trace strip, usage footer). */
export function ShieldMark({ className }: { className?: string }) {
  return <Shield size={11} aria-hidden className={cn("text-accent", className)} />;
}

/** The source chips, rendered inline (trace strip, thinking card). */
export function SourceChips({
  animate = false,
  className,
}: {
  animate?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("flex min-w-0 flex-1 flex-wrap gap-1", className)}>
      {SOURCE_CHIPS.map((chip) => (
        <span
          key={chip.label}
          className="inline-flex items-center gap-1 rounded-pill border border-rule-soft bg-paper px-1.5 py-px text-[0.5625rem] font-medium leading-4 text-muted"
        >
          <chip.icon size={9} aria-hidden className="text-accent" />
          {chip.label}
        </span>
      ))}
    </span>
  );
}
