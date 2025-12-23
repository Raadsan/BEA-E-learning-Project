-- Add approval_status column to students table
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS approval_status ENUM('pending', 'approved', 'rejected') 
DEFAULT 'pending';


