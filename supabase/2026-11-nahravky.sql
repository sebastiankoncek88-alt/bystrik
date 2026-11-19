-- Bystrík: nahrávky čítania pre rodičovský účet (Supabase Storage)
-- Spustite raz v Supabase → SQL Editor. Vytvorí súkromný priečinok "readings";
-- každý prihlásený účet vidí, nahrá a zmaže iba vlastné nahrávky (priečinok = jeho user id).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('readings', 'readings', false, 15728640, array['audio/webm','audio/mp4','audio/m4a','audio/aac','audio/wav','audio/ogg','audio/mpeg','audio/x-m4a'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists readings_select_own on storage.objects;
drop policy if exists readings_insert_own on storage.objects;
drop policy if exists readings_update_own on storage.objects;
drop policy if exists readings_delete_own on storage.objects;
create policy readings_select_own on storage.objects for select to authenticated using (bucket_id = 'readings' and (storage.foldername(name))[1] = auth.uid()::text);
create policy readings_insert_own on storage.objects for insert to authenticated with check (bucket_id = 'readings' and (storage.foldername(name))[1] = auth.uid()::text);
create policy readings_update_own on storage.objects for update to authenticated using (bucket_id = 'readings' and (storage.foldername(name))[1] = auth.uid()::text);
create policy readings_delete_own on storage.objects for delete to authenticated using (bucket_id = 'readings' and (storage.foldername(name))[1] = auth.uid()::text);
