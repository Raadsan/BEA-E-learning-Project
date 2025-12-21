const db = require('../config/dbconfig');
const fs = require('fs');
const path = require('path');

const createProficiencyTestResultsTable = async () => {
    try {
        const sql = fs.readFileSync(
            path.join(__dirname, '../database/create_proficiency_test_results_table.sql'),
            'utf8'
        );

        await db.promise().query(sql);
        console.log('✅ Proficiency test results table created successfully');
        db.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating proficiency test results table:', error);
        db.end();
        process.exit(1);
    }
};

createProficiencyTestResultsTable();
