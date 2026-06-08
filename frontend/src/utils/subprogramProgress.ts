export type UnitKey = "A" | "B";
export type UnitState = "locked" | "active" | "completed";
export type LevelAccess = "locked" | "active" | "completed" | "available";

export interface SubprogramLevelProgress {
    subprogramId: number | string;
    subprogramName: string;
    index: number;
    access: LevelAccess;
    showAB: boolean;
    unitA: UnitState;
    unitB: UnitState;
    stepNumber?: number;
    cefrLabel?: string;
    cefrBand?: string;
    isFullyCompleted: boolean;
    isPlaceholder?: boolean;
}

export interface CurriculumSubprogram {
    id: number | string;
    subprogram_name: string;
    name?: string;
    isPlaceholder?: boolean;
    cefrBand: string;
    stepNumber?: number;
    isIntegrated: boolean;
}

const INTEGRATED_PATTERN = /integrated|ielts|toefl|test prep|academic training/i;

type CurriculumSlot =
    | {
          type: "main";
          match: RegExp;
          exclude?: RegExp;
          band: string;
          step: number;
      }
    | {
          type: "ils";
          ilsNumber: number;
          name: string;
          band: string;
      };

const CURRICULUM_SLOTS: CurriculumSlot[] = [
    { type: "main", match: /beginner/i, band: "A1 - A2", step: 1 },
    { type: "main", match: /elementary/i, band: "A1 - A2", step: 2 },
    { type: "ils", ilsNumber: 1, name: "Integrated Language Skills 1", band: "A1 - A2" },
    {
        type: "main",
        match: /pre[-\s]?intermediate/i,
        band: "A2+ - B1+",
        step: 3,
    },
    {
        type: "main",
        match: /intermediate/i,
        exclude: /plus|upper/i,
        band: "A2+ - B1+",
        step: 4,
    },
    { type: "ils", ilsNumber: 2, name: "Integrated Language Skills 2", band: "A2+ - B1+" },
    { type: "main", match: /intermediate\s*plus/i, band: "B2 - C1", step: 5 },
    { type: "main", match: /upper\s*intermediate/i, band: "B2 - C1", step: 6 },
    { type: "ils", ilsNumber: 3, name: "Integrated Language Skills 3", band: "B2 - C1" },
    {
        type: "main",
        match: /advanced/i,
        exclude: /plus/i,
        band: "B2 - C1",
        step: 7,
    },
    { type: "ils", ilsNumber: 4, name: "Integrated Language Skills 4", band: "B2 - C1" },
    { type: "main", match: /advanced\s*plus/i, band: "C2", step: 8 },
];

function stripCefrPrefix(name: string): string {
    return name.replace(/^(a1|a2|a2\+|b1|b1\+|b2|c1|c2)[\s—\-–]+/i, "").trim();
}

function normalizeSubprogramName(name: string): string {
    return stripCefrPrefix(name).toLowerCase();
}

function matchesMainSlot(name: string, slot: Extract<CurriculumSlot, { type: "main" }>): boolean {
    const normalized = normalizeSubprogramName(name);
    const raw = name.toLowerCase();

    if (!slot.match.test(normalized) && !slot.match.test(raw)) {
        return false;
    }

    if (slot.exclude && (slot.exclude.test(normalized) || slot.exclude.test(raw))) {
        return false;
    }

    return true;
}

function findIntegratedSubprogram(
    subprograms: Array<{ id: number | string; subprogram_name?: string; name?: string }>,
    ilsNumber: number,
    usedIds: Set<string>
) {
    return subprograms.find((subprogram) => {
        const id = String(subprogram.id);
        if (usedIds.has(id)) return false;

        const name = (subprogram.subprogram_name || subprogram.name || "").toLowerCase();
        if (!INTEGRATED_PATTERN.test(name)) return false;

        return new RegExp(`skills\\s*${ilsNumber}\\b|\\b${ilsNumber}\\b`, "i").test(name);
    });
}

function findMainSubprogram(
    subprograms: Array<{ id: number | string; subprogram_name?: string; name?: string }>,
    slot: Extract<CurriculumSlot, { type: "main" }>,
    usedIds: Set<string>
) {
    return subprograms.find((subprogram) => {
        const id = String(subprogram.id);
        if (usedIds.has(id)) return false;

        const name = subprogram.subprogram_name || subprogram.name || "";
        if (INTEGRATED_PATTERN.test(name)) return false;

        return matchesMainSlot(name, slot);
    });
}

function assignStepNumbers(items: CurriculumSubprogram[]): CurriculumSubprogram[] {
    let step = 0;

    return items.map((item) => {
        if (item.isIntegrated) {
            return item;
        }

        step += 1;
        return { ...item, stepNumber: step };
    });
}

export function isTestPrepProgramName(name?: string | null): boolean {
    if (!name) return false;
    const normalized = name.toLowerCase();
    return /ielts/.test(normalized) && /toefl/.test(normalized);
}

export function isTestPrepSubprogramName(name?: string | null): boolean {
    if (!name) return false;
    return /ielts|toefl/i.test(name);
}

export function buildTestPrepSequence(
    subprograms: Array<{ id: number | string; subprogram_name?: string; name?: string }>
): CurriculumSubprogram[] {
    const findByExam = (pattern: RegExp) =>
        subprograms.find((subprogram) =>
            pattern.test(subprogram.subprogram_name || subprogram.name || "")
        );

    const sequence: CurriculumSubprogram[] = [];
    const ielts = findByExam(/ielts/i);
    const toefl = findByExam(/toefl/i);

    if (ielts) {
        sequence.push({
            id: ielts.id,
            subprogram_name: ielts.subprogram_name || ielts.name || "IELTS",
            name: ielts.name,
            cefrBand: "TEST PREP",
            isIntegrated: true,
        });
    }

    if (toefl) {
        sequence.push({
            id: toefl.id,
            subprogram_name: toefl.subprogram_name || toefl.name || "TOEFL",
            name: toefl.name,
            cefrBand: "TEST PREP",
            isIntegrated: true,
        });
    }

    return sequence;
}

export function resolveTestPrepSubprogramId(
    subprograms: Array<{ id: number | string; subprogram_name?: string; name?: string }>,
    examType?: string | null
) {
    if (!examType) return null;
    const normalized = examType.toLowerCase();
    const match = subprograms.find((subprogram) => {
        const name = (subprogram.subprogram_name || subprogram.name || "").toLowerCase();
        return normalized.includes("ielts") ? /ielts/.test(name) : /toefl/.test(name);
    });
    return match?.id ?? null;
}

export function buildLevelMapSubprograms(
    allSubprograms: Array<{ id: number | string; subprogram_name?: string; name?: string; program_id?: number | string }>,
    programs: Array<{ id?: number | string; title?: string; program_name?: string }>
) {
    const gepProgram = programs.find((program) =>
        (program.title || program.program_name || "").toLowerCase().includes("general english")
    );
    const testPrepProgram = programs.find((program) =>
        isTestPrepProgramName(program.title || program.program_name)
    );

    const gepSubs = gepProgram
        ? allSubprograms.filter(
              (subprogram) => Number(subprogram.program_id) === Number(gepProgram.id)
          )
        : [];

    const testPrepSubs = testPrepProgram
        ? allSubprograms.filter((subprogram) =>
              isTestPrepSubprogramName(subprogram.subprogram_name || subprogram.name)
          )
        : [];

    return [...gepSubs, ...testPrepSubs];
}

export function buildCurriculumSequence(
    subprograms: Array<{ id: number | string; subprogram_name?: string; name?: string }>
): CurriculumSubprogram[] {
    const testPrepSubs = subprograms.filter((subprogram) =>
        isTestPrepSubprogramName(subprogram.subprogram_name || subprogram.name)
    );
    const gepSubs = subprograms.filter(
        (subprogram) => !isTestPrepSubprogramName(subprogram.subprogram_name || subprogram.name)
    );

    if (testPrepSubs.length > 0 && gepSubs.length === 0) {
        return buildTestPrepSequence(testPrepSubs);
    }
    if (!gepSubs.length && !testPrepSubs.length) return [];

    const usedIds = new Set<string>();
    const sequence: CurriculumSubprogram[] = [];

    CURRICULUM_SLOTS.forEach((slot) => {
        if (slot.type === "ils") {
            const match = findIntegratedSubprogram(gepSubs, slot.ilsNumber, usedIds);
            if (!match) return;

            usedIds.add(String(match.id));
            sequence.push({
                id: match.id,
                subprogram_name: match.subprogram_name || match.name || slot.name,
                name: match.name,
                cefrBand: slot.band,
                isIntegrated: true,
            });
            return;
        }

        const match = findMainSubprogram(gepSubs, slot, usedIds);
        if (!match) return;

        usedIds.add(String(match.id));
        sequence.push({
            id: match.id,
            subprogram_name: match.subprogram_name || match.name || "",
            name: match.name,
            cefrBand: slot.band,
            isIntegrated: false,
        });
    });

    gepSubs.forEach((subprogram) => {
        const id = String(subprogram.id);
        if (usedIds.has(id)) return;

        const name = subprogram.subprogram_name || subprogram.name || "";
        const isIntegrated =
            INTEGRATED_PATTERN.test(name) && !isTestPrepSubprogramName(name);

        sequence.push({
            id: subprogram.id,
            subprogram_name: name,
            name: subprogram.name,
            cefrBand: getCefrBand(name) || "LEVEL",
            isIntegrated,
        });
        usedIds.add(id);
    });

    if (testPrepSubs.length > 0) {
        buildTestPrepSequence(testPrepSubs).forEach((item) => {
            if (usedIds.has(String(item.id))) return;
            sequence.push(item);
            usedIds.add(String(item.id));
        });
    }

    if (!sequence.length) {
        return assignStepNumbers(
            subprograms.map((subprogram) => {
                const name = subprogram.subprogram_name || subprogram.name || "";
                return {
                    id: subprogram.id,
                    subprogram_name: name,
                    name: subprogram.name,
                    cefrBand: getCefrBand(name) || "LEVEL",
                    isIntegrated:
                        INTEGRATED_PATTERN.test(name) && !isTestPrepSubprogramName(name),
                };
            })
        );
    }

    return assignStepNumbers(sequence);
}

export function parseCompletedEntries(value: unknown): string[] {
    if (!value) return [];
    if (typeof value === "string") {
        return value.split(",").map((part) => part.trim().toLowerCase()).filter(Boolean);
    }
    if (Array.isArray(value)) {
        return value.map((part) => String(part).trim().toLowerCase()).filter(Boolean);
    }
    return [];
}

export function hasABSplit(subprogramName: string): boolean {
    return !INTEGRATED_PATTERN.test(subprogramName || "");
}

export function detectUnitFromClass(className?: string | null): UnitKey | null {
    if (!className) return null;
    const upper = className.toUpperCase();
    if (/\bB\b|[-_\s]B$|CLASS\s*B|UNIT\s*B|PART\s*B/.test(upper)) return "B";
    if (/\bA\b|[-_\s]A$|CLASS\s*A|UNIT\s*A|PART\s*A/.test(upper)) return "A";
    return null;
}

function entryMatchesSubprogram(entry: string, subprogram: { id: number | string; subprogram_name?: string }) {
    const id = String(subprogram.id).toLowerCase();
    const name = String(subprogram.subprogram_name || "").toLowerCase().trim();
    const base = entry.replace(/-a$|-b$/, "");
    return base === id || (name && (base === name || entry === name));
}

function hasUnitCompletion(entries: string[], subprogram: { id: number | string; subprogram_name?: string }, unit: UnitKey) {
    const id = String(subprogram.id).toLowerCase();
    const name = String(subprogram.subprogram_name || "").toLowerCase().trim();
    const suffix = unit.toLowerCase();

    return entries.some((entry) => {
        if (entry === `${id}-${suffix}` || entry === `${name}-${suffix}`) return true;
        if (entry.endsWith(`-${suffix}`) && entryMatchesSubprogram(entry, subprogram)) return true;
        return false;
    });
}

function isFullyCompletedEntry(entries: string[], subprogram: { id: number | string; subprogram_name?: string }) {
    const id = String(subprogram.id).toLowerCase();
    const name = String(subprogram.subprogram_name || "").toLowerCase().trim();

    return entries.some((entry) => {
        if (entry === id || entry === name) return true;
        if (entryMatchesSubprogram(entry, subprogram) && !entry.endsWith("-a") && !entry.endsWith("-b")) {
            return true;
        }
        return false;
    });
}

export function getCefrLabel(subprogramName: string): string | undefined {
    const name = subprogramName.toLowerCase();
    if (/ielts|toefl/.test(name)) return "TEST";
    if (name.includes("integrated")) return undefined;
    if (name.includes("beginner")) return "A1";
    if (name.includes("elementary")) return "A2";
    if (name.includes("pre-intermediate") || name.includes("pre intermediate")) return "A2+";
    if (name.includes("intermediate plus")) return "B1+";
    if (name.includes("upper intermediate")) return "B2";
    if (name.includes("intermediate")) return "B1";
    if (name.includes("advanced plus")) return "C2";
    if (name.includes("advanced")) return "C1";
    return undefined;
}

export function getCefrBand(subprogramName: string): string | undefined {
    const name = subprogramName.toLowerCase();
    if (/ielts|toefl/.test(name)) return "TEST PREP";
    if (name.includes("integrated")) return undefined;
    if (name.includes("beginner") || name.includes("elementary")) return "A1 - A2";
    if (
        name.includes("pre-intermediate") ||
        name.includes("pre intermediate") ||
        name.includes("intermediate plus") ||
        (name.includes("intermediate") && !name.includes("upper"))
    ) {
        return "A2+ - B1+";
    }
    if (name.includes("upper intermediate") || (name.includes("advanced") && !name.includes("advanced plus"))) {
        return "B2 - C1";
    }
    if (name.includes("advanced plus")) return "C2";
    return undefined;
}

function toTitleWords(value: string): string {
    return value
        .split(/\s+/)
        .map((word) =>
            word
                .split("-")
                .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : part))
                .join("-")
        )
        .join(" ");
}

export function formatPillarLabel(subprogramName: string): string {
    const name = stripCefrPrefix(subprogramName);
    const lower = name.toLowerCase();

    if (/ielts/.test(lower)) return "IELTS Academic Training";
    if (/toefl/.test(lower)) return "TOEFL iBT Test";

    const ilsMatch = lower.match(/integrated language skills\s*(\d)/i);
    if (ilsMatch) return `Integrated Language Skills ${ilsMatch[1]}`;

    return toTitleWords(name);
}

export function isIntegratedLanguageSkillsName(name?: string | null): boolean {
    if (!name) return false;
    return /integrated language skills/i.test(name);
}

export function buildSubprogramProgress({
    subprograms,
    user,
    studentClass,
    curriculumSequence,
}: {
    subprograms: Array<{ id: number | string; subprogram_name?: string; name?: string }>;
    user?: {
        chosen_subprogram?: string | number | null;
        completed_subprograms?: unknown;
        exam_type?: string | null;
        is_ielts?: boolean;
    } | null;
    studentClass?: { subprogram_id?: number | string | null; class_name?: string | null } | null;
    curriculumSequence?: CurriculumSubprogram[];
}): SubprogramLevelProgress[] {
    const orderedSubprograms = curriculumSequence?.length
        ? curriculumSequence
        : buildCurriculumSequence(subprograms);

    if (!orderedSubprograms.length) return [];

    const completedEntries = parseCompletedEntries(user?.completed_subprograms);
    const isTestPrepSequence =
        orderedSubprograms.length > 0 &&
        orderedSubprograms.every((subprogram) => subprogram.isIntegrated && isTestPrepSubprogramName(subprogram.subprogram_name));

    let currentSubprogramId = studentClass?.subprogram_id ?? user?.chosen_subprogram ?? null;

    if (!currentSubprogramId && user?.exam_type) {
        currentSubprogramId = resolveTestPrepSubprogramId(orderedSubprograms, user.exam_type);
    }
    const currentIndex = orderedSubprograms.findIndex(
        (sub) =>
            !sub.isPlaceholder &&
            (String(sub.id) === String(currentSubprogramId) ||
                String(sub.subprogram_name || sub.name || "").toLowerCase() ===
                    String(currentSubprogramId || "").toLowerCase())
    );

    const activeUnit =
        currentIndex !== -1 && studentClass?.class_name
            ? detectUnitFromClass(studentClass.class_name) || "A"
            : currentIndex !== -1
              ? "A"
              : null;

    const levelCompletion = orderedSubprograms.map((subprogram, index) => {
        if (subprogram.isPlaceholder) {
            return { aCompleted: false, bCompleted: false, isFullyCompleted: false };
        }

        const fullyCompletedByRecord = isFullyCompletedEntry(completedEntries, subprogram);
        const fullyCompletedByProgress = currentIndex !== -1 && index < currentIndex;

        const aCompleted =
            fullyCompletedByRecord ||
            fullyCompletedByProgress ||
            hasUnitCompletion(completedEntries, subprogram, "A") ||
            (index === currentIndex && activeUnit === "B");

        const bCompleted =
            fullyCompletedByRecord ||
            fullyCompletedByProgress ||
            hasUnitCompletion(completedEntries, subprogram, "B");

        const isFullyCompleted =
            fullyCompletedByRecord ||
            fullyCompletedByProgress ||
            (aCompleted && bCompleted);

        return { aCompleted, bCompleted, isFullyCompleted };
    });

    const isPreviousFullyComplete = (index: number) => {
        if (index === 0) return true;

        for (let i = index - 1; i >= 0; i -= 1) {
            const item = orderedSubprograms[i];
            if (item?.isPlaceholder) continue;
            return levelCompletion[i]?.isFullyCompleted;
        }

        return true;
    };

    return orderedSubprograms.map((subprogram, index) => {
        const subprogramName = subprogram.subprogram_name || subprogram.name || `Level ${index + 1}`;
        const showAB =
            hasABSplit(subprogramName) &&
            (!subprogram.isIntegrated || isTestPrepSubprogramName(subprogramName));
        const { aCompleted, bCompleted, isFullyCompleted } = levelCompletion[index];

        if (subprogram.isPlaceholder) {
            return {
                subprogramId: subprogram.id,
                subprogramName,
                index,
                access: "locked" as LevelAccess,
                showAB: false,
                unitA: "locked" as UnitState,
                unitB: "locked" as UnitState,
                stepNumber: undefined,
                cefrLabel: undefined,
                cefrBand: subprogram.cefrBand,
                isFullyCompleted: false,
                isPlaceholder: true,
            };
        }

        let access: LevelAccess = "locked";

        if (isFullyCompleted && currentIndex !== -1 && index < currentIndex) {
            access = "completed";
        } else if (isFullyCompleted && index !== currentIndex) {
            access = "completed";
        } else if (index === currentIndex) {
            access = "active";
        } else if (isPreviousFullyComplete(index)) {
            access = index === currentIndex + 1 && !isFullyCompleted ? "available" : "available";
        }

        if (isTestPrepSequence) {
            access = index === currentIndex ? "active" : "locked";
        } else if (isTestPrepSubprogramName(subprogramName)) {
            const enrolledTrackId = resolveTestPrepSubprogramId(orderedSubprograms, user?.exam_type);
            access =
                enrolledTrackId && String(subprogram.id) === String(enrolledTrackId)
                    ? "active"
                    : "locked";
        } else {
            if (index === 0 && currentIndex === -1) {
                access = "active";
            }

            if (!isPreviousFullyComplete(index) && index !== 0) {
                access = "locked";
            }
        }

        if (isFullyCompleted) {
            access = index === currentIndex ? "active" : "completed";
        }

        let unitA: UnitState = "locked";
        let unitB: UnitState = "locked";

        if (!showAB) {
            if (access === "completed" || isFullyCompleted) {
                unitA = "completed";
            } else if (access === "active" || access === "available") {
                unitA = "active";
            }
        } else if (isFullyCompleted || access === "completed") {
            unitA = "completed";
            unitB = "completed";
        } else if (access === "active") {
            if (aCompleted && !bCompleted) {
                unitA = "completed";
                unitB = "active";
            } else if (!aCompleted) {
                unitA = "active";
                unitB = "locked";
            } else {
                unitA = "completed";
                unitB = "active";
            }
        } else if (access === "available") {
            unitA = "active";
            unitB = "locked";
        }

        return {
            subprogramId: subprogram.id,
            subprogramName,
            index,
            access: isFullyCompleted && index !== currentIndex ? "completed" : access,
            showAB,
            unitA,
            unitB,
            stepNumber: subprogram.stepNumber,
            cefrLabel: getCefrLabel(subprogramName),
            cefrBand: subprogram.cefrBand,
            isFullyCompleted,
            isPlaceholder: false,
        };
    });
}

export function isLevelClickable(progress: SubprogramLevelProgress): boolean {
    if (progress.isPlaceholder) return false;
    return progress.access === "active" || progress.access === "completed" || progress.access === "available";
}
