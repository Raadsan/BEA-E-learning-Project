import db from './dbconfig.js';

const alterTimetablesTable = async () => {
    try {
        const dbp = db.promise();

        // Check if columns already exist
        const [columns] = await dbp.query("SHOW COLUMNS FROM timetables LIKE 'week_number'");

        if (columns.length === 0) {
            // Add new columns
            await dbp.query(`
                ALTER TABLE timetables 
                ADD COLUMN week_number INT NULL AFTER day
            `);
            console.log("Added week_number column");
        } else {
            console.log("week_number column already exists");
        }

        const [activityTypeCol] = await dbp.query("SHOW COLUMNS FROM timetables LIKE 'activity_type'");
        if (activityTypeCol.length === 0) {
            await dbp.query(`
                ALTER TABLE timetables 
                ADD COLUMN activity_type VARCHAR(100) NULL AFTER type
            `);
            console.log("Added activity_type column");
        } else {
            console.log("activity_type column already exists");
        }

        const [activityTitleCol] = await dbp.query("SHOW COLUMNS FROM timetables LIKE 'activity_title'");
        if (activityTitleCol.length === 0) {
            await dbp.query(`
                ALTER TABLE timetables 
                ADD COLUMN activity_title VARCHAR(255) NULL AFTER activity_type
            `);
            console.log("Added activity_title column");
        } else {
            console.log("activity_title column already exists");
        }

        const [activityDescCol] = await dbp.query("SHOW COLUMNS FROM timetables LIKE 'activity_description'");
        if (activityDescCol.length === 0) {
            await dbp.query(`
                ALTER TABLE timetables 
                ADD COLUMN activity_description TEXT NULL AFTER activity_title
            `);
            console.log("Added activity_description column");
        } else {
            console.log("activity_description column already exists");
        }

        // Make time columns nullable
        await dbp.query(`
            ALTER TABLE timetables 
            MODIFY COLUMN start_time TIME NULL,
            MODIFY COLUMN end_time TIME NULL,
            MODIFY COLUMN subject VARCHAR(255) NULL
        `);
        console.log("Updated time columns to nullable");

        console.log("✅ Timetables table updated successfully for weekly scheduling!");
        process.exit(0);
    } catch (err) {
        console.error("Error updating timetables table:", err);
        process.exit(1);
    }
};

alterTimetablesTable();
