/**
 * The moment a flow finishes: the one panel every auth success lands on.
 *
 * It is deliberately plain — a drawn check, a serif line and the real next
 * action — because the celebration belongs to Afterglow (the light that runs
 * through the card as this panel replaces the form), not to confetti or a
 * second toast. `role="status"` makes the swap announce itself; the drawn
 * check is decorative and collapses to a still mark under reduced motion.
 *
 * The action is a real destination, never a fake "Done" button: the
 * sign-in/sign-up panels are driven by their forms' redirect, and the reset
 * flow's panel carries the sign-in link because that is what happens next.
 */

export interface SuccessPanelProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** The real next action. Omit while a redirect is already scheduled. */
  action?: React.ReactNode;
  /** A quiet line under the action, e.g. where the redirect is going. */
  footnote?: React.ReactNode;
}

export function SuccessPanel({
  title,
  description,
  action,
  footnote,
}: SuccessPanelProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-2 text-center">
      <span
        aria-hidden="true"
        className="lh-auth-check grid size-14 place-items-center rounded-full bg-success/10 text-success ring-1 ring-success/25"
      >
        <svg viewBox="0 0 24 24" className="size-6" fill="none">
          <path
            d="M5 12.5l4.5 4.5L19 7.5"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            className="lh-auth-check-path"
          />
        </svg>
      </span>
      <h1 className="font-serif text-[1.75rem] font-medium leading-tight tracking-[-0.02em] text-foreground">
        {title}
      </h1>
      {description ? (
        <p
          role="status"
          className="max-w-[34ch] text-sm leading-relaxed text-muted-foreground"
        >
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-2 w-full">{action}</div> : null}
      {footnote ? (
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {footnote}
        </p>
      ) : null}
    </div>
  );
}

