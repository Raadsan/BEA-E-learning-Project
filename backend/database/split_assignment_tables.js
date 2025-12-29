import db from './dbconfig.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory
dotenv.config({ path: path.join(__dirname, '../.env') });

async function migrate() {
    const dbp = db.promise();
    try {
        console.log("Starting Migration: Splitting assignments into dedicated tables...");

        // 1. Create Assignment Tables
        const tables = {
            writing_tasks: `
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                class_id INT NOT NULL,
                program_id INT NOT NULL,
                due_date DATETIME,
                total_points INT DEFAULT 100,
                status ENUM('active', 'closed') DEFAULT 'active',
                created_by INT NOT NULL,
                word_count INT,
                requirements TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            `,
            tests: `
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                class_id INT NOT NULL,
                program_id INT NOT NULL,
                due_date DATETIME,
                total_points INT DEFAULT 100,
                status ENUM('active', 'closed') DEFAULT 'active',
                created_by INT NOT NULL,
                duration INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            `,
            oral_assignments: `
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                class_id INT NOT NULL,
                program_id INT NOT NULL,
                due_date DATETIME,
                total_points INT DEFAULT 100,
                status ENUM('active', 'closed') DEFAULT 'active',
                created_by INT NOT NULL,
                duration INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            `,
            course_work: `
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                class_id INT NOT NULL,
                program_id INT NOT NULL,
                due_date DATETIME,
                total_points INT DEFAULT 100,
                status ENUM('active', 'closed') DEFAULT 'active',
                created_by INT NOT NULL,
                submission_format VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            `
        };

        for (const [tableName, schema] of Object.entries(tables)) {
            await dbp.query(`CREATE TABLE IF NOT EXISTS ${tableName} (${schema})`);
            console.log(`Table created (if not exists): ${tableName}`);
        }

        // 2. Create Submission Tables
        const submissionTables = {
            writing_task_submissions: `
                id INT AUTO_INCREMENT PRIMARY KEY,
                assignment_id INT NOT NULL,
                student_id INT NOT NULL,
                content LONGTEXT,
                file_url VARCHAR(255),
                score DECIMAL(5,2),
                feedback TEXT,
                status ENUM('pending', 'submitted', 'graded') DEFAULT 'pending',
                submission_date DATETIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_submission (assignment_id, student_id),
                FOREIGN KEY (assignment_id) REFERENCES writing_tasks(id) ON DELETE CASCADE
            `,
            test_submissions: `
                id INT AUTO_INCREMENT PRIMARY KEY,
                assignment_id INT NOT NULL,
                student_id INT NOT NULL,
                content LONGTEXT,
                file_url VARCHAR(255),
                score DECIMAL(5,2),
                feedback TEXT,
                status ENUM('pending', 'submitted', 'graded') DEFAULT 'pending',
                submission_date DATETIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_submission (assignment_id, student_id),
                FOREIGN KEY (assignment_id) REFERENCES tests(id) ON DELETE CASCADE
            `,
            oral_assignment_submissions: `
                id INT AUTO_INCREMENT PRIMARY KEY,
                assignment_id INT NOT NULL,
                student_id INT NOT NULL,
                content LONGTEXT,
                file_url VARCHAR(255),
                score DECIMAL(5,2),
                feedback TEXT,
                status ENUM('pending', 'submitted', 'graded') DEFAULT 'pending',
                submission_date DATETIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_submission (assignment_id, student_id),
                FOREIGN KEY (assignment_id) REFERENCES oral_assignments(id) ON DELETE CASCADE
            `,
            course_work_submissions: `
                id INT AUTO_INCREMENT PRIMARY KEY,
                assignment_id INT NOT NULL,
                student_id INT NOT NULL,
                content LONGTEXT,
                file_url VARCHAR(255),
                score DECIMAL(5,2),
                feedback TEXT,
                status ENUM('pending', 'submitted', 'graded') DEFAULT 'pending',
                submission_date DATETIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_submission (assignment_id, student_id),
                FOREIGN KEY (assignment_id) REFERENCES course_work(id) ON DELETE CASCADE
            `
        };

        for (const [tableName, schema] of Object.entries(submissionTables)) {
            await dbp.query(`CREATE TABLE IF NOT EXISTS ${tableName} (${schema})`);
            console.log(`Table created (if not exists): ${tableName}`);
        }

        // 3. Migrate existing data (Optional but recommended for consistency)
        // Since the current 'assignments' table exists, we can move records over.
        // We'll map the 'type' column to the new tables.

        const typeMapping = {
            'writing_task': 'writing_tasks',
            'test': 'tests',
            'oral_assignment': 'oral_assignments',
            'course_work': 'course_work'
        };

        const [existingAssignments] = await dbp.query("SELECT * FROM assignments");
        for (const assignment of existingAssignments) {
            const targetTable = typeMapping[assignment.type];
            if (targetTable) {
                // Check if already migrated
                const [exists] = await dbp.query(`SELECT id FROM ${targetTable} WHERE id = ?`, [assignment.id]);
                if (exists.length === 0) {
                    const columns = ['id', 'title', 'description', 'class_id', 'program_id', 'due_date', 'total_points', 'status', 'created_by', 'created_at', 'updated_at'];
                    if (targetTable === 'writing_tasks') { columns.push('word_count', 'requirements'); }
                    else if (targetTable === 'tests' || targetTable === 'oral_assignments') { columns.push('duration'); }
                    else if (targetTable === 'course_work') { columns.push('submission_format'); }

                    const values = columns.map(col => assignment[col]);
                    const placeholders = columns.map(() => '?').join(', ');

                    await dbp.query(`INSERT INTO ${targetTable} (${columns.join(', ')}) VALUES (${placeholders})`, values);
                    console.log(`Migrated assignment ID ${assignment.id} to ${targetTable}`);

                    // Migrate submissions for this assignment
                    const [submissions] = await dbp.query("SELECT * FROM assignment_submissions WHERE assignment_id = ?", [assignment.id]);
                    const subTable = `${targetTable.replace(/_tasks$/, '_task')}${targetTable.endsWith('s') && !targetTable.endsWith('task_submissions') && !targetTable.endsWith('work') ? '' : ''}_submissions`;

                    // Fix subTable name mapping
                    let submissionTableName = "";
                    if (targetTable === 'writing_tasks') submissionTableName = 'writing_task_submissions';
                    else if (targetTable === 'tests') submissionTableName = 'test_submissions';
                    else if (targetTable === 'oral_assignments') submissionTableName = 'oral_assignment_submissions';
                    else if (targetTable === 'course_work') submissionTableName = 'course_work_submissions';

                    for (const sub of submissions) {
                        const subCols = ['id', 'assignment_id', 'student_id', 'content', 'file_url', 'score', 'feedback', 'status', 'submission_date', 'created_at', 'updated_at'];
                        const subValues = subCols.map(col => sub[col]);
                        const subPlaceholders = subCols.map(() => '?').join(', ');

                        await dbp.query(`INSERT IGNORE INTO ${submissionTableName} (${subCols.join(', ')}) VALUES (${subPlaceholders})`, subValues);
                    }
                    if (submissions.length > 0) {
                        console.log(`Migrated ${submissions.length} submissions for assignment ${assignment.id} to ${submissionTableName}`);
                    }
                }
            }
        }

        console.log("Migration completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrate();
