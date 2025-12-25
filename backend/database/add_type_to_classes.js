import db from "./dbconfig.js";

const addTypeToClasses = async () => {
    try {
        const dbp = db.promise();
        console.log("Attempting to add type column to classes table...");

        try {
            await dbp.query(`
                ALTER TABLE classes
                ADD COLUMN type ENUM('morning', 'afternoon', 'night') DEFAULT 'morning'
            `);
            console.log("✅ Successfully added type column to classes table.");
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log("⚠️ type column already exists.");
            } else {
                console.error("❌ Error adding type column:", err);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Script failed:", error);
        process.exit(1);
    }
};

addTypeToClasses();