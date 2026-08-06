import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const LeadSchema = z.object({
  kind: z.enum(["rezervare", "finantare", "alerta", "consilier"]),
  name: z.string().trim().max(100).optional(),
  phone: z.string().trim().max(40).optional(),
  email: z.string().trim().max(255).optional(),
  carSlug: z.string().trim().max(200).optional(),
  carTitle: z.string().trim().max(200).optional(),
  message: z.string().trim().max(1500).optional(),
  details: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
});

export type LeadInput = z.infer<typeof LeadSchema>;

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => LeadSchema.parse(input))
  .handler(async ({ data }) => {
    const { createPublicClient } = await import("./cars.server");
    const { error } = await createPublicClient()
      .from("leads")
      .insert({
        kind: data.kind,
        name: data.name ?? null,
        phone: data.phone ?? null,
        email: data.email ?? null,
        car_slug: data.carSlug ?? null,
        car_title: data.carTitle ?? null,
        message: data.message ?? null,
        details: data.details ?? {},
      });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
