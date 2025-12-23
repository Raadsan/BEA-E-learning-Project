import db from './dbconfig.js';

async function setupPaymentsTableV2() {
    const sql = `
    CREATE TABLE IF NOT EXISTS payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      payer_phone VARCHAR(20),
      amount DECIMAL(10,2) NOT NULL,
      method VARCHAR(50) NOT NULL,
      program_id VARCHAR(100),
      provider_transaction_id VARCHAR(255),
      status VARCHAR(50) DEFAULT 'paid',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );
  `;

    db.query(sql, (err, result) => {
        if (err) {
            if (err.code === 'ER_TABLE_EXISTS_ERROR' || err.code === 'ER_DUP_FIELDNAME') {
                console.log('⚠️ Table or some columns already exist. Consider running an ALTER if columns are missing.');
                // If table exists, we might need to add missing columns manually for existing users
                const addCols = [
                    `ALTER TABLE payments ADD COLUMN IF NOT EXISTS payer_phone VARCHAR(20)`,
                    `ALTER TABLE payments ADD COLUMN IF NOT EXISTS program_id VARCHAR(100)`
                ];
                addCols.forEach(alterSql => {
                    db.query(alterSql, (alterErr) => {
                        if (alterErr) console.error('❌ Error updating payments table:', alterErr.message);
                        else console.log('✅ Updated payments table columns');
                    });
                });
            } else {
                console.error('❌ Error setting up payments table:', err);
            }
        } else {
            console.log('✅ payments table created/ensured with foreign key');
        }
    });
}

setupPaymentsTableV2();
