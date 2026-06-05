-- Extensions
create extension if not exists "uuid-ossp" with schema extensions;

-- ============================================================================
-- TABLES
-- ============================================================================

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text not null default '',
  created_at timestamptz not null default now()
);

-- Vehicles
create table public.vehicles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  brand text not null,
  model text not null,
  year integer not null,
  version text,
  plate text,
  color text,
  fuel text,
  current_km integer not null default 0,
  chassis text,
  renavam text,
  acquisition_date date,
  notes text,
  created_at timestamptz not null default now()
);

create index idx_vehicles_user_id on public.vehicles(user_id);

-- Maintenance categories (shared reference data)
create table public.maintenance_categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique
);

-- Maintenances
create table public.maintenances (
  id uuid default gen_random_uuid() primary key,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  category_id uuid not null references public.maintenance_categories(id) on delete restrict,
  title text not null,
  description text,
  maintenance_date date not null,
  vehicle_km integer not null,
  amount numeric(10,2) not null default 0,
  workshop text,
  notes text,
  next_change_km integer,
  next_change_date date,
  created_at timestamptz not null default now()
);

create index idx_maintenances_vehicle_id on public.maintenances(vehicle_id);
create index idx_maintenances_category_id on public.maintenances(category_id);

-- Attachments
create table public.attachments (
  id uuid default gen_random_uuid() primary key,
  maintenance_id uuid not null references public.maintenances(id) on delete cascade,
  file_url text not null,
  file_name text not null,
  created_at timestamptz not null default now()
);

create index idx_attachments_maintenance_id on public.attachments(maintenance_id);

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.maintenance_categories enable row level security;
alter table public.maintenances enable row level security;
alter table public.attachments enable row level security;

-- Profiles
create policy "Users can view own profile" on public.profiles
  for select to authenticated
  using (id = auth.uid());

create policy "Users can update own profile" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Users can insert own profile" on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

-- Vehicles
create policy "Users can view own vehicles" on public.vehicles
  for select to authenticated
  using (user_id = auth.uid());

create policy "Users can insert own vehicles" on public.vehicles
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users can update own vehicles" on public.vehicles
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own vehicles" on public.vehicles
  for delete to authenticated
  using (user_id = auth.uid());

-- Maintenance categories (read-only for all authenticated users)
create policy "Authenticated users can read categories" on public.maintenance_categories
  for select to authenticated
  using (true);

-- Maintenances (ownership via vehicle)
create policy "Users can view own maintenances" on public.maintenances
  for select to authenticated
  using (
    exists (
      select 1 from public.vehicles
      where vehicles.id = maintenances.vehicle_id
      and vehicles.user_id = auth.uid()
    )
  );

create policy "Users can insert maintenances for own vehicles" on public.maintenances
  for insert to authenticated
  with check (
    exists (
      select 1 from public.vehicles
      where vehicles.id = maintenances.vehicle_id
      and vehicles.user_id = auth.uid()
    )
  );

create policy "Users can update own maintenances" on public.maintenances
  for update to authenticated
  using (
    exists (
      select 1 from public.vehicles
      where vehicles.id = maintenances.vehicle_id
      and vehicles.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.vehicles
      where vehicles.id = maintenances.vehicle_id
      and vehicles.user_id = auth.uid()
    )
  );

create policy "Users can delete own maintenances" on public.maintenances
  for delete to authenticated
  using (
    exists (
      select 1 from public.vehicles
      where vehicles.id = maintenances.vehicle_id
      and vehicles.user_id = auth.uid()
    )
  );

-- Attachments (ownership via maintenance -> vehicle)
create policy "Users can view own attachments" on public.attachments
  for select to authenticated
  using (
    exists (
      select 1 from public.maintenances
      join public.vehicles on vehicles.id = maintenances.vehicle_id
      where maintenances.id = attachments.maintenance_id
      and vehicles.user_id = auth.uid()
    )
  );

create policy "Users can insert attachments for own maintenances" on public.attachments
  for insert to authenticated
  with check (
    exists (
      select 1 from public.maintenances
      join public.vehicles on vehicles.id = maintenances.vehicle_id
      where maintenances.id = attachments.maintenance_id
      and vehicles.user_id = auth.uid()
    )
  );

create policy "Users can update own attachments" on public.attachments
  for update to authenticated
  using (
    exists (
      select 1 from public.maintenances
      join public.vehicles on vehicles.id = maintenances.vehicle_id
      where maintenances.id = attachments.maintenance_id
      and vehicles.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.maintenances
      join public.vehicles on vehicles.id = maintenances.vehicle_id
      where maintenances.id = attachments.maintenance_id
      and vehicles.user_id = auth.uid()
    )
  );

create policy "Users can delete own attachments" on public.attachments
  for delete to authenticated
  using (
    exists (
      select 1 from public.maintenances
      join public.vehicles on vehicles.id = maintenances.vehicle_id
      where maintenances.id = attachments.maintenance_id
      and vehicles.user_id = auth.uid()
    )
  );

-- ============================================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- GRANTS (expose tables to Data API)
-- ============================================================================

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on public.maintenance_categories to anon;

-- ============================================================================
-- SEED DATA
-- ============================================================================

insert into public.maintenance_categories (name) values
  ('Troca de Óleo'),
  ('Filtros'),
  ('Freios'),
  ('Pneus'),
  ('Suspensão'),
  ('Motor'),
  ('Transmissão'),
  ('Ar Condicionado'),
  ('Elétrica'),
  ('Funilaria/Pintura'),
  ('Revisão Programada'),
  ('Outros');
