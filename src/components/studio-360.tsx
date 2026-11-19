import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { Hand, RotateCw } from "lucide-react";
import { draggedPosition, dragTurnDistance } from "@/lib/vehicle-drag";

/** Revolutions per second while the car turns on its own. */
const AUTO_SPEED = 1 / 14;
/** Faster turn while a card is hovered. */
const HOVER_SPEED = 1 / 6;
/** Part of each 45° step spent on one angle before it glides into the next. */
const HOLD = 0.5;
/** While dragging, angles blend over almost the whole step so the turn feels continuous. */
const DRAG_HOLD = 0.08;
/** How quickly the drawn position catches up with the finger (per second). */
const FOLLOW = 22;
/** Small sideways drift during a blend, so the car seems to turn instead of fading. */
const DRIFT = 0.018;

/**
 * Studio turntable: the car turns on a grey studio floor; drag (finger or mouse) to walk
 * around it. Eight evenly spaced angles; between two neighbours the viewer cross-fades in
 * the second half of the step, so every angle stays sharp and the turn never jumps.
 */
export function Studio360({
  frames,
  alt,
  className = "",
  autoRotate = false,
  hoverSpin = false,
  lazy = false,
  movedRef,
}: {
  frames: string[];
  alt: string;
  className?: string;
  /** Keep turning slowly while visible (detail page). */
  autoRotate?: boolean;
  /** Turn while the pointer is over it (stock cards). */
  hoverSpin?: boolean;
  /** Load only the first angle until the visitor hovers or touches it (stock cards). */
  lazy?: boolean;
  /** Set to true after a drag, so a surrounding link can ignore the click. */
  movedRef?: MutableRefObject<boolean>;
}) {
  const n = frames.length;
  const canvas = useRef<HTMLCanvasElement>(null);
  const images = useRef<HTMLImageElement[]>([]);
  const [near, setNear] = useState(false);
  const [wanted, setWanted] = useState(!lazy);
  const [loaded, setLoaded] = useState(0);
  const [touched, setTouched] = useState(false);
  const st = useRef({
    pos: 0,
    goal: 0,
    vel: 0,
    lastX: 0,
    lastT: 0,
    target: null as number | null,
    dragging: false,
    pointer: -1,
    startX: 0,
    startPos: 0,
    distance: 360,
    visible: false,
    hover: false,
    reduced: false,
    drawn: -1,
    raf: 0,
    prev: 0,
    auto: autoRotate,
    kick: () => {},
    paint: () => {},
  });

  useEffect(() => {
    const el = canvas.current;
    if (!el || near) return;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near]);

  // First angle as soon as the viewer is near; the rest once wanted.
  useEffect(() => {
    if (!near) return;
    let cancelled = false;
    const list = wanted ? frames : frames.slice(0, 1);
    images.current = list.map((src, i) => {
      const existing = images.current[i];
      if (existing && existing.dataset["src"] === src) return existing;
      const im = new Image();
      im.decoding = "async";
      im.dataset["src"] = src;
      const done = () => {
        if (!cancelled) {
          st.current.drawn = -1;
          setLoaded((c) => c + 1);
          st.current.kick();
        }
      };
      im.onload = done;
      im.onerror = done;
      im.src = src;
      return im;
    });
    return () => {
      cancelled = true;
    };
  }, [frames, near, wanted]);

  useEffect(() => {
    const el = canvas.current;
    if (!el || n === 0) return;
    const s = st.current;
    s.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = () => {
      if (!s.raf) {
        s.prev = 0;
        s.raf = requestAnimationFrame(tick);
      }
    };
    const io = new IntersectionObserver(
      ([e]) => {
        s.visible = !!e?.isIntersecting;
        if (s.visible) start();
      },
      { threshold: 0.2 },
    );
    io.observe(el);

    const ready = (im?: HTMLImageElement) => !!im && im.complete && im.naturalWidth > 0;
    const draw = () => {
      const ctx = el.getContext("2d");
      if (!ctx) return;
      const rect = el.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (el.width !== w || el.height !== h) {
        el.width = w;
        el.height = h;
        s.drawn = -1;
      }
      const raw = (((s.pos % 1) + 1) % 1) * n;
      const p = Math.abs(raw - Math.round(raw)) < 1e-4 ? Math.round(raw) % n : raw;
      const q = Math.round(p * 160) * 2 + (s.dragging || s.target !== null ? 1 : 0);
      if (q === s.drawn) return;
      const i = Math.floor(p) % n;
      const f = p - Math.floor(p);
      const a = images.current[i];
      if (!ready(a)) {
        // Angle not loaded yet: show the first angle cleanly rather than leave a half blend on screen.
        if (ready(images.current[0])) {
          ctx.globalAlpha = 1;
          ctx.fillStyle = "#e9e9e7";
          ctx.fillRect(0, 0, w, h);
          paint(ctx, images.current[0]!, w, h, 1);
          ctx.globalAlpha = 1;
        }
        s.drawn = -1;
        return;
      }
      s.drawn = q;
      const hold =
        s.dragging || Math.abs(s.goal - s.pos) > 0.002 || s.target !== null ? DRAG_HOLD : HOLD;
      const b = images.current[(i + 1) % n];
      const t = f > hold ? (f - hold) / (1 - hold) : 0;
      const e = t * t * (3 - 2 * t);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#e9e9e7";
      ctx.fillRect(0, 0, w, h);
      paint(ctx, a!, w, h, 1, e > 0 && ready(b) ? -DRIFT * e : 0);
      if (e > 0 && ready(b)) paint(ctx, b!, w, h, e, DRIFT * (1 - e));
      ctx.globalAlpha = 1;
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - (s.prev || now)) / 1000);
      s.prev = now;
      let moving = false;
      if (!s.dragging && s.target !== null && (s.reduced || !s.visible)) {
        // Reduced motion (or off-screen): no settle animation, jump straight to the real angle.
        s.pos = s.target;
        s.target = null;
        s.drawn = -1;
      }
      if (s.dragging) {
        s.pos += (s.goal - s.pos) * Math.min(1, dt * FOLLOW);
      } else if (s.visible && !s.reduced) {
        if (s.hover && hoverSpin) {
          s.pos += HOVER_SPEED * dt;
          s.target = null;
          moving = true;
        } else if (s.target !== null) {
          const d = s.target - s.pos;
          if (Math.abs(d) < 0.0005) {
            s.pos = s.target;
            s.target = null;
            s.drawn = -1; // force a clean redraw of the exact angle, no blend residue
          } else {
            s.pos += d * Math.min(1, dt * 6);
            moving = true;
          }
        } else if (s.auto) {
          s.pos += AUTO_SPEED * dt;
          moving = true;
        }
      }
      draw();
      if (!s.dragging && !moving) {
        s.raf = 0;
        return;
      }
      s.raf = requestAnimationFrame(tick);
    };
    s.kick = start;
    s.paint = draw;
    start();
    return () => {
      cancelAnimationFrame(s.raf);
      s.raf = 0;
      s.kick = () => {};
      s.paint = () => {};
      io.disconnect();
    };
  }, [n, hoverSpin]);

  const snap = (momentum = 0) => {
    const s = st.current;
    // Coast a little in the direction of the flick, then settle on the nearest real angle.
    const coast = Math.max(-0.25, Math.min(0.25, momentum * 0.18));
    s.target = Math.round((s.pos + coast) * n) / n;
    s.kick();
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = st.current;
    if (!e.isPrimary || e.button !== 0 || s.dragging || n === 0) return;
    s.dragging = true;
    s.pointer = e.pointerId;
    s.auto = false;
    s.target = null;
    s.startX = e.clientX;
    s.startPos = s.pos;
    s.goal = s.pos;
    s.vel = 0;
    s.lastX = e.clientX;
    s.lastT = performance.now();
    s.distance = dragTurnDistance(e.currentTarget.getBoundingClientRect().width);
    if (movedRef) movedRef.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
    setWanted(true);
    setNear(true);
    setTouched(true);
    s.kick();
  };
  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = st.current;
    if (!s.dragging || e.pointerId !== s.pointer) return;
    if (Math.abs(e.clientX - s.startX) > 6 && movedRef) movedRef.current = true;
    s.goal = draggedPosition(s.startPos, s.startX, e.clientX, s.distance);
    const now = performance.now();
    const dt = (now - s.lastT) / 1000;
    if (dt > 0) s.vel = s.vel * 0.6 + ((s.lastX - e.clientX) / s.distance / dt) * 0.4;
    s.lastX = e.clientX;
    s.lastT = now;
    s.kick();
  };
  const onUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = st.current;
    if (!s.dragging || e.pointerId !== s.pointer) return;
    s.dragging = false;
    s.pointer = -1;
    s.pos = s.goal;
    const momentum = performance.now() - s.lastT < 80 ? s.vel : 0;
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
    snap(momentum);
  };
  const onKey = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const s = st.current;
    s.auto = false;
    setWanted(true);
    setTouched(true);
    s.target = (Math.round(s.pos * n) + (e.key === "ArrowRight" ? 1 : -1)) / n;
    s.kick();
  };

  return (
    <div
      className={`relative overflow-hidden bg-[#e9e9e7] ${className}`}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") {
          st.current.hover = true;
          setWanted(true);
          st.current.kick();
        }
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") {
          st.current.hover = false;
          snap();
        }
      }}
    >
      {n > 0 && (
        <img
          src={frames[0]}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          width={800}
          height={600}
          draggable={false}
          className="pointer-events-none absolute inset-0 size-full select-none object-cover"
        />
      )}
      <canvas
        ref={canvas}
        role="img"
        tabIndex={0}
        aria-label={`${alt} – vedere 360°, trage stânga-dreapta sau folosește săgețile pentru a roti mașina`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={onKey}
        onClick={(e) => {
          if (movedRef?.current) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        onDragStart={(e) => e.preventDefault()}
        style={{ touchAction: "pan-y" }}
        className="relative block size-full cursor-grab select-none outline-none focus-visible:ring-2 focus-visible:ring-primary active:cursor-grabbing"
      />
      {wanted && loaded < n && touched && (
        <span className="pointer-events-none absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center whitespace-nowrap rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-muted-foreground shadow">
          <RotateCw className="mr-2 size-3.5 animate-spin" /> Se încarcă vederea 360°
        </span>
      )}
      {!touched && autoRotate && (
        <span className="pointer-events-none absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground shadow">
          <Hand className="size-3.5" /> Trage pentru a te învârti în jurul mașinii
        </span>
      )}
    </div>
  );
}

function paint(
  ctx: CanvasRenderingContext2D,
  im: HTMLImageElement,
  w: number,
  h: number,
  alpha: number,
  shift = 0,
) {
  // Slight overscan so the sideways drift never shows an edge.
  const scale = Math.max(w / im.naturalWidth, h / im.naturalHeight) * 1.04;
  const dw = im.naturalWidth * scale;
  const dh = im.naturalHeight * scale;
  ctx.globalAlpha = alpha;
  ctx.drawImage(im, (w - dw) / 2 + shift * w, (h - dh) / 2, dw, dh);
}
