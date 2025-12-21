import db from './dbconfig.js';

async function createPaymentsTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NULL,
      method VARCHAR(50) NOT NULL,
      provider_transaction_id VARCHAR(255),
      amount DECIMAL(10,2) NOT NULL,
      currency VARCHAR(10) DEFAULT 'USD',
      status VARCHAR(50) DEFAULT 'pending',
      raw_response JSON NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX (student_id)
    );
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error('❌ Error creating payments table:', err);
    } else {
      console.log('✅ payments table ensured');
    }
  });
}

createPaymentsTable();