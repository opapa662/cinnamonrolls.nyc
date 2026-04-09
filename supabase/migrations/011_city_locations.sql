-- City locations table for non-NYC cities (Sydney, London, Chicago, etc.)
-- Kept separate from `locations` which is NYC-only.

create table if not exists public.city_locations (
  id                uuid primary key default gen_random_uuid(),
  city              text not null,          -- e.g. 'Sydney', 'London', 'Chicago'
  country           text not null,          -- e.g. 'Australia', 'United Kingdom', 'United States'
  name              text not null,          -- exact business name
  display_name      text,                   -- override for display (optional)
  neighborhood      text,                   -- local equivalent: suburb, district, arrondissement
  location_type     text,                   -- 'bakery', 'café', 'pop-up', 'food stall', etc.
  notes             text,                   -- editorial description of their cinnamon roll
  google_rating     numeric(2,1),           -- e.g. 4.7
  google_review_count int,                  -- e.g. 1243
  google_place_id   text,                   -- for Maps deep-link
  formatted_address text,
  website           text,
  instagram         text,                   -- handle without @
  roll_style        text,                   -- 'classic', 'cardamom', 'laminated', 'japanese', 'vegan', etc.
  price_approx      text,                   -- e.g. '$5', '£4–£5', 'AUD $9'
  mentions          text[],                 -- press/award mentions
  visible           boolean not null default true,
  created_at        timestamptz not null default now()
);

-- Index for the most common query pattern: filter by city
create index if not exists city_locations_city_idx on public.city_locations(city);

-- RLS: public read, no direct writes (use service role for inserts)
alter table public.city_locations enable row level security;

create policy "Public read access"
  on public.city_locations
  for select
  using (visible = true);
