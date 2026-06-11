-- Fuel logs table
create table public.fuel_logs (
  id uuid default gen_random_uuid() primary key,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  date date not null,
  odometer_km integer not null,
  liters numeric(6,2) not null,
  total_cost numeric(10,2) not null,
  price_per_liter numeric(6,3),
  fuel_type text not null check (fuel_type in ('gasolina', 'etanol', 'diesel', 'gnv')),
  is_full_tank boolean not null default true,
  gas_station text,
  notes text,
  created_at timestamptz not null default now()
);

create index idx_fuel_logs_vehicle_id on public.fuel_logs(vehicle_id);
create index idx_fuel_logs_date on public.fuel_logs(date);

-- RLS
alter table public.fuel_logs enable row level security;

create policy "Users can view own fuel logs" on public.fuel_logs
  for select to authenticated
  using (
    exists (
      select 1 from public.vehicles
      where vehicles.id = fuel_logs.vehicle_id
      and vehicles.user_id = auth.uid()
    )
  );

create policy "Users can insert own fuel logs" on public.fuel_logs
  for insert to authenticated
  with check (
    exists (
      select 1 from public.vehicles
      where vehicles.id = fuel_logs.vehicle_id
      and vehicles.user_id = auth.uid()
    )
  );

create policy "Users can update own fuel logs" on public.fuel_logs
  for update to authenticated
  using (
    exists (
      select 1 from public.vehicles
      where vehicles.id = fuel_logs.vehicle_id
      and vehicles.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.vehicles
      where vehicles.id = fuel_logs.vehicle_id
      and vehicles.user_id = auth.uid()
    )
  );

create policy "Users can delete own fuel logs" on public.fuel_logs
  for delete to authenticated
  using (
    exists (
      select 1 from public.vehicles
      where vehicles.id = fuel_logs.vehicle_id
      and vehicles.user_id = auth.uid()
    )
  );

grant select, insert, update, delete on public.fuel_logs to authenticated;
