import db from "./dbconfig.js";

const dbp = db.promise();

async function addAdminProfilePicture() {
    try {
        console.log("🔄 Adding profile_picture column to admins table...");

        try {
            await dbp.query(`
                ALTER TABLE admins 
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

addAdminProfilePicture();
