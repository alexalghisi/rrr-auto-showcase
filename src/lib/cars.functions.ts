import { createServerFn } from "@tanstack/react-start";

export const listPublicCars = createServerFn({ method: "GET" }).handler(async () => {
  const { createPublicClient } = await import("./cars.server");
  const { data, error } = await createPublicClient()
    .from("cars")
    .select("*")
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getPublicCar = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => ({ slug: String(data.slug).slice(0, 200) }))
  .handler(async ({ data }) => {
    const { createPublicClient } = await import("./cars.server");
    const { data: car, error } = await createPublicClient()
      .from("cars")
      .select("*")
      .eq("published", true)
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return car;
  });
