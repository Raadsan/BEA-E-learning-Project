ALTER TABLE `timetables`
ADD COLUMN `end_date` DATE NULL AFTER `date`,
ADD COLUMN `timeline_group_id` VARCHAR(50) NULL AFTER `end_date`,
ADD INDEX `idx_timetable_timeline_group` (`timeline_group_id`);
