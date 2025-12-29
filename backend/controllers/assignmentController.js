import db from "../database/dbconfig.js";

const dbp = db.promise();

// Get assignment statistics
export const getAssignmentStats = async (req, res) => {
    try {
        const { program_id, class_id, timeFrame } = req.query;

        let query = `
      SELECT 
        a.type,
        COUNT(DISTINCT a.id) as total_assignments,
        COUNT(DISTINCT CASE WHEN asub.status IN ('submitted', 'graded') THEN asub.id END) as completed_submissions,
        COUNT(DISTINCT asub.student_id) as total_students,
        ROUND(AVG(CASE WHEN asub.status = 'graded' THEN asub.score END), 2) as avg_score
      FROM assignments a
      LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id
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

        query += ` GROUP BY a.type`;

        const [stats] = await dbp.query(query, params);

        // Calculate completion rates
        const formattedStats = stats.map(stat => ({
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

// Get performance clusters (High, Average, Low)
export const getPerformanceClusters = async (req, res) => {
    try {
        const { program_id, class_id } = req.query;

        let query = `
      SELECT 
        s.id,
        s.full_name,
        ROUND(AVG(asub.score), 2) as avg_score,
        COUNT(CASE WHEN asub.status = 'graded' THEN 1 END) as graded_count,
        CASE 
          WHEN AVG(asub.score) >= 80 THEN 'High'
          WHEN AVG(asub.score) >= 60 THEN 'Average'
          ELSE 'Low'
        END as performance_level
      FROM students s
      LEFT JOIN assignment_submissions asub ON s.id = asub.student_id
      LEFT JOIN assignments a ON asub.assignment_id = a.id
      WHERE asub.status = 'graded'
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

        // Group by performance level
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

// Get all assignments with filtering
export const getAssignments = async (req, res) => {
    try {
        const { class_id, program_id, type, created_by } = req.query;
        const userId = req.user.userId;
        const role = req.user.role;

        let query = `
            SELECT a.*, c.class_name, p.title as program_name, t.full_name as teacher_name
            ${role === 'student' ? ', s.status as submission_status, s.content as student_content, s.score, s.feedback' : ''}
            FROM assignments a
            LEFT JOIN classes c ON a.class_id = c.id
            LEFT JOIN programs p ON a.program_id = p.id
            LEFT JOIN teachers t ON a.created_by = t.id
            ${role === 'student' ? 'LEFT JOIN assignment_submissions s ON a.id = s.assignment_id AND s.student_id = ?' : ''}
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

        if (type) {
            query += ` AND a.type = ?`;
            params.push(type);
        }

        if (created_by) {
            query += ` AND a.created_by = ?`;
            params.push(created_by);
        }

        query += ` ORDER BY a.created_at DESC`;

        const [assignments] = await dbp.query(query, params);
        res.json(assignments);
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

        // Sanitize numeric fields - handle empty strings from frontend
        const sanitizedWordCount = word_count === "" ? null : word_count;
        const sanitizedDuration = duration === "" ? null : duration;

        const [result] = await dbp.query(
            `INSERT INTO assignments (
                title, description, class_id, program_id, type, due_date, 
                total_points, status, created_by, word_count, duration, 
                submission_format, requirements
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title, description, class_id, program_id, type, due_date,
                total_points, status || 'active', userId, sanitizedWordCount, sanitizedDuration,
                submission_format, requirements
            ]
        );

        res.status(201).json({
            message: "Assignment created successfully",
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

        // Sanitize numeric fields - handle empty strings from frontend
        const sanitizedWordCount = word_count === "" ? null : word_count;
        const sanitizedDuration = duration === "" ? null : duration;

        await dbp.query(
            `UPDATE assignments SET 
                title = ?, description = ?, class_id = ?, program_id = ?, type = ?, 
                due_date = ?, total_points = ?, status = ?, word_count = ?, 
                duration = ?, submission_format = ?, requirements = ?
             WHERE id = ?`,
            [
                title, description, class_id, program_id, type, due_date,
                total_points, status, sanitizedWordCount, sanitizedDuration,
                submission_format, requirements, id
            ]
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
        await dbp.query("DELETE FROM assignments WHERE id = ?", [id]);
        res.json({ message: "Assignment deleted successfully" });
    } catch (error) {
        console.error("Error deleting assignment:", error);
        res.status(500).json({ error: "Failed to delete assignment" });
    }
};

// Student: Submit assignment work
export const submitAssignment = async (req, res) => {
    try {
        const { assignment_id, content, file_url } = req.body;
        const student_id = req.user.userId; // user.id from verifyToken

        if (!assignment_id) {
            return res.status(400).json({ error: "Assignment ID is required" });
        }

        // Check if assignment exists and is active
        const [assignments] = await dbp.query(
            "SELECT id, status FROM assignments WHERE id = ?",
            [assignment_id]
        );

        if (assignments.length === 0) {
            return res.status(404).json({ error: "Assignment not found" });
        }

        if (assignments[0].status === 'closed') {
            return res.status(400).json({ error: "This assignment is closed for submissions" });
        }

        // Check current submission status
        const [existing] = await dbp.query(
            "SELECT status FROM assignment_submissions WHERE assignment_id = ? AND student_id = ?",
            [assignment_id, student_id]
        );

        if (existing.length > 0 && existing[0].status === 'graded') {
            return res.status(400).json({ error: "Cannot update a graded assignment" });
        }

        // UPSERT submission
        await dbp.query(
            `INSERT INTO assignment_submissions (assignment_id, student_id, content, file_url, status, submission_date)
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
