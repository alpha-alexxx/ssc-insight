"use client";

import * as React from "react";

export interface VersusSide { label: string; title: string; points: string[] }
export interface VersusMetric { label: string; before: string; after: string; ratio: number }
export interface ComparisonVersusProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  eyebrow?: string; title?: string; subtitle?: string; before?: VersusSide; after?: VersusSide; metrics?: VersusMetric[]; badge?: string; accent?: string;
}

/** Hyperblur's versus split, used for two real sample attempts. */
export function ComparisonVersus({ eyebrow, title, subtitle, before, after, metrics = [], badge = "VS", accent = "var(--primary)", className = "", ...rest }: ComparisonVersusProps) {
  if (!before || !after) return null;
  return (
    <section id="compare" className={`border-b border-border bg-background py-20 text-foreground sm:py-24 ${className}`} {...rest}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-2xl">{eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{eyebrow}</p> : null}<h2 className="mt-3 font-serif text-[clamp(1.75rem,3.4vw,2.75rem)] font-[450] leading-[1.1] tracking-[-0.02em]">{title}</h2>{subtitle ? <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">{subtitle}</p> : null}</div>
        <div className="relative mt-10 grid gap-4 lg:grid-cols-2 lg:gap-8">
          {[before, after].map((side, sideIndex) => <article key={side.label} className={`rounded-[var(--radius-panel)] border bg-card p-6 ${sideIndex ? "border-primary/40" : "border-border"}`}><span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${sideIndex ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{side.label}</span><h3 className="mt-4 font-serif text-xl tracking-[-0.02em]">{side.title}</h3><ul className="mt-5 divide-y divide-border border-y border-border">{side.points.map((point) => <li key={point} className="flex items-start gap-3 py-3 text-sm leading-relaxed text-muted-foreground"><span aria-hidden="true" className={sideIndex ? "text-primary" : "text-muted-foreground"}>{sideIndex ? "✓" : "−"}</span>{point}</li>)}</ul></article>)}
          <span aria-hidden="true" className="absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-primary bg-background font-mono text-xs font-semibold" style={{ color: accent }}>{badge}</span>
        </div>
        <ul className="mt-5 grid grid-cols-2 overflow-hidden rounded-[var(--radius-panel)] border border-border bg-card lg:grid-cols-4">
          {metrics.map((metric) => <li key={metric.label} className="min-w-0 border-border p-4 odd:border-r even:border-t sm:p-5 lg:border-t-0 lg:border-r lg:last:border-r-0 [&:nth-child(-n+2)]:border-t-0"><p className="text-[12px] text-muted-foreground">{metric.label}</p><p className="mt-2 flex flex-wrap items-baseline gap-2"><span className="text-[13px] text-muted-foreground line-through">{metric.before}</span><span aria-hidden="true">→</span><strong className="font-serif text-2xl font-[500] tabular-nums">{metric.after}</strong></p><div className="mt-4 space-y-1" aria-hidden="true"><span className="block h-1 w-full bg-muted" /><span className="block h-1 bg-primary" style={{ width: `${Math.min(100, Math.max(0, metric.ratio * 100))}%`, background: accent }} /></div></li>)}
        </ul>
      </div>
    </section>
  );
}
