-- =======================================================================
-- Jindal Dental Clinic — Supabase database schema
-- Run this once in your Supabase project: SQL Editor → New Query → Run
-- =======================================================================

-- Enable required extension for UUIDs
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------
-- BOOKINGS — appointment requests from the public form
-- -----------------------------------------------------------------------
create table if not exists public.bookings (
  id              uuid primary key default gen_random_uuid(),
  name            text not null check (char_length(name) between 2 and 120),
  phone           text not null check (char_length(phone) between 8 and 30),
  treatment       text not null,
  preferred_date  date not null,
  preferred_time  text not null,
  message         text,
  status          text not null default 'pending'
                  check (status in ('pending','confirmed','completed','cancelled','no_show')),
  notes           text,                          -- internal notes from clinic
  source          text default 'website',        -- website | whatsapp | walk-in | phone
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists bookings_status_idx        on public.bookings (status);
create index if not exists bookings_preferred_date_idx on public.bookings (preferred_date);
create index if not exists bookings_created_at_idx    on public.bookings (created_at desc);

-- -----------------------------------------------------------------------
-- CONTACT MESSAGES — generic enquiries from the contact form
-- -----------------------------------------------------------------------
create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  message     text not null,
  status      text not null default 'new'
              check (status in ('new','read','replied','archived')),
  created_at  timestamptz not null default now()
);

create index if not exists contact_messages_status_idx on public.contact_messages (status);
create index if not exists contact_messages_created_at_idx on public.contact_messages (created_at desc);

-- -----------------------------------------------------------------------
-- updated_at trigger for bookings
-- -----------------------------------------------------------------------
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_bookings_updated_at on public.bookings;
create trigger set_bookings_updated_at
before update on public.bookings
for each row execute function public.tg_set_updated_at();

-- =======================================================================
-- ROW LEVEL SECURITY
-- =======================================================================
-- Public users can ONLY insert (submit forms) — never read or update.
-- Authenticated users (the admin) get full access.
-- =======================================================================

alter table public.bookings         enable row level security;
alter table public.contact_messages enable row level security;

-- bookings ---------------------------------------------------------------
drop policy if exists "anyone can insert bookings"     on public.bookings;
create policy "anyone can insert bookings"
  on public.bookings for insert
  to anon, authenticated
  with check (true);

drop policy if exists "admin can read bookings"        on public.bookings;
create policy "admin can read bookings"
  on public.bookings for select
  to authenticated
  using (true);

drop policy if exists "admin can update bookings"      on public.bookings;
create policy "admin can update bookings"
  on public.bookings for update
  to authenticated
  using (true) with check (true);

drop policy if exists "admin can delete bookings"      on public.bookings;
create policy "admin can delete bookings"
  on public.bookings for delete
  to authenticated
  using (true);

-- contact_messages -------------------------------------------------------
drop policy if exists "anyone can insert messages"     on public.contact_messages;
create policy "anyone can insert messages"
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);

drop policy if exists "admin can read messages"        on public.contact_messages;
create policy "admin can read messages"
  on public.contact_messages for select
  to authenticated
  using (true);

drop policy if exists "admin can update messages"      on public.contact_messages;
create policy "admin can update messages"
  on public.contact_messages for update
  to authenticated
  using (true) with check (true);

-- =======================================================================
-- DONE. Next: create your admin user.
-- Go to: Supabase Dashboard → Authentication → Users → "Add user"
--   email:    admin@jindaldentalclinic.in   (whatever you want)
--   password: a strong password
--   Auto Confirm User: yes
-- That email/password will log you into /admin
-- =======================================================================
