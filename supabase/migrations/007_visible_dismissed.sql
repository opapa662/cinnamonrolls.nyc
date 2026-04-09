-- Add visible column to locations (controls map display, independent of business status)
ALTER TABLE locations ADD COLUMN visible boolean NOT NULL DEFAULT true;

-- Add dismissed column to submissions (cleared from admin dashboard view)
ALTER TABLE submissions ADD COLUMN dismissed boolean NOT NULL DEFAULT false;

-- Migrate existing data: closed locations become not visible
UPDATE locations SET visible = false WHERE status = 'closed';

-- Rename status values: 'active' -> 'open'
ALTER TABLE locations DROP CONSTRAINT IF EXISTS locations_status_check;
UPDATE locations SET status = 'open' WHERE status = 'active';
ALTER TABLE locations ADD CONSTRAINT locations_status_check CHECK (status IN ('open', 'closed'));
