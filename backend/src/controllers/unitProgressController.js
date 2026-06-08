import prisma from "../lib/prisma.js";
import {
    appendCompletedEntry,
    classMatchesUnit,
    detectUnitFromClass,
    hasABSplit,
    hasUnitCompletion,
    isSubprogramFullyCompleted,
    parseCompletedEntries,
} from "../utils/unitProgress.js";

async function getStudentEligibilityDetails(student_id) {
    const review = await prisma.teacher_reviews.findFirst({ where: { student_id } });
    const submissions = await prisma.assignment_submissions.findMany({
        where: { student_id, status: "graded" },
    });

    const totalEarned = submissions.reduce((sum, submission) => sum + (submission.score || 0), 0);
    const totalPossible = submissions.length * 100;
    const avgGrades = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;

    return {
        grades: Number(avgGrades.toFixed(2)),
        teacherReview: !!review,
        isEligible: avgGrades >= 50 && !!review,
    };
}

async function findPartnerClass(subprogramId, currentClassId, targetUnit) {
    const classes = await prisma.classes.findMany({
        where: { subprogram_id: parseInt(subprogramId, 10) },
    });

    return (
        classes.find(
            (cls) => cls.id !== currentClassId && classMatchesUnit(cls.class_name, targetUnit)
        ) || null
    );
}

async function moveStudentToClass(student_id, class_id) {
    await prisma.student_class_history.upsert({
        where: { student_id_class_id: { student_id, class_id } },
        update: { is_active: 1 },
        create: { student_id, class_id, is_active: 1 },
    });

    await prisma.student_class_history.updateMany({
        where: { student_id, class_id: { not: class_id } },
        data: { is_active: 0 },
    });

    return prisma.students.update({
        where: { student_id },
        data: { class_id },
    });
}

export const checkUnitEligibility = async (req, res) => {
    try {
        const student_id = req.user.userId;
        const student = await prisma.students.findUnique({
            where: { student_id },
            include: { classes: { include: { subprograms: true } } },
        });

        if (!student) return res.status(404).json({ error: "Student not found" });
        if (!student.class_id || !student.classes) {
            return res.json({
                canComplete: false,
                reason: "no_class",
                message: "No class assigned yet.",
            });
        }

        const subprogram = student.classes.subprograms;
        const subprogramId = student.classes.subprogram_id;
        const subprogramName = subprogram?.subprogram_name || "";
        const showAB = hasABSplit(subprogramName);
        const currentUnit = detectUnitFromClass(student.classes.class_name);
        const entries = parseCompletedEntries(student.completed_subprograms);
        const eligibility = await getStudentEligibilityDetails(student_id);

        if (!showAB) {
            const alreadyDone = isSubprogramFullyCompleted(entries, subprogramId);
            return res.json({
                canComplete: eligibility.isEligible && !alreadyDone,
                isEligible: eligibility.isEligible,
                showAB: false,
                currentUnit: null,
                subprogramName,
                alreadyCompleted: alreadyDone,
                details: eligibility,
                actionLabel: alreadyDone ? "Level completed" : "Complete this level",
            });
        }

        const unitACompleted = hasUnitCompletion(entries, subprogramId, "A") || currentUnit === "B";
        const unitBCompleted = hasUnitCompletion(entries, subprogramId, "B");
        const fullyCompleted = isSubprogramFullyCompleted(entries, subprogramId);

        let canComplete = false;
        let reason = null;
        let actionLabel = "";

        if (fullyCompleted) {
            reason = "level_complete";
            actionLabel = "Level completed";
        } else if (currentUnit === "A") {
            const aDone = hasUnitCompletion(entries, subprogramId, "A");
            canComplete = eligibility.isEligible && !aDone;
            reason = aDone ? "unit_a_done" : canComplete ? "ready" : "requirements_not_met";
            actionLabel = canComplete ? "Complete Unit A & Move to Unit B" : "Complete Unit A";
        } else {
            canComplete = eligibility.isEligible && unitACompleted && !unitBCompleted;
            reason = unitBCompleted ? "unit_b_done" : !unitACompleted ? "unit_a_required" : canComplete ? "ready" : "requirements_not_met";
            actionLabel = canComplete ? "Complete Unit B" : "Complete Unit B";
        }

        return res.json({
            canComplete,
            isEligible: eligibility.isEligible,
            showAB: true,
            currentUnit,
            subprogramName,
            unitACompleted,
            unitBCompleted,
            fullyCompleted,
            alreadyCompleted: fullyCompleted,
            details: eligibility,
            reason,
            actionLabel,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const completeCurrentUnit = async (req, res) => {
    try {
        const student_id = req.user.userId;
        const student = await prisma.students.findUnique({
            where: { student_id },
            include: { classes: { include: { subprograms: true } } },
        });

        if (!student) return res.status(404).json({ error: "Student not found" });
        if (!student.class_id || !student.classes?.subprogram_id) {
            return res.status(400).json({ error: "Student has no active class/subprogram." });
        }

        const subprogramId = student.classes.subprogram_id;
        const subprogramName = student.classes.subprograms?.subprogram_name || "";
        const showAB = hasABSplit(subprogramName);
        const currentUnit = detectUnitFromClass(student.classes.class_name);
        const entries = parseCompletedEntries(student.completed_subprograms);
        const eligibility = await getStudentEligibilityDetails(student_id);

        if (!eligibility.isEligible) {
            return res.status(400).json({
                error: "Requirements not met. You need at least 50% average grade and a teacher evaluation.",
                details: eligibility,
            });
        }

        let completedSubprograms = student.completed_subprograms || "";
        let movedToClass = null;
        let completedUnit = null;

        if (!showAB) {
            if (isSubprogramFullyCompleted(entries, subprogramId)) {
                return res.status(400).json({ error: "This level is already completed." });
            }
            completedSubprograms = appendCompletedEntry(completedSubprograms, String(subprogramId));
            completedUnit = "full";
        } else if (currentUnit === "A") {
            if (hasUnitCompletion(entries, subprogramId, "A")) {
                return res.status(400).json({ error: "Unit A is already completed." });
            }

            completedSubprograms = appendCompletedEntry(completedSubprograms, `${subprogramId}-a`);
            completedUnit = "A";

            const classB = await findPartnerClass(subprogramId, student.class_id, "B");
            if (classB) {
                await moveStudentToClass(student_id, classB.id);
                movedToClass = {
                    id: classB.id,
                    class_name: classB.class_name,
                };
            }
        } else {
            if (!hasUnitCompletion(entries, subprogramId, "A") && currentUnit !== "B") {
                return res.status(400).json({ error: "Complete Unit A before Unit B." });
            }
            if (hasUnitCompletion(entries, subprogramId, "B") || isSubprogramFullyCompleted(entries, subprogramId)) {
                return res.status(400).json({ error: "Unit B is already completed." });
            }

            completedSubprograms = appendCompletedEntry(completedSubprograms, `${subprogramId}-b`);
            completedSubprograms = appendCompletedEntry(completedSubprograms, String(subprogramId));
            completedUnit = "B";
        }

        const updatedStudent = await prisma.students.update({
            where: { student_id },
            data: { completed_subprograms: completedSubprograms },
            include: { classes: { include: { subprograms: true } } },
        });

        res.json({
            success: true,
            completedUnit,
            completed_subprograms: updatedStudent.completed_subprograms,
            movedToClass,
            class_id: updatedStudent.class_id,
            class_name: updatedStudent.classes?.class_name || null,
            message:
                completedUnit === "A"
                    ? movedToClass
                        ? "Unit A completed. You have been moved to Unit B."
                        : "Unit A completed. Ask admin to assign your Unit B class."
                    : completedUnit === "B"
                      ? "Unit B completed. You can now request a level up."
                      : "Level completed successfully.",
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
