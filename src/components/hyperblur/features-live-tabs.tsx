"use client";

import * as React from "react";

export interface FeaturesLiveTabsItem { label: string; title: string; body: string; stat: string; scene: "full" | "subject" | "sectional" | "all" }
export interface FeaturesLiveTabsProps extends Omit<React.HTMLAttributes<HTMLElement>, "title" | "onChange" | "defaultValue"> {
  eyebrow?: string; title?: string; subtitle?: string; items?: FeaturesLiveTabsItem[]; value?: number; defaultValue?: number; onChange?: (index: number) => void; autoPlay?: boolean; interval?: number; accent?: string;
  renderScene?: (scene: FeaturesLiveTabsItem["scene"], context: "mini" | "stage") => React.ReactNode;
}

/** Live miniature tabs, adapted from Hyperblur with injectable product scenes. */
export function FeaturesLiveTabs({ eyebrow, title, subtitle, items = [], defaultValue = 0, value, onChange, autoPlay = true, interval = 6000, accent = "var(--primary)", renderScene, className = "", ...rest }: FeaturesLiveTabsProps) {
  const [own, setOwn] = React.useState(defaultValue);
  const [paused, setPaused] = React.useState(false);
  const [reduced, setReduced] = React.useState(false);
  const active = Math.min(value ?? own, Math.max(0, items.length - 1));
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const uid = React.useId();
  const playing = autoPlay && !paused && !reduced && items.length > 1;
  const choose = React.useCallback((next: number, focus = false) => {
    const index = (next + items.length) % items.length;
    if (value === undefined) setOwn(index);
    onChange?.(index);
    if (focus) refs.current[index]?.focus();
  }, [items.length, onChange, value]);
  React.useEffect(() => { const media = window.matchMedia("(prefers-reduced-motion: reduce)"); const update = () => setReduced(media.matches); update(); media.addEventListener("change", update); return () => media.removeEventListener("change", update); }, []);
  React.useEffect(() => { if (!playing) return; const timer = window.setTimeout(() => choose(active + 1), interval); return () => window.clearTimeout(timer); }, [active, choose, interval, playing]);
  const item = items[active];
  if (!item) return null;
  return (
    <section id="scopes" className={`relative overflow-hidden border-b border-border bg-background py-20 text-foreground sm:py-24 ${className}`} onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false); }} {...rest}>
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div>{eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{eyebrow}</p> : null}<h2 className="mt-3 max-w-2xl font-serif text-[clamp(1.75rem,3.4vw,2.75rem)] font-[450] leading-[1.1] tracking-[-0.02em]">{title}</h2>{subtitle ? <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">{subtitle}</p> : null}</div><button type="button" onClick={() => setPaused((current) => !current)} aria-pressed={paused} className="min-h-11 self-start rounded-full border border-border px-4 text-[13px] font-medium hover:bg-muted">{paused || reduced ? "Play tour" : "Pause tour"}</button></div>
        <div role="tablist" aria-label={title} className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4" onKeyDown={(event) => {
          if (["ArrowRight", "ArrowDown"].includes(event.key)) { event.preventDefault(); choose(active + 1, true); }
          if (["ArrowLeft", "ArrowUp"].includes(event.key)) { event.preventDefault(); choose(active - 1, true); }
          if (event.key === "Home") { event.preventDefault(); choose(0, true); }
          if (event.key === "End") { event.preventDefault(); choose(items.length - 1, true); }
        }}>
          {items.map((entry, index) => <button key={entry.label} ref={(node) => { refs.current[index] = node; }} type="button" role="tab" id={`${uid}-tab-${index}`} aria-selected={index === active} aria-controls={`${uid}-panel`} tabIndex={index === active ? 0 : -1} onClick={() => choose(index)} className={`relative min-w-0 overflow-hidden rounded-[var(--radius-card)] border bg-card p-2 text-left transition-colors ${index === active ? "border-primary" : "border-border hover:bg-muted"}`}>
            <span aria-hidden="true" className={`block h-24 overflow-hidden rounded-[var(--radius-control)] bg-muted/60 p-2 text-[7px] ${index === active ? "opacity-100" : "opacity-60"}`}>{renderScene?.(entry.scene, "mini")}</span>
            <span className="mt-2 flex items-center justify-between gap-2 px-1 pb-1 text-[13px] font-semibold"><span className="truncate">{entry.label}</span><small className="font-mono text-[10px] text-muted-foreground">0{index + 1}</small></span>
            {index === active && playing ? <span aria-hidden="true" className="absolute inset-x-3 bottom-1 h-0.5 origin-left bg-primary" style={{ animation: `hb-tab-fill ${interval}ms linear both` }} /> : null}
          </button>)}
        </div>
        <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${active}`} className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
          <div className="min-w-0 overflow-hidden rounded-[var(--radius-panel)] border border-border bg-card p-3 sm:p-5"><div key={active} className="hb-scene-zoom">{renderScene?.(item.scene, "stage")}</div></div>
          <div className="flex flex-col justify-between rounded-[var(--radius-panel)] border border-border bg-muted p-6 sm:p-8"><div key={active}><h3 className="font-serif text-2xl leading-tight tracking-[-0.02em]">{item.title}</h3><p className="mt-4 text-sm leading-relaxed text-muted-foreground">{item.body}</p></div><p className="mt-8 border-t border-border pt-5 text-[13px] text-muted-foreground"><strong className="mr-2 font-serif text-3xl font-[500]" style={{ color: accent }}>{item.stat.split(" ")[0]}</strong>{item.stat.split(" ").slice(1).join(" ")}</p></div>
        </div>
      </div>
      <style>{`@keyframes hb-tab-fill{from{transform:scaleX(0)}to{transform:scaleX(1)}}.hb-scene-zoom{animation:hb-scene-zoom .45s cubic-bezier(.22,1,.36,1)}@keyframes hb-scene-zoom{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}@media(prefers-reduced-motion:reduce){.hb-scene-zoom{animation:none}}`}</style>
    </section>
  );
}
