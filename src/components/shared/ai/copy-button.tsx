"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/**
 * Quiet copy affordance used across the AI surfaces — turn actions, code
 * blocks, the reasoning disclosure. Copies exactly the text it is given and
 * confirms for a beat; no toast, no chrome. `iconOnly` renders the action
 * bar's muted icon button (hover background, title label) for the legacy
 * chat grammar's always-visible action rows.
 */
export function CopyButton({
  value,
  label = "Copy",
  className,
  compact = false,
  iconOnly = false,
}: {
  value: string;
  label?: string;
  className?: string;
  compact?: boolean;
  iconOnly?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard denied (permissions, non-focus): nothing to confirm.
      return;
    }
    setCopied(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1_600);
  }

  if (iconOnly) {
    return (
      <button
        type="button"
        title={copied ? "Copied" : label}
        aria-label={copied ? "Copied" : label}
        className={cn(
          "tap-target inline-flex size-8 items-center justify-center rounded-control text-muted transition-colors hover:bg-soft hover:text-ink",
          copied && "text-positive hover:text-positive",
          className,
        )}
        onClick={() => void copy()}
      >
        {copied ? <Check size={14} /> : <Copy size={14} aria-hidden />}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={cn(
        "tap-target inline-flex items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-ink",
        compact && "gap-1",
        copied && "text-positive hover:text-positive",
        className,
      )}
      onClick={() => void copy()}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      <span>{copied ? "Copied" : label}</span>
    </button>
  );
}
