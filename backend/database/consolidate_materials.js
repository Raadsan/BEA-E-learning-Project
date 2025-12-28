import db from './dbconfig.js';

async function consolidateMaterials() {
    // 17 is "A1 - Beginner" (The one the student has)
    // 24 is "Level 1: A1-A2 Beginner" (The one the materials might be on)

    const CORRECT_ID = 17;
    const WRONG_ID = 24;

    console.log(`Fixing materials... Moving from ID ${WRONG_ID} -> ${CORRECT_ID}`);

    // Update materials
    const [result] = await db.promise().query(
        "UPDATE learning_materials SET subprogram_id = ? WHERE subprogram_id = ?",
        [CORRECT_ID, WRONG_ID]
    );

    console.log(`Updated ${result.affectedRows} materials.`);

    // Check final count
    const [rows] = await db.promise().query(
        "SELECT id, title, subprogram_id FROM learning_materials WHERE subprogram_id = ?",
        [CORRECT_ID]
    );
    console.table(rows);

    process.exit();
}

consolidateMaterials();
