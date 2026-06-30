alter table public.profiles
  add column fuel_station_reminders_enabled boolean not null default false,
  add column location_permission_status text not null default 'prompt',
  add column push_permission_status text not null default 'default',
  add column last_fuel_reminder_at timestamptz,
  add column last_fuel_reminder_lat numeric(9,6),
  add column last_fuel_reminder_lng numeric(9,6);

alter table public.profiles
  add constraint profiles_location_permission_status_check
    check (location_permission_status in ('prompt', 'granted', 'denied', 'unsupported')),
  add constraint profiles_push_permission_status_check
    check (push_permission_status in ('default', 'granted', 'denied', 'unsupported'));
