// models/newsletterModel.js
import db from "../database/dbconfig.js";

const dbp = db.promise();

// SUBSCRIBE email
export const subscribeEmail = async (email) => {
    const [result] = await dbp.query(
        "INSERT INTO newsletters (email) VALUES (?)",
        [email]
    );

    return {
        id: result.insertId,
        email
    };
};

// GET all subscribers (for admin use later)
export const getAllSubscribers = async () => {
    const [rows] = await dbp.query(
        "SELECT * FROM newsletters ORDER BY created_at DESC"
    );
    return rows;
};

// CHECK if email exists
export const getSubscriberByEmail = async (email) => {
    const [rows] = await dbp.query("SELECT * FROM newsletters WHERE email = ?", [email]);
    return rows[0];
};

// DELETE subscriber
export const deleteSubscriberById = async (id) => {
    const [result] = await dbp.query("DELETE FROM newsletters WHERE id = ?", [id]);
    return result.affectedRows;
};
