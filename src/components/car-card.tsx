import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Fuel, Gauge, Settings2, Calendar, RotateCw } from "lucide-react";

import type { Car } from "@/lib/cars.server";
import { formatKm, formatPrice, photoUrl } from "@/lib/site";
import { spinFor } from "@/lib/spin360";
import { Spin360 } from "@/components/spin-360";
import { RatingSummary } from "@/components/car-rating";

const ease = (t: number) => t * t * (3 - 2 * t); // smoothstep

export function CarCard({ car }: { car: Car }) {
  const hasSpin = !!spinFor(car.slug);
  const n = hasSpin ? 0 : car.images.length;
  const [pos, setPos] = useState(0);
  const [active, setActive] = useState(false); // montează toate cadrele după prima interacțiune
  const boxRef = useRef<HTMLDivElement>(null);
  const spinMoved = useRef(false);
  const [inView, setInView] = useState(false);

  // download the 360° frames only when the card is near the screen
  useEffect(() => {
    if (!hasSpin || inView || !boxRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setInView(true);
      },
      { rootMargin: "200px" },
    );
    io.observe(boxRef.current);
    return () => io.disconnect();
  }, [hasSpin, inView]);
  const s = useRef({
    pos: 0,
    vel: 0,
    target: null as number | null,
    dragging: false,
    hover: false,
    startX: 0,
    startPos: 0,
    lastX: 0,
    lastT: 0,
    moved: false,
  });

  // bucla de animație: inerție, aliniere lină pe cadru, rotire lină la hover
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
        if (st.hover) {
          st.target = null;
          st.vel += (0.7 - st.vel) * Math.min(1, dt * 2.5);
          st.pos += st.vel * dt;
          changed = true;
        } else if (st.target !== null) {
          const d = st.target - st.pos;
          if (Math.abs(d) < 0.001) {
            st.pos = st.target;
            st.target = null;
          } else st.pos += d * Math.min(1, dt * 8);
          changed = true;
        } else if (Math.abs(st.vel) > 0.01) {
          st.pos += st.vel * dt;
          st.vel *= Math.pow(0.08, dt);
          changed = true;
          if (Math.abs(st.vel) < 0.4) {
            st.target = Math.round(st.pos + st.vel * 0.25);
            st.vel = 0;
          }
        }
      }
      if (changed) setPos(st.pos);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [n]);

  const pxPerFrame = () => Math.max(110, (boxRef.current?.clientWidth ?? 300) * 0.55);

  const onDown = (e: React.PointerEvent) => {
    if (n < 2) return;
    const st = s.current;
    setActive(true);
    st.dragging = true;
    st.hover = false;
    st.target = null;
    st.vel = 0;
    st.moved = false;
    st.startX = st.lastX = e.clientX;
    st.startPos = st.pos;
    st.lastT = performance.now();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const st = s.current;
    if (!st.dragging) return;
    const ppf = pxPerFrame();
    if (Math.abs(e.clientX - st.startX) > 6) st.moved = true;
    st.pos = st.startPos + (st.startX - e.clientX) / ppf;
    const now = performance.now();
    const dt = (now - st.lastT) / 1000;
    if (dt > 0) st.vel = st.vel * 0.5 + ((st.lastX - e.clientX) / ppf / dt) * 0.5;
    st.lastX = e.clientX;
    st.lastT = now;
    setPos(st.pos);
  };
  const onUp = () => {
    const st = s.current;
    if (!st.dragging) return;
    st.dragging = false;
    if (performance.now() - st.lastT > 90) st.vel = 0;
    st.vel = Math.max(-5, Math.min(5, st.vel));
    if (Math.abs(st.vel) < 0.4) {
      st.vel = 0;
      st.target = Math.round(st.pos);
    }
  };

  const title = `${car.make} ${car.model}${car.trim ? ` ${car.trim}` : ""}`;
  const wrap = (i: number) => ((i % n) + n) % n;
  const base = Math.floor(pos);
  const t = ease(pos - base);
  const i0 = n ? wrap(base) : 0;
  const i1 = n ? wrap(base + 1) : 0;
  const altText = `${title} de vânzare la Bremen Auto, DN1 Florești, Cluj`;

  const layer = (i: number) => {
    if (n < 2 || !active) return i === 0 ? { opacity: 1, transform: "none", z: 1 } : null;
    if (i === i0)
      return {
        opacity: 1,
        transform: `translateX(${-t * 7}%) rotateY(${-t * 14}deg) scale(1.12)`,
        z: 1,
      };
    if (i === i1)
      return {
        opacity: t,
        transform: `translateX(${(1 - t) * 7}%) rotateY(${(1 - t) * 14}deg) scale(1.12)`,
        z: 2,
      };
    return { opacity: 0, transform: "scale(1.12)", z: 0 };
  };

  return (
    <Link
      to="/masini/$slug"
      params={{ slug: car.slug }}
      onMouseEnter={() => {
        if (n > 1) {
          setActive(true);
          s.current.hover = true;
        }
      }}
      onMouseLeave={() => {
        const st = s.current;
        st.hover = false;
        st.target = Math.round(st.pos + st.vel * 0.25);
        st.vel = 0;
      }}
      onClick={(e) => {
        if (s.current.moved || spinMoved.current) {
          e.preventDefault();
          s.current.moved = false;
          spinMoved.current = false;
        }
      }}
      draggable={false}
      className="group surface-card flex flex-col overflow-hidden rounded-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/50"
    >
      {hasSpin ? (
        <div ref={boxRef} className="relative aspect-[4/3]">
          <Spin360
            slug={car.slug}
            size="sm"
            alt={altText}
            movedRef={spinMoved}
            load={inView}
            hoverSpin
            className="size-full"
          />
          <span className="pointer-events-none absolute bottom-3 right-3 z-10 inline-flex items-center gap-1 rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary backdrop-blur">
            <RotateCw className="size-3" /> Trage 360°
          </span>
          {car.status !== "disponibila" && (
            <span className="absolute left-3 top-3 z-10 rounded-md bg-background/90 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              {car.status === "rezervata" ? "Rezervată" : "Vândută"}
            </span>
          )}
        </div>
      ) : (
      <div
        ref={boxRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        style={{ touchAction: "pan-y", perspective: "900px" }}
        className={`relative aspect-[4/3] select-none overflow-hidden bg-surface-strong ${n > 1 ? "cursor-grab active:cursor-grabbing" : ""}`}
      >
        {n > 0 ? (
          car.images.map((src, i) => {
            const l = layer(i);
            if (!l) return null;
            return (
              <img
                key={i}
                src={photoUrl(src)}
                alt={i === 0 ? altText : ""}
                aria-hidden={i === 0 ? undefined : true}
                loading={i === 0 ? "lazy" : "eager"}
                decoding="async"
                width={800}
                height={600}
                draggable={false}
                className="absolute inset-0 size-full select-none object-cover will-change-transform"
                style={{ opacity: l.opacity, transform: l.transform, zIndex: l.z }}
              />
            );
          })
        ) : (
          <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
            Fotografii în curând
          </div>
        )}
        {n > 1 && (
          <span className="pointer-events-none absolute bottom-3 right-3 z-10 inline-flex items-center gap-1 rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary backdrop-blur">
            <RotateCw className="size-3" /> Trage 360°
          </span>
        )}
        {n > 1 && active && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-0.5 bg-background/30">
            <div
              className="h-full bg-primary"
              style={{ width: `${(((pos % n) + n) % n) / n * 100 + 100 / n}%` }}
            />
          </div>
        )}
        {car.status !== "disponibila" && (
          <span className="absolute left-3 top-3 z-10 rounded-md bg-background/90 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            {car.status === "rezervata" ? "Rezervată" : "Vândută"}
          </span>
        )}
      </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg leading-tight">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {car.year} · {formatKm(car.mileage_km)}
        </p>
        <RatingSummary
          average={Number(car.rating_average)}
          count={car.rating_count}
          className="mt-3"
        />

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Fuel className="size-3.5 text-primary" /> {car.fuel}
          </span>
          <span className="flex items-center gap-1.5">
            <Settings2 className="size-3.5 text-primary" /> {car.gearbox}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="size-3.5 text-primary" /> {car.year}
          </span>
          <span className="flex items-center gap-1.5">
            <Gauge className="size-3.5 text-primary" /> {car.power_hp ? `${car.power_hp} CP` : "—"}
          </span>
        </div>

        <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
          <div>
            <span className="block font-display text-2xl font-extrabold text-primary">
              {formatPrice(Number(car.price), car.currency)}
            </span>
            <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
              Cash · în rate
            </span>
          </div>
          <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
            Vezi detalii →
          </span>
        </div>
      </div>
    </Link>
  );
}
