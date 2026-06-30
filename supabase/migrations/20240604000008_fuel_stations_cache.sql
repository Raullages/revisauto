create table public.fuel_stations (
  id uuid default gen_random_uuid() primary key,
  source text not null default 'anp',
  source_id text not null,
  name text not null,
  brand text,
  cnpj text,
  address text,
  address_complement text,
  neighborhood text,
  city text,
  state text,
  zip_code text,
  latitude numeric(10, 7) not null,
  longitude numeric(10, 7) not null,
  products jsonb not null default '[]'::jsonb,
  validation text,
  accuracy_estimate text,
  data_obtained_at date,
  last_synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fuel_stations_source_source_id_key unique (source, source_id)
);

create index idx_fuel_stations_latitude on public.fuel_stations(latitude);
create index idx_fuel_stations_longitude on public.fuel_stations(longitude);
create index idx_fuel_stations_city_state on public.fuel_stations(city, state);

alter table public.fuel_stations enable row level security;

create policy "Authenticated users can read fuel stations" on public.fuel_stations
  for select to authenticated
  using (true);

create policy "Authenticated users can insert fuel stations" on public.fuel_stations
  for insert to authenticated
  with check (true);

create policy "Authenticated users can update fuel stations" on public.fuel_stations
  for update to authenticated
  using (true)
  with check (true);

grant select, insert, update on public.fuel_stations to authenticated;
