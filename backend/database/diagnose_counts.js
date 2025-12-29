import db from './dbconfig.js';

async function checkCounts() {
    console.log("Checking counts...");

    // Check 17
    const [rows17] = await db.promise().query("SELECT COUNT(*) as count FROM learning_materials WHERE subprogram_id = 17");
    console.log(`Materials on ID 17: ${rows17[0].count}`);

    // Check 24
    const [rows24] = await db.promise().query("SELECT COUNT(*) as count FROM learning_materials WHERE subprogram_id = 24");
    console.log(`Materials on ID 24: ${rows24[0].count}`);

    // List all just in case
    const [all] = await db.promise().query("SELECT id, title, subprogram_id FROM learning_materials");
    console.log("All Materials:");
    console.table(all);

    process.exit();
}

checkCounts();
