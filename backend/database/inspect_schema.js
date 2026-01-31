import db from "./dbconfig.js";

const dbp = db.promise();

async function inspectSchema() {
    try {
        console.log("--- CLASSES SCHEMA ---");
        const [classes] = await dbp.query("DESCRIBE `classes` "); // Use backticks
        console.table(classes);

        console.log("\n--- TIMETABLES SCHEMA ---");
        const [timetables] = await dbp.query("DESCRIBE `timetables` ");
        console.table(timetables);

    } catch (error) {
        console.error("Inspection failed:", error);
    } finally {
        process.exit();
    }
}

inspectSchema();
