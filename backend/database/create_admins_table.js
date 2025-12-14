// database/create_admins_table.js
import db from "./dbconfig.js";
import dotenv from "dotenv";

dotenv.config();

const dbp = db.promise();

async function createAdminsTable() {
  try {
    console.log("🔄 Creating admins table...");

    // Create admins table
    await dbp.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Created admins table");

    // Create a default admin account (optional - you can remove this if you want to create admin manually)
    const defaultAdminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@bea.com';
    const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
    
    // Check if default admin already exists
    const [existing] = await dbp.query("SELECT id FROM admins WHERE email = ?", [defaultAdminEmail]);
    
    if (existing.length === 0) {
      const bcrypt = (await import("bcryptjs")).default;
      const hashedPassword = await bcrypt.hash(defaultAdminPassword, 10);
      
      await dbp.query(
        "INSERT INTO admins (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)",
        ['System', 'Admin', defaultAdminEmail, hashedPassword, 'admin']
      );
      console.log(`✅ Created default admin account: ${defaultAdminEmail} / ${defaultAdminPassword}`);
      console.log("⚠️  Please change the default admin password after first login!");
    } else {
      console.log("ℹ️  Default admin account already exists");
    }

    console.log("\n✅ Admins table setup completed!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating admins table:", err);
    process.exit(1);
  }
}

createAdminsTable();

