import db from "./dbconfig.js";

const dbp = db.promise();

async function getColumnNames() {
    try {
        const [classes] = await dbp.query("SHOW COLUMNS FROM `classes` ");
        console.log("CLASSES COLUMNS:", classes.map(c => c.Field));

        const [timetables] = await dbp.query("SHOW COLUMNS FROM `timetables` ");
        console.log("TIMETABLES COLUMNS:", timetables.map(c => c.Field));

    } catch (error) {
        console.error("Failed:", error);
    } finally {
        process.exit();
    }
}

getColumnNames();
