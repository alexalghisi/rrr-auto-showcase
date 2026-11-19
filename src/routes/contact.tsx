import { createFileRoute } from "@tanstack/react-router";
import { Phone, Mail, MapPin, Clock, Facebook, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { SITE } from "@/lib/site";
import { breadcrumbSchema, dealerSchema } from "@/lib/seo";

const TITLE = "Contact Bremen Auto — parc auto DN1, Florești Cluj";
const DESCRIPTION =
  "Scrie pe WhatsApp sau sună la 0751 692 335. Parc auto Bremen Auto pe DN1, Luna de Sus (Florești), jud. Cluj, program non-stop 24/7. Mașini din Germania.";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE.name },
      { property: "og:locale", content: "ro_RO" },
      { property: "og:url", content: "https://bremenauto.ro/contact" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "https://bremenauto.ro/contact" }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(dealerSchema) },
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbSchema([
            { name: "Acasă", path: "https://bremenauto.ro/" },
            { name: "Contact", path: "https://bremenauto.ro/contact" },
          ]),
        ),
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <p className="eyebrow">Hai la o cafea și o probă de drum</p>
      <h1 className="mt-2 text-4xl sm:text-5xl">Contact Bremen Auto</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Suntem pe DN1, în Luna de Sus (comuna Florești), la 10 minute de Cluj-Napoca pe drumul spre Oradea. Scrie-ne
        pe WhatsApp și pregătim mașina care te interesează.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="surface-card rounded-xl p-8">
          <ul className="space-y-6">
            <li className="flex gap-4">
              <MessageCircle className="mt-1 size-5 shrink-0 text-whatsapp" />
              <div>
                <p className="text-sm text-muted-foreground">WhatsApp</p>
                <WhatsAppButton label="Scrie pe WhatsApp" size="lg" className="mt-2" />
              </div>
            </li>
            <li className="flex gap-4">
              <Mail className="mt-1 size-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <a href={`mailto:${SITE.email}`} className="break-all font-medium">
                  {SITE.email}
                </a>
              </div>
            </li>
            <li className="flex gap-4">
              <MapPin className="mt-1 size-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Adresă</p>
                <p className="font-medium">{SITE.addressLine}</p>
              </div>
            </li>
            <li className="flex gap-4">
              <Clock className="mt-1 size-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Program</p>
                <p className="font-medium">{SITE.hours}</p>
              </div>
            </li>
            <li className="flex gap-4">
              <Phone className="mt-1 size-5 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Telefon</p>
                <a href={SITE.phoneHref} className="text-sm text-muted-foreground hover:text-foreground">
                  {SITE.phone}
                </a>
              </div>
            </li>
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="outline">
              <a href={SITE.facebook} target="_blank" rel="noopener noreferrer">
                <Facebook className="size-4" /> Facebook
              </a>
            </Button>
          </div>

        </div>

        <div className="surface-card overflow-hidden rounded-xl">
          <iframe
            title="Harta către Bremen Auto, DN1 Luna de Sus, comuna Florești, județul Cluj"
            src="https://www.google.com/maps?q=46.750849%2C23.432288&z=17&output=embed"
            loading="lazy"
            className="h-full min-h-80 w-full border-0"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}
