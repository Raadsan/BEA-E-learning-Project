ALTER TABLE `students`
ADD COLUMN `payment_access_extended` BOOLEAN NOT NULL DEFAULT FALSE AFTER `paid_until`;
