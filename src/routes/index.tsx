import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ShieldCheck, FileCheck2, Wrench, HandCoins, Phone, MapPin, ArrowRight } from "lucide-react";

import heroImage from "@/assets/hero-bremen-auto.jpg";
import { CarCard } from "@/components/car-card";
import { Button } from "@/components/ui/button";
import { listPublicCars } from "@/lib/cars.functions";
import { SITE } from "@/lib/site";

const carsQuery = queryOptions({
  queryKey: ["cars", "public"],
  queryFn: () => listPublicCars(),
});

const TITLE = "Mașini second hand Cluj — Bremen Auto Gilău | Auto rulate din Germania";
const DESCRIPTION =
  "Bremen Auto Gilău, lângă Cluj-Napoca: mașini second hand aduse din Germania, verificate tehnic, cu carte service și acte complete. Vezi stocul actualizat și sună la 0751 692 335.";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(carsQuery),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content:
          "masini second hand Cluj, auto rulate Cluj-Napoca, masini din Germania, parc auto Gilau, dealer auto Cluj, Bremen Auto",
      },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "ro_RO" },
      { property: "og:url", content: "/" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AutoDealer",
          name: SITE.name,
          description: DESCRIPTION,
          telephone: "+40751692335",
          email: SITE.email,
          priceRange: "€€",
          areaServed: ["Cluj-Napoca", "Gilău", "Județul Cluj", "România"],
          address: {
            "@type": "PostalAddress",
            addressLocality: "Gilău",
            addressRegion: "Cluj",
            addressCountry: "RO",
          },
          sameAs: [SITE.facebook],
          openingHours: "Mo-Su 00:00-23:59",
        }),
      },
    ],
  }),
  component: HomePage,
});

const advantages = [
  {
    icon: ShieldCheck,
    title: "Istoric verificat",
    text: "Fiecare mașină vine cu istoric de kilometraj și verificare a daunelor înainte de a intra în parc.",
  },
  {
    icon: FileCheck2,
    title: "Acte complete",
    text: "Carte de identitate, factură și dosar de înmatriculare gata pregătit. Te înscrii în trafic fără bătăi de cap.",
  },
  {
    icon: Wrench,
    title: "Pregătite tehnic",
    text: "Revizie, consumabile și verificare în service partener înainte de livrare.",
  },
  {
    icon: HandCoins,
    title: "Preț corect, fără surprize",
    text: "Prețul afișat este prețul final negociabil. Acceptăm și mașina ta la schimb.",
  },
];

function HomePage() {
  const { data: cars } = useSuspenseQuery(carsQuery);
  const featured = cars.filter((c) => c.featured).slice(0, 6);
  const list = (featured.length ? featured : cars).slice(0, 6);

  return (
    <>
      <section className="relative overflow-hidden">
        <img
          src={heroImage}
          alt="Parc auto Bremen Auto din Gilău, județul Cluj, cu mașini rulate aduse din Germania"
          width={1920}
          height={1088}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6 sm:pb-28 sm:pt-32">
          <p className="eyebrow">Gilău · Cluj-Napoca · din Germania</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.05] sm:text-6xl">
            Mașini second hand în Cluj, alese cu grijă din{" "}
            <span className="text-gradient-primary">Germania</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {SITE.name} aduce autoturisme rulate cu istoric verificat, carte service și acte
            complete. Le vezi pe loc în parcul nostru din Gilău, la 15 minute de Cluj-Napoca.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/stoc">
                Vezi mașinile din stoc <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={SITE.phoneHref}>
                <Phone className="size-4" /> {SITE.phone}
              </a>
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" /> {SITE.addressLine}
            </span>
            <span>{SITE.hours}</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Stoc actual</p>
            <h2 className="mt-2 text-3xl sm:text-4xl">Mașini disponibile acum</h2>
          </div>
          <Button asChild variant="outline">
            <Link to="/stoc">Tot stocul</Link>
          </Button>
        </div>

        {list.length === 0 ? (
          <div className="surface-card mt-8 rounded-xl p-10 text-center">
            <p className="text-muted-foreground">
              Stocul se actualizează. Sună la {SITE.phone} și îți spunem ce mașini sunt pe drum.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="eyebrow">De ce Bremen Auto</p>
          <h2 className="mt-2 max-w-2xl text-3xl sm:text-4xl">
            Cumperi o mașină rulată, nu o problemă
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {advantages.map((a) => (
              <div key={a.title} className="rounded-xl border border-border bg-background p-6">
                <a.icon className="size-6 text-primary" />
                <h3 className="mt-4 text-lg">{a.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow">Cum funcționează</p>
            <h2 className="mt-2 text-3xl sm:text-4xl">Trei pași până la cheile mașinii</h2>
            <ol className="mt-8 space-y-6">
              {[
                {
                  t: "Alegi din stoc sau ne spui ce cauți",
                  d: "Dacă nu găsești modelul dorit în parc, îl căutăm noi în licitațiile și parcurile din Germania.",
                },
                {
                  t: "Vezi mașina și faci proba de drum",
                  d: "Te așteptăm în Gilău. Poți veni cu mecanicul tău sau mergem împreună la un service pentru verificare.",
                },
                {
                  t: "Semnezi actele și pleci cu ea",
                  d: "Pregătim tot dosarul de înmatriculare. Acceptăm plata prin credit, leasing sau buy-back.",
                },
              ].map((s, i) => (
                <li key={s.t} className="flex gap-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary font-display font-extrabold text-primary-foreground">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-lg">{s.t}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="surface-card rounded-2xl p-8">
            <h2 className="text-2xl">Ai o întrebare despre o mașină?</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Sună sau scrie-ne pe WhatsApp și primești poze suplimentare, raportul de kilometraj și
              un preț final în aceeași zi.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href={SITE.phoneHref}>
                  <Phone className="size-4" /> {SITE.phone}
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              {SITE.addressLine}
              <br />
              {SITE.hours}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
