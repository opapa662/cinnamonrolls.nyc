-- Roll style: primary dough/technique category (MECE — pick one)
ALTER TABLE locations ADD COLUMN roll_style text
  CHECK (roll_style IN ('Classic American', 'Scandinavian', 'Sourdough', 'Laminated', 'Japanese Milk Bread'));

-- Frosting/topping: primary topping (MECE — pick one)
ALTER TABLE locations ADD COLUMN frosting_type text
  CHECK (frosting_type IN ('Cream Cheese', 'Vanilla Glaze', 'Brown Butter', 'Caramel Glaze', 'Pearl Sugar', 'Naked', 'Multiple'));

-- Dietary flags (boolean, multiple can be true simultaneously)
ALTER TABLE locations ADD COLUMN gluten_free boolean NOT NULL DEFAULT false;
ALTER TABLE locations ADD COLUMN dairy_free  boolean NOT NULL DEFAULT false;
ALTER TABLE locations ADD COLUMN vegan       boolean NOT NULL DEFAULT false;

-- -----------------------------------------------------------------------
-- Seed known categorizations
-- -----------------------------------------------------------------------

-- Scandinavian / Pearl Sugar
UPDATE locations SET roll_style = 'Scandinavian', frosting_type = 'Pearl Sugar'
  WHERE name ILIKE '%Ole & Steen%';

UPDATE locations SET roll_style = 'Scandinavian', frosting_type = 'Vanilla Glaze'
  WHERE name ILIKE '%Bakeri%';

-- Sourdough / Brown Butter
UPDATE locations SET roll_style = 'Sourdough', frosting_type = 'Brown Butter'
  WHERE name ILIKE '%Radio Bakery%';

UPDATE locations SET roll_style = 'Sourdough'
  WHERE name ILIKE '%Apt. 2 Bread%';

-- Laminated / French patisserie
UPDATE locations SET roll_style = 'Laminated', frosting_type = 'Vanilla Glaze'
  WHERE name ILIKE '%Barachou%';

UPDATE locations SET roll_style = 'Laminated', frosting_type = 'Vanilla Glaze'
  WHERE name ILIKE '%L''Appartement 4F%';

-- Classic American — Cream Cheese
UPDATE locations SET roll_style = 'Classic American', frosting_type = 'Cream Cheese'
  WHERE name IN (
    'Sunday Morning',
    'Welcome Home',
    'Winner',
    'Benji''s Buns',
    'Baked',
    'Dreams of Sugar',
    'Breadivore',
    'Little Red Kitchen Bake Shop',
    'Spirals',
    'Ceremonia Bakeshop',
    'Ciao Gloria',
    'Tall Poppy'
  );

-- Classic American — Vanilla Glaze
UPDATE locations SET roll_style = 'Classic American', frosting_type = 'Vanilla Glaze'
  WHERE name IN (
    'Mah-Ze-Dahr',
    'Breads Bakery',
    'Red Gate Bakery'
  );

-- Classic American — Multiple (rotating flavors)
UPDATE locations SET roll_style = 'Classic American', frosting_type = 'Multiple'
  WHERE name IN (
    'Spirals',
    'Sunday Morning'
  );

-- Pop-ups
UPDATE locations SET roll_style = 'Classic American', frosting_type = 'Cream Cheese'
  WHERE name ILIKE '%NYC Cinnamon Rolls%';

-- Dietary flags
UPDATE locations SET vegan = true
  WHERE name ILIKE '%Petee%';

UPDATE locations SET gluten_free = true
  WHERE name IN ('Welcome Home', 'Breads Bakery', 'Baked');
