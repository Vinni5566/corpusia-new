-- CorpusAI Governance & Security Lab — RLS Security Hardening Migration
-- Replaces permissive anon check policies with authenticated/service-role checks

-- 1. Drop demo permissive policies
drop policy if exists "lab_demo_insert" on lab_decisions;
drop policy if exists "lab_demo_insert" on lab_bargaining_rounds;
drop policy if exists "lab_demo_insert" on lab_attack_log;
drop policy if exists "lab_demo_insert" on lab_amendment_proposals;
drop policy if exists "lab_demo_insert" on lab_boardroom_sessions;
drop policy if exists "lab_demo_insert" on lab_blocklist_entries;
drop policy if exists "lab_demo_update" on lab_amendment_proposals;
drop policy if exists "lab_demo_update" on lab_constitution_pointer;
drop policy if exists "lab_demo_insert" on lab_constitutions;

-- 2. Restrict write operations exclusively to service_role (Edge Functions)
create policy "lab_service_write" on lab_decisions for insert with check (auth.role() = 'service_role');
create policy "lab_service_write" on lab_bargaining_rounds for insert with check (auth.role() = 'service_role');
create policy "lab_service_write" on lab_attack_log for insert with check (auth.role() = 'service_role');
create policy "lab_service_write" on lab_amendment_proposals for insert with check (auth.role() = 'service_role');
create policy "lab_service_write" on lab_boardroom_sessions for insert with check (auth.role() = 'service_role');
create policy "lab_service_write" on lab_blocklist_entries for insert with check (auth.role() = 'service_role');
create policy "lab_service_write" on lab_constitutions for insert with check (auth.role() = 'service_role');

create policy "lab_service_update" on lab_amendment_proposals for update using (auth.role() = 'service_role');
create policy "lab_service_update" on lab_constitution_pointer for update using (auth.role() = 'service_role');
