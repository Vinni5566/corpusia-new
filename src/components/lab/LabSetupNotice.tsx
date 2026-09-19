import { DatabaseZap } from "lucide-react";

export default function LabSetupNotice() {
  return (
    <div className="glass-panel flex flex-col items-center gap-3 rounded-xl p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <DatabaseZap size={22} />
      </div>
      <p className="text-sm font-semibold text-foreground">
        Governance Lab isn&apos;t connected yet
      </p>
      <p className="max-w-md text-xs text-muted-foreground">
        Set <code className="rounded bg-background/60 px-1 py-0.5">LAB_SUPABASE_URL</code> and{" "}
        <code className="rounded bg-background/60 px-1 py-0.5">LAB_SUPABASE_ANON_KEY</code> in{" "}
        <code className="rounded bg-background/60 px-1 py-0.5">src/lib/lab/config.ts</code>, run the
        migration in <code className="rounded bg-background/60 px-1 py-0.5">supabase/migrations/</code>,
        and deploy the functions in{" "}
        <code className="rounded bg-background/60 px-1 py-0.5">supabase/functions/</code> to your
        Supabase project.
      </p>
    </div>
  );
}
