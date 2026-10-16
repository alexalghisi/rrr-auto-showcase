import type { ReactNode } from "react";
import { SITE } from "@/lib/site";

export function legalHead(path: string, title: string, description: string) {
  const url = `https://bremenauto.ro${path}`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

export function LegalPage({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-2 text-4xl sm:text-5xl">{title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">Ultima actualizare: 16 octombrie 2026</p>
      <div className="legal mt-8 space-y-4 text-base leading-relaxed text-muted-foreground [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:text-foreground [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6 [&_a]:text-primary [&_a]:underline">
        {children}
        <h2>Contact</h2>
        <p>
          {SITE.name} · {SITE.addressLine} · Telefon {SITE.phone} · E-mail{" "}
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
        </p>
      </div>
    </div>
  );
}
