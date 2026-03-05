-- Add expiry and notification columns to students table
ALTER TABLE students 
ADD COLUMN expiry_date DATETIME NULL AFTER scholarship_percentage,
ADD COLUMN reminder_sent BOOLEAN DEFAULT 0 AFTER expiry_date,
ADD COLUMN admin_expiry_notified BOOLEAN DEFAULT 0 AFTER reminder_sent;
