-- Add new columns to admins table for profile functionality
-- Run this script to update your database schema

ALTER TABLE admins 
ADD COLUMN username VARCHAR(100) UNIQUE,
ADD COLUMN full_name VARCHAR(200),
ADD COLUMN bio TEXT,
ADD COLUMN profile_image VARCHAR(500);

-- Optionally, update existing records to have a username based on email
-- This creates a username from the email prefix for existing admins
UPDATE admins 
SET username = SUBSTRING_INDEX(email, '@', 1) 
WHERE username IS NULL;

-- Make first_name and last_name nullable since we're now using full_name
ALTER TABLE admins 
MODIFY COLUMN first_name VARCHAR(100) NULL,
MODIFY COLUMN last_name VARCHAR(100) NULL;

-- Success message
SELECT 'Admin table updated successfully! New columns added: username, full_name, bio, profile_image' AS message;
