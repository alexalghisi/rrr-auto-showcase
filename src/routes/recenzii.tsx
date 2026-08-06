import { createFileRoute } from "@tanstack/react-router";
import { Star, Copy, Check, MessageCircle, Phone, MapPin } from "lucide-react";
import { useState } from "react";

import { SITE, whatsappUrl } from "@/lib/site";
import { breadcrumbSchema } from "@/lib/seo";

const TITLE = "Lasă o recenzie Google | Bremen Auto Florești, Cluj";
const DESCRIPTION =
  "Ai cumpărat o mașină de la Bremen Auto, DN1 Luna de Sus, Florești? Lasă-ne o recenzie pe Google în mai puțin de un minut și ajută alți cumpărători din Cluj.";

export const Route = createFileRoute("/recenzii")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE.name },
      { property: "og:locale", content: "ro_RO" },
      { property: "og:url", content: "https://bremenauto.ro/recenzii" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "https://bremenauto.ro/recenzii" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbSchema([
            { name: "Acasă", path: "https://bremenauto.ro/" },
            { name: "Recenzii Google", path: "https://bremenauto.ro/recenzii" },
          ]),
        ),
      },
    ],
  }),
  component: ReviewsPage,
});

const SHARE_MESSAGE = `Mulțumim pentru încredere! Dacă ai un minut, lasă-ne o recenzie pe Google: ${"https://bremenauto.ro/recenzii"}`;

function ReviewsPage() {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText("https://bremenauto.ro/recenzii");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <p className="eyebrow">Părerea ta contează</p>
      <h1 className="mt-2 text-4xl sm:text-5xl">Lasă-ne o recenzie pe Google</h1>
      <p className="mt-4 text-muted-foreground">
        Ne bucurăm că ai ales {SITE.name}. O recenzie sinceră durează sub un minut și ajută alți
        cumpărători din Cluj-Napoca și din toată România să găsească mașini verificate, aduse din
        Germania.
      </p>

      <div className="surface-card mt-8 rounded-xl p-6 text-center">
        <div className="flex justify-center gap-1 text-primary">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="size-7 fill-current" />
          ))}
        </div>
        <a
          href={SITE.googleReviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto"
        >
          <Star className="size-4" /> Scrie recenzia pe Google
        </a>
        <p className="mt-3 text-xs text-muted-foreground">
          Se deschide profilul {SITE.name} pe Google Maps — apasă „Scrie o recenzie”.
        </p>
      </div>

      <section className="mt-12">
        <h2 className="text-2xl">Cum trimiți linkul unui client</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={copyLink}
            className="surface-card flex items-center justify-center gap-2 rounded-lg p-4 text-sm font-medium transition-colors hover:border-primary/50"
          >
            {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4 text-primary" />}
            {copied ? "Link copiat" : "Copiază linkul"}
          </button>
          <a
            href={whatsappUrl(SHARE_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="surface-card flex items-center justify-center gap-2 rounded-lg p-4 text-sm font-medium transition-colors hover:border-primary/50"
          >
            <MessageCircle className="size-4 text-primary" /> Trimite pe WhatsApp
          </a>
          <a
            href={SITE.phoneHref}
            className="surface-card flex items-center justify-center gap-2 rounded-lg p-4 text-sm font-medium transition-colors hover:border-primary/50"
          >
            <Phone className="size-4 text-primary" /> {SITE.phone}
          </a>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl">Ce poți menționa în recenzie</h2>
        <ul className="mt-4 space-y-2 text-muted-foreground">
          <li>· Modelul mașinii cumpărate și anul.</li>
          <li>· Cum a decurs vizionarea și proba de drum în parcul de pe DN1.</li>
          <li>· Actele și înmatricularea — cât de repede s-au rezolvat.</li>
          <li>· Plata: cash, transfer bancar sau în rate.</li>
          <li>· Livrarea, dacă mașina a plecat pe platformă în alt județ.</li>
        </ul>
      </section>

      <p className="mt-12 flex items-start gap-2 text-sm text-muted-foreground">
        <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
        {SITE.addressLine} · {SITE.hours}
      </p>
    </div>
  );
}
