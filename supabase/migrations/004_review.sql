-- Migration: 004_review
-- Run this in your Supabase project's SQL Editor (Database > SQL Editor > New query)

alter table locations
  add column if not exists review text;
