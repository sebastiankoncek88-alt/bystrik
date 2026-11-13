-- Bystrík – údržba rebríčka (spustiť raz v Supabase → SQL Editor → Run)
-- 1) rýchlejšie načítanie rebríčka
create index if not exists scores_updated_at_idx on public.scores (updated_at);
create index if not exists scores_week_pid_idx on public.scores (week, pid);

-- 2) dieťa bez súhlasu rodiča si zmaže svoje riadky z rebríčka (appka to robí sama)
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'scores' and policyname = 'scores_delete_own') then
    create policy scores_delete_own on public.scores for delete using (auth.uid() = user_id);
  end if;
end $$;

-- 3) čistenie: denné výsledky staršie ako 14 dní, všetko staršie ako 60 dní
create or replace function public.scores_cleanup() returns void
language sql security definer set search_path = public as $$
  delete from public.scores where pid like '%#d' and updated_at < now() - interval '14 days';
  delete from public.scores where updated_at < now() - interval '60 days';
$$;
revoke execute on function public.scores_cleanup() from public, anon, authenticated;

select public.scores_cleanup();

-- 4) automaticky každú noc (najprv zapnite Database → Extensions → pg_cron, potom odkomentujte):
-- select cron.schedule('bystrik-scores-cleanup', '17 3 * * *', 'select public.scores_cleanup()');
