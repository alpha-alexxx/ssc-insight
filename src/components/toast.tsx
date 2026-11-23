"use client";
/**
 * Toast system — backed by Sonner (shadcn's recommended toast registry).
 *
 * Keeps the original `useToast()` API (`success/error/info/warning/dismiss` with
 * `(title, detail?)`) so all 21 consumers stay unchanged. Sonner's `toast` is
 * module-level, so `useToast` returns a stable API object without a context
 * provider. `ToastProvider` renders the themed `<Toaster />` viewport once.
 *
 * Theming reads the paper/mira/sera token system: paper card, rule border,
 * accent ring, per-tone status colors (positive/warning/danger) — no hardcoded
 * colors. Light + dark + palette switches flip automatically via tokens.
 */
import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";
import type { ReactNode } from "react";

type ToastTone = "success" | "error" | "info" | "warning";

export type ToastApi = {
  success: (title: string, detail?: string) => void;
  error: (title: string, detail?: string) => void;
  info: (title: string, detail?: string) => void;
  warning: (title: string, detail?: string) => void;
  dismiss: (id?: number | string) => void;
};

// Per-tone Sonner options. Sonner renders its own tone icon + accent; we layer
// paper-token border/bg on top via classNames so the card reads as a paper card
// with a status edge, matching the prior bespoke toast's tone treatment.
const TONE_OPTS: Record<ToastTone, { classNames: { toast: string } }> = {
  success: { classNames: { toast: "border-positive/50 bg-positive-soft" } },
  error: { classNames: { toast: "border-danger/50 bg-danger-soft" } },
  warning: { classNames: { toast: "border-warning/50 bg-warning-soft" } },
  info: { classNames: { toast: "border-rule bg-paper" } },
};

const api: ToastApi = {
  success: (title, detail) =>
    sonnerToast.success(title, {
      description: detail,
      duration: 4000,
      ...TONE_OPTS.success,
    }),
  error: (title, detail) =>
    sonnerToast.error(title, {
      description: detail,
      duration: 6000,
      ...TONE_OPTS.error,
    }),
  info: (title, detail) =>
    sonnerToast.info(title, {
      description: detail,
      duration: 4000,
      ...TONE_OPTS.info,
    }),
  warning: (title, detail) =>
    sonnerToast.warning(title, {
      description: detail,
      duration: 4000,
      ...TONE_OPTS.warning,
    }),
  dismiss: (id) => sonnerToast.dismiss(id),
};

/** Stable hook returning the toast API. No provider needed (Sonner is module-level). */
export function useToast(): ToastApi {
  return api;
}

/**
 * Renders the Sonner `<Toaster />` viewport themed on paper tokens.
 * Mount once near the root. The `ToastProvider` passthrough is kept for
 * back-compat with layouts that wrap with it.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <SonnerToaster
        position="bottom-right"
        richColors={false}
        closeButton
        duration={4000}
        toastOptions={{
          classNames: {
            toast:
              "rounded-control border bg-paper text-ink shadow-pop px-4 py-3 font-body",
            title: "text-sm font-medium text-ink",
            description: "text-xs text-muted leading-relaxed",
            actionButton: "bg-accent text-paper rounded-control",
            cancelButton: "bg-soft text-ink rounded-control",
            closeButton:
              "text-muted hover:text-ink rounded-control bg-transparent",
          },
        }}
      />
    </>
  );
}
