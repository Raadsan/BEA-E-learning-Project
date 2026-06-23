import prisma from '../lib/prisma.js';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';
import path from 'path';
import { readStoredFileBuffer } from '../utils/fileStorage.js';
import {
    GLOBAL_CERTIFICATE_TARGET_ID,
    GLOBAL_CERTIFICATE_TARGET_TYPE,
    normalizeFieldsConfig,
    hexToRgb,
} from '../utils/certificateFields.js';

async function resolveStudentDetails(studentId) {
    let studentName = '';
    let className = '-';

    const student = await prisma.students.findUnique({
        where: { student_id: studentId },
        include: { classes: true },
    });

    if (student) {
        return {
            student,
            studentName: student.full_name,
            className: student.classes?.class_name || '-',
        };
    }

    const ielts = await prisma.IELTSTOEFL.findUnique({ where: { student_id: studentId } });
    if (ielts) {
        return {
            student: null,
            studentName: `${ielts.first_name} ${ielts.last_name}`,
            className: '-',
        };
    }

    const prof = await prisma.ProficiencyTestStudents.findFirst({ where: { student_id: studentId } });
    if (prof) {
        return {
            student: null,
            studentName: `${prof.first_name} ${prof.last_name}`,
            className: 'Proficiency Test',
        };
    }

    return { student: null, studentName: '', className: '-' };
}

async function resolveTargetDetails(targetType, targetId) {
    const parsedId = parseInt(targetId);

    if (targetType === 'subprogram') {
        const subprogram = await prisma.subprograms.findUnique({
            where: { id: parsedId },
            include: { programs: true },
        });
        if (!subprogram) return null;
        return {
            targetName: subprogram.subprogram_name,
            programName: subprogram.programs?.title || '-',
            subprogramId: subprogram.id,
        };
    }

    const program = await prisma.programs.findUnique({ where: { id: parsedId } });
    if (!program) return null;
    return {
        targetName: program.title || 'Program',
        programName: program.title || 'Program',
        subprogramId: null,
    };
}

async function resolveStudentGrade(studentId, subprogramId) {
    if (!subprogramId) return 'Completed';

    const classIds = (
        await prisma.classes.findMany({
            where: { subprogram_id: subprogramId },
            select: { id: true },
        })
    ).map((c) => c.id);

    const scores = [];

    const [writingSubs, courseWorkSubs, examSubs, oralSubs, assignmentSubs] = await Promise.all([
        prisma.writing_task_submissions.findMany({
            where: { student_id: studentId, status: 'graded' },
            include: { writing_tasks: true },
        }),
        prisma.course_work_submissions.findMany({
            where: { student_id: studentId, status: 'graded' },
            include: { course_work: true },
        }),
        prisma.exam_submissions.findMany({
            where: { student_id: studentId, status: 'graded' },
            include: { exams: true },
        }),
        prisma.oral_assignment_submissions.findMany({
            where: { student_id: studentId, status: 'graded' },
            include: { oral_assignments: true },
        }),
        prisma.assignment_submissions.findMany({
            where: { student_id: studentId, status: 'graded' },
            include: { assignments: true },
        }),
    ]);

    const pushScore = (submission, assignment) => {
        if (!assignment || submission.score == null) return;
        const maxScore = assignment.total_points || 100;
        const pct = (Number(submission.score) / maxScore) * 100;
        if (!Number.isNaN(pct)) scores.push(pct);
    };

    writingSubs.forEach((s) => {
        if (classIds.includes(s.writing_tasks?.class_id)) pushScore(s, s.writing_tasks);
    });
    courseWorkSubs.forEach((s) => {
        if (
            s.course_work?.subprogram_id === subprogramId ||
            classIds.includes(s.course_work?.class_id)
        ) {
            pushScore(s, s.course_work);
        }
    });
    examSubs.forEach((s) => {
        if (
            s.exams?.subprogram_id === subprogramId ||
            classIds.includes(s.exams?.class_id)
        ) {
            pushScore(s, s.exams);
        }
    });
    oralSubs.forEach((s) => {
        if (
            s.oral_assignments?.subprogram_id === subprogramId ||
            classIds.includes(s.oral_assignments?.class_id)
        ) {
            pushScore(s, s.oral_assignments);
        }
    });
    assignmentSubs.forEach((s) => {
        if (classIds.includes(s.assignments?.class_id)) pushScore(s, s.assignments);
    });

    if (!scores.length) return 'Completed';

    const average = scores.reduce((sum, value) => sum + value, 0) / scores.length;
    return `${Math.round(average)}%`;
}

function buildFieldValues({ studentName, studentId, targetDetails, grade }) {
    const issueDate = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    return {
        student_name: studentName,
        student_id: studentId,
        program_name: targetDetails.programName,
        subprogram_name: targetDetails.targetName,
        grade,
        issue_date: issueDate,
    };
}

async function drawConfiguredFields(firstPage, pdfDoc, fieldsConfig, fieldValues) {
    const { width, height } = firstPage.getSize();
    pdfDoc.registerFontkit(fontkit);

    const fontPath = path.join(process.cwd(), 'assets', 'fonts', 'Montserrat-Bold.ttf');
    const fontBytes = fs.readFileSync(fontPath);
    const font = await pdfDoc.embedFont(fontBytes);

    const scaleX = width / 1000;
    const scaleY = height / 1000;

    for (const [fieldKey, fieldConfig] of Object.entries(fieldsConfig)) {
        if (!fieldConfig?.enabled) continue;

        const text = fieldValues[fieldKey];
        if (!text) continue;

        const { r, g, b } = hexToRgb(fieldConfig.font_color);
        const textWidth = font.widthOfTextAtSize(text, fieldConfig.font_size);
        const drawX = (fieldConfig.x * scaleX) - (textWidth / 2);
        const drawY = height - (fieldConfig.y * scaleY);

        firstPage.drawText(text, {
            x: drawX,
            y: drawY,
            size: fieldConfig.font_size,
            font,
            color: rgb(r, g, b),
        });
    }
}

export const downloadCertificate = async (req, res) => {
    const { target_type, target_id } = req.params;
    const studentId = req.user.userId;

    try {
        const cert = await prisma.certificates.findFirst({
            where: {
                target_id: GLOBAL_CERTIFICATE_TARGET_ID,
                target_type: GLOBAL_CERTIFICATE_TARGET_TYPE,
            },
        });
        if (!cert) return res.status(404).json({ error: 'Certificate template not configured yet' });

        const { studentName, className } = await resolveStudentDetails(studentId);
        if (!studentName) return res.status(404).json({ error: 'Student details not found' });

        const targetDetails = await resolveTargetDetails(target_type, target_id);
        if (!targetDetails) return res.status(404).json({ error: 'Program or subprogram not found' });

        const grade = await resolveStudentGrade(studentId, targetDetails.subprogramId);
        const fieldValues = buildFieldValues({
            studentName,
            studentId,
            targetDetails,
            grade,
        });
        const fieldsConfig = normalizeFieldsConfig(cert.fields_config, cert);

        const templateBytes = await readStoredFileBuffer(cert.template_url);
        if (!templateBytes) return res.status(404).json({ error: "Template file not found" });

        const templateRef = cert.template_url.toLowerCase();
        const isPdf = templateRef.endsWith(".pdf");

        let pdfDoc;
        let firstPage;

        if (isPdf) {
            pdfDoc = await PDFDocument.load(templateBytes);
            firstPage = pdfDoc.getPages()[0];
        } else {
            pdfDoc = await PDFDocument.create();
            const image = cert.template_url.toLowerCase().endsWith('.png')
                ? await pdfDoc.embedPng(templateBytes)
                : await pdfDoc.embedJpg(templateBytes);
            const { width, height } = image.scale(1);
            firstPage = pdfDoc.addPage([width, height]);
            firstPage.drawImage(image, { x: 0, y: 0, width, height });
        }

        await drawConfiguredFields(firstPage, pdfDoc, fieldsConfig, fieldValues);

        const parsedTargetId = parseInt(target_id);
        const alreadyClaimed = await prisma.issued_certificates.findFirst({
            where: {
                student_id: studentId,
                target_id: parsedTargetId,
                target_type,
            },
        });

        if (!alreadyClaimed) {
            await prisma.issued_certificates.create({
                data: {
                    student_id: studentId,
                    student_name: studentName,
                    target_id: parsedTargetId,
                    target_type,
                    target_name: targetDetails.targetName,
                    class_name: className,
                    certificate_id: cert.id,
                },
            });
        }

        const pdfBytes = await pdfDoc.save();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=Certificate_${targetDetails.targetName.replace(/\s+/g, '_')}_${studentName.replace(/\s+/g, '_')}.pdf`
        );
        res.send(Buffer.from(pdfBytes));
    } catch (err) {
        console.error('Certificate error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const getIssuedCertificates = async (req, res) => {
    try {
        const certs = await prisma.issued_certificates.findMany({ orderBy: { issued_at: 'desc' } });
        res.json(certs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getMyIssuedCertificates = async (req, res) => {
    try {
        const certs = await prisma.issued_certificates.findMany({
            where: { student_id: req.user.userId },
            orderBy: { issued_at: 'desc' },
        });
        res.json(certs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
