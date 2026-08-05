import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";

const TITLE = "Despre Bremen Auto — dealer auto rulate Gilău, Cluj";
const DESCRIPTION =
  "Bremen Auto este un parc auto din Gilău, județul Cluj, specializat în mașini second hand aduse direct din Germania: istoric verificat, carte service și acte complete.";

export const Route = createFileRoute("/despre")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/despre" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "/despre" }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(dealerSchema) },
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbSchema([
            { name: "Acasă", path: "/" },
            { name: "Despre noi", path: "/despre" },
          ]),
        ),
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <p className="eyebrow">Despre noi</p>
      <h1 className="mt-2 text-4xl sm:text-5xl">Mașini din Germania, aduse pentru clujeni</h1>

      <div className="mt-8 space-y-5 text-base leading-relaxed text-muted-foreground">
        <p>
          {SITE.name} este un parc auto din Gilău, județul Cluj, specializat în autoturisme rulate
          aduse direct din Germania. Alegem mașinile una câte una, la fața locului: verificăm
          istoricul de kilometraj, dosarul de daune și cartea de service înainte să le urcăm pe
          platformă.
        </p>
        <p>
          Nu lucrăm cu volume mari și anunțuri copiate. Fiecare mașină din stoc este fotografiată
          real, descrisă cinstit — inclusiv defectele — și pregătită tehnic înainte de livrare.
          Dacă nu găsești modelul dorit, îl căutăm la comandă în bugetul stabilit împreună.
        </p>
        <p>
          Suntem la 15 minute de Cluj-Napoca, așa că poți veni oricând să vezi mașina, să o testezi
          pe drum și să mergi cu ea la un service pentru o verificare independentă. Ne place ca omul
          să plece liniștit, nu doar semnat.
        </p>
      </div>

      <div className="surface-card mt-10 grid gap-6 rounded-xl p-8 sm:grid-cols-3">
        {[
          ["100%", "mașini verificate înainte de a intra în parc"],
          ["Germania", "sursa principală a autoturismelor din stoc"],
          ["Gilău · Cluj", "parcul unde poți veni la probă de drum"],
        ].map(([big, small]) => (
          <div key={big}>
            <p className="font-display text-2xl font-extrabold text-primary">{big}</p>
            <p className="mt-1 text-sm text-muted-foreground">{small}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link to="/stoc">Vezi stocul</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/contact">Contact</Link>
        </Button>
      </div>
    </div>
  );
}
