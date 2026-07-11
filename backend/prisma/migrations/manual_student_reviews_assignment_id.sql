ALTER TABLE `student_reviews` ADD COLUMN `assignment_id` INT NULL;
CREATE INDEX `idx_student_reviews_assignment` ON `student_reviews` (`assignment_id`);
