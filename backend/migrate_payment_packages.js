import dotenv from "dotenv";
import path from "path";
import mysql from "mysql2";

dotenv.config({ path: path.resolve("./.env") });

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
});

const dbp = db.promise();

async function migrate() {
  try {
    console.log("🚀 Starting Payment Package Migration...");

    // Create payment_packages table
    console.log("Creating payment_packages table...");
    await dbp.query(`
      CREATE TABLE IF NOT EXISTS payment_packages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        package_name VARCHAR(255) NOT NULL,
        description TEXT,
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'USD',
        duration_months INT DEFAULT NULL,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create program_payment_packages junction table
    console.log("Creating program_payment_packages junction table...");
    await dbp.query(`
      CREATE TABLE IF NOT EXISTS program_payment_packages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        program_id INT NOT NULL,
        payment_package_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE,
        FOREIGN KEY (payment_package_id) REFERENCES payment_packages(id) ON DELETE CASCADE
      )
    `);

    console.log("✅ Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
