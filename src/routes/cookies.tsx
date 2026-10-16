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
        Google și partenerii săi pot folosi cookie-uri pentru a afișa și măsura reclame, inclusiv personalizate. Acestea
        se activează doar dacă apeși „Accept toate". Fără acord, Google poate afișa doar reclame neprsonalizate, limitate.
      </p>
      <h2>Cum îți schimbi alegerea</h2>
      <p>Poți modifica acordul oricând, de aici sau din linkul „Setări cookie-uri" din subsolul site-ului.</p>
      <Button onClick={openCookieSettings}>Setări cookie-uri</Button>
    </LegalPage>
  ),
});
