CREATE TABLE IF NOT EXISTS `blog_posts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `excerpt` TEXT NOT NULL,
  `content` LONGTEXT NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `author` VARCHAR(150) NOT NULL DEFAULT 'BEA Team',
  `image_url` VARCHAR(500) NULL,
  `read_time` VARCHAR(50) NULL,
  `featured` BOOLEAN NOT NULL DEFAULT FALSE,
  `status` VARCHAR(20) NOT NULL DEFAULT 'published',
  `published_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `blog_posts_status_published_at_idx` (`status`, `published_at`),
  INDEX `blog_posts_category_idx` (`category`)
);

CREATE TABLE IF NOT EXISTS `blog_page_settings` (
  `id` INT NOT NULL DEFAULT 1,
  `hero_title` VARCHAR(255) NOT NULL DEFAULT 'BEA Blog',
  `hero_subtitle` VARCHAR(500) NOT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

INSERT IGNORE INTO `blog_page_settings` (`id`, `hero_title`, `hero_subtitle`)
VALUES (1, 'BEA Blog', 'Insights, tips, and stories to help you on your English learning journey');
