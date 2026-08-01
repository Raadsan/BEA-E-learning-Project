-- Preserve hour/minute/second precision for short manual access extensions.
ALTER TABLE `students`
  MODIFY COLUMN `paid_until` DATETIME NULL;

-- DATE values previously meant access through the end of that day.
UPDATE `students`
SET `paid_until` = DATE_ADD(`paid_until`, INTERVAL 86399 SECOND)
WHERE `paid_until` IS NOT NULL AND TIME(`paid_until`) = '00:00:00';
