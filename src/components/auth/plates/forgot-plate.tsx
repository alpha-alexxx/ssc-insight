import { LANDING_SUMMARY } from "@/components/landing/fixtures";

/**
 * The forgot-password plate: the reassurance reading.
 *
 * The quietest of the three plates — no chart, no grid. The tone-inverted
 * surface carries a short editorial thought about a lost password being a
 * detour, not a loss, and one honest line about what a reset code does. The
 * figures derive from the landing fixtures (the product's own scoring), so
 * even this calm surface stays inside the facts.
 */

export function ForgotPlateArt() {
  return (
    <div className="flex w-full max-w-[26rem] flex-col gap-9">
      <div>
        <p className="auth-plate-label">Locked out, not out</p>
        <p className="auth-plate-title">
          A password is a detour —
          <span className="block">your ledger is where it was.</span>
        </p>
      </div>

      <div className="flex flex-col gap-4 border-t border-[var(--plate-rule-soft)] pt-5">
        <p className="text-sm leading-relaxed text-[var(--plate-muted)]">
          The code arrives in a few seconds and sets a new password. Everything
          under your account — every saved attempt, the plan progress, the
          targets — stays exactly where it was.
        </p>
        <p className="text-sm leading-relaxed text-[var(--plate-muted)]">
          On an account that signs in with Google only, the same code sets the
          first password.
        </p>
      </div>

      <dl className="grid grid-cols-3 gap-x-6 border-t border-[var(--plate-rule-soft)] pt-5">
        {[
          { label: "Saved attempts", value: `${LANDING_SUMMARY.mockCount}` },
          { label: "Marks in a paper", value: "390" },
          { label: "Export", value: "JSON" },
        ].map((row) => (
          <div key={row.label}>
            <dt className="auth-plate-fact-label">{row.label}</dt>
            <dd className="mt-1 font-serif text-2xl leading-none tracking-[-0.02em] tabular-nums text-[var(--plate-fg)]">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
