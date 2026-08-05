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
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `/api/public/photo/${path.replace(/^\/+/, "")}`;
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
