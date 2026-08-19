import prisma from '../lib/prisma.js';

const programAcronyms = {
    "8-Level General English Course for Adults": "GEP",
    "GENERAL ENGLISH PROGRAM (GEP) FOR ADULTS": "GEP",
    "English For Specific Purposes Program": "ESP",
    "ENGLISH FOR SPECIFIC PURPOSES (ESP) PROGRAM": "ESP",
    "ENGLISH FOR SPECIFIC PURPOSES (ESP) PROGRAM ": "ESP",
    "IELTS and TOEFL Test Preparation Courses": "IELTOEF",
    "IELTS & TOEFL TEST PREPARATION COURSES": "IELTOEF",
    "Soft Skills and Workplace Training Programs": "SSWTP",
    "SOFT SKILLS AND WORKPLACE TRAINING PROGRAMS": "SSWTP",
    "BEA Academic Writing Program": "AWP",
    "BEA ACADEMIC WRITING PROGRAM": "AWP",
    "Digital Literacy and Virtual Communication": "DLVCS",
    "DIGITAL LITERACY AND VIRTUAL COMMUNICATION SKILLS PROGRAM": "DLVCS",
    "ESL PROFIENCY CERTIFICATION PROGRAM": "PCP",
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

    let acronym = "GEN";
    const cleanName = programName ? String(programName).trim() : "";

    if (cleanName && programAcronyms[cleanName]) {
        acronym = programAcronyms[cleanName];
    } else if (cleanName && programAcronyms[cleanName.toUpperCase()]) {
        acronym = programAcronyms[cleanName.toUpperCase()];
    } else if (cleanName) {
        try {
            const progId = parseInt(cleanName, 10);
            const prog = await prisma.programs.findFirst({
                where: {
                    OR: [
                        { id: !isNaN(progId) ? progId : -1 },
                        { title: { contains: cleanName } },
                        { program_code: { equals: cleanName } }
                    ]
                },
                select: { program_code: true }
            });
            if (prog && prog.program_code) {
                acronym = prog.program_code.trim().toUpperCase();
            }
        } catch {
            acronym = "GEN";
        }
    }

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
