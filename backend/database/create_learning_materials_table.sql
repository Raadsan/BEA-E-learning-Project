-- Create learning_materials table
CREATE TABLE IF NOT EXISTS learning_materials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type ENUM('PDF', 'Document', 'Presentation', 'Audio', 'Video', 'Link', 'Drive') NOT NULL,
  level VARCHAR(50) DEFAULT 'All', -- A1, A2, B1, B2, C1, C2, or All
  subject VARCHAR(100),
  description TEXT,
  url TEXT NOT NULL,
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
