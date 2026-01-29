import db from './dbconfig.js';

const dbp = db.promise();

const createTestimonialsTable = async () => {
    try {
        const query = `
      CREATE TABLE IF NOT EXISTS testimonials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_name VARCHAR(255) NOT NULL,
        student_role VARCHAR(255),
        quote TEXT NOT NULL,
        image_url TEXT,
        initials VARCHAR(10),
        rating INT DEFAULT 5,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_is_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

        await dbp.query(query);
        console.log('Testimonials table created successfully or already exists.');
        process.exit(0);
    } catch (error) {
        console.error('Error creating testimonials table:', error);
        process.exit(1);
    }
};

createTestimonialsTable();
