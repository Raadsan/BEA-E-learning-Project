-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    class_id INT NOT NULL,
    program_id INT,
    type ENUM('assignment', 'classwork', 'homework', 'project') DEFAULT 'assignment',
    due_date DATETIME,
    total_points INT DEFAULT 100,
    status ENUM('active', 'closed', 'draft') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    INDEX idx_class_id (class_id),
    INDEX idx_program_id (program_id),
    INDEX idx_due_date (due_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
