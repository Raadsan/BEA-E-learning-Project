import db from './dbconfig.js';

async function createCertificatesTable() {
    try {
        console.log('Creating certificates table...');

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS certificates (
                id INT AUTO_INCREMENT PRIMARY KEY,
                target_id INT NOT NULL,
                target_type ENUM('program', 'subprogram') NOT NULL,
                template_url VARCHAR(255) NOT NULL,
                name_x INT DEFAULT 300,
                name_y INT DEFAULT 400,
                font_size INT DEFAULT 30,
                font_color VARCHAR(20) DEFAULT '#000000',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                uploader_id INT,
                UNIQUE KEY unique_target (target_id, target_type)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        await db.promise().query(createTableQuery);
        console.log('Certificates table created successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error creating certificates table:', error);
        process.exit(1);
    }
}

createCertificatesTable();
