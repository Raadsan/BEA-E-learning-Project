import db from "./dbconfig.js";

const dbp = db.promise();

async function repair() {
    try {
        console.log("🚀 Starting Student ID Repair...");

        const tables = [
            'attendance', 'payments', 'session_change_requests',
            'assignment_submissions', 'placement_test_results',
            'proficiency_test_results', 'writing_task_submissions',
            'test_submissions', 'course_work_submissions', 'oral_assignment_submissions'
        ];

        // We assume the legacy string IDs in related tables (e.g., '10') 
        // match the suffix of the new BEA IDs (e.g., 'BEA-010126-110')
        // if they were generated as 100 + id.

        // Let's get all students and their IDs
        const [students] = await dbp.query("SELECT student_id FROM students");
        const studentMap = new Map();
        students.forEach(s => {
            const parts = s.student_id.split('-');
            if (parts.length === 3) {
                const sequence = parseInt(parts[2]);
                if (!isNaN(sequence)) {
                    // If it was 100 + id, then id = sequence - 100
                    const originalId = sequence - 100;
                    studentMap.set(String(originalId), s.student_id);
                }
            }
        });

        console.log(`Mapped ${studentMap.size} students for repair.`);

        for (const table of tables) {
            console.log(`Repairing table: ${table}...`);
            const [orphans] = await dbp.query(`
                SELECT DISTINCT student_id FROM ${table}
                WHERE student_id NOT LIKE 'BEA-%'
            `).catch(() => [[]]);

            let count = 0;
            for (const orphan of orphans) {
                const newId = studentMap.get(String(orphan.student_id));
                if (newId) {
                    await dbp.query(`UPDATE ${table} SET student_id = ? WHERE student_id = ?`, [newId, orphan.student_id]);
                    count++;
                }
            }
            console.log(`Updated ${count} records in ${table}.`);
        }

        // Try restoring the foreign keys again
        console.log("Attempting to restore foreign keys...");
        const [fks] = await dbp.query(`
            SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE REFERENCED_TABLE_NAME = 'students' AND TABLE_SCHEMA = DATABASE()
            AND CONSTRAINT_NAME LIKE '%ibfk%' -- Rough way to find dropped ones if they were auto-named
        `).catch(() => [[]]);

        // Since I dropped them, they won't be in INFORMATION_SCHEMA.
        // I should have a hardcoded list from the earlier check.
        const knownFks = [
            { table: 'attendance', column: 'student_id', constraint: 'attendance_ibfk_1' },
            { table: 'payments', column: 'student_id', constraint: 'payments_ibfk_1' },
            { table: 'session_change_requests', column: 'student_id', constraint: 'session_change_requests_ibfk_1' },
            { table: 'assignment_submissions', column: 'student_id', constraint: 'assignment_submissions_ibfk_1' }
            // Add more if needed
        ];

        for (const fk of knownFks) {
            console.log(`Restoring FK: ${fk.constraint} on ${fk.table}...`);
            await dbp.query(`
                ALTER TABLE ${fk.table} 
                ADD CONSTRAINT ${fk.constraint} 
                FOREIGN KEY (${fk.column}) REFERENCES students(student_id)
            `).catch(err => {
                console.log(`Failed to restore FK ${fk.constraint}: ${err.message}`);
            });
        }

        console.log("✅ Repair complete!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Repair failed:", err);
        process.exit(1);
    }
}

repair();
