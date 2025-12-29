import db from './dbconfig.js';

async function fixMaterials() {
    // Student is on 24 "Level 1: A1-A2 Beginner"
    // Materials are on 17 "A1 - Beginner"

    // We want to move materials FROM 17 TO 24
    const FROM_ID = 17;
    const TO_ID = 24;

    console.log(`CORRECTION: Moving materials from ID ${FROM_ID} -> ${TO_ID}`);

    const [result] = await db.promise().query(
        "UPDATE learning_materials SET subprogram_id = ? WHERE subprogram_id = ?",
        [TO_ID, FROM_ID]
    );

    console.log(`Corrected ${result.affectedRows} materials.`);
    process.exit();
}

fixMaterials();
