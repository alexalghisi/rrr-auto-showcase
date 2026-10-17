import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage, legalHead } from "@/components/legal-page";

export const Route = createFileRoute("/confidentialitate")({
  head: () =>
    legalHead(
      "/confidentialitate",
      "Politica de confidențialitate — Bremen Auto",
      "Ce date personale colectează Bremen Auto, de ce, cât timp le păstrăm și ce drepturi ai conform GDPR.",
    ),
  component: () => (
    <LegalPage eyebrow="GDPR" title="Politica de confidențialitate">
      <p>
        Această politică explică modul în care Bremen Auto (operator de date) prelucrează datele personale ale vizitatorilor
        site-ului bremenauto.ro, conform Regulamentului (UE) 2016/679 (GDPR).
      </p>
      <h2>Ce date colectăm</h2>
      <ul>
        <li>Date trimise de tine prin formulare (nume, telefon, e-mail, mesaj, mașina de interes, buget).</li>
        <li>Date tehnice anonime despre vizite (pagina vizitată, data), folosite pentru statistici.</li>
        <li>Evaluări anonime cu stele, fără date de identificare.</li>
        <li>Cookie-uri și identificatori folosiți de Google AdSense, doar cu acordul tău — vezi <Link to="/cookies">Politica de cookie-uri</Link>.</li>
      </ul>
      <h2>De ce le folosim (temei legal)</h2>
      <ul>
        <li>Să răspundem la cereri de ofertă, rezervări sau finanțare — demersuri precontractuale (art. 6(1)(b)).</li>
        <li>Statistici și securitatea site-ului — interes legitim (art. 6(1)(f)).</li>
        <li>Publicitate personalizată — consimțământ (art. 6(1)(a)), pe care îl poți retrage oricând.</li>
      </ul>
      <h2>Publicitate Google</h2>
      <p>
        În SEE, Regatul Unit și Elveția, consimțământul pentru publicitate este gestionat prin CMP-ul certificat
        Google Privacy &amp; messaging, după activarea mesajului pentru site. Îți poți modifica sau retrage acordul
        din „Setări cookie-uri” în subsol. Bannerul personalizat anterior nu constituie un acord pentru AdSense.
      </p>
      <p>
        Folosim Google AdSense. Furnizorii terți, inclusiv Google, folosesc cookie-uri pentru a afișa reclame pe baza
        vizitelor tale anterioare pe acest site sau pe alte site-uri. Poți dezactiva publicitatea personalizată din{" "}
        <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">Setările pentru reclame Google</a>{" "}
        sau de pe <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer">aboutads.info</a>. Detalii:{" "}
        <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">
          cum folosește Google datele de pe site-urile partenere
        </a>.
      </p>
      <h2>Cât timp păstrăm datele</h2>
      <p>Cererile clienților: maximum 24 de luni de la ultimul contact. Statisticile anonime: maximum 36 de luni.</p>
      <h2>Cui transmitem datele</h2>
      <p>
        Furnizorilor de găzduire și infrastructură, Google (publicitate, doar cu acord) și, la cererea ta, partenerilor de
        finanțare. Nu vindem datele personale.
      </p>
      <h2>Drepturile tale</h2>
      <p>
        Acces, rectificare, ștergere, restricționare, portabilitate, opoziție și retragerea consimțământului. Ne poți scrie
        la adresa de mai jos. Ai dreptul să depui plângere la ANSPDCP (dataprotection.ro).
      </p>
    </LegalPage>
  ),
});
