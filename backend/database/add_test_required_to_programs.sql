-- Add test_required column to programs table
ALTER TABLE programs 
ADD COLUMN test_required ENUM('none', 'placement', 'proficiency') DEFAULT 'none';
