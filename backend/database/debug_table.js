import db from './dbconfig.js';

const debugTable = async () => {
    try {
        console.log("🔍 Checking database tables...");
        const [rows] = await db.promise().query("SHOW TABLES");
        console.log("Tables in database:");
        console.table(rows);

        const tableName = 'proficiency_test_results';
        const exists = rows.some(row => Object.values(row)[0] === tableName);

        if (exists) {
            console.log(`✅ Table '${tableName}' EXISTS.`);
            // Describe it
            const [desc] = await db.promise().query(`DESCRIBE ${tableName}`);
            console.table(desc);
        } else {
            console.error(`❌ Table '${tableName}' DOES NOT EXIST.`);

            // Attempt to create it directly here to be sure
            console.log("⚠️ Attempting to create table directly...");
            const createSql = `
                CREATE TABLE IF NOT EXISTS proficiency_test_results (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    test_id INT NOT NULL,
                    student_id VARCHAR(20) NOT NULL,
                    answers JSON NOT NULL,
                    score DECIMAL(5,2) DEFAULT NULL,
                    total_points INT NOT NULL,
                    status ENUM('pending', 'graded', 'reviewed') DEFAULT 'pending',
                    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    graded_at TIMESTAMP NULL,
                    graded_by INT NULL,
                    feedback TEXT NULL,
                    FOREIGN KEY (test_id) REFERENCES professional_tests(id) ON DELETE CASCADE,
                    INDEX idx_test_id (test_id),
                    INDEX idx_student_id (student_id),
                    INDEX idx_status (status)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            `;
            await db.promise().query(createSql);
            console.log("✅ Table created via debug script.");
        }
        process.exit(0);
    } catch (error) {
        console.error("❌ Debug Data Error:", error);
        process.exit(1);
    }
};

debugTable();
