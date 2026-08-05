import { createFileRoute } from "@tanstack/react-router";

/**
 * Import automat în fiecare oră, apelat de pg_cron.
 * Autentificare: header `apikey` cu cheia publishable a proiectului.
 */
export const Route = createFileRoute("/api/public/hooks/import-cars")({
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

        const { importAll } = await import("@/lib/import.server");
        const results = await importAll();
        return Response.json({ ok: true, results });
      },
    },
  },
});
