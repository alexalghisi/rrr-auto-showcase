import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { CalendarDays, Clock, Phone, ArrowRight } from "lucide-react";

import { getBlogPost, BLOG_POSTS, BLOG_AUTHOR } from "@/lib/blog";
import { getLandingPage } from "@/lib/landing-pages";
import { SITE } from "@/lib/site";
import { breadcrumbSchema, dealerSchema, faqSchema, ORG_ID } from "@/lib/seo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/blog/$slug")({
  beforeLoad: ({ params }) => {
    if (!getBlogPost(params.slug)) throw notFound();
  },
  head: ({ params }) => {
    const post = getBlogPost(params.slug);
    if (!post) return {};
    const url = `https://bremenauto.ro/blog/${post.slug}`;
    return {
      meta: [
        { title: post.metaTitle.slice(0, 60) },
        { name: "description", content: post.description.slice(0, 160) },
        { name: "keywords", content: post.keywords },
        { name: "author", content: BLOG_AUTHOR },
        { property: "og:title", content: post.metaTitle },
        { property: "og:description", content: post.description },
        { property: "og:type", content: "article" },
        { property: "og:locale", content: "ro_RO" },
        { property: "og:site_name", content: SITE.name },
        { property: "og:url", content: url },
        { property: "article:published_time", content: post.published },
        { property: "article:modified_time", content: post.updated },
        { property: "article:section", content: post.category },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: post.metaTitle },
        { name: "twitter:description", content: post.description },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(dealerSchema) },
        {
          type: "application/ld+json",
          children: JSON.stringify(
            breadcrumbSchema([
              { name: "Acasă", path: "https://bremenauto.ro/" },
              { name: "Blog", path: "https://bremenauto.ro/blog" },
              { name: post.title, path: url },
            ]),
          ),
        },
        { type: "application/ld+json", children: JSON.stringify(faqSchema(post.faqs)) },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.description,
            articleSection: post.category,
            inLanguage: "ro-RO",
            datePublished: post.published,
            dateModified: post.updated,
            wordCount:
              post.intro.join(" ").split(/\s+/).length +
              post.sections.reduce(
                (n, s) =>
                  n +
                  s.paragraphs.join(" ").split(/\s+/).length +
                  (s.bullets?.join(" ").split(/\s+/).length ?? 0),
                0,
              ),
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            author: { "@type": "Organization", name: BLOG_AUTHOR, "@id": ORG_ID },
            publisher: { "@id": ORG_ID },
          }),
        },
      ],
    };
  },
  component: BlogPostRoute,
});

function BlogPostRoute() {
  const { slug } = Route.useParams();
  const post = getBlogPost(slug)!;
  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);
  const landings = post.relatedLandings
    .map((s) => getLandingPage(s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Acasă
        </Link>
        <span className="px-2">/</span>
        <Link to="/blog" className="hover:text-foreground">
          Blog
        </Link>
      </nav>

      <p className="eyebrow mt-6">{post.category}</p>
      <h1 className="mt-2 text-3xl leading-tight sm:text-4xl">{post.title}</h1>

      <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CalendarDays className="size-3.5" />
          Actualizat{" "}
          {new Date(post.updated).toLocaleDateString("ro-RO", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="size-3.5" />
          {post.readingMinutes} min de citit
        </span>
        <span>de {BLOG_AUTHOR}, DN1 Florești</span>
      </div>

      <div className="mt-8 space-y-4">
        {post.intro.map((p) => (
          <p key={p} className="text-base leading-relaxed text-muted-foreground">
            {p}
          </p>
        ))}
      </div>

      <nav aria-label="Cuprins" className="surface-card mt-10 rounded-xl p-6">
        <h2 className="text-lg">Cuprins</h2>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
          {post.sections.map((s) => (
            <li key={s.h2}>
              <a href={`#${slugify(s.h2)}`} className="hover:text-primary">
                {s.h2}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {post.sections.map((s) => (
        <section key={s.h2} id={slugify(s.h2)} className="mt-12 scroll-mt-24">
          <h2 className="text-2xl sm:text-3xl">{s.h2}</h2>
          <div className="mt-4 space-y-4">
            {s.paragraphs.map((p) => (
              <p key={p} className="text-base leading-relaxed text-muted-foreground">
                {p}
              </p>
            ))}
          </div>
          {s.bullets && (
            <ul className="mt-5 space-y-2">
              {s.bullets.map((b) => (
                <li key={b} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                  {b}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <section className="surface-card mt-14 rounded-xl p-7">
        <h2 className="text-xl">Vrei să vezi mașinile despre care vorbim?</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Stocul din parcul de pe DN1, Luna de Sus (Florești), se actualizează zilnic. Cash sau în
          rate, program non-stop.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <a href={SITE.phoneHref}>
              <Phone className="size-4" /> {SITE.phone}
            </a>
          </Button>
          <Button asChild variant="outline">
            <Link to="/stoc">
              Vezi stocul <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          </Button>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl">Întrebări frecvente</h2>
        <dl className="mt-5 space-y-4">
          {post.faqs.map((f) => (
            <div key={f.q} className="surface-card rounded-xl p-6">
              <dt className="font-display text-base">{f.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {landings.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl">Pagini utile din stoc</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {landings.map((p) => (
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
      )}

      <section className="mt-14">
        <h2 className="text-xl">Citește și</h2>
        <ul className="mt-4 space-y-3">
          {related.map((p) => (
            <li key={p.slug}>
              <Link
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="text-sm text-primary hover:underline"
              >
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
