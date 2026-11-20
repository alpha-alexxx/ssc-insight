"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import { ArrowUp, Square } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The ruled ask field shared by the sheet and the /ask page: one hairline
 * container that grows with its content, Enter sends, Shift+Enter breaks,
 * and the send square becomes stop while a stream runs. Stays in normal
 * flex flow so the mobile keyboard never covers it (DESIGN.md composer rule).
 */
export function ChatComposer({
  value,
  onChange,
  onSubmit,
  onStop,
  streaming,
  disabled = false,
  maxLength = 4_000,
  placeholder = "Ask about your mocks, targets, or plan…",
  autoFocus = false,
  meta,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (text: string) => void;
  onStop?: () => void;
  streaming: boolean;
  disabled?: boolean;
  maxLength?: number;
  placeholder?: string;
  autoFocus?: boolean;
  /** Quiet provenance chips under the field (model, context view). */
  meta?: React.ReactNode;
  className?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);

  // Auto-grow: reset to the single-line height, then let content push it.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  useEffect(() => {
    if (!autoFocus) return;
    const timer = window.setTimeout(() => textareaRef.current?.focus(), 60);
    return () => window.clearTimeout(timer);
  }, [autoFocus]);

  function submit() {
    const text = value.trim();
    if (!text || streaming || disabled) return;
    onSubmit(text);
    if (textareaRef.current) textareaRef.current.style.height = "";
  }

  const canSend = Boolean(value.trim()) && !streaming && !disabled;

  return (
    <div className={cn("ai-composer space-y-2", className)}>
      <div className="ai-composer-field">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          aria-label="Ask the study coach"
          aria-invalid={focused ? undefined : false}
          className="block max-h-[200px] min-h-11 w-full resize-none bg-transparent px-3.5 py-2.5 text-[length:var(--type-body)] leading-relaxed text-ink placeholder:text-muted focus:outline-none"
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 text-xs text-muted">
          {meta}
          <span className="tabular-nums">
            {value.length > maxLength * 0.9
              ? `${value.length}/${maxLength}`
              : null}
          </span>
        </div>
        {streaming ? (
          <button
            type="button"
            className="tap-target inline-flex items-center gap-2 rounded-control border border-rule px-3.5 text-xs font-medium text-ink transition-colors hover:border-ink"
            onClick={onStop}
            aria-label="Stop generating"
          >
            <Square size={12} aria-hidden /> Stop
          </button>
        ) : (
          <button
            type="button"
            className="tap-target inline-flex size-11 items-center justify-center rounded-control bg-ink text-paper transition-opacity disabled:opacity-40"
            disabled={!canSend}
            onClick={submit}
            aria-label="Send question"
          >
            <ArrowUp size={16} aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}
