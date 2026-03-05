-- Add submission_type column to oral_assignments table
ALTER TABLE oral_assignments 
ADD COLUMN submission_type ENUM('audio', 'video', 'both') DEFAULT 'audio' AFTER duration;
