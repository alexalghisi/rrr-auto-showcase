import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Clock, ArrowRight } from "lucide-react";

import { BLOG_POSTS, BLOG_CATEGORIES } from "@/lib/blog";
import { SITE } from "@/lib/site";
import { breadcrumbSchema, dealerSchema } from "@/lib/seo";

const URL = "https://bremenauto.ro/blog";
const TITLE = "Blog auto Cluj — ghiduri mașini second hand | Bremen Auto";
const DESCRIPTION =
  "Ghiduri practice despre mașini second hand în Cluj-Napoca: cum alegi, prețuri reale, acte de înmatriculare, modele recomandate și studii de caz din parcul nostru.";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: TITLE.slice(0, 60) },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "ro_RO" },
      { property: "og:site_name", content: SITE.name },
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
            { name: "Blog", path: URL },
          ]),
        ),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Blog Bremen Auto",
          url: URL,
          inLanguage: "ro-RO",
          blogPost: BLOG_POSTS.map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            url: `https://bremenauto.ro/blog/${p.slug}`,
            datePublished: p.published,
            dateModified: p.updated,
          })),
        }),
      },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Acasă
        </Link>
        <span className="px-2">/</span>
        <span className="text-foreground">Blog</span>
      </nav>

      <p className="eyebrow mt-6">Ghiduri · Cluj-Napoca</p>
      <h1 className="mt-2 max-w-3xl text-4xl sm:text-5xl">
        Blog auto: tot ce trebuie să știi înainte să cumperi o mașină rulată în Cluj
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
        Scriem din parcul nostru de pe DN1 Florești: verificări reale, prețuri reale, acte și modele
        pe care le vedem zilnic. Fără copy-paste de pe alte site-uri.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {BLOG_CATEGORIES.map((c) => (
          <span
            key={c}
            className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
          >
            {c}
          </span>
        ))}
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {BLOG_POSTS.map((post) => (
          <article key={post.slug} className="surface-card flex flex-col rounded-xl p-6">
            <span className="eyebrow">{post.category}</span>
            <h2 className="mt-3 text-xl leading-snug">
              <Link
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="transition-colors hover:text-primary"
              >
                {post.title}
              </Link>
            </h2>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
              {post.excerpt}
            </p>
            <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-3.5" />
                {new Date(post.published).toLocaleDateString("ro-RO", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5" />
                {post.readingMinutes} min
              </span>
            </div>
            <Link
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="mt-5 inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              Citește articolul <ArrowRight className="size-4" />
            </Link>
          </article>
        ))}
      </div>

      <section className="surface-card mt-16 rounded-xl p-8 text-center">
        <h2 className="text-2xl">Cauți deja o mașină?</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          Vezi stocul actualizat zilnic sau sună-ne la {SITE.phone}. Program non-stop, cash sau în
          rate.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/stoc"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Vezi stocul <ArrowRight className="size-4" />
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm"
          >
            Contact
          </Link>
        </div>
      </section>
    </div>
  );
}
