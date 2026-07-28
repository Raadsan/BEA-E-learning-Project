ALTER TABLE `course_timeline`
  ADD COLUMN `class_ids` JSON NULL AFTER `holidays`,
  ADD COLUMN `subprogram_ids` JSON NULL AFTER `class_ids`;
