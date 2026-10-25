import { createMiddleware } from "@tanstack/react-start";

const PREVIEW_ZONES = [
  "lovableproject.com",
  "lovableproject-dev.com",
  "lovable.app",
  "gpt-eng.com",
  "gptengineer.run",
];

/**
 * True when the browser may hold a Supabase session. On the public site the
 * session lives in localStorage under `sb-<ref>-auth-token`; preview surfaces
 * broker it through the editor, so there we always ask the client.
 */
function mayHaveSession(): boolean {
  try {
    const host = location.hostname;
    if (PREVIEW_ZONES.some((z) => host === z || host.endsWith("." + z))) return true;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("sb-") && key.endsWith("-auth-token")) return true;
    }
    return false;
  } catch {
    return true;
  }
}

/**
 * Same behaviour as `attachSupabaseAuth`, but the Supabase browser client
 * (~200 KB) is imported on demand and only when a session can exist, so public
 * visitors never download it.
 */
export const attachSupabaseAuthLazy = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    if (!mayHaveSession()) return next();
    const { supabase } = await import("@/integrations/supabase/client");
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
);
