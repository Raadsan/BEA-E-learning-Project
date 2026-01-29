import db from './dbconfig.js';

const dbp = db.promise();

const createCourseTimelineTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS course_timeline (
      id INT AUTO_INCREMENT PRIMARY KEY,
      term_serial VARCHAR(50) NOT NULL UNIQUE,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      holidays TEXT,
      display_order INT NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_display_order (display_order),
      INDEX idx_is_active (is_active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  try {
    await dbp.query(createTableQuery);
    console.log('✓ course_timeline table created successfully');

    // Check if table has data
    const [rows] = await dbp.query('SELECT COUNT(*) as count FROM course_timeline');
    console.log(`✓ Current records in course_timeline: ${rows[0].count}`);

    process.exit(0);
  } catch (error) {
    console.error('✗ Error creating course_timeline table:', error);
    process.exit(1);
  }
};

createCourseTimelineTable();
