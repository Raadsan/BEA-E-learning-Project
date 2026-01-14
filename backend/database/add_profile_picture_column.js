import db from "./dbconfig.js";

const dbp = db.promise();

async function addProfilePictureColumn() {
    try {
        console.log("🔄 Adding profile_picture column to students table...");

        try {
            await dbp.query(`
                ALTER TABLE students 
                ADD COLUMN profile_picture VARCHAR(255) DEFAULT NULL
            `);
            console.log("✅ Column profile_picture added successfully.");
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log("⚠️ Column already exists. Skipping.");
            } else {
                throw error;
            }
        }

    } catch (error) {
        console.error("❌ Error running migration:", error);
    } finally {
        process.exit();
    }
}

addProfilePictureColumn();
