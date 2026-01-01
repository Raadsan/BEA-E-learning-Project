import db from "./dbconfig.js";

const dbp = db.promise();

async function repair() {
    try {
        console.log("🚀 Starting Robust Student ID Repair...");

        const tables = [
            { name: 'attendance', column: 'student_id' },
            { name: 'payments', column: 'student_id' },
            { name: 'session_change_requests', column: 'student_id' },
            { name: 'assignment_submissions', column: 'student_id' },
            { name: 'placement_test_results', column: 'student_id' },
            { name: 'proficiency_test_results', column: 'student_id' },
            { name: 'writing_task_submissions', column: 'student_id' },
            { name: 'test_submissions', column: 'student_id' },
            { name: 'course_work_submissions', column: 'student_id' },
            { name: 'oral_assignment_submissions', column: 'student_id' }
        ];

        // 1. Ensure all columns are VARCHAR(20)
        console.log("Checking and updating column types...");
        for (const table of tables) {
            await dbp.query(`ALTER TABLE ${table.name} MODIFY COLUMN ${table.column} VARCHAR(20)`).catch(err => {
                console.log(`Note: Could not modify ${table.name}.${table.column}: ${err.message}`);
            });
        }

        // 2. Map existing students
        const [students] = await dbp.query("SELECT student_id FROM students");
        const studentMap = new Map();
        students.forEach(s => {
            const parts = s.student_id.split('-');
            if (parts.length === 3) {
                const sequence = parseInt(parts[2]);
                if (!isNaN(sequence)) {
                    // Mapping legacy integers back
                    const originalId = sequence - 100;
                    studentMap.set(String(originalId), s.student_id);
                }
            }
        });
        console.log(`Mapped ${studentMap.size} students for repair.`);

        // 3. Update orphaned records in all tables
        for (const table of tables) {
            console.log(`Checking ${table.name}...`);
            const [rows] = await dbp.query(`SELECT DISTINCT ${table.column} FROM ${table.name} WHERE ${table.column} NOT LIKE 'BEA-%'`).catch(() => [[]]);

            let count = 0;
            for (const row of rows) {
                const legacyId = row[table.column];
                const newId = studentMap.get(String(legacyId));
                if (newId) {
                    await dbp.query(`UPDATE ${table.name} SET ${table.column} = ? WHERE ${table.column} = ?`, [newId, legacyId]);
                    count++;
                }
            }
            if (count > 0) console.log(`✓ Updated ${count} records in ${table.name}.`);
        }

        // 4. Restore Foreign Keys
        console.log("Restoring foreign keys...");
        const fksToRestore = [
            { table: 'attendance', column: 'student_id', refTable: 'students', refCol: 'student_id', name: 'attendance_ibfk_1' },
            { table: 'payments', column: 'student_id', refTable: 'students', refCol: 'student_id', name: 'payments_ibfk_1' },
            { table: 'session_change_requests', column: 'student_id', refTable: 'students', refCol: 'student_id', name: 'session_change_requests_ibfk_1' },
            { table: 'assignment_submissions', column: 'student_id', refTable: 'students', refCol: 'student_id', name: 'assignment_submissions_ibfk_1' },
            { table: 'placement_test_results', column: 'student_id', refTable: 'students', refCol: 'student_id', name: 'placement_test_results_fk' }
        ];

        for (const fk of fksToRestore) {
            await dbp.query(`
                ALTER TABLE ${fk.table} 
                ADD CONSTRAINT ${fk.name} 
                FOREIGN KEY (${fk.column}) REFERENCES ${fk.refTable}(${fk.refCol})
            `).catch(err => {
                console.log(`! Failed to restore FK ${fk.name} on ${fk.table}: ${err.message}`);
            });
        }

        console.log("✅ Robust Repair complete!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Robust Repair failed:", err);
        process.exit(1);
    }
}

repair();
