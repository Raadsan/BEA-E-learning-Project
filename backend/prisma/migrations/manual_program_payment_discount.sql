-- Add per-program discount fields on package assignments (run once)
ALTER TABLE `program_payment_packages`
  ADD COLUMN `discount_type` VARCHAR(20) NULL AFTER `payment_package_id`,
  ADD COLUMN `discount_value` DECIMAL(10, 2) NULL AFTER `discount_type`;
