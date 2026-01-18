import db from "./dbconfig.js";

const createTableQuery = `
CREATE TABLE IF NOT EXISTS professional_tests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration_minutes INT DEFAULT 60,
  questions JSON,
  status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status)
);
`;

const run = async () => {
    try {
        const [result] = await db.promise().query(createTableQuery);
        console.log("Table 'professional_tests' created or already exists.");
        console.log(result);
        process.exit(0);
    } catch (error) {
        console.error("Error creating table:", error);
        process.exit(1);
    }
};

run();
