import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { claimFirstAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Administrare stoc | Bremen Auto" },
      { name: "description", content: "Autentificare pentru administrarea stocului Bremen Auto." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Administrare stoc | Bremen Auto" },
      { property: "og:description", content: "Zonă privată pentru administrarea anunțurilor." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success("Cont creat. Confirmă adresa de email, apoi autentifică-te.");
          setMode("signin");
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }

      try {
        const res = await claimFirstAdmin();
        if (res.granted) toast.success("Ai primit drepturi de administrator.");
      } catch {
        /* rolul există deja sau nu poate fi acordat */
      }

      navigate({ to: "/admin" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Autentificare eșuată");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
        ← Înapoi la site
      </Link>
      <div className="surface-card mt-4 rounded-xl p-8">
        <h1 className="text-2xl">
          {mode === "signin" ? "Autentificare" : "Creează cont administrator"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Zonă privată pentru administrarea stocului Bremen Auto.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Parolă</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Se procesează..." : mode === "signin" ? "Intră în cont" : "Creează cont"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-5 w-full text-sm text-muted-foreground hover:text-foreground"
        >
          {mode === "signin" ? "Nu ai cont? Creează unul" : "Ai deja cont? Autentifică-te"}
        </button>
      </div>
    </div>
  );
}
