import db from "./dbconfig.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbp = db.promise();

async function setupAssignments() {
    try {
        console.log("🔄 Setting up assignments tables...");

        // Read and execute assignments table SQL
        const assignmentsSql = fs.readFileSync(
            path.join(__dirname, "create_assignments_table.sql"),
            "utf8"
        );
        await dbp.query(assignmentsSql);
        console.log("✅ Created assignments table");

        // Read and execute assignment submissions table SQL
        const submissionsSql = fs.readFileSync(
            path.join(__dirname, "create_assignment_submissions_table.sql"),
            "utf8"
        );
        await dbp.query(submissionsSql);
        console.log("✅ Created assignment_submissions table");

        console.log("\n✅ Assignments tables created successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error setting up assignments tables:", err);
        process.exit(1);
    }
}

setupAssignments();
