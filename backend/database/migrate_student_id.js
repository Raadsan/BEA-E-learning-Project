import db from "../database/dbconfig.js";

const dbp = db.promise();

async function migrate() {
    try {
        console.log("🚀 Starting database migration...");

        // Add student_id_number to students table
        console.log("Adding student_id_number to students table...");
        await dbp.query(`
            ALTER TABLE students 
            ADD COLUMN student_id_number VARCHAR(20) UNIQUE AFTER id
        `).catch(err => {
            if (err.code === 'ER_DUP_FIELDNAME' || err.errno === 1060) {
                console.log("Column student_id_number already exists in students table.");
            } else {
                throw err;
            }
        });

        // Add student_id_number to IELTSTOEFL table
        console.log("Adding student_id_number to IELTSTOEFL table...");
        await dbp.query(`
            ALTER TABLE IELTSTOEFL 
            ADD COLUMN student_id_number VARCHAR(20) UNIQUE AFTER id
        `).catch(err => {
            if (err.code === 'ER_DUP_FIELDNAME' || err.errno === 1060) {
                console.log("Column student_id_number already exists in IELTSTOEFL table.");
            } else {
                throw err;
            }
        });

        console.log("✅ Migration completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

migrate();
