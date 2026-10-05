import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_cars",
  title: "List cars",
  description: "List cars in the Bremen Auto stock, optionally filtered by make or status.",
  inputSchema: {
    make: z.string().trim().max(60).optional().describe("Filter by make, e.g. BMW."),
    status: z.enum(["disponibila", "rezervata", "vanduta"]).optional().describe("Filter by status."),
    limit: z.number().int().min(1).max(100).optional().describe("Max results (default 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ make, status, limit }, ctx) => {
    let q = supabaseForUser(ctx)
      .from("cars")
      .select("slug, make, model, trim, year, mileage_km, fuel, gearbox, price, currency, status, published")
      .order("created_at", { ascending: false })
      .limit(limit ?? 50);
    if (make) q = q.ilike("make", make);
    if (status) q = q.eq("status", status);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const cars = (data ?? []).map((c) => ({ ...c, price: Number(c.price) }));
    return { content: [{ type: "text", text: JSON.stringify(cars) }], structuredContent: { cars } };
  },
});
