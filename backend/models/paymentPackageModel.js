import db from "../database/dbconfig.js";
const dbp = db.promise();

// Create a new payment package
export const createPaymentPackage = async ({ package_name, description, amount, currency, duration_months, status }) => {
    const [result] = await dbp.query(
        "INSERT INTO payment_packages (package_name, description, amount, currency, duration_months, status) VALUES (?, ?, ?, ?, ?, ?)",
        [
            package_name,
            description || null,
            amount === "" || amount === undefined ? null : amount,
            currency || 'USD',
            duration_months || null,
            status || 'active'
        ]
    );
    const [newPackage] = await dbp.query("SELECT * FROM payment_packages WHERE id = ?", [result.insertId]);
    return newPackage[0];
};

// Get all payment packages
export const getAllPaymentPackages = async () => {
    const [rows] = await dbp.query("SELECT * FROM payment_packages ORDER BY created_at DESC");
    return rows;
};

// Get payment package by ID
export const getPaymentPackageById = async (id) => {
    const [rows] = await dbp.query("SELECT * FROM payment_packages WHERE id = ?", [id]);
    return rows[0] || null;
};

// Update payment package
export const updatePaymentPackageById = async (id, { package_name, description, amount, currency, duration_months, status }) => {
    const updates = [];
    const values = [];

    if (package_name !== undefined) {
        updates.push("package_name = ?");
        values.push(package_name);
    }
    if (description !== undefined) {
        updates.push("description = ?");
        values.push(description);
    }
    if (amount !== undefined) {
        updates.push("amount = ?");
        values.push(amount === "" ? null : amount);
    }
    if (currency !== undefined) {
        updates.push("currency = ?");
        values.push(currency);
    }
    if (duration_months !== undefined) {
        updates.push("duration_months = ?");
        values.push(duration_months);
    }
    if (status !== undefined) {
        updates.push("status = ?");
        values.push(status);
    }

    if (updates.length === 0) return 0;

    values.push(id);
    const [result] = await dbp.query(
        `UPDATE payment_packages SET ${updates.join(", ")} WHERE id = ?`,
        values
    );
    return result.affectedRows;
};

// Delete payment package
export const deletePaymentPackageById = async (id) => {
    const [result] = await dbp.query("DELETE FROM payment_packages WHERE id = ?", [id]);
    return result.affectedRows;
};

// Assign package to program
export const assignPackageToProgram = async (package_id, program_id) => {
    // Check if already assigned
    const [existing] = await dbp.query(
        "SELECT * FROM program_payment_packages WHERE payment_package_id = ? AND program_id = ?",
        [package_id, program_id]
    );
    if (existing.length > 0) return existing[0];

    const [result] = await dbp.query(
        "INSERT INTO program_payment_packages (payment_package_id, program_id) VALUES (?, ?)",
        [package_id, program_id]
    );
    return result.insertId;
};

// Remove package from program
export const removePackageFromProgram = async (package_id, program_id) => {
    const [result] = await dbp.query(
        "DELETE FROM program_payment_packages WHERE payment_package_id = ? AND program_id = ?",
        [package_id, program_id]
    );
    return result.affectedRows;
};

// Get programs for a specific package
export const getProgramsByPackageId = async (package_id) => {
    const [rows] = await dbp.query(
        `SELECT p.* FROM programs p
     JOIN program_payment_packages ppp ON p.id = ppp.program_id
     WHERE ppp.payment_package_id = ?`,
        [package_id]
    );
    return rows;
};

// Get packages for a specific program
export const getPackagesByProgramId = async (program_id) => {
    const [rows] = await dbp.query(
        `SELECT pp.* FROM payment_packages pp
     JOIN program_payment_packages ppp ON pp.id = ppp.payment_package_id
     WHERE ppp.program_id = ?`,
        [program_id]
    );
    return rows;
};
