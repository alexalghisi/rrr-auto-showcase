import { useEffect, useRef, useState } from "react";
import { RotateCw, Play, Pause } from "lucide-react";

import { photoUrl } from "@/lib/site";

/**
 * Simulare 360° din fotografiile mașinii: poziție continuă (nu salt de la o poză la alta),
 * cu estompare între cadre, inerție la eliberare, rotire automată lină și magnetizare la cadru.
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
  const [pos, setPos] = useState(index);
  const [playing, setPlaying] = useState(false);
  const [hinted, setHinted] = useState(false);
  const [loaded, setLoaded] = useState(0);

  const s = useRef({
    pos: index,
    vel: 0, // cadre / secundă
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

  // preîncarcă toate pozele
  useEffect(() => {
    setLoaded(0);
    images.forEach((src) => {
      const im = new Image();
      im.onload = im.onerror = () => setLoaded((l) => l + 1);
      im.src = photoUrl(src);
    });
  }, [images]);

  // sincronizează când se alege o miniatură din exterior
  useEffect(() => {
    const st = s.current;
    if (st.dragging || n < 2) return;
    if (wrap(Math.round(st.pos)) === index) return;
    // cea mai scurtă cale
    const cur = st.pos;
    let diff = index - wrap(cur);
    if (diff > n / 2) diff -= n;
    if (diff < -n / 2) diff += n;
    st.target = cur + diff;
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
        if (st.target !== null) {
          const d = st.target - st.pos;
          if (Math.abs(d) < 0.002) {
            st.pos = st.target;
            st.target = null;
          } else {
            st.pos += d * Math.min(1, dt * 9);
          }
          changed = true;
        } else if (st.playing) {
          st.vel += (2.2 - st.vel) * Math.min(1, dt * 3);
          st.pos += st.vel * dt;
          changed = true;
        } else if (Math.abs(st.vel) > 0.02) {
          st.pos += st.vel * dt;
          st.vel *= Math.pow(0.04, dt); // frecare
          changed = true;
          if (Math.abs(st.vel) <= 0.6) {
            // magnetizare lină la cel mai apropiat cadru
            st.target = Math.round(st.pos);
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

  const base = Math.floor(pos);
  const frac = pos - base;
  const a = wrap(base);
  const b = wrap(base + 1);
  const ready = loaded >= n;

  return (
    <div
      className="relative aspect-[4/3] cursor-grab touch-pan-y select-none overflow-hidden bg-surface-strong active:cursor-grabbing"
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
        const width = e.currentTarget.clientWidth;
        const perFrame = (width / Math.max(n, 4)) * 0.9;
        st.pos = st.startPos + (st.startX - e.clientX) / perFrame;
        const now = performance.now();
        const dt = (now - st.lastT) / 1000;
        if (dt > 0) {
          const inst = (st.lastX - e.clientX) / perFrame / dt;
          st.vel = st.vel * 0.6 + inst * 0.4;
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
        if (performance.now() - st.lastT > 80) st.vel = 0;
        st.vel = Math.max(-12, Math.min(12, st.vel));
        if (Math.abs(st.vel) <= 0.6) {
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
      <img
        src={photoUrl(images[a]!)}
        alt={alt}
        width={1200}
        height={900}
        fetchPriority="high"
        decoding="async"
        draggable={false}
        className="absolute inset-0 size-full object-cover"
      />
      {n > 1 && frac > 0.001 && (
        <img
          src={photoUrl(images[b]!)}
          alt=""
          aria-hidden
          width={1200}
          height={900}
          decoding="async"
          draggable={false}
          className="absolute inset-0 size-full object-cover"
          style={{ opacity: frac }}
        />
      )}

      <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-background/85 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary backdrop-blur">
        <RotateCw className="size-3.5" /> 360°
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

      {n > 1 && !ready && (
        <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/85 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          Se încarcă {Math.min(loaded, n)}/{n} cadre…
        </span>
      )}

      {n > 1 && ready && !hinted && (
        <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/85 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          ← Trage pentru a roti mașina →
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
