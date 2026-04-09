-- Add status and reviewed_at columns to submissions
alter table submissions
  add column if not exists status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  add column if not exists reviewed_at timestamptz;

-- Allow service role / authenticated users to update submissions
grant update on submissions to authenticated;
