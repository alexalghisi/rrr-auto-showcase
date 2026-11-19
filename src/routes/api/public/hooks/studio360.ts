import { createFileRoute } from "@tanstack/react-router";

/**
 * Generează unghiurile 360° de studio lipsă (câte 2 pe apel), apelat de pg_cron la 3 minute.
 * Autentificare: header `apikey` cu cheia publishable a proiectului.
 * Parametri opționali: ?slug=<mașină> (doar una), &reset=1 (o ia de la zero), &max=1..4.
 */
export const Route = createFileRoute("/api/public/hooks/studio360")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = request.headers.get("apikey");
        const expected =
          process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_ANON_KEY"];
        if (!key || !expected || key !== expected) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        const params = new URL(request.url).searchParams;
        try {
          const { runStudio360 } = await import("@/lib/studio360.server");
          const result = await runStudio360({
            slug: params.get("slug") ?? undefined,
            reset: params.get("reset") === "1",
            redo: (params.get("redo") ?? "")
              .split(",")
              .filter(Boolean)
              .map(Number)
              .filter((n) => n >= 0 && n < 8),
            max: Number(params.get("max")) || undefined,
          });
          return Response.json({ ok: true, ...result });
        } catch (error) {
          console.error("Studio 360 failed", error);
          return Response.json({ ok: false, error: (error as Error).message }, { status: 502 });
        }
      },
    },
  },
});
