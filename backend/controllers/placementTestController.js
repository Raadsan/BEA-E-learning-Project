import * as PlacementTest from "../models/placementTestModel.js";

export const createPlacementTest = async (req, res) => {
    try {
        const test = await PlacementTest.createPlacementTest(req.body);
        res.status(201).json(test);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllPlacementTests = async (req, res) => {
    try {
        const tests = await PlacementTest.getAllPlacementTests();
        res.status(200).json(tests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getPlacementTestById = async (req, res) => {
    try {
        const test = await PlacementTest.getPlacementTestById(req.params.id);
        if (!test) return res.status(404).json({ error: "Test not found" });
        res.status(200).json(test);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updatePlacementTest = async (req, res) => {
    try {
        const test = await PlacementTest.updatePlacementTest(req.params.id, req.body);
        res.status(200).json(test);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deletePlacementTest = async (req, res) => {
    try {
        await PlacementTest.deletePlacementTest(req.params.id);
        res.status(200).json({ message: "Test deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
