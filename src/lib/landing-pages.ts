import type { Tables } from "@/integrations/supabase/types";
import { GEO_LANDING_PAGES } from "@/lib/landing-pages-geo";

export type Car = Tables<"cars">;

export interface LandingFaq {
  q: string;
  a: string;
}

export interface LandingPage {
  slug: string;
  h1: string;
  title: string;
  description: string;
  keywords: string;
  eyebrow: string;
  intro: string;
  /** Filtrul aplicat peste stoc pentru mașinile afișate pe pagină. */
  match: (car: Car) => boolean;
  /** Secțiuni de conținut unic (H2 + text) — evită duplicate content. */
  sections: Array<{ h2: string; body: string }>;
  faqs: LandingFaq[];
}

const CITY = "Cluj-Napoca";

function norm(value: string | null | undefined): string {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function byMake(make: string, model?: string) {
  return (car: Car) =>
    norm(car.make).includes(norm(make)) &&
    (!model || norm(`${car.model} ${car.trim ?? ""}`).includes(norm(model)));
}

function byPrice(min: number, max: number) {
  return (car: Car) => Number(car.price) >= min && Number(car.price) <= max;
}

interface ModelSeed {
  slug: string;
  brand: string;
  model?: string;
  label: string;
  strengths: string;
  checks: string;
  /** Filtru custom pentru categorii care nu sunt mărci (SUV, break, automate). */
  match?: (car: Car) => boolean;
}

const MODEL_SEEDS: ModelSeed[] = [
  {
    slug: "dacia-sandero-second-hand-cluj",
    brand: "Dacia",
    model: "Sandero",
    label: "Dacia Sandero",
    strengths:
      "cost de întreținere mic, piese ieftine și disponibile în orice service din Cluj, consum redus și o valoare de revânzare stabilă pe piața locală",
    checks:
      "ambreiajul la versiunile 0.9 TCe, starea suporților de motor și istoricul de revizii la 15.000 km",
  },
  {
    slug: "dacia-duster-second-hand-cluj",
    brand: "Dacia",
    model: "Duster",
    label: "Dacia Duster",
    strengths:
      "gardă la sol mare pentru drumurile din Apuseni, versiuni 4x4 accesibile și costuri de service minime",
    checks: "cutia de transfer la variantele 4x4, rulmenții de roată și uzura amortizoarelor",
  },
  {
    slug: "volkswagen-golf-second-hand-cluj",
    brand: "Volkswagen",
    model: "Golf",
    label: "Volkswagen Golf",
    strengths:
      "cea mai căutată mașină rulată din Germania: finisaje solide, consum echilibrat și piese la orice colț",
    checks:
      "lanțul de distribuție la 1.4 TSI, mecatronica la cutiile DSG și dosarul de daune al caroseriei",
  },
  {
    slug: "volkswagen-passat-second-hand-cluj",
    brand: "Volkswagen",
    model: "Passat",
    label: "Volkswagen Passat",
    strengths:
      "spațiu de break pentru familie sau firmă, motorizări 2.0 TDI economice pe drum lung și dotări de clasă superioară",
    checks: "pompa de înaltă presiune, filtrul de particule și starea cutiei DSG",
  },
  {
    slug: "skoda-octavia-second-hand-cluj",
    brand: "Skoda",
    model: "Octavia",
    label: "Skoda Octavia",
    strengths:
      "portbagaj uriaș, mecanică VW verificată și cel mai bun raport spațiu/preț dintre mașinile rulate din Germania",
    checks: "consumul de ulei la 1.8 TSI, distribuția și istoricul de service digital",
  },
  {
    slug: "bmw-second-hand-cluj",
    brand: "BMW",
    label: "BMW (Seria 3, Seria 5, X5, X6)",
    strengths:
      "tracțiune spate sau xDrive, dotări premium la preț de mașină medie în România și motoare diesel cu consum rezonabil",
    checks:
      "lanțul de distribuție la N47, turbina, sistemul de răcire și uzura brațelor de suspensie",
  },
  {
    slug: "mercedes-second-hand-cluj",
    brand: "Mercedes",
    label: "Mercedes-Benz (C-Class, E-Class)",
    strengths:
      "confort de drum lung, materiale durabile și o depreciere lentă pe piața din Cluj",
    checks: "cutia 7G-Tronic, injectoarele la motoarele OM651 și starea suspensiei pneumatice",
  },
  {
    slug: "audi-a4-second-hand-cluj",
    brand: "Audi",
    model: "A4",
    label: "Audi A4",
    strengths:
      "quattro pe versiunile echipate, interior sobru care rezistă în timp și motorizări 2.0 TDI eficiente",
    checks: "consumul de ulei, lanțul de distribuție și electronica de confort",
  },
  {
    slug: "ford-focus-second-hand-cluj",
    brand: "Ford",
    model: "Focus",
    label: "Ford Focus",
    strengths:
      "cel mai bun comportament dinamic din clasă, piese ieftine și motorizări 1.5 TDCi/EcoBoost economice",
    checks: "cutia PowerShift la variantele automate, garnitura de chiulasă la 1.0 EcoBoost",
  },
  {
    slug: "opel-astra-second-hand-cluj",
    brand: "Opel",
    model: "Astra",
    label: "Opel Astra",
    strengths: "preț de intrare mic, dotări bogate pe versiunile germane și service accesibil",
    checks: "distribuția pe curea, senzorii de presiune și starea ambreiajului",
  },
  {
    slug: "renault-clio-second-hand-cluj",
    brand: "Renault",
    model: "Clio",
    label: "Renault Clio",
    strengths: "mașină de oraș ideală pentru Cluj-Napoca, consum mic și parcare ușoară",
    checks: "cutia EDC, injectoarele la 1.5 dCi și istoricul de kilometraj",
  },
  {
    slug: "hyundai-i30-second-hand-cluj",
    brand: "Hyundai",
    model: "i30",
    label: "Hyundai i30",
    strengths:
      "fiabilitate coreeană, dotări generoase pentru bani și consum mic la motorizările 1.6 CRDi",
    checks: "starea bateriei la variantele mild-hybrid și uzura discurilor de frână",
  },
  {
    slug: "toyota-second-hand-cluj",
    brand: "Toyota",
    label: "Toyota",
    strengths:
      "cea mai mică rată de defecțiuni din piață, hibrizi cu consum de 5 l/100 km în oraș și costuri de service previzibile",
    checks: "starea bateriei hibride, uzura frânelor și istoricul de revizii Toyota",
  },
  {
    slug: "peugeot-second-hand-cluj",
    brand: "Peugeot",
    label: "Peugeot",
    strengths: "confort de rulare bun, dotări generoase și motorizări BlueHDi economice pe drum lung",
    checks: "lanțul de distribuție la 1.2 PureTech, AdBlue și filtrul de particule",
  },
  {
    slug: "renault-second-hand-cluj",
    brand: "Renault",
    label: "Renault",
    strengths: "piese ieftine, rețea de service densă în Cluj și motoare 1.5 dCi verificate în timp",
    checks: "injectoarele, turbina și cutia EDC",
  },
  {
    slug: "hyundai-second-hand-cluj",
    brand: "Hyundai",
    label: "Hyundai",
    strengths: "dotări multe la preț mic, fiabilitate foarte bună și consum redus",
    checks: "ambreiajul, discurile de frână și istoricul de daune",
  },
  {
    slug: "kia-second-hand-cluj",
    brand: "Kia",
    label: "Kia",
    strengths: "garanție lungă de la producător, design modern și costuri de întreținere mici",
    checks: "distribuția, cutia DCT și starea suspensiei",
  },
  {
    slug: "nissan-qashqai-second-hand-cluj",
    brand: "Nissan",
    model: "Qashqai",
    label: "Nissan Qashqai",
    strengths: "poziție înaltă de condus, spațiu bun pentru familie și consum rezonabil de SUV compact",
    checks: "cutia CVT, rulmenții și starea trapei panoramice",
  },
  {
    slug: "seat-second-hand-cluj",
    brand: "Seat",
    label: "Seat",
    strengths: "aceeași mecanică VW la un preț mai mic și dotări sportive din fabrică",
    checks: "distribuția la TSI, cutia DSG și istoricul digital de service",
  },
  {
    slug: "suv-second-hand-cluj",
    brand: "",
    match: (car) => norm(car.body_type).includes("suv") || norm(car.body_type).includes("teren"),
    label: "SUV",
    strengths:
      "gardă la sol pentru drumurile de munte din Apuseni, siguranță sporită și portbagaj generos",
    checks: "sistemul 4x4, cutia de transfer și uzura amortizoarelor",
  },
  {
    slug: "break-second-hand-cluj",
    brand: "",
    match: (car) => norm(car.body_type).includes("break") || norm(car.body_type).includes("combi"),
    label: "Break",
    strengths: "portbagaj mare pentru familie sau firmă, consum mic pe autostradă și confort pe drum lung",
    checks: "suspensia spate, hayonul electric și starea barelor de plafon",
  },
  {
    slug: "masini-automate-second-hand-cluj",
    brand: "",
    match: (car) => norm(car.gearbox).includes("automat"),
    label: "Mașini cu cutie automată",
    strengths: "confort maxim în traficul din Cluj-Napoca și uzură mai mică a ambreiajului",
    checks: "schimbul de ulei la cutie, mecatronica și comportamentul la schimbări la rece",
  },
];


const modelPages: LandingPage[] = MODEL_SEEDS.map((seed) => {
  const name = seed.label;
  const short = seed.model ? `${seed.brand} ${seed.model}` : seed.brand || seed.label;
  return {
    slug: seed.slug,
    h1: `${name} second hand în ${CITY}`,
    title: `${short} second hand Cluj — Bremen Auto Florești`.slice(0, 60),
    description:
      `${short} second hand adus din Germania, disponibil în parcul Bremen Auto de pe DN1 Florești, lângă Cluj-Napoca. Km verificați, acte complete, cash sau în rate.`.slice(
        0,
        160,
      ),
    keywords: `${short.toLowerCase()} second hand cluj, ${short.toLowerCase()} rulat cluj-napoca, ${short.toLowerCase()} din germania cluj, dealer auto cluj, parc auto Florești`,
    eyebrow: `${short} · Florești · Cluj`,
    intro: `Cauți un ${short} second hand în Cluj-Napoca? La Bremen Auto, pe DN1 în Luna de Sus (comuna Florești), aducem ${name} direct din Germania: kilometraj verificat, dosar de daune consultat și carte de service la vedere. Poți veni la o probă de drum oricând — programul este non-stop.`,
    match: seed.match ?? byMake(seed.brand, seed.model),
    sections: [
      {
        h2: `De ce merită un ${short} rulat din Germania`,
        body: `Un ${short} adus din Germania are, în general, întreținere făcută la timp și un istoric documentat. Punctele forte pe care le apreciază clienții din Cluj: ${seed.strengths}.`,
      },
      {
        h2: `Ce verificăm noi la fiecare ${short}`,
        body: `Înainte să intre în parc, verificăm ${seed.checks}. Dacă mașina are un defect, îl scriem în anunț — preferăm un client informat unui client întors.`,
      },
      {
        h2: `Cumpără ${short} cash sau în rate`,
        body: `Poți plăti cash, prin transfer bancar, prin credit auto sau în leasing. Pregătim dosarul de finanțare și dosarul complet de înmatriculare în România, iar mașina ta actuală o putem prelua la schimb (buy-back).`,
      },
    ],
    faqs: [
      {
        q: `Cât costă un ${short} second hand în Cluj?`,
        a: `Prețurile din stocul Bremen Auto pornesc de la modelele de buget și urcă în funcție de an, kilometraj și dotări. Toate prețurile afișate pe site sunt finale, în euro, fără taxe ascunse.`,
      },
      {
        q: `Pot proba ${short}-ul înainte să îl cumpăr?`,
        a: `Da. Faci probă de drum pe DN1 și poți duce mașina la un service la alegerea ta pentru verificare, înainte de semnarea actelor.`,
      },
      {
        q: `Ce acte primesc la un ${short} adus din Germania?`,
        a: `Factură, contract de vânzare-cumpărare, cartea de identitate a vehiculului și dosarul complet pentru înmatriculare în România.`,
      },
      {
        q: `Se poate ${short} în rate la Bremen Auto?`,
        a: `Da, prin credit auto sau leasing, cu aprobare rapidă. Sună la 0751 692 335 și calculăm rata în aceeași zi.`,
      },
    ],
  } satisfies LandingPage;
});

const pricePages: LandingPage[] = [
  { slug: "masini-second-hand-sub-5000-euro-cluj", min: 0, max: 5000, label: "sub 5.000 €" },
  {
    slug: "masini-second-hand-5000-10000-euro-cluj",
    min: 5000,
    max: 10000,
    label: "între 5.000 și 10.000 €",
  },
  {
    slug: "masini-second-hand-sub-10000-euro-cluj",
    min: 0,
    max: 10000,
    label: "sub 10.000 €",
  },
  {
    slug: "masini-second-hand-10000-15000-euro-cluj",
    min: 10000,
    max: 15000,
    label: "între 10.000 și 15.000 €",
  },
].map((seed) => ({
  slug: seed.slug,
  h1: `Mașini second hand ${seed.label} în ${CITY}`,
  title: `Mașini second hand ${seed.label} Cluj | Bremen Auto`.slice(0, 60),
  description:
    `Mașini second hand ${seed.label} din Germania, în parcul Bremen Auto de pe DN1 Florești, lângă Cluj-Napoca. Km verificați, acte complete, cash sau în rate.`.slice(
      0,
      160,
    ),
  keywords: `masini second hand ${seed.label} cluj, auto ieftine cluj-napoca, masini din germania cluj, parc auto Florești, dealer auto cluj`,
  eyebrow: `Buget ${seed.label} · Cluj`,
  intro: `Selecția de mașini second hand ${seed.label} din stocul Bremen Auto, parc auto pe DN1 în Luna de Sus (Florești), la 10 minute de Cluj-Napoca. Toate sunt aduse din Germania, cu kilometraj verificat și acte complete.`,
  match: byPrice(seed.min, seed.max),
  sections: [
    {
      h2: `Ce poți lua cu un buget ${seed.label}`,
      body: `În acest interval de preț găsești mașini rulate întreținute, cu dotări reale și consum decent. Nu vindem mașini „de aruncat": chiar și în zona de buget, fiecare autoturism trece prin verificare tehnică și primește revizie înainte de livrare.`,
    },
    {
      h2: "Prețul afișat este prețul final",
      body: `Prețurile de pe site sunt în euro și includ mașina cu actele pregătite pentru înmatriculare. Nu percepem comisioane ascunse, iar diferența de curs o discutăm transparent la semnare.`,
    },
    {
      h2: `Mașini ${seed.label} în rate`,
      body: `Chiar și în zona de buget poți plăti în rate: credit auto sau leasing, cu dosar pregătit de noi. Poți lăsa mașina actuală la schimb pentru a reduce avansul.`,
    },
  ],
  faqs: [
    {
      q: `Ce mașini second hand găsesc ${seed.label} în Cluj?`,
      a: `Stocul se schimbă săptămânal. Pe această pagină vezi în timp real mașinile disponibile în acest buget la Bremen Auto, pe DN1 Florești.`,
    },
    {
      q: "Mașinile ieftine sunt verificate la fel de atent?",
      a: "Da. Indiferent de preț, verificăm kilometrajul, dosarul de daune și starea tehnică, iar defectele le trecem în anunț.",
    },
    {
      q: "Pot cumpăra o mașină ieftină în rate?",
      a: "Da, prin credit auto sau leasing. Rata se calculează în funcție de avans și de perioadă — sună la 0751 692 335.",
    },
  ],
}));

const thematicPages: LandingPage[] = [
  {
    slug: "masini-second-hand-in-rate-cluj",
    h1: "Mașini second hand în rate în Cluj-Napoca",
    title: "Mașini second hand în rate Cluj | Bremen Auto",
    description:
      "Cumperi mașină second hand în rate în Cluj: credit auto, leasing sau buy-back, cu dosar pregătit de noi. Parc auto pe DN1 Florești, acte complete, non-stop.",
    keywords:
      "masini second hand cluj in rate, auto rulate cluj credit, credit auto cluj, leasing auto cluj, masini din germania cluj rate",
    eyebrow: "Credit auto · Leasing · Buy-back",
    intro:
      "La Bremen Auto poți cumpăra o mașină second hand din Germania în rate, fără drumuri inutile la bancă. Pregătim dosarul de credit auto sau de leasing, iar mașina ta actuală o putem prelua la schimb ca avans.",
    match: () => true,
    sections: [
      {
        h2: "Credit auto, leasing sau buy-back — care ți se potrivește",
        body: "Creditul auto îți dă mașina pe numele tău din prima zi și e potrivit pentru persoane fizice. Leasingul este avantajos pentru firme, cu TVA deductibil pe rată. Buy-back-ul înseamnă că preluăm mașina ta actuală la un preț corect și o folosim ca avans.",
      },
      {
        h2: "De ce ai nevoie pentru aprobare",
        body: "În general: buletin, adeverință de venit sau extras de cont și, pentru firme, ultimul bilanț. Trimitem dosarul la mai multe instituții financiare și îți spunem în aceeași zi ce rată primești.",
      },
      {
        h2: "Rate fără surprize",
        body: "Îți arătăm rata finală, dobânda și costul total înainte să semnezi ceva. Nu adăugăm asigurări sau servicii pe care nu le-ai cerut.",
      },
    ],
    faqs: [
      {
        q: "Ce avans trebuie la o mașină second hand în rate în Cluj?",
        a: "În mod obișnuit între 15% și 25% din preț, în funcție de finanțator. Cu buy-back, mașina ta actuală poate acoperi integral avansul.",
      },
      {
        q: "Cât durează aprobarea creditului auto?",
        a: "De regulă în aceeași zi sau în maximum 48 de ore de la depunerea documentelor.",
      },
      {
        q: "Pot lua mașina în leasing pe firmă?",
        a: "Da. Pregătim documentația de leasing financiar pentru PFA și SRL, cu rate deductibile.",
      },
      {
        q: "Se poate rate fără adeverință de venit?",
        a: "Unii finanțatori acceptă extras de cont pe ultimele luni. Trimite-ne situația pe WhatsApp și îți spunem exact ce variante ai.",
      },
    ],
  },
  {
    slug: "parc-auto-floresti-cluj",
    h1: "Parc auto în Florești, Cluj — pe DN1, Luna de Sus",
    title: "Parc auto Florești Cluj, DN1 | Bremen Auto",
    description:
      "Parc auto pe DN1 în Luna de Sus, comuna Florești, la 10 minute de Cluj-Napoca. Mașini second hand din Germania, vizionare non-stop, probă de drum, acte complete.",
    keywords:
      "parc auto Florești cluj, parc auto luna de sus, parc auto cluj-napoca, dealer auto cluj, masini second hand langa mine cluj, parc auto deschis non-stop cluj",
    eyebrow: "DN1 · Luna de Sus · Florești",
    intro:
      "Bremen Auto este un parc auto pe DN1, în Luna de Sus (comuna Florești), pe drumul dintre Cluj-Napoca și Huedin/Oradea. Vii, vezi mașinile pe viu, faci proba de drum și pleci cu actele pregătite.",
    match: () => true,
    sections: [
      {
        h2: "Cum ajungi la noi din Cluj-Napoca",
        body: "Ieși din Cluj-Napoca pe Calea Florești spre Oradea (E60/DN1), treci prin Florești și continui până în Luna de Sus. Parcul este chiar pe marginea DN1, pe dreapta. Drumul durează aproximativ 10-15 minute din Mănăștur.",
      },
      {
        h2: "Program non-stop, vizionare când poți tu",
        body: "Nu ai program de lucru de 9-17 și nici noi nu îl impunem. Sună sau scrie pe WhatsApp la 0751 692 335 și stabilim o vizionare, inclusiv seara sau în weekend.",
      },
      {
        h2: "Ce poți face în parc",
        body: "Vezi mașinile în lumină naturală, verifici caroseria, pornești motorul la rece, faci probă de drum pe DN1 și poți duce mașina la un service ales de tine pentru diagnoză.",
      },
    ],
    faqs: [
      {
        q: "Unde este parcul auto Bremen Auto?",
        a: "Pe DN1, în Luna de Sus, comuna Florești, județul Cluj, la circa 10 minute de Cluj-Napoca pe direcția Oradea.",
      },
      {
        q: "Trebuie programare pentru vizionare?",
        a: "Un telefon scurt ajută ca să fim siguri că mașina dorită este în parc, dar programul este non-stop.",
      },
      {
        q: "Există parc auto deschis 24/7 în Cluj?",
        a: "Bremen Auto lucrează non-stop pe bază de telefon: 0751 692 335.",
      },
    ],
  },
  {
    slug: "masini-din-germania-cluj",
    h1: "Mașini din Germania aduse în Cluj-Napoca",
    title: "Mașini din Germania Cluj | Bremen Auto Florești",
    description:
      "Mașini aduse direct din Germania în Cluj: kilometraj verificat, dosar de daune, carte service și acte complete pentru înmatriculare. DN1 Florești, cash sau rate.",
    keywords:
      "masini din germania cluj, auto aduse din germania cluj-napoca, import auto germania cluj, masini rulate germania Florești",
    eyebrow: "Import direct · Germania",
    intro:
      "Aducem autoturisme direct din Germania — din parcuri și licitații pe care le vizităm personal. Fiecare mașină ajunge în Cluj cu istoricul de kilometraj verificat și dosarul de daune consultat.",
    match: () => true,
    sections: [
      {
        h2: "Cum alegem mașinile în Germania",
        body: "Selectăm la fața locului: verificăm caroseria, citim eroarea din calculator, cerem cartea de service și rulăm istoricul de kilometraj. Nu cumpărăm mașini din poze și nu revindem anunțuri copiate.",
      },
      {
        h2: "Înmatricularea în România, pas cu pas",
        body: "Primești factură, contract, cartea de identitate a vehiculului și documentele germane. Urmează RAR, ITP și înmatricularea la Serviciul de Înmatriculări Cluj. Te ghidăm la fiecare pas, iar dosarul îl pregătim noi.",
      },
      {
        h2: "Mașini aduse la comandă",
        body: "Dacă nu găsești modelul dorit în stoc, ni-l spui împreună cu bugetul și îl căutăm în Germania. De obicei găsim varianta potrivită în 1-3 săptămâni.",
      },
    ],
    faqs: [
      {
        q: "Cât durează înmatricularea unei mașini din Germania?",
        a: "În general 1-2 săptămâni de la cumpărare, în funcție de programările la RAR și la Serviciul de Înmatriculări din Cluj.",
      },
      {
        q: "Cum verific kilometrajul unei mașini din Germania?",
        a: "Prin istoricul digital de service și rapoarte de kilometraj. Îți arătăm raportul înainte de cumpărare, pentru fiecare mașină.",
      },
      {
        q: "Mașinile din Germania sunt mai bune decât cele din România?",
        a: "De regulă au întreținere documentată și dotări superioare la același preț, pentru că piața germană este mult mai mare.",
      },
    ],
  },
  {
    slug: "dealer-auto-cluj",
    h1: "Dealer auto în Cluj-Napoca — mașini rulate verificate",
    title: "Dealer auto Cluj-Napoca | Bremen Auto Florești",
    description:
      "Dealer auto lângă Cluj-Napoca, pe DN1 Florești: mașini second hand din Germania, verificate tehnic, cu acte complete. Cash, credit auto sau leasing. Non-stop.",
    keywords:
      "dealer auto cluj, dealer masini cluj-napoca, masini de vanzare cluj, cumparare masini rulate cluj, masini verificate cluj, auto cu acte complete cluj",
    eyebrow: "Dealer local · Cluj",
    intro:
      "Bremen Auto este un dealer local de mașini rulate, nu un intermediar. Cumpărăm noi mașinile în Germania, le pregătim tehnic și le vindem direct în parcul de pe DN1, Florești.",
    match: () => true,
    sections: [
      {
        h2: "Ce ne diferențiază de un anunț de pe OLX",
        body: "Ai o firmă în spate, factură, contract și un loc fizic unde te poți întoarce. Verificarea tehnică o facem înainte de vânzare, nu după reclamația clientului.",
      },
      {
        h2: "Cumperi mașini verificate, cu acte complete",
        body: "Fiecare autoturism vine cu dosar de înmatriculare complet, carte de identitate și istoric de service. Poți duce mașina la orice service din Cluj pentru o a doua opinie.",
      },
      {
        h2: "Vindem, preluăm la schimb și căutăm la comandă",
        body: "Poți cumpăra din stoc, poți lăsa mașina veche la schimb sau ne poți comanda un model anume din Germania, în bugetul tău.",
      },
    ],
    faqs: [
      {
        q: "De ce să cumpăr de la un dealer și nu de la persoană fizică?",
        a: "Pentru factură, contract, verificare tehnică prealabilă și un partener la care te poți întoarce cu întrebări după vânzare.",
      },
      {
        q: "Preiei mașina mea la schimb?",
        a: "Da, facem buy-back: evaluăm mașina ta și scădem valoarea din prețul celei noi.",
      },
      {
        q: "Pot cumpăra o mașină pe firmă?",
        a: "Da, emitem factură pe firmă și putem structura achiziția în leasing financiar.",
      },
    ],
  },
];

export const LANDING_PAGES: LandingPage[] = [
  ...modelPages,
  ...pricePages,
  ...thematicPages,
  ...GEO_LANDING_PAGES,
];

export function getLandingPage(slug: string): LandingPage | undefined {
  return LANDING_PAGES.find((p) => p.slug === slug);
}

export const LANDING_SLUGS = LANDING_PAGES.map((p) => p.slug);
