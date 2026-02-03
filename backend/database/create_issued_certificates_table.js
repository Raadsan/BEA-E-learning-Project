import db from './dbconfig.js';

async function createIssuedCertificatesTable() {
    try {
        console.log('🔄 Creating issued_certificates table...');

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS issued_certificates (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id VARCHAR(50) NOT NULL,
                student_name VARCHAR(255) NOT NULL,
                target_id INT NOT NULL,
                target_type ENUM('program', 'subprogram') NOT NULL,
                target_name VARCHAR(255) NOT NULL,
                class_name VARCHAR(255),
                certificate_id INT,
                issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (certificate_id) REFERENCES certificates(id) ON DELETE SET NULL,
                INDEX idx_student_id (student_id),
                INDEX idx_target (target_id, target_type)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        await db.promise().query(createTableQuery);
        console.log('✅ issued_certificates table created successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating issued_certificates table:', error);
        process.exit(1);
    }
}

createIssuedCertificatesTable();
