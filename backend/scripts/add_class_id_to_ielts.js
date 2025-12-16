
import db from "../database/dbconfig.js";

const addClassId = async () => {
    try {
        const query = "ALTER TABLE IELTSTOEFL ADD COLUMN class_id INT NULL DEFAULT NULL";
        await db.promise().query(query);
        console.log("✅ Added class_id column to IELTSTOEFL table");
        process.exit(0);
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log("ℹ️ class_id column already exists");
            process.exit(0);
        }
        console.error("❌ Error adding column:", error);
        process.exit(1);
    }
};

addClassId();
