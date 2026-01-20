CREATE TABLE IF NOT EXISTS academic_calendar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    program_id INT NOT NULL,
    subprogram_id INT NOT NULL,
    week_number INT NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    activity_title VARCHAR(255) NOT NULL,
    activity_description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE,
    FOREIGN KEY (subprogram_id) REFERENCES subprograms(id) ON DELETE CASCADE,
    INDEX idx_subprogram_week (subprogram_id, week_number),
    INDEX idx_program (program_id)
);
