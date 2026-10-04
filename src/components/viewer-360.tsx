import { useEffect, useRef, useState } from "react";
import { RotateCw, Play, Pause } from "lucide-react";

import { photoUrl } from "@/lib/site";

/**
 * Simulare 360° din fotografiile mașinii: tragi cu degetul/mouse-ul
 * stânga-dreapta și mașina "se rotește" prin poze; are și rotire automată.
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
  const [playing, setPlaying] = useState(false);
  const [hinted, setHinted] = useState(false);
  const drag = useRef<{ x: number; start: number } | null>(null);
  const indexRef = useRef(index);
  indexRef.current = index;
  const n = images.length;

  // preîncarcă toate pozele pentru rotire fluidă
  useEffect(() => {
    images.forEach((src) => {
      const im = new Image();
      im.src = photoUrl(src);
    });
  }, [images]);

  useEffect(() => {
    if (!playing || n < 2) return;
    const t = setInterval(() => onIndexChange((indexRef.current + 1) % n), 450);
    return () => clearInterval(t);
  }, [playing, n, onIndexChange]);

  const wrap = (i: number) => ((i % n) + n) % n;

  return (
    <div
      className="relative aspect-[4/3] cursor-grab touch-pan-y select-none overflow-hidden bg-surface-strong active:cursor-grabbing"
      onPointerDown={(e) => {
        setPlaying(false);
        setHinted(true);
        drag.current = { x: e.clientX, start: indexRef.current };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!drag.current) return;
        const step = e.currentTarget.clientWidth / Math.max(n, 6);
        const delta = Math.round((drag.current.x - e.clientX) / step);
        const next = wrap(drag.current.start + delta);
        if (next !== indexRef.current) onIndexChange(next);
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
    >
      <img
        src={photoUrl(images[index]!)}
        alt={alt}
        width={1200}
        height={900}
        fetchPriority="high"
        decoding="async"
        draggable={false}
        className="size-full object-cover"
      />

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

      {n > 1 && !hinted && (
        <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/85 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          ← Trage pentru a roti mașina →
        </span>
      )}

      {n > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-background/40">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((index + 1) / n) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}
