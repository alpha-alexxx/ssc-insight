"use client";

import { useCallback, useState } from "react";
import { Icon, type IconName } from "@/components/icon";
import { PromptComposer } from "@/components/prompt-composer";
import { AttachmentChip } from "@/components/attachment-chip";
import { MAX_ATTACHED_IMAGES, prepareImages } from "./image";
import { cn } from "@/lib/utils";

/**
 * The elevated composer card shared by the sheet and the /ask page, on
 * Hairline `prompt-composer`: auto-growing textarea, attachments (rendered
 * as `attachment-chip`s over the field), the send ⇄ stop morph via `status`,
 * and the toolbar slot hosting the mode chips, usage, clear and the
 * image-preparing status. The disclaimer is rendered by the host below the
 * card.
 *
 * The card is one container for every mode: chat keeps the textarea; the
 * Todos/Mock flows own their own bodies beside it. The sheet passes no
 * `modes`, so its tabs keep control and no chips render.
 */

export type ComposerModeOption<T extends string> = {
  id: T;
  label: string;
  icon: IconName;
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
  visionEnabled = false,
  usage,
  modes,
  mode,
  onModeChange,
  onClear,
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
  /** Image attach UI; server still gates the actual send. */
  visionEnabled?: boolean;
  /** Daily usage label ("Today 16/50"), rendered as a quiet toolbar chip. */
  usage?: string;
  /** When given, the toolbar renders mode chips for the page's tool modes. */
  modes?: readonly ComposerModeOption<T>[];
  mode?: T;
  onModeChange?: (mode: T) => void;
  /** Clear-conversation action: trash icon button in the toolbar. */
  onClear?: () => void;
  className?: string;
}) {
  const [images, setImages] = useState<string[]>([]);
  const [preparing, setPreparing] = useState(false);

  const attach = useCallback(
    async (files: File[]) => {
      if (!visionEnabled || preparing) return;
      setPreparing(true);
      try {
        const next = await prepareImages(files, images.length);
        if (next.length)
          setImages((current) =>
            [...current, ...next].slice(0, MAX_ATTACHED_IMAGES),
          );
      } finally {
        setPreparing(false);
      }
    },
    [visionEnabled, preparing, images.length],
  );

  const submit = (text: string) => {
    // Image-only turns arrive as empty text; the workspace hook supplies the
    // wire label and the transcript renders the images alone.
    onSubmit(text, images);
    setImages([]);
  };

  return (
    <PromptComposer
      value={value}
      onValueChange={onChange}
      onSubmit={submit}
      onStop={onStop}
      status={streaming ? "streaming" : "ready"}
      placeholder={placeholder}
      disabled={disabled}
      maxLength={maxLength}
      allowEmpty={images.length > 0}
      onFilesSelected={
        visionEnabled ? (files) => void attach(files) : undefined
      }
      accept="image/png,image/jpeg,image/webp"
      attachments={
        images.length ? (
          <>
            {images.map((image, index) => (
              <AttachmentChip
                key={index}
                name={`Screenshot ${index + 1}`}
                previewUrl={image}
                onRemove={() =>
                  setImages((current) =>
                    current.filter((_, at) => at !== index),
                  )
                }
              />
            ))}
          </>
        ) : undefined
      }
      toolbar={
        <>
          {modes && mode && onModeChange
            ? modes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={mode === item.id}
                  onClick={() => onModeChange(item.id)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                    mode === item.id
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <Icon name={item.icon} size={12} />
                  {item.label}
                </button>
              ))
            : null}
          {usage ? (
            <span className="inline-flex shrink-0 items-center rounded-full border border-border px-2 py-0.5 text-[11px] tabular-nums text-muted-foreground">
              {usage}
            </span>
          ) : null}
          {onClear ? (
            <button
              type="button"
              aria-label="Clear conversation"
              title="Clear conversation"
              disabled={streaming}
              onClick={onClear}
              className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            >
              <Icon name="trash" size={14} />
            </button>
          ) : null}
          {preparing ? (
            <span
              role="status"
              aria-busy="true"
              className="shrink-0 text-[11px] text-muted-foreground"
            >
              Preparing…
            </span>
          ) : null}
        </>
      }
      className={className}
    />
  );
}
