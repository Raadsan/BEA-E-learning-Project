-- 1. Rename professional_tests to proficiency_tests if it exists
SET @exist := (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'professional_tests');
SET @sql := IF(@exist > 0, 'RENAME TABLE professional_tests TO proficiency_tests', 'SELECT "Table professional_tests does not exist"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Create proficiency_test_results if not exists (referencing proficiency_tests)
CREATE TABLE IF NOT EXISTS proficiency_test_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_id INT NOT NULL,
    student_id VARCHAR(20) NOT NULL,
    answers JSON NOT NULL,
    score DECIMAL(5,2) DEFAULT NULL,
    total_points INT NOT NULL,
    status ENUM('pending', 'graded', 'reviewed') DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    graded_at TIMESTAMP NULL,
    graded_by INT NULL,
    feedback TEXT NULL,
    FOREIGN KEY (test_id) REFERENCES proficiency_tests(id) ON DELETE CASCADE,
    INDEX idx_test_id (test_id),
    INDEX idx_student_id (student_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Drop professional_test_results if it exists (cleanup)
DROP TABLE IF EXISTS professional_test_results;
