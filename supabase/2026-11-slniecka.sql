-- Moderátor 3: darovanie slniečok inému účtu (podľa e-mailu rodiča)
-- Spustiť raz v Supabase → SQL Editor → New query → Run (po 2026-11-moderator.sql)

create table if not exists public.coin_gifts (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount int not null check (amount between 1 and 100000),
  created_at timestamptz not null default now(),
  claimed_at timestamptz
);
alter table public.coin_gifts enable row level security;
drop policy if exists "coin_gifts own read" on public.coin_gifts;
create policy "coin_gifts own read" on public.coin_gifts for select using (auth.uid() = user_id);

-- moderátor pošle slniečka na e-mail
create or replace function public.admin_give_coins(target_email text, amount int) returns text
language plpgsql security definer set search_path = public, auth as $$
declare v uuid;
begin
  if not public.am_admin() then raise exception 'not allowed'; end if;
  if amount < 1 or amount > 100000 then return 'bad'; end if;
  select id into v from auth.users where lower(email) = lower(trim(target_email)) limit 1;
  if v is null then return 'none'; end if;
  insert into public.coin_gifts(user_id, amount) values (v, amount);
  return 'ok';
end $$;

-- prihlásený rodič si v appke vyzdvihne darované slniečka (raz)
create or replace function public.claim_coins() returns int
language plpgsql security definer set search_path = public as $$
declare s int;
begin
  with c as (update public.coin_gifts set claimed_at = now() where user_id = auth.uid() and claimed_at is null returning amount)
  select coalesce(sum(amount), 0) into s from c;
  return s;
end $$;

revoke all on function public.admin_give_coins(text, int), public.claim_coins() from public, anon;
grant execute on function public.admin_give_coins(text, int), public.claim_coins() to authenticated;
