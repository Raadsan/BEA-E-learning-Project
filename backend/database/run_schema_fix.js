import db from './dbconfig.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runScript = async () => {
    try {
        const sqlPath = path.join(__dirname, 'rename_and_fix_schema.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');

        // Split by semicolon to run multiple statements, but handle carefully
        // Simple splitting might break if semicolons are in strings (unlikely here)
        // However, mysql2 driver usually supports multiple statements if configured, 
        // but dbconfig might not have multipleStatements: true.
        // Let's rely on splitting manually for safety.

        const statements = sqlContent
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (const statement of statements) {
            // Prepared statements in SQL script logic (SET @exist...) might need running in one go session
            // if we split, variables might be lost.
            // Actually, RENAME TABLE is DDL.
            // Let's try to run the critical parts.

            // Re-writing the strategy to be JS-driven for safety against SQL parsing issues
        }

        // JS Driven Approach
        console.log("Checking for professional_tests...");
        const [profTests] = await db.promise().query("SHOW TABLES LIKE 'professional_tests'");
        if (profTests.length > 0) {
            console.log("Renaming professional_tests to proficiency_tests...");
            await db.promise().query("RENAME TABLE professional_tests TO proficiency_tests");
        } else {
            console.log("professional_tests not found (maybe already renamed).");
        }

        console.log("Ensuring proficiency_test_results exists...");
        // Check if exists first to avoid error if created but needs FK update? 
        // Just run CREATE TABLE IF NOT EXISTS
        const createTableSQL = `
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
            FOREIGN KEY (test_id) REFERENCES proficiency_tests(id) ON DELETE CASCADE,
            INDEX idx_test_id (test_id),
            INDEX idx_student_id (student_id),
            INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;
        await db.promise().query(createTableSQL);

        console.log("Dropping professional_test_results...");
        await db.promise().query("DROP TABLE IF EXISTS professional_test_results");

        console.log("Schema update complete.");
        process.exit(0);
    } catch (error) {
        console.error("Error updating schema:", error);
        process.exit(1);
    }
};

runScript();
