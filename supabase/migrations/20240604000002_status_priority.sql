-- Add status and priority to maintenances table
-- Run via Supabase Dashboard SQL Editor:
-- https://supabase.com/dashboard/project/oechxpgspfzzkplnyudg/sql/new

alter table public.maintenances
  add column if not exists status text not null default 'completed',
  add column if not exists priority text not null default 'medium';

alter table public.maintenances
  add constraint check_maintenance_status check (status in ('pending', 'scheduled', 'completed')),
  add constraint check_maintenance_priority check (priority in ('low', 'medium', 'high'));

-- Update RLS policies to include new columns (they should auto-apply since policies use *)
-- but let's verify the policies still work by granting permissions

grant select, insert, update, delete on public.maintenances to authenticated;
