CREATE TABLE IF NOT EXISTS `homepage_settings` (
  `id` INT NOT NULL DEFAULT 1,
  `hero_title` VARCHAR(255) NOT NULL,
  `hero_highlight` VARCHAR(255) NOT NULL,
  `hero_description` TEXT NOT NULL,
  `hero_images` JSON NOT NULL,
  `cta_text` VARCHAR(100) NOT NULL,
  `cta_link` VARCHAR(255) NOT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

INSERT IGNORE INTO `homepage_settings` (`id`, `hero_title`, `hero_highlight`, `hero_description`, `hero_images`, `cta_text`, `cta_link`) VALUES
(1, 'Master English with', 'Global Standards', 'Structured learning from A1 to C2, powered by CEFR framework and GSE scoring. Join thousands of learners across Somalia achieving their English language goals.', JSON_ARRAY('/images/A Path to Global Opportunities.jpg', '/images/Innovative Learning Environment.jpg', '/images/Student—Centered Learning.jpg'), 'Start Learning Today', '/auth/registration');
