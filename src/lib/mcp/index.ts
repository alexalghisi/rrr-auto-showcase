import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listCars from "./tools/list-cars";
import listLeads from "./tools/list-leads";
import setCarStatus from "./tools/set-car-status";

const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "bremen-auto",
  title: "Bremen Auto",
  version: "0.1.0",
  instructions:
    "Tools for the Bremen Auto used-car dealership. Use list_cars to see stock, list_leads for customer requests, and set_car_status to mark cars reserved or sold.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listCars, listLeads, setCarStatus],
});
