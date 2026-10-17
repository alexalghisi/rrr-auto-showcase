import { createFileRoute } from "@tanstack/react-router";
import { REDACTED_PHOTOS } from "@/lib/redacted-photos";

export const Route = createFileRoute("/api/public/photo/$")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const path = (params as Record<string, string>)["_splat"] ?? "";
        if (!path || path.includes("..")) return new Response("Not found", { status: 404 });
        const redacted = REDACTED_PHOTOS[`/api/public/photo/${path}`];
        if (redacted) return Response.redirect(new URL(redacted, request.url), 302);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from("car-photos").download(path);
        if (error || !data) return new Response("Not found", { status: 404 });

        return new Response(await data.arrayBuffer(), {
          headers: {
            "Content-Type": data.type || "image/jpeg",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
