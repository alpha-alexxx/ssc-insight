"use client";

import { PlainIcon } from "@/components/icon";
import { Tabs } from "@/components/tabs";
import { EYEBROW } from "./section";

const PRIVATE_POINTS = [
  "Every read and write is scoped to the verified account.",
  "There is no guest record, shared workspace or administrator view.",
  "Account changes remount the workspace, so stale data is never shown.",
];

const PORTABLE_POINTS = [
  "Attempts, subject results, notes, rank, participants and percentile",
  "Plan progress, personal tasks, groups and your target settings",
  "Merge preserves existing work; replace requires a fresh safety export",
  "No email, user ID, sign-in credentials or AI provider key in the file",
];

/**
 * Privacy and portability use the house grammar because the guarantees are
 * specific to this product, not a generic registry feature list.
 */
export function PrivacySection() {
  return (
    <section id="privacy" className="border-b border-border bg-background py-20 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] lg:items-start">
        <div>
          <p className={EYEBROW}>07 · Private by construction</p>
          <h2 className="mt-3 text-balance font-serif text-[clamp(1.75rem,3.4vw,2.75rem)] font-[450] leading-[1.1] tracking-[-0.02em] text-foreground">
            Your account is the boundary. Your file is the way out.
          </h2>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
            Google or email sign-in, isolated records, and no shared surface
            anywhere. When you want another account, one JSON file moves the
            study record without moving the login identity.
          </p>
          <div className="mt-7 flex items-start gap-3 rounded-[var(--radius-card)] border border-border bg-card p-4">
            <PlainIcon name="shield" size={20} tone="foreground" className="mt-0.5 shrink-0" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              Your optional AI key is sealed with AES-256-GCM before storage,
              excluded from backups, and shown back only as its last four characters.
            </p>
          </div>
        </div>

        <Tabs
          label="Privacy and data portability"
          defaultValue="private"
          items={[
            {
              value: "private",
              label: "Private by construction",
              icon: <PlainIcon name="lock" size={14} tone="current" />,
              content: (
                <div className="rounded-[var(--radius-panel)] border border-border bg-card p-5 sm:p-6">
                  <h3 className="font-serif text-xl tracking-[-0.02em] text-foreground">
                    One verified owner, on every request.
                  </h3>
                  <ul className="mt-5 divide-y divide-border border-y border-border">
                    {PRIVATE_POINTS.map((point) => (
                      <li key={point} className="flex items-start gap-3 py-3 text-sm leading-relaxed text-muted-foreground">
                        <PlainIcon name="check" size={16} tone="primary" className="mt-0.5 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5 text-[13px] leading-relaxed text-muted-foreground">
                    AI is optional and read-only. It cannot create, edit or
                    schedule a mock, and every table, chart and plan day works without it.
                  </p>
                </div>
              ),
            },
            {
              value: "portable",
              label: "Portable by design",
              icon: <PlainIcon name="download" size={14} tone="current" />,
              content: (
                <div className="rounded-[var(--radius-panel)] border border-border bg-card p-5 sm:p-6">
                  <h3 className="font-serif text-xl tracking-[-0.02em] text-foreground">
                    A complete study record, never an identity export.
                  </h3>
                  <ul className="mt-5 divide-y divide-border border-y border-border">
                    {PORTABLE_POINTS.map((point) => (
                      <li key={point} className="flex items-start gap-3 py-3 text-sm leading-relaxed text-muted-foreground">
                        <PlainIcon name="fileCheck" size={16} tone="primary" className="mt-0.5 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5 text-[13px] leading-relaxed text-muted-foreground">
                    Export from the old account, sign in to the other one, then
                    import. Planner restore always merges and never deletes completed work.
                  </p>
                </div>
              ),
            },
          ]}
        />
      </div>
    </section>
  );
}
