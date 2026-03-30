-- Migration: 001_create_locations
-- Run this in your Supabase project's SQL Editor (Database > SQL Editor > New query)

create table if not exists locations (
  id            uuid        primary key default gen_random_uuid(),
  name          text        not null,
  display_name  text,
  latitude      float       not null,
  longitude     float       not null,
  neighborhood  text,
  borough       text,
  source        text,
  notes         text,
  status        text        not null default 'active'
                            check (status in ('active', 'closed')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-update updated_at on row changes
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger locations_updated_at
  before update on locations
  for each row execute function update_updated_at();

-- Row-level security: enabled, but public read access (anon key can read)
alter table locations enable row level security;

create policy "locations_public_read"
  on locations for select
  using (true);
