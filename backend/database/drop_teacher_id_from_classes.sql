-- drop_teacher_id_from_classes.sql
-- Script to drop teacher_id column from classes table

-- First, check for and drop foreign key constraints
-- Replace 'fk_classes_teacher' with your actual foreign key name if different
ALTER TABLE classes DROP FOREIGN KEY IF EXISTS fk_classes_teacher;

-- Drop indexes on teacher_id (if any, except primary key)
-- Replace 'idx_teacher_id' with your actual index name if different
ALTER TABLE classes DROP INDEX IF EXISTS idx_teacher_id;

-- Drop the column
ALTER TABLE classes DROP COLUMN IF EXISTS teacher_id;

