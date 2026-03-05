-- Add new columns to existing timetables table for weekly scheduling
ALTER TABLE timetables 
ADD COLUMN week_number INT NULL AFTER day,
ADD COLUMN activity_type VARCHAR(100) NULL AFTER type,
ADD COLUMN activity_title VARCHAR(255) NULL AFTER activity_type,
ADD COLUMN activity_description TEXT NULL AFTER activity_title;

-- Make start_time, end_time, and subject nullable for weekly activities (time-based vs week-based)
ALTER TABLE timetables 
MODIFY COLUMN start_time TIME NULL,
MODIFY COLUMN end_time TIME NULL,
MODIFY COLUMN subject VARCHAR(255) NULL;
