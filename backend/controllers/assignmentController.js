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
                s.id,
                s.full_name,
                ROUND(AVG(all_subs.score), 2) as avg_score,
                COUNT(all_subs.student_id) as graded_count,
                CASE 
                    WHEN AVG(all_subs.score) >= 80 THEN 'High'
                    WHEN AVG(all_subs.score) >= 60 THEN 'Average'
                    ELSE 'Low'
                END as performance_level
            FROM students s
            LEFT JOIN (${unionQueries}) all_subs ON s.id = all_subs.student_id
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

        query += ` GROUP BY s.id, s.full_name HAVING graded_count > 0`;

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
        const { class_id, program_id, type } = req.query;
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
                SELECT a.*, '${t}' as type, c.class_name, p.title as program_name, t.full_name as teacher_name
                ${role === 'student' ? `, s.status as submission_status, s.content as student_content, s.score, s.feedback` : ''}
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
            title, description, class_id, program_id, type, due_date,
            total_points, status, word_count, duration, submission_format, requirements
        } = req.body;
        const userId = req.user.userId;

        const table = tableMapping[type]?.main;
        if (!table) return res.status(400).json({ error: "Invalid assignment type" });

        // Build dynamic query based on table columns
        let columns = ['title', 'description', 'class_id', 'program_id', 'due_date', 'total_points', 'status', 'created_by'];
        let values = [title, description, class_id, program_id, due_date, total_points, status || 'active', userId];

        if (type === 'writing_task') {
            columns.push('word_count', 'requirements');
            values.push(word_count || null, requirements || null);
        } else if (type === 'test' || type === 'oral_assignment') {
            columns.push('duration');
            values.push(duration || null);
        } else if (type === 'course_work') {
            columns.push('submission_format');
            values.push(submission_format || null);
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
        res.status(500).json({ error: "Failed to create assignment" });
    }
};

// Update assignment
export const updateAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title, description, class_id, program_id, type, due_date,
            total_points, status, word_count, duration, submission_format, requirements
        } = req.body;

        const table = tableMapping[type]?.main;
        if (!table) return res.status(400).json({ error: "Invalid assignment type" });

        let updateParts = [
            'title = ?', 'description = ?', 'class_id = ?', 'program_id = ?',
            'due_date = ?', 'total_points = ?', 'status = ?'
        ];
        let values = [title, description, class_id, program_id, due_date, total_points, status];

        if (type === 'writing_task') {
            updateParts.push('word_count = ?', 'requirements = ?');
            values.push(word_count || null, requirements || null);
        } else if (type === 'test' || type === 'oral_assignment') {
            updateParts.push('duration = ?');
            values.push(duration || null);
        } else if (type === 'course_work') {
            updateParts.push('submission_format = ?');
            values.push(submission_format || null);
        }

        values.push(id);

        await dbp.query(
            `UPDATE ${table} SET ${updateParts.join(', ')} WHERE id = ?`,
            values
        );

        res.json({ message: "Assignment updated successfully" });
    } catch (error) {
        console.error("Error updating assignment:", error);
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
        const { assignment_id, content, file_url, type } = req.body;
        const student_id = req.user.userId;

        if (!assignment_id || !type) {
            return res.status(400).json({ error: "Assignment ID and Type are required" });
        }

        const table = tableMapping[type]?.main;
        const subTable = tableMapping[type]?.sub;
        if (!table || !subTable) return res.status(400).json({ error: "Invalid assignment type" });

        // Check if assignment exists and is active
        const [assignments] = await dbp.query(
            `SELECT id, status FROM ${table} WHERE id = ?`,
            [assignment_id]
        );

        if (assignments.length === 0) {
            return res.status(404).json({ error: "Assignment not found" });
        }

        if (assignments[0].status === 'closed') {
            return res.status(400).json({ error: "This assignment is closed for submissions" });
        }

        // UPSERT submission
        await dbp.query(
            `INSERT INTO ${subTable} (assignment_id, student_id, content, file_url, status, submission_date)
             VALUES (?, ?, ?, ?, 'submitted', NOW())
             ON DUPLICATE KEY UPDATE 
                content = VALUES(content), 
                file_url = VALUES(file_url), 
                status = 'submitted', 
                submission_date = NOW()`,
            [assignment_id, student_id, content, file_url]
        );

        res.json({ message: "Assignment submitted successfully" });
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
            JOIN students st ON s.student_id = st.id
            WHERE s.assignment_id = ?
        `;

        const [submissions] = await dbp.query(query, [id]);
        res.json(submissions);
    } catch (error) {
        console.error("Error fetching assignment submissions:", error);
        res.status(500).json({ error: "Failed to fetch submissions" });
    }
};

// Teacher: Grade a student's submission
export const gradeSubmission = async (req, res) => {
    try {
        const { id } = req.params; // submission_id
        const { score, feedback, type } = req.body;

        const subTable = tableMapping[type]?.sub;
        if (!subTable) return res.status(400).json({ error: "Invalid assignment type" });

        await dbp.query(
            `UPDATE ${subTable} SET score = ?, feedback = ?, status = 'graded' WHERE id = ?`,
            [score, feedback, id]
        );

        res.json({ message: "Submission graded successfully" });
    } catch (error) {
        console.error("Error grading submission:", error);
        res.status(500).json({ error: "Failed to grade submission" });
    }
};
