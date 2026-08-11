import { createFileRoute } from "@tanstack/react-router";

/**
 * Întreținere SEO zilnică apelată de pg_cron: re-trimite tot indexul de URL-uri
 * către motoarele de căutare (IndexNow) și face ping pe sitemap.
 * Autentificare: header `apikey` cu cheia publishable a proiectului.
 */
export const Route = createFileRoute("/api/public/hooks/seo-refresh")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = request.headers.get("apikey");
        const expected =
          process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_ANON_KEY"];
        if (!key || !expected || key !== expected) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        try {
          const { dailySeoRefresh } = await import("@/lib/seo-ping.server");
          return Response.json({ ok: true, ...(await dailySeoRefresh()) });
        } catch (error) {
          console.error("SEO refresh failed", error);
          return Response.json({ ok: false, error: "Reindexarea a eșuat" }, { status: 502 });
        }
      },
    },
  },
});
