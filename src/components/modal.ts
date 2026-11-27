"use client";

import * as React from "react";

/* ─────────────────────────────────────────────────────────
 * MODAL: the native <dialog> under Dialog and Sheet
 *
 *   open     showModal() (focus trap, inert page, top layer) and
 *            the next frame turns `shown` on for the entry motion
 *   close    Escape and the scrim ask to close; the surface plays
 *            its exit, then dialog.close() and focus goes back to
 *            whatever opened it
 *   scroll   wheel and touch scrolling outside a scrollable part
 *            of the panel are stopped at the dialog, so the page
 *            behind never moves (the page's own styles are never
 *            touched: no layout shift, no restyle of <html>)
 * ───────────────────────────────────────────────────────── */

export function useModal(open: boolean, onClose: () => void, exit = 220) {
  const dialog = React.useRef<HTMLDialogElement>(null);
  const [mounted, setMounted] = React.useState(open);
  const [shown, setShown] = React.useState(false);
  const opener = React.useRef<HTMLElement | null>(null);
  const close = React.useRef(onClose);
  React.useEffect(() => {
    close.current = onClose;
  });
  if (open && !mounted) setMounted(true);

  React.useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open) {
      opener.current = document.activeElement as HTMLElement | null;
      if (!el.open) el.showModal();
      // Start on the panel, not its first control: no keyboard popping up on phones, no
      // slider bubble or tooltip showing uninvited.
      el.querySelector<HTMLElement>("[data-modal-panel]")?.focus({ preventScroll: true });
      let inner = 0;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setShown(true));
      });
      return () => {
        cancelAnimationFrame(outer);
        cancelAnimationFrame(inner);
      };
    }
    const timer = window.setTimeout(() => {
      if (el.open) el.close();
      setMounted(false);
      setShown(false);
      opener.current?.focus?.({ preventScroll: true });
    }, exit);
    return () => window.clearTimeout(timer);
  }, [open, mounted, exit]);

  React.useEffect(() => {
    const el = dialog.current;
    if (!el || !mounted) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      close.current();
    };
    el.addEventListener("cancel", onCancel);
    const release = blockBackgroundScroll(el);
    return () => {
      el.removeEventListener("cancel", onCancel);
      release();
    };
  }, [mounted]);

  return { dialog, mounted: mounted || open, shown: open && shown };
}

/**
 * Stops wheel and touch scrolling from leaking past `node` to the page behind it,
 * unless the gesture starts inside something that really scrolls (a list, a rail).
 * The page's own styles are never touched: no layout shift, no restyle of <html>.
 * Returns its own teardown, so any modal-ish surface can borrow it.
 */
export function blockBackgroundScroll(node: HTMLElement): () => void {
  const guard = (e: Event) => {
    let target = e.target as HTMLElement | null;
    while (target && target !== node) {
      const style = getComputedStyle(target);
      if (/(auto|scroll)/.test(style.overflowY) && target.scrollHeight > target.clientHeight) return;
      target = target.parentElement;
    }
    e.preventDefault();
  };
  node.addEventListener("wheel", guard, { passive: false });
  node.addEventListener("touchmove", guard, { passive: false });
  return () => {
    node.removeEventListener("wheel", guard);
    node.removeEventListener("touchmove", guard);
  };
}

/** Class for the full-window <dialog> both surfaces sit in. */
export const MODAL_ROOT =
  // overflow: clip, never hidden: hidden can still be scrolled, and focusing something inside
  // the off-screen panel scrolled the dialog mid-slide (the sheet's jerk on opening).
  "fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-clip bg-transparent p-0 text-foreground outline-none backdrop:bg-transparent";

/** The dim behind the surface: the page fades back under a veil of the background colour, no blur. */
export const SCRIM = "absolute inset-0 bg-[color-mix(in_oklab,var(--background)_62%,transparent)]";
