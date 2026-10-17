import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, legalHead } from "@/components/legal-page";
import { Button } from "@/components/ui/button";
import { openCookieSettings } from "@/components/cookie-consent";

export const Route = createFileRoute("/cookies")({
  head: () =>
    legalHead(
      "/cookies",
      "Politica de cookie-uri — Bremen Auto",
      "Ce cookie-uri folosește bremenauto.ro, pentru ce și cum îți poți schimba oricând acordul.",
    ),
  component: () => (
    <LegalPage eyebrow="Cookie-uri" title="Politica de cookie-uri">
      <p>Cookie-urile sunt fișiere mici salvate în browser. Pe bremenauto.ro folosim:</p>
      <h2>Strict necesare</h2>
      <p>Păstrează alegerea ta privind cookie-urile și sesiunea de administrare. Nu pot fi dezactivate.</p>
      <h2>Publicitate (Google AdSense)</h2>
      <p>
        Google și partenerii săi pot folosi cookie-uri pentru a afișa și măsura reclame. Pentru vizitatorii din
        Spațiul Economic European, Regatul Unit și Elveția, alegerea pentru publicitate este gestionată prin
        platforma certificată Google Privacy &amp; messaging, după activarea mesajului pentru acest site.
        Aceasta prezintă scopurile și furnizorii și permite acceptarea, refuzul și modificarea alegerilor.
      </p>
      <p>
        Acordul nu se acordă printr-un banner personalizat al site-ului. O alegere veche „Accept toate” din acel banner
        nu este folosită drept consimțământ Google. Înaintea semnalelor platformei certificate, setările Google
        pentru stocare publicitară, date publicitare, personalizare și analiză sunt „refuzat”.
      </p>
      <p>
        Reclamele nepersonalizate nu sunt automat scutite de consimțământ pentru cookie-uri. Disponibilitatea
        reclamelor limitate depinde de alegerile tale și de regulile și setările Google.
        Site-ul utilizează și Adsterra pentru bannere, publicitate nativă și Social Bar;
        Google Privacy &amp; messaging gestionează consimțământul Google, nu autorizează automat alți furnizori.
      </p>
      <h2>Cum îți schimbi alegerea</h2>
      <p>
        Butonul „Setări cookie-uri” redeschide mesajul Google pentru modificarea sau retragerea consimțământului,
        când acesta este disponibil. Dacă mesajul nu este activ sau încărcarea lui este blocată, site-ul te informează
        și nu îți cere acordul printr-un formular alternativ.
      </p>
      <Button onClick={openCookieSettings}>Setări cookie-uri</Button>
    </LegalPage>
  ),
});
