export type TestQuestion = {
  id?: string;
  type?: string;
  part?: number;
  questionNumber?: number;
  questionText?: string;
  passageText?: string;
  title?: string;
  description?: string;
  points?: number | string;
  options?: string[];
  correctOption?: number;
  maxWords?: number;
  audioUrl?: string;
  subQuestions?: Array<{
    id?: string;
    questionNumber?: number;
    questionText?: string;
    points?: number | string;
    options?: string[];
    correctOption?: number;
  }>;
  [key: string]: unknown;
};

/** Assign 1, 2, 3… within each part (and sub-questions inside passages). */
export function renumberQuestionsByPart<T extends TestQuestion>(
  questions: T[],
  maxPart = 5
): T[] {
  if (!Array.isArray(questions)) return [];

  const result = questions.map((q) => ({ ...q }));

  for (let part = 1; part <= maxPart; part++) {
    const partQuestions = result.filter((q) => (q.part || 1) === part);
    partQuestions.forEach((q, idx) => {
      const index = result.findIndex((item) => item.id === q.id);
      if (index < 0) return;

      const updated: T = {
        ...result[index],
        questionNumber: idx + 1,
      };

      if (updated.type === "passage" && Array.isArray(updated.subQuestions)) {
        updated.subQuestions = updated.subQuestions.map((sq, sqIdx) => ({
          ...sq,
          questionNumber: sqIdx + 1,
        }));
      }

      result[index] = updated;
    });
  }

  return result;
}

export function ensureQuestionNumbers<T extends TestQuestion>(
  questions: T[],
  maxPart = 5
): T[] {
  return renumberQuestionsByPart(questions, maxPart);
}

export function getQuestionPreviewText(q: TestQuestion): string {
  if (!q) return "Question";
  if (q.type === "passage") {
    return String(q.passageText || "Passage Content").slice(0, 80);
  }
  if (q.type === "essay") {
    return String(q.title || q.description || "Essay Prompt");
  }
  if (q.type === "audio") {
    return String(q.title || q.description || "Audio Task");
  }
  return String(q.questionText || q.question || "MCQ Question");
}

export function formatQuestionLabel(
  q: TestQuestion,
  fallback = 1
): string {
  const num = q?.questionNumber ?? fallback;
  return `${num}: ${getQuestionPreviewText(q)}`;
}

export function sortByQuestionNumber<T extends { questionNumber?: number }>(
  items: T[]
): T[] {
  return [...items].sort(
    (a, b) => (a.questionNumber ?? 0) - (b.questionNumber ?? 0)
  );
}

/** Admin preview: keep stored numbers, show 1→2→3 order (never shuffle). */
export function groupQuestionsByPartForAdminPreview<T extends TestQuestion>(
  questions: T[],
  maxPart = 5
): Record<number, T[]> {
  if (!Array.isArray(questions)) {
    const empty: Record<number, T[]> = {};
    for (let part = 1; part <= maxPart; part++) empty[part] = [];
    return empty;
  }

  const withNumbers = questions.map((q) => {
    const copy = { ...q };
    if (copy.type === "passage" && Array.isArray(copy.subQuestions)) {
      copy.subQuestions = copy.subQuestions.map((sq) => ({ ...sq }));
    }
    return copy;
  });

  for (let part = 1; part <= maxPart; part++) {
    const partQuestions = withNumbers.filter((q) => (q.part || 1) === part);
    partQuestions.forEach((q, idx) => {
      const index = withNumbers.findIndex((item) => item.id === q.id);
      if (index < 0) return;

      if (withNumbers[index].questionNumber == null) {
        withNumbers[index] = { ...withNumbers[index], questionNumber: idx + 1 };
      }

      if (
        withNumbers[index].type === "passage" &&
        Array.isArray(withNumbers[index].subQuestions)
      ) {
        withNumbers[index].subQuestions = withNumbers[index].subQuestions!.map(
          (sq, sqIdx) => ({
            ...sq,
            questionNumber: sq.questionNumber ?? sqIdx + 1,
          })
        );
      }
    });
  }

  const grouped: Record<number, T[]> = {};
  for (let part = 1; part <= maxPart; part++) {
    grouped[part] = sortByQuestionNumber(
      withNumbers.filter((q) => (q.part || 1) === part)
    ).map((q) => {
      if (q.type === "passage" && Array.isArray(q.subQuestions)) {
        return {
          ...q,
          subQuestions: sortByQuestionNumber(q.subQuestions),
        };
      }
      return q;
    });
  }

  return grouped;
}
