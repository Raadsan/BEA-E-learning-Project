import db from "../database/dbconfig.js";

const createNewsTable = async () => {
  try {
    const connection = db.promise();
    console.log("Creating news table...");

    await connection.query(`
      CREATE TABLE IF NOT EXISTS news_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        event_date DATETIME NOT NULL,
        type ENUM('exam', 'event', 'deadline', 'training', 'news') DEFAULT 'news',
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log("Table 'news_events' created or already exists.");
    process.exit(0);
  } catch (error) {
    console.error("Failed to create table:", error);
    process.exit(1);
  }
};

createNewsTable();
