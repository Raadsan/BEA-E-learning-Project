ALTER TABLE `teacher_reviews` ADD COLUMN `assignment_id` INT NULL;
CREATE INDEX `idx_teacher_reviews_assignment` ON `teacher_reviews` (`assignment_id`);
