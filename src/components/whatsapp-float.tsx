import { useRouterState } from "@tanstack/react-router";

import { carWhatsappUrl, whatsappUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Glifa oficială WhatsApp, desenată inline ca să nu depindem de o librărie de iconițe. */
function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35zM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.93.95-3.48-.22-.36a9.39 9.39 0 0 1-1.44-5.01c0-5.2 4.23-9.43 9.44-9.43 2.52 0 4.89.98 6.67 2.77a9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.23 9.43-9.44 9.43zm8.03-17.46A11.27 11.27 0 0 0 12.05.72C5.79.72.7 5.81.7 12.07c0 2 .52 3.95 1.52 5.67L.6 23.28l5.67-1.49a11.3 11.3 0 0 0 5.78 1.47h.01c6.26 0 11.35-5.09 11.35-11.35 0-3.03-1.18-5.88-3.33-8.02z" />
    </svg>
  );
}

type Props = {
  /** Anunț cuează balonul; fără el, mesajul este unul general. */
  carSlug?: string;
  /** Numele mașinii, doar pentru eticheta de accesibilitate. */
  title?: string;
  className?: string;
};

/**
 * Balon de contact WhatsApp, fixat în colțul din dreapta-jos.
 * Rămâne pe ecran în timp ce vizitatorul derulează pagina.
 */
export function WhatsAppFloat({ carSlug, title, className }: Props) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // Panoul de administrare și ecranele de autentificare nu au nevoie de balon.
  if (pathname.startsWith("/admin") || pathname.startsWith("/auth")) return null;

  const href = carSlug
    ? carWhatsappUrl(carSlug)
    : whatsappUrl("Bună ziua! Am văzut site-ul Bremen Auto și vreau detalii despre o mașină.");
  const label = carSlug
    ? `Scrie pe WhatsApp despre ${title ?? "această mașină"}`
    : "Scrie-ne pe WhatsApp";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={cn(
        "fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-whatsapp px-4 py-3 text-sm font-semibold text-whatsapp-foreground shadow-lg transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-whatsapp",
        className,
      )}
    >
      <WhatsAppGlyph className="size-5 shrink-0" />
      <span>WhatsApp</span>
    </a>
  );
}
