import { useEffect, useRef, useState } from "react";
import { RotateCw, Hand } from "lucide-react";
import { spinFor } from "@/lib/spin360";
import { loadSpinFrames } from "@/lib/spin-frames";
import { coastTurn, followTurn, frameAt } from "@/lib/spin-motion";

type Props = {
  slug: string;
  size?: "lg" | "sm";
  alt: string;
  autoRotate?: boolean;
  movedRef?: React.MutableRefObject<boolean>;
  load?: boolean;
  hoverSpin?: boolean;
  className?: string;
};

export function Spin360(props: Props) {
  const spin = spinFor(props.slug, props.size ?? "lg");
  if (!spin) return null;
  // Key resets all gesture/loading state when navigating between cars.
  return <SpinSequence key={`${props.slug}:${props.size ?? "lg"}`} {...props} />;
}

function SpinSequence({ slug, size = "lg", alt, autoRotate = false, movedRef,
  load = true, hoverSpin = false, className = "" }: Props) {
  const spin = spinFor(slug, size);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const frames = useRef<HTMLImageElement[]>([]);
  const wake = useRef<() => void>(() => {});
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [touched, setTouched] = useState(false);
  const st = useRef({ position: 0, target: 0, velocity: 0, dragging: false,
    pointer: null as number | null, hover: false, auto: autoRotate, visible: false,
    reduced: false, startX: 0, startTarget: 0, lastX: 0, lastTime: 0,
    width: 0, height: 0, drawn: -1 });

  useEffect(() => {
    if (!load) return;
    let cancelled = false;
    let upgraded = false;
    const publish = (list: SpinFrame[]) => {
      frames.current = list;
      st.current.drawn = -1;
      setReady(true);
      setFailed(false);
      wake.current();
    };
    // The small sequence is the same orbit: it is ready fast (one file, often cached
    // from the card) and keeps mobile memory bounded. Desktop upgrades to large frames.
    const upgrade = size === "lg" && !window.matchMedia("(max-width: 767px)").matches;
    loadSpinFrames(slug, "sm").then((sequence) => {
      if (cancelled || upgraded) return;
      if (sequence.complete) publish(sequence.frames);
      else if (!upgrade) setFailed(true);
    });
    if (upgrade) {
      loadSpinFrames(slug, "lg").then((sequence) => {
        if (cancelled) return;
        if (sequence.complete) { upgraded = true; publish(sequence.frames); }
        else if (!frames.current.length) setFailed(true);
      });
    }
    return () => { cancelled = true; };
  }, [slug, size, load]);

  useEffect(() => {
    const box = boxRef.current;
    const canvas = canvasRef.current;
    if (!box || !canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    let raf = 0;
    let previous = 0;
    let disposed = false;
    const state = st.current;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    state.reduced = media.matches;
    const active = () => state.visible && !document.hidden;
    const tick = (now: number) => {
      raf = 0;
      if (!active() || disposed) { previous = 0; return; }
      const delta = previous ? Math.min(0.05, (now - previous) / 1000) : 1 / 60;
      previous = now;
      const list = frames.current;
      if (!list.length) return;
      if (state.dragging || Math.abs(state.target - state.position) > 0.0001) {
        state.position = followTurn(state.position, state.target, delta);
      } else if (!state.reduced && (state.hover || state.auto)) {
        const goal = state.hover ? 0.085 : 0.045;
        state.velocity += (goal - state.velocity) * (1 - Math.exp(-3 * delta));
        state.position += state.velocity * delta;
        state.target = state.position;
      } else {
        const coast = coastTurn(state.position, state.velocity, delta);
        state.position = coast.position;
        state.velocity = Math.abs(coast.velocity) < 0.001 ? 0 : coast.velocity;
        state.target = state.position;
      }
      const index = frameAt(state.position, list.length);
      const image = list[index];
      if (image && state.drawn !== index && canvas.width && canvas.height) {
        const ratio = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
        const width = image.naturalWidth * ratio, height = image.naturalHeight * ratio;
        ctx.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
        state.drawn = index;
        canvas.dataset["frame"] = String(index);
      }
      if (state.dragging || Math.abs(state.target - state.position) > 0.0001 || state.velocity ||
        (!state.reduced && (state.hover || state.auto))) raf = requestAnimationFrame(tick);
      else previous = 0;
    };
    const start = () => { if (!raf && active() && !disposed) raf = requestAnimationFrame(tick); };
    wake.current = start;
    const resize = new ResizeObserver(([entry]) => {
      if (!entry) return;
      state.width = entry.contentRect.width;
      state.height = entry.contentRect.height;
      // Do not upscale 480/854px frames into huge retina canvases.
      const dpr = Math.min(window.devicePixelRatio || 1, size === "sm" ? 1 : 1.5);
      const scale = Math.min(dpr, (size === "sm" ? 480 : 854) / Math.max(1, state.width));
      canvas.width = Math.max(1, Math.round(state.width * scale));
      canvas.height = Math.max(1, Math.round(state.height * scale));
      state.drawn = -1;
      start();
    });
    resize.observe(box);
    const observer = new IntersectionObserver(([entry]) => {
      state.visible = !!entry?.isIntersecting;
      if (state.visible) start();
      else { cancelAnimationFrame(raf); raf = 0; previous = 0; }
    });
    observer.observe(box);
    const visibility = () => {
      previous = 0;
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
      else start();
    };
    const reduced = () => { state.reduced = media.matches; start(); };
    document.addEventListener("visibilitychange", visibility);
    media.addEventListener("change", reduced);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      resize.disconnect(); observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      media.removeEventListener("change", reduced);
      wake.current = () => {};
    };
  }, [size]);

  const onDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!ready || !event.isPrimary || event.button !== 0) return;
    const state = st.current;
    state.dragging = true; state.pointer = event.pointerId;
    state.auto = false; state.hover = false; state.velocity = 0;
    state.startX = state.lastX = event.clientX;
    state.target = state.position; state.startTarget = state.position;
    state.lastTime = performance.now();
    if (movedRef) movedRef.current = false;
    setTouched(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    wake.current();
  };
  const onMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = st.current;
    if (!state.dragging || state.pointer !== event.pointerId) return;
    const pixelsPerTurn = Math.max(1, state.width) * 1.6;
    if (movedRef && Math.abs(event.clientX - state.startX) > 6) movedRef.current = true;
    state.target = state.startTarget + (state.startX - event.clientX) / pixelsPerTurn;
    const now = performance.now(), delta = (now - state.lastTime) / 1000;
    if (delta > 0.004) {
      const measured = Math.max(-0.35, Math.min(0.35, (state.lastX - event.clientX) / pixelsPerTurn / delta));
      state.velocity += (measured - state.velocity) * (1 - Math.exp(-18 * delta));
    }
    state.lastX = event.clientX; state.lastTime = now;
    wake.current();
  };
  const onUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = st.current;
    if (state.pointer !== event.pointerId) return;
    state.dragging = false; state.pointer = null;
    if (event.type !== "pointerup" || performance.now() - state.lastTime > 100) state.velocity = 0;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    wake.current();
  };

  if (!spin) return null;
  return (
    <div ref={boxRef} data-spin={slug} data-ready={ready} data-failed={failed}
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp}
      onPointerCancel={onUp} onLostPointerCapture={onUp}
      onMouseEnter={() => { if (hoverSpin && !st.current.dragging) { st.current.hover = true; wake.current(); } }}
      onMouseLeave={() => { st.current.hover = false; wake.current(); }}
      style={{ touchAction: "pan-y" }}
      className={`relative select-none overflow-hidden bg-surface-strong ${ready ? "cursor-grab active:cursor-grabbing" : "cursor-progress"} ${className}`}>
      <img src={spin.url(0)} alt={alt} width={size === "lg" ? 854 : 480} height={size === "lg" ? 480 : 270}
        decoding="async" draggable={false} className="absolute inset-0 size-full object-cover" />
      <canvas ref={canvasRef} aria-hidden className={`absolute inset-0 size-full ${ready ? "visible" : "invisible"}`} />
      {size === "lg" && <>
        <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary shadow-sm">
          <RotateCw className="size-3.5" /> 360°
        </span>
        {!touched && ready && <span className="pointer-events-none absolute inset-x-0 bottom-10 mx-auto flex w-fit items-center gap-2 rounded-full bg-foreground/75 px-4 py-2 text-sm font-semibold text-background">
          <Hand className="size-4" /> Trage stânga–dreapta ca să rotești mașina
        </span>}
      </>}
      <span className={`pointer-events-none absolute rounded bg-background/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground ${size === "lg" ? "bottom-2 right-2" : "left-2 top-2"}`}>
        {size === "lg" ? "Simulare AI · pozele reale sunt mai jos" : "Simulare AI"}
      </span>
      {load && !ready && <span role="status" className="pointer-events-none absolute bottom-2 left-2 rounded bg-background/90 px-2 py-1 text-xs text-muted-foreground">
        {failed ? "Rotirea nu s-a încărcat" : "Se încarcă rotirea…"}
      </span>}
    </div>
  );
}
