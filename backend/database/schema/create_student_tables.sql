-- Create sub_programs table (if programs have sub-programs)
CREATE TABLE IF NOT EXISTS sub_programs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  program_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE,
  INDEX idx_program_id (program_id)
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50) NOT NULL,
  age INT NOT NULL,
  sex ENUM('Male', 'Female') NOT NULL DEFAULT 'Male',
  country VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  program_id INT NOT NULL,
  sub_program_id INT NULL,
  password VARCHAR(255) NOT NULL,
  is_minor BOOLEAN DEFAULT FALSE,
  terms_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE RESTRICT,
  FOREIGN KEY (sub_program_id) REFERENCES sub_programs(id) ON DELETE SET NULL,
  INDEX idx_email (email),
  INDEX idx_program_id (program_id),
  INDEX idx_sub_program_id (sub_program_id)
);

-- Create parents table (for students under 18)
CREATE TABLE IF NOT EXISTS parents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL UNIQUE,
  parent_first_name VARCHAR(100) NOT NULL,
  parent_last_name VARCHAR(100) NOT NULL,
  parent_email VARCHAR(255) NOT NULL,
  parent_phone VARCHAR(50) NOT NULL,
  relationship ENUM('Father', 'Mother', 'Guardian', 'Other') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  INDEX idx_student_id (student_id),
  INDEX idx_parent_email (parent_email)
);

