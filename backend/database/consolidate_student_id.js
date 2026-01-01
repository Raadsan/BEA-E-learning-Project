import db from "../database/dbconfig.js";

const dbp = db.promise();

async function migrate() {
    try {
        console.log("🚀 Starting Student ID Consolidation...");

        // 1. Identify Foreign Keys
        const [fks] = await dbp.query(`
            SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE REFERENCED_TABLE_NAME = 'students' AND TABLE_SCHEMA = DATABASE()
        `);

        // 2. Drop Foreign Keys
        console.log("Dropping foreign keys...");
        for (const fk of fks) {
            await dbp.query(`ALTER TABLE ${fk.TABLE_NAME} DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}`).catch(err => {
                console.log(`Failed to drop FK ${fk.CONSTRAINT_NAME} on ${fk.TABLE_NAME}: ${err.message}`);
            });
        }

        // 3. Ensure all students have a formatted ID in student_reg_number
        // We'll use a simple loop or just update legacy ones
        console.log("Generating formatted IDs for legacy students...");
        const [students] = await dbp.query("SELECT student_id, student_reg_number FROM students");
        for (const student of students) {
            if (!student.student_reg_number) {
                const today = new Date();
                const ddmmyy = String(today.getDate()).padStart(2, '0') +
                    String(today.getMonth() + 1).padStart(2, '0') +
                    String(today.getFullYear()).slice(-2);
                const newId = `BEA-${ddmmyy}-${100 + student.student_id}`; // Fallback format
                await dbp.query("UPDATE students SET student_reg_number = ? WHERE student_id = ?", [newId, student.student_id]);
            }
        }

        // 4. Update referring tables to use the string IDs
        console.log("Updating referring tables to use string IDs...");
        for (const fk of fks) {
            // Change column type to VARCHAR(20) first
            await dbp.query(`ALTER TABLE ${fk.TABLE_NAME} MODIFY COLUMN ${fk.COLUMN_NAME} VARCHAR(20)`);

            // Update values: join with students to get the reg_number
            await dbp.query(`
                UPDATE ${fk.TABLE_NAME} t
                JOIN students s ON t.${fk.COLUMN_NAME} = CAST(s.student_id AS CHAR)
                SET t.${fk.COLUMN_NAME} = s.student_reg_number
            `).catch(err => {
                console.log(`Failed to update values in ${fk.TABLE_NAME}: ${err.message}`);
            });
        }

        // 5. Transform Students Table
        console.log("Consolidating students table...");

        // Remove auto_increment first (requires modifying the column without dropping PK yet)
        await dbp.query("ALTER TABLE students MODIFY COLUMN student_id INT NOT NULL");

        // Drop primary key
        await dbp.query("ALTER TABLE students DROP PRIMARY KEY");

        // Change student_id to VARCHAR(20)
        await dbp.query("ALTER TABLE students MODIFY COLUMN student_id VARCHAR(20) NOT NULL");

        // Update values in student_id from student_reg_number
        await dbp.query("UPDATE students SET student_id = student_reg_number");

        // Add primary key back
        await dbp.query("ALTER TABLE students ADD PRIMARY KEY (student_id)");

        // Drop student_reg_number
        await dbp.query("ALTER TABLE students DROP COLUMN student_reg_number");

        // 6. Restore Foreign Keys
        console.log("Restoring foreign keys...");
        for (const fk of fks) {
            await dbp.query(`
                ALTER TABLE ${fk.TABLE_NAME} 
                ADD CONSTRAINT ${fk.CONSTRAINT_NAME} 
                FOREIGN KEY (${fk.COLUMN_NAME}) REFERENCES students(student_id)
            `).catch(err => {
                console.log(`Failed to restore FK ${fk.CONSTRAINT_NAME} on ${fk.TABLE_NAME}: ${err.message}`);
            });
        }

        console.log("✅ Consolidation complete!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Consolidation failed:", err);
        process.exit(1);
    }
}

migrate();
