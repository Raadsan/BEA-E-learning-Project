import db from "../database/dbconfig.js";

const dbp = db.promise();

/**
 * Maps program titles to their respective acronyms
 */
const programAcronyms = {
    "8-Level General English Course for Adults": "GEP",
    "English For Specific Purposes Program": "ESP",
    "IELTS and TOEFL Test Preparation Courses": "IELTOEF",
    "Soft Skills and Workplace Training Programs": "SSWTP",
    "BEA Academic Writing Program": "AWP",
    "Digital Literacy and Virtual Communication": "DLVCS",
    "Proficiency Test Only": "PROFI"
};

/**
 * Generates a unique student ID in the format: BEA-ST-[ACRONYM]-[DDMMYY]-[SEQ]
 * @param {string} tableName - The name of the table to check (students or IELTSTOEFL)
 * @param {string} programName - The name of the program to get the acronym
 * @returns {Promise<string>} - The generated unique ID
 */
export const generateStudentId = async (tableName, programName = "") => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yy = String(today.getFullYear()).slice(-2);

    // Get acronym or default to 'GEN'
    const acronym = programAcronyms[programName] || "GEN";

    // NEW Format (YYMMDD): BEA-ST-[ACRONYM]-[YYMMDD]-[SEQ]
    // Better for string sorting and standard practices
    const dateStr = `${yy}${mm}${dd}`;
    const prefix = `BEA-ST-${acronym}-${dateStr}-`;

    // Query for the highest ID for this PROGRAM regardless of date
    // Uses numeric sort on the sequence part to avoid lexicographical comparison issues
    const lookupPrefix = `BEA-ST-${acronym}-`;
    const [rows] = await dbp.query(
        `SELECT student_id FROM ${tableName} 
         WHERE student_id LIKE ? 
         ORDER BY CAST(SUBSTRING_INDEX(student_id, '-', -1) AS UNSIGNED) DESC 
         LIMIT 1`,
        [`${lookupPrefix}%`]
    );

    let nextNumber = 101;

    if (rows.length > 0) {
        const lastId = rows[0].student_id;
        if (lastId) {
            const lastParts = lastId.split('-');
            const lastSequence = parseInt(lastParts[lastParts.length - 1]);
            if (!isNaN(lastSequence)) {
                nextNumber = lastSequence + 1;
            }
        }
    }

    return `${prefix}${nextNumber}`;
};

/**
 * Generates a unique teacher ID in the format: BEA-TC-[DDMMYY]-[SEQ]
 * @returns {Promise<string>} - The generated unique ID
 */
export const generateTeacherId = async () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yy = String(today.getFullYear()).slice(-2);

    // NEW Format (YYMMDD): BEA-TC-[YYMMDD]-[SEQ]
    const dateStr = `${yy}${mm}${dd}`;
    const prefix = `BEA-TC-${dateStr}-`;

    // Global lookup for teachers using numeric sort
    const lookupPrefix = `BEA-TC-`;
    const [rows] = await dbp.query(
        `SELECT teacher_id FROM teachers 
         WHERE teacher_id LIKE ? 
         ORDER BY CAST(SUBSTRING_INDEX(teacher_id, '-', -1) AS UNSIGNED) DESC 
         LIMIT 1`,
        [`${lookupPrefix}%`]
    );

    let nextNumber = 1;

    if (rows.length > 0) {
        const lastId = rows[0].teacher_id;
        if (lastId) {
            const lastParts = lastId.split('-');
            const lastSequence = parseInt(lastParts[lastParts.length - 1]);
            if (!isNaN(lastSequence)) {
                nextNumber = lastSequence + 1;
            }
        }
    }

    return `${prefix}${String(nextNumber).padStart(3, '0')}`;
};
