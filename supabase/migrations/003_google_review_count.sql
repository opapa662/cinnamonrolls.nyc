-- Migration: 003_google_review_count
-- Run this in your Supabase project's SQL Editor (Database > SQL Editor > New query)

alter table locations
  add column if not exists google_review_count integer;
