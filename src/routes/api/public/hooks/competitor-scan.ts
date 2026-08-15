import { createFileRoute } from "@tanstack/react-router";

/** Analiză zilnică a concurenței (apelată de pg_cron). Autentificare prin header `apikey`. */
export const Route = createFileRoute("/api/public/hooks/competitor-scan")({
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
          const { runCompetitorScan } = await import("@/lib/competitor.server");
          return Response.json({ ok: true, ...(await runCompetitorScan()) });
        } catch (error) {
          console.error("competitor scan failed", error);
          return Response.json({ ok: false, error: "Scanarea a eșuat" }, { status: 502 });
        }
      },
    },
  },
});
