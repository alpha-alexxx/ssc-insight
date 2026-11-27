"use client";

import * as React from "react";

export interface BentoTile { id: string; title: string; eyebrow?: string; children: React.ReactNode; className?: string }
export interface BentoLiveWidgetsProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  eyebrow?: string; title?: string; subtitle?: string; cta?: { label: string; href: string } | null; accent?: string; speed?: number; tiles?: BentoTile[];
}

/** The Hyperblur live bento grammar, with product-owned streaming tiles. */
export function BentoLiveWidgets({ eyebrow, title, subtitle, cta, accent = "var(--primary)", speed = 1, tiles = [], className = "", style, ...rest }: BentoLiveWidgetsProps) {
  return (
    <section className={`relative overflow-hidden border-b border-border bg-background py-20 text-foreground sm:py-24 ${className}`} style={{ "--hb-bento-accent": accent, "--hb-bento-speed": speed, ...style } as React.CSSProperties} {...rest}>
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5"><div>{eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{eyebrow}</p> : null}<h2 className="mt-3 max-w-2xl font-serif text-[clamp(1.75rem,3.4vw,2.75rem)] font-[450] leading-[1.1] tracking-[-0.02em]">{title}</h2>{subtitle ? <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">{subtitle}</p> : null}</div>{cta ? <a href={cta.href} className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground">{cta.label}</a> : null}</div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          {tiles.map((tile, index) => <article key={tile.id} className={`hb-bento-tile min-w-0 overflow-hidden rounded-[var(--radius-panel)] border border-border bg-card p-5 ${index === 0 ? "md:col-span-2 lg:col-span-3" : index === 1 ? "lg:col-span-3" : "lg:col-span-2"} ${tile.className ?? ""}`} style={{ "--tile-index": index } as React.CSSProperties}>
            {tile.eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">{tile.eyebrow}</p> : null}<h3 className="mt-1 font-serif text-lg tracking-[-0.01em]">{tile.title}</h3><div className="mt-4 min-w-0">{tile.children}</div>
          </article>)}
        </div>
      </div>
      <style>{`.hb-bento-tile{animation:hb-bento-rise .55s cubic-bezier(.22,1,.36,1) backwards;animation-delay:calc(var(--tile-index)*70ms)}@keyframes hb-bento-rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}@media(prefers-reduced-motion:reduce){.hb-bento-tile{animation:none}}`}</style>
    </section>
  );
}
