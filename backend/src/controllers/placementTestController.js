import prisma from '../lib/prisma.js';

export const createPlacementTest = async (req, res) => {
    try {
        const test = await prisma.placement_tests.create({ data: req.body });
        res.status(201).json(test);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAllPlacementTests = async (req, res) => {
    try {
        const tests = await prisma.placement_tests.findMany();
        res.json(tests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getPlacementTestById = async (req, res) => {
    try {
        const test = await prisma.placement_tests.findUnique({
            where: { id: parseInt(req.params.id) }
        });
        if (!test) return res.status(404).json({ error: "Not found" });
        res.json(test);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updatePlacementTest = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) {
            return res.status(400).json({ error: "Invalid placement test ID" });
        }

        const existing = await prisma.placement_tests.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ error: "Placement test not found" });
        }

        const { title, description, duration_minutes, questions, status } = req.body;
        const updated = await prisma.placement_tests.update({
            where: { id },
            data: {
                title,
                description,
                duration_minutes:
                    duration_minutes === undefined || duration_minutes === null
                        ? undefined
                        : Number(duration_minutes),
                questions,
                status,
            },
        });

        res.json(updated);
    } catch (err) {
        console.error("Update placement test error:", err);
        res.status(500).json({ error: err.message });
    }
};

export const deletePlacementTest = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id)) {
            return res.status(400).json({ error: "Invalid placement test ID" });
        }

        const existing = await prisma.placement_tests.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ error: "Placement test not found" });
        }

        await prisma.$transaction([
            prisma.placement_test_results.deleteMany({ where: { test_id: id } }),
            prisma.placement_tests.delete({ where: { id } }),
        ]);

        res.json({ message: "Placement test deleted successfully" });
    } catch (err) {
        console.error("Delete placement test error:", err);
        res.status(500).json({ error: err.message });
    }
};

const scorePlacementAnswers = (questions, answers) => {
    let score = 0;
    let total_questions = 0;
    let hasEssay = false;

    const list = Array.isArray(questions) ? questions : [];

    list.forEach((q) => {
        if (q.type === "mcq" || q.type === "multiple_choice") {
            const points = Number(q.points) || 1;
            total_questions += points;
            const correct = q.options?.[q.correctOption];
            if (answers[q.id] === correct) score += points;
        } else if (q.type === "essay") {
            hasEssay = true;
            total_questions += Number(q.points) || 0;
        } else if (q.type === "passage" && Array.isArray(q.subQuestions)) {
            q.subQuestions.forEach((sq) => {
                if (sq.type === "essay") {
                    hasEssay = true;
                    total_questions += Number(sq.points) || 0;
                } else if (sq.options && sq.correctOption !== undefined) {
                    const points = Number(sq.points) || 1;
                    total_questions += points;
                    const correct = sq.options[sq.correctOption];
                    if (answers[sq.id] === correct) score += points;
                }
            });
        }
    });

    const percentage = total_questions > 0 ? (score / total_questions) * 100 : 0;
    return { score, total_questions, percentage, hasEssay };
};

export const startPlacementTest = async (req, res) => {
    try {
        const testId = Number(req.body.test_id);
        const studentId = String(req.body.student_id || "");
        if (!testId || !studentId) {
            return res.status(400).json({ error: "test_id and student_id are required" });
        }

        const [test, result, lock] = await Promise.all([
            prisma.placement_tests.findUnique({ where: { id: testId } }),
            prisma.placement_test_results.findFirst({ where: { test_id: testId, student_id: studentId } }),
            prisma.assessment_attempt_locks.findUnique({
                where: {
                    test_type_test_id_student_id: {
                        test_type: "placement",
                        test_id: testId,
                        student_id: studentId,
                    },
                },
            }),
        ]);
        if (!test) return res.status(404).json({ error: "Test not found" });
        if (result) return res.status(409).json({ error: "You have already taken this placement test", result });
        if (lock) {
            return res.status(409).json({
                error: "You left this test without submitting. Ask an admin to allow a retake.",
                attempt: lock,
            });
        }

        const attempt = await prisma.assessment_attempt_locks.create({
            data: { test_type: "placement", test_id: testId, student_id: studentId },
        });
        res.status(201).json(attempt);
    } catch (err) {
        if (err?.code === "P2002") {
            return res.status(409).json({ error: "This placement test attempt is locked." });
        }
        res.status(500).json({ error: err.message });
    }
};

export const unlockPlacementAttempt = async (req, res) => {
    try {
        const id = Number(req.params.attemptId);
        const attempt = await prisma.assessment_attempt_locks.findUnique({ where: { id } });
        if (!attempt || attempt.test_type !== "placement") {
            return res.status(404).json({ error: "Attempt not found" });
        }
        const result = await prisma.placement_test_results.findFirst({
            where: { test_id: attempt.test_id, student_id: attempt.student_id },
        });
        if (result) return res.status(400).json({ error: "A submitted test cannot be unlocked here" });

        await prisma.assessment_attempt_locks.delete({ where: { id } });
        res.json({ message: "Placement test retake allowed" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Check if a student has an active (unsubmitted) attempt lock
export const getPlacementLockStatus = async (req, res) => {
    try {
        const studentId = String(req.params.studentId || "");
        if (!studentId) return res.status(400).json({ error: "studentId is required" });

        const lock = await prisma.assessment_attempt_locks.findFirst({
            where: { test_type: "placement", student_id: studentId },
            orderBy: { started_at: "desc" },
        });

        if (!lock) return res.json({ locked: false });

        // Check if this lock belongs to an already-submitted test (should not happen, but safety check)
        const submitted = await prisma.placement_test_results.findFirst({
            where: { test_id: lock.test_id, student_id: studentId },
        });

        if (submitted) return res.json({ locked: false });

        return res.json({ locked: true, attempt: lock });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const submitPlacementTest = async (req, res) => {
    try {
        const { test_id, student_id, answers } = req.body;

        if (!test_id || !student_id || !answers) {
            return res.status(400).json({ error: "test_id, student_id, and answers are required" });
        }

        const test = await prisma.placement_tests.findUnique({ where: { id: parseInt(test_id) } });
        if (!test) return res.status(404).json({ error: "Test not found" });

        const existing = await prisma.placement_test_results.findFirst({
            where: { test_id: parseInt(test_id), student_id: String(student_id) },
        });
        if (existing) {
            return res.status(400).json({ error: "You have already submitted this placement test", result: existing });
        }

        const questions = typeof test.questions === "string" ? JSON.parse(test.questions) : test.questions;
        const { score, total_questions, percentage, hasEssay } = scorePlacementAnswers(questions, answers);

        const result = await prisma.placement_test_results.create({
            data: {
                test_id: parseInt(test_id),
                student_id: String(student_id),
                score,
                total_questions,
                percentage,
                answers,
                status: hasEssay ? "pending_review" : "completed",
            },
        });
        res.status(201).json(result);
    } catch (err) {
        console.error("❌ Submit placement test error:", err);
        res.status(500).json({ error: err.message });
    }
};

export const getStudentPlacementResults = async (req, res) => {
    try {
        const { studentId } = req.params;
        const results = await prisma.placement_test_results.findMany({
            where: { student_id: studentId },
            orderBy: { submitted_at: "desc" },
        });
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const gradePlacementTest = async (req, res) => {
    try {
        const resultId = parseInt(req.params.resultId, 10);
        const {
            essay_marks = {}, oral_review_marks = 0, feedback_file,
            recommended_level, status = "completed",
        } = req.body;
        const existing = await prisma.placement_test_results.findUnique({ where: { id: resultId } });
        if (!existing) return res.status(404).json({ error: "Result not found" });
        const test = await prisma.placement_tests.findUnique({ where: { id: existing.test_id } });
        if (!test) return res.status(404).json({ error: "Placement test not found" });
        const questions = typeof test.questions === "string" ? JSON.parse(test.questions) : (test.questions || []);
        const answers = typeof existing.answers === "string" ? JSON.parse(existing.answers) : (existing.answers || {});
        const objective = scorePlacementAnswers(questions, answers);
        const essayQuestions = questions.filter((question) => question.type === "essay");
        const allowedEssayIds = new Set(essayQuestions.map((question) => String(question.id)));
        const cleanEssayMarks = {};
        for (const [questionId, rawMark] of Object.entries(essay_marks || {})) {
            if (!allowedEssayIds.has(String(questionId))) continue;
            const question = essayQuestions.find((item) => String(item.id) === String(questionId));
            const mark = Number(rawMark) || 0;
            const max = Number(question?.points) || 0;
            if (mark < 0 || mark > max) return res.status(400).json({ error: `Essay mark must be between 0 and ${max}` });
            cleanEssayMarks[questionId] = mark;
        }
        const essayTotal = Object.values(cleanEssayMarks).reduce((sum, mark) => sum + mark, 0);
        const oralTotal = Number(oral_review_marks) || 0;
        if (oralTotal < 0 || oralTotal > 20) return res.status(400).json({ error: "Oral review marks must be between 0 and 20" });
        const finalScore = objective.score + essayTotal + oralTotal;
        const finalTotal = objective.total_questions + 20;
        const updated = await prisma.placement_test_results.update({
            where: { id: resultId },
            data: {
                essay_marks: JSON.stringify(cleanEssayMarks),
                oral_review_marks: oralTotal,
                feedback_file: feedback_file || existing.feedback_file || undefined,
                recommended_level: recommended_level || existing.recommended_level || undefined,
                status,
                score: finalScore,
                total_questions: finalTotal,
                percentage: finalTotal > 0 ? (finalScore / finalTotal) * 100 : 0,
            },
        });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAllPlacementResults = async (req, res) => {
    try {
        const [results, placementPrograms, attemptLocks, ieltsStudents] = await Promise.all([
            prisma.placement_test_results.findMany({ orderBy: { submitted_at: 'desc' } }),
            prisma.programs.findMany({
                where: { test_required: 'placement' },
                select: { title: true },
            }),
            prisma.assessment_attempt_locks.findMany({
                where: { test_type: "placement" },
                orderBy: { started_at: "desc" },
            }),
            prisma.IELTSTOEFL.findMany({
                select: {
                    student_id: true,
                    first_name: true,
                    last_name: true,
                    expiry_date: true,
                    is_extended: true,
                    status: true,
                    class_id: true,
                    chosen_program: true,
                    registration_date: true,
                },
            }),
        ]);

        const placementProgramTitles = placementPrograms.map((program) => program.title);
        const regularPlacementStudents = placementProgramTitles.length
            ? await prisma.students.findMany({
                where: {
                    chosen_program: { in: placementProgramTitles },
                    approval_status: { notIn: ['inactive', 'rejected'] }
                },
                select: {
                    student_id: true,
                    full_name: true,
                    expiry_date: true,
                    is_extended: true,
                    approval_status: true,
                    class_id: true,
                    created_at: true,
                },
            })
            : [];
        const ieltsPlacementStudents = placementProgramTitles.length
            ? ieltsStudents.filter((student) =>
                placementProgramTitles.includes(student.chosen_program) &&
                !['inactive', 'rejected'].includes(String(student.status || '').toLowerCase())
            )
            : [];

        const eligibleStudents = [
            ...regularPlacementStudents.map((student) => ({
                student_id: student.student_id,
                student_name: student.full_name || '-',
                expiry_date: student.expiry_date,
                is_extended: student.is_extended,
                approval_status: student.approval_status,
                class_id: student.class_id,
                created_at: student.created_at,
            })),
            ...ieltsPlacementStudents.map((student) => ({
                student_id: student.student_id,
                student_name: `${student.first_name || ''} ${student.last_name || ''}`.trim() || '-',
                expiry_date: student.expiry_date,
                is_extended: student.is_extended,
                approval_status: student.status,
                class_id: student.class_id,
                created_at: student.registration_date,
                is_candidate: true,
            })),
        ];

        const studentsById = new Map(eligibleStudents.map((student) => [student.student_id, student]));
        const submittedStudentIds = new Set(results.map((result) => result.student_id).filter(Boolean));
        const lockedStudentIds = new Set(attemptLocks.map((attempt) => attempt.student_id));

        // Hide orphan/invalid submitted rows so Placement Results only shows real students.
        const submittedRows = await Promise.all(results.map(async (result) => {
            let student = result.student_id ? studentsById.get(result.student_id) : null;
            if (!student && result.student_id) {
                student = await prisma.students.findUnique({ where: { student_id: result.student_id } })
                    || await prisma.IELTSTOEFL.findUnique({ where: { student_id: result.student_id } });
            }
            if (!student) return null;
            return {
                ...result,
                student_name: student.student_name || student.full_name || [student.first_name, student.last_name].filter(Boolean).join(' ') || '-',
                expiry_date: student?.expiry_date || null,
                is_extended: student?.is_extended || false,
                approval_status: student?.approval_status || student?.status || null,
                class_id: student?.class_id || null,
                is_candidate: student?.is_candidate || false,
                has_submitted: true,
            };
        }));
        const visibleSubmittedRows = submittedRows.filter(Boolean);

        const exitedRows = await Promise.all(attemptLocks
            .filter((attempt) => !submittedStudentIds.has(attempt.student_id))
            .map(async (attempt) => {
                const student = studentsById.get(attempt.student_id)
                    || await prisma.students.findUnique({ where: { student_id: attempt.student_id }, select: { student_id: true, full_name: true, expiry_date: true, approval_status: true } })
                    || await prisma.IELTSTOEFL.findUnique({ where: { student_id: attempt.student_id }, select: { student_id: true, first_name: true, last_name: true, expiry_date: true, status: true, class_id: true } });
                if (!student) return null;
                return {
                    id: `attempt-${attempt.id}`,
                    attempt_id: attempt.id,
                    student_id: attempt.student_id,
                    student_name: student.student_name || student.full_name || [student.first_name, student.last_name].filter(Boolean).join(' ') || '-',
                    test_id: attempt.test_id,
                    score: null,
                    total_questions: null,
                    percentage: null,
                    recommended_level: null,
                    submitted_at: null,
                    started_at: attempt.started_at,
                    status: 'started_not_submitted',
                    expiry_date: student?.expiry_date || null,
                    approval_status: student?.approval_status || student?.status || null,
                    has_submitted: false,
                    is_locked: true,
                };
            }));
        const visibleExitedRows = exitedRows.filter(Boolean);

        // Add registered students who never entered the test, excluding inactive ones.
        const notTakenRows = eligibleStudents
            .filter((student) =>
                !submittedStudentIds.has(student.student_id) &&
                !lockedStudentIds.has(student.student_id)
            )
            .map((student) => ({
                id: `not-taken-${student.student_id}`,
                student_id: student.student_id,
                student_name: student.student_name || '-',
                test_id: null,
                score: null,
                total_questions: null,
                percentage: null,
                recommended_level: null,
                submitted_at: null,
                status: 'not_taken',
                expiry_date: student.expiry_date,
                is_extended: student.is_extended,
                approval_status: student.approval_status,
                class_id: student.class_id,
                created_at: student.created_at,
                has_submitted: false,
            }));

        res.json([...visibleExitedRows, ...notTakenRows, ...visibleSubmittedRows]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deletePlacementResult = async (req, res) => {
    try {
        const { resultId } = req.params;

        // "student-{studentId}" — delete student and all placement records directly from database
        if (resultId && resultId.startsWith("student-")) {
            const studentId = resultId.replace("student-", "");

            // 1. Delete all placement results for this student
            await prisma.placement_test_results.deleteMany({
                where: { student_id: studentId }
            }).catch(() => {});

            // 2. Delete all attempt locks
            await prisma.assessment_attempt_locks.deleteMany({
                where: { test_type: "placement", student_id: studentId }
            }).catch(() => {});

            // 3. Delete student directly from database
            try {
                await prisma.payments.deleteMany({ where: { student_id: studentId } }).catch(() => {});
                await prisma.attendance.deleteMany({ where: { student_id: studentId } }).catch(() => {});
                await prisma.notifications.deleteMany({ where: { OR: [{ user_id: studentId }, { sender_id: studentId }] } }).catch(() => {});
                await prisma.students.delete({ where: { student_id: studentId } });
            } catch (delErr) {
                await prisma.students.update({
                    where: { student_id: studentId },
                    data: { approval_status: 'inactive' },
                }).catch(() => {});
            }

            return res.json({ message: "Record deleted successfully" });
        }

        // "attempt-{attemptId}" — delete an exited/time-end attempt lock
        if (resultId && resultId.startsWith("attempt-")) {
            const attemptId = parseInt(resultId.replace("attempt-", ""), 10);
            if (isNaN(attemptId)) return res.status(400).json({ error: "Invalid attempt ID" });
            await prisma.assessment_attempt_locks.delete({ where: { id: attemptId } });
            return res.json({ message: "Attempt record deleted successfully" });
        }

        // Numeric ID — delete a submitted placement_test_results record
        const id = parseInt(resultId, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: "Invalid result ID" });
        }
        await prisma.placement_test_results.delete({
            where: { id },
        });
        res.json({ message: "Placement result deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
