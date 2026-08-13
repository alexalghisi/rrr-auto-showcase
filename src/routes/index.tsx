import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ShieldCheck, FileCheck2, Wrench, HandCoins, Phone, MapPin, ArrowRight } from "lucide-react";

import heroImage from "@/assets/hero-bremen-auto.jpg";
import { CarCard } from "@/components/car-card";
import { Button } from "@/components/ui/button";
import { listPublicCars } from "@/lib/cars.functions";
import { SITE } from "@/lib/site";
import { dealerSchema, faqSchema, ORG_ID, HOME_FAQS } from "@/lib/seo";
import { getLandingPage } from "@/lib/landing-pages";
import { BLOG_POSTS } from "@/lib/blog";

const HOME_LANDING_LINKS = [
  "masini-second-hand-sub-5000-euro-cluj",
  "masini-second-hand-5000-10000-euro-cluj",
  "masini-second-hand-10000-15000-euro-cluj",
  "masini-din-germania-cluj",
  "masini-second-hand-in-rate-cluj",
  "suv-second-hand-cluj",
  "break-second-hand-cluj",
  "masini-automate-second-hand-cluj",
  "volkswagen-golf-second-hand-cluj",
  "skoda-octavia-second-hand-cluj",
  "bmw-second-hand-cluj",
  "dacia-duster-second-hand-cluj",
  "parc-auto-floresti-cluj",
  "dealer-auto-cluj",
];

const HOME_GEO_LINKS = [
  "masini-second-hand-livrare-toata-romania",
  "masini-second-hand-cluj-napoca",
  "masini-second-hand-floresti-cluj",
  "masini-second-hand-turda",
  "masini-second-hand-dej",
  "masini-second-hand-zalau-salaj",
  "masini-second-hand-baia-mare-maramures",
  "masini-second-hand-bistrita",
  "masini-second-hand-oradea-bihor",
  "masini-second-hand-alba-iulia",
  "masini-second-hand-targu-mures",
  "masini-second-hand-sibiu",
  "masini-second-hand-brasov",
  "masini-second-hand-bucuresti",
];

const carsQuery = queryOptions({
  queryKey: ["cars", "public"],
  queryFn: () => listPublicCars(),
});

const TITLE = "Mașini second hand Cluj — Bremen Auto Florești";
const DESCRIPTION =
  "Mașini second hand aduse din Germania, pe DN1 în Luna de Sus (Florești), lângă Cluj-Napoca: km verificați, carte service, acte complete, probă de drum.";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(carsQuery),
  head: ({ loaderData }) => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "ro_RO" },
      { property: "og:site_name", content: SITE.name },
      { property: "og:url", content: "https://bremenauto.ro/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [
      { rel: "canonical", href: "https://bremenauto.ro/" },
      { rel: "preload", as: "image", href: heroImage, fetchPriority: "high" },
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(dealerSchema) },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE.name,
          inLanguage: "ro-RO",
          publisher: { "@id": ORG_ID },
          potentialAction: {
            "@type": "SearchAction",
            target: { "@type": "EntryPoint", urlTemplate: "https://bremenauto.ro/stoc?q={search_term_string}" },
            "query-input": "required name=search_term_string",
          },
        }),
      },
      { type: "application/ld+json", children: JSON.stringify(faqSchema(HOME_FAQS)) },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Mașini second hand disponibile în Cluj",
          itemListElement: (loaderData ?? []).slice(0, 12).map((car, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: `https://bremenauto.ro/masini/${car.slug}`,
            name: [car.make, car.model, car.year].filter(Boolean).join(" "),
          })),
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
    title: "Cash sau în rate",
    text: "Plătești cash, prin credit auto sau leasing. Te ajutăm cu actele și aprobarea rapidă, iar mașina ta o primim la schimb (buy-back).",
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
          alt="Parc auto Bremen Auto pe DN1, Luna de Sus, comuna Florești, județul Cluj, cu mașini rulate aduse din Germania"
          width={1920}
          height={1088}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6 sm:pb-28 sm:pt-32">
          <p className="eyebrow">Florești · Cluj-Napoca · din Germania</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.05] sm:text-6xl">
            Mașini second hand în Cluj, alese cu grijă din{" "}
            <span className="text-gradient-primary">Germania</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {SITE.name} aduce autoturisme rulate cu istoric verificat, carte service și acte
            complete. Le vezi pe loc în parcul nostru de pe DN1, Luna de Sus, la 10 minute de Cluj-Napoca.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            <HandCoins className="size-4" /> Cash sau în rate · credit auto & leasing
          </div>
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

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <p className="eyebrow">Căutări populare în Cluj</p>
          <h2 className="mt-2 text-3xl sm:text-4xl">Găsește rapid ce cauți</h2>
          <div className="mt-8 flex flex-wrap gap-2">
            {HOME_LANDING_LINKS.map((slug) => {
              const page = getLandingPage(slug);
              if (!page) return null;
              return (
                <Link
                  key={slug}
                  to="/$landing"
                  params={{ landing: slug }}
                  className="rounded-full border border-border bg-background px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {page.h1}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <p className="eyebrow">Livrăm în toată România</p>
        <h2 className="mt-2 text-3xl sm:text-4xl">Cumperi din Cluj, primești mașina acasă</h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Peste jumătate dintre clienții noștri sunt din alte județe. Alegi mașina, o verifici cu
          noi prin videocall, iar noi ți-o livrăm pe platformă, cu actele pregătite pentru
          înmatriculare.
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          {HOME_GEO_LINKS.map((slug) => {
            const page = getLandingPage(slug);
            if (!page) return null;
            return (
              <Link
                key={slug}
                to="/$landing"
                params={{ landing: slug }}
                className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {page.h1}
              </Link>
            );
          })}
        </div>
      </section>



      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Ghiduri Bremen Auto</p>
            <h2 className="mt-2 text-3xl sm:text-4xl">Sfaturi înainte să cumperi</h2>
          </div>
          <Button asChild variant="outline">
            <Link to="/blog">Toate ghidurile</Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BLOG_POSTS.slice(0, 6).map((post) => (
            <Link
              key={post.slug}
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="surface-card rounded-xl p-6 transition-colors hover:border-primary"
            >
              <p className="eyebrow">{post.category}</p>
              <h3 className="mt-3 text-lg leading-snug">{post.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                {post.excerpt}
              </p>
            </Link>
          ))}
        </div>
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
                  d: "Te așteptăm pe DN1, în Luna de Sus. Poți veni cu mecanicul tău sau mergem împreună la un service pentru verificare.",
                },
                {
                  t: "Semnezi actele și pleci cu ea",
                  d: "Plătești cash sau în rate — credit auto, leasing sau buy-back. Pregătim tot dosarul de înmatriculare și te ajutăm cu aprobarea.",
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

      <section className="mx-auto max-w-4xl px-4 pb-20 sm:px-6">
        <p className="eyebrow">Întrebări frecvente</p>
        <h2 className="mt-2 text-3xl sm:text-4xl">Ce vor să știe clienții din Cluj</h2>
        <dl className="mt-8 space-y-4">
          {HOME_FAQS.map((f) => (
            <div key={f.q} className="surface-card rounded-xl p-6">
              <dt className="font-display text-lg">{f.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>

  );
}
