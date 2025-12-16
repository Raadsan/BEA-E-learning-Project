import * as ieltsToeflModel from "../models/ieltsToeflModel.js";

export const getAllIeltsStudents = async (req, res) => {
    try {
        const students = await ieltsToeflModel.getAllStudents();
        res.status(200).json({ success: true, students });
    } catch (error) {
        console.error("Error fetching IELTS/TOEFL students:", error);
        res.status(500).json({ success: false, error: "Failed to fetch students" });
    }
};

export const createIeltsStudent = async (req, res) => {
    try {
        const student = await ieltsToeflModel.createStudent(req.body);
        res.status(201).json({ success: true, student });
    } catch (error) {
        console.error("Error creating IELTS/TOEFL student:", error);
        res.status(500).json({ success: false, error: "Failed to create student" });
    }
};

export const getIeltsStudent = async (req, res) => {
    try {
        const student = await ieltsToeflModel.getStudentById(req.params.id);
        if (!student) {
            return res.status(404).json({ success: false, error: "Student not found" });
        }
        res.status(200).json({ success: true, student });
    } catch (error) {
        console.error("Error fetching IELTS/TOEFL student:", error);
        res.status(500).json({ success: false, error: "Failed to fetch student" });
    }
};

export const updateIeltsStudent = async (req, res) => {
    try {
        const affectedRows = await ieltsToeflModel.updateStudent(req.params.id, req.body);
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, error: "Student not found or no changes made" });
        }
        const updatedStudent = await ieltsToeflModel.getStudentById(req.params.id);
        res.status(200).json({ success: true, student: updatedStudent });
    } catch (error) {
        console.error("Error updating IELTS/TOEFL student:", error);
        res.status(500).json({ success: false, error: "Failed to update student" });
    }
};

export const rejectIeltsStudent = async (req, res) => {
    try {
        const affectedRows = await ieltsToeflModel.rejectStudent(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, error: "Student not found" });
        }
        res.status(200).json({ success: true, message: "Student rejected and class unassigned successfully" });
    } catch (error) {
        console.error("Error rejecting IELTS/TOEFL student:", error);
        res.status(500).json({ success: false, error: "Failed to reject student" });
    }
};

export const deleteIeltsStudent = async (req, res) => {
    try {
        const affectedRows = await ieltsToeflModel.deleteStudent(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, error: "Student not found" });
        }
        res.status(200).json({ success: true, message: "Student deleted successfully" });
    } catch (error) {
        console.error("Error deleting IELTS/TOEFL student:", error);
        res.status(500).json({ success: false, error: "Failed to delete student" });
    }
};
