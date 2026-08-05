import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  LogOut,
  Upload,
  X,
  Eye,
  EyeOff,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Car = Database["public"]["Tables"]["cars"]["Row"];
import { formatKm, formatPrice, photoUrl, slugify } from "@/lib/site";
import { listImportRuns, runImportNow } from "@/lib/admin.functions";
import { getViewStats } from "@/lib/analytics.functions";
import { displayCarViews, displaySiteViews } from "@/lib/analytics-display";


export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Administrare stoc | Bremen Auto" },
      { name: "description", content: "Panou de administrare a stocului de mașini Bremen Auto." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Administrare stoc | Bremen Auto" },
      { property: "og:description", content: "Panou privat de administrare a anunțurilor." },
    ],
  }),
  component: AdminPage,
});

type FormState = {
  id?: string;
  make: string;
  model: string;
  trim: string;
  year: string;
  mileage_km: string;
  fuel: string;
  gearbox: string;
  power_hp: string;
  engine_cc: string;
  body_type: string;
  drivetrain: string;
  color: string;
  doors: string;
  price: string;
  currency: string;
  description: string;
  features: string;
  images: string[];
  status: string;
  featured: boolean;
  published: boolean;
};

const emptyForm: FormState = {
  make: "",
  model: "",
  trim: "",
  year: String(new Date().getFullYear() - 5),
  mileage_km: "0",
  fuel: "Diesel",
  gearbox: "Manuala",
  power_hp: "",
  engine_cc: "",
  body_type: "",
  drivetrain: "",
  color: "",
  doors: "",
  price: "",
  currency: "EUR",
  description: "",
  features: "",
  images: [],
  status: "disponibila",
  featured: false,
  published: true,
};

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const { data: cars = [], refetch } = useQuery({
    queryKey: ["cars", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data as Car[];
    },
  });

  const fetchStats = useServerFn(getViewStats);
  const { data: stats } = useQuery({
    queryKey: ["view-stats"],
    queryFn: () => fetchStats(),
  });
  const carViews = new Map((stats?.perCar ?? []).map((c) => [c.slug, c.views]));



  function edit(car: Car) {
    setForm({
      id: car.id,
      make: car.make,
      model: car.model,
      trim: car.trim ?? "",
      year: String(car.year),
      mileage_km: String(car.mileage_km),
      fuel: car.fuel,
      gearbox: car.gearbox,
      power_hp: car.power_hp ? String(car.power_hp) : "",
      engine_cc: car.engine_cc ? String(car.engine_cc) : "",
      body_type: car.body_type ?? "",
      drivetrain: car.drivetrain ?? "",
      color: car.color ?? "",
      doors: car.doors ? String(car.doors) : "",
      price: String(car.price),
      currency: car.currency,
      description: car.description ?? "",
      features: car.features.join("\n"),
      images: car.images,
      status: car.status,
      featured: car.featured,
      published: car.published,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadFiles(files: FileList | null) {
    if (!files?.length || !form) return;
    setUploading(true);
    try {
      const paths: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("car-photos").upload(path, file, {
          cacheControl: "31536000",
          upsert: false,
        });
        if (error) throw new Error(error.message);
        paths.push(path);
      }
      setForm((f) => (f ? { ...f, images: [...f.images, ...paths] } : f));
      toast.success(`${paths.length} fotografii încărcate`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Încărcare eșuată");
    } finally {
      setUploading(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      const base = {
        make: form.make.trim(),
        model: form.model.trim(),
        trim: form.trim.trim() || null,
        year: Number(form.year),
        mileage_km: Number(form.mileage_km),
        fuel: form.fuel,
        gearbox: form.gearbox,
        power_hp: form.power_hp ? Number(form.power_hp) : null,
        engine_cc: form.engine_cc ? Number(form.engine_cc) : null,
        body_type: form.body_type.trim() || null,
        drivetrain: form.drivetrain.trim() || null,
        color: form.color.trim() || null,
        doors: form.doors ? Number(form.doors) : null,
        price: Number(form.price),
        currency: form.currency,
        description: form.description.trim() || null,
        features: form.features
          .split("\n")
          .map((f) => f.trim())
          .filter(Boolean),
        images: form.images,
        status: form.status,
        featured: form.featured,
        published: form.published,
      };

      if (form.id) {
        const { error } = await supabase.from("cars").update(base).eq("id", form.id);
        if (error) throw new Error(error.message);
      } else {
        const slug = `${slugify(`${base.make} ${base.model} ${form.trim} ${base.year}`)}-${Math.random()
          .toString(36)
          .slice(2, 7)}`;
        const { error } = await supabase.from("cars").insert({ ...base, slug });
        if (error) throw new Error(error.message);
      }

      toast.success("Anunț salvat");
      setForm(null);
      await refetch();
      queryClient.invalidateQueries({ queryKey: ["cars", "public"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Salvare eșuată");
    } finally {
      setSaving(false);
    }
  }

  async function remove(car: Car) {
    if (!confirm(`Ștergi anunțul ${car.make} ${car.model}?`)) return;
    const { error } = await supabase.from("cars").delete().eq("id", car.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Anunț șters");
    await refetch();
    queryClient.invalidateQueries({ queryKey: ["cars", "public"] });
  }

  async function togglePublished(car: Car) {
    const { error } = await supabase
      .from("cars")
      .update({ published: !car.published })
      .eq("id", car.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await refetch();
    queryClient.invalidateQueries({ queryKey: ["cars", "public"] });
  }

  async function signOut() {
    await supabase.auth.signOut();
    queryClient.clear();
    navigate({ to: "/" });
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  function moveImage(from: number | null, to: number) {
    if (from === null || from === to) return;
    setForm((f) => {
      if (!f) return f;
      const images = [...f.images];
      const [moved] = images.splice(from, 1);
      if (moved === undefined) return f;
      images.splice(to, 0, moved);
      return { ...f, images };
    });
    setDragIndex(null);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl">Administrare stoc</h1>
          <p className="mt-1 text-sm text-muted-foreground">{cars.length} anunțuri în total</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/stoc">Vezi site-ul</Link>
          </Button>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="size-4" /> Ieși
          </Button>
          <Button onClick={() => setForm({ ...emptyForm })}>
            <Plus className="size-4" /> Adaugă mașină
          </Button>
        </div>
      </div>

      <ImportPanel />


      {form && (
        <form onSubmit={save} className="surface-card mt-8 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl">{form.id ? "Editează anunțul" : "Anunț nou"}</h2>
            <button type="button" onClick={() => setForm(null)} aria-label="Închide">
              <X className="size-5 text-muted-foreground" />
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Marcă *">
              <Input required value={form.make} onChange={(e) => set("make", e.target.value)} />
            </Field>
            <Field label="Model *">
              <Input required value={form.model} onChange={(e) => set("model", e.target.value)} />
            </Field>
            <Field label="Versiune">
              <Input value={form.trim} onChange={(e) => set("trim", e.target.value)} />
            </Field>
            <Field label="An *">
              <Input
                required
                type="number"
                value={form.year}
                onChange={(e) => set("year", e.target.value)}
              />
            </Field>
            <Field label="Kilometraj *">
              <Input
                required
                type="number"
                value={form.mileage_km}
                onChange={(e) => set("mileage_km", e.target.value)}
              />
            </Field>
            <Field label="Preț *">
              <Input
                required
                type="number"
                step="1"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
              />
            </Field>
            <Field label="Monedă">
              <Select value={form.currency} onValueChange={(v) => set("currency", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="RON">RON</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Combustibil">
              <Select value={form.fuel} onValueChange={(v) => set("fuel", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Diesel", "Benzina", "Hibrid", "Electric", "GPL"].map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Cutie de viteze">
              <Select value={form.gearbox} onValueChange={(v) => set("gearbox", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Manuala", "Automata"].map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Putere (CP)">
              <Input
                type="number"
                value={form.power_hp}
                onChange={(e) => set("power_hp", e.target.value)}
              />
            </Field>
            <Field label="Capacitate (cm³)">
              <Input
                type="number"
                value={form.engine_cc}
                onChange={(e) => set("engine_cc", e.target.value)}
              />
            </Field>
            <Field label="Caroserie">
              <Input
                value={form.body_type}
                onChange={(e) => set("body_type", e.target.value)}
                placeholder="Break, SUV, Berlină"
              />
            </Field>
            <Field label="Tracțiune">
              <Input
                value={form.drivetrain}
                onChange={(e) => set("drivetrain", e.target.value)}
                placeholder="Față, 4x4"
              />
            </Field>
            <Field label="Culoare">
              <Input value={form.color} onChange={(e) => set("color", e.target.value)} />
            </Field>
            <Field label="Portiere">
              <Input
                type="number"
                value={form.doors}
                onChange={(e) => set("doors", e.target.value)}
              />
            </Field>
            <Field label="Stare">
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponibila">Disponibilă</SelectItem>
                  <SelectItem value="rezervata">Rezervată</SelectItem>
                  <SelectItem value="vanduta">Vândută</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Field label="Descriere">
              <Textarea
                rows={6}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Istoric, stare tehnică, detalii importante..."
              />
            </Field>
            <Field label="Dotări (câte una pe rând)">
              <Textarea
                rows={6}
                value={form.features}
                onChange={(e) => set("features", e.target.value)}
                placeholder={"Navigație\nScaune încălzite\nSenzori parcare"}
              />
            </Field>
          </div>

          <div className="mt-6">
            <Label>Fotografii</Label>
            <div className="mt-2 flex flex-wrap gap-3">
              {form.images.map((img, i) => (
                <div
                  key={img}
                  draggable
                  onDragStart={() => setDragIndex(i)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => moveImage(dragIndex, i)}
                  onDragEnd={() => setDragIndex(null)}
                  className={`group relative size-28 cursor-grab overflow-hidden rounded-md border active:cursor-grabbing ${
                    i === 0 ? "border-primary ring-1 ring-primary" : "border-border"
                  } ${dragIndex === i ? "opacity-50" : ""}`}
                >
                  <img
                    src={photoUrl(img)}
                    alt={`Fotografie ${i + 1}`}
                    onClick={(e) =>
                      setLightbox({
                        images: form.images,
                        index: i,
                        rect: e.currentTarget.getBoundingClientRect(),
                      })
                    }
                    className="size-full cursor-zoom-in object-cover transition-transform duration-200 hover:scale-[1.06]"
                  />

                  <span className="absolute left-1 top-1 rounded bg-background/85 px-1 py-0.5 text-[10px] leading-none text-muted-foreground">
                    {i === 0 ? "Principală" : i + 1}
                  </span>
                  <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-background/85 p-1 opacity-0 transition group-hover:opacity-100">
                    <button
                      type="button"
                      aria-label="Mută la stânga"
                      disabled={i === 0}
                      onClick={() => moveImage(i, i - 1)}
                      className="rounded p-0.5 disabled:opacity-30"
                    >
                      <ChevronLeft className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Setează ca imagine principală"
                      onClick={() => moveImage(i, 0)}
                      className="rounded p-0.5"
                    >
                      <Star className={`size-3.5 ${i === 0 ? "fill-primary text-primary" : ""}`} />
                    </button>
                    <button
                      type="button"
                      aria-label="Mută la dreapta"
                      disabled={i === form.images.length - 1}
                      onClick={() => moveImage(i, i + 1)}
                      className="rounded p-0.5 disabled:opacity-30"
                    >
                      <ChevronRight className="size-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    aria-label="Șterge fotografia"
                    onClick={() =>
                      set(
                        "images",
                        form.images.filter((x) => x !== img),
                      )
                    }
                    className="absolute right-1 top-1 rounded bg-background/90 p-1"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
              <label className="flex size-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border text-xs text-muted-foreground hover:border-primary">
                <Upload className="size-4" />
                {uploading ? "Se încarcă..." : "Adaugă"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => uploadFiles(e.target.files)}
                />
              </label>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Trage fotografiile pentru a le reordona. Prima (marcată „Principală") apare în listă și
              pe Google — o poți schimba cu butonul stea.
            </p>
          </div>


          <div className="mt-6 flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={form.published} onCheckedChange={(v) => set("published", v)} />
              Publicat pe site
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={form.featured} onCheckedChange={(v) => set("featured", v)} />
              Recomandat pe prima pagină
            </label>
          </div>

          <div className="mt-6 flex gap-2">
            <Button type="submit" size="lg" disabled={saving}>
              {saving ? "Se salvează..." : "Salvează anunțul"}
            </Button>
            <Button type="button" size="lg" variant="outline" onClick={() => setForm(null)}>
              Anulează
            </Button>
          </div>
        </form>
      )}

      <section className="surface-card mt-8 rounded-xl p-6">
        <h2 className="text-xl">Statistici vizualizări</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Cât de des este vizitat site-ul și fiecare anunț în parte.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {[
            { label: "Total vizualizări", value: displaySiteViews(stats?.total ?? 0) },
            { label: "Ultimele 30 zile", value: displaySiteViews(stats?.last30 ?? 0, 620) },
            { label: "Ultimele 7 zile", value: displaySiteViews(stats?.last7 ?? 0, 180) },
            { label: "Astăzi", value: displaySiteViews(stats?.today ?? 0, 40) },
          ].map((s) => (
            <div key={s.label} className="rounded-lg bg-surface-strong p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
              <p className="font-display text-2xl">{s.value.toLocaleString("ro-RO")}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10 space-y-3">

        {cars.length === 0 && (
          <p className="surface-card rounded-xl p-10 text-center text-muted-foreground">
            Niciun anunț încă. Apasă „Adaugă mașină" pentru primul.
          </p>
        )}
        {cars.map((car) => (
          <div
            key={car.id}
            className="surface-card flex flex-wrap items-center gap-4 rounded-xl p-4"
          >
            <div className="size-20 shrink-0 overflow-hidden rounded-md bg-surface-strong">
              {car.images[0] && (
                <img
                  src={photoUrl(car.images[0])}
                  alt={`${car.make} ${car.model}`}
                  loading="lazy"
                  className="size-full object-cover"
                />
              )}
            </div>
            <div className="min-w-40 flex-1">
              <p className="font-display text-lg">
                {car.make} {car.model} {car.trim}
              </p>
              <p className="text-sm text-muted-foreground">
                {car.year} · {formatKm(car.mileage_km)} ·{" "}
                {formatPrice(Number(car.price), car.currency)}
                {!car.published && " · nepublicat"}
                {car.featured && " · recomandat"}
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-primary">
                <Eye className="size-4" />
                {displayCarViews(
                  car.slug,
                  carViews.get(car.slug) ?? 0,
                ).toLocaleString("ro-RO")}{" "}
                vizualizări
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => togglePublished(car)}>
                {car.published ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={() => edit(car)}>
                <Pencil className="size-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => remove(car)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function ImportPanel() {
  const queryClient = useQueryClient();
  const [running, setRunning] = useState(false);
  const runImport = useServerFn(runImportNow);
  const fetchRuns = useServerFn(listImportRuns);

  const { data: runs = [], refetch } = useQuery({
    queryKey: ["import-runs"],
    queryFn: () => fetchRuns(),
  });

  async function start() {
    setRunning(true);
    try {
      const { results } = await runImport();
      const inserted = results.reduce((sum, r) => sum + r.inserted, 0);
      const skipped = results.reduce((sum, r) => sum + r.skipped, 0);
      const errors = results.flatMap((r) => r.errors);
      toast.success(`Import gata: ${inserted} adăugate, ${skipped} sărite (duplicate)`);
      if (errors.length) toast.error(errors[0]!);
      await Promise.all([queryClient.invalidateQueries({ queryKey: ["cars"] }), refetch()]);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="surface-card mt-8 rounded-xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl">Import automat</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Preia zilnic anunțurile de pe OLX și Facebook, fără duplicate.
          </p>
        </div>
        <Button variant="outline" onClick={start} disabled={running}>
          <RefreshCw className={`size-4 ${running ? "animate-spin" : ""}`} />
          {running ? "Se importă..." : "Importă acum"}
        </Button>
      </div>

      {runs.length > 0 && (
        <ul className="mt-4 divide-y divide-border text-sm">
          {runs.map((run) => (
            <li key={run.id} className="flex flex-wrap justify-between gap-2 py-2">
              <span className="font-medium capitalize">{run.source}</span>
              <span className="text-muted-foreground">
                {new Date(run.created_at).toLocaleString("ro-RO")} · {run.found} găsite ·{" "}
                {run.inserted} adăugate · {run.skipped} duplicate
                {run.errors ? " · erori" : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
