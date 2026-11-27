"use client";

import { useEffect, useRef } from "react";

type DiamondGridProps = { className?: string; seed?: number };

type Point = { x: number; y: number };
type Spark = { col: number; row: number; start: number; reach: number; duration: number };

const LOOP = 32000;
const TAU = Math.PI * 2;

function random(seed: number) {
  let value = seed | 0;
  return () => {
    value = (value + 0x6d2b79f5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Read the live house theme instead of baking a light/dark palette into JS. */
function readCanvasColors(host: HTMLDivElement) {
  const probe = document.createElement("canvas");
  const context = probe.getContext("2d");
  const normalize = (value: string, fallback: string) => {
    if (!context) return fallback;
    context.fillStyle = "#000000";
    context.fillStyle = value || fallback;
    return context.fillStyle;
  };
  const styles = getComputedStyle(host);
  return {
    ink: normalize(styles.getPropertyValue("--foreground").trim(), "#25231f"),
    accent: normalize(styles.getPropertyValue("--primary").trim(), "#b65335"),
  };
}

/**
 * AI Canvas Diamond Grid, adapted to the landing's decorative section layer.
 * Seeded ignitions travel along a faint diagonal lattice. The canvas never
 * owns the surface color, input, accessibility tree or document layout.
 */
export function DiamondGrid({ className = "", seed = 1337 }: DiamondGridProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!host || !canvas || !ctx) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 1;
    let height = 1;
    let dpr = 1;
    let cell = 84;
    let cols = 0;
    let rows = 0;
    let origin: Point = { x: 0, y: 0 };
    let sparks: Spark[] = [];
    let colors = readCanvasColors(host);
    let raf = 0;
    let onScreen = false;
    let last = 0;
    let elapsed = 0;

    const project = (x: number, y: number): Point => ({
      x: origin.x + (x - y) * Math.SQRT1_2,
      y: origin.y + (x + y) * Math.SQRT1_2,
    });

    const diamond = (x: number, y: number, radius: number) => {
      ctx.beginPath();
      ctx.moveTo(x, y - radius);
      ctx.lineTo(x + radius, y);
      ctx.lineTo(x, y + radius);
      ctx.lineTo(x - radius, y);
      ctx.closePath();
    };

    const rebuild = () => {
      width = Math.max(1, Math.round(host.clientWidth));
      height = Math.max(1, Math.round(host.clientHeight));
      dpr = Math.min(window.devicePixelRatio || 1, width < 560 ? 1.5 : 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      cell = Math.max(64, Math.min(110, Math.min(width, height) * 0.16));
      const reach = Math.ceil((width + height) / cell) + 4;
      cols = reach;
      rows = reach;
      origin = { x: width / 2, y: -height * 0.35 };
      const rnd = random(seed);
      sparks = Array.from({ length: width < 560 ? 8 : 16 }, (_, index) => ({
        col: 1 + Math.floor(rnd() * Math.max(2, cols - 2)),
        row: 1 + Math.floor(rnd() * Math.max(2, rows - 2)),
        start: (index / 16) * LOOP + rnd() * 900,
        reach: 1.8 + rnd() * 2.2,
        duration: 5800 + rnd() * 4200,
      }));
      draw(motion.matches ? 9200 : elapsed);
    };

    const draw = (time: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 0.7;
      ctx.strokeStyle = colors.ink;
      ctx.globalAlpha = 0.09;
      ctx.beginPath();
      for (let col = 0; col < cols; col++) {
        const a = project(col * cell, 0);
        const b = project(col * cell, rows * cell);
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
      }
      for (let row = 0; row < rows; row++) {
        const a = project(0, row * cell);
        const b = project(cols * cell, row * cell);
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
      }
      ctx.stroke();

      ctx.fillStyle = colors.ink;
      ctx.globalAlpha = 0.15;
      ctx.beginPath();
      for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
          const p = project(col * cell, row * cell);
          if (p.x < -8 || p.x > width + 8 || p.y < -8 || p.y > height + 8) continue;
          ctx.moveTo(p.x, p.y - 2.2);
          ctx.lineTo(p.x + 2.2, p.y);
          ctx.lineTo(p.x, p.y + 2.2);
          ctx.lineTo(p.x - 2.2, p.y);
          ctx.closePath();
        }
      }
      ctx.fill();

      for (const spark of sparks) {
        const age = ((time - spark.start) % LOOP + LOOP) % LOOP;
        if (age > spark.duration) continue;
        const progress = age / spark.duration;
        const strength = Math.sin(progress * Math.PI);
        const distance = spark.reach * (1 - Math.pow(1 - progress, 2)) * cell;
        const centre = project(spark.col * cell, spark.row * cell);
        ctx.strokeStyle = colors.accent;
        ctx.fillStyle = colors.accent;
        ctx.globalAlpha = strength * 0.34;
        ctx.lineWidth = 1.1;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const end = project(spark.col * cell + dx * distance, spark.row * cell + dy * distance);
          ctx.beginPath();
          ctx.moveTo(centre.x, centre.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
        }
        ctx.globalAlpha = strength * 0.65;
        diamond(centre.x, centre.y, 3.5 + strength * 2);
        ctx.fill();
        ctx.globalAlpha = strength * 0.1;
        ctx.beginPath();
        ctx.arc(centre.x, centre.y, 14 + strength * 8, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const frame = (now: number) => {
      elapsed = (elapsed + Math.min(34, last ? now - last : 16)) % LOOP;
      last = now;
      draw(elapsed);
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
    };
    const start = () => {
      if (raf || motion.matches || !onScreen || document.hidden) return;
      raf = requestAnimationFrame(frame);
    };
    const sync = () => {
      stop();
      if (motion.matches) draw(9200);
      start();
    };

    const resize = new ResizeObserver(rebuild);
    resize.observe(host);
    const intersection = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    }, { threshold: 0.01 });
    intersection.observe(host);
    const theme = new MutationObserver(() => {
      colors = readCanvasColors(host);
      draw(motion.matches ? 9200 : elapsed);
    });
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme", "data-palette", "data-style"] });
    const visibility = () => sync();
    document.addEventListener("visibilitychange", visibility);
    motion.addEventListener("change", sync);
    rebuild();
    onScreen = true;
    sync();

    return () => {
      stop();
      resize.disconnect();
      intersection.disconnect();
      theme.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      motion.removeEventListener("change", sync);
      canvas.width = 0;
      canvas.height = 0;
    };
  }, [seed]);

  return (
    <div ref={hostRef} aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden select-none opacity-70 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_72%,transparent)] ${className}`}>
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 block" />
    </div>
  );
}
