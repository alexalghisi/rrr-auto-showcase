import { SITE } from "./site";

/** Structured data reused across routes. Keep in sync with src/lib/site.ts. */

export const ORG_ID = "#bremen-auto";

export const dealerSchema = {
  "@context": "https://schema.org",
  "@type": "AutoDealer",
  "@id": ORG_ID,
  name: SITE.name,
  alternateName: ["Bremen Auto Florești", "Bremen Auto Cluj", "Bremen Auto Luna de Sus"],
  description:
    "Parc auto pe DN1, în Luna de Sus (comuna Florești), județul Cluj: mașini second hand aduse din Germania, verificate tehnic, cu acte complete.",
  telephone: "+40751692335",
  email: SITE.email,
  priceRange: "€€",
  currenciesAccepted: "EUR, RON",
  paymentAccepted: "Numerar, Transfer bancar, Credit auto, Leasing",
  areaServed: [
    { "@type": "Country", name: "România" },
    { "@type": "City", name: "Cluj-Napoca" },
    { "@type": "City", name: "Florești" },
    { "@type": "City", name: "Luna de Sus" },
    { "@type": "City", name: "Turda" },
    { "@type": "City", name: "Dej" },
    { "@type": "City", name: "Zalău" },
    { "@type": "City", name: "Baia Mare" },
    { "@type": "City", name: "Bistrița" },
    { "@type": "City", name: "Oradea" },
    { "@type": "City", name: "Alba Iulia" },
    { "@type": "City", name: "Sibiu" },
    { "@type": "City", name: "Târgu Mureș" },
    { "@type": "City", name: "Satu Mare" },
    { "@type": "City", name: "Timișoara" },
    { "@type": "City", name: "Brașov" },
    { "@type": "City", name: "București" },
    { "@type": "AdministrativeArea", name: "Județul Cluj" },
    { "@type": "AdministrativeArea", name: "Transilvania" },
  ],
  makesOffer: {
    "@type": "Offer",
    itemOffered: {
      "@type": "Service",
      name: "Vânzare mașini second hand aduse din Germania, cu livrare în toată România",
    },
    availableDeliveryMethod: "http://purl.org/goodrelations/v1#DeliveryModeFreight",
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "DN1, Luna de Sus",
    addressLocality: "Florești",
    addressRegion: "Cluj",
    postalCode: "407280",
    addressCountry: "RO",
  },
  hasMap: "https://www.google.com/maps?q=QC2J%2BWR+Luna+de+Sus,+Floresti,+Cluj",
  geo: { "@type": "GeoCoordinates", latitude: 46.752312, longitude: 23.432062 },
  sameAs: [SITE.facebook],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "00:00",
      closes: "23:59",
    },
  ],
  knowsLanguage: ["ro", "de"],
} as const;

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.path,
    })),
  };
}

export function faqSchema(faqs: ReadonlyArray<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export const HOME_FAQS = [
  {
    q: "Unde se află parcul auto Bremen Auto?",
    a: "Pe DN1, în Luna de Sus (comuna Florești), județul Cluj — la circa 10 minute de Cluj-Napoca, pe drumul spre Oradea/Huedin (E60).",
  },
  {
    q: "Ce documente primesc la cumpărare?",
    a: "Factură, contract de vânzare-cumpărare, carte de identitate a vehiculului și dosar complet pentru înmatriculare în România.",
  },
  {
    q: "Care este programul Bremen Auto?",
    a: "Programul este non-stop, 24/7. Sună la 0751 692 335 sau scrie pe WhatsApp oricând și stabilim o vizionare.",
  },
  {
    q: "De unde provin mașinile?",
    a: "Autoturismele sunt aduse direct din Germania, cu istoric de kilometraj verificat, dosar de daune consultat și carte de service.",
  },
  {
    q: "Pot proba mașina înainte de cumpărare?",
    a: "Da. Poți face probă de drum și poți duce mașina la un service la alegerea ta pentru verificare.",
  },
  {
    q: "Se poate cumpăra în rate sau prin leasing?",
    a: "Da, se poate plăti cash, prin transfer bancar sau prin credit auto ori leasing, cu acte pregătite de noi.",
  },
] as const;
