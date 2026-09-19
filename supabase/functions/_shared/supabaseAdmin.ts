import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Edge Functions run with the service-role key so they can write freely,
// bypassing the RLS policies that constrain the anon (browser) key.
export function getServiceClient() {
  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(url, serviceKey);
}
