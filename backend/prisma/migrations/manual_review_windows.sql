-- Run this SQL on your database if prisma db push is not used:
CREATE TABLE IF NOT EXISTS `review_windows` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `review_type` VARCHAR(20) NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'inactive',
  `start_date` DATETIME NULL,
  `end_date` DATETIME NULL,
  `updated_by` INT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `review_windows_review_type_key` (`review_type`)
);

INSERT IGNORE INTO `review_windows` (`review_type`, `status`) VALUES ('teacher', 'inactive'), ('student', 'inactive');
