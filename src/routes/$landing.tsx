import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Phone, MapPin, ArrowRight, HandCoins, ShieldCheck } from "lucide-react";

import { CarCard } from "@/components/car-card";
import { Button } from "@/components/ui/button";
import { listPublicCars } from "@/lib/cars.functions";
import { SITE } from "@/lib/site";
import { breadcrumbSchema, dealerSchema, faqSchema, ORG_ID } from "@/lib/seo";
import { getLandingPage, LANDING_PAGES } from "@/lib/landing-pages";
import { BLOG_POSTS } from "@/lib/blog";

const carsQuery = queryOptions({
  queryKey: ["cars", "public"],
  queryFn: () => listPublicCars(),
});

export const Route = createFileRoute("/$landing")({
  beforeLoad: ({ params }) => {
    if (!getLandingPage(params.landing)) throw notFound();
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(carsQuery),
  head: ({ params }) => {
    const page = getLandingPage(params.landing);
    if (!page) return {};
    const url = `https://bremenauto.ro/${page.slug}`;
    return {
      meta: [
        { title: page.title },
        { name: "description", content: page.description },
        { name: "keywords", content: page.keywords },
        { property: "og:title", content: page.title },
        { property: "og:description", content: page.description },
        { property: "og:type", content: "website" },
        { property: "og:locale", content: "ro_RO" },
        { property: "og:site_name", content: SITE.name },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: page.title },
        { name: "twitter:description", content: page.description },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(dealerSchema) },
        {
          type: "application/ld+json",
          children: JSON.stringify(
            breadcrumbSchema([
              { name: "Acasă", path: "https://bremenauto.ro/" },
              { name: "Stoc mașini", path: "https://bremenauto.ro/stoc" },
              { name: page.h1, path: url },
            ]),
          ),
        },
        { type: "application/ld+json", children: JSON.stringify(faqSchema(page.faqs)) },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: page.h1,
            description: page.description,
            url,
            inLanguage: "ro-RO",
            about: { "@id": ORG_ID },
          }),
        },
      ],
    };
  },
  component: LandingRoute,
});

function LandingRoute() {
  const { landing } = Route.useParams();
  const page = getLandingPage(landing)!;
  const { data: cars } = useSuspenseQuery(carsQuery);
  const matches = cars.filter(page.match);
  const related = LANDING_PAGES.filter((p) => p.slug !== page.slug).slice(0, 8);
  const relatedPosts = BLOG_POSTS.filter((post) => post.relatedLandings.includes(page.slug)).slice(
    0,
    6,
  );
  const guides = relatedPosts.length ? relatedPosts : BLOG_POSTS.slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Acasă
        </Link>
        <span className="px-2">/</span>
        <Link to="/stoc" className="hover:text-foreground">
          Stoc
        </Link>
      </nav>

      <p className="eyebrow mt-6">{page.eyebrow}</p>
      <h1 className="mt-2 max-w-3xl text-4xl sm:text-5xl">{page.h1}</h1>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">{page.intro}</p>

      <div className="mt-7 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <a href={SITE.phoneHref}>
            <Phone className="size-4" /> Sună acum {SITE.phone}
          </a>
        </Button>
        <Button asChild size="lg" variant="outline">
          <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">
            WhatsApp 24/7
          </a>
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          <MapPin className="size-4 text-primary" /> {SITE.addressLine}
        </span>
        <span className="flex items-center gap-2">
          <HandCoins className="size-4 text-primary" /> Cash sau în rate · credit auto & leasing
        </span>
        <span className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" /> Km verificați · acte complete
        </span>
      </div>

      <section className="mt-14">
        <h2 className="text-3xl sm:text-4xl">Disponibile acum în parc</h2>
        {matches.length === 0 ? (
          <div className="surface-card mt-6 rounded-xl p-10 text-center">
            <p className="text-muted-foreground">
              Momentan nu avem această variantă în parc, dar o aducem la comandă din Germania. Sună
              la {SITE.phone} și îți spunem ce găsim în bugetul tău.
            </p>
            <Button asChild className="mt-6" variant="outline">
              <Link to="/stoc">
                Vezi tot stocul <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {matches.slice(0, 12).map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
            <Button asChild className="mt-8" variant="outline">
              <Link to="/stoc">
                Vezi tot stocul <ArrowRight className="size-4" />
              </Link>
            </Button>
          </>
        )}
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-3">
        {page.sections.map((s) => (
          <article key={s.h2} className="surface-card rounded-xl p-6">
            <h2 className="text-xl">{s.h2}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </article>
        ))}
      </section>

      <section className="mt-16 max-w-3xl">
        <h2 className="text-3xl sm:text-4xl">Întrebări frecvente</h2>
        <dl className="mt-6 space-y-4">
          {page.faqs.map((f) => (
            <div key={f.q} className="surface-card rounded-xl p-6">
              <dt className="font-display text-lg">{f.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl">Caută și alți clujeni</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {related.map((p) => (
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

      <section className="mt-16">
        <h2 className="text-2xl">Ghiduri utile înainte să cumperi</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((post) => (
            <li key={post.slug}>
              <Link
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="surface-card block rounded-xl p-5 transition-colors hover:border-primary"
              >
                <p className="eyebrow">{post.category}</p>
                <span className="mt-2 block font-display text-base leading-snug">{post.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

    </div>
  );
}
