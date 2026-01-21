import db from "./database/dbconfig.js";

const listTables = async () => {
    try {
        const dbp = db.promise();
        const [tables] = await dbp.query('SHOW TABLES');
        const tableList = tables.map(r => Object.values(r)[0]);

        const affectedTables = [];
        for (const table of tableList) {
            const [columns] = await dbp.query(`DESCRIBE ${table}`);
            if (columns.some(c => c.Field === 'student_id')) {
                affectedTables.push(table);
            }
        }
        console.log("AFFECTED_TABLES:" + JSON.stringify(affectedTables));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
};

listTables();
