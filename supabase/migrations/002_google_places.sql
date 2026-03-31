-- Migration: 002_google_places
-- Run this in your Supabase project's SQL Editor (Database > SQL Editor > New query)

alter table locations
  add column if not exists google_place_id  text,
  add column if not exists google_rating    float,
  add column if not exists google_hours     jsonb;
