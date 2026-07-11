import prisma from '../lib/prisma.js';
import { assertReviewWindowOpen } from './reviewWindowController.js';

const REVIEW_TYPE = 'student';

const toIntOrNull = (value) => {
    if (value === undefined || value === null || value === '') return null;
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
};

const normalizeQuestions = (questions = []) => {
    if (!Array.isArray(questions)) return [];
    return questions
        .map((question, index) => {
            const text = typeof question === 'string' ? question : question?.question_text;
            const id = question?.id || `q_${Date.now()}_${index + 1}`;
            return text?.trim() ? { id: String(id), question_text: text.trim(), is_active: true } : null;
        })
        .filter(Boolean);
};

const BOX_KIND = 'student_review_box';

const parseAssignmentRow = (row) => {
    if (!row?.question_text) return null;
    try {
        const data = JSON.parse(row.question_text);
        if (data?.kind !== BOX_KIND) return null;
        return {
            id: row.id,
            review_type: REVIEW_TYPE,
            title: data.title || '',
            description: data.description || null,
            start_date: data.start_date,
            end_date: data.end_date,
            program_id: toIntOrNull(data.program_id),
            class_id: toIntOrNull(data.class_id),
            course_id: null,
            subprogram_id: toIntOrNull(data.subprogram_id),
            status: row.is_active === false ? 'inactive' : (data.status || 'active'),
            questions: [],
            questionnaire_url: data.questionnaire_url || null,
            created_by: toIntOrNull(data.created_by),
            created_at: row.created_at,
            updated_at: data.updated_at || row.created_at,
        };
    } catch (_err) {
        return null;
    }
};

const buildAssignmentText = (body, existing = {}) => JSON.stringify({
    kind: BOX_KIND,
    title: body.title?.trim() ?? existing.title ?? '',
    description: body.description ?? existing.description ?? null,
    start_date: body.start_date ?? existing.start_date,
    end_date: body.end_date ?? existing.end_date,
    program_id: body.program_id ?? existing.program_id ?? null,
    subprogram_id: body.subprogram_id ?? existing.subprogram_id ?? null,
    class_id: body.class_id ?? existing.class_id ?? null,
    status: body.status ?? existing.status ?? 'active',
    questionnaire_url: body.questionnaire_url ?? existing.questionnaire_url ?? null,
    created_by: body.created_by ?? existing.created_by ?? null,
    updated_at: new Date().toISOString(),
});

const serializeAssignment = async (assignmentOrRow) => {
    const assignment = assignmentOrRow?.question_text ? parseAssignmentRow(assignmentOrRow) : assignmentOrRow;
    if (!assignment) return assignment;
    const [cls, subprogram, program] = await Promise.all([
        assignment.class_id ? prisma.classes.findUnique({ where: { id: assignment.class_id }, include: { courses: true, subprograms: { include: { programs: true } } } }) : null,
        assignment.subprogram_id ? prisma.subprograms.findUnique({ where: { id: assignment.subprogram_id }, include: { programs: true } }) : null,
        assignment.program_id ? prisma.programs.findUnique({ where: { id: assignment.program_id } }) : null,
    ]);
    const response_count = await prisma.student_reviews.count({ where: { assignment_id: assignment.id } });
    const now = new Date();
    const starts = new Date(assignment.start_date);
    const ends = new Date(assignment.end_date);

    return {
        ...assignment,
        class_name: cls?.class_name || null,
        course_name: cls?.courses?.course_title || null,
        subprogram_name: subprogram?.subprogram_name || cls?.subprograms?.subprogram_name || null,
        program_name: program?.title || subprogram?.programs?.title || subprogram?.programs?.program_name || cls?.subprograms?.programs?.title || cls?.subprograms?.programs?.program_name || null,
        response_count,
        computed_status: assignment.status !== 'active' ? assignment.status : now < starts ? 'upcoming' : now > ends ? 'closed' : 'open',
    };
};

const getClassScope = async (classId) => {
    const id = toIntOrNull(classId);
    if (!id) return { classId: null, courseId: null, subprogramId: null, programId: null };
    const cls = await prisma.classes.findUnique({ where: { id }, include: { subprograms: true } });
    return { classId: id, courseId: cls?.course_id || null, subprogramId: cls?.subprogram_id || null, programId: cls?.subprograms?.program_id || null };
};

const assignmentIsOpen = (assignment, now = new Date()) => {
    if (!assignment || assignment.status !== 'active') return false;
    return new Date(assignment.start_date) <= now && new Date(assignment.end_date) >= now;
};

const assignmentSpecificity = (assignment) => [assignment.class_id, assignment.subprogram_id, assignment.program_id].filter(Boolean).length;

const findOpenAssignment = async ({ assignmentId, classId, courseId, subprogramId, programId }) => {
    const now = new Date();
    const id = toIntOrNull(assignmentId);
    if (id) {
        const row = await prisma.student_review_questions.findUnique({ where: { id } });
        const assignment = parseAssignmentRow(row);
        if (!assignmentIsOpen(assignment, now)) {
            const error = new Error('This review box is closed or not available.');
            error.statusCode = 403;
            throw error;
        }
        return assignment;
    }

    const scope = await getClassScope(classId);
    const targetClass = toIntOrNull(classId) || scope.classId;
    const targetSubprogram = toIntOrNull(subprogramId) || scope.subprogramId;
    const targetProgram = toIntOrNull(programId) || scope.programId;

    const rows = await prisma.student_review_questions.findMany({ where: { is_active: true }, orderBy: { created_at: 'desc' } });
    const assignments = rows.map(parseAssignmentRow).filter((assignment) => assignmentIsOpen(assignment, now));
    assignments.sort((a, b) => assignmentSpecificity(b) - assignmentSpecificity(a) || new Date(b.created_at || 0) - new Date(a.created_at || 0));

    return assignments.find((assignment) => {
        const classOk = !assignment.class_id || assignment.class_id === targetClass;
        const subprogramOk = !assignment.subprogram_id || assignment.subprogram_id === targetSubprogram;
        const programOk = !assignment.program_id || assignment.program_id === targetProgram;
        return classOk && subprogramOk && programOk;
    }) || null;
};

const populateReview = async (review) => {
    let student_name = '-';
    let program_name = '-';
    let subprogram_name = '-';
    let teacher_name = '-';
    let class_name = '-';
    let course_name = '-';
    let assignment = null;

    if (review.student_id) {
        const student = await prisma.students.findUnique({ where: { student_id: review.student_id } });
        if (student) {
            student_name = student.full_name || '-';
            program_name = student.chosen_program || '-';
            subprogram_name = student.chosen_subprogram || '-';
        }
    }

    if (review.teacher_id) {
        let teacher = null;
        const teacherInt = parseInt(review.teacher_id, 10);
        if (!Number.isNaN(teacherInt)) teacher = await prisma.teachers.findUnique({ where: { id: teacherInt } });
        if (!teacher) teacher = await prisma.teachers.findFirst({ where: { teacher_id: review.teacher_id } });
        if (teacher) teacher_name = teacher.full_name || '-';
    }

    if (review.class_id) {
        const cls = await prisma.classes.findUnique({ where: { id: review.class_id }, include: { courses: true, subprograms: { include: { programs: true } } } });
        if (cls) {
            class_name = cls.class_name || '-';
            course_name = cls.courses?.course_title || '-';
            program_name = program_name === '-' ? cls.subprograms?.programs?.program_name || '-' : program_name;
            subprogram_name = subprogram_name === '-' ? cls.subprograms?.subprogram_name || '-' : subprogram_name;
        }
    }

    if (review.assignment_id) {
        const found = await prisma.student_review_questions.findUnique({ where: { id: review.assignment_id } });
        assignment = found ? await serializeAssignment(found) : null;
    }

    return { ...review, student_name, program_name, subprogram_name, teacher_name, class_name, course_name, assignment, assignment_title: assignment?.title || '-' };
};

export const submitStudentReview = async (req, res) => {
    try {
        const { student_id, class_id, term_serial, rating, comment, answers, assignment_id } = req.body;
        const teacher_id = req.user.userId;
        if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only teachers or admins can submit student reviews' });
        }

        let assignment = null;
        if (assignment_id) assignment = await findOpenAssignment({ assignmentId: assignment_id, classId: class_id });
        else await assertReviewWindowOpen(REVIEW_TYPE);

        const review = await prisma.student_reviews.create({
            data: {
                teacher_id: String(teacher_id),
                student_id,
                class_id: parseInt(class_id, 10),
                term_serial,
                rating: parseInt(rating, 10),
                comment,
                answers,
                assignment_id: assignment?.id || null,
            },
        });
        res.status(201).json(review);
    } catch (err) {
        if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
        res.status(500).json({ error: err.message });
    }
};

export const getTeacherSubmittedReviews = async (req, res) => {
    try {
        const teacher_id = String(req.user.userId);
        const reviews = await prisma.student_reviews.findMany({ where: { teacher_id } });
        res.json(reviews);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getStudentReviews = async (req, res) => {
    try {
        const student_id = req.params.student_id || req.user.userId;
        const reviews = await prisma.student_reviews.findMany({ where: { student_id }, orderBy: { created_at: 'desc' } });
        res.json(await Promise.all(reviews.map(populateReview)));
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getAllStudentReviews = async (req, res) => {
    try {
        const where = req.query.assignment_id ? { assignment_id: toIntOrNull(req.query.assignment_id) } : {};
        const reviews = await prisma.student_reviews.findMany({ where, orderBy: { created_at: 'desc' } });
        res.json(await Promise.all(reviews.map(populateReview)));
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getActiveStudentReviewAssignment = async (req, res) => {
    try {
        const assignment = await findOpenAssignment(req.query);
        res.json(assignment ? await serializeAssignment(assignment) : null);
    } catch (err) { res.status(err.statusCode || 500).json({ error: err.message }); }
};

export const getStudentReviewAssignments = async (_req, res) => {
    try {
        const rows = await prisma.student_review_questions.findMany({ orderBy: { created_at: 'desc' } });
        const assignments = rows.map(parseAssignmentRow).filter(Boolean);
        res.json(await Promise.all(assignments.map(serializeAssignment)));
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const createStudentReviewAssignment = async (req, res) => {
    try {
        if (!req.body.title?.trim()) return res.status(400).json({ error: 'Name is required' });
        if (!req.body.start_date || !req.body.end_date) return res.status(400).json({ error: 'Start date and end date are required' });

        const row = await prisma.student_review_questions.create({
            data: {
                question_text: buildAssignmentText({ ...req.body, created_by: toIntOrNull(req.user.userId) }),
                is_active: (req.body.status || 'active') === 'active',
            },
        });
        res.status(201).json(await serializeAssignment(row));
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const updateStudentReviewAssignment = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const existingRow = await prisma.student_review_questions.findUnique({ where: { id } });
        const existing = parseAssignmentRow(existingRow);
        if (!existing) return res.status(404).json({ error: 'Review box not found' });

        const row = await prisma.student_review_questions.update({
            where: { id },
            data: {
                question_text: buildAssignmentText(req.body, existing),
                is_active: req.body.status !== undefined ? req.body.status === 'active' : existing.status === 'active',
            },
        });
        res.json(await serializeAssignment(row));
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const deleteStudentReviewAssignment = async (req, res) => {
    try {
        await prisma.student_review_questions.delete({ where: { id: parseInt(req.params.id, 10) } });
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getQuestions = async (req, res) => {
    try {
        const rows = await prisma.student_review_questions.findMany({ where: { is_active: true } });
        res.json(rows.filter((row) => !parseAssignmentRow(row)));
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getAllQuestions = async (req, res) => {
    try {
        const rows = await prisma.student_review_questions.findMany();
        res.json(rows.filter((row) => !parseAssignmentRow(row)));
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const createQuestion = async (req, res) => {
    try {
        const q = await prisma.student_review_questions.create({ data: { question_text: req.body.question_text } });
        res.status(201).json(q);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const updateQuestion = async (req, res) => {
    try {
        const updated = await prisma.student_review_questions.update({ where: { id: parseInt(req.params.id, 10) }, data: req.body });
        res.json(updated);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const deleteQuestion = async (req, res) => {
    try {
        await prisma.student_review_questions.delete({ where: { id: parseInt(req.params.id, 10) } });
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};





