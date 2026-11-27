"use client";

import { useEffect, useRef } from "react";

type NoiseFieldProps = { className?: string };
type Arrow = { x: number; y: number; angle: number; phase: number };

function seededPhase(x: number, y: number) {
  const value = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return (value - Math.floor(value)) * Math.PI * 2;
}

function flow(x: number, y: number, time: number) {
  return Math.sin(x * 0.007 + time) * Math.PI + Math.cos(y * 0.007 + time * 0.6) * Math.PI;
}

function turn(current: number, target: number, speed: number) {
  let difference = target - current;
  while (difference > Math.PI) difference -= Math.PI * 2;
  while (difference < -Math.PI) difference += Math.PI * 2;
  return current + difference * speed;
}

function color(host: HTMLElement, token: string, fallback: string) {
  const probe = document.createElement("canvas");
  const context = probe.getContext("2d");
  if (!context) return fallback;
  context.fillStyle = "#000000";
  context.fillStyle = getComputedStyle(host).getPropertyValue(token).trim() || fallback;
  return context.fillStyle;
}

/** AI Canvas Noise Field as a quiet, pointer-transparent section background. */
export function NoiseField({ className = "" }: NoiseFieldProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!host || !canvas || !ctx) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let arrows: Arrow[] = [];
    let width = 1;
    let height = 1;
    let time = 0;
    let raf = 0;
    let visible = false;
    let ink = color(host, "--foreground", "#25231f");
    let accent = color(host, "--primary", "#b65335");

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (const arrow of arrows) {
        const noise = flow(arrow.x, arrow.y, time) + 0.12 * Math.sin(time * 0.5 + arrow.phase);
        arrow.angle = turn(arrow.angle, noise, motion.matches ? 1 : 0.025);
        const cos = Math.cos(arrow.angle);
        const sin = Math.sin(arrow.angle);
        ctx.strokeStyle = ink;
        ctx.globalAlpha = 0.11;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(arrow.x - cos * 6, arrow.y - sin * 6);
        ctx.lineTo(arrow.x + cos * 6, arrow.y + sin * 6);
        ctx.stroke();
        ctx.strokeStyle = accent;
        ctx.globalAlpha = 0.16;
        ctx.beginPath();
        ctx.moveTo(arrow.x + cos * 6, arrow.y + sin * 6);
        ctx.lineTo(arrow.x + cos * 6 + Math.cos(arrow.angle + 2.5) * 3.2, arrow.y + sin * 6 + Math.sin(arrow.angle + 2.5) * 3.2);
        ctx.moveTo(arrow.x + cos * 6, arrow.y + sin * 6);
        ctx.lineTo(arrow.x + cos * 6 + Math.cos(arrow.angle - 2.5) * 3.2, arrow.y + sin * 6 + Math.sin(arrow.angle - 2.5) * 3.2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const rebuild = () => {
      width = Math.max(1, Math.round(host.clientWidth));
      height = Math.max(1, Math.round(host.clientHeight));
      const dpr = Math.min(window.devicePixelRatio || 1, width < 560 ? 1.25 : 1.75);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const spacing = width < 560 ? 40 : 30;
      arrows = [];
      for (let x = spacing / 2; x < width; x += spacing) {
        for (let y = spacing / 2; y < height; y += spacing) {
          arrows.push({ x, y, angle: flow(x, y, time), phase: seededPhase(x, y) });
        }
      }
      draw();
    };

    const frame = () => {
      time += 0.004;
      draw();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const sync = () => {
      stop();
      if (motion.matches) {
        time = 2.4;
        draw();
      }
      if (!motion.matches && visible && !document.hidden) raf = requestAnimationFrame(frame);
    };

    const resize = new ResizeObserver(rebuild);
    resize.observe(host);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    }, { threshold: 0.01 });
    intersection.observe(host);
    const theme = new MutationObserver(() => {
      ink = color(host, "--foreground", "#25231f");
      accent = color(host, "--primary", "#b65335");
      draw();
    });
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme", "data-palette", "data-style"] });
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", sync);
    const visibility = sync;
    rebuild();
    visible = true;
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
  }, []);

  return (
    <div ref={hostRef} aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden select-none opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_82%)] ${className}`}>
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 block" />
    </div>
  );
}
