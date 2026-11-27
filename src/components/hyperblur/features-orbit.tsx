"use client";

import * as React from "react";

export interface OrbitItem { label: string; icon?: React.ReactNode; ring?: "inner" | "outer" }
export interface OrbitCaption { title: string; description: string }
export interface FeaturesOrbitProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  eyebrow?: string; title?: string; subtitle?: string; items?: OrbitItem[]; captions?: OrbitCaption[]; primaryCta?: { label: string; href: string } | null; secondaryCta?: { label: string; href: string } | null; mark?: React.ReactNode; speed?: number; onItemSelect?: (item: OrbitItem, index: number) => void; accent?: string;
}

/** Hyperblur's two counter-rotating capability rings, with an explicit pause. */
export function FeaturesOrbit({ eyebrow, title, subtitle, items = [], captions = [], primaryCta, secondaryCta, mark, speed = 60, onItemSelect, accent = "var(--primary)", className = "", ...rest }: FeaturesOrbitProps) {
  const [paused, setPaused] = React.useState(false);
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => { const media = window.matchMedia("(prefers-reduced-motion: reduce)"); const update = () => setReduced(media.matches); update(); media.addEventListener("change", update); return () => media.removeEventListener("change", update); }, []);
  const stopped = paused || reduced;
  const renderRing = (ring: "inner" | "outer") => {
    const entries = items.map((item, index) => ({ item, index })).filter(({ item }) => (item.ring ?? "outer") === ring);
    return <div className={`hb-orbit-ring ${ring === "inner" ? "hb-orbit-inner" : "hb-orbit-outer"}`} data-paused={stopped} aria-hidden={false}>{entries.map(({ item, index }, position) => {
      const angle = -90 + (360 / Math.max(1, entries.length)) * position;
      const radius = ring === "inner" ? 31 : 45;
      return <div key={`${item.label}-${index}`} className="absolute left-1/2 top-1/2" style={{ transform: `rotate(${angle}deg) translateX(${radius}cqw) rotate(${-angle}deg)` }}><div className="hb-orbit-counter" data-ring={ring} data-paused={stopped}><button type="button" aria-label={item.label} onClick={() => onItemSelect?.(item, index)} className="group flex size-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:border-primary hover:text-primary focus-visible:border-primary"><span className="[&_svg]:size-5">{item.icon}</span><span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 max-w-36 -translate-x-1/2 rounded-full border border-border bg-card px-3 py-1 text-center text-[11px] whitespace-nowrap opacity-0 shadow-none group-hover:opacity-100 group-focus-visible:opacity-100">{item.label}</span></button></div></div>;
    })}</div>;
  };
  return (
    <section id="capabilities" className={`border-b border-border bg-muted py-20 text-foreground sm:py-24 ${className}`} onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false); }} {...rest}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8"><div className="grid items-center gap-10 lg:grid-cols-2"><div>{eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">{eyebrow}</p> : null}<h2 className="mt-3 font-serif text-[clamp(1.75rem,3.4vw,2.75rem)] font-[450] leading-[1.1] tracking-[-0.02em]">{title}</h2>{subtitle ? <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground">{subtitle}</p> : null}<div className="mt-7 flex flex-wrap gap-3">{primaryCta ? <a href={primaryCta.href} className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground">{primaryCta.label}</a> : null}{secondaryCta ? <a href={secondaryCta.href} className="inline-flex min-h-11 items-center rounded-full border border-border px-5 text-sm font-medium hover:bg-card">{secondaryCta.label}</a> : null}<button type="button" aria-pressed={paused} onClick={() => setPaused((value) => !value)} className="min-h-11 rounded-full border border-border px-4 text-[13px] font-medium hover:bg-card">{stopped ? "Play orbit" : "Pause orbit"}</button></div></div>
        <div className="relative mx-auto aspect-square w-full max-w-[480px] [container-type:inline-size]"><div aria-hidden="true" className="absolute inset-[24%] rounded-full blur-3xl" style={{ background: `radial-gradient(closest-side, color-mix(in srgb, ${accent} 9%, transparent), transparent)` }} />{renderRing("outer")}{renderRing("inner")}<div className="absolute left-1/2 top-1/2 grid size-[22cqw] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[var(--radius-panel)] border border-primary bg-primary text-primary-foreground [&_svg]:size-10">{mark ?? <span className="font-serif text-xl">ssc.</span>}</div></div></div>
        {captions.length ? <ul className="mt-12 grid border-t border-border sm:grid-cols-2 lg:grid-cols-4">{captions.map((caption) => <li key={caption.title} className="border-b border-border py-5 sm:odd:border-r sm:odd:pr-5 sm:even:pl-5 lg:border-b-0 lg:border-r lg:px-5 lg:first:pl-0 lg:last:border-r-0"><h3 className="font-serif text-lg">{caption.title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{caption.description}</p></li>)}</ul> : null}
      </div>
      <style>{`.hb-orbit-ring{position:absolute;inset:0;animation:hb-orbit-spin ${Math.max(4, speed)}s linear infinite}.hb-orbit-inner{animation-duration:${Math.max(4, speed) * 0.7}s}.hb-orbit-outer{animation-direction:reverse}.hb-orbit-ring:before{content:"";position:absolute;border:1px solid var(--border);border-radius:50%;inset:5%}.hb-orbit-inner:before{inset:19%}.hb-orbit-counter{animation:hb-orbit-spin ${Math.max(4, speed)}s linear infinite reverse}.hb-orbit-counter[data-ring=inner]{animation-duration:${Math.max(4, speed) * 0.7}s}.hb-orbit-counter[data-ring=outer]{animation-direction:normal}.hb-orbit-ring[data-paused=true],.hb-orbit-counter[data-paused=true]{animation-play-state:paused}@keyframes hb-orbit-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.hb-orbit-ring,.hb-orbit-counter{animation:none}}`}</style>
    </section>
  );
}
