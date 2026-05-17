import prisma from '../lib/prisma.js';

export const submitTeacherReview = async (req, res) => {
    try {
        const { teacher_id, class_id, term_serial, rating, comment, answers } = req.body;
        const student_id = req.user.userId;
        if (req.user.role !== 'student' && req.user.role !== 'proficiency_student') {
            return res.status(403).json({ error: 'Only students can submit teacher reviews' });
        }
        const review = await prisma.teacher_reviews.create({
            data: { student_id, teacher_id: String(teacher_id), class_id: parseInt(class_id), term_serial, rating: parseInt(rating), comment, answers }
        });
        res.status(201).json(review);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getTeacherReviews = async (req, res) => {
    try {
        const teacher_id = req.params.teacher_id || req.user.userId;
        const reviews = await prisma.teacher_reviews.findMany({ where: { teacher_id: String(teacher_id) } });

        const populated = await Promise.all(reviews.map(async (review) => {
            let student_name = '-';
            let program_name = '-';
            let teacher_name = '-';
            let class_name = '-';

            if (review.student_id) {
                const student = await prisma.students.findUnique({
                    where: { student_id: review.student_id }
                });
                if (student) {
                    student_name = student.full_name || '-';
                    program_name = student.chosen_program || '-';
                }
            }

            if (review.teacher_id) {
                let teacher = null;
                const teacherInt = parseInt(review.teacher_id);
                if (!isNaN(teacherInt)) {
                    teacher = await prisma.teachers.findUnique({
                        where: { id: teacherInt }
                    });
                }
                if (!teacher) {
                    teacher = await prisma.teachers.findFirst({
                        where: { teacher_id: review.teacher_id }
                    });
                }
                if (teacher) {
                    teacher_name = teacher.full_name || '-';
                }
            }

            if (review.class_id) {
                const cls = await prisma.classes.findUnique({
                    where: { id: review.class_id }
                });
                if (cls) {
                    class_name = cls.class_name || '-';
                }
            }

            return {
                ...review,
                student_name,
                program_name,
                teacher_name,
                class_name
            };
        }));

        res.json(populated);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getTeachersToReview = async (req, res) => {
    try {
        const student_id = req.user.userId;
        const student = await prisma.students.findUnique({ where: { student_id } });
        if (!student?.class_id) return res.status(404).json({ error: 'Student class not found' });
        const cls = await prisma.classes.findUnique({ where: { id: student.class_id }, include: { teachers: true } });
        res.json(cls?.teachers ? [cls.teachers] : []);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getAllTeacherReviews = async (req, res) => {
    try {
        const reviews = await prisma.teacher_reviews.findMany({ orderBy: { created_at: 'desc' } });

        const populated = await Promise.all(reviews.map(async (review) => {
            let student_name = '-';
            let program_name = '-';
            let teacher_name = '-';
            let class_name = '-';

            if (review.student_id) {
                const student = await prisma.students.findUnique({
                    where: { student_id: review.student_id }
                });
                if (student) {
                    student_name = student.full_name || '-';
                    program_name = student.chosen_program || '-';
                }
            }

            if (review.teacher_id) {
                let teacher = null;
                const teacherInt = parseInt(review.teacher_id);
                if (!isNaN(teacherInt)) {
                    teacher = await prisma.teachers.findUnique({
                        where: { id: teacherInt }
                    });
                }
                if (!teacher) {
                    teacher = await prisma.teachers.findFirst({
                        where: { teacher_id: review.teacher_id }
                    });
                }
                if (teacher) {
                    teacher_name = teacher.full_name || '-';
                }
            }

            if (review.class_id) {
                const cls = await prisma.classes.findUnique({
                    where: { id: review.class_id }
                });
                if (cls) {
                    class_name = cls.class_name || '-';
                }
            }

            return {
                ...review,
                student_name,
                program_name,
                teacher_name,
                class_name
            };
        }));

        res.json(populated);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getQuestions = async (req, res) => {
    try {
        const questions = await prisma.teacher_review_questions.findMany({ where: { is_active: true } });
        res.json(questions);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getAllQuestions = async (req, res) => {
    try {
        const questions = await prisma.teacher_review_questions.findMany();
        res.json(questions);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const createQuestion = async (req, res) => {
    try {
        const q = await prisma.teacher_review_questions.create({ data: { question_text: req.body.question_text } });
        res.status(201).json(q);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const updateQuestion = async (req, res) => {
    try {
        const updated = await prisma.teacher_review_questions.update({ where: { id: parseInt(req.params.id) }, data: req.body });
        res.json(updated);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const deleteQuestion = async (req, res) => {
    try {
        await prisma.teacher_review_questions.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};
