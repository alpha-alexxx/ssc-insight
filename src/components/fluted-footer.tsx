"use client";

import * as React from "react";
import { createFlutedRenderer, readGlRgb, type FlutedRenderer, type Rgb } from "./fluted-gl";
import { FooterCaption, FooterLockup, FooterNav, plateColors, resolveColor, type FooterColumn, type FooterLink } from "./footer-parts";
import { useInteractionReducedMotion } from "./ui-interaction-motion";

/*
 * A footer whose foot is a pane of reeded glass with the brand's name behind it.
 * The links sit above the glass on the same plate; the glass rises out of it with no seam.
 * A slow band of light drifts behind the flutes, and follows the pointer or the column
 * you're reading, so each flute's highlight turns toward you.
 */

export type FlutedLink = FooterLink;
export type FlutedColumn = FooterColumn;

export interface FlutedFooterProps {
  /** Brand name: shown in the lockup and set large behind the glass. */
  wordmark: string;
  /** Optional logo beside the name. */
  logo?: React.ReactNode;
  /** One short line about the product. */
  tagline?: string;
  /** A contact link under the tagline, e.g. an email address. */
  contact?: FlutedLink;
  /** Link columns. */
  columns?: FlutedColumn[];
  /** "auto" follows the theme; "dark" keeps a dark plate on light pages too. */
  tone?: "auto" | "dark";
  /** The glass colour. Any CSS colour or token. Defaults to `var(--chart-3)`. */
  accent?: string;
  /** Copyright line. */
  legal?: string;
  /** Small links beside the copyright. */
  legalLinks?: FlutedLink[];
  className?: string;
}

const NO_COLUMNS: FlutedColumn[] = [];
const NO_LINKS: FlutedLink[] = [];
const DEFAULT_ACCENT = "var(--chart-3, var(--primary))";

function DefaultMark() {
  return (
    <svg viewBox="0 0 28 28" className="size-7 shrink-0" aria-hidden="true">
      <rect x="0.5" y="0.5" width="27" height="27" rx="7.5" fill="color-mix(in oklab, var(--fp-accent) 14%, transparent)" stroke="color-mix(in oklab, var(--fp-accent) 40%, transparent)" />
      {[8.5, 12.2, 15.8, 19.5].map((x, i) => (
        <path key={x} d={`M${x} 7.5v13`} stroke="var(--fp-accent)" strokeOpacity={[0.45, 1, 0.8, 0.55][i]} strokeWidth="1.5" strokeLinecap="round" />
      ))}
    </svg>
  );
}

/** The name twice in one texture: sharp in red, blurred in green, for the flutes to mix between. */
function drawWordMask(ctx: CanvasRenderingContext2D, word: string, w: number, h: number, bandTop: number, bandHeight: number, family: string) {
  // Opaque black ground: a transparent canvas is stored premultiplied, and WebGL would lift
  // every faint pixel of the blur to full strength on upload.
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);
  const label = word.trim() || "Fluted";
  const setFont = (size: number) => {
    ctx.font = `700 ${size}px ${family}`;
    if ("letterSpacing" in ctx) {
      (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${(-0.045 * size).toFixed(2)}px`;
    }
  };
  setFont(100);
  const m = ctx.measureText(label);
  const hRatio = (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) / 100 || 0.72;
  const size = Math.max(24, Math.min((w * 0.86) / Math.max(0.5, m.width / 100), (bandHeight * 0.66) / hRatio));
  setFont(size);
  const after = ctx.measureText(label);
  // Centre the letters' ink (not the em box) a little above the middle of the glass.
  const baseline = bandTop + bandHeight * 0.46 + (after.actualBoundingBoxAscent - after.actualBoundingBoxDescent) / 2;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "rgb(255, 0, 0)";
  ctx.fillText(label, w * 0.5, baseline);
  ctx.globalCompositeOperation = "lighter";
  ctx.filter = `blur(${Math.max(2, Math.round(size * 0.045))}px)`;
  ctx.fillStyle = "rgb(0, 255, 0)";
  ctx.fillText(label, w * 0.5, baseline);
  ctx.filter = "none";
  ctx.globalCompositeOperation = "source-over";
}

export function FlutedFooter({
  wordmark,
  logo,
  tagline,
  contact,
  columns = NO_COLUMNS,
  tone = "auto",
  accent = DEFAULT_ACCENT,
  legal,
  legalLinks = NO_LINKS,
  className = "",
}: FlutedFooterProps) {
  const reduced = useInteractionReducedMotion();
  const plateRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const glassRef = React.useRef<HTMLDivElement>(null);
  const targetLightRef = React.useRef({ x: 0.5, y: 0.7, active: false });

  React.useEffect(() => {
    const plate = plateRef.current;
    const canvas = canvasRef.current;
    const glassBand = glassRef.current;
    if (!plate || !canvas || !glassBand) return;

    let renderer: FlutedRenderer | null = null;
    try {
      renderer = createFlutedRenderer(canvas);
    } catch {
      renderer = null;
    }
    if (!renderer) return;
    const gl = renderer;

    let raf = 0;
    let visible = false;
    let hidden = document.hidden;
    let disposed = false;
    let revealStart = -1;
    let born = performance.now();
    let lightX = 0.5;
    let lightY = 0.7;
    let lightStrength = 0;

    const readColors = (): [Rgb, Rgb, Rgb, boolean] => {
      const css = getComputedStyle(plate);
      const paper = readGlRgb(css.backgroundColor, [0.05, 0.08, 0.07]);
      const ink = readGlRgb(css.color, [0.94, 0.94, 0.9]);
      const lum = 0.2126 * paper[0] + 0.7152 * paper[1] + 0.0722 * paper[2];
      const isDark = tone === "dark" || lum < 0.42;
      const accentRgb = readGlRgb(resolveColor(plate, "var(--fp-accent)"), isDark ? [0.27, 0.78, 0.62] : [0.14, 0.52, 0.42]);
      return [paper, ink, accentRgb, isDark];
    };

    const draw = (t: number, reveal: number) => gl.draw(t, reveal, lightX, lightY, lightStrength);

    const measure = () => {
      if (disposed) return;
      const box = plate.getBoundingClientRect();
      const band = glassBand.getBoundingClientRect();
      const w = Math.max(1, box.width);
      const h = Math.max(1, box.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const W = Math.round(w * dpr);
      const H = Math.round(h * dpr);
      const topFrac = Math.max(0.05, Math.min(0.92, (band.top - box.top) / h));
      // About one flute per 18px, so the slices stay readable at any width.
      const ribs = Math.max(22, Math.min(72, Math.round(w / 18)));
      gl.layout(W, H, topFrac, ribs);

      const mask = document.createElement("canvas");
      mask.width = W;
      mask.height = H;
      const mctx = mask.getContext("2d");
      if (mctx) {
        const family = getComputedStyle(plate).fontFamily || "system-ui, sans-serif";
        drawWordMask(mctx, wordmark, W, H, (band.top - box.top) * dpr, band.height * dpr, family);
        gl.mask(mask);
      }
      gl.colors(...readColors());
      if (reduced) draw(1.2, 1);
    };

    const frame = (now: number) => {
      raf = 0;
      if (disposed || !visible || hidden || reduced) return;
      if (revealStart < 0) revealStart = now;
      const reveal = 1 - Math.pow(1 - Math.min(1, (now - revealStart) / 1150), 3);
      const tgt = targetLightRef.current;
      lightStrength += ((tgt.active ? 1 : 0) - lightStrength) * 0.08;
      if (tgt.active) {
        lightX += (tgt.x - lightX) * 0.1;
        lightY += (tgt.y - lightY) * 0.1;
      }
      draw((now - born) / 1000, reveal);
      raf = requestAnimationFrame(frame);
    };

    const kick = () => {
      if (!raf && visible && !hidden && !reduced && !disposed) raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (disposed) return;
      born = performance.now();
      measure();
      plate.dataset.ready = "";
      kick();
    };
    if (document.fonts?.status === "loaded") start();
    else document.fonts.ready.then(start, start);

    const ro = new ResizeObserver(() => !disposed && plate.dataset.ready !== undefined && measure());
    ro.observe(plate);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && reduced) draw(1.2, 1);
        else kick();
      },
      { threshold: 0.12 },
    );
    io.observe(plate);

    const onVis = () => {
      hidden = document.hidden;
      if (!hidden) kick();
    };
    document.addEventListener("visibilitychange", onVis);

    const mo = new MutationObserver(() => {
      gl.colors(...readColors());
      if (reduced) draw(1.2, 1);
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] });

    const onMove = (e: PointerEvent) => {
      if (reduced || e.pointerType === "touch") return;
      const r = plate.getBoundingClientRect();
      targetLightRef.current = {
        x: Math.max(0, Math.min(1, (e.clientX - r.left) / Math.max(1, r.width))),
        y: Math.max(0, Math.min(1, (e.clientY - r.top) / Math.max(1, r.height))),
        active: true,
      };
    };
    const onLeave = () => {
      targetLightRef.current = { ...targetLightRef.current, active: false };
    };

    plate.addEventListener("pointermove", onMove);
    plate.addEventListener("pointerleave", onLeave);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      raf = 0;
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      plate.removeEventListener("pointermove", onMove);
      plate.removeEventListener("pointerleave", onLeave);
      gl.dispose();
      delete plate.dataset.ready;
    };
  }, [wordmark, tone, accent, reduced]);

  // Reading a column turns the light behind the glass toward it.
  const aimColumn = (el: HTMLElement | null) => {
    const plate = plateRef.current;
    if (!plate || reduced) return;
    if (!el) {
      targetLightRef.current = { ...targetLightRef.current, active: false };
      return;
    }
    const pr = plate.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    targetLightRef.current = { x: Math.max(0, Math.min(1, (er.left + er.width * 0.5 - pr.left) / Math.max(1, pr.width))), y: 0.65, active: true };
  };

  return (
    <footer className={`w-full max-w-[1200px] ${className}`}>
      <div aria-hidden="true" data-natural-width className="grid h-0" style={{ gridTemplateColumns: "minmax(0, 1200px)" }} />
      <div className="@container w-full">
        <div ref={plateRef} className="group/plate relative isolate touch-pan-y overflow-clip rounded-[28px]" style={plateColors(tone === "dark", accent)}>
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 size-full opacity-0 transition-opacity duration-700 group-data-[ready]/plate:opacity-100"
          />

          <div className="grid grid-cols-1 gap-x-10 gap-y-9 px-[max(20px,5cqi)] pt-[clamp(28px,4.5cqi,56px)] @[700px]:grid-cols-[minmax(0,1fr)_auto]">
            <FooterLockup logo={logo ?? <DefaultMark />} name={wordmark} tagline={tagline} contact={contact} />
            <FooterNav columns={columns} onAim={aimColumn} />
          </div>

          {/* The glass. Until WebGL is ready, and without it, the name shows as faint type. */}
          <div ref={glassRef} aria-hidden="true" className="relative mt-[clamp(20px,4cqi,48px)] h-[clamp(170px,25cqi,320px)] w-full select-none">
            <p className="absolute inset-0 flex items-center justify-center text-[15cqi] font-bold tracking-[-0.045em] opacity-20 transition-opacity duration-700 group-data-[ready]/plate:opacity-0">
              {wordmark}
            </p>
          </div>

          <FooterCaption legal={legal} links={legalLinks} className="relative px-[max(20px,5cqi)] pb-[clamp(18px,2.4cqi,26px)] pt-3" />
        </div>
      </div>
    </footer>
  );
}
