import type { LandingPage, Car } from "@/lib/landing-pages";

/**
 * Pagini programatice marcă × oraș, segment × oraș și buget × oraș.
 * Fiecare pagină primește un intro compus din date reale despre model/segment,
 * despre oraș (distanță, drum, cerere locală) și despre modul de cumpărare —
 * astfel încât textul să fie unic și util, nu un template repetat.
 */

function norm(value: string | null | undefined): string {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

interface City {
  slug: string;
  name: string;
  county: string;
  /** Drumul până la parcul din Luna de Sus. */
  route: string;
  /** Cost orientativ de livrare. */
  delivery: string;
  /** Ce se caută în zonă. */
  demand: string;
  /** Unde se înmatriculează. */
  registration: string;
}

const CITIES: City[] = [
  {
    slug: "cluj-napoca",
    name: "Cluj-Napoca",
    county: "județul Cluj",
    route: "12 km pe DN1/E60 prin Florești, 15-20 de minute din Mănăștur",
    delivery: "fără cost de transport — vii direct în parc și pleci cu mașina",
    demand:
      "naveta zilnică pe axa Florești–Mărăști, parcări strâmte în cartiere și ieșiri de weekend spre Apuseni",
    registration: "ghișeul DRPCIV din Cluj-Napoca, cu programare pe drpciv.ro",
  },
  {
    slug: "floresti",
    name: "Florești",
    county: "județul Cluj",
    route: "5 minute pe DN1 — parcul este în Luna de Sus, sat al comunei Florești",
    delivery: "livrare gratuită la domiciliu în comună",
    demand:
      "mașini de oraș pentru traficul de pe Avram Iancu și SUV-uri pentru familiile mutate recent în comună",
    registration: "ghișeul DRPCIV Cluj-Napoca, la 15 minute de comună",
  },
  {
    slug: "turda",
    name: "Turda",
    county: "județul Cluj",
    route: "45 km pe A3 și DN1, aproximativ 40 de minute",
    delivery: "transport pe platformă în jur de 250-350 lei sau vii singur pe autostradă",
    demand:
      "mașini fiabile pentru navetă spre Cluj-Napoca și utilitare mici pentru firmele locale",
    registration: "ghișeul DRPCIV Cluj-Napoca; programarea se face online",
  },
  {
    slug: "dej",
    name: "Dej",
    county: "județul Cluj",
    route: "70 km pe DN1C și DN1, în jur de o oră",
    delivery: "transport pe platformă orientativ 350-450 lei",
    demand:
      "mașini cu gardă la sol mai mare pentru drumurile din Someș și diesel-uri economice pentru drum lung",
    registration: "ghișeul DRPCIV Cluj-Napoca sau ghișeul local pentru documente preliminare",
  },
];

interface BrandSeed {
  slug: string;
  label: string;
  make: string;
  model: string;
  /** De ce se caută modelul. */
  why: string;
  /** Ce verificăm noi la acest model. */
  checks: string;
  /** Motorizări tipice în stocul german. */
  engines: string;
  budget: string;
}

const BRANDS: BrandSeed[] = [
  {
    slug: "bmw-seria-5",
    label: "BMW Seria 5",
    make: "BMW",
    model: "Seria 5",
    why: "berlină de drum lung cu tracțiune spate sau xDrive, dotări premium la preț de mașină medie în România",
    checks:
      "lanțul de distribuție la motoarele N47, turbina, sistemul de răcire și brațele de suspensie",
    engines: "520d și 530d, cele mai des întâlnite în parcurile germane",
    budget: "8.000-16.000 €",
  },
  {
    slug: "volkswagen-passat",
    label: "Volkswagen Passat",
    make: "Volkswagen",
    model: "Passat",
    why: "break spațios pentru familie sau firmă, cu consum mic pe autostradă și piese ieftine",
    checks: "pompa de înaltă presiune, filtrul de particule și mecatronica DSG",
    engines: "2.0 TDI de 150 sau 190 CP",
    budget: "6.000-14.000 €",
  },
  {
    slug: "audi-a4",
    label: "Audi A4",
    make: "Audi",
    model: "A4",
    why: "interior sobru care rezistă în timp, quattro pe versiunile echipate și confort de drum lung",
    checks: "consumul de ulei, lanțul de distribuție și electronica de confort",
    engines: "2.0 TDI, ocazional 2.0 TFSI",
    budget: "7.000-15.000 €",
  },
  {
    slug: "skoda-octavia",
    label: "Skoda Octavia",
    make: "Skoda",
    model: "Octavia",
    why: "cel mai bun raport spațiu/preț: mecanică VW verificată și portbagaj de clasă superioară",
    checks: "distribuția, consumul de ulei la 1.8 TSI și istoricul de service digital",
    engines: "1.6 TDI și 2.0 TDI",
    budget: "5.000-12.000 €",
  },
];

interface SegmentSeed {
  slug: string;
  label: string;
  why: string;
  advice: string;
  match: (car: Car) => boolean;
}

const SEGMENTS: SegmentSeed[] = [
  {
    slug: "suv-diesel-automat",
    label: "SUV diesel automat",
    why: "poziție de condus înaltă, tracțiune bună iarna și cutie automată pentru trafic",
    advice:
      "verifică istoricul de revizii al cutiei automate (schimb de ulei la 60.000 km) și starea filtrului de particule, mai ales dacă mașina a fost folosită doar în oraș",
    match: (car) =>
      norm(car.body_type).includes("suv") &&
      norm(car.fuel).includes("diesel") &&
      norm(car.gearbox).includes("autom"),
  },
  {
    slug: "break-familie",
    label: "Break de familie",
    why: "portbagaj de 500-600 litri, confort pe drum lung și consum de berlină",
    advice:
      "urmărește starea amortizoarelor spate (breakurile germane cară greutate) și existența cârligului de remorcare demontabil",
    match: (car) =>
      ["break", "combi", "kombi", "estate", "avant", "variant", "touring", "sw"].some((k) =>
        norm(car.body_type).includes(k),
      ),
  },
  {
    slug: "masini-automate",
    label: "Mașini automate",
    why: "cutie automată pentru traficul din oraș, fără ambreiaj de schimbat",
    advice:
      "cere dovada schimbului de ulei la cutie și fă o probă lungă, cu accelerări și frânări, ca să simți eventualele șocuri la schimbarea treptelor",
    match: (car) => norm(car.gearbox).includes("autom"),
  },
  {
    slug: "masini-mici-economice",
    label: "Mașini mici economice",
    why: "consum sub 6 litri, asigurare ieftină și parcare ușoară",
    advice:
      "atenție la kilometrajul real: mașinile mici din Germania sunt adesea folosite exclusiv în oraș, deci uzura e mai mare decât arată rulajul",
    match: (car) =>
      ["hatchback", "citadin", "mini", "compact"].some((k) => norm(car.body_type).includes(k)) ||
      Number(car.price) <= 6000,
  },
];

const BUDGETS: Array<{ max: number; label: string; note: string }> = [
  {
    max: 5000,
    label: "sub 5.000 €",
    note: "la acest buget mergem pe mașini de 10-14 ani, cu mecanică simplă și costuri mici de întreținere",
  },
  {
    max: 8000,
    label: "sub 8.000 €",
    note: "cea mai căutată plajă de preț: mașini de 8-12 ani, cu dotări decente și motorizări economice",
  },
  {
    max: 12000,
    label: "sub 12.000 €",
    note: "aici intră mașinile de 6-9 ani, multe cu cutie automată, navigație și pachet de asistență",
  },
];

const BASE_TRUST =
  "Fiecare mașină vine din Germania cu kilometraj verificat, dosar de daune consultat și carte de service. Plata se face cash, prin transfer bancar sau în rate, prin credit auto ori leasing, iar dosarul de înmatriculare este pregătit complet de noi.";

function faqCommon(city: City, subject: string) {
  return [
    {
      q: `Cum ajung din ${city.name} la parcul Bremen Auto?`,
      a: `Parcul este pe DN1, în Luna de Sus (comuna Florești), jud. Cluj. Din ${city.name} faci ${city.route}. Programul este non-stop, deci suni la 0751 692 335 și venim să îți arătăm mașina la ora care îți convine.`,
    },
    {
      q: `Livrați ${subject.toLowerCase()} în ${city.name}?`,
      a: `Da. ${city.delivery.charAt(0).toUpperCase() + city.delivery.slice(1)}. Mașina este asigurată pe durata transportului, iar actele ajung împreună cu ea sau prin curier.`,
    },
    {
      q: `Unde înmatriculez mașina dacă locuiesc în ${city.name}?`,
      a: `Înmatricularea se face la ${city.registration}, cu dosarul pe care ți-l predăm noi: factură, contract de vânzare-cumpărare, cartea de identitate a vehiculului și documentele de proveniență din Germania.`,
    },
    {
      q: "Pot plăti în rate?",
      a: "Da. Lucrăm cu credit auto și leasing, cu avans de la 15%, și pregătim dosarul împreună cu tine. Poți plăti și integral, cash sau prin transfer bancar.",
    },
  ];
}

function brandPage(brand: BrandSeed, city: City): LandingPage {
  const h1 = `${brand.label} second hand ${city.name}`;
  return {
    slug: `${brand.slug}-second-hand-${city.slug}`,
    h1,
    title: `${brand.label} second hand ${city.name} | Bremen Auto`,
    description: `${brand.label} adus din Germania pentru cumpărători din ${city.name}: km verificați, acte complete, cash sau în rate. Sună la 0751 692 335.`.slice(
      0,
      154,
    ),
    keywords: "",
    eyebrow: `${brand.label} · ${city.name}`,
    intro: `Cauți un ${brand.label} second hand în ${city.name}? La Bremen Auto, pe DN1 în Luna de Sus (comuna Florești), aducem ${brand.label} direct din Germania: ${brand.why}. Motorizările cu care ajung cel mai des la noi sunt ${brand.engines}, iar plaja realistă de preț pentru un exemplar bine întreținut este ${brand.budget}. Din ${city.name} ai ${city.route}, iar dacă nu vrei să te deplasezi, ${city.delivery}. Înainte să publicăm anunțul, la fiecare ${brand.label} verificăm ${brand.checks} — sunt exact punctele care fac diferența între o achiziție bună și o factură de service peste trei luni. Cumpărătorii din ${city.name} caută de obicei ${city.demand}, așa că îți spunem sincer dacă exemplarul din parc se potrivește cu felul în care conduci. ${BASE_TRUST}`,
    match: (car) => {
      if (!norm(car.make).includes(norm(brand.make))) return false;
      const haystack = norm(`${car.model} ${car.trim ?? ""}`);
      const model = norm(brand.model);
      return haystack.includes(model) || haystack.includes(model.replace("seria ", ""));
    },
    sections: [
      {
        h2: `Ce verificăm la un ${brand.label} înainte de vânzare`,
        body: `La fiecare ${brand.label} din parc controlăm ${brand.checks}. Cerem istoricul digital de service din Germania, verificăm kilometrajul în bazele de date și consultăm dosarul de daune. Poți duce mașina la orice service din ${city.name} pentru o a doua opinie, înainte să semnezi.`,
      },
      {
        h2: `Cât costă un ${brand.label} rulat în ${city.name}`,
        body: `Plaja normală pentru un ${brand.label} cu istoric curat este ${brand.budget}, în funcție de an, rulaj și dotări. Prețul afișat pe fiecare anunț este final pentru mașina adusă și pregătită de drum; îți spunem separat, transparent, cât costă transportul dacă alegi livrarea în ${city.name}.`,
      },
      {
        h2: "Cum cumperi: cash sau în rate",
        body: `Poți plăti integral (cash sau transfer bancar) sau în rate, prin credit auto ori leasing. Pregătim dosarul de finanțare și dosarul de înmatriculare pentru ${city.registration}. Rezervarea se poate face și de la distanță, cu avans, după o verificare video în direct a mașinii.`,
      },
    ],
    faqs: [
      {
        q: `De ce să cumpăr un ${brand.label} din Germania și nu de pe piața locală?`,
        a: `Pentru că exemplarele germane au istoric de service documentat, kilometraj verificabil și, de regulă, o întreținere mai riguroasă. ${brand.label} din import ajunge la un preț comparabil cu unul local, dar cu documentație completă.`,
      },
      ...faqCommon(city, `un ${brand.label}`),
    ],
  };
}

function segmentPage(segment: SegmentSeed, city: City): LandingPage {
  const h1 = `${segment.label} second hand ${city.name}`;
  return {
    slug: `${segment.slug}-second-hand-${city.slug}`,
    h1,
    title: `${segment.label} second hand ${city.name} | Bremen Auto`.slice(0, 59),
    description: `${segment.label} adus din Germania, disponibil pentru ${city.name}: km verificați, acte complete, cash sau în rate. Parc auto pe DN1 Florești.`.slice(
      0,
      154,
    ),
    keywords: "",
    eyebrow: `${segment.label} · ${city.name}`,
    intro: `Un ${segment.label.toLowerCase()} second hand este alegerea potrivită dacă vrei ${segment.why}. La Bremen Auto, pe DN1 în Luna de Sus lângă ${city.name}, filtrăm stocul exact pe acest criteriu, ca să nu pierzi timp printre anunțuri care nu te interesează. Cumpărătorii din ${city.name} aleg această categorie mai ales pentru ${city.demand}. Sfatul nostru concret la această categorie: ${segment.advice}. Toate mașinile sunt aduse din Germania, cu kilometraj verificat și dosar de daune consultat, iar dacă mașina potrivită nu e acum în parc, o căutăm la comandă în licitațiile și parcurile cu care lucrăm — de obicei în 7-14 zile. Din ${city.name} ai ${city.route}, iar pentru cine nu se poate deplasa, ${city.delivery}. ${BASE_TRUST}`,
    match: segment.match,
    sections: [
      {
        h2: `La ce să fii atent la un ${segment.label.toLowerCase()}`,
        body: `${segment.advice.charAt(0).toUpperCase() + segment.advice.slice(1)}. Îți arătăm rezultatele verificărilor înainte de rezervare și poți face probă de drum pe DN1 și pe autostradă.`,
      },
      {
        h2: `Cerere locală în ${city.name}`,
        body: `În ${city.name} această categorie se caută pentru ${city.demand}. De aceea ținem în parc exemplare cu rulaj rezonabil și dotările care contează practic: climatronic, senzori, cârlig sau navigație, nu extra-uri scumpe de întreținut.`,
      },
      {
        h2: "Livrare, acte și finanțare",
        body: `Pentru ${city.name}: ${city.delivery}. Înmatricularea se face la ${city.registration}, cu dosarul complet pregătit de noi. Plata poate fi cash, prin transfer sau în rate, cu credit auto ori leasing.`,
      },
    ],
    faqs: [
      {
        q: `Ce buget îmi trebuie pentru un ${segment.label.toLowerCase()} decent?`,
        a: `Depinde de an și rulaj, dar realist pornim de la 5.000-6.000 € pentru un exemplar sănătos și ajungem la 12.000-15.000 € pentru mașini de 6-8 ani, bine dotate. Îți spunem sincer ce se poate în bugetul tău.`,
      },
      ...faqCommon(city, `un ${segment.label.toLowerCase()}`),
    ],
  };
}

function budgetPage(budget: (typeof BUDGETS)[number], city: City): LandingPage {
  const h1 = `Mașini din Germania ${budget.label} în ${city.name}`;
  return {
    slug: `masini-din-germania-${budget.label.replace("sub ", "sub-").replace(".", "").replace(" €", "-euro")}-${city.slug}`,
    h1,
    title: `Mașini din Germania ${budget.label} ${city.name} | Bremen`.slice(0, 59),
    description: `Mașini second hand din Germania ${budget.label}, disponibile pentru ${city.name}: km verificați, acte complete, cash sau în rate.`.slice(
      0,
      154,
    ),
    keywords: "",
    eyebrow: `Buget ${budget.label} · ${city.name}`,
    intro: `Dacă ai un buget ${budget.label} și cauți o mașină adusă din Germania în ${city.name}, pagina aceasta îți arată exact ce avem acum în parc în acea plajă de preț. ${budget.note.charAt(0).toUpperCase() + budget.note.slice(1)}. Nu vindem promisiuni: prețul din anunț este prețul mașinii aduse și pregătite de drum, iar costul transportului până în ${city.name} ți-l comunicăm separat și clar — ${city.delivery}. Din ${city.name} până la parcul de pe DN1, Luna de Sus, ai ${city.route}. Cumpărătorii din zonă caută în această plajă mai ales mașini pentru ${city.demand}, așa că asta ținem în stoc. La orice mașină din acest buget verificăm kilometrajul în bazele de date germane, consultăm dosarul de daune și îți arătăm cartea de service. ${BASE_TRUST}`,
    match: (car) => Number(car.price) > 0 && Number(car.price) <= budget.max,
    sections: [
      {
        h2: `Ce se poate cumpăra ${budget.label}`,
        body: `${budget.note.charAt(0).toUpperCase() + budget.note.slice(1)}. Recomandăm să păstrezi 500-800 € din buget pentru înmatriculare, asigurare și o revizie completă imediat după cumpărare.`,
      },
      {
        h2: `Costuri reale pentru un cumpărător din ${city.name}`,
        body: `Peste prețul mașinii intră transportul (${city.delivery}), taxele de înmatriculare la ${city.registration} și RCA-ul. Îți facem un calcul complet înainte să rezervi, ca să știi suma finală.`,
      },
      {
        h2: "Rate fără drum în plus",
        body: `Poți face dosarul de finanțare de la distanță: trimiți documentele, primești răspunsul de la bancă sau IFN, iar mașina pleacă spre ${city.name} după semnarea contractului. Dacă la livrare mașina nu corespunde descrierii, avansul se returnează integral.`,
      },
    ],
    faqs: [
      {
        q: `Ce mașini găsesc realist ${budget.label}?`,
        a: `${budget.note.charAt(0).toUpperCase() + budget.note.slice(1)}. Sunt exemplare aduse din Germania, cu istoric verificat — nu mașini de licitație cu daune ascunse.`,
      },
      ...faqCommon(city, "o mașină din acest buget"),
    ],
  };
}

export const COMBO_PAGES: LandingPage[] = [
  ...BRANDS.flatMap((brand) => CITIES.map((city) => brandPage(brand, city))),
  ...SEGMENTS.flatMap((segment) =>
    CITIES.slice(0, 3).map((city) => segmentPage(segment, city)),
  ),
  ...BUDGETS.flatMap((budget) => CITIES.map((city) => budgetPage(budget, city))),
];
