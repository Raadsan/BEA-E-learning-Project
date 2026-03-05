-- Unified Programs Table (Main Programs + Sub-Programs in ONE table)
-- This is cleaner and easier to manage

-- First, let's modify the existing programs table to support sub-programs
-- Add parent_program_id column to programs table (self-referencing)
ALTER TABLE programs 
ADD COLUMN IF NOT EXISTS parent_program_id INT NULL,
ADD COLUMN IF NOT EXISTS program_type ENUM('main', 'sub') DEFAULT 'main',
ADD FOREIGN KEY (parent_program_id) REFERENCES programs(id) ON DELETE CASCADE,
ADD INDEX idx_parent_program_id (parent_program_id),
ADD INDEX idx_program_type (program_type);

-- Update existing programs to be 'main' type
UPDATE programs SET program_type = 'main' WHERE program_type IS NULL;

-- Now update students table to reference programs only (no separate sub_programs table needed)
-- The sub_program_id in students table can reference programs table where program_type = 'sub'

-- Drop the old sub_programs table if it exists (after migrating data if needed)
-- DROP TABLE IF EXISTS sub_programs;

