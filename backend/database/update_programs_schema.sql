-- Update programs table: add status column and remove sub_programs column

-- Add status column if it doesn't exist
ALTER TABLE programs 
ADD COLUMN IF NOT EXISTS status ENUM('active', 'inactive') DEFAULT 'active';

-- Set all existing programs to 'active' by default
UPDATE programs SET status = 'active' WHERE status IS NULL;

-- Remove sub_programs column if it exists
-- Note: MySQL doesn't support IF EXISTS for DROP COLUMN, so check manually first
ALTER TABLE programs DROP COLUMN sub_programs;

