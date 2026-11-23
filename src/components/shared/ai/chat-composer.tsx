"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ArrowUp,
  ImagePlus,
  Trash2,
  X,
} from "@/components/ui/icons";
import { MAX_ATTACHED_IMAGES, prepareImages } from "./image";
import { cn } from "@/lib/utils";

/**
 * The elevated composer card shared by the sheet and the /ask page — the
 * Claude/DeepSeek toolbar grammar: textarea on top, a toolbar INSIDE the
 * card (mode chips · divider · paperclip · usage · clear on the left,
 * send ⇄ stop morph on the right), and the disclaimer rendered by the host
 * below the card.
 *
 * The card is one container for every mode: chat keeps the textarea; the
 * Todos/Mock flows embed their own bodies below the chip row. The sheet
 * passes no `modes`, so its tabs keep control and no chips render.
 */

export type ComposerModeOption<T extends string> = {
  id: T;
  label: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
};

export function ChatComposer<T extends string>({
  value,
  onChange,
  onSubmit,
  onStop,
  streaming,
  disabled = false,
  maxLength = 4_000,
  placeholder = "Ask about your mocks, targets, or plan…",
  autoFocus = false,
  visionEnabled = false,
  usage,
  modes,
  mode,
  onModeChange,
  onClear,
  composerBody,
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
  /** Image attach UI; server still gates the actual send. */
  visionEnabled?: boolean;
  /** Daily usage label ("Today 16/50"), rendered as a quiet toolbar chip. */
  usage?: string;
  /** When given, the toolbar renders mode chips and the card hosts the
   * other modes' bodies via `composerBody`. */
  modes?: readonly ComposerModeOption<T>[];
  mode?: T;
  onModeChange?: (mode: T) => void;
  /** Clear-conversation action: trash icon button in the toolbar. */
  onClear?: () => void;
  /** For non-chat modes: the flow's own body rendered inside the card. */
  composerBody?: React.ReactNode;
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
    <div className={cn("ai-composer space-y-1.5", className)}>
      <div className="ai-composer-card">
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 border-b border-rule-soft px-3.5 pb-2.5 pt-3">
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

        {/* The non-chat flows embed their own bodies inside the same card. */}
        {composerBody ? (
          <div className="max-h-[46dvh] overflow-y-auto overscroll-contain px-1 pb-1">
            {composerBody}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            maxLength={maxLength}
            placeholder={placeholder}
            aria-label="Ask the study coach"
            className="block max-h-[200px] min-h-14 w-full resize-none bg-transparent px-4 pt-3.5 text-[length:var(--type-body)] leading-relaxed text-ink placeholder:text-muted focus:outline-none"
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
        )}

        {/* The toolbar lives INSIDE the card — chips and tools left, the
            send ⇄ stop morph bottom-right, like the reference. */}
        <div className="flex items-center justify-between gap-3 px-2.5 pb-2.5 pt-1">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            {modes && mode && onModeChange
              ? modes.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={mode === item.id}
                    onClick={() => onModeChange(item.id)}
                    className={cn(
                      "tap-target inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 text-xs font-medium transition-colors",
                      mode === item.id
                        ? "border-accent/30 bg-accent-soft text-accent"
                        : "border-transparent text-muted hover:bg-soft hover:text-ink",
                    )}
                  >
                    <item.icon size={12} aria-hidden />
                    {item.label}
                  </button>
                ))
              : null}
            {modes && mode ? (
              <span aria-hidden="true" className="h-4 w-px bg-rule-soft" />
            ) : null}
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
            {usage ? (
              <span className="tabular-nums rounded-pill border border-rule-soft px-2 py-0.5 text-[0.625rem] text-muted">
                {usage}
              </span>
            ) : null}
            {onClear ? (
              <button
                type="button"
                aria-label="Clear conversation"
                title="Clear conversation"
                className="tap-target inline-flex size-8 items-center justify-center rounded-control text-muted transition-colors hover:bg-soft hover:text-ink disabled:pointer-events-none disabled:opacity-40"
                disabled={streaming}
                onClick={onClear}
              >
                <Trash2 size={14} aria-hidden />
              </button>
            ) : null}
            {preparing ? (
              <span className="text-[0.625rem] text-muted" role="status" aria-busy="true">
                Preparing…
              </span>
            ) : null}
          </div>

          {streaming ? (
            <button
              type="button"
              onClick={onStop}
              aria-label="Stop generating"
              title="Stop generating"
              className="tap-target inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-ink text-paper transition-colors hover:bg-ink/85"
            >
              <span
                aria-hidden="true"
                className="block size-3 rounded-[2px] bg-current"
              />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={!canSend}
              aria-label="Send question"
              title="Send (Enter)"
              className="tap-target inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-paper transition-colors hover:bg-accent-hover disabled:bg-soft disabled:text-muted"
            >
              <ArrowUp size={17} aria-hidden />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
