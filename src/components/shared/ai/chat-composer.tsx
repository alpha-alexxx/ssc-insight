"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import { ArrowUp, ImagePlus, Square, X } from "lucide-react";
import { MAX_ATTACHED_IMAGES, prepareImages } from "./image";
import { cn } from "@/lib/utils";

/**
 * The ruled ask field shared by the sheet and the /ask page: one hairline
 * container that grows with its content, Enter sends, Shift+Enter breaks,
 * and the send square becomes stop while a stream runs. Stays in normal
 * flex flow so the mobile keyboard never covers it (DESIGN.md composer rule).
 * With vision on, screenshots attach from file, paste, or drop — downscaled
 * before they are ever stored in the message.
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
  visionEnabled = false,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (text: string, images: string[]) => void;
  onStop?: () => void;
  streaming: boolean;
  disabled?: boolean;
  maxLength?: number;
  placeholder?: string;
  autoFocus?: boolean;
  /** Quiet provenance chips under the field (model, context view). */
  meta?: React.ReactNode;
  /** Image attach UI; server still gates the actual send. */
  visionEnabled?: boolean;
  className?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [images, setImages] = useState<string[]>([]);
  const [preparing, setPreparing] = useState(false);
  const [dropActive, setDropActive] = useState(false);

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

  async function attach(files: Iterable<File | Blob>) {
    if (!visionEnabled || preparing) return;
    setPreparing(true);
    try {
      const next = await prepareImages(files, images.length);
      if (next.length) setImages((current) => [...current, ...next].slice(0, MAX_ATTACHED_IMAGES));
    } finally {
      setPreparing(false);
    }
  }

  function submit() {
    const text = value.trim();
    if ((!text && !images.length) || streaming || disabled) return;
    // Image-only turns arrive as empty text; the workspace hook supplies the
    // wire label and the transcript renders the images alone.
    onSubmit(text, images);
    setImages([]);
    if (textareaRef.current) textareaRef.current.style.height = "";
  }

  const canSend =
    (Boolean(value.trim()) || images.length > 0) && !streaming && !disabled;

  return (
    <div className={cn("ai-composer space-y-2", className)}>
      <div className="ai-composer-field">
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 border-b border-rule-soft px-3 py-2">
            {images.map((image, index) => (
              <span key={index} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element -- user-attached data URL, not a remote asset */}
                <img
                  src={image}
                  alt={`Attached screenshot ${index + 1}`}
                  className="h-14 w-14 rounded-control border border-rule-soft object-cover"
                />
                <button
                  type="button"
                  aria-label={`Remove screenshot ${index + 1}`}
                  className="tap-target absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-control border border-rule bg-paper text-muted hover:text-ink"
                  onClick={() =>
                    setImages((current) => current.filter((_, at) => at !== index))
                  }
                >
                  <X size={11} aria-hidden />
                </button>
              </span>
            ))}
          </div>
        )}
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          aria-label="Ask the study coach"
          className="block max-h-[200px] min-h-11 w-full resize-none bg-transparent px-3.5 py-2.5 text-[length:var(--type-body)] leading-relaxed text-ink placeholder:text-muted focus:outline-none"
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          onPaste={(event) => {
            if (!visionEnabled || !event.clipboardData.files.length) return;
            event.preventDefault();
            void attach(event.clipboardData.files);
          }}
          onDragOver={(event) => {
            if (!visionEnabled) return;
            event.preventDefault();
            setDropActive(true);
          }}
          onDragLeave={() => setDropActive(false)}
          onDrop={(event) => {
            if (!visionEnabled || !event.dataTransfer.files.length) return;
            event.preventDefault();
            setDropActive(false);
            void attach(event.dataTransfer.files);
          }}
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 text-[11px] text-muted">
          {visionEnabled && (
            <label
              className={cn(
                "tap-target inline-flex size-8 cursor-pointer items-center justify-center rounded-control text-muted transition-colors hover:bg-soft hover:text-ink",
                dropActive && "bg-accent-soft text-accent",
              )}
              title="Attach a screenshot"
            >
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                className="sr-only"
                aria-label="Attach screenshots"
                onChange={(event) => {
                  if (event.target.files) void attach(event.target.files);
                  event.target.value = "";
                }}
              />
              <ImagePlus size={15} aria-hidden />
            </label>
          )}
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
            className="tap-target inline-flex size-11 items-center justify-center rounded-control bg-accent text-paper transition-colors hover:bg-accent-hover disabled:opacity-40"
            disabled={!canSend}
            onClick={submit}
            aria-label="Send question"
          >
            <ArrowUp size={16} aria-hidden />
          </button>
        )}
      </div>
      {preparing && (
        <p className="text-xs text-muted" role="status" aria-busy="true">
          Preparing screenshot…
        </p>
      )}
    </div>
  );
}
