export type ExamEditingItem = {
    id?: string | number;
    text?: string;
    options?: string[];
    correctOption?: number;
    correction?: string;
    points?: number;
};

export type ExamQuestionItem = {
    id?: string | number;
    type?: string;
    questionText?: string;
    question?: string;
    options?: string[];
    correctOption?: number;
    correctAnswer?: string;
    points?: number;
};

export type ExamPaper = {
    title?: string;
    passage?: string;
    instructions?: string;
    audioUrl?: string;
    editing?: ExamEditingItem[];
    questions?: ExamQuestionItem[];
    essay?: { prompt?: string; title?: string; wordCount?: number; points?: number };
    points?: number;
    timeLimit?: number;
};

const PAPER_ORDER = ["paper1", "paper2", "paper3", "paper4"] as const;

/** Normalize stored exam JSON into ordered paper array. */
export function normalizeExamPapers(raw: unknown): ExamPaper[] {
    let parsed = raw;
    if (typeof parsed === "string") {
        try {
            parsed = JSON.parse(parsed);
        } catch {
            return [];
        }
    }
    if (!parsed || typeof parsed !== "object") return [];
    if (Array.isArray(parsed)) return parsed as ExamPaper[];

    const record = parsed as Record<string, ExamPaper>;
    return PAPER_ORDER.map((key) => record[key]).filter(Boolean);
}

export function getExamPaperPrefix(index: number): string {
    if (index === 0) return "p1";
    if (index === 1) return "p2";
    if (index === 2) return "p3";
    if (index === 3) return "p4";
    return `paper${index + 1}`;
}

export function isOralPaper(paper: ExamPaper, index: number): boolean {
    if (index === 3) return !!(paper.passage || paper.instructions);
    const title = String(paper.title || "").toLowerCase();
    return title.includes("oral") || title.includes("speaking");
}
