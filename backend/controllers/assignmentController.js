import db from "../database/dbconfig.js";

const dbp = db.promise();

// Get assignment statistics across all tables
export const getAssignmentStats = async (req, res) => {
    try {
        const { program_id, class_id } = req.query;

        const tables = [
            { main: 'writing_tasks', sub: 'writing_task_submissions', type: 'writing_task' },
            { main: 'tests', sub: 'test_submissions', type: 'test' },
            { main: 'oral_assignments', sub: 'oral_assignment_submissions', type: 'oral_assignment' },
            { main: 'course_work', sub: 'course_work_submissions', type: 'course_work' }
        ];

        let results = [];
        for (const t of tables) {
            let query = `
                SELECT 
                    '${t.type}' as type,
                    COUNT(DISTINCT a.id) as total_assignments,
                    COUNT(DISTINCT CASE WHEN asub.status IN ('submitted', 'graded') THEN asub.id END) as completed_submissions,
                    COUNT(DISTINCT asub.student_id) as total_students,
                    ROUND(AVG(CASE WHEN asub.status = 'graded' THEN asub.score END), 2) as avg_score
                FROM ${t.main} a
                LEFT JOIN ${t.sub} asub ON a.id = asub.assignment_id
                WHERE a.status = 'active'
            `;

            const params = [];
            if (program_id) {
                query += ` AND a.program_id = ?`;
                params.push(program_id);
            }
            if (class_id) {
                query += ` AND a.class_id = ?`;
                params.push(class_id);
            }

            const [stat] = await dbp.query(query, params);
            results.push(stat[0]);
        }

        const formattedStats = results.map(stat => ({
            type: stat.type,
            totalAssignments: stat.total_assignments,
            completionRate: stat.total_students > 0
                ? Math.round((stat.completed_submissions / (stat.total_assignments * stat.total_students)) * 100)
                : 0,
            avgScore: stat.avg_score || 0
        }));

        res.json(formattedStats);
    } catch (error) {
        console.error("Error fetching assignment stats:", error);
        res.status(500).json({ error: "Failed to fetch assignment statistics" });
    }
};

// Get performance clusters (High, Average, Low) across all tables
export const getPerformanceClusters = async (req, res) => {
    try {
        const { program_id, class_id } = req.query;

        const tables = [
            { main: 'writing_tasks', sub: 'writing_task_submissions' },
            { main: 'tests', sub: 'test_submissions' },
            { main: 'oral_assignments', sub: 'oral_assignment_submissions' },
            { main: 'course_work', sub: 'course_work_submissions' }
        ];

        let unionQueries = tables.map(t => `
            SELECT student_id, score, status FROM ${t.sub} WHERE status = 'graded'
        `).join(' UNION ALL ');

        let query = `
            SELECT 
                s.student_id as id,
                s.full_name,
                ROUND(AVG(all_subs.score), 2) as avg_score,
                COUNT(all_subs.student_id) as graded_count,
                CASE 
                    WHEN AVG(all_subs.score) >= 80 THEN 'High'
                    WHEN AVG(all_subs.score) >= 60 THEN 'Average'
                    ELSE 'Low'
                END as performance_level
            FROM students s
            LEFT JOIN (${unionQueries}) all_subs ON s.student_id = all_subs.student_id
            WHERE 1=1
        `;

        const params = [];
        if (program_id) {
            query += ` AND s.chosen_program = ?`;
            params.push(program_id);
        }
        if (class_id) {
            query += ` AND s.class_id = ?`;
            params.push(class_id);
        }

        query += ` GROUP BY s.student_id, s.full_name HAVING graded_count > 0`;

        const [students] = await dbp.query(query, params);

        const clusters = {
            High: students.filter(s => s.performance_level === 'High').length,
            Average: students.filter(s => s.performance_level === 'Average').length,
            Low: students.filter(s => s.performance_level === 'Low').length
        };

        const clusterData = [
            { category: 'High', count: clusters.High, percentage: 0 },
            { category: 'Average', count: clusters.Average, percentage: 0 },
            { category: 'Low', count: clusters.Low, percentage: 0 }
        ];

        const total = clusters.High + clusters.Average + clusters.Low;
        if (total > 0) {
            clusterData.forEach(cluster => {
                cluster.percentage = Math.round((cluster.count / total) * 100);
            });
        }

        res.json(clusterData);
    } catch (error) {
        console.error("Error fetching performance clusters:", error);
        res.status(500).json({ error: "Failed to fetch performance clusters" });
    }
};

// Table mappings for dynamic routing
const tableMapping = {
    'writing_task': {
        main: 'writing_tasks',
        sub: 'writing_task_submissions'
    },
    'test': {
        main: 'tests',
        sub: 'test_submissions'
    },
    'oral_assignment': {
        main: 'oral_assignments',
        sub: 'oral_assignment_submissions'
    },
    'course_work': {
        main: 'course_work',
        sub: 'course_work_submissions'
    }
};

// Get all assignments with filtering across one or more tables
export const getAssignments = async (req, res) => {
    try {
        const { class_id, program_id, type, created_by } = req.query;
        const userId = req.user.userId;
        const role = req.user.role;

        // If a specific type is requested, only query that table
        // Otherwise, we'd need to UNION ALL, but for now we focus on the current UI usage
        // which usually requests one type at a time.
        const typesToQuery = type ? [type] : Object.keys(tableMapping);

        let allAssignments = [];

        for (const t of typesToQuery) {
            const table = tableMapping[t]?.main;
            const subTable = tableMapping[t]?.sub;
            if (!table) continue;

            let query = `
                SELECT a.*, '${t}' as type, c.class_name, p.title as program_name, t.full_name as teacher_name,
                (SELECT COUNT(*) FROM ${subTable} WHERE assignment_id = a.id) as submission_count
                ${role === 'student' ? `, s.status as submission_status, s.content as student_content, s.score, s.feedback, s.file_url, s.feedback_file_url, s.submission_date` : ''}
                FROM ${table} a
                LEFT JOIN classes c ON a.class_id = c.id
                LEFT JOIN programs p ON a.program_id = p.id
                LEFT JOIN teachers t ON a.created_by = t.id
                ${role === 'student' ? `LEFT JOIN ${subTable} s ON a.id = s.assignment_id AND s.student_id = ?` : ''}
                WHERE 1=1
            `;

            const params = [];
            if (role === 'student') {
                params.push(userId);
            }

            if (class_id) {
                query += ` AND a.class_id = ?`;
                params.push(class_id);
            }

            if (program_id) {
                query += ` AND a.program_id = ?`;
                params.push(program_id);
            }

            if (created_by) {
                query += ` AND a.created_by = ?`;
                params.push(created_by);
            }

            const [rows] = await dbp.query(query, params);
            // Inject type back since it might not be in the table itself anymore
            const rowsWithType = rows.map(r => ({ ...r, type: t }));
            allAssignments = [...allAssignments, ...rowsWithType];
        }

        // Sort by created_at desc
        allAssignments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        res.json(allAssignments);
    } catch (error) {
        console.error("Error fetching assignments:", error);
        res.status(500).json({ error: "Failed to fetch assignments" });
    }
};

// Create assignment
export const createAssignment = async (req, res) => {
    try {
        const {
            title, description, class_id, program_id, subprogram_id, unit, type, due_date,
            total_points, status, word_count, duration, submission_format, requirements, questions
        } = req.body;
        const userId = req.user.userId;

        const safeStatus = (status || 'active').toLowerCase();

        const table = tableMapping[type]?.main;
        if (!table) return res.status(400).json({ error: "Invalid assignment type" });

        console.log(`Creating ${type} assignment for user ${userId}`);

        // Build dynamic query based on table columns
        let columns = ['title', 'description', 'class_id', 'program_id', 'due_date', 'total_points', 'status', 'created_by'];
        let values = [
            title,
            description || null,
            class_id || null,
            program_id || null,
            (due_date && due_date !== "") ? due_date : null,
            total_points || 0,
            safeStatus,
            userId
        ];

        if (type === 'writing_task') {
            columns.push('word_count', 'requirements');
            values.push(word_count || null, requirements || null);
        } else if (type === 'test' || type === 'oral_assignment') {
            columns.push('duration', 'questions');
            values.push(duration || null, questions ? JSON.stringify(questions) : null);
        } else if (type === 'course_work') {
            columns.push('submission_format', 'questions', 'subprogram_id', 'unit');
            values.push(submission_format || null, questions ? JSON.stringify(questions) : null, subprogram_id || null, unit || null);
        }

        const placeholders = columns.map(() => '?').join(', ');
        const [result] = await dbp.query(
            `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`,
            values
        );

        res.status(201).json({
            message: `${type} created successfully`,
            id: result.insertId
        });
    } catch (error) {
        console.error("Error creating assignment:", error);
        res.status(500).json({ error: "Failed to create assignment: " + error.message });
    }
};

// Update assignment
export const updateAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title, description, class_id, program_id, type, due_date,
            total_points, status, word_count, duration, submission_format, requirements, questions
        } = req.body;

        const safeStatus = (status || 'active').toLowerCase();

        const table = tableMapping[type]?.main;
        if (!table) return res.status(400).json({ error: "Invalid assignment type" });

        console.log(`Updating ${type} assignment ${id}`);

        let updateParts = [
            'title = ?', 'description = ?', 'class_id = ?', 'program_id = ?',
            'due_date = ?', 'total_points = ?', 'status = ?'
        ];
        let values = [
            title,
            description || null,
            class_id || null,
            program_id || null,
            (due_date && due_date !== "") ? due_date : null,
            total_points || 0,
            safeStatus
        ];

        if (type === 'writing_task') {
            updateParts.push('word_count = ?', 'requirements = ?');
            values.push(word_count || null, requirements || null);
        } else if (type === 'test' || type === 'oral_assignment') {
            updateParts.push('duration = ?', 'questions = ?');
            const processedQuestions = questions
                ? (typeof questions === 'string' ? questions : JSON.stringify(questions))
                : null;
            values.push(duration || null, processedQuestions);
        } else if (type === 'course_work') {
            updateParts.push('submission_format = ?', 'questions = ?');
            // Check if questions is already a string to avoid double stringification
            const processedQuestions = questions
                ? (typeof questions === 'string' ? questions : JSON.stringify(questions))
                : null;
            values.push(submission_format || null, processedQuestions);
        }

        values.push(id);

        await dbp.query(
            `UPDATE ${table} SET ${updateParts.join(', ')} WHERE id = ?`,
            values
        );

        res.json({ message: "Assignment updated successfully" });
    } catch (error) {
        console.error("Error updating assignment:", error);
        // Log more detail for debugging
        if (error.sql) console.error("Failed SQL:", error.sql);
        res.status(500).json({ error: "Failed to update assignment" });
    }
};

// Delete assignment
export const deleteAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.query;

        const table = tableMapping[type]?.main;
        if (!table) return res.status(400).json({ error: "Invalid assignment type" });

        await dbp.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
        res.json({ message: "Assignment deleted successfully" });
    } catch (error) {
        console.error("Error deleting assignment:", error);
        res.status(500).json({ error: "Failed to delete assignment" });
    }
};

// Student: Submit assignment work
export const submitAssignment = async (req, res) => {
    try {
        const { assignment_id, content, type } = req.body;
        const student_id = req.user.userId;

        // Get file URL from uploaded file (if any)
        const file_url = req.file ? req.file.filename : null;

        if (!assignment_id || !type) {
            return res.status(400).json({ error: "Assignment ID and Type are required" });
        }

        const table = tableMapping[type]?.main;
        const subTable = tableMapping[type]?.sub;
        if (!table || !subTable) return res.status(400).json({ error: "Invalid assignment type" });

        // Check if assignment exists and is active
        const [assignments] = await dbp.query(
            `SELECT id, status, questions FROM ${table} WHERE id = ?`,
            [assignment_id]
        );

        if (assignments.length === 0) {
            return res.status(404).json({ error: "Assignment not found" });
        }

        if (assignments[0].status === 'closed') {
            return res.status(400).json({ error: "This assignment is closed for submissions" });
        }

        let score = null;
        let finalStatus = 'submitted';

        // Auto-grading for Assignments with Questions (Tests and Course Work)
        if ((type === 'course_work' || type === 'test') && assignments[0].questions) {
            try {
                const testQuestions = typeof assignments[0].questions === 'string'
                    ? JSON.parse(assignments[0].questions)
                    : assignments[0].questions;

                if (testQuestions && Array.isArray(testQuestions) && testQuestions.length > 0) {
                    let totalScore = 0;
                    const studentAnswers = typeof content === 'string' ? JSON.parse(content) : content;

                    testQuestions.forEach((q, index) => {
                        const studentAnswer = studentAnswers[index];
                        const qPoints = parseInt(q.points) || 1;

                        // Case 1: MCQ or True/False (index-based)
                        if (q.type === 'mcq' || q.type === 'true_false' || !q.type) {
                            const correctAnswer = q.options && q.correctOption !== undefined
                                ? q.options[q.correctOption]
                                : (q.correctAnswer || q.answer);

                            if (studentAnswer === correctAnswer && studentAnswer !== undefined) {
                                totalScore += qPoints;
                            }
                        }
                        // Case 2: Short Answer (Exact string match, case-insensitive)
                        else if (q.type === 'short_answer') {
                            const correctAnswer = q.correctOption || q.correctAnswer || q.answer;
                            if (studentAnswer && correctAnswer &&
                                studentAnswer.toString().trim().toLowerCase() === correctAnswer.toString().trim().toLowerCase()) {
                                totalScore += qPoints;
                            }
                        }
                    });

                    score = totalScore;
                    finalStatus = 'graded';
                }
            } catch (e) {
                console.error("Auto-grading failed:", e);
                // Fallback to normal submission
            }
        }

        // UPSERT submission
        await dbp.query(
            `INSERT INTO ${subTable} (assignment_id, student_id, content, file_url, score, status, submission_date)
             VALUES (?, ?, ?, ?, ?, ?, NOW())
             ON DUPLICATE KEY UPDATE 
                content = VALUES(content), 
                file_url = VALUES(file_url), 
                score = VALUES(score),
                status = VALUES(status), 
                submission_date = NOW()`,
            [assignment_id, student_id, typeof content === 'object' ? JSON.stringify(content) : content, file_url, score, finalStatus]
        );

        res.json({
            message: finalStatus === 'graded' ? "Assignment submitted and graded successfully" : "Assignment submitted successfully",
            score,
            status: finalStatus
        });
    } catch (error) {
        console.error("Error submitting assignment:", error);
        res.status(500).json({ error: "Failed to submit assignment" });
    }
};

// Teacher: Get all submissions for a specific assignment
export const getAssignmentSubmissions = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.query;

        const subTable = tableMapping[type]?.sub;
        if (!subTable) return res.status(400).json({ error: "Invalid assignment type" });

        const query = `
            SELECT s.*, st.full_name as student_name, st.email as student_email
            FROM ${subTable} s
            JOIN students st ON s.student_id = st.student_id
            WHERE s.assignment_id = ?
        `;

        const [submissions] = await dbp.query(query, [id]);
        res.json(submissions);
    } catch (error) {
        console.error("Error fetching assignment submissions:", error);
        res.status(500).json({ error: "Failed to fetch submissions" });
    }
};

// Teacher: Get all submissions for a specific type across all assignments
export const getAllSubmissions = async (req, res) => {
    try {
        const { type, subprogram_id, program_id, class_id } = req.query;
        const subTable = tableMapping[type]?.sub;
        const mainTable = tableMapping[type]?.main;

        if (!subTable || !mainTable) return res.status(400).json({ error: "Invalid assignment type" });

        let query = `
            SELECT sub.*, st.full_name as student_name, st.email as student_email, 
                   a.title as assignment_title, c.class_name, sp.subprogram_name
            FROM ${subTable} sub
            JOIN students st ON sub.student_id = st.student_id
            JOIN ${mainTable} a ON sub.assignment_id = a.id
            JOIN classes c ON a.class_id = c.id
            LEFT JOIN subprograms sp ON c.subprogram_id = sp.id
            WHERE 1=1
        `;

        const params = [];
        if (subprogram_id) {
            query += ` AND c.subprogram_id = ?`;
            params.push(subprogram_id);
        }
        if (class_id) {
            query += ` AND c.id = ?`;
            params.push(class_id);
        }
        if (program_id) {
            query += ` AND a.program_id = ?`;
            params.push(program_id);
        }

        // Sort by submission date
        query += ` ORDER BY sub.submission_date DESC`;

        const [submissions] = await dbp.query(query, params);
        res.json(submissions);
    } catch (error) {
        console.error("Error fetching all submissions:", error);
        res.status(500).json({ error: "Failed to fetch submissions" });
    }
};

// Teacher: Grade a student's submission
export const gradeSubmission = async (req, res) => {
    try {
        const { id } = req.params; // submission_id
        const { score, feedback, type } = req.body;
        const teacherId = req.user.userId;

        // Get feedback file URL from uploaded file (if any)
        const feedback_file_url = req.file ? req.file.filename : null;

        const subTable = tableMapping[type]?.sub;
        const mainTable = tableMapping[type]?.main;

        if (!subTable || !mainTable) return res.status(400).json({ error: "Invalid assignment type" });

        // Update with feedback file URL if provided
        if (feedback_file_url) {
            await dbp.query(
                `UPDATE ${subTable} SET score = ?, feedback = ?, feedback_file_url = ?, status = 'graded' WHERE id = ?`,
                [score, feedback, feedback_file_url, id]
            );
        } else {
            await dbp.query(
                `UPDATE ${subTable} SET score = ?, feedback = ?, status = 'graded' WHERE id = ?`,
                [score, feedback, id]
            );
        }

        // Fetch submission details for notification
        const [details] = await dbp.query(`
            SELECT s.student_id, a.title 
            FROM ${subTable} s
            JOIN ${mainTable} a ON s.assignment_id = a.id
            WHERE s.id = ?
        `, [id]);

        if (details.length > 0) {
            const { student_id, title } = details[0];

            // Import dynamically to avoid circular dependency issues if any, or just standard import usage
            // Since this is a specialized tool usage, I'll rely on the top-level import I'm about to add
            // But wait, I can't add top-level import in this same block easily if I only target this function.
            // I'll assume I'll add the import in a separate tool call OR uses a helper.

            const { createNotificationInternal } = await import('./notificationController.js');

            await createNotificationInternal({
                user_id: student_id,
                sender_id: teacherId,
                type: 'grade_submission',
                title: 'Course Work Graded',
                message: `Your course work "${title}" has been graded.`,
                metadata: {
                    submission_id: id,
                    type: type,
                    score: score
                }
            });
        }

        res.json({ message: "Submission graded successfully" });
    } catch (error) {
        console.error("Error grading submission:", error);
        res.status(500).json({ error: "Failed to grade submission" });
    }
};
