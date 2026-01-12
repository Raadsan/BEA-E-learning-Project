// create_students_table.js
import db from "./dbconfig.js";

const dbp = db.promise();

async function createStudentsTable() {
  try {
    console.log("Starting to create/update students table...");

    // Check if table exists
    const [tables] = await dbp.query(
      `SELECT TABLE_NAME 
       FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'students'`
    );

    if (tables.length > 0) {
      console.log("⚠️ students table already exists. Dropping and recreating with new schema...");
      await dbp.query("DROP TABLE IF EXISTS students");
    }

    // Create the new students table
    console.log("Creating students table with new schema...");
    await dbp.query(`
      CREATE TABLE students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id VARCHAR(20) UNIQUE,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(50),
        age INT,
        sex ENUM('Male', 'Female') DEFAULT 'Male',
        residency_country VARCHAR(100),
        residency_city VARCHAR(100),
        chosen_program VARCHAR(255),
        chosen_subprogram VARCHAR(255),
        password VARCHAR(255) NOT NULL,
        parent_name VARCHAR(255),
        parent_email VARCHAR(255),
        parent_phone VARCHAR(50),
        parent_relation VARCHAR(100),
        parent_res_county VARCHAR(100),
        parent_res_city VARCHAR(100),
        approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        class_id INT,
        funding_status ENUM('Paid', 'Full Scholarship', 'Partial Scholarship', 'Sponsorship') DEFAULT 'Paid',
        sponsorship_package ENUM('1 Month', '3 Months', '6 Months', '1 Year', 'None') DEFAULT 'None',
        funding_amount DECIMAL(10, 2),
        funding_month VARCHAR(50),
        scholarship_percentage INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_student_id (student_id),
        INDEX idx_chosen_program (chosen_program)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log("✅ Successfully created students table!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating students table:", error);
    process.exit(1);
  }
}

createStudentsTable();

