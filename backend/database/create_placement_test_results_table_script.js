import db from "./dbconfig.js";

const dbp = db.promise();

async function createTable() {
    try {
        const query = `
      CREATE TABLE IF NOT EXISTS placement_test_results (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        test_id INT NOT NULL,
        score INT NOT NULL,
        total_questions INT NOT NULL,
        percentage DECIMAL(5,2) NOT NULL,
        answers JSON NOT NULL,
        status ENUM('completed', 'pending_review') DEFAULT 'completed',
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_student (student_id),
        INDEX idx_test (test_id)
      )
    `;
        await dbp.query(query);
        console.log("✅ placement_test_results table created successfully.");
    } catch (error) {
        console.error("❌ Error creating table:", error.message);
    } finally {
        process.exit();
    }
}

createTable();
