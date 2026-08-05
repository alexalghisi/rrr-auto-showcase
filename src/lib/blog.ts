import { SITE } from "@/lib/site";
import { BLOG_POSTS_A } from "@/lib/blog-posts-a";
import { BLOG_POSTS_B } from "@/lib/blog-posts-b";
import { BLOG_POSTS_C } from "@/lib/blog-posts-c";

export type BlogCategory =
  | "Cum alegi"
  | "Piața Cluj"
  | "Documente"
  | "Modele recomandate"
  | "Case study";

export interface BlogSection {
  h2: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  keywords: string;
  category: BlogCategory;
  published: string; // ISO date
  updated: string;
  readingMinutes: number;
  excerpt: string;
  intro: string[];
  sections: BlogSection[];
  faqs: Array<{ q: string; a: string }>;
  /** Slug-uri de landing pages pentru internal linking (4-6 per articol). */
  relatedLandings: string[];
}

const AUTHOR = SITE.name;

export const BLOG_AUTHOR = AUTHOR;

const BLOG_POSTS_CORE: BlogPost[] = [
  {
    slug: "cum-alegi-o-masina-second-hand-in-cluj",
    title: "Cum alegi o mașină second hand în Cluj-Napoca: ghid complet 2026",
    metaTitle: "Cum alegi o mașină second hand în Cluj | Ghid 2026",
    description:
      "Ghid pas cu pas pentru cumpărarea unei mașini second hand în Cluj-Napoca: buget real, verificări tehnice, istoric km, test drive și acte. Sfaturi de la un dealer local.",
    keywords:
      "cum alegi o masina second hand cluj, masini second hand cluj-napoca, verificare masina rulata cluj, dealer auto cluj, sfaturi cumparare auto rulat",
    category: "Cum alegi",
    published: "2026-01-14",
    updated: "2026-08-05",
    readingMinutes: 9,
    excerpt:
      "Bugetul real, verificările obligatorii, capcanele de kilometraj și întrebările pe care trebuie să le pui înainte să dai banii pe o mașină rulată în Cluj.",
    intro: [
      "Piața de mașini second hand din Cluj-Napoca este una dintre cele mai active din țară: cerere mare, prețuri peste media națională și anunțuri care dispar în 48 de ore. Exact de asta cumpărătorii grăbiți fac greșeli scumpe.",
      "Ghidul de mai jos este scris din perspectiva unui parc auto local, de pe DN1 Florești, care aduce mașini din Germania săptămână de săptămână. Îl poți folosi indiferent de unde cumperi: de la noi, de la alt dealer sau de la persoană fizică.",
    ],
    sections: [
      {
        h2: "1. Stabilește bugetul total, nu doar prețul mașinii",
        paragraphs: [
          "Prețul afișat este doar o parte din cost. Un buget realist pentru o mașină rulată în Cluj include: prețul de achiziție, taxele de înmatriculare, RCA, eventual CASCO, un set de anvelope și o revizie completă în prima lună.",
          "Regula practică pe care o recomandăm clienților: păstrează 8-10% din prețul mașinii ca rezervă pentru primele luni. La o mașină de 8.000 €, asta înseamnă 700-800 € pentru consumabile, plăcuțe, filtre și ulei.",
        ],
        bullets: [
          "Preț mașină + taxe înmatriculare (aprox. 700-1.200 lei, în funcție de caz)",
          "RCA anual — la Cluj, între 900 și 2.500 lei pentru un autoturism obișnuit",
          "Revizie completă la preluare: ulei, filtre, distribuție dacă are termen",
          "Anvelope de sezon dacă setul existent are sub 4 mm",
        ],
      },
      {
        h2: "2. Alege categoria potrivită pentru cum conduci efectiv",
        paragraphs: [
          "Cluj-Napoca înseamnă trafic dens dimineața, urcări prin Mănăștur și Grigorescu, plus drumuri de munte spre Apuseni în weekend. O mașină diesel de autostradă folosită doar pe 8 km pe zi va colmata filtrul de particule în câteva luni.",
          "Dacă faci sub 12.000 km pe an și mai ales oraș, mergi pe benzină sau hibrid. Dacă navetezi spre Turda, Dej sau Oradea, un diesel modern rămâne cea mai economică opțiune. Pentru familiile care merg des în Apuseni, un SUV sau un break cu gardă la sol mai mare economisește bara față.",
        ],
      },
      {
        h2: "3. Verifică istoricul de kilometri, nu doar bordul",
        paragraphs: [
          "Kilometrajul dat înapoi rămâne cea mai frecventă problemă la mașinile rulate din România. Un bord poate fi modificat în 20 de minute; istoricul digital de service, mult mai greu.",
          "Cere raportul din baza de date a producătorului sau un istoric independent, verifică fișele de revizie, uzura volanului, a pedalelor și a scaunului șoferului. Dacă mașina are 90.000 km declarați, dar volanul e lustruit și pedala de frână e tocită, ai un semnal clar.",
        ],
        bullets: [
          "Istoric digital de service la reprezentanță (VW, BMW, Mercedes, Toyota îl au)",
          "Fișe ITP anterioare — kilometrajul este trecut la fiecare inspecție",
          "Uzura interioară comparată cu kilometrajul declarat",
          "Diagnoză OBD care citește km înregistrați în mai multe module",
        ],
      },
      {
        h2: "4. Verificarea tehnică: ce se face în 30 de minute",
        paragraphs: [
          "Nu ai nevoie să fii mecanic pentru primele verificări. Pornește motorul rece — majoritatea problemelor de distribuție, turbină sau injectoare se aud în primele 30 de secunde. Uită-te la culoarea fumului la accelerație, la nivelul și culoarea uleiului și la eventualele scurgeri pe blocul motor.",
          "La caroserie, verifică grosimea vopselei cu un tester ieftin de vopsea și uită-te la spațiile dintre elemente. Diferențele mari indică un accident reparat. Un dealer serios îți spune singur dacă mașina a avut daune — noi trecem asta în anunț.",
          "Ultimul pas obligatoriu: du mașina la un service ales de tine. Orice vânzător care refuză acest lucru îți spune, indirect, tot ce trebuie să știi.",
        ],
      },
      {
        h2: "5. Testul de drum corect",
        paragraphs: [
          "Un test de 5 minute în jurul parcului nu spune nimic. Cere minimum 15-20 de minute, cu bucată de oraș și bucată de drum deschis. Pe DN1, de exemplu, poți urca rapid la 90 km/h și simți vibrațiile de direcție și trepidațiile de frână.",
          "Ascultă cu radioul oprit. Testează toate treptele, inclusiv marșarier, frânează puternic o dată dintr-o viteză mai mare (în siguranță) și verifică dacă mașina trage într-o parte.",
        ],
      },
      {
        h2: "6. Negocierea și plata: cash sau în rate",
        paragraphs: [
          "Negocierea reală se face pe baza defectelor găsite, nu pe baza unei cifre aruncate. Dacă mașina are nevoie de plăcuțe și distribuție, ai un argument concret de 300-600 €.",
          "La Bremen Auto poți plăti cash, prin transfer bancar, prin credit auto sau în leasing, iar mașina ta actuală poate fi preluată la schimb pentru a acoperi avansul. Îți arătăm rata finală și costul total înainte să semnezi ceva.",
        ],
      },
    ],
    faqs: [
      {
        q: "Cât ar trebui să coste o mașină second hand bună în Cluj?",
        a: "Pentru un autoturism din 2013-2017, cu istoric verificabil și sub 200.000 km, bugetul realist în Cluj este între 5.000 și 10.000 €. Sub 4.000 € se poate cumpăra, dar trebuie inclusă o rezervă de reparații mai mare.",
      },
      {
        q: "Merită să cumpăr o mașină adusă din Germania?",
        a: "Da, în general mașinile din Germania au întreținere documentată, dotări superioare și un istoric mai transparent decât cele rulate exclusiv în România, la același preț.",
      },
      {
        q: "Pot duce mașina la service-ul meu înainte de cumpărare?",
        a: "La noi, da. Orice mașină din parcul de pe DN1 Florești poate fi verificată la un service ales de tine înainte de semnarea actelor.",
      },
    ],
    relatedLandings: [
      "masini-second-hand-sub-10000-euro-cluj",
      "masini-din-germania-cluj",
      "dealer-auto-cluj",
      "parc-auto-floresti-cluj",
      "masini-second-hand-in-rate-cluj",
    ],
  },
  {
    slug: "piata-auto-second-hand-cluj-preturi",
    title: "Piața auto second hand în Cluj-Napoca: prețuri reale și tendințe",
    metaTitle: "Prețuri mașini second hand Cluj-Napoca | Analiză",
    description:
      "Cât costă în realitate o mașină rulată în Cluj-Napoca: intervale de preț pe segmente, ce modele se vând cel mai repede și cum negociezi corect în 2026.",
    keywords:
      "preturi masini second hand cluj, piata auto cluj-napoca, auto rulate cluj preturi, masini de vanzare cluj, cat costa o masina rulata cluj",
    category: "Piața Cluj",
    published: "2026-02-04",
    updated: "2026-08-05",
    readingMinutes: 8,
    excerpt:
      "De ce sunt prețurile din Cluj peste media națională, cât costă fiecare segment și ce modele pleacă din parc în mai puțin de o săptămână.",
    intro: [
      "Cluj-Napoca are cea mai scumpă piață auto second hand din Transilvania. Motivele sunt simple: putere de cumpărare peste medie, populație tânără cu venituri din IT și o cerere constantă de mașini între 5.000 și 12.000 €.",
      "Am adunat mai jos intervalele de preț pe care le vedem efectiv în parcul nostru de pe DN1 Florești și în anunțurile din zonă.",
    ],
    sections: [
      {
        h2: "Cât costă fiecare segment în Cluj",
        paragraphs: [
          "Prețurile de mai jos sunt pentru mașini cu acte complete, kilometraj verificabil și fără daune structurale. Anunțurile mult sub aceste intervale ascund, de regulă, kilometraj dat înapoi sau reparații majore.",
        ],
        bullets: [
          "Citadine (Polo, Corsa, Sandero, i20): 3.500 - 7.000 €",
          "Compacte (Golf, Astra, Octavia, Focus): 5.500 - 12.000 €",
          "Break-uri și berline familiale (Passat, Superb, Mondeo): 6.500 - 14.000 €",
          "SUV compacte (Duster, Qashqai, Tiguan): 8.000 - 18.000 €",
          "Premium (BMW Seria 3, Audi A4, Mercedes C): 9.000 - 20.000 €",
        ],
      },
      {
        h2: "Ce se vinde cel mai repede în Cluj",
        paragraphs: [
          "În ultimele 12 luni, cele mai rapide vânzări din parcul nostru au fost la compacte diesel din 2014-2018 cu sub 200.000 km și la SUV-uri compacte cu cutie automată. O mașină bine prețuită din aceste categorii pleacă în 3-7 zile.",
          "Cel mai greu se vând berlinele mari pe benzină cu motorizări peste 2.0 și mașinile cu istoric incomplet, indiferent de preț.",
        ],
      },
      {
        h2: "De ce sunt prețurile mai mari decât în alte județe",
        paragraphs: [
          "Cererea din Cluj este constantă tot anul, nu sezonieră. Studenții, angajații din parcurile de business și familiile mutate în Florești sau Baciu întrețin un flux permanent de cumpărători.",
          "Diferența față de piețele din sudul țării este de regulă 5-10% la același model, an și kilometraj. Din acest motiv, mașinile aduse direct din Germania rămân cea mai bună soluție de raport preț/dotări în zonă.",
        ],
      },
      {
        h2: "Cum negociezi corect în 2026",
        paragraphs: [
          "Negocierea funcționează când vii cu argumente: costul reviziei imediate, uzura anvelopelor, o daună reparată sau un termen de distribuție depășit. Un dealer serios acceptă discuția pe aceste puncte.",
          "Ce nu funcționează: comparațiile cu anunțuri de pe alte piețe fără taxe incluse sau cu mașini care nu au același istoric. Cere întotdeauna prețul final, cu toate costurile incluse.",
        ],
      },
    ],
    faqs: [
      {
        q: "Sunt mașinile mai scumpe în Cluj decât în restul țării?",
        a: "Da, în medie cu 5-10% pentru același model, an și kilometraj, din cauza cererii ridicate din zona metropolitană Cluj-Napoca.",
      },
      {
        q: "Care este cel mai bun buget pentru o mașină fiabilă în Cluj?",
        a: "Între 6.000 și 10.000 € găsești compacte și break-uri din 2014-2018 cu istoric bun, care nu necesită investiții majore în primul an.",
      },
    ],
    relatedLandings: [
      "masini-second-hand-5000-10000-euro-cluj",
      "masini-second-hand-sub-5000-euro-cluj",
      "masini-second-hand-10000-15000-euro-cluj",
      "dealer-auto-cluj",
      "masini-din-germania-cluj",
    ],
  },
  {
    slug: "acte-necesare-inmatriculare-masina-cluj",
    title: "Acte necesare pentru înmatricularea unei mașini în Cluj: lista completă",
    metaTitle: "Acte înmatriculare mașină Cluj 2026 | Listă completă",
    description:
      "Toate documentele necesare pentru înmatricularea unei mașini second hand în județul Cluj: contract, CIV, ITP, RCA, taxe și pașii la DRPCIV. Actualizat 2026.",
    keywords:
      "acte inmatriculare masina cluj, inmatriculare auto cluj-napoca, documente masina second hand, drpciv cluj, taxe inmatriculare cluj",
    category: "Documente",
    published: "2026-02-25",
    updated: "2026-08-05",
    readingMinutes: 7,
    excerpt:
      "Ce documente pregătești, în ce ordine le depui și cât te costă înmatricularea unei mașini rulate în județul Cluj.",
    intro: [
      "Înmatricularea unei mașini second hand este simplă dacă dosarul e complet de la început. Cele mai multe întârzieri apar din documente lipsă sau din contracte completate greșit.",
      "Mai jos ai lista exactă și ordinea pașilor, așa cum o parcurgem noi pentru clienții din Cluj-Napoca și Florești.",
    ],
    sections: [
      {
        h2: "Documentele obligatorii",
        paragraphs: [
          "Indiferent dacă mașina vine din România sau din Germania, dosarul are aceleași componente de bază.",
        ],
        bullets: [
          "Cerere de înmatriculare completată",
          "Cartea de identitate a vehiculului (CIV) — pentru mașinile din import, emisă de RAR",
          "Contract de vânzare-cumpărare sau factură, în original",
          "Certificat de înmatriculare anterior / documentele străine originale",
          "ITP valabil, efectuat în România",
          "Asigurare RCA validă pe numele noului proprietar",
          "Dovada plății taxei de înmatriculare și a contravalorii plăcuțelor",
          "Actul de identitate al proprietarului (sau certificat constatator pentru firme)",
          "Certificat fiscal de la Direcția de Taxe și Impozite Locale (fără datorii)",
        ],
      },
      {
        h2: "Pașii, în ordine",
        paragraphs: [
          "Ordinea contează: dacă începi cu RCA înainte de a avea contractul semnat, pierzi timp.",
        ],
        bullets: [
          "1. Semnezi contractul / primești factura de la vânzător",
          "2. Pentru import: omologare RAR și obținerea CIV",
          "3. ITP la o stație autorizată din Cluj",
          "4. RCA pe numele tău",
          "5. Radiere / certificat fiscal, dacă e cazul",
          "6. Depui dosarul la Serviciul Public Comunitar Regim Permise și Înmatriculări Cluj",
          "7. Ridici certificatul de înmatriculare și plăcuțele",
        ],
      },
      {
        h2: "Cât costă și cât durează",
        paragraphs: [
          "Costurile administrative se încadrează, în general, între 700 și 1.200 lei, în funcție de plăcuțe, ITP și eventuala omologare RAR. Programarea la ghișeu se face online, iar dosarul complet se rezolvă de regulă într-o singură vizită.",
          "Pentru mașinile cumpărate de la noi, pregătim dosarul complet: CIV, ITP, contract și tot ce ține de partea de acte. Tu mergi doar la depunerea finală, sau te putem îndruma pas cu pas.",
        ],
      },
      {
        h2: "Greșeli frecvente de evitat",
        paragraphs: [
          "Cele mai dese probleme: contract completat cu date incomplete despre vehicul, lipsa certificatului fiscal al vânzătorului, ITP expirat între semnare și depunere, sau RCA emis pe alt proprietar.",
          "Verifică de două ori seria de șasiu din contract față de cea de pe caroserie. O singură cifră greșită înseamnă un drum în plus.",
        ],
      },
    ],
    faqs: [
      {
        q: "Cât durează înmatricularea unei mașini în Cluj?",
        a: "Cu dosarul complet și programare online, procesul se finalizează de regulă în aceeași zi la ghișeu.",
      },
      {
        q: "Ce acte primesc când cumpăr o mașină de la Bremen Auto?",
        a: "Primești factură sau contract, cartea de identitate a vehiculului, documentele de proveniență și tot dosarul necesar înmatriculării în România.",
      },
      {
        q: "Trebuie ITP făcut în România pentru o mașină din Germania?",
        a: "Da, ITP-ul german (TÜV) nu este suficient pentru înmatriculare; este necesară inspecția tehnică efectuată într-o stație autorizată din România.",
      },
    ],
    relatedLandings: [
      "masini-din-germania-cluj",
      "dealer-auto-cluj",
      "parc-auto-floresti-cluj",
      "masini-second-hand-in-rate-cluj",
    ],
  },
  {
    slug: "cele-mai-fiabile-masini-second-hand-sub-10000-euro",
    title: "Cele mai fiabile mașini second hand sub 10.000 € în 2026",
    metaTitle: "Mașini fiabile sub 10.000 euro | Top 2026 Cluj",
    description:
      "Top modele second hand sub 10.000 € care rezistă: costuri reale de întreținere, motorizări recomandate și problemele de urmărit la fiecare model.",
    keywords:
      "masini fiabile second hand, masini sub 10000 euro cluj, cele mai bune masini rulate, masini second hand recomandate cluj",
    category: "Modele recomandate",
    published: "2026-03-18",
    updated: "2026-08-05",
    readingMinutes: 10,
    excerpt:
      "Modelele care ne dau cele mai puține bătăi de cap în parc, cu motorizările recomandate și defectele tipice pe care le verificăm la fiecare exemplar.",
    intro: [
      "Fiabilitatea nu înseamnă „nu se strică niciodată”, ci „se strică rar și ieftin”. Sub 10.000 €, diferența dintre o alegere bună și una proastă poate fi de 2.000 € pe an în reparații.",
      "Lista de mai jos este bazată pe ce vedem efectiv în parcul din Florești și pe feedbackul clienților la un an după cumpărare.",
    ],
    sections: [
      {
        h2: "Skoda Octavia 1.6 TDI / 1.4 TSI",
        paragraphs: [
          "Cel mai bun raport spațiu-preț-fiabilitate din segment. Mecanica VW, piese peste tot în Cluj, portbagaj enorm și consum de 5-6 l/100 km la diesel.",
          "De verificat: consumul de ulei la 1.8 TSI, distribuția la termen și istoricul digital de service.",
        ],
      },
      {
        h2: "Toyota Auris / Corolla hibrid",
        paragraphs: [
          "Pentru cine face mai ales oraș, hibridul Toyota este imbatabil: 5 l/100 km în trafic clujean, frâne care țin foarte mult din cauza recuperării de energie și defecțiuni rare.",
          "De verificat: starea bateriei hibride (diagnoză specifică) și istoricul de revizii.",
        ],
      },
      {
        h2: "Volkswagen Golf VII 1.6 TDI",
        paragraphs: [
          "Cea mai căutată mașină rulată din Germania și în Cluj. Finisaje solide, șasiu confortabil, cost de întreținere previzibil.",
          "De verificat: mecatronica la DSG, EGR-ul și dosarul de daune al caroseriei.",
        ],
      },
      {
        h2: "Dacia Duster",
        paragraphs: [
          "Pentru drumurile spre Apuseni și pentru cine vrea costuri minime. Gardă la sol mare, piese ieftine, service în orice localitate.",
          "De verificat: cutia de transfer la 4x4, rulmenții și amortizoarele.",
        ],
      },
      {
        h2: "Hyundai i30 / Kia Ceed",
        paragraphs: [
          "Dotări multe la preț mic și o rată de defecțiuni foarte bună. Motorizările 1.6 CRDi sunt economice și rezistente.",
          "De verificat: ambreiajul, discurile de frână și, la variantele cu cutie DCT, comportamentul la manevre lente.",
        ],
      },
      {
        h2: "Ce evităm sub 10.000 €",
        paragraphs: [
          "Modelele premium mari cu motoare peste 2.0 și dotări complexe: prețul de achiziție pare atractiv, dar o suspensie pneumatică sau o cutie automată defectă costă cât un sfert din mașină.",
          "La fel, evită exemplarele fără niciun document de service. Un istoric lipsă înseamnă risc necuantificabil.",
        ],
      },
    ],
    faqs: [
      {
        q: "Care este cea mai fiabilă mașină second hand sub 10.000 €?",
        a: "În practică, Toyota hibrid și Skoda Octavia diesel sunt cele mai puțin problematice, urmate de Golf VII și Hyundai i30.",
      },
      {
        q: "Diesel sau benzină pentru Cluj?",
        a: "Sub 12.000 km pe an și mai ales oraș — benzină sau hibrid. Peste, cu navetă pe drum deschis — diesel modern.",
      },
    ],
    relatedLandings: [
      "masini-second-hand-sub-10000-euro-cluj",
      "skoda-octavia-second-hand-cluj",
      "volkswagen-golf-second-hand-cluj",
      "toyota-second-hand-cluj",
      "dacia-duster-second-hand-cluj",
    ],
  },
  {
    slug: "case-study-client-cluj-masina-in-rate",
    title: "Case study: cum a cumpărat un client din Florești un break în rate",
    metaTitle: "Case study: mașină în rate, client Florești | Bremen",
    description:
      "Povestea reală a unei achiziții: buget 8.500 €, avans acoperit prin buy-back, aprobare credit în 24h și predare în 4 zile. Ce a contat la fiecare pas.",
    keywords:
      "masina in rate cluj, credit auto cluj, buy-back masina cluj, case study achizitie auto, dealer auto floresti",
    category: "Case study",
    published: "2026-04-08",
    updated: "2026-08-05",
    readingMinutes: 6,
    excerpt:
      "Un exemplu concret, de la primul mesaj pe WhatsApp până la predarea cheilor: buget, finanțare, buy-back și acte, în patru zile.",
    intro: [
      "Multe întrebări pe care le primim sună la fel: „se poate în rate?”, „îmi luați mașina la schimb?”, „cât durează?”. Cel mai simplu răspuns este un exemplu real.",
      "Detaliile de mai jos sunt din parcul nostru de pe DN1 Florești, cu acordul clientului, fără nume și fără date personale.",
    ],
    sections: [
      {
        h2: "Punctul de plecare",
        paragraphs: [
          "Familie din Florești, doi copii, navetă zilnică spre Cluj-Napoca și drumuri în weekend spre Apuseni. Buget maxim 8.500 €, cu o mașină veche de predat la schimb.",
          "Cerințe: portbagaj mare, consum mic pe drum deschis, cutie manuală și istoric de service verificabil.",
        ],
      },
      {
        h2: "Ce am recomandat și de ce",
        paragraphs: [
          "Am mers pe un break diesel din 2016, cu 178.000 km și carte de service completă din Germania. Alternativa pe benzină ar fi consumat cu aproximativ 2 l/100 km mai mult la profilul lor de rulaj, adică peste 700 lei pe an în plus.",
          "Clientul a dus mașina la service-ul lui pentru diagnoză înainte de decizie. Rezultat: plăcuțe față de schimbat, restul în parametri — am ajustat prețul corespunzător.",
        ],
      },
      {
        h2: "Finanțarea: avans acoperit prin buy-back",
        paragraphs: [
          "Mașina veche a fost evaluată și preluată la schimb, acoperind integral avansul cerut de finanțator. Restul a fost structurat pe credit auto, cu rată fixă și cost total comunicat înainte de semnare.",
          "Aprobarea a venit în mai puțin de 24 de ore de la depunerea documentelor.",
        ],
      },
      {
        h2: "Predarea, în ziua 4",
        paragraphs: [
          "Am pregătit dosarul de înmatriculare, ITP-ul și contractul. Din primul mesaj pe WhatsApp până la predarea cheilor au trecut patru zile, dintre care două au fost pentru verificarea la service-ul clientului.",
          "Dacă vrei același traseu, scrie-ne pe WhatsApp cu bugetul și tipul de mașină. Îți spunem în aceeași zi ce variante ai în stoc și ce rată ar ieși.",
        ],
      },
    ],
    faqs: [
      {
        q: "Pot acoperi avansul cu mașina mea actuală?",
        a: "Da. Evaluăm mașina ta și scădem valoarea din prețul celei noi; în multe cazuri acoperă integral avansul.",
      },
      {
        q: "Cât durează aprobarea unui credit auto?",
        a: "De regulă în aceeași zi sau în maximum 48 de ore de la depunerea documentelor.",
      },
    ],
    relatedLandings: [
      "masini-second-hand-in-rate-cluj",
      "break-second-hand-cluj",
      "parc-auto-floresti-cluj",
      "dealer-auto-cluj",
    ],
  },
  {
    slug: "masini-din-germania-avantaje-riscuri",
    title: "Mașini aduse din Germania: avantaje reale și riscuri de evitat",
    metaTitle: "Mașini din Germania: avantaje și riscuri | Ghid Cluj",
    description:
      "De ce sunt mașinile germane mai bine întreținute, ce documente contează la import și care sunt capcanele reale ale unei achiziții din Germania.",
    keywords:
      "masini din germania cluj, import auto germania, masini aduse din germania preturi, auto rulate germania cluj-napoca",
    category: "Cum alegi",
    published: "2026-04-29",
    updated: "2026-08-05",
    readingMinutes: 8,
    excerpt:
      "Ce câștigi concret dintr-o mașină adusă din Germania, ce documente trebuie să vezi și cum recunoști un import „aranjat”.",
    intro: [
      "Peste jumătate dintre mașinile rulate vândute în Cluj vin din Germania. Motivul principal nu e prețul, ci istoricul: piața germană documentează întreținerea mult mai riguros.",
      "Asta nu înseamnă că orice mașină din Germania e o mașină bună. Iată ce contează.",
    ],
    sections: [
      {
        h2: "Avantajele reale",
        paragraphs: [
          "La același buget, o mașină germană are de regulă dotări superioare, revizii făcute la timp și un istoric consultabil. Rulajul mediu este mai mare, dar făcut preponderent pe autostradă — adică uzură mai mică pe motor și transmisie decât la aceiași kilometri în oraș.",
        ],
        bullets: [
          "Carte de service completă și facturi de intervenție",
          "Dotări de siguranță mai bune la același preț",
          "Caroserii mai puțin afectate de sare, în multe regiuni",
          "Istoric de daune consultabil în bazele germane",
        ],
      },
      {
        h2: "Riscurile de care ferim clienții",
        paragraphs: [
          "Cele mai frecvente probleme la importuri: kilometraj modificat înainte de intrarea în țară, daune totale reparate cosmetic și mașini cu istoric de taxi sau flotă intensiv folosite.",
          "Un import corect are documentele originale germane, nu doar traduceri, și un istoric care poate fi verificat independent.",
        ],
      },
      {
        h2: "Cum cumperi în siguranță",
        paragraphs: [
          "Varianta cea mai sigură este să cumperi dintr-un parc din România care a adus mașina pe firmă: ai factură, garanție legală de conformitate și un partener local la care te poți întoarce.",
          "La Bremen Auto aducem mașinile noi înșine, le pregătim tehnic și le vindem cu dosar complet, în parcul de pe DN1 Florești. Poți verifica orice exemplar la un service ales de tine, înainte de semnare.",
        ],
      },
    ],
    faqs: [
      {
        q: "Sunt mașinile din Germania mai scumpe?",
        a: "Prețul final este comparabil cu al mașinilor rulate în România, dar dotările și istoricul sunt de obicei superioare la același buget.",
      },
      {
        q: "Ce documente trebuie să aibă o mașină din Germania?",
        a: "Documentele originale germane (Fahrzeugbrief/Fahrzeugschein), contract sau factură de achiziție și, pentru înmatriculare în România, CIV emis de RAR și ITP local.",
      },
    ],
    relatedLandings: [
      "masini-din-germania-cluj",
      "dealer-auto-cluj",
      "volkswagen-passat-second-hand-cluj",
      "parc-auto-floresti-cluj",
    ],
  },
  {
    slug: "diesel-benzina-hibrid-ce-alegi-in-cluj",
    title: "Diesel, benzină sau hibrid în Cluj: ce alegi în funcție de rulaj",
    metaTitle: "Diesel, benzină sau hibrid în Cluj? | Comparativ real",
    description:
      "Comparativ pe costuri reale pentru șoferii din Cluj-Napoca: consum, întreținere, filtru de particule și pragul de kilometri de la care dieselul devine rentabil.",
    keywords:
      "diesel sau benzina cluj, masina hibrid cluj, consum masina oras cluj, ce masina sa cumpar cluj",
    category: "Cum alegi",
    published: "2026-05-20",
    updated: "2026-08-05",
    readingMinutes: 7,
    excerpt:
      "Calculul simplu care îți spune dacă dieselul merită pentru tine, plus ce înseamnă filtrul de particule în traficul din Cluj.",
    intro: [
      "„Diesel sau benzină?” este cea mai frecventă întrebare din parc. Răspunsul nu ține de preferință, ci de câți kilometri faci și pe ce fel de drum.",
    ],
    sections: [
      {
        h2: "Pragul de rentabilitate al dieselului",
        paragraphs: [
          "Un diesel modern consumă cu 1,5-2,5 l/100 km mai puțin decât un echivalent pe benzină, dar costă mai mult la achiziție și are componente scumpe: filtru de particule, EGR, injectoare, sistem AdBlue.",
          "În practică, dieselul devine rentabil de la aproximativ 15.000 km pe an, dacă o parte importantă se face pe drum deschis. Sub acest prag, economia la combustibil nu acoperă riscul de colmatare a filtrului.",
        ],
      },
      {
        h2: "Benzina: alegerea corectă pentru oraș",
        paragraphs: [
          "Pentru un traseu tipic Mănăștur - centru - Mănăștur, un motor pe benzină de 1.0-1.4 litri este soluția logică: cost de întreținere mic, fără regenerări de filtru, pornire ușoară iarna.",
          "Atenție la motorizările mici turbo cu lanț de distribuție — verifică istoricul de service, este singurul punct sensibil real.",
        ],
      },
      {
        h2: "Hibridul: cel mai bun compromis pentru trafic dens",
        paragraphs: [
          "În traficul clujean, un hibrid rulează electric o bună parte din timp și scade consumul sub 5 l/100 km. Frânele durează mult mai mult datorită frânării regenerative.",
          "Singura verificare specifică este starea bateriei de tracțiune, măsurabilă cu o diagnoză dedicată.",
        ],
      },
      {
        h2: "Cum decizi în 2 minute",
        paragraphs: [
          "Împarte kilometrii anuali în oraș și extraurban. Dacă peste 60% sunt extraurbani și treci de 15.000 km/an, alege diesel. Dacă majoritatea sunt urbani, alege benzină sau hibrid. Dacă ai un mix și vrei confort, un hibrid rămâne cea mai sigură alegere pe termen lung.",
        ],
      },
    ],
    faqs: [
      {
        q: "De la câți km pe an merită dieselul?",
        a: "În general de la 15.000 km pe an, cu condiția ca o parte semnificativă să fie rulaj extraurban.",
      },
      {
        q: "Este riscant un hibrid second hand?",
        a: "Nu, dacă bateria de tracțiune este verificată prin diagnoză. Hibrizii Toyota, în special, au o rată de defecțiuni foarte mică.",
      },
    ],
    relatedLandings: [
      "toyota-second-hand-cluj",
      "masini-automate-second-hand-cluj",
      "masini-second-hand-5000-10000-euro-cluj",
      "dealer-auto-cluj",
    ],
  },
  {
    slug: "verificare-masina-inainte-de-cumparare-checklist",
    title: "Checklist: 25 de verificări înainte să cumperi o mașină rulată",
    metaTitle: "Checklist verificare mașină rulată | 25 de puncte",
    description:
      "Lista completă de verificări la o mașină second hand: caroserie, motor, transmisie, electronică, acte și test drive. Descarcă-o mental și mergi pregătit.",
    keywords:
      "verificare masina second hand, checklist cumparare auto, cum verifici o masina rulata, test drive masina second hand cluj",
    category: "Cum alegi",
    published: "2026-06-10",
    updated: "2026-08-05",
    readingMinutes: 9,
    excerpt:
      "Tot ce verifici într-o oră, împărțit pe cinci zone: caroserie, motor, transmisie, interior-electronică și acte.",
    intro: [
      "Un cumpărător pregătit negociază mai bine și greșește mai rar. Parcurge lista de mai jos în ordine și notează fiecare observație — la final ai și lista de argumente pentru preț.",
    ],
    sections: [
      {
        h2: "Caroserie și vopsea",
        paragraphs: ["Verifică pe lumină naturală, nu în hală și nu seara."],
        bullets: [
          "Grosimea vopselei pe fiecare element (tester ieftin)",
          "Spațiile dintre capotă, aripi și uși — simetrie",
          "Șuruburi de balamale cu urme de cheie",
          "Rugină pe praguri, arcuri și lonjeroane",
          "Geamuri: aceeași marcă și an de fabricație",
        ],
      },
      {
        h2: "Motor",
        paragraphs: ["Cere să pornești motorul rece. Este cea mai importantă condiție."],
        bullets: [
          "Zgomote la pornire în primele 30 de secunde",
          "Nivelul și culoarea uleiului; emulsie sub bușon",
          "Scurgeri pe bloc, chiulasă și sub mașină",
          "Culoarea fumului la accelerație",
          "Nivelul antigelului și starea vasului de expansiune",
        ],
      },
      {
        h2: "Transmisie și rulare",
        paragraphs: ["Testează toate treptele, inclusiv marșarier, pe drum liber."],
        bullets: [
          "Ambreiaj: punct de cuplare, patinare la accelerare în treaptă mare",
          "Cutie automată: șocuri sau ezitări la schimbare",
          "Vibrații de direcție la 80-110 km/h",
          "Frânare puternică: mașina trage într-o parte?",
          "Zgomote de rulment la viraje",
        ],
      },
      {
        h2: "Interior și electronică",
        paragraphs: ["Multe defecte scumpe sunt electronice, nu mecanice."],
        bullets: [
          "Toate butoanele, geamurile, oglinzile, clima (rece și cald)",
          "Martori aprinși în bord după pornire",
          "Diagnoză OBD cu citire de erori memorate, nu doar active",
          "Uzura volanului și a scaunului față de kilometraj",
          "Funcționarea senzorilor și a camerelor",
        ],
      },
      {
        h2: "Acte și istoric",
        paragraphs: ["Ultima etapă, dar cea care poate anula complet o afacere bună."],
        bullets: [
          "Seria de șasiu identică în acte și pe caroserie",
          "Istoric de service și fișe ITP anterioare",
          "Verificare daune și istoric km într-o bază independentă",
          "Situația fiscală și lipsa gajului/leasingului activ",
          "Contract sau factură completate corect",
        ],
      },
    ],
    faqs: [
      {
        q: "Cât ar trebui să dureze verificarea unei mașini?",
        a: "Aproximativ o oră pentru verificarea proprie, plus o diagnoză la un service, care mai adaugă 30-60 de minute.",
      },
      {
        q: "Pot verifica mașina la service-ul meu înainte de cumpărare?",
        a: "Da, la Bremen Auto orice mașină poate fi dusă la un service ales de tine înainte de semnarea actelor.",
      },
    ],
    relatedLandings: [
      "dealer-auto-cluj",
      "parc-auto-floresti-cluj",
      "masini-second-hand-sub-10000-euro-cluj",
      "masini-din-germania-cluj",
    ],
  },
];

export const BLOG_POSTS: BlogPost[] = [
  ...BLOG_POSTS_CORE,
  ...BLOG_POSTS_A,
  ...BLOG_POSTS_B,
  ...BLOG_POSTS_C,
].filter((post, index, all) => all.findIndex((p) => p.slug === post.slug) === index);

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export const BLOG_SLUGS = BLOG_POSTS.map((p) => p.slug);

export const BLOG_CATEGORIES: BlogCategory[] = [
  "Cum alegi",
  "Piața Cluj",
  "Documente",
  "Modele recomandate",
  "Case study",
];
