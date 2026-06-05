-- Storage bucket for maintenance attachments
-- Run via Supabase Dashboard SQL Editor:
-- https://supabase.com/dashboard/project/oechxpgspfzzkplnyudg/sql/new

-- 1. Create the storage bucket (must also be done via dashboard:
--    Storage > New Bucket > "attachments" > Private bucket)
--    OR run: SELECT storage.create_bucket('attachments');

-- 2. Storage RLS policies (user can only access own attachments)
--    Path pattern: {user_id}/{maintenance_id}/{filename}

create policy "Users can upload own attachments"
on storage.objects
for insert to authenticated
with check (
  bucket_id = 'attachments'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can read own attachments"
on storage.objects
for select to authenticated
using (
  bucket_id = 'attachments'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete own attachments"
on storage.objects
for delete to authenticated
using (
  bucket_id = 'attachments'
  and auth.uid()::text = (storage.foldername(name))[1]
);
