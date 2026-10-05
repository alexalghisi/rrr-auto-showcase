import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "set_car_status",
  title: "Set car status",
  description: "Mark a car as available, reserved or sold (sold hides it from the site). Admins only.",
  inputSchema: {
    slug: z.string().trim().min(1).max(200).describe("Car slug from list_cars."),
    status: z.enum(["disponibila", "rezervata", "vanduta"]),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug, status }, ctx) => {
    const { data, error } = await supabaseForUser(ctx)
      .from("cars")
      .update({ status, published: status !== "vanduta" })
      .eq("slug", slug)
      .select("slug");
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data?.length) return { content: [{ type: "text", text: "Car not found or not allowed." }], isError: true };
    return { content: [{ type: "text", text: `${slug} → ${status}` }] };
  },
});
