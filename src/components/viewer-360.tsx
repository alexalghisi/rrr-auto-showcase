import { useEffect, useRef, useState } from "react";
import { RotateCw, Play, Pause } from "lucide-react";

import { photoUrl } from "@/lib/site";

/**
 * Showroom 3D: fotografiile reale ale mașinii sunt așezate pe o platformă 3D (cilindru)
 * care se rotește liber și continuu cu degetul / mouse-ul, cu perspectivă, inerție,
 * umbrire în funcție de unghi, reflexie pe podea și rotire automată lină.
 */
export function Viewer360({
  images,
  alt,
  index,
  onIndexChange,
}: {
  images: string[];
  alt: string;
  index: number;
  onIndexChange: (i: number) => void;
}) {
  const n = images.length;
  const step = 360 / n;
  const [pos, setPos] = useState(index);
  const [playing, setPlaying] = useState(false);
  const [hinted, setHinted] = useState(false);
  const [width, setWidth] = useState(800);
  const boxRef = useRef<HTMLDivElement>(null);

  const s = useRef({
    pos: index,
    vel: 0,
    dragging: false,
    startX: 0,
    startPos: 0,
    lastX: 0,
    lastT: 0,
    target: null as number | null,
    playing: false,
    lastIdx: index,
  });
  const cbRef = useRef(onIndexChange);
  cbRef.current = onIndexChange;
  s.current.playing = playing;

  const wrap = (i: number) => ((i % n) + n) % n;

  // măsoară lățimea pentru geometria 3D
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e!.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // preîncarcă pozele
  useEffect(() => {
    images.forEach((src) => {
      const im = new Image();
      im.src = photoUrl(src);
    });
  }, [images]);

  // miniatură aleasă din exterior → rotește pe calea cea mai scurtă
  useEffect(() => {
    const st = s.current;
    if (st.dragging || n < 2) return;
    if (wrap(Math.round(st.pos)) === index) return;
    let diff = index - wrap(st.pos);
    if (diff > n / 2) diff -= n;
    if (diff < -n / 2) diff += n;
    st.target = Math.round(st.pos) + Math.round(diff);
    st.vel = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, n]);

  // bucla de animație
  useEffect(() => {
    if (n < 2) return;
    let raf = 0;
    let prev = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      const st = s.current;
      let changed = false;
      if (!st.dragging) {
        if (st.playing) {
          st.target = null;
          st.vel += (0.45 - st.vel) * Math.min(1, dt * 2);
          st.pos += st.vel * dt;
          changed = true;
        } else if (st.target !== null) {
          const d = st.target - st.pos;
          if (Math.abs(d) < 0.001) {
            st.pos = st.target;
            st.target = null;
          } else {
            st.pos += d * Math.min(1, dt * 7);
          }
          changed = true;
        } else if (Math.abs(st.vel) > 0.01) {
          st.pos += st.vel * dt;
          st.vel *= Math.pow(0.12, dt);
          changed = true;
          if (Math.abs(st.vel) < 0.35) {
            st.target = Math.round(st.pos + st.vel * 0.3);
            st.vel = 0;
          }
        }
      }
      if (changed) {
        setPos(st.pos);
        const idx = wrap(Math.round(st.pos));
        if (idx !== st.lastIdx) {
          st.lastIdx = idx;
          cbRef.current(idx);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  // geometrie
  const panelW = width * (n <= 3 ? 0.7 : 0.62);
  const panelH = panelW * 0.75;
  const radius = n > 2 ? panelW / 2 / Math.tan(Math.PI / n) + 8 : panelW * 0.6;
  const rot = -pos * step;
  const pxPerFrame = Math.max(120, width * 0.45);

  return (
    <div
      ref={boxRef}
      className="relative aspect-[4/3] cursor-grab touch-pan-y select-none overflow-hidden bg-surface-strong active:cursor-grabbing"
      style={{ perspective: `${Math.round(width * 1.6)}px` }}
      onPointerDown={(e) => {
        const st = s.current;
        setPlaying(false);
        setHinted(true);
        st.dragging = true;
        st.target = null;
        st.vel = 0;
        st.startX = e.clientX;
        st.startPos = st.pos;
        st.lastX = e.clientX;
        st.lastT = performance.now();
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        const st = s.current;
        if (!st.dragging) return;
        st.pos = st.startPos + (st.startX - e.clientX) / pxPerFrame;
        const now = performance.now();
        const dt = (now - st.lastT) / 1000;
        if (dt > 0) {
          const inst = (st.lastX - e.clientX) / pxPerFrame / dt;
          st.vel = st.vel * 0.5 + inst * 0.5;
        }
        st.lastX = e.clientX;
        st.lastT = now;
        setPos(st.pos);
        const idx = wrap(Math.round(st.pos));
        if (idx !== st.lastIdx) {
          st.lastIdx = idx;
          cbRef.current(idx);
        }
      }}
      onPointerUp={() => {
        const st = s.current;
        st.dragging = false;
        if (performance.now() - st.lastT > 90) st.vel = 0;
        st.vel = Math.max(-6, Math.min(6, st.vel));
        if (Math.abs(st.vel) < 0.35) {
          st.vel = 0;
          st.target = Math.round(st.pos);
        }
      }}
      onPointerCancel={() => {
        const st = s.current;
        st.dragging = false;
        st.target = Math.round(st.pos);
      }}
    >
      {/* lumină de showroom + podea */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 38%, color-mix(in oklab, var(--primary) 14%, transparent), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-[50%]"
        style={{
          bottom: "6%",
          width: "86%",
          height: "18%",
          background:
            "radial-gradient(ellipse at center, color-mix(in oklab, var(--primary) 22%, transparent), transparent 70%)",
          filter: "blur(6px)",
        }}
      />

      {/* scena 3D */}
      <div
        className="absolute left-1/2 top-[44%]"
        style={{
          width: panelW,
          height: panelH,
          marginLeft: -panelW / 2,
          marginTop: -panelH / 2,
          transformStyle: "preserve-3d",
          transform: `translateZ(${-radius}px) rotateX(-4deg) rotateY(${rot}deg)`,
        }}
      >
        {images.map((src, i) => {
          // unghiul panoului față de cameră (-180..180)
          let a = (((i * step + rot) % 360) + 540) % 360 - 180;
          const facing = Math.cos((a * Math.PI) / 180); // 1 = în față
          const bright = 0.35 + 0.65 * Math.max(0, facing);
          return (
            <div
              key={i}
              className="absolute inset-0 overflow-hidden rounded-xl border border-border/60 bg-card shadow-2xl"
              style={{
                transform: `rotateY(${i * step}deg) translateZ(${radius}px)`,
                backfaceVisibility: "hidden",
                WebkitBoxReflect:
                  "below 4px linear-gradient(transparent 70%, rgba(0,0,0,0.28))",
                filter: `brightness(${bright.toFixed(3)})`,
              } as React.CSSProperties}
            >
              <img
                src={photoUrl(src)}
                alt={i === 0 ? alt : ""}
                aria-hidden={i === 0 ? undefined : true}
                width={1200}
                height={900}
                fetchPriority={i === 0 ? "high" : "auto"}
                decoding="async"
                draggable={false}
                className="size-full object-cover"
              />
              {/* luciu care alunecă la rotire */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `linear-gradient(${100 + a}deg, transparent 35%, color-mix(in oklab, var(--foreground) 14%, transparent) 50%, transparent 65%)`,
                  opacity: Math.max(0, facing) * 0.8,
                }}
              />
            </div>
          );
        })}
      </div>

      <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-background/85 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary backdrop-blur">
        <RotateCw className="size-3.5" /> Showroom 3D
      </span>

      {n > 1 && (
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => setPlaying((p) => !p)}
          className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-background/85 px-3 py-1 text-xs font-semibold backdrop-blur hover:text-primary"
        >
          {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          {playing ? "Oprește" : "Rotește"}
        </button>
      )}

      {n > 1 && !hinted && (
        <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-background/85 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          ← Trage pentru a roti →
        </span>
      )}

      {n > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-1 gap-0.5 bg-background/30">
          {images.map((_, i) => (
            <div
              key={i}
              className="h-full flex-1 bg-primary transition-opacity"
              style={{ opacity: i === wrap(Math.round(pos)) ? 1 : 0.25 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
