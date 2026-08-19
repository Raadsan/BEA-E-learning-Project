import prisma from '../lib/prisma.js';

export const createProficiencyTest = async (req, res) => {
    try {
        const test = await prisma.proficiency_tests.create({ data: req.body });
        res.status(201).json(test);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAllProficiencyTests = async (req, res) => {
    try {
        const tests = await prisma.proficiency_tests.findMany();
        res.json(tests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getProficiencyTestById = async (req, res) => {
    try {
        const test = await prisma.proficiency_tests.findUnique({
            where: { id: parseInt(req.params.id) }
        });
        if (!test) return res.status(404).json({ error: "Not found" });
        res.json(test);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateProficiencyTest = async (req, res) => {
    try {
        const updated = await prisma.proficiency_tests.update({
            where: { id: parseInt(req.params.id) },
            data: req.body
        });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteProficiencyTest = async (req, res) => {
    try {
        await prisma.proficiency_tests.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const submitProficiencyTest = async (req, res) => {
    try {
        const { test_id, student_id, answers } = req.body;
        const test = await prisma.proficiency_tests.findUnique({ where: { id: parseInt(test_id) } });
        if (!test) return res.status(404).json({ error: "Test not found" });
        const existing = await prisma.proficiency_test_results.findFirst({
            where: { test_id: parseInt(test_id), student_id: String(student_id) },
        });
        if (existing) {
            return res.status(400).json({ error: "You have already submitted this proficiency test", result: existing });
        }

        const questions = typeof test.questions === 'string' ? JSON.parse(test.questions) : test.questions;
        let score = 0;
        let total_points = 0;
        let hasEssay = false;

        questions.forEach(q => {
            if (q.type === 'mcq' || q.type === 'multiple_choice') {
                total_points += (q.points || 1);
                if (answers[q.id] === q.options[q.correctOption]) score += (q.points || 1);
            } else if (q.type === 'essay') {
                hasEssay = true;
                total_points += (q.points || 0);
            }
        });

        const result = await prisma.proficiency_test_results.create({
            data: {
                test_id: parseInt(test_id),
                student_id,
                answers: JSON.stringify(answers),
                score: score,
                total_points: total_points,
                status: hasEssay ? 'pending' : 'completed'
            }
        });
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const startProficiencyTest = async (req, res) => {
    try {
        const testId = Number(req.body.test_id);
        const studentId = String(req.body.student_id || "");
        if (!testId || !studentId) return res.status(400).json({ error: "test_id and student_id are required" });
        const [test, result, lock] = await Promise.all([
            prisma.proficiency_tests.findUnique({ where: { id: testId } }),
            prisma.proficiency_test_results.findFirst({ where: { test_id: testId, student_id: studentId } }),
            prisma.assessment_attempt_locks.findUnique({
                where: {
                    test_type_test_id_student_id: {
                        test_type: "proficiency", test_id: testId, student_id: studentId,
                    },
                },
            }),
        ]);
        if (!test) return res.status(404).json({ error: "Test not found" });
        if (result) return res.status(409).json({ error: "You have already taken this proficiency test", result });
        if (lock) {
            return res.status(409).json({
                error: "You left this test without submitting. Ask an admin to allow a retake.",
                attempt: lock,
            });
        }
        const attempt = await prisma.assessment_attempt_locks.create({
            data: { test_type: "proficiency", test_id: testId, student_id: studentId },
        });
        res.status(201).json(attempt);
    } catch (err) {
        if (err?.code === "P2002") return res.status(409).json({ error: "This proficiency test attempt is locked." });
        res.status(500).json({ error: err.message });
    }
};

export const getStudentProficiencyResults = async (req, res) => {
    try {
        const results = await prisma.proficiency_test_results.findMany({
            where: { student_id: String(req.params.studentId) },
            orderBy: { submitted_at: "desc" },
        });
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const unlockProficiencyAttempt = async (req, res) => {
    try {
        const id = Number(req.params.attemptId);
        const attempt = await prisma.assessment_attempt_locks.findUnique({ where: { id } });
        if (!attempt || attempt.test_type !== "proficiency") return res.status(404).json({ error: "Attempt not found" });
        const result = await prisma.proficiency_test_results.findFirst({
            where: { test_id: attempt.test_id, student_id: attempt.student_id },
        });
        if (result) return res.status(400).json({ error: "A submitted test cannot be unlocked here" });
        await prisma.assessment_attempt_locks.delete({ where: { id } });
        res.json({ message: "Proficiency test retake allowed" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAllProficiencyResults = async (req, res) => {
    try {
        const [results, attemptLocks, ieltsStudents, candidates, profPrograms] = await Promise.all([
            prisma.proficiency_test_results.findMany({
                include: { proficiency_tests: true },
                orderBy: { submitted_at: 'desc' }
            }),
            prisma.assessment_attempt_locks.findMany({
                where: { test_type: "proficiency" },
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
                    verification_method: true,
                    chosen_program: true,
                    registration_date: true,
                }
            }),
            prisma.ProficiencyTestStudents.findMany({
                select: {
                    student_id: true,
                    first_name: true,
                    last_name: true,
                    expiry_date: true,
                    is_extended: true,
                    status: true,
                    registration_date: true,
                }
            }),
            prisma.programs.findMany({
                where: { test_required: 'proficiency' },
                select: { title: true },
            }),
        ]);

        const profProgramTitles = profPrograms.map((p) => p.title);
        const regularProfStudents = profProgramTitles.length
            ? await prisma.students.findMany({
                where: {
                    chosen_program: { in: profProgramTitles },
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

        // Build lookup maps
        const ieltsById = new Map(ieltsStudents.map(s => [s.student_id, s]));
        const candidateById = new Map(candidates.map(c => [c.student_id, c]));
        const regularById = new Map(regularProfStudents.map(s => [s.student_id, s]));

        const getStudentInfo = (studentId) => {
            if (!studentId) return { name: 'Unknown Student', expiry_date: null, is_extended: false, status: null, class_id: null, is_candidate: false };
            const ielts = ieltsById.get(studentId);
            if (ielts) {
                return {
                    name: `${ielts.first_name || ''} ${ielts.last_name || ''}`.trim() || 'Unknown Student',
                    expiry_date: ielts.expiry_date,
                    is_extended: ielts.is_extended,
                    status: ielts.status,
                    class_id: ielts.class_id,
                    is_candidate: true,
                };
            }
            const cand = candidateById.get(studentId);
            if (cand) {
                return {
                    name: `${cand.first_name || ''} ${cand.last_name || ''}`.trim() || 'Unknown Student',
                    expiry_date: cand.expiry_date,
                    is_extended: cand.is_extended,
                    status: cand.status,
                    class_id: null,
                    is_candidate: true,
                };
            }
            const reg = regularById.get(studentId);
            if (reg) {
                return {
                    name: reg.full_name || 'Unknown Student',
                    expiry_date: reg.expiry_date,
                    is_extended: reg.is_extended,
                    status: reg.approval_status,
                    class_id: reg.class_id,
                    is_candidate: false,
                };
            }
            return { name: 'Unknown Student', expiry_date: null, is_extended: false, status: null, class_id: null, is_candidate: false };
        };

        const submittedStudentIds = new Set(results.map(r => r.student_id).filter(Boolean));
        const lockedStudentIds = new Set(attemptLocks.map(a => a.student_id));

        // 1. Submitted Rows
        const submittedRows = results.map((result) => {
            const info = getStudentInfo(result.student_id);
            const scoreNum = result.score ? parseFloat(result.score.toString()) : 0;
            const totalPoints = result.total_points || 0;
            const percentage = totalPoints > 0 ? (scoreNum / totalPoints) * 100 : 0;

            return {
                ...result,
                student_name: info.name,
                percentage,
                expiry_date: info.expiry_date,
                is_extended: info.is_extended,
                approval_status: info.status,
                class_id: info.class_id,
                is_candidate: info.is_candidate,
                has_submitted: true,
            };
        });

        // 2. Exited / Incomplete Attempts
        const exitedRows = attemptLocks
            .filter((attempt) => !submittedStudentIds.has(attempt.student_id))
            .map((attempt) => {
                const info = getStudentInfo(attempt.student_id);
                return {
                    id: `attempt-${attempt.id}`,
                    attempt_id: attempt.id,
                    test_id: attempt.test_id,
                    student_id: attempt.student_id,
                    student_name: info.name,
                    started_at: attempt.started_at,
                    submitted_at: null,
                    score: null,
                    total_points: null,
                    percentage: null,
                    status: 'started_not_submitted',
                    is_locked: true,
                    is_candidate: info.is_candidate,
                    expiry_date: info.expiry_date,
                    approval_status: info.status,
                    has_submitted: false,
                };
            });

        // 3. Not Taken Rows (Registered students who haven't submitted or locked)
        const notTakenRows = [];
        
        // From IELTS/TOEFL students
        ieltsStudents.forEach((student) => {
            if (
                !submittedStudentIds.has(student.student_id) &&
                !lockedStudentIds.has(student.student_id) &&
                student.status !== 'proficiency_dismissed'
            ) {
                notTakenRows.push({
                    id: `not-taken-${student.student_id}`,
                    student_id: student.student_id,
                    student_name: `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Student',
                    test_id: null,
                    score: null,
                    total_points: null,
                    percentage: null,
                    recommended_level: null,
                    submitted_at: null,
                    status: 'not_taken',
                    expiry_date: student.expiry_date,
                    is_extended: student.is_extended,
                    approval_status: student.status,
                    class_id: student.class_id,
                    created_at: student.registration_date,
                    has_submitted: false,
                    is_candidate: true,
                });
            }
        });

        // From Candidates
        candidates.forEach((cand) => {
            if (
                !submittedStudentIds.has(cand.student_id) &&
                !lockedStudentIds.has(cand.student_id) &&
                !ieltsById.has(cand.student_id) &&
                cand.status !== 'proficiency_dismissed'
            ) {
                notTakenRows.push({
                    id: `not-taken-${cand.student_id}`,
                    student_id: cand.student_id,
                    student_name: `${cand.first_name || ''} ${cand.last_name || ''}`.trim() || 'Candidate',
                    test_id: null,
                    score: null,
                    total_points: null,
                    percentage: null,
                    recommended_level: null,
                    submitted_at: null,
                    status: 'not_taken',
                    expiry_date: cand.expiry_date,
                    is_extended: cand.is_extended,
                    approval_status: cand.status,
                    has_submitted: false,
                    is_candidate: true,
                });
            }
        });

        // From Regular students
        regularProfStudents.forEach((reg) => {
            if (
                !submittedStudentIds.has(reg.student_id) &&
                !lockedStudentIds.has(reg.student_id) &&
                !ieltsById.has(reg.student_id) &&
                !candidateById.has(reg.student_id) &&
                reg.approval_status !== 'proficiency_dismissed'
            ) {
                notTakenRows.push({
                    id: `not-taken-${reg.student_id}`,
                    student_id: reg.student_id,
                    student_name: reg.full_name || 'Student',
                    test_id: null,
                    score: null,
                    total_points: null,
                    percentage: null,
                    recommended_level: null,
                    submitted_at: null,
                    status: 'not_taken',
                    expiry_date: reg.expiry_date,
                    is_extended: reg.is_extended,
                    approval_status: reg.approval_status,
                    class_id: reg.class_id,
                    has_submitted: false,
                    is_candidate: false,
                });
            }
        });

        res.json([...exitedRows, ...notTakenRows, ...submittedRows]);
    } catch (err) {
        console.error("❌ getAllProficiencyResults error:", err);
        res.status(500).json({ error: err.message });
    }
};

export const deleteProficiencyResult = async (req, res) => {
    try {
        const { resultId } = req.params;

        // "student-{studentId}" — delete student and all proficiency records directly from database
        if (resultId && resultId.startsWith("student-")) {
            const studentId = resultId.replace("student-", "");

            // 1. Delete proficiency test results
            await prisma.proficiency_test_results.deleteMany({
                where: { student_id: studentId }
            }).catch(() => {});

            // 2. Delete attempt locks
            await prisma.assessment_attempt_locks.deleteMany({
                where: { test_type: "proficiency", student_id: studentId }
            }).catch(() => {});

            // 3. Delete from ProficiencyTestStudents (candidates)
            await prisma.ProficiencyTestStudents.deleteMany({
                where: { student_id: studentId }
            }).catch(() => {});

            // 4. Delete from IELTSTOEFL if test student
            await prisma.IELTSTOEFL.deleteMany({
                where: { student_id: studentId }
            }).catch(() => {});

            // 5. Delete from students
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

        // "attempt-{attemptId}" — delete attempt lock
        if (resultId && resultId.startsWith("attempt-")) {
            const attemptId = parseInt(resultId.replace("attempt-", ""), 10);
            if (isNaN(attemptId)) return res.status(400).json({ error: "Invalid attempt ID" });
            await prisma.assessment_attempt_locks.delete({ where: { id: attemptId } });
            return res.json({ message: "Attempt record deleted successfully" });
        }

        // Numeric ID — delete submitted result
        const id = parseInt(resultId, 10);
        if (isNaN(id)) return res.status(400).json({ error: "Invalid result ID" });

        await prisma.proficiency_test_results.delete({ where: { id } });
        res.json({ message: "Proficiency result deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const gradeProficiencyTest = async (req, res) => {
    try {
        const { resultId } = req.params;
        const { essayMarks, oralReviewMarks } = req.body;

        const result = await prisma.proficiency_test_results.findUnique({ where: { id: parseInt(resultId) } });
        if (!result) return res.status(404).json({ error: "Not found" });

        const newScore = (result.score || 0) + (parseFloat(essayMarks) || 0) + (parseFloat(oralReviewMarks) || 0);

        const updated = await prisma.proficiency_test_results.update({
            where: { id: parseInt(resultId) },
            data: {
                score: newScore,
                essay_marks: essayMarks ? JSON.stringify(essayMarks) : undefined,
                oral_review_marks: oralReviewMarks ? parseFloat(oralReviewMarks) : undefined,
                status: 'completed'
            }
        });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
