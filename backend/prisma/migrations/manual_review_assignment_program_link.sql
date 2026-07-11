ALTER TABLE `review_assignments`
  ADD COLUMN IF NOT EXISTS `program_id` INT NULL AFTER `end_date`,
  ADD COLUMN IF NOT EXISTS `questionnaire_url` VARCHAR(500) NULL AFTER `questions`,
  ADD INDEX IF NOT EXISTS `idx_review_assignments_program` (`program_id`);
