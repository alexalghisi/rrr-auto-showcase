import { formatKm, formatPrice } from "./site";

export type CarSeoInput = {
  make: string;
  model: string;
  trim?: string | null;
  year: number;
  mileage_km?: number | null;
  fuel?: string | null;
  gearbox?: string | null;
  power_hp?: number | null;
  price: number | string;
  currency?: string | null;
  status?: string | null;
};

/** Per-car questions buyers actually search ("<model> <an> pret", "in rate", "livrare"). */
export function carFaq(car: CarSeoInput) {
  const name = `${car.make} ${car.model}${car.trim ? ` ${car.trim}` : ""} ${car.year}`;
  const price = formatPrice(Number(car.price), car.currency ?? "EUR");
  const sold = car.status === "vanduta";
  return [
    {
      q: `Cât costă ${name}?`,
      a: sold
        ? `${name} a fost vândută la ${price}. Scrie-ne pe WhatsApp și îți căutăm o mașină similară din Germania.`
        : `Prețul este ${price}, negociabil la vizionare. Poți plăti cash sau în rate (credit auto ori leasing).`,
    },
    {
      q: `Câți kilometri are ${car.make} ${car.model}?`,
      a: `${name} are ${formatKm(car.mileage_km)}${car.fuel ? `, motor ${car.fuel}` : ""}${car.gearbox ? `, cutie ${car.gearbox}` : ""}${car.power_hp ? ` și ${car.power_hp} CP` : ""}. Istoricul și actele sunt verificate înainte de vânzare.`,
    },
    {
      q: `Pot cumpăra ${car.make} ${car.model} în rate?`,
      a: `Da. Calculează rata pe pagină, apoi îți facem oferta de finanțare cu avans de la 0% în funcție de eligibilitate.`,
    },
    {
      q: `Unde pot vedea mașina și livrați în altă localitate?`,
      a: `Mașina e la Bremen Auto, DN1 Luna de Sus (Florești), lângă Cluj-Napoca, deschis non-stop. Livrăm în toată România.`,
    },
  ];
}

/**
 * Conținut SEO scris de mână pentru fiecare mașină din stoc: o prezentare unică,
 * punctele forte ale modelului, cui i se potrivește și întrebările pe care le caută
 * cumpărătorii pentru exact acel model. Apare pe /masini/<slug>, în meta description,
 * în JSON-LD (Car.description + FAQPage) și în alt-urile pozelor.
 *
 * Reguli: doar fapte din anunț sau general valabile pentru model; fără promisiuni
 * pe care dealerul nu le-a făcut. Cheia = slug-ul mașinii.
 */
export type CarEditorial = {
  /** Fraza de vânzare pentru meta description (≤ ~110 caractere, se completează cu preț + locație). */
  pitch: string;
  /** 2–3 fraze despre această mașină concretă. */
  intro: string;
  highlights: string[];
  idealFor: string;
  faqs: Array<{ q: string; a: string }>;
};

export const CAR_EDITORIAL: Record<string, CarEditorial> = {
  "vw-touran-united-2009-232000-0548006809": {
    pitch: "Monovolum de familie VW Touran United 1.9 TDI, cutie manuală în 6 trepte, consum mic",
    intro:
      "Volkswagen Touran United este ediția specială a monovolumului compact VW, gândită pentru familii care au nevoie de spațiu fără costurile unui SUV. Exemplarul din 2009 are motorul 1.9 TDI, unul dintre cele mai robuste diesel-uri construite de grupul Volkswagen, cuplat la o cutie manuală în 6 trepte, și a fost adus din Germania.",
    highlights: [
      "Motor 1.9 TDI, cunoscut pentru fiabilitate și piese ieftine",
      "Cutie manuală în 6 trepte, consum redus pe drum lung",
      "Trei scaune individuale pe rândul doi și portbagaj generos",
      "Garanție 12 luni inclusă în preț, conform anunțului",
    ],
    idealFor: "familii cu copii, drumuri lungi și cine vrea un monovolum ieftin de întreținut",
    faqs: [
      {
        q: "Ce consum are VW Touran 1.9 TDI?",
        a: "Motorul 1.9 TDI consumă de regulă în jur de 6 l/100 km în regim mixt și mai puțin pe autostradă, în funcție de stilul de condus și încărcătură.",
      },
      {
        q: "Merită un VW Touran 1.9 TDI cu 232.000 km?",
        a: "1.9 TDI este un motor care, întreținut corect, trece mult peste acest kilometraj. Mașina e verificată înainte de vânzare și vine cu 12 luni garanție inclusă în prețul afișat.",
      },
    ],
  },
  "opel-astra-2015-187000-2726006809": {
    pitch: "Opel Astra Sports Tourer 1.6 CDTI Euro 6, unic proprietar, import Germania",
    intro:
      "Opel Astra J Sports Tourer din 2015 este un break compact practic, cu motorul diesel 1.6 CDTI din noua generație, mai silențios și mai economic decât vechiul 1.7. Respectă norma Euro 6, are un singur proprietar, cutie manuală în 6 trepte și a fost adus din Germania.",
    highlights: [
      "Normă de poluare Euro 6",
      "Motor diesel 1.6 CDTI, consum mic",
      "Caroserie break, portbagaj mare pentru familie sau bagaje",
      "Unic proprietar, import Germania",
    ],
    idealFor: "navetiști, familii și cine face mulți kilometri pe an",
    faqs: [
      {
        q: "Ce consum are Opel Astra 1.6 CDTI?",
        a: "Astra 1.6 CDTI Euro 6 consumă, în condiții normale, aproximativ 4,5–5,5 l/100 km în regim mixt.",
      },
      {
        q: "De ce contează că Opel Astra este Euro 6?",
        a: "Euro 6 este cea mai curată normă pentru diesel-urile din această generație: taxe mai mici în multe orașe, acces mai ușor în zonele cu restricții și o valoare de revânzare mai bună.",
      },
    ],
  },
  "seat-ibiza-2012-186000-5054006809": {
    pitch: "Seat Ibiza ST 1.2 benzină Euro 5, mică, economică, unic proprietar din Germania",
    intro:
      "Seat Ibiza ST din 2012 este varianta break a celei mai vândute mașini mici Seat: dimensiuni compacte pentru oraș, dar cu portbagaj de familie. Motorul de 1.2 pe benzină e simplu și ieftin de întreținut, are normă Euro 5, un singur proprietar și vine din Germania.",
    highlights: [
      "Motor 1.2 benzină, ieftin la întreținere și la asigurare",
      "Caroserie break (ST), mai mult spațiu decât un hatchback",
      "Ușor de parcat în oraș",
      "Unic proprietar, import Germania",
    ],
    idealFor: "prima mașină, șoferi începători și drumuri zilnice prin oraș",
    faqs: [
      {
        q: "Este Seat Ibiza 1.2 o mașină bună pentru începători?",
        a: "Da. Are dimensiuni mici, se conduce ușor, iar motorul 1.2 pe benzină are costuri mici de întreținere, de asigurare și de impozit.",
      },
      {
        q: "Ce consum are Seat Ibiza 1.2 benzină?",
        a: "În oraș consumă de obicei 6–7 l/100 km, iar în regim mixt în jur de 5,5–6 l/100 km.",
      },
    ],
  },
  "skoda-octavia-1-4-2011-186000-6116006809": {
    pitch: "Skoda Octavia Combi 1.4 benzină 122 CP, break spațios și economic",
    intro:
      "Skoda Octavia Combi este unul dintre cele mai căutate break-uri second hand din România, pentru spațiu, fiabilitate și costuri mici. Exemplarul din 2011 are motorul 1.4 pe benzină de 122 CP, suficient de vioi pentru autostradă, și cutie manuală.",
    highlights: [
      "Motor 1.4 benzină de 122 CP",
      "Break cu unul dintre cele mai mari portbagaje din clasă",
      "Piese ieftine și service la îndemână peste tot",
      "Adusă din Germania, verificată înainte de vânzare",
    ],
    idealFor: "familii, bagaje multe și cine vrea o mașină pe benzină fără griji",
    faqs: [
      {
        q: "Skoda Octavia pe benzină sau diesel?",
        a: "Pentru sub 15.000–20.000 km pe an, benzina este de obicei alegerea mai bună: întreținere mai ieftină și fără filtru de particule. Motorul 1.4 de 122 CP oferă un consum rezonabil și putere suficientă.",
      },
      {
        q: "Cât de mare este portbagajul la Skoda Octavia Combi?",
        a: "Octavia Combi din această generație are în jur de 580 de litri, cu banchetă rabatabilă pentru obiecte lungi.",
      },
    ],
  },
  "audi-q5-2022-75000-5096006809": {
    pitch: "Audi Q5 2022 diesel Euro 6, doar 75.000 km, proaspăt adus din Germania",
    intro:
      "Audi Q5 din 2022 face parte din generația modernizată a SUV-ului premium Audi, cu faruri LED, sistem MMI cu ecran tactil și un diesel Euro 6 eficient. Exemplarul are 75.000 km și a ajuns de curând din Germania; poate fi văzut oricând în parcul Bremen Auto de lângă Cluj-Napoca.",
    highlights: [
      "An 2022, generația modernizată Q5",
      "Doar 75.000 km",
      "Diesel Euro 6, cea mai curată normă pentru diesel",
      "Interior premium cu tapițerie din piele maro",
    ],
    idealFor: "cine vrea un SUV premium recent, confortabil pe drum lung, fără prețul unei mașini noi",
    faqs: [
      {
        q: "Cât costă un Audi Q5 2022 second hand?",
        a: "Acest Audi Q5 din 2022, cu 75.000 km, costă 37.000 EUR, cu plata cash sau în rate prin credit auto ori leasing.",
      },
      {
        q: "Audi Q5 2022 are garanție?",
        a: "Întreabă-ne pe WhatsApp ce garanție se aplică acestui exemplar; îți trimitem și istoricul complet al mașinii.",
      },
    ],
  },
  "audi-a7-competition-2015-0-4648006809": {
    pitch: "Audi A7 Sportback Competition 3.0 TDI 320 CP quattro automat, Euro 6",
    intro:
      "Audi A7 Sportback Competition este vârful gamei diesel A7: motor 3.0 TDI biturbo de 320 CP, tracțiune integrală quattro și cutie automată, într-o caroserie coupé cu patru uși și hayon. Exemplarul din 2015 are normă Euro 6 și poate fi cumpărat cash sau în rate.",
    highlights: [
      "3.0 TDI de 320 CP, versiunea Competition",
      "Tracțiune integrală quattro",
      "Cutie automată",
      "Normă Euro 6",
    ],
    idealFor: "cine vrea performanță, confort și un design coupé fără compromis la spațiu",
    faqs: [
      {
        q: "Ce înseamnă Audi A7 Competition?",
        a: "Competition este versiunea de top a A7 3.0 TDI, cu motor biturbo de peste 300 CP, suspensie sport și dotări de serie mai bogate decât A7 obișnuit.",
      },
      {
        q: "Pot cumpăra Audi A7 în rate?",
        a: "Da. Persoanele fizice pot lua mașina în rate pe până la 5 ani, iar firmele pe 24 de luni, prin partenerii de finanțare ai Bremen Auto.",
      },
    ],
  },
  "suzuki-vitara-2011-0-3444006809": {
    pitch: "Suzuki Vitara 1.9 diesel 129 CP 4x4, SUV robust pentru iarnă și munte",
    intro:
      "Suzuki Vitara este un SUV compact construit pe un șasiu de off-road adevărat, nu doar un autoturism înălțat. Exemplarul din 2011 are motorul diesel 1.9 de 129 CP, tracțiune 4x4 și cutie manuală: o alegere sigură pentru drumurile de munte și iernile din Ardeal.",
    highlights: [
      "Tracțiune integrală 4x4",
      "Motor diesel 1.9 de 129 CP",
      "Gardă la sol mare, bun pe drumuri neasfaltate",
      "Normă Euro 5",
    ],
    idealFor: "drumuri de munte, iarnă, zone rurale și cine are nevoie de un 4x4 ieftin",
    faqs: [
      {
        q: "Suzuki Vitara are 4x4 permanent?",
        a: "Da, acest Suzuki Vitara 1.9 diesel are tracțiune integrală 4x4, potrivită pentru zăpadă, drumuri forestiere și pante.",
      },
      {
        q: "Ce consum are Suzuki Vitara 1.9 diesel?",
        a: "Motorul 1.9 diesel consumă de regulă 7–8 l/100 km în regim mixt, normal pentru un SUV cu 4x4.",
      },
    ],
  },
  "vw-touareg-4x4-automat-2008-296000-9136006809": {
    pitch: "VW Touareg 3.0 V6 TDI 225 CP 4Motion automat, revizii la zi, preț mic",
    intro:
      "Volkswagen Touareg este SUV-ul mare al Volkswagen, construit pe aceeași platformă cu Porsche Cayenne. Acest exemplar din 2008 are motorul 3.0 V6 TDI de 225 CP, cutie automată și tracțiune integrală 4Motion, iar conform anunțului are toate reviziile la zi.",
    highlights: [
      "Motor 3.0 V6 TDI de 225 CP",
      "Tracțiune integrală 4Motion",
      "Cutie automată",
      "Toate reviziile la zi, conform anunțului",
    ],
    idealFor: "cine vrea un SUV mare, confortabil și capabil să tracteze, la preț de mașină mică",
    faqs: [
      {
        q: "Ce poate tracta un VW Touareg 3.0 TDI?",
        a: "Touareg 3.0 V6 TDI este omologat de regulă pentru remorci frânate de până la 3.500 kg, una dintre cele mai mari capacități din clasă. Verifică valoarea exactă în certificatul de înmatriculare.",
      },
      {
        q: "Merită un Touareg cu 296.000 km?",
        a: "Motorul V6 TDI și transmisia 4Motion sunt gândite pentru kilometraje mari, iar acest exemplar are reviziile la zi. Mașina e verificată înainte de vânzare.",
      },
    ],
  },
  "bmw-x6-2010-278000-1520006809": {
    pitch: "BMW X6 xDrive 3.0d 245 CP, SUV coupé înmatriculat în România",
    intro:
      "BMW X6 a creat segmentul SUV coupé: poziție înaltă de condus, tracțiune xDrive și o linie sportivă inconfundabilă. Exemplarul din 2010 are motorul diesel 3.0 de 245 CP, normă Euro 5, și este deja înmatriculat în România, deci îl poți conduce acasă imediat.",
    highlights: [
      "Diesel 3.0 de 245 CP",
      "Tracțiune integrală xDrive",
      "Deja înmatriculat în România",
      "Caroserie SUV coupé, 5 uși",
    ],
    idealFor: "cine vrea un SUV premium cu aspect sportiv și putere mare la un preț accesibil",
    faqs: [
      {
        q: "Ce consum are BMW X6 3.0d?",
        a: "BMW X6 cu motorul diesel 3.0 consumă de obicei 9–10 l/100 km în regim mixt, în funcție de stilul de condus.",
      },
      {
        q: "BMW X6 este înmatriculat?",
        a: "Da, acest BMW X6 este deja înmatriculat în România, așa că transferul de proprietate se face rapid.",
      },
    ],
  },
  "audi-a6-2015-0-6008006809": {
    pitch: "Audi A6 2.0 TDI ultra 190 CP automat Euro 6, berlină premium economică",
    intro:
      "Audi A6 C7 facelift din 2015 combină confortul unei berline premium cu un consum de compactă. Versiunea ultra are motorul 2.0 TDI de 190 CP, reglat pentru eficiență, cutie automată și normă Euro 6.",
    highlights: [
      "Motor 2.0 TDI ultra de 190 CP",
      "Cutie automată",
      "Normă Euro 6",
      "Berlină premium, foarte confortabilă pe autostradă",
    ],
    idealFor: "drumuri lungi, oameni de afaceri și cine vrea o mașină premium cu consum mic",
    faqs: [
      {
        q: "Ce înseamnă Audi A6 ultra?",
        a: "Ultra este eticheta Audi pentru versiunile optimizate pentru consum: motorul 2.0 TDI de 190 CP are o eficiență ridicată, cu un consum mixt de aproximativ 5 l/100 km în condiții normale.",
      },
      {
        q: "Este Audi A6 2.0 TDI Euro 6?",
        a: "Da, acest Audi A6 din 2015 are normă de poluare Euro 6.",
      },
    ],
  },
  "bmw-x1-x-2013-24300-7838006809": {
    pitch: "BMW X1 xDrive 2.0d, SUV compact premium cu tracțiune integrală",
    intro:
      "BMW X1 este SUV-ul compact al BMW, cu poziția de condus înaltă a unui SUV și manevrabilitatea unei mașini compacte. Exemplarul din 2013 are motorul diesel 2.0, tracțiune integrală xDrive și normă Euro 5.",
    highlights: [
      "Tracțiune integrală xDrive (4x4)",
      "Motor diesel 2.0",
      "SUV compact, ușor de condus în oraș",
      "Toate actele de înmatriculare incluse gratuit, conform anunțului",
    ],
    idealFor: "cine vrea un SUV premium compact, sigur iarna, pentru oraș și drumuri de weekend",
    faqs: [
      {
        q: "Ce înseamnă BMW X1 xDrive?",
        a: "xDrive este tracțiunea integrală BMW: împarte cuplul între punți în funcție de aderență, pentru siguranță pe zăpadă, ploaie și drumuri neasfaltate.",
      },
      {
        q: "Ce consum are BMW X1 xDrive 2.0d?",
        a: "BMW X1 xDrive cu motorul diesel 2.0 consumă de regulă 6–7 l/100 km în regim mixt.",
      },
    ],
  },
};

export function carEditorial(slug: string): CarEditorial | null {
  return CAR_EDITORIAL[slug] ?? null;
}
