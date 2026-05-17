import prisma from '../lib/prisma.js';

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
 * Generates a unique student ID: BEA-ST-[ACRONYM]-[YYMMDD]-[SEQ]
 */
export const generateStudentId = async (tableName, programName = "") => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yy = String(today.getFullYear()).slice(-2);
    const dateStr = `${yy}${mm}${dd}`;

    const acronym = programAcronyms[programName] || "GEN";
    const prefix = `BEA-ST-${acronym}-${dateStr}-`;
    const lookupPrefix = `BEA-ST-${acronym}-`;

    let lastId = null;

    if (tableName === 'IELTSTOEFL') {
        const row = await prisma.IELTSTOEFL.findFirst({
            where: { student_id: { startsWith: lookupPrefix } },
            orderBy: { student_id: 'desc' }
        });
        lastId = row?.student_id;
    } else {
        const row = await prisma.students.findFirst({
            where: { student_id: { startsWith: lookupPrefix } },
            orderBy: { student_id: 'desc' }
        });
        lastId = row?.student_id;
    }

    let nextNumber = 101;
    if (lastId) {
        const parts = lastId.split('-');
        const seq = parseInt(parts[parts.length - 1]);
        if (!isNaN(seq)) nextNumber = seq + 1;
    }

    return `${prefix}${nextNumber}`;
};

/**
 * Generates a unique teacher ID: BEA-TC-[YYMMDD]-[SEQ]
 */
export const generateTeacherId = async () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yy = String(today.getFullYear()).slice(-2);
    const dateStr = `${yy}${mm}${dd}`;
    const prefix = `BEA-TC-${dateStr}-`;
    const lookupPrefix = `BEA-TC-`;

    const row = await prisma.teachers.findFirst({
        where: { teacher_id: { startsWith: lookupPrefix } },
        orderBy: { teacher_id: 'desc' }
    });

    let nextNumber = 1;
    if (row?.teacher_id) {
        const parts = row.teacher_id.split('-');
        const seq = parseInt(parts[parts.length - 1]);
        if (!isNaN(seq)) nextNumber = seq + 1;
    }

    return `${prefix}${String(nextNumber).padStart(3, '0')}`;
};
