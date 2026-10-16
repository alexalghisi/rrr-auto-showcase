import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, legalHead } from "@/components/legal-page";

export const Route = createFileRoute("/termeni")({
  head: () =>
    legalHead(
      "/termeni",
      "Termeni și condiții — Bremen Auto",
      "Condițiile de folosire a site-ului bremenauto.ro: informații despre stoc, prețuri, rezervări și răspundere.",
    ),
  component: () => (
    <LegalPage eyebrow="Termeni" title="Termeni și condiții">
      <p>Folosind site-ul bremenauto.ro accepți condițiile de mai jos.</p>
      <h2>Informații despre mașini</h2>
      <p>
        Anunțurile au caracter informativ și nu reprezintă o ofertă fermă. Prețurile, dotările și disponibilitatea se
        confirmă la telefon sau la vizionare. Rotirile 360° marcate „Simulare generată cu AI" sunt ilustrative; pozele reale
        și vizionarea fac referință.
      </p>
      <h2>Rezervări și finanțare</h2>
      <p>
        Cererile trimise prin site nu creează obligații până la confirmarea scrisă. Finanțarea depinde de aprobarea
        instituției financiare; calculatorul de rate este orientativ.
      </p>
      <h2>Proprietate intelectuală</h2>
      <p>Textele, fotografiile și logo-ul aparțin Bremen Auto și nu pot fi copiate fără acord.</p>
      <h2>Răspundere</h2>
      <p>
        Depunem efort ca informațiile să fie corecte, dar nu răspundem pentru erori de tastare sau pentru site-urile externe
        la care trimit linkuri. Litigiile se soluționează amiabil sau de instanțele competente din România. Poți apela și la
        ANPC sau la platforma SOL a UE.
      </p>
    </LegalPage>
  ),
});
