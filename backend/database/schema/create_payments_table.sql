-- Create payments table with foreign key and additional fields for transfer tracking
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  payer_phone VARCHAR(20),
  amount DECIMAL(10,2) NOT NULL,
  method VARCHAR(50) NOT NULL,
  program_id VARCHAR(100),
  provider_transaction_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'paid',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);
