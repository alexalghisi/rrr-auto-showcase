import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { CarCard } from "@/components/car-card";
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

const carsQuery = queryOptions({
  queryKey: ["cars", "public"],
  queryFn: () => listPublicCars(),
});

const TITLE = "Stoc mașini second hand Cluj | Auto rulate Bremen Auto Gilău";
const DESCRIPTION =
  "Toate mașinile second hand disponibile la Bremen Auto Gilău, lângă Cluj-Napoca: an, kilometraj, motorizare și preț. Autoturisme rulate din Germania, verificate.";

export const Route = createFileRoute("/stoc")({
  loader: ({ context }) => context.queryClient.ensureQueryData(carsQuery),
  head: ({ loaderData }) => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/stoc" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "/stoc" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbSchema([
            { name: "Acasă", path: "/" },
            { name: "Stoc mașini", path: "/stoc" },
          ]),
        ),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Stoc mașini second hand Bremen Auto Gilău",
          numberOfItems: (loaderData ?? []).length,
          itemListElement: (loaderData ?? []).map((car, index: number) => ({
            "@type": "ListItem",
            position: index + 1,
            url: `/masini/${car.slug}`,
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
      <p className="eyebrow">Parc auto Gilău</p>
      <h1 className="mt-2 text-4xl sm:text-5xl">Mașini second hand în stoc</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        {cars.length} autoturisme rulate disponibile la {SITE.name}. Toate pot fi văzute și testate
        în parcul din Gilău, județul Cluj.
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
          {filtered.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}
    </div>
  );
}
