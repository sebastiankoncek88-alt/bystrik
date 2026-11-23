-- Moderátor 2: zoznam používateľov a štatistiky (vidí len moderátor – kontroluje am_admin())
-- Spustiť raz v Supabase → SQL Editor → New query → Run (po 2026-11-moderator.sql)

create or replace function public.admin_users() returns table (email text, created_at timestamptz, last_sign_in_at timestamptz, plus_status text, plus_plan text, plus_until timestamptz)
language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not public.am_admin() then raise exception 'not allowed'; end if;
  return query select u.email::text, u.created_at, u.last_sign_in_at, p.status, p.plan, p.current_period_end
    from auth.users u left join public.plus p on p.user_id = u.id order by u.created_at desc limit 1000;
end $$;

create or replace function public.admin_stats() returns json
language plpgsql stable security definer set search_path = public, auth as $$
declare r json;
begin
  if not public.am_admin() then raise exception 'not allowed'; end if;
  select json_build_object(
    'users', (select count(*) from auth.users),
    'new7', (select count(*) from auth.users where created_at > now() - interval '7 days'),
    'active7', (select count(*) from auth.users where last_sign_in_at > now() - interval '7 days'),
    'plus', (select count(*) from public.plus where status in ('active','trialing') and plan <> 'gift' and (current_period_end is null or current_period_end > now())),
    'gifts', (select count(*) from public.plus where status = 'active' and plan = 'gift' and (current_period_end is null or current_period_end > now()))
  ) into r;
  return r;
end $$;

revoke all on function public.admin_users(), public.admin_stats() from public, anon;
grant execute on function public.admin_users(), public.admin_stats() to authenticated;
