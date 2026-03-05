-- Add 'draft' status to exams table
ALTER TABLE exams MODIFY COLUMN status ENUM('active', 'inactive', 'draft') DEFAULT 'active';
