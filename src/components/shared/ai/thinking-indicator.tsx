"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * The pre-answer indicator, shown only while the stream is alive but no
 * answer text has landed: `connecting` until the server says anything,
 * `thinking` while reasoning or keepalives arrive. The seconds clock is
 * honest — thinking models can spend a long first stretch producing nothing
 * visible, and hiding that wait reads as a hang. Callers pass `key={phase}`
 * so each phase mounts with its own clock.
 */
export function ThinkingIndicator({
  phase,
  className,
}: {
  phase: "connecting" | "thinking";
  className?: string;
}) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 text-xs text-muted",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <span className="thinking-dots" aria-hidden>
        <i />
        <i />
        <i />
      </span>
      <span className="tabular-nums">
        {phase === "connecting"
          ? "Connecting…"
          : elapsed > 0
            ? `Thinking · ${elapsed}s`
            : "Thinking"}
      </span>
    </div>
  );
}
