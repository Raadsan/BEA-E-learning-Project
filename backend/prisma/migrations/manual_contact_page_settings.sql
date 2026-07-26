CREATE TABLE IF NOT EXISTS `contact_page_settings` (
  `id` INT NOT NULL DEFAULT 1,
  `hero_title` VARCHAR(255) NOT NULL,
  `hero_subtitle` VARCHAR(255) NOT NULL,
  `hero_description` TEXT NOT NULL,
  `address` VARCHAR(500) NOT NULL,
  `phone` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `social_links` JSON NOT NULL,
  `schedule_title` VARCHAR(255) NOT NULL,
  `schedule_description` TEXT NOT NULL,
  `schedule` JSON NOT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
