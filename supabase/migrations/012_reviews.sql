-- User reviews for NYC locations (phase 1 — NYC only, no photos)
-- Complements Google ratings; all reviews start as 'pending' and require admin approval.

create table if not exists public.reviews (
  id               uuid primary key default gen_random_uuid(),
  location_id      uuid not null references public.locations(id) on delete cascade,
  reviewer_name    text not null,
  reviewer_email   text,                    -- optional, never displayed publicly
  rating           int not null check (rating between 1 and 5),
  body             text not null check (char_length(body) >= 15),
  visited_at       date,                    -- optional "when did you go?"
  roll_style_tried text,                    -- optional free text
  status           text not null default 'pending'
                     check (status in ('pending', 'approved', 'rejected')),
  created_at       timestamptz not null default now()
);

create index if not exists reviews_location_id_idx on public.reviews(location_id);
create index if not exists reviews_status_idx       on public.reviews(status);

-- RLS: public can read approved reviews only; writes go through service role API
alter table public.reviews enable row level security;

create policy "Public read approved reviews"
  on public.reviews
  for select
  using (status = 'approved');
