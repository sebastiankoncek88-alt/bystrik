-- Moderátor: účet, ktorý má všetko zadarmo a môže darovať Bystrík Plus iným
-- Spustiť raz v Supabase → SQL Editor → New query → Run.
-- DÔLEŽITÉ: v poslednom riadku nahraďte TVOJ_EMAIL svojím e-mailom (tým, ktorým sa prihlasujete v Bystríkovi).

create table if not exists public.admins (email text primary key);
alter table public.admins enable row level security;   -- bez politík: z apky ju nikto nečíta ani nemení

create or replace function public.am_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where lower(email) = lower(auth.jwt() ->> 'email'));
$$;

create or replace function public.grant_plus(target_email text, days int default 365) returns text
language plpgsql security definer set search_path = public, auth as $$
declare uid uuid;
begin
  if not public.am_admin() then raise exception 'not allowed'; end if;
  select id into uid from auth.users where lower(email) = lower(trim(target_email));
  if uid is null then return 'not_found'; end if;
  insert into public.plus (user_id, status, plan, current_period_end, updated_at)
  values (uid, 'active', 'gift', now() + make_interval(days => greatest(1, least(days, 36500))), now())
  on conflict (user_id) do update set status = 'active', plan = 'gift', current_period_end = excluded.current_period_end, updated_at = now();
  return 'ok';
end $$;

create or replace function public.revoke_plus(target_email text) returns text
language plpgsql security definer set search_path = public, auth as $$
declare uid uuid;
begin
  if not public.am_admin() then raise exception 'not allowed'; end if;
  select id into uid from auth.users where lower(email) = lower(trim(target_email));
  if uid is null then return 'not_found'; end if;
  update public.plus set status = 'canceled', updated_at = now() where user_id = uid and plan = 'gift';
  return 'ok';
end $$;

create or replace function public.list_gifts() returns table (email text, until timestamptz, status text)
language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not public.am_admin() then raise exception 'not allowed'; end if;
  return query select u.email::text, p.current_period_end, p.status from public.plus p join auth.users u on u.id = p.user_id where p.plan = 'gift' order by p.updated_at desc limit 100;
end $$;

revoke all on function public.am_admin(), public.grant_plus(text, int), public.revoke_plus(text), public.list_gifts() from public, anon;
grant execute on function public.am_admin(), public.grant_plus(text, int), public.revoke_plus(text), public.list_gifts() to authenticated;

insert into public.admins (email) values ('TVOJ_EMAIL') on conflict do nothing;
