export const SITE = {
  name: "Bremen Auto",
  legalName: "Bremen Auto",
  tagline: "Mașini second hand verificate, aduse din Germania",
  phone: "0751 692 335",
  phoneHref: "tel:+40751692335",
  whatsapp: "https://wa.me/40751692335",
  email: "vele_razvanel@yahoo.com",
  facebook: "https://www.facebook.com/bremenautocj/",
  city: "Gilău",
  county: "Cluj",
  nearCity: "Cluj-Napoca",
  addressLine: "Comuna Gilău, județul Cluj (la 15 min de Cluj-Napoca)",
  hours: "Non-stop, 24/7 — sună oricând",
} as const;

export function whatsappUrl(message?: string): string {
  const base = "https://wa.me/40751692335";
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function photoUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    // Fotografiile externe (OLX / Facebook) se servesc prin proxy-ul propriu,
    // altfel sunt blocate la hotlinking și apar rupte în browser.
    const normalized = path
      .replace(/^http:\/\//, "https://")
      .replace(/;s=0x0$/, ";s=1000x700");
    return `/api/public/img?u=${encodeURIComponent(normalized)}`;
  }
  return `/api/public/photo/${path.replace(/^\/+/, "")}`;
}

/** Variantă absolută, pentru og:image și structured data. */
export function absolutePhotoUrl(path: string): string {
  const url = photoUrl(path);
  return url.startsWith("http") ? url : `https://bremenauto.ro${url}`;
}


export function formatPrice(price: number, currency = "EUR"): string {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatKm(km: number): string {
  return `${new Intl.NumberFormat("ro-RO").format(km)} km`;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
