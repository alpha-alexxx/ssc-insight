"use client";

import * as React from "react";

export type DeviceGalleryKind = "watch" | "phone" | "tablet" | "laptop";
export interface DeviceGalleryDevice { id: DeviceGalleryKind; label: string; headline: string; detail: string }
export interface ShowcaseDeviceGalleryProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  eyebrow?: string; title?: string; subtitle?: string; appName?: string; devices?: DeviceGalleryDevice[]; defaultDevice?: DeviceGalleryKind; device?: DeviceGalleryKind; onDeviceChange?: (device: DeviceGalleryKind) => void; autoPlay?: boolean; interval?: number; accent?: string;
  screens?: Partial<Record<DeviceGalleryKind, React.ReactNode>>;
}

const DIMENSIONS: Record<DeviceGalleryKind, { width: number; height: number; radius: number }> = {
  watch: { width: 30, height: 38, radius: 22 }, phone: { width: 38, height: 82, radius: 18 }, tablet: { width: 78, height: 66, radius: 12 }, laptop: { width: 94, height: 62, radius: 8 },
};
function DeviceIcon({ id }: { id: DeviceGalleryKind }) {
  if (id === "phone") return <span className="block h-5 w-3 rounded-[3px] border border-current" aria-hidden="true" />;
  if (id === "tablet") return <span className="block h-5 w-4 rounded-[3px] border border-current" aria-hidden="true" />;
  return <span className="block h-4 w-6 rounded-[2px] border border-current" aria-hidden="true" />;
}

/** Hyperblur's morphing device stage with SSC product screens injected. */
export function ShowcaseDeviceGallery({ eyebrow, title, subtitle, appName = "SSC Insight", devices = [], defaultDevice = "laptop", device, onDeviceChange, autoPlay = true, interval = 4800, accent = "var(--primary)", screens = {}, className = "", ...rest }: ShowcaseDeviceGalleryProps) {
  const [own, setOwn] = React.useState<DeviceGalleryKind>(defaultDevice);
  const [paused, setPaused] = React.useState(false);
  const [reduced, setReduced] = React.useState(false);
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const current = device ?? own;
  const index = Math.max(0, devices.findIndex((entry) => entry.id === current));
  const info = devices[index] ?? devices[0];
  const choose = React.useCallback((next: DeviceGalleryKind) => { if (device === undefined) setOwn(next); onDeviceChange?.(next); }, [device, onDeviceChange]);
  const playing = autoPlay && !paused && !reduced && devices.length > 1;
  React.useEffect(() => { const media = window.matchMedia("(prefers-reduced-motion: reduce)"); const update = () => setReduced(media.matches); update(); media.addEventListener("change", update); return () => media.removeEventListener("change", update); }, []);
  React.useEffect(() => { if (!playing || !info) return; const timer = window.setTimeout(() => choose(devices[(index + 1) % devices.length].id), interval); return () => window.clearTimeout(timer); }, [choose, devices, index, info, interval, playing]);
  if (!info) return null;
  const dimensions = DIMENSIONS[info.id];
  return (
    <section id="workspace" className={`border-b border-border bg-muted py-20 text-foreground sm:py-24 ${className}`} onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false); }} {...rest}>
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-[minmax(0,.75fr)_minmax(0,1.25fr)]">
        <div>
          {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">{eyebrow}</p> : null}<h2 className="mt-3 font-serif text-[clamp(1.75rem,3.4vw,2.75rem)] font-[450] leading-[1.1] tracking-[-0.02em]">{title}</h2>{subtitle ? <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground">{subtitle}</p> : null}
          <div className="mt-7 grid max-w-md grid-cols-[repeat(var(--device-count),minmax(0,1fr))] rounded-full border border-border bg-card p-1" role="radiogroup" aria-label="Device" style={{ "--device-count": devices.length } as React.CSSProperties}>
            {devices.map((entry, position) => <button key={entry.id} ref={(node) => { refs.current[position] = node; }} type="button" role="radio" aria-checked={entry.id === info.id} tabIndex={entry.id === info.id ? 0 : -1} onClick={() => choose(entry.id)} onKeyDown={(event) => { let next = -1; if (["ArrowRight", "ArrowDown"].includes(event.key)) next = (position + 1) % devices.length; if (["ArrowLeft", "ArrowUp"].includes(event.key)) next = (position - 1 + devices.length) % devices.length; if (event.key === "Home") next = 0; if (event.key === "End") next = devices.length - 1; if (next < 0) return; event.preventDefault(); choose(devices[next].id); refs.current[next]?.focus(); }} className={`relative flex min-h-11 items-center justify-center gap-2 rounded-full px-2 text-[12px] font-medium ${entry.id === info.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}><DeviceIcon id={entry.id} />{entry.label}</button>)}
          </div>
          <div key={info.id} aria-live="polite" className="mt-4 min-h-28 rounded-[var(--radius-card)] border border-border bg-card p-4"><h3 className="font-serif text-lg">{info.headline}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{info.detail}</p></div>
          <button type="button" aria-pressed={paused} onClick={() => setPaused((value) => !value)} className="mt-4 min-h-11 rounded-full border border-border px-4 text-[13px] font-medium hover:bg-card">{paused || reduced ? "Play tour" : "Pause tour"}</button>
        </div>
        <div className="relative mx-auto flex aspect-[10/8] w-full max-w-2xl items-center justify-center overflow-hidden" role="img" aria-label={`${appName} on ${info.label}`}>
          <div aria-hidden="true" className="absolute inset-16 rounded-full blur-3xl" style={{ background: `radial-gradient(closest-side, color-mix(in srgb, ${accent} 10%, transparent), transparent)` }} />
          <div className="hb-device-frame relative overflow-hidden border border-foreground/20 bg-card p-1.5" data-device={info.id} style={{ width: `${dimensions.width}%`, height: `${dimensions.height}%`, borderRadius: `${dimensions.radius}px` }}>
            <div key={info.id} aria-hidden="true" className="hb-device-screen h-full w-full overflow-hidden rounded-[inherit] bg-background text-[10px]">{screens[info.id]}</div>
          </div>
          {info.id === "laptop" ? <div aria-hidden="true" className="absolute bottom-[12%] h-3 w-[70%] rounded-b-xl border border-foreground/20 bg-card" /> : null}
        </div>
      </div>
      <style>{`.hb-device-frame{transition:width .65s cubic-bezier(.65,0,.25,1),height .65s cubic-bezier(.65,0,.25,1),border-radius .65s cubic-bezier(.65,0,.25,1)}.hb-device-screen{animation:hb-device-in .4s ease-out}@keyframes hb-device-in{from{opacity:0;transform:scale(1.02)}to{opacity:1;transform:none}}@media(max-width:480px){.hb-device-frame[data-device=phone]{width:52%;height:88%}}@media(prefers-reduced-motion:reduce){.hb-device-frame{transition:none}.hb-device-screen{animation:none}}`}</style>
    </section>
  );
}
