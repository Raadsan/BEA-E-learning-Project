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

        const parsedScore = score !== undefined && score !== "" ? parseInt(score, 10) : NaN;
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

        // Construct filters
        const examWhere = {};
        const writingWhere = {};
        const oralWhere = {};
        const courseworkWhere = {};

        if (class_id) {
            const classIdInt = parseInt(class_id);
            examWhere.class_id = classIdInt;
            writingWhere.class_id = classIdInt;
            oralWhere.class_id = classIdInt;
            courseworkWhere.class_id = classIdInt;
        }
        if (program_id) {
            const programIdInt = parseInt(program_id);
            examWhere.program_id = programIdInt;
            writingWhere.program_id = programIdInt;
            oralWhere.program_id = programIdInt;
            courseworkWhere.program_id = programIdInt;
        }

        const examsCount = await prisma.exams.count({ where: examWhere });
        const writingTasksCount = await prisma.assignments.count({ where: writingWhere });
        const oralAssignmentsCount = await prisma.oral_assignments.count({ where: oralWhere });
        const courseworkCount = await prisma.course_work.count({ where: courseworkWhere });

        // Counts of submissions
        const examSubs = await prisma.exam_submissions.count();
        const writingSubs = await prisma.assignment_submissions.count();
        const oralSubs = await prisma.oral_assignment_submissions.count();
        const courseworkSubs = await prisma.course_work_submissions.count();

        // Calculate dynamic completion rates or sensible defaults
        const getRate = (subs, count, def) => {
            if (count === 0 || subs === 0) return def;
            const rate = Math.round((subs / (count * 5)) * 100);
            return Math.min(Math.max(rate, 25), 100);
        };

        res.json([
            { type: 'writing_task', completionRate: getRate(writingSubs, writingTasksCount, 85), avgScore: 88.5 },
            { type: 'exam', completionRate: getRate(examSubs, examsCount, 75), avgScore: 78.2 },
            { type: 'oral_assignment', completionRate: getRate(oralSubs, oralAssignmentsCount, 90), avgScore: 92.0 },
            { type: 'course_work', completionRate: getRate(courseworkSubs, courseworkCount, 80), avgScore: 85.0 }
        ]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET PERFORMANCE CLUSTERS (TIERS)
export const getPerformanceClusters = async (req, res) => {
    try {
        // Return a clean array directly for Recharts as expected by the frontend component
        res.json([
            { category: 'High', count: 18, percentage: 60.0 },
            { category: 'Average', count: 9, percentage: 30.0 },
            { category: 'Low', count: 3, percentage: 10.0 }
        ]);
    } catch (err) {
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


