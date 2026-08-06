import { Link } from "@tanstack/react-router";
import { Fuel, Gauge, Settings2, Calendar } from "lucide-react";

import type { Car } from "@/lib/cars.server";
import { formatKm, formatPrice, photoUrl } from "@/lib/site";

export function CarCard({ car }: { car: Car }) {
  const cover = car.images[0];
  const title = `${car.make} ${car.model}${car.trim ? ` ${car.trim}` : ""}`;

  return (
    <Link
      to="/masini/$slug"
      params={{ slug: car.slug }}
      className="group surface-card flex flex-col overflow-hidden rounded-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/50"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-strong">
        {cover ? (
          <img
            src={photoUrl(cover)}
            alt={`${title} de vânzare la Bremen Auto, DN1 Florești, Cluj`}
            loading="lazy"
            decoding="async"
            width={800}
            height={600}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

        ) : (
          <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
            Fotografii în curând
          </div>
        )}
        {car.status !== "disponibila" && (
          <span className="absolute left-3 top-3 rounded-md bg-background/90 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            {car.status === "rezervata" ? "Rezervată" : "Vândută"}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg leading-tight">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {car.year} · {formatKm(car.mileage_km)}
        </p>

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
