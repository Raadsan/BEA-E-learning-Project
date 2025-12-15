
import db from "./dbconfig.js";

const addSubprogramId = async () => {
    try {
        const dbp = db.promise();
        console.log("Attempting to add subprogram_id to classes table...");

        try {
            await dbp.query("ALTER TABLE classes ADD COLUMN subprogram_id INT NULL");
            console.log("✅ Successfully added subprogram_id column.");
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log("⚠️ subprogram_id already exists.");
            } else {
                console.error("❌ Error adding subprogram_id:", err);
            }
        }

        try {
            await dbp.query("ALTER TABLE classes ADD CONSTRAINT fk_classes_subprogram FOREIGN KEY (subprogram_id) REFERENCES subprograms(id) ON DELETE SET NULL");
            console.log("✅ Successfully added FK for subprogram_id.");
        } catch (err) {
            console.log("⚠️ FK for subprogram_id might already exist or failed: " + err.message);
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Script failed:", error);
        process.exit(1);
    }
};

addSubprogramId();
