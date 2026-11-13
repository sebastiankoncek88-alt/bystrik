-- Bystrík: triedy (režim učiteľa) + úplné zmazanie účtu
-- Spustiť raz v Supabase → SQL Editor → New query → Run

create table if not exists public.classes (
  code text primary key check (code ~ '^[A-Z0-9]{6}$'),
  owner uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 30),
  created_at timestamptz not null default now()
);
create table if not exists public.class_members (
  class_code text not null references public.classes(code) on delete cascade,
  player_code text not null,
  joined_at timestamptz not null default now(),
  primary key (class_code, player_code)
);
alter table public.classes enable row level security;
alter table public.class_members enable row level security;

-- triedu môže nájsť každý prihlásený (aby žiak overil kód), meniť len učiteľ
drop policy if exists cls_read on public.classes;
create policy cls_read on public.classes for select to authenticated using (true);
drop policy if exists cls_ins on public.classes;
create policy cls_ins on public.classes for insert to authenticated with check (owner = auth.uid());
drop policy if exists cls_del on public.classes;
create policy cls_del on public.classes for delete to authenticated using (owner = auth.uid());

-- členstvo: vidí učiteľ triedy a rodič žiaka; pridať môže len rodič vlastného dieťaťa
drop policy if exists cm_read on public.class_members;
create policy cm_read on public.class_members for select to authenticated using (
  exists (select 1 from public.classes c where c.code = class_code and c.owner = auth.uid())
  or exists (select 1 from public.players p where p.code = player_code and p.user_id = auth.uid()));
drop policy if exists cm_ins on public.class_members;
create policy cm_ins on public.class_members for insert to authenticated with check (
  exists (select 1 from public.players p where p.code = player_code and p.user_id = auth.uid()));
drop policy if exists cm_del on public.class_members;
create policy cm_del on public.class_members for delete to authenticated using (
  exists (select 1 from public.classes c where c.code = class_code and c.owner = auth.uid())
  or exists (select 1 from public.players p where p.code = player_code and p.user_id = auth.uid()));

-- úplné zmazanie účtu (volá apka: Rodičovský účet → Bezpečnosť a údaje → Zmazať účet)
create or replace function public.delete_me() returns void
language plpgsql security definer set search_path = public as $$
declare codes text[];
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  select coalesce(array_agg(code), '{}') into codes from public.players where user_id = auth.uid();
  delete from public.messages where from_code = any(codes) or to_code = any(codes);
  delete from public.friends where my_code = any(codes) or friend_code = any(codes);
  delete from public.class_members where player_code = any(codes);
  delete from public.classes where owner = auth.uid();
  delete from public.scores where user_id = auth.uid();
  delete from public.players where user_id = auth.uid();
  delete from public.saves where user_id = auth.uid();
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.delete_me() from public, anon;
grant execute on function public.delete_me() to authenticated;
