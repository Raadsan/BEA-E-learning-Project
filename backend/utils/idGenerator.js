import db from "../database/dbconfig.js";

const dbp = db.promise();

/**
 * Generates a unique student ID in the format: BEA-DDMMYY-XXX
 * @param {string} tableName - The name of the table to check for the last ID (students or IELTSTOEFL)
 * @returns {Promise<string>} - The generated unique ID
 */
export const generateStudentId = async (tableName) => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yy = String(today.getFullYear()).slice(-2);

    // Prefix for today: BEA-DDMMYY-
    const prefix = `BEA-${dd}${mm}${yy}-`;

    // Query the database for the highest ID with this prefix
    const [rows] = await dbp.query(
        `SELECT student_id FROM ${tableName} 
         WHERE student_id LIKE ? 
         ORDER BY student_id DESC LIMIT 1`,
        [`${prefix}%`]
    );

    let nextNumber = 101;

    if (rows.length > 0) {
        const lastId = rows[0].student_id;
        const lastNumberParts = lastId.split('-');
        const lastSequence = parseInt(lastNumberParts[2]);
        if (!isNaN(lastSequence)) {
            nextNumber = lastSequence + 1;
        }
    }

    return `${prefix}${nextNumber}`;
};
