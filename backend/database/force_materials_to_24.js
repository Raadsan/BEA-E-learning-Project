import db from './dbconfig.js';

async function forceMaterials() {
    const TO_ID = 24;

    console.log(`FORCING ALL materials to subprogram ID ${TO_ID}...`);

    const [result] = await db.promise().query(
        "UPDATE learning_materials SET subprogram_id = ?",
        [TO_ID]
    );

    console.log(`Updated ${result.affectedRows} materials.`);

    const [rows] = await db.promise().query("SELECT id, title, subprogram_id FROM learning_materials");
    console.table(rows);

    process.exit();
}

forceMaterials();
