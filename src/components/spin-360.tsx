import { useEffect, useRef, useState } from "react";
import { RotateCw, Hand } from "lucide-react";

import { spinFor } from "@/lib/spin360";

type Props = {
  slug: string;
  size?: "lg" | "sm";
  alt: string;
  /** Rotate slowly by itself until the user touches it. */
  autoRotate?: boolean;
  /** Set to true while the last pointer gesture was a drag (lets a parent link ignore the click). */
  movedRef?: React.MutableRefObject<boolean>;
  /** Only start downloading frames when true (cards wait for hover / viewport). */
  load?: boolean;
  /** Spin while hovered (desktop cards). */
  hoverSpin?: boolean;
  className?: string;
};

/**
 * Full 360° turntable from an image sequence. Drag left/right (finger or mouse)
 * as long as you want, in both directions; release with speed for inertia.
 */
export function Spin360({
  slug,
  size = "lg",
  alt,
  autoRotate = false,
  movedRef,
  load = true,
  hoverSpin = false,
  className = "",
}: Props) {
  const spin = spinFor(slug, size)!;
  const n = spin.count;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const imgs = useRef<(HTMLImageElement | null)[]>([]);
  const [loaded, setLoaded] = useState(0);
  const [touched, setTouched] = useState(false);
  const st = useRef({
    pos: 0,
    vel: 0,
    dragging: false,
    hover: false,
    auto: autoRotate,
    startX: 0,
    startPos: 0,
    lastX: 0,
    lastT: 0,
    drawn: -1,
  });

  // download frames (first frame immediately, then the rest in rotation order)
  useEffect(() => {
    if (!load) return;
    let cancelled = false;
    const list: (HTMLImageElement | null)[] = new Array(n).fill(null);
    imgs.current = list;
    const order = [0];
    for (let step = n / 2; step >= 1; step /= 2)
      for (let i = 0; i < n; i += Math.max(1, Math.round(step))) if (!order.includes(i)) order.push(i);
    for (let i = 0; i < n; i++) if (!order.includes(i)) order.push(i);
    let count = 0;
    order.forEach((i) => {
      const im = new Image();
      im.decoding = "async";
      im.onload = () => {
        if (cancelled) return;
        list[i] = im;
        count++;
        st.current.drawn = -1;
        setLoaded(count);
      };
      im.src = spin.url(i);
    });
    return () => {
      cancelled = true;
    };
  }, [load, n, slug, size]); // eslint-disable-line react-hooks/exhaustive-deps

  // render loop
  useEffect(() => {
    let raf = 0;
    let prev = performance.now();
    const nearest = (i: number) => {
      const list = imgs.current;
      for (let d = 0; d < n; d++) {
        const a = list[(((i + d) % n) + n) % n];
        if (a) return a;
        const b = list[(((i - d) % n) + n) % n];
        if (b) return b;
      }
      return null;
    };
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      const s = st.current;
      if (!s.dragging) {
        if (s.hover) s.vel += (n * 0.12 - s.vel) * Math.min(1, dt * 3);
        else if (s.auto) s.vel += (n * 0.06 - s.vel) * Math.min(1, dt * 2);
        else s.vel *= Math.exp(-2.6 * dt);
        if (Math.abs(s.vel) < 0.05 && !s.hover && !s.auto) s.vel = 0;
        s.pos += s.vel * dt;
      }
      const c = canvasRef.current;
      if (c) {
        const w = c.clientWidth;
        const h = c.clientHeight;
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
          c.width = Math.round(w * dpr);
          c.height = Math.round(h * dpr);
          s.drawn = -1;
        }
        const base = Math.floor(s.pos);
        const frac = s.pos - base;
        const key = Math.round(s.pos * 4); // redraw only when the view changes noticeably
        if (key !== s.drawn) {
          s.drawn = key;
          const ctx = c.getContext("2d");
          const a = nearest(base);
          if (ctx && a) {
            const draw = (im: HTMLImageElement, alpha: number) => {
              const r = Math.max(c.width / im.naturalWidth, c.height / im.naturalHeight);
              const dw = im.naturalWidth * r;
              const dh = im.naturalHeight * r;
              ctx.globalAlpha = alpha;
              ctx.drawImage(im, (c.width - dw) / 2, (c.height - dh) / 2, dw, dh);
            };
            draw(a, 1);
            const b = imgs.current[(((base + 1) % n) + n) % n];
            if (b && frac > 0.02) draw(b, frac); // blend between frames = no visible steps
            ctx.globalAlpha = 1;
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [n]);

  // one full turn ≈ 1.6 widths of drag
  const pxPerFrame = () => ((boxRef.current?.clientWidth ?? 400) * 1.6) / n;

  const onDown = (e: React.PointerEvent) => {
    const s = st.current;
    s.dragging = true;
    s.auto = false;
    s.hover = false;
    s.vel = 0;
    s.startX = s.lastX = e.clientX;
    s.startPos = s.pos;
    s.lastT = performance.now();
    if (movedRef) movedRef.current = false;
    setTouched(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const s = st.current;
    if (!s.dragging) return;
    const ppf = pxPerFrame();
    if (movedRef && Math.abs(e.clientX - s.startX) > 6) movedRef.current = true;
    s.pos = s.startPos + (s.startX - e.clientX) / ppf;
    const now = performance.now();
    const dt = (now - s.lastT) / 1000;
    if (dt > 0) s.vel = s.vel * 0.4 + ((s.lastX - e.clientX) / ppf / dt) * 0.6;
    s.lastX = e.clientX;
    s.lastT = now;
  };
  const onUp = () => {
    const s = st.current;
    if (!s.dragging) return;
    s.dragging = false;
    if (performance.now() - s.lastT > 80) s.vel = 0;
    const max = n * 1.5;
    s.vel = Math.max(-max, Math.min(max, s.vel));
  };

  const ready = loaded >= n;
  const pct = Math.round((loaded / n) * 100);

  return (
    <div
      ref={boxRef}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onMouseEnter={() => {
        if (hoverSpin) st.current.hover = true;
      }}
      onMouseLeave={() => {
        st.current.hover = false;
      }}
      style={{ touchAction: "pan-y" }}
      className={`relative select-none overflow-hidden bg-surface-strong cursor-grab active:cursor-grabbing ${className}`}
    >
      {/* first frame as a normal image: instant paint + SEO alt text */}
      <img
        src={spin.url(0)}
        alt={alt}
        width={size === "lg" ? 960 : 480}
        height={size === "lg" ? 540 : 270}
        decoding="async"
        draggable={false}
        className="absolute inset-0 size-full object-cover"
      />
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 size-full" />

      {size === "lg" && (
        <>
          <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary shadow-sm">
            <RotateCw className="size-3.5" /> 360°
          </span>
          {!touched && (
            <span className="pointer-events-none absolute inset-x-0 bottom-10 mx-auto flex w-fit items-center gap-2 rounded-full bg-foreground/75 px-4 py-2 text-sm font-semibold text-background">
              <Hand className="size-4" /> Trage stânga–dreapta ca să rotești mașina
            </span>
          )}
          <span className="pointer-events-none absolute bottom-2 right-3 text-[10px] font-medium text-foreground/70 [text-shadow:0_0_6px_hsl(0_0%_100%/0.9)]">
            Simulare generată cu AI din pozele reale · vezi pozele reale mai jos
          </span>
        </>
      )}
      {load && !ready && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-background/40">
          <div className="h-full bg-primary transition-[width]" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}
