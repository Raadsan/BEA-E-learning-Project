import db from "../database/dbconfig.js";

const dbp = db.promise();

// Get learning hours based on attendance
export const getLearningHours = async (req, res) => {
    try {
        const { program_id, class_id, timeFrame = 'Weekly' } = req.query;

        // Assume each class session is 2 hours (configurable)
        const hoursPerSession = 2;

        let dateFilter = '';
        let groupBy = '';
        let selectDate = '';

        switch (timeFrame) {
            case 'Daily':
                dateFilter = 'AND DATE(att.date) = CURDATE()';
                groupBy = 'DATE(att.date)';
                selectDate = 'DATE(att.date) as date';
                break;
            case 'Weekly':
                dateFilter = 'AND YEARWEEK(att.date, 1) = YEARWEEK(CURDATE(), 1)';
                groupBy = 'DAYOFWEEK(att.date)';
                selectDate = 'DAYNAME(att.date) as date';
                break;
            case 'Monthly':
                dateFilter = 'AND YEAR(att.date) = YEAR(CURDATE()) AND MONTH(att.date) = MONTH(CURDATE())';
                groupBy = 'DAY(att.date)';
                selectDate = 'DAY(att.date) as date';
                break;
            case 'Yearly':
                dateFilter = 'AND YEAR(att.date) = YEAR(CURDATE())';
                groupBy = 'MONTH(att.date)';
                selectDate = 'MONTHNAME(att.date) as date';
                break;
            default:
                dateFilter = 'AND YEARWEEK(att.date, 1) = YEARWEEK(CURDATE(), 1)';
                groupBy = 'DAYOFWEEK(att.date)';
                selectDate = 'DAYNAME(att.date) as date';
        }

        let query = `
      SELECT 
        ${selectDate},
        COUNT(DISTINCT CASE WHEN att.status = 'present' THEN att.student_id END) as students_present,
        COUNT(DISTINCT att.student_id) as total_students,
        SUM(CASE WHEN att.status = 'present' THEN ${hoursPerSession} ELSE 0 END) as total_hours
      FROM attendance att
      LEFT JOIN classes c ON att.class_id = c.id
      WHERE 1=1 ${dateFilter}
    `;

        const params = [];

        if (program_id) {
            query += ` AND c.program_id = ?`;
            params.push(program_id);
        }

        if (class_id) {
            query += ` AND att.class_id = ?`;
            params.push(class_id);
        }

        query += ` GROUP BY ${groupBy} ORDER BY att.date`;

        const [hours] = await dbp.query(query, params);

        // Format data for area chart
        const formattedData = hours.map(row => ({
            name: row.date,
            hours: row.total_hours || 0,
            students: row.students_present || 0
        }));

        res.json(formattedData);
    } catch (error) {
        console.error("Error fetching learning hours:", error);
        res.status(500).json({ error: "Failed to fetch learning hours" });
    }
};

// Get total learning hours summary
export const getLearningHoursSummary = async (req, res) => {
    try {
        const { program_id, class_id, student_id, subprogram_name, subprogram_id } = req.query;
        const hoursPerSession = 2;

        let query = `
      SELECT 
        COUNT(DISTINCT CASE WHEN att.status = 'present' THEN att.id END) as total_sessions,
        SUM(CASE WHEN att.status = 'present' THEN ${hoursPerSession} ELSE 0 END) as total_hours,
        COUNT(DISTINCT att.student_id) as unique_students
      FROM attendance att
      LEFT JOIN classes c ON att.class_id = c.id
      LEFT JOIN subprograms s ON c.subprogram_id = s.id
      WHERE 1=1
    `;

        const params = [];

        if (program_id) {
            query += ` AND c.program_id = ?`;
            params.push(program_id);
        }

        if (class_id) {
            query += ` AND att.class_id = ?`;
            params.push(class_id);
        }

        // Add filter by Student ID
        if (student_id) {
            query += ` AND att.student_id = ?`;
            params.push(student_id);
        }

        // Add filter by Subprogram
        if (subprogram_id) {
            query += ` AND c.subprogram_id = ?`;
            params.push(subprogram_id);
        } else if (subprogram_name) {
            query += ` AND s.subprogram_name = ?`;
            params.push(subprogram_name);
        }

        const [summary] = await dbp.query(query, params);
        res.json(summary[0] || { total_sessions: 0, total_hours: 0, unique_students: 0 });
    } catch (error) {
        console.error("Error fetching learning hours summary:", error);
        res.status(500).json({ error: "Failed to fetch learning hours summary" });
    }
};
