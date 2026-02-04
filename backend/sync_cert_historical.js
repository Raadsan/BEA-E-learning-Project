
import db from "./database/dbconfig.js";

const dbp = db.promise();

async function syncCertClassNamesHistorical() {
    console.log("Starting historical certificate class name synchronization...");

    try {
        // 1. Fetch all issued certificates for subprograms
        const [issued] = await dbp.query(`
      SELECT ic.id, ic.student_id, ic.target_id, ic.target_type, ic.class_name
      FROM issued_certificates ic
      WHERE ic.target_type = 'subprogram'
    `);

        console.log(`Found ${issued.length} subprogram certificates to check.`);

        let updatedCount = 0;
        for (const cert of issued) {
            // Find historical class for this specific subprogram
            const [history] = await dbp.query(`
        SELECT c.class_name 
        FROM student_class_history sch 
        JOIN classes c ON sch.class_id = c.id 
        WHERE sch.student_id = ? AND sch.subprogram_id = ? 
        ORDER BY sch.created_at DESC LIMIT 1
      `, [cert.student_id, cert.target_id]);

            if (history[0] && history[0].class_name !== cert.class_name) {
                await dbp.query(`UPDATE issued_certificates SET class_name = ? WHERE id = ?`, [history[0].class_name, cert.id]);
                updatedCount++;
            }
        }

        console.log(`Successfully updated ${updatedCount} records based on historical data.`);

        // 2. Fallback for those still missing class names (e.g. Programs or Subprograms without history)
        const [resFallback] = await dbp.query(`
      UPDATE issued_certificates ic
      JOIN students s ON ic.student_id = s.student_id
      JOIN classes c ON s.class_id = c.id
      SET ic.class_name = c.class_name
      WHERE (ic.class_name = '-' OR ic.class_name IS NULL)
    `);
        console.log(`Updated ${resFallback.affectedRows} records using current student class as fallback.`);

        console.log("Historical synchronization complete.");
        process.exit(0);
    } catch (error) {
        console.error("Synchronization failed:", error);
        process.exit(1);
    }
}

syncCertClassNamesHistorical();
