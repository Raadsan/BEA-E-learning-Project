import db from "../database/dbconfig.js";

export const getAllCourses = () => {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM courses ORDER BY created_at DESC";
        db.query(query, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

export const getCourseById = (id) => {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM courses WHERE id = ?";
        db.query(query, [id], (err, results) => {
            if (err) return reject(err);
            if (results.length === 0) return resolve(null);
            resolve(results[0]);
        });
    });
};

export const createCourse = (courseData) => {
    return new Promise((resolve, reject) => {
        const { title, description, subprogram_id, duration, price } = courseData;
        const query = "INSERT INTO courses (title, description, subprogram_id, duration, price) VALUES (?, ?, ?, ?, ?)";
        db.query(query, [title, description, subprogram_id, duration, price], (err, result) => {
            if (err) return reject(err);
            resolve({ id: result.insertId, ...courseData });
        });
    });
};

export const updateCourseById = (id, courseData) => {
    return new Promise((resolve, reject) => {
        const { title, description, subprogram_id, duration, price } = courseData;
        const query = "UPDATE courses SET title = ?, description = ?, subprogram_id = ?, duration = ?, price = ? WHERE id = ?";
        db.query(query, [title, description, subprogram_id, duration, price, id], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

export const deleteCourseById = (id) => {
    return new Promise((resolve, reject) => {
        const query = "DELETE FROM courses WHERE id = ?";
        db.query(query, [id], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};
