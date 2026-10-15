-- Creators AquaHub: starter core schema (CAH-DATA-001 v1.0)
-- REVIEW BEFORE APPLYING. Apply to a disposable development Supabase project first.
-- This migration is not a substitute for RLS integration tests or security review.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Public profile fields only. Never place role, admin, verification or entitlement flags here.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text unique,
  display_name text not null default 'Aquarist',
  bio text,
  avatar_media_id uuid,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_handle_format check (handle is null or handle ~ '^[a-zA-Z0-9_]{3,30}$'),
  constraint profiles_display_name_length check (char_length(display_name) between 1 and 80),
  constraint profiles_bio_length check (bio is null or char_length(bio) <= 500)
);
create unique index if not exists profiles_handle_lower_uq on public.profiles (lower(handle)) where handle is not null;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), nullif(split_part(coalesce(new.email, ''), '@', 1), ''), 'Aquarist')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute procedure public.handle_new_auth_user();

create table if not exists public.tanks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  tank_type text not null check (tank_type in ('freshwater', 'planted', 'marine_reef')),
  dimensions jsonb not null default '{}'::jsonb,
  volume_value numeric(12,3),
  volume_unit text not null default 'litre' check (volume_unit in ('litre', 'us_gallon', 'uk_gallon')),
  setup_date date,
  description text,
  privacy text not null default 'private' check (privacy in ('private', 'unlisted', 'public')),
  cover_media_id uuid,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tanks_name_length check (char_length(name) between 1 and 100),
  constraint tanks_positive_volume check (volume_value is null or volume_value > 0),
  constraint tanks_description_length check (description is null or char_length(description) <= 2000)
);
create index if not exists tanks_owner_updated_idx on public.tanks (owner_id, updated_at desc) where archived_at is null;
create index if not exists tanks_public_idx on public.tanks (updated_at desc) where privacy = 'public' and archived_at is null;

create table if not exists public.parameter_definitions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  display_name text not null,
  description text,
  applies_to text[] not null default array['freshwater','planted','marine_reef']::text[],
  canonical_unit text not null,
  allowed_units text[] not null default '{}',
  category text not null default 'water_chemistry',
  target_guidance jsonb not null default '{}'::jsonb,
  source_title text,
  source_url text,
  source_checked_at timestamptz,
  review_status text not null default 'draft' check (review_status in ('draft','reviewed','retired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint parameter_display_name_length check (char_length(display_name) between 1 and 100)
);

create table if not exists public.parameter_readings (
  id uuid primary key default gen_random_uuid(),
  tank_id uuid not null references public.tanks(id) on delete cascade,
  parameter_definition_id uuid references public.parameter_definitions(id) on delete restrict,
  parameter_slug text not null,
  original_value numeric(16,6) not null,
  original_unit text not null,
  normalized_value numeric(16,6),
  normalized_unit text,
  observed_at timestamptz not null,
  test_method text,
  test_kit text,
  notes text,
  provenance text not null default 'manual' check (provenance in ('manual','import','device')),
  created_at timestamptz not null default now(),
  constraint parameter_reading_notes_length check (notes is null or char_length(notes) <= 2000)
);
create index if not exists parameter_readings_tank_parameter_time_idx on public.parameter_readings (tank_id, parameter_slug, observed_at desc);
create index if not exists parameter_readings_definition_time_idx on public.parameter_readings (tank_id, parameter_definition_id, observed_at desc);

create table if not exists public.species (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  common_names text[] not null default '{}',
  scientific_name text,
  species_group text not null check (species_group in ('fish','plant','coral','invertebrate','algae','other')),
  water_categories text[] not null default '{}',
  care_summary text,
  care_details jsonb not null default '{}'::jsonb,
  compatibility_notes text,
  source_title text,
  source_url text,
  reviewed_by text,
  reviewed_at timestamptz,
  review_status text not null default 'draft' check (review_status in ('draft','reviewed','retired')),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists species_published_group_idx on public.species (species_group, slug) where is_published = true;

create table if not exists public.livestock (
  id uuid primary key default gen_random_uuid(),
  tank_id uuid not null references public.tanks(id) on delete cascade,
  species_id uuid references public.species(id) on delete set null,
  custom_name text,
  display_name text not null,
  quantity integer not null default 1 check (quantity > 0),
  acquired_at date,
  source_note text,
  purchase_cost numeric(12,2),
  currency char(3) not null default 'INR',
  tank_location text,
  status text not null default 'active' check (status in ('active','quarantine','re_homed','lost','deceased','archived')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint livestock_display_name_length check (char_length(display_name) between 1 and 120),
  constraint livestock_cost_nonnegative check (purchase_cost is null or purchase_cost >= 0)
);
create index if not exists livestock_tank_status_idx on public.livestock (tank_id, status);

create table if not exists public.equipment (
  id uuid primary key default gen_random_uuid(),
  tank_id uuid not null references public.tanks(id) on delete cascade,
  name text not null,
  category text not null,
  brand text,
  model text,
  quantity integer not null default 1 check (quantity > 0),
  purchased_at date,
  purchase_cost numeric(12,2),
  currency char(3) not null default 'INR',
  warranty_until date,
  maintenance_interval_days integer,
  last_maintenance_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint equipment_name_length check (char_length(name) between 1 and 120),
  constraint equipment_cost_nonnegative check (purchase_cost is null or purchase_cost >= 0),
  constraint equipment_interval_positive check (maintenance_interval_days is null or maintenance_interval_days > 0)
);
create index if not exists equipment_tank_category_idx on public.equipment (tank_id, category);

create table if not exists public.maintenance_tasks (
  id uuid primary key default gen_random_uuid(),
  tank_id uuid not null references public.tanks(id) on delete cascade,
  title text not null,
  task_type text not null default 'custom',
  description text,
  due_at timestamptz,
  recurrence_rule text,
  reminder_enabled boolean not null default true,
  status text not null default 'active' check (status in ('active','paused','completed','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint maintenance_task_title_length check (char_length(title) between 1 and 160)
);
create index if not exists maintenance_due_idx on public.maintenance_tasks (tank_id, due_at, status);

create table if not exists public.maintenance_logs (
  id uuid primary key default gen_random_uuid(),
  tank_id uuid not null references public.tanks(id) on delete cascade,
  task_id uuid references public.maintenance_tasks(id) on delete set null,
  action_type text not null,
  summary text not null,
  completed_at timestamptz not null default now(),
  duration_minutes integer,
  cost numeric(12,2),
  currency char(3) not null default 'INR',
  notes text,
  created_at timestamptz not null default now(),
  constraint maintenance_duration_nonnegative check (duration_minutes is null or duration_minutes >= 0),
  constraint maintenance_cost_nonnegative check (cost is null or cost >= 0)
);
create index if not exists maintenance_logs_tank_time_idx on public.maintenance_logs (tank_id, completed_at desc);

create table if not exists public.dosing_logs (
  id uuid primary key default gen_random_uuid(),
  tank_id uuid not null references public.tanks(id) on delete cascade,
  product_name text not null,
  target_parameter_slug text,
  amount_value numeric(16,6) not null check (amount_value > 0),
  amount_unit text not null,
  concentration_description text,
  dosed_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists dosing_logs_tank_time_idx on public.dosing_logs (tank_id, dosed_at desc);

create table if not exists public.tank_expenses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  tank_id uuid references public.tanks(id) on delete cascade,
  equipment_id uuid references public.equipment(id) on delete set null,
  livestock_id uuid references public.livestock(id) on delete set null,
  category text not null,
  description text,
  amount numeric(12,2) not null check (amount >= 0),
  currency char(3) not null default 'INR',
  spent_at date not null default current_date,
  created_at timestamptz not null default now()
);
create index if not exists tank_expenses_owner_date_idx on public.tank_expenses (owner_id, spent_at desc);
create index if not exists tank_expenses_tank_date_idx on public.tank_expenses (tank_id, spent_at desc);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'cloudinary' check (provider in ('cloudinary','other')),
  provider_asset_id text not null,
  resource_type text not null default 'image' check (resource_type in ('image','video','raw')),
  visibility text not null default 'private' check (visibility in ('private','public')),
  mime_type text,
  bytes bigint,
  width integer,
  height integer,
  related_tank_id uuid references public.tanks(id) on delete cascade,
  related_livestock_id uuid references public.livestock(id) on delete cascade,
  related_post_id uuid,
  status text not null default 'active' check (status in ('pending','active','deletion_pending','deleted','failed')),
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (provider, provider_asset_id),
  constraint media_bytes_nonnegative check (bytes is null or bytes >= 0),
  constraint media_dimensions_positive check ((width is null or width > 0) and (height is null or height > 0))
);
create index if not exists media_owner_created_idx on public.media_assets (owner_id, created_at desc);
create index if not exists media_public_created_idx on public.media_assets (created_at desc) where visibility = 'public' and status = 'active';

alter table public.profiles drop constraint if exists profiles_avatar_media_id_fkey;
alter table public.profiles add constraint profiles_avatar_media_id_fkey foreign key (avatar_media_id) references public.media_assets(id) on delete set null;
alter table public.tanks drop constraint if exists tanks_cover_media_id_fkey;
alter table public.tanks add constraint tanks_cover_media_id_fkey foreign key (cover_media_id) references public.media_assets(id) on delete set null;

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  tank_id uuid references public.tanks(id) on delete set null,
  post_type text not null default 'discussion' check (post_type in ('showcase','question','journal','guide','event','discussion')),
  title text,
  body text not null,
  visibility text not null default 'public' check (visibility in ('public','unlisted','private')),
  status text not null default 'published' check (status in ('draft','published','hidden','removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint community_post_body_length check (char_length(body) between 1 and 10000),
  constraint community_post_title_length check (title is null or char_length(title) <= 160)
);
create index if not exists community_posts_feed_idx on public.community_posts (created_at desc, id desc) where visibility = 'public' and status = 'published';
create index if not exists community_posts_author_idx on public.community_posts (author_id, created_at desc);
create index if not exists community_posts_tank_idx on public.community_posts (tank_id, created_at desc);

alter table public.media_assets drop constraint if exists media_assets_related_post_id_fkey;
alter table public.media_assets add constraint media_assets_related_post_id_fkey foreign key (related_post_id) references public.community_posts(id) on delete cascade;

create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  status text not null default 'published' check (status in ('published','hidden','removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint post_comment_body_length check (char_length(body) between 1 and 4000)
);
create index if not exists post_comments_post_created_idx on public.post_comments (post_id, created_at asc);

create table if not exists public.post_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction text not null default 'like' check (reaction in ('like','helpful','love')), 
  created_at timestamptz not null default now(),
  unique (post_id, user_id, reaction)
);
create index if not exists post_reactions_post_idx on public.post_reactions (post_id);

create table if not exists public.user_follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  followed_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followed_id),
  constraint cannot_follow_self check (follower_id <> followed_id)
);

create table if not exists public.user_blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint cannot_block_self check (blocker_id <> blocked_id)
);

create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('post','comment','profile','store','message')),
  target_id uuid not null,
  reason text not null,
  details text,
  status text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  moderator_note text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint content_report_details_length check (details is null or char_length(details) <= 4000)
);
create index if not exists content_reports_status_created_idx on public.content_reports (status, created_at asc);

create table if not exists public.store_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete set null,
  business_name text not null,
  description text,
  city text not null,
  area text,
  address_public text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  phone_public text,
  website_url text,
  contact_url text,
  aquarium_categories text[] not null default '{}',
  services text[] not null default '{}',
  verification_status text not null default 'pending' check (verification_status in ('pending','verified','rejected','suspended')),
  is_active boolean not null default false,
  data_source text not null default 'owner_submitted' check (data_source in ('owner_submitted','licensed_api','permitted_public_source','manual_admin')),
  last_confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint store_name_length check (char_length(business_name) between 1 and 160),
  constraint store_geo_valid check ((latitude is null or latitude between -90 and 90) and (longitude is null or longitude between -180 and 180))
);
create index if not exists store_public_search_idx on public.store_profiles (city, verification_status, is_active) where verification_status = 'verified' and is_active = true;

create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  store_id uuid not null references public.store_profiles(id) on delete restrict,
  tank_id uuid references public.tanks(id) on delete set null,
  aquarium_category text not null check (aquarium_category in ('freshwater','planted','marine_reef','unsure')),
  area text,
  request_type text not null,
  description text not null,
  preferred_contact text not null default 'phone' check (preferred_contact in ('phone','email','in_app_later')),
  user_consents_to_share_tank_summary boolean not null default false,
  status text not null default 'submitted' check (status in ('submitted','accepted','declined','scheduled','completed','cancelled','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_request_description_length check (char_length(description) between 1 and 4000)
);
create index if not exists service_requests_requester_idx on public.service_requests (requester_id, created_at desc);
create index if not exists service_requests_store_idx on public.service_requests (store_id, status, created_at desc);

-- Auth/account helper: updated_at triggers.
do $$
declare
  t text;
begin
  foreach t in array array['profiles','tanks','parameter_definitions','livestock','equipment','maintenance_tasks','community_posts','post_comments','store_profiles','service_requests'] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute procedure public.set_updated_at()', t);
  end loop;
end;
$$;

-- Enable RLS everywhere. Review and test each policy before using this migration in production.
alter table public.profiles enable row level security;
alter table public.tanks enable row level security;
alter table public.parameter_definitions enable row level security;
alter table public.parameter_readings enable row level security;
alter table public.species enable row level security;
alter table public.livestock enable row level security;
alter table public.equipment enable row level security;
alter table public.maintenance_tasks enable row level security;
alter table public.maintenance_logs enable row level security;
alter table public.dosing_logs enable row level security;
alter table public.tank_expenses enable row level security;
alter table public.media_assets enable row level security;
alter table public.community_posts enable row level security;
alter table public.post_comments enable row level security;
alter table public.post_reactions enable row level security;
alter table public.user_follows enable row level security;
alter table public.user_blocks enable row level security;
alter table public.content_reports enable row level security;
alter table public.store_profiles enable row level security;
alter table public.service_requests enable row level security;

-- Profiles: public fields are selectable only for public profiles, all profile edits are self-only.
drop policy if exists profiles_read_public_or_self on public.profiles;
create policy profiles_read_public_or_self on public.profiles for select using (is_public = true or id = (select auth.uid()));
drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles for insert with check (id = (select auth.uid()));
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Tanks: owner has full access; only explicitly public, non-archived tank profiles can be read publicly.
drop policy if exists tanks_read_owner_or_public on public.tanks;
create policy tanks_read_owner_or_public on public.tanks for select using (owner_id = (select auth.uid()) or (privacy = 'public' and archived_at is null));
drop policy if exists tanks_insert_owner on public.tanks;
create policy tanks_insert_owner on public.tanks for insert with check (owner_id = (select auth.uid()));
drop policy if exists tanks_update_owner on public.tanks;
create policy tanks_update_owner on public.tanks for update using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
drop policy if exists tanks_delete_owner on public.tanks;
create policy tanks_delete_owner on public.tanks for delete using (owner_id = (select auth.uid()));

-- Reviewed public catalogues. Writes are server/admin only (service role bypasses RLS).
drop policy if exists parameter_definitions_read_reviewed on public.parameter_definitions;
create policy parameter_definitions_read_reviewed on public.parameter_definitions for select using (review_status = 'reviewed');
drop policy if exists species_read_published on public.species;
create policy species_read_published on public.species for select using (is_published = true and review_status = 'reviewed');

-- Tank children: all access requires ownership of the parent tank.
drop policy if exists readings_select_tank_owner on public.parameter_readings;
create policy readings_select_tank_owner on public.parameter_readings for select using (exists (select 1 from public.tanks t where t.id = tank_id and t.owner_id = (select auth.uid())));
drop policy if exists readings_insert_tank_owner on public.parameter_readings;
create policy readings_insert_tank_owner on public.parameter_readings for insert with check (exists (select 1 from public.tanks t where t.id = tank_id and t.owner_id = (select auth.uid())));
drop policy if exists readings_update_tank_owner on public.parameter_readings;
create policy readings_update_tank_owner on public.parameter_readings for update using (exists (select 1 from public.tanks t where t.id = tank_id and t.owner_id = (select auth.uid()))) with check (exists (select 1 from public.tanks t where t.id = tank_id and t.owner_id = (select auth.uid())));
drop policy if exists readings_delete_tank_owner on public.parameter_readings;
create policy readings_delete_tank_owner on public.parameter_readings for delete using (exists (select 1 from public.tanks t where t.id = tank_id and t.owner_id = (select auth.uid())));

-- Repeat standard ownership policies for tank-owned entities.
do $$
declare
  tbl text;
begin
  foreach tbl in array array['livestock','equipment','maintenance_tasks','maintenance_logs','dosing_logs'] loop
    execute format('drop policy if exists %I on public.%I', tbl || '_select_owner', tbl);
    execute format('create policy %I on public.%I for select using (exists (select 1 from public.tanks t where t.id = tank_id and t.owner_id = (select auth.uid())))', tbl || '_select_owner', tbl);
    execute format('drop policy if exists %I on public.%I', tbl || '_insert_owner', tbl);
    execute format('create policy %I on public.%I for insert with check (exists (select 1 from public.tanks t where t.id = tank_id and t.owner_id = (select auth.uid())))', tbl || '_insert_owner', tbl);
    execute format('drop policy if exists %I on public.%I', tbl || '_update_owner', tbl);
    execute format('create policy %I on public.%I for update using (exists (select 1 from public.tanks t where t.id = tank_id and t.owner_id = (select auth.uid()))) with check (exists (select 1 from public.tanks t where t.id = tank_id and t.owner_id = (select auth.uid())))', tbl || '_update_owner', tbl);
    execute format('drop policy if exists %I on public.%I', tbl || '_delete_owner', tbl);
    execute format('create policy %I on public.%I for delete using (exists (select 1 from public.tanks t where t.id = tank_id and t.owner_id = (select auth.uid())))', tbl || '_delete_owner', tbl);
  end loop;
end;
$$;


-- Keep a log's linked task in the same owned tank; a guessed task UUID must not create cross-tank linkage.
drop policy if exists maintenance_logs_insert_owner on public.maintenance_logs;
create policy maintenance_logs_insert_owner on public.maintenance_logs for insert with check (
  exists (select 1 from public.tanks t where t.id = tank_id and t.owner_id = (select auth.uid())) and
  (task_id is null or exists (select 1 from public.maintenance_tasks mt where mt.id = task_id and mt.tank_id = tank_id))
);
drop policy if exists maintenance_logs_update_owner on public.maintenance_logs;
create policy maintenance_logs_update_owner on public.maintenance_logs for update using (
  exists (select 1 from public.tanks t where t.id = tank_id and t.owner_id = (select auth.uid()))
) with check (
  exists (select 1 from public.tanks t where t.id = tank_id and t.owner_id = (select auth.uid())) and
  (task_id is null or exists (select 1 from public.maintenance_tasks mt where mt.id = task_id and mt.tank_id = tank_id))
);

-- Expenses must belong to the authenticated owner and any linked tank must also be owned.
drop policy if exists expenses_select_owner on public.tank_expenses;
create policy expenses_select_owner on public.tank_expenses for select using (owner_id = (select auth.uid()));
drop policy if exists expenses_insert_owner on public.tank_expenses;
create policy expenses_insert_owner on public.tank_expenses for insert with check (
  owner_id = (select auth.uid()) and
  (tank_id is null or exists (select 1 from public.tanks t where t.id = tank_id and t.owner_id = (select auth.uid()))) and
  (equipment_id is null or exists (select 1 from public.equipment e where e.id = equipment_id and e.tank_id = tank_id)) and
  (livestock_id is null or exists (select 1 from public.livestock l where l.id = livestock_id and l.tank_id = tank_id))
);
drop policy if exists expenses_update_owner on public.tank_expenses;
create policy expenses_update_owner on public.tank_expenses for update using (owner_id = (select auth.uid())) with check (
  owner_id = (select auth.uid()) and
  (tank_id is null or exists (select 1 from public.tanks t where t.id = tank_id and t.owner_id = (select auth.uid()))) and
  (equipment_id is null or exists (select 1 from public.equipment e where e.id = equipment_id and e.tank_id = tank_id)) and
  (livestock_id is null or exists (select 1 from public.livestock l where l.id = livestock_id and l.tank_id = tank_id))
);
drop policy if exists expenses_delete_owner on public.tank_expenses;
create policy expenses_delete_owner on public.tank_expenses for delete using (owner_id = (select auth.uid()));

-- Media: owner sees/edits their own media; public media is selectable only when explicitly marked public.
drop policy if exists media_select_owner_or_public on public.media_assets;
create policy media_select_owner_or_public on public.media_assets for select using ((owner_id = (select auth.uid())) or (visibility = 'public' and status = 'active'));
drop policy if exists media_insert_owner on public.media_assets;
create policy media_insert_owner on public.media_assets for insert with check (
  owner_id = (select auth.uid()) and
  (related_tank_id is null or exists (select 1 from public.tanks t where t.id = related_tank_id and t.owner_id = (select auth.uid()))) and
  (related_livestock_id is null or exists (select 1 from public.livestock l join public.tanks t on t.id = l.tank_id where l.id = related_livestock_id and t.owner_id = (select auth.uid()))) and
  (related_post_id is null or exists (select 1 from public.community_posts p where p.id = related_post_id and p.author_id = (select auth.uid())))
);
drop policy if exists media_update_owner on public.media_assets;
create policy media_update_owner on public.media_assets for update using (owner_id = (select auth.uid())) with check (
  owner_id = (select auth.uid()) and
  (related_tank_id is null or exists (select 1 from public.tanks t where t.id = related_tank_id and t.owner_id = (select auth.uid()))) and
  (related_livestock_id is null or exists (select 1 from public.livestock l join public.tanks t on t.id = l.tank_id where l.id = related_livestock_id and t.owner_id = (select auth.uid()))) and
  (related_post_id is null or exists (select 1 from public.community_posts p where p.id = related_post_id and p.author_id = (select auth.uid())))
);
drop policy if exists media_delete_owner on public.media_assets;
create policy media_delete_owner on public.media_assets for delete using (owner_id = (select auth.uid()));

-- Community posts: explicit visibility. Filtering blocked users is also required in feed queries/services.
drop policy if exists community_posts_select_visible on public.community_posts;
create policy community_posts_select_visible on public.community_posts for select using (
  (author_id = (select auth.uid())) or (visibility = 'public' and status = 'published')
);
drop policy if exists community_posts_insert_self on public.community_posts;
create policy community_posts_insert_self on public.community_posts for insert with check (
  author_id = (select auth.uid()) and
  (tank_id is null or exists (select 1 from public.tanks t where t.id = tank_id and t.owner_id = (select auth.uid())))
);
drop policy if exists community_posts_update_self on public.community_posts;
create policy community_posts_update_self on public.community_posts for update using (author_id = (select auth.uid())) with check (
  author_id = (select auth.uid()) and
  (tank_id is null or exists (select 1 from public.tanks t where t.id = tank_id and t.owner_id = (select auth.uid())))
);
drop policy if exists community_posts_delete_self on public.community_posts;
create policy community_posts_delete_self on public.community_posts for delete using (author_id = (select auth.uid()));

-- Comments/reactions must be from signed-in users and attach to visible posts.
-- Ordinary users can only see published comments on visible posts. Author can always see their own comment.
drop policy if exists comments_select_visible_post on public.post_comments;
create policy comments_select_visible_post on public.post_comments for select using (
  (author_id = (select auth.uid())) or (
    status = 'published' and exists (
      select 1 from public.community_posts p where p.id = post_id and
      (p.author_id = (select auth.uid()) or (p.visibility = 'public' and p.status = 'published'))
    )
  )
);
drop policy if exists comments_insert_self on public.post_comments;
create policy comments_insert_self on public.post_comments for insert with check (
  author_id = (select auth.uid()) and exists (
    select 1 from public.community_posts p where p.id = post_id and p.visibility = 'public' and p.status = 'published'
  )
);
drop policy if exists comments_update_self on public.post_comments;
create policy comments_update_self on public.post_comments for update using (author_id = (select auth.uid())) with check (
  author_id = (select auth.uid()) and exists (
    select 1 from public.community_posts p where p.id = post_id and p.visibility = 'public' and p.status = 'published'
  )
);
drop policy if exists comments_delete_self on public.post_comments;
create policy comments_delete_self on public.post_comments for delete using (author_id = (select auth.uid()));

drop policy if exists reactions_select_visible_post on public.post_reactions;
create policy reactions_select_visible_post on public.post_reactions for select using (exists (select 1 from public.community_posts p where p.id = post_id and p.visibility = 'public' and p.status = 'published'));
drop policy if exists reactions_insert_self on public.post_reactions;
create policy reactions_insert_self on public.post_reactions for insert with check (user_id = (select auth.uid()) and exists (select 1 from public.community_posts p where p.id = post_id and p.visibility = 'public' and p.status = 'published'));
drop policy if exists reactions_delete_self on public.post_reactions;
create policy reactions_delete_self on public.post_reactions for delete using (user_id = (select auth.uid()));

-- Follow/block edges are visible only to their creator. Feed code must enforce blocks bidirectionally where needed.
drop policy if exists follows_select_self on public.user_follows;
create policy follows_select_self on public.user_follows for select using (follower_id = (select auth.uid()));
drop policy if exists follows_insert_self on public.user_follows;
create policy follows_insert_self on public.user_follows for insert with check (follower_id = (select auth.uid()));
drop policy if exists follows_delete_self on public.user_follows;
create policy follows_delete_self on public.user_follows for delete using (follower_id = (select auth.uid()));
drop policy if exists blocks_select_self on public.user_blocks;
create policy blocks_select_self on public.user_blocks for select using (blocker_id = (select auth.uid()));
drop policy if exists blocks_insert_self on public.user_blocks;
create policy blocks_insert_self on public.user_blocks for insert with check (blocker_id = (select auth.uid()));
drop policy if exists blocks_delete_self on public.user_blocks;
create policy blocks_delete_self on public.user_blocks for delete using (blocker_id = (select auth.uid()));

-- Reports: reporters can create and inspect their own reports; moderators operate via trusted server tooling.
-- Reporters can ONLY insert new reports with status='open', and cannot set moderator_note, reviewed_by, or reviewed_at.
drop policy if exists reports_select_reporter on public.content_reports;
create policy reports_select_reporter on public.content_reports for select using (reporter_id = (select auth.uid()));
drop policy if exists reports_insert_reporter on public.content_reports;
create policy reports_insert_reporter on public.content_reports for insert with check (
  reporter_id = (select auth.uid()) and
  status = 'open' and
  moderator_note is null and
  reviewed_by is null and
  reviewed_at is null
);

-- Stores: only verified active profiles are publicly discoverable. All writes/verification go through trusted admin flow.
drop policy if exists stores_select_verified on public.store_profiles;
create policy stores_select_verified on public.store_profiles for select using (verification_status = 'verified' and is_active = true);

-- Service requests are private to requester and the claimed owner of the related store.
drop policy if exists service_requests_select_authorized on public.service_requests;
create policy service_requests_select_authorized on public.service_requests for select using (
  requester_id = (select auth.uid()) or exists (
    select 1 from public.store_profiles s where s.id = store_id and s.owner_user_id = (select auth.uid()) and s.verification_status = 'verified'
  )
);
drop policy if exists service_requests_insert_requester on public.service_requests;
create policy service_requests_insert_requester on public.service_requests for insert with check (
  requester_id = (select auth.uid()) and exists (
    select 1 from public.store_profiles s where s.id = store_id and s.verification_status = 'verified' and s.is_active = true
  ) and (tank_id is null or exists (select 1 from public.tanks t where t.id = tank_id and t.owner_id = (select auth.uid())))
);
-- No client update policy for service request status: use a validated server function for state transitions.
drop policy if exists service_requests_update_authorized on public.service_requests;

-- Important review notes:
-- 1. Service role bypasses RLS; it must be kept strictly server-side.
-- 2. Admin/report processing has no client policy by design and must use a secured server/admin gateway.
-- 3. RLS cannot by itself implement every moderation/block rule; enforce block filtering in trusted feed queries and test it.
-- 4. Add production grants, policies, views/RPCs and function privileges intentionally; do not blindly ship defaults.
-- 5. Supabase Storage is not used here for media binaries; Cloudinary is the configured media provider.
-- 6. AI memories and usage belong in Convex if that system is retained; this migration intentionally has no canonical AI memory table.
