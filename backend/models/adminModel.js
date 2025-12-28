import db from "../database/dbconfig.js";

// Get admin by email
export const getAdminByEmail = (email) => {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM admins WHERE email = ?";
        db.query(query, [email], (err, results) => {
            if (err) return reject(err);
            if (results.length === 0) return resolve(null);
            resolve(results[0]);
        });
    });
};

// Get admin by ID
export const getAdminById = (id) => {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM admins WHERE id = ?";
        db.query(query, [id], (err, results) => {
            if (err) return reject(err);
            if (results.length === 0) return resolve(null);
            resolve(results[0]);
        });
    });
};

// Get all admins
export const getAllAdmins = () => {
    return new Promise((resolve, reject) => {
        const query = "SELECT id, first_name, last_name, username, email, phone, role, status, created_at FROM admins";
        db.query(query, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

// Create new admin
export const createAdmin = (adminData) => {
    return new Promise((resolve, reject) => {
        const { first_name, last_name, username, email, password, phone, role } = adminData;
        const query = "INSERT INTO admins (first_name, last_name, username, email, password, phone, role) VALUES (?, ?, ?, ?, ?, ?, ?)";
        db.query(query, [first_name, last_name, username, email, password, phone, role || 'admin'], (err, result) => {
            if (err) return reject(err);
            resolve({ id: result.insertId, ...adminData });
        });
    });
};

// Update admin
export const updateAdminById = (id, adminData) => {
    return new Promise((resolve, reject) => {
        const allowedFields = [
            'first_name', 'last_name', 'username', 'email', 'phone',
            'bio', 'status', 'role', 'password', 'profile_image'
        ];

        const updates = [];
        const params = [];

        allowedFields.forEach(field => {
            if (adminData[field] !== undefined) {
                updates.push(`${field} = ?`);
                params.push(adminData[field]);
            }
        });

        if (updates.length === 0) {
            return resolve({ affectedRows: 0 });
        }

        const query = `UPDATE admins SET ${updates.join(', ')} WHERE id = ?`;
        params.push(id);

        console.log("[Admin Debug] Executing Update Query:", query);
        console.log("[Admin Debug] Query Params:", params);

        db.query(query, params, (err, result) => {
            if (err) {
                console.error("[Admin Debug] Update Error:", err);
                return reject(err);
            }
            console.log("[Admin Debug] Update Result:", result);
            resolve(result);
        });
    });
};

// Delete admin
export const deleteAdminById = (id) => {
    return new Promise((resolve, reject) => {
        const query = "DELETE FROM admins WHERE id = ?";
        db.query(query, [id], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};
