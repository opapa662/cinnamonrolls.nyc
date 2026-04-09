-- Migration: 006_analytics
-- Run this in your Supabase project's SQL Editor (Database > SQL Editor > New query)

-- Analytics events table
create table if not exists analytics_events (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  session_id text not null,
  event_name text not null,
  properties jsonb default '{}',
  page_url text,
  referrer text,
  user_agent text,
  viewport_width int,
  viewport_height int,
  utm_source text,
  utm_medium text,
  utm_campaign text
);

create index if not exists idx_analytics_events_name on analytics_events(event_name);
create index if not exists idx_analytics_events_created on analytics_events(created_at);
create index if not exists idx_analytics_events_session on analytics_events(session_id);

alter table analytics_events enable row level security;

create policy "Allow anonymous inserts on analytics_events"
  on analytics_events for insert to anon with check (true);

grant insert on analytics_events to anon;

-- Error logs table
create table if not exists error_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  session_id text,
  error_message text not null,
  error_type text,
  stack_trace text,
  source_file text,
  line_number int,
  column_number int,
  page_url text,
  user_agent text,
  component_stack text
);

alter table error_logs enable row level security;

create policy "Allow anonymous inserts on error_logs"
  on error_logs for insert to anon with check (true);

grant insert on error_logs to anon;
