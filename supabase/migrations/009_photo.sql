alter table locations
  add column if not exists photo_url        text,
  add column if not exists photo_source     text,
  add column if not exists photo_attribution text;
