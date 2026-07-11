CREATE TABLE IF NOT EXISTS `review_assignments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `review_type` VARCHAR(20) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `start_date` DATETIME NOT NULL,
  `end_date` DATETIME NOT NULL,
  `class_id` INT NULL,
  `course_id` INT NULL,
  `subprogram_id` INT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'active',
  `questions` JSON NULL,
  `created_by` INT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_review_assignments_type_status` (`review_type`, `status`),
  INDEX `idx_review_assignments_class` (`class_id`),
  INDEX `idx_review_assignments_course` (`course_id`),
  INDEX `idx_review_assignments_subprogram` (`subprogram_id`)
);

ALTER TABLE `student_reviews`
  ADD COLUMN IF NOT EXISTS `assignment_id` INT NULL,
  ADD INDEX IF NOT EXISTS `idx_student_reviews_assignment` (`assignment_id`);

ALTER TABLE `teacher_reviews`
  ADD COLUMN IF NOT EXISTS `assignment_id` INT NULL,
  ADD INDEX IF NOT EXISTS `idx_teacher_reviews_assignment` (`assignment_id`);
