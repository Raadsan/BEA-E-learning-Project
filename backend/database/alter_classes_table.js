
import db from "./dbconfig.js";

const alterTable = async () => {
    try {
        const dbp = db.promise();

        console.log("Checking columns in classes table...");

        // Check if columns exist first to avoid duplicate errors, strict mode usually handles this but safety first
        // Or just try ADD COLUMN IF NOT EXISTS (MariaDB 10.2+) or catch error

        // Simple approach: Try adding columns one by one

        try {
            await dbp.query(`
            ALTER TABLE classes 
            ADD COLUMN subprogram_id INT NULL,
            ADD COLUMN teacher_id INT NULL,
            ADD CONSTRAINT fk_classes_subprogram FOREIGN KEY (subprogram_id) REFERENCES subprograms(id) ON DELETE SET NULL,
            ADD CONSTRAINT fk_classes_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
        `);
            console.log("✅ Successfully added subprogram_id and teacher_id columns to classes table.");
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log("⚠️ Columns already exist or duplicate field name.");
            } else {
                console.error("❌ Error adding columns:", err);
                // Try adding individually if one exists and other doesn't
                try {
                    await dbp.query("ALTER TABLE classes ADD COLUMN subprogram_id INT NULL");
                    console.log("Added subprogram_id");
                } catch (e) { console.log("subprogram_id likely exists"); }

                try {
                    await dbp.query("ALTER TABLE classes ADD COLUMN teacher_id INT NULL");
                    console.log("Added teacher_id");
                } catch (e) { console.log("teacher_id likely exists"); }

                // Add FKs separately
                try {
                    await dbp.query("ALTER TABLE classes ADD CONSTRAINT fk_classes_subprogram FOREIGN KEY (subprogram_id) REFERENCES subprograms(id) ON DELETE SET NULL");
                    console.log("Added fk_classes_subprogram");
                } catch (e) { }
                try {
                    await dbp.query("ALTER TABLE classes ADD CONSTRAINT fk_classes_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL");
                    console.log("Added fk_classes_teacher");
                } catch (e) { }
            }
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Database update failed:", error);
        process.exit(1);
    }
};

alterTable();
