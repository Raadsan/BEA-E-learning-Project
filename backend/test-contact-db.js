// test-contact-db.js
// Quick test to verify database save works
import db from "./database/dbconfig.js";

const dbp = db.promise();

async function testContactSave() {
  try {
    // Test insert
    const [result] = await dbp.query(
      "INSERT INTO contacts (name, email, phone, message) VALUES (?, ?, ?, ?)",
      ["Test User", "test@example.com", "123456", "Test message"]
    );

    console.log("✅ Contact saved successfully!");
    console.log("Contact ID:", result.insertId);

    // Test retrieve
    const [rows] = await dbp.query("SELECT * FROM contacts WHERE id = ?", [result.insertId]);
    console.log("✅ Retrieved contact:", rows[0]);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

testContactSave();

