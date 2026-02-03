// models/certificateModel.js
import db from "../database/dbconfig.js";

const dbp = db.promise();

export const getAllCertificates = async () => {
    const query = `
        SELECT c.*, 
        COALESCE(a.full_name, CONCAT(a.first_name, ' ', a.last_name)) as uploaded_by 
        FROM certificates c
        LEFT JOIN admins a ON c.uploader_id = a.id
        ORDER BY c.created_at DESC
    `;
    const [rows] = await dbp.query(query);
    return rows;
};

export const getCertificateByTarget = async (target_type, target_id) => {
    const [rows] = await dbp.query(
        "SELECT * FROM certificates WHERE target_type = ? AND target_id = ?",
        [target_type, target_id]
    );
    return rows[0] || null;
};

export const upsertCertificate = async ({ target_id, target_type, template_url, name_x, name_y, font_size, font_color, uploader_id }) => {
    const query = `
    INSERT INTO certificates (target_id, target_type, template_url, name_x, name_y, font_size, font_color, uploader_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
    template_url = VALUES(template_url),
    name_x = VALUES(name_x),
    name_y = VALUES(name_y),
    font_size = VALUES(font_size),
    font_color = VALUES(font_color),
    uploader_id = VALUES(uploader_id)
  `;
    await dbp.query(query, [target_id, target_type, template_url, name_x, name_y, font_size, font_color, uploader_id]);
    return { success: true };
};

export const deleteCertificateById = async (id) => {
    const [result] = await dbp.query("DELETE FROM certificates WHERE id = ?", [id]);
    return result.affectedRows;
};

// --- Issued Certificates Tracking ---

export const logIssuedCertificate = async ({ student_id, student_name, target_id, target_type, target_name, class_name, certificate_id }) => {
    const query = `
        INSERT INTO issued_certificates (student_id, student_name, target_id, target_type, target_name, class_name, certificate_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await dbp.query(query, [student_id, student_name, target_id, target_type, target_name, class_name, certificate_id]);
};

export const getIssuedCertificates = async () => {
    const query = `
        SELECT ic.*, c.template_url
        FROM issued_certificates ic
        LEFT JOIN certificates c ON ic.certificate_id = c.id
        ORDER BY ic.issued_at DESC
    `;
    const [rows] = await dbp.query(query);
    return rows;
};

export const getMyIssuedCertificates = async (student_id) => {
    const query = `
        SELECT ic.*, c.template_url
        FROM issued_certificates ic
        LEFT JOIN certificates c ON ic.certificate_id = c.id
        WHERE ic.student_id = ?
        ORDER BY ic.issued_at DESC
    `;
    const [rows] = await dbp.query(query, [student_id]);
    return rows;
};

export const hasStudentClaimedCertificate = async (student_id, target_id, target_type) => {
    const [rows] = await dbp.query(
        "SELECT id FROM issued_certificates WHERE student_id = ? AND target_id = ? AND target_type = ?",
        [student_id, target_id, target_type]
    );
    return rows.length > 0;
};
