-- Add formatted street address column to locations
ALTER TABLE locations ADD COLUMN formatted_address text;
