import { Link } from "@tanstack/react-router";
import { Facebook, Mail, MapPin, Phone, Clock } from "lucide-react";

import { SITE } from "@/lib/site";
import { LANDING_PAGES } from "@/lib/landing-pages";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-xl font-extrabold">
            Bremen<span className="text-primary">Auto</span>
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Parc auto cu mașini second hand aduse din Germania, verificate tehnic și livrate cu acte
            complete. DN1, Luna de Sus, comuna Florești, județul Cluj.
          </p>
          <a
            href={SITE.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <Facebook className="size-4" /> Pagina de Facebook
          </a>
        </div>

        <div>
          <p className="eyebrow">Navigare</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/stoc" className="transition-colors hover:text-foreground">
                Mașini în stoc
              </Link>
            </li>
            <li>
              <Link to="/despre" className="transition-colors hover:text-foreground">
                Despre noi
              </Link>
            </li>
            <li>
              <Link to="/blog" className="transition-colors hover:text-foreground">
                Blog & ghiduri auto
              </Link>
            </li>
            <li>
              <Link to="/contact" className="transition-colors hover:text-foreground">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/auth" className="transition-colors hover:text-foreground">
                Administrare
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow">Contact</p>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 size-4 text-primary" />
              <a href={SITE.phoneHref} className="hover:text-foreground">
                {SITE.phone}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 size-4 text-primary" />
              <a href={`mailto:${SITE.email}`} className="hover:text-foreground">
                {SITE.email}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 text-primary" />
              <span>{SITE.addressLine}</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 size-4 text-primary" />
              <span>{SITE.hours}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <p className="eyebrow">Căutări populare · Cluj și toată România</p>
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
            {LANDING_PAGES.map((p) => (
              <li key={p.slug}>
                <Link
                  to="/$landing"
                  params={{ landing: p.slug }}
                  className="transition-colors hover:text-primary"
                >
                  {p.h1}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {SITE.name} · Mașini second hand Cluj-Napoca & Florești
      </div>
    </footer>
  );
}
