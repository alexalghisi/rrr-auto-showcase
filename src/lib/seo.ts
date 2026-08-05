import { SITE } from "./site";

/** Structured data reused across routes. Keep in sync with src/lib/site.ts. */

export const ORG_ID = "#bremen-auto";

export const dealerSchema = {
  "@context": "https://schema.org",
  "@type": "AutoDealer",
  "@id": ORG_ID,
  name: SITE.name,
  alternateName: ["Bremen Auto Gilău", "Bremen Auto Cluj"],
  description:
    "Parc auto în Gilău, județul Cluj: mașini second hand aduse din Germania, verificate tehnic, cu acte complete.",
  telephone: "+40751692335",
  email: SITE.email,
  priceRange: "€€",
  currenciesAccepted: "EUR, RON",
  paymentAccepted: "Numerar, Transfer bancar, Credit auto, Leasing",
  areaServed: [
    { "@type": "City", name: "Cluj-Napoca" },
    { "@type": "City", name: "Gilău" },
    { "@type": "City", name: "Florești" },
    { "@type": "City", name: "Huedin" },
    { "@type": "AdministrativeArea", name: "Județul Cluj" },
    { "@type": "Country", name: "România" },
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: "Comuna Gilău",
    addressLocality: "Gilău",
    addressRegion: "Cluj",
    postalCode: "407310",
    addressCountry: "RO",
  },
  geo: { "@type": "GeoCoordinates", latitude: 46.7539, longitude: 23.3703 },
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
    a: "În comuna Gilău, județul Cluj, la aproximativ 15 minute de Cluj-Napoca pe drumul spre Huedin (E60).",
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
