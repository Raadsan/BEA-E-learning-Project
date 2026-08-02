CREATE TABLE `student_support_requests` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `student_id` VARCHAR(50) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'open',
  `admin_reply` TEXT NULL,
  `replied_by` INTEGER NULL,
  `replied_at` DATETIME(0) NULL,
  `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  INDEX `student_support_requests_student_id_idx`(`student_id`),
  INDEX `student_support_requests_status_idx`(`status`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;