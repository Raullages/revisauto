-- Allow pending maintenances to have no date
alter table public.maintenances alter column maintenance_date drop not null;
