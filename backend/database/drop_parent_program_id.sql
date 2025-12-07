-- Drop parent_program_id column from programs table
-- Run this script to remove the parent_program_id column and its constraints

-- Step 1: Drop foreign key constraint (adjust constraint name if different)
-- Check constraint name first with:
-- SHOW CREATE TABLE programs;

ALTER TABLE programs 
DROP FOREIGN KEY programs_ibfk_1;

-- If the above doesn't work, try finding the constraint name:
-- SELECT CONSTRAINT_NAME 
-- FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
-- WHERE TABLE_SCHEMA = DATABASE()
-- AND TABLE_NAME = 'programs'
-- AND COLUMN_NAME = 'parent_program_id'
-- AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Step 2: Drop index
ALTER TABLE programs 
DROP INDEX idx_parent_program_id;

-- Step 3: Drop the column
ALTER TABLE programs 
DROP COLUMN parent_program_id;

-- Verify the column is dropped
-- DESCRIBE programs;

