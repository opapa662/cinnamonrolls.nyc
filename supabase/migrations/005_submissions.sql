-- Submissions table for "Add a spot" and "Suggest an edit" form
create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  submission_type text not null check (submission_type in ('addition', 'edit')),
  location_id uuid references locations(id) on delete set null,
  name text,
  website text,
  address text,
  comments text,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table submissions enable row level security;

-- Anyone can insert (public form)
create policy "Public can insert submissions"
  on submissions for insert
  to anon
  with check (true);

-- Only authenticated users (admin) can read
create policy "Authenticated users can read submissions"
  on submissions for select
  to authenticated
  using (true);

-- Grant table-level privileges (required in addition to RLS policies)
grant insert on submissions to anon;
grant select on submissions to authenticated;
