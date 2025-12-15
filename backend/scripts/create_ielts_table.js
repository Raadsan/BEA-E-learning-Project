
import db from "../database/dbconfig.js";

const createTable = async () => {
    try {
        const createTableQuery = `
      CREATE TABLE IF NOT EXISTS IELTSTOEFL (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        age INT,
        gender VARCHAR(20),
        residency_country VARCHAR(255),
        residency_city VARCHAR(255),
        exam_type ENUM('IELTS', 'TOEFL') NOT NULL,
        verification_method ENUM('Certificate', 'Exam Booking') NOT NULL,
        certificate_institution VARCHAR(255),
        certificate_date DATE,
        certificate_document VARCHAR(255),
        exam_booking_date DATE,
        exam_booking_time VARCHAR(50),
        registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'Pending',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

        await db.promise().query(createTableQuery);
        console.log("✅ IELTSTOEFL table created successfully");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error creating table:", error);
        process.exit(1);
    }
};

createTable();
