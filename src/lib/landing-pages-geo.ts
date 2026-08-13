import type { LandingPage } from "@/lib/landing-pages";
import { GEO_LOCAL } from "@/lib/landing-geo-local";

/**
 * Pagini geografice: acoperire națională pentru cumpărători din afara județului Cluj.
 * Fiecare pagină are context local propriu (drum, distanță, particularități) ca să
 * evite duplicate content. Stocul afișat este identic — livrăm în toată România.
 */

interface GeoSeed {
  /** Slug fără prefix. */
  slug: string;
  /** Numele localității / județului, așa cum îl caută oamenii. */
  place: string;
  /** Forma de adresare "din X" / "în X". */
  county: string;
  /** Distanță și drum până la parcul din Luna de Sus. */
  route: string;
  /** Context local unic: ce caută cumpărătorii din zonă. */
  demand: string;
  /** Detaliu de livrare / logistic specific. */
  delivery: string;
}

const GEO_SEEDS: GeoSeed[] = [
  {
    slug: "masini-second-hand-cluj-napoca",
    place: "Cluj-Napoca",
    county: "județul Cluj",
    route: "12 km pe DN1/E60 dinspre Mănăștur și Florești, aproximativ 15-20 de minute în afara orelor de vârf",
    demand:
      "În Cluj-Napoca cererea e împărțită între mașini mici de oraș pentru navetă pe axa Florești–Mărăști și SUV-uri sau break-uri pentru familiile care ies în weekend spre Apuseni sau Beliș.",
    delivery:
      "Pentru clujeni nu e nevoie de transport: vii cu autobuzul sau cu mașina personală pe DN1, faci proba de drum și pleci cu mașina în aceeași zi dacă actele sunt gata.",
  },
  {
    slug: "masini-second-hand-floresti-cluj",
    place: "Florești",
    county: "județul Cluj",
    route: "5 minute pe DN1, în aceeași comună — parcul este în Luna de Sus, sat aparținător comunei Florești",
    demand:
      "Florești este cea mai mare comună din România și, practic, o suburbie de navetiști: aici se caută mașini economice, cu consum mic și cutie automată pentru coloana de dimineață spre Cluj-Napoca.",
    delivery:
      "Ești la câteva minute distanță: poți trece prin parc la orice oră, programul este non-stop, iar predarea se poate face pe loc.",
  },
  {
    slug: "masini-second-hand-turda",
    place: "Turda",
    county: "județul Cluj",
    route: "45 km pe A3 și DN1, circa 40 de minute cu autostrada",
    demand:
      "Cumpărătorii din Turda și Câmpia Turzii caută în general mașini de familie fiabile, diesel pentru naveta spre Cluj sau Alba Iulia, cu kilometraj real și acte în regulă.",
    delivery:
      "Ne poți vizita direct sau, dacă preferi, aducem mașina pe platformă până la Turda după semnarea contractului.",
  },
  {
    slug: "masini-second-hand-dej",
    place: "Dej",
    county: "județul Cluj",
    route: "60 km pe DN1C, aproximativ o oră",
    demand:
      "În zona Dej–Gherla se caută mașini rezistente pentru drumuri județene: gardă la sol decentă, suspensie sănătoasă și motorizări simple, ușor de întreținut.",
    delivery:
      "Rezervi mașina telefonic, primești raport foto complet și o poți prelua din parc sau ți-o livrăm pe platformă în Dej.",
  },
  {
    slug: "masini-second-hand-zalau-salaj",
    place: "Zalău",
    county: "județul Sălaj",
    route: "85 km pe DN1F prin Huedin sau pe drumul Zalău–Cluj, aproximativ 1 oră și 20 de minute",
    demand:
      "Clienții din Sălaj vin des după break-uri și SUV-uri accesibile: drumurile de deal cer suspensie bună, iar bugetele se concentrează în zona 4.000-9.000 €.",
    delivery:
      "Multe tranzacții din Sălaj le facem cu o singură deplasare: vizionare, probă de drum și acte în aceeași zi, pentru că programul nostru este non-stop.",
  },
  {
    slug: "masini-second-hand-baia-mare-maramures",
    place: "Baia Mare",
    county: "județul Maramureș",
    route: "150 km pe DN1C prin Dej și Baia Mare, aproximativ 2 ore și 30 de minute",
    demand:
      "În Maramureș se caută constant mașini aduse din Germania cu istoric curat, pentru că mulți cumpărători au lucrat în străinătate și știu exact ce înseamnă o carte de service completă.",
    delivery:
      "Livrăm pe platformă în Baia Mare, Sighetu Marmației sau Borșa, cu actele trimise prin curier după plata confirmată.",
  },
  {
    slug: "masini-second-hand-bistrita",
    place: "Bistrița",
    county: "județul Bistrița-Năsăud",
    route: "105 km pe DN17 și DN1C, aproximativ 1 oră și 45 de minute",
    demand:
      "Cererea din Bistrița-Năsăud e orientată spre mașini de familie și 4x4 accesibile, potrivite pentru iernile din zona Colibița și Rodna.",
    delivery:
      "Rezervarea se face cu un avans simbolic, iar mașina o poți prelua din parc sau ți-o transportăm până în Bistrița.",
  },
  {
    slug: "masini-second-hand-oradea-bihor",
    place: "Oradea",
    county: "județul Bihor",
    route: "150 km direct pe DN1/E60 prin Huedin și Aleșd, aproximativ 2 ore",
    demand:
      "Oradea este o piață obișnuită cu mașini din Vest: cumpărătorii compară atent dotările și cer transparență la dosarul de daune, exact felul în care lucrăm noi.",
    delivery:
      "Ești pe același drum european cu noi — DN1/E60 duce direct în fața parcului, fără ocolișuri.",
  },
  {
    slug: "masini-second-hand-alba-iulia",
    place: "Alba Iulia",
    county: "județul Alba",
    route: "95 km pe A10 și A3, aproximativ 1 oră și 15 de minute pe autostradă",
    demand:
      "Clienții din Alba caută des mașini pe benzină pentru rulaje mici și diesel-uri moderne pentru naveta pe autostradă spre Sebeș, Sibiu sau Cluj.",
    delivery:
      "Drumul e integral pe autostradă, deci o vizionare la parc înseamnă maximum jumătate de zi.",
  },
  {
    slug: "masini-second-hand-sibiu",
    place: "Sibiu",
    county: "județul Sibiu",
    route: "170 km pe A10 și A1, aproximativ 2 ore",
    demand:
      "Piața din Sibiu este pretențioasă la dotări și la starea interiorului; de aceea trimitem înainte un set foto detaliat, inclusiv defectele.",
    delivery:
      "Transport pe platformă până în Sibiu sau preluare directă din parc, după cum preferi.",
  },
  {
    slug: "masini-second-hand-targu-mures",
    place: "Târgu Mureș",
    county: "județul Mureș",
    route: "105 km pe A3 și DN15, aproximativ 1 oră și 40 de minute",
    demand:
      "În Mureș se caută mult break-uri și monovolume pentru familii numeroase, plus mașini automate pentru traficul din oraș.",
    delivery:
      "Rezervi telefonic, verificăm împreună mașina prin videocall și stabilim ziua livrării.",
  },
  {
    slug: "masini-second-hand-satu-mare",
    place: "Satu Mare",
    county: "județul Satu Mare",
    route: "170 km prin Zalău și Carei, aproximativ 2 ore și 45 de minute",
    demand:
      "Zona Satu Mare are cerere mare pentru mașini nemțești cu kilometraj real, pentru că mulți cumpărători cunosc piața din Germania și Ungaria.",
    delivery:
      "Livrăm pe platformă în Satu Mare și Carei; actele merg prin curier cu confirmare de primire.",
  },
  {
    slug: "masini-second-hand-deva-hunedoara",
    place: "Deva",
    county: "județul Hunedoara",
    route: "180 km pe A10 și A1, aproximativ 2 ore",
    demand:
      "În Hunedoara bugetele sunt concentrate în zona mașinilor sub 8.000 €, cu accent pe costuri mici de întreținere și piese disponibile.",
    delivery: "Transport pe platformă până în Deva, Hunedoara sau Simeria.",
  },
  {
    slug: "masini-second-hand-arad",
    place: "Arad",
    county: "județul Arad",
    route: "240 km pe A1, aproximativ 2 ore și 45 de minute",
    demand:
      "Aradul e obișnuit cu importuri directe, așa că cumpărătorii verifică serios istoricul; noi punem la dispoziție cartea de service și raportul de daune înainte de deplasare.",
    delivery:
      "Îți trimitem întâi documentația completă, ca să nu faci drumul degeaba, apoi stabilim vizionarea sau transportul.",
  },
  {
    slug: "masini-second-hand-timisoara-timis",
    place: "Timișoara",
    county: "județul Timiș",
    route: "300 km pe A1, aproximativ 3 ore și 30 de minute",
    demand:
      "În Timiș se caută mașini bine dotate, cu cutie automată și motorizări moderne — exact segmentul pe care îl aducem cel mai des din Germania.",
    delivery:
      "Pentru Timișoara facem de obicei livrare pe platformă, cu plata la confirmarea stării mașinii.",
  },
  {
    slug: "masini-second-hand-brasov",
    place: "Brașov",
    county: "județul Brașov",
    route: "260 km pe A3 și DN13, aproximativ 3 ore și 30 de minute",
    demand:
      "Brașovenii caută frecvent 4x4 și SUV-uri pentru drumurile de munte și pentru iarnă, plus mașini cu tracțiune integrală pentru drumul spre Poiana Brașov.",
    delivery: "Livrăm pe platformă în Brașov, Făgăraș sau Săcele, cu acte trimise prin curier.",
  },
  {
    slug: "masini-second-hand-bucuresti",
    place: "București",
    county: "Ilfov și București",
    route: "440 km pe A3, DN1 și A1, aproximativ 5 ore și 30 de minute",
    demand:
      "În București prețurile la mașini rulate sunt de regulă mai mari decât în Ardeal, iar diferența de 500-1.500 € acoperă adesea integral costul transportului de la noi.",
    delivery:
      "Cel mai des lucrăm cu rezervare online și transport pe platformă până în București; primești raport video complet înainte de plată.",
  },
  {
    slug: "masini-second-hand-iasi",
    place: "Iași",
    county: "județul Iași",
    route: "420 km prin Târgu Mureș și Bacău, aproximativ 6 ore",
    demand:
      "În Moldova cererea pentru mașini aduse din Germania cu acte complete este mare, iar oferta locală de import direct e mai limitată.",
    delivery:
      "Pentru Iași recomandăm rezervarea la distanță: verificare prin videocall, contract semnat electronic și livrare pe platformă.",
  },
  {
    slug: "masini-second-hand-constanta",
    place: "Constanța",
    county: "județul Constanța",
    route: "660 km pe A1 și A2, aproximativ 7 ore",
    demand:
      "Pe litoral se caută mașini cu aer condiționat funcțional și caroserie fără urme de coroziune — două lucruri pe care le verificăm oricum la recepție.",
    delivery: "Transport pe platformă până în Constanța sau Mangalia, cu programare din timp.",
  },
  {
    slug: "masini-second-hand-craiova",
    place: "Craiova",
    county: "județul Dolj",
    route: "400 km pe A1 și DN65, aproximativ 5 ore",
    demand:
      "În Oltenia bugetul mediu e sub media națională, așa că cei mai mulți clienți caută mașini între 3.500 și 8.000 € cu consum mic.",
    delivery: "Livrare pe platformă în Craiova, cu actele trimise prin curier.",
  },
  {
    slug: "masini-second-hand-livrare-toata-romania",
    place: "toată România",
    county: "orice județ",
    route: "livrare pe platformă oriunde în țară, plecând de pe DN1 Luna de Sus, județul Cluj",
    demand:
      "Peste jumătate dintre cumpărătorii care ne scriu nu sunt din județul Cluj. De aceea am standardizat un flux de cumpărare la distanță, cu verificare video și documentație trimisă înainte de orice plată.",
    delivery:
      "Pașii sunt simpli: alegi mașina din stoc, primești raport foto și video detaliat, rezervi cu avans, semnăm contractul și mașina pleacă pe platformă spre tine.",
  },
];

export const GEO_LANDING_PAGES: LandingPage[] = GEO_SEEDS.map((seed) => {
  const isNational = seed.place === "toată România";
  const local = GEO_LOCAL[seed.slug];
  const inPlace = isNational ? "în toată România" : `în ${seed.place}`;
  const h1 = isNational
    ? "Mașini second hand din Germania cu livrare în toată România"
    : `Mașini second hand pentru cumpărători din ${seed.place}`;

  return {
    slug: seed.slug,
    h1,
    title: isNational
      ? "Mașini second hand livrare în toată România | Bremen Auto"
      : `Mașini second hand ${seed.place} | Bremen Auto`.slice(0, 60),
    description: (isNational
      ? "Mașini second hand aduse din Germania, livrate pe platformă în toată România. Km verificați, acte complete, cash sau în rate. Bremen Auto, DN1 Cluj."
      : `Mașini second hand aduse din Germania pentru clienți din ${seed.place}: km verificați, acte complete, cash sau în rate. Livrare pe platformă din Cluj.`
    ).slice(0, 160),
    keywords: isNational
      ? "masini second hand livrare toata romania, masini din germania livrare, cumpar masina online romania, dealer auto livrare nationala"
      : `masini second hand ${seed.place.toLowerCase()}, auto rulate ${seed.place.toLowerCase()}, masini din germania ${seed.place.toLowerCase()}, dealer auto ${seed.place.toLowerCase()}, masini second hand ${seed.county.toLowerCase()}`,
    eyebrow: isNational ? "Livrare națională · Platformă auto" : `${seed.place} · ${seed.county}`,
    intro: isNational
      ? "Bremen Auto este parc auto pe DN1, în Luna de Sus (comuna Florești), județul Cluj, dar vindem în toată România. Alegi mașina din stocul de mai jos, o verifici la distanță cu noi, iar noi ți-o livrăm pe platformă oriunde în țară, cu actele pregătite pentru înmatriculare."
      : `Ești din ${seed.place} și cauți o mașină second hand adusă din Germania? Stocul de mai jos este disponibil în parcul nostru de pe DN1, în Luna de Sus (comuna Florești), județul Cluj. ${seed.route.charAt(0).toUpperCase()}${seed.route.slice(1)} — iar dacă nu vrei să faci drumul, îți livrăm mașina pe platformă ${inPlace}.`,
    match: () => true,
    sections: [
      {
        h2: isNational
          ? "Cum cumperi la distanță, fără riscuri"
          : `Ce caută cumpărătorii din ${seed.place}`,
        body: isNational ? seed.delivery : seed.demand,
      },
      {
        h2: isNational ? "Ce include livrarea" : `Cum ajungi la parcul nostru din ${seed.county}`,
        body: isNational
          ? "Transportul se face pe platformă auto, cu mașina asigurată pe durata drumului. Costul de transport îl comunicăm exact înainte de rezervare, în funcție de distanță, și nu se modifică ulterior. Actele merg prin curier cu confirmare de primire, iar dosarul de înmatriculare este complet."
          : `${seed.route.charAt(0).toUpperCase()}${seed.route.slice(1)}. Programul este non-stop, deci poți veni și seara sau în weekend — sună înainte la 0751 692 335 ca să scoatem mașina din rând și să fie pregătită pentru probă de drum. ${seed.delivery}`,
      },
      {
        h2: "Verificările pe care le facem înainte să intre mașina în stoc",
        body: "Fiecare autoturism trece prin control de kilometraj, consultarea dosarului de daune și verificarea cărții de service. Defectele existente le scriem în anunț și le arătăm în fotografii — preferăm un client informat unui client întors. Poți duce mașina la un service la alegerea ta înainte de semnare.",
      },
      {
        h2: isNational
          ? "Plată cash sau în rate, indiferent de județ"
          : `Cash sau în rate pentru clienții din ${seed.place}`,
        body: "Poți plăti cash, prin transfer bancar, prin credit auto sau în leasing. Pregătim dosarul de finanțare și îl trimitem la mai multe instituții, iar răspunsul vine de obicei în aceeași zi. Mașina ta actuală poate fi preluată la schimb și folosită ca avans.",
      },
      {
        h2: "Actele primite la livrare",
        body: "Factură, contract de vânzare-cumpărare, cartea de identitate a vehiculului și dosarul complet pentru înmatriculare în România. Nu percepem comisioane ascunse, iar prețul afișat pe site este prețul final al mașinii.",
      },
      ...(local
        ? [
            {
              h2: `Cât costă transportul până în ${seed.place}`,
              body: `Distanța rutieră până la parcul nostru de pe DN1, Luna de Sus, este de aproximativ ${local.distanceKm} km. Costul livrării pe platformă este ${local.transport}. Este un cost orientativ: îl confirmăm exact înainte de rezervare, în funcție de adresa finală și de programul transportatorului, și nu se modifică ulterior. Mașina este asigurată pe toată durata transportului.`,
            },
            {
              h2: `Unde înmatriculezi mașina dacă locuiești în ${seed.place}`,
              body: local.registration,
            },
            {
              h2: `Ce modele se caută în zona ${seed.place}`,
              body: local.models,
            },
          ]
        : []),
    ],
    faqs: [
      {
        q: isNational
          ? "Livrați mașina oriunde în România?"
          : `Livrați mașina în ${seed.place}?`,
        a: isNational
          ? "Da, livrăm pe platformă în orice județ din România. Costul exact al transportului îl afli înainte de rezervare."
          : `Da. Livrăm pe platformă ${inPlace}, cu mașina asigurată pe durata transportului și cu actele trimise prin curier. Poți, desigur, să vii și personal la parcul de pe DN1.`,
      },
      {
        q: "Pot vedea mașina înainte să plătesc?",
        a: "Da. Poți veni la parc pentru probă de drum sau, dacă ești departe, facem o verificare video în direct în care îți arătăm caroseria, interiorul, pornirea la rece și orice detaliu ceri.",
      },
      {
        q: "Ce se întâmplă dacă mașina nu arată ca în anunț?",
        a: "Rezervarea se face cu avans, iar dacă la livrare mașina nu corespunde descrierii și fotografiilor, avansul se returnează integral. Tocmai de asta fotografiem inclusiv defectele.",
      },
      {
        q: isNational
          ? "Cât durează livrarea în țară?"
          : `Cât durează livrarea până în ${seed.place}?`,
        a: "În mod obișnuit între 1 și 4 zile lucrătoare de la confirmarea rezervării, în funcție de distanță și de programul platformei.",
      },
      {
        q: "Se poate cumpăra în rate de la distanță?",
        a: "Da. Dosarul de credit auto sau leasing se poate depune online, iar documentele se semnează electronic sau la livrare, în funcție de finanțator.",
      },
      ...(local?.faqs ?? []),
    ],
  } satisfies LandingPage;
});
