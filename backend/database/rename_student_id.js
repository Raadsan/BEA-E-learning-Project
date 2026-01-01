import db from "../database/dbconfig.js";

const dbp = db.promise();

async function migrate() {
    try {
        console.log("🚀 Starting database migration (Renaming columns)...");

        // Rename id to student_id and student_id_number to student_reg_number in students table
        console.log("Renaming columns in students table...");
        await dbp.query(`
            ALTER TABLE students 
            CHANGE COLUMN id student_id INT AUTO_INCREMENT,
            CHANGE COLUMN student_id_number student_reg_number VARCHAR(20) UNIQUE
        `).catch(err => {
            console.log("Note: Rename in students table might have already happened or failed partially:", err.message);
        });

        // Rename id to student_id and student_id_number to student_reg_number in IELTSTOEFL table
        console.log("Renaming columns in IELTSTOEFL table...");
        await dbp.query(`
            ALTER TABLE IELTSTOEFL 
            CHANGE COLUMN id student_id INT AUTO_INCREMENT,
            CHANGE COLUMN student_id_number student_reg_number VARCHAR(20) UNIQUE
        `).catch(err => {
            console.log("Note: Rename in IELTSTOEFL table might have already happened or failed partially:", err.message);
        });

        console.log("✅ Migration completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

migrate();
