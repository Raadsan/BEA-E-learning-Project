export const buildSectionInformation = (
  questions: any[] = [],
  fallbackName = "Assessment Section",
) => {
  const saved = questions.find((question) => question?.sectionMeta)?.sectionMeta;
  if (saved) return saved;
  const firstType = questions[0]?.type;
  const format = firstType === "mcq" || firstType === "multiple_choice"
    ? "MCQs"
    : firstType === "passage" ? "Reading passage"
      : firstType === "essay" ? "Essay"
        : firstType === "audio" ? "Audio" : "Questions";
  return {
    sectionName: fallbackName,
    questions: questions.length,
    format,
    marks: questions.reduce((sum, question) => sum + (Number(question?.points) || 0), 0),
    targetScore: "—",
    skillsAssessed: "—",
  };
};

export default function SectionInformation({ meta }: { meta?: any }) {
  if (!meta) return null;
  return (
    <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-sm text-gray-700">
      <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        <p><span className="font-bold text-[#010080]">Section Name:</span> {meta.sectionName || "—"}</p>
        <p><span className="font-bold text-[#010080]">Questions:</span> {meta.questions}</p>
        <p><span className="font-bold text-[#010080]">Format:</span> {meta.format}</p>
        <p><span className="font-bold text-[#010080]">Marks:</span> {meta.marks}</p>
        <p><span className="font-bold text-[#010080]">Target Score:</span> {meta.targetScore || "—"}</p>
        <p><span className="font-bold text-[#010080]">Skills Assessed:</span> {meta.skillsAssessed || "—"}</p>
      </div>
    </div>
  );
}
