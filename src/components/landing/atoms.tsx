import { cn } from "@/lib/utils";

/**
 * The landing's shared UI atoms, token-composed.
 *
 * The old CSS-driven ambience (ink washes, petals, CSS typing and the
 * count-up) lived in the retired global stylesheet; this module now keeps
 * only what the rebuilt visual system needs: the typed terminal line (static
 * text plus a pulsing caret — the copy is identical, the typing keyframes are
 * gone with the old stylesheet) and the link-button class strings the CTAs
 * compose, mirroring the Hairline Button geometry over Link.
 */

/* ================================================================ TypedLine */

/**
 * A command line with a pulsing caret. The line itself renders fully — the
 * old CSS `steps()` typing is a keyframe effect that no longer exists, so the
 * text is painted and readable immediately in every mode.
 */
export function TypedLine({
  text,
  className,
  caretClassName,
}: {
  text: string;
  className?: string;
  caretClassName?: string;
}) {
  return (
    <span className={cn("inline-block whitespace-nowrap align-bottom", className)}>
      {text}
      <span
        aria-hidden="true"
        className={cn(
          "ml-0.5 inline-block h-[1em] w-[0.5ch] translate-y-[0.14em] bg-current opacity-60 animate-pulse motion-reduce:animate-none",
          caretClassName,
        )}
      />
    </span>
  );
}

/* ============================================================ Link buttons */

const PILL =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/**
 * Link-styled pills that mirror the Hairline Button geometry (variants
 * primary / ghost / outline, 44px touch targets), so landing CTAs can stay
 * real anchors while reading as buttons.
 */
export const LINK_BUTTON = {
  primary: cn(
    PILL,
    "bg-primary px-6 py-3 text-[15px] text-primary-foreground hover:bg-primary/90",
  ),
  ghost: cn(
    PILL,
    "px-4 py-3 text-[15px] text-muted-foreground hover:bg-accent hover:text-foreground",
  ),
  outline: cn(
    PILL,
    "px-5 py-3 text-sm text-foreground shadow-[inset_0_0_0_1px_var(--border)] hover:bg-accent",
  ),
  smPrimary: cn(
    PILL,
    "h-8 px-4 text-[13px] bg-primary text-primary-foreground hover:bg-primary/90",
  ),
  smGhost: cn(
    PILL,
    "h-8 px-3 text-[13px] text-muted-foreground hover:bg-accent hover:text-foreground",
  ),
} as const;
