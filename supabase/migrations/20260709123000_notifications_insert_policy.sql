create policy "Users can insert own notifications" on public.notifications
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

grant insert on public.notifications to authenticated;
