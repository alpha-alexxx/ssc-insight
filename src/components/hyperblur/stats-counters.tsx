"use client";

import * as React from "react";

export interface CounterStat { value: number; decimals?: number; prefix?: string; suffix?: string; label: string; delta?: string; trend?: number[] }
export interface StatsCountersProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  eyebrow?: string; title?: string; subtitle?: string; stats?: CounterStat[]; duration?: number; footnote?: string; accent?: string;
}

function spark(points: number[]) {
  const min = Math.min(...points), max = Math.max(...points), span = max - min || 1;
  return points.map((point, index) => `${index ? "L" : "M"}${(index * 120 / Math.max(1, points.length - 1)).toFixed(1)} ${(30 - ((point - min) / span) * 26).toFixed(1)}`).join(" ");
}

/** Hyperblur's count-up-and-sparkline mechanism on the house ledger. */
export function StatsCounters({ eyebrow, title, subtitle, stats = [], duration = 1800, footnote, accent = "var(--primary)", className = "", ...rest }: StatsCountersProps) {
  const ref = React.useRef<HTMLUListElement>(null);
  const [progress, setProgress] = React.useState(0);
  const uid = React.useId();
  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let raf = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const run = () => {
      if (reduced.matches) { setProgress(1); return; }
      const start = performance.now();
      const tick = (now: number) => {
        const next = Math.min(1, (now - start) / Math.max(200, duration));
        setProgress(next);
        if (next < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect(); run();
    }, { threshold: 0.2 });
    observer.observe(element);
    return () => { observer.disconnect(); cancelAnimationFrame(raf); };
  }, [duration]);

  return (
    <section id="numbers" className={`border-b border-border bg-background py-20 text-foreground sm:py-24 ${className}`} aria-labelledby={`${uid}-title`} {...rest}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div>{eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{eyebrow}</p> : null}{title ? <h2 id={`${uid}-title`} className="mt-3 max-w-2xl font-serif text-[clamp(1.75rem,3.4vw,2.75rem)] font-[450] leading-[1.1] tracking-[-0.02em]">{title}</h2> : null}</div>{subtitle ? <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{subtitle}</p> : null}</div>
        <ul ref={ref} className="mt-12 grid grid-cols-2 border-y border-border lg:grid-cols-4">
          {stats.map((stat, index) => {
            const decimals = stat.decimals ?? 0;
            const local = Math.min(1, Math.max(0, (progress - index * 0.08) / 0.76));
            const shown = stat.value * (1 - Math.pow(1 - local, 4));
            const full = `${stat.prefix ?? ""}${stat.value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${stat.suffix ?? ""}`;
            return <li key={stat.label} className="min-w-0 border-border p-4 odd:border-r even:border-t sm:p-6 lg:border-t-0 lg:border-r lg:last:border-r-0 [&:nth-child(-n+2)]:border-t-0">
              <p className="whitespace-nowrap font-serif text-[clamp(1.75rem,5vw,3.75rem)] leading-none tracking-[-0.04em] tabular-nums"><span className="sr-only">{full}</span><span aria-hidden="true">{stat.prefix}{shown.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}<span className="text-[.55em] text-muted-foreground">{stat.suffix}</span></span></p>
              <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{stat.label}</p>
              {stat.trend && stat.trend.length > 1 ? <svg viewBox="0 0 120 32" className="mt-5 h-8 w-full" aria-hidden="true"><path d={spark(stat.trend)} fill="none" stroke={accent} strokeWidth="1.5" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - progress} /></svg> : null}
              {stat.delta ? <p className="mt-3 font-mono text-[11px] text-muted-foreground">{stat.delta}</p> : null}
            </li>;
          })}
        </ul>
        {footnote ? <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{footnote}</p> : null}
      </div>
    </section>
  );
}
