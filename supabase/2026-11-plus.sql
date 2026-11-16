-- Bystrík Plus: stav predplatného (zapisuje ho len server – funkcia stripe-webhook)
-- Spustiť raz v Supabase → SQL Editor → New query → Run

create table if not exists public.plus (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null default 'inactive',          -- active | trialing | past_due | canceled | inactive
  plan text,                                         -- month | year | teacher
  current_period_end timestamptz,
  stripe_customer text unique,
  stripe_subscription text,
  updated_at timestamptz not null default now()
);
alter table public.plus enable row level security;

-- rodič vidí len svoj riadok; meniť z apky nemôže nikto (iba server so service_role)
drop policy if exists plus_read on public.plus;
create policy plus_read on public.plus for select to authenticated using (user_id = auth.uid());
revoke insert, update, delete on public.plus from anon, authenticated;
