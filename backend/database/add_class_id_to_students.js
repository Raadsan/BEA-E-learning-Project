
import db from "./dbconfig.js";

const addClassIdToStudents = async () => {
    try {
        const dbp = db.promise();
        console.log("Attempting to add class_id to students table...");

        try {
            await dbp.query("ALTER TABLE students ADD COLUMN class_id INT NULL");
            console.log("✅ Successfully added class_id column.");
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log("⚠️ class_id already exists.");
            } else {
                console.error("❌ Error adding class_id:", err);
            }
        }

        try {
            await dbp.query("ALTER TABLE students ADD CONSTRAINT fk_students_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL");
            console.log("✅ Successfully added FK for class_id.");
        } catch (err) {
            console.log("⚠️ FK for class_id might already exist or failed: " + err.message);
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Script failed:", error);
        process.exit(1);
    }
};

addClassIdToStudents();
