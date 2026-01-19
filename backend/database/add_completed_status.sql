ALTER TABLE proficiency_test_results MODIFY COLUMN status ENUM('pending', 'graded', 'reviewed', 'completed') DEFAULT 'pending';
