import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Phone, MapPin, Check, ArrowLeft, HandCoins } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ReserveDialog } from "@/components/reserve-dialog";
import { FinanceCalculator } from "@/components/finance-calculator";

import { getPublicCar } from "@/lib/cars.functions";
import { SITE, absolutePhotoUrl, formatKm, formatPrice, photoUrl } from "@/lib/site";
import { breadcrumbSchema, dealerSchema, ORG_ID } from "@/lib/seo";
import { LANDING_PAGES, type LandingPage } from "@/lib/landing-pages";

export const Route = createFileRoute("/masini/$slug")({
  loader: async ({ params }) => {
    const car = await getPublicCar({ data: { slug: params.slug } });
    // Anunț retras/vândut și depublicat: redirect permanent spre stoc,
    // ca să nu pierdem semnalele SEO pe un 404 gol.
    if (!car) throw redirect({ to: "/stoc", statusCode: 301 });
    return car;
  },

  head: ({ loaderData, params }) => {
    if (!loaderData) return {};
    const car = loaderData;
    const clamp = (value: string, max: number) =>
      value.length <= max ? value : `${value.slice(0, max - 1).trimEnd()}…`;
    const name = `${car.make} ${car.model}${car.trim ? ` ${car.trim}` : ""} ${car.year}`;
    const suffix = " | Bremen Auto Cluj";
    const title = `${clamp(name, 59 - suffix.length)}${suffix}`;
    const description = clamp(
      `${name} — ${formatKm(car.mileage_km)}, ${car.fuel}, ${car.gearbox}${car.power_hp ? `, ${car.power_hp} CP` : ""}, ${formatPrice(Number(car.price), car.currency)}. Adusă din Germania, verificată, acte la zi. Vezi-o pe DN1, Luna de Sus (Florești), lângă Cluj-Napoca.`,
      158,
    );
    const cover = car.images?.[0] ? absolutePhotoUrl(car.images[0]) : null;
    const url = `https://bremenauto.ro/masini/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { property: "og:locale", content: "ro_RO" },
        { property: "og:site_name", content: "Bremen Auto" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        ...(cover
          ? [
              { property: "og:image", content: cover },
              { property: "og:image:alt", content: `${name} de vânzare la Bremen Auto, DN1 Florești, Cluj` },
              { name: "twitter:image", content: cover },
            ]
          : []),
      ],
      links: [{ rel: "canonical", href: url }],

      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Car",
            name: `${car.make} ${car.model} ${car.year}`,
            description,
            url,
            image: (car.images ?? []).slice(0, 6).map((p: string) => absolutePhotoUrl(p)),
            brand: { "@type": "Brand", name: car.make },
            model: car.model,
            vehicleModelDate: String(car.year),
            productionDate: String(car.year),
            itemCondition: "https://schema.org/UsedCondition",
            mileageFromOdometer: {
              "@type": "QuantitativeValue",
              value: car.mileage_km,
              unitCode: "KMT",
            },
            fuelType: car.fuel,
            vehicleTransmission: car.gearbox,
            ...(car.body_type ? { bodyType: car.body_type } : {}),
            ...(car.color ? { color: car.color } : {}),
            ...(car.doors ? { numberOfDoors: car.doors } : {}),
            ...(car.drivetrain ? { driveWheelConfiguration: car.drivetrain } : {}),
            ...(car.power_hp
              ? {
                  vehicleEngine: {
                    "@type": "EngineSpecification",
                    enginePower: { "@type": "QuantitativeValue", value: car.power_hp, unitCode: "BHP" },
                    ...(car.engine_cc
                      ? {
                          engineDisplacement: {
                            "@type": "QuantitativeValue",
                            value: car.engine_cc,
                            unitCode: "CMQ",
                          },
                        }
                      : {}),
                  },
                }
              : {}),
            offers: {
              "@type": "Offer",
              price: Number(car.price),
              priceCurrency: car.currency,
              itemCondition: "https://schema.org/UsedCondition",
              availability:
                car.status === "vanduta"
                  ? "https://schema.org/SoldOut"
                  : "https://schema.org/InStock",
              seller: { "@id": ORG_ID },
            },
          }),
        },
        { type: "application/ld+json", children: JSON.stringify(dealerSchema) },
        {
          type: "application/ld+json",
          children: JSON.stringify(
            breadcrumbSchema([
              { name: "Acasă", path: "https://bremenauto.ro/" },
              { name: "Stoc mașini", path: "https://bremenauto.ro/stoc" },
              { name: `${car.make} ${car.model} ${car.year}`, path: url },
            ]),
          ),
        },
      ],
    };
  },
  component: CarPage,
});

function CarPage() {
  const car = Route.useLoaderData();
  const [active, setActive] = useState(0);
  const title = `${car.make} ${car.model}${car.trim ? ` ${car.trim}` : ""}`;
  const related = LANDING_PAGES.filter((p) => p.match(car)).slice(0, 8);

  const specs = [
    ["An fabricație", String(car.year)],
    ["Kilometraj", formatKm(car.mileage_km)],
    ["Combustibil", car.fuel],
    ["Cutie de viteze", car.gearbox],
    ["Putere", car.power_hp ? `${car.power_hp} CP` : "—"],
    ["Capacitate cilindrică", car.engine_cc ? `${car.engine_cc} cm³` : "—"],
    ["Caroserie", car.body_type ?? "—"],
    ["Tracțiune", car.drivetrain ?? "—"],
    ["Culoare", car.color ?? "—"],
    ["Număr portiere", car.doors ? String(car.doors) : "—"],
  ] as const;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Acasă
        </Link>
        <span>/</span>
        <Link to="/stoc" className="inline-flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="size-3.5" /> Stoc mașini
        </Link>
        <span>/</span>
        <span className="text-foreground">
          {title} {car.year}
        </span>
      </nav>


      <div className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="surface-card overflow-hidden rounded-xl">
            <div className="aspect-[4/3] bg-surface-strong">
              {car.images[active] ? (
                <img
                  src={photoUrl(car.images[active]!)}
                  alt={`${title} ${car.year} de vânzare la Bremen Auto, DN1 Luna de Sus, Florești, Cluj`}
                  width={1200}
                  height={900}
                  fetchPriority="high"
                  decoding="async"
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-muted-foreground">
                  Fotografii în curând
                </div>
              )}
            </div>
          </div>

          {car.images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {car.images.map((img: string, i: number) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`aspect-[4/3] overflow-hidden rounded-md border transition-colors ${
                    i === active ? "border-primary" : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <img
                    src={photoUrl(img)}
                    alt={`${title} — fotografia ${i + 1}`}
                    loading="lazy"
                    decoding="async"
                    width={320}
                    height={240}
                    className="size-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {car.description && (
            <section className="mt-10">
              <h2 className="text-2xl">Descriere</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {car.description}
              </p>
            </section>
          )}

          {car.features.length > 0 && (
            <section className="mt-10">
              <h2 className="text-2xl">Dotări</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {car.features.map((f: string) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="size-4 shrink-0 text-primary" /> {f}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="surface-card rounded-xl p-6">
            <h1 className="text-2xl leading-tight sm:text-3xl">
              {title} {car.year} second hand Cluj — Bremen Auto
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {car.year} · {formatKm(car.mileage_km)} · {car.fuel}
            </p>
            <p className="mt-5 font-display text-4xl font-extrabold text-primary">
              {formatPrice(Number(car.price), car.currency)}
            </p>
            <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
              <HandCoins className="size-4" /> Cash sau în rate — credit auto & leasing
            </p>
            {car.status !== "disponibila" && (
              <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {car.status === "rezervata" ? "Rezervată" : "Vândută"}
              </p>
            )}

            <div className="mt-6 flex flex-col gap-2">
              <Button asChild size="lg">
                <a href={SITE.phoneHref}>
                  <Phone className="size-4" /> {SITE.phone}
                </a>
              </Button>
              {car.status === "disponibila" && (
                <ReserveDialog
                  carSlug={car.slug}
                  carTitle={title}
                  price={formatPrice(Number(car.price), car.currency)}
                />
              )}
              <Button asChild size="lg" variant="outline">
                <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">
                  Scrie pe WhatsApp
                </a>
              </Button>
            </div>


            <p className="mt-5 flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" /> {SITE.addressLine}
            </p>
          </div>

          <div className="surface-card mt-6 rounded-xl p-6">
            <h2 className="text-lg">Specificații</h2>
            <dl className="mt-4 divide-y divide-border text-sm">
              {specs.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-2.5">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-6">
            <FinanceCalculator
              price={Number(car.price)}
              carSlug={car.slug}
              carTitle={title}
            />
          </div>
        </aside>

      </div>

      <section className="mt-14 border-t border-border pt-10">
        <h2 className="text-2xl">Categorii înrudite cu {title}</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Vezi și alte mașini second hand din aceeași categorie, buget sau zonă de livrare.
        </p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {related.map((page: LandingPage) => (
            <li key={page.slug}>
              <Link
                to="/$landing"
                params={{ landing: page.slug }}
                className="surface-card inline-block rounded-full px-4 py-2 text-sm transition-colors hover:border-primary"
              >
                {page.h1}
              </Link>
            </li>
          ))}
        </ul>
        <h3 className="mt-8 text-lg">Navighează mai departe</h3>
        <ul className="mt-3 flex flex-wrap gap-4 text-sm">
          <li>
            <Link to="/stoc" className="text-primary underline-offset-4 hover:underline">
              Tot stocul de mașini second hand
            </Link>
          </li>
          <li>
            <Link to="/categorii" className="text-primary underline-offset-4 hover:underline">
              Toate categoriile
            </Link>
          </li>
          <li>
            <Link to="/blog" className="text-primary underline-offset-4 hover:underline">
              Ghid cumpărare mașini second hand
            </Link>
          </li>
          <li>
            <Link to="/" className="text-primary underline-offset-4 hover:underline">
              Bremen Auto — prima pagină
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}

