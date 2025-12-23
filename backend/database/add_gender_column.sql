-- Add gender column to students table
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS gender VARCHAR(20) NULL AFTER age;

-- Verify the column was added
DESCRIBE students;
