-- Create subprograms, courses, and classes tables

-- Create subprograms table
CREATE TABLE IF NOT EXISTS subprograms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subprogram_name VARCHAR(255) NOT NULL,
  program_id INT NOT NULL,
  description TEXT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE,
  INDEX idx_program_id (program_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_title VARCHAR(255) NOT NULL,
  subprogram_id INT NOT NULL,
  description TEXT,
  duration VARCHAR(100),
  price DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (subprogram_id) REFERENCES subprograms(id) ON DELETE CASCADE,
  INDEX idx_subprogram_id (subprogram_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_name VARCHAR(255) NOT NULL,
  course_id INT NOT NULL,
  teacher_id INT NOT NULL,
  schedule VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
  INDEX idx_course_id (course_id),
  INDEX idx_teacher_id (teacher_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

