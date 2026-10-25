import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Fragment, useMemo, useState } from "react";

import { CarCard } from "@/components/car-card";
import { AdsterraSlot } from "@/components/ad-slots";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listPublicCars } from "@/lib/cars.functions";
import { SITE } from "@/lib/site";
import { breadcrumbSchema } from "@/lib/seo";
import { LANDING_PAGES } from "@/lib/landing-pages";
import { inlineAdIndex } from "@/lib/ad-placements";

const carsQuery = queryOptions({
  queryKey: ["cars", "public"],
  queryFn: () => listPublicCars(),
});

const TITLE = "Stoc mașini second hand Cluj | Bremen Auto Florești";
const DESCRIPTION =
  "Stoc actualizat de mașini second hand la Bremen Auto, DN1 Luna de Sus lângă Cluj-Napoca: an, kilometraj, motorizare și preț. Auto rulate din Germania.";

export const Route = createFileRoute("/stoc")({
  loader: ({ context }) => context.queryClient.ensureQueryData(carsQuery),
  head: ({ loaderData }) => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE.name },
      { property: "og:locale", content: "ro_RO" },
      { property: "og:url", content: "https://bremenauto.ro/stoc" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "https://bremenauto.ro/stoc" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbSchema([
            { name: "Acasă", path: "https://bremenauto.ro/" },
            { name: "Stoc mașini", path: "https://bremenauto.ro/stoc" },
          ]),
        ),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Stoc mașini second hand Bremen Auto Florești, Cluj",
          numberOfItems: (loaderData ?? []).length,
          itemListElement: (loaderData ?? []).map((car, index: number) => ({
            "@type": "ListItem",
            position: index + 1,
            url: `https://bremenauto.ro/masini/${car.slug}`,
            name: `${car.make} ${car.model} ${car.year}`,
          })),
        }),
      },
    ],
  }),
  component: StockPage,
});

function StockPage() {
  const { data: cars } = useSuspenseQuery(carsQuery);
  const [search, setSearch] = useState("");
  const [make, setMake] = useState("toate");
  const [fuel, setFuel] = useState("toate");
  const [sort, setSort] = useState("recente");

  const makes = useMemo(
    () => Array.from(new Set(cars.map((c) => c.make))).sort((a, b) => a.localeCompare(b)),
    [cars],
  );
  const fuels = useMemo(
    () => Array.from(new Set(cars.map((c) => c.fuel))).sort((a, b) => a.localeCompare(b)),
    [cars],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const result = cars.filter((c) => {
      const haystack = `${c.make} ${c.model} ${c.trim ?? ""} ${c.year}`.toLowerCase();
      return (
        (!q || haystack.includes(q)) &&
        (make === "toate" || c.make === make) &&
        (fuel === "toate" || c.fuel === fuel)
      );
    });
    const sorted = [...result];
    if (sort === "pret-cresc") sorted.sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === "pret-desc") sorted.sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === "km") sorted.sort((a, b) => a.mileage_km - b.mileage_km);
    if (sort === "an") sorted.sort((a, b) => b.year - a.year);
    return sorted;
  }, [cars, search, make, fuel, sort]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <p className="eyebrow">Parc auto Florești · DN1</p>
      <h1 className="mt-2 text-4xl sm:text-5xl">Mașini second hand în stoc</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        {cars.length} autoturisme rulate disponibile la {SITE.name}. Toate pot fi văzute și testate
        în parcul de pe DN1, Luna de Sus, comuna Florești, județul Cluj.
      </p>

      <div className="surface-card mt-8 grid gap-3 rounded-xl p-4 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          placeholder="Caută marcă sau model..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Caută mașină"
        />
        <Select value={make} onValueChange={setMake}>
          <SelectTrigger aria-label="Marcă">
            <SelectValue placeholder="Marcă" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="toate">Toate mărcile</SelectItem>
            {makes.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={fuel} onValueChange={setFuel}>
          <SelectTrigger aria-label="Combustibil">
            <SelectValue placeholder="Combustibil" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="toate">Orice combustibil</SelectItem>
            {fuels.map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger aria-label="Sortare">
            <SelectValue placeholder="Sortare" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recente">Cele mai recente</SelectItem>
            <SelectItem value="pret-cresc">Preț crescător</SelectItem>
            <SelectItem value="pret-desc">Preț descrescător</SelectItem>
            <SelectItem value="km">Kilometraj</SelectItem>
            <SelectItem value="an">An fabricație</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="surface-card mt-8 rounded-xl p-12 text-center">
          <p className="text-muted-foreground">
            Nicio mașină nu corespunde filtrelor. Sună la {SITE.phone} — găsim modelul dorit la
            comandă.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((car, i) => (
            <Fragment key={car.id}>
              <CarCard car={car} />
              {i === inlineAdIndex(filtered.length) && (
                <AdsterraSlot variant="native" className="sm:col-span-2 lg:col-span-3" />
              )}
            </Fragment>
          ))}
        </div>
      )}

      <section className="mt-16">
        <h2 className="text-2xl">Caută după model, buget sau finanțare</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {LANDING_PAGES.map((p) => (
            <li key={p.slug}>
              <Link
                to="/$landing"
                params={{ landing: p.slug }}
                className="inline-block rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
              >
                {p.h1}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
