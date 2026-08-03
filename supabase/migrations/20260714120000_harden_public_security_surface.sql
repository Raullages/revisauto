revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;

drop policy if exists "Authenticated users can insert fuel stations" on public.fuel_stations;
drop policy if exists "Authenticated users can update fuel stations" on public.fuel_stations;

revoke insert, update on public.fuel_stations from authenticated;
grant select on public.fuel_stations to authenticated;
