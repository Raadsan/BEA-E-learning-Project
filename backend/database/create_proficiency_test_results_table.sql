-- Create proficiency test results table
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
    FOREIGN KEY (test_id) REFERENCES professional_tests(id) ON DELETE CASCADE,
    INDEX idx_test_id (test_id),
    INDEX idx_student_id (student_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
