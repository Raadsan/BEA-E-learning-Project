ALTER TABLE `homepage_settings`
  ADD COLUMN `featured_enabled` BOOLEAN NOT NULL DEFAULT TRUE AFTER `cta_link`,
  ADD COLUMN `featured_heading` VARCHAR(255) NOT NULL DEFAULT 'English for specific purpose (ESP)' AFTER `featured_enabled`,
  ADD COLUMN `featured_label` VARCHAR(100) NOT NULL DEFAULT 'Featured Video' AFTER `featured_heading`,
  ADD COLUMN `featured_title` VARCHAR(255) NOT NULL DEFAULT 'Master English for Specific Purposes' AFTER `featured_label`,
  ADD COLUMN `featured_video_url` VARCHAR(500) NOT NULL DEFAULT 'https://www.youtube.com/watch?v=erjMgola4fQ' AFTER `featured_title`,
  ADD COLUMN `featured_thumbnail` VARCHAR(500) NULL AFTER `featured_video_url`;
