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

// Get all assignments
export const getAssignments = async (req, res) => {
    try {
        const { class_id, program_id } = req.query;

        let query = `
      SELECT a.*, c.class_name, p.title as program_name
      FROM assignments a
      LEFT JOIN classes c ON a.class_id = c.id
      LEFT JOIN programs p ON a.program_id = p.id
      WHERE 1=1
    `;

        const params = [];

        if (class_id) {
            query += ` AND a.class_id = ?`;
            params.push(class_id);
        }

        if (program_id) {
            query += ` AND a.program_id = ?`;
            params.push(program_id);
        }

        query += ` ORDER BY a.due_date DESC`;

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
        const { title, description, class_id, program_id, type, due_date, total_points } = req.body;

        const [result] = await dbp.query(
            `INSERT INTO assignments (title, description, class_id, program_id, type, due_date, total_points)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [title, description, class_id, program_id, type, due_date, total_points]
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
