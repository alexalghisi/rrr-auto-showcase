import { createFileRoute, Link } from "@tanstack/react-router";

import { LANDING_GROUPS } from "@/lib/landing-pages";
import { breadcrumbSchema, dealerSchema } from "@/lib/seo";
import { SITE } from "@/lib/site";

const URL = "https://bremenauto.ro/categorii";
const TITLE = "Categorii mașini second hand Cluj | Bremen Auto";
const DESCRIPTION =
  "Toate categoriile de mașini second hand Bremen Auto: după marcă, buget, an de fabricație și oraș de livrare. Auto rulate din Germania, DN1 Florești, lângă Cluj-Napoca.";

export const Route = createFileRoute("/categorii")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE.name },
      { property: "og:locale", content: "ro_RO" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(dealerSchema) },
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbSchema([
            { name: "Acasă", path: "https://bremenauto.ro/" },
            { name: "Categorii", path: URL },
          ]),
        ),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: TITLE,
          description: DESCRIPTION,
          url: URL,
          hasPart: LANDING_GROUPS.map((group) => ({
            "@type": "ItemList",
            name: group.heading,
            itemListElement: group.pages.map((page, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: page.h1,
              url: `https://bremenauto.ro/${page.slug}`,
            })),
          })),
        }),
      },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Acasă
        </Link>
        <span className="px-2">/</span>
        <span className="text-foreground">Categorii</span>
      </nav>

      <h1 className="mt-4 text-3xl leading-tight sm:text-4xl">
        Categorii de mașini second hand — Cluj și toată România
      </h1>
      <p className="mt-4 max-w-3xl text-muted-foreground">
        Alege rapid după marcă, buget, an de fabricație sau oraș. Toate mașinile sunt aduse din
        Germania, verificate tehnic și disponibile în parcul Bremen Auto de pe DN1, Luna de Sus
        (comuna Florești), la 10 minute de Cluj-Napoca. Poți plăti cash sau în rate.
      </p>

      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link to="/stoc" className="text-primary underline-offset-4 hover:underline">
          Vezi tot stocul
        </Link>
        <Link to="/gaseste-masina" className="text-primary underline-offset-4 hover:underline">
          Consilier auto
        </Link>
        <Link to="/blog" className="text-primary underline-offset-4 hover:underline">
          Ghiduri de cumpărare
        </Link>
      </div>

      {LANDING_GROUPS.map((group) => (
        <section key={group.id} id={group.id} className="mt-12">
          <h2 className="text-2xl">{group.heading}</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{group.blurb}</p>
          <ul className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {group.pages.map((page) => (
              <li key={page.slug}>
                <Link
                  to="/$landing"
                  params={{ landing: page.slug }}
                  className="surface-card block rounded-lg px-4 py-3 text-sm transition-colors hover:border-primary"
                >
                  <h3 className="font-medium">{page.h1}</h3>
                  <span className="mt-1 block text-xs text-muted-foreground">{page.eyebrow}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
