// database/create_subprograms_courses_classes_tables.js
// Create subprograms, courses, and classes tables
import db from "./dbconfig.js";
import dotenv from "dotenv";

dotenv.config();

const dbp = db.promise();

async function createTables() {
  try {
    console.log("🔄 Creating subprograms, courses, and classes tables...");

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

    // Check if teachers table exists
    const [tables] = await dbp.query(`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'teachers'
    `, [process.env.DB_NAME]);

    const teachersTableExists = tables[0].count > 0;

    // Create classes table
    let classesTableQuery = `
      CREATE TABLE IF NOT EXISTS classes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        class_name VARCHAR(255) NOT NULL,
        course_id INT NOT NULL,
        teacher_id INT NOT NULL,
        schedule VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        INDEX idx_course_id (course_id),
        INDEX idx_teacher_id (teacher_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;

    // Add teacher foreign key only if teachers table exists
    if (teachersTableExists) {
      // We need to create the table first, then add the foreign key
      await dbp.query(classesTableQuery);
      // Add foreign key constraint separately
      try {
        await dbp.query(`
          ALTER TABLE classes 
          ADD CONSTRAINT fk_teacher_id 
          FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
        `);
      } catch (err) {
        // Foreign key might already exist, ignore
        if (!err.message.includes('Duplicate foreign key')) {
          console.log("⚠️  Could not add teacher foreign key:", err.message);
        }
      }
    } else {
      // Create table without teacher foreign key
      await dbp.query(classesTableQuery);
      console.log("⚠️  Teachers table not found. Created classes table without teacher foreign key.");
    }
    console.log("✅ Created classes table");

    console.log("\n✅ All tables created successfully!");
    console.log("   - subprograms: subprogram_name, program_id, description, status");
    console.log("   - courses: course_title, subprogram_id, description, duration, price");
    console.log("   - classes: class_name, course_id, teacher_id, schedule");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating tables:", err);
    process.exit(1);
  }
}

createTables();

