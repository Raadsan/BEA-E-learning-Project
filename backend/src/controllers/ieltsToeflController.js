import prisma from '../lib/prisma.js';
import { validateEmailRobust } from '../utils/emailValidator.js';
import bcrypt from "bcryptjs";
import { generateStudentId } from "../utils/idGenerator.js";
import {
    sendWaafiPayment,
    isWaafiPaymentSuccess,
    getWaafiErrorMessage,
    getWaafiTransactionId
} from "../utils/waafiPayment.js";
import {
    buildCreateAudit,
    buildUpdateAudit,
    enrichWithAudit,
    backfillMissingCreatedBy,
} from '../utils/auditTrail.js';

export const getAllIeltsStudents = async (req, res) => {
    try {
        await backfillMissingCreatedBy(prisma.IELTSTOEFL);
        const students = await prisma.IELTSTOEFL.findMany({
            orderBy: { registration_date: 'desc' }
        });
        const withClasses = await attachClassNames(students);
        res.json({ success: true, students: await enrichWithAudit(withClasses, { createdAtField: 'registration_date', updatedAtField: 'updated_at' }) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createIeltsStudent = async (req, res) => {
    try {
        const { email, chosen_program, password, payment, ...rest } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const emailStr = email.trim().toLowerCase();
        
        // Deep Email Validation
        const emailValidationResult = await validateEmailRobust(emailStr);

        if (!emailValidationResult.valid) {
            return res.status(400).json({ error: emailValidationResult.message || "Invalid email address. Please provide a real and working email." });
        }

        const existing = await prisma.IELTSTOEFL.findFirst({
            where: { email: emailStr, chosen_program }
        });
        if (existing) return res.status(400).json({ error: "Already registered for this program" });

        const student_id = await generateStudentId('IELTSTOEFL', chosen_program);
        let hashedPassword = null;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }

        const createAudit = await buildCreateAudit(req, 'Self registration');

        const data = {
            ...rest,
            student_id,
            email: emailStr,
            chosen_program,
            password: hashedPassword,
            status: 'Pending',
            expiry_date: new Date(Date.now() + 1440 * 60000),
            ...createAudit,
        };

        if (payment && payment.method === 'mwallet_account') {
            const waafiResponse = await sendWaafiPayment({
                transactionId: `WAAFI-${Date.now()}`,
                accountNo: payment.payerPhone,
                amount: parseFloat(payment.amount),
                description: `IELTS Registration`
            });
            if (isWaafiPaymentSuccess(waafiResponse)) {
                data.payment_method = 'mwallet_account';
                data.transaction_id = getWaafiTransactionId(waafiResponse, `WAAFI-${Date.now()}`);
                data.payment_amount = parseFloat(payment.amount);
                data.payer_phone = payment.payerPhone;
            } else {
                return res.status(400).json({ error: getWaafiErrorMessage(waafiResponse) });
            }
        }

        const student = await prisma.IELTSTOEFL.create({ data });
        res.status(201).json({ success: true, student });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getIeltsStudent = async (req, res) => {
    try {
        const student = await prisma.IELTSTOEFL.findUnique({
            where: { student_id: req.params.id }
        });
        if (!student) return res.status(404).json({ error: "Not found" });
        res.json({ success: true, student: await enrichWithAudit(student, { createdAtField: 'registration_date', updatedAtField: 'updated_at' }) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateIeltsStudent = async (req, res) => {
    try {
        const data = { ...req.body };
        if (data.password) {
            const salt = await bcrypt.genSalt(10);
            data.password = await bcrypt.hash(data.password, salt);
        }
        delete data.created_by;
        delete data.created_by_name;
        delete data.updated_by;
        delete data.updated_by_name;
        Object.assign(data, await buildUpdateAudit(req));
        const updated = await prisma.IELTSTOEFL.update({
            where: { student_id: req.params.id },
            data
        });
        res.json({ success: true, student: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteIeltsStudent = async (req, res) => {
    try {
        await prisma.IELTSTOEFL.delete({ where: { student_id: req.params.id } });
        res.json({ success: true, message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

function normalizeProgramName(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function programsMatch(a, b) {
    if (!a || !b) return true;
    const na = normalizeProgramName(a);
    const nb = normalizeProgramName(b);
    if (na === nb) return true;
    const ieltsHint = (s) => s.includes('ielts') || s.includes('toefl');
    return ieltsHint(na) && ieltsHint(nb);
}

async function attachClassNames(students) {
    const classIds = [...new Set(students.map((s) => s.class_id).filter(Boolean))];
    if (classIds.length === 0) {
        return students.map((s) => ({ ...s, class_name: null }));
    }
    const classRows = await prisma.classes.findMany({
        where: { id: { in: classIds.map((id) => parseInt(id, 10)) } },
        select: { id: true, class_name: true },
    });
    const nameById = Object.fromEntries(classRows.map((c) => [c.id, c.class_name]));
    return students.map((s) => ({
        ...s,
        class_name: s.class_id ? nameById[parseInt(s.class_id, 10)] || null : null,
    }));
}

async function validateClassForStudent(student, classId) {
    const parsedClassId = parseInt(classId, 10);
    if (!parsedClassId) {
        throw new Error('Valid class is required');
    }

    const classItem = await prisma.classes.findUnique({
        where: { id: parsedClassId },
        include: {
            subprograms: {
                include: { programs: true },
            },
        },
    });

    if (!classItem) {
        throw new Error('Class not found');
    }

    const classProgram = classItem.subprograms?.programs?.title;
    const studentProgram = student.chosen_program || student.exam_type;

    if (classProgram && studentProgram && !programsMatch(classProgram, studentProgram)) {
        throw new Error('This class does not belong to the student\'s program');
    }

    return classItem;
}

export const approveIeltsStudent = async (req, res) => {
    try {
        const updated = await prisma.IELTSTOEFL.update({
            where: { student_id: req.params.id },
            data: {
                status: 'Approved',
                ...(await buildUpdateAudit(req)),
            },
        });
        res.json({ success: true, student: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const rejectIeltsStudent = async (req, res) => {
    try {
        const updated = await prisma.IELTSTOEFL.update({
            where: { student_id: req.params.id },
            data: {
                status: 'Rejected',
                ...(await buildUpdateAudit(req)),
            },
        });
        res.json({ success: true, student: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const extendIeltsDeadline = async (req, res) => {
    try {
        const { durationMinutes = 1440 } = req.body;
        const updated = await prisma.IELTSTOEFL.update({
            where: { student_id: req.params.id },
            data: {
                expiry_date: new Date(Date.now() + Number(durationMinutes) * 60000),
                is_extended: true,
                reminder_sent: false,
                ...(await buildUpdateAudit(req)),
            },
        });
        res.json({ success: true, student: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const assignIeltsClass = async (req, res) => {
    try {
        const { classId } = req.body;
        const student = await prisma.IELTSTOEFL.findUnique({
            where: { student_id: req.params.id },
        });
        if (!student) return res.status(404).json({ error: 'Student not found' });

        await validateClassForStudent(student, classId);

        const updated = await prisma.IELTSTOEFL.update({
            where: { student_id: req.params.id },
            data: {
                class_id: parseInt(classId, 10),
                status: student.status === 'Pending' ? 'Approved' : student.status,
                ...(await buildUpdateAudit(req)),
            },
        });

        const [withClass] = await attachClassNames([updated]);
        res.json({ success: true, student: withClass });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
