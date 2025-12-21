import * as ProficiencyTest from "../models/proficiencyTestModel.js";

export const createProficiencyTest = async (req, res) => {
    try {
        const test = await ProficiencyTest.createProficiencyTest(req.body);
        res.status(201).json(test);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllProficiencyTests = async (req, res) => {
    try {
        const tests = await ProficiencyTest.getAllProficiencyTests();
        res.status(200).json(tests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getProficiencyTestById = async (req, res) => {
    try {
        const test = await ProficiencyTest.getProficiencyTestById(req.params.id);
        if (!test) return res.status(404).json({ error: "Test not found" });
        res.status(200).json(test);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateProficiencyTest = async (req, res) => {
    try {
        const test = await ProficiencyTest.updateProficiencyTest(req.params.id, req.body);
        res.status(200).json(test);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteProficiencyTest = async (req, res) => {
    try {
        await ProficiencyTest.deleteProficiencyTest(req.params.id);
        res.status(200).json({ message: "Test deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
