"use client";

export type SectionMeta = {
  sectionName: string;
  questions: number;
  format: string;
  marks: number;
  targetScore: string;
  skillsAssessed: string;
  instructions: string;
};

export const defaultSectionMeta = (format = "MCQs"): SectionMeta => ({
  sectionName: "",
  questions: 5,
  format,
  marks: 1,
  targetScore: "",
  skillsAssessed: "",
  instructions: "",
});

export const attachSectionMetadata = (questions: any[], sectionMetadata: Record<number, SectionMeta>) =>
  questions.map((question) => ({
    ...question,
    sectionMeta: sectionMetadata[question.part || 1],
  }));

export default function SectionMetadataFields({
  value,
  onChange,
  currentCount,
  showInstructionsField = false,
}: {
  value?: SectionMeta;
  onChange: (value: SectionMeta) => void;
  currentCount?: number;
  showInstructionsField?: boolean;
}) {
  const meta = value || defaultSectionMeta();
  const set = (key: keyof SectionMeta, nextValue: string | number) =>
    onChange({ ...meta, [key]: nextValue });

  const count = typeof currentCount === "number" ? currentCount : 0;
  const targetQuestions = meta.questions || 1;

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-5 dark:border-gray-700 dark:bg-gray-800/60">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-[#010080] dark:text-blue-400">Section Information & Instructions</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Shown to the student when this section starts.</p>
        </div>
        {typeof currentCount === "number" && (
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${count >= targetQuestions ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" : "bg-white text-[#010080] dark:bg-gray-700 dark:text-blue-300"}`}>
            {count}/{targetQuestions} questions
          </span>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
          Section Name
          <input
            value={meta.sectionName || ""}
            onChange={(e) => set("sectionName", e.target.value)}
            placeholder="e.g. Paper 1: Writing & Grammar"
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#010080] focus:ring-1 focus:ring-[#010080] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </label>
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
          Questions
          <input
            type="number"
            min="1"
            value={meta.questions ?? 1}
            onChange={(e) => set("questions", Math.max(1, Number(e.target.value) || 1))}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#010080] focus:ring-1 focus:ring-[#010080] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </label>
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
          Format
          <input
            value={meta.format || ""}
            onChange={(e) => set("format", e.target.value)}
            placeholder="e.g. MCQs & Essay"
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#010080] focus:ring-1 focus:ring-[#010080] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </label>
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
          Marks / Points
          <input
            type="number"
            min="1"
            value={meta.marks ?? 1}
            onChange={(e) => set("marks", Math.max(1, Number(e.target.value) || 1))}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#010080] focus:ring-1 focus:ring-[#010080] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </label>
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
          Target Score
          <input
            value={meta.targetScore || ""}
            onChange={(e) => set("targetScore", e.target.value)}
            placeholder="e.g. 20/25 or 80%"
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#010080] focus:ring-1 focus:ring-[#010080] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </label>
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
          Skills Assessed
          <input
            value={meta.skillsAssessed || ""}
            onChange={(e) => set("skillsAssessed", e.target.value)}
            placeholder="Grammar, vocabulary, analysis..."
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#010080] focus:ring-1 focus:ring-[#010080] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </label>
        {showInstructionsField && (
          <label className="col-span-full text-xs font-semibold text-gray-700 dark:text-gray-300">
            Section Instructions (Shown to student for this specific section)
            <textarea
              rows={2}
              value={meta.instructions || ""}
              onChange={(e) => set("instructions", e.target.value)}
              placeholder="e.g. Read all questions carefully. Choose the single best answer for each question before proceeding."
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 outline-none focus:border-[#010080] focus:ring-1 focus:ring-[#010080] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </label>
        )}
      </div>
    </div>
  );
}
