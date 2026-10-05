import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_leads",
  title: "List leads",
  description: "List recent customer requests (reservations, financing, alerts). Admins only.",
  inputSchema: {
    limit: z.number().int().min(1).max(100).optional().describe("Max results (default 30)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    const { data, error } = await supabaseForUser(ctx)
      .from("leads")
      .select("kind, name, phone, email, car_title, message, status, created_at")
      .order("created_at", { ascending: false })
      .limit(limit ?? 30);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const leads = data ?? [];
    return { content: [{ type: "text", text: JSON.stringify(leads) }], structuredContent: { leads } };
  },
});
