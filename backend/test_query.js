
import db from "./database/dbconfig.js";
import fs from "fs";

async function test() {
    const dbp = db.promise();
    try {
        const studentId = "BEA-ST-GEP-221225-101"; // Sample from previous check
        const q = `SELECT c.id, c.class_name, c.subprogram_id, s.subprogram_name, p.title as program_name, 1 as is_active
                   FROM students st 
                   JOIN classes c ON st.class_id = c.id 
                   LEFT JOIN subprograms s ON c.subprogram_id = s.id
                   LEFT JOIN programs p ON s.program_id = p.id
                   WHERE st.student_id = ?`;
        const [rows] = await dbp.query(q, [studentId]);
        fs.writeFileSync("test_query_result.json", JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (e) {
        fs.writeFileSync("test_query_result.json", e.stack);
        process.exit(1);
    }
}
test();
