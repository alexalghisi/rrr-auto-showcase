import { createFileRoute } from "@tanstack/react-router";

/**
 * Proxy pentru fotografiile găzduite extern (OLX / Facebook CDN).
 * Multe dintre ele blochează hotlinking-ul direct din browser, așa că le
 * servim prin domeniul nostru, cu cache lung.
 */
const ALLOWED_HOSTS = [
  "olxcdn.com",
  "apollo.olxcdn.com",
  "fbcdn.net",
  "scontent.xx.fbcdn.net",
  "fbsbx.com",
];

function isAllowed(url: URL): boolean {
  return ALLOWED_HOSTS.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
}

export const Route = createFileRoute("/api/public/img")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const raw = new URL(request.url).searchParams.get("u");
        if (!raw) return new Response("Missing url", { status: 400 });

        let target: URL;
        try {
          target = new URL(raw);
        } catch {
          return new Response("Bad url", { status: 400 });
        }
        if (target.protocol !== "https:" || !isAllowed(target)) {
          return new Response("Forbidden host", { status: 403 });
        }

        const upstream = await fetch(target.toString(), {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
            Accept: "image/avif,image/webp,image/*,*/*;q=0.8",
          },
        });
        if (!upstream.ok || !upstream.body) return new Response("Not found", { status: 404 });

        return new Response(upstream.body, {
          headers: {
            "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
            "Cache-Control": "public, max-age=86400, s-maxage=604800",
          },
        });
      },
    },
  },
});
