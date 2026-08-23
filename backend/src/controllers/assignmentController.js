import prisma from '../lib/prisma.js';
import { getStoredFileUrl } from '../utils/fileStorage.js';

const parseWritingTaskRequirements = (raw, submissionFormat) => {
    let text = "";
    let attachment_url = submissionFormat || null;
    let attachment_name = null;

    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === "object" && ("text" in parsed || "attachment_url" in parsed)) {
                text = String(parsed.text || "");
                attachment_url = parsed.attachment_url || attachment_url;
                attachment_name = parsed.attachment_name || null;
            } else {
                text = String(raw);
            }
        } catch {
            text = String(raw);
        }
    }

    if (attachment_url && !attachment_name) {
        attachment_name = attachment_url.split("/").pop() || "Attachment";
    }

    return { requirements_text: text, attachment_url, attachment_name };
};

const enrichWritingTaskAssignment = (assignment) => {
    const meta = parseWritingTaskRequirements(assignment.requirements, assignment.submission_format);
    return {
        ...assignment,
        requirements_text: meta.requirements_text,
        attachment_url: meta.attachment_url,
        attachment_name: meta.attachment_name,
    };
};

const parseEmbeddedFeedbackFile = (feedback) => {
    if (!feedback || typeof feedback !== "string") {
        return { feedback_text: feedback || "", file_url: null, essay_marks: null };
    }
    // Extract embedded file reference
    const fileMatch = feedback.match(/(?:^|\n\n?)Feedback file:\s*(\S+)/i);
    const file_url = fileMatch ? fileMatch[1].trim() : null;
    let text = fileMatch ? feedback.replace(/\n?\n?Feedback file:\s*\S+/i, "").trim() : feedback;

    // Extract embedded essay marks JSON tag (stored as __essay_marks__:{...} on its own line)
    const marksIdx = text.indexOf("__essay_marks__:");
    let essay_marks = null;
    if (marksIdx !== -1) {
        const jsonStr = text.slice(marksIdx + "__essay_marks__:".length).split("\n")[0].trim();
        try { essay_marks = JSON.parse(jsonStr); } catch { /* ignore */ }
        text = text.slice(0, marksIdx).trimEnd() + text.slice(marksIdx).replace(/^__essay_marks__:[^\n]*/m, "").trimStart();
        text = text.trim();
    }

    return { feedback_text: text, file_url, essay_marks };
};

const parseSubmissionMeta = (value) => {
    if (!value || typeof value !== "string") return null;
    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
};

const tableMapping = {
    'writing_task': { main: 'assignments', sub: 'assignment_submissions' },
    'exam': { main: 'exams', sub: 'exam_submissions' },
    'oral_assignment': { main: 'oral_assignments', sub: 'oral_assignment_submissions' },
    'course_work': { main: 'course_work', sub: 'course_work_submissions' }
};

const TYPES_WITH_SUBPROGRAM = new Set(['exam', 'oral_assignment', 'course_work']);
/** Models where class_id is required (non-nullable) — cannot use class_id: null in filters. */
const TYPES_WITH_REQUIRED_CLASS = new Set(['writing_task', 'course_work', 'oral_assignment']);

const resolveSubprogramId = (subprogram_id, class_id, classSubprogramMap, allSubprograms) => {
    if (subprogram_id !== undefined && subprogram_id !== null && subprogram_id !== '') {
        const numeric = parseInt(subprogram_id, 10);
        if (!Number.isNaN(numeric)) return numeric;

        const name = String(subprogram_id).trim();
        const byName = allSubprograms.find(
            (sp) =>
                sp.subprogram_name === name ||
                sp.subprogram_name?.toLowerCase() === name.toLowerCase()
        );
        if (byName) return byName.id;
    }

    if (class_id) {
        const classIdInt = parseInt(class_id, 10);
        if (!Number.isNaN(classIdInt) && classSubprogramMap[classIdInt]) {
            return classSubprogramMap[classIdInt];
        }
    }

    return null;
};

const buildStudentAssignmentWhere = (type, class_id, resolvedSubprogramId) => {
    const where = { status: 'active' };
    const and = [];
    const classIdInt = class_id ? parseInt(class_id, 10) : NaN;

    if (!Number.isNaN(classIdInt)) {
        if (TYPES_WITH_REQUIRED_CLASS.has(type)) {
            where.class_id = classIdInt;
        } else {
            // exams may have null class_id for program-wide assignments
            and.push({
                OR: [{ class_id: classIdInt }, { class_id: null }],
            });
        }
    }

    if (TYPES_WITH_SUBPROGRAM.has(type) && resolvedSubprogramId) {
        and.push({
            OR: [{ subprogram_id: resolvedSubprogramId }, { subprogram_id: null }],
        });
    }

    if (and.length > 0) where.AND = and;
    return where;
};

// GET ASSIGNMENTS
export const getAssignments = async (req, res) => {
    try {
        let { class_id, program_id, subprogram_id, type, created_by } = req.query;
        const { userId, role } = req.user;

        const typesToQuery = type ? [type] : Object.keys(tableMapping);
        let allAssignments = [];

        // Fetch all classes, programs, and subprograms to map names manually
        const allClasses = await prisma.classes.findMany({
            select: { id: true, class_name: true, subprogram_id: true }
        });
        const allPrograms = await prisma.programs.findMany({
            select: { id: true, title: true }
        });
        const allSubprograms = await prisma.subprograms.findMany({
            select: { id: true, subprogram_name: true }
        });

        const classMap = {};
        const classSubprogramMap = {};
        allClasses.forEach(c => { 
            classMap[c.id] = c.class_name; 
            classSubprogramMap[c.id] = c.subprogram_id;
        });

        const programMap = {};
        allPrograms.forEach(p => { programMap[p.id] = p.title; });

        const subprogramMap = {};
        allSubprograms.forEach(sp => { subprogramMap[sp.id] = sp.subprogram_name; });

        const resolvedSubprogramId =
            role === 'student'
                ? resolveSubprogramId(subprogram_id, class_id, classSubprogramMap, allSubprograms)
                : null;

        for (const t of typesToQuery) {
            const modelName = tableMapping[t]?.main;
            const subModelName = tableMapping[t]?.sub;
            if (!modelName) continue;

            const where = {};
            if (role === 'student') {
                Object.assign(
                    where,
                    buildStudentAssignmentWhere(t, class_id, resolvedSubprogramId)
                );
            } else {
                if (class_id) where.class_id = parseInt(class_id);
                if (program_id) where.program_id = parseInt(program_id);
                if (subprogram_id) where.subprogram_id = parseInt(subprogram_id);
                if (created_by) where.created_by = parseInt(created_by);
            }

            const assignments = await prisma[modelName].findMany({
                where,
                orderBy: { created_at: 'desc' }
            });

            // Map class, program, and subprogram names
            const mappedAssignments = assignments.map(a => {
                const spId = a.subprogram_id || classSubprogramMap[a.class_id];
                const base = {
                    ...a,
                    class_name: classMap[a.class_id] || "General",
                    program_name: programMap[a.program_id] || "N/A",
                    subprogram_name: subprogramMap[spId] || "N/A"
                };
                return t === 'writing_task' ? enrichWritingTaskAssignment(base) : base;
            });

            // If student, also fetch their submissions for these assignments
            if (role === 'student') {
                for (let a of mappedAssignments) {
                    const submission = await prisma[subModelName].findUnique({
                        where: {
                            assignment_id_student_id: {
                                assignment_id: a.id,
                                student_id: userId
                            }
                        }
                    });
                    a.submission = submission;
                    // Flatten submission fields for easy frontend access
                    if (submission) {
                        const submissionMeta = parseSubmissionMeta(submission.content);
                        const reopenWindow = submissionMeta?.reopenWindow;
                        if (submission.status === 'pending' && reopenWindow) {
                            if (reopenWindow.start_date) a.start_date = reopenWindow.start_date;
                            if (reopenWindow.end_date) a.due_date = reopenWindow.end_date;
                        }
                        a.submission_status = submission.status;
                        a.score = submission.score;
                        const parsedFeedback = parseEmbeddedFeedbackFile(submission.feedback);
                        a.feedback = parsedFeedback.feedback_text || submission.feedback;
                        a.essay_marks = parsedFeedback.essay_marks;
                        a.file_url = submission.file_url;
                        a.student_content = submission.content;
                        a.feedback_file_url = submission.feedback_file_url || parsedFeedback.file_url;
                        a.feedback_file = a.feedback_file_url;
                        a.submission_date = submission.submission_date;
                        a.is_auto_submit = submission.is_auto_submit;
                        a.graded_at = submission.status === 'graded'
                            ? (submission.updated_at || submission.submission_date)
                            : null;
                    } else {
                        a.submission_status = null;
                    }
                }
            }

            allAssignments = [...allAssignments, ...mappedAssignments.map(a => ({ ...a, type: t }))];

        }

        allAssignments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        res.json(allAssignments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// CREATE ASSIGNMENT
export const createAssignment = async (req, res) => {
    try {
        const { type, ...data } = req.body;
        const modelName = tableMapping[type]?.main;
        if (!modelName) return res.status(400).json({ error: "Invalid type" });

        // Clean data and parse integers
        const prismaData = {
            title: data.title,
            description: data.description,
            class_id: data.class_id ? parseInt(data.class_id) : null,
            program_id: data.program_id ? parseInt(data.program_id) : null,
            due_date: data.due_date ? new Date(data.due_date) : null,
            total_points: data.total_points ? parseInt(data.total_points) : 0,
            status: data.status || 'active',
            created_by: parseInt(req.user.userId)
        };

        if (type === 'writing_task') {
            let requirementsPayload = data.requirements;
            if (data.attachment_url) {
                requirementsPayload = JSON.stringify({
                    text: data.requirements || "",
                    attachment_url: data.attachment_url,
                    attachment_name: data.attachment_name || null,
                });
            }
            const meta = parseWritingTaskRequirements(requirementsPayload, data.attachment_url || null);
            prismaData.requirements = requirementsPayload;
            prismaData.word_count = data.word_count ? parseInt(data.word_count) : null;
            prismaData.start_date = data.start_date ? new Date(data.start_date) : null;
            prismaData.duration = data.duration ? parseInt(data.duration) : null;
            if (meta.attachment_url) {
                prismaData.submission_format = String(meta.attachment_url).slice(0, 100);
            }
        } else if (['exam', 'oral_assignment', 'course_work'].includes(type)) {
            prismaData.subprogram_id = data.subprogram_id ? parseInt(data.subprogram_id) : null;
            prismaData.questions = data.questions ? (typeof data.questions === 'string' ? data.questions : JSON.stringify(data.questions)) : null;
            prismaData.start_date = data.start_date ? new Date(data.start_date) : null;
            if (type === 'exam') {
                prismaData.end_date = data.end_date ? new Date(data.end_date) : null;
                prismaData.duration = data.duration ? parseInt(data.duration) : null;
                prismaData.instructions = data.instructions ? String(data.instructions) : null;
            } else if (type === 'oral_assignment' || type === 'course_work') {
                prismaData.duration = data.duration ? parseInt(data.duration) : null;
                if (type === 'oral_assignment' && data.submission_type) {
                    prismaData.submission_type = data.submission_type;
                }
            }
            if (type === 'course_work' && data.unit) {
                prismaData.unit = data.unit;
            }
        }

        const created = await prisma[modelName].create({ data: prismaData });
        res.status(201).json({ message: "Created", assignment: created });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// SUBMIT ASSIGNMENT
export const submitAssignment = async (req, res) => {
    try {
        const { assignment_id, content, type, is_auto_submit } = req.body;
        const student_id = req.user.userId;
        const subModelName = tableMapping[type]?.sub;
        if (!subModelName) return res.status(400).json({ error: "Invalid type" });

        const file_url = req.file ? getStoredFileUrl(req.file) : null;
        const autoSubmitted = is_auto_submit === true || is_auto_submit === 'true';

        if (!assignment_id || !type) {
            return res.status(400).json({ error: "Assignment id and type are required" });
        }

        const existing = await prisma[subModelName].findUnique({
            where: {
                assignment_id_student_id: {
                    assignment_id: parseInt(assignment_id, 10),
                    student_id,
                },
            },
        });

        if (existing) {
            if (existing.status === "graded") {
                return res.status(403).json({ error: "This assignment has already been graded and cannot be changed." });
            }
            if (existing.status === "submitted") {
                const meta = parseSubmissionMeta(existing.content);
                const isReopened = meta?.reopened_for_resubmission === true;
                if (!isReopened) {
                    return res.json({ message: "Already submitted", submission: existing });
                }
            }
        }

        const parsedContent = typeof content === 'object' ? JSON.stringify(content) : (content ?? '');
        const submissionPayload = {
            content: parsedContent,
            file_url: file_url || undefined,
            submission_date: new Date(),
            status: 'submitted',
        };

        // Only legacy writing_task submissions table has is_auto_submit
        if (subModelName === 'assignment_submissions') {
            submissionPayload.is_auto_submit = autoSubmitted;
        }

        const submission = await prisma[subModelName].upsert({
            where: {
                assignment_id_student_id: {
                    assignment_id: parseInt(assignment_id),
                    student_id
                }
            },
            update: submissionPayload,
            create: {
                assignment_id: parseInt(assignment_id),
                student_id,
                ...submissionPayload,
                file_url,
            }
        });

        res.json({ message: "Submitted successfully", submission });
    } catch (err) {
        console.error("Submit assignment error:", err);
        res.status(500).json({ error: err.message || "Failed to submit assignment" });
    }
};

// GRADE SUBMISSION
export const gradeSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const { score, feedback, type, essay_marks, oral_marks } = req.body;
        const subModelName = tableMapping[type]?.sub;
        if (!subModelName) return res.status(400).json({ error: "Invalid type" });

        const parsedScore = score !== undefined && score !== "" ? parseFloat(score) : NaN;
        if (Number.isNaN(parsedScore) || parsedScore < 0) {
            return res.status(400).json({ error: "Valid score is required" });
        }

        let feedbackText = feedback?.trim() || null;

        // Embed essay_marks into feedback text for exam submissions (no extra column needed)
        if (essay_marks && (subModelName === "exam_submissions" || subModelName === "oral_assignment_submissions")) {
            let marksObj;
            try { marksObj = typeof essay_marks === 'string' ? JSON.parse(essay_marks) : essay_marks; } catch { marksObj = null; }
            if (marksObj && Object.keys(marksObj).length > 0) {
                const marksTag = `__essay_marks__:${JSON.stringify(marksObj)}`;
                feedbackText = feedbackText ? `${feedbackText}\n${marksTag}` : marksTag;
            }
        }

        const updateData = {
            score: parsedScore,
            feedback: feedbackText,
            status: "graded",
        };

        if (req.file) {
            const filePath = getStoredFileUrl(req.file);
            if (subModelName === "assignment_submissions") {
                updateData.feedback = updateData.feedback
                    ? `${updateData.feedback}\n\nFeedback file: ${filePath}`
                    : `Feedback file: ${filePath}`;
            } else {
                updateData.feedback_file_url = filePath;
            }
        }

        const updated = await prisma[subModelName].update({
            where: { id: parseInt(id, 10) },
            data: updateData,
        });

        // Parse back so response reflects clean data
        const parsed = parseEmbeddedFeedbackFile(updated.feedback);
        res.json({
            message: "Graded successfully",
            submission: {
                ...updated,
                feedback: parsed.feedback_text,
                essay_marks: parsed.essay_marks,
            }
        });
    } catch (err) {
        if (err?.code === "P2025") {
            return res.status(404).json({ error: "Submission not found" });
        }
        res.status(500).json({ error: err.message });
    }
};

// GET ASSIGNMENT ANALYTICAL STATS
export const getAssignmentStats = async (req, res) => {
    try {
        const { program_id, class_id } = req.query;
        const user = req.user;

        // Construct filters
        const examWhere = {};
        const writingWhere = {};
        const oralWhere = {};
        const courseworkWhere = {};
        const studentWhere = {};

        if (class_id) {
            const classIdInt = parseInt(class_id, 10);
            examWhere.class_id = classIdInt;
            writingWhere.class_id = classIdInt;
            oralWhere.class_id = classIdInt;
            courseworkWhere.class_id = classIdInt;
            studentWhere.class_id = classIdInt;
        } else if (user && user.role === 'teacher') {
            // Scope to teacher's assigned classes when no specific class_id filter is passed
            const teacherClasses = await prisma.classes.findMany({
                where: { teacher_id: parseInt(user.userId, 10) },
                select: { id: true }
            });
            const teacherClassIds = teacherClasses.map(c => c.id);
            if (teacherClassIds.length > 0) {
                examWhere.class_id = { in: teacherClassIds };
                writingWhere.class_id = { in: teacherClassIds };
                oralWhere.class_id = { in: teacherClassIds };
                courseworkWhere.class_id = { in: teacherClassIds };
                studentWhere.class_id = { in: teacherClassIds };
            } else {
                return res.json([
                    { type: 'writing_task', completionRate: 0, avgScore: 0 },
                    { type: 'exam', completionRate: 0, avgScore: 0 },
                    { type: 'oral_assignment', completionRate: 0, avgScore: 0 },
                    { type: 'course_work', completionRate: 0, avgScore: 0 }
                ]);
            }
        }

        if (program_id) {
            const programIdInt = parseInt(program_id, 10);
            examWhere.program_id = programIdInt;
            writingWhere.program_id = programIdInt;
            oralWhere.program_id = programIdInt;
            courseworkWhere.program_id = programIdInt;

            const prog = await prisma.programs.findUnique({ where: { id: programIdInt } });
            if (prog) {
                studentWhere.OR = [
                    { chosen_program: prog.title },
                    { chosen_program: String(programIdInt) }
                ];
            }
        }

        const totalStudents = await prisma.students.count({ where: studentWhere }) || 1;

        // 1. Writing Tasks
        const writingTasks = await prisma.assignments.findMany({
            where: writingWhere,
            select: { id: true, total_points: true }
        });
        const writingIds = writingTasks.map(t => t.id);
        const writingSubs = writingIds.length > 0
            ? await prisma.assignment_submissions.findMany({
                where: { assignment_id: { in: writingIds } },
                select: { score: true, assignment_id: true }
            })
            : [];
        const writingPointsMap = new Map(writingTasks.map(t => [t.id, t.total_points || 100]));
        const writingScores = writingSubs.filter(s => s.score !== null).map(s => {
            const maxPts = writingPointsMap.get(s.assignment_id) || 100;
            return (Number(s.score) / maxPts) * 100;
        });
        const writingExpected = writingTasks.length * totalStudents;
        const writingCompletion = writingExpected > 0 ? Math.min(100, Math.round((writingSubs.length / writingExpected) * 100)) : 0;
        const writingAvgScore = (writingTasks.length > 0 && writingScores.length > 0)
            ? Number((writingScores.reduce((a, b) => a + b, 0) / writingScores.length).toFixed(1))
            : 0;

        // 2. Exams
        const examTasks = await prisma.exams.findMany({
            where: examWhere,
            select: { id: true, total_points: true }
        });
        const examIds = examTasks.map(t => t.id);
        const examSubs = examIds.length > 0
            ? await prisma.exam_submissions.findMany({
                where: { assignment_id: { in: examIds } },
                select: { score: true, assignment_id: true }
            })
            : [];
        const examPointsMap = new Map(examTasks.map(t => [t.id, t.total_points || 100]));
        const examScores = examSubs.filter(s => s.score !== null).map(s => {
            const maxPts = examPointsMap.get(s.assignment_id) || 100;
            return (Number(s.score) / maxPts) * 100;
        });
        const examExpected = examTasks.length * totalStudents;
        const examCompletion = examExpected > 0 ? Math.min(100, Math.round((examSubs.length / examExpected) * 100)) : 0;
        const examAvgScore = (examTasks.length > 0 && examScores.length > 0)
            ? Number((examScores.reduce((a, b) => a + b, 0) / examScores.length).toFixed(1))
            : 0;

        // 3. Oral Assignments
        const oralTasks = await prisma.oral_assignments.findMany({
            where: oralWhere,
            select: { id: true, total_points: true }
        });
        const oralIds = oralTasks.map(t => t.id);
        const oralSubs = oralIds.length > 0
            ? await prisma.oral_assignment_submissions.findMany({
                where: { assignment_id: { in: oralIds } },
                select: { score: true, assignment_id: true }
            })
            : [];
        const oralPointsMap = new Map(oralTasks.map(t => [t.id, t.total_points || 100]));
        const oralScores = oralSubs.filter(s => s.score !== null).map(s => {
            const maxPts = oralPointsMap.get(s.assignment_id) || 100;
            return (Number(s.score) / maxPts) * 100;
        });
        const oralExpected = oralTasks.length * totalStudents;
        const oralCompletion = oralExpected > 0 ? Math.min(100, Math.round((oralSubs.length / oralExpected) * 100)) : 0;
        const oralAvgScore = (oralTasks.length > 0 && oralScores.length > 0)
            ? Number((oralScores.reduce((a, b) => a + b, 0) / oralScores.length).toFixed(1))
            : 0;

        // 4. Coursework
        const courseworkTasks = await prisma.course_work.findMany({
            where: courseworkWhere,
            select: { id: true, total_points: true }
        });
        const courseworkIds = courseworkTasks.map(t => t.id);
        const courseworkSubs = courseworkIds.length > 0
            ? await prisma.course_work_submissions.findMany({
                where: { assignment_id: { in: courseworkIds } },
                select: { score: true, assignment_id: true }
            })
            : [];
        const courseworkPointsMap = new Map(courseworkTasks.map(t => [t.id, t.total_points || 100]));
        const courseworkScores = courseworkSubs.filter(s => s.score !== null).map(s => {
            const maxPts = courseworkPointsMap.get(s.assignment_id) || 100;
            return (Number(s.score) / maxPts) * 100;
        });
        const courseworkExpected = courseworkTasks.length * totalStudents;
        const courseworkCompletion = courseworkExpected > 0 ? Math.min(100, Math.round((courseworkSubs.length / courseworkExpected) * 100)) : 0;
        const courseworkAvgScore = (courseworkTasks.length > 0 && courseworkScores.length > 0)
            ? Number((courseworkScores.reduce((a, b) => a + b, 0) / courseworkScores.length).toFixed(1))
            : 0;

        res.json([
            { type: 'writing_task', completionRate: writingCompletion, avgScore: writingAvgScore },
            { type: 'exam', completionRate: examCompletion, avgScore: examAvgScore },
            { type: 'oral_assignment', completionRate: oralCompletion, avgScore: oralAvgScore },
            { type: 'course_work', completionRate: courseworkCompletion, avgScore: courseworkAvgScore }
        ]);
    } catch (err) {
        console.error("getAssignmentStats error:", err);
        res.status(500).json({ error: err.message });
    }
};

// GET PERFORMANCE CLUSTERS (TIERS)
export const getPerformanceClusters = async (req, res) => {
    try {
        const { program_id, class_id } = req.query;
        const studentWhere = {};
        if (class_id) studentWhere.class_id = parseInt(class_id);
        if (program_id) {
            const progId = parseInt(program_id);
            const prog = await prisma.programs.findUnique({ where: { id: progId } });
            if (prog) {
                studentWhere.OR = [
                    { chosen_program: prog.title },
                    { chosen_program: String(progId) }
                ];
            }
        }

        const students = await prisma.students.findMany({
            where: studentWhere,
            select: { student_id: true }
        });

        if (students.length === 0) {
            return res.json([
                { category: 'High', count: 0, percentage: 0 },
                { category: 'Average', count: 0, percentage: 0 },
                { category: 'Low', count: 0, percentage: 0 }
            ]);
        }

        const studentIds = students.map(s => s.student_id);

        const [writingSubs, examSubs, oralSubs, cwSubs] = await Promise.all([
            prisma.assignment_submissions.findMany({
                where: { student_id: { in: studentIds }, score: { not: null } },
                include: { assignments: { select: { total_points: true } } }
            }),
            prisma.exam_submissions.findMany({
                where: { student_id: { in: studentIds }, score: { not: null } },
                include: { exams: { select: { total_points: true } } }
            }),
            prisma.oral_assignment_submissions.findMany({
                where: { student_id: { in: studentIds }, score: { not: null } },
                include: { oral_assignments: { select: { total_points: true } } }
            }),
            prisma.course_work_submissions.findMany({
                where: { student_id: { in: studentIds }, score: { not: null } },
                include: { course_work: { select: { total_points: true } } }
            })
        ]);

        const studentScoresMap = {};
        const pushScore = (studentId, score, maxPoints) => {
            if (!studentId || score === null) return;
            if (!studentScoresMap[studentId]) studentScoresMap[studentId] = [];
            const maxPts = maxPoints || 100;
            studentScoresMap[studentId].push((Number(score) / maxPts) * 100);
        };

        writingSubs.forEach(s => pushScore(s.student_id, s.score, s.assignments?.total_points));
        examSubs.forEach(s => pushScore(s.student_id, s.score, s.exams?.total_points));
        oralSubs.forEach(s => pushScore(s.student_id, s.score, s.oral_assignments?.total_points));
        cwSubs.forEach(s => pushScore(s.student_id, s.score, s.course_work?.total_points));

        let highCount = 0;
        let avgCount = 0;
        let lowCount = 0;

        students.forEach(s => {
            const scores = studentScoresMap[s.student_id];
            if (!scores || scores.length === 0) {
                // If no submissions, not counted in low or counted according to baseline
                return;
            }
            const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
            if (avg >= 80) highCount++;
            else if (avg >= 60) avgCount++;
            else lowCount++;
        });

        const totalActive = highCount + avgCount + lowCount;
        const total = totalActive > 0 ? totalActive : students.length;

        const highPct = total > 0 ? Number(((highCount / total) * 100).toFixed(1)) : 0;
        const avgPct = total > 0 ? Number(((avgCount / total) * 100).toFixed(1)) : 0;
        const lowPct = total > 0 ? Number(((lowCount / total) * 100).toFixed(1)) : 0;

        res.json([
            { category: 'High', count: highCount, percentage: highPct },
            { category: 'Average', count: avgCount, percentage: avgPct },
            { category: 'Low', count: lowCount, percentage: lowPct }
        ]);
    } catch (err) {
        console.error("getPerformanceClusters error:", err);
        res.status(500).json({ error: err.message });
    }
};

export const reopenSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, start_date, end_date } = req.body;
        const subModelName = tableMapping[type]?.sub;
        if (!subModelName) return res.status(400).json({ error: "Invalid type" });

        const reopenWindow = {
            start_date: start_date || null,
            end_date: end_date || null,
        };

        const reopenData = {
            status: "pending",
            score: null,
            feedback: null,
            file_url: null,
            content: JSON.stringify({
                reopened_for_resubmission: true,
                reopenWindow,
            }),
            submission_date: null,
        };

        if (subModelName === "assignment_submissions") {
            reopenData.is_auto_submit = false;
        } else if (subModelName === "course_work_submissions" || subModelName === "exam_submissions" || subModelName === "oral_assignment_submissions") {
            reopenData.feedback_file_url = null;
        }

        const updated = await prisma[subModelName].update({
            where: { id: parseInt(id, 10) },
            data: reopenData,
        });

        res.json({ message: "Submission reopened successfully", submission: updated });
    } catch (err) {
        res.status(500).json({ error: err.message || "Failed to reopen submission" });
    }
};

// GET ASSIGNMENT SUBMISSIONS BY ASSIGNMENT ID
export const getAssignmentSubmissions = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.query;

        const subModelName = tableMapping[type]?.sub;
        if (!subModelName) return res.status(400).json({ error: "Invalid type" });

        const submissions = await prisma[subModelName].findMany({
            where: { assignment_id: parseInt(id) },
            orderBy: { submission_date: 'desc' }
        });

        // Map student names manually
        const studentIds = [...new Set(submissions.map(s => s.student_id).filter(Boolean))];
        const students = await prisma.students.findMany({
            where: { student_id: { in: studentIds } },
            select: { student_id: true, full_name: true, email: true }
        });

        const studentMap = {};
        students.forEach(s => {
            studentMap[s.student_id] = s.full_name || s.email || s.student_id;
        });

        const mappedSubmissions = submissions.map(s => {
            const parsed = parseEmbeddedFeedbackFile(s.feedback);
            return {
                ...s,
                feedback: parsed.feedback_text,
                essay_marks: parsed.essay_marks,
                score: s.score !== null && s.score !== undefined ? Number(s.score) : null,
                student_name: studentMap[s.student_id] || s.student_id || "Unknown Student",
                student: { full_name: studentMap[s.student_id] || s.student_id || "Unknown Student" }
            };
        });

        res.json(mappedSubmissions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET ALL SUBMISSIONS
export const getAllSubmissions = async (req, res) => {
    try {
        const { type } = req.query;

        const subModelName = tableMapping[type]?.sub;
        if (!subModelName) return res.status(400).json({ error: "Invalid type" });

        const submissions = await prisma[subModelName].findMany({
            orderBy: { submission_date: 'desc' }
        });

        // Map student names manually
        const studentIds = [...new Set(submissions.map(s => s.student_id).filter(Boolean))];
        const students = await prisma.students.findMany({
            where: { student_id: { in: studentIds } },
            select: { student_id: true, full_name: true, email: true }
        });

        const studentMap = {};
        students.forEach(s => {
            studentMap[s.student_id] = s.full_name || s.email || s.student_id;
        });

        const mappedSubmissions = submissions.map(s => {
            const parsed = parseEmbeddedFeedbackFile(s.feedback);
            return {
                ...s,
                feedback: parsed.feedback_text,
                essay_marks: parsed.essay_marks,
                score: s.score !== null && s.score !== undefined ? Number(s.score) : null,
                student_name: studentMap[s.student_id] || s.student_id || "Unknown Student",
                student: { full_name: studentMap[s.student_id] || s.student_id || "Unknown Student" }
            };
        });

        res.json(mappedSubmissions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE ASSIGNMENT
export const updateAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, ...data } = req.body;
        const modelName = tableMapping[type]?.main;
        if (!modelName) return res.status(400).json({ error: "Invalid type" });

        // Clean and prepare update payload
        const prismaData = {
            title: data.title,
            description: data.description,
            class_id: data.class_id ? parseInt(data.class_id) : undefined,
            program_id: data.program_id ? parseInt(data.program_id) : undefined,
            due_date: data.due_date ? new Date(data.due_date) : null,
            total_points: data.total_points ? parseInt(data.total_points) : undefined,
            status: data.status || undefined,
        };

        if (type === 'writing_task') {
            let requirementsPayload = data.requirements;
            if (data.attachment_url !== undefined) {
                requirementsPayload = JSON.stringify({
                    text: typeof data.requirements === "string" && !data.requirements.startsWith("{")
                        ? data.requirements
                        : parseWritingTaskRequirements(data.requirements, null).requirements_text,
                    attachment_url: data.attachment_url || null,
                    attachment_name: data.attachment_name || null,
                });
            }
            const meta = parseWritingTaskRequirements(requirementsPayload, data.attachment_url || null);
            prismaData.requirements = requirementsPayload;
            prismaData.word_count = data.word_count ? parseInt(data.word_count) : undefined;
            prismaData.start_date = data.start_date ? new Date(data.start_date) : null;
            prismaData.duration = data.duration ? parseInt(data.duration) : null;
            if (meta.attachment_url) {
                prismaData.submission_format = String(meta.attachment_url).slice(0, 100);
            } else if (data.attachment_url === null || data.attachment_url === "") {
                prismaData.submission_format = null;
            }
        } else if (['exam', 'oral_assignment', 'course_work'].includes(type)) {
            prismaData.subprogram_id = data.subprogram_id ? parseInt(data.subprogram_id) : undefined;
            prismaData.questions = data.questions ? (typeof data.questions === 'string' ? data.questions : JSON.stringify(data.questions)) : undefined;
            prismaData.start_date = data.start_date ? new Date(data.start_date) : null;
            if (type === 'exam') {
                prismaData.end_date = data.end_date ? new Date(data.end_date) : null;
                prismaData.duration = data.duration ? parseInt(data.duration) : undefined;
                if (data.instructions !== undefined) prismaData.instructions = data.instructions ? String(data.instructions) : null;
            } else if (type === 'oral_assignment' || type === 'course_work') {
                prismaData.duration = data.duration ? parseInt(data.duration) : undefined;
                if (type === 'oral_assignment' && data.submission_type) {
                    prismaData.submission_type = data.submission_type;
                }
            }
            if (type === 'course_work' && data.unit !== undefined) {
                prismaData.unit = data.unit || null;
            }
        }

        const updated = await prisma[modelName].update({
            where: { id: parseInt(id) },
            data: prismaData
        });

        res.json({ message: "Updated successfully", assignment: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE ASSIGNMENT
export const deleteAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.query;
        const modelName = tableMapping[type]?.main;
        if (!modelName) return res.status(400).json({ error: "Invalid type" });

        await prisma[modelName].delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


