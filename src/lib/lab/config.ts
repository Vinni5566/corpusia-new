// Governance Lab — external Supabase project configuration.
//
// This project is intentionally SEPARATE from Enter's built-in Enter Cloud
// integration. Only the URL and anon (public) key belong here — both are
// safe to ship in client-side code because they are meant to be public and
// are protected by the Row Level Security policies defined in
// `supabase/migrations/0001_governance_lab.sql`.
//
// Never put a service-role key or any other secret here. Secrets (e.g. an
// LLM provider API key used by the Edge Functions) must be set via
// `supabase secrets set` on your Supabase project and are read from
// `Deno.env` inside `supabase/functions/*/index.ts` — never shipped to the
// browser.

export const LAB_SUPABASE_URL = "https://asfxsovxjdxjuqevfxsc.supabase.co";
export const LAB_SUPABASE_ANON_KEY = "sb_publishable_QWCSXRzBe5tWVCL55slmrA_kLuWFIKl";

export const LAB_SUPABASE_CONFIGURED =
  Boolean(LAB_SUPABASE_URL) && Boolean(LAB_SUPABASE_ANON_KEY);
