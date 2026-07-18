-- AI Health Guardian — initial schema
-- Auth is handled entirely by Supabase Auth (auth.users); this migration only
-- adds the app-owned tables plus RLS so each user can only ever see their own rows.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  language text not null default 'en' check (language in ('en','hi','kn')),
  theme text not null default 'system' check (theme in ('light','dark','system')),
  created_at timestamptz not null default now()
);

-- auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- prescriptions
-- ---------------------------------------------------------------------------
create table if not exists public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_path text,
  notes text,
  ai_result jsonb,
  confidence_score numeric,
  created_at timestamptz not null default now()
);

create index if not exists prescriptions_user_id_idx on public.prescriptions(user_id);

create table if not exists public.medicines (
  id uuid primary key default gen_random_uuid(),
  prescription_id uuid not null references public.prescriptions(id) on delete cascade,
  name text not null,
  purpose text,
  dosage text,
  morning boolean default false,
  afternoon boolean default false,
  night boolean default false,
  before_food boolean default false,
  after_food boolean default false,
  duration text,
  side_effects text[],
  important_notes text,
  unclear boolean default false
);

create index if not exists medicines_prescription_id_idx on public.medicines(prescription_id);

-- ---------------------------------------------------------------------------
-- bills
-- ---------------------------------------------------------------------------
create table if not exists public.bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  hospital_name text,
  location text,
  insurance_company text,
  notes text,
  file_path text,
  ai_result jsonb,
  accuracy_score numeric,
  created_at timestamptz not null default now()
);

create index if not exists bills_user_id_idx on public.bills(user_id);

-- ---------------------------------------------------------------------------
-- chat_messages
-- ---------------------------------------------------------------------------
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null,
  role text not null check (role in ('user','assistant')),
  content text not null,
  context_type text,
  context_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_user_id_idx on public.chat_messages(user_id);
create index if not exists chat_messages_session_id_idx on public.chat_messages(session_id);

-- ---------------------------------------------------------------------------
-- reminders
-- ---------------------------------------------------------------------------
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  medicine_name text not null,
  time_of_day text not null check (time_of_day in ('morning','afternoon','night')),
  reminder_time time not null,
  active boolean not null default true,
  start_date date not null default current_date,
  end_date date,
  created_at timestamptz not null default now()
);

create index if not exists reminders_user_id_idx on public.reminders(user_id);

-- ---------------------------------------------------------------------------
-- health_scores
-- ---------------------------------------------------------------------------
create table if not exists public.health_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  score_date date not null default current_date,
  adherence numeric,
  nutrition numeric,
  hydration numeric,
  activity numeric,
  sleep numeric,
  risk numeric,
  overall numeric,
  created_at timestamptz not null default now(),
  unique (user_id, score_date)
);

create index if not exists health_scores_user_id_idx on public.health_scores(user_id);

-- ---------------------------------------------------------------------------
-- emergency_checks
-- ---------------------------------------------------------------------------
create table if not exists public.emergency_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symptoms text not null,
  urgency text not null check (urgency in ('green','yellow','red')),
  recommendation jsonb,
  created_at timestamptz not null default now()
);

create index if not exists emergency_checks_user_id_idx on public.emergency_checks(user_id);

-- ---------------------------------------------------------------------------
-- Row Level Security — every table only ever exposes the caller's own rows.
-- The FastAPI backend uses the Supabase SERVICE ROLE key (which bypasses RLS)
-- and enforces user_id from the verified JWT in application code instead;
-- these policies are the defense-in-depth layer for any direct client access
-- (e.g. if the frontend ever queries Supabase directly with the anon key).
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.prescriptions enable row level security;
alter table public.medicines enable row level security;
alter table public.bills enable row level security;
alter table public.chat_messages enable row level security;
alter table public.reminders enable row level security;
alter table public.health_scores enable row level security;
alter table public.emergency_checks enable row level security;

create policy "profiles_select_own" on public.profiles for select using (id = auth.uid());
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid());

create policy "prescriptions_all_own" on public.prescriptions for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "medicines_all_own" on public.medicines for all
  using (exists (select 1 from public.prescriptions p where p.id = medicines.prescription_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.prescriptions p where p.id = medicines.prescription_id and p.user_id = auth.uid()));

create policy "bills_all_own" on public.bills for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "chat_messages_all_own" on public.chat_messages for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "reminders_all_own" on public.reminders for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "health_scores_all_own" on public.health_scores for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "emergency_checks_all_own" on public.emergency_checks for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Storage bucket for uploaded prescription/bill files (private, per-user folder)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', false)
on conflict (id) do nothing;

create policy "uploads_owner_read" on storage.objects for select
  using (bucket_id = 'uploads' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "uploads_owner_write" on storage.objects for insert
  with check (bucket_id = 'uploads' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "uploads_owner_delete" on storage.objects for delete
  using (bucket_id = 'uploads' and (storage.foldername(name))[1] = auth.uid()::text);
