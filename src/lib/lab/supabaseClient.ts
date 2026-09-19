import { createClient } from "@supabase/supabase-js";
import { LAB_SUPABASE_ANON_KEY, LAB_SUPABASE_URL } from "./config";

// Single shared client for the Governance Lab subsystem. Isolated from any
// other Supabase usage in this project.
export const labSupabase = createClient(LAB_SUPABASE_URL, LAB_SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});
