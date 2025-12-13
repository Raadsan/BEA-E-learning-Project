// database/create_all_tables.js
// Create teachers, subprograms, courses, and classes tables
import db from "./dbconfig.js";
import dotenv from "dotenv";

dotenv.config();

const dbp = db.promise();

async function createAllTables() {
  try {
    console.log("🔄 Creating all tables...");

    // Create teachers table
    await dbp.query(`
      CREATE TABLE IF NOT EXISTS teachers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(50),
        country VARCHAR(100),
        city VARCHAR(100),
        specialization VARCHAR(255),
        highest_qualification VARCHAR(255),
        years_experience INT,
        bio TEXT,
        portfolio_link VARCHAR(500),
        skills TEXT,
        hire_date DATE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Created teachers table");

    // Create subprograms table
    await dbp.query(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Created subprograms table");

    // Create courses table
    await dbp.query(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Created courses table");

    // Create classes table
    await dbp.query(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Created classes table");

    console.log("\n✅ All tables created successfully!");
    console.log("   - teachers: full_name, email, phone, country, city, specialization, highest_qualification, years_experience, bio, portfolio_link, skills, hire_date, password");
    console.log("   - subprograms: subprogram_name, program_id, description, status");
    console.log("   - courses: course_title, subprogram_id, description, duration, price");
    console.log("   - classes: class_name, course_id, teacher_id, schedule");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating tables:", err);
    process.exit(1);
  }
}

createAllTables();

