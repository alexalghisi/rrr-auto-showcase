/**
 * Date locale reale, unice per oraș, folosite pe paginile geografice.
 * Scopul: fiecare pagină să conțină informație utilă și diferită (distanță,
 * cost orientativ de transport, unde se face înmatricularea, ce se caută în zonă),
 * ca să nu fie tratate de Google drept doorway pages.
 *
 * Costurile de transport sunt orientative și se confirmă înainte de rezervare.
 */

export interface GeoLocal {
  /** Distanța rutieră aproximativă până în Luna de Sus, km. */
  distanceKm: number;
  /** Interval orientativ de cost pentru livrarea pe platformă. */
  transport: string;
  /** Unde se face înmatricularea în județul respectiv. */
  registration: string;
  /** Modele căutate frecvent în zonă (text, nu listă hardcodată de stoc). */
  models: string;
  /** Întrebări suplimentare, specifice orașului. */
  faqs: Array<{ q: string; a: string }>;
}

const R = (county: string, city: string) =>
  `Înmatricularea se face la Serviciul Public Comunitar Regim Permise de Conducere și Înmatriculare a Vehiculelor ${county}, din cadrul Instituției Prefectului — județul ${county} (ghișeele din ${city}). Programarea se face online pe drpciv.ro, iar dosarul pe care ți-l predăm noi conține tot ce cere ghișeul: factură, contract, cartea de identitate a vehiculului și documentele de proveniență din Germania.`;

export const GEO_LOCAL: Record<string, GeoLocal> = {
  "masini-second-hand-cluj-napoca": {
    distanceKm: 12,
    transport: "gratuit — ești la 15-20 de minute de parc, deci nu are sens transportul pe platformă",
    registration: R("Cluj", "Cluj-Napoca"),
    models:
      "În Cluj-Napoca se caută mașini mici, economice, pentru naveta Florești–Mărăști și parcarea în cartierele aglomerate (Golf, Polo, Astra, Clio), plus break-uri și SUV-uri pentru familiile care ies în weekend spre Apuseni.",
    faqs: [
      {
        q: "Cum ajung din Cluj-Napoca la parcul din Luna de Sus?",
        a: "Ieși pe Calea Florești / DN1 spre Oradea, treci prin Florești și după ieșirea din localitate ajungi în Luna de Sus, pe partea dreaptă a DN1. Sunt circa 12 km, 15-20 de minute în afara orelor de vârf, și ai și transport public până în Florești.",
      },
      {
        q: "Pot înmatricula mașina în aceeași zi în Cluj?",
        a: "Da, dacă ai programare la ghișeul din Cluj-Napoca și dosarul complet. Noi îți predăm dosarul gata pregătit, inclusiv documentele germane traduse acolo unde e nevoie.",
      },
    ],
  },
  "masini-second-hand-floresti-cluj": {
    distanceKm: 5,
    transport: "gratuit — suntem în aceeași comună, în satul Luna de Sus",
    registration: R("Cluj", "Cluj-Napoca"),
    models:
      "Florești este comuna cu cei mai mulți navetiști din țară: aici se caută cutii automate, motorizări mici pe benzină și mașini ușor de parcat pe străzile din spatele DN1.",
    faqs: [
      {
        q: "Unde exact în Florești este parcul auto?",
        a: "În satul Luna de Sus, care aparține comunei Florești, direct pe DN1 spre Huedin/Oradea. De la centrul Floreștiului faci sub 10 minute.",
      },
      {
        q: "Pot veni seara sau în weekend?",
        a: "Da, programul este non-stop. Un telefon la 0751 692 335 înainte și scoatem mașina din rând pentru probă de drum.",
      },
    ],
  },
  "masini-second-hand-turda": {
    distanceKm: 45,
    transport: "orientativ 150-250 lei pe platformă, sau vii singur pe A3 în 40 de minute",
    registration: R("Cluj", "Cluj-Napoca"),
    models:
      "În Turda și Câmpia Turzii se caută diesel-uri de familie pentru naveta spre Cluj și Alba, cu kilometraj real: Passat, Octavia, Focus, Astra break.",
    faqs: [
      {
        q: "Merită să vin cu mașina din Turda sau să cer livrare?",
        a: "Drumul e scurt (45 km, în mare parte pe A3), deci majoritatea clienților din Turda vin personal, fac proba de drum și pleacă cu mașina. Livrarea rămâne o opțiune dacă nu ai cu cine te deplasa.",
      },
      {
        q: "Unde înmatriculez mașina dacă locuiesc în Turda?",
        a: "Tot la ghișeul județean din Cluj-Napoca, cu programare pe drpciv.ro. Dosarul primit de la noi este complet.",
      },
    ],
  },
  "masini-second-hand-dej": {
    distanceKm: 60,
    transport: "orientativ 200-300 lei pe platformă",
    registration: R("Cluj", "Cluj-Napoca"),
    models:
      "Pe axa Dej–Gherla se caută mașini cu gardă la sol decentă și mecanică simplă, pentru drumuri județene: Duster, Octavia, Golf Variant, Qashqai.",
    faqs: [
      {
        q: "Cât face transportul până în Dej?",
        a: "Orientativ 200-300 lei pe platformă, în funcție de programul transportatorului. Costul exact ți-l comunicăm înainte de rezervare și nu se schimbă ulterior.",
      },
      {
        q: "Pot preda mașina veche la schimb dacă sunt din Dej?",
        a: "Da, preluăm mașina la schimb ca avans. Trimite-ne pozele și datele pe WhatsApp și îți dăm o evaluare înainte să faci drumul.",
      },
    ],
  },
  "masini-second-hand-zalau-salaj": {
    distanceKm: 85,
    transport: "orientativ 250-400 lei pe platformă",
    registration: R("Sălaj", "Zalău"),
    models:
      "În Sălaj se caută break-uri și SUV-uri accesibile, în general în zona 4.000-9.000 €, potrivite pentru drumurile de deal din zona Jibou, Șimleu și Cehu Silvaniei.",
    faqs: [
      {
        q: "Cum ajung din Zalău la Luna de Sus?",
        a: "Cel mai simplu pe drumul Zalău–Huedin și apoi pe DN1/E60 spre Cluj, circa 85 km și 1 oră și 20 de minute.",
      },
      {
        q: "Unde se înmatriculează mașina în județul Sălaj?",
        a: "La serviciul de înmatriculări din Zalău, cu programare pe drpciv.ro. Dosarul complet îl primești de la noi la predare.",
      },
    ],
  },
  "masini-second-hand-baia-mare-maramures": {
    distanceKm: 150,
    transport: "orientativ 400-600 lei pe platformă",
    registration: R("Maramureș", "Baia Mare"),
    models:
      "În Maramureș vin mulți cumpărători care au lucrat în Germania sau Austria: se caută mașini cu carte de service completă, diesel-uri moderne și 4x4 pentru zona Borșa–Vișeu.",
    faqs: [
      {
        q: "Livrați și în Sighetu Marmației sau Borșa?",
        a: "Da, livrăm pe platformă în tot județul Maramureș, inclusiv Sighet, Vișeu și Borșa. Costul se calculează în funcție de distanța finală.",
      },
      {
        q: "Pot vedea mașina online înainte să vin 150 km?",
        a: "Da. Facem o verificare video în direct pe WhatsApp, îți arătăm pornirea la rece, caroseria la lumină și interiorul, plus raport foto complet.",
      },
    ],
  },
  "masini-second-hand-bistrita": {
    distanceKm: 105,
    transport: "orientativ 300-450 lei pe platformă",
    registration: R("Bistrița-Năsăud", "Bistrița"),
    models:
      "În Bistrița-Năsăud se caută mașini de familie și 4x4 accesibile, pentru iernile din zona Colibița, Rodna și Prundu Bârgăului.",
    faqs: [
      {
        q: "Aveți mașini cu tracțiune integrală pentru zona de munte?",
        a: "Aducem constant 4x4 și quattro/4motion din Germania. Dacă nu găsești în stocul de mai sus, spune-ne bugetul și îți căutăm la comandă.",
      },
      {
        q: "Cât durează livrarea până în Bistrița?",
        a: "De regulă 1-3 zile lucrătoare de la confirmarea rezervării.",
      },
    ],
  },
  "masini-second-hand-oradea-bihor": {
    distanceKm: 150,
    transport: "orientativ 400-600 lei pe platformă",
    registration: R("Bihor", "Oradea"),
    models:
      "Oradea e o piață obișnuită cu mașini din Vest: cumpărătorii compară dotările în detaliu și cer dosarul de daune. Se caută mult Passat, Octavia, A4 și SUV-uri compacte.",
    faqs: [
      {
        q: "Ce drum fac din Oradea până la parc?",
        a: "Direct pe DN1/E60 prin Aleșd și Huedin, circa 150 km, 2 ore — parcul e chiar pe marginea drumului, în Luna de Sus.",
      },
      {
        q: "Se poate face proba de drum dacă vin tocmai din Bihor?",
        a: "Da, și îți recomandăm să programezi telefonic ca să ai mașina pregătită și încălzită când ajungi.",
      },
    ],
  },
  "masini-second-hand-alba-iulia": {
    distanceKm: 95,
    transport: "orientativ 250-400 lei pe platformă",
    registration: R("Alba", "Alba Iulia"),
    models:
      "În județul Alba se caută benzină pentru rulaje mici în oraș și diesel-uri moderne pentru naveta pe autostradă spre Sebeș, Sibiu sau Cluj.",
    faqs: [
      {
        q: "Cât fac cu mașina din Alba Iulia?",
        a: "Circa 95 km, aproape integral pe A10 și A3 — 1 oră și 15 minute, deci o vizionare înseamnă maximum o jumătate de zi.",
      },
      {
        q: "Pot rezerva mașina până ajung?",
        a: "Da, rezervarea cu avans ține mașina blocată pentru tine, iar avansul se returnează dacă mașina nu corespunde descrierii.",
      },
    ],
  },
  "masini-second-hand-sibiu": {
    distanceKm: 170,
    transport: "orientativ 450-650 lei pe platformă",
    registration: R("Sibiu", "Sibiu"),
    models:
      "Piața din Sibiu e orientată spre mașini bine întreținute, cu istoric clar — mulți cumpărători lucrează în industria auto și verifică atent motorizarea și cutia.",
    faqs: [
      {
        q: "Livrarea în Sibiu include și actele?",
        a: "Da. Actele merg prin curier cu confirmare de primire sau se predau odată cu mașina, în funcție de modalitatea de plată aleasă.",
      },
      {
        q: "Pot duce mașina la un service din Sibiu pentru verificare?",
        a: "Verificarea o poți face la orice service înainte de semnare, dacă vii la parc. La distanță, trimitem raport foto și video detaliat.",
      },
    ],
  },
  "masini-second-hand-targu-mures": {
    distanceKm: 110,
    transport: "orientativ 300-450 lei pe platformă",
    registration: R("Mureș", "Târgu Mureș"),
    models:
      "În Mureș se caută mașini de familie spațioase și break-uri, plus compacte economice pentru naveta spre platformele industriale din zonă.",
    faqs: [
      {
        q: "Cum ajung din Târgu Mureș?",
        a: "Pe A3 și DN15/DN16 spre Cluj, circa 110 km, aproximativ 1 oră și 45 de minute.",
      },
      {
        q: "Se poate finanțare în rate pentru clienții din Mureș?",
        a: "Da, dosarul de credit auto sau leasing se depune online, indiferent de județ.",
      },
    ],
  },
  "masini-second-hand-satu-mare": {
    distanceKm: 180,
    transport: "orientativ 450-650 lei pe platformă",
    registration: R("Satu Mare", "Satu Mare"),
    models:
      "În Satu Mare se caută des mașini aduse recent din Germania și Olanda, cu accent pe consum mic și dotări (climă automată, navigație, senzori).",
    faqs: [
      {
        q: "Livrați în Carei și Negrești-Oaș?",
        a: "Da, livrăm în tot județul Satu Mare; costul se calculează pe distanța finală până la adresa ta.",
      },
      {
        q: "Cât ține rezervarea?",
        a: "Rezervarea cu avans ține mașina 3-5 zile, suficient pentru finanțare sau pentru organizarea transportului.",
      },
    ],
  },
  "masini-second-hand-deva-hunedoara": {
    distanceKm: 180,
    transport: "orientativ 450-650 lei pe platformă",
    registration: R("Hunedoara", "Deva"),
    models:
      "În Hunedoara se caută mașini robuste pentru drumuri de munte (Valea Jiului, Retezat) și diesel-uri economice pentru naveta pe A1.",
    faqs: [
      {
        q: "Cum ajung din Deva la parc?",
        a: "Pe A1 până la Sebeș, apoi A10/A3 spre Cluj și DN1 spre Florești — circa 180 km, aproape integral pe autostradă.",
      },
      {
        q: "Pot plăti la livrare?",
        a: "Plata se face prin transfer bancar înainte de plecarea platformei sau la predare, în funcție de înțelegere; rezervarea se face cu avans.",
      },
    ],
  },
  "masini-second-hand-arad": {
    distanceKm: 270,
    transport: "orientativ 600-850 lei pe platformă",
    registration: R("Arad", "Arad"),
    models:
      "Arad este aproape de graniță, deci cumpărătorii compară direct cu ofertele din Ungaria și Austria: contează prețul final cu acte făcute în România.",
    faqs: [
      {
        q: "De ce să cumpăr din Cluj și nu direct din străinătate?",
        a: "Pentru că mașina e deja în țară, cu dosar verificat, factură românească și dosar complet de înmatriculare — fără drum, fără riscul de a cumpăra nevăzut.",
      },
      {
        q: "Cât durează livrarea în Arad?",
        a: "De regulă 2-4 zile lucrătoare de la confirmarea rezervării.",
      },
    ],
  },
  "masini-second-hand-timisoara-timis": {
    distanceKm: 320,
    transport: "orientativ 700-950 lei pe platformă",
    registration: R("Timiș", "Timișoara"),
    models:
      "În Timișoara se caută mașini recente, cu dotări și cutie automată, pentru trafic urban dens și pentru drumurile scurte spre Vest.",
    faqs: [
      {
        q: "Merită transportul până la Timișoara?",
        a: "Dacă diferența de preț față de piața locală acoperă cei 700-950 lei orientativi de transport, da. Îți spunem sincer când nu merită.",
      },
      {
        q: "Pot vedea mașina în detaliu fără să vin?",
        a: "Da: verificare video în direct, plus zeci de fotografii, inclusiv ale defectelor existente.",
      },
    ],
  },
  "masini-second-hand-brasov": {
    distanceKm: 260,
    transport: "orientativ 600-850 lei pe platformă",
    registration: R("Brașov", "Brașov"),
    models:
      "În Brașov se caută 4x4 și SUV-uri pentru iarnă și drumuri de munte, dar și compacte economice pentru traficul din oraș.",
    faqs: [
      {
        q: "Aveți mașini pregătite de iarnă?",
        a: "Spune-ne dacă ai nevoie de tracțiune integrală sau de cauciucuri de iarnă și le includem în discuția de preț.",
      },
      {
        q: "Cât durează livrarea până în Brașov?",
        a: "În general 2-4 zile lucrătoare de la confirmarea rezervării.",
      },
    ],
  },
  "masini-second-hand-bucuresti": {
    distanceKm: 450,
    transport: "orientativ 900-1.300 lei pe platformă",
    registration: R("București", "București (DRPCIV)"),
    models:
      "În București se caută mașini cu cutie automată pentru trafic, consum mic și dimensiuni potrivite pentru parcări subterane.",
    faqs: [
      {
        q: "De ce aș cumpăra din Cluj dacă sunt în București?",
        a: "Pentru că prețurile din provincie sunt de obicei mai mici la aceeași mașină, iar noi îți livrăm acasă cu actele făcute. Diferența acoperă de regulă transportul.",
      },
      {
        q: "Cum decurge cumpărarea la distanță?",
        a: "Verificare video în direct, raport foto, rezervare cu avans, contract semnat, apoi livrare pe platformă. Dacă mașina nu corespunde descrierii, avansul se returnează integral.",
      },
    ],
  },
  "masini-second-hand-iasi": {
    distanceKm: 400,
    transport: "orientativ 850-1.200 lei pe platformă",
    registration: R("Iași", "Iași"),
    models:
      "În Iași se caută mașini de familie cu buget echilibrat și diesel-uri fiabile pentru drumurile lungi spre Moldova.",
    faqs: [
      {
        q: "Livrați în Moldova?",
        a: "Da, livrăm pe platformă în Iași, Botoșani, Vaslui, Bacău și Suceava.",
      },
      {
        q: "Se poate cumpăra în rate din Iași?",
        a: "Da, dosarul de finanțare se face integral online, iar semnarea se poate face la livrare.",
      },
    ],
  },
  "masini-second-hand-constanta": {
    distanceKm: 570,
    transport: "orientativ 1.000-1.500 lei pe platformă",
    registration: R("Constanța", "Constanța"),
    models:
      "Pe litoral se caută mașini rezistente la mediul salin, cu caroserie fără rugină, plus cabrio și SUV-uri pentru sezonul estival.",
    faqs: [
      {
        q: "Verificați rugina și tratamentele de caroserie?",
        a: "Da, verificăm caroseria și pragurile la fiecare mașină și fotografiem orice urmă de coroziune.",
      },
      {
        q: "Cât durează transportul până la Constanța?",
        a: "De obicei 3-4 zile lucrătoare, în funcție de programul platformei.",
      },
    ],
  },
  "masini-second-hand-craiova": {
    distanceKm: 400,
    transport: "orientativ 850-1.200 lei pe platformă",
    registration: R("Dolj", "Craiova"),
    models:
      "În Oltenia se caută mașini economice, cu costuri mici de întreținere, și diesel-uri de familie sub 8.000 €.",
    faqs: [
      {
        q: "Livrați în Craiova și în județele vecine?",
        a: "Da, livrăm în Dolj, Olt, Gorj, Vâlcea și Mehedinți, pe platformă, cu mașina asigurată pe durata transportului.",
      },
      {
        q: "Prețul afișat este final?",
        a: "Da, prețul mașinii este final; separat se calculează doar transportul, comunicat înainte de rezervare.",
      },
    ],
  },
};
