import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ratingInput = z.object({
  carSlug: z.string().regex(/^[a-z0-9-]{1,200}$/),
  voterKey: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
});

export const rateCar = createServerFn({ method: "POST" })
  .inputValidator((data) => ratingInput.parse(data))
  .handler(async ({ data }) => {
    const { createPublicClient } = await import("./cars.server");
    const { data: result, error } = await createPublicClient().rpc("rate_car", {
      p_car_slug: data.carSlug,
      p_voter_key: data.voterKey,
      p_rating: data.rating,
    });

    if (error) throw new Error(error.message);
    const summary = result?.[0];
    if (!summary) throw new Error("Evaluarea nu a putut fi salvată.");

    return {
      average: Number(summary.rating_average),
      count: summary.rating_count,
    };
  });