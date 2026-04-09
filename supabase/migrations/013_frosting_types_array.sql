-- Add frosting_types as a text array to support multiple frosting options
ALTER TABLE locations ADD COLUMN frosting_types text[];

-- Migrate existing single values into the array
UPDATE locations
  SET frosting_types = ARRAY[frosting_type]
  WHERE frosting_type IS NOT NULL AND frosting_type != 'Multiple';

-- For bakeries with 'Multiple' frosting types, set known options
-- (can be updated via admin categorize page)
UPDATE locations
  SET frosting_types = ARRAY['Cream Cheese', 'Brown Butter']
  WHERE frosting_type = 'Multiple' AND name = 'Sunday Morning';

UPDATE locations
  SET frosting_types = ARRAY['Cream Cheese', 'Vanilla Glaze']
  WHERE frosting_type = 'Multiple' AND name = 'Spirals';
