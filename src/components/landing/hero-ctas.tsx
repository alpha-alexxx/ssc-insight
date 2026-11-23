"use client";

import Link from "next/link";
import { SparklesIcon } from "@/components/animate-ui/icons/hugeicons/sparkles";
import { LINK_BUTTON } from "./atoms";

/**
 * The hero's call-to-action cluster — the one client island in the copy
 * column, because the primary CTA carries the animated sparkles glyph (the
 * only animated icon on the landing, on the most interactive surface there
 * is). Everything else in the hero is server-rendered.
 *
 * The CTAs stay real anchors (`/sign-up`, `/sign-in`, `#workspace`) so the
 * links, prefetch and middle-click behaviour are exactly what they were.
 */
export function HeroCtas({ authAvailable }: { authAvailable: boolean }) {
  return (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      {authAvailable ? (
        <>
          <Link href="/sign-up" className={LINK_BUTTON.primary}>
            <SparklesIcon size={16} animateOnHover animateOnTap aria-hidden />
            Start For Free
          </Link>
          <Link href="/sign-in" className={LINK_BUTTON.ghost}>
            I already have an account
          </Link>
        </>
      ) : (
        <span
          aria-disabled="true"
          className={`${LINK_BUTTON.primary} pointer-events-none opacity-45`}
        >
          Sign-in unavailable
        </span>
      )}
      <a href="#workspace" className={LINK_BUTTON.outline}>
        See the workspace
        <span aria-hidden="true">↓</span>
      </a>
    </div>
  );
}
