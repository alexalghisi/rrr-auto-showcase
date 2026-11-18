import { Link } from "@tanstack/react-router";
import { Car, Menu, X } from "lucide-react";
import { useState } from "react";

import { WhatsAppButton } from "@/components/whatsapp-button";

const links = [
  { to: "/", label: "Acasă" },
  { to: "/stoc", label: "Mașini în stoc" },
  { to: "/categorii", label: "Categorii" },
  { to: "/gaseste-masina", label: "Consilier AI" },

  { to: "/blog", label: "Blog" },
  { to: "/despre", label: "Despre noi" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Car className="size-5" />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight">
            Bremen<span className="text-primary">Auto</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground [&.active]:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <WhatsAppButton label="WhatsApp" size="sm" className="hidden sm:inline-flex" />
          <button
            type="button"
            aria-label="Meniu"
            className="inline-flex size-9 items-center justify-center rounded-md border border-border md:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-background px-4 py-3 md:hidden">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block py-2.5 text-sm font-medium text-muted-foreground [&.active]:text-primary"
            >
              {l.label}
            </Link>
          ))}
          <WhatsAppButton label="Scrie pe WhatsApp" block className="mt-2" />
        </nav>
      )}
    </header>
  );
}
