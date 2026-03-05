-- Add 'draft' status to placement_tests
ALTER TABLE placement_tests 
MODIFY COLUMN status ENUM('active', 'inactive', 'archived', 'draft') DEFAULT 'active';

-- Add 'draft' status to proficiency_tests
ALTER TABLE proficiency_tests 
MODIFY COLUMN status ENUM('active', 'inactive', 'archived', 'draft') DEFAULT 'active';
