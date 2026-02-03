
-- Run this SQL command in your database to create the required table
-- This matches the VARCHAR(20) and utf8mb4 collation of the students table to avoid foreign key errors.

CREATE TABLE level_up_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    requested_subprogram_id INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    admin_response TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (requested_subprogram_id) REFERENCES subprograms(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
