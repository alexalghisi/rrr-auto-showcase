import { createFileRoute } from "@tanstack/react-router";

/**
 * Motorul de conținut SEO zilnic (apelat de pg_cron):
 * reîmprospătează intro-urile paginilor programatice, generează draftul
 * săptămânal de blog și anunță motoarele de căutare.
 * Autentificare: header `apikey` cu cheia publishable a proiectului.
 */
export const Route = createFileRoute("/api/public/hooks/seo-daily")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = request.headers.get("apikey");
        const expected =
          process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_ANON_KEY"];
        if (!key || !expected || key !== expected) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
          const { runDailySeoEngine } = await import("@/lib/seo-engine.server");
          return Response.json({ ok: true, ...(await runDailySeoEngine()) });
        } catch (error) {
          console.error("SEO engine failed", error);
          return Response.json({ ok: false, error: "Motorul SEO a eșuat" }, { status: 502 });
        }
      },
    },
  },
});
